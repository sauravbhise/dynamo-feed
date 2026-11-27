import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { PageLayer } from "./components/PageLayer";
import { castById, profile } from "./content";

export default function App() {
  // Preload every sprite sheet at load so pose changes never flash.
  useEffect(() => {
    Object.keys(castById).forEach((id) => {
      const img = new Image();
      img.src = `/cast/${id}.webp`;
    });
  }, []);

  // The meta description follows profile.json's one-liner (index.html keeps
  // the static fallback for crawlers).
  useEffect(() => {
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", profile.oneLiner);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", profile.oneLiner);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", profile.oneLiner);
  }, []);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Layout />
        <PageLayer />
        {/* Vercel Web Analytics — production builds only. */}
        {import.meta.env.PROD && <Analytics />}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2B2428",
              color: "#F2EAE2",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            },
          }}
        />
      </MotionConfig>
    </ErrorBoundary>
  );
}
