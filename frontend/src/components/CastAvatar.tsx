import { castById, castColor } from "../content";

/** Circular initial avatar in the cast member's colour — shared by the comments panel and the live-comment cards. */
export function CastAvatar({
  authorId,
  name,
  className = "size-5 text-[10px]",
}: {
  authorId: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-ink ${className}`}
      style={{ backgroundColor: castColor(authorId) }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/** Resolve the display name for a comment author (cast member or visitor). */
export function commentAuthorName(authorId: string): string {
  return authorId === "visitor" ? "You" : castById[authorId]?.name ?? authorId;
}
