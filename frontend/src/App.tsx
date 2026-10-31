import { MotionConfig } from "framer-motion";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Layout />
    </MotionConfig>
  );
}
