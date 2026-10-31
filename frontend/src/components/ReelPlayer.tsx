import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause } from "lucide-react";
import { castById, castColor } from "../content";
import type { Reel } from "../content/types";

interface ReelPlayerProps {
  reel: Reel;
  active: boolean;
  paused: boolean;
  onTogglePause: () => void;
  onLoop: () => void;
}

export function ReelPlayer({ reel, active, paused, onTogglePause, onLoop }: ReelPlayerProps) {
  const reduceMotion = useReducedMotion();
  const [beatIndex, setBeatIndex] = useState(0);
  const [audioDurations, setAudioDurations] = useState<Record<number, number>>({});

  const durationsRef = useRef<number[]>([]);
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const loopedRef = useRef(false);

  const durations = reel.beats.map((beat, i) => audioDurations[i] ?? beat.durationMs);
  durationsRef.current = durations;

  // Beat length comes from the audio file's duration when it exists — no playback yet.
  useEffect(() => {
    let cancelled = false;
    reel.beats.forEach((beat, i) => {
      if (!beat.audioSrc) return;
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => {
        if (!cancelled && Number.isFinite(audio.duration) && audio.duration > 0) {
          setAudioDurations((prev) => ({ ...prev, [i]: audio.duration * 1000 }));
        }
      });
      audio.addEventListener("error", () => {
        /* audio not shipped yet — fall back to durationMs */
      });
      audio.src = beat.audioSrc;
    });
    return () => {
      cancelled = true;
    };
  }, [reel]);

  // Reels that leave the view pause and reset.
  useEffect(() => {
    if (active) return;
    cancelAnimationFrame(rafRef.current);
    elapsedRef.current = 0;
    loopedRef.current = false;
    setBeatIndex(0);
    segmentRefs.current.forEach((segment) => {
      if (segment) segment.style.transform = "scaleX(0)";
    });
  }, [active, reel.id]);

  // Single elapsed-time clock — pause/resume are exact.
  useEffect(() => {
    if (!active || paused) return;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;

      const durations = durationsRef.current;
      const total = durations.reduce((sum, ms) => sum + ms, 0);
      if (total > 0 && elapsedRef.current >= total) {
        elapsedRef.current = elapsedRef.current % total;
        if (!loopedRef.current) {
          loopedRef.current = true;
          onLoop();
        }
      }
      const elapsed = elapsedRef.current;

      let acc = 0;
      let index = 0;
      for (let i = 0; i < durations.length; i++) {
        const duration = durations[i];
        const segment = segmentRefs.current[i];
        if (segment) {
          const progress = Math.min(Math.max((elapsed - acc) / duration, 0), 1);
          segment.style.transform = `scaleX(${progress})`;
        }
        if (elapsed >= acc + duration) {
          acc += duration;
          index = i + 1;
        }
      }
      setBeatIndex((prev) => (prev === index ? prev : index));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, paused, reel.id, onLoop]);

  const beat = reel.beats[beatIndex] ?? reel.beats[0];
  const character = castById[beat?.characterId ?? ""];
  const color = castColor(beat?.characterId ?? "");
  const poseLabel = (beat?.pose ?? "")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <motion.div
      data-testid="reel-player"
      className="relative h-full w-full cursor-pointer select-none overflow-hidden"
      style={{ backgroundColor: color }}
      onClick={onTogglePause}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-3 pt-3" data-testid="beat-progress">
        {reel.beats.map((_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-black/20">
            <span
              ref={(el) => {
                segmentRefs.current[i] = el;
              }}
              className="block h-full w-full origin-left rounded-full bg-cream"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
        ))}
      </div>

      <motion.div
        key={beatIndex}
        data-testid="beat-content"
        className="relative z-[1] flex h-full flex-col items-center justify-center gap-4 px-8 text-center max-md:pr-20"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={reduceMotion ? { duration: 0.25 } : { type: "spring", stiffness: 320, damping: 24 }}
      >
        <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-cream backdrop-blur" data-testid="beat-character">
          {character?.name ?? "Unknown"}
        </span>
        <span className="text-xs font-semibold text-ink/60" data-testid="beat-pose">
          {poseLabel}
        </span>
        <p className="font-display text-2xl leading-snug text-ink" data-testid="beat-caption">
          {beat?.caption}
        </p>
      </motion.div>

      {paused && active && (
        <div className="absolute inset-0 z-[2] grid place-items-center" data-testid="pause-indicator">
          <span className="grid size-16 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur">
            <Pause className="size-7" fill="currentColor" />
          </span>
        </div>
      )}
    </motion.div>
  );
}
