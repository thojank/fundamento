// Reguloj the Modelo declares with checkability "automatic" are enforced here (Spec 001, D-19):
// the Regularo, with its kialoj, is the switch, so a test Modelo that declares the same Regulo as
// "manual" is not affected. Each enforceable Regulo name maps to one rule of the catalog. Pure.

import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";

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
