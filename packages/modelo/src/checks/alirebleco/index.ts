// Alirebleco check (Art. X gate 4, S5.4, FR-15, FR-16, AK-13): every KontrastParo in every
// combination, WCAG 2.x binding and APCA advisory, thresholds from the active `kontrastSojloj`.
// Runs on the repo Modelo, or on the Modelo root given by `--fixture` (`vortaro/`, `data/`).

import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ModeloSource } from "../../contracts/modelo.js";
import { loadModelo } from "../../load/load-modelo.js";
import {
  defaultModeloSource,
  fixtureModeloSource,
  modeloRootOf,
  relativeModeloPath,
} from "../../load/source.js";
import { evaluateAlirebleco } from "./evaluate.js";

export * from "./color.js";
export * from "./evaluate.js";
export * from "./metrics.js";

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source: ModeloSource =
    options.fixture === undefined ? defaultModeloSource() : fixtureModeloSource(options.fixture);
  const { modelo, issues } = loadModelo(source);
  const loadErrors = issues.filter((issue) => issue.severity === "error");
  if (modelo === undefined) {
    return {
      check: "alirebleco",
      ok: false,
      summary: `The Modelo could not be loaded (${loadErrors.length} error(s)); no KontrastParo was checked.`,
      errors: loadErrors,
      warnings: issues.filter((issue) => issue.severity === "warning"),
      stats: { pairs: 0, combinations: 0, evaluations: 0 },
    };
  }

  const root = modeloRootOf(source);
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: relativeModeloPath(root, join(source.dataDir, "kontrastparoj.json")),
    dimensiojFile: relativeModeloPath(root, join(source.dataDir, "dimensioj.json")),
  });
  const errors = [...loadErrors, ...evaluation.errors];
  const warnings = evaluation.warnings;
  const { stats } = evaluation;
  const ok = errors.length === 0;
  const counts = `${stats.pairs} KontrastParo(j) x ${stats.combinations} combinations, ${stats.evaluations} evaluations`;
  const minimum =
    stats.minRatio === undefined ? "" : ` (min WCAG ratio ${stats.minRatio.toFixed(2)}:1)`;
  const advisories = `${warnings.length} APCA advisory warning(s)`;
  return {
    check: "alirebleco",
    ok,
    summary: ok
      ? `${counts}: all meet the binding WCAG 2.x thresholds${minimum}; ${advisories}.`
      : `${counts}: ${errors.length} error(s)${minimum}; ${advisories}.`,
    errors,
    warnings,
    stats,
  };
}
