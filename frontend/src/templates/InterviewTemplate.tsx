import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
import { str, type TemplateProps } from "./registry";

const CHAR_HEIGHT = 32;

/** Below md the action rail sits inside the frame on the right — the
    two-shot shrinks so both characters clear it. */
function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => setIsPhone(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isPhone;
}

/** A talk-show two-shot: the host (reel.hostId) on the left, the guest on the right. */
export function InterviewTemplate({ reel, beat, data, reducedMotion }: TemplateProps) {
  const paused = usePaused();
  const charHeight = useIsPhone() ? 28 : CHAR_HEIGHT;

  // Guest + topic come from beat 1's data, read from the accumulated extras
  // like every other template.
  const guestId = str(data.guest);
  const topic = str(data.topic);
  const guestValid = !!guestId && !!castById[guestId];
  const warnedRef = useRef(false);
  if (!guestValid && !warnedRef.current) {
    warnedRef.current = true;
    console.warn(
      `[content] interview reel ${reel.slug}: guest "${guestId ?? "missing"}" is missing or not in the cast — single-character fallback.`
    );
  }

  const speakerIsHost = !guestValid || beat.characterId !== guestId;

  // The speaker is full and lit, the listener dimmed and slightly smaller —
  // easing ~200ms when the speaker changes. Paused: jump straight to the
  // state (frozen). Reduced motion: opacity only.
  const speakerState = (speaking: boolean) =>
    reducedMotion
      ? { opacity: speaking ? 1 : 0.7 }
      : { opacity: speaking ? 1 : 0.7, scale: speaking ? 1 : 0.96 };
  const speakerTransition = paused
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {/* Topic pill, top-centred */}
      {topic && (
        <div
          className="absolute left-1/2 top-[4%] z-10 max-w-[80%] -translate-x-1/2 rounded-2xl bg-ink/70 px-4 py-2.5 text-center backdrop-blur"
          data-testid="interview-topic"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-sage">The interview</p>
          <p className="mt-0.5 line-clamp-2 text-xs font-bold text-cream">{topic}</p>
        </div>
      )}

      {guestValid ? (
        <>
          {/* Host on the left, guest on the right — the full-frame wrappers
              carry the speaker styling (their transparent sprite boxes may
              overlap; the drawings sit at opposite edges). */}
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: "bottom center" }}
            initial={false}
            animate={speakerState(speakerIsHost)}
            transition={speakerTransition}
            data-testid="interview-host"
          >
            <CharacterSlot
              characterId={reel.hostId}
              pose={speakerIsHost ? beat.pose : "neutral"}
              isSpeaking={speakerIsHost}
              heightPercent={charHeight}
              align="left"
            />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: "bottom center" }}
            initial={false}
            animate={speakerState(!speakerIsHost)}
            transition={speakerTransition}
            data-testid="interview-guest"
          >
            <CharacterSlot
              characterId={guestId}
              pose={speakerIsHost ? "neutral" : beat.pose}
              isSpeaking={!speakerIsHost}
              heightPercent={charHeight}
              align="right"
            />
          </motion.div>
        </>
      ) : (
        <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />
      )}

      {/* Caption zone: the speaker's name + the line */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
