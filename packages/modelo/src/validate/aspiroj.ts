// Aspiroj: the design goals one Aspekto sets itself (Spec 004, plan D-03, "Fluida Marko").
//
// A Regulo enforces accessibility and structure for every brand. An Aspiro is the same
// measurement with the brand's own bound and its own reason, and it is checked only for the brand
// that declares it. A brand without aspiroj is completely valid; a brand that gives one up removes
// it from its aspekto.json, where the decision is visible. Pure.

import { readDtcgColor } from "../checks/alirebleco/color.js";
import { kontrastSojlojOf } from "../checks/alirebleco/evaluate.js";
import { measureBranch } from "../checks/alirebleco/measure.js";
import { WCAG2_METRIC } from "../checks/alirebleco/metrics.js";
import { matchesTokenPattern } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { AspektoAspiro, LoadedAspektoPackage, Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { isJsonObject } from "../load/guards.js";
import {
  dimensioKovrado,
  oklchLAlign,
  oklchLExtreme,
  oklchLStep,
  oklchLStepConsistency,
  type RampStep,
  typeScaleConsistency,
  typeScaleRatio,
  wcag2Reserve,
} from "../metrikoj/index.js";
import { resolutionsOf } from "./resolutions.js";

const PALETTE = /^color\.palette\.([a-z0-9-]+)\.(\d+)$/;
const SIZE_SCALE = /^font\.size\.scale\.(\d+)$/;
const ANCHOR = 0.001;
const EPSILON = 1e-9;

const fmt3 = (value: number): string => (Math.trunc(value * 1000 + 1e-9) / 1000).toFixed(3);
const percent = (value: number): string => `${(Math.trunc(value * 1000) / 10).toFixed(1)} %`;

interface Measured {
  /** The value that stands furthest outside the bound, or the plain value for a single number. */
  value: number;
  /** What the value is about, for the message (a token, a pair, a ramp step). */
  at?: string;
  /** How the value reads in a message. */
  format: (value: number) => string;
}

function inScope(name: string, aspiro: AspektoAspiro): boolean {
  const tokens = aspiro.appliesTo?.tokens;
  return (
    tokens === undefined || tokens.some((pattern: string) => matchesTokenPattern(pattern, name))
  );
}

/** The opaque, non-anchor ramp steps of one resolution. */
function ramps(tokens: Record<string, { value: unknown }>, aspiro: AspektoAspiro) {
  const found = new Map<string, RampStep[]>();
  const translucent = new Set<string>();
  for (const [name, token] of Object.entries(tokens)) {
    const match = PALETTE.exec(name);
    if (match?.[1] === undefined || match[2] === undefined || !inScope(name, aspiro)) continue;
    const color = readDtcgColor(token.value);
    if (color === undefined) continue;
    if ((color.alpha ?? 1) < 1) {
      translucent.add(match[1]);
      continue;
    }
    const lightness = oklchLExtreme(color);
    if (lightness <= ANCHOR) continue;
    found.set(match[1], [...(found.get(match[1]) ?? []), { step: Number(match[2]), value: color }]);
  }
  for (const ramp of translucent) found.delete(ramp);
  return found;
}

/** Sizes of the type scale in one resolution, smallest first. */
function sizes(tokens: Record<string, { value: unknown }>, aspiro: AspektoAspiro): number[] {
  return Object.entries(tokens)
    .flatMap(([name, token]) => {
      const value = isJsonObject(token.value) ? token.value.value : undefined;
      return SIZE_SCALE.test(name) && inScope(name, aspiro) && typeof value === "number"
        ? [value]
        : [];
    })
    .sort((a, b) => a - b);
}

/** Every measurement of one aspiro over the combinations of its brand; empty when it has none. */
function measure(modelo: Modelo, aspekto: string, aspiro: AspektoAspiro): Measured[] {
  const measured: Measured[] = [];
  if (aspiro.metriko === "dimensio-kovrado") {
    if (aspiro.dimensio === undefined || aspiro.valoro === undefined) return [];
    const scope = aspiro.appliesTo?.tokens;
    const result = dimensioKovrado(modelo, {
      aspekto,
      dimensio: aspiro.dimensio,
      valoro: aspiro.valoro,
      ...(scope === undefined ? {} : { scope }),
    });
    return [
      {
        value: result.share,
        at: `${aspiro.dimensio}=${aspiro.valoro} (${result.own} of ${result.total} tokens)`,
        format: percent,
      },
    ];
  }
  for (const { assignment, resolution } of resolutionsOf(modelo)) {
    if (assignment[ASPEKTO_DIMENSIO] !== aspekto) continue;
    const tokens = resolution.tokens as Record<string, { value: unknown }>;
    switch (aspiro.metriko) {
      case "wcag2-reserve": {
        const sojloj = kontrastSojlojOf(modelo, assignment);
        for (const pair of modelo.kontrastParoj) {
          const branches = [pair, ...(pair.aux === undefined ? [] : [pair.aux])];
          const reserves = branches.flatMap((branch) => {
            const foreground = readDtcgColor(tokens[branch.foreground]?.value);
            const background = readDtcgColor(tokens[branch.background]?.value);
            if (foreground === undefined || background === undefined) return [];
            const measurement = measureBranch(
              { foreground: branch.foreground, background: branch.background },
              foreground,
              background,
              pair.kategorio,
              sojloj,
              [WCAG2_METRIC],
            );
            const threshold = measurement.metrics[WCAG2_METRIC.id]?.threshold;
            return threshold === undefined ? [] : [wcag2Reserve(measurement.ratio, threshold)];
          });
          if (reserves.length > 0) {
            measured.push({ value: Math.max(...reserves), at: pair.name, format: percent });
          }
        }
        break;
      }
      case "oklch-l-extreme": {
        for (const [name, token] of Object.entries(tokens)) {
          if (!inScope(name, aspiro)) continue;
          const color = readDtcgColor(token.value);
          if (color !== undefined) {
            measured.push({ value: oklchLExtreme(color), at: name, format: fmt3 });
          }
        }
        break;
      }
      case "oklch-l-step": {
        for (const [ramp, steps] of ramps(tokens, aspiro)) {
          for (const step of oklchLStep(steps)) {
            measured.push({
              value: step.perHundred,
              at: `color.palette.${ramp}.${step.from} → ${step.to}`,
              format: fmt3,
            });
          }
        }
        break;
      }
      case "oklch-l-step-consistency": {
        for (const [ramp, steps] of ramps(tokens, aspiro)) {
          const result = oklchLStepConsistency(steps);
          if (result.at !== undefined) {
            measured.push({
              value: result.worst,
              at: `color.palette.${ramp}.${result.at.from} → ${result.at.to}`,
              format: percent,
            });
          }
        }
        break;
      }
      case "oklch-l-align": {
        for (const entry of oklchLAlign(Object.fromEntries(ramps(tokens, aspiro)))) {
          measured.push({ value: entry.spread, at: `step ${entry.step}`, format: fmt3 });
        }
        break;
      }
      case "type-scale-ratio": {
        const scale = sizes(tokens, aspiro);
        typeScaleRatio(scale).forEach((ratio, index) => {
          measured.push({
            value: ratio,
            at: `${scale[index]} px → ${scale[index + 1]} px`,
            format: fmt3,
          });
        });
        break;
      }
      case "type-scale-consistency": {
        const result = typeScaleConsistency(sizes(tokens, aspiro));
        if (result.at !== undefined) {
          measured.push({ value: result.worst, at: `step ${result.at + 1}`, format: percent });
        }
        break;
      }
      default:
        break;
    }
  }
  return measured;
}

/** The measurement that stands furthest outside the bounds, or nothing when all of them hold. */
function missed(measured: readonly Measured[], aspiro: AspektoAspiro): Measured | undefined {
  let worst: Measured | undefined;
  let distance = 0;
  for (const entry of measured) {
    const below = aspiro.min === undefined ? 0 : aspiro.min - entry.value;
    const above = aspiro.max === undefined ? 0 : entry.value - aspiro.max;
    const outside = Math.max(below, above);
    if (outside > EPSILON && outside > distance) {
      distance = outside;
      worst = entry;
    }
  }
  return worst;
}

function bounds(aspiro: AspektoAspiro, format: (value: number) => string): string {
  const parts = [
    aspiro.min === undefined ? undefined : `at least ${format(aspiro.min)}`,
    aspiro.max === undefined ? undefined : `at most ${format(aspiro.max)}`,
  ].filter((part): part is string => part !== undefined);
  return parts.join(" and ");
}

/** One declared goal with the measurement that stands furthest outside its bounds. */
export interface AspiroResult {
  aspekto: string;
  /** Index in `aspekto.json#/aspiroj`, for the issue path. */
  index: number;
  aspiro: AspektoAspiro;
  /** The measurement that decides; absent when the metric measured nothing. */
  measured?: { value: number; at?: string; text: string };
  reached: boolean;
}

/** Every Aspiro of every Aspekto with its measurement, whether it holds or not. */
export function evaluateAspiroj(modelo: Modelo): AspiroResult[] {
  return modelo.aspektoPackages.flatMap((pkg: LoadedAspektoPackage) => {
    const aspekto = pkg.aspekto;
    if (aspekto === undefined) return [];
    return (pkg.aspiroj ?? []).map((aspiro, index) => {
      const all = measure(modelo, aspekto, aspiro);
      const worst = missed(all, aspiro);
      const decisive = worst ?? nearest(all, aspiro);
      return {
        aspekto,
        index,
        aspiro,
        ...(decisive === undefined
          ? {}
          : {
              measured: {
                value: decisive.value,
                ...(decisive.at === undefined ? {} : { at: decisive.at }),
                text: decisive.format(decisive.value),
              },
            }),
        reached: worst === undefined,
      };
    });
  });
}

/** The measurement closest to a bound: what a reached goal shows as its tightest spot. */
function nearest(measured: readonly Measured[], aspiro: AspektoAspiro): Measured | undefined {
  let best: Measured | undefined;
  let distance = Number.POSITIVE_INFINITY;
  for (const entry of measured) {
    const room = Math.min(
      aspiro.min === undefined ? Number.POSITIVE_INFINITY : entry.value - aspiro.min,
      aspiro.max === undefined ? Number.POSITIVE_INFINITY : aspiro.max - entry.value,
    );
    if (room < distance) {
      distance = room;
      best = entry;
    }
  }
  return best;
}

/** One issue per design goal a brand declares and misses (`aspiro-missed`). */
export function aspirojIssues(modelo: Modelo): ValidationIssue[] {
  return modelo.aspektoPackages.flatMap((pkg: LoadedAspektoPackage) => {
    const aspekto = pkg.aspekto;
    if (aspekto === undefined) return [];
    return (pkg.aspiroj ?? []).flatMap((aspiro, index) => {
      const worst = missed(measure(modelo, aspekto, aspiro), aspiro);
      if (worst === undefined) return [];
      const where = worst.at === undefined ? "" : ` (${worst.at})`;
      return [
        {
          rule: "aspiro-missed" as const,
          severity: "error" as const,
          path: formatIssuePath({ file: pkg.aspektoFile, pointer: `/aspiroj/${index}` }),
          message: `Design goal of ${aspekto}: ${aspiro.metriko} measures ${worst.format(worst.value)}${where}, the goal asks for ${bounds(aspiro, worst.format)}. ${aspiro.kialo}`,
          suggestion: `Move the values until the goal holds, or lower it in ${pkg.aspektoFile} and say there why. This goal belongs to ${aspekto} alone; no other Aspekto is measured against it.`,
        },
      ];
    });
  });
}
