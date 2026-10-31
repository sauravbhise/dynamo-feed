import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { castById } from "../content";
import type { Reel } from "../content/types";

// One check per template per session — adding a file is the only step needed.
const checked = new Map<string, boolean>();

interface ReelBackgroundProps {
  reel: Reel;
  /** Extra style for the image layer, e.g. a slow Ken Burns transform. */
  style?: MotionStyle;
}

export function ReelBackground({ reel, style }: ReelBackgroundProps) {
  const host = castById[reel.hostId];
  const color = host?.color ?? "#A9BED6";
  const src = `/backgrounds/${reel.template}.webp`;
  const [bgSrc, setBgSrc] = useState<string | null>(() => (checked.get(src) === true ? src : null));

  useEffect(() => {
    if (checked.get(src) !== undefined) {
      setBgSrc(checked.get(src) ? src : null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      checked.set(src, true);
      if (!cancelled) setBgSrc(src);
    };
    img.onerror = () => {
      checked.set(src, false);
      if (!cancelled) setBgSrc(null);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

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
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
    </div>
  );
}
