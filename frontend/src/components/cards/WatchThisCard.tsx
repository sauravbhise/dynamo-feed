import { Tv } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { SwipeDeck } from "../SwipeDeck";
import { contentUsable } from "../../content";
import type { WatchItem } from "../../content/types";

export function WatchThisCard({ items }: { items: WatchItem[] }) {
  // Placeholder drafts never reach the deck; nothing left → no card.
  const visible = items.filter(
    (item) => contentUsable(item.title) && contentUsable(item.kind) && contentUsable(item.why)
  );
  if (visible.length === 0) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-watching">
      <CardTitle icon={Tv}>Watch this</CardTitle>
      <SwipeDeck items={visible} />
    </section>
  );
}
