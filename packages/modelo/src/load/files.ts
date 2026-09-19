// Reads the raw files of a Modelo root through the strict JSON parser. This is the loader's I/O
// edge; everything after it (`buildModelo`) is pure.

import { type Dirent, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { DATA_FILE_SCHEMA_DEFS, type DataFileName } from "../contracts/schema.js";
import { parseStrictJson } from "../json/strict-json.js";
import { modeloRootOf, relativeModeloPath } from "./source.js";

/** One parsed Modelo file. */
export interface ModeloDocument {
  /** Path relative to the Modelo root (see `modeloRootOf`), with `/` separators. */
  file: string;
  /** The strictly parsed JSON value, not yet schema-validated. */
  value: unknown;
}

export interface ModeloSetDocument extends ModeloDocument {
  /** Set name: path below `sets/` without `.json`, e.g. `color-scheme/dark`. */
  name: string;
  /** Label of the Aspekto package holding the set; absent for core sets (D-08). */
  package?: string;
}

/** The files of one Aspekto package (D-05). Its sets are part of `ModeloFiles.sets`. */
export interface AspektoPackageFiles {
  /** Package label: the `name` of its package.json, or its directory name. */
  name: string;
  /** Absolute package directory. */
  dir: string;
  aspekto: ModeloDocument;
  idsLock: ModeloDocument;
}

/** Every file of a Modelo root, parsed but not interpreted. FUND-3.2 validates these raw values. */
export interface ModeloFiles {
  /** Core and package sets, sorted by set name (code-point order). */
  sets: ModeloSetDocument[];
  /** Composed Aspekto packages in source order (D-08). */
  packages: AspektoPackageFiles[];
  data: Record<DataFileName, ModeloDocument>;
  themes: ModeloDocument;
  metadata: ModeloDocument;
}

export interface ReadModeloFilesResult {
  /** Present only when every file exists and parses. */
  files?: ModeloFiles;
  issues: ValidationIssue[];
}

export const DATA_FILE_NAMES = Object.keys(DATA_FILE_SCHEMA_DEFS) as DataFileName[];
export const THEMES_FILE_NAME = "$themes.json";
export const METADATA_FILE_NAME = "$metadata.json";
export const SETS_DIR_NAME = "sets";

/**
 * Reads `<vortaroDir>/sets/**.json`, `<vortaroDir>/$themes.json`, `<vortaroDir>/$metadata.json`
 * and the five data files, each through `parseStrictJson`. Missing or unreadable files give
 * `file-missing`, bad JSON gives `json-*`. Every file is attempted, so all problems are reported
 * in one pass. Never throws.
 */
export function readModeloFiles(source: ModeloSource): ReadModeloFilesResult {
  const root = modeloRootOf(source);
  const issues: ValidationIssue[] = [...(source.sourceIssues ?? [])];

  const read = (absolutePath: string): ModeloDocument | undefined => {
    const file = relativeModeloPath(root, absolutePath);
    let text: string;
    try {
      text = readFileSync(absolutePath, "utf8");
    } catch (error) {
      issues.push(fileMissing(file, error));
      return undefined;
    }
    const parsed = parseStrictJson(text, file);
    issues.push(...parsed.issues);
    return parsed.issues.length === 0 ? { file, value: parsed.value } : undefined;
  };

  const setsDir = join(source.vortaroDir, SETS_DIR_NAME);
  const setPaths = listSetFiles(setsDir);
  if (setPaths === undefined) {
    issues.push(fileMissing(relativeModeloPath(root, setsDir), undefined, "directory"));
  }
  const sets: ModeloSetDocument[] = [];
  for (const { name, path } of setPaths ?? []) {
    const document = read(path);
    if (document !== undefined) {
      sets.push({ name, ...document });
    }
  }

  const packages: AspektoPackageFiles[] = [];
  let packagesComplete = true;
  for (const dir of source.aspektoPackages ?? []) {
    const name = packageLabel(dir);
    const aspekto = read(join(dir, ASPEKTO_FILE));
    const idsLock = read(join(dir, PACKAGE_LOCK_FILE));
    const packageSetsDir = join(dir, SETS_DIR_NAME);
    const packageSetPaths = listSetFiles(packageSetsDir);
    if (packageSetPaths === undefined) {
      issues.push(fileMissing(relativeModeloPath(root, packageSetsDir), undefined, "directory"));
    }
    for (const { name: setName, path } of packageSetPaths ?? []) {
      const document = read(path);
      if (document !== undefined) {
        sets.push({ name: setName, package: name, ...document });
      }
    }
    if (aspekto === undefined || idsLock === undefined) {
      packagesComplete = false;
      continue;
    }
    packages.push({ name, dir, aspekto, idsLock });
  }
  sets.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const themes = read(join(source.vortaroDir, THEMES_FILE_NAME));
  const metadata = read(join(source.vortaroDir, METADATA_FILE_NAME));
  const data: Partial<Record<DataFileName, ModeloDocument>> = {};
  for (const name of DATA_FILE_NAMES) {
    const document = read(join(source.dataDir, name));
    if (document !== undefined) {
      data[name] = document;
    }
  }

  const blocking = issues.some(
    (issue) => issue.rule === "file-missing" || issue.rule.startsWith("json-"),
  );
  if (
    blocking ||
    !packagesComplete ||
    themes === undefined ||
    metadata === undefined ||
    !isComplete(data)
  ) {
    return { issues };
  }
  return { files: { sets, packages, data, themes, metadata }, issues };
}

/** The file every Aspekto package has at its root. */
const ASPEKTO_FILE = "aspekto.json";
/** The package's own ID registry. */
const PACKAGE_LOCK_FILE = "ids.lock.json";

/** The `name` of the package's package.json, or its directory name. */
function packageLabel(dir: string): string {
  try {
    const manifest: unknown = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    if (
      typeof manifest === "object" &&
      manifest !== null &&
      "name" in manifest &&
      typeof manifest.name === "string" &&
      manifest.name !== ""
    ) {
      return manifest.name;
    }
  } catch {
    // No or unreadable package.json: fall back to the directory name.
  }
  return basename(dir);
}

function isComplete(
  data: Partial<Record<DataFileName, ModeloDocument>>,
): data is Record<DataFileName, ModeloDocument> {
  return DATA_FILE_NAMES.every((name) => data[name] !== undefined);
}

/**
 * All `.json` files below `setsDir` as `{ name, path }`, sorted by name; `undefined` when the
 * directory cannot be read. Symlinked directories are not descended into; unreadable
 * subdirectories are skipped.
 */
function listSetFiles(setsDir: string): { name: string; path: string }[] | undefined {
  const found: { name: string; path: string }[] = [];
  const walk = (dir: string, prefix: string): boolean => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith(".json")) {
        found.push({ name: `${prefix}${entry.name.slice(0, -".json".length)}`, path });
      }
    }
    return true;
  };
  if (!walk(setsDir, "")) {
    return undefined;
  }
  return found.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function fileMissing(
  file: string,
  error: unknown,
  kind: "file" | "directory" = "file",
): ValidationIssue {
  const code = errorCode(error);
  const reason =
    code === undefined || code === "ENOENT" ? "does not exist" : `cannot be read (${code})`;
  return {
    rule: "file-missing",
    severity: "error",
    path: formatIssuePath({ file, pointer: "" }),
    message: `Modelo ${kind} ${file} ${reason}.`,
    suggestion:
      kind === "directory"
        ? `Create the ${file} directory with at least the core set (core.json), or point the Modelo source at the right vortaro directory.`
        : `Create ${file} as a JSON file, or point the Modelo source at the right directory.`,
  };
}

function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return undefined;
}
