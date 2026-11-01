import { useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { PanInfo, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import type { WatchItem } from "../content/types";

const COMMIT_DISTANCE = 110;
const FLING_VELOCITY = 550;

const cardVariants: Variants = {
  enter: {
    // The next card settles into place BENEATH the leaving card.
    zIndex: 1,
    scale: 0.96,
    y: 10,
    opacity: 0.85,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  center: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: (exitX: number) => ({
    // The leaving card stays ON TOP of the pile while it flies away.
    zIndex: 3,
    x: exitX,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  }),
};

function DeckCard({
  item,
  exitX,
  wiggle,
  reduceMotion,
  onSwipeStart,
  onSwipe,
}: {
  item: WatchItem;
  exitX: number;
  wiggle: boolean;
  reduceMotion: boolean;
  onSwipeStart: () => void;
  onSwipe: (swipeDir: 1 | -1) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x > COMMIT_DISTANCE || info.velocity.x > FLING_VELOCITY) {
      onSwipe(1);
    } else if (info.offset.x < -COMMIT_DISTANCE || info.velocity.x < -FLING_VELOCITY) {
      onSwipe(-1);
    } else {
      // No drag constraints — spring the card back to centre ourselves,
      // so a committed swipe never gets pulled back mid-exit.
      animate(x, 0, { type: "spring", stiffness: 320, damping: 28 });
    }
  };

  return (
    <motion.div
      className={`absolute inset-x-0 top-0 h-[calc(100%-20px)] cursor-grab touch-pan-y select-none rounded-2xl bg-raised p-4 shadow-card active:cursor-grabbing ${
        wiggle ? "deck-wiggle-once" : ""
      }`}
      style={{ x, rotate }}
      custom={exitX}
      variants={cardVariants}
      initial={reduceMotion ? "center" : "enter"}
      animate="center"
      exit="exit"
      drag="x"
      dragSnapToOrigin={false}
      onDragStart={onSwipeStart}
      onDragEnd={handleDragEnd}
      data-testid="deck-card"
    >
      <div className="flex h-full flex-col justify-center px-1">
        <h4 className="min-w-0 truncate font-display text-sm text-cream" data-testid="deck-card-title">
          {item.title}
        </h4>
        <span className="mt-1.5 w-max rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-bold text-sage">
          {item.kind} · {item.year}
        </span>
        <p className="mt-3 text-xs leading-relaxed text-muted">{item.why}</p>
      </div>
    </motion.div>
  );
}

export function SwipeDeck({ items }: { items: WatchItem[] }) {
  const reduceMotion = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  // The wiggle plays once; reduced motion skips it and keeps the hint text.
  const [hintDone, setHintDone] = useState(reduceMotion);
  const [hintDismissed, setHintDismissed] = useState(false);
  const busyRef = useRef(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const exitXRef = useRef(480);
  const count = items.length;

  const inView = useInView(deckRef, { once: true, amount: 0.5 });

  if (count === 0) {
    return (
      <p className="mt-3 rounded-xl bg-raised p-3 text-xs leading-relaxed text-muted" data-testid="deck-empty">
        Nothing queued right now — suggestions welcome.
      </p>
    );
  }

  const interacted = () => {
    setHintDone(true);
    setHintDismissed(true);
  };

  // Every control does the same thing: the top card flies off in the given
  // direction, on top of the pile, and the next card settles into place
  // beneath it. The deck loops endlessly, so a full cycle brings any card back.
  const handleSwipe = (swipeDir: 1 | -1) => {
    if (busyRef.current) return;
    busyRef.current = true;
    interacted();
    exitXRef.current = swipeDir === 1 ? 480 : -480;
    setIndex((value) => (value + 1) % count);
  };

  const top = items[index % count];

  return (
    <div>
      <div
        ref={deckRef}
        className="group relative mt-3 h-60 outline-none focus-visible:ring-2 focus-visible:ring-sage"
        tabIndex={0}
        data-testid="swipe-deck"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            handleSwipe(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            handleSwipe(1);
          }
        }}
      >
        {/* Two cards peek out below the top one, slightly rotated — reads as a
            pile. Same size as the top card, scaled down and moved down, so the
            edges stay inside the deck area. Always beneath the moving cards. */}
        {count > 1 && (
          <div className="absolute inset-x-0 top-2 z-0 h-[calc(100%-20px)] -rotate-2 scale-[0.95] rounded-2xl bg-raised/60 shadow-soft" aria-hidden="true" />
        )}
        {count > 2 && (
          <div className="absolute inset-x-0 top-4 z-0 h-[calc(100%-20px)] rotate-2 scale-[0.9] rounded-2xl bg-raised/40" aria-hidden="true" />
        )}

        {/* Faint chevrons on hover — fly the top card off left or right */}
        <button
          type="button"
          data-testid="deck-prev"
          aria-label="Next card"
          title="Swipe left"
          onClick={() => handleSwipe(-1)}
          className="absolute left-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream/70 opacity-0 backdrop-blur transition hover:text-cream group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          data-testid="deck-next"
          aria-label="Next card"
          title="Swipe right"
          onClick={() => handleSwipe(1)}
          className="absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream/70 opacity-0 backdrop-blur transition hover:text-cream group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronRight className="size-4" />
        </button>

        <AnimatePresence
          initial={false}
          mode="sync"
          custom={exitXRef.current}
          onExitComplete={() => {
            busyRef.current = false;
          }}
        >
          <DeckCard
            key={index}
            item={top}
            exitX={exitXRef.current}
            wiggle={inView && !hintDone}
            reduceMotion={reduceMotion}
            onSwipeStart={() => setHintDone(true)}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* 12px gap below the deck area — the pile stays inside, so nothing covers it */}
      {!hintDismissed && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted" data-testid="deck-hint">
          <Hand className="size-3.5" />
          Swipe for more
        </p>
      )}
    </div>
  );
}
