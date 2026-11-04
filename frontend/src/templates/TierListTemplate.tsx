import { motion } from "framer-motion";
import { CharacterSlot, headTopPercent } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { usePaused } from "../components/PausedContext";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
import { str, type TemplateProps } from "./registry";

const CHAR_HEIGHT = 30;
const DEFAULT_TIERS = ["S", "A", "B", "C", "D"];
const TIER_COLORS: Record<string, string> = {
  S: "#D96A6A",
  A: "#E0A58C",
  B: "#DEC490",
  C: "#93B29C",
  D: "#A9BED6",
};

/** The host ranks things into tiers — one item drops into the board per beat. */
export function TierListTemplate({ reel, beat, beatIndex, data, reducedMotion }: TemplateProps) {
  const paused = usePaused();
  const title = str(data.title);
  const tiers = Array.isArray(data.tiers)
    ? (data.tiers as unknown[]).filter((tier): tier is string => typeof tier === "string")
    : DEFAULT_TIERS;
  const tierSet = new Set(tiers);

  // Collect every item up to the current beat — NOT from the accumulated
  // `data` (later items would overwrite earlier ones). An item whose tier is
  // not in the board is skipped with a warning.
  const placed: { label: string; tier: string; isNew: boolean }[] = [];
  for (let i = 0; i <= beatIndex && i < reel.beats.length; i++) {
    const item = reel.beats[i].data?.item as { label?: unknown; tier?: unknown } | undefined;
    const label = typeof item?.label === "string" ? item.label : undefined;
    const tier = typeof item?.tier === "string" ? item.tier : undefined;
    if (!label || !tier) continue;
    if (!tierSet.has(tier)) {
      console.warn(
        `[content] tier_list reel ${reel.slug}: item "${label}" has tier "${tier}" which is not in [${tiers.join(", ")}] — skipping it.`
      );
      continue;
    }
    placed.push({ label, tier, isNew: i === beatIndex });
  }

  const rows = tiers.map((tier) => ({ tier, items: placed.filter((p) => p.tier === tier) }));
  // The board ends just above the host's head (with a small gap).
  const boardBottom = `${headTopPercent(reel.hostId, CHAR_HEIGHT) + 2}%`;
  const frozen = paused || reducedMotion;

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {/* The tier board — from the top down to just above the host's head */}
      <div className="absolute inset-x-3 top-[3%] z-10 flex flex-col" style={{ bottom: boardBottom }} data-testid="tier-board">
        {title && <p className="mb-2 text-center font-display text-lg text-cream">{title}</p>}
        <div className="flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-hidden">
          {rows.map((row) => (
            <div key={row.tier} className="flex items-start gap-1.5" data-testid={`tier-row-${row.tier}`}>
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg font-display text-base font-extrabold text-ink"
                style={{ backgroundColor: TIER_COLORS[row.tier] ?? "rgba(25, 20, 22, 0.6)" }}
              >
                {row.tier}
              </span>
              <div className="flex min-h-8 flex-1 flex-wrap content-start gap-1 rounded-xl bg-surface/80 p-1.5">
                {row.items.map((item) =>
                  item.isNew ? (
                    <motion.span
                      key={item.label}
                      initial={frozen ? { opacity: 0 } : { y: -14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={
                        paused
                          ? { duration: 0 }
                          : reducedMotion
                            ? { duration: 0.2 }
                            : { type: "spring", stiffness: 320, damping: 20 }
                      }
                      className="rounded-lg bg-ink/60 px-2 py-0.5 text-[11px] font-bold text-cream ring-2 ring-sage"
                      data-testid="tier-item-new"
                    >
                      {item.label}
                    </motion.span>
                  ) : (
                    <span
                      key={item.label}
                      className="rounded-lg bg-ink/60 px-2 py-0.5 text-[11px] font-bold text-cream/90"
                      data-testid="tier-item"
                    >
                      {item.label}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={CHAR_HEIGHT} align="center" />

      {/* Caption zone: the host's name + the line */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
