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
import {
  type BranchMeasurement,
  combineBranches,
  measureBranch,
  type PairMeasurement,
} from "./measure.js";
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
  /** Also return every measurement (pair × combination), for parity with check_contrast. */
  collect?: boolean;
}

/** A pair × combination whose result the alternative pair carries (Spec 002, FR-07). */
export interface AuxBranchEntry {
  pair: string;
  combination: string;
  branch: "aux";
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
  /** Every pair × combination whose result the aux pair carries, in canonical order. */
  branches: AuxBranchEntry[];
  /** With `collect: true`: every measurement, in canonical order (combination, then pair). */
  measurements?: PairMeasurement[];
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

/** The `kontrastSojloj` active in a complete assignment (Spec 002: shared with check_contrast). */
export function kontrastSojlojOf(
  modelo: Modelo,
  assignment: Record<string, string>,
): KontrastSojloj | undefined {
  return sojlojOf(thresholdDimensio(modelo), assignment);
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
    const members: {
      holder: Record<string, unknown>;
      field: "foreground" | "background";
      at: string;
    }[] = [
      {
        holder: entry.pair as unknown as Record<string, unknown>,
        field: "foreground",
        at: "foreground",
      },
      {
        holder: entry.pair as unknown as Record<string, unknown>,
        field: "background",
        at: "background",
      },
    ];
    const aux: unknown = entry.pair.aux;
    if (isJsonObject(aux)) {
      members.push({ holder: aux, field: "foreground", at: "aux/foreground" });
      members.push({ holder: aux, field: "background", at: "aux/background" });
    }
    for (const { holder, field, at } of members) {
      const tokenName: unknown = holder[field];
      const token = typeof tokenName === "string" ? own(core?.tokens, tokenName) : undefined;
      if (token === undefined) {
        errors.push({
          rule: "kontrastparo-token-missing",
          severity: "error",
          path: pairPointer(entry.index, at),
          message: `KontrastParo '${entry.name}': ${field} token '${String(tokenName)}' is not defined in core.`,
          suggestion: `Point ${field} at an existing core color token, or define '${String(tokenName)}' in core.`,
        });
        ok = false;
      } else if (token.type !== "color") {
        errors.push({
          rule: "kontrastparo-not-color",
          severity: "error",
          path: pairPointer(entry.index, at),
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

  const collect = options.collect === true;
  const branches: AuxBranchEntry[] = [];
  const measurements: PairMeasurement[] = [];
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
      const auxPair = isJsonObject(pair.aux) ? pair.aux : undefined;
      const backdropName = typeof pair.backdrop === "string" ? pair.backdrop : undefined;

      /** Resolved colours of one branch, or undefined after reporting why they are missing. */
      const branchColors = (
        names: { foreground: string; background: string },
        label: string,
      ): { foreground: ColorValue; background: ColorValue } | undefined => {
        const colors: Partial<Record<"foreground" | "background", ColorValue>> = {};
        for (const field of ["foreground", "background"] as const) {
          const tokenName = names[field];
          const resolved = own(resolution.tokens, tokenName);
          if (resolved === undefined) {
            errors.push({
              rule: "kontrastparo-token-missing",
              severity: "error",
              ...context,
              message: `KontrastParo '${name}': ${label}${field} token '${tokenName}' does not resolve in ${combination}.`,
              suggestion: `Fix the alias chain of '${tokenName}' for this combination (see the resolver's alias-* issues).`,
            });
            continue;
          }
          const color = readDtcgColor(resolved.value);
          if (color === undefined) {
            errors.push({
              rule: "kontrastparo-not-color",
              severity: "error",
              ...context,
              message: `KontrastParo '${name}': ${label}${field} token '${tokenName}' resolves to a value that is not a DTCG color in ${combination} (set '${resolved.origin.set}').`,
              suggestion: `Give '${tokenName}' a color value ({ colorSpace, components[3], alpha? }) in set '${resolved.origin.set}'.`,
            });
            continue;
          }
          colors[field] = color;
        }
        const { foreground } = colors;
        let { background } = colors;
        if (foreground === undefined || background === undefined) return undefined;
        // An overlay has no colour until it lies on something: with a backdrop the pair says what
        // that is, and the composited colour is what a person sees (Spec 004).
        if (alphaOf(background) < 1 && backdropName !== undefined) {
          const resolvedBackdrop = own(resolution.tokens, backdropName);
          const backdrop = readDtcgColor(resolvedBackdrop?.value);
          if (backdrop === undefined) {
            errors.push({
              rule: "kontrastparo-background-transparent",
              severity: "error",
              ...context,
              message: `KontrastParo '${name}': ${label}backdrop '${backdropName}' does not resolve to a DTCG color in ${combination}.`,
              suggestion: `Give '${backdropName}' a color value in every combination, or drop the backdrop and use an opaque background.`,
            });
            return undefined;
          }
          if (alphaOf(backdrop) < 1) {
            errors.push({
              rule: "kontrastparo-background-transparent",
              severity: "error",
              ...context,
              message: `KontrastParo '${name}': ${label}backdrop '${backdropName}' has alpha ${alphaOf(backdrop)} in ${combination}; an overlay on an overlay still has no colour.`,
              suggestion: `Name an opaque surface as the backdrop of '${name}' (for example color.background.default).`,
            });
            return undefined;
          }
          background = compositeOver(background, backdrop);
        }
        if (alphaOf(background) < 1) {
          const origin = own(resolution.tokens, names.background)?.origin.set ?? CORE_SET_NAME;
          errors.push({
            rule: "kontrastparo-background-transparent",
            severity: "error",
            ...context,
            message: `KontrastParo '${name}': ${label}background '${names.background}' has alpha ${alphaOf(background)} in ${combination}; contrast against an unknown backdrop cannot be determined.`,
            suggestion: `Make '${names.background}' opaque (alpha 1) in set '${origin}', name the surface it lies on with "backdrop", or pair the foreground with an opaque background token.`,
          });
          return undefined;
        }
        return { foreground, background };
      };

      const mainNames = { foreground: pair.foreground, background: pair.background };
      const mainColors = branchColors(mainNames, "");
      if (mainColors === undefined) {
        continue;
      }
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
      const metricList = metrics.map((binding) => binding.metric);
      const main = measureBranch(
        mainNames,
        mainColors.foreground,
        mainColors.background,
        kategorio,
        sojloj,
        metricList,
      );
      let aux: BranchMeasurement | undefined;
      if (auxPair !== undefined) {
        const auxNames = {
          foreground: String(auxPair.foreground),
          background: String(auxPair.background),
        };
        const auxColors = branchColors(auxNames, "aux ");
        if (auxColors !== undefined) {
          aux = measureBranch(
            auxNames,
            auxColors.foreground,
            auxColors.background,
            kategorio,
            sojloj,
            metricList,
          );
        }
      }
      const { passed, branch } = combineBranches(main, aux);
      const carrying = branch === "aux" && aux !== undefined ? aux : main;

      stats.evaluations = (stats.evaluations ?? 0) + 1;
      for (const { metric } of metrics) {
        if (main.metrics[metric.id]?.threshold !== undefined) {
          const statKey = `${metric.id}Evaluations`;
          stats[statKey] = (stats[statKey] ?? 0) + 1;
        }
      }
      const previous = minima.get(name);
      minima.set(
        name,
        previous === undefined ? carrying.ratio : Math.min(previous, carrying.ratio),
      );
      if (branch === "aux") {
        stats.auxBranch = (stats.auxBranch ?? 0) + 1;
        stats[`branch:aux:${name}`] = (stats[`branch:aux:${name}`] ?? 0) + 1;
        branches.push({ pair: name, combination, branch: "aux" });
      }
      if (collect) {
        const measured: PairMeasurement = {
          pair: {
            id: String(pair.id),
            name,
            ...(typeof pair.kialo === "string" ? { kialo: pair.kialo } : {}),
          },
          combination: { ...complete },
          kategorio,
          ...(main.metrics[metrics[0]?.metric.id ?? ""]?.threshold === undefined
            ? {}
            : { threshold: main.metrics[metrics[0]?.metric.id ?? ""]?.threshold as number }),
          main,
          ...(aux === undefined ? {} : { aux }),
          passed,
          branch,
        };
        measurements.push(measured);
      }

      const tokens = resolution.tokens;
      for (const [position, binding] of metrics.entries()) {
        const { metric } = binding;
        // The binding metric fails only when no branch carries the pair; advisory metrics are
        // reported on the branch that carries it (the main pair when none does).
        const source = position === 0 ? main : carrying;
        const measuredMetric = source.metrics[metric.id];
        if (measuredMetric?.threshold === undefined || measuredMetric.passed !== false) {
          continue;
        }
        if (position === 0 && passed) {
          continue;
        }
        const threshold = measuredMetric.threshold;
        const describe = (branchValue: BranchMeasurement): string => {
          const value = branchValue.metrics[metric.id]?.value ?? 0;
          const translucency = branchValue.composited
            ? ` (foreground alpha ${branchValue.foregroundAlpha} composited)`
            : "";
          return `${branchValue.foreground} on ${branchValue.background} has ${metric.label} ${metric.formatValue(value)}${translucency}`;
        };
        const alternative =
          position === 0 && aux !== undefined ? `, and the alternative pair ${describe(aux)}` : "";
        const fgSet = own(tokens, source.foreground)?.origin.set ?? CORE_SET_NAME;
        const bgSet = own(tokens, source.background)?.origin.set ?? CORE_SET_NAME;
        const issue: ValidationIssue = {
          rule: binding.rule,
          severity: binding.severity,
          ...context,
          message: `KontrastParo '${name}' (${kategorio}): ${describe(source)}${alternative} in ${combination}, below the threshold ${metric.formatThreshold(threshold)} of ${activeValoro ?? "the active contrast valoro"}.`,
          suggestion:
            position === 0 && aux !== undefined
              ? `Adjust '${pair.foreground}' or '${pair.background}', or give the alternative '${aux.foreground}' (set '${own(tokens, aux.foreground)?.origin.set ?? CORE_SET_NAME}') a step that reaches the threshold; do not lower the threshold.`
              : `Adjust the token values of '${source.foreground}' (set '${fgSet}') or '${source.background}' (set '${bgSet}') for this combination; do not lower the threshold.`,
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
  return { errors, warnings, stats, branches, ...(collect ? { measurements } : {}) };
}
