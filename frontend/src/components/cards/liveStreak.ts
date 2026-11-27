import { useEffect, useState } from "react";

export type LiveStreak = { streak: number; fetchedAt: number };

// One request per page load: the column mounts again each time the phone
// sheet opens.
let liveStreakRequest: Promise<LiveStreak | null> | undefined;

function fetchLiveStreak(): Promise<LiveStreak | null> {
  liveStreakRequest ??= fetch("/api/duolingo")
    .then((res) => (res.ok ? res.json() : null))
    .then((body) =>
      Number.isInteger(body?.streak) && body.streak >= 0
        ? { streak: body.streak as number, fetchedAt: Date.now() }
        : null,
    )
    .catch(() => null);
  return liveStreakRequest;
}

/** The live Duolingo streak and when it was fetched; null until (or unless) the fetch succeeds. */
export function useLiveStreak(): LiveStreak | null {
  const [live, setLive] = useState<LiveStreak | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveStreak().then((value) => {
      if (!cancelled) setLive(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return live;
}
