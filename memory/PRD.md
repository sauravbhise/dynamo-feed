# Dynamo Feed — PRD

## Original Problem Statement
Personal portfolio "Dynamo Feed" styled as a short-video app: centre = feed of cartoon "reels"; left = condensed portfolio; right = "The Clock" (was comments/ask). This phase: project setup + layout only — no scrolling feed, animations or characters. Frontend only, static, Vercel-hostable. React + Vite + TypeScript + Tailwind + Framer Motion. Content from zod-validated JSON files in src/content.

## Design Revision (2026-10-31, v2 — current)
Neo-brutalism removed. Warm dark rounded theme:
- bg warm charcoal #211C1F, surfaces #2B2428, text warm cream #F2EAE2, muted #B9ADA6
- accent sage #93B29C with dark green #1A3122 text on sage buttons
- cast colours (dusty pastels): lavender #C7B3D9, peach #E0A5EC, butter #DEC490, rose #D9A5AE (user hex had typo #T9A5AE), me = dusty blue #A9BED6
- 16–24px rounded corners, pill buttons, subtle shadows only; Nunito headings/captions, Inter body; sentence case everywhere

## Architecture
- Vite 6 + React 19 + TS in /app/frontend (`yarn start` → Vite :3000, supervisor-managed). No backend/db. `vite build` → static Vercel deploy.
- Content layer: src/content/{profile,cast,reels,now}.json + types.ts + schemas.ts (zod) + index.ts (safeParse at load, throws on invalid; timeAgo helper).

## Layout (verified in preview)
- ≥1200px: portfolio (320px) / 9:16 rounded player (Shorts-style) / The Clock (360px). Like/dislike/comment/share rail outside player right; up/down nav arrows far right.
- 768–1199px: portfolio behind avatar button; Clock column kept.
- <768px: feed fills screen; avatar opens portfolio sheet (left, full height); The Clock button opens bottom sheet; comments slide up INSIDE player covering bottom 60% with close button.
- Left column: round photo → name → one-liner → circular social icon row (logos only); placeholder sections: stories rings, stats, now, highlights, experience, projects, education & certs, resume pill button. (Wordmark, ep-0 badge, marquee, profile card all removed per request.)
- Player: character name chip + caption over soft dark fade, beat progress strip, no clock/handle/counter/phone bezel.

## The Clock (right column / sheet)
- Title + "Updated 2 days ago" with gentle pulsing sage dot (relative time computed from now.json `updated`).
- Cards from now.json: Now reading (cover, title, author, progress bar, take), Watch this (recommendations, swipe deck later), Latest writing (links with platform icons), Volunteering + Learning Spanish (Duolingo streak with flame icon).
- ask.json deleted; Comments/Ask tabs removed; comments live in the player overlay.

## Personas
- Recruiter/visitor: scans portfolio, downloads resume, watches reels.
- Follower: comments on reels, follows The Clock updates.

## Implemented
- 2026-10-31: v1 neo-brutalist shell; same day: v2 warm rounded redesign (current), now.json + schema, comments overlay, Shorts-style rail + nav arrows, all responsive modes.
- 2026-10-31: Feed engine — snap scroll (in player on desktop, full-bleed on mobile), windowed mounting (±1), leave = pause + reset, endless generations with series grouping (parts adjacent, in order) + five-position no-repeat seam rule (bug: seam check was off by one — fixed by walking the live feed), /r/:slug replaceState URL sync + deep-link start, keyboard (↓/J, ↑/K, Space), first-visit + after-loop "Swipe up" hints (localStorage flag), vercel.json rewrite for /r/:slug.
- 2026-10-31: Reel player — single rAF elapsed-time clock (exact pause/resume), beat sequence by durationMs with audio-duration override (metadata preloaded, no playback; missing file falls back), top segmented progress bar (per-frame DOM writes, no per-frame re-render), tap to pause with pause icon, loop on end, beat placeholder render (character colour bg, name chip, pose label, caption with punchy spring entrance; reduced-motion = fades), reels.json now 8 reels covering all six templates + a two-part series.
- 2026-10-31: Real cast + templates — sprite sheets (2000×354, 8 frames of 250×354; user brief said 3840×680 — files are downscaled, sprite math is proportional) preloaded at boot; CharacterSlot (frame-index swap + squash bounce, idle/speak bob, mount slide-in, Reginald 180ms neutral↔talking flip while speaking, waist framing = 200% sprite clipped to slot, Saurav = soft rounded placeholder); cast.json updated to reginald/blaze/marge/tia/saurav with scale + framing (personality field dropped — not in new spec); template registry + six templates (review card w/ 3.5-star fill + verdict stamp, breaking news banner/lower-third/looping ticker, documentary letterbox + Ken Burns + title card + subtitles, storytime chat bubbles + typing indicator + Part X of Y + next-part card, myth-vs-fact 3D flip, stat count-up + before/after wipe); ReelBackground loads /backgrounds/{template}.webp with host-colour two-tone fallback + bottom fade; beat data merged forward across beats and validated per template with zod (strict) at load. Fixes: segment fill three-state (accumulator bug made upcoming segments animate), dislike button removed, all scrollbars hidden (scroll intent preserved).

- 2026-10-31: Layout fix batch (user feedback) — Tia waist math: box is 480/680 aspect, doubled (200% w/h, origin bottom-center) and clipped by the reel's bottom edge so the sheet shows waist-up; sprite sheet w-[800%] shifted by frameIndex*12.5%; continuous single progress bar along the bottom edge (scaleX = whole-reel progress, resets on loop, replaces segmented strip); caption zone constant CAPTION_ZONE=22% (full-framed characters stand on it, captions inside it); Storytime bubbles 92% width stacked in the upper band above Tia; Breaking News spoken line sits right-aligned at bottom-26% clear of the character, ticker badge-free; Marge scale 1.2 in cast.json; ReelBackground fallback verified in place (host-colour two-tone gradient when /backgrounds/{template}.webp is missing). Verified by code read + `tsc --noEmit` clean per user instruction (no screenshots/testing agent — user tests manually).

## User's reels.json (authoritative, used verbatim)
7 reels: r01 breaking_news (blaze), r02 documentary (reginald), r03 stat_reveal (blaze, value 600), r04 review (marge, stars 3.5 → verdict), r05 myth_vs_fact (marge), r06/r07 storytime series "outreach" parts 1-2 (tia). Schema unchanged apart from cast; audioSrc still optional/unused.

## Backlog
- P0: backgrounds (drop webp files into public/backgrounds/ — no code change needed), like/dislike persistence.
- P1: template extras polish (review per-beat lines from data, more templates), Watch-this swipe deck, /r/:slug share preview meta.
- P2: joke-counter likes, Saurav sprite when art lands, profile.json "now" section merge with The Clock, real photo/resume/covers.

## Notes
- Placeholders: /avatar.svg, /covers/reading.svg, /resume.txt — swap for real assets later.
- No credentials/auth; static frontend only.
