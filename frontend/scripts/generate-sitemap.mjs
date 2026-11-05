import { readFileSync, writeFileSync } from "node:fs";

// Build-time SEO files. VITE_SITE_URL comes from the environment (set it on
// Vercel) or frontend/.env; without it robots.txt still allows everything but
// no sitemap is written.
const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
const fromEnv = process.env.VITE_SITE_URL ?? envFile.match(/^VITE_SITE_URL=(.*)$/m)?.[1] ?? "";
const siteUrl = fromEnv.trim().replace(/\/+$/, "");

writeFileSync(
  new URL("../public/robots.txt", import.meta.url),
  `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ""}`
);

if (!siteUrl) {
  console.log("VITE_SITE_URL not set — sitemap.xml skipped (set it on Vercel for launch).");
} else {
  const pages = JSON.parse(readFileSync(new URL("../src/content/pages.json", import.meta.url), "utf8"));
  const urls = [`${siteUrl}/`, ...pages.map((page) => `${siteUrl}/p/${page.slug}`)];
  writeFileSync(
    new URL("../public/sitemap.xml", import.meta.url),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${url}</loc></url>`)
      .join("\n")}\n</urlset>\n`
  );
}
