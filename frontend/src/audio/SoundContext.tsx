import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SOUND_ENABLED } from "../config";
import { loadManifest, readSoundPref, writeSoundPref, type AudioManifest } from "./engine";

interface SoundState {
  soundOn: boolean;
  toggleSound: () => void;
  manifest: AudioManifest;
}

const SoundContext = createContext<SoundState>({
  soundOn: false,
  toggleSound: () => {},
  manifest: {},
});

// Re-provided by FeedFrame with the ?audiotest=1 override merged in.
export { SoundContext };

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: ReactNode }) {
  // Feature flag: with sound disabled, nothing audio-related ever starts —
  // no manifest fetch, no Audio elements, no AudioContext, no sound UI —
  // unless the visitor is using the ?audiotest=1 switch.
  const audioTest = useMemo(
    () => new URLSearchParams(window.location.search).get("audiotest") === "1",
    []
  );
  const enabled = SOUND_ENABLED || audioTest;

  // Sound is off until the visitor opts in; the choice is remembered.
  const [soundOn, setSoundOn] = useState(() => (enabled ? readSoundPref() : false));
  const [manifest, setManifest] = useState<AudioManifest>({});

  // The manifest is read once at load — only when sound can ever be used.
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadManifest().then((m) => {
      if (live) setManifest(m);
    });
    return () => {
      live = false;
    };
  }, [enabled]);

  const toggleSound = useCallback(() => {
    setSoundOn((value) => {
      writeSoundPref(!value);
      return !value;
    });
  }, []);

  const value = useMemo(
    () => ({ soundOn, toggleSound, manifest }),
    [soundOn, toggleSound, manifest]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
