// Pluggable contrast metrics (S5.4, FR-16, research.md §3). A metric is a strategy with an `id`
// that names its threshold block in `kontrastSojloj`, so the check never hard-codes a threshold.
// WCAG 2.x is binding; APCA is advisory only. Pure.

import Color from "colorjs.io";
import type { ColorValue, KontrastSojloj } from "../../generated/modelo-schema.js";
import { toColorjs } from "./color.js";

/** A metric ID is the key of its thresholds in `DimensioValoro.kontrastSojloj`. */
export type ContrastMetricId = keyof KontrastSojloj;

export interface ContrastMetric {
  readonly id: ContrastMetricId;
  /** Human label for messages, e.g. "WCAG 2.x contrast ratio". */
  readonly label: string;
  /** The measured value for `foreground` on an opaque `background`. */
  compute(foreground: ColorValue, background: ColorValue): number;
  /** Whether the measured value meets the threshold. */
  passes(value: number, threshold: number): boolean;
  /** A measured value as shown in messages, e.g. `5.14:1` or `Lc 68.3`. */
  formatValue(value: number): string;
  /** A threshold as shown in messages, exactly as in the data, e.g. `7:1` or `Lc 75`. */
  formatThreshold(threshold: number): string;
}

/** Two decimals, rounded towards zero, so a failing value never prints as its threshold. */
export function truncate2(value: number): string {
  return (Math.trunc(value * 100 + 1e-9) / 100).toFixed(2);
}

/** WCAG 2.x relative-luminance contrast ratio, 1..21, symmetric in its arguments (binding). */
export const WCAG2_METRIC: ContrastMetric = {
  id: "wcag2",
  label: "WCAG 2.x contrast ratio",
  compute: (foreground, background) =>
    Color.contrastWCAG21(toColorjs(foreground), toColorjs(background)),
  passes: (value, threshold) => value >= threshold,
  formatValue: (value) => `${truncate2(value)}:1`,
  formatThreshold: (threshold) => `${threshold}:1`,
};

/**
 * APCA lightness contrast Lc (advisory). Lc is signed by polarity (negative for light text on a
 * dark background); thresholds are compared with its absolute value.
 */
export const APCA_METRIC: ContrastMetric = {
  id: "apca",
  label: "APCA lightness contrast",
  compute: (foreground, background) =>
    Math.abs(Color.contrastAPCA(toColorjs(background), toColorjs(foreground))),
  passes: (value, threshold) => Math.abs(value) >= threshold,
  formatValue: (value) => `Lc ${(Math.trunc(Math.abs(value) * 10 + 1e-9) / 10).toFixed(1)}`,
  formatThreshold: (threshold) => `Lc ${threshold}`,
};

/** The registered metrics, binding first. */
export const CONTRAST_METRICS: readonly ContrastMetric[] = [WCAG2_METRIC, APCA_METRIC];
