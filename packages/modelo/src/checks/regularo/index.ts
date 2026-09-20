// Regularo check (Art. X gate 3, S5.3, FR-08, FR-15). Reads only `data/reguloj.json` and
// `data/jugxoj.json` of the repo Modelo (or of the `--fixture` Modelo root), strictly parsed but
// without schema validation, so the check works even when the rest of the Modelo is broken. The
// Ero IDs come from `data/eroj/<name>/skemo.json` (Spec 003), for Jugxoj that refer to an Ero.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { modeloRootOf, relativeModeloPath } from "../../load/source.js";
import { readStrictJsonFile } from "../parity/read-json.js";
import { checkSource } from "../source.js";
import { checkRegularo, type RegularoDocument } from "./rules.js";

export * from "./rules.js";

export const REGULOJ_FILE_NAME = "reguloj.json";
export const JUGXOJ_FILE_NAME = "jugxoj.json";

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source = checkSource(options);
  const root = modeloRootOf(source);
  const readIssues: ValidationIssue[] = [];
  const read = (name: string): RegularoDocument | undefined => {
    const absolutePath = join(source.dataDir, name);
    const file = relativeModeloPath(root, absolutePath);
    const result = readStrictJsonFile(absolutePath, file);
    readIssues.push(...result.issues);
    return result.issues.length === 0 ? { file, value: result.value } : undefined;
  };
  const readIn = (dir: string, name: string): RegularoDocument | undefined => {
    const absolutePath = join(dir, name);
    const file = relativeModeloPath(root, absolutePath);
    const result = readStrictJsonFile(absolutePath, file);
    readIssues.push(...result.issues);
    return result.issues.length === 0 ? { file, value: result.value } : undefined;
  };
  // Aspekto packages may carry their own Reguloj and Jugxoj (D-10).
  const packageDocs = (name: string) =>
    (source.aspektoPackages ?? []).flatMap((dir) => {
      if (!existsSync(join(dir, name))) return [];
      const document = readIn(dir, name);
      return document === undefined ? [] : [document];
    });
  const reguloj = [read(REGULOJ_FILE_NAME), ...packageDocs(REGULOJ_FILE_NAME)].filter(
    (document): document is RegularoDocument => document !== undefined,
  );
  const jugxoj = [read(JUGXOJ_FILE_NAME), ...packageDocs(JUGXOJ_FILE_NAME)].filter(
    (document): document is RegularoDocument => document !== undefined,
  );

  const input = { reguloj, jugxoj, eroIds: eroIdsIn(join(source.dataDir, "eroj"), readIn) };
  const { issues, stats } = checkRegularo(input);
  const errors = [...readIssues, ...issues];
  const ok = errors.length === 0;
  const kialoMissing = issues.filter(({ rule }) => rule === "regulo-kialo-missing").length;
  const refMissing = issues.filter(({ rule }) => rule === "jugxo-ref-missing").length;
  const counts = `${stats.reguloj} Regulo(j), ${stats.jugxoj} Jugxo(j)`;
  return {
    check: "regularo",
    ok,
    summary: ok
      ? `${counts}: every Regulo has a kialo, every Jugxo references an existing Regulo, Ero or Article.`
      : `${counts}: ${kialoMissing} Regulo(j) without kialo, ${refMissing} dangling Jugxo reference(s), ${errors.length - kialoMissing - refMissing} other issue(s).`,
    errors,
    warnings: [],
    stats,
  };
}

/** IDs of the Eroj in `<erojDir>/<name>/skemo.json`; unreadable files are reported by `read`. */
function eroIdsIn(
  erojDir: string,
  read: (dir: string, name: string) => RegularoDocument | undefined,
): Set<string> {
  let names: string[];
  try {
    names = readdirSync(erojDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return new Set();
  }
  const ids = new Set<string>();
  for (const name of names) {
    const dir = join(erojDir, name);
    if (!existsSync(join(dir, "skemo.json"))) continue;
    const value = read(dir, "skemo.json")?.value;
    const ero =
      typeof value === "object" && value !== null && "ero" in value ? value.ero : undefined;
    if (typeof ero === "object" && ero !== null && "id" in ero && typeof ero.id === "string") {
      ids.add(ero.id);
    }
  }
  return ids;
}
