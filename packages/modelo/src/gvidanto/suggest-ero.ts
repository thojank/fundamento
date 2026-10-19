// suggest_ero (Spec 003, FR-13, plan D-16 §2; Spec 007, A9, D-06, contracts/mcp-tools §2): from a
// goal in a word to the Ero and the props it asks for, with the Regulo behind the choice — or to
// the boundary or alternative of a Uzo, with its kialo and action. Deterministic and without a
// model: the first Skemo goal (declaration order) one of whose keywords is a word of the input
// wins (D-16); the first instead or boundary entry of a Uzo whose keyword hits wins likewise. When
// both hit, Fundamento picks no reading: it answers ask-human with both candidates (OP-12); so
// does it when the goals of two Eroj hit alike (Nachlese 3 G2). Pure.
// The goal is called goal since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Keywords, Modelo, UzoBoundary } from "../contracts/modelo.js";
import {
  COMPOUND_SUFFIX_MIN,
  goalOf,
  keywordHitOf,
  keywordHits,
  keywordTextOf,
} from "../eroj/usage.js";
import { type ReguloRef, reguloRef } from "./eroj.js";

/** The props a goal asks for, typed as an EroInstance takes them (R-9): never "true" as a text. */
export type GoalProps = Record<string, string | number | boolean>;

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
      props: GoalProps;
      keyword: string;
      kialo?: string;
      regulo?: ReguloRef;
    };

export interface SuggestEroOutput {
  /** The input, unchanged: the answer says what it answers. */
  goal: string;
  /** What hit: a Skemo goal, or the case of a boundary or alternative; null with candidates. */
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: GoalProps } | null;
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
 * A Uzo keyword of COMPOUND_SUFFIX_MIN letters or more also hits a word that ends with it (D-06,
 * N-1): in German the head noun stands last, so "projektübersicht" hits "übersicht". Shorter
 * keywords hit whole words only, like the Skemo goals. Since Nachlese 4 compared without hyphens
 * (N-1), as `goalOf` does (`keywordHits`).
 */
export { COMPOUND_SUFFIX_MIN };

/**
 * What one pass of the Gvidanto compares (Nachlese 4 N-2): the language the input allows, and
 * whether German endings count. The first pass compares as written; only where it finds nothing
 * at all — no goal, no Uzo entry — a second pass takes the endings in (`suggestEro`).
 */
type Pass = { lingvo?: string; inflect: boolean };

const AS_WRITTEN = false;

/** The keyword of a Uzo entry that hits the text, with its language (D-06). */
export function uzoKeywordHit(
  keywords: Keywords | undefined,
  text: string,
  lingvo?: string,
  inflect = AS_WRITTEN,
): { keyword: string; lingvo: string } | undefined {
  if (keywords === undefined) return undefined;
  const prepared = keywordTextOf(text);
  for (const [language, list] of Object.entries(keywords)) {
    if (lingvo !== undefined && language !== lingvo) continue;
    for (const keyword of list) {
      if (keywordHits(keyword, language, prepared, { suffixOf: "words", inflect })) {
        return { keyword, lingvo: language };
      }
    }
  }
  return undefined;
}

/**
 * How many keywords of one Uzo entry the text hits (Nachlese 4 N-4): the strength of a boundary,
 * counted like the strength of a goal (distinct words).
 */
function uzoStrength(keywords: Keywords | undefined, text: string, pass: Pass): number {
  if (keywords === undefined) return 0;
  const prepared = keywordTextOf(text);
  const hit = new Set<string>();
  for (const [language, list] of Object.entries(keywords)) {
    if (pass.lingvo !== undefined && language !== pass.lingvo) continue;
    for (const keyword of list) {
      const form = keywordHitOf(keyword, language, prepared, {
        suffixOf: "words",
        inflect: pass.inflect,
      });
      if (form !== undefined) hit.add(form);
    }
  }
  return hit.size;
}

type BoundaryHit = SuggestedBoundary & {
  keyword: string;
  lingvo: string;
  /** An alternative (instead) or a boundary entry of the Uzo (Spec 008, D-08). */
  kind: "instead" | "boundary";
};

/** The first instead or boundary entry of any Uzo whose keyword hits (declaration order). */
function boundaryHit(modelo: Modelo, text: string, pass: Pass): BoundaryHit | undefined {
  for (const entry of modelo.eroj) {
    const uzo = entry.uzo;
    if (uzo === undefined) continue;
    for (const alternative of uzo.instead) {
      const hit = uzoKeywordHit(alternative.keywords, text, pass.lingvo, pass.inflect);
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
      const hit = uzoKeywordHit(boundary.keywords, text, pass.lingvo, pass.inflect);
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

/** Whether the word is a keyword of a goal of the Ero (Spec 015 ③: a synonym with a boundary). */
function goalWordOf(modelo: Modelo, ero: string, word: string): boolean {
  const needle = word.normalize("NFC").toLowerCase();
  const skemo = modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo;
  return (skemo?.goals ?? []).some((goal) =>
    Object.values(goal.keywords).some((keywords) =>
      keywords.some((keyword) => keyword.normalize("NFC").toLowerCase() === needle),
    ),
  );
}

type GoalHit = {
  ero: string;
  goal: string;
  props: GoalProps;
  keyword: string;
  lingvo: string;
  kialo?: string;
  regulo?: ReguloRef;
};

/** The first Skemo goal of any Ero whose keyword is a word of the text. */
function goalHit(modelo: Modelo, text: string, pass: Pass): GoalHit | undefined {
  for (const entry of modelo.eroj) {
    const match = goalOf(entry.skemo, text, pass);
    if (match === undefined) continue;
    const regulo =
      match.goal.regulo === undefined
        ? undefined
        : modelo.reguloj.find((candidate) => candidate.name === match.goal.regulo);
    return {
      ero: entry.ero.name,
      goal: match.goal.goal,
      // R-9 (Abnahme Spec 008 A6, 2026-10-13): the props keep their type. A boolean prop of the
      // goal (external: true) is a boolean in the answer, as an EroInstance takes it; "true" as a
      // text was a value no Skemo knows.
      props: { ...match.goal.props },
      keyword: match.keyword,
      lingvo: match.lingvo,
      ...(regulo === undefined ? {} : { kialo: regulo.kialo, regulo: reguloRef(regulo) }),
    };
  }
  return undefined;
}

/**
 * How many keywords of an Ero's goals the text hits (Nachlese 3 G2): the strength of a goal hit.
 * Counted per keyword over every goal and language the input allows, with the same measure as
 * `goalOf` (`keywordHits`: whole words, hyphenated compounds by their ending, no hyphens, German
 * endings in the second pass).
 */
function goalStrength(modelo: Modelo, ero: string, text: string, pass: Pass): number {
  const skemo = modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo;
  if (skemo === undefined) return 0;
  const prepared = keywordTextOf(text);
  // Distinct words: "tabs" in both languages of one goal is one hit, not two.
  const hit = new Set<string>();
  for (const goal of skemo.goals ?? []) {
    for (const [language, keywords] of Object.entries(goal.keywords)) {
      if (pass.lingvo !== undefined && language !== pass.lingvo) continue;
      for (const keyword of keywords) {
        const form = keywordHitOf(keyword, language, prepared, {
          suffixOf: "compounds",
          inflect: pass.inflect,
        });
        if (form !== undefined) hit.add(form);
      }
    }
  }
  return hit.size;
}

/**
 * The keywords of the Uzo entry a boundary hit stands for (Nachlese 4 N-4): the instead entry
 * or the boundary of its Ero with that case.
 */
function boundaryKeywords(modelo: Modelo, hit: BoundaryHit): Keywords | undefined {
  const uzo = modelo.eroj.find((entry) => entry.ero.name === hit.ero)?.uzo;
  if (hit.kind === "instead") return uzo?.instead.find((item) => item.goal === hit.case)?.keywords;
  return uzo?.boundary.find((item) => item.case === hit.case)?.keywords;
}

/**
 * The goals of other Eroj the text hits as strongly as the first (Nachlese 3 G2): a tie. The
 * first Ero in name order keeps the answer where the strengths differ (every answer that stood
 * stays); where another Ero is hit with the same number of keywords, nobody decides for a
 * person. In Ero order, without the first.
 */
function tiedGoals(modelo: Modelo, first: GoalHit, text: string, pass: Pass): GoalHit[] {
  const strength = goalStrength(modelo, first.ero, text, pass);
  const tied: GoalHit[] = [];
  for (const entry of modelo.eroj) {
    if (entry.ero.name === first.ero) continue;
    const match = goalOf(entry.skemo, text, pass);
    if (match === undefined) continue;
    if (goalStrength(modelo, entry.ero.name, text, pass) !== strength) continue;
    const regulo =
      match.goal.regulo === undefined
        ? undefined
        : modelo.reguloj.find((candidate) => candidate.name === match.goal.regulo);
    tied.push({
      ero: entry.ero.name,
      goal: match.goal.goal,
      props: { ...match.goal.props },
      keyword: match.keyword,
      lingvo: match.lingvo,
      ...(regulo === undefined ? {} : { kialo: regulo.kialo, regulo: reguloRef(regulo) }),
    });
  }
  return tied;
}

function goalCandidateOf(hit: GoalHit): SuggestCandidate {
  const candidate: SuggestCandidate = {
    kind: "goal",
    ero: hit.ero,
    goal: hit.goal,
    props: hit.props,
    keyword: hit.keyword,
  };
  if (hit.kialo !== undefined) candidate.kialo = hit.kialo;
  if (hit.regulo !== undefined) candidate.regulo = hit.regulo;
  return candidate;
}

export function suggestEro(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  // Nachlese 4 N-2 (F-3): the words as written first. Only a text that names nothing at all —
  // no goal, no Uzo entry — is read again with the German endings ("Vorschlägen" → vorschläge),
  // so every text that found something before keeps its answer.
  let pass: Pass = {
    ...(input.lingvo === undefined ? {} : { lingvo: input.lingvo }),
    inflect: false,
  };
  let boundary = boundaryHit(modelo, input.goal, pass);
  let goal = goalHit(modelo, input.goal, pass);
  if (boundary === undefined && goal === undefined) {
    pass = { ...pass, inflect: true };
    boundary = boundaryHit(modelo, input.goal, pass);
    goal = goalHit(modelo, input.goal, pass);
  }

  // Nachlese 3 G2: the goals of two Eroj hit alike (the same number of keywords) — Fundamento
  // picks no reading: ask-human with every tied candidate and its kialo. An own instead entry
  // that redirects the first Ero's goal (Spec 011 ② D-10) is no tie and keeps its way below.
  const ownRedirect =
    boundary !== undefined &&
    goal !== undefined &&
    boundary.ero === goal.ero &&
    boundary.kind === "instead" &&
    boundary.action === "use-instead";
  // Spec 015 ③ (E6, plan ③ D-12): a word an Ero names both in its own boundary and in one of its
  // own goals is a synonym with a boundary — „Toast“ is the avizo, and the avizo's boundary toast
  // says why it stays in the flow. The goal answers with the boundary beside it, and no tie with
  // another Ero's goal is formed: the Ero has claimed the word for itself.
  const ownSynonym =
    boundary !== undefined &&
    goal !== undefined &&
    boundary.ero === goal.ero &&
    boundary.kind === "boundary" &&
    goalWordOf(modelo, goal.ero, boundary.keyword);
  const tied =
    goal === undefined || ownRedirect || ownSynonym
      ? []
      : tiedGoals(modelo, goal, input.goal, pass);
  if (goal !== undefined && tied.length > 0) {
    // A boundary that hit stands first among the candidates, as it does below (OP-12): its kialo
    // says why one Ero is not the one.
    const boundaryCandidate: SuggestCandidate[] =
      boundary === undefined
        ? []
        : [
            {
              kind: "boundary",
              ero: boundary.ero,
              case: boundary.case,
              action: boundary.action,
              kialo: boundary.kialo,
              keyword: boundary.keyword,
            },
          ];
    return {
      ok: true,
      output: {
        goal: input.goal,
        matched: null,
        suggestion: null,
        action: "ask-human",
        candidates: [...boundaryCandidate, ...[goal, ...tied].map(goalCandidateOf)],
      },
    };
  }

  if (ownSynonym && boundary !== undefined && goal !== undefined) {
    const output: SuggestEroOutput = {
      goal: input.goal,
      matched: { goal: goal.goal, keyword: goal.keyword, lingvo: goal.lingvo },
      suggestion: { ero: goal.ero, props: goal.props },
      boundary: {
        ero: boundary.ero,
        case: boundary.case,
        action: boundary.action,
        kialo: boundary.kialo,
      },
    };
    if (goal.kialo !== undefined) output.kialo = goal.kialo;
    if (goal.regulo !== undefined) output.regulo = goal.regulo;
    return { ok: true, output };
  }

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

  // Spec 011 ② (plan ② D-10): an Ero's own use-instead outranks its own goal. "Ein zweiter Button
  // ‚Wirklich löschen?'" hits the butono's goal destructive (löschen) and the butono's alternative
  // confirm (wirklich, zweiten), which sends to the dialogo: the Uzo of the butono says "not me,
  // there" for this case, and that is the answer — the alternative's Ero, with the butono's kialo.
  // Only an instead entry redirects a whole goal; an own boundary (a case, "Übersicht speichern":
  // navigation beside save) and two different Eroj stay a conflict (below), as does an own entry
  // that asks a person.
  if (
    boundary !== undefined &&
    goal !== undefined &&
    boundary.ero === goal.ero &&
    boundary.kind === "instead" &&
    boundary.action === "use-instead"
  ) {
    const instead = insteadEro(modelo, boundary);
    if (instead !== undefined) {
      return {
        ok: true,
        output: {
          goal: input.goal,
          matched: { goal: boundary.case, keyword: boundary.keyword, lingvo: boundary.lingvo },
          suggestion: { ero: instead, props: {} },
          boundary: {
            ero: boundary.ero,
            case: boundary.case,
            action: boundary.action,
            kialo: boundary.kialo,
          },
        },
      };
    }
  }

  // Nachlese 4 N-4 (F-2): a goal word weighs more than a boundary word of another Ero. Where the
  // goal hits at least as many keywords as the foreign boundary, that is no tie: the goal answers,
  // as if no boundary had hit ("Mach diesen Text fett, das ist die Überschrift des Abschnitts":
  // überschrift of the titolo against fett of the tekstareo). A boundary that hits more words
  // than the goal still leaves the choice to a person (OP-12, below), and so does an alternative
  // (instead) of another Ero: it names an Ero of its own, which is a reading, not a limit (plan
  // D-04). An own entry of the goal's Ero keeps its way (Spec 011 ② D-10, Nachlese 3 D-02).
  const goalOutweighs =
    boundary !== undefined &&
    goal !== undefined &&
    boundary.kind === "boundary" &&
    boundary.ero !== goal.ero &&
    goalStrength(modelo, goal.ero, input.goal, pass) >=
      uzoStrength(boundaryKeywords(modelo, boundary), input.goal, pass);

  if (boundary !== undefined && goal !== undefined && !goalOutweighs) {
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

  if (boundary !== undefined && !goalOutweighs) {
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
