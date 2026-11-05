// Audio plumbing for reel voices: manifest loading, the sound preference,
// a lazily created AudioContext with a loudness analyser, and preloading.

export type AudioManifest = Record<string, string>;

let manifestCache: AudioManifest | null = null;

// Read once per load. A beat has audio only if its key ({slug}:{beatIndex}) is
// in the manifest — missing files are never probed.
export async function loadManifest(): Promise<AudioManifest> {
  if (manifestCache) return manifestCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}audio/manifest.json`);
    manifestCache = res.ok ? ((await res.json()) as AudioManifest) : {};
  } catch {
    manifestCache = {};
  }
  return manifestCache;
}

// Manifest paths are relative to the site root (e.g. "audio/abc.mp3").
export function audioUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function audioSrcFor(
  manifest: AudioManifest,
  slug: string,
  beatIndex: number
): string | undefined {
  const path = manifest[`${slug}:${beatIndex}`];
  return path ? audioUrl(path) : undefined;
}

const SOUND_KEY = "dynamo:sound";

export function readSoundPref(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

export function writeSoundPref(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable — the choice just isn't remembered */
  }
}

let audioContext: AudioContext | null = null;

// Created lazily on the first user-gesture-driven play (the sound toggle).
export function getAudioContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

// Route an element through an analyser so mouths can follow the voice.
// Returns null when the Web Audio graph can't be built — playback still works.
export function connectAnalyser(element: HTMLAudioElement): AnalyserNode | null {
  try {
    const context = getAudioContext();
    const source = context.createMediaElementSource(element);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(context.destination);
    return analyser;
  } catch {
    return null;
  }
}

const analysisBuffer = new Uint8Array(256);

// RMS 0..1 from the analyser's time domain, with gain so speech peaks read
// near 1 and silence near 0.
export function readLoudness(analyser: AnalyserNode): number {
  analyser.getByteTimeDomainData(analysisBuffer);
  let sum = 0;
  for (let i = 0; i < analysisBuffer.length; i++) {
    const v = (analysisBuffer[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / analysisBuffer.length);
  return Math.min(1, rms * 6);
}

const preloaded = new Set<string>();

export function preloadAudio(url: string): void {
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const element = new Audio();
  element.preload = "auto";
  element.src = url;
  element.load();
}
