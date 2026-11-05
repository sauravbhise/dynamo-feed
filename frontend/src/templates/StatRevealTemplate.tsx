import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { beatDurationMs, castById } from "../content";
import { num, str, type TemplateProps } from "./registry";

const COUNT_UP_MS = 1400;

export function StatRevealTemplate({ reel, beat, beatIndex, progress, data, reducedMotion, active }: TemplateProps) {
  const paused = usePaused();
  const value = num(data.value);
  const unit = str(data.unit) ?? "";
  const label = str(data.label);
  const before = str(data.before);
  const after = str(data.after);
  const valueOnThisBeat = typeof num(beat.data?.value) === "number";
  const counting = active && valueOnThisBeat && !reducedMotion;

  // The count is written straight from the beat-consistent progress value —
  // no React state, so it can never flash a wrong number at a beat change.
  // Progress freezes on pause and resets per beat, and so does the count.
  const countRef = useRef<HTMLSpanElement>(null);
  const beatMs = beatDurationMs(beat, reel.template);
  useMotionValueEvent(progress, "change", (p) => {
    if (!counting || !countRef.current) return;
    const f = Math.min(Math.max((p * beatMs) / COUNT_UP_MS, 0), 1);
    countRef.current.textContent = Math.round(f * (value ?? 0)).toLocaleString();
  });
  // Reset with the beat: count from 0 while counting, final value otherwise
  // (pre-mounted neighbours show 600, never a stale or zero count).
  useLayoutEffect(() => {
    if (countRef.current) {
      countRef.current.textContent = counting ? "0" : (value ?? 0).toLocaleString();
    }
  }, [beatIndex, counting, value]);

  // Before/after split screen wipes across with the beat (freezes on pause).
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
              initial={paused || reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reducedMotion ? { duration: 0.3 } : { type: "spring", stiffness: 240, damping: 20 }}
            >
              <span ref={countRef} data-testid="stat-count">
                {(value ?? 0).toLocaleString()}
              </span>
              <span className="ml-1 text-2xl text-cream/80">{unit}</span>
            </motion.span>
            {label && (
              <span className="rounded-full bg-ink/60 px-3.5 py-1.5 text-xs font-bold text-cream/90 backdrop-blur">{label}</span>
            )}
          </div>
        )
      )}

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
