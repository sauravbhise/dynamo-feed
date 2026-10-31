import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { castById } from "../content";
import type { Reel } from "../content/types";

interface FeedFrameProps {
  reel: Reel;
  index: number;
  total: number;
  onComments: () => void;
  onAsk: () => void;
}

export function FeedFrame({ reel, index, total, onComments, onAsk }: FeedFrameProps) {
  const host = castById[reel.hostId];
  const firstBeat = reel.beats[0];

  return (
    <motion.section
      data-testid="feed-frame"
      initial={{ opacity: 0, y: 32, rotate: -1.5, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.2 }}
      className="relative flex aspect-[9/16] h-full max-h-full max-w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-line bg-surface shadow-brut-accent max-md:aspect-auto max-md:w-full"
    >
      <div className="flex items-center justify-between px-4 pt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">
        <span>9:41</span>
        <span
          data-testid="reel-counter"
          className="rounded-full border-2 border-line bg-raised px-2.5 py-0.5 text-line"
        >
          Reel {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span>@dynamo</span>
      </div>

      <div
        data-testid="reel-placeholder"
        className="relative mx-3 mt-3 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-[3px] border-dashed border-muted/50 bg-ink/60 p-6 text-center"
      >
        <span className="grid size-14 place-items-center rounded-2xl border-[3px] border-line bg-raised shadow-brut-xs">
          <Play className="size-6 text-accent" fill="currentColor" />
        </span>
        <p className="font-display text-sm uppercase tracking-[0.14em]">Reel placeholder</p>
        <span
          data-testid="reel-template"
          className="rounded-full border-2 border-line bg-raised px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-accent"
        >
          {reel.template.replace("_", " ")}
        </span>
        <p className="max-w-48 text-xs text-muted">Cartoons roll in a later episode</p>
      </div>

      <ActionRail likes={reel.likes} comments={reel.comments.length} onComments={onComments} onAsk={onAsk} />

      <div data-testid="caption-area" className="flex items-end p-4 pr-16">
        <div className="min-w-0">
          <span
            className="inline-flex items-center rounded-full border-2 border-line px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink"
            style={{ backgroundColor: host?.color ?? "#B026FF" }}
          >
            {host?.name ?? "Unknown host"}
          </span>
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{firstBeat?.caption}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 px-4 pb-3" data-testid="beat-progress">
        {reel.beats.map((beat, i) => (
          <span key={beat.characterId + i} className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-accent" : "bg-line/15"}`} />
        ))}
      </div>
    </motion.section>
  );
}
