// explain (Spec 002 FR-10; plan D-12): why a token has its value in one combination. The value
// and alias chain come from the resolver, the Reguloj of the token from `appliesTo` (never from
// prose), their result from the same per-combination checkers validation uses (or from the
// served report for static Reguloj), the KontrastParoj from the Alirebleco measurement. Pure.

import { alphaOf, readDtcgColor } from "../checks/alirebleco/color.js";
import { DEFAULT_METRIC_BINDINGS, kontrastSojlojOf } from "../checks/alirebleco/evaluate.js";
import {
  type BranchMeasurement,
  combineBranches,
  measureBranch,
} from "../checks/alirebleco/measure.js";
import { truncate2 } from "../checks/alirebleco/metrics.js";
import { CORE_SET_NAME, matchesTokenPattern } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { Jugxo, KontrastParo, Modelo, Regulo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { completeAssignment, formatCombination } from "../resolve/assignment.js";
import { type CombinationResolution, resolveCombination } from "../resolve/resolve.js";
import { COMBINATION_CHECKERS } from "../validate/color-reguloj.js";
import { findingIssue } from "../validate/combination-reguloj.js";
import { nearestNames } from "./nearest.js";

export interface ExplainInput {
  token: string;
  assignment?: Record<string, string>;
}

export interface BranchOutput {
  foreground: string;
  background: string;
  ratio: number;
  passed: boolean;
  composited: boolean;
  apca?: { lc: number; threshold?: number; passed?: boolean };
}

export interface PairOutput {
  threshold: number;
  passed: boolean;
  branch: "main" | "aux" | null;
  main: BranchOutput;
  aux?: BranchOutput;
}

export interface ExplainOutput {
  token: string;
  id: string;
  type: string;
  role?: string;
  description?: string;
  assignment: Record<string, string>;
  combination: string;
  value: unknown;
  origin: { set: string; package?: string };
  aliasChain: { token: string; set: string; package?: string }[];
  reguloj: {
    id: string;
    name: string;
    statement: string;
    kialo: string;
    checkability: string;
    aspekto?: string;
    via: "token" | "role" | "type" | "issue";
    result: "passed" | "violated" | "manual";
    issues: ValidationIssue[];
  }[];
  kontrastParoj: ({
    id: string;
    name: string;
    kategorio: string;
    kialo?: string;
    position: "foreground" | "background" | "aux-foreground" | "aux-background";
  } & PairOutput)[];
  jugxoj: Jugxo[];
}

export type ExplainResult =
  | { ok: true; output: ExplainOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

export function branchOutput(branch: BranchMeasurement): BranchOutput {
  const apca = branch.metrics.apca;
  return {
    foreground: branch.foreground,
    background: branch.background,
    ratio: Number(truncate2(branch.ratio)),
    passed: branch.passed,
    composited: branch.composited,
    ...(apca === undefined
      ? {}
      : {
          apca: {
            lc: Number(truncate2(Math.abs(apca.value))),
            ...(apca.threshold === undefined ? {} : { threshold: apca.threshold }),
            ...(apca.passed === undefined ? {} : { passed: apca.passed }),
          },
        }),
  };
}

/** A declared KontrastParo in one resolved combination, as the Alirebleco check measures it. */
export function measurePair(
  modelo: Modelo,
  pair: KontrastParo,
  resolution: CombinationResolution,
  assignment: Record<string, string>,
): PairOutput | undefined {
  const sojloj = kontrastSojlojOf(modelo, assignment);
  const metrics = DEFAULT_METRIC_BINDINGS.map((binding) => binding.metric);
  const branch = (names: { foreground: string; background: string }) => {
    const fg = readDtcgColor(resolution.tokens[names.foreground]?.value);
    const bg = readDtcgColor(resolution.tokens[names.background]?.value);
    if (fg === undefined || bg === undefined || alphaOf(bg) < 1) return undefined;
    return measureBranch(names, fg, bg, pair.kategorio, sojloj, metrics);
  };
  const main = branch({ foreground: pair.foreground, background: pair.background });
  const threshold = main?.metrics.wcag2?.threshold;
  if (main === undefined || threshold === undefined) return undefined;
  const aux = pair.aux === undefined ? undefined : branch(pair.aux);
  const { passed, branch: carrying } = combineBranches(main, aux);
  return {
    threshold,
    passed,
    branch: carrying,
    main: branchOutput(main),
    ...(aux === undefined ? {} : { aux: branchOutput(aux) }),
  };
}

function viaOf(regulo: Regulo, token: { name: string; role?: string; type: string }) {
  const applies = regulo.appliesTo;
  if (applies === undefined) return undefined;
  if (applies.tokens?.some((pattern) => matchesTokenPattern(pattern, token.name))) return "token";
  if (token.role !== undefined && applies.roles?.includes(token.role as never)) return "role";
  if (applies.types?.includes(token.type as never)) return "type";
  return undefined;
}

/** Whether an issue of the served report concerns the token (its file pointer or logical path). */
function concerns(issue: ValidationIssue, name: string): boolean {
  const pointer = `#/${name.split(".").join("/")}`;
  return (
    issue.path.endsWith(pointer) ||
    issue.path.endsWith(`/${name}`) ||
    issue.path.includes(`${pointer}/`)
  );
}

export function explain(
  modelo: Modelo,
  input: ExplainInput,
  report: { errors: readonly ValidationIssue[]; warnings: readonly ValidationIssue[] },
): ExplainResult {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  const token = Object.hasOwn(core, input.token) ? core[input.token] : undefined;
  if (token === undefined) {
    return {
      ok: false,
      issues: [
        {
          rule: "token-unknown",
          severity: "error",
          path: `explain/token`,
          message: `There is no token ${input.token}.`,
          suggestion: "Use one of the nearest names in allowed, or search_tokens.",
        },
      ],
      allowed: nearestNames(input.token, Object.keys(core)),
    };
  }
  const completed = completeAssignment(modelo, input.assignment ?? {});
  if (completed.assignment === undefined) return { ok: false, issues: completed.issues };
  const assignment = completed.assignment;
  const resolution = resolveCombination(modelo, assignment);
  const resolved = resolution.tokens[input.token];
  if (resolved === undefined) {
    return { ok: false, issues: resolution.errors.length > 0 ? resolution.errors : [] };
  }
  const packageOf = (setName: string) => modelo.setoj.find((set) => set.name === setName)?.package;
  const withPackage = <T extends { set: string }>(entry: T): T & { package?: string } => {
    const pkg = packageOf(entry.set);
    return pkg === undefined ? entry : { ...entry, package: pkg };
  };

  const aspekto = assignment[ASPEKTO_DIMENSIO];
  const reguloj: ExplainOutput["reguloj"] = [];
  for (const regulo of modelo.reguloj) {
    if (regulo.aspekto !== undefined && regulo.aspekto !== aspekto) continue;
    const reported = [...report.errors, ...report.warnings].filter(
      (issue) =>
        issue.regulo?.id === regulo.id &&
        concerns(issue, input.token) &&
        (issue.combination === undefined ||
          Object.entries(issue.combination).every(([key, value]) => assignment[key] === value)),
    );
    const via = viaOf(regulo, token) ?? (reported.length > 0 ? "issue" : undefined);
    if (via === undefined) continue;
    let issues: ValidationIssue[] = [];
    const checker = COMBINATION_CHECKERS[regulo.name];
    if (regulo.checkability === "automatic" && checker !== undefined) {
      issues = checker({ modelo, assignment, resolution, regulo })
        .filter(
          (finding) => finding.subject === input.token || finding.message.includes(input.token),
        )
        .map((finding) => ({
          ...findingIssue(modelo, regulo, assignment, finding),
          regulo: { id: regulo.id, name: regulo.name, kialo: regulo.kialo },
        }));
    } else if (regulo.checkability === "automatic") {
      issues = reported;
    }
    reguloj.push({
      id: regulo.id,
      name: regulo.name,
      statement: regulo.statement,
      kialo: regulo.kialo,
      checkability: regulo.checkability,
      ...(regulo.aspekto === undefined ? {} : { aspekto: regulo.aspekto }),
      via,
      result:
        regulo.checkability === "manual" ? "manual" : issues.length > 0 ? "violated" : "passed",
      issues,
    });
  }

  const kontrastParoj: ExplainOutput["kontrastParoj"] = [];
  for (const pair of modelo.kontrastParoj) {
    const position =
      pair.foreground === input.token
        ? "foreground"
        : pair.background === input.token
          ? "background"
          : pair.aux?.foreground === input.token
            ? "aux-foreground"
            : pair.aux?.background === input.token
              ? "aux-background"
              : undefined;
    if (position === undefined) continue;
    const measured = measurePair(modelo, pair, resolution, assignment);
    if (measured === undefined) continue;
    kontrastParoj.push({
      id: pair.id,
      name: pair.name,
      kategorio: pair.kategorio,
      ...(pair.kialo === undefined ? {} : { kialo: pair.kialo }),
      position,
      ...measured,
    });
  }

  const reguloIds = new Set(reguloj.map((regulo) => regulo.id));
  const jugxoj = modelo.jugxoj
    .filter((jugxo) => "regulo" in jugxo.ref && reguloIds.has(jugxo.ref.regulo))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));

  return {
    ok: true,
    output: {
      token: input.token,
      id: resolved.id,
      type: resolved.type,
      ...(token.role === undefined ? {} : { role: token.role }),
      ...(token.description === undefined ? {} : { description: token.description }),
      assignment,
      combination: formatCombination(modelo, assignment),
      value: resolved.value,
      origin: withPackage({ set: resolved.origin.set }),
      aliasChain: resolved.aliasChain.map((link) =>
        withPackage({ token: link.token, set: link.set }),
      ),
      reguloj,
      kontrastParoj,
      jugxoj,
    },
  };
}
