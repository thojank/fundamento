// Reads `fundamento.config.json` (Spec 001, D-07): the list of Aspekto packages a project
// includes besides the reference Aspekto. This is an I/O edge; it never throws.

import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { createModeloAjv, getConfigValidator, type ValidateFunction } from "../contracts/ajv.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { FundamentoConfigJson } from "../generated/config-schema.js";
import { parseStrictJson } from "../json/strict-json.js";

export const CONFIG_FILE_NAME = "fundamento.config.json";

/** The file every Aspekto package has at its root (D-05). */
export const ASPEKTO_FILE_NAME = "aspekto.json";

export interface Konfiguro {
  /** The config file as given. */
  file: string;
  /** Absolute package directories in config order; unresolvable entries are left out. */
  aspektoPackages: string[];
}

export interface ReadKonfiguroResult {
  /** Present unless the file is missing, malformed or violates the config schema. */
  konfiguro?: Konfiguro;
  issues: ValidationIssue[];
}

let validator: ValidateFunction | undefined;

function getValidator(): ValidateFunction {
  validator ??= getConfigValidator(createModeloAjv());
  return validator;
}

function isPathEntry(entry: string): boolean {
  return entry === "." || entry.startsWith("./") || entry.startsWith("../") || isAbsolute(entry);
}

function isAspektoPackage(dir: string): boolean {
  try {
    return statSync(dir).isDirectory() && existsSync(join(dir, ASPEKTO_FILE_NAME));
  } catch {
    return false;
  }
}

/**
 * Resolves one config entry to a package directory: a path relative to `baseDir`, or an npm
 * package name resolved from `baseDir`. Returns the directory tried (for messages) and whether
 * it holds an Aspekto package.
 */
export function resolveAspektoEntry(
  entry: string,
  baseDir: string,
): { dir: string; found: boolean } {
  if (isPathEntry(entry)) {
    const dir = resolve(baseDir, entry);
    return { dir, found: isAspektoPackage(dir) };
  }
  try {
    const require = createRequire(join(baseDir, CONFIG_FILE_NAME));
    const dir = dirname(require.resolve(`${entry}/package.json`));
    return { dir, found: isAspektoPackage(dir) };
  } catch {
    return { dir: `${entry} (npm package, resolved from ${baseDir})`, found: false };
  }
}

/** Reads, validates and resolves a config file. */
export function readKonfiguro(file: string): ReadKonfiguroResult {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    return {
      issues: [
        {
          rule: "file-missing",
          severity: "error",
          path: file,
          message: `Cannot read ${file}: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: `Create ${CONFIG_FILE_NAME} with { "aspektoj": [] } or pass the right --config path.`,
        },
      ],
    };
  }
  const parsed = parseStrictJson(text, file);
  if (parsed.issues.length > 0) {
    return { issues: parsed.issues };
  }
  const validate = getValidator();
  if (!validate(parsed.value)) {
    return {
      issues: (validate.errors ?? []).map((error) => ({
        rule: "config-invalid",
        severity: "error",
        path: formatIssuePath({ file, pointer: error.instancePath }),
        message: `${CONFIG_FILE_NAME} ${error.message ?? "is invalid"}${
          typeof error.params.additionalProperty === "string"
            ? ` ('${error.params.additionalProperty}')`
            : ""
        }.`,
        suggestion:
          'The config lists Aspekto packages only: { "aspektoj": ["<path or npm name>", …] }. The reference Aspekto is part of the Modelo, not of the config.',
      })),
    };
  }
  // The validator has just proven the shape.
  const config = parsed.value as FundamentoConfigJson;
  const baseDir = dirname(resolve(file));
  const issues: ValidationIssue[] = [];
  const aspektoPackages: string[] = [];
  config.aspektoj.forEach((entry, index) => {
    const { dir, found } = resolveAspektoEntry(entry, baseDir);
    if (found) {
      aspektoPackages.push(dir);
      return;
    }
    issues.push({
      rule: "aspekto-package-missing",
      severity: "error",
      path: formatIssuePath({ file, pointer: `/aspektoj/${index}` }),
      message: `No Aspekto package (a directory with ${ASPEKTO_FILE_NAME}) at ${dir}.`,
      suggestion:
        "Check the path (relative to the config file) or install the npm package; the rest of the Modelo is still validated.",
    });
  });
  return { konfiguro: { file, aspektoPackages }, issues };
}
