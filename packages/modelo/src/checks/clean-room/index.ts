// Clean-room check (FR-17, S7, AK-07): (1) no listed file under a benchmark directory, (2) no code
// or config file references a benchmark path, (3) every FR-14 identifier matches the Fundamento
// namespace (the allowlist of vortaro-lint (b); no blocklist of foreign names).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { loadScanTree, scanScopeOf } from "../namespace/files.js";
import { extensionOf, REFERENCE_EXTENSIONS } from "../namespace/paths.js";
import { compareIssues, scanNamespace } from "../namespace/scan.js";
import {
  findBrandValues,
  MARKO_SPURO_ALLOWLIST,
  MARKO_SPUROJ_FILE_NAME,
  parseFingerprints,
  repoFingerprints,
} from "./marko-spuro.js";
import { isBenchmarkSegment, isSelfReferenceExempt } from "./patterns.js";
import { findBenchmarkPaths, findBenchmarkReferences } from "./rules.js";

export * from "./marko-spuro.js";
export * from "./patterns.js";
export * from "./rules.js";

/** (3): an FR-14 namespace finding, restated as a clean-room finding. */
function asForeignPrefix(issue: ValidationIssue): ValidationIssue {
  return {
    ...issue,
    rule: "clean-room-foreign-prefix",
    message: `Identifier outside the Fundamento namespace (${issue.rule}): ${issue.message}`,
  };
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  const scope = scanScopeOf(options);
  const tree = await loadScanTree(scope.root, {
    opaqueDirectory: isBenchmarkSegment,
    ignoredRootFiles: scope.ignoredRootFiles,
  });

  const pathIssues = findBenchmarkPaths(tree.paths);

  const referenceIssues: ValidationIssue[] = [];
  let referenceFiles = 0;
  let exemptFiles = 0;
  for (const path of tree.paths) {
    const text = tree.texts.get(path);
    if (text === undefined || !REFERENCE_EXTENSIONS.has(extensionOf(path))) {
      continue;
    }
    if (isSelfReferenceExempt(path, scope.repoRun)) {
      exemptFiles++;
      continue;
    }
    referenceFiles++;
    referenceIssues.push(...findBenchmarkReferences(path, text));
  }

  // D-15, K2: brand fingerprints over every text file (Markdown included) outside the allowlist.
  const fingerprints = fingerprintsFor(scope.root, scope.repoRun);
  const brandIssues: ValidationIssue[] = [];
  let fingerprintFiles = 0;
  for (const path of tree.paths) {
    if (!FINGERPRINT_EXTENSIONS.has(extensionOf(path))) continue;
    if (scope.repoRun ? MARKO_SPURO_ALLOWLIST.has(path) : path === MARKO_SPUROJ_FILE_NAME) continue;
    const text = tree.texts.get(path) ?? readText(join(scope.root, path));
    if (text === undefined) continue;
    fingerprintFiles++;
    brandIssues.push(...findBrandValues(path, text, fingerprints));
  }

  const namespace = scanNamespace(tree);
  const foreignIssues = namespace.issues.map(asForeignPrefix);

  const errors = [...pathIssues, ...referenceIssues, ...foreignIssues, ...brandIssues].sort(
    compareIssues,
  );
  const ok = errors.length === 0;
  return {
    check: "clean-room",
    ok,
    summary: `${tree.paths.length} files scanned (${tree.listing} listing), ${referenceFiles} searched for benchmark references: ${
      ok
        ? "no benchmark files or references, all identifiers in the Fundamento namespace"
        : `${pathIssues.length} benchmark path(s), ${referenceIssues.length} benchmark reference(s), ${foreignIssues.length} foreign identifier(s), ${brandIssues.length} brand value(s)`
    }.`,
    errors,
    warnings: [],
    stats: {
      files: tree.paths.length,
      benchmarkPaths: pathIssues.length,
      referenceFiles,
      exemptFiles,
      fingerprintFiles,
      brandValues: brandIssues.length,
      identifierFiles:
        namespace.stats.cssFiles + namespace.stats.scriptFiles + namespace.stats.jsonFiles,
    },
  };
}

/** Text files searched for brand values: everything the other rules read, plus prose. */
const FINGERPRINT_EXTENSIONS: ReadonlySet<string> = new Set([
  ...REFERENCE_EXTENSIONS,
  ".md",
  ".txt",
]);

function readText(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}

/** The repo's fingerprints; a fixture brings its own list (or none). */
function fingerprintsFor(root: string, repoRun: boolean): ReadonlySet<string> {
  if (repoRun) return repoFingerprints();
  const text = readText(join(root, MARKO_SPUROJ_FILE_NAME));
  return text === undefined ? new Set() : parseFingerprints(JSON.parse(text));
}
