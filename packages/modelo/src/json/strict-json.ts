// The only way Modelo files are parsed: strict JSON (no comments, no trailing commas, no empty
// content) plus a duplicate-key walk, so a repeated key is never silently overwritten.

import { type Node, type ParseError, parseTree, printParseErrorCode } from "jsonc-parser";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import { appendPointer } from "./pointer.js";

export interface StrictJsonResult {
  /** The parsed value; set only when there are no issues. */
  value?: unknown;
  issues: ValidationIssue[];
}

const PARSE_OPTIONS = {
  disallowComments: true,
  allowTrailingComma: false,
  allowEmptyContent: false,
} as const;

/** Human-readable descriptions of jsonc-parser error codes. */
const ERROR_DESCRIPTIONS: Readonly<Record<string, string>> = {
  InvalidSymbol: "invalid symbol",
  InvalidNumberFormat: "invalid number format",
  PropertyNameExpected: "property name expected (trailing comma or unquoted key?)",
  ValueExpected: "value expected (trailing comma or missing value?)",
  ColonExpected: "colon expected",
  CommaExpected: "comma expected",
  CloseBraceExpected: "closing brace expected",
  CloseBracketExpected: "closing bracket expected",
  EndOfFileExpected: "end of file expected (content after the JSON value)",
  InvalidCommentToken: "comments are not allowed in JSON",
  UnexpectedEndOfComment: "unexpected end of comment",
  UnexpectedEndOfString: "unexpected end of string",
  UnexpectedEndOfNumber: "unexpected end of number",
  InvalidUnicode: "invalid unicode escape",
  InvalidEscapeCharacter: "invalid escape character",
  InvalidCharacter: "invalid character (unescaped control character in a string?)",
};

/**
 * Parses `text` as strict JSON. `file` is the path used in issues (relative to the Modelo root).
 *
 * - Syntax errors, comments and trailing commas give one `json-syntax` issue for the first error,
 *   with `<file>:<line>:<column>` in the message and path `<file>#`.
 * - Duplicate keys at any depth give one `json-duplicate-key` issue per repeated occurrence,
 *   with the JSON Pointer of that occurrence.
 * - Otherwise the value equals `JSON.parse(text)`. Never throws.
 */
export function parseStrictJson(text: string, file: string): StrictJsonResult {
  const errors: ParseError[] = [];
  const tree = parseTree(text, errors, PARSE_OPTIONS);
  const [firstError] = errors;
  if (firstError !== undefined) {
    const code = printParseErrorCode(firstError.error);
    const { line, column } = lineColumnAt(text, firstError.offset);
    return { issues: [syntaxIssue(file, `${file}:${line}:${column}: ${describeError(code)}.`)] };
  }
  if (tree === undefined) {
    return { issues: [syntaxIssue(file, `${file}:1:1: no JSON value.`)] };
  }

  const issues: ValidationIssue[] = [];
  collectDuplicateKeys(tree, "", file, issues);
  if (issues.length > 0) {
    return { issues };
  }

  // jsonc-parser is lenient in a few corners JSON.parse is not; JSON.parse has the final word and
  // defines the resulting value.
  try {
    return { value: JSON.parse(text), issues: [] };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { issues: [syntaxIssue(file, `${file}: ${reason}`)] };
  }
}

function describeError(code: string): string {
  return ERROR_DESCRIPTIONS[code] ?? code;
}

function syntaxIssue(file: string, message: string): ValidationIssue {
  return {
    rule: "json-syntax",
    severity: "error",
    path: formatIssuePath({ file, pointer: "" }),
    message: `Invalid JSON: ${message}`,
    suggestion:
      "Fix the JSON at the given line and column. Modelo files are strict JSON: no comments, no trailing commas, double-quoted keys and strings.",
  };
}

/** 1-based line and column of a character offset (lines end at `\n`, `\r\n` or `\r`). */
function lineColumnAt(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  const end = Math.min(offset, text.length);
  for (let index = 0; index < end; index++) {
    const char = text.charCodeAt(index);
    const isLf = char === 10;
    const isLoneCr = char === 13 && text.charCodeAt(index + 1) !== 10;
    if (isLf || isLoneCr) {
      line++;
      lineStart = index + 1;
    }
  }
  return { line, column: end - lineStart + 1 };
}

function collectDuplicateKeys(
  node: Node,
  pointer: string,
  file: string,
  issues: ValidationIssue[],
): void {
  if (node.type === "array") {
    (node.children ?? []).forEach((child, index) => {
      collectDuplicateKeys(child, appendPointer(pointer, index), file, issues);
    });
    return;
  }
  if (node.type !== "object") {
    return;
  }
  const seen = new Set<string>();
  for (const property of node.children ?? []) {
    const [keyNode, valueNode] = property.children ?? [];
    if (keyNode === undefined || typeof keyNode.value !== "string") {
      continue;
    }
    const key = keyNode.value;
    const childPointer = appendPointer(pointer, key);
    if (seen.has(key)) {
      issues.push({
        rule: "json-duplicate-key",
        severity: "error",
        path: formatIssuePath({ file, pointer: childPointer }),
        message: `Duplicate key "${key}" in ${formatIssuePath({ file, pointer: pointer })}; JSON would silently keep only the last occurrence.`,
        suggestion: `Remove or rename one of the "${key}" entries so the key appears once in this object.`,
      });
    }
    seen.add(key);
    if (valueNode !== undefined) {
      collectDuplicateKeys(valueNode, childPointer, file, issues);
    }
  }
}
