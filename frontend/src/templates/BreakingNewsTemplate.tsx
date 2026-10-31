import { motion } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { str, type TemplateProps } from "./registry";

export function BreakingNewsTemplate({ reel, beat, data, reducedMotion }: TemplateProps) {
  const headline = str(data.headline) ?? reel.beats[0].caption;
  const ticker = str(data.ticker);

  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute left-4 top-10 z-10"
        initial={reducedMotion ? { opacity: 0 } : { y: -48, opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
        data-testid="breaking-banner"
      >
        <span className="rounded-lg bg-[#D96A6A] px-3 py-1 font-display text-sm text-white shadow-soft">
          Breaking
        </span>
      </motion.div>

      {/* The character reacts at the side, above the ticker */}
      <div className="absolute inset-y-0 left-3 z-[5] flex items-end pb-8">
        <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking height="58%" />
      </div>

      <motion.div
        className="absolute inset-x-3 bottom-9 z-10 rounded-2xl bg-ink/85 px-4 py-3 backdrop-blur"
        initial={reducedMotion ? { opacity: 0 } : { x: "-30%", opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.25 }}
        data-testid="lower-third"
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#D96A6A]">Breaking news</p>
        <p className="mt-0.5 font-display text-sm leading-snug text-cream">{headline}</p>
      </motion.div>

      {ticker && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 overflow-hidden bg-ink/90 py-1.5" data-testid="news-ticker">
          <span className="ml-2 shrink-0 rounded bg-[#D96A6A] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
            LIVE
          </span>
          <div className="flex w-max animate-ticker motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <span key={copy} aria-hidden={copy === 1} className="whitespace-nowrap pr-8 text-xs font-semibold text-cream/90">
                {ticker}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
