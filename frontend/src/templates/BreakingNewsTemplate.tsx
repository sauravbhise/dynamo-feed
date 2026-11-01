import { motion } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { str, type TemplateProps } from "./registry";

export function BreakingNewsTemplate({ reel, beat, beatIndex, data, reducedMotion }: TemplateProps) {
  const headline = str(data.headline) ?? reel.beats[0].caption;
  const ticker = str(data.ticker);

  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute left-4 top-[4%] z-10"
        initial={reducedMotion ? { opacity: 0 } : { y: -48, opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
        data-testid="breaking-banner"
      >
        <span className="rounded-lg bg-[#D96A6A] px-3 py-1 font-display text-sm text-white shadow-soft">
          Breaking
        </span>
      </motion.div>

      {/* Each beat's caption as the spoken line, above the lower-third and clear of the character */}
      <div className="absolute right-4 bottom-[26%] z-10 ml-auto w-[44%]" data-testid="spoken-line">
        <motion.div
          key={beatIndex}
          className="rounded-2xl rounded-br-md bg-ink/75 px-4 py-2.5 text-sm leading-snug text-cream backdrop-blur"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 24 }}
        >
          {beat.caption}
        </motion.div>
      </div>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={46} />

      {/* Lower-third headline bar, above the ticker */}
      <motion.div
        className="absolute inset-x-3 bottom-9 z-10 flex items-center gap-3 rounded-2xl bg-ink/85 px-4 py-3 backdrop-blur"
        initial={reducedMotion ? { opacity: 0 } : { x: "-30%", opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.25 }}
        data-testid="lower-third"
      >
        <span className="shrink-0 rounded bg-[#D96A6A] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
          Live
        </span>
        <p className="font-display text-sm leading-snug text-cream">{headline}</p>
      </motion.div>

      {/* Ticker scrolls along the bottom on loop, badge-free */}
      {ticker && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex overflow-hidden bg-ink/90 py-1.5" data-testid="news-ticker">
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
