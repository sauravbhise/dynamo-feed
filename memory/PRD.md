# Dynamo Feed — PRD

## Original Problem Statement
Personal portfolio "Dynamo Feed" styled as a short-video app: centre = feed of cartoon "reels"; left = condensed portfolio; right = "Off the clock". Frontend only, static, Vercel-hostable. React + Vite + TypeScript + Tailwind + Framer Motion. Content from zod-validated JSON files in src/content.

## Design (v2 — current)
Warm dark rounded theme: bg #211C1F, surfaces #2B2428, raised #352C30, cream #F2EAE2, muted #B9ADA6; sage #93B29C (deep #1A3122), rose #D96A6A; cast pastels: reginald #C7B3D9, blaze #E0A58C, marge #DEC490, tia #D9A5AE, saurav #A9BED6. Nunito display / Inter body. desk breakpoint 1200px.

## Architecture
- Vite 6 + React 19 + TS in /app/frontend. No backend. Content: src/content/{profile,now,reels,cast}.json + schemas.ts (zod, fail-loud) + index.ts (profileItemBySlug, timeAgo).
- Columns are thin renderers; every card is its own component:
  - src/components/cards/: CardTitle (shared), NowReadingCard, WatchThisCard (wraps ../SwipeDeck), LatestWritingCard, VolunteeringCard, LearningSpanishCard — RightColumn renders the list in order, reads now.json.
  - src/components/profile/: ProfileHeader, SocialLinks, StatsStrip, CollapsibleSection, ItemCard, FooterCta — LeftColumn renders the list in order, reads profile.json, owns open/highlight state + event listeners.
- Components take data as props; only column files read JSON. README "How to edit" documents add/remove/reorder.

## Cast & CharacterSlot (fixed 2026-11-02)
- cast.json has headroom per character (fraction of frame height above the drawing): reginald 0.29, blaze 0.33, marge 0.43, tia 0.31, saurav 0. Marge scale 1.2→1 (was covering content).
- Box height = heightPercent × scale ÷ (1 − headroom) → VISIBLE character = heightPercent × scale (templates pass 40).
- Waist characters (Tia): NO 200% box — same box as full, anchored flush to the reel's bottom edge (her sheet art is pre-cut at the waist).
- align prop ("left"|"center"|"right", default center) replaces fixed left:16.
- Name chip REMOVED from CharacterSlot; speaker name shows in the caption area (NAME ONLY — no role/personality, per user).

## Unified template layout (one layout for every template)
- Top zone (0–35%): template card/graphic — review card, myth card, news banner, stat number, doc title, chat bubbles (storytime exception: 8%→50%).
- Middle: character on the ground line just above the caption zone (full) or flush bottom (waist).
- Caption zone (bottom 22%): speaker name (data-testid=speaker-name) + beat caption (ReelCaption.tsx) + profile chip in the same row (ProfileReelChip.tsx, only when slug matches profile.json) + progress bar at the very bottom.
- Every template renders ReelBackground (breaking news now does too).
- Storytime: bubbles = previous beats only (last 3, fading 0.95/0.65/0.4), typing indicator before the current line, current line ONLY in the caption zone (no duplicate text). "Part X of Y" chip + next-part card kept.
- Breaking news: spoken line is the caption (no right-side bubble); caption zone column holds ReelCaption + lower-third headline; ticker at the very bottom.
- StatReveal: counter runs on its OWN 1.4s rAF clock when active on the value beat (was beat-progress-coupled and stuck at 0 when paused/neighbour-mounted); shows final value whenever not counting (data-testid=stat-count).
- Sprites FREEZE when paused: TemplateProps gained active+paused; ReelPlayer passes paused={paused && active}; CharacterSlot stops bob + Reginald flip while paused.
- NudgeTemplate (template "nudge", slug talk-to-the-human): message + Email/LinkedIn/Resume buttons, speaker name line, CharacterSlot paused-aware.

## Left column
Header (photo /avatar.svg fallback, name, one-liner, location chip) → SocialLinks (logo circles + sage resume circle) → StatsStrip → 5 collapsible sections (all collapsed, one open, counts; empty hidden): Experience, Projects, Writing and research, Community, Education and certifications → FooterCta "Talk to the human instead". ItemCard: title/subtitle/dates/one line/links + "Watch the reel" chip (reelSlug → dynamo:goto-reel → FeedFrame appends generations until found, scrolls, autoplays). Reel chip → dynamo:focus-profile-item → opens section, scrolls, sage ring flash; Layout opens the portfolio sheet <1200px.

## Right column — "Off the clock"
Title + "Updated X ago" (pulsing dot, now.updatedAt) → NowReadingCard (cover fallback block, progress 0–100) → WatchThisCard/SwipeDeck (swipe-only: tilt, fly-off at ±110px or fling 550, spring-back, endless loop, arrow keys; NO buttons/counter/labels per user) → LatestWritingCard (hidden when empty) → VolunteeringCard → LearningSpanishCard.

## Feed engagement
Likes: double-tap (heart burst at tap point) or heart; +1 shown; localStorage dynamo:liked:<id> try/catch; aria-pressed on the rail button. Share: copies {origin}/r/:slug + "Link copied" sonner toast; native share sheet on coarse-pointer. Nudge: after 10 reel advances or 3 min (whichever first), NUDGE_REEL spliced at activeIndex+2 once per visit. OG/Twitter meta in index.html (og.png pending from user).

## Testing
- 2026-11-02 (round 1, /app/test_reports/iteration_1.json): ALL 7 user-reported bugs verified FIXED via headless Playwright (sprite pause freeze, chip in caption row + click-to-highlight, Marge visible 40% no overlap, bubbles 8–50% no clipping, name-only speaker, no duplicate text, counter reaches 600 incl. neighbour-mount case) + regressions (breaking news background, double-tap like persistence, swipe deck stripped, both columns, deep-link by /r/:slug — feed shuffles per load so test reels via slug URLs). tsc --noEmit + vite build clean.

## Backlog
- P0: real backgrounds (public/backgrounds/*.webp), real content for now.json (user's own "REPLACE:" strings pending).
- P1: beat audio playback, me.jpg + og.png assets, resume real link.
- P2: Saurav sprite when art lands, saved-deck persistence, ProfileReelChip → context instead of window events (nit).

## Notes
- No GitHub remote configured on this repo (local git only) — "pull latest" was a no-op; local repo holds latest commits.
- No credentials/auth; static frontend only.
