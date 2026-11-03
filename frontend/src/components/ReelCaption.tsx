import type { ReactNode } from "react";

/**
 * The caption zone block: speaker name (Reels-username style) + the beat's line.
 * Storytime passes no children — its chat bubbles ARE the caption.
 */
export function ReelCaption({ name, chip, children }: { name: string; chip?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1" data-testid="reel-caption" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold text-cream/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
          data-testid="speaker-name"
        >
          {name}
        </span>
        {chip}
      </div>
      {children != null && (
        <p className="text-sm font-semibold leading-snug text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
          {children}
        </p>
      )}
    </div>
  );
}
