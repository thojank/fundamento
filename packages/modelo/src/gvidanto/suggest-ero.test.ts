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
    // Every goal of every Ero, in Ero order (Spec 008: navigate and external of the ligilo).
    expect(result.allowed).toEqual([
      "destructive",
      "confirm",
      "dismiss",
      "choose-many",
      "choose-few",
      "enter-text",
      "email",
      "password",
      "number",
      "date",
      "navigate",
      "external",
      "agree",
      "opt-in",
      "toggle",
    ]);
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

  // Spec 008 S1, D-08: the boundary navigation of the butono says use-instead ligilo; the answer
  // is the ligilo with the kialo of the boundary, no ask-human. "Zur Übersicht" also hits the goal
  // navigate of the ligilo (whole word); both say ligilo, so the goal answers and the boundary
  // stands next to it. "zur Projektübersicht" hits the boundary alone (compound word, N-1).
  it.each(["Zur Übersicht", "zur Projektübersicht"])(
    "%s is navigation: the ligilo with the kialo of the butono's boundary, no ask-human (S1)",
    (text) => {
      const answer = suggest(text);
      expect(answer.suggestion).toEqual({ ero: "ligilo", props: {} });
      expect(answer.boundary).toEqual({
        ero: "butono",
        case: "navigation",
        action: "use-instead",
        kialo: navigation?.kialo,
      });
      expect(navigation?.kialo).toMatch(/Fundamento covers it with ligilo\.$/);
      expect(answer.matched?.keyword).toBe("übersicht");
      expect(answer.matched?.lingvo).toBe("de");
      expect(answer.action).toBeUndefined();
      expect(answer.candidates).toBeUndefined();
    },
  );

  it("'Zur Übersicht' names the goal navigate with its Regulo; the compound word the boundary alone", () => {
    expect(suggest("Zur Übersicht").matched?.goal).toBe("navigate");
    expect(suggest("Zur Übersicht").regulo?.name).toBe("link-navigates-button-acts");
    expect(suggest("zur Projektübersicht").matched?.goal).toBe("navigation");
  });

  // R-9 (Abnahme Spec 008, A6, 2026-10-13): a boolean prop of the goal stays a boolean in the
  // answer; "true" as a text is not a value an EroInstance takes.
  it("'Dokumentation' is the goal external of the ligilo: external true, as a boolean (Spec 008 A1, R-9)", () => {
    const answer = suggest("Dokumentation");
    expect(answer.suggestion).toEqual({ ero: "ligilo", props: { external: true } });
    expect(answer.regulo?.name).toBe("external-link-marked");
  });

  it("'Speichern' as a link is the butono: the instead entry action of the ligilo confirms it", () => {
    const answer = suggest("Speichern");
    expect(answer.suggestion).toEqual({ ero: "butono", props: { emphasis: "high" } });
    expect(answer.boundary).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
  });

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
        // Spec 008 A4: the boundary says use-instead ligilo; next to the goal confirm of the
        // butono the two readings still differ (ligilo against butono), so a person decides.
        action: "use-instead",
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

  // Spec 010 ① (G5): the butono's alternative toggle says use-instead sxaltilo, and the sxaltilo
  // has the goal toggle; both say sxaltilo, so the goal answers (Spec 008 D-08) and an instead
  // entry of the other Ero only confirms the choice (it stays out of the answer, OP-12).
  it("'umschalten' is the sxaltilo since Spec 010 ①: the goal toggle answers, no ask-human", () => {
    const answer = suggest("umschalten");
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.boundary).toBeUndefined();
    expect(answer.action).toBeUndefined();
    expect(answer.matched).toEqual({ goal: "toggle", keyword: "umschalten", lingvo: "de" });
    expect(butonoUzo?.instead.find((entry) => entry.goal === "toggle")?.ero).toBe("sxaltilo");
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

// R-11 (Abnahme Spec 009, A11, 2026-10-13): "E-Mail-Adresse" fell apart into e, mail, adresse;
// mail hit the goal email, adresse the goal enter-text, and the first goal in declaration order
// won. Now a hyphenated compound is checked as its parts and as one word, and the longest keyword
// that hits wins; a tie keeps the declaration order.
describe("suggest_ero: the longest keyword wins, hyphenated compounds count as one word (R-11)", () => {
  it.each(["Feld für die E-Mail-Adresse", "E-Mail-Adresse", "e-mail-adresse eingeben"])(
    "%s is the kampo with kind email",
    (text) => {
      const answer = suggest(text);
      expect(answer.suggestion).toEqual({ ero: "kampo", props: { kind: "email" } });
      expect(answer.matched).toEqual({ goal: "email", keyword: "mailadresse", lingvo: "de" });
    },
  );

  it("'Adresse' alone stays enter-text, 'E-Mail' alone stays email by the word mail", () => {
    expect(suggest("Adresse").matched?.goal).toBe("enter-text");
    // mail stands in en and de; a tie keeps the order of the Skemo, en first — as before.
    expect(suggest("E-Mail").matched).toEqual({ goal: "email", keyword: "mail", lingvo: "en" });
    expect(suggest("Name").suggestion).toEqual({ ero: "kampo", props: {} });
  });

  it("a hyphenated compound does not hit a keyword that is only a part of it", () => {
    // "mailadresse" (11 letters) ends "emailadresse"; "adresse" hits the part, not the whole.
    const answer = suggest("E-Mail-Adresse");
    expect(answer.matched?.keyword).not.toBe("adresse");
  });

  it("the declaration order still decides a tie (Übersicht speichern: butono first)", () => {
    const answer = suggest("Übersicht speichern");
    expect(answer.candidates?.[1]).toEqual(
      expect.objectContaining({ kind: "goal", ero: "butono", goal: "confirm" }),
    );
  });
});
