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
- OVERLAP RULE (all templates): top-zone cards end above the character's head with a gap — headTopPercent(characterId, heightPercent) helper (CharacterSlot.tsx) computes the head line from size+framing; review + myth cards sit in maxHeight/overflow-hidden wrappers (headTop−5%). Content shows only the latest lines (older faded 0.55) instead of growing over the character (fixed Marge's review card).
- Middle: character on the ground line just above the caption zone (full) or flush bottom (waist).
- Caption zone (bottom 22%): speaker name (data-testid=speaker-name, NAME ONLY — no role) + profile chip in the same row (ProfileReelChip) + progress bar at the very bottom. Storytime shows ONLY the name row — its bubbles are the caption (last TWO including the current line, older faded 0.6, typing indicator for the first 700ms of each beat).
- Every template renders ReelBackground (breaking news does too). Breaking news: spoken line is the caption; caption column = ReelCaption + lower-third; ticker at the bottom.
- StatReveal: pause-aware count-up — accumulator freezes mid-count on pause and RESUMES from the same point; final value shown when inactive/not counting (never stuck at 0).
- PAUSE FREEZES EVERYTHING: PausedContext (PausedProvider/usePaused) from ReelPlayer (paused && active). Freezes: sprite idle bob, squash-on-pose, mount slide (renders final state while paused), Reginald 180ms flip, news ticker + typing dots (CSS animation-play-state:paused), stat count-up (resume-from-point), entrance animations (initial={false} while paused). Unpause resumes all.
- READING TIME: beatDurationMs(beat, template) in content/index.ts = clamp(1200 + 55×caption.length, 2500, 7000), storytime +700ms typing lead-in, beat.durationMs only wins when longer, audio metadata overrides when present. The continuous progress bar follows the computed total.
- NudgeTemplate (template "nudge", slug talk-to-the-human): message + Email/LinkedIn/Resume buttons.

## Left column
Header (photo /avatar.svg fallback, name, one-liner, location chip) → SocialLinks (logo circles + sage resume circle) → StatsStrip → 5 collapsible sections (all collapsed, one open, counts; empty hidden): Experience, Projects, Writing and research, Community, Education and certifications → FooterCta "Talk to the human instead". ItemCard: title/subtitle/dates/one line/links + "Watch the reel" chip (reelSlug → dynamo:goto-reel → FeedFrame appends generations until found, scrolls, autoplays). Reel chip → dynamo:focus-profile-item → opens section, scrolls, sage ring flash; Layout opens the portfolio sheet <1200px.

## Right column — "Off the clock"
Title + "Updated X ago" (pulsing dot, now.updatedAt) → NowReadingCard (cover fallback block, progress 0–100) → WatchThisCard/SwipeDeck (swipe-only: tilt, fly-off at ±110px or fling 550, spring-back, endless loop, arrow keys; NO buttons/counter/labels per user) → LatestWritingCard (hidden when empty) → VolunteeringCard → LearningSpanishCard.

## Feed engagement
Likes: double-tap (heart burst at tap point) or heart; +1 shown; localStorage dynamo:liked:<id> try/catch; aria-pressed on the rail button. Share: copies {origin}/r/:slug + "Link copied" sonner toast; native share sheet on coarse-pointer. Nudge: after 10 reel advances or 3 min (whichever first), NUDGE_REEL spliced at activeIndex+2 once per visit. OG/Twitter meta in index.html (og.png pending from user).

## Testing
- 2026-11-02 (round 1, /app/test_reports/iteration_1.json): ALL 7 user-reported bugs verified FIXED via headless Playwright (sprite pause freeze, chip in caption row + click-to-highlight, Marge visible 40% no overlap, bubbles 8–50% no clipping, name-only speaker, no duplicate text, counter reaches 600 incl. neighbour-mount case) + regressions (breaking news background, double-tap like persistence, swipe deck stripped, both columns, deep-link by /r/:slug — feed shuffles per load so test reels via slug URLs). tsc --noEmit + vite build clean.
- 2026-11-02 (round 2, /app/test_reports/iteration_2.json): pause-freezes-everything, reading-time-from-caption, storytime bubbles-as-caption, head-aware overlap rule — all PASS with measured evidence (count froze at 490 → resumed → 600; r03 beats 3.75s/4.07s/4.08s vs computed; review card bottom 21.2% vs Marge head 38%).
- 2026-11-02 (round 3, /app/test_reports/iteration_3.json): BEAT-FLASH FIX verified — root cause was the tick publishing beatProgress before setBeatIndex while templates derived state from progress events (one render combined new progress + old beat index). Fix: single beatState {index, startedAtMs} state; per-beat progress now DERIVED via useTransform(reelProgress) from the same elapsed time; the rAF tick has ONE publication point (reelProgress.set) and the beat index updates from a useMotionValueEvent on that same value (React batches index + progress-derived state into one render); reset effect sets index before publishing progress; Storytime typing + Myth flip states reset via useEffect on [beatIndex]; StatReveal count writes DOM text directly from beat-consistent progress (no state) with useLayoutEffect reset. Verified: 5/5 reels strictly ordered beats at 40-70ms polls over 2+ cycles, zero regressions; stat count monotonic 0→600, froze at 230 on pause, resumed to 600; reading time still caption-driven. tsc + vite build clean.

## Backlog
- P0: real backgrounds (public/backgrounds/*.webp), real content for now.json (user's own "REPLACE:" strings pending).
- P1: beat audio playback, me.jpg + og.png assets, resume real link.
- P2: Saurav sprite when art lands, saved-deck persistence, ProfileReelChip → context instead of window events (nit).

## Notes
- No GitHub remote configured on this repo (local git only) — "pull latest" was a no-op; local repo holds latest commits.
- No credentials/auth; static frontend only.
