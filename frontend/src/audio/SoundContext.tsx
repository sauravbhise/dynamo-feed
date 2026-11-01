import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  // Sound is off until the visitor opts in; the choice is remembered.
  const [soundOn, setSoundOn] = useState(readSoundPref);
  const [manifest, setManifest] = useState<AudioManifest>({});

  // The manifest is read once at load.
  useEffect(() => {
    let live = true;
    loadManifest().then((m) => {
      if (live) setManifest(m);
    });
    return () => {
      live = false;
    };
  }, []);

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
