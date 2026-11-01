// Bundled by scripts/generate-voices.mjs (via esbuild) so the Node script
// reads the exact same hand-written and auto-generated reels as the app.
import { reels } from "../src/content";
import { autoReels } from "../src/feed/autoReels";

export const allReels = [...reels, ...autoReels];
