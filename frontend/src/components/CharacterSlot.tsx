import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

interface CharacterSlotProps {
  characterId: string;
  pose: Pose;
  isSpeaking: boolean;
  /** Slot height as a percentage of the reel height, e.g. "60%". */
  height: string;
}

export function CharacterSlot({ characterId, pose, isSpeaking, height }: CharacterSlotProps) {
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

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { y: "10%", opacity: 0 },
        animate: { y: "0%", opacity: 1 },
        transition: { type: "spring" as const, stiffness: 260, damping: 24 },
      };
  const bob = reduceMotion
    ? undefined
    : {
        y: isSpeaking ? ["0%", "-1%", "0%"] : ["0%", "-2%", "0%"],
        transition: { duration: isSpeaking ? 0.8 : 2.5, repeat: Infinity, ease: "easeInOut" as const },
      };
  const squash = reduceMotion
    ? undefined
    : { initial: { scaleY: 0.94, scaleX: 1.04 }, transition: { type: "spring" as const, stiffness: 500, damping: 22 } };

  const shownPose: Pose =
    characterId === "reginald" && isSpeaking && !reduceMotion
      ? flip
        ? "talking"
        : "neutral"
      : pose;
  const frameIndex = Math.max(0, POSE_ORDER.indexOf(shownPose));

  if (characterId === "saurav") {
    // No sprite yet — a soft rounded placeholder in his colour.
    return (
      <motion.div
        data-testid="character-slot"
        data-character={characterId}
        className="grid aspect-[480/680] place-items-center rounded-3xl shadow-card"
        style={{ ...boxStyle(height, character.scale), backgroundColor: character.color }}
        {...slide}
      >
        <motion.div className="grid size-full place-items-center" animate={bob} key={pose}>
          <span className="font-display text-4xl text-ink/30">{character.name.slice(0, 1)}</span>
        </motion.div>
      </motion.div>
    );
  }

  const isWaist = character.framing === "waist";

  return (
    <div
      data-testid="character-slot"
      data-character={characterId}
      data-pose={shownPose}
      className="relative aspect-[480/680] overflow-hidden"
      style={boxStyle(height, character.scale)}
    >
      <motion.div className="absolute inset-0" style={{ transformOrigin: "bottom center" }} {...slide}>
        <motion.div className="absolute inset-0" animate={bob}>
          <motion.div
            key={pose}
            className="absolute inset-0"
            style={{ transformOrigin: "bottom center" }}
            initial={squash?.initial}
            animate={{ scaleY: 1, scaleX: 1 }}
            transition={squash?.transition}
          >
            <img
              src={`/cast/${characterId}.webp`}
              alt={character.name}
              draggable={false}
              className="absolute left-0 w-auto max-w-none"
              style={{
                height: isWaist ? "200%" : "100%",
                bottom: isWaist ? "auto" : 0,
                top: isWaist ? 0 : "auto",
                transform: `translateX(-${isWaist ? frameIndex * 12.5 + 3.125 : frameIndex * 12.5}%)`,
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function boxStyle(height: string, scale: number) {
  return { height: `calc(${height} * ${scale})` };
}
