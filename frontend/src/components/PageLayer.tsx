import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { pageBySlug, profile, reels } from "../content";
import type { PageBlock } from "../content/types";

// ---------- inline text: **bold** and [label](url) only ----------
function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) tokens.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      tokens.push(
        <strong key={key++} className="font-bold text-cream">
          {match[1]}
        </strong>
      );
    } else {
      tokens.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-sage underline underline-offset-2 transition hover:text-cream"
        >
          {match[2]}
        </a>
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

// ---------- blocks ----------
function TextBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-4" data-testid="page-block-text">
      {text
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph, i) => (
          <p key={i} className="text-[15px] leading-[1.65] text-cream/85">
            {renderInline(paragraph.trim())}
          </p>
        ))}
    </div>
  );
}

function ImageBlock({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [failed, setFailed] = useState(false);
  // A broken image hides the whole block.
  if (failed) return null;
  return (
    <figure data-testid="page-block-image">
      <img src={src} alt={alt} onError={() => setFailed(true)} className="w-full rounded-2xl" />
      {caption && <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function PageBlockView({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="font-display text-xl text-cream" data-testid="page-block-heading">
          {block.text}
        </h2>
      );
    case "text":
      return <TextBlock text={block.text} />;
    case "image":
      return <ImageBlock src={block.src} alt={block.alt} caption={block.caption} />;
    case "stats":
      return (
        <div className="flex flex-wrap gap-3" data-testid="page-block-stats">
          {block.items.map((stat) => (
            <div key={stat.label} className="min-w-[140px] flex-1 rounded-2xl bg-surface p-4 shadow-soft">
              <p className="font-display text-2xl text-sage">{stat.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      );
    case "chips":
      return (
        <div data-testid="page-block-chips">
          {block.label && (
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{block.label}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {block.items.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      );
    case "links":
      return (
        <div className="flex flex-wrap gap-3" data-testid="page-block-links">
          {block.items.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-xs font-bold text-sage-deep transition hover:scale-105 active:scale-95"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" />
            </a>
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-sage pl-4" data-testid="page-block-quote">
          <p className="text-[15px] italic leading-relaxed text-cream/85">“{block.text}”</p>
          {block.by && <footer className="mt-2 text-xs text-muted">— {block.by}</footer>}
        </blockquote>
      );
    case "divider":
      return <hr className="border-white/10" data-testid="page-block-divider" />;
    default:
      return null;
  }
}

// ---------- the full-screen page layer ----------
interface PageState {
  slug: string;
  /** "pushed": opened via Read more (a history entry exists). "direct": landed on /p/:slug. */
  mode: "pushed" | "direct";
}

export function PageLayer() {
  const [state, setState] = useState<PageState | null>(() => {
    const match = window.location.pathname.match(/^\/p\/([^/]+)/);
    return match ? { slug: decodeURIComponent(match[1]), mode: "direct" } : null;
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const prevTitleRef = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();

  const announce = (open: boolean) =>
    window.dispatchEvent(new CustomEvent<boolean>("dynamo:page-visibility", { detail: open }));

  // A page landed on directly from a shared link: title + pause, the same
  // open path as Read more. The path is captured at mount — the feed's URL
  // sync must not be able to poison this effect.
  const initialPathRef = useRef(window.location.pathname);
  useEffect(() => {
    const match = initialPathRef.current.match(/^\/p\/([^/]+)/);
    if (!match) return;
    const page = pageBySlug(decodeURIComponent(match[1]));
    if (!page) return;
    prevTitleRef.current = document.title;
    document.title = `${page.title} · ${profile.name}`;
    announce(true);
  }, []);

  const close = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    // Direct landings have no history entry — rewrite the URL to /.
    if (current.mode === "direct") window.history.replaceState(null, "", "/");
    if (prevTitleRef.current !== null) {
      document.title = prevTitleRef.current;
      prevTitleRef.current = null;
    }
    announce(false);
    setState(null);
    // Focus returns to the Read more button that opened the page.
    const slug = current.slug;
    window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>(`[data-testid="read-more-${slug}"]`)?.focus();
    }, 60);
  }, []);

  const handleBack = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    if (current.mode === "direct") {
      window.history.replaceState(null, "", "/");
      close();
    } else {
      window.history.back(); // popstate closes the layer
    }
  }, [close]);

  // Opened from a "Read more" button.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail;
      const page = pageBySlug(slug);
      if (!page || stateRef.current) return;
      prevTitleRef.current = document.title;
      window.history.pushState({ pageSlug: slug }, "", `/p/${slug}`);
      document.title = `${page.title} · ${profile.name}`;
      announce(true);
      setState({ slug, mode: "pushed" });
    };
    window.addEventListener("dynamo:open-page", onOpen);
    return () => window.removeEventListener("dynamo:open-page", onOpen);
  }, []);

  // The browser/phone back button closes the layer.
  useEffect(() => {
    const onPop = () => {
      const current = stateRef.current;
      if (!current) return;
      const match = window.location.pathname.match(/^\/p\/([^/]+)/);
      if (match) {
        // History landed on another page entry — swap the layer's content.
        const slug = decodeURIComponent(match[1]);
        const page = pageBySlug(slug);
        if (page && prevTitleRef.current !== null) {
          document.title = `${page.title} · ${profile.name}`;
        }
        setState({ slug, mode: current.mode });
        return;
      }
      close();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [close]);

  // Escape closes the page.
  useEffect(() => {
    if (!state) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, handleBack]);

  const page = state ? pageBySlug(state.slug) : undefined;

  const handleWatchReel = () => {
    if (!page?.reelSlug) return;
    close();
    // Same path as ItemCard's "Watch the reel".
    window.dispatchEvent(new CustomEvent<string>("dynamo:goto-reel", { detail: page.reelSlug }));
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="page-layer"
          data-testid="page-layer"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-6 md:px-8">
            <button
              type="button"
              onClick={handleBack}
              data-testid="page-back"
              aria-label="Back to the feed"
              className="sticky top-4 z-10 flex size-10 items-center justify-center rounded-full bg-surface text-cream/80 shadow-soft transition hover:-translate-y-0.5 hover:text-sage active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>

            {page ? (
              <article className="mt-6">
                {page.kicker && (
                  <p className="text-xs font-bold uppercase tracking-wide text-sage" data-testid="page-kicker">
                    {page.kicker}
                  </p>
                )}
                <h1 className="mt-2 font-display text-3xl leading-tight text-cream md:text-4xl" data-testid="page-title">
                  {page.title}
                </h1>
                {page.subtitle && <p className="mt-3 text-sm leading-relaxed text-muted">{page.subtitle}</p>}
                {page.dates && <p className="mt-1 text-xs text-muted">{page.dates}</p>}
                {page.reelSlug && reels.some((reel) => reel.slug === page.reelSlug) && (
                  <button
                    type="button"
                    onClick={handleWatchReel}
                    data-testid="page-watch-reel"
                    className="mt-5 flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-xs font-bold text-sage-deep transition hover:scale-105 active:scale-95"
                  >
                    <Play className="size-3.5" />
                    Watch the reel
                  </button>
                )}
                <div className="mt-8 flex flex-col gap-6">
                  {page.blocks.map((block, index) => (
                    <PageBlockView key={index} block={block} />
                  ))}
                </div>
              </article>
            ) : (
              <p className="mt-24 text-center text-sm text-muted" data-testid="page-not-found">
                This page doesn't exist.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
