// check_contrast (Spec 002 FR-09; plan D-11, R3): the contrast of any colour pair, as an answer
// rather than a calculation. A declared KontrastParo is measured exactly as the Alirebleco check
// measures it (main and aux branch), an undeclared pair with the same compositing and metrics.
// Results are grouped by identical result, each group with the complete list of its
// combinations. Pure.

import { alphaOf, onBackdrop, readDtcgColor } from "../checks/alirebleco/color.js";
import { DEFAULT_METRIC_BINDINGS, kontrastSojlojOf } from "../checks/alirebleco/evaluate.js";
import {
  type BranchMeasurement,
  combineBranches,
  measureBranch,
} from "../checks/alirebleco/measure.js";
import { truncate2 } from "../checks/alirebleco/metrics.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { KontrastParo, Modelo } from "../contracts/modelo.js";
import type { KontrastKategorio } from "../generated/modelo-schema.js";
import { allAssignments, completeAssignment, formatCombination } from "../resolve/assignment.js";
import { resolveCombination } from "../resolve/resolve.js";
import { nearestNames } from "./nearest.js";

export const KATEGORIOJ: readonly KontrastKategorio[] = ["text-normal", "text-large", "ui"];

export interface CheckContrastInput {
  foreground: string;
  background: string;
  assignment?: Record<string, string>;
  kategorio?: KontrastKategorio;
}

export interface ContrastGroup {
  ratio: number;
  threshold: number;
  passed: boolean;
  branch: "main" | "aux" | null;
  auxRatio?: number;
  apcaMin?: number;
  combinations: string[];
}

export interface CheckContrastOutput {
  foreground: string;
  background: string;
  kategorio: KontrastKategorio;
  kategorioSource: "input" | "declared" | "role";
  declared: null | { id: string; name: string; position: "main" | "aux"; kialo?: string };
  results: ContrastGroup[];
  summary: { combinations: number; passed: number; failed: number; minRatio: number };
}

export type CheckContrastResult =
  | { ok: true; output: CheckContrastOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

const ROLE_KATEGORIO: Readonly<Record<string, KontrastKategorio>> = {
  foreground: "text-normal",
  border: "ui",
  focus: "ui",
};

const fail = (
  rule: ValidationIssue["rule"],
  path: string,
  message: string,
  suggestion: string,
  allowed?: string[],
): CheckContrastResult => ({
  ok: false,
  issues: [{ rule, severity: "error", path, message, suggestion }],
  ...(allowed === undefined ? {} : { allowed }),
});

function findDeclared(
  modelo: Modelo,
  foreground: string,
  background: string,
): { pair: KontrastParo; position: "main" | "aux" } | undefined {
  const main = modelo.kontrastParoj.find(
    (pair) => pair.foreground === foreground && pair.background === background,
  );
  if (main !== undefined) return { pair: main, position: "main" };
  const aux = modelo.kontrastParoj.find(
    (pair) => pair.aux?.foreground === foreground && pair.aux.background === background,
  );
  return aux === undefined ? undefined : { pair: aux, position: "aux" };
}

export function checkContrast(modelo: Modelo, input: CheckContrastInput): CheckContrastResult {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  const names = Object.keys(core);
  for (const field of ["foreground", "background"] as const) {
    const name = input[field];
    const token = Object.hasOwn(core, name) ? core[name] : undefined;
    if (token === undefined) {
      return fail(
        "token-unknown",
        `check_contrast/${field}`,
        `There is no token ${name}.`,
        "Use one of the nearest names in allowed, or search_tokens.",
        nearestNames(name, names),
      );
    }
    if (token.type !== "color") {
      return fail(
        "kontrast-not-color",
        `check_contrast/${field}`,
        `${name} is a ${token.type} token; contrast needs two colours.`,
        "Name a colour token for both foreground and background.",
      );
    }
  }

  const declared = findDeclared(modelo, input.foreground, input.background);
  const roleKategorio = ROLE_KATEGORIO[core[input.foreground]?.role ?? ""];
  const kategorio = input.kategorio ?? declared?.pair.kategorio ?? roleKategorio;
  if (kategorio === undefined) {
    return fail(
      "kategorio-required",
      "check_contrast/kategorio",
      `${input.foreground} has the role ${core[input.foreground]?.role ?? "none"}, from which no contrast kategorio follows.`,
      "Give kategorio: text-normal for body text, text-large for large text, ui for non-text elements.",
      [...KATEGORIOJ],
    );
  }
  const kategorioSource =
    input.kategorio !== undefined ? "input" : declared !== undefined ? "declared" : "role";

  let assignments: Record<string, string>[];
  if (input.assignment !== undefined) {
    const completed = completeAssignment(modelo, input.assignment);
    if (completed.assignment === undefined) return { ok: false, issues: completed.issues };
    assignments = [completed.assignment];
  } else {
    assignments = allAssignments(modelo);
  }

  // A declared pair is measured as a whole (main and aux), as the Alirebleco check does.
  const pair = declared?.pair;
  const main =
    pair === undefined ? input : { foreground: pair.foreground, background: pair.background };
  const aux = pair?.aux;
  // A translucent fill is measured on the surface the pair names (Spec 004).
  const backdropName = typeof pair?.backdrop === "string" ? pair.backdrop : undefined;
  const wanted = [
    main.foreground,
    main.background,
    ...(backdropName === undefined ? [] : [backdropName]),
    ...(aux === undefined ? [] : [aux.foreground, aux.background]),
  ];
  const metrics = DEFAULT_METRIC_BINDINGS.map((binding) => binding.metric);

  const groups = new Map<string, ContrastGroup>();
  let passedCount = 0;
  let minRatio = Number.POSITIVE_INFINITY;
  for (const assignment of assignments) {
    const resolution = resolveCombination(modelo, assignment, { names: wanted });
    const complete = resolution.assignment ?? assignment;
    const combination = formatCombination(modelo, complete);
    const sojloj = kontrastSojlojOf(modelo, complete);
    const colorOf = (name: string) => readDtcgColor(resolution.tokens[name]?.value);
    const backdrop = backdropName === undefined ? undefined : colorOf(backdropName);
    const branch = (names: {
      foreground: string;
      background: string;
    }): BranchMeasurement | undefined => {
      const fg = colorOf(names.foreground);
      const raw = colorOf(names.background);
      if (fg === undefined || raw === undefined) return undefined;
      const bg = names.background === main.background ? onBackdrop(raw, backdrop) : raw;
      if (alphaOf(bg) < 1) return undefined;
      return measureBranch(names, fg, bg, kategorio, sojloj, metrics);
    };
    const mainMeasured = branch(main);
    if (mainMeasured === undefined) {
      return fail(
        "kontrastparo-background-transparent",
        `check_contrast/${combination}`,
        `${main.foreground} on ${main.background} cannot be measured in ${combination}: a colour does not resolve or the background is translucent.`,
        "Pair the foreground with an opaque background token.",
      );
    }
    const threshold = mainMeasured.metrics.wcag2?.threshold;
    if (threshold === undefined) {
      return fail(
        "kontrast-sojloj-invalid",
        `check_contrast/${combination}`,
        `The active contrast valoro in ${combination} declares no WCAG threshold.`,
        "Add kontrastSojloj to every valoro of the contrast Dimensio.",
      );
    }
    const auxMeasured = aux === undefined ? undefined : branch(aux);
    const result = combineBranches(mainMeasured, auxMeasured);
    const ratio = Number(truncate2(mainMeasured.ratio));
    const auxRatio = auxMeasured === undefined ? undefined : Number(truncate2(auxMeasured.ratio));
    const key = [
      ratio,
      threshold,
      result.passed,
      aux === undefined ? "" : `${result.branch} ${auxRatio}`,
    ].join(" ");
    const lc = mainMeasured.metrics.apca?.value;
    let group = groups.get(key);
    if (group === undefined) {
      group = {
        ratio,
        threshold,
        passed: result.passed,
        branch: result.branch,
        ...(auxRatio === undefined ? {} : { auxRatio }),
        combinations: [],
      };
      groups.set(key, group);
    }
    group.combinations.push(combination);
    if (lc !== undefined) {
      const abs = Number(truncate2(Math.abs(lc)));
      group.apcaMin = group.apcaMin === undefined ? abs : Math.min(group.apcaMin, abs);
    }
    if (result.passed) passedCount += 1;
    minRatio = Math.min(minRatio, ratio);
  }

  return {
    ok: true,
    output: {
      foreground: input.foreground,
      background: input.background,
      kategorio,
      kategorioSource,
      declared:
        declared === undefined
          ? null
          : {
              id: declared.pair.id,
              name: declared.pair.name,
              position: declared.position,
              ...(declared.pair.kialo === undefined ? {} : { kialo: declared.pair.kialo }),
            },
      results: [...groups.values()],
      summary: {
        combinations: assignments.length,
        passed: passedCount,
        failed: assignments.length - passedCount,
        minRatio,
      },
    },
  };
}
