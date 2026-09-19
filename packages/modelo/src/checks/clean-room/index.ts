// Clean-room check (FR-17, S7, AK-07): (1) no listed file under a benchmark directory, (2) no code
// or config file references a benchmark path, (3) every FR-14 identifier matches the Fundamento
// namespace (the allowlist of vortaro-lint (b); no blocklist of foreign names).

import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { loadScanTree, scanScopeOf } from "../namespace/files.js";
import { extensionOf, REFERENCE_EXTENSIONS } from "../namespace/paths.js";
import { compareIssues, scanNamespace } from "../namespace/scan.js";
import { isBenchmarkSegment, isSelfReferenceExempt } from "./patterns.js";
import { findBenchmarkPaths, findBenchmarkReferences } from "./rules.js";

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

  const namespace = scanNamespace(tree);
  const foreignIssues = namespace.issues.map(asForeignPrefix);

  const errors = [...pathIssues, ...referenceIssues, ...foreignIssues].sort(compareIssues);
  const ok = errors.length === 0;
  return {
    check: "clean-room",
    ok,
    summary: `${tree.paths.length} files scanned (${tree.listing} listing), ${referenceFiles} searched for benchmark references: ${
      ok
        ? "no benchmark files or references, all identifiers in the Fundamento namespace"
        : `${pathIssues.length} benchmark path(s), ${referenceIssues.length} benchmark reference(s), ${foreignIssues.length} foreign identifier(s)`
    }.`,
    errors,
    warnings: [],
    stats: {
      files: tree.paths.length,
      benchmarkPaths: pathIssues.length,
      referenceFiles,
      exemptFiles,
      identifierFiles:
        namespace.stats.cssFiles + namespace.stats.scriptFiles + namespace.stats.jsonFiles,
    },
  };
}
