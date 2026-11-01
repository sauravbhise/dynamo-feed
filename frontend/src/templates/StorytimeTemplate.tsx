import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelBackground } from "./ReelBackground";
import { seriesInfo } from "../content";
import type { TemplateProps } from "./registry";

export function StorytimeTemplate({ reel, beat, beatIndex, progress, reducedMotion }: TemplateProps) {
  const info = seriesInfo(reel);
  const isLastBeat = beatIndex === reel.beats.length - 1;
  const hasNextPart = info !== null && info.part < info.total;
  // A typing indicator shows before each new bubble.
  const [typing, setTyping] = useState(true);
  useMotionValueEvent(progress, "change", (value) => {
    setTyping(value < 0.22);
  });

  const visible = reel.beats.slice(0, beatIndex + 1).slice(-3);
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

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={50} />

      {/* Bubbles stack in the upper two-thirds, above Tia, never in a corner */}
      <div
        className="absolute inset-x-3 top-[8%] bottom-[62%] z-10 flex flex-col justify-start gap-2.5"
        data-testid="story-bubbles"
      >
        {visible.slice(0, -1).map((b) => (
          <div
            key={b.caption}
            className="w-[92%] rounded-2xl rounded-bl-md bg-surface/85 px-4 py-3 text-[17px] leading-snug text-cream/70 backdrop-blur"
          >
            {b.caption}
          </div>
        ))}
        {typing ? (
          <div
            className="flex w-[92%] items-center gap-1.5 rounded-2xl rounded-bl-md bg-surface/90 px-4 py-3.5 backdrop-blur"
            data-testid="typing-indicator"
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-2 animate-bounce rounded-full bg-cream/70 motion-reduce:animate-none"
                style={{ animationDelay: `${dot * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            key={beat.caption}
            className="w-[92%] rounded-2xl rounded-bl-md bg-surface/90 px-4 py-3 text-[17px] leading-snug text-cream shadow-soft backdrop-blur"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
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
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.5, type: "spring", stiffness: 300, damping: 24 }}
            data-testid="next-part-card"
          >
            <ChevronUp className="size-4" />
            Part {(info?.part ?? 0) + 1} next
          </motion.div>
        )}
      </div>
    </div>
  );
}
