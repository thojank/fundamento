// check:privat (Spec 036 Teil 6, 6.4, D-10, D-23). Keeps the word that R-12 bans and the name of
// the private font repository out of every versioned file: it scans `git ls-files` of the repo
// (or of the `--fixture` root) by SHA-256 of lower-cased letter-and-digit windows (rules.ts), so it
// holds no plain name. Exceptions are only the verbatim spec copies of escepoj.json, each with its
// reason and pinned by SHA-256: an entry applies while the file has exactly that hash, and a
// listed file that is missing is fine. The codemod scripts/neutrale-namen/ removes what it finds.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { lineColumn, textPath } from "../namespace/paths.js";
import escepojDocument from "./escepoj.json" with { type: "json" };
import { findPrivateNames, SOUGHT_NAMES, type SoughtName } from "./rules.js";

export * from "./rules.js";

export interface PrivatException {
  /** Repo-relative path with `/` separators. */
  path: string;
  /** SHA-256 of the file's bytes; the exception holds only for exactly this content. */
  sha256: string;
  kialo: string;
}

/** The exception list (D-23): verbatim spec copies pinned by SHA-256, each with its reason. */
export const ESCEPOJ: readonly PrivatException[] = escepojDocument.escepoj;

const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

/** The tracked files of a checkout, sorted (`git ls-files`). */
export function trackedFiles(root: string): string[] {
  const result = spawnSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ls-files failed in ${root}: ${result.stderr.trim()}`);
  }
  return result.stdout
    .split("\0")
    .filter((path) => path !== "")
    .sort();
}

const DESCRIPTION: Readonly<Record<SoughtName["rule"], string>> = {
  "privat-vorto": "the word that Spec 036 R-12 bans",
  "privat-repo": "the private font repository",
};

const SUGGESTION: Readonly<Record<SoughtName["rule"], string>> = {
  "privat-vorto":
    "Run `node scripts/neutrale-namen/codemod.mjs` (neutral extension key, URN schema IDs and ontology, neutral wording); code that must know the old name composes it at run time (D-23). A verbatim spec copy goes on packages/modelo/src/checks/privat/escepoj.json with its SHA-256 and reason.",
  "privat-repo":
    "Name the variable FM_TIPAROJ_REPO instead of the repository (Spec 036 6.6); `node scripts/neutrale-namen/codemod.mjs` rewrites the mentions.",
};

export async function check(options: CheckOptions): Promise<CheckResult> {
  const root = options.fixture ?? options.repoRoot;
  const exceptions = new Map(ESCEPOJ.map((entry) => [entry.path, entry]));
  const errors: ValidationIssue[] = [];
  const stats = {
    files: 0,
    filesWithHits: 0,
    hits: 0,
    exceptions: 0,
    exceptionsMissing: 0,
    exceptionsChanged: 0,
  };
  const files = trackedFiles(root);
  const tracked = new Set(files);
  for (const entry of ESCEPOJ) {
    if (!tracked.has(entry.path) || !existsSync(join(root, entry.path))) stats.exceptionsMissing++;
  }

  for (const path of files) {
    const absolute = join(root, path);
    if (!existsSync(absolute) || !lstatSync(absolute).isFile()) continue;
    const bytes = readFileSync(absolute);
    const exception = exceptions.get(path);
    const changed = exception !== undefined && sha256(bytes) !== exception.sha256;
    if (exception !== undefined && !changed) {
      stats.exceptions++;
      continue;
    }
    if (changed) stats.exceptionsChanged++;
    stats.files++;
    const text = bytes.toString("utf8");
    const hits = findPrivateNames(text);
    if (hits.length === 0) continue;
    stats.filesWithHits++;
    stats.hits += hits.length;
    for (const sought of SOUGHT_NAMES) {
      const own = hits.filter((hit) => hit.rule === sought.rule);
      const first = own[0];
      if (first === undefined) continue;
      const { line, column } = lineColumn(text, first.offset);
      errors.push({
        rule: sought.rule,
        severity: "error",
        path: textPath(path, line, column),
        message: `${path} names ${DESCRIPTION[sought.rule]} ${own.length} time(s), first here.${
          changed
            ? " The file is on the exception list, but its SHA-256 is no longer the pinned one."
            : ""
        } ${sought.kialo}`,
        suggestion: SUGGESTION[sought.rule],
      });
    }
  }

  const ok = errors.length === 0;
  return {
    check: "privat",
    ok,
    summary: ok
      ? `No tracked file names the old names (${stats.files} files scanned, ${stats.exceptions} verbatim exceptions).`
      : `${stats.filesWithHits} tracked files name the old names (${stats.hits} hits); run node scripts/neutrale-namen/codemod.mjs.`,
    errors,
    warnings: [],
    stats,
  };
}
