import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { castById } from "../content";
import type { Pose } from "../content/types";

const POSE_ORDER: Pose[] = [
  "neutral",
  "talking",
  "pointing",
  "shocked",
  "laughing",
  "sceptical",
  "celebrating",
  "thinking",
];

/** Percent of the reel height reserved for captions — full characters stand on top of it. */
export const CAPTION_ZONE = 22;

interface CharacterSlotProps {
  characterId: string;
  pose: Pose;
  isSpeaking: boolean;
  /** Box height before scale, as a percentage of the reel height (45–55). */
  heightPercent: number;
}

export function CharacterSlot({ characterId, pose, isSpeaking, heightPercent }: CharacterSlotProps) {
  const character = castById[characterId];
  const reduceMotion = useReducedMotion();
  const [flip, setFlip] = useState(false);

  // Reginald alternates neutral/talking every 180ms while he speaks.
  useEffect(() => {
    if (characterId !== "reginald" || !isSpeaking || reduceMotion) return;
    const timer = setInterval(() => setFlip((value) => !value), 180);
    return () => clearInterval(timer);
  }, [characterId, isSpeaking, reduceMotion]);

  useEffect(() => {
    if (!isSpeaking) setFlip(false);
  }, [isSpeaking]);

  if (!character) return null;

  const isWaist = character.framing === "waist";
  const alloc = heightPercent * character.scale;

  const rootStyle: CSSProperties = {
    height: `${alloc}%`,
    aspectRatio: "480 / 680",
    left: 16,
    bottom: isWaist ? "0%" : `${CAPTION_ZONE}%`,
  };

  // The sheet never changes height — the box does. A waist box is scaled up
  // and hangs below the reel's bottom edge, so the reel clips it waist-up.
  const boxStyle: CSSProperties = isWaist
    ? { top: 0, left: "-50%", width: "200%", height: "200%" }
    : { inset: 0 };

  const shownPose: Pose =
    characterId === "reginald" && isSpeaking && !reduceMotion
      ? flip
        ? "talking"
        : "neutral"
      : pose;
  const frameIndex = Math.max(0, POSE_ORDER.indexOf(shownPose));

  return (
    <div
      data-testid="character-slot"
      data-character={characterId}
      data-pose={shownPose}
      className="absolute z-[5]"
      style={rootStyle}
    >
      <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-cream backdrop-blur" data-testid="character-chip">
        {character.name} · {character.role}
      </span>
      <motion.div
        className="absolute"
        style={{ ...boxStyle, transformOrigin: "bottom center" }}
        initial={reduceMotion ? { opacity: 0 } : { y: "10%", opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: "0%", opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "bottom center" }}
          animate={reduceMotion ? undefined : { y: isSpeaking ? ["0%", "-1%", "0%"] : ["0%", "-2%", "0%"] }}
          transition={{ duration: isSpeaking ? 0.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            key={pose}
            className="absolute inset-0"
            style={{ transformOrigin: "bottom center" }}
            initial={reduceMotion ? undefined : { scaleY: 0.94, scaleX: 1.04 }}
            animate={{ scaleY: 1, scaleX: 1 }}
            transition={reduceMotion ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 22 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              {characterId === "saurav" ? (
                <div className="grid h-full w-full place-items-center rounded-3xl" style={{ backgroundColor: character.color }} data-testid="character-placeholder">
                  <span className="font-display text-4xl text-ink/30">{character.name.slice(0, 1)}</span>
                </div>
              ) : (
                <img
                  src={`/cast/${characterId}.webp`}
                  alt={character.name}
                  draggable={false}
                  className="absolute bottom-0 left-0 h-full w-[800%] max-w-none"
                  style={{ transform: `translateX(-${frameIndex * 12.5}%)` }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
