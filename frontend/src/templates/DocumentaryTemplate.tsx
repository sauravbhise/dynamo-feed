import { AnimatePresence, motion, useTransform } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelBackground } from "./ReelBackground";
import { str, type TemplateProps } from "./registry";

export function DocumentaryTemplate({ reel, beat, beatIndex, progress, data, reducedMotion }: TemplateProps) {
  const title = str(data.title);
  // Very slow zoom and pan on the scene, driven by the beat clock.
  const kenBurns = useTransform(
    progress,
    (p) => `scale(${(1.06 + 0.04 * p).toFixed(4)}) translateX(${(-2 * p).toFixed(3)}%)`
  );

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} style={reducedMotion ? undefined : { transform: kenBurns }} />

      <AnimatePresence>
        {title && beatIndex === 0 && (
          <motion.div
            key="title-card"
            className="absolute left-1/2 top-[8%] z-10 -translate-x-1/2 rounded-2xl bg-black/60 px-5 py-3 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.9 }}
            data-testid="doc-title"
          >
            <p className="font-display text-base text-cream">{title}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={46} />

      {/* Italic subtitle-style caption, inside the caption zone above the letterbox */}
      <div className="absolute inset-x-0 bottom-[10%] z-10 flex justify-center px-6" data-testid="doc-subtitle">
        <p className="max-w-[88%] rounded-xl bg-black/45 px-4 py-2 text-center text-sm italic leading-relaxed text-cream/95 backdrop-blur-sm">
          {beat.caption}
        </p>
      </div>

      {/* Letterbox bars */}
      <div className="absolute inset-x-0 top-0 z-20 h-[8%] bg-black" data-testid="letterbox-top" />
      <div className="absolute inset-x-0 bottom-0 z-20 h-[8%] bg-black" data-testid="letterbox-bottom" />
    </div>
  );
}
