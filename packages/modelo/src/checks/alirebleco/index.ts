// Alirebleco check (Art. X gate 4, S5.4, FR-15, FR-16, AK-13): every KontrastParo in every
// combination, WCAG 2.x binding and APCA advisory, thresholds from the active `kontrastSojloj`.
// Runs on the repo Modelo, or on the Modelo root given by `--fixture` (`vortaro/`, `data/`).

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import type { ModeloSource } from "../../contracts/modelo.js";
import { loadModelo } from "../../load/load-modelo.js";
import { modeloRootOf, projectModeloSource, relativeModeloPath } from "../../load/source.js";
import { checkSource } from "../source.js";
import { evaluateAlirebleco } from "./evaluate.js";

export * from "./color.js";
export * from "./evaluate.js";
export * from "./measure.js";
export * from "./metrics.js";

/**
 * The Aspektoj the Modelo knows beside the reference (Nachlese 3 W2, Spec 011 ⑤ B-8): the test
 * Aspekto ekzemplo, which the tests, the showcase and the Figma sets compose over the core, and
 * provo, the example the Agordilo derives from its Agordo (Spec 016 ①), and provo-kompakta, its
 * counterpart in form, space and type (Spec 019 ①). Each is a fixture folder
 * `test/fixtures/valid/aspekto-<name>` with a `fundamento.config.json`; a further Aspekto is
 * listed here when the system composes it. Valid from `src/checks/alirebleco` and from
 * `dist/checks/alirebleco`.
 */
export const KNOWN_ASPEKTO_FIXTURES: readonly string[] = ["ekzemplo", "provo", "provo-kompakta"];

export function knownAspektoConfigs(): { name: string; configFile: string }[] {
  const dir = fileURLToPath(new URL("../../../test/fixtures/valid/", import.meta.url));
  return KNOWN_ASPEKTO_FIXTURES.flatMap((name) => {
    const configFile = join(dir, `aspekto-${name}`, "fundamento.config.json");
    return existsSync(configFile) ? [{ name, configFile }] : [];
  });
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source: ModeloSource = checkSource(options);
  const reference = evaluateSource(source);
  if (reference.modelo === undefined) {
    return {
      check: "alirebleco",
      ok: false,
      summary: `The Modelo could not be loaded (${reference.loadErrors.length} error(s)); no KontrastParo was checked.`,
      errors: reference.loadErrors,
      warnings: reference.loadWarnings,
      stats: { pairs: 0, combinations: 0, evaluations: 0 },
    };
  }
  const errors = [...reference.loadErrors, ...reference.evaluation.errors];
  const warnings = [...reference.evaluation.warnings];
  const stats: Record<string, number> = { ...reference.evaluation.stats, aspektoj: 1 };
  // Every other Aspekto the Modelo knows (W2): measured over the same pairs, its failures are
  // warnings that name the Aspekto — a finding for the maintainer, not a red run (Regel 0.3),
  // until the maintainer decides that an external Aspekto binds.
  const external: string[] = [];
  if (options.fixture === undefined && options.config === undefined) {
    for (const { name, configFile } of knownAspektoConfigs()) {
      const other = evaluateSource(projectModeloSource(configFile));
      if (other.modelo === undefined) continue;
      stats.aspektoj = (stats.aspektoj ?? 0) + 1;
      const prefix = (key: string) => `${name}:${key}`;
      for (const [key, value] of Object.entries(other.evaluation.stats)) stats[prefix(key)] = value;
      stats[prefix("errors")] = other.evaluation.errors.length;
      for (const issue of other.evaluation.errors) {
        warnings.push({
          rule: "contrast-external-aspekto",
          severity: "warning",
          path: issue.path,
          message: `[${name}] ${issue.message}`,
          suggestion:
            `${issue.suggestion ?? ""} A failing pair of the Aspekto ${name} is a finding for the maintainer (Regel 0.3), not a token change.`.trim(),
        });
      }
      external.push(`${name}: ${other.evaluation.errors.length} failing pair evaluation(s)`);
    }
  }
  const ok = errors.length === 0;
  const counts = `${stats.pairs} KontrastParo(j) x ${stats.combinations} combinations, ${stats.evaluations} evaluations`;
  const minimum =
    stats.minRatio === undefined ? "" : ` (min WCAG ratio ${stats.minRatio.toFixed(2)}:1)`;
  const advisories = `${reference.evaluation.warnings.length} APCA advisory warning(s)`;
  const others = external.length === 0 ? "" : `; external Aspektoj: ${external.join(", ")}`;
  return {
    check: "alirebleco",
    ok,
    summary: ok
      ? `${counts}: all meet the binding WCAG 2.x thresholds${minimum}; ${advisories}${others}.`
      : `${counts}: ${errors.length} error(s)${minimum}; ${advisories}${others}.`,
    errors,
    warnings,
    stats,
    branches: reference.evaluation.branches,
  };
}

/** Loads one Modelo source and evaluates every pair over its combinations. */
function evaluateSource(source: ModeloSource): {
  modelo: ReturnType<typeof loadModelo>["modelo"];
  loadErrors: ValidationIssue[];
  loadWarnings: ValidationIssue[];
  evaluation: ReturnType<typeof evaluateAlirebleco>;
} {
  const { modelo, issues } = loadModelo(source);
  const loadErrors = issues.filter((issue) => issue.severity === "error");
  const loadWarnings = issues.filter((issue) => issue.severity === "warning");
  if (modelo === undefined) {
    return {
      modelo,
      loadErrors,
      loadWarnings,
      evaluation: { errors: [], warnings: [], stats: {}, branches: [] } as unknown as ReturnType<
        typeof evaluateAlirebleco
      >,
    };
  }
  const root = modeloRootOf(source);
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: relativeModeloPath(root, join(source.dataDir, "kontrastparoj.json")),
    dimensiojFile: relativeModeloPath(root, join(source.dataDir, "dimensioj.json")),
  });
  return { modelo, loadErrors, loadWarnings, evaluation };
}
