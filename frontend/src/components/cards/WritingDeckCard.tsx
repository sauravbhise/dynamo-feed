import { PenLine } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { SwipeDeck } from "../SwipeDeck";
import { contentUsable } from "../../content";
import type { WritingLink } from "../../content/types";

export function WritingDeckCard({ posts }: { posts: WritingLink[] }) {
  // Placeholder drafts never reach the deck; nothing left → no card.
  const visible = posts.filter((post) => contentUsable(post.title) && contentUsable(post.url));
  if (visible.length === 0) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-writing">
      <CardTitle icon={PenLine}>Writing</CardTitle>
      <SwipeDeck items={visible} />
    </section>
  );
}
