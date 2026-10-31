# Dynamo Feed — PRD

## Original Problem Statement
Personal portfolio "Dynamo Feed" styled as a short-video app: centre = endless vertical feed of animated cartoon "reels" about the owner; left = static condensed portfolio; right = comments + "Ask me" chat. **This session: project setup and layout only** — no scrolling feed, animations or characters yet. Frontend only, static, Vercel-hostable. React + Vite + TypeScript + Tailwind + Framer Motion. Content from four zod-validated JSON files in src/content.

## Architecture
- Vite 6 + React 19 + TypeScript in /app/frontend (CRA template fully removed; `yarn start` → Vite on :3000, supervisor-managed).
- No backend, no database. Static build; deployable to Vercel as-is (`vite build`).
- Tailwind 3.4 with neo-brutalist tokens; fonts: Archivo Black (display) + Inter (body) via Google Fonts.
- Content layer: src/content/{profile,cast,reels,ask}.json → types.ts (hand-written TS types) → schemas.ts (zod) → index.ts (safeParse at module load; throws on invalid content).

## Design Tokens
- ink #0B0B10 (bg), surface #14141E, raised #1C1C2A, line #F4F2EC (text/borders), muted #8E8CA0, accent #B026FF (electric purple = "me").
- Cast colours: narrator #FFC53D, saurav #3DE0FF, prof #7CFF6B, hype #FF5CA8, self #B026FF.
- 3px outlines, hard offset shadows (no blur), flat blocks, custom bolt logo mark (also favicon).

## User Personas
- **Visitor/recruiter**: scans portfolio in left column, watches reels, downloads resume.
- **Friend/follower**: comments and asks questions in the right rail.

## Core Requirements (static)
1. Layout: 3 columns ≥1200px (320 / phone-frame 9:16 / 360 with Comments + Ask me tabs); 768–1199 left behind Profile button; <768 feed fills screen, top-bar avatar opens portfolio sheet, comments/ask open as bottom sheets.
2. Components: Layout, LeftColumn, FeedFrame, ActionRail, RightColumn, Sheet (+ Logo).
3. Left column sections: photo/name/one-liner, story rings, stats strip, Now (reading/watching), highlights, experience, projects, education & certs, links + resume download.
4. Phone frame: reel placeholder, action rail (like/comment/share/ask), caption area, beat progress strip.

## Implemented (2026-10-31)
- Vite+TS migration, all tokens, fonts, favicon/logo, content JSONs + zod validation, all six components, all three responsive modes, marquee strip, masked wordmark reveal, spring phone-frame entrance, working local comment/ask composers, data-testids throughout.

## Backlog (next sessions)
- P0: reel beat player (timed beats, progress), character rig with poses.
- P1: scroll-snap feed with /r/:slug routing; template overlays (review, breaking_news, myth_vs_fact...).
- P2: "joke counter" like mechanics, share cards, voices (audioSrc), ask-me chat bot.

## Notes
- Resume button downloads placeholder /resume.txt; photo is /avatar.svg placeholder — replace with real assets later.
