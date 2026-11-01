import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Heart, X } from "lucide-react";
import type { WatchItem } from "../content/types";

const COMMIT_DISTANCE = 110;
const FLING_VELOCITY = 550;

export function SwipeDeck({ items }: { items: WatchItem[] }) {
  const [index, setIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const busyRef = useRef(false);
  const count = items.length;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const saveOpacity = useTransform(x, [40, 130], [0, 1]);
  const skipOpacity = useTransform(x, [-130, -40], [1, 0]);

  if (count === 0) {
    return (
      <p className="mt-3 rounded-xl bg-raised p-3 text-xs leading-relaxed text-muted" data-testid="deck-empty">
        Nothing queued right now — suggestions welcome.
      </p>
    );
  }

  const commit = (dir: "left" | "right") => {
    if (busyRef.current) return;
    busyRef.current = true;
    setExitDir(dir);
    if (dir === "right") setSavedCount((value) => value + 1);
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
      <p
        className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-muted"
        data-testid="deck-saved-count"
      >
        <Heart className="size-3.5 fill-sage text-sage" />
        Saved {savedCount}
      </p>

      <div
        className="relative mt-2.5 h-56 outline-none focus-visible:ring-2 focus-visible:ring-sage"
        tabIndex={0}
        data-testid="swipe-deck"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            commit("left");
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            commit("right");
          }
        }}
      >
        {/* Two cards peeking behind the top one */}
        {count > 1 && (
          <div className="absolute inset-x-2 bottom-2 top-3 scale-[0.955] rounded-2xl bg-raised/70 shadow-soft" aria-hidden="true" />
        )}
        {count > 2 && (
          <div className="absolute inset-x-4 bottom-4 top-6 scale-[0.91] rounded-2xl bg-raised/40" aria-hidden="true" />
        )}

        <motion.div
          key={index}
          className="absolute inset-0 cursor-grab touch-pan-y select-none rounded-2xl bg-raised p-4 shadow-card active:cursor-grabbing"
          style={{ x, rotate }}
          initial={{ scale: 0.96, y: 10, opacity: 0.85 }}
          animate={
            exitDir
              ? { x: exitDir === "right" ? 480 : -480, opacity: 0 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={
            exitDir
              ? { duration: 0.3, ease: "easeOut" }
              : { type: "spring", stiffness: 320, damping: 28 }
          }
          drag={exitDir ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
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
          <motion.span
            style={{ opacity: saveOpacity }}
            className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-lg border-2 border-sage px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-sage"
            data-testid="deck-label-save"
          >
            Save
          </motion.span>
          <motion.span
            style={{ opacity: skipOpacity }}
            className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-lg border-2 border-[#D96A6A] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-[#D96A6A]"
            data-testid="deck-label-skip"
          >
            Skip
          </motion.span>

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

      <div className="mt-3 flex items-center justify-center gap-5" data-testid="deck-buttons">
        <button
          type="button"
          data-testid="deck-skip"
          aria-label="Skip"
          onClick={() => commit("left")}
          className="grid size-12 place-items-center rounded-full border-2 border-[#D96A6A]/50 bg-surface text-[#D96A6A] shadow-soft transition hover:scale-105 active:scale-95"
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          data-testid="deck-save"
          aria-label="Save"
          onClick={() => commit("right")}
          className="grid size-14 place-items-center rounded-full bg-sage text-sage-deep shadow-soft transition hover:scale-105 active:scale-95"
        >
          <Heart className="size-6" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
