import { Tv } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { SwipeDeck } from "../SwipeDeck";
import type { WatchItem } from "../../content/types";

export function WatchThisCard({ items }: { items: WatchItem[] }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-watching">
      <CardTitle icon={Tv}>Watch this</CardTitle>
      <SwipeDeck items={items} />
    </section>
  );
}
