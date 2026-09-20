// The structural Reguloj of Spec 004 (T004, plan D-03): a ramp that stays regular, ramps that
// agree at the same step, values inside the sRGB gamut, a type scale that stays predictable and a
// rhythm that follows the size. They guard structure, never taste — how fine a brand grades its
// ramp and which ratio it picks is its own business (Fluida Marko). Measured on the resolved
// values of one combination, so every Aspekto and every Dimensio value is covered. Pure.

import { oklchLightness, readDtcgColor } from "../checks/alirebleco/color.js";
import { formatIssuePath } from "../contracts/issues.js";
import { isJsonObject } from "../load/guards.js";
import {
  oklchLAlign,
  oklchLStep,
  oklchLStepConsistency,
  type RampStep,
  srgbGamut,
  typeRhythm,
  typeScaleConsistency,
} from "../metrikoj/index.js";
import type { CombinationChecker, CombinationContext } from "./combination-reguloj.js";

const PALETTE = /^color\.palette\.([a-z0-9-]+)\.(\d+)$/;
const SIZE_SCALE = /^font\.size\.scale\.(\d+)$/;
const TYPOGRAPHY = /^typography\./;
/** A step this close to white or black is an anchor, not a step of a perceptual progression. */
const ANCHOR = 0.001;
const EPSILON = 1e-9;

const percent = (value: number): string => `${(Math.trunc(value * 1000) / 10).toFixed(1)} %`;
const fmt3 = (value: number): string => (Math.trunc(value * 1000 + 1e-9) / 1000).toFixed(3);

function dimensionOf(value: unknown): number | undefined {
  return isJsonObject(value) && typeof value.value === "number" ? value.value : undefined;
}

/** The opaque, non-anchor steps of every palette ramp of this combination. */
function rampsOf(context: CombinationContext): Map<string, RampStep[]> {
  const ramps = new Map<string, RampStep[]>();
  const translucent = new Set<string>();
  for (const [name, token] of Object.entries(context.resolution.tokens)) {
    const match = PALETTE.exec(name);
    if (match?.[1] === undefined || match[2] === undefined) continue;
    const color = readDtcgColor(token.value);
    if (color === undefined) continue;
    // An alpha ramp (transparent black, for shadows and scrims) has no lightness progression.
    if ((color.alpha ?? 1) < 1) {
      translucent.add(match[1]);
      continue;
    }
    const lightness = oklchLightness(color);
    if (lightness >= 1 - ANCHOR || lightness <= ANCHOR) continue;
    ramps.set(match[1], [...(ramps.get(match[1]) ?? []), { step: Number(match[2]), value: color }]);
  }
  for (const ramp of translucent) ramps.delete(ramp);
  return ramps;
}

const stepName = (ramp: string, step: number): string => `color.palette.${ramp}.${step}`;

/** `palette-even`: strictly monotone, and the inner steps stay near the median of the ramp. */
export const paletteEven: CombinationChecker = (context) => {
  const max = context.regulo.sojlo?.max;
  if (max === undefined) return [];
  return [...rampsOf(context)].flatMap(([ramp, steps]) => {
    if (steps.length < 3) return [];
    const reversed = oklchLStep(steps).find((step) => step.delta <= EPSILON);
    if (reversed !== undefined) {
      return [
        {
          subject: stepName(ramp, reversed.to),
          values: `${ramp} ${reversed.from} ${reversed.to}`,
          message: `${stepName(ramp, reversed.to)} is not darker than ${stepName(ramp, reversed.from)}; a ramp must fall in lightness with every step.`,
          suggestion: `Give ${stepName(ramp, reversed.to)} a value darker than ${stepName(ramp, reversed.from)}, or swap the two steps.`,
        },
      ];
    }
    const { median, worst, at } = oklchLStepConsistency(steps);
    if (at === undefined || worst <= max + EPSILON) return [];
    return [
      {
        subject: stepName(ramp, at.to),
        values: `${ramp} ${at.from} ${at.to}`,
        message: `The step ${at.from} → ${at.to} of ${ramp} differs by ${percent(worst)} from the median step of its ramp (${fmt3(median)}), above ${percent(max)}; the middle of a ramp must advance evenly.`,
        suggestion: `Move ${stepName(ramp, at.to)} towards a distance of ${fmt3(median)} from ${stepName(ramp, at.from)}, or add a step between them. How fine the ramp is at its ends stays yours.`,
      },
    ];
  });
};

/** `palette-aligned`: the same step number weighs the same in every ramp. */
export const paletteAligned: CombinationChecker = (context) => {
  const max = context.regulo.sojlo?.max;
  if (max === undefined) return [];
  const ramps = rampsOf(context);
  if (ramps.size < 2) return [];
  return oklchLAlign(Object.fromEntries(ramps))
    .filter((entry) => entry.spread > max + EPSILON)
    .map((entry) => {
      const names = [...ramps]
        .filter(([, steps]) => steps.some((step) => step.step === entry.step))
        .map(([ramp]) => ramp)
        .sort();
      return {
        subject: stepName(names[0] ?? "", entry.step),
        values: `${entry.step} ${fmt3(entry.spread)}`,
        message: `At step ${entry.step} the ramps ${names.join(", ")} differ by ${fmt3(entry.spread)} in OKLCH lightness, above ${max}; the same step number must weigh the same in every ramp.`,
        suggestion: `Align the step ${entry.step} of these ramps on one lightness, so a role that picks a step gets the same weight whatever its hue.`,
      };
    });
};

/** `srgb-gamut`: a component outside 0 … 1 is clipped, and then the measured contrast is a lie. */
export const srgbGamutRegulo: CombinationChecker = (context) => {
  return Object.entries(context.resolution.tokens).flatMap(([name, token]) => {
    const color = readDtcgColor(token.value);
    if (color === undefined) return [];
    const result = srgbGamut(color);
    if (result.inside) return [];
    const components = color.components
      .map((component) => (component === "none" ? "none" : String(component)))
      .join(", ");
    return [
      {
        subject: name,
        values: components,
        message: `${name} has a component outside the sRGB gamut (${components}); the browser clips it, so the measured contrast is not the contrast on screen.`,
        suggestion: `Bring every component of ${name} into 0 … 1, or pick the nearest colour inside the gamut.`,
      },
    ];
  });
};

/** `type-scale`: the scale is regular; which ratio the brand picks is its own business. */
export const typeScaleRegulo: CombinationChecker = (context) => {
  const max = context.regulo.sojlo?.max;
  if (max === undefined) return [];
  const steps = Object.entries(context.resolution.tokens)
    .flatMap(([name, token]) => {
      const match = SIZE_SCALE.exec(name);
      const size = dimensionOf(token.value);
      return match?.[1] === undefined || size === undefined
        ? []
        : [{ step: Number(match[1]), name, size }];
    })
    .sort((a, b) => a.size - b.size);
  if (steps.length < 3) return [];
  const { median, worst, at } = typeScaleConsistency(steps.map((step) => step.size));
  if (at === undefined || worst <= max + EPSILON) return [];
  const from = steps[at];
  const to = steps[at + 1];
  if (from === undefined || to === undefined) return [];
  return [
    {
      subject: to.name,
      values: `${from.size} ${to.size}`,
      message: `The step ${from.size} → ${to.size} px is a ratio of ${fmt3(to.size / from.size)}, ${percent(worst)} away from the median ratio ${fmt3(median)} of the scale, above ${percent(max)}; a scale must be predictable.`,
      suggestion: `Move ${to.name} towards ${fmt3(from.size * median)} px, or re-derive the scale from one ratio. Which ratio you choose stays yours.`,
    },
  ];
};

/**
 * `type-rhythm`: inside a role family (display, headline, body, label …), line height and tracking
 * fall as the size grows. Families are compared on their own: a label at 14 px is deliberately
 * snugger than body text at 16 px, and comparing the two would measure taste, not rhythm.
 */
export const typeRhythmRegulo: CombinationChecker = (context) => {
  const families = new Map<
    string,
    { name: string; size: number; lineHeight: number; tracking: number }[]
  >();
  for (const [name, token] of Object.entries(context.resolution.tokens)) {
    if (!TYPOGRAPHY.test(name) || !isJsonObject(token.value)) continue;
    const size = dimensionOf(token.value.fontSize);
    const lineHeight = token.value.lineHeight;
    const tracking = dimensionOf(token.value.letterSpacing);
    if (size === undefined || typeof lineHeight !== "number" || tracking === undefined) continue;
    // typography.display.1 → family "display"; typography.caption stays its own family.
    const segments = name.split(".");
    const last = segments.at(-1) ?? "";
    const family = (/^\d+$/.test(last) ? segments.slice(1, -1) : segments.slice(1)).join(".");
    families.set(family, [...(families.get(family) ?? []), { name, size, lineHeight, tracking }]);
  }
  return [...families].flatMap(([family, rows]) => {
    if (rows.length < 2) return [];
    return typeRhythm(rows).breaks.map((entry) => {
      const larger = rows.find((row) => row.size === entry.to);
      const what = entry.field === "lineHeight" ? "line height" : "tracking";
      return {
        subject: larger?.name ?? `typography.${family}`,
        values: `${family} ${entry.field} ${entry.from} ${entry.to}`,
        message: `In the family ${family} the ${what} grows from ${entry.from} px to ${entry.to} px; larger type needs less leading and tighter tracking, not more.`,
        suggestion: `Give ${larger?.name ?? family} a ${what} no larger than the role at ${entry.from} px of the same family.`,
      };
    });
  });
};

export const SPEC004_CHECKERS = {
  "palette-even": paletteEven,
  "palette-aligned": paletteAligned,
  "srgb-gamut": srgbGamutRegulo,
  "type-scale": typeScaleRegulo,
  "type-rhythm": typeRhythmRegulo,
} as const;

export { formatIssuePath };
