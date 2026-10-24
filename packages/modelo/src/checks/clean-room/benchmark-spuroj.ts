// The fingerprint lists of the benchmark files (Spec 032 ②, Art. V Benchmark-Aspekto): the one
// file a benchmark hands to the core repository stands in research/ and carries its lists between
// two markers, one SHA-256 per line under a heading that names the source and the count. The check
// reads them from there, unchanged, so the CI checks against every benchmark without --spuroj.

import type { ValidationIssue } from "../../contracts/issues.js";
import { textPath } from "../namespace/paths.js";

/** The directory of the benchmark files (repo-relative, also inside a fixture). */
export const BENCHMARK_SPUROJ_DIR = "research";

export const SPUROJ_START = "<!-- spuroj-anfang -->";
export const SPUROJ_END = "<!-- spuroj-ende -->";

/** A Markdown file directly in research/ may be a benchmark file; its markers decide. */
export function isBenchmarkSpurojPath(path: string): boolean {
  return new RegExp(`^${BENCHMARK_SPUROJ_DIR}/[^/]+\\.md$`).test(path);
}

/** "Quelle (source): <name>" (Carbon) or "Quelle `<name>`" (Astryx). */
const SOURCE = /Quelle(?: \(source\):\s*([a-z0-9][a-z0-9.-]*)|\s+`([a-z0-9][a-z0-9.-]*)`)/;
const COUNT = /(\d+) Fingerprints/;
const FINGERPRINT = /^[0-9a-f]{64}$/;

export interface BenchmarkSpuroj {
  lists: { source: string; fingerprints: string[] }[];
  issues: ValidationIssue[];
}

/** The lists of one benchmark file; a file without the start marker has none. */
export function parseBenchmarkSpuroj(text: string, path: string): BenchmarkSpuroj {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === SPUROJ_START);
  if (start === -1) return { lists: [], issues: [] };
  const issues: ValidationIssue[] = [];
  const invalid = (line: number, message: string): void => {
    issues.push({
      rule: "clean-room-spuroj-invalid",
      severity: "error",
      path: textPath(path, line + 1, 1),
      message,
      suggestion:
        "Take the benchmark file over unchanged from the benchmark repository; the check reads its lists as they stand.",
    });
  };
  const end = lines.findIndex((line, index) => index > start && line.trim() === SPUROJ_END);
  if (end === -1) {
    invalid(start, `The fingerprint lists open with ${SPUROJ_START} but never close.`);
    return { lists: [], issues };
  }
  const lists: (BenchmarkSpuroj["lists"][number] & { line: number; count?: number })[] = [];
  for (let index = start + 1; index < end; index++) {
    const line = lines[index]?.trim() ?? "";
    const source = SOURCE.exec(line);
    if (source !== null) {
      const count = COUNT.exec(line);
      lists.push({
        source: source[1] ?? source[2] ?? "",
        fingerprints: [],
        line: index,
        ...(count === null ? {} : { count: Number(count[1]) }),
      });
    } else if (FINGERPRINT.test(line)) {
      const list = lists.at(-1);
      if (list === undefined) invalid(index, "A fingerprint stands before any source.");
      else list.fingerprints.push(line);
    }
  }
  if (lists.length === 0) invalid(start, "The fingerprint block names no source.");
  for (const list of lists) {
    if (list.count !== list.fingerprints.length) {
      invalid(
        list.line,
        `The list '${list.source}' announces ${list.count ?? "no"} fingerprints and holds ${list.fingerprints.length}.`,
      );
    }
  }
  return {
    lists: lists.map(({ source, fingerprints }) => ({ source, fingerprints })),
    issues,
  };
}
