// suggest_ero (Spec 003, FR-13, plan D-16 §2): from a goal in a word to the Ero and the props it
// asks for, with the Regulo behind the choice. Deterministic and without a model: the first Skemo
// goal (declaration order) one of whose keywords is a word of the input wins (D-16). Pure. The
// goal is called goal since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { goalOf } from "../eroj/usage.js";
import { type ReguloRef, reguloRef } from "./eroj.js";

export interface SuggestEroInput {
  goal: string;
  /** Only the keywords of this language count; without it, every language does. */
  lingvo?: string;
}

export interface SuggestEroOutput {
  /** The input, unchanged: the answer says what it answers. */
  goal: string;
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  kialo?: string;
  regulo?: ReguloRef;
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

export function suggestEro(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  for (const entry of modelo.eroj) {
    const match = goalOf(
      entry.skemo,
      input.goal,
      input.lingvo === undefined ? {} : { lingvo: input.lingvo },
    );
    if (match === undefined) continue;
    const regulo =
      match.goal.regulo === undefined
        ? undefined
        : modelo.reguloj.find((candidate) => candidate.name === match.goal.regulo);
    const output: SuggestEroOutput = {
      goal: input.goal,
      matched: { goal: match.goal.goal, keyword: match.keyword, lingvo: match.lingvo },
      suggestion: {
        ero: entry.ero.name,
        props: Object.fromEntries(
          Object.entries(match.goal.props).map(([key, value]) => [key, String(value)]),
        ),
      },
    };
    if (regulo !== undefined) {
      output.kialo = regulo.kialo;
      output.regulo = reguloRef(regulo);
    }
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
        suggestion: "Use one of the known goals in allowed, or describe the goal in one word.",
      },
    ],
    allowed: knownGoals(modelo),
  };
}
