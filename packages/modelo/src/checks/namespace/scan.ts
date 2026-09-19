// The shared FR-14 namespace scan (allowlist principle), used by vortaro-lint (b) and clean-room
// (3). Pure: it works on an already loaded `ScanTree`.

import type { ValidationIssue } from "../../contracts/issues.js";
import type { ScanTree } from "./files.js";
import {
  baseNameOf,
  CSS_EXTENSIONS,
  extensionOf,
  JSON_EXTENSIONS,
  SCRIPT_EXTENSIONS,
} from "./paths.js";
import {
  checkCssCustomProperties,
  checkCustomElements,
  checkDimensioNames,
  checkJsonKeysAscii,
  checkPackageJson,
  checkPathAscii,
  checkVortaroSet,
} from "./rules.js";

/** Set files of a Vortaro, wherever the Vortaro sits under the scan root. */
const VORTARO_SET_PATTERN = /(^|\/)vortaro\/sets\/.+\.json$/;
/** Dimensioj data files of a Modelo. */
const DIMENSIOJ_PATTERN = /(^|\/)data\/dimensioj\.json$/;

export interface NamespaceStats {
  files: number;
  cssFiles: number;
  generatedCssFiles: number;
  jsonFiles: number;
  packageJsonFiles: number;
  scriptFiles: number;
  vortaroSetFiles: number;
  customProperties: number;
  customElements: number;
  tokens: number;
}

export interface NamespaceScan {
  issues: ValidationIssue[];
  stats: NamespaceStats;
}

export function compareIssues(a: ValidationIssue, b: ValidationIssue): number {
  if (a.path !== b.path) {
    return a.path < b.path ? -1 : 1;
  }
  return a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0;
}

export function scanNamespace(tree: ScanTree): NamespaceScan {
  const issues: ValidationIssue[] = [];
  const stats: NamespaceStats = {
    files: tree.paths.length,
    cssFiles: 0,
    generatedCssFiles: tree.generatedCss.length,
    jsonFiles: 0,
    packageJsonFiles: 0,
    scriptFiles: 0,
    vortaroSetFiles: 0,
    customProperties: 0,
    customElements: 0,
    tokens: 0,
  };

  for (const path of tree.paths) {
    issues.push(...checkPathAscii(path));
  }

  for (const path of [...tree.paths, ...tree.generatedCss]) {
    const text = tree.texts.get(path);
    if (text === undefined) {
      continue;
    }
    const extension = extensionOf(path);
    if (CSS_EXTENSIONS.has(extension)) {
      stats.cssFiles++;
      const result = checkCssCustomProperties(path, text);
      stats.customProperties += result.definitions;
      issues.push(...result.issues);
    }
    if (SCRIPT_EXTENSIONS.has(extension)) {
      stats.scriptFiles++;
      const result = checkCustomElements(path, text);
      stats.customElements += result.definitions;
      issues.push(...result.issues);
    }
    if (JSON_EXTENSIONS.has(extension)) {
      stats.jsonFiles++;
      issues.push(...checkJsonKeysAscii(path, text));
      if (baseNameOf(path) === "package.json") {
        stats.packageJsonFiles++;
        issues.push(...checkPackageJson(path, text));
      }
      if (VORTARO_SET_PATTERN.test(path)) {
        stats.vortaroSetFiles++;
        const result = checkVortaroSet(path, text);
        stats.tokens += result.tokens;
        issues.push(...result.issues);
      }
      if (DIMENSIOJ_PATTERN.test(path)) {
        issues.push(...checkDimensioNames(path, text));
      }
    }
  }
  return { issues: issues.sort(compareIssues), stats };
}
