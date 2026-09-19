// One KontrastParo in one combination, measured (Spec 002, D-09). The Alirebleco check derives
// its issues from these measurements, and `check_contrast` reports them, so the two cannot
// diverge (AK-04). A pair may name an alternative pair `aux`: it holds when the main pair or the
// alternative reaches the threshold. Pure.

import type {
  ColorValue,
  KontrastKategorio,
  KontrastSojloj,
} from "../../generated/modelo-schema.js";
import { alphaOf, compositeOver } from "./color.js";
import type { ContrastMetric } from "./metrics.js";

/** One metric's result on one branch; `threshold` is absent when the Modelo declares none. */
export interface MetricMeasurement {
  value: number;
  threshold?: number;
  passed?: boolean;
}

/** The main pair or the alternative pair of a KontrastParo, measured. */
export interface BranchMeasurement {
  foreground: string;
  background: string;
  /** The value of the binding metric (WCAG 2.x ratio). */
  ratio: number;
  /** Whether the binding metric meets its threshold (true when no threshold is declared). */
  passed: boolean;
  /** The foreground had alpha < 1 and was composited over the background. */
  composited: boolean;
  /** The foreground's alpha when it was composited. */
  foregroundAlpha?: number;
  /** Every metric by ID (`wcag2`, `apca`). */
  metrics: Record<string, MetricMeasurement>;
}

export interface PairMeasurement {
  pair: { id: string; name: string; kialo?: string };
  combination: Record<string, string>;
  kategorio: KontrastKategorio;
  /** The binding threshold, when declared. */
  threshold?: number;
  main: BranchMeasurement;
  /** Present when the pair declares `aux` (measured even when the main pair passes). */
  aux?: BranchMeasurement;
  passed: boolean;
  /** The branch that carries the result; null when both fail. */
  branch: "main" | "aux" | null;
}

/** Measures one branch; `metrics[0]` is binding, the rest are advisory. */
export function measureBranch(
  names: { foreground: string; background: string },
  foreground: ColorValue,
  background: ColorValue,
  kategorio: KontrastKategorio,
  sojloj: KontrastSojloj | undefined,
  metrics: readonly ContrastMetric[],
): BranchMeasurement {
  const composited = alphaOf(foreground) < 1;
  const effective = composited ? compositeOver(foreground, background) : foreground;
  const measured: Record<string, MetricMeasurement> = {};
  for (const metric of metrics) {
    const value = metric.compute(effective, background);
    const block = sojloj?.[metric.id] as Record<string, unknown> | undefined;
    const threshold = block?.[kategorio];
    measured[metric.id] =
      typeof threshold === "number" && Number.isFinite(threshold)
        ? { value, threshold, passed: metric.passes(value, threshold) }
        : { value };
  }
  const binding = measured[metrics[0]?.id ?? ""];
  return {
    ...names,
    ratio: binding?.value ?? 0,
    passed: binding?.passed ?? true,
    composited,
    ...(composited ? { foregroundAlpha: alphaOf(foreground) } : {}),
    metrics: measured,
  };
}

/** Combines the branches of a pair: main carries when it passes, else aux when it passes. */
export function combineBranches(
  main: BranchMeasurement,
  aux: BranchMeasurement | undefined,
): { passed: boolean; branch: "main" | "aux" | null } {
  if (main.passed) return { passed: true, branch: "main" };
  if (aux?.passed === true) return { passed: true, branch: "aux" };
  return { passed: false, branch: null };
}
