import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
import { str, type TemplateProps } from "./registry";

/** A "day in the life" vlog: a clock kicker top-left, a cut per beat. */
export function DayInLifeTemplate({ reel, beat, beatIndex, data, reducedMotion }: TemplateProps) {
  const paused = usePaused();
  const title = str(data.title);
  // time/label are PER-BEAT (not accumulated — every beat carries its own).
  const time = str(beat.data?.time);
  const label = str(beat.data?.label);

  // Each beat cuts in: an 8% slide from the right + fade over ~180ms — on a
  // wrapper, so the character's <img> never remounts. Frozen while paused;
  // fade only with reduced motion.
  const cut = useAnimationControls();
  const frozenRef = useRef(paused);
  frozenRef.current = paused;
  useEffect(() => {
    if (frozenRef.current) {
      cut.set({ x: 0, opacity: 1 });
      return;
    }
    cut.start(
      reducedMotion ? { opacity: [0, 1] } : { x: ["8%", "0%"], opacity: [0, 1] },
      { duration: 0.18, ease: "easeOut" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatIndex]);

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {/* Kicker, top-left: title, the current time (old slides up and out,
          new slides into place ~250ms), label. */}
      <div className="absolute left-4 top-[6%] z-10 max-w-[70%]">
        {title && (
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-sage">{title}</p>
        )}
        <div className="relative">
          <AnimatePresence initial={false} mode="popLayout">
            {time && (
              <motion.p
                key={time}
                className="font-display text-[34px] font-bold leading-tight text-cream md:text-[40px]"
                style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.85), 0 0 6px rgba(0, 0, 0, 0.6)" }}
                initial={paused || reducedMotion ? { opacity: 0 } : { y: 26, opacity: 0 }}
                animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={{ y: reducedMotion ? 0 : -26, opacity: 0 }}
                transition={paused ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
              >
                {time}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {label && <p className="text-[13px] text-cream/80">{label}</p>}
      </div>

      <motion.div className="absolute inset-0" animate={cut}>
        <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />
      </motion.div>

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
