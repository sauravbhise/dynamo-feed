import { BookOpen } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { contentUsable } from "../../content";
import type { Reading } from "../../content/types";

export function NowReadingCard({ reading }: { reading: Reading }) {
  // Draft/placeholder fields never render; no book info → no card.
  if (!contentUsable(reading.title) || !contentUsable(reading.author)) return null;
  const showTake = contentUsable(reading.take);
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-reading">
      <CardTitle icon={BookOpen}>Now reading</CardTitle>
      <div className="mt-4 flex gap-4">
        {reading.cover ? (
          <img src={reading.cover} alt="" className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-soft" />
        ) : (
          <div className="grid h-28 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sage/35 to-cast-saurav/25 shadow-soft">
            <BookOpen className="size-6 text-cream/60" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm leading-snug text-cream">{reading.title}</p>
          <p className="mt-0.5 text-xs text-muted">{reading.author}</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-sage" style={{ width: `${reading.progress}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-muted">{reading.progress}% through</p>
          {showTake && (
            <p className="mt-1.5 text-xs italic leading-relaxed text-muted">“{reading.take}”</p>
          )}
        </div>
      </div>
    </section>
  );
}
