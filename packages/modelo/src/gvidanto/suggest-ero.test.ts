// suggest_ero (Spec 003 T023, FR-13, D-16 §2): a goal in a word to an Ero with its props. The
// parameter is `goal` since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { suggestEro } from "./suggest-ero.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");

const suggest = (goal: string, lingvo?: "en" | "de") => {
  const result = suggestEro(modelo, lingvo === undefined ? { goal } : { goal, lingvo });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("suggest_ero", () => {
  it("suggests the destructive button for Löschen, delete and Entfernen!", () => {
    for (const text of ["Löschen", "delete", "Entfernen!"]) {
      const output = suggest(text);
      expect(output.goal).toBe(text);
      expect(output.matched?.goal).toBe("destructive");
      expect(output.suggestion).toEqual({
        ero: "butono",
        props: { emphasis: "high", intent: "danger" },
      });
      expect(output.regulo?.name).toBe("destructive-not-primary-color");
      expect(output.kialo).toBe(output.regulo?.kialo);
    }
  });

  it("suggests low emphasis for Abbrechen and high for Speichern", () => {
    expect(suggest("Abbrechen").suggestion).toEqual({
      ero: "butono",
      props: { emphasis: "low" },
    });
    const confirm = suggest("Speichern");
    expect(confirm.matched?.goal).toBe("confirm");
    expect(confirm.suggestion).toEqual({ ero: "butono", props: { emphasis: "high" } });
    expect(confirm.regulo?.name).toBe("one-primary-per-container");
  });

  it("names the keyword and its language", () => {
    expect(suggest("Bitte alles löschen").matched).toEqual({
      goal: "destructive",
      keyword: "löschen",
      lingvo: "de",
    });
    expect(suggest("Delete this row").matched?.lingvo).toBe("en");
  });

  it("takes only the given language when lingvo is set", () => {
    expect(suggest("delete", "en").matched?.lingvo).toBe("en");
    const german = suggestEro(modelo, { goal: "delete", lingvo: "de" });
    expect(german.ok).toBe(false);
    if (german.ok) return;
    expect(german.issues.map((issue) => issue.rule)).toEqual(["goal-unknown"]);
  });

  it("answers an unknown goal with goal-unknown, the known goals and 'ask a person'", () => {
    const result = suggestEro(modelo, { goal: "hüpfen" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.rule)).toEqual(["goal-unknown"]);
    expect(result.issues[0]?.path).toBe("suggest_ero/goal");
    expect(result.allowed).toEqual(["destructive", "confirm", "dismiss"]);
    // Spec 007 (OP-6, D-06): the system says it does not cover the goal; a person decides.
    expect(result.issues[0]?.suggestion).toBe(
      "Fundamento does not cover this goal. Ask a person; do not build a replacement.",
    );
  });

  it("is deterministic: the same input gives the same output", () => {
    expect(suggest("Löschen")).toEqual(suggest("Löschen"));
  });
});

// Spec 007 T023 (A2, A3, A9, D-06, contracts/mcp-tools §2): suggest_ero knows the boundaries and
// alternatives of the Uzo. Keywords hold no prepositions (OP-12); a Uzo keyword of six letters or
// more also hits the end of a compound word (N-1: "Projektübersicht" hits "übersicht").
describe("suggest_ero with the Uzo (T023)", () => {
  const butonoUzo = modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
  const navigation = butonoUzo?.boundary.find((entry) => entry.case === "navigation");

  it.each(["Zur Übersicht", "zur Projektübersicht"])(
    "%s is navigation: ask-human with the kialo of the Uzo, no suggestion (S1)",
    (text) => {
      const answer = suggest(text);
      expect(answer.suggestion).toBeNull();
      expect(answer.boundary).toEqual({
        ero: "butono",
        case: "navigation",
        action: "ask-human",
        kialo: navigation?.kialo,
      });
      expect(answer.matched).toEqual({ goal: "navigation", keyword: "übersicht", lingvo: "de" });
      expect(answer.action).toBeUndefined();
      expect(answer.candidates).toBeUndefined();
    },
  );

  it("'Zum Warenkorb hinzufügen' does not end as navigation (OP-12)", () => {
    const result = suggestEro(modelo, { goal: "Zum Warenkorb hinzufügen" });
    if (result.ok) {
      expect(result.output.boundary?.case).not.toBe("navigation");
      expect(result.output.candidates ?? []).not.toContainEqual(
        expect.objectContaining({ case: "navigation" }),
      );
    } else {
      expect(result.issues.map((issue) => issue.rule)).toEqual(["goal-unknown"]);
    }
  });

  it("'Weiter zur Kasse' is the goal confirm, no boundary", () => {
    const answer = suggest("Weiter zur Kasse");
    expect(answer.matched?.goal).toBe("confirm");
    expect(answer.suggestion).toEqual({ ero: "butono", props: { emphasis: "high" } });
    expect(answer.boundary).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
  });

  it("'Übersicht speichern' hits a boundary and a goal: ask-human with both candidates", () => {
    const answer = suggest("Übersicht speichern");
    expect(answer.action).toBe("ask-human");
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toBeUndefined();
    expect(answer.candidates).toEqual([
      {
        kind: "boundary",
        ero: "butono",
        case: "navigation",
        action: "ask-human",
        kialo: navigation?.kialo,
        keyword: "übersicht",
      },
      {
        kind: "goal",
        ero: "butono",
        goal: "confirm",
        props: { emphasis: "high" },
        keyword: "speichern",
        kialo: expect.any(String),
        regulo: expect.objectContaining({ name: "one-primary-per-container" }),
      },
    ]);
  });

  it("'umschalten' is an alternative Fundamento does not cover yet: ask-human, ero null", () => {
    const answer = suggest("umschalten");
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "toggle",
      action: "ask-human",
      kialo: butonoUzo?.instead.find((entry) => entry.goal === "toggle")?.kialo,
    });
    expect(answer.matched).toEqual({ goal: "toggle", keyword: "umschalten", lingvo: "de" });
  });

  it("'Löschen' is unchanged: the destructive goal with its Regulo", () => {
    const answer = suggest("Löschen");
    expect(answer.matched?.goal).toBe("destructive");
    expect(answer.suggestion).toEqual({
      ero: "butono",
      props: { emphasis: "high", intent: "danger" },
    });
    expect(answer.boundary).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
  });

  it("takes only the given language for Uzo keywords too", () => {
    expect(suggest("overview", "en").matched?.lingvo).toBe("en");
    const german = suggestEro(modelo, { goal: "overview", lingvo: "de" });
    expect(german.ok).toBe(false);
  });

  // D-06, OP-12: prepositions and all-purpose verbs are no keywords ("zur", "zum", "go", "open").
  it("no Uzo keyword is a preposition or an all-purpose verb (data test)", () => {
    const EXCLUDED: Record<string, string[]> = {
      de: [
        "zu",
        "zur",
        "zum",
        "nach",
        "auf",
        "in",
        "im",
        "an",
        "am",
        "für",
        "von",
        "vom",
        "mit",
        "bei",
        "gehe",
        "gehen",
        "öffne",
        "öffnen",
      ],
      en: ["to", "into", "onto", "on", "at", "for", "of", "from", "with", "by", "go", "open"],
    };
    const offending: string[] = [];
    for (const entry of modelo.eroj) {
      const lists = [
        ...(entry.uzo?.instead ?? []).map((item) => item.keywords),
        ...(entry.uzo?.boundary ?? []).map((item) => item.keywords ?? {}),
      ];
      for (const keywords of lists) {
        for (const [lingvo, words] of Object.entries(keywords)) {
          for (const word of words) {
            if ((EXCLUDED[lingvo] ?? []).includes(word.toLowerCase()))
              offending.push(`${lingvo}:${word}`);
          }
        }
      }
    }
    expect(offending).toEqual([]);
  });
});
