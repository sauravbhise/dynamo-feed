import { useEffect, useState } from "react";
import { LeftColumn } from "./LeftColumn";
import { FeedFrame } from "./FeedFrame";
import { AskPanel, CommentsPanel, RightColumn, type RightTab } from "./RightColumn";
import { Sheet } from "./Sheet";
import { Logo } from "./Logo";
import { profile, reels } from "../content";

type SheetKind = "profile" | "comments" | "ask" | null;

export function Layout() {
  const [tab, setTab] = useState<RightTab>("comments");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const openPanel = (next: RightTab) => {
    setTab(next);
    if (isMobile) setSheet(next);
  };

  const closeSheet = () => setSheet(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink font-body text-line">
      <header
        className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-line bg-surface px-4 py-2.5 desk:hidden"
        data-testid="top-bar"
      >
        <Logo size={30} />
        <button
          data-testid="topbar-profile-button"
          onClick={() => setSheet("profile")}
          className="flex items-center gap-2 rounded-full border-[3px] border-line bg-raised py-1 pl-1 pr-3 shadow-brut-xs transition-transform hover:-translate-y-0.5"
        >
          <img src={profile.photo} alt="" className="size-8 rounded-full border-2 border-line object-cover" />
          <span className="font-display text-xs uppercase tracking-wider">Profile</span>
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] desk:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside
          data-testid="left-column"
          className="scrollbar-brut hidden min-h-0 desk:block overflow-y-auto border-r-[3px] border-line bg-surface"
        >
          <LeftColumn />
        </aside>

        <main
          data-testid="feed-stage"
          className="dotgrid relative flex min-h-0 items-center justify-center overflow-hidden p-3 md:p-6"
        >
          <FeedFrame
            reel={reels[0]}
            index={1}
            total={reels.length}
            onComments={() => openPanel("comments")}
            onAsk={() => openPanel("ask")}
          />
        </main>

        <aside data-testid="right-column" className="hidden min-h-0 border-l-[3px] border-line bg-surface md:block">
          <RightColumn tab={tab} onTabChange={setTab} />
        </aside>
      </div>

      <Sheet open={sheet === "profile"} onClose={closeSheet} side="left" title="Portfolio" testId="sheet-profile">
        <LeftColumn />
      </Sheet>
      <Sheet open={sheet === "comments"} onClose={closeSheet} side="bottom" title="Comments" testId="sheet-comments">
        <CommentsPanel />
      </Sheet>
      <Sheet open={sheet === "ask"} onClose={closeSheet} side="bottom" title="Ask me" testId="sheet-ask">
        <AskPanel />
      </Sheet>
    </div>
  );
}
