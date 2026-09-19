// Vortaro-Lint check (FR-14, FR-15, S5.1): (a) no literal design values in Projekcio CSS outside
// `--fm-*` definitions, (b) the FR-14 namespace rule over the whole repo (or the `--fixture`
// directory, which is treated as the scan root of a mini repo).

import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { isBenchmarkSegment } from "../clean-room/patterns.js";
import { loadScanTree, scanScopeOf } from "../namespace/files.js";
import { CSS_EXTENSIONS, extensionOf } from "../namespace/paths.js";
import { compareIssues, scanNamespace } from "../namespace/scan.js";
import { checkCssLiterals } from "./css-literal.js";

export { checkCssLiterals, findLiteral } from "./css-literal.js";

/** Projekcio sources; generated `dist/**` CSS is added from the scan tree. */
const PROJEKCIO_PATTERN = /^packages\/projekcioj\//;

export async function check(options: CheckOptions): Promise<CheckResult> {
  const scope = scanScopeOf(options);
  const tree = await loadScanTree(scope.root, {
    opaqueDirectory: isBenchmarkSegment,
    ignoredRootFiles: scope.ignoredRootFiles,
  });
  const namespace = scanNamespace(tree);

  const projekcioCss = [
    ...tree.paths.filter(
      (path) => PROJEKCIO_PATTERN.test(path) && CSS_EXTENSIONS.has(extensionOf(path)),
    ),
    ...tree.generatedCss,
  ];
  const literalIssues: ValidationIssue[] = [];
  let declarations = 0;
  for (const path of projekcioCss) {
    const text = tree.texts.get(path);
    if (text !== undefined) {
      const result = checkCssLiterals(path, text);
      declarations += result.declarations;
      literalIssues.push(...result.issues);
    }
  }

  const errors = [...namespace.issues, ...literalIssues].sort(compareIssues);
  const ok = errors.length === 0;
  return {
    check: "vortaro-lint",
    ok,
    summary: `${tree.paths.length} files scanned (${tree.listing} listing), ${projekcioCss.length} Projekcio CSS files: ${
      ok
        ? "all identifiers in the Fundamento namespace, no literal CSS values"
        : `${namespace.issues.length} namespace issue(s), ${literalIssues.length} literal CSS value(s)`
    }.`,
    errors,
    warnings: [],
    stats: { ...namespace.stats, projekcioCssFiles: projekcioCss.length, declarations },
  };
}
