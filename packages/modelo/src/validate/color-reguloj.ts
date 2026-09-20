// The colour Reguloj of Spec 002 (FR-01…FR-04; plan D-04…D-08). The three per-combination
// checkers measure what no contrast check sees: the order of surfaces, the hierarchy of text
// roles and the difference between action states. Colours are measured as seen: a translucent
// value is composited over color.background.default first, as in the Alirebleco check. Pure.

import {
  alphaOf,
  compositeOver,
  oklchLightness,
  readDtcgColor,
  srgbComponentsOf,
} from "../checks/alirebleco/color.js";
import { WCAG2_METRIC } from "../checks/alirebleco/metrics.js";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo, Regulo } from "../contracts/modelo.js";
import type { ColorValue } from "../generated/modelo-schema.js";
import { isJsonObject } from "../load/guards.js";
import type { CombinationChecker, CombinationContext } from "./combination-reguloj.js";

const BACKDROP = "color.background.default";
const SURFACES = [
  "color.background.sunken",
  "color.background.canvas",
  "color.background.default",
  "color.background.raised",
] as const;
const TEXT_ROLES = ["color.text.default", "color.text.subtle", "color.text.muted"] as const;
const STATES = ["hover", "pressed", "selected"] as const;
const ACTION = /^color\.action\.([a-z0-9]+)\.rest$/;
const EPSILON = 1e-9;

/** Three decimals, truncated, so a reported value never looks like it meets the threshold. */
const fmt3 = (value: number): string => (Math.trunc(value * 1000 + 1e-9) / 1000).toFixed(3);
const fmt2 = (value: number): string => (Math.trunc(value * 100 + 1e-9) / 100).toFixed(2);

function colorOf(context: CombinationContext, name: string): ColorValue | undefined {
  const resolved = context.resolution.tokens[name];
  return resolved === undefined ? undefined : readDtcgColor(resolved.value);
}

/** The colour as seen on color.background.default (composited when translucent). */
function seenColor(context: CombinationContext, name: string): ColorValue | undefined {
  const color = colorOf(context, name);
  const backdrop = colorOf(context, BACKDROP);
  if (color === undefined) return undefined;
  return backdrop !== undefined && alphaOf(color) < 1 ? compositeOver(color, backdrop) : color;
}

function hexOf(color: ColorValue): string {
  return `#${srgbComponentsOf(color)
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function originOf(context: CombinationContext, name: string): string {
  return context.resolution.tokens[name]?.origin.set ?? CORE_SET_NAME;
}

/** FR-01: L(sunken) ≤ L(canvas) ≤ L(default) ≤ L(raised). */
export const surfaceOrder: CombinationChecker = (context) => {
  const lightness = SURFACES.map((name) => {
    const color = seenColor(context, name);
    return color === undefined ? undefined : oklchLightness(color);
  });
  return SURFACES.slice(0, -1).flatMap((lower, index) => {
    const upper = SURFACES[index + 1] as string;
    const low = lightness[index];
    const high = lightness[index + 1];
    if (low === undefined || high === undefined || low <= high + EPSILON) return [];
    return [
      {
        subject: lower,
        values: `${fmt3(low)} ${fmt3(high)}`,
        message: `${lower} has OKLCH lightness ${fmt3(low)}, above ${upper} with ${fmt3(high)}; surfaces must be ordered sunken ≤ canvas ≤ default ≤ raised.`,
        suggestion: `Re-point ${lower} (set '${originOf(context, lower)}') to a palette step no lighter than ${upper}, or ${upper} (set '${originOf(context, upper)}') to a lighter one.`,
      },
    ];
  });
};

/** The text-normal WCAG threshold of the active contrast valoro, if the Modelo declares one. */
function textThreshold(context: CombinationContext): number | undefined {
  for (const dimensio of context.modelo.dimensioj) {
    const active = context.assignment[dimensio.name];
    const valoro = (Array.isArray(dimensio.valoroj) ? dimensio.valoroj : []).find(
      (entry: unknown) => isJsonObject(entry) && entry.name === active,
    );
    const sojloj: unknown = isJsonObject(valoro) ? valoro.kontrastSojloj : undefined;
    const wcag2: unknown = isJsonObject(sojloj) ? sojloj.wcag2 : undefined;
    const threshold: unknown = isJsonObject(wcag2) ? wcag2["text-normal"] : undefined;
    if (typeof threshold === "number") return threshold;
  }
  return undefined;
}

/** Palette steps of the palette a role points at that reach the threshold on the backdrop. */
function stepsAbove(context: CombinationContext, name: string, threshold: number): number {
  const chain = context.resolution.tokens[name]?.aliasChain ?? [];
  const target = chain
    .map((link) => link.token)
    .find((token) => token.startsWith("color.palette."));
  const backdrop = colorOf(context, BACKDROP);
  if (target === undefined || backdrop === undefined) return 0;
  const palette = target.slice(0, target.lastIndexOf(".") + 1);
  const seen = new Set<string>();
  for (const [token, resolved] of Object.entries(context.resolution.tokens)) {
    if (!token.startsWith(palette) || token.slice(palette.length).includes(".")) continue;
    const color = readDtcgColor(resolved.value);
    if (color === undefined) continue;
    const effective = alphaOf(color) < 1 ? compositeOver(color, backdrop) : color;
    if (WCAG2_METRIC.compute(effective, backdrop) >= threshold) seen.add(hexOf(effective));
  }
  return seen.size;
}

/** FR-02: the three text roles differ, and their contrast on background.default does not rise. */
export const textHierarchy: CombinationChecker = (context) => {
  const backdrop = colorOf(context, BACKDROP);
  const seen = TEXT_ROLES.map((name) => seenColor(context, name));
  if (
    backdrop === undefined ||
    alphaOf(backdrop) < 1 ||
    seen.some((color) => color === undefined)
  ) {
    return [];
  }
  const colors = seen as ColorValue[];
  const hexes = colors.map(hexOf);
  const ratios = colors.map((color) => WCAG2_METRIC.compute(color, backdrop));
  const findings = [];
  for (let later = 1; later < TEXT_ROLES.length; later += 1) {
    const role = TEXT_ROLES[later] as string;
    const equal = [0, 1].slice(0, later).find((earlier) => hexes[earlier] === hexes[later]);
    if (equal !== undefined) {
      const other = TEXT_ROLES[equal] as string;
      const threshold = textThreshold(context);
      const short =
        threshold !== undefined && stepsAbove(context, role, threshold) < TEXT_ROLES.length;
      findings.push({
        subject: role,
        values: hexes.join(" "),
        message: `${role} and ${other} both resolve to ${hexes[later]}; the text roles default, subtle and muted must stay distinct.${
          short
            ? ` The palette has fewer than three steps that reach ${threshold}:1 on ${BACKDROP}: the Aspekto needs one more step; the core lowers nothing.`
            : ""
        }`,
        suggestion: `Re-point ${role} (set '${originOf(context, role)}') to its own palette step between ${other} and the next role, keeping every text threshold.`,
      });
      continue;
    }
    const ratio = ratios[later] as number;
    const before = ratios[later - 1] as number;
    if (ratio > before + EPSILON) {
      const previous = TEXT_ROLES[later - 1] as string;
      findings.push({
        subject: role,
        values: hexes.join(" "),
        message: `${role} has contrast ${fmt2(ratio)}:1 on ${BACKDROP}, above ${previous} with ${fmt2(before)}:1; contrast must not rise from default to subtle to muted.`,
        suggestion: `Swap or re-point ${role} (set '${originOf(context, role)}') and ${previous} so that default ≥ subtle ≥ muted in contrast.`,
      });
      continue;
    }
    // T027: distinct is not distinguishable; neighbouring roles need a visible lightness step.
    const min = context.regulo.sojlo?.min;
    if (min === undefined) continue;
    const previous = TEXT_ROLES[later - 1] as string;
    const delta = Math.abs(
      oklchLightness(colors[later] as ColorValue) - oklchLightness(colors[later - 1] as ColorValue),
    );
    if (delta < min - EPSILON) {
      findings.push({
        subject: role,
        values: hexes.join(" "),
        message: `${role} differs from ${previous} by ${fmt3(delta)} in OKLCH lightness, below ${min}; the roles are distinct but not distinguishable.`,
        suggestion: `Keep the main role at its maximum contrast and move ${role} (set '${originOf(context, role)}') to the next palette step at least ${min} away from ${previous} that still meets every text threshold.`,
      });
    }
  }
  return findings;
};

/** FR-03: every action state differs from rest by at least `sojlo.min` in OKLCH lightness. */
export const stateDistinct: CombinationChecker = (context) => {
  const min = context.regulo.sojlo?.min;
  if (min === undefined) return [];
  const variants = Object.keys(context.resolution.tokens).flatMap((name) => {
    const match = ACTION.exec(name);
    return match?.[1] === undefined ? [] : [match[1]];
  });
  return variants.flatMap((variant) => {
    const base = `color.action.${variant}`;
    const rest = seenColor(context, `${base}.rest`);
    if (rest === undefined) return [];
    const restL = oklchLightness(rest);
    return STATES.flatMap((state) => {
      const name = `${base}.${state}`;
      const color = seenColor(context, name);
      if (color === undefined) return [];
      const delta = Math.abs(oklchLightness(color) - restL);
      if (delta >= min - EPSILON) return [];
      return [
        {
          subject: name,
          values: `${hexOf(rest)} ${hexOf(color)}`,
          message: `${name} differs from ${base}.rest by ${fmt3(delta)} in OKLCH lightness, below ${min}; a difference in hue alone does not count.`,
          suggestion: `Move ${name} (set '${originOf(context, name)}') away from the lightness of ${base}.text, one step further from rest, so the state gives feedback and keeps its text contrast.`,
        },
      ];
    });
  });
};

/** A dimension in px (rem at 16 px), or `undefined` for anything else. */
function pixelsOf(value: unknown): number | undefined {
  if (!isJsonObject(value) || typeof value.value !== "number") return undefined;
  if (value.unit === "px") return value.value;
  if (value.unit === "rem") return value.value * 16;
  return undefined;
}

/**
 * Spec 003 T006, WCAG 2.5.8: every size.control.* is at least size.target.min. The threshold is the
 * token, so the Regulo and the rendered component (T011) read the same value.
 */
export const touchTargetMin: CombinationChecker = (context) => {
  const target = pixelsOf(context.resolution.tokens["size.target.min"]?.value);
  if (target === undefined) return [];
  return Object.entries(context.resolution.tokens)
    .filter(([name]) => name.startsWith("size.control."))
    .flatMap(([name, token]) => {
      const size = pixelsOf(token.value);
      if (size === undefined || size >= target) return [];
      return [
        {
          subject: name,
          values: `${size} ${target}`,
          message: `${name} is ${size}px, below size.target.min (${target}px): a pointer target must be at least that wide and high (WCAG 2.5.8).`,
          suggestion: `Alias ${name} to a size step of at least ${target}px in this combination, or lower no control below size.target.min.`,
        },
      ];
    });
};

/** Per-combination checkers by Regulo name (plan D-04); `explain` uses the same table. */
export const COMBINATION_CHECKERS: Readonly<Record<string, CombinationChecker>> = {
  "surface-order": surfaceOrder,
  "text-hierarchy": textHierarchy,
  "state-distinct": stateDistinct,
  "touch-target-min": touchTargetMin,
};

/** Reguloj whose checker needs a `sojlo`. */
export const NEEDS_SOJLO: ReadonlySet<string> = new Set(["state-distinct", "text-hierarchy"]);

/** `regulo-sojlo-missing` for a measuring Regulo declared without its threshold. */
export function sojloIssues(modelo: Modelo, regulo: Regulo): ValidationIssue[] {
  if (!NEEDS_SOJLO.has(regulo.name) || regulo.sojlo !== undefined) return [];
  const core = modelo.reguloj.filter((entry) => entry.aspekto === undefined);
  const index = core.indexOf(regulo);
  return [
    {
      rule: "regulo-sojlo-missing",
      severity: "error",
      path: index < 0 ? `regulo(${regulo.name})` : `data/reguloj.json#/reguloj/${index}`,
      message: `Regulo '${regulo.name}' measures a difference but declares no sojlo (threshold).`,
      suggestion: `Add "sojlo": { "metric": "oklch-l-delta", "min": <number> } to the Regulo, e.g. min 0.05.`,
    },
  ];
}

const ALIAS_IN_TEXT = /\{[^{}]+\}/;
const COLOR_LITERAL_IN_TEXT = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i;

function isRoleValue(value: unknown): boolean {
  if (aliasTarget(value) !== undefined) return true;
  return (
    isJsonObject(value) && Object.values(value).some((field) => aliasTarget(field) !== undefined)
  );
}

/** FR-04: every core role token has a $description that states its use, not its value. */
export function semanticDescribedIssues(modelo: Modelo): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  return Object.values(core).flatMap((token) => {
    if (!isRoleValue(token.value)) return [];
    const text = typeof token.description === "string" ? token.description.trim() : "";
    const problem =
      text === ""
        ? "has no $description"
        : ALIAS_IN_TEXT.test(text)
          ? "has a $description that names an alias instead of the use"
          : COLOR_LITERAL_IN_TEXT.test(text)
            ? "has a $description that names a colour value instead of the use"
            : undefined;
    if (problem === undefined) return [];
    return [
      {
        rule: "semantic-described" as const,
        severity: "error" as const,
        path: formatIssuePath(token.location),
        message: `The role token ${token.name} ${problem}.`,
        suggestion: `Describe where ${token.name} is used and what it means (e.g. "Secondary text such as captions."), not which value it has.`,
      },
    ];
  });
}
