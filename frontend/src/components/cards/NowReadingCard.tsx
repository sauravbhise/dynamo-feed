import { BookOpen } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { contentUsable } from "../../content";
import type { Reading } from "../../content/types";

export function NowReadingCard({ reading: { current, previous } }: { reading: Reading }) {
  // Draft/placeholder fields never render; no book info → no card.
  if (!contentUsable(current.title) || !contentUsable(current.author)) return null;
  const showTake = contentUsable(current.take);
  const earlier = previous.filter((book) => contentUsable(book.title) && contentUsable(book.author));
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-reading">
      <CardTitle icon={BookOpen}>Now reading</CardTitle>
      <div className="mt-4 flex gap-4">
        {current.cover ? (
          <img src={current.cover} alt="" className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-soft" />
        ) : (
          <div className="grid h-28 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sage/35 to-cast-saurav/25 shadow-soft">
            <BookOpen className="size-6 text-cream/60" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm leading-snug text-cream">{current.title}</p>
          <p className="mt-0.5 text-xs text-muted">{current.author}</p>
          {showTake && (
            <p className="mt-3 text-xs italic leading-relaxed text-muted">“{current.take}”</p>
          )}
        </div>
      </div>
      {earlier.length > 0 && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted" data-testid="reading-previous">
          <span className="font-semibold">Before this:</span>{" "}
          {earlier.map((book) => `${book.title} by ${book.author}`).join(" · ")}
        </p>
      )}
    </section>
  );
}
