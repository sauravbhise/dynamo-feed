// Vercel function: the live Duolingo streak. Duolingo doesn't allow browser
// requests, so this fetches it server-side. The username comes from now.json,
// not the request, so the endpoint can't be used to look up other accounts.
const now = require("../src/content/now.json");

module.exports = async function handler(_req, res) {
  try {
    const username = encodeURIComponent(now.spanish.duolingoUsername);
    const upstream = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) throw new Error(`Duolingo responded ${upstream.status}`);

    const body = await upstream.json();
    const streak = body?.users?.[0]?.streak;
    if (!Number.isInteger(streak) || streak < 0) throw new Error("No streak in response");

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ streak });
  } catch (error) {
    console.warn("[duolingo]", error);
    // Never cached, so the next request retries. The card falls back to now.json.
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ streak: null });
  }
};
