import { reels } from "../content";
import { autoReels, hashString } from "./autoReels";
import type { Reel } from "../content/types";

// Group reels into units: a series stays together, ordered by part.
function buildUnits(): Reel[][] {
  const seen = new Set<string>();
  const units: Reel[][] = [];
  for (const reel of reels) {
    if (seen.has(reel.id)) continue;
    if (reel.seriesId) {
      const parts = reels
        .filter((r) => r.seriesId === reel.seriesId)
        .sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
      parts.forEach((part) => seen.add(part.id));
      units.push(parts);
    } else {
      seen.add(reel.id);
      units.push([reel]);
    }
  }
  return units;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The same reel must never reappear within five positions across the seam:
// prevTail[k] sits 5-k positions before the boundary, flat[i] is i+1 after it,
// so their gap is 5 + i - k — reject when that is five or fewer.
function respectsGap(prevTail: string[], flat: Reel[]): boolean {
  for (let i = 0; i < Math.min(flat.length, 5); i++) {
    for (let k = 0; k < prevTail.length; k++) {
      if (flat[i].id === prevTail[k] && i <= k) return false;
    }
  }
  return true;
}

// Auto reels are sprinkled through the generation with the same rules as the
// rest of the feed: never two in a row, never a repeat within five positions
// across the seam — plus a deterministic mix, so the same seam always gets the
// same sprinkle.
function mixAutoReels(base: Reel[], prevTail: string[]): Reel[] {
  if (autoReels.length === 0) return base;
  const result = [...base];
  const seed = hashString(`${prevTail.join("|")}#${base.length}`);
  const pool = [...autoReels].sort(
    (a, b) => hashString(`${a.id}+${seed}`) - hashString(`${b.id}+${seed}`)
  );
  const perGeneration = 2 + (seed % 2); // 2–3 auto reels per generation
  let minPos = 2; // spread: at least one reel between two auto reels
  let placed = 0;
  for (const auto of pool) {
    if (placed >= perGeneration) break;
    for (let p = minPos; p <= result.length; p++) {
      if (result[p - 1]?.auto || result[p]?.auto) continue; // never two in a row
      const recent = [
        ...prevTail.slice(-4),
        ...result.slice(Math.max(0, p - 4), p).map((r) => r.id),
      ];
      if (recent.includes(auto.id)) continue; // no repeat within five positions
      result.splice(p, 0, auto);
      minPos = p + 2;
      placed += 1;
      break;
    }
  }
  return result;
}

export function nextGeneration(prevTail: string[]): Reel[] {
  const units = buildUnits();
  let flat: Reel[] = [];
  for (let attempt = 0; attempt < 30; attempt++) {
    flat = shuffle(units).flat();
    if (respectsGap(prevTail, flat)) return mixAutoReels(flat, prevTail);
  }
  // With few base reels most shuffles break the seam rule, so the last resort
  // repairs the first five positions in place: each early position may not
  // repeat a tail entry at gap distance five or less (tail[k], k >= i).
  const result = [...flat];
  for (let i = 0; i < Math.min(result.length, 5); i++) {
    const banned = new Set<string>();
    for (let k = i; k < prevTail.length; k++) banned.add(prevTail[k]);
    if (!banned.has(result[i].id)) continue;
    for (let j = i + 1; j < result.length; j++) {
      if (!banned.has(result[j].id)) {
        [result[i], result[j]] = [result[j], result[i]];
        break;
      }
    }
  }
  return mixAutoReels(result, prevTail);
}
