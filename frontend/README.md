# Dynamo Feed

A personal portfolio you scroll like a short-video app: an endless feed of animated
cartoon reels in the middle, a condensed portfolio on the left, and "Off the clock"
on the right. Frontend only — every piece of content lives in JSON files.

## How to edit

### Where the content lives

- `src/content/profile.json` — the left column: name, one-liner, photo, location,
  socials, stats, experience, projects, writing, community, education, certifications.
- `src/content/now.json` — the right column: `updatedAt`, current obsession,
  the writing deck, what you're reading, Spanish, Matiks, volunteering.
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
- `SkillChips.tsx` — a compact, wrapping row of skill chips (hidden when
  `skills` in `profile.json` is empty).
- `CollapsibleSection.tsx` — a section header (name + count + chevron) that expands
  smoothly; each section opens and closes independently, Experience and Projects
  start open, and a closed section shows a one-line preview of its first item
  titles. Uses `ItemCard.tsx` for each row.
- `ItemCard.tsx` — one short row: title, subtitle, dates, one line, optional links,
  and a "Watch the reel" chip when the item has a `reelSlug`.

### Right column components (`src/components/cards/`)

`RightColumn.tsx` reads `now.json` and renders these in order:

- `CurrentObsessionCard.tsx` — project name, one-liner, repo link. `repo` is a
  GitHub `owner/name`; "Last worked on…" comes from the GitHub API and shows only
  for a push within 14 days.
- `WritingDeckCard.tsx` — wraps `SwipeDeck.tsx`, the swipeable stack of posts from
  `writing` (`platform`, `title`, `hook`, `date`, `readMinutes`, `url`). Tapping a
  card opens the post; hidden when the array is empty.
- `NowReadingCard.tsx` — `reading.current`, then a "Before this:" line from
  `reading.previous`.
- `SpanishCard.tsx` — score, level and the live streak from `api/duolingo.js`.
  If that fails it shows `streak` plus the days since `streakAsOf`.
- `MatiksCard.tsx` — `streak` plus the days since `streakAsOf`.
- `VolunteeringCard.tsx` — status + text; set `volunteering` to `null` to hide it.

Fields containing "REPLACE" count as drafts, and a draft obsession or Matiks date
hides that card.

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

## Launch (Vercel)

- Set `VITE_SITE_URL` (e.g. `https://your-domain.com`) in Vercel's project
  environment variables — it fills the canonical link, the Open Graph /
  Twitter URLs and the build-time `sitemap.xml` + `robots.txt` sitemap line
  (`scripts/generate-sitemap.mjs` runs on every build from `pages.json`).
- Add `public/og.png` (1200 × 630), `public/favicon.svg` and
  `public/apple-touch-icon.png`.
- The page `<title>` and meta description come from index.html (the
  description follows `profile.oneLiner` at startup); page layers restore
  that title on close.
- Vercel Web Analytics (`@vercel/analytics`) loads only in production
  builds; the visitor metrics show up in the Vercel dashboard.
- `frontend/vercel.json` keeps both SPA rewrites (`/r/:slug`, `/p/:slug`).

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

### Reel templates

Each reel's `template` picks how its beats render. Most templates read extra
beat data from `data` on the beat that carries it (usually beat 1) — extras
accumulate, so later beats see them too.

**`interview`** — a talk-show two-shot. The reel's `hostId` sits on the left,
the guest on the right; the beat's `characterId` is the speaker (full size and
lit), the other listens (dimmed, slightly smaller).

- Beat data (normally beat 1): `guest` (a cast id) and `topic` (string).
- If the guest is missing or not in the cast, the reel falls back to a
  single-character layout and logs a warning.

```json
{ "characterId": "blaze", "pose": "talking", "caption": "Welcome back to the show!", "durationMs": 3500, "data": { "guest": "saurav", "topic": "Why build a portfolio like this?" } }
```

**`tier_list`** — the host ranks things into tiers, one item per beat, items
dropping into a board above their head.

- Beat data (normally beat 1): `title` (string) and optional `tiers`
  (defaults to `["S", "A", "B", "C", "D"]`).
- Every beat can carry an `item`: `{ "label": "Java", "tier": "S" }`. Items
  accumulate beat by beat; an item whose tier is not in `tiers` is skipped
  with a warning.
- Full examples of both: `r08` (`blaze-interviews-saurav`, interview) and
  `r09` (`marge-ranks-the-stack`, tier list) in `reels.json`.

**`day_in_life`** — a vlog-style day: a clock kicker top-left and a quick cut
per beat.

- Beat 1 data: `title` (string, the small sage kicker).
- EVERY beat: `time` (string, shown big in font-display) and optional
  `label` (13px line under it). On beat changes the old time slides up and
  out while the new one slides into place (~250ms), and the character cuts
  in with an 8% slide from the right (~180ms).
- Example: `r12` (`a-day-in-the-life`) in `reels.json`.

**Per-reel background** — any reel can set an optional `background`: a path
under `public/` (e.g. `/backgrounds/blaze-interviews-saurav.webp`) or a full
URL. It beats the template default (`/backgrounds/<template>.webp`), which
beats the colour gradient — each step is only used if the previous image
fails to load, with results cached for the session.

**`stitch`** — a TikTok-style Stitch: beat 1 is a clip of another reel, then a
hard cut to the reply, with the clip kept as a tappable thumbnail.

- Beat 1 data: `stitchSlug` (the slug of an existing reel). Beat 1's
  `characterId` is the original speaker and its caption is the quoted line;
  beats 2+ are the reply (normally by the reel's `hostId`).
- The clip beat plays over the stitched reel's own background; beat 2 starts
  with a 120ms white flash. The reply keeps a picture-in-picture of the clip
  top-left — tapping it jumps the feed to the original reel.
- If `stitchSlug` matches no reel, the pill and thumbnail still show (without
  the tap) and a warning is logged.

**`pov`** — a native-feeling POV caption that floats over the whole reel.

- Beat 1 data: `pov` (the line, e.g. "POV: you just hired Saurav"). It stays
  on screen for every beat while the character changes underneath.

Full examples: `r10` (`marge-stitches-the-news`, stitch) and `r11`
(`pov-you-hired-saurav`, POV) in `reels.json`.

### Story highlights

Instagram-style circles under the bio (in `profile.json` → `highlights`):
`id`, `label`, `reelSlugs` (the reels the highlight plays, in order) and an
optional `cover` image path. Reel slugs that match no reel are skipped with a
warning; a highlight left without valid reels is hidden; no `highlights` key
means no row. Without a `cover`, the circle shows the first reel's host
(framed on the head; Saurav keeps his placeholder initial).

Tapping a highlight starts a session in the feed: only that highlight's reels
play, starting at the first one, with a pill up top showing the label,
position ("2/4") and an X. The session ends — returning the main feed to
exactly where it was — when the last reel finishes its first loop, when the
visitor swipes/wheels/presses next past it, on X, or on Escape. The nudge
never interrupts a session; the highlight's ring dims once it has been played
(localStorage key `df-highlights-seen`; clear it to reset).

### Coach mark

First-time visitors get a one-off "Swipe up for more" hint (touch) or
"Scroll or press ↓ for more" (mouse/keyboard) 1.5s into the first reel. It
disappears on the first scroll, swipe, wheel tick, arrow key, tap or nav
button — or after 4 seconds — and never shows again (localStorage key
`df-coach-seen`). To see it again: `localStorage.removeItem("df-coach-seen")`
and reload. While it shows, the floating live comment and the loop "Swipe up"
hint stay hidden.

### Adding a page

A page is one object in `src/content/pages.json` — no code changes needed. It
lives at `/p/<slug>`:

```json
{
  "slug": "my-project",
  "kicker": "Project",
  "title": "My project",
  "subtitle": "One-line summary.",
  "dates": "2025 – 2026",
  "reelSlug": "my-project-reel",
  "blocks": []
}
```

- `slug` is url-safe and unique; `kicker`, `subtitle`, `dates` and `reelSlug`
  are optional (`reelSlug` adds a "Watch the reel" jump to the feed).
- `blocks` is a list of typed blocks, rendered top to bottom:

```json
{ "type": "heading", "text": "Section heading" }
{ "type": "text", "text": "A paragraph.\n\nAnother one — **bold** and a [label](https://example.com) link work." }
{ "type": "image", "src": "/pages/my-project/cover.webp", "alt": "What it shows", "caption": "Optional caption" }
{ "type": "stats", "items": [{ "value": "50k", "label": "users" }, { "value": "12", "label": "services" }] }
{ "type": "chips", "label": "Built with", "items": ["React", "AWS"] }
{ "type": "links", "items": [{ "label": "Live demo", "url": "https://example.com" }] }
{ "type": "quote", "text": "A quote about the work.", "by": "Who said it" }
{ "type": "divider" }
```

- Text paragraphs are separated by a blank line; only `**bold**` and
  `[label](url)` are supported inline.
- Images live in `public/pages/<slug>/` — a broken image hides its whole
  block. Stats render as a row of 2–4 number cards.
- **Link a page from the left column**: add `"pageSlug": "my-project"` to any
  experience/project/writing/community/education item in `profile.json` — a
  "Read more" button appears next to "Watch the reel". Pages nothing links to
  are still reachable at `/p/<slug>`.
- An unknown slug at `/p/…` shows a short "This page doesn't exist" message —
  never a blank screen.

Sound is currently **disabled**: set `SOUND_ENABLED` to `true` in
`src/config.ts` to turn sound back on. While it is `false` no manifest is
fetched and no sound UI renders; the `?audiotest=1` URL switch still works for
testing.

### Auto-reels

Besides the hand-made reels in `reels.json`, the feed also contains reels generated
at runtime from `now.json` — the Now-reading update, the Duolingo streak,
volunteering and every writing link. All of the wording lives in
`src/content/autoScripts.json`:

- each kind of update has two or three script variants; a variant picks the
  template and the host character and lists its beats (character, pose, caption);
- captions can use placeholders — `{title}`, `{author}`, `{take}`, `{streak}`,
  `{text}`, `{status}` and `{platform}` — which are filled from `now.json` when
  the reel is built;
- the `comments` pools are the cast comments shown on generated reels;
- the Spanish streak has a `milestoneScript` with extra hype, used whenever the
  streak is a multiple of 100.

Updating `now.json` creates new reels automatically — no extra code. Items whose
fields are empty or contain the word "REPLACE" are skipped, so placeholder drafts
never reach the feed. Generated reels pass the exact same validation as
`reels.json`, get stable share links (`/r/auto-writing-…`, built from the content) and
stable joke like counts, are sprinkled through the feed (never two in a row), and
show a small "New" chip while `now.json`'s `updatedAt` is within the last 7 days.

