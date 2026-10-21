// suggest_ero (Spec 003, FR-13, plan D-16 §2; Spec 007, A9, D-06, contracts/mcp-tools §2): from a
// goal in a word to the Ero and the props it asks for, with the Regulo behind the choice — or to
// the boundary or alternative of a Uzo, with its kialo and action. Deterministic and without a
// model: the first Skemo goal (declaration order) one of whose keywords is a word of the input
// wins (D-16); the first instead or boundary entry of a Uzo whose keyword hits wins likewise. When
// both hit, Fundamento picks no reading: it answers ask-human with both candidates (OP-12); so
// does it when the goals of two Eroj hit alike (Nachlese 3 G2). Pure.
// The goal is called goal since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import type { ValidationIssue } from "../contracts/issues.js";
import type {
  Keywords,
  LoadedSxablono,
  Modelo,
  SxablonoGoal,
  UzoBoundary,
} from "../contracts/modelo.js";
import {
  COMPOUND_SUFFIX_MIN,
  flatKeyword,
  goalMatchOf,
  goalOf,
  keywordHitOf,
  keywordHits,
  keywordTextOf,
} from "../eroj/usage.js";
import { type Lingvo, reguloIn, traduko } from "../lingvo/tradukoj.js";
import { type ReguloRef, reguloRef } from "./eroj.js";

/** The props a goal asks for, typed as an EroInstance takes them (R-9): never "true" as a text. */
export type GoalProps = Record<string, string | number | boolean>;

export interface SuggestEroInput {
  goal: string;
  /**
   * Only the keywords of this language count; without it, every language does. With "de" the
   * kialoj and Reguloj of the answer are German too (Nachlese 8 ③).
   */
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
  /**
   * An Ero with its props, or a Sxablono (Spec 020, G3) — a pattern of Eroj, answered with its
   * regions beside it.
   */
  suggestion:
    | { ero: string; sxablono?: never; props: GoalProps }
    | { sxablono: string; ero?: never; props: GoalProps }
    | null;
  /** The regions of the suggested Sxablono (Spec 020, G3): what stands where. */
  regions?: SuggestedRegion[];
  /** What its goal names per region (Spec 020 ②: the password field and the submit button). */
  children?: { region: string; ero: string; props?: Record<string, string | boolean> }[];
  kialo?: string;
  regulo?: ReguloRef;
  /** The boundary or alternative that answers (Spec 007); absent when a Skemo goal answers. */
  boundary?: SuggestedBoundary;
  /** `ask-human` when a boundary and a goal both hit: a person decides between the candidates. */
  action?: "ask-human";
  candidates?: SuggestCandidate[];
}

/** A region of a suggested Sxablono, as the answer names it (Spec 020, G3). */
export interface SuggestedRegion {
  name: string;
  required?: boolean;
  accepts?: string[];
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

/**
 * The first instead or boundary entry of any Uzo whose keyword hits (declaration order) — of those
 * `keep` keeps (Nachlese 5 N5-2: an entry of another Ero in the attribute part of the text drops
 * out; `keep` sees the entry with its keywords).
 */
function boundaryHit(
  modelo: Modelo,
  text: string,
  pass: Pass,
  keep: (hit: BoundaryHit, keywords: Keywords | undefined) => boolean = () => true,
): BoundaryHit | undefined {
  for (const entry of modelo.eroj) {
    const uzo = entry.uzo;
    if (uzo === undefined) continue;
    for (const alternative of uzo.instead) {
      const hit = uzoKeywordHit(alternative.keywords, text, pass.lingvo, pass.inflect);
      if (hit === undefined) continue;
      const found: BoundaryHit = {
        ero: entry.ero.name,
        case: alternative.goal,
        action: alternative.ero === null ? "ask-human" : "use-instead",
        kialo: alternative.kialo,
        kind: "instead",
        ...hit,
      };
      if (keep(found, alternative.keywords)) return found;
    }
    for (const boundary of uzo.boundary) {
      const hit = uzoKeywordHit(boundary.keywords, text, pass.lingvo, pass.inflect);
      if (hit === undefined) continue;
      const found: BoundaryHit = {
        ero: entry.ero.name,
        case: boundary.case,
        action: boundary.action,
        kialo: boundary.kialo,
        ...hit,
        kind: "boundary",
      };
      if (keep(found, boundary.keywords)) return found;
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

/**
 * The first Skemo goal of any Ero whose keyword is a word of the text; with `only`, the goal of
 * that Ero (Nachlese 5 N5-2: the Ero of the head word).
 */
function goalHit(modelo: Modelo, text: string, pass: Pass, only?: string): GoalHit | undefined {
  for (const entry of modelo.eroj) {
    if (only !== undefined && entry.ero.name !== only) continue;
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
        const form = keywordHitOf(keyword, language, prepared, goalMatchOf(pass.inflect));
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

/**
 * The words that open the attribute part of a request (Nachlese 5 N5-2), per language: what
 * follows them says what the thing has, is for or is about — not what it is.
 */
export const LINKING_WORDS: Readonly<Record<string, readonly string[]>> = {
  de: ["mit", "für", "von", "über", "zu"],
  en: ["with", "for", "of", "about"],
};

/**
 * The head of a request (N5-2): its text before the first linking word of the languages the input
 * allows — "Karte" in "Karte für ein Projekt mit Bild und Titel". Undefined without a linking word
 * or without a word before it.
 */
export function headOf(text: string, lingvo?: string): string | undefined {
  const linking = new Set(
    Object.entries(LINKING_WORDS)
      .filter(([language]) => lingvo === undefined || language === lingvo)
      .flatMap(([, words]) => words),
  );
  const normalized = text.normalize("NFC");
  let before = 0;
  for (const match of normalized.matchAll(/[\p{L}\p{N}]+/gu)) {
    if (linking.has(match[0].toLowerCase())) {
      return before === 0 ? undefined : normalized.slice(0, match.index);
    }
    before += 1;
  }
  return undefined;
}

/** The one Ero whose goal the head names (N5-2); none where no Ero or several do. */
function headEroOf(modelo: Modelo, head: string, pass: Pass): string | undefined {
  const named = modelo.eroj.filter((entry) => goalOf(entry.skemo, head, pass) !== undefined);
  return named.length === 1 ? named[0]?.ero.name : undefined;
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

/**
 * The Sxablono goal a text hits, the longest keyword winning (as `goalOf` for an Ero's goals):
 * Spec 020, G3.
 */
function sxablonoGoalOf(
  entry: LoadedSxablono,
  text: string,
  pass: Pass,
): { goal: SxablonoGoal; keyword: string; lingvo: string } | undefined {
  const prepared = keywordTextOf(text);
  const match = goalMatchOf(pass.inflect);
  let best: { goal: SxablonoGoal; keyword: string; lingvo: string } | undefined;
  for (const goal of entry.skemo.goals ?? []) {
    for (const [lingvo, keywords] of Object.entries(goal.keywords)) {
      if (pass.lingvo !== undefined && lingvo !== pass.lingvo) continue;
      for (const keyword of keywords) {
        if (!keywordHits(keyword, lingvo, prepared, match)) continue;
        if (best === undefined || flatKeyword(keyword).length > flatKeyword(best.keyword).length)
          best = { goal, keyword, lingvo };
      }
    }
  }
  return best;
}

/** The regions of a Sxablono as an answer names them (Spec 020, G3). */
function regionsOf(entry: LoadedSxablono): SuggestedRegion[] {
  return entry.skemo.regions.map((region) => ({
    name: region.name,
    ...(region.required === true ? { required: true } : {}),
    ...(region.accepts === undefined ? {} : { accepts: [...region.accepts] }),
  }));
}

/** The articles a request may begin with before the thing it names (Spec 020 ②). */
const ARTICLES: ReadonlySet<string> = new Set([
  "ein",
  "eine",
  "einen",
  "einem",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "a",
  "an",
  "the",
]);

/**
 * The first word of a request after an article: the thing it names (Spec 020 ②). Before it,
 * the words that only open a request are skipped (Nachlese 8 ①, D-11: „Ich brauche ein
 * Formular …“, „Bitte …“, „I need …“) — the fillers of the Modelo (data/gvidanto.json) of the
 * languages the input allows, the longest first, as often as one follows another.
 */
function leadWordOf(modelo: Modelo, text: string, lingvo?: string): string | undefined {
  const words = [...text.normalize("NFC").matchAll(/[\p{L}\p{N}-]+/gu)].map((match) => match[0]);
  const fillers = Object.entries(modelo.gvidanto?.fillers ?? {})
    .filter(([language]) => lingvo === undefined || language === lingvo)
    .flatMap(([, list]) =>
      list.map((filler) => filler.normalize("NFC").toLowerCase().split(/\s+/u)),
    )
    .sort((a, b) => b.length - a.length);
  let start = 0;
  for (let skipped = true; skipped; ) {
    skipped = false;
    for (const filler of fillers) {
      if (filler.every((word, index) => words[start + index]?.toLowerCase() === word)) {
        start += filler.length;
        skipped = true;
        break;
      }
    }
  }
  for (const word of words.slice(start)) {
    if (!ARTICLES.has(word.toLowerCase())) return word;
  }
  return undefined;
}

/**
 * The answer with a Sxablono whose goal `lead` hits (Spec 020, G3). Of its goals the one the
 * whole text hits with the longest keyword answers — the sign-in form before the form — else the
 * goal of the lead. A boundary of the Sxablono the text hits speaks instead (a form over several
 * steps asks a person).
 */
function sxablonoAnswer(
  modelo: Modelo,
  lead: string,
  goalText: string,
  pass: Pass,
): SuggestEroOutput | undefined {
  for (const entry of modelo.sxablonoj ?? []) {
    const hit = sxablonoGoalOf(entry, lead, pass);
    if (hit === undefined) continue;
    return sxablonoOutput(entry, sxablonoGoalOf(entry, goalText, pass) ?? hit, goalText, pass);
  }
  return undefined;
}

/** The answer for a Sxablono and its goal, or its boundary where the text hits one. */
function sxablonoOutput(
  entry: LoadedSxablono,
  hit: { goal: SxablonoGoal; keyword: string; lingvo: string },
  goalText: string,
  pass: Pass,
): SuggestEroOutput {
  for (const boundary of entry.uzo?.boundary ?? []) {
    const word = uzoKeywordHit(boundary.keywords, goalText, pass.lingvo, pass.inflect);
    if (word === undefined) continue;
    return {
      goal: goalText,
      matched: { goal: boundary.case, keyword: word.keyword, lingvo: word.lingvo },
      suggestion:
        boundary.action === "use-instead" && boundary.ero !== undefined
          ? { ero: boundary.ero, props: {} }
          : null,
      boundary: {
        ero: entry.sxablono.name,
        case: boundary.case,
        action: boundary.action,
        kialo: boundary.kialo,
      },
    };
  }
  return {
    goal: goalText,
    matched: { goal: hit.goal.goal, keyword: hit.keyword, lingvo: hit.lingvo },
    suggestion: { sxablono: entry.sxablono.name, props: { ...hit.goal.props } },
    regions: regionsOf(entry),
    ...(hit.goal.children === undefined ? {} : { children: structuredClone(hit.goal.children) }),
    kialo: hit.goal.kialo,
  };
}

/**
 * The answer of suggest_ero (Spec 003, FR-14), with the Sxablonoj of Spec 020 (G3): a request
 * whose head — the text before its first linking word — names the goal of a Sxablono is answered
 * with the Sxablono ("Seitenkopf mit Titel, …" is the pagxo, whatever its attribute part names); a
 * Sxablono goal anywhere else in the text answers only where no Ero and no Uzo entry does, so
 * every answer that stood stays (OP-12). An answer that names a Sxablono (a boundary that sends
 * to one) carries it as such, with its regions.
 */
export function suggestEro(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  const result = suggestEroIn(modelo, input);
  if (!result.ok || input.lingvo !== "de") return result;
  return { ok: true, output: answerIn(modelo, result.output, input.lingvo) };
}

/**
 * The kialo of a boundary or alternative in the language asked for (Nachlese 8 ③): the text of
 * the Uzo of the Ero or Sxablono under its ID — an alternative where its goal and kialo are the
 * ones of the answer, else the boundary of that case.
 */
function boundaryIn<T extends SuggestedBoundary>(modelo: Modelo, boundary: T, lingvo: Lingvo): T {
  const uzo =
    modelo.eroj.find((entry) => entry.ero.name === boundary.ero)?.uzo ??
    (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === boundary.ero)?.uzo;
  if (uzo === undefined) return boundary;
  const instead = uzo.instead.some(
    (item) => item.goal === boundary.case && item.kialo === boundary.kialo,
  );
  const path = `${instead ? "instead" : "boundary"}/${boundary.case}/kialo`;
  return { ...boundary, kialo: traduko(modelo, lingvo, `${uzo.id}/${path}`, boundary.kialo) };
}

/**
 * The answer with its texts in the language asked for (Nachlese 8 ③): the kialo of the boundary
 * and of every candidate, and a Regulo with its statement and kialo — a kialo that is the
 * Regulo's in its translation. Names, cases and keywords stay as they are.
 */
function answerIn(modelo: Modelo, output: SuggestEroOutput, lingvo: Lingvo): SuggestEroOutput {
  const reguloOf = <T extends { kialo?: string; regulo?: ReguloRef }>(item: T): T => {
    if (item.regulo === undefined) return item;
    const regulo = reguloIn(modelo, item.regulo, lingvo);
    return {
      ...item,
      regulo,
      ...(item.kialo === item.regulo.kialo ? { kialo: regulo.kialo } : {}),
    };
  };
  return reguloOf({
    ...output,
    ...(output.boundary === undefined
      ? {}
      : { boundary: boundaryIn(modelo, output.boundary, lingvo) }),
    ...(output.candidates === undefined
      ? {}
      : {
          candidates: output.candidates.map((candidate) =>
            candidate.kind === "boundary"
              ? boundaryIn(modelo, candidate, lingvo)
              : reguloOf(candidate),
          ),
        }),
  });
}

function suggestEroIn(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  const pass = { ...(input.lingvo === undefined ? {} : { lingvo: input.lingvo }), inflect: false };
  // Spec 020 ②: the first word of the request (after an article), not the whole head — „Tabs, um
  // zwischen Liste und Formular zu wechseln“ names tabs, whatever its head holds.
  const lead = leadWordOf(modelo, input.goal, input.lingvo);
  if (lead !== undefined) {
    const answer = sxablonoAnswer(modelo, lead, input.goal, pass);
    if (answer !== undefined) return { ok: true, output: answer };
  }
  const result = suggestEroOf(modelo, input);
  if (!result.ok) {
    for (const inflect of [false, true]) {
      const answer = sxablonoAnswer(modelo, input.goal, input.goal, { ...pass, inflect });
      if (answer !== undefined) return { ok: true, output: answer };
    }
    return result;
  }
  const suggestion = result.output.suggestion;
  const named =
    suggestion?.ero === undefined
      ? undefined
      : (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === suggestion.ero);
  if (named === undefined || suggestion === null) return result;
  // A boundary of the Sxablono the text hits speaks first (Spec 020 ②: „Assistent“ reaches the
  // formularo through the dialogo's long form; the formularo's boundary wizard asks a person).
  for (const inflect of [false, true]) {
    for (const boundary of named.uzo?.boundary ?? []) {
      const word = uzoKeywordHit(boundary.keywords, input.goal, input.lingvo, inflect);
      if (word === undefined) continue;
      return {
        ok: true,
        output: {
          goal: input.goal,
          matched: { goal: boundary.case, keyword: word.keyword, lingvo: word.lingvo },
          suggestion: null,
          boundary: {
            ero: named.sxablono.name,
            case: boundary.case,
            action: boundary.action,
            kialo: boundary.kialo,
          },
        },
      };
    }
  }
  return {
    ok: true,
    output: {
      ...result.output,
      suggestion: { sxablono: named.sxablono.name, props: suggestion.props },
      regions: regionsOf(named),
    },
  };
}

function suggestEroOf(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
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

  // Nachlese 5 N5-2 (Messung A15): the head word wins. Where the text before the first linking
  // word (mit, für, von, über, zu; with, for, of, about) names the goal of exactly one Ero, that Ero
  // is what the request asks for, and the rest says what it has: "Karte für ein Projekt mit Bild
  // und Titel" is the karto, the titel of its attribute part names neither the titolo nor the
  // teksto's boundary heading. The head's Ero answers with its goal read over the whole text (the
  // longest keyword, as before); a goal of another Ero after the linking word forms no tie, and a
  // Uzo entry of another Ero after it drops out — unless it names the head's Ero as the one to use
  // (Spec 008 D-08). The head's own Uzo entries and every entry hit in the head keep their say.
  const head = headOf(input.goal, pass.lingvo);
  const headEro = head === undefined ? undefined : headEroOf(modelo, head, pass);
  if (head !== undefined && headEro !== undefined) {
    goal = goalHit(modelo, input.goal, pass, headEro);
    boundary = boundaryHit(
      modelo,
      input.goal,
      pass,
      (hit, keywords) =>
        hit.ero === headEro ||
        insteadEro(modelo, hit) === headEro ||
        uzoKeywordHit(keywords, head, pass.lingvo, pass.inflect) !== undefined,
    );
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
    goal === undefined || ownRedirect || ownSynonym || headEro !== undefined
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
