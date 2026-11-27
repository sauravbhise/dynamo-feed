import { useEffect, useState } from "react";
import { Calculator, Flame, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { contentUsable, wholeDaysSince } from "../../content";
import type { Now } from "../../content/types";

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

function StreakRow({
  icon: Icon,
  tint,
  name,
  detail,
  streak,
  testId,
}: {
  icon: LucideIcon;
  /** Tailwind background + text classes for the icon's accent. */
  tint: string;
  name: string;
  detail?: string;
  streak: number;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-3" data-testid={testId}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tint}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm text-cream">{name}</p>
        {detail && <p className="text-xs text-muted">{detail}</p>}
      </div>
      {/* A streak of 0 is never shown. */}
      {streak > 0 && (
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 font-display text-sm text-cream">
            <Flame className="size-3.5 text-sage" />
            {streak}
          </p>
          <p className="text-[11px] text-muted">{streak === 1 ? "day" : "days"}</p>
        </div>
      )}
    </div>
  );
}

export function DailyStreaksCard({ spanish, matiks }: Pick<Now, "spanish" | "matiks">) {
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
  const spanishStreak = liveStreak ?? spanish.streak + wholeDaysSince(spanish.streakAsOf);
  // A draft date would make up a streak; no streak → no row.
  const matiksStreak = contentUsable(matiks.streakAsOf) ? matiks.streak + wholeDaysSince(matiks.streakAsOf) : 0;

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-streaks">
      <CardTitle icon={Flame}>Daily streaks</CardTitle>
      <div className="mt-4 flex flex-col gap-3">
        <StreakRow
          icon={Languages}
          tint="bg-cast-tia/15 text-cast-tia"
          name="Spanish · Duolingo"
          detail={`Score ${spanish.score} · around ${spanish.level}`}
          streak={spanishStreak}
          testId="streak-spanish"
        />
        {matiksStreak > 0 && (
          <>
            <div className="border-t border-white/10" aria-hidden="true" />
            <StreakRow
              icon={Calculator}
              tint="bg-cast-marge/15 text-cast-marge"
              name="Mental maths · Matiks"
              streak={matiksStreak}
              testId="streak-matiks"
            />
          </>
        )}
      </div>
    </section>
  );
}
