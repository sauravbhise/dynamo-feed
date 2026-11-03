import { createContext, useContext, type ReactNode } from "react";
import { type MotionValue } from "framer-motion";
import type { ReelComment, ReelTemplate } from "../content/types";

export interface LiveCommentsState {
  comments: ReelComment[];
  template: ReelTemplate;
  active: boolean;
  /** Comments sheet open or the swipe-up hint showing — the lane waits. */
  suppressed: boolean;
  /** The reel's progress motion value (0..1) — the single timing source. */
  progress: MotionValue<number>;
  /** End of beat 1 as a fraction of the reel (1 when there is a single beat). */
  beat1End: number;
  /** The reel's total duration in ms — for the minimum on-screen time. */
  reelTotalMs: number;
  onOpenComments: () => void;
}

const LiveCommentsContext = createContext<LiveCommentsState | null>(null);

export const useLiveComments = () => useContext(LiveCommentsContext);

export function LiveCommentsProvider({
  value,
  children,
}: {
  value: LiveCommentsState;
  children: ReactNode;
}) {
  return <LiveCommentsContext.Provider value={value}>{children}</LiveCommentsContext.Provider>;
}
