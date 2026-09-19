// I/O edge shared by the parity and regularo checks: read one JSON file through the strict parser.

import { readFileSync } from "node:fs";
import { formatIssuePath, type ValidationIssue } from "../../contracts/issues.js";
import { parseStrictJson } from "../../json/strict-json.js";

export interface JsonFileResult {
  /** Present only when the file exists and parses without issues. */
  value?: unknown;
  issues: ValidationIssue[];
}

/**
 * Reads `absolutePath` and parses it with `parseStrictJson`. `file` is the name used in issue
 * paths. A missing or unreadable file gives `file-missing` at `<file>#`. Never throws.
 */
export function readStrictJsonFile(absolutePath: string, file: string): JsonFileResult {
  let text: string;
  try {
    text = readFileSync(absolutePath, "utf8");
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    const reason = code === "" || code === "ENOENT" ? "does not exist" : `cannot be read (${code})`;
    return {
      issues: [
        {
          rule: "file-missing",
          severity: "error",
          path: formatIssuePath({ file, pointer: "" }),
          message: `${file} ${reason}.`,
          suggestion: `Create ${file} as a JSON file, or point the check at the right directory.`,
        },
      ],
    };
  }
  const parsed = parseStrictJson(text, file);
  return parsed.issues.length === 0
    ? { value: parsed.value, issues: [] }
    : { issues: parsed.issues };
}
