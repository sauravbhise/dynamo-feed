import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { castById } from "../content";
import type { Reel } from "../content/types";

// One check per src per session — adding a file is the only step needed.
const checked = new Map<string, boolean>();

interface ReelBackgroundProps {
  reel: Reel;
  /** Extra style for the image layer, e.g. a slow Ken Burns transform. */
  style?: MotionStyle;
}

/** A reel's background image candidates, in priority order. */
export function backgroundCandidates(reel: Reel): string[] {
  return [reel.background, `/backgrounds/${reel.template}.webp`].filter(
    (src): src is string => typeof src === "string"
  );
}

export function ReelBackground({ reel, style }: ReelBackgroundProps) {
  const host = castById[reel.hostId];
  const color = host?.color ?? "#A9BED6";
  // Priority: the reel's own background → the template's → the colour
  // gradient. Each step is probed only if the previous image fails.
  const srcs = backgroundCandidates(reel);
  const srcKey = srcs.join("|");
  const [bgSrc, setBgSrc] = useState<string | null>(
    () => srcs.find((src) => checked.get(src) === true) ?? null
  );

  useEffect(() => {
    let cancelled = false;
    // Walk the chain: the first src that loads wins; a failed src falls
    // through to the next (results are cached for the whole session).
    const resolve = (index: number) => {
      if (cancelled) return;
      const src = srcs[index];
      if (!src) {
        setBgSrc(null); // every image failed → the colour gradient
        return;
      }
      if (checked.get(src) !== undefined) {
        if (checked.get(src)) setBgSrc(src);
        else resolve(index + 1);
        return;
      }
      const img = new Image();
      img.onload = () => {
        checked.set(src, true);
        if (!cancelled) setBgSrc(src);
      };
      img.onerror = () => {
        checked.set(src, false);
        resolve(index + 1);
      };
      img.src = src;
    };
    resolve(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey]);

  return (
    <div className="absolute inset-0 overflow-hidden" data-testid="reel-background">
      <motion.div className="absolute inset-0" style={style}>
        {bgSrc ? (
          <img src={bgSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(180deg, ${color}40 0%, ${color}1A 45%, rgba(25, 20, 22, 0.92) 100%), ${color}26`,
            }}
          />
        )}
      </motion.div>
      {/* Caption shade ABOVE the character (z between the slot's z-[5] and
          the caption's z-10) — waist-up characters standing on the bottom
          edge still get the darkening behind the caption. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-44 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
    </div>
  );
}
