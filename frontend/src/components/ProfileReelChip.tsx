import { useMemo } from "react";
import { Clapperboard } from "lucide-react";
import { profileItemBySlug } from "../content";

/** Shows on a reel whose slug matches a portfolio item; opens that item in the left column. */
export function ProfileReelChip({ slug }: { slug: string }) {
  const item = useMemo(() => profileItemBySlug(slug), [slug]);
  if (!item) return null;
  return (
    <button
      type="button"
      data-testid="reel-profile-chip"
      onClick={(event) => {
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent("dynamo:focus-profile-item", { detail: item }));
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-cream shadow-soft backdrop-blur transition hover:bg-surface hover:text-sage active:scale-95"
    >
      <Clapperboard className="size-3.5 text-sage" />
      {item.title}
    </button>
  );
}
