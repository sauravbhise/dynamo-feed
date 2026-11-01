# Dynamo Feed — PRD

## Original Problem Statement
Personal portfolio "Dynamo Feed" styled as a short-video app: centre = feed of cartoon "reels"; left = condensed portfolio; right = "Off the clock" (was The Clock). Frontend only, static, Vercel-hostable. React + Vite + TypeScript + Tailwind + Framer Motion. Content from zod-validated JSON files in src/content.

## Design Revision (2026-10-31, v2 — current)
Warm dark rounded theme:
- bg warm charcoal #211C1F, surfaces #2B2428, text warm cream #F2EAE2, muted #B9ADA6
- accent sage #93B29C with dark green #1A3122 text on sage buttons; rose accent #D96A6A
- cast colours (dusty pastels): lavender #C7B3D9, peach #E0A58C, butter #DEC490, rose #D9A5AE, me = dusty blue #A9BED6
- 16–24px rounded corners, pill buttons, subtle shadows only; Nunito headings/captions, Inter body; sentence case everywhere

## Architecture
- Vite 6 + React 19 + TS in /app/frontend (`yarn start` → Vite :3000, supervisor-managed). No backend/db. `vite build` → static deploy.
- Content layer: src/content/{profile,cast,reels,now}.json + types.ts + schemas.ts (zod) + index.ts (safeParse at load, throws on invalid; profileItemBySlug; timeAgo).

## Left column (condensed portfolio — rebuilt from profile.json 2026-11-02)
- Header: large round photo (falls back to /avatar.svg if /me.jpg missing), name, one-liner, location chip.
- Circular social links (logos only): linkedin/github/email from profile.socials; last circle = resume (opens resumeUrl new tab).
- Stats strip: grid of small value/label cards (4 in profile.json).
- Collapsible sections, ALL collapsed by default, ONE open at a time, smooth height+chevron animation, header shows name + count: Experience, Projects, Writing and research, Community, Education and certifications (edu + certs merged). Empty sections hidden. Items: title, subtitle (org/tags), dates, one line; project links rendered as small links.
- Items with reelSlug show "Watch the reel" chip → dispatches `dynamo:goto-reel` CustomEvent → FeedFrame appends generations until the slug exists, then smooth-scrolls and autoplays.
- Reverse: reels whose slug appears in profile.json show a chip (ReelPlayer, bottom-22% left, in caption area) → dispatches `dynamo:focus-profile-item` → LeftColumn opens that section, scrolls to item, flashes sage ring 2.6s; Layout opens the portfolio sheet when viewport <1200px (left column hidden).
- Footer card: "Talk to the human instead" + Email (mailto) + Resume buttons.

## Right column — "Off the clock" (now.json, rebuilt 2026-11-02)
- Title "Off the clock" (desktop column + mobile top-bar button + bottom sheet); "Updated X ago" with pulsing sage dot from now.updatedAt.
- Cards: Now reading (cover fallback block when cover empty; progress 0–100), Watch this = swipe deck, Latest writing (hidden when empty), Volunteering (status chip + text), Learning Spanish (Duolingo streak).
- Watch this = dating-app swipe deck (SwipeDeck.tsx): stack with two peeking cards; drag x with tilt (rotate from drag distance); sage "Save" label fades in dragging right, rose "Skip" dragging left; commit at ±110px or fling velocity 550, else springs back; round skip/save buttons; ArrowLeft/ArrowRight when deck focused; loops endlessly (modular index); "Saved N" counter above.

## Feed engagement
- Likes: count shown from reels.json; double-tap reel or tap heart → heart fills, count +1, burst of 8 small hearts at tap point (double-tap only); remembered in localStorage `dynamo:liked:<id>` (all localStorage wrapped in try/catch). Double-tap = like, single tap = pause (240ms tap timer).
- Share: copies {origin}/r/:slug + sonner toast "Link copied"; native share sheet on coarse-pointer devices with navigator.share.
- The nudge: after 10 reels watched (scroll advances) or 3 minutes in feed, whichever first — NUDGE_REEL (template "nudge", slug talk-to-the-human, host saurav) spliced in at activeIndex+2, once per visit; message + Email/LinkedIn/Resume buttons; feed continues normally.
- Meta: OG + Twitter tags in index.html (og:image /og.png — user adds the file).

## Mobile
- Feed fills screen; top bar avatar opens portfolio (left full-height sheet), "Off the clock" button opens bottom sheet; sheets close via close button, overlay tap, or drag on header/handle (dragControls, dismiss at 90px/600 velocity; bottom sheet swipes down, left sheet swipes left).

## Personas
- Recruiter/visitor: scans portfolio, downloads resume, watches reels.
- Follower: comments on reels, follows Off-the-clock updates.

## Implemented
- 2026-10-31: v2 warm rounded redesign, now.json + schema, comments overlay, Shorts-style rail + nav arrows, responsive modes.
- 2026-10-31: Feed engine — snap scroll, windowed mounting (±1), endless generations (series grouping + five-position no-repeat seam), /r/:slug replaceState sync + deep link, keyboard nav, swipe hints.
- 2026-10-31: Reel player — single rAF elapsed-time clock, audio-duration override (no playback), continuous bottom progress bar, tap pause, loop hint.
- 2026-10-31: Real cast + 6 templates + CharacterSlot sprite engine (480/680 waist math, 12.5% frame shift) + ReelBackground with host-colour fallback; Marge scale 1.2; caption zone CAPTION_ZONE=22%.
- 2026-11-02: Left column rebuilt from new profile.json (header/socials/stats/collapsibles/footer, reel↔item chips both directions); Right column → "Off the clock" from new now.json incl. SwipeDeck; likes + double-tap burst + localStorage; share + toast; nudge reel + "nudge" template; OG/Twitter meta; sheet drag-to-close. Verified: tsc --noEmit clean + vite build clean (user tests manually — no screenshots/testing agent per instruction).

## User's reels.json (authoritative, used verbatim)
7 reels with likes: r01 breaking_news, r02 documentary, r03 stat_reveal, r04 review, r05 myth_vs_fact, r06/r07 storytime series. audioSrc optional/unused.

## Backlog
- P0: real backgrounds (drop webp files into public/backgrounds/), like counts server-side (currently local only).
- P1: beat audio playback, /r/:slug share preview polish, more templates.
- P2: Saurav sprite when art lands, real me.jpg/og.png/resume/reading-cover assets, saved-deck persistence.

## Notes
- Placeholders in public/: avatar.svg, covers/, resume.txt. me.jpg + og.png pending from user.
- No credentials/auth; static frontend only.
