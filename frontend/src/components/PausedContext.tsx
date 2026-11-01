import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const PausedContext = createContext(false);

/** Wraps a reel's template so every animation inside can freeze on pause. */
export function PausedProvider({ paused, children }: { paused: boolean; children: ReactNode }) {
  return <PausedContext.Provider value={paused}>{children}</PausedContext.Provider>;
}

/** True while the reel is paused — looping and entrance animations must hold. */
export function usePaused(): boolean {
  return useContext(PausedContext);
}
