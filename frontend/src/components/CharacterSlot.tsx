import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { castById } from "../content";
import { useVoice } from "../audio/VoiceContext";
import { usePaused } from "./PausedContext";
import type { Pose } from "../content/types";

// Loudness above which Reginald's mouth opens (voice-driven talking).
const MOUTH_THRESHOLD = 0.3;

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

/**
 * Percent of the reel height where the character's head starts, measured from
 * the top. Top-zone cards must end above this line (with a small gap).
 */
export function headTopPercent(characterId: string, heightPercent: number): number {
  const character = castById[characterId];
  if (!character) return 100 - CAPTION_ZONE;
  const visible = heightPercent * character.scale;
  return character.framing === "waist" ? 100 - visible : 100 - CAPTION_ZONE - visible;
}

interface CharacterSlotProps {
  characterId: string;
  pose: Pose;
  isSpeaking: boolean;
  /** Visible character height (before scale), as a percentage of the reel height. */
  heightPercent: number;
  align?: "left" | "center" | "right";
}

export function CharacterSlot({
  characterId,
  pose,
  isSpeaking,
  heightPercent,
  align = "center",
}: CharacterSlotProps) {
  const character = castById[characterId];
  const reduceMotion = useReducedMotion();
  const paused = usePaused();
  const frozen = paused || reduceMotion;
  const [flip, setFlip] = useState(false);

  // Reginald alternates neutral/talking while he speaks — but only on beats
  // whose pose is neutral or talking. Any other pose (sceptical, pointing,
  // shocked, laughing, celebrating, thinking) holds for the whole beat.
  const flaps =
    characterId === "reginald" && isSpeaking && (pose === "neutral" || pose === "talking");

  // With a voice playing, the mouth follows the measured loudness instead of
  // the fixed timer.
  const voice = useVoice();
  const [voiceTalking, setVoiceTalking] = useState(false);
  useMotionValueEvent(voice.loudness, "change", (value) => {
    if (!voice.hasVoice) return;
    const talking = value > MOUTH_THRESHOLD;
    setVoiceTalking((prev) => (prev === talking ? prev : talking));
  });

  useEffect(() => {
    if (!flaps || voice.hasVoice || paused || reduceMotion) return;
    const timer = setInterval(() => setFlip((value) => !value), 180);
    return () => clearInterval(timer);
  }, [flaps, voice.hasVoice, paused, reduceMotion]);

  // A new beat or a speaking change starts from the beat's own pose.
  useEffect(() => {
    setFlip(false);
  }, [isSpeaking, pose]);

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
        // Centered characters shift left on mobile so the reserved action-rail
        // column on the right never covers their visible area.
        : { left: "50%", transform: "translateX(calc(-50% - var(--rail-inset, 0px) / 2))" };

  // Full characters stand on the ground line just above the caption zone;
  // waist characters (already cut at the waist in the sheet) sit flush on the
  // reel's bottom edge. Same box for both — no hanging below the reel.
  const rootStyle: CSSProperties = {
    height: `${alloc}%`,
    aspectRatio: "480 / 680",
    bottom: character.framing === "waist" ? "0%" : `${CAPTION_ZONE}%`,
    ...alignStyle,
  };

  const shownPose: Pose = !flaps
    ? pose
    : voice.hasVoice
      ? voiceTalking
        ? "talking"
        : "neutral"
      : reduceMotion
        ? pose
        : flip
          ? "talking"
          : "neutral";
  const frameIndex = Math.max(0, POSE_ORDER.indexOf(shownPose));

  // A small extra bob scaled by the voice loudness (everyone but Reginald,
  // whose mouth does the work) — zero without a voice.
  const voiceBob = useTransform(voice.loudness, (value) =>
    characterId === "reginald" ? 0 : -value * 5
  );

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
        initial={reduceMotion ? { opacity: 0 } : paused ? false : { y: "10%", opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: "0%", opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        {/* Idle/speaking bob as a CSS keyframe — freezes mid-motion on pause
            and resumes from the same point (framer's repeat kept replaying). */}
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: "bottom center",
            animation: reduceMotion
              ? undefined
              : `${isSpeaking ? "char-bob-speak" : "char-bob"} ${isSpeaking ? 0.8 : 2.5}s ease-in-out infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {/* A small extra bob scaled by the voice loudness (everyone but
              Reginald, whose mouth does the work) — zero without a voice. */}
          <motion.div className="absolute inset-0" style={{ y: voiceBob }}>
          <motion.div
            key={pose}
            className="absolute inset-0"
            style={{ transformOrigin: "bottom center" }}
            initial={frozen ? undefined : { scaleY: 0.94, scaleX: 1.04 }}
            animate={{ scaleY: 1, scaleX: 1 }}
            transition={frozen ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 22 }}
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
        </div>
      </motion.div>
    </div>
  );
}
