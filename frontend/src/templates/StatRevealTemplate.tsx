import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
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

  // The number counts up while its beat plays, FREEZES mid-count on pause and
  // resumes from the same point; when not counting it shows the final value
  // (never stuck at 0 on pre-mounted neighbours).
  const [display, setDisplay] = useState(value ?? 0);
  const accRef = useRef<{ beat: number; ms: number }>({ beat: -1, ms: 0 });
  useEffect(() => {
    if (!active || !valueOnThisBeat || reducedMotion) {
      setDisplay(value ?? 0);
      return;
    }
    if (paused) return; // frozen mid-count; the accumulator keeps its value
    if (accRef.current.beat !== beatIndex) accRef.current = { beat: beatIndex, ms: 0 };
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      accRef.current.ms += now - last;
      last = now;
      const p = Math.min(accRef.current.ms / COUNT_UP_MS, 1);
      setDisplay(Math.round(p * (value ?? 0)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, valueOnThisBeat, beatIndex, value, reducedMotion]);

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
              <span data-testid="stat-count">{display.toLocaleString()}</span>
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
