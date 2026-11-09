import { contentUsable, now } from "../content";
import { reelSchema } from "../content/schemas";
import autoScriptsJson from "../content/autoScripts.json";
import type { Beat, Pose, Reel, ReelTemplate } from "../content/types";

// Deterministic string hash (djb2) — the same item always gets the same
// script, like count and comments.
export function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Fill {title}-style placeholders from the source item.
function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

function fillData(data: Record<string, string>, values: Record<string, string | number>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(data)) {
    const filled = fill(raw, values);
    // Stat reveal counts numerically — the value must arrive as a number.
    out[key] =
      key === "value" && filled.trim() !== "" && !Number.isNaN(Number(filled))
        ? Number(filled)
        : filled;
  }
  return out;
}

// Joke like counts, stable per slug.
const JOKE_LIKES = [
  3, 42, 111, 256, 404, 555, 600, 777, 900, 1024, 1111, 1234, 1337, 1729, 2048,
  2500, 3000, 4040, 5000, 5555, 6006, 6543, 7000, 7777, 8000, 8501, 9001, 9500,
  9999, 10000,
];

interface ScriptBeat {
  characterId: string;
  pose: Pose;
  caption: string;
}

interface ScriptVariant {
  template: ReelTemplate;
  hostId: string;
  beats: ScriptBeat[];
  data?: Record<string, string>;
}

interface KindScripts {
  scripts: ScriptVariant[];
  milestoneScript?: ScriptVariant;
  comments: { authorId: string; text: string }[];
}

interface AutoScripts {
  reading: KindScripts;
  spanish: KindScripts;
  volunteering: KindScripts;
  writing: KindScripts;
}

const autoScripts = autoScriptsJson as unknown as AutoScripts;

type KindKey = keyof AutoScripts;

// Generated reels carry a small "New" chip while now.json was updated this week.
export const autoReelsFresh: boolean =
  !!now && Date.now() - new Date(now.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

function pickComments(
  pool: { authorId: string; text: string }[],
  hash: number
): { authorId: string; text: string }[] {
  const total = 2 + (hash % 2); // two or three comments
  const used = new Set<number>();
  const comments: { authorId: string; text: string }[] = [];
  for (let k = 0; k < total && comments.length < pool.length; k++) {
    let idx = (hash >> (k * 5)) % pool.length;
    while (used.has(idx)) idx = (idx + 1) % pool.length;
    used.add(idx);
    comments.push(pool[idx]);
  }
  return comments;
}

// Returns null (with a console warning) instead of throwing — one bad script
// or one invalid generated reel never takes down the feed.
function makeReel(kind: KindKey, slug: string, values: Record<string, string | number>): Reel | null {
  const kindScripts: KindScripts = autoScripts[kind];
  if (!kindScripts?.scripts?.length) {
    console.warn(`[content] autoScripts.json: no scripts for "${kind}" — skipping ${slug}.`);
    return null;
  }
  const hash = hashString(slug);

  // The Spanish streak gets extra hype when it is a multiple of 100.
  const milestone =
    kind === "spanish" &&
    now !== null &&
    now.spanish.streak % 100 === 0 &&
    autoScripts.spanish.milestoneScript;
  const pool = milestone ? [autoScripts.spanish.milestoneScript as ScriptVariant] : kindScripts.scripts;
  const variant = pool[hash % pool.length];

  const beats: Beat[] = variant.beats.map((beat, i) => ({
    characterId: beat.characterId,
    pose: beat.pose,
    caption: fill(beat.caption, values),
    // The reading-time engine computes the real length from the caption.
    durationMs: 1000,
    ...(i === 0 && variant.data ? { data: fillData(variant.data, values) } : {}),
  }));

  const generated: Reel = {
    id: slug,
    slug,
    template: variant.template,
    hostId: variant.hostId,
    likes: JOKE_LIKES[hash % JOKE_LIKES.length],
    beats,
    comments: pickComments(kindScripts.comments, hash),
    auto: true,
  };

  // Generated reels pass the exact same validation as reels.json.
  const result = reelSchema.safeParse(generated);
  if (!result.success) {
    console.warn(
      `[content] autoScripts.json: generated reel ${slug} failed validation — skipping it. Fields:`,
      result.error.flatten().fieldErrors
    );
    return null;
  }
  return result.data as Reel;
}

function buildAutoReels(): Reel[] {
  // now.json is invalid (or missing) — no auto reels at all.
  if (!now) return [];

  const generated: Reel[] = [];
  const push = (reel: Reel | null) => {
    if (reel) generated.push(reel);
  };

  const reading = now.reading.current;
  if (contentUsable(reading.title) && contentUsable(reading.author) && contentUsable(reading.take)) {
    push(
      makeReel("reading", `auto-reading-${slugify(reading.title)}`, {
        title: reading.title,
        author: reading.author,
        take: reading.take,
      })
    );
  }

  if (now.spanish.streak > 0) {
    push(
      makeReel("spanish", `auto-spanish-${now.spanish.streak}`, {
        streak: now.spanish.streak,
      })
    );
  }

  const volunteering = now.volunteering;
  if (volunteering && contentUsable(volunteering.status) && contentUsable(volunteering.text)) {
    push(
      makeReel("volunteering", "auto-volunteering", {
        status: volunteering.status,
        text: volunteering.text,
      })
    );
  }

  now.writing.forEach((post) => {
    if (contentUsable(post.title) && contentUsable(post.url)) {
      push(
        makeReel("writing", `auto-writing-${slugify(post.title)}`, {
          title: post.title,
          platform: post.platform,
        })
      );
    }
  });

  return generated;
}

// Built once per load from now.json — the same content always produces the
// same reels.
export const autoReels: Reel[] = buildAutoReels();
