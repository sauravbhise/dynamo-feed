import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import type { WatchItem } from "../content/types";

const COMMIT_DISTANCE = 110;
const FLING_VELOCITY = 550;

export function SwipeDeck({ items }: { items: WatchItem[] }) {
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const busyRef = useRef(false);
  const count = items.length;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);

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
    <div
      className="relative mt-3 h-56 outline-none focus-visible:ring-2 focus-visible:ring-sage"
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
  );
}
