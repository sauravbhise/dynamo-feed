import { createContext, useContext, type ReactNode } from "react";
import { motionValue, type MotionValue } from "framer-motion";

// Loudness of the currently playing beat voice (0..1), published as a
// MotionValue so mouth animation never re-renders per frame. hasVoice is
// false when sound is off, the reel is inactive, or the beat has no audio —
// characters then fall back to their timer-driven behaviour.
interface VoiceState {
  loudness: MotionValue<number>;
  hasVoice: boolean;
}

const silentLoudness = motionValue(0);

const VoiceContext = createContext<VoiceState>({ loudness: silentLoudness, hasVoice: false });

export const useVoice = () => useContext(VoiceContext);

export function VoiceProvider({ value, children }: { value: VoiceState; children: ReactNode }) {
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
