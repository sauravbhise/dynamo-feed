import { motion, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { CharacterSlot } from "../components/CharacterSlot";
import { castById } from "../content";
import type { ReviewData } from "../content/types";
import { num, str, type TemplateProps } from "./registry";

export function ReviewTemplate({ reel, beat, beatIndex, progress, data, reducedMotion }: TemplateProps) {
  const reviewer = castById[beat.characterId];
  const stars = num(data.stars);
  const verdict = str(data.verdict);
  const starsOnThisBeat = typeof num(beat.data?.stars) === "number";
  const isLast = beatIndex === reel.beats.length - 1;
  const lines = reel.beats.slice(1, beatIndex + 1).map((b) => b.caption);

  // Stars fill one by one while their beat plays, then stay put.
  const fill = useTransform(
    progress,
    (p) => `${Math.min(p, 1) * (stars ?? 0) * 20}%`
  );

  return (
    <div className="absolute inset-0 flex flex-col items-center px-5 pb-16 pt-12 max-md:pr-20">
      <div className="w-full max-w-[300px] rounded-3xl bg-surface/90 p-5 shadow-card backdrop-blur" data-testid="review-card">
        <p className="font-display text-sm leading-snug text-cream">{reel.beats[0].caption}</p>

        {stars !== undefined && (
          <div className="relative mt-3 inline-flex" data-testid="review-stars">
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

        <ul className="mt-3 flex flex-col gap-2" data-testid="review-lines">
          {lines.map((line, i) => (
            <motion.li
              key={beatIndex + line}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -14 }}
              animate={{ opacity: i === lines.length - 1 ? 1 : 0.55, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs leading-relaxed text-cream"
            >
              {line}
            </motion.li>
          ))}
        </ul>
      </div>

      {verdict !== undefined && isLast && (
        <motion.div
          data-testid="review-verdict"
          className="mt-4 -rotate-12 rounded-xl border-[3px] border-[#D96A6A] px-3 py-1.5 font-display text-sm text-[#D96A6A]"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -28 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={reducedMotion ? { duration: 0.3 } : { type: "spring", stiffness: 320, damping: 18 }}
        >
          {verdict}
        </motion.div>
      )}

      <div className="absolute inset-y-0 left-3 z-[5] flex items-end">
        <div className="relative h-[40%]">
          <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking height="100%" />
          {reviewer && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-bold text-cream backdrop-blur">
              {reviewer.name} · {reviewer.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
