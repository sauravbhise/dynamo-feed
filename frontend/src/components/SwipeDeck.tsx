import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { PanInfo, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import type { WatchItem } from "../content/types";

const COMMIT_DISTANCE = 110;
const FLING_VELOCITY = 550;

type DeckDir = 1 | -1; // 1 = next, -1 = previous

interface DeckCustom {
  dir: DeckDir;
  exitX: number;
}

const cardVariants: Variants = {
  enter: ({ dir }: DeckCustom) => ({
    // Next: the new card settles into place from the pile.
    // Previous: the previous card slides in from the left.
    ...(dir === 1
      ? { scale: 0.96, y: 10, opacity: 0.85 }
      : { x: -480, opacity: 0.9 }),
    transition:
      dir === 1
        ? { type: "spring", stiffness: 320, damping: 28 }
        : { type: "spring", stiffness: 260, damping: 28 },
  }),
  center: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: ({ dir, exitX }: DeckCustom) => ({
    // Next: the top card flies off the way it was swiped.
    // Previous: the top card slides out to the right.
    x: dir === 1 ? exitX : 480,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  }),
};

function DeckCard({
  item,
  custom,
  wiggle,
  reduceMotion,
  onDragStart,
  onDragEnd,
}: {
  item: WatchItem;
  custom: DeckCustom;
  wiggle: boolean;
  reduceMotion: boolean;
  onDragStart: () => void;
  onDragEnd: (info: PanInfo) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);

  return (
    <motion.div
      className={`absolute inset-x-0 top-0 h-[calc(100%-20px)] cursor-grab touch-pan-y select-none rounded-2xl bg-raised p-4 shadow-card active:cursor-grabbing ${
        wiggle ? "deck-wiggle-once" : ""
      }`}
      style={{ x, rotate }}
      custom={custom}
      variants={cardVariants}
      initial={reduceMotion ? "center" : "enter"}
      animate="center"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={onDragStart}
      onDragEnd={(_event, info) => onDragEnd(info)}
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
  const [[index, dir], setDeck] = useState<[number, DeckDir]>([0, 1]);
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

  // Next: a swipe in either direction (the card flies the way you swiped),
  // the right arrow, the next chevron or the right key.
  const goNext = (exitX: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    interacted();
    exitXRef.current = exitX;
    setDeck(([i]) => [(i + 1) % count, 1]);
  };

  // Previous: the left arrow, left chevron or left key.
  const goPrev = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    interacted();
    setDeck(([i]) => [(i - 1 + count) % count, -1]);
  };

  const handleDragEnd = (info: PanInfo) => {
    if (info.offset.x > COMMIT_DISTANCE || info.velocity.x > FLING_VELOCITY) {
      goNext(480);
    } else if (info.offset.x < -COMMIT_DISTANCE || info.velocity.x < -FLING_VELOCITY) {
      goNext(-480);
    }
  };

  const top = items[index % count];
  const custom: DeckCustom = { dir, exitX: exitXRef.current };

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
            goPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext(480);
          }
        }}
      >
        {/* Two cards peek out below the top one, slightly rotated — reads as a
            pile. Same size as the top card, scaled down and moved down, so the
            edges stay inside the deck area. */}
        {count > 1 && (
          <div className="absolute inset-x-0 top-2 h-[calc(100%-20px)] -rotate-2 scale-[0.95] rounded-2xl bg-raised/60 shadow-soft" aria-hidden="true" />
        )}
        {count > 2 && (
          <div className="absolute inset-x-0 top-4 h-[calc(100%-20px)] rotate-2 scale-[0.9] rounded-2xl bg-raised/40" aria-hidden="true" />
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
          onClick={() => goNext(480)}
          className="absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream/70 opacity-0 backdrop-blur transition hover:text-cream group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronRight className="size-4" />
        </button>

        <AnimatePresence
          initial={false}
          custom={custom}
          onExitComplete={() => {
            busyRef.current = false;
          }}
        >
          <DeckCard
            key={index}
            item={top}
            custom={custom}
            wiggle={inView && !hintDone}
            reduceMotion={reduceMotion}
            onDragStart={() => setHintDone(true)}
            onDragEnd={handleDragEnd}
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
