// Spec 038 MG-6 (1.6; D-33): suggest_ero without a hit names, on input `nearest: true`, the nearest
// goals of the Eroj with their keywords, so an agent finds the Ero it did not name. Without
// `nearest` a miss answers as before (guarded byte by byte in packages/mcp/src/kontrakto-038.test.ts);
// a hit never carries `nearest`. The existing suggest-ero.test.ts stays as it is.

import { describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { flatKeyword } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import * as suggestModule from "./suggest-ero.js";
import { suggestEro } from "./suggest-ero.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;

type Nearest = { celo: string; ero: string; keywords: string[] };
type Answer = Record<string, unknown>;

/** suggest_ero with the input as given, the answer as plain JSON. */
function suggest(input: Record<string, unknown>): Answer {
  return JSON.parse(JSON.stringify(suggestEro(modelo, input as never))) as Answer;
}

/** The bound of the list, exported beside the function (not typed here). */
const bound = (): number => (suggestModule as Record<string, unknown>).NEAREST_GOALS as number;

/** The goals of an Ero of the Modelo. */
const goalsOf = (ero: string) =>
  modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo.goals ?? [];

/** The keywords of a goal as nearest names them: every language in order, or the one given. */
function keywordsOf(ero: string, celo: string, lingvo?: string): string[] {
  const goal = goalsOf(ero).find((each) => each.goal === celo);
  const lists = Object.entries(goal?.keywords ?? {})
    .filter(([language]) => lingvo === undefined || language === lingvo)
    .flatMap(([, keywords]) => keywords);
  return [...new Set(lists)];
}

/** Levenshtein distance, the test's own (an oracle independent of nearest.ts). */
function edits(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        (row[j] ?? 0) + 1,
        (next[j - 1] ?? 0) + 1,
        (row[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[b.length] ?? 0;
}

/** Texts no goal of the Modelo answers (checked in the test, not assumed). */
const MISSES = ["hüpfen", "Detailansicht", "Steckbrief", "Projektdaten", "Kopfbereich"];

describe("suggest_ero with nearest (Spec 038 MG-6)", () => {
  it("answers a miss without nearest exactly as before", () => {
    for (const goal of MISSES) {
      const plain = suggest({ goal });
      expect(plain.ok).toBe(false);
      expect(Object.keys(plain)).toEqual(["ok", "issues", "allowed"]);
      expect((plain.issues as Answer[]).map((issue) => [issue.rule, issue.path])).toEqual([
        ["goal-unknown", "suggest_ero/goal"],
      ]);
      // nearest: false is no request either.
      expect(JSON.stringify(suggest({ goal, nearest: false }))).toBe(JSON.stringify(plain));
    }
  });

  it("adds nearest after issues and allowed on a miss with nearest: true, the rest unchanged", () => {
    for (const goal of MISSES) {
      const plain = suggest({ goal });
      const answer = suggest({ goal, nearest: true });
      expect(Object.keys(answer)).toEqual(["ok", "issues", "allowed", "nearest"]);
      const { nearest: _nearest, ...rest } = answer;
      expect(JSON.stringify(rest)).toBe(JSON.stringify(plain));
    }
  });

  it("names goals of the Ero it names, with their keywords, bounded and without repetition", () => {
    expect(bound()).toBeGreaterThan(0);
    const violations: string[] = [];
    for (const goal of MISSES) {
      const nearest = suggest({ goal, nearest: true }).nearest as Nearest[];
      if (nearest.length === 0 || nearest.length > bound())
        violations.push(`${goal}: ${nearest.length} entries`);
      const pairs = nearest.map((item) => `${item.ero}/${item.celo}`);
      if (new Set(pairs).size !== pairs.length) violations.push(`${goal}: repeated ${pairs}`);
      for (const item of nearest) {
        const at = `${goal} → ${item.ero}/${item.celo}`;
        if (JSON.stringify(Object.keys(item)) !== JSON.stringify(["celo", "ero", "keywords"]))
          violations.push(`${at}: keys ${Object.keys(item).join(",")}`);
        if (!goalsOf(item.ero).some((each) => each.goal === item.celo))
          violations.push(`${at}: no goal of that Ero`);
        if (JSON.stringify(item.keywords) !== JSON.stringify(keywordsOf(item.ero, item.celo)))
          violations.push(`${at}: keywords ${item.keywords}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("takes the keywords of the language asked for", () => {
    const violations: string[] = [];
    for (const lingvo of ["de", "en"]) {
      for (const goal of MISSES) {
        const answer = suggest({ goal, lingvo, nearest: true });
        if (answer.ok !== false) continue;
        for (const item of answer.nearest as Nearest[]) {
          const expected = keywordsOf(item.ero, item.celo, lingvo);
          if (expected.length === 0 || JSON.stringify(item.keywords) !== JSON.stringify(expected))
            violations.push(`${lingvo} ${goal} → ${item.ero}/${item.celo}: ${item.keywords}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("ranks first a goal one edit away from a mistyped keyword", () => {
    // Every keyword of six letters or more, its last letter doubled: one edit away from it. The
    // first entry then holds a name (goal or keyword) one edit away too – the keyword or a twin.
    const violations: string[] = [];
    let checked = 0;
    for (const entry of modelo.eroj) {
      for (const goal of entry.skemo.goals ?? []) {
        for (const keyword of Object.values(goal.keywords).flat()) {
          if (!/^\p{L}{6,}$/u.test(keyword)) continue;
          const typo = `${keyword}${keyword.at(-1)}`;
          const answer = suggest({ goal: typo, nearest: true });
          if (answer.ok !== false) continue;
          checked += 1;
          const first = (answer.nearest as Nearest[] | undefined)?.[0];
          const names = first === undefined ? [] : [first.celo, ...first.keywords].map(flatKeyword);
          if (!names.some((name) => edits(flatKeyword(typo), name) <= 1))
            violations.push(`${typo}: ${first?.ero}/${first?.celo}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });

  it("finds the attribute list for a detail view it did not name (Spec 038, MG-6)", () => {
    const answer = suggest({ goal: "Detailansicht", nearest: true });
    expect(answer.ok).toBe(false);
    const [first] = answer.nearest as Nearest[];
    const owner = modelo.eroj.find((entry) =>
      (entry.skemo.goals ?? []).some((goal) => goal.goal === first?.celo),
    );
    expect(first?.ero).toBe(owner?.ero.name);
    expect(first?.keywords.map(flatKeyword).some((keyword) => keyword.startsWith("detail"))).toBe(
      true,
    );
  });

  it("answers the same twice", () => {
    for (const goal of MISSES) {
      expect(JSON.stringify(suggest({ goal, nearest: true }))).toBe(
        JSON.stringify(suggest({ goal, nearest: true })),
      );
    }
  });

  it("names nothing near a text without a word", () => {
    const answer = suggest({ goal: "!!!", nearest: true });
    expect(answer.ok).toBe(false);
    expect(answer.nearest).toEqual([]);
  });

  it("leaves every hit unchanged with nearest: true", () => {
    // The first keyword of every goal, in every language: whatever it answers, nearest changes nothing.
    const violations: string[] = [];
    let hits = 0;
    for (const entry of modelo.eroj) {
      for (const goal of entry.skemo.goals ?? []) {
        for (const [lingvo, keywords] of Object.entries(goal.keywords)) {
          const text = keywords[0];
          if (text === undefined) continue;
          for (const input of [{ goal: text }, { goal: text, lingvo }]) {
            const plain = suggest(input);
            if (plain.ok !== true) continue;
            hits += 1;
            const asked = suggest({ ...input, nearest: true });
            if (JSON.stringify(asked) !== JSON.stringify(plain))
              violations.push(`${JSON.stringify(input)}: differs`);
          }
        }
      }
    }
    expect(hits).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });
});
