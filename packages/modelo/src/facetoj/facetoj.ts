// The brand model, scope 1 (Spec 033 S1): data/facetoj.json, every visual aspect of a brand as a
// Faceto of the layer vida with its weight, its Kialo, the tokens it owns and the fields of the
// Agordo that define it. A token belongs to the Faceto one of whose prefixes it starts with (whole
// segments); an Ero-Tokeno or a token of a Sxablono without a rule of its own belongs where its alias
// chain leads. `checkFacetoj` says that every token of the core belongs to exactly one. Pure apart
// from the read.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aliasTarget } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { LoadedToken, Modelo } from "../contracts/modelo.js";
import type { FacetojFile } from "../generated/modelo-schema.js";

export type { Faceto, FacetojFile, KronikoEro } from "../generated/modelo-schema.js";

export const FACETOJ_FILE_NAME = "facetoj.json";

/** Reads `<dataDir>/facetoj.json`; undefined when the directory has none. */
export function readFacetoj(dataDir: string): FacetojFile | undefined {
  const file = join(dataDir, FACETOJ_FILE_NAME);
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8")) as FacetojFile;
}

/** Whether `name` is `prefix` or lies below it, whole segments only. */
export const underPrefix = (name: string, prefix: string): boolean =>
  name === prefix || name.startsWith(`${prefix}.`);

/** The Facetoj whose own prefixes match the token, without following an alias. */
function directOwners(facetoj: FacetojFile, name: string): string[] {
  return facetoj.facetoj
    .filter((faceto) => faceto.tokenoj.some((prefix) => underPrefix(name, prefix)))
    .map((faceto) => faceto.name);
}

/**
 * The Facetoj a token of the core belongs to: its own rule first, else the first token of its alias
 * chain that has one. Exactly one for a complete list; none or two are what checkFacetoj reports.
 */
export function facetojOfToken(
  facetoj: FacetojFile,
  core: Readonly<Record<string, Pick<LoadedToken, "value">>>,
  name: string,
): string[] {
  const seen = new Set<string>();
  let current = name;
  for (;;) {
    const owners = directOwners(facetoj, current);
    if (owners.length > 0) return owners;
    const target = aliasTarget(core[current]?.value);
    if (target === undefined || seen.has(target)) return [];
    seen.add(current);
    current = target;
  }
}

const issue = (
  rule: ValidationIssue["rule"],
  path: string,
  message: string,
  suggestion: string,
): ValidationIssue => ({
  rule,
  severity: "error",
  path: `data/${FACETOJ_FILE_NAME}#${path}`,
  message,
  suggestion,
});

/** Every token of the core belongs to exactly one Faceto. */
export function checkFacetoj(modelo: Modelo, facetoj: FacetojFile): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};
  const issues: ValidationIssue[] = [];
  for (const name of Object.keys(core).sort()) {
    const owners = facetojOfToken(facetoj, core, name);
    if (owners.length === 0) {
      issues.push(
        issue(
          "faceto-token-unassigned",
          `/facetoj`,
          `The token ${name} belongs to no Faceto of the brand model.`,
          "Add a prefix of it to the tokenoj of the Faceto it belongs to.",
        ),
      );
    } else if (owners.length > 1) {
      issues.push(
        issue(
          "faceto-token-twice",
          `/facetoj`,
          `The token ${name} belongs to ${owners.join(" and ")}.`,
          "Keep the prefixes of the Facetoj apart so that every token has exactly one.",
        ),
      );
    }
  }
  return issues;
}
