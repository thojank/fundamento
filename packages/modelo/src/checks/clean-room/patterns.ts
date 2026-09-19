// Benchmark path patterns of the clean-room check (FR-17, S7, Constitution Art. V).
//
// This file is the ONLY place in the code that spells out the benchmark directory names, and it
// is the one file exempted from the reference scan (see SELF_REFERENCE_EXEMPTIONS). It holds
// nothing but these patterns, so the exemption cannot hide anything else. Tests and the check
// logic build benchmark names from these constants instead of repeating them.

// Directory name that holds benchmark material; git-ignored, see GITIGNORE_BENCHMARK_PATTERNS.
export const BENCHMARK_DIR_NAME = "_benchmark";

// Prefix of benchmark design-system directories; git-ignored, see GITIGNORE_BENCHMARK_PATTERNS.
export const BENCHMARK_DIR_PREFIX = "ds-benchmark-";

/** The two lines the repo `.gitignore` must contain. */
export const GITIGNORE_BENCHMARK_PATTERNS = ["_benchmark/", "**/ds-benchmark-*/"] as const;

/** Whether one path segment names a benchmark directory. */
export function isBenchmarkSegment(segment: string): boolean {
  return segment === BENCHMARK_DIR_NAME || segment.startsWith(BENCHMARK_DIR_PREFIX);
}

/**
 * A reference to a benchmark path inside code or config text: the directory name as a whole path
 * segment (not preceded or followed by identifier characters, so e.g. `run_benchmark` is fine).
 */
export const BENCHMARK_REFERENCE_PATTERN =
  /(?<![A-Za-z0-9_.-])(_benchmark|ds-benchmark-[A-Za-z0-9_.*-]*)(?![A-Za-z0-9_-])/g;

/**
 * Files exempted from the reference scan, relative to the repo root. Only this pattern source;
 * `.gitignore` and Markdown are outside the scanned file types anyway. Applies to the repo run
 * only, never to a `--fixture` scan.
 */
export const SELF_REFERENCE_EXEMPTIONS: readonly string[] = [
  "packages/modelo/src/checks/clean-room/patterns.ts",
];

export function isSelfReferenceExempt(path: string, repoRun: boolean): boolean {
  return repoRun && SELF_REFERENCE_EXEMPTIONS.includes(path);
}
