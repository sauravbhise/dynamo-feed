import { useSyncExternalStore } from "react";
import { X } from "lucide-react";

// Mirrors the highlight session FeedFrame manages (label + live position) so
// the pill can render OUTSIDE the reel frame — the top bar on phones, the
// rail column on desktop.
export interface SessionInfo {
  id: string;
  label: string;
  position: number;
  total: number;
}

let session: SessionInfo | null = null;
const listeners = new Set<() => void>();

export const sessionStore = {
  set(next: SessionInfo | null) {
    session = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get(): SessionInfo | null {
    return session;
  },
};

export function HighlightSessionPill({ variant }: { variant: "topbar" | "rail" }) {
  const current = useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
  if (!current) return null;

  const pill = (
    <div
      data-testid="highlight-pill"
      className="flex items-center gap-2.5 rounded-full bg-ink/70 py-2 pl-4 pr-2 text-xs font-bold text-cream shadow-soft backdrop-blur"
    >
      <span className="max-w-[38vw] truncate">{current.label}</span>
      <span className="text-cream/60">
        {current.position}/{current.total}
      </span>
      <button
        data-testid="highlight-close"
        aria-label="Exit highlights"
        onClick={(event) => {
          event.stopPropagation();
          window.dispatchEvent(new CustomEvent("dynamo:end-highlight"));
        }}
        className="grid size-6 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-white/20"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );

  if (variant === "topbar") {
    // Centred in the top bar, between the profile button and "Off the
    // clock"; phones only (the rail column takes over from md).
    return (
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 md:hidden">
        <div className="pointer-events-auto">{pill}</div>
      </div>
    );
  }
  return pill;
}
