import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { CommentsPanel } from "./CommentsPanel";
import { ReelPlayer } from "./ReelPlayer";
import { nextGeneration } from "../feed/order";
import type { Reel, ReelComment } from "../content/types";

const HINT_KEY = "dynamo:swipe-hint-seen";

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

export function FeedFrame() {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Reel[]>(() => nextGeneration([]));
  const orderRef = useRef(order);

  // Opening /r/:slug starts the feed at that reel.
  const initialIndexRef = useRef(-1);
  if (initialIndexRef.current < 0) {
    const match = window.location.pathname.match(/\/r\/([^/]+)/);
    const found = match ? order.findIndex((reel) => reel.slug === match[1]) : -1;
    initialIndexRef.current = found >= 0 ? found : 0;
  }
  const [activeIndex, setActiveIndex] = useState(initialIndexRef.current);
  const activeIndexRef = useRef(activeIndex);

  const [paused, setPaused] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [extraComments, setExtraComments] = useState<Record<string, ReelComment[]>>({});
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showIntroHint, setShowIntroHint] = useState(
    () => localStorage.getItem(HINT_KEY) !== "1"
  );
  const introHintRef = useRef(showIntroHint);
  const [loopHint, setLoopHint] = useState(false);

  const activeReel = order[Math.min(activeIndex, order.length - 1)];

  // Deep link: jump to the opening reel before first paint.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && activeIndex > 0) el.scrollTop = activeIndex * el.clientHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The URL follows the feed without adding history entries.
  useEffect(() => {
    const slug = order[activeIndex]?.slug;
    if (slug && window.location.pathname !== `/r/${slug}`) {
      window.history.replaceState(null, "", `/r/${slug}`);
    }
  }, [activeIndex, order]);

  const goTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({
        top: Math.max(0, index) * el.clientHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion]
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientHeight === 0) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
    if (introHintRef.current) {
      introHintRef.current = false;
      localStorage.setItem(HINT_KEY, "1");
      setShowIntroHint(false);
    }
    setLoopHint(false);
    // Endless feed: near the end, append a reshuffled generation.
    if (index >= orderRef.current.length - 2) {
      const tail = orderRef.current.slice(-5).map((reel) => reel.id);
      const next = [...orderRef.current, ...nextGeneration(tail)];
      orderRef.current = next;
      setOrder(next);
    }
  }, []);

  // Keyboard: arrows / j,k to navigate, space to pause.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if (event.key === "ArrowDown" || event.key === "j" || event.key === "J") {
        event.preventDefault();
        goTo(activeIndexRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "k" || event.key === "K") {
        event.preventDefault();
        goTo(activeIndexRef.current - 1);
      } else if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // A new reel autoplays; the loop nudge resets on reel change.
  useEffect(() => {
    setPaused(false);
    setLoopHint(false);
  }, [activeIndex]);

  const handleLoop = useCallback(() => setLoopHint(true), []);

  const rail = (
    <ActionRail
      likes={activeReel.likes}
      comments={activeReel.comments.length + (extraComments[activeReel.id]?.length ?? 0)}
      liked={!!likedIds[activeReel.id]}
      onLike={() => setLikedIds((prev) => ({ ...prev, [activeReel.id]: !prev[activeReel.id] }))}
      onComments={() => setCommentsOpen(true)}
    />
  );

  return (
    <div className="flex h-full w-full items-center justify-center gap-5 md:gap-6" data-testid="feed-stage-inner">
      <div
        data-testid="feed-frame"
        className="relative aspect-[9/16] h-full max-h-full max-w-full overflow-hidden rounded-3xl bg-[#191416] shadow-card max-md:aspect-auto max-md:w-full max-md:rounded-none"
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-testid="feed-scroller"
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        >
          {order.map((reel, i) => (
            <div key={`${reel.id}-${i}`} className="h-full w-full snap-start" data-testid={`feed-slot-${i}`}>
              {Math.abs(i - activeIndex) <= 1 && (
                <ReelPlayer
                  reel={reel}
                  active={i === activeIndex}
                  paused={i === activeIndex && paused}
                  onTogglePause={() => setPaused((value) => !value)}
                  onLoop={handleLoop}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {(showIntroHint || loopHint) && (
            <motion.div
              key="swipe-hint"
              data-testid="swipe-hint"
              className="pointer-events-none absolute bottom-5 left-1/2 z-30"
              initial={{ opacity: 0, x: "-50%", y: 10 }}
              animate={{ opacity: 1, x: "-50%", y: 0 }}
              exit={{ opacity: 0, x: "-50%", y: 10 }}
            >
              <span className="flex items-center gap-1.5 rounded-full bg-ink/70 px-3.5 py-2 text-xs font-bold text-cream backdrop-blur">
                <ChevronUp className="size-4" />
                Swipe up
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isDesktop ? null : (
          <div
            className="absolute bottom-24 right-3 z-20"
            onClick={(event) => event.stopPropagation()}
          >
            {rail}
          </div>
        )}

        <AnimatePresence>
          {commentsOpen && (
            <motion.div
              key="comments-overlay"
              data-testid="comments-overlay"
              role="dialog"
              aria-label="Comments"
              onClick={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 z-50 flex h-[60%] flex-col rounded-t-3xl bg-surface/95 shadow-soft backdrop-blur-md"
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
                <CommentsPanel
                  comments={[...activeReel.comments, ...(extraComments[activeReel.id] ?? [])]}
                  onAdd={(text) =>
                    setExtraComments((prev) => ({
                      ...prev,
                      [activeReel.id]: [...(prev[activeReel.id] ?? []), { authorId: "visitor", text }],
                    }))
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isDesktop ? <div className="shrink-0">{rail}</div> : null}

      {isDesktop ? (
        <div className="flex flex-col gap-3" data-testid="feed-nav">
          <button
            data-testid="nav-prev"
            aria-label="Previous reel"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-cream/80 transition hover:bg-white/20 hover:text-cream active:scale-95 disabled:opacity-40"
          >
            <ChevronUp className="size-5" />
          </button>
          <button
            data-testid="nav-next"
            aria-label="Next reel"
            onClick={() => goTo(activeIndex + 1)}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-cream/80 transition hover:bg-white/20 hover:text-cream active:scale-95"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
