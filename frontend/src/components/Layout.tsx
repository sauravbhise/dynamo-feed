import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { LeftColumn } from "./LeftColumn";
import { FeedFrame } from "./FeedFrame";
import { RightColumn } from "./RightColumn";
import { Sheet } from "./Sheet";
import { profile, reels } from "../content";

type SheetKind = "profile" | "clock" | null;

export function Layout() {
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const closeSheet = () => setSheet(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink font-body text-cream">
      <header
        className="flex shrink-0 items-center justify-between border-b border-white/5 bg-ink px-4 py-3 desk:hidden"
        data-testid="top-bar"
      >
        <button
          data-testid="topbar-profile-button"
          onClick={() => setSheet("profile")}
          aria-label="Open portfolio"
          className="rounded-full p-0.5 shadow-soft transition hover:scale-105"
        >
          <img src={profile.photo} alt="" className="size-10 rounded-full object-cover" />
        </button>
        <button
          data-testid="topbar-clock-button"
          onClick={() => setSheet("clock")}
          className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-raised"
        >
          <Clock className="size-4 text-sage" />
          The Clock
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] desk:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside
          data-testid="left-column"
          className="scrollbar-soft hidden min-h-0 overflow-y-auto border-r border-white/5 bg-ink desk:block"
        >
          <LeftColumn />
        </aside>

        <main data-testid="feed-stage" className="glow-stage relative flex min-h-0 items-center justify-center overflow-hidden p-3 md:p-6">
          <FeedFrame reel={reels[0]} />
        </main>

        <aside
          data-testid="right-column"
          className="hidden min-h-0 border-l border-white/5 bg-ink md:block"
        >
          <RightColumn />
        </aside>
      </div>

      <Sheet open={sheet === "profile"} onClose={closeSheet} side="left" title="Portfolio" testId="sheet-profile">
        <LeftColumn />
      </Sheet>
      <Sheet open={sheet === "clock"} onClose={closeSheet} side="bottom" title="The Clock" testId="sheet-clock">
        <RightColumn showTitle={false} />
      </Sheet>
    </div>
  );
}
