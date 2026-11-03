import { useEffect, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { CharacterSlot, headTopPercent } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
import type { TemplateProps } from "./registry";

const CHAR_HEIGHT = 40;

export function MythVsFactTemplate({ reel, beat, beatIndex, progress, data, reducedMotion, active }: TemplateProps) {
  const paused = usePaused();
  const myth = typeof data.myth === "string" ? data.myth : undefined;
  const fact = typeof data.fact === "string" ? data.fact : undefined;
  const flipOnThisBeat = myth !== undefined && fact !== undefined && typeof beat.data?.myth === "string";

  // The flip listens to the beat-consistent progress value and always resets
  // with beatIndex, so a flip never bleeds across beats.
  const [flipped, setFlipped] = useState(false);
  useMotionValueEvent(progress, "change", (value) => {
    if (flipOnThisBeat) setFlipped(value >= 0.5);
  });
  useEffect(() => {
    setFlipped(false);
  }, [beatIndex]);
  // Once the card has flipped it stays flipped for the rest of the reel.
  const isFlipped = flipOnThisBeat ? flipped : fact !== undefined && beatIndex > 0;

  // The card may never grow down over the character's head.
  const headTop = headTopPercent(beat.characterId, CHAR_HEIGHT);

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      <div
        className="absolute inset-x-3 top-[3%] z-10 flex justify-center overflow-hidden rail-clear-right"
        style={{ perspective: "1100px", maxHeight: `${Math.max(headTop - 5, 18)}%` }}
      >
        <motion.div
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={reducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 160, damping: 20 }}
          data-testid="myth-card"
        >
          <div className="min-h-[150px] rounded-3xl bg-surface/95 p-4 shadow-card backdrop-blur" style={{ backfaceVisibility: "hidden" }}>
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[10px] font-extrabold tracking-wide text-cream">Myth</span>
            <p className="mt-2.5 font-display text-[15px] leading-snug text-cream/85 line-through decoration-[#D96A6A] decoration-2">
              {myth ?? reel.beats[0].caption}
            </p>
          </div>
          <div
            className="absolute inset-0 rounded-3xl bg-sage p-4 shadow-card"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            data-testid="fact-face"
          >
            <span className="rounded-full bg-sage-deep px-3 py-1 text-[10px] font-extrabold tracking-wide text-sage">Fact</span>
            <p className="mt-2.5 font-display text-[15px] leading-snug text-sage-deep">{fact ?? ""}</p>
          </div>
        </motion.div>
      </div>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={CHAR_HEIGHT} />

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
