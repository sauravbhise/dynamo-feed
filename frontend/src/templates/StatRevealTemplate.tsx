import { useRef } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelBackground } from "./ReelBackground";
import { num, str, type TemplateProps } from "./registry";

export function StatRevealTemplate({ reel, beat, beatIndex, progress, data, reducedMotion }: TemplateProps) {
  const value = num(data.value);
  const unit = str(data.unit) ?? "";
  const label = str(data.label);
  const before = str(data.before);
  const after = str(data.after);
  const valueOnThisBeat = typeof num(beat.data?.value) === "number";

  // The number counts up while its own beat plays, then holds.
  const countRef = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(progress, "change", (p) => {
    if (countRef.current && valueOnThisBeat && !reducedMotion) {
      countRef.current.textContent = Math.round(Math.min(p, 1) * (value ?? 0)).toLocaleString();
    }
  });

  // Before/after split screen wipes across with the beat.
  const wipe = useTransform(progress, (p) => `inset(0 0 0 ${(Math.min(p, 1) * 100).toFixed(2)}%)`);

  const showSplit = before !== undefined && after !== undefined;

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {showSplit ? (
        <div className="absolute inset-0" data-testid="stat-split">
          <div className="absolute inset-0 grid place-items-center bg-[#3A2E2C]">
            <p className="px-6 text-center font-display text-xl text-cream/85">{before}</p>
          </div>
          <motion.div
            className="absolute inset-0 grid place-items-center bg-[#41503F]"
            style={reducedMotion ? { clipPath: "inset(0 0 0 100%)" } : { clipPath: wipe }}
            data-testid="stat-after"
          >
            <p className="px-6 text-center font-display text-xl text-cream/85">{after}</p>
          </motion.div>
          <span className="absolute left-4 top-[8%] z-10 rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-bold text-cream">Before</span>
          <span className="absolute right-4 top-[8%] z-10 rounded-full bg-sage px-2.5 py-0.5 text-[10px] font-bold text-sage-deep">After</span>
        </div>
      ) : (
        value !== undefined && (
          <div className="absolute inset-x-0 top-[10%] z-10 flex flex-col items-center gap-1.5 text-center" data-testid="stat-reveal">
            <motion.span
              className="rounded-3xl bg-ink/55 px-6 py-3 font-display text-6xl text-cream backdrop-blur"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reducedMotion ? { duration: 0.3 } : { type: "spring", stiffness: 240, damping: 20 }}
            >
              <span ref={countRef}>{value.toLocaleString()}</span>
              <span className="ml-1 text-2xl text-cream/80">{unit}</span>
            </motion.span>
            {label && (
              <span className="rounded-full bg-ink/60 px-3.5 py-1.5 text-xs font-bold text-cream/90 backdrop-blur">{label}</span>
            )}
          </div>
        )
      )}

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={46} />

      {/* Caption inside the caption zone */}
      <div className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center px-6 max-md:pr-20" data-testid="stat-caption">
        <p className="max-w-[85%] rounded-xl bg-ink/55 px-4 py-2 text-center text-sm font-semibold leading-relaxed text-cream backdrop-blur">
          {beat.caption}
        </p>
      </div>
    </div>
  );
}
