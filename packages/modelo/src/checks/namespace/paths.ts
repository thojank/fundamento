// Path helpers shared by the namespace scanner, vortaro-lint and clean-room. All scan paths are
// relative to the scan root and use `/` separators.

/** FR-14: fixtures that fail on purpose are only examined when passed via `--fixture`. */
const INVALID_FIXTURE_PATTERN = /(^|\/)test\/fixtures\/invalid\//;

export function isExcludedFromRepoScan(path: string): boolean {
  return INVALID_FIXTURE_PATTERN.test(path);
}

/** Whether `text` contains a character outside ASCII (U+0000..U+007F). */
export function hasNonAscii(text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    if (text.charCodeAt(index) > 0x7f) {
      return true;
    }
  }
  return false;
}

/** Issue path for a position in a non-JSON text file: `<file>:<line>:<column>` (1-based). */
export function textPath(file: string, line: number, column: number): string {
  return `${file}:${line}:${column}`;
}

/** 1-based line and column of a character offset. */
export function lineColumn(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset);
  const lineStart = before.lastIndexOf("\n") + 1;
  return { line: before.split("\n").length, column: offset - lineStart + 1 };
}

export function extensionOf(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? "" : name.slice(dot).toLowerCase();
}

export function baseNameOf(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export const CSS_EXTENSIONS: ReadonlySet<string> = new Set([".css"]);
export const JSON_EXTENSIONS: ReadonlySet<string> = new Set([".json", ".jsonc"]);
/** Files that may register custom elements. */
export const SCRIPT_EXTENSIONS: ReadonlySet<string> = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".html",
  ".htm",
]);
/** Code and config files that clean-room searches for benchmark references. */
export const REFERENCE_EXTENSIONS: ReadonlySet<string> = new Set([
  ...CSS_EXTENSIONS,
  ...JSON_EXTENSIONS,
  ...SCRIPT_EXTENSIONS,
  ".yaml",
  ".yml",
]);

/** Whether the scanner needs the contents of a file (all other files are checked by path only). */
export function needsText(path: string): boolean {
  return REFERENCE_EXTENSIONS.has(extensionOf(path));
}
