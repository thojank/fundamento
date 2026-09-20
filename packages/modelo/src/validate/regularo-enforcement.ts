// Reguloj the Modelo declares with checkability "automatic" are enforced here (Spec 001, D-19):
// the Regularo, with its kialoj, is the switch, so a test Modelo that declares the same Regulo as
// "manual" is not affected. Each enforceable Regulo name maps to one rule of the catalog. Pure.

import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo, Regulo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { resolve } from "../resolve/resolve.js";
import { COMBINATION_CHECKERS, semanticDescribedIssues, sojloIssues } from "./color-reguloj.js";
import { runCombinationChecker } from "./combination-reguloj.js";
import { dimensioSetIssues } from "./dimensio-set-rules.js";

const PALETTE_PREFIX = "color.palette.";
const FOCUS_SURFACE = "color.background.default";
const FOCUS_GAP = "color.focus.inner";
const DENSITY_SCOPE = /^(spacing\.[a-z0-9]+|size\.control\.[a-z0-9]+)$/;

function isRoleComposite(role: string, value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const fields = value as Record<string, unknown>;
  return (
    aliasTarget(fields.fontSize) === `font.size.${role}` &&
    aliasTarget(fields.lineHeight) === `font.lineheight.${role}` &&
    aliasTarget(fields.letterSpacing) === `font.tracking.${role}` &&
    aliasTarget(fields.fontFamily) !== undefined &&
    aliasTarget(fields.fontWeight) !== undefined
  );
}

function isInstant(value: unknown): boolean {
  if (Array.isArray(value)) return JSON.stringify(value) === "[0,0,1,1]";
  return typeof value === "object" && value !== null && (value as { value?: unknown }).value === 0;
}

type Enforcer = (modelo: Modelo, regulo: Regulo) => ValidationIssue[];

/** A per-combination Regulo (Spec 002, D-04): its checker over every combination. */
const perCombination =
  (name: string): Enforcer =>
  (modelo, regulo) => [
    ...sojloIssues(modelo, regulo),
    ...(regulo.sojlo === undefined && name === "state-distinct"
      ? []
      : runCombinationChecker(modelo, regulo, COMBINATION_CHECKERS[name] ?? (() => []))),
  ];

/** Enforceable Reguloj by name. A Regulo declared "automatic" must have an entry here. */
export const REGULO_ENFORCERS: Readonly<Record<string, Enforcer>> = {
  /** FR-02: semantic colours alias palette tokens, in every set. */
  "semantic-colors-alias-palette": (modelo) =>
    modelo.setoj.flatMap((set) =>
      Object.values(set.tokens)
        .filter((token) => token.type === "color" && !token.name.startsWith(PALETTE_PREFIX))
        .filter((token) => !(aliasTarget(token.value) ?? "").startsWith(PALETTE_PREFIX))
        .map((token) => ({
          rule: "color-semantic-literal" as const,
          severity: "error" as const,
          path: formatIssuePath(token.location),
          message: `${token.name} in ${set.name} is a semantic colour but does not alias a palette token.`,
          suggestion: `Give ${token.name} an alias like {color.palette.<name>.<step>}; literal colours belong in color.palette.* (Regulo semantic-colors-alias-palette).`,
        })),
    ),
  /**
   * D-12: every foreground, border and focus colour is the foreground of a KontrastParo and every
   * background colour its background; roles disabled and decorative are exempt (WCAG 1.4.3,
   * 1.4.11), palette, shadow and backdrop are not placed as text or UI.
   */
  "contrast-pairs-declared": (modelo) => {
    // Members of an alternative pair count as declared (Spec 002, D-09).
    const foregrounds = new Set(
      modelo.kontrastParoj.flatMap((pair) => [pair.foreground, pair.aux?.foreground ?? []].flat()),
    );
    const backgrounds = new Set(
      modelo.kontrastParoj.flatMap((pair) => [pair.background, pair.aux?.background ?? []].flat()),
    );
    const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
    return Object.values(core).flatMap((token) => {
      const asForeground =
        token.role === "foreground" || token.role === "border" || token.role === "focus";
      const missing = asForeground
        ? !foregrounds.has(token.name)
        : token.role === "background" && !backgrounds.has(token.name);
      if (!missing) return [];
      return [
        {
          rule: "kontrastparo-missing-for-role" as const,
          severity: "error" as const,
          path: formatIssuePath(token.location),
          message: `${token.name} (role ${token.role}) appears in no KontrastParo as ${asForeground ? "foreground" : "background"}, so its contrast is never checked.`,
          suggestion: `Declare a KontrastParo in data/kontrastparoj.json that places ${token.name} ${asForeground ? "on the backgrounds it is used on" : "under the foregrounds used on it"}, or give it the role disabled or decorative if WCAG exempts it.`,
        },
      ];
    });
  },
  /**
   * The focus ring must contrast with the surface around it and with its own gap colour
   * (color.focus.inner): one colour cannot reach 3:1 against every surface (WCAG 2.4.13).
   */
  "focus-ring-dual-contrast": (modelo) => {
    const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
    const paired = (foreground: string, background: string) =>
      modelo.kontrastParoj.some(
        (pair) => pair.foreground === foreground && pair.background === background,
      );
    return Object.values(core)
      .filter((token) => token.role === "focus")
      .filter((token) => !paired(token.name, FOCUS_SURFACE) || !paired(token.name, FOCUS_GAP))
      .map((token) => ({
        rule: "focus-ring-pair-missing" as const,
        severity: "error" as const,
        path: formatIssuePath(token.location),
        message: `The focus colour ${token.name} needs a KontrastParo on ${FOCUS_SURFACE} and one on its gap colour ${FOCUS_GAP}.`,
        suggestion: `Declare both pairs (kategorio ui) in data/kontrastparoj.json (Regulo focus-ring-dual-contrast).`,
      }));
  },
  /** FR-04, D-02: typography roles are composites of aliases over their role tokens. */
  "typography-roles-composite": (modelo) =>
    modelo.setoj.flatMap((set) =>
      Object.values(set.tokens)
        .filter((token) => token.type === "typography" && token.name.startsWith("typography."))
        .filter((token) => !isRoleComposite(token.name.slice("typography.".length), token.value))
        .map((token) => ({
          rule: "typography-role-not-composite" as const,
          severity: "error" as const,
          path: formatIssuePath(token.location),
          message: `${token.name} in ${set.name} is not a composite of aliases over its role tokens.`,
          suggestion: `Alias fontSize, lineHeight and letterSpacing to font.size, font.lineheight and font.tracking of the role, and fontFamily and fontWeight to primitives (Regulo typography-roles-composite).`,
        })),
    ),
  /** FR-06: under motion=reduced every duration role is 0 ms and every easing role linear. */
  "motion-reduced-instant": (modelo) => {
    const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
    const roles = Object.values(core).filter(
      (token) =>
        (token.type === "duration" || token.type === "cubicBezier") &&
        aliasTarget(token.value) !== undefined,
    );
    const aspektoj =
      modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO)?.valoroj ?? [];
    return aspektoj.flatMap((aspekto) => {
      const assignment = { [ASPEKTO_DIMENSIO]: aspekto.name, motion: "reduced" };
      const outcome = resolve(modelo, assignment);
      if (!outcome.ok) return []; // unresolvable combinations are reported elsewhere
      return roles
        .filter((token) => !isInstant(outcome.rezolvo.tokens[token.name]?.value))
        .map((token) => ({
          rule: "motion-reduced-not-instant" as const,
          severity: "error" as const,
          path: `rezolvo(${ASPEKTO_DIMENSIO}=${aspekto.name},motion=reduced)/${token.name}`,
          message: `${token.name} is not instant under motion=reduced.`,
          suggestion: `Re-point ${token.name} to motion.duration.scale.0 or motion.easing.curve.linear in motion/reduced (Regulo motion-reduced-instant).`,
        }));
    });
  },
  /** K3: density re-points spacing and control-size roles only, never a token viewport shifts. */
  "density-affects-layout-only": (modelo) => {
    const viewport = new Set(
      modelo.setoj
        .filter((set) => set.name.startsWith("viewport/"))
        .flatMap((set) => Object.keys(set.tokens)),
    );
    return modelo.setoj
      .filter((set) => set.name.startsWith("density/"))
      .flatMap((set) =>
        Object.values(set.tokens)
          .filter((token) => !DENSITY_SCOPE.test(token.name) || viewport.has(token.name))
          .map((token) => ({
            rule: "density-set-scope" as const,
            severity: "error" as const,
            path: formatIssuePath(token.location),
            message: `${set.name} re-points ${token.name}; density changes only spacing and control-size roles and never a token viewport shifts.`,
            suggestion: `Move the change to viewport/* (typography, layout) or leave it out (Regulo density-affects-layout-only).`,
          })),
      );
  },
  /** D-03, K4: generic Dimensio sets hold aliases only and re-point roles only. */
  "dimensio-sets-alias-only": dimensioSetIssues,
  /** Spec 004 G1: every KontrastParo keeps a reserve above its threshold. */
  "contrast-reserve": perCombination("contrast-reserve"),
  /** Spec 004 G2: neighbouring surfaces stay apart in lightness, without a shadow. */
  "surface-distinct": perCombination("surface-distinct"),
  /** Spec 002 FR-01: surfaces ordered by lightness in every combination. */
  "surface-order": perCombination("surface-order"),
  /** Spec 002 FR-02: the text roles stay distinct and ordered in every combination. */
  "text-hierarchy": perCombination("text-hierarchy"),
  /** Spec 002 FR-03: action states differ from rest by at least `sojlo.min` in lightness. */
  "state-distinct": perCombination("state-distinct"),
  /** Spec 003 T006: size.control.* ≥ size.target.min (WCAG 2.5.8). */
  "touch-target-min": perCombination("touch-target-min"),
  /** Spec 002 FR-04: every core role token has a $description of its use. */
  "semantic-described": (modelo) => semanticDescribedIssues(modelo),
  /** FR-08: every colour token declares its role (in core, where roles live). */
  "color-roles-declared": (modelo) =>
    Object.values(modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {})
      .filter((token) => token.type === "color" && token.role === undefined)
      .map((token) => ({
        rule: "color-role-missing" as const,
        severity: "error" as const,
        path: formatIssuePath(token.location),
        message: `The colour token ${token.name} declares no role.`,
        suggestion: `Add "role" to its Fundamento extension: palette for color.palette.*, else foreground, background, border, focus, shadow, backdrop, disabled or decorative.`,
      })),
};

/** Every issue of an automatic Regulo's enforcer, citing that Regulo and its kialo (FR-08). */
export function regularoEnforcementIssues(modelo: Modelo): ValidationIssue[] {
  return modelo.reguloj.flatMap((regulo) => {
    if (regulo.checkability !== "automatic") return [];
    const cited = { id: regulo.id, name: regulo.name, kialo: regulo.kialo };
    return (REGULO_ENFORCERS[regulo.name]?.(modelo, regulo) ?? []).map((issue) => ({
      ...issue,
      regulo: cited,
    }));
  });
}
