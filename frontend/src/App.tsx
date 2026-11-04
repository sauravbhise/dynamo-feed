import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { PageLayer } from "./components/PageLayer";
import { castById } from "./content";

export default function App() {
  // Preload every sprite sheet at load so pose changes never flash (Saurav
  // renders as a placeholder, no sheet to fetch).
  useEffect(() => {
    Object.keys(castById)
      .filter((id) => id !== "saurav")
      .forEach((id) => {
        const img = new Image();
        img.src = `/cast/${id}.webp`;
      });
  }, []);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Layout />
        <PageLayer />
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
