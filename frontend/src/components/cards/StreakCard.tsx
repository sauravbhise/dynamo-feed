import { Flame } from "lucide-react";

/** Shared layout for the streak cards. A streak of 0 is never shown. */
export function StreakCard({
  title,
  detail,
  streak,
  testId,
}: {
  title: string;
  detail?: string;
  streak: number;
  testId: string;
}) {
  return (
    <section className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-soft" data-testid={testId}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cast-blaze/15 text-cast-blaze">
        <Flame className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm text-cream">{title}</p>
        {detail && <p className="text-xs text-muted">{detail}</p>}
        {streak > 0 && <p className="text-xs font-bold text-cream">{streak} day streak</p>}
      </div>
    </section>
  );
}
