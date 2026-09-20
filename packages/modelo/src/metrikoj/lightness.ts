// Lightness metrics (Spec 004 T002, plan D-12, data-model §3). Pure numbers, no judgement: a
// Regulo or an Aspiro compares them with its own bound. All of them read OKLCH lightness through
// `oklchLightness` of Spec 002, so there is one colour mathematics in the repository (Art. XI).

import { oklchLightness, readDtcgColor } from "../checks/alirebleco/color.js";
import type { ColorValue } from "../generated/modelo-schema.js";

/** One step of a ramp: its number (`color.palette.accent.500` → 500) and its value. */
export interface RampStep {
  step: number;
  value: ColorValue;
}

/** A step of a ramp between two neighbours, with its raw and its normalized distance. */
export interface RampDistance {
  from: number;
  to: number;
  /** Lightness distance; positive when the ramp gets darker as the step number grows. */
  delta: number;
  /** The same distance per 100 step units, so half steps compare with whole ones. */
  perHundred: number;
}

/** Distance of two colours in OKLCH lightness, order-independent. */
export function oklchLDelta(a: ColorValue, b: ColorValue): number {
  return Math.abs(oklchLightness(a) - oklchLightness(b));
}

/** Distance of a colour to the nearer anchor: pure white (L = 1) or pure black (L = 0). */
export function oklchLExtreme(color: ColorValue): number {
  const lightness = oklchLightness(color);
  return Math.min(lightness, 1 - lightness);
}

const byStep = (ramp: readonly RampStep[]): RampStep[] => [...ramp].sort((a, b) => a.step - b.step);

/** The distances of a ramp, from the lightest step to the darkest. */
export function oklchLStep(ramp: readonly RampStep[]): RampDistance[] {
  const sorted = byStep(ramp);
  return sorted.slice(1).map((step, index) => {
    const previous = sorted[index] as RampStep;
    const delta = oklchLightness(previous.value) - oklchLightness(step.value);
    const width = step.step - previous.step;
    return {
      from: previous.step,
      to: step.step,
      delta,
      perHundred: width === 0 ? 0 : (delta / width) * 100,
    };
  });
}

export interface StepEdge {
  from: number;
  to: number;
}

export interface StepConsistency {
  /** Median rate of the inner steps per 100 step units; 0 when the ramp has none. */
  median: number;
  /** Largest relative deviation of an inner step from that median. */
  worst: number;
  /** The step that deviates most, if any. */
  at?: StepEdge;
  /** The two steps at the ends of the ramp, which this metric leaves out. */
  edges: StepEdge[];
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const half = sorted.length >> 1;
  return sorted.length % 2 === 1
    ? (sorted[half] as number)
    : ((sorted[half - 1] as number) + (sorted[half] as number)) / 2;
}

/**
 * How regular the middle of a ramp is: the largest relative deviation of an inner step from the
 * median of the inner steps, measured as the rate per 100 step units, so a ramp that skips step
 * numbers (50, 100, 200, 300, 600) is judged by its progression and not by its numbering. The
 * first and the last step are the ends of the ramp and stay out — near white the eye needs finer
 * steps, and at the dark end a half step is common; a jump in the middle is what makes a ramp
 * useless as a tool (Spec 004, D-03).
 */
export function oklchLStepConsistency(ramp: readonly RampStep[]): StepConsistency {
  const steps = oklchLStep(ramp);
  const edges: StepEdge[] =
    steps.length < 2
      ? []
      : [
          { from: (steps[0] as RampDistance).from, to: (steps[0] as RampDistance).to },
          {
            from: (steps[steps.length - 1] as RampDistance).from,
            to: (steps[steps.length - 1] as RampDistance).to,
          },
        ];
  const inner = steps.slice(1, -1);
  const middle = median(inner.map((step) => step.perHundred));
  if (inner.length === 0 || middle === 0) {
    return { median: middle, worst: 0, edges };
  }
  let worst = 0;
  let at: StepEdge | undefined;
  for (const step of inner) {
    const deviation = Math.abs(step.perHundred / middle - 1);
    if (deviation > worst) {
      worst = deviation;
      at = { from: step.from, to: step.to };
    }
  }
  return { median: middle, worst, ...(at === undefined ? {} : { at }), edges };
}

export interface StepSpread {
  step: number;
  /** Difference between the lightest and the darkest ramp at this step number. */
  spread: number;
}

/** How far ramps drift apart at the same step number: same number, same weight (Spec 004, G5). */
export function oklchLAlign(ramps: Readonly<Record<string, readonly RampStep[]>>): StepSpread[] {
  const byNumber = new Map<number, number[]>();
  for (const ramp of Object.values(ramps)) {
    for (const step of ramp) {
      byNumber.set(step.step, [...(byNumber.get(step.step) ?? []), oklchLightness(step.value)]);
    }
  }
  return [...byNumber.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([step, values]) => ({ step, spread: Math.max(...values) - Math.min(...values) }))
    .sort((a, b) => a.step - b.step);
}

const PALETTE_STEP = /^color\.palette\.([a-z0-9-]+)\.(\d+)$/;
/** A step this close to white or black is an anchor, not a step of a perceptual progression. */
const ANCHOR = 0.001;

/**
 * The opaque, non-anchor steps of every palette ramp among resolved tokens (Spec 004). Alpha
 * ramps (shade, tint) drop out whole: overlays have no lightness progression. The Regulo
 * `palette-even` and the Vitrino read the same ramps, so one number cannot contradict the other.
 */
export function palettePikoj(
  tokens: Readonly<Record<string, { value: unknown }>>,
): Map<string, RampStep[]> {
  const ramps = new Map<string, RampStep[]>();
  const translucent = new Set<string>();
  for (const [name, token] of Object.entries(tokens)) {
    const match = PALETTE_STEP.exec(name);
    if (match?.[1] === undefined || match[2] === undefined) continue;
    const color = readDtcgColor(token.value);
    if (color === undefined) continue;
    if ((color.alpha ?? 1) < 1) {
      translucent.add(match[1]);
      continue;
    }
    const lightness = oklchLightness(color);
    if (lightness >= 1 - ANCHOR || lightness <= ANCHOR) continue;
    ramps.set(match[1], [...(ramps.get(match[1]) ?? []), { step: Number(match[2]), value: color }]);
  }
  for (const ramp of translucent) ramps.delete(ramp);
  for (const [name, steps] of ramps)
    ramps.set(
      name,
      [...steps].sort((a, b) => a.step - b.step),
    );
  return ramps;
}
