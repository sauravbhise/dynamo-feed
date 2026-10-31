import { useState } from "react";
import { Send } from "lucide-react";
import { castColor } from "../content";
import type { ReelComment } from "../content/types";

function CommentRow({ comment }: { comment: ReelComment }) {
  const isVisitor = comment.authorId === "visitor";
  const name = isVisitor ? "You" : comment.authorId;
  const color = castColor(comment.authorId);

  return (
    <li className="flex gap-3" data-testid="comment-row">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-ink"
        style={{ backgroundColor: color }}
      >
        {name.slice(0, 1)}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-cream/90">{name}</p>
        <p className="mt-0.5 text-sm leading-snug text-cream/80">{comment.text}</p>
      </div>
    </li>
  );
}

export function CommentsPanel({ comments }: { comments: ReelComment[] }) {
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<ReelComment[]>([]);
  const all = [...comments, ...extra];

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [...prev, { authorId: "visitor", text }]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col" data-testid="comments-panel">
      <ol className="scrollbar-soft flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-2" data-testid="comments-list">
        {all.map((comment, i) => (
          <CommentRow key={comment.authorId + i} comment={comment} />
        ))}
      </ol>
      <div className="px-5 pb-4 pt-1">
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
            className="min-w-0 flex-1 rounded-full bg-raised px-4 py-2.5 text-sm text-cream placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <button
            type="submit"
            data-testid="comment-send"
            aria-label="Send comment"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-sage text-sage-deep transition hover:brightness-105 active:scale-95"
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="mt-2 text-[11px] text-muted">Placeholder comments — the cast joins in a later update.</p>
      </div>
    </div>
  );
}
