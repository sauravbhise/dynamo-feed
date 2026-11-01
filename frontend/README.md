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

### Voices

Reels can speak their captions. Audio files live in `public/audio/`, listed in
`public/audio/manifest.json`, which maps `{reelSlug}:{beatIndex}` keys to file
paths — a beat has audio only if its key is in the manifest (missing files are
never probed). At runtime the app is fully manifest-driven:

- sound is **off by default** — a "Tap for sound" pill shows on the first reel
  that has audio, a speaker button in the action rail toggles it, and the choice
  is remembered in localStorage;
- with sound on, each beat plays its file and lasts the audio duration plus
  300 ms (or the reading time, whichever is longer); pause/resume/scroll/loop
  all stay in sync with the audio, and the current + next reel are preloaded;
- an `AnalyserNode` measures the playing voice's loudness: Reginald's mouth
  switches neutral/talking on a loudness threshold, other characters get a
  small extra bob scaled to it; with sound off everything is timer-driven.

**Generating the voices** — `scripts/generate-voices.mjs`, run locally with Node
(never in the browser):

1. Pick a voice for each character from your TTS provider's voice library and
   put its id in `cast.json` as `voiceId` (characters with an empty `voiceId`
   are skipped).
2. Export the API key — `ELEVENLABS_API_KEY` for the default provider. The key
   is read from the environment and never committed.
3. `node scripts/generate-voices.mjs --dry-run` lists every beat it would
   generate with the character and the number of characters of text.
4. `node scripts/generate-voices.mjs` writes one file per beat into
   `public/audio/` and updates `manifest.json`. Files are cached by a hash of
   the character + caption, so unchanged lines are never regenerated —
   re-running after editing one caption is cheap (`--force` regenerates all).

The provider sits behind a small adapter interface (see `adapters` in the
script); ElevenLabs is the default, add another adapter and set
`VOICE_PROVIDER` to switch. `public/audio/sample.wav` is a short test sound
(already listed in the manifest for the first reel's first beat) so playback can
be checked before any real voice exists. Auto-reels are included automatically —
the script reads the same generated reels as the app.

### Auto-reels

Besides the hand-made reels in `reels.json`, the feed also contains reels generated
at runtime from `now.json` — the Now-reading update, each Watch-this pick, the
Duolingo streak, volunteering and every writing link. All of the wording lives in
`src/content/autoScripts.json`:

- each kind of update has two or three script variants; a variant picks the
  template and the host character and lists its beats (character, pose, caption);
- captions can use placeholders — `{title}`, `{author}`, `{progress}`, `{take}`,
  `{why}`, `{year}`, `{kind}`, `{streak}`, `{text}`, `{status}` and `{platform}` —
  which are filled from `now.json` when the reel is built;
- the `comments` pools are the cast comments shown on generated reels;
- the Spanish streak has a `milestoneScript` with extra hype, used whenever the
  streak is a multiple of 100.

Updating `now.json` creates new reels automatically — no extra code. Items whose
fields are empty or contain the word "REPLACE" are skipped, so placeholder drafts
never reach the feed. Generated reels pass the exact same validation as
`reels.json`, get stable share links (`/r/auto-watch-…`, built from the content) and
stable joke like counts, are sprinkled through the feed (never two in a row), and
show a small "New" chip while `now.json`'s `updatedAt` is within the last 7 days.

