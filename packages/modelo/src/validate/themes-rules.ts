// Drift check of the generated Tokens-Studio files (FR-10): `$themes.json` and `$metadata.json`
// must equal what `deriveThemes` produces. Compared in canonical form, so key order and
// whitespace do not matter. Pure.

import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { coreView } from "../load/core-view.js";
import type { ModeloFiles } from "../load/files.js";
import { deriveThemeFragment, deriveThemes } from "../themes/derive.js";
import { serializeCanonicalJson, serializeThemes } from "../themes/serialize.js";

const SUGGESTION =
  "Run `pnpm vortaro:themes` (for a fixture: `pnpm vortaro:themes --root <modelo-root>`) and commit the result; never edit this file by hand.";

export function themesIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const { themesJson, metadataJson } = serializeThemes(deriveThemes(coreView(modelo)));
  const issues: ValidationIssue[] = [];
  if (serializeCanonicalJson(files.themes.value) !== themesJson) {
    issues.push({
      rule: "themes-out-of-sync",
      severity: "error",
      path: formatIssuePath({ file: files.themes.file, pointer: "" }),
      message: `${files.themes.file} differs from the themes derived from the Dimensioj and set kondicxoj.`,
      suggestion: SUGGESTION,
    });
  }
  if (serializeCanonicalJson(files.metadata.value) !== metadataJson) {
    issues.push({
      rule: "metadata-out-of-sync",
      severity: "error",
      path: formatIssuePath({ file: files.metadata.file, pointer: "" }),
      message: `${files.metadata.file} differs from the derived token set order (the resolver's set order).`,
      suggestion: SUGGESTION,
    });
  }
  for (const pkg of files.packages) {
    const fragment = serializeCanonicalJson(deriveThemeFragment(modelo, pkg.name));
    if (serializeCanonicalJson(pkg.themes.value) !== fragment) {
      issues.push({
        rule: "themes-out-of-sync",
        severity: "error",
        path: formatIssuePath({ file: pkg.themes.file, pointer: "" }),
        message: `${pkg.themes.file} differs from the themes fragment derived for the package ${pkg.name}.`,
        suggestion: SUGGESTION,
      });
    }
  }
  return issues;
}
