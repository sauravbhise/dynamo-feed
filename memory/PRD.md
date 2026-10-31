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

## Backlog
- P0: reel beat player (timed beats), character rig with 8 poses.
- P1: scroll-snap feed with /r/:slug routing; template overlays (review, breaking_news, myth_vs_fact…); Watch-this swipe deck.
- P2: joke-counter likes, share cards, voices (audioSrc), profile.json "now" section merge with The Clock, real photo/resume/covers.

## Notes
- Placeholders: /avatar.svg, /covers/reading.svg, /resume.txt — swap for real assets later.
- No credentials/auth; static frontend only.
