#!/usr/bin/env node
/**
 * Generates one voice file per reel beat with a text-to-speech provider and
 * writes them to public/audio/, updating public/audio/manifest.json.
 *
 * Usage:
 *   node scripts/generate-voices.mjs             generate everything missing
 *   node scripts/generate-voices.mjs --dry-run   list what would be generated
 *   node scripts/generate-voices.mjs --force     regenerate even if cached
 *
 * Env:
 *   ELEVENLABS_API_KEY        API key for the default provider (never commit it)
 *   VOICE_PROVIDER            provider adapter, default "elevenlabs"
 *   ELEVENLABS_MODEL_ID       optional model override
 *
 * Files are cached by a hash of the character and the caption text:
 * unchanged lines are never regenerated, so re-running is cheap.
 */
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

// ---- Reel sources (the exact same code path as the app) -----------------
async function loadReels() {
  const bundled = await esbuild.build({
    entryPoints: [path.join(rootDir, "scripts/reel-sources.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const dir = await mkdtemp(path.join(os.tmpdir(), "dynamo-voices-"));
  const file = path.join(dir, "reel-sources.mjs");
  await writeFile(file, bundled.outputFiles[0].text);
  const { allReels } = await import(pathToFileURL(file).href);
  return allReels;
}

// ---- Provider adapters ---------------------------------------------------
const adapters = {
  elevenlabs: {
    id: "elevenlabs",
    envKey: "ELEVENLABS_API_KEY",
    async synthesize({ apiKey, voiceId, text }) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) {
        throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      return Buffer.from(await res.arrayBuffer());
    },
  },
};

const adapter = adapters[process.env.VOICE_PROVIDER ?? "elevenlabs"];
if (!adapter) {
  console.error(
    `Unknown VOICE_PROVIDER "${process.env.VOICE_PROVIDER}". Known: ${Object.keys(adapters).join(", ")}`
  );
  process.exit(1);
}

const reels = await loadReels();
const cast = JSON.parse(await readFile(path.join(rootDir, "src/content/cast.json"), "utf8"));
const voiceById = Object.fromEntries(cast.map((c) => [c.id, c.voiceId ?? ""]));

// ---- Build the job list --------------------------------------------------
const manifestPath = path.join(rootDir, "public/audio/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));

const jobs = [];
for (const reel of reels) {
  reel.beats.forEach((beat, beatIndex) => {
    const text = (beat.caption ?? "").trim();
    if (!text) return;
    jobs.push({
      key: `${reel.slug}:${beatIndex}`,
      characterId: beat.characterId,
      voiceId: voiceById[beat.characterId] ?? "",
      text,
    });
  });
}

const plan = [];
for (const job of jobs) {
  const hash = createHash("sha1")
    .update(`${job.characterId}:${job.text}`)
    .digest("hex")
    .slice(0, 16);
  const relPath = `audio/${hash}.mp3`;
  const exists =
    !force &&
    (manifest[job.key] === relPath ||
      (await readFile(path.join(rootDir, "public", relPath))
        .then(() => true)
        .catch(() => false)));
  plan.push({ ...job, relPath, exists });
}

const noVoice = [...new Set(plan.filter((p) => !p.voiceId).map((p) => p.characterId))];
const totalChars = plan.reduce((n, p) => n + p.text.length, 0);

if (dryRun) {
  console.log(`Dry run — ${plan.length} spoken beats, ${totalChars} characters of text:\n`);
  for (const p of plan) {
    console.log(
      `${p.exists ? "cached " : "MISSING"}  ${p.key}  ${p.characterId} (${p.text.length} chars)  "${p.text.slice(0, 60)}${p.text.length > 60 ? "…" : ""}"`
    );
  }
  const missing = plan.filter((p) => !p.exists);
  console.log(
    `\n${missing.length} file(s) would be generated (${missing.reduce((n, p) => n + p.text.length, 0)} characters).`
  );
  if (noVoice.length) {
    console.log(`\nCharacters without a voiceId in cast.json (skipped): ${noVoice.join(", ")}`);
  }
  process.exit(0);
}

const apiKey = process.env[adapter.envKey];
if (!apiKey) {
  console.error(`Set ${adapter.envKey} in the environment — never commit the key.`);
  process.exit(1);
}

// ---- Generate ------------------------------------------------------------
let generated = 0;
let cached = 0;
const updatedManifest = { ...manifest };

for (const p of plan) {
  if (p.exists) {
    updatedManifest[p.key] = p.relPath;
    cached++;
    continue;
  }
  if (!p.voiceId) {
    console.warn(`Skip ${p.key}: no voiceId for "${p.characterId}" in cast.json`);
    continue;
  }
  process.stdout.write(`Generating ${p.key} (${p.characterId})… `);
  try {
    const buffer = await adapter.synthesize({ apiKey, voiceId: p.voiceId, text: p.text });
    const absPath = path.join(rootDir, "public", p.relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, buffer);
    updatedManifest[p.key] = p.relPath;
    generated++;
    console.log(`${(buffer.length / 1024).toFixed(0)} KB`);
  } catch (error) {
    console.error(`failed: ${error.message}`);
    process.exitCode = 1;
  }
}

await writeFile(manifestPath, `${JSON.stringify(updatedManifest, null, 2)}\n`);
console.log(`\nDone: ${generated} generated, ${cached} cached. Manifest updated (${plan.length} beats).`);
if (noVoice.length) {
  console.log(`Characters without a voiceId (skipped): ${noVoice.join(", ")}`);
}
