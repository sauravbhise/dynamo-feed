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

/** Percent of the reel height reserved for captions — characters stand on top of it. */
export const CAPTION_ZONE = 22;

interface CharacterSlotProps {
  characterId: string;
  pose: Pose;
  isSpeaking: boolean;
  /** Freezes the idle motion while the reel is paused. */
  paused?: boolean;
  /** Visible character height (before scale), as a percentage of the reel height. */
  heightPercent: number;
  align?: "left" | "center" | "right";
}

export function CharacterSlot({
  characterId,
  pose,
  isSpeaking,
  paused = false,
  heightPercent,
  align = "center",
}: CharacterSlotProps) {
  const character = castById[characterId];
  const reduceMotion = useReducedMotion();
  const [flip, setFlip] = useState(false);

  // Reginald alternates neutral/talking every 180ms while he speaks.
  useEffect(() => {
    if (characterId !== "reginald" || !isSpeaking || paused || reduceMotion) return;
    const timer = setInterval(() => setFlip((value) => !value), 180);
    return () => clearInterval(timer);
  }, [characterId, isSpeaking, paused, reduceMotion]);

  useEffect(() => {
    if (!isSpeaking) setFlip(false);
  }, [isSpeaking]);

  if (!character) return null;

  // heightPercent is the height of the VISIBLE character; each frame has empty
  // headroom above the drawing, so the box grows to compensate for it.
  const headroom = character.headroom;
  const alloc = (heightPercent * character.scale) / (1 - headroom);

  const alignStyle: CSSProperties =
    align === "left"
      ? { left: 16 }
      : align === "right"
        ? { right: 16 }
        : { left: "50%", transform: "translateX(-50%)" };

  // Full characters stand on the ground line just above the caption zone;
  // waist characters (already cut at the waist in the sheet) sit flush on the
  // reel's bottom edge. Same box for both — no hanging below the reel.
  const rootStyle: CSSProperties = {
    height: `${alloc}%`,
    aspectRatio: "480 / 680",
    bottom: character.framing === "waist" ? "0%" : `${CAPTION_ZONE}%`,
    ...alignStyle,
  };

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
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "bottom center" }}
        initial={reduceMotion ? { opacity: 0 } : { y: "10%", opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: "0%", opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "bottom center" }}
          animate={
            paused || reduceMotion
              ? { y: "0%" }
              : { y: isSpeaking ? ["0%", "-1%", "0%"] : ["0%", "-2%", "0%"] }
          }
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
