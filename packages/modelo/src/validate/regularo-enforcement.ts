// Reguloj the Modelo declares with checkability "automatic" are enforced here (Spec 001, D-19):
// the Regularo, with its kialoj, is the switch, so a test Modelo that declares the same Regulo as
// "manual" is not affected. Each enforceable Regulo name maps to one rule of the catalog. Pure.

import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { dimensioSetIssues } from "./dimensio-set-rules.js";

const PALETTE_PREFIX = "color.palette.";

type Enforcer = (modelo: Modelo) => ValidationIssue[];

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
    const foregrounds = new Set(modelo.kontrastParoj.map((pair) => pair.foreground));
    const backgrounds = new Set(modelo.kontrastParoj.map((pair) => pair.background));
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
  /** D-03, K4: generic Dimensio sets hold aliases only and re-point roles only. */
  "dimensio-sets-alias-only": dimensioSetIssues,
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

export function regularoEnforcementIssues(modelo: Modelo): ValidationIssue[] {
  return modelo.reguloj.flatMap((regulo) =>
    regulo.checkability === "automatic" ? (REGULO_ENFORCERS[regulo.name]?.(modelo) ?? []) : [],
  );
}
