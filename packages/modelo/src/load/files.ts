// Reads the raw files of a Modelo root through the strict JSON parser. This is the loader's I/O
// edge; everything after it (`buildModelo`) is pure.

import { type Dirent, existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import {
  DATA_FILE_SCHEMA_DEFS,
  type DataFileName,
  OPTIONAL_DATA_FILE_SCHEMA_DEFS,
  type OptionalDataFileName,
} from "../contracts/schema.js";
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
  /** The derived `$themes.json` fragment (D-05). */
  themes: ModeloDocument;
  /** Optional Aspekto-scoped Reguloj and Jugxoj (D-10). */
  reguloj?: ModeloDocument;
  jugxoj?: ModeloDocument;
  /**
   * The glyphs of the package (Spec 014 ②, G3): `ikonoj/<name>.svg`, the SVG text by name. Read
   * here, the loader's I/O edge, so every Celo draws the Aspekto's picture from the Modelo alone.
   */
  ikonoj?: Record<string, string>;
}

/** Every file of a Modelo root, parsed but not interpreted. FUND-3.2 validates these raw values. */
export interface ModeloFiles {
  /** Core and package sets, sorted by set name (code-point order). */
  sets: ModeloSetDocument[];
  /** Composed Aspekto packages in source order (D-08). */
  packages: AspektoPackageFiles[];
  data: Record<DataFileName, ModeloDocument> &
    Partial<Record<OptionalDataFileName, ModeloDocument>>;
  /** `data/eroj/<name>/skemo.json`, sorted by path; empty when the directory does not exist. */
  eroj: ModeloDocument[];
  /**
   * `data/eroj/<name>/uzo.json`, sorted by path, also in folders without a Skemo (validation
   * reports those: uzo-skemo-missing). Spec 007, D-01.
   */
  uzoj: ModeloDocument[];
  /** `data/sxablonoj/<name>/skemo.json`, sorted by path (Spec 020); absent or empty without any. */
  sxablonoj?: ModeloDocument[];
  /** `data/sxablonoj/<name>/uzo.json`, sorted by path, also in folders without a Skemo. */
  sxablonoUzoj?: ModeloDocument[];
  themes: ModeloDocument;
  metadata: ModeloDocument;
}

export interface ReadModeloFilesResult {
  /** Present only when every file exists and parses. */
  files?: ModeloFiles;
  issues: ValidationIssue[];
}

export const DATA_FILE_NAMES = Object.keys(DATA_FILE_SCHEMA_DEFS) as DataFileName[];
/** Data files that may be absent (Spec 014 ①: `ikonaro.json`). */
export const OPTIONAL_DATA_FILE_NAMES = Object.keys(
  OPTIONAL_DATA_FILE_SCHEMA_DEFS,
) as OptionalDataFileName[];
export const THEMES_FILE_NAME = "$themes.json";
export const METADATA_FILE_NAME = "$metadata.json";
export const SETS_DIR_NAME = "sets";
/** Directory below the data directory holding one folder per Ero (Spec 003, D-02). */
export const EROJ_DIR_NAME = "eroj";
/** Directory below the data directory holding one folder per Sxablono (Spec 020, G1). */
export const SXABLONOJ_DIR_NAME = "sxablonoj";
/** The file in each Ero folder: the Ero and its Skemo. */
export const SKEMO_FILE_NAME = "skemo.json";
/** The file next to the Skemo that says how the Ero is used (Spec 007, D-01). */
export const UZO_FILE_NAME = "uzo.json";

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
    const packageThemes = read(join(dir, THEMES_FILE_NAME));
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
    if (aspekto === undefined || idsLock === undefined || packageThemes === undefined) {
      packagesComplete = false;
      continue;
    }
    const entry: AspektoPackageFiles = { name, dir, aspekto, idsLock, themes: packageThemes };
    const ikonoj = readGlyphs(join(dir, GLYPH_DIR_NAME));
    if (ikonoj !== undefined) entry.ikonoj = ikonoj;
    for (const key of ["reguloj", "jugxoj"] as const) {
      const path = join(dir, `${key}.json`);
      if (existsSync(path)) {
        const document = read(path);
        if (document === undefined) packagesComplete = false;
        else entry[key] = document;
      }
    }
    packages.push(entry);
  }
  sets.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const themes = read(join(source.vortaroDir, THEMES_FILE_NAME));
  const metadata = read(join(source.vortaroDir, METADATA_FILE_NAME));
  const data: Partial<Record<DataFileName | OptionalDataFileName, ModeloDocument>> = {};
  for (const name of DATA_FILE_NAMES) {
    const document = read(join(source.dataDir, name));
    if (document !== undefined) {
      data[name] = document;
    }
  }
  // An optional data file is read only when it exists; its absence is no issue.
  for (const name of OPTIONAL_DATA_FILE_NAMES) {
    const path = join(source.dataDir, name);
    if (!existsSync(path)) continue;
    const document = read(path);
    if (document !== undefined) {
      data[name] = document;
    }
  }

  const eroj: ModeloDocument[] = [];
  for (const path of listEroFiles(join(source.dataDir, EROJ_DIR_NAME), SKEMO_FILE_NAME)) {
    const document = read(path);
    if (document !== undefined) eroj.push(document);
  }
  const uzoj: ModeloDocument[] = [];
  for (const path of listEroFiles(join(source.dataDir, EROJ_DIR_NAME), UZO_FILE_NAME)) {
    const document = read(path);
    if (document !== undefined) uzoj.push(document);
  }

  const sxablonoj: ModeloDocument[] = [];
  for (const path of listEroFiles(join(source.dataDir, SXABLONOJ_DIR_NAME), SKEMO_FILE_NAME)) {
    const document = read(path);
    if (document !== undefined) sxablonoj.push(document);
  }
  const sxablonoUzoj: ModeloDocument[] = [];
  for (const path of listEroFiles(join(source.dataDir, SXABLONOJ_DIR_NAME), UZO_FILE_NAME)) {
    const document = read(path);
    if (document !== undefined) sxablonoUzoj.push(document);
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
  return {
    files: { sets, packages, data, eroj, uzoj, sxablonoj, sxablonoUzoj, themes, metadata },
    issues,
  };
}

/** `<erojDir>/<name>/<fileName>` for every folder that has one, sorted by path. */
function listEroFiles(erojDir: string, fileName: string): string[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(erojDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(erojDir, entry.name, fileName))
    .filter((path) => existsSync(path))
    .sort();
}

/** The file every Aspekto package has at its root. */
const ASPEKTO_FILE = "aspekto.json";
/** The folder of an Aspekto package that holds one glyph per Ikonaro name (Spec 014 ①, G3). */
const GLYPH_DIR_NAME = "ikonoj";

/**
 * The glyphs of a package by name (Spec 014 ②): every `.svg` below `ikonoj/`, as text. Absent
 * when the folder does not exist; what a glyph has to be is check:ikonaro's business.
 */
function readGlyphs(dir: string): Record<string, string> | undefined {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return undefined;
  }
  const glyphs: Record<string, string> = {};
  for (const entry of entries
    .filter((candidate) => candidate.isFile())
    .sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.name.endsWith(".svg")) continue;
    try {
      glyphs[entry.name.slice(0, -".svg".length)] = readFileSync(join(dir, entry.name), "utf8");
    } catch {
      // An unreadable glyph is reported by check:ikonaro; the Modelo loads without it.
    }
  }
  return glyphs;
}
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
  data: Partial<Record<DataFileName | OptionalDataFileName, ModeloDocument>>,
): data is Record<DataFileName, ModeloDocument> &
  Partial<Record<OptionalDataFileName, ModeloDocument>> {
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
