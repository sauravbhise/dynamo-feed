import { reels } from "../content";
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

export function nextGeneration(prevTail: string[]): Reel[] {
  const units = buildUnits();
  for (let attempt = 0; attempt < 30; attempt++) {
    const flat = shuffle(units).flat();
    if (respectsGap(prevTail, flat)) return flat;
  }
  return shuffle(units).flat();
}
