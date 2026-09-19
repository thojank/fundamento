// Alirebleco evaluation (S5.4, FR-15, FR-16, AK-13): every KontrastParo in every combination of
// `allAssignments`, measured with every registered metric against the thresholds of the active
// `kontrastSojloj`. Pure: takes a loaded Modelo, returns structured issues and stats.

import { CORE_SET_NAME } from "../../contracts/grammar.js";
import type { RuleId, ValidationIssue } from "../../contracts/issues.js";
import type { Dimensio, KontrastParo, KontrastSojloj, Modelo } from "../../contracts/modelo.js";
import type { ColorValue, KontrastKategorio } from "../../generated/modelo-schema.js";
import { appendPointer } from "../../json/pointer.js";
import { isJsonObject } from "../../load/guards.js";
import { allAssignments, formatCombination } from "../../resolve/assignment.js";
import { resolveCombination } from "../../resolve/resolve.js";
import { alphaOf, compositeOver, readDtcgColor } from "./color.js";
import { APCA_METRIC, type ContrastMetric, WCAG2_METRIC } from "./metrics.js";

/** A metric plus what a shortfall means: binding (error) or advisory (warning). */
export interface MetricBinding {
  metric: ContrastMetric;
  rule: RuleId;
  severity: ValidationIssue["severity"];
}

/** WCAG 2.x binding (`contrast-below-threshold`, error), APCA advisory (`contrast-advisory`, warning). */
export const DEFAULT_METRIC_BINDINGS: readonly MetricBinding[] = [
  { metric: WCAG2_METRIC, rule: "contrast-below-threshold", severity: "error" },
  { metric: APCA_METRIC, rule: "contrast-advisory", severity: "warning" },
];

export interface EvaluateAlireblecoOptions {
  /** Issue-path file of `kontrastparoj.json`, relative to the Modelo root (e.g. `data/kontrastparoj.json`). */
  kontrastParojFile: string;
  /** Issue-path file of `dimensioj.json`; defaults to the sibling of `kontrastParojFile`. */
  dimensiojFile?: string;
  /** Metrics to apply; default {@link DEFAULT_METRIC_BINDINGS}. */
  metrics?: readonly MetricBinding[];
}

export interface AlireblecoEvaluation {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  /**
   * `pairs`, `combinations`, `evaluations` (pair x combination measured), one
   * `<metricId>Evaluations` per metric, `minRatio` (lowest binding value, two decimals, only when
   * something was measured) and `minRatio:<pair>` per measured pair.
   */
  stats: Record<string, number>;
}

const KATEGORIOJ: readonly KontrastKategorio[] = ["text-normal", "text-large", "ui"];

interface PairEntry {
  pair: KontrastParo;
  index: number;
  name: string;
}

function pairEntries(modelo: Modelo): PairEntry[] {
  const raw: unknown = modelo.kontrastParoj;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((pair: unknown, index) =>
    isJsonObject(pair)
      ? [
          {
            pair: pair as unknown as KontrastParo,
            index,
            name: typeof pair.name === "string" ? pair.name : `#${index}`,
          },
        ]
      : [],
  );
}

/** The Dimensio whose valoroj carry `kontrastSojloj` (§2.3: exactly one, `contrast`). */
function thresholdDimensio(modelo: Modelo): Dimensio | undefined {
  return modelo.dimensioj.find((dimensio) =>
    (Array.isArray(dimensio.valoroj) ? dimensio.valoroj : []).some(
      (valoro) => isJsonObject(valoro) && isJsonObject(valoro.kontrastSojloj),
    ),
  );
}

function sojlojOf(
  dimensio: Dimensio | undefined,
  assignment: Record<string, string>,
): KontrastSojloj | undefined {
  if (dimensio === undefined) {
    return undefined;
  }
  const active = assignment[dimensio.name];
  const valoroj: unknown = dimensio.valoroj;
  const valoro = Array.isArray(valoroj)
    ? valoroj.find((entry: unknown) => isJsonObject(entry) && entry.name === active)
    : undefined;
  const sojloj: unknown = isJsonObject(valoro) ? valoro.kontrastSojloj : undefined;
  return isJsonObject(sojloj) ? (sojloj as unknown as KontrastSojloj) : undefined;
}

function thresholdOf(
  sojloj: KontrastSojloj | undefined,
  metric: ContrastMetric,
  kategorio: KontrastKategorio,
): number | undefined {
  const block: unknown = sojloj?.[metric.id];
  if (!isJsonObject(block)) {
    return undefined;
  }
  const threshold = block[kategorio];
  return typeof threshold === "number" && Number.isFinite(threshold) ? threshold : undefined;
}

/** Own-property lookup (token names such as `constructor` are grammatical). */
function own<T>(record: Readonly<Record<string, T>> | undefined, key: string): T | undefined {
  return record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
}

function siblingFile(file: string, name: string): string {
  const slash = file.lastIndexOf("/");
  return slash === -1 ? name : `${file.slice(0, slash + 1)}${name}`;
}

export function evaluateAlirebleco(
  modelo: Modelo,
  options: EvaluateAlireblecoOptions,
): AlireblecoEvaluation {
  const metrics = options.metrics ?? DEFAULT_METRIC_BINDINGS;
  const pairsFile = options.kontrastParojFile;
  const dimensiojFile = options.dimensiojFile ?? siblingFile(pairsFile, "dimensioj.json");
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const assignments = allAssignments(modelo);
  const entries = pairEntries(modelo);
  const stats: Record<string, number> = {
    pairs: entries.length,
    combinations: assignments.length,
    evaluations: 0,
  };
  for (const { metric } of metrics) {
    stats[`${metric.id}Evaluations`] = 0;
  }

  const pairPointer = (index: number, field?: string): string => {
    const base = appendPointer("/kontrastParoj", index);
    return `${pairsFile}#${field === undefined ? base : appendPointer(base, field)}`;
  };

  // Static checks against core: each broken pair is reported once and not measured.
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  const measurable: PairEntry[] = [];
  for (const entry of entries) {
    let ok = true;
    const kategorio: unknown = entry.pair.kategorio;
    if (typeof kategorio !== "string" || !(KATEGORIOJ as readonly string[]).includes(kategorio)) {
      errors.push({
        rule: "schema-violation",
        severity: "error",
        path: pairPointer(entry.index, "kategorio"),
        message: `KontrastParo '${entry.name}' has no valid kategorio.`,
        suggestion: `Set kategorio to one of ${KATEGORIOJ.join(", ")}.`,
      });
      ok = false;
    }
    for (const field of ["foreground", "background"] as const) {
      const tokenName: unknown = entry.pair[field];
      const token = typeof tokenName === "string" ? own(core?.tokens, tokenName) : undefined;
      if (token === undefined) {
        errors.push({
          rule: "kontrastparo-token-missing",
          severity: "error",
          path: pairPointer(entry.index, field),
          message: `KontrastParo '${entry.name}': ${field} token '${String(tokenName)}' is not defined in core.`,
          suggestion: `Point ${field} at an existing core color token, or define '${String(tokenName)}' in core.`,
        });
        ok = false;
      } else if (token.type !== "color") {
        errors.push({
          rule: "kontrastparo-not-color",
          severity: "error",
          path: pairPointer(entry.index, field),
          message: `KontrastParo '${entry.name}': ${field} token '${token.name}' has type '${token.type}', not 'color'.`,
          suggestion: `Point ${field} at a color token.`,
        });
        ok = false;
      }
    }
    if (ok) {
      measurable.push(entry);
    }
  }

  const sojlojDimensio = thresholdDimensio(modelo);
  if (sojlojDimensio === undefined && measurable.length > 0) {
    errors.push({
      rule: "kontrast-sojloj-invalid",
      severity: "error",
      path: `${dimensiojFile}#/dimensioj`,
      message: "No Dimensio carries kontrastSojloj, so KontrastParoj cannot be checked.",
      suggestion:
        "Add kontrastSojloj (wcag2, optionally apca) to every valoro of the contrast Dimensio.",
    });
  }

  const reportedSojloj = new Set<string>();
  const minima = new Map<string, number>();
  for (const assignment of assignments) {
    const combination = formatCombination(modelo, assignment);
    const resolution = resolveCombination(modelo, assignment);
    const complete = resolution.assignment ?? assignment;
    const sojloj = sojlojOf(sojlojDimensio, complete);
    const activeValoro =
      sojlojDimensio === undefined
        ? undefined
        : `${sojlojDimensio.name}=${complete[sojlojDimensio.name] ?? sojlojDimensio.default}`;
    for (const entry of measurable) {
      const { pair, name } = entry;
      const kategorio = pair.kategorio;
      const path = `rezolvo(${combination})/kontrastParo/${name}`;
      const context = { path, combination: { ...complete } };
      const colors: Partial<Record<"foreground" | "background", ColorValue>> = {};
      for (const field of ["foreground", "background"] as const) {
        const resolved = own(resolution.tokens, pair[field]);
        if (resolved === undefined) {
          errors.push({
            rule: "kontrastparo-token-missing",
            severity: "error",
            ...context,
            message: `KontrastParo '${name}': ${field} token '${pair[field]}' does not resolve in ${combination}.`,
            suggestion: `Fix the alias chain of '${pair[field]}' for this combination (see the resolver's alias-* issues).`,
          });
          continue;
        }
        const color = readDtcgColor(resolved.value);
        if (color === undefined) {
          errors.push({
            rule: "kontrastparo-not-color",
            severity: "error",
            ...context,
            message: `KontrastParo '${name}': ${field} token '${pair[field]}' resolves to a value that is not a DTCG color in ${combination} (set '${resolved.origin.set}').`,
            suggestion: `Give '${pair[field]}' a color value ({ colorSpace, components[3], alpha? }) in set '${resolved.origin.set}'.`,
          });
          continue;
        }
        colors[field] = color;
      }
      const { foreground, background } = colors;
      if (foreground === undefined || background === undefined) {
        continue;
      }
      if (alphaOf(background) < 1) {
        const origin = own(resolution.tokens, pair.background)?.origin.set ?? CORE_SET_NAME;
        errors.push({
          rule: "kontrastparo-background-transparent",
          severity: "error",
          ...context,
          message: `KontrastParo '${name}': background '${pair.background}' has alpha ${alphaOf(background)} in ${combination}; contrast against an unknown backdrop cannot be determined.`,
          suggestion: `Make '${pair.background}' opaque (alpha 1) in set '${origin}', or pair the foreground with an opaque background token.`,
        });
        continue;
      }
      const effective =
        alphaOf(foreground) < 1 ? compositeOver(foreground, background) : foreground;
      if (sojloj === undefined) {
        if (activeValoro !== undefined && !reportedSojloj.has(activeValoro)) {
          reportedSojloj.add(activeValoro);
          errors.push({
            rule: "kontrast-sojloj-invalid",
            severity: "error",
            path: `${dimensiojFile}#/dimensioj`,
            message: `The Dimensio valoro ${activeValoro} has no kontrastSojloj.`,
            suggestion: "Add kontrastSojloj to every valoro of the contrast Dimensio.",
          });
        }
        continue;
      }
      stats.evaluations = (stats.evaluations ?? 0) + 1;
      for (const [position, binding] of metrics.entries()) {
        const { metric } = binding;
        const threshold = thresholdOf(sojloj, metric, kategorio);
        if (threshold === undefined) {
          continue;
        }
        const value = metric.compute(effective, background);
        const statKey = `${metric.id}Evaluations`;
        stats[statKey] = (stats[statKey] ?? 0) + 1;
        if (position === 0) {
          const previous = minima.get(name);
          minima.set(name, previous === undefined ? value : Math.min(previous, value));
        }
        if (metric.passes(value, threshold)) {
          continue;
        }
        const tokens = resolution.tokens;
        const fgSet = own(tokens, pair.foreground)?.origin.set ?? CORE_SET_NAME;
        const bgSet = own(tokens, pair.background)?.origin.set ?? CORE_SET_NAME;
        const translucency =
          effective === foreground ? "" : ` (foreground alpha ${alphaOf(foreground)} composited)`;
        const issue: ValidationIssue = {
          rule: binding.rule,
          severity: binding.severity,
          ...context,
          message: `KontrastParo '${name}' (${kategorio}): ${pair.foreground} on ${pair.background} has ${metric.label} ${metric.formatValue(value)}${translucency} in ${combination}, below the threshold ${metric.formatThreshold(threshold)} of ${activeValoro ?? "the active contrast valoro"}.`,
          suggestion: `Adjust the token values of '${pair.foreground}' (set '${fgSet}') or '${pair.background}' (set '${bgSet}') for this combination; do not lower the threshold.`,
        };
        (binding.severity === "error" ? errors : warnings).push(issue);
      }
    }
  }

  const values = [...minima.values()];
  if (values.length > 0) {
    stats.minRatio = Math.trunc(Math.min(...values) * 100 + 1e-9) / 100;
  }
  for (const [name, value] of minima) {
    stats[`minRatio:${name}`] = Math.trunc(value * 100 + 1e-9) / 100;
  }
  return { errors, warnings, stats };
}
