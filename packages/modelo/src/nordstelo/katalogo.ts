// The catalogue of the north-star measure (Spec 030): data/nordstelo.json, the tasks a
// context-free agent is asked to build and the weights of the score. Read and checked here; the
// run and the scoring live in @fundamento/nordstelo. The schema (NordsteloFile) checks the form,
// `checkNordstelo` that every Sxablono, Ero and Regulo it names exists. Pure apart from the read.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import type { NordsteloFile } from "../generated/modelo-schema.js";

export type {
  Kriterio,
  NordsteloFile,
  NordsteloKontrolo,
  NordsteloTeksto,
  Pezo,
  Tasko,
} from "../generated/modelo-schema.js";

export const NORDSTELO_FILE_NAME = "nordstelo.json";

/** How a criterion is decided (NordsteloKontrolo.kind), in the order of the schema. */
export const KRITERIO_KINDS = ["aria", "named-fields", "elemento", "teksto"] as const;

/** Reads `<dataDir>/nordstelo.json`; undefined when the directory has none. */
export function readNordstelo(dataDir: string): NordsteloFile | undefined {
  const file = join(dataDir, NORDSTELO_FILE_NAME);
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8")) as NordsteloFile;
}

const issue = (
  rule: ValidationIssue["rule"],
  path: string,
  message: string,
  suggestion: string,
): ValidationIssue => ({
  rule,
  severity: "error",
  path: `data/${NORDSTELO_FILE_NAME}#${path}`,
  message,
  suggestion,
});

/** Every Sxablono, Ero and Regulo the catalogue names must exist in the Modelo. */
export function checkNordstelo(modelo: Modelo, katalogo: NordsteloFile): ValidationIssue[] {
  const sxablonoj = new Set((modelo.sxablonoj ?? []).map((entry) => entry.sxablono.name));
  const eroj = new Set(modelo.eroj.map((entry) => entry.ero.name));
  const reguloj = new Set(modelo.reguloj.map((regulo) => regulo.name));
  const issues: ValidationIssue[] = [];
  for (const [t, tasko] of katalogo.taskoj.entries()) {
    if (!sxablonoj.has(tasko.sxablono)) {
      issues.push(
        issue(
          "nordstelo-sxablono-unknown",
          `/taskoj/${t}/sxablono`,
          `The task ${tasko.name} names the Sxablono ${tasko.sxablono}, which the Modelo does not have.`,
          `Name one of: ${[...sxablonoj].sort().join(", ")}.`,
        ),
      );
    }
    for (const [e, ero] of tasko.eroj.entries()) {
      if (!eroj.has(ero)) {
        issues.push(
          issue(
            "nordstelo-ero-unknown",
            `/taskoj/${t}/eroj/${e}`,
            `The task ${tasko.name} names the Ero ${ero}, which the Modelo does not have.`,
            "Name an Ero of data/eroj/.",
          ),
        );
      }
    }
    for (const [k, kriterio] of tasko.kriterioj.entries()) {
      if (!reguloj.has(kriterio.regulo)) {
        issues.push(
          issue(
            "nordstelo-regulo-unknown",
            `/taskoj/${t}/kriterioj/${k}/regulo`,
            `The criterion ${kriterio.id} names the Regulo ${kriterio.regulo}, which the Modelo does not have.`,
            "Name a Regulo of data/reguloj.json; its kialo is the reason of the criterion.",
          ),
        );
      }
    }
  }
  return issues;
}
