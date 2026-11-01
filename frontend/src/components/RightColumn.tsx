import { BookOpen, Code2, Flame, Globe, Newspaper, PenLine, Tv, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { now, timeAgo } from "../content";
import { SwipeDeck } from "./SwipeDeck";
import type { WritingLink } from "../content/types";

const WRITING_ICONS: Record<WritingLink["platform"], LucideIcon> = {
  substack: Newspaper,
  dev: Code2,
  medium: PenLine,
  blog: Globe,
};

function CardTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-base text-cream">
      <Icon className="size-4 text-sage" />
      {children}
    </h3>
  );
}

export function RightColumn({ showTitle = true }: { showTitle?: boolean }) {
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
        <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-reading">
          <CardTitle icon={BookOpen}>Now reading</CardTitle>
          <div className="mt-4 flex gap-4">
            {now.reading.cover ? (
              <img
                src={now.reading.cover}
                alt=""
                className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-soft"
              />
            ) : (
              <div className="grid h-28 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sage/35 to-cast-saurav/25 shadow-soft">
                <BookOpen className="size-6 text-cream/60" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm leading-snug text-cream">{now.reading.title}</p>
              <p className="mt-0.5 text-xs text-muted">{now.reading.author}</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${now.reading.progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-semibold text-muted">
                {now.reading.progress}% through
              </p>
              <p className="mt-1.5 text-xs italic leading-relaxed text-muted">
                “{now.reading.take}”
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-watching">
          <CardTitle icon={Tv}>Watch this</CardTitle>
          <SwipeDeck items={now.watch} />
        </section>

        {now.writing.length > 0 && (
          <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-writing">
            <CardTitle icon={PenLine}>Latest writing</CardTitle>
            <ul className="mt-3 flex flex-col gap-2">
              {now.writing.map((post) => {
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
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">
                        {post.title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-volunteering">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
              <Users className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm text-cream">Volunteering</p>
                {now.volunteering.status && (
                  <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-bold text-sage">
                    {now.volunteering.status}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{now.volunteering.text}</p>
            </div>
          </div>
        </section>

        <section className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-spanish">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cast-blaze/15 text-cast-blaze">
            <Flame className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm text-cream">Learning Spanish</p>
            <p className="text-xs text-muted">
              Duolingo · <span className="font-bold text-cream">{now.spanish.streak} day streak</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
