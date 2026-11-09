import { useEffect, useState } from "react";
import { StreakCard } from "./StreakCard";
import { wholeDaysSince } from "../../content";
import type { SpanishProgress } from "../../content/types";

// One request per page load: the column mounts again each time the phone
// sheet opens.
let liveStreakRequest: Promise<number | null> | undefined;

function fetchLiveStreak(): Promise<number | null> {
  liveStreakRequest ??= fetch("/api/duolingo")
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => (Number.isInteger(body?.streak) && body.streak >= 0 ? (body.streak as number) : null))
    .catch(() => null);
  return liveStreakRequest;
}

export function SpanishCard({ spanish }: { spanish: SpanishProgress }) {
  const [liveStreak, setLiveStreak] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveStreak().then((value) => {
      if (!cancelled) setLiveStreak(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The estimate shows straight away, and stays if the live value never comes.
  const streak = liveStreak ?? spanish.streak + wholeDaysSince(spanish.streakAsOf);
  return (
    <StreakCard
      title="Learning Spanish"
      detail={`Duolingo score ${spanish.score} · around ${spanish.level}`}
      streak={streak}
      testId="now-spanish"
    />
  );
}
