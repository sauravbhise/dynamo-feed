import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import type { WatchItem } from "../content/types";

const COMMIT_DISTANCE = 110;
const FLING_VELOCITY = 550;

export function SwipeDeck({ items }: { items: WatchItem[] }) {
  const reduceMotion = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  // The wiggle plays once; reduced motion skips it and keeps the hint text.
  const [hintDone, setHintDone] = useState(reduceMotion);
  const [hintDismissed, setHintDismissed] = useState(false);
  const busyRef = useRef(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const count = items.length;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);

  const inView = useInView(deckRef, { once: true, amount: 0.5 });

  // Every new top card springs up...
  useEffect(() => {
    if (count === 0 || exitDir || reduceMotion) return;
    controls.start({
      scale: [0.96, 1],
      y: [10, 0],
      opacity: [0.85, 1],
      transition: { duration: 0.35, ease: "easeOut" },
    });
  }, [count, index, exitDir, reduceMotion, controls]);

  // ...and the first card in view does one gentle hint wiggle: left, right, settle.
  useEffect(() => {
    if (!inView || hintDone || count === 0) return;
    const timer = window.setTimeout(() => {
      controls.start({ x: [0, -40, 40, 0], transition: { duration: 1.2, ease: "easeInOut" } });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [inView, hintDone, count, controls]);

  const commit = (dir: "left" | "right") => {
    if (busyRef.current) return;
    busyRef.current = true;
    controls.stop();
    setHintDone(true);
    setHintDismissed(true);
    setExitDir(dir);
  };

  const goPrev = () => {
    controls.stop();
    setHintDone(true);
    setHintDismissed(true);
    setIndex((value) => (value - 1 + count) % count);
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x > COMMIT_DISTANCE || info.velocity.x > FLING_VELOCITY) {
      commit("right");
    } else if (info.offset.x < -COMMIT_DISTANCE || info.velocity.x < -FLING_VELOCITY) {
      commit("left");
    }
  };

  const itemAt = (offset: number) => items[(index + offset) % count];
  const top = itemAt(0);

  return (
    <div>
      <div
        ref={deckRef}
        className="group relative mt-3 h-56 outline-none focus-visible:ring-2 focus-visible:ring-sage"
        tabIndex={0}
        data-testid="swipe-deck"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            commit("right");
          }
        }}
      >
        {/* Two cards peek out below the top one, slightly rotated — reads as a pile */}
        {count > 1 && (
          <div className="absolute inset-x-4 top-2 -rotate-3 translate-y-3 rounded-2xl bg-raised/60 shadow-soft" aria-hidden="true" />
        )}
        {count > 2 && (
          <div className="absolute inset-x-6 top-4 rotate-3 translate-y-6 rounded-2xl bg-raised/40" aria-hidden="true" />
        )}

        {/* Faint chevrons on hover — previous / next card */}
        <button
          type="button"
          data-testid="deck-prev"
          aria-label="Previous"
          onClick={goPrev}
          className="absolute left-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream/70 opacity-0 backdrop-blur transition hover:text-cream group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          data-testid="deck-next"
          aria-label="Next"
          onClick={() => commit("right")}
          className="absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream/70 opacity-0 backdrop-blur transition hover:text-cream group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronRight className="size-4" />
        </button>

        <motion.div
          key={index}
          className="absolute inset-0 cursor-grab touch-pan-y select-none rounded-2xl bg-raised p-4 shadow-card active:cursor-grabbing"
          style={{ x, rotate }}
          initial={reduceMotion ? false : { scale: 0.96, y: 10, opacity: 0.85 }}
          animate={controls}
          drag={exitDir ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragStart={() => {
            controls.stop();
            setHintDone(true);
          }}
          onDragEnd={handleDragEnd}
          onAnimationComplete={() => {
            if (exitDir) {
              x.set(0);
              setExitDir(null);
              busyRef.current = false;
              setIndex((value) => value + 1);
            }
          }}
          data-testid="deck-card"
        >
          <div className="flex h-full flex-col justify-center px-1">
            <h4 className="min-w-0 truncate font-display text-sm text-cream" data-testid="deck-card-title">
              {top.title}
            </h4>
            <span className="mt-1.5 w-max rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-bold text-sage">
              {top.kind} · {top.year}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-muted">{top.why}</p>
          </div>
        </motion.div>
      </div>

      {!hintDismissed && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted" data-testid="deck-hint">
          <Hand className="size-3.5" />
          Swipe for more
        </p>
      )}
    </div>
  );
}
