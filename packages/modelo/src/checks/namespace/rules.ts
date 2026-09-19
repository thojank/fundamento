// FR-14 namespace rules (allowlist only; no names of other design systems are listed anywhere).
// Each rule is a pure function from one file's path and text to issues. Paths are relative to the
// scan root; JSON issues point at `<file>#<pointer>`, text issues at `<file>:<line>:<column>`.

import { visit } from "jsonc-parser";
import {
  type AtRule,
  type Container,
  CssSyntaxError,
  type Declaration,
  type Document,
  parse,
} from "postcss";
import type { RuleId, ValidationIssue } from "../../contracts/issues.js";
import { appendPointer, toJsonPointer } from "../../json/pointer.js";
import { parseStrictJson } from "../../json/strict-json.js";
import { nomRegulo } from "../../nomreguloj/index.js";
import { checkTokenName } from "../../nomreguloj/token-name.js";
import { hasNonAscii, lineColumn, textPath } from "./paths.js";

const PACKAGE_SCOPE = "@fundamento/";
/** `@fundamento/` plus lowercase ASCII words joined by `-`. */
const PACKAGE_NAME_PATTERN = /^@fundamento\/[a-z0-9]+(-[a-z0-9]+)*$/;
/** The private workspace root is the only package allowed the bare project name. */
const ROOT_PACKAGE_NAME = "fundamento";
const ROOT_PACKAGE_JSON = "package.json";

/** `fm-` plus lowercase ASCII words joined by `-`. */
const CUSTOM_ELEMENT_PATTERN = /^fm(-[a-z0-9]+)+$/;
const FUNDAMENTO_EXTENSION_KEY = "com.ciferecigo.fundamento";

export interface CountedIssues {
  issues: ValidationIssue[];
  /** Number of identifiers the rule inspected (definitions, tokens, etc.). */
  definitions: number;
}

function issue(rule: RuleId, path: string, message: string, suggestion: string): ValidationIssue {
  return { rule, severity: "error", path, message, suggestion };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// --- package.json -------------------------------------------------------------------------------

export function checkPackageJson(file: string, text: string): ValidationIssue[] {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return [
      issue(
        "namespace-package",
        `${file}#`,
        "package.json cannot be parsed, so its name cannot be verified.",
        "Fix the JSON syntax of this package.json.",
      ),
    ];
  }
  const name = isRecord(value) ? value.name : undefined;
  if (typeof name !== "string") {
    return [
      issue(
        "namespace-package",
        `${file}#`,
        "package.json has no name, so it is outside the @fundamento/ namespace.",
        `Add a name of the form ${PACKAGE_SCOPE}<name>.`,
      ),
    ];
  }
  const path = `${file}#/name`;
  if (hasNonAscii(name)) {
    return [
      issue(
        "namespace-non-ascii",
        path,
        `Package name "${name}" contains non-ASCII characters.`,
        "Use ASCII only; write Esperanto letters in the x-convention (e.g. sx for \u015D).",
      ),
    ];
  }
  if (
    PACKAGE_NAME_PATTERN.test(name) ||
    (file === ROOT_PACKAGE_JSON && name === ROOT_PACKAGE_NAME)
  ) {
    return [];
  }
  return [
    issue(
      "namespace-package",
      path,
      `Package name "${name}" is outside the ${PACKAGE_SCOPE} namespace.`,
      `Rename the package to ${PACKAGE_SCOPE}<name> (lowercase ASCII words joined by "-").`,
    ),
  ];
}

// --- CSS custom-property definitions ------------------------------------------------------------

function insideTheme(declaration: Declaration): boolean {
  for (
    let node: Container | Document | undefined = declaration.parent;
    node !== undefined;
    node = node.parent
  ) {
    if (node.type === "atrule" && (node as AtRule).name.toLowerCase() === "theme") {
      return true;
    }
  }
  return false;
}

export function cssSyntaxIssue(file: string, error: unknown, rule: RuleId): ValidationIssue {
  const line = error instanceof CssSyntaxError && error.line !== undefined ? error.line : 1;
  const column = error instanceof CssSyntaxError && error.column !== undefined ? error.column : 1;
  const reason = error instanceof CssSyntaxError ? error.reason : String(error);
  return issue(
    rule,
    textPath(file, line, column),
    `CSS cannot be parsed (${reason}), so this rule cannot verify the file.`,
    "Fix the CSS syntax.",
  );
}

export function checkCssCustomProperties(file: string, css: string): CountedIssues {
  let root: ReturnType<typeof parse>;
  try {
    root = parse(css, { from: file });
  } catch (error) {
    return { issues: [cssSyntaxIssue(file, error, "namespace-custom-property")], definitions: 0 };
  }
  const issues: ValidationIssue[] = [];
  let definitions = 0;
  root.walkDecls((declaration) => {
    const prop = declaration.prop;
    if (!prop.startsWith("--")) {
      return;
    }
    definitions++;
    const start = declaration.source?.start;
    const path = textPath(file, start?.line ?? 1, start?.column ?? 1);
    if (insideTheme(declaration)) {
      if (nomRegulo("tailwind").invert(prop) === null) {
        issues.push(
          issue(
            "namespace-custom-property",
            path,
            `@theme entry "${prop}" is not a name the Tailwind NomRegulo derives from a token.`,
            "Name @theme entries after a token in a Tailwind namespace (e.g. --color-<token path>); Tailwind prefix(fm) turns them into --fm-*.",
          ),
        );
      }
      return;
    }
    if (nomRegulo("css").invert(prop) === null) {
      issues.push(
        issue(
          "namespace-custom-property",
          path,
          `Custom property "${prop}" is outside the --fm- namespace.`,
          "Define custom properties as --fm-<token path joined by ->, lowercase ASCII.",
        ),
      );
    }
  });
  return { issues, definitions };
}

// --- customElements.define ----------------------------------------------------------------------

// First argument of a registration call; the pattern deliberately needs the dot and the paren.
const DEFINE_CALL_PATTERN = /\bcustomElements\s*\.\s*define\s*\(\s*([^,)]*)/g;
const STRING_LITERAL_PATTERN = /^(["'`])([^"'`\\$]*)\1$/;

export function checkCustomElements(file: string, text: string): CountedIssues {
  const issues: ValidationIssue[] = [];
  let definitions = 0;
  for (const match of text.matchAll(DEFINE_CALL_PATTERN)) {
    definitions++;
    const { line, column } = lineColumn(text, match.index);
    const path = textPath(file, line, column);
    const argument = (match[1] ?? "").trim();
    const literal = STRING_LITERAL_PATTERN.exec(argument);
    const name = literal?.[2];
    if (name === undefined) {
      issues.push(
        issue(
          "namespace-custom-element",
          path,
          `Custom element name "${argument}" is not a string literal, so it cannot be verified.`,
          'Register custom elements with a literal name of the form "fm-<name>".',
        ),
      );
    } else if (!CUSTOM_ELEMENT_PATTERN.test(name)) {
      issues.push(
        issue(
          "namespace-custom-element",
          path,
          `Custom element "${name}" is outside the fm- namespace.`,
          'Name custom elements "fm-<name>" with lowercase ASCII words joined by "-".',
        ),
      );
    }
  }
  return { issues, definitions };
}

// --- Vortaro set files --------------------------------------------------------------------------

export interface SetCheck {
  issues: ValidationIssue[];
  tokens: number;
}

/**
 * Token names of one set file must match the grammar (FR-13a) and kondicxoj must be ASCII.
 * Unparseable files are skipped: the Modelo validation reports them with `json-*` rules.
 */
export function checkVortaroSet(file: string, text: string): SetCheck {
  const { value } = parseStrictJson(text, file);
  if (!isRecord(value)) {
    return { issues: [], tokens: 0 };
  }
  const issues: ValidationIssue[] = [];
  let tokens = 0;

  const walk = (node: Record<string, unknown>, segments: string[]): void => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") || !isRecord(child)) {
        continue;
      }
      const childSegments = [...segments, key];
      if ("$value" in child) {
        tokens++;
        const name = childSegments.join(".");
        const found = checkTokenName(name);
        if (found !== null) {
          issues.push({
            ...found,
            rule: "namespace-token-name",
            path: `${file}#${toJsonPointer(childSegments)}`,
          });
        }
        continue;
      }
      walk(child, childSegments);
    }
  };
  walk(value, []);

  const extension = isRecord(value.$extensions)
    ? value.$extensions[FUNDAMENTO_EXTENSION_KEY]
    : undefined;
  const kondicxoj = isRecord(extension) ? extension.kondicxoj : undefined;
  if (Array.isArray(kondicxoj)) {
    kondicxoj.forEach((kondicxo: unknown, index) => {
      if (typeof kondicxo === "string" && hasNonAscii(kondicxo)) {
        issues.push(
          issue(
            "namespace-non-ascii",
            `${file}#${toJsonPointer(["$extensions", FUNDAMENTO_EXTENSION_KEY, "kondicxoj", index])}`,
            `Kondicxo "${kondicxo}" contains non-ASCII characters.`,
            "Use ASCII only; write Esperanto letters in the x-convention (e.g. sx for \u015D).",
          ),
        );
      }
    });
  }
  return { issues, tokens };
}

// --- Dimensio names -----------------------------------------------------------------------------

export function checkDimensioNames(file: string, text: string): ValidationIssue[] {
  const { value } = parseStrictJson(text, file);
  const dimensioj = isRecord(value) ? value.dimensioj : undefined;
  if (!Array.isArray(dimensioj)) {
    return [];
  }
  const issues: ValidationIssue[] = [];
  const checkName = (node: unknown, pointer: string, what: string): void => {
    const name = isRecord(node) ? node.name : undefined;
    if (typeof name === "string" && hasNonAscii(name)) {
      issues.push(
        issue(
          "namespace-non-ascii",
          `${file}#${appendPointer(pointer, "name")}`,
          `${what} name "${name}" contains non-ASCII characters.`,
          "Use ASCII only; write Esperanto letters in the x-convention (e.g. sx for \u015D).",
        ),
      );
    }
  };
  dimensioj.forEach((dimensio: unknown, index) => {
    const pointer = toJsonPointer(["dimensioj", index]);
    checkName(dimensio, pointer, "Dimensio");
    const valoroj = isRecord(dimensio) ? dimensio.valoroj : undefined;
    if (Array.isArray(valoroj)) {
      valoroj.forEach((valoro: unknown, valoroIndex) => {
        checkName(
          valoro,
          toJsonPointer(["dimensioj", index, "valoroj", valoroIndex]),
          "DimensioValoro",
        );
      });
    }
  });
  return issues;
}

// --- JSON keys and file paths -------------------------------------------------------------------

/** Every object key in a JSON (or JSONC) file must be ASCII. Lenient parsing: comments are fine. */
export function checkJsonKeysAscii(file: string, text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  visit(
    text,
    {
      onObjectProperty(property, _offset, _length, _line, _character, pathSupplier) {
        if (hasNonAscii(property)) {
          issues.push(
            issue(
              "namespace-non-ascii",
              `${file}#${toJsonPointer([...pathSupplier(), property])}`,
              `JSON key "${property}" contains non-ASCII characters.`,
              "Use ASCII only; write Esperanto letters in the x-convention (e.g. sx for \u015D).",
            ),
          );
        }
      },
    },
    { allowTrailingComma: true, disallowComments: false },
  );
  return issues;
}

export function checkPathAscii(file: string): ValidationIssue[] {
  if (!hasNonAscii(file)) {
    return [];
  }
  return [
    issue(
      "namespace-non-ascii",
      file,
      `File path "${file}" contains non-ASCII characters.`,
      "Rename the file or directory using ASCII only (x-convention for Esperanto letters).",
    ),
  ];
}
