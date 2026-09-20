// suggest_ero (Spec 003, FR-13, plan D-16 §2): from a word of intent to the Ero and the props it
// asks for, with the Regulo behind the choice. Deterministic and without a model: the first Skemo
// intent (declaration order) one of whose keywords is a word of the input wins (D-16). Pure.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { intentOf } from "../eroj/usage.js";
import { type ReguloRef, reguloRef } from "./eroj.js";

export interface SuggestEroInput {
  intent: string;
  /** Only the keywords of this language count; without it, every language does. */
  lingvo?: string;
}

export interface SuggestEroOutput {
  /** The input, unchanged: the answer says what it answers. */
  intent: string;
  matched: { intent: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  kialo?: string;
  regulo?: ReguloRef;
}

export type SuggestEroResult =
  | { ok: true; output: SuggestEroOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

/** Every intent any Ero knows, in declaration order, without duplicates. */
export function knownIntents(modelo: Modelo): string[] {
  const names: string[] = [];
  for (const entry of modelo.eroj) {
    for (const intent of entry.skemo.intents ?? []) {
      if (!names.includes(intent.intent)) names.push(intent.intent);
    }
  }
  return names;
}

export function suggestEro(modelo: Modelo, input: SuggestEroInput): SuggestEroResult {
  for (const entry of modelo.eroj) {
    const match = intentOf(
      entry.skemo,
      input.intent,
      input.lingvo === undefined ? {} : { lingvo: input.lingvo },
    );
    if (match === undefined) continue;
    const regulo =
      match.intent.regulo === undefined
        ? undefined
        : modelo.reguloj.find((candidate) => candidate.name === match.intent.regulo);
    const output: SuggestEroOutput = {
      intent: input.intent,
      matched: { intent: match.intent.intent, keyword: match.keyword, lingvo: match.lingvo },
      suggestion: {
        ero: entry.ero.name,
        props: Object.fromEntries(
          Object.entries(match.intent.props).map(([key, value]) => [key, String(value)]),
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
        rule: "intent-unknown",
        severity: "error",
        path: "suggest_ero/intent",
        message: `No Ero knows an intent for "${input.intent}"${input.lingvo === undefined ? "" : ` in ${input.lingvo}`}.`,
        suggestion: "Use one of the known intents in allowed, or describe the action in one word.",
      },
    ],
    allowed: knownIntents(modelo),
  };
}
