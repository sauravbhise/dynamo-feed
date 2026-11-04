import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pointer } from "lucide-react";

const SEEN_KEY = "df-coach-seen";

// Storage can be unavailable (private mode, blocked cookies) — then the mark
// simply shows once per page load.
let shownThisLoad = false;

function hasSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1" || shownThisLoad;
  } catch {
    return shownThisLoad;
  }
}

function markSeen() {
  shownThisLoad = true;
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable — once per page load is enough */
  }
}

interface CoachMarkProps {
  /** A page layer or the comments sheet is open — never show over either. */
  blocked: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

/**
 * TikTok-style first-launch hint: once per browser, 1.5s into the first reel
 * the visitor watches — gone on the first scroll / swipe / wheel / arrow key /
 * tap / nav button, or after 4 seconds. Never blocks a tap, never pauses the
 * reel.
 */
export function CoachMark({ blocked, onVisibleChange }: CoachMarkProps) {
  const reduceMotion = useReducedMotion();
  const [seen, setSeen] = useState(hasSeen);
  const [timerFired, setTimerFired] = useState(false);
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const visible = !seen && timerFired && !blocked;

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  // The 1.5s fuse: if a page layer or the comments sheet is open when it
  // fires (e.g. a direct /p/ landing), the mark waits for them to close.
  useEffect(() => {
    if (seen) return;
    const timer = window.setTimeout(() => setTimerFired(true), 1500);
    return () => window.clearTimeout(timer);
  }, [seen]);

  // Any dismissal interaction counts from mount — an early scroll means the
  // visitor already knows how this works.
  useEffect(() => {
    if (seen) return;
    const dismiss = () => {
      markSeen();
      setSeen(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") dismiss();
    };
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("touchmove", dismiss, { passive: true });
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchmove", dismiss);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [seen]);

  // Auto-dismiss 4s after appearing.
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      markSeen();
      setSeen(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="coach-mark"
          className="pointer-events-none absolute left-1/2 top-[56%] z-40 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-ink/60 px-5 py-4 backdrop-blur">
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -40], opacity: [1, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.1, repeat: 1, ease: "easeOut", repeatDelay: 0.3 }
              }
            >
              <Pointer className="size-7 text-cream" strokeWidth={2.2} />
            </motion.div>
            <p className="text-sm font-bold text-cream">
              {coarse ? "Swipe up for more" : "Scroll or press ↓ for more"}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
