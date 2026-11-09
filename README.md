# Dynamo Feed — Saurav Bhise's portfolio

A portfolio that scrolls like a feed of cartoon reels: a vertical reel player
with live comments, an Instagram-style profile column with story highlights,
and data-driven pages — all content lives in `frontend/src/content/*.json`.

See [frontend/README.md](frontend/README.md) for how to edit everything.

- Stack: React + Vite + TypeScript + Tailwind CSS + Framer Motion. Static
  frontend plus one Vercel function (`frontend/api/duolingo.js`); no database.
- Deploy: Vercel (SPA rewrites for `/r/:slug` and `/p/:slug` live in
  `frontend/vercel.json`). Set `VITE_SITE_URL` to your domain for the
  canonical link, Open Graph tags and the build-time `sitemap.xml`.
