import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Heart, Pause } from "lucide-react";
import { TEMPLATES } from "../templates/registry";
import { beatDurationMs } from "../content";
import { autoReelsFresh } from "../feed/autoReels";
import { audioSrcFor, connectAnalyser, readLoudness } from "../audio/engine";
import { useSound } from "../audio/SoundContext";
import { VoiceProvider } from "../audio/VoiceContext";
import { LiveCommentsProvider } from "./LiveCommentsContext";
import { PausedProvider } from "./PausedContext";
import type { Reel } from "../content/types";

const BURST_HEARTS = [
  { angle: 0, distance: 52, size: 18 },
  { angle: Math.PI / 4, distance: 44, size: 14 },
  { angle: Math.PI / 2, distance: 56, size: 20 },
  { angle: (3 * Math.PI) / 4, distance: 44, size: 14 },
  { angle: Math.PI, distance: 52, size: 18 },
  { angle: (5 * Math.PI) / 4, distance: 46, size: 13 },
  { angle: (3 * Math.PI) / 2, distance: 58, size: 21 },
  { angle: (7 * Math.PI) / 4, distance: 46, size: 13 },
];

interface ReelPlayerProps {
  reel: Reel;
  active: boolean;
  paused: boolean;
  onTogglePause: () => void;
  onLoop: () => void;
  onDoubleTap?: () => void;
  /** Comments sheet open or the swipe hint showing — the lane waits. */
  commentsSuppressed?: boolean;
  onOpenComments?: () => void;
}

export function ReelPlayer({
  reel,
  active,
  paused,
  onTogglePause,
  onLoop,
  onDoubleTap,
  commentsSuppressed,
  onOpenComments,
}: ReelPlayerProps) {
  const reduceMotion = useReducedMotion();
  const reelProgress = useMotionValue(0);
  const [audioDurations, setAudioDurations] = useState<Record<number, number>>({});
  const { soundOn, manifest } = useSound();
  const [loopEpoch, setLoopEpoch] = useState(0);

  // A beat has audio only when its {slug}:{beatIndex} key is in the manifest.
  const audioSrcs = useMemo(
    () => reel.beats.map((_, i) => audioSrcFor(manifest, reel.slug, i)),
    [reel, manifest]
  );

  // Beat lengths: computed from captions (see beatDurationMs). With sound on,
  // a beat with audio lasts the audio duration plus 300 ms — or the reading
  // time when that is longer. Sound off: exactly the reading time.
  const durations = useMemo(
    () =>
      reel.beats.map((beat, i) => {
        const reading = beatDurationMs(beat, reel.template);
        if (!soundOn) return reading;
        const audioMs = audioDurations[i];
        return audioMs ? Math.max(audioMs + 300, reading) : reading;
      }),
    [reel, audioDurations, soundOn]
  );
  const starts = useMemo(() => {
    let acc = 0;
    return durations.map((ms) => {
      const start = acc;
      acc += ms;
      return start;
    });
  }, [durations]);
  const total = durations.reduce((sum, ms) => sum + ms, 0);

  const totalRef = useRef(total);
  totalRef.current = total;
  const startsRef = useRef(starts);
  startsRef.current = starts;

  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const loopedRef = useRef(false);

  // ONE unit of state for the beat — changes only when the beat changes.
  const [beatState, setBeatState] = useState({ index: 0, startedAtMs: 0 });

  const beatFromElapsed = (elapsed: number) => {
    let index = 0;
    for (let i = 0; i < startsRef.current.length; i++) {
      if (elapsed >= startsRef.current[i]) index = i;
      else break;
    }
    return { index, startedAtMs: startsRef.current[index] ?? 0 };
  };

  // The beat index follows the reel progress. Every template listener fires
  // from this same publication point, so React batches index and progress
  // derived state into ONE consistent render — no skew frame.
  useMotionValueEvent(reelProgress, "change", (rp) => {
    const { index, startedAtMs } = beatFromElapsed(rp * totalRef.current);
    setBeatState((prev) => (prev.index === index ? prev : { index, startedAtMs }));
  });

  // Per-beat progress is DERIVED from elapsed time — it can never disagree
  // with the beat index and resets to 0 automatically on every beat change.
  // The transformer reads durations through a REF so its identity never
  // changes: framer recomputes a changed transformer during the render that
  // changed it and emits 'change' mid-render, which React reports as
  // "Cannot update a component (template) while rendering (ReelPlayer)".
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  const beatProgress = useTransform(reelProgress, (rp) => {
    const elapsed = rp * totalRef.current;
    const { index, startedAtMs } = beatFromElapsed(elapsed);
    return Math.min(Math.max((elapsed - startedAtMs) / (durationsRef.current[index] ?? 1), 0), 1);
  });

  // ---- Voice playback + loudness ------------------------------------------
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const smoothRef = useRef(0);
  const loudness = useMotionValue(0);

  // With sound on, each beat's file length decides the beat length — load the
  // metadata once per reel. A failed file simply never sets a duration, so the
  // reading time covers that beat silently.
  useEffect(() => {
    if (!soundOn) {
      setAudioDurations({});
      return;
    }
    let cancelled = false;
    audioSrcs.forEach((src, i) => {
      if (!src) return;
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => {
        if (!cancelled && Number.isFinite(audio.duration) && audio.duration > 0) {
          setAudioDurations((prev) => ({ ...prev, [i]: audio.duration * 1000 }));
        }
      });
      audio.addEventListener("error", () => {
        /* file failed — fall back silently to reading-time timing */
      });
      audio.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [audioSrcs, soundOn]);

  const ensureAudio = useCallback(
    (src: string): HTMLAudioElement => {
      if (audioRef.current?.dataset.src === src) return audioRef.current;
      const element = new Audio(src);
      element.preload = "auto";
      element.dataset.src = src;
      analyserRef.current = connectAnalyser(element);
      audioRef.current = element;
      return element;
    },
    []
  );

  // The beat's audio always sits at the elapsed position: a fresh beat starts
  // at zero, a resumed beat continues exactly where the clock stopped. Looping
  // restarts the audio via loopEpoch; scrolling away (active=false) stops it.
  useEffect(() => {
    const src = audioSrcs[beatState.index];
    if (!active || paused || !soundOn || !src) {
      audioRef.current?.pause();
      loudness.set(0);
      smoothRef.current = 0;
      return;
    }
    const element = ensureAudio(src);
    const offset = Math.max(
      0,
      (elapsedRef.current - (startsRef.current[beatState.index] ?? 0)) / 1000
    );
    const start = () => {
      if (element.duration > 0 && Math.abs(element.currentTime - offset) > 0.05) {
        element.currentTime = offset;
      }
      void element.play().catch(() => {
        /* file failed or playback blocked — silent fallback */
        loudness.set(0);
      });
    };
    if (element.duration > 0 || element.readyState >= 2) start();
    else element.addEventListener("loadedmetadata", start, { once: true });
    return () => {
      element.pause();
    };
  }, [audioSrcs, beatState.index, active, paused, soundOn, loopEpoch, ensureAudio, loudness]);

  // Reels that leave the view pause and reset — index first, then progress.
  useEffect(() => {
    if (active) return;
    cancelAnimationFrame(rafRef.current);
    elapsedRef.current = 0;
    loopedRef.current = false;
    setBeatState({ index: 0, startedAtMs: 0 });
    reelProgress.set(0);
  }, [active, reel.id, reelProgress]);

  // Single elapsed-time clock — pause/resume are exact.
  useEffect(() => {
    if (!active || paused) return;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;

      const total = totalRef.current;
      if (total > 0 && elapsedRef.current >= total) {
        elapsedRef.current = elapsedRef.current % total;
        if (!loopedRef.current) {
          loopedRef.current = true;
          onLoop();
        }
        // Every wrap restarts the beat audio (see the playback effect).
        setLoopEpoch((epoch) => epoch + 1);
      }

      // Voice loudness feeds the mouths — sampled on the same clock.
      const analyser = analyserRef.current;
      if (soundOn && analyser) {
        smoothRef.current += (readLoudness(analyser) - smoothRef.current) * 0.35;
        loudness.set(smoothRef.current);
      }

      // The ONLY publication point: reel progress drives the beat index and
      // every derived progress value in the same tick.
      reelProgress.set(total > 0 ? Math.min(elapsedRef.current / total, 1) : 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, paused, reel.id, onLoop, reelProgress, soundOn, loudness]);

  // The current beat plus every earlier beat's extras stay in effect.
  const beat = reel.beats[beatState.index] ?? reel.beats[0];
  const effectiveData = useMemo(() => {
    const acc: Record<string, unknown> = {};
    for (let i = 0; i <= beatState.index && i < reel.beats.length; i++) {
      Object.assign(acc, reel.beats[i].data ?? {});
    }
    return acc;
  }, [reel, beatState.index]);

  // Live cast comments: one lane fed from the same progress value that drives
  // the beats — nothing during beat 1, then one at a time.
  const beat1End = starts.length > 1 ? starts[1] / total : 1;
  const liveComments = useMemo(
    () => ({
      comments: reel.comments,
      template: reel.template,
      active,
      suppressed: !!commentsSuppressed,
      progress: reelProgress,
      beat1End,
      reelTotalMs: total,
      onOpenComments: () => onOpenComments?.(),
    }),
    [reel, active, commentsSuppressed, reelProgress, beat1End, total, onOpenComments]
  );

  // Engagement: double-tap likes with a heart burst; single tap pauses.
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const tapTimer = useRef<number | null>(null);

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (tapTimer.current !== null) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      const rect = event.currentTarget.getBoundingClientRect();
      setBurst({ id: Date.now(), x: event.clientX - rect.left, y: event.clientY - rect.top });
      onDoubleTap?.();
      return;
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      onTogglePause();
    }, 240);
  };

  useEffect(
    () => () => {
      if (tapTimer.current !== null) window.clearTimeout(tapTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(null), 900);
    return () => window.clearTimeout(timer);
  }, [burst]);

  const Template = TEMPLATES[reel.template];

  return (
    <div
      data-testid="reel-player"
      className="relative h-full w-full cursor-pointer select-none overflow-hidden"
      onClick={handleClick}
    >
      <PausedProvider paused={paused && active}>
        <VoiceProvider
          value={{
            loudness,
            hasVoice: active && soundOn && !!audioSrcs[beatState.index],
          }}
        >
          <LiveCommentsProvider value={liveComments}>
            <Template
              reel={reel}
              beat={beat}
              beatIndex={beatState.index}
              progress={beatProgress}
              data={effectiveData}
              reducedMotion={!!reduceMotion}
              active={active}
            />
          </LiveCommentsProvider>
        </VoiceProvider>
      </PausedProvider>

      {/* Auto-generated reels carry a small "New" chip while now.json is fresh */}
      {reel.auto && autoReelsFresh && (
        <span
          className="absolute right-3 top-3 z-30 rounded-full bg-sage px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-sage-deep shadow-soft"
          data-testid="reel-new-chip"
        >
          New
        </span>
      )}

      {/* Heart burst where the visitor double-tapped */}
      {burst && (
        <div
          key={burst.id}
          className="pointer-events-none absolute z-40"
          style={{ left: burst.x, top: burst.y }}
          data-testid="like-burst"
        >
          {BURST_HEARTS.map((heart, i) => (
            <motion.span
              key={i}
              className="absolute block text-[#D96A6A]"
              style={{
                width: heart.size,
                height: heart.size,
                marginLeft: -heart.size / 2,
                marginTop: -heart.size / 2,
              }}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
              animate={{
                x: Math.cos(heart.angle) * heart.distance,
                y: Math.sin(heart.angle) * heart.distance,
                scale: 1.2,
                opacity: 0,
              }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            >
              <Heart style={{ width: "100%", height: "100%" }} fill="currentColor" />
            </motion.span>
          ))}
        </div>
      )}

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
