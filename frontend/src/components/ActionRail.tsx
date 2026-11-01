import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";

function RailButton({
  label,
  testId,
  onClick,
  active = false,
  count,
  children,
}: {
  label: string;
  testId: string;
  onClick?: () => void;
  active?: boolean;
  count?: string | number;
  children: ReactNode;
}) {
  return (
    <button data-testid={testId} onClick={onClick} aria-label={label} title={label} className="flex flex-col items-center gap-1.5">
      <span
        className={`grid size-12 place-items-center rounded-full backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 ${
          active ? "bg-sage text-sage-deep" : "bg-white/10 text-cream"
        }`}
      >
        {children}
      </span>
      {count !== undefined && <span className="text-xs font-semibold text-cream/80">{count}</span>}
    </button>
  );
}

interface ActionRailProps {
  likes: number;
  comments: number;
  liked: boolean;
  onLike: () => void;
  onComments: () => void;
  slug: string;
  className?: string;
}

export function ActionRail({ likes, comments, liked, onLike, onComments, slug, className = "" }: ActionRailProps) {
  const share = async () => {
    const url = `${window.location.origin}/r/${slug}`;
    // Phones that support it get the native share sheet.
    if (window.matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        /* share sheet dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`} data-testid="action-rail">
      <RailButton label="Like" testId="action-like" onClick={onLike} active={liked} count={(likes + (liked ? 1 : 0)).toLocaleString()}>
        <Heart className="size-5" fill={liked ? "currentColor" : "none"} />
      </RailButton>
      <RailButton label="Comments" testId="action-comment" onClick={onComments} count={comments}>
        <MessageCircle className="size-5" />
      </RailButton>
      <RailButton label="Share" testId="action-share" onClick={share}>
        <Share2 className="size-5" />
      </RailButton>
    </div>
  );
}
