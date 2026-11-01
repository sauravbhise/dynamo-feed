import { motion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Star } from "lucide-react";
import { CharacterSlot, headTopPercent } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { castById } from "../content";
import { num, str, type TemplateProps } from "./registry";

const CHAR_HEIGHT = 40;

/** One star, filled by a 0–1 fraction (a half star shows as a clipped fill). */
function ReviewStar({ filled, index }: { filled: MotionValue<number>; index: number }) {
  const width = useTransform(filled, (f) => `${Math.min(Math.max(f - index, 0), 1) * 100}%`);
  return (
    <span className="relative inline-block size-6">
      <Star className="size-6 text-cream/20" />
      <motion.span className="absolute inset-0 overflow-hidden" style={{ width }}>
        <Star className="size-6 shrink-0 text-cast-marge" fill="currentColor" />
      </motion.span>
    </span>
  );
}

export function ReviewTemplate({ reel, beat, beatIndex, progress, data, reducedMotion, active }: TemplateProps) {
  const paused = usePaused();
  const stars = num(data.stars);
  const verdict = str(data.verdict);
  const starsOnThisBeat = typeof num(beat.data?.stars) === "number";
  const isLast = beatIndex === reel.beats.length - 1;
  const lines = reel.beats.slice(1, beatIndex + 1).slice(-2);

  // The card may never grow down over the character's head.
  const headTop = headTopPercent(beat.characterId, CHAR_HEIGHT);

  // Star i is filled by clamp(stars − i, 0, 1): the stars sweep in one by one
  // while their beat plays, and show complete (e.g. 3.5) on later beats.
  const filled = useTransform(progress, (p) => (starsOnThisBeat ? Math.min(p, 1) : 1) * (stars ?? 0));

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-x-3 top-[3%] z-10 flex flex-col overflow-hidden"
        style={{ maxHeight: `${Math.max(headTop - 5, 18)}%` }}
      >
        <div
          className="relative flex min-h-0 flex-col rounded-3xl bg-surface/90 p-4 shadow-card backdrop-blur"
          data-testid="review-card"
        >
          {/* Verdict stamp inside the card bounds so overflow never clips it */}
          {verdict !== undefined && isLast && (
            <motion.div
              data-testid="review-verdict"
              className="absolute right-2 top-2 z-10 -rotate-12 rounded-xl border-2 border-[#D96A6A] bg-surface px-3 py-1 font-display text-sm text-[#D96A6A]"
              initial={paused || reducedMotion ? false : { opacity: 0, scale: 1.7, rotate: -28 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              transition={reducedMotion ? { duration: 0.3 } : { type: "spring", stiffness: 320, damping: 18 }}
            >
              {verdict}
            </motion.div>
          )}

          <p className="shrink-0 pr-24 font-display text-sm leading-snug text-cream">{reel.beats[0].caption}</p>

          {stars !== undefined && (
            <div className="mt-2.5 flex shrink-0 gap-0.5" data-testid="review-stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <ReviewStar key={i} filled={filled} index={i} />
              ))}
            </div>
          )}

          {/* Only the latest lines show; older ones fade and the list clips rather than grow */}
          <ul className="mt-2.5 flex min-h-0 flex-col gap-1.5 overflow-hidden" data-testid="review-lines">
            {lines.map((line, i) => (
              <motion.li
                key={line.caption}
                initial={paused || reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: i === lines.length - 1 ? 1 : 0.55, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[13px] leading-snug text-cream"
              >
                {line.caption}
              </motion.li>
            ))}
          </ul>
        </div>
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
