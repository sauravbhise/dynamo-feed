import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Pause } from "lucide-react";
import { TEMPLATES } from "../templates/registry";
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
  const beatProgress = useMotionValue(0);
  const reelProgress = useMotionValue(0);
  const [audioDurations, setAudioDurations] = useState<Record<number, number>>({});

  const durationsRef = useRef<number[]>([]);
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
    beatProgress.set(0);
    reelProgress.set(0);
  }, [active, reel.id, beatProgress, reelProgress]);

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

      // One continuous bar across the whole reel; resets to 0 on loop.
      reelProgress.set(total > 0 ? Math.min(elapsed / total, 1) : 0);

      // Per-beat progress for the template.
      let acc = 0;
      let index = 0;
      for (let i = 0; i < durations.length; i++) {
        if (elapsed >= acc + durations[i]) {
          acc += durations[i];
          index = i + 1;
        }
      }
      beatProgress.set(Math.min(Math.max((elapsed - acc) / (durations[index] ?? 1), 0), 1));
      setBeatIndex((prev) => (prev === index ? prev : index));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, paused, reel.id, onLoop, beatProgress, reelProgress]);

  // The current beat plus every earlier beat's extras stay in effect.
  const beat = reel.beats[beatIndex] ?? reel.beats[0];
  const effectiveData = useMemo(() => {
    const acc: Record<string, unknown> = {};
    for (let i = 0; i <= beatIndex && i < reel.beats.length; i++) {
      Object.assign(acc, reel.beats[i].data ?? {});
    }
    return acc;
  }, [reel, beatIndex]);

  const Template = TEMPLATES[reel.template];

  return (
    <div
      data-testid="reel-player"
      className="relative h-full w-full cursor-pointer select-none overflow-hidden"
      onClick={onTogglePause}
    >
      <Template
        reel={reel}
        beat={beat}
        beatIndex={beatIndex}
        progress={beatProgress}
        data={effectiveData}
        reducedMotion={!!reduceMotion}
      />

      {/* One continuous thin bar along the bottom edge of the reel */}
      <div className="absolute inset-x-0 bottom-0 z-30 h-1 bg-white/20" data-testid="reel-progress">
        <motion.span className="block h-full w-full origin-left bg-cream" style={{ scaleX: reelProgress }} />
      </div>

      {paused && active && (
        <div className="absolute inset-0 z-40 grid place-items-center" data-testid="pause-indicator">
          <span className="grid size-16 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur">
            <Pause className="size-7" fill="currentColor" />
          </span>
        </div>
      )}
    </div>
  );
}
