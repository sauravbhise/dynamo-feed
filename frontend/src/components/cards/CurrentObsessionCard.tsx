import { useEffect, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CardTitle } from "./CardTitle";
import { contentUsable, wholeDaysSince } from "../../content";
import type { Obsession } from "../../content/types";

const RECENT_DAYS = 14;

// One request per page load: the column mounts again each time the phone
// sheet opens, and unauthenticated GitHub calls are rate limited.
let pushedAtRequest: Promise<string | null> | undefined;

function fetchPushedAt(repo: string): Promise<string | null> {
  pushedAtRequest ??= fetch(`https://api.github.com/repos/${repo}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((body) =>
      typeof body?.pushed_at === "string" && !Number.isNaN(Date.parse(body.pushed_at)) ? body.pushed_at : null
    )
    .catch(() => null);
  return pushedAtRequest;
}

function lastWorkedOn(pushedAt: string | null): string | null {
  if (!pushedAt) return null;
  const days = wholeDaysSince(pushedAt);
  if (days >= RECENT_DAYS) return null;
  if (days === 0) return "Last worked on today";
  return `Last worked on ${days} ${days === 1 ? "day" : "days"} ago`;
}

export function CurrentObsessionCard({ obsession }: { obsession: Obsession }) {
  const usable = contentUsable(obsession.name) && contentUsable(obsession.repo);
  const [pushedAt, setPushedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!usable) return;
    let cancelled = false;
    fetchPushedAt(obsession.repo).then((value) => {
      if (!cancelled) setPushedAt(value);
    });
    return () => {
      cancelled = true;
    };
  }, [usable, obsession.repo]);

  // Draft/placeholder fields never render; no project → no card.
  if (!usable) return null;
  const dateLine = lastWorkedOn(pushedAt);
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-obsession">
      <CardTitle icon={Sparkles}>{obsession.title}</CardTitle>
      <p className="mt-3 font-display text-sm leading-snug text-cream">{obsession.name}</p>
      {contentUsable(obsession.oneLiner) && (
        <p className="mt-1 text-xs leading-relaxed text-muted">{obsession.oneLiner}</p>
      )}
      {dateLine && (
        <p className="mt-2 text-[11px] font-semibold text-muted" data-testid="obsession-last-worked">
          {dateLine}
        </p>
      )}
      <a
        href={`https://github.com/${obsession.repo}`}
        target="_blank"
        rel="noreferrer"
        data-testid="obsession-repo"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sage transition hover:text-cream"
      >
        View the repo
        <ArrowUpRight className="size-3.5" />
      </a>
    </section>
  );
}
