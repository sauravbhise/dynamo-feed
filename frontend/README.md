# Dynamo Feed

A personal portfolio you scroll like a short-video app: an endless feed of animated
cartoon reels in the middle, a condensed portfolio on the left, and "Off the clock"
on the right. Frontend only — every piece of content lives in JSON files.

## How to edit

### Where the content lives

- `src/content/profile.json` — the left column: name, one-liner, photo, location,
  socials, stats, experience, projects, writing, community, education, certifications.
- `src/content/now.json` — the right column: `updatedAt`, what you're reading,
  the watch-this deck, latest writing, volunteering, Duolingo streak.
- `src/content/reels.json` — the feed itself: every reel, its template, beats,
  captions and like counts.
- `src/content/cast.json` — the cartoon cast: colour, scale, headroom and framing
  (`full` = stands on the caption line, `waist` = sits on the bottom edge).

All four files are validated at load with zod (`src/content/schemas.ts`) — a wrong
field fails loudly in the console instead of rendering broken.

### Left column components (`src/components/profile/`)

`LeftColumn.tsx` reads `profile.json` and renders these in order:

- `ProfileHeader.tsx` — photo (falls back to `/avatar.svg`), name, one-liner, location chip.
- `SocialLinks.tsx` — circular platform logos, plus the resume circle.
- `StatsStrip.tsx` — the small value/label cards.
- `CollapsibleSection.tsx` — a section header (name + count + chevron) that expands
  smoothly; only one is open at a time. Uses `ItemCard.tsx` for each row.
- `ItemCard.tsx` — one short row: title, subtitle, dates, one line, optional links,
  and a "Watch the reel" chip when the item has a `reelSlug`.
- `FooterCta.tsx` — the "Talk to the human instead" email/resume card.

### Right column components (`src/components/cards/`)

`RightColumn.tsx` reads `now.json` and renders these in order:

- `NowReadingCard.tsx` — book cover (or a placeholder block), progress, take.
- `WatchThisCard.tsx` — wraps `SwipeDeck.tsx`, the swipeable stack of recommendations.
- `LatestWritingCard.tsx` — links to posts (hidden automatically when the array is empty).
- `VolunteeringCard.tsx` — status + text.
- `LearningSpanishCard.tsx` — Duolingo streak.

### Adding, removing and reordering

- **Add a card**: create a component under `cards/` (or `profile/`) that takes its
  data as props, then add one line to the list in `RightColumn.tsx` (or
  `LeftColumn.tsx`). Put its data in the matching JSON file.
- **Remove a card**: delete its line from the column file; delete the component file
  if you're done with it.
- **Reorder cards**: move the line up or down in the column file — the order in the
  file is the order on screen.
- **Left-column sections and items** come straight from the arrays in
  `profile.json`: add an object to add an item, remove it to remove the item.
  Empty arrays hide their whole section.
