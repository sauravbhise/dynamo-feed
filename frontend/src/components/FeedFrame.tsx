import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Play, X } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { CommentsPanel } from "./CommentsPanel";
import { castById } from "../content";
import type { Reel } from "../content/types";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

interface FeedFrameProps {
  reel: Reel;
}

export function FeedFrame({ reel }: FeedFrameProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const isDesktop = useIsDesktop();
  const host = castById[reel.hostId];
  const rail = (
    <ActionRail
      likes={reel.likes}
      comments={reel.comments.length}
      liked={liked}
      onLike={() => setLiked((value) => !value)}
      disliked={disliked}
      onDislike={() => setDisliked((value) => !value)}
      onComments={() => setCommentsOpen(true)}
    />
  );
  const firstBeat = reel.beats[0];

  return (
    <div className="flex h-full w-full items-center justify-center gap-5 md:gap-6" data-testid="feed-stage-inner">
      <div
        data-testid="feed-frame"
        className="relative aspect-[9/16] h-full max-h-full max-w-full overflow-hidden rounded-3xl bg-[#191416] shadow-card max-md:aspect-auto max-md:w-full"
      >
        <div
          data-testid="reel-placeholder"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white/10 backdrop-blur">
            <Play className="size-7 text-sage" fill="currentColor" />
          </span>
          <p className="font-display text-lg text-cream">Reel placeholder</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-muted" data-testid="reel-template">
            {reel.template.replace("_", " ")}
          </span>
          <p className="text-xs text-muted">Cartoons arrive in a later update</p>
        </div>

        <div
          data-testid="caption-area"
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-5 pt-16"
        >
          <div className="mb-2 flex gap-1" data-testid="beat-progress">
            {reel.beats.map((beat, i) => (
              <span key={beat.characterId + i} className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-sage" : "bg-white/20"}`} />
            ))}
          </div>
          <span
            className="inline-flex w-max items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold text-cream backdrop-blur"
            data-testid="host-chip"
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: host?.color ?? "#B9ADA6" }} />
            {host?.name ?? "Unknown host"}
          </span>
          <p className="mt-2 max-w-[85%] text-sm font-medium leading-snug text-cream/90" data-testid="reel-caption">
            {firstBeat?.caption}
          </p>
        </div>

        {isDesktop ? null : (
          <div className="absolute bottom-24 right-3 z-10">{rail}</div>
        )}

        <AnimatePresence>
          {commentsOpen && (
            <motion.div
              key="comments-overlay"
              data-testid="comments-overlay"
              role="dialog"
              aria-label="Comments"
              className="absolute inset-x-0 bottom-0 z-20 flex h-[60%] flex-col rounded-t-3xl bg-surface/95 shadow-soft backdrop-blur-md"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
                <h2 className="font-display text-lg text-cream">Comments</h2>
                <button
                  data-testid="comments-close"
                  onClick={() => setCommentsOpen(false)}
                  aria-label="Close comments"
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-white/20"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <CommentsPanel comments={reel.comments} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isDesktop ? <div className="shrink-0">{rail}</div> : null}

      <div className="hidden flex-col gap-3 md:flex" data-testid="feed-nav">
        <button
          data-testid="nav-prev"
          aria-label="Previous reel"
          title="Previous reel — swiping arrives later"
          className="grid size-11 place-items-center rounded-full bg-white/10 text-cream/80 transition hover:bg-white/20 hover:text-cream active:scale-95"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          data-testid="nav-next"
          aria-label="Next reel"
          title="Next reel — swiping arrives later"
          className="grid size-11 place-items-center rounded-full bg-white/10 text-cream/80 transition hover:bg-white/20 hover:text-cream active:scale-95"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}
