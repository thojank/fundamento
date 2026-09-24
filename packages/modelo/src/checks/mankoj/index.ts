// Mankoj check (F41). Reads only `data/mankoj.json` of the repo Modelo (or of the `--fixture`
// Modelo root), strictly parsed but without schema validation, so the check works even when the
// rest of the Modelo is broken. It is the contract the CI holds the register of gaps to: every
// Manko is complete and carries a closing condition — a system that keeps its gaps is something
// other than one that keeps quiet about them.

import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { modeloRootOf, relativeModeloPath } from "../../load/source.js";
import { readStrictJsonFile } from "../parity/read-json.js";
import { checkSource } from "../source.js";
import { checkMankoj, type MankoDocument } from "./rules.js";

export * from "./rules.js";

export const MANKOJ_FILE_NAME = "mankoj.json";

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source = checkSource(options);
  const root = modeloRootOf(source);
  const readIssues: ValidationIssue[] = [];
  const absolutePath = join(source.dataDir, MANKOJ_FILE_NAME);
  const file = relativeModeloPath(root, absolutePath);
  const parsed = readStrictJsonFile(absolutePath, file);
  readIssues.push(...parsed.issues);
  const document: MankoDocument | undefined =
    parsed.issues.length === 0 ? { file, value: parsed.value } : undefined;

  const { issues, stats } = checkMankoj(document === undefined ? {} : { mankoj: document });
  const errors = [...readIssues, ...issues];
  const ok = errors.length === 0;
  const closing = issues.filter(({ rule }) => rule === "manko-closing-missing").length;
  const counts = `${stats.mankoj} Manko(j)`;
  return {
    check: "mankoj",
    ok,
    summary: ok
      ? `${counts}: every gap names its Celo, stands complete and says how a run recognises that it is gone.`
      : `${counts}: ${closing} without a usable closing condition, ${errors.length - closing} other issue(s).`,
    errors,
    warnings: [],
    stats,
  };
}
