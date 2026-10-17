// Regularo check (Art. X gate 3, S5.3, FR-08, FR-15). Reads only `data/reguloj.json` and
// `data/jugxoj.json` of the repo Modelo (or of the `--fixture` Modelo root), strictly parsed but
// without schema validation, so the check works even when the rest of the Modelo is broken. The
// Ero IDs come from `data/eroj/<name>/skemo.json` (Spec 003), for Jugxoj that refer to an Ero. A
// Skemo without a `uzo.json` next to it is a warning (Spec 007, A1): valid, but its use is unknown.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import { formatIssuePath, type ValidationIssue } from "../../contracts/issues.js";
import { SKEMO_FILE_NAME, UZO_FILE_NAME } from "../../load/files.js";
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

  const erojDir = join(source.dataDir, "eroj");
  const input = { reguloj, jugxoj, eroIds: eroIdsIn(erojDir, readIn) };
  const { issues, stats } = checkRegularo(input);
  const uzo = uzoCoverage(erojDir, root);
  const shared = sharedGoalKeywords(erojDir, root, readIn, jugxoj);
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
    warnings: [...uzo.warnings, ...shared],
    stats: { ...stats, uzoj: uzo.count },
  };
}

/**
 * `skemo-uzo-missing` for every Ero folder with a Skemo but no Uzo, and the number of Uzoj. Only
 * the presence of the files counts here; the Uzo itself is validated with the Modelo.
 */
function uzoCoverage(
  erojDir: string,
  root: string,
): { warnings: ValidationIssue[]; count: number } {
  const warnings: ValidationIssue[] = [];
  let count = 0;
  for (const name of folderNames(erojDir)) {
    const dir = join(erojDir, name);
    const hasSkemo = existsSync(join(dir, SKEMO_FILE_NAME));
    if (existsSync(join(dir, UZO_FILE_NAME))) {
      count++;
    } else if (hasSkemo) {
      const file = relativeModeloPath(root, join(dir, SKEMO_FILE_NAME));
      warnings.push({
        rule: "skemo-uzo-missing",
        severity: "warning",
        path: formatIssuePath({ file, pointer: "/skemo" }),
        message: `The Ero ${name} has a Skemo but no Uzo: an agent learns how it is built, not what it is for and where it stops.`,
        suggestion: `Add ${name}/uzo.json next to the Skemo (purpose, instead, boundary, composes, slots, layout, content; Spec 007).`,
      });
    }
  }
  return { warnings, count };
}

/**
 * `goal-keyword-shared` (Nachlese 3 G3, Spec 011 ⑤ B-1): the same keyword in one language in the
 * goals of two Eroj — `suggest_ero` would let the first Ero in name order answer, or a person
 * where the goals tie (G2). A warning with both places, never removed by the check: each sharing
 * is the maintainer's decision. The exception is a Jugxo whose context names
 * `goal-keyword-shared <lingvo>:<keyword>`.
 */
function sharedGoalKeywords(
  erojDir: string,
  root: string,
  read: (dir: string, name: string) => RegularoDocument | undefined,
  jugxoj: readonly RegularoDocument[],
): ValidationIssue[] {
  const places = new Map<string, { ero: string; goal: string; path: string }[]>();
  for (const name of folderNames(erojDir)) {
    const dir = join(erojDir, name);
    if (!existsSync(join(dir, SKEMO_FILE_NAME))) continue;
    const document = read(dir, SKEMO_FILE_NAME);
    const value = document?.value;
    const skemo =
      typeof value === "object" && value !== null && "skemo" in value ? value.skemo : undefined;
    const goals =
      typeof skemo === "object" && skemo !== null && "goals" in skemo && Array.isArray(skemo.goals)
        ? (skemo.goals as unknown[])
        : [];
    goals.forEach((goal, goalIndex) => {
      if (typeof goal !== "object" || goal === null) return;
      const goalName =
        "goal" in goal && typeof goal.goal === "string" ? goal.goal : String(goalIndex);
      const keywords =
        "keywords" in goal && typeof goal.keywords === "object" && goal.keywords !== null
          ? (goal.keywords as Record<string, unknown>)
          : {};
      for (const [lingvo, list] of Object.entries(keywords)) {
        if (!Array.isArray(list)) continue;
        list.forEach((keyword, index) => {
          if (typeof keyword !== "string") return;
          const key = `${lingvo}:${keyword.normalize("NFC").toLowerCase()}`;
          const path = formatIssuePath({
            file: document?.file ?? relativeModeloPath(root, join(dir, SKEMO_FILE_NAME)),
            pointer: `/skemo/goals/${goalIndex}/keywords/${lingvo}/${index}`,
          });
          places.set(key, [...(places.get(key) ?? []), { ero: name, goal: goalName, path }]);
        });
      }
    });
  }
  const excepted = new Set<string>();
  for (const document of jugxoj) {
    const list =
      typeof document.value === "object" && document.value !== null && "jugxoj" in document.value
        ? (document.value as { jugxoj: unknown }).jugxoj
        : undefined;
    if (!Array.isArray(list)) continue;
    for (const jugxo of list) {
      const context =
        typeof jugxo === "object" && jugxo !== null && "context" in jugxo
          ? jugxo.context
          : undefined;
      if (typeof context !== "string") continue;
      for (const match of context.matchAll(/goal-keyword-shared ([a-z]{2}):(\S+)/g)) {
        excepted.add(`${match[1]}:${(match[2] ?? "").normalize("NFC").toLowerCase()}`);
      }
    }
  }
  const warnings: ValidationIssue[] = [];
  for (const [key, found] of places) {
    const eroj = [...new Set(found.map((place) => place.ero))];
    if (eroj.length < 2 || excepted.has(key)) continue;
    const [lingvo = "", keyword = ""] = key.split(":");
    const first = found[0];
    if (first === undefined) continue;
    warnings.push({
      rule: "goal-keyword-shared",
      severity: "warning",
      path: first.path,
      message: `The keyword "${keyword}" (${lingvo}) stands in the goals of ${eroj.length} Eroj: ${found
        .map((place) => `${place.ero}.${place.goal} (${place.path})`)
        .join(
          ", ",
        )}. suggest_ero lets the first Ero in name order answer, or asks a person where the goals tie.`,
      suggestion: `Decide which Ero owns the word (remove it from the others), or keep the sharing with a Jugxo whose context names goal-keyword-shared ${key}.`,
    });
  }
  return warnings;
}

/** Directory names below `dir`, sorted; none when it cannot be read. */
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

/** IDs of the Eroj in `<erojDir>/<name>/skemo.json`; unreadable files are reported by `read`. */
function eroIdsIn(
  erojDir: string,
  read: (dir: string, name: string) => RegularoDocument | undefined,
): Set<string> {
  const ids = new Set<string>();
  for (const name of folderNames(erojDir)) {
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
