import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground, backgroundCandidates } from "./ReelBackground";
import { castById, castColor, reels } from "../content";
import { str, type TemplateProps } from "./registry";
import type { Reel } from "../content/types";

const CHAR_HEIGHT = 40;

/** The PiP's mini background: the stitched reel's image chain over a colour floor. */
function PipBackground({ reel }: { reel: Reel }) {
  const candidates = backgroundCandidates(reel);
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  return (
    <div className="absolute inset-0" style={{ backgroundColor: castColor(reel.hostId) }}>
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          onError={() => setIndex((value) => value + 1)}
        />
      )}
    </div>
  );
}

/**
 * A TikTok-style Stitch: beat 1 IS the clip (its characterId is the original
 * speaker, played over the stitched reel's own background), then a hard cut
 * to the reply — with the clip kept as a tappable thumbnail.
 */
export function StitchTemplate({ reel, beat, beatIndex, data, reducedMotion }: TemplateProps) {
  const paused = usePaused();

  const stitchSlug = str(data.stitchSlug);
  const stitched = stitchSlug
    ? reels.find((candidate) => candidate.slug === stitchSlug)
    : undefined;
  const warnedRef = useRef(false);
  if (stitchSlug && !stitched && !warnedRef.current) {
    warnedRef.current = true;
    console.warn(
      `[content] stitch reel ${reel.slug}: stitchSlug "${stitchSlug}" matches no reel — the thumbnail won't link anywhere.`
    );
  }

  // Beat 1 IS the clip: its character is the original speaker.
  const clipSpeakerId = reel.beats[0].characterId;
  const clipSpeakerName = castById[clipSpeakerId]?.name ?? clipSpeakerId;
  const isClip = beatIndex === 0;

  return (
    <div className="absolute inset-0">
      {/* The clip beat plays over the STITCHED reel's own background. */}
      <ReelBackground reel={isClip ? (stitched ?? reel) : reel} />

      {isClip ? (
        <div
          data-testid="stitch-pill"
          className="absolute left-4 top-[4%] z-20 rounded-2xl bg-ink/70 px-4 py-2 backdrop-blur"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-sage">Stitch</p>
          <p className="text-xs font-bold text-cream">@{clipSpeakerName}</p>
        </div>
      ) : (
        <>
          {/* The cut: a 120ms white flash as beat 2 starts (skipped with
              reduced motion). */}
          {beatIndex === 1 && !reducedMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-30 bg-white"
              initial={paused ? { opacity: 0 } : { opacity: 0.25 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "linear" }}
            />
          )}

          {/* Picture-in-picture of the original clip — tapping jumps the feed
              to it (stopping the tap from pausing or liking the reel). */}
          <button
            type="button"
            data-testid="stitch-pip"
            aria-label={`Watch the original reel from ${clipSpeakerName}`}
            onClick={(event) => {
              event.stopPropagation();
              if (!stitched) return;
              window.dispatchEvent(
                new CustomEvent<string>("dynamo:goto-reel", { detail: stitched.slug })
              );
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute left-3 top-[4%] z-20 block w-[26%] overflow-hidden rounded-xl ring-1 ring-white/20"
          >
            <div className="relative aspect-[9/16] w-full">
              {stitched && <PipBackground reel={stitched} />}
              <div
                className="absolute bottom-0 left-1/2 h-[78%] -translate-x-1/2"
                style={{ aspectRatio: "480 / 680" }}
              >
                <img
                  src={`/cast/${clipSpeakerId}.webp`}
                  alt=""
                  draggable={false}
                  className="absolute bottom-0 left-0 h-full w-[800%] max-w-none"
                  style={{ transform: "translateX(0)" }}
                />
              </div>
              <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-bold text-cream drop-shadow">
                @{clipSpeakerName}
              </span>
            </div>
          </button>
        </>
      )}

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={CHAR_HEIGHT} />

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
