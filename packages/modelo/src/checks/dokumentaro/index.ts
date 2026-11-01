// check:dokumentaro (Spec 036 Teil 5 ③, Spec 029 ③). Reads the Skemo and the Uzo of every Ero
// folder of the repo Modelo (or of the `--fixture` Modelo root), strictly parsed but without schema
// validation, like check:regularo: the check works when the rest of the Modelo is broken. It holds
// the documentation per Ero to the nine sections of its Vitrino page – the three written in the
// Uzo stand in German and English, none still holds the placeholder.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { SKEMO_FILE_NAME, UZO_FILE_NAME } from "../../load/files.js";
import { modeloRootOf, relativeModeloPath } from "../../load/source.js";
import { readStrictJsonFile } from "../parity/read-json.js";
import { checkSource } from "../source.js";
import { checkDokumentaro, type DokumentaroEro } from "./rules.js";

export * from "./rules.js";

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source = checkSource(options);
  const root = modeloRootOf(source);
  const readIssues: ValidationIssue[] = [];
  const erojDir = join(source.dataDir, "eroj");
  const eroj: DokumentaroEro[] = [];
  for (const name of folderNames(erojDir)) {
    const dir = join(erojDir, name);
    if (!existsSync(join(dir, SKEMO_FILE_NAME))) continue;
    const skemoFile = relativeModeloPath(root, join(dir, SKEMO_FILE_NAME));
    const skemo = readStrictJsonFile(join(dir, SKEMO_FILE_NAME), skemoFile);
    readIssues.push(...skemo.issues);
    const entry: DokumentaroEro = { name, keys: keysOf(skemo.value), skemoFile };
    if (existsSync(join(dir, UZO_FILE_NAME))) {
      const file = relativeModeloPath(root, join(dir, UZO_FILE_NAME));
      const uzo = readStrictJsonFile(join(dir, UZO_FILE_NAME), file);
      readIssues.push(...uzo.issues);
      if (uzo.issues.length === 0) entry.uzo = { file, value: uzo.value };
      else continue;
    }
    eroj.push(entry);
  }
  const { issues, stats } = checkDokumentaro(eroj);
  const errors = [...readIssues, ...issues];
  const ok = errors.length === 0;
  const counts = `${stats.eroj} Ero(j)`;
  return {
    check: "dokumentaro",
    ok,
    summary: ok
      ? `${counts}: every Uzo has when-not, do-dont and keyboard written in German and English; every Ero page has its nine sections.`
      : `${counts}: ${stats.kompletaj} complete; ${stats.mankantaj} field(s) missing, ${stats.offenaj} still the placeholder, ${errors.length - (stats.mankantaj ?? 0) - (stats.offenaj ?? 0)} other issue(s).`,
    errors,
    warnings: [],
    stats,
  };
}

/** `a11y.keys` of a parsed Skemo file, or nothing. */
function keysOf(value: unknown): string[] {
  const skemo =
    typeof value === "object" && value !== null && "skemo" in value ? value.skemo : undefined;
  const a11y =
    typeof skemo === "object" && skemo !== null && "a11y" in skemo ? skemo.a11y : undefined;
  const keys =
    typeof a11y === "object" && a11y !== null && "keys" in a11y && Array.isArray(a11y.keys)
      ? (a11y.keys as unknown[])
      : [];
  return keys.filter((key): key is string => typeof key === "string");
}

function folderNames(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}
