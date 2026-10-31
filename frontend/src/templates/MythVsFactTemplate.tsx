import { useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelBackground } from "./ReelBackground";
import { type TemplateProps } from "./registry";

export function MythVsFactTemplate({ reel, beat, beatIndex, progress, data, reducedMotion }: TemplateProps) {
  const myth = typeof data.myth === "string" ? data.myth : undefined;
  const fact = typeof data.fact === "string" ? data.fact : undefined;
  const flipOnThisBeat = myth !== undefined && fact !== undefined && typeof beat.data?.myth === "string";

  const [flipped, setFlipped] = useState(false);
  useMotionValueEvent(progress, "change", (value) => {
    if (flipOnThisBeat) setFlipped(value >= 0.5);
  });
  // Once the card has flipped it stays flipped for the rest of the reel.
  const isFlipped = flipOnThisBeat ? flipped : fact !== undefined && beatIndex > 0;

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      <div className="absolute inset-x-0 top-[14%] z-10 flex justify-center" style={{ perspective: "1100px" }}>
        <motion.div
          className="relative w-[80%] transition-none"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={reducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 160, damping: 20 }}
          data-testid="myth-card"
        >
          <div className="aspect-[4/3] rounded-3xl bg-surface/95 p-5 shadow-card backdrop-blur" style={{ backfaceVisibility: "hidden" }}>
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[10px] font-extrabold tracking-wide text-cream">Myth</span>
            <p className="mt-3 font-display text-base leading-snug text-cream/85 line-through decoration-[#D96A6A] decoration-2">
              {myth ?? reel.beats[0].caption}
            </p>
          </div>
          <div
            className="absolute inset-0 rounded-3xl bg-sage p-5 shadow-card"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            data-testid="fact-face"
          >
            <span className="rounded-full bg-sage-deep px-3 py-1 text-[10px] font-extrabold tracking-wide text-sage">Fact</span>
            <p className="mt-3 font-display text-base leading-snug text-sage-deep">{fact ?? ""}</p>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-3 z-[5] flex items-end">
        <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking height="42%" />
      </div>

      {/* The caption rides below the card */}
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-6 max-md:pr-20" data-testid="myth-caption">
        <p className="max-w-[85%] rounded-xl bg-ink/55 px-4 py-2 text-center text-sm font-semibold leading-relaxed text-cream backdrop-blur">
          {beat.caption}
        </p>
      </div>
    </div>
  );
}
