import { useState } from "react";
import { Heart, MessageCircle, Share2, ThumbsDown } from "lucide-react";
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
  disliked: boolean;
  onDislike: () => void;
  onComments: () => void;
  className?: string;
}

export function ActionRail({
  likes,
  comments,
  liked,
  onLike,
  disliked,
  onDislike,
  onComments,
  className = "",
}: ActionRailProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — layout-only build */
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`} data-testid="action-rail">
      <RailButton label="Like" testId="action-like" onClick={onLike} active={liked} count={(likes + (liked ? 1 : 0)).toLocaleString()}>
        <Heart className="size-5" fill={liked ? "currentColor" : "none"} />
      </RailButton>
      <RailButton label="Dislike" testId="action-dislike" onClick={onDislike} active={disliked}>
        <ThumbsDown className="size-5" />
      </RailButton>
      <RailButton label="Comments" testId="action-comment" onClick={onComments} count={comments}>
        <MessageCircle className="size-5" />
      </RailButton>
      <RailButton label="Share" testId="action-share" onClick={share} count={copied ? "Copied" : undefined}>
        <Share2 className="size-5" />
      </RailButton>
    </div>
  );
}
