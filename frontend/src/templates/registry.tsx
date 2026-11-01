import type { ComponentType } from "react";
import type { MotionValue } from "framer-motion";
import { ReviewTemplate } from "./ReviewTemplate";
import { BreakingNewsTemplate } from "./BreakingNewsTemplate";
import { DocumentaryTemplate } from "./DocumentaryTemplate";
import { StorytimeTemplate } from "./StorytimeTemplate";
import { MythVsFactTemplate } from "./MythVsFactTemplate";
import { StatRevealTemplate } from "./StatRevealTemplate";
import { NudgeTemplate } from "./NudgeTemplate";
import type { Beat, Reel, ReelTemplate } from "../content/types";

export interface TemplateProps {
  reel: Reel;
  beat: Beat;
  beatIndex: number;
  /** 0 → 1 across the current beat. */
  progress: MotionValue<number>;
  /** Beat data accumulated from every beat up to now. */
  data: Record<string, unknown>;
  reducedMotion: boolean;
}

export const str = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;
export const num = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

export const TEMPLATES: Record<ReelTemplate, ComponentType<TemplateProps>> = {
  review: ReviewTemplate,
  breaking_news: BreakingNewsTemplate,
  documentary: DocumentaryTemplate,
  storytime: StorytimeTemplate,
  myth_vs_fact: MythVsFactTemplate,
  stat_reveal: StatRevealTemplate,
  nudge: NudgeTemplate,
};
