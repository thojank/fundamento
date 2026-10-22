// suggest_ero (Spec 003 T023, FR-13, D-16 §2): a goal in a word to an Ero with its props. The
// parameter is `goal` since F1-T00 (Spec 007, OP-4): `intent` is the name of a prop.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { suggestEro, uzoKeywordHit } from "./suggest-ero.js";

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
      "upload",
      "separate",
      "details",
      "avatar",
      "notify",
      "report-error",
      "destructive",
      "confirm",
      "dismiss",
      // Spec 025 ②: the datelektilo.
      "pick-date",
      "date-range",
      "ask-reason",
      "choose-many",
      "choose-few",
      "disclosure",
      // Spec 025 ①: the glitilo.
      "slide",
      "value-range",
      "show-icon",
      "status-label",
      "enter-text",
      "email",
      "password",
      "number",
      "date",
      // Spec 025 ①: the kampo's counter and time.
      "count",
      "time",
      "card",
      "command",
      "code-block",
      "suggest",
      "tooltip",
      "switch-view",
      "navigate",
      "external",
      "markdown",
      "agree",
      "opt-in",
      "action-menu",
      "meter",
      "navigate-app",
      "paginate",
      "loading",
      "empty",
      "skip-to-content",
      "breadcrumb",
      "toggle",
      "popover",
      "table",
      "multi-line",
      "running-text",
      "section-heading",
      "page-title",
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
      // Nachlese 3 G2: "Übersicht" is the ligilo's goal navigate too, hit as strongly as the
      // butono's confirm — the tie names the ligilo among the candidates.
      {
        kind: "goal",
        ero: "ligilo",
        goal: "navigate",
        props: {},
        keyword: "übersicht",
        kialo: expect.any(String),
        regulo: expect.objectContaining({ name: "link-navigates-button-acts" }),
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

// Spec 015 ③ (E6, plan ③ D-12): a word an Ero names both in its own boundary and in one of its own
// goals is a synonym with a boundary — the goal answers, the boundary stands beside it, and no tie
// with another Ero's goal is formed. Today only the avizo's toast and snackbar are such words, so
// every other answer stays as it was.
describe("suggest_ero: an own boundary that is a synonym of an own goal (Spec 015 ③)", () => {
  it("the avizo's toast and snackbar are the only words in an Ero's boundary and its own goal", () => {
    const shared: string[] = [];
    for (const entry of modelo.eroj) {
      const goalWords = new Set(
        (entry.skemo.goals ?? []).flatMap((goal) =>
          Object.values(goal.keywords).flatMap((words) => words.map((word) => word.toLowerCase())),
        ),
      );
      for (const boundary of entry.uzo?.boundary ?? []) {
        for (const words of Object.values(boundary.keywords ?? {})) {
          for (const word of words) {
            if (goalWords.has(word.toLowerCase()))
              shared.push(`${entry.ero.name}.${boundary.case}:${word}`);
          }
        }
      }
    }
    expect([...new Set(shared)].sort()).toEqual(["avizo.toast:snackbar", "avizo.toast:toast"]);
  });

  it("'Toast nach dem Speichern' is the avizo with its boundary, not a tie with the butono's 'Speichern'", () => {
    const answer = suggest("Toast nach dem Speichern");
    expect(answer.action).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
    expect(answer.suggestion).toEqual({ ero: "avizo", props: {} });
    expect(answer.boundary).toMatchObject({ ero: "avizo", case: "toast", action: "not-supported" });
    // A word of the boundary alone that is no goal word keeps the boundary's own answer.
    expect(suggest("Einblendung").suggestion).toBeNull();
    expect(suggest("Einblendung").boundary).toMatchObject({ ero: "avizo", case: "toast" });
  });
});

// Nachlese 4 (Briefing 2026-10-18, Messung Spec 014 A3/A4/A8): keywords compared without hyphens
// (N-1, O-18), German endings of a word in the text (N-2, F-3), the menuo for actions in every
// table row (N-3, F-1), and a goal against the boundary of another Ero (N-4, F-2).
describe("suggest_ero: Nachlese 4 – hyphens, endings, row actions, goal over a foreign boundary", () => {
  it.each(["running text", "running-text", "runningtext", "Running-Text below the picture"])(
    "N-1: '%s' hits the keyword running-text of the teksto",
    (text) => {
      const answer = suggest(text, "en");
      expect(answer.suggestion?.ero).toBe("teksto");
      expect(answer.matched).toEqual({
        goal: "running-text",
        keyword: "running-text",
        lingvo: "en",
      });
    },
  );

  it("N-1: a hyphenated keyword of a Uzo hits its words apart and written together", () => {
    for (const text of ["a call to action", "Call-to-Action", "calltoaction"]) {
      expect(uzoKeywordHit({ en: ["call-to-action"] }, text), text).toEqual({
        keyword: "call-to-action",
        lingvo: "en",
      });
    }
    // Two words never hit a keyword written as one (the way of Nachlese 3, Abweichung 1).
    expect(uzoKeywordHit({ en: ["calltoaction"] }, "call to action")).toBeUndefined();
  });

  it("N-2 (F-3): 'Feld mit Vorschlägen beim Tippen' is the kompletigilo – vorschlägen is vorschläge with -n", () => {
    const answer = suggest("Feld mit Vorschlägen beim Tippen", "de");
    expect(answer.suggestion?.ero).toBe("kompletigilo");
    expect(answer.matched).toEqual({ goal: "suggest", keyword: "vorschläge", lingvo: "de" });
  });

  it("N-2: a word of the text with an ending hits the keyword without it; the bare stem does not", () => {
    expect(suggest("Hinweise zum Speicherplatz", "de").suggestion?.ero).toBe("avizo");
    // 'nichts' is a keyword; 'nicht' carries no ending and stays no word of the plenstato.
    expect(suggestEro(modelo, { goal: "nicht", lingvo: "de" }).ok).toBe(false);
    // English keywords are compared as written: no German endings for them.
    expect(suggestEro(modelo, { goal: "suggestion", lingvo: "en" }).ok).toBe(false);
  });

  it("N-3 (F-1): a delete icon in every table row names the menuo among the candidates", () => {
    const answer = suggest(
      "Ich brauche ein Mülleimer-Icon zum Löschen in jeder Tabellenzeile",
      "de",
    );
    expect(answer.action).toBe("ask-human");
    expect(answer.candidates).toContainEqual(
      expect.objectContaining({
        kind: "goal",
        ero: "menuo",
        goal: "action-menu",
        keyword: "tabellenzeile",
      }),
    );
    // Actions in a table row lead to the menuo on their own.
    expect(suggest("Aktionen in jeder Tabellenzeile", "de").suggestion?.ero).toBe("menuo");
  });

  it("N-4 (F-2): the goal word überschrift outweighs the boundary word fett of the tekstareo", () => {
    const answer = suggest("Mach diesen Text fett, das ist die Überschrift des Abschnitts", "de");
    expect(answer.action).toBeUndefined();
    expect(answer.suggestion).toEqual({ ero: "titolo", props: { level: "2" } });
    expect(answer.matched).toEqual({
      goal: "section-heading",
      keyword: "überschrift",
      lingvo: "de",
    });
    expect(answer.regulo?.name).toBe("heading-levels-in-order");
  });

  it("N-4: a foreign boundary that hits more words than the goal still asks a person", () => {
    const answer = suggest("Fett und Formatierung in der Überschrift", "de");
    expect(answer.action).toBe("ask-human");
    expect(answer.candidates?.[0]).toEqual(
      expect.objectContaining({ kind: "boundary", ero: "tekstareo", case: "rich-text" }),
    );
  });
});

// Nachlese 5 (Briefing 2026-10-19, Messung A15/A16): the head word of the request outweighs a word
// of its attribute part (N5-2), and a goal keyword of six letters or more ends a German compound
// in the second pass (O-17) – with the false friends whose ending only looks like a keyword.
describe("suggest_ero: Nachlese 5 – the head word wins (N5-2), compounds (O-17)", () => {
  it.each([undefined, "de"] as const)(
    "N5-2 (A15): 'Karte für ein Projekt mit Bild und Titel' is the karto (lingvo %s)",
    (lingvo) => {
      const answer = suggest("Karte für ein Projekt mit Bild und Titel", lingvo);
      expect(answer.action).toBeUndefined();
      expect(answer.candidates).toBeUndefined();
      expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
      expect(answer.matched).toEqual({ goal: "card", keyword: "karte", lingvo: "de" });
      expect(answer.regulo?.name).toBe("one-primary-per-container");
      // The boundary heading of the teksto (titel) stood in the attribute part: it is gone.
      expect(answer.boundary).toBeUndefined();
    },
  );

  it("N5-2: in English the head word before with/for/of/about wins too", () => {
    const answer = suggest("Card for a project with image and title", "en");
    expect(answer.action).toBeUndefined();
    expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
    expect(answer.matched).toEqual({ goal: "card", keyword: "card", lingvo: "en" });
  });

  it("N5-2: two Eroj in the head, no linking word, or nothing before it – a person still decides", () => {
    for (const text of [
      "Karte und Titel für ein Projekt",
      "Karte, Bild und Titel",
      "Mit Bild und Titel: eine Karte",
    ]) {
      const answer = suggest(text, "de");
      expect(answer.action, text).toBe("ask-human");
      expect(
        answer.candidates
          ?.filter((candidate) => candidate.kind === "goal")
          .map((candidate) => candidate.ero),
        text,
      ).toEqual(["karto", "titolo"]);
    }
  });

  it("N5-2: an entry of the head's own Uzo in the attribute part keeps its say (card-grid)", () => {
    const answer = suggest("Karten für Projekte im Raster", "de");
    expect(answer.action).toBe("ask-human");
    expect(answer.candidates?.[0]).toMatchObject({
      kind: "boundary",
      ero: "karto",
      case: "card-grid",
    });
    expect(answer.candidates?.[1]).toMatchObject({ kind: "goal", ero: "karto", goal: "card" });
  });

  it("N5-2: the head picks the Ero, its goal is read over the whole text (E-Mail-Adresse stays email)", () => {
    const answer = suggest("Feld für die E-Mail-Adresse", "de");
    expect(answer.suggestion?.ero).toBe("kampo");
    expect(answer.matched?.goal).toBe("email");
  });

  it.each([undefined, "de"] as const)(
    "O-17 (A16): 'Projektkarten' is the karto – karten ends the compound (lingvo %s)",
    (lingvo) => {
      const answer = suggest("Projektkarten", lingvo);
      expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
      expect(answer.matched).toEqual({ goal: "card", keyword: "karten", lingvo: "de" });
    },
  );

  it("O-17: 'Projektkarten mit Bild' and 'Kontaktkacheln' are the karto", () => {
    expect(suggest("Projektkarten mit Bild", "de").suggestion?.ero).toBe("karto");
    expect(suggest("Kontaktkacheln", "de").suggestion?.ero).toBe("karto");
  });

  it("O-17: false friends – an ending that only looks like a keyword names no other Ero", () => {
    const unknown = (text: string) => suggestEro(modelo, { goal: text, lingvo: "de" }).ok === false;
    // A keyword of its own as a whole word hits in the first pass: the tabs, not the card.
    expect(suggest("Registerkarten", "de").suggestion?.ero).toBe("langetaro");
    expect(suggest("Registerkarten", "de").action).toBeUndefined();
    // A word that hits as written keeps the first pass: running text, not a picture.
    expect(suggest("Fließtext unter dem Bild", "de").suggestion?.ero).toBe("teksto");
    // liste and menü have fewer than six letters: no compound ends with them.
    expect(unknown("Einkaufsliste")).toBe(true);
    expect(unknown("Speisemenü")).toBe(true);
    expect(suggest("Kontextmenü", "de").suggestion?.ero).toBe("menuo");
    // Feld is no keyword: a playing field is no input.
    expect(unknown("Spielfeld")).toBe(true);
    // A verb prefix is no first part of a compound (fewer than four letters): bemerken, anmerken
    // and vormerken are no merken, abwarten is no warten.
    for (const text of ["Bemerken", "Anmerken", "Vormerken", "Abwarten"]) {
      expect(unknown(text), text).toBe(true);
    }
  });

  it("O-17: the false friends the rule cannot tell apart (B-4) – pinned, so a change shows", () => {
    // A map and a ticket are no card of the screen; a bull's eye is no search hit. Their first
    // part is a word of four letters or more, as in Projektkarten.
    expect(suggest("Landkarten", "de").suggestion?.ero).toBe("karto");
    expect(suggest("Eintrittskarten", "de").suggestion?.ero).toBe("karto");
    expect(suggest("Volltreffer", "de").suggestion?.ero).toBe("plenstato");
  });

  // Nachlese 6 N6-4: the false friends of the compounds, checked as pins. They hit through the
  // plural keyword "karten" (six letters, the compound rule of Nachlese 5); the singular stays
  // unknown. No Spec dialog names one of them, so no keyword gets an exclusion (Spec 019 ④).
  it("N6-4: the plurals of -karten compounds hit karto, their singulars nothing – pinned", () => {
    const unknown = (text: string) => suggestEro(modelo, { goal: text, lingvo: "de" }).ok === false;
    for (const text of [
      "Landkarten",
      "Eintrittskarten",
      "Speisekarten",
      "Fahrkarten",
      "Postkarten",
      "Visitenkarten",
      "Kreditkarten",
      "Weltkarten",
      "Landkarten mit Filialen",
      "Eintrittskarten für das Konzert",
    ]) {
      expect(suggest(text, "de").suggestion?.ero, text).toBe("karto");
    }
    for (const text of ["Landkarte", "Eintrittskarte", "Speisekarte", "Fahrkarte", "Postkarte"]) {
      expect(unknown(text), text).toBe(true);
    }
    // The cards of a screen keep their answer.
    expect(suggest("Projektkarten mit Bild", "de").suggestion?.ero).toBe("karto");
  });

  it("O-17: only the second pass reads compounds – a text that hits as written keeps its answer", () => {
    const grid = suggest("Projektkarten im Raster", "de");
    expect(grid.suggestion).toBeNull();
    expect(grid.boundary).toMatchObject({ ero: "karto", case: "card-grid", action: "ask-human" });
  });
});
