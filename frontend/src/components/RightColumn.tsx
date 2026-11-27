import { now, timeAgo } from "../content";
import { CurrentObsessionCard } from "./cards/CurrentObsessionCard";
import { WritingDeckCard } from "./cards/WritingDeckCard";
import { NowReadingCard } from "./cards/NowReadingCard";
import { DailyStreaksCard } from "./cards/DailyStreaksCard";
import { VolunteeringCard } from "./cards/VolunteeringCard";

/** Off the clock — renders the card list in order; each card is its own component. */
export function RightColumn({ showTitle = true }: { showTitle?: boolean }) {
  // now.json invalid → hide the right column entirely (its auto reels hide too).
  if (!now) return null;
  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="clock-column">
      <div className={showTitle ? "shrink-0 px-6 pb-4 pt-6" : "shrink-0 px-6 pb-2"}>
        {showTitle && (
          <h2 className="font-display text-2xl text-cream" data-testid="clock-title">
            Off the clock
          </h2>
        )}
        <p
          className={`${showTitle ? "mt-1.5" : ""} flex items-center gap-2 text-xs font-semibold text-muted`}
          data-testid="clock-updated"
        >
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-sage" />
          </span>
          Updated {timeAgo(now.updatedAt)}
        </p>
      </div>

      <div
        className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6"
        data-testid="clock-cards"
      >
        <CurrentObsessionCard obsession={now.obsession} />
        <WritingDeckCard posts={now.writing} />
        <NowReadingCard reading={now.reading} />
        <DailyStreaksCard spanish={now.spanish} matiks={now.matiks} />
        {now.volunteering && <VolunteeringCard volunteering={now.volunteering} />}
      </div>
    </div>
  );
}
