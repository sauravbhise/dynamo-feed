import { useState } from "react";
import { Heart, MessageCircle, MessageSquareQuote, Share2 } from "lucide-react";
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
    <button
      data-testid={testId}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex flex-col items-center gap-1 rounded-2xl border-[3px] px-1.5 py-2 backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-line bg-ink/80 text-line hover:text-accent"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="text-[10px] font-extrabold leading-none">{count}</span>
      )}
    </button>
  );
}

interface ActionRailProps {
  likes: number;
  comments: number;
  onComments: () => void;
  onAsk: () => void;
}

export function ActionRail({ likes, comments, onComments, onAsk }: ActionRailProps) {
  const [liked, setLiked] = useState(false);
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
    <div data-testid="action-rail" className="absolute bottom-24 right-2.5 z-10 flex flex-col gap-2">
      <RailButton
        label="Like"
        testId="action-like"
        onClick={() => setLiked((value) => !value)}
        active={liked}
        count={(likes + (liked ? 1 : 0)).toLocaleString()}
      >
        <Heart className="size-5" fill={liked ? "currentColor" : "none"} />
      </RailButton>
      <RailButton label="Comments" testId="action-comment" onClick={onComments} count={comments}>
        <MessageCircle className="size-5" />
      </RailButton>
      <RailButton label="Share" testId="action-share" onClick={share} count={copied ? "Copied" : undefined}>
        <Share2 className="size-5" />
      </RailButton>
      <RailButton label="Ask me" testId="action-ask" onClick={onAsk}>
        <MessageSquareQuote className="size-5" />
      </RailButton>
    </div>
  );
}
