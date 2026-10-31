import { useState } from "react";
import { Send } from "lucide-react";
import { ask as askEntries, castById, castColor, reels } from "../content";

export type RightTab = "comments" | "ask";

function TabButton({
  active,
  onClick,
  testId,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  testId: string;
  count?: number;
  children: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 border-b-[3px] px-4 py-3 font-display text-xs uppercase tracking-[0.18em] transition-colors ${
        active ? "border-accent bg-raised text-line" : "border-transparent text-muted hover:text-line"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="rounded-full border-2 border-line bg-accent px-1.5 text-[9px] font-extrabold leading-4 text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function CommentRow({ authorId, text, reelSlug }: { authorId: string; text: string; reelSlug: string }) {
  const isVisitor = authorId === "visitor";
  const member = castById[authorId];
  const name = isVisitor ? "You" : member?.name ?? "Unknown";
  const color = castColor(authorId);

  return (
    <li className="flex gap-3" data-testid="comment-row">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-line text-[11px] font-extrabold text-ink"
        style={{ backgroundColor: color }}
      >
        {name.slice(0, 1)}
      </span>
      <div className="min-w-0 rounded-2xl rounded-tl-sm border-2 border-line bg-raised px-3 py-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color }}>
          {name}
        </p>
        <p className="text-sm leading-snug">{text}</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted">on {reelSlug}</p>
      </div>
    </li>
  );
}

export function CommentsPanel() {
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<{ authorId: string; text: string }[]>([]);

  const all = [
    ...reels.flatMap((reel) => reel.comments.map((comment) => ({ ...comment, reelSlug: reel.slug }))),
    ...extra.map((comment) => ({ ...comment, reelSlug: reels[0].slug })),
  ];

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [...prev, { authorId: "visitor", text }]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-4" data-testid="comments-panel">
      <p className="border-l-2 border-accent pl-2 text-[11px] leading-relaxed text-muted">
        Placeholder comments from the cast. Replies go live with the feed.
      </p>
      <ol className="flex flex-col gap-3" data-testid="comments-list">
        {all.map((comment, i) => (
          <CommentRow key={comment.authorId + i} authorId={comment.authorId} text={comment.text} reelSlug={comment.reelSlug} />
        ))}
      </ol>
      <form
        className="flex gap-2"
        data-testid="comment-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          data-testid="comment-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a comment…"
          className="min-w-0 flex-1 rounded-xl border-[3px] border-line bg-raised px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          data-testid="comment-send"
          aria-label="Send comment"
          className="grid size-11 shrink-0 place-items-center rounded-xl border-[3px] border-line bg-accent text-white transition-transform hover:-translate-y-0.5"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function AskPanel() {
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<{ id: string; question: string; answer: string }[]>([]);
  const entries = [...askEntries, ...extra];

  const submit = () => {
    const question = draft.trim();
    if (!question) return;
    setExtra((prev) => [
      ...prev,
      { id: `ask-local-${prev.length + 1}`, question, answer: "Answering in a later episode…" },
    ]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-4" data-testid="ask-panel">
      <p className="border-l-2 border-accent pl-2 text-[11px] leading-relaxed text-muted">
        The chat bot joins in a later episode — until then, questions stack up here.
      </p>
      <div className="flex flex-col gap-3" data-testid="ask-list">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-2xl border-[3px] border-line bg-surface p-4" data-testid="ask-entry">
            <p className="flex items-start gap-2 text-sm font-bold">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-accent font-display text-[11px] text-white">
                Q
              </span>
              {entry.question}
            </p>
            <p className="mt-2 pl-8 text-sm leading-relaxed text-muted">{entry.answer}</p>
          </article>
        ))}
      </div>
      <form
        className="flex gap-2"
        data-testid="ask-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          data-testid="ask-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask me anything…"
          className="min-w-0 flex-1 rounded-xl border-[3px] border-line bg-raised px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          data-testid="ask-send"
          aria-label="Send question"
          className="grid size-11 shrink-0 place-items-center rounded-xl border-[3px] border-line bg-accent text-white transition-transform hover:-translate-y-0.5"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function RightColumn({ tab, onTabChange }: { tab: RightTab; onTabChange: (tab: RightTab) => void }) {
  const totalComments = reels.reduce((sum, reel) => sum + reel.comments.length, 0);

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="right-column-content">
      <div className="grid shrink-0 grid-cols-2 border-b-[3px] border-line" data-testid="right-tabs">
        <TabButton active={tab === "comments"} onClick={() => onTabChange("comments")} testId="tab-comments" count={totalComments}>
          Comments
        </TabButton>
        <TabButton active={tab === "ask"} onClick={() => onTabChange("ask")} testId="tab-ask">
          Ask me
        </TabButton>
      </div>
      <div className="scrollbar-brut min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "comments" ? <CommentsPanel /> : <AskPanel />}
      </div>
    </div>
  );
}
