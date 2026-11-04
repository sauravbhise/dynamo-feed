import { useEffect, useState } from "react";
import { AnimatePresence, motion, motionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { CastAvatar, commentAuthorName } from "./CastAvatar";
import { useLiveComments } from "./LiveCommentsContext";
import { usePaused } from "./PausedContext";

// Floating comment templates — breaking news puts its comments in the ticker
// instead, storytime already has chat bubbles, the nudge stays clean.
const FLOATING = new Set(["review", "documentary", "myth_vs_fact", "stat_reveal", "interview", "tier_list"]);

// A comment is visible for 0.15 of the reel (~3s), then the lane empties.
const WINDOW = 0.15;

// Stable fallback for the progress subscription (real lanes never see it).
const detached = motionValue(0);

/**
 * Live-stream style cast comments: ONE comment at a time, derived directly
 * from the reel's progress motion value — no timers, so pause freezes it,
 * the loop wrap clears it and the comments replay, and a reel leaving view
 * resets. Renders nothing whenever no comment is showing.
 */
export function LiveComments() {
  const live = useLiveComments();
  const paused = usePaused();
  const reduceMotion = useReducedMotion();
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  const enabled =
    !!live &&
    live.active &&
    !live.suppressed &&
    FLOATING.has(live.template) &&
    live.comments.length > 0;

  useMotionValueEvent(live?.progress ?? detached, "change", (p) => {
    if (!live || !enabled) {
      setVisibleIndex((prev) => (prev === null ? prev : null));
      return;
    }
    const n = live.comments.length;
    const s = Math.min(Math.max(0.15, live.beat1End), 0.83);
    let current: number | null = null;
    for (let i = 0; i < n; i++) {
      if (p >= s + ((0.83 - s) * i) / Math.max(n - 1, 1)) current = i;
      else break;
    }
    let next: number | null = null;
    if (current !== null) {
      const start = s + ((0.83 - s) * current) / Math.max(n - 1, 1);
      // Window: 15% of the reel, but never shorter than ~3.2 s of on-screen time.
      const windowFraction = Math.max(WINDOW, 3200 / Math.max(live.reelTotalMs, 1));
      if (p < start + windowFraction) next = current;
    }
    setVisibleIndex((prev) => (prev === next ? prev : next));
  });

  // Suppression (sheet open, hint showing, reel inactive) must hide the lane
  // immediately — not on the next progress change.
  useEffect(() => {
    if (!enabled) setVisibleIndex((prev) => (prev === null ? prev : null));
  }, [enabled]);

  if (!live || !enabled || visibleIndex === null) return null;
  const comment = live.comments[visibleIndex];
  if (!comment) return null;
  const name = commentAuthorName(comment.authorId);
  const frozen = paused || reduceMotion;

  return (
    <div className="pointer-events-none mb-2.5" data-testid="live-comments">
      <AnimatePresence initial={false}>
        <motion.button
          key={comment.authorId + visibleIndex}
          type="button"
          onClick={(event) => {
            // Open the sheet — never pause the reel, never count as a double-tap like.
            event.stopPropagation();
            live.onOpenComments();
          }}
          initial={frozen ? { opacity: 1 } : reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={frozen || reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pointer-events-auto flex max-w-[65%] cursor-pointer items-start gap-2 rounded-2xl bg-ink/45 p-2 pr-3 text-left shadow-soft backdrop-blur"
          data-testid="live-comment"
        >
          <CastAvatar authorId={comment.authorId} name={name} className="size-5 text-[10px]" />
          <span className="min-w-0">
            <span className="block text-xs font-bold text-cream/90">{name}</span>
            <span className="mt-0.5 line-clamp-3 text-xs leading-snug text-cream/80">
              {comment.text}
            </span>
          </span>
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
