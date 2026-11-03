import { ArrowUpRight, BookOpen, Clapperboard } from "lucide-react";
import { pageBySlug, warnUnknownPageSlug } from "../../content";

/** One short row inside a collapsible section — title, subtitle, dates, one line. */
export interface ProfileItemDisplay {
  id: string;
  title: string;
  subtitle: string;
  dates?: string;
  text?: string;
  reelSlug?: string;
  pageSlug?: string;
  links?: { label: string; url: string }[];
}

export function ItemCard({
  item,
  highlighted,
  onWatchReel,
}: {
  item: ProfileItemDisplay;
  highlighted: boolean;
  onWatchReel: (slug: string) => void;
}) {
  // "Read more" only when the pageSlug matches a loaded page.
  const page = item.pageSlug ? pageBySlug(item.pageSlug) : undefined;
  if (item.pageSlug && !page) warnUnknownPageSlug(item.pageSlug);
  return (
    <div
      id={`profile-item-${item.id}`}
      data-item-id={item.id}
      data-testid={`profile-item-${item.id}`}
      className={`rounded-2xl bg-raised p-4 transition-shadow duration-500 ${
        highlighted ? "ring-2 ring-sage" : "ring-0 ring-transparent"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm leading-snug text-cream">{item.title}</p>
        {item.dates && (
          <span className="shrink-0 text-[11px] font-semibold text-muted">{item.dates}</span>
        )}
      </div>
      {item.subtitle && <p className="mt-0.5 text-xs font-semibold text-sage">{item.subtitle}</p>}
      {item.text && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.text}</p>}
      {item.links && item.links.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0.5 text-xs font-bold text-sage underline-offset-2 hover:underline"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" />
            </a>
          ))}
        </div>
      )}
      {(item.reelSlug || page) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {item.reelSlug && (
            <button
              type="button"
              data-testid={`watch-reel-${item.reelSlug}`}
              onClick={() => onWatchReel(item.reelSlug!)}
              className="flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-bold text-cream transition hover:bg-ink hover:text-sage active:scale-95"
            >
              <Clapperboard className="size-3.5" />
              Watch the reel
            </button>
          )}
          {page && item.pageSlug && (
            <button
              type="button"
              data-testid={`read-more-${item.pageSlug}`}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent<string>("dynamo:open-page", { detail: item.pageSlug })
                )
              }
              className="flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-bold text-cream transition hover:bg-ink hover:text-sage active:scale-95"
            >
              <BookOpen className="size-3.5" />
              Read more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
