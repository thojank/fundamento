// Clean-room rules (1) and (2): pure functions over scan paths and file texts.

import type { ValidationIssue } from "../../contracts/issues.js";
import { lineColumn, textPath } from "../namespace/paths.js";
import { BENCHMARK_REFERENCE_PATTERN, isBenchmarkSegment } from "./patterns.js";

const MAX_EXAMPLES = 3;

/**
 * (1) Listed files under a benchmark directory. One issue per benchmark directory, at
 * `<dir>/`, however many files it holds. A walk entry `<dir>/` stands for a non-empty directory.
 */
export function findBenchmarkPaths(paths: readonly string[]): ValidationIssue[] {
  const byDirectory = new Map<string, string[]>();
  for (const path of paths) {
    const segments = path.split("/");
    const index = segments.findIndex((segment) => isBenchmarkSegment(segment));
    if (index === -1) {
      continue;
    }
    const directory = `${segments.slice(0, index + 1).join("/")}/`;
    const files = byDirectory.get(directory) ?? [];
    if (path !== directory) {
      files.push(path);
    }
    byDirectory.set(directory, files);
  }
  return [...byDirectory.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([directory, files]) => ({
      rule: "clean-room-benchmark-path",
      severity: "error",
      path: directory,
      message:
        files.length === 0
          ? `Benchmark directory "${directory}" lies in the repository.`
          : `${files.length} file(s) lie under benchmark directory "${directory}" (e.g. ${files
              .slice(0, MAX_EXAMPLES)
              .join(", ")}).`,
      suggestion:
        "Remove the benchmark material from the repository; benchmark directories are git-ignored and must never be committed (Art. V).",
    }));
}

/** (2) References to benchmark paths in one code or config file. */
export function findBenchmarkReferences(file: string, text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const match of text.matchAll(BENCHMARK_REFERENCE_PATTERN)) {
    const { line, column } = lineColumn(text, match.index);
    issues.push({
      rule: "clean-room-benchmark-reference",
      severity: "error",
      path: textPath(file, line, column),
      message: `References the benchmark path "${match[0]}".`,
      suggestion:
        "Remove the reference; nothing in the repository may import or point at benchmark material (Art. V).",
    });
  }
  return issues;
}
