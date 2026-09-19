// aspekto-font-undeclared (Spec 001, D-05, FR-05): the first family of every fontFamily token an
// Aspekto resolves to is either a generic family or declared in the Aspekto's `aspekto.json`
// fonts[], which carries its license and whether it may be redistributed. Pure.

import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolve } from "../resolve/resolve.js";

/** Generic font families: they name no font file and need no license. */
export const GENERIC_FONT_FAMILIES: ReadonlySet<string> = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
]);

function firstFamily(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first : undefined;
}

export function fontIssues(modelo: Modelo): ValidationIssue[] {
  const issues = new Map<string, ValidationIssue>();
  for (const pkg of modelo.aspektoPackages) {
    if (!pkg.composed || pkg.aspekto === undefined) {
      continue;
    }
    const declared = new Set((pkg.fonts ?? []).map((font) => font.family));
    const assignments = allAssignments(modelo).filter(
      (assignment) => assignment[ASPEKTO_DIMENSIO] === pkg.aspekto,
    );
    for (const assignment of assignments) {
      const outcome = resolve(modelo, assignment);
      if (!outcome.ok) {
        continue; // Alias problems are reported by the combination rules.
      }
      for (const [name, token] of Object.entries(outcome.rezolvo.tokens)) {
        if (token.type !== "fontFamily") continue;
        const family = firstFamily(token.value);
        if (family === undefined || GENERIC_FONT_FAMILIES.has(family) || declared.has(family)) {
          continue;
        }
        // The literal sits at the end of the alias chain, or at the winning definition.
        const holder = token.aliasChain.at(-1) ?? { token: name, set: token.origin.set };
        // Set names are unique within a valid Modelo (a duplicate is aspekto-name-duplicate).
        const set = modelo.setoj.find((candidate) => candidate.name === holder.set);
        const location = set?.tokens[holder.token]?.location;
        const path =
          location === undefined ? `${pkg.aspektoFile}#/fonts` : formatIssuePath(location);
        issues.set(`${path} ${family}`, {
          rule: "aspekto-font-undeclared",
          severity: "error",
          path,
          message: `The Aspekto ${pkg.aspekto} uses the font family '${family}' (${name}), which its aspekto.json does not declare.`,
          suggestion: `Declare '${family}' in ${pkg.aspektoFile} fonts[] with license, source and redistributable, or start the stack with a declared or generic family.`,
        });
      }
    }
  }
  return [...issues.values()];
}
