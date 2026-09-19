// Vortaro-Lint (a), FR-14/S5.1: no value in a Projekcio output without a token reference.
//
// Literal design values (colors, lengths, durations, shadows, ...) may only appear as values of
// `--fm-*` definitions. Every other declaration value may consist only of `var(--fm-*)`
// references (fallbacks are checked the same way), CSS-wide keywords and `0`, optionally combined
// with `calc()`/`min()`/`max()`/`clamp()` arithmetic on unitless numbers. Everything else is a
// literal. This is deliberately not a general-purpose CSS lint.

import { type Declaration, parse } from "postcss";
import type { ValidationIssue } from "../../contracts/issues.js";
import { nomRegulo } from "../../nomreguloj/index.js";
import { textPath } from "../namespace/paths.js";
import { cssSyntaxIssue } from "../namespace/rules.js";

const FM_DEFINITION_PREFIX = "--fm-";
const CSS_WIDE_KEYWORDS: ReadonlySet<string> = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);
const MATH_FUNCTIONS: ReadonlySet<string> = new Set(["calc", "min", "max", "clamp"]);
const ZERO_PATTERN = /^[+-]?(0+(\.0*)?|\.0+)$/;
const UNITLESS_NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
const OPERATOR_PATTERN = /^[+\-*]$/;

type ValueNode =
  | { kind: "word"; text: string }
  | { kind: "string"; text: string }
  | { kind: "separator"; text: string }
  | { kind: "function"; name: string; text: string; args: ValueNode[] };

const DELIMITERS = new Set([" ", "\t", "\n", "\r", "\f", ",", "/", "(", ")", '"', "'"]);

/** Tokenizes a declaration value into words, strings, separators and (nested) functions. */
function parseValue(value: string): ValueNode[] | undefined {
  let index = 0;

  const parseList = (insideFunction: boolean): ValueNode[] | undefined => {
    const nodes: ValueNode[] = [];
    while (index < value.length) {
      const char = value.charAt(index);
      if (char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f") {
        index++;
      } else if (char === "," || char === "/") {
        nodes.push({ kind: "separator", text: char });
        index++;
      } else if (char === ")") {
        if (!insideFunction) {
          return undefined;
        }
        return nodes;
      } else if (char === '"' || char === "'") {
        const start = index;
        index++;
        while (index < value.length && value.charAt(index) !== char) {
          index += value.charAt(index) === "\\" ? 2 : 1;
        }
        if (index >= value.length) {
          return undefined;
        }
        index++;
        nodes.push({ kind: "string", text: value.slice(start, index) });
      } else {
        const start = index;
        while (index < value.length && !DELIMITERS.has(value.charAt(index))) {
          index++;
        }
        const name = value.slice(start, index);
        if (value.charAt(index) !== "(") {
          nodes.push({ kind: "word", text: name });
          continue;
        }
        index++;
        const args = parseList(true);
        if (args === undefined || value.charAt(index) !== ")") {
          return undefined;
        }
        index++;
        nodes.push({ kind: "function", name, text: value.slice(start, index), args });
      }
    }
    return insideFunction ? undefined : nodes;
  };

  return parseList(false);
}

function isFmReference(nodes: readonly ValueNode[]): boolean {
  const [only, ...rest] = nodes;
  return rest.length === 0 && only?.kind === "word" && nomRegulo("css").invert(only.text) !== null;
}

function findInNodes(nodes: readonly ValueNode[], math: boolean): string | null {
  for (const node of nodes) {
    switch (node.kind) {
      case "separator":
        break;
      case "string":
        return node.text;
      case "word": {
        const word = node.text;
        if (CSS_WIDE_KEYWORDS.has(word.toLowerCase()) || ZERO_PATTERN.test(word)) {
          break;
        }
        if (math && (OPERATOR_PATTERN.test(word) || UNITLESS_NUMBER_PATTERN.test(word))) {
          break;
        }
        return word;
      }
      case "function": {
        const name = node.name.toLowerCase();
        if (name === "var") {
          const comma = node.args.findIndex((arg) => arg.kind === "separator" && arg.text === ",");
          const reference = comma === -1 ? node.args : node.args.slice(0, comma);
          if (!isFmReference(reference)) {
            return node.text;
          }
          const fallback = comma === -1 ? [] : node.args.slice(comma + 1);
          const found = findInNodes(fallback, math);
          if (found !== null) {
            return found;
          }
        } else if (name === "" || MATH_FUNCTIONS.has(name)) {
          const found = findInNodes(node.args, true);
          if (found !== null) {
            return found;
          }
        } else {
          return node.text;
        }
        break;
      }
    }
  }
  return null;
}

/** The first literal in a declaration value, or `null` if the value only references tokens. */
export function findLiteral(value: string): string | null {
  const nodes = parseValue(value);
  if (nodes === undefined) {
    return value.trim();
  }
  return findInNodes(nodes, false);
}

export interface CssLiteralCheck {
  issues: ValidationIssue[];
  /** Number of declarations inspected. */
  declarations: number;
}

function literalIssue(file: string, declaration: Declaration, literal: string): ValidationIssue {
  const start = declaration.source?.start;
  return {
    rule: "css-literal-value",
    severity: "error",
    path: textPath(file, start?.line ?? 1, start?.column ?? 1),
    message: `Declaration "${declaration.prop}: ${declaration.value}" uses the literal value "${literal}" instead of a token reference.`,
    suggestion:
      "Reference a token with var(--fm-<token>); literal values belong only in --fm-* definitions (CSS-wide keywords and 0 are allowed).",
  };
}

export function checkCssLiterals(file: string, css: string): CssLiteralCheck {
  let root: ReturnType<typeof parse>;
  try {
    root = parse(css, { from: file });
  } catch (error) {
    return { issues: [cssSyntaxIssue(file, error, "css-literal-value")], declarations: 0 };
  }
  const issues: ValidationIssue[] = [];
  let declarations = 0;
  root.walkDecls((declaration) => {
    declarations++;
    if (declaration.prop.startsWith(FM_DEFINITION_PREFIX)) {
      return;
    }
    const literal = findLiteral(declaration.value);
    if (literal !== null) {
      issues.push(literalIssue(file, declaration, literal));
    }
  });
  return { issues, declarations };
}
