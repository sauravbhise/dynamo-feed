import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, Volume2, X } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { CommentsPanel } from "./CommentsPanel";
import { ReelPlayer } from "./ReelPlayer";
import { nextGeneration } from "../feed/order";
import { audioUrl, preloadAudio } from "../audio/engine";
import { SoundContext, SoundProvider, useSound } from "../audio/SoundContext";
import type { Reel, ReelComment } from "../content/types";

const LIKED_PREFIX = "dynamo:liked:";
const NUDGE_AFTER_REELS = 10;
const NUDGE_AFTER_MS = 3 * 60 * 1000;

// Wording matches the trigger that fired.
const NUDGE_COPY = {
  time: "You've been scrolling a resume for 3 minutes. Want to talk to the human instead?",
  reels: "You've watched 10 reels about me. Want to talk to the human instead?",
} as const;

// The nudge reel — inserted once per visit by the engagement rule, never in reels.json.
const NUDGE_REEL: Reel = {
  id: "nudge-talk-to-human",
  slug: "talk-to-the-human",
  template: "nudge",
  hostId: "saurav",
  likes: 0,
  beats: [
    {
      characterId: "saurav",
      pose: "thinking",
      caption: "You've been scrolling a resume for 3 minutes. Want to talk to the human instead?",
      durationMs: 30000,
    },
  ],
  comments: [],
};

function readLikedIds(): Record<string, boolean> {
  try {
    const stored: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LIKED_PREFIX)) {
        stored[key.slice(LIKED_PREFIX.length)] = localStorage.getItem(key) === "1";
      }
    }
    return stored;
  } catch {
    return {};
  }
}

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
  return (
    <SoundProvider>
      <FeedFrameInner />
    </SoundProvider>
  );
}

function FeedFrameInner() {
  const { soundOn, toggleSound, manifest } = useSound();
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
    // An /r/:slug that matches no reel: start clean at the first reel and
    // clear the URL — nothing broken on screen.
    if (found < 0 && match) window.history.replaceState(null, "", "/");
  }
  const [activeIndex, setActiveIndex] = useState(initialIndexRef.current);
  const activeIndexRef = useRef(activeIndex);

  const [paused, setPaused] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>(readLikedIds);
  const [extraComments, setExtraComments] = useState<Record<string, ReelComment[]>>({});
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [loopHint, setLoopHint] = useState(false);

  // The nudge: 10 different reels viewed or 3 minutes in the feed, whichever
  // comes first — inserted once per visit, worded for its trigger.
  const nudgeInsertedRef = useRef(false);
  const startedAtRef = useRef(Date.now());

  const insertNudge = useCallback((trigger: "reels" | "time") => {
    if (nudgeInsertedRef.current) return;
    nudgeInsertedRef.current = true;
    const next = [...orderRef.current];
    // The reel-count trigger puts the nudge in place as the VERY NEXT reel.
    const at = Math.min(activeIndexRef.current + (trigger === "reels" ? 1 : 2), next.length);
    next.splice(at, 0, {
      ...NUDGE_REEL,
      beats: [{ ...NUDGE_REEL.beats[0], caption: NUDGE_COPY[trigger] }],
    });
    orderRef.current = next;
    setOrder(next);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Date.now() - startedAtRef.current >= NUDGE_AFTER_MS) insertNudge("time");
    }, 2000);
    return () => window.clearInterval(timer);
  }, [insertNudge]);

  // A reel counts as viewed each time a DIFFERENT reel becomes the active one,
  // however the visitor got there (scrolling, swiping, arrow keys, the
  // up/down buttons or a "Watch the reel" chip) — including the reel they land
  // on first. The tenth view triggers the nudge immediately.
  const lastViewedIdRef = useRef<string | null>(null);
  const viewedCountRef = useRef(0);
  useEffect(() => {
    const id = order[Math.min(activeIndex, order.length - 1)]?.id;
    if (!id || id === lastViewedIdRef.current) return;
    lastViewedIdRef.current = id;
    viewedCountRef.current += 1;
    if (viewedCountRef.current >= NUDGE_AFTER_REELS) insertNudge("reels");
  }, [activeIndex, order, insertNudge]);

  const activeReel = order[Math.min(activeIndex, order.length - 1)];

  // ?audiotest=1 — check the pill and playback on ANY reel: the sample file is
  // attached to the current reel's first beat, in memory only.
  const audioTest = useMemo(
    () => new URLSearchParams(window.location.search).get("audiotest") === "1",
    []
  );
  const effectiveManifest = useMemo(
    () => (audioTest ? { ...manifest, [`${activeReel.slug}:0`]: "audio/sample.wav" } : manifest),
    [audioTest, manifest, activeReel.slug]
  );
  const reelHasAudio = useMemo(
    () => activeReel.beats.some((_, i) => !!effectiveManifest[`${activeReel.slug}:${i}`]),
    [activeReel, effectiveManifest]
  );
  // Sound UI (pill + rail button) renders only on reels that have audio —
  // with an empty manifest no sound UI shows anywhere.
  const contextValue = useMemo(
    () => ({ soundOn, toggleSound, manifest: effectiveManifest }),
    [soundOn, toggleSound, effectiveManifest]
  );

  // The pill hides as soon as it's tapped or after 5 seconds; a reel change
  // brings it back on the next reel with audio.
  const [pillHidden, setPillHidden] = useState(false);
  useEffect(() => {
    setPillHidden(false);
  }, [activeIndex]);
  useEffect(() => {
    if (!reelHasAudio || soundOn || pillHidden) return;
    const timer = window.setTimeout(() => setPillHidden(true), 5000);
    return () => window.clearTimeout(timer);
  }, [reelHasAudio, soundOn, pillHidden]);

  // Preload the next reel's voice audio while the current one plays.
  useEffect(() => {
    if (!soundOn) return;
    const next = order[activeIndex + 1];
    if (!next) return;
    next.beats.forEach((_, i) => {
      const path = effectiveManifest[`${next.slug}:${i}`];
      if (path) preloadAudio(audioUrl(path));
    });
  }, [activeIndex, order, effectiveManifest, soundOn]);


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
    setLoopHint(false);
    // Endless feed: near the end, append a reshuffled generation.
    if (index >= orderRef.current.length - 2) {
      const tail = orderRef.current.slice(-5).map((reel) => reel.id);
      const next = [...orderRef.current, ...nextGeneration(tail)];
      orderRef.current = next;
      setOrder(next);
    }
  }, [insertNudge]);

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

  // "Watch the reel" chips in the left column jump the feed to that reel.
  useEffect(() => {
    const goToSlug = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail;
      let index = orderRef.current.findIndex((reel) => reel.slug === slug);
      let guard = 0;
      while (index < 0 && guard < 12) {
        guard += 1;
        const tail = orderRef.current.slice(-5).map((reel) => reel.id);
        const next = [...orderRef.current, ...nextGeneration(tail)];
        orderRef.current = next;
        setOrder(next);
        index = next.findIndex((reel) => reel.slug === slug);
      }
      if (index >= 0) goTo(index);
    };
    window.addEventListener("dynamo:goto-reel", goToSlug);
    return () => window.removeEventListener("dynamo:goto-reel", goToSlug);
  }, [goTo]);

  // A new reel autoplays; the loop hint resets on reel change.
  useEffect(() => {
    setPaused(false);
    setLoopHint(false);
  }, [activeIndex]);

  const handleLoop = useCallback(() => setLoopHint(true), []);

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = !prev[id];
      try {
        localStorage.setItem(`${LIKED_PREFIX}${id}`, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return { ...prev, [id]: next };
    });
  }, []);

  const likeReel = useCallback((id: string) => {
    setLikedIds((prev) => {
      if (prev[id]) return prev;
      try {
        localStorage.setItem(`${LIKED_PREFIX}${id}`, "1");
      } catch {
        /* storage unavailable */
      }
      return { ...prev, [id]: true };
    });
  }, []);

  const rail = (
    <ActionRail
      likes={activeReel.likes}
      comments={activeReel.comments.length + (extraComments[activeReel.id]?.length ?? 0)}
      liked={!!likedIds[activeReel.id]}
      onLike={() => toggleLike(activeReel.id)}
      onComments={() => setCommentsOpen(true)}
      slug={activeReel.slug}
      hasAudio={reelHasAudio}
    />
  );

  return (
    <SoundContext.Provider value={contextValue}>
    <div className="flex h-full w-full items-center justify-center gap-5 md:gap-6" data-testid="feed-stage-inner">
      <div
        data-testid="feed-frame"
        role="region"
        aria-label="Reels feed"
        className="reel-frame relative aspect-[9/16] h-full max-h-full max-w-full overflow-hidden rounded-3xl bg-[#191416] shadow-card max-md:aspect-auto max-md:w-full max-md:rounded-none"
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-testid="feed-scroller"
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        >
          {order.map((reel, i) => (
            <div
              key={`${reel.id}-${i}`}
              role="region"
              aria-label={reel.beats[0]?.caption ?? reel.slug}
              className="h-full w-full snap-start"
              data-testid={`feed-slot-${i}`}
            >
              {Math.abs(i - activeIndex) <= 1 && (
                <ReelPlayer
                  reel={reel}
                  active={i === activeIndex}
                  paused={i === activeIndex && paused}
                  onTogglePause={() => setPaused((value) => !value)}
                  onLoop={handleLoop}
                  onDoubleTap={() => likeReel(reel.id)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Sound off until the visitor opts in — the pill sits near the TOP of
            the reel (never over captions, names or chips), hides on tap or
            after 5 seconds. */}
        {!soundOn && reelHasAudio && !pillHidden && (
          <button
            data-testid="sound-pill"
            onClick={(event) => {
              event.stopPropagation();
              toggleSound();
            }}
            className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-sage px-3 py-2 text-xs font-bold text-sage-deep shadow-soft transition hover:scale-105 active:scale-95"
          >
            <Volume2 className="size-3.5" />
            Tap for sound
          </button>
        )}

        {/* Shown only after a reel's first full loop, tucked at the left edge
            just above the caption zone — never over the (centered) character.
            Hides as soon as the visitor scrolls. */}
        <AnimatePresence>
          {loopHint && activeReel.template !== "breaking_news" && (
            <motion.div
              key="swipe-hint"
              data-testid="swipe-hint"
              className="pointer-events-none absolute bottom-[23%] left-3 z-30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1.5 text-[11px] font-bold text-cream backdrop-blur">
                <ChevronUp className="size-3.5" />
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
    </SoundContext.Provider>
  );
}
