import { Code2, Globe, Newspaper, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardTitle } from "./CardTitle";
import type { WritingLink } from "../../content/types";

const WRITING_ICONS: Record<WritingLink["platform"], LucideIcon> = {
  substack: Newspaper,
  dev: Code2,
  medium: PenLine,
  blog: Globe,
};

export function LatestWritingCard({ posts }: { posts: WritingLink[] }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-writing">
      <CardTitle icon={PenLine}>Latest writing</CardTitle>
      <ul className="mt-3 flex flex-col gap-2">
        {posts.map((post) => {
          const Icon = WRITING_ICONS[post.platform];
          return (
            <li key={post.title}>
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                data-testid="writing-link"
                className="flex items-center gap-3 rounded-xl bg-raised px-3 py-2.5 transition hover:bg-raised/70"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{post.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
