// suggest_ero (Spec 003, FR-13, plan D-16 §2; Spec 007, A9, D-06, contracts/mcp-tools §2): from a
// goal in a word to the Ero and the props it asks for, with the Regulo behind the choice — or to
// the boundary or alternative of a Uzo, with its kialo and action. Deterministic and without a
// model: the first Skemo goal (declaration order) one of whose keywords is a word of the input
// wins (D-16); the first instead or boundary entry of a Uzo whose keyword hits wins likewise. When
// both hit, Fundamento picks no reading: it answers ask-human with both candidates (OP-12). Pure.
// The goal is called goal since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Keywords, Modelo, UzoBoundary } from "../contracts/modelo.js";
import { goalOf, wordsOf } from "../eroj/usage.js";
import { type ReguloRef, reguloRef } from "./eroj.js";

export interface SuggestEroInput {
  goal: string;
  /** Only the keywords of this language count; without it, every language does. */
  lingvo?: string;
}

/** A boundary or alternative of a Uzo that answers the goal (contracts §2). */
export interface SuggestedBoundary {
  /** The Ero whose Uzo answers. */
  ero: string;
  /** The boundary case, or the goal of the instead entry. */
  case: string;
  action: UzoBoundary["action"];
  kialo: string;
}

export type SuggestCandidate =
  | (SuggestedBoundary & { kind: "boundary"; keyword: string })
  | {
      kind: "goal";
      ero: string;
      goal: string;
      props: Record<string, string>;
      keyword: string;
      kialo?: string;
      regulo?: ReguloRef;
    };

export interface SuggestEroOutput {
  /** The input, unchanged: the answer says what it answers. */
  goal: string;
  /** What hit: a Skemo goal, or the case of a boundary or alternative; null with candidates. */
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  kialo?: string;
  regulo?: ReguloRef;
  /** The boundary or alternative that answers (Spec 007); absent when a Skemo goal answers. */
  boundary?: SuggestedBoundary;
  /** `ask-human` when a boundary and a goal both hit: a person decides between the candidates. */
  action?: "ask-human";
  candidates?: SuggestCandidate[];
}

export type SuggestEroResult =
  | { ok: true; output: SuggestEroOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

/** Every goal any Ero knows, in declaration order, without duplicates. */
export function knownGoals(modelo: Modelo): string[] {
  const names: string[] = [];
  for (const entry of modelo.eroj) {
    for (const goal of entry.skemo.goals ?? []) {
      if (!names.includes(goal.goal)) names.push(goal.goal);
    }
  }
  return names;
}

/**
 * A Uzo keyword of this many letters or more also hits a word that ends with it (D-06, N-1): in
 * German the head noun stands last, so "projektübersicht" hits "übersicht". Shorter keywords hit
 * whole words only, like the Skemo goals.
 */
export const COMPOUND_SUFFIX_MIN = 6;

/** The keyword of a Uzo entry that hits the text, with its language (D-06). */
export function uzoKeywordHit(
  keywords: Keywords | undefined,
  text: string,
  lingvo?: string,
): { keyword: string; lingvo: string } | undefined {
  if (keywords === undefined) return undefined;
  const words = wordsOf(text);
  for (const [language, list] of Object.entries(keywords)) {
    if (lingvo !== undefined && language !== lingvo) continue;
    for (const keyword of list) {
      const needle = keyword.normalize("NFC").toLowerCase();
      const hit = words.some(
        (word) =>
          word === needle || (needle.length >= COMPOUND_SUFFIX_MIN && word.endsWith(needle)),
      );
      if (hit) return { keyword, lingvo: language };
    }
  }
  return undefined;
}

type BoundaryHit = SuggestedBoundary & {
  keyword: string;
  lingvo: string;
  /** An alternative (instead) or a boundary entry of the Uzo (Spec 008, D-08). */
  kind: "instead" | "boundary";
};

/** The first instead or boundary entry of any Uzo whose keyword hits (declaration order). */
function boundaryHit(modelo: Modelo, text: string, lingvo?: string): BoundaryHit | undefined {
  for (const entry of modelo.eroj) {
    const uzo = entry.uzo;
    if (uzo === undefined) continue;
    for (const alternative of uzo.instead) {
      const hit = uzoKeywordHit(alternative.keywords, text, lingvo);
      if (hit === undefined) continue;
      return {
        ero: entry.ero.name,
        case: alternative.goal,
        action: alternative.ero === null ? "ask-human" : "use-instead",
        kialo: alternative.kialo,
        kind: "instead",
        ...hit,
      };
    }
    for (const boundary of uzo.boundary) {
      const hit = uzoKeywordHit(boundary.keywords, text, lingvo);
      if (hit === undefined) continue;
      return {
        ero: entry.ero.name,
        case: boundary.case,
        action: boundary.action,
        kialo: boundary.kialo,
        ...hit,
        kind: "boundary",
      };
    }
  }
  return undefined;
}

/** The Ero the instead or boundary entry names to use instead, if any. */
function insteadEro(modelo: Modelo, hit: BoundaryHit): string | undefined {
  if (hit.action !== "use-instead") return undefined;
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === hit.ero);
  const alternative = entry?.uzo?.instead.find((item) => item.goal === hit.case);
  const boundary = entry?.uzo?.boundary.find((item) => item.case === hit.case);
  return alternative?.ero ?? boundary?.ero ?? undefined;
}

type GoalHit = {
  ero: string;
  goal: string;
  props: Record<string, string>;
  keyword: string;
  lingvo: string;
  kialo?: string;
  regulo?: ReguloRef;
};

/** The first Skemo goal of any Ero whose keyword is a word of the text. */
function goalHit(modelo: Modelo, text: string, lingvo?: string): GoalHit | undefined {
  for (const entry of modelo.eroj) {
    const match = goalOf(entry.skemo, text, lingvo === undefined ? {} : { lingvo });
    if (match === undefined) continue;
    const regulo =
      match.goal.regulo === undefined
        ? undefined
        : modelo.reguloj.find((candidate) => candidate.name === match.goal.regulo);
    return {
      ero: entry.ero.name,
      goal: match.goal.goal,
      props: Object.fromEntries(
        Object.entries(match.goal.props).map(([key, value]) => [key, String(value)]),
      ),
      keyword: match.keyword,
      lingvo: match.lingvo,
      ...(regulo === undefined ? {} : { kialo: regulo.kialo, regulo: reguloRef(regulo) }),
    };
  }
  return undefined;
}

export function suggestEro(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  const boundary = boundaryHit(modelo, input.goal, input.lingvo);
  const goal = goalHit(modelo, input.goal, input.lingvo);

  // Spec 008 D-08: a boundary that says use-instead X and a goal of X say the same thing. The
  // goal answers (Ero, props, Regulo) and the boundary stands next to it with its kialo, so the
  // agent can say why the first Ero is not the one. Only two different Eroj are a conflict.
  if (boundary !== undefined && goal !== undefined && insteadEro(modelo, boundary) === goal.ero) {
    const output: SuggestEroOutput = {
      goal: input.goal,
      matched: { goal: goal.goal, keyword: goal.keyword, lingvo: goal.lingvo },
      suggestion: { ero: goal.ero, props: goal.props },
    };
    // A boundary of the other Ero names why that Ero is not the one (S1: the butono says
    // navigation is the ligilo's); an instead entry of the other Ero only confirms the choice and
    // would change answers that stood before (OP-12), so it stays out.
    if (boundary.kind === "boundary") {
      output.boundary = {
        ero: boundary.ero,
        case: boundary.case,
        action: boundary.action,
        kialo: boundary.kialo,
      };
    }
    if (goal.kialo !== undefined) output.kialo = goal.kialo;
    if (goal.regulo !== undefined) output.regulo = goal.regulo;
    return { ok: true, output };
  }

  if (boundary !== undefined && goal !== undefined) {
    // Both readings hold; Fundamento does not choose (OP-12). Prompt rule 12 passes both on.
    const goalCandidate: SuggestCandidate = {
      kind: "goal",
      ero: goal.ero,
      goal: goal.goal,
      props: goal.props,
      keyword: goal.keyword,
    };
    if (goal.kialo !== undefined) goalCandidate.kialo = goal.kialo;
    if (goal.regulo !== undefined) goalCandidate.regulo = goal.regulo;
    return {
      ok: true,
      output: {
        goal: input.goal,
        matched: null,
        suggestion: null,
        action: "ask-human",
        candidates: [
          {
            kind: "boundary",
            ero: boundary.ero,
            case: boundary.case,
            action: boundary.action,
            kialo: boundary.kialo,
            keyword: boundary.keyword,
          },
          goalCandidate,
        ],
      },
    };
  }

  if (boundary !== undefined) {
    const instead = insteadEro(modelo, boundary);
    return {
      ok: true,
      output: {
        goal: input.goal,
        matched: { goal: boundary.case, keyword: boundary.keyword, lingvo: boundary.lingvo },
        suggestion: instead === undefined ? null : { ero: instead, props: {} },
        boundary: {
          ero: boundary.ero,
          case: boundary.case,
          action: boundary.action,
          kialo: boundary.kialo,
        },
      },
    };
  }

  if (goal !== undefined) {
    const output: SuggestEroOutput = {
      goal: input.goal,
      matched: { goal: goal.goal, keyword: goal.keyword, lingvo: goal.lingvo },
      suggestion: { ero: goal.ero, props: goal.props },
    };
    if (goal.kialo !== undefined) output.kialo = goal.kialo;
    if (goal.regulo !== undefined) output.regulo = goal.regulo;
    return { ok: true, output };
  }

  return {
    ok: false,
    issues: [
      {
        rule: "goal-unknown",
        severity: "error",
        path: "suggest_ero/goal",
        message: `No Ero knows a goal for "${input.goal}"${input.lingvo === undefined ? "" : ` in ${input.lingvo}`}.`,
        // OP-6, D-06: the system says what it does not cover; a person decides.
        suggestion:
          "Fundamento does not cover this goal. Ask a person; do not build a replacement.",
      },
    ],
    allowed: knownGoals(modelo),
  };
}
