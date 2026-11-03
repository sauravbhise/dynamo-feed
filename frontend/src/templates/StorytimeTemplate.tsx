import { useEffect, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { beatDurationMs, castById, seriesInfo } from "../content";
import type { TemplateProps } from "./registry";

const TYPING_MS = 700;

export function StorytimeTemplate({ reel, beat, beatIndex, progress, reducedMotion, active }: TemplateProps) {
  const paused = usePaused();
  const info = seriesInfo(reel);
  const isLastBeat = beatIndex === reel.beats.length - 1;
  const hasNextPart = info !== null && info.part < info.total;
  // A typing indicator shows for the first 700ms of each beat (the beat is
  // lengthened by exactly that), then the line drops in as the newest bubble.
  // The state always resets with beatIndex, and the progress events it listens
  // to are published in the same tick as the index — so it can never describe
  // the wrong beat.
  const [typing, setTyping] = useState(true);
  useMotionValueEvent(progress, "change", (value) => {
    setTyping(value < TYPING_MS / beatDurationMs(beat, "storytime"));
  });
  useEffect(() => {
    setTyping(true);
  }, [beatIndex]);

  // The bubbles ARE the caption here: the current line plus the one before it,
  // older ones fading out. Never more than two.
  const visible = reel.beats.slice(0, beatIndex + 1).slice(-2);
  const showNextCard = isLastBeat && hasNextPart && !typing;

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {info && (
        <div className="absolute left-1/2 top-[3%] z-10 -translate-x-1/2" data-testid="series-chip">
          <span className="rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-cream backdrop-blur">
            Part {info.part} of {info.total}
          </span>
        </div>
      )}

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />

      {/* Bubbles run from 8% to 50% — always ending above Tia's head */}
      <div
        aria-live="polite"
        className="absolute inset-x-3 top-[8%] bottom-[50%] z-10 flex flex-col justify-start gap-2.5 rail-clear-right"
        data-testid="story-bubbles"
      >
        {visible.slice(0, -1).map((b) => (
          <div
            key={b.caption}
            className="w-[92%] shrink-0 rounded-2xl rounded-bl-md bg-surface/85 px-4 py-3 text-[17px] leading-snug text-cream/70 opacity-60 backdrop-blur"
          >
            {b.caption}
          </div>
        ))}
        {typing ? (
          <div
            className="flex w-[92%] shrink-0 items-center gap-1.5 rounded-2xl rounded-bl-md bg-surface/90 px-4 py-3.5 backdrop-blur"
            data-testid="typing-indicator"
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={`size-2 animate-bounce rounded-full bg-cream/70 motion-reduce:animate-none ${
                  paused ? "[animation-play-state:paused]" : ""
                }`}
                style={{ animationDelay: `${dot * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            key={beat.caption}
            className="w-[92%] shrink-0 rounded-2xl rounded-bl-md bg-surface/90 px-4 py-3 text-[17px] leading-snug text-cream shadow-soft backdrop-blur"
            initial={paused || reducedMotion ? false : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            data-testid="story-bubble-current"
          >
            {beat.caption}
          </motion.div>
        )}
        {showNextCard && (
          <motion.div
            className="flex w-max items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-sm font-bold text-sage-deep shadow-soft"
            initial={paused || reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.5, type: "spring", stiffness: 300, damping: 24 }}
            data-testid="next-part-card"
          >
            <ChevronUp className="size-4" />
            Part {(info?.part ?? 0) + 1} next
          </motion.div>
        )}
      </div>

      {/* The bubbles carry the caption here — only the speaker name below */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />} />
      </div>
    </div>
  );
}
