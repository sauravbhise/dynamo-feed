import { motion, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { castById } from "../content";
import { num, str, type TemplateProps } from "./registry";

export function ReviewTemplate({ reel, beat, beatIndex, progress, data, reducedMotion, paused }: TemplateProps) {
  const stars = num(data.stars);
  const verdict = str(data.verdict);
  const starsOnThisBeat = typeof num(beat.data?.stars) === "number";
  const isLast = beatIndex === reel.beats.length - 1;
  const lines = reel.beats.slice(1, beatIndex + 1).slice(-2);

  // Stars fill one by one while their beat plays, then stay put.
  const fill = useTransform(progress, (p) => `${Math.min(p, 1) * (stars ?? 0) * 20}%`);

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-x-3 top-[3%] rounded-3xl bg-surface/90 p-4 shadow-card backdrop-blur"
        data-testid="review-card"
      >
        <p className="font-display text-sm leading-snug text-cream">{reel.beats[0].caption}</p>

        {stars !== undefined && (
          <div className="relative mt-2.5 inline-flex" data-testid="review-stars">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-6 text-cream/20" />
              ))}
            </div>
            <motion.div
              className="absolute inset-0 flex gap-0.5 overflow-hidden"
              style={starsOnThisBeat ? { width: fill } : { width: `${stars * 20}%` }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-6 shrink-0 text-cast-marge" fill="currentColor" />
              ))}
            </motion.div>
          </div>
        )}

        <ul className="mt-2.5 flex flex-col gap-1.5" data-testid="review-lines">
          {lines.map((line, i) => (
            <motion.li
              key={line.caption}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              animate={{ opacity: i === lines.length - 1 ? 1 : 0.55, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] leading-snug text-cream"
            >
              {line.caption}
            </motion.li>
          ))}
        </ul>

        {verdict !== undefined && isLast && (
          <motion.div
            data-testid="review-verdict"
            className="absolute -bottom-4 right-4 -rotate-12 rounded-xl border-2 border-[#D96A6A] bg-surface px-3 py-1 font-display text-sm text-[#D96A6A]"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -28 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={reducedMotion ? { duration: 0.3 } : { type: "spring", stiffness: 320, damping: 18 }}
          >
            {verdict}
          </motion.div>
        )}
      </div>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking paused={paused} heightPercent={40} />

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
