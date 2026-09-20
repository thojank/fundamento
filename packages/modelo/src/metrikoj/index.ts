// The metrics of Spec 004 (plan D-12): one calculation, four users — the Reguloj, the Aspiroj of a
// brand, the Vitrino and the later report. Every metric returns numbers; the judgement belongs to
// the Regulo with its sojlo or to the Aspiro with its bound.

export * from "./contrast.js";
export * from "./gamut.js";
export * from "./kovrado.js";
export * from "./lightness.js";
export * from "./typography.js";

/** Stable IDs, as `sojlo.metric` and `aspiro.metriko` name them. */
export const METRIKO_IDS = [
  "wcag2-reserve",
  "oklch-l-delta",
  "oklch-l-extreme",
  "oklch-l-step",
  "oklch-l-step-consistency",
  "oklch-l-align",
  "srgb-gamut",
  "type-scale-ratio",
  "type-scale-consistency",
  "type-rhythm",
  "dimensio-kovrado",
] as const;

export type MetrikoId = (typeof METRIKO_IDS)[number];
