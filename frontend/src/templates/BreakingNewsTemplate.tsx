import { motion } from "framer-motion";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById, castColor } from "../content";
import { str, type TemplateProps } from "./registry";

export function BreakingNewsTemplate({ reel, beat, beatIndex, data, reducedMotion, active }: TemplateProps) {
  const paused = usePaused();
  const headline = str(data.headline) ?? reel.beats[0].caption;
  const ticker = str(data.ticker);

  // Cast comments INTERLEAVE with the reel's own ticker items (item, comment,
  // item, comment…, then whatever is left over) so a comment reaches the
  // screen early instead of trailing at the end. The duration scales with the
  // total length so the scrolling SPEED stays the same as always.
  const tickerItems = (ticker ?? "").split("•").map((part) => part.trim()).filter(Boolean);
  const commentParts = reel.comments.map((comment) => {
    const name = (castById[comment.authorId]?.name ?? comment.authorId).toUpperCase();
    return { name, comment };
  });
  type Segment = { type: "text"; text: string } | { type: "comment"; index: number };
  const segments: Segment[] = [];
  const pushSegment = (segment: Segment) => {
    if (segments.length) segments.push({ type: "text", text: " • " });
    segments.push(segment);
  };
  let commentIndex = 0;
  tickerItems.forEach((item) => {
    pushSegment({ type: "text", text: item });
    if (commentIndex < commentParts.length) pushSegment({ type: "comment", index: commentIndex++ });
  });
  while (commentIndex < commentParts.length) pushSegment({ type: "comment", index: commentIndex++ });
  const plainTicker = segments
    .map((segment) =>
      segment.type === "text"
        ? segment.text
        : `${commentParts[segment.index].name} WRITES: ${commentParts[segment.index].comment.text}`
    )
    .join("");
  const tickerDuration = Math.max(18, plainTicker.length * 0.14);

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      <motion.div
        className="absolute left-4 top-[4%] z-10"
        initial={paused || reducedMotion ? false : { y: -48, opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
        data-testid="breaking-banner"
      >
        <span className="rounded-lg bg-[#D96A6A] px-3 py-1 font-display text-sm text-white shadow-soft">
          Breaking
        </span>
      </motion.div>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />

      {/* Caption zone: speaker + spoken line, lower-third headline, ticker at the bottom */}
      <div className="absolute inset-x-3 bottom-11 z-10 flex flex-col gap-2">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
        <motion.div
          className="flex items-center gap-3 rounded-2xl bg-ink/85 px-4 py-3 backdrop-blur"
          initial={paused || reducedMotion ? false : { x: "-30%", opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.25 }}
          data-testid="lower-third"
        >
          <span className="shrink-0 rounded bg-[#D96A6A] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
            Live
          </span>
          <p className="font-display text-sm leading-snug text-cream">{headline}</p>
        </motion.div>
      </div>

      {/* Ticker scrolls along the bottom on loop; freezes when paused. Cast
          comments append after the reel's own text at the same speed. */}
      {ticker && (
        <div className="absolute inset-x-0 bottom-1 z-10 flex overflow-hidden bg-ink/90 py-1.5" data-testid="news-ticker">
          <div
            className={`flex w-max animate-ticker motion-reduce:animate-none ${
              paused ? "[animation-play-state:paused]" : ""
            }`}
            style={{ animationDuration: `${tickerDuration}s` }}
          >
            {[0, 1].map((copy) => (
              <span key={copy} aria-hidden={copy === 1} className="whitespace-nowrap pr-8 text-xs font-semibold text-cream/90">
                {segments.map((segment, i) =>
                  segment.type === "text" ? (
                    <span key={i}>{segment.text}</span>
                  ) : (
                    <span key={i}>
                      <span
                        className="font-extrabold"
                        style={{ color: castColor(reel.comments[segment.index].authorId) }}
                      >
                        {commentParts[segment.index].name}
                      </span>
                      {" WRITES: "}
                      {commentParts[segment.index].comment.text}
                    </span>
                  )
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
