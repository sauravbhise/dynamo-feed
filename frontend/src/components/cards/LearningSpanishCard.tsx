import { Flame } from "lucide-react";

export function LearningSpanishCard({ streak }: { streak: number }) {
  return (
    <section className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-spanish">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cast-blaze/15 text-cast-blaze">
        <Flame className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm text-cream">Learning Spanish</p>
        <p className="text-xs text-muted">
          Duolingo · <span className="font-bold text-cream">{streak} day streak</span>
        </p>
      </div>
    </section>
  );
}
