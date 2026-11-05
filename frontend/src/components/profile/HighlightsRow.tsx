import { useEffect, useState } from "react";
import { castById, castColor, highlights, reels } from "../../content";
import type { Highlight } from "../../content/types";

const SEEN_KEY = "df-highlights-seen";

function readSeen(): Set<string> {
  try {
    const raw: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

/** Instagram-style highlight circles under the bio — tapping plays just that
    set of reels as a session in the feed. */
export function HighlightsRow() {
  const [seenIds, setSeenIds] = useState<Set<string>>(readSeen);

  useEffect(() => {
    const onSeen = () => setSeenIds(readSeen());
    window.addEventListener("dynamo:highlights-seen", onSeen);
    return () => window.removeEventListener("dynamo:highlights-seen", onSeen);
  }, []);

  if (highlights.length === 0) return null;

  return (
    <div className="no-scrollbar overflow-x-auto" data-testid="highlights-row">
      <div className="flex w-max min-w-full justify-center gap-4">
        {highlights.map((highlight) => (
          <HighlightCircle key={highlight.id} highlight={highlight} seen={seenIds.has(highlight.id)} />
        ))}
      </div>
    </div>
  );
}

function HighlightCircle({ highlight, seen }: { highlight: Highlight; seen: boolean }) {
  const firstReel = reels.find((reel) => reel.slug === highlight.reelSlugs[0]);
  const hostId = firstReel?.hostId ?? "";
  const host = hostId ? castById[hostId] : undefined;
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = !!highlight.cover && !coverFailed;

  return (
    <button
      type="button"
      data-testid={`highlight-${highlight.id}`}
      aria-label={`Play highlight: ${highlight.label}`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("dynamo:start-highlight", {
            detail: { id: highlight.id, label: highlight.label, reelSlugs: highlight.reelSlugs },
          })
        );
      }}
      className="flex w-16 shrink-0 flex-col items-center gap-1.5"
    >
      <span
        className="grid size-16 place-items-center rounded-full p-[2px] transition"
        style={{
          background: seen ? "rgba(255, 255, 255, 0.25)" : "linear-gradient(135deg, #93B29C, #D9A5AE)",
        }}
      >
        <span className="grid size-full place-items-center overflow-hidden rounded-full bg-ink p-[2px]">
          {showCover ? (
            <img
              src={highlight.cover}
              alt=""
              draggable={false}
              onError={() => setCoverFailed(true)}
              className="size-full rounded-full object-cover"
            />
          ) : firstReel ? (
            <span
              className="relative size-full overflow-hidden rounded-full"
              style={{ backgroundColor: castColor(hostId) }}
            >
              {/* No cover: the first reel's host, framed on the head (frame 0
                  of the sheet, scaled up; Saurav keeps his placeholder). */}
              {hostId === "saurav" || !host ? (
                <span className="font-display text-2xl text-ink/30">
                  {host ? host.name.slice(0, 1) : "?"}
                </span>
              ) : (
                // Crop to the HEAD of the neutral frame: a ~220×220 region
                // (frame x 130–350, from headroom×680 − 10 down), scaled to
                // fill the circle. Sheet is 3840×680, frame 0 on the left.
                <img
                  src={`/cast/${hostId}.webp`}
                  alt=""
                  draggable={false}
                  className="absolute left-0 top-0 h-[309.09%] w-auto max-w-none"
                  style={{
                    transform: `translate(-3.3854%, ${-(host.headroom - 10 / 680) * 100}%)`,
                  }}
                />
              )}
            </span>
          ) : null}
        </span>
      </span>
      <span className="max-w-16 truncate text-[11px] font-semibold text-cream/80">{highlight.label}</span>
    </button>
  );
}
