import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Layout } from "./components/Layout";

const SPRITE_SHEETS = ["/cast/reginald.webp", "/cast/blaze.webp", "/cast/marge.webp", "/cast/tia.webp"];

export default function App() {
  // Preload every sprite sheet at load so pose changes never flash.
  useEffect(() => {
    SPRITE_SHEETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Layout />
    </MotionConfig>
  );
}
