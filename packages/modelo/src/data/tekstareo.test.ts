// The tekstareo data (Spec 011 ②; G1–G7, section ②, plan ② D-01–D-05): the text area in the repo
// Modelo — the field of the kampo (its parts and bindings copied, Regel 0.1), without a height of
// its own (the rows carry it), with kind text or code (the code typography), form-associated like
// the kampo. Its Uzo sends one line to the kampo, asks a person about an area that grows and a
// character count, stops at rich text. Seven Reguloj of the kampo are widened to it (E5). The
// cross-link of G5: the kampo's multi-line is the tekstareo's now (use-instead, closes Spec 009).

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

// Spec 025 ①: the step buttons and the clear button are the kampo's own (kind number, search).
const KAMPO_OWN = ["decrement", "increment", "clear"];

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const tekstareo = eroNamed("tekstareo");
const kampo = eroNamed("kampo");
const skemo = tekstareo?.skemo;
const uzo = tekstareo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

const WIDENED = [
  "field-label-visible",
  "field-label-names-the-datum",
  "help-is-one-sentence",
  "error-says-what-to-do",
  "error-not-color-only",
  "required-marked",
  "placeholder-not-label",
];

describe("tekstareo in the repo Modelo (section ②)", () => {
  it("lives in data/eroj/tekstareo/skemo.json, last of nine Eroj, and the repo Modelo stays valid", () => {
    expect(tekstareo?.file).toBe("modelo/data/eroj/tekstareo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "alsxutilo",
      "apartigilo",
      "atributlisto",
      "avataro",
      "avizo",
      "butono",
      "datelektilo",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "glitilo",
      "ikono",
      "insigno",
      "kampo",
      "karto",
      "kodbloko",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "listelektilo",
      "lokredaktilo",
      "markdovido",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "plurelektilo",
      "saltligilo",
      "signeto",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has kind (text, code), value, rows (4), placeholder, required, disabled, readonly, invalid, size and name; no label prop", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["kind", ["text", "code"], "text"],
        ["value", "string", undefined],
        ["rows", "number", 4],
        ["placeholder", "string", undefined],
        ["required", "boolean", false],
        ["disabled", "boolean", false],
        ["loading", "boolean", false],
        ["readonly", "boolean", false],
        ["invalid", "boolean", false],
        ["size", ["small", "medium", "large"], "medium"],
        ["name", "string", undefined],
      ],
    );
    expect(skemo?.props.map((prop) => prop.name)).not.toContain("label");
  });

  it("knows the states rest, hover, focus, disabled and invalid (G2); readonly is a prop the platform speaks, no state of its own", () => {
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "help", text: true },
      { name: "error", text: true },
    ]);
  });

  it("names the parts of the kampo without a height of its own, and copies the kampo's bindings (Regel 0.1)", () => {
    if (skemo === undefined || kampo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(
      Object.keys(kampo.skemo.parts)
        .filter((part) => !KAMPO_OWN.includes(part))
        .sort(),
    );
    expect(skemo.parts.box?.height).toBeUndefined();
    expect(kampo.skemo.parts.box?.height).toBeDefined();
    // Every binding of the kampo that is not the readonly state's, not the height and not the
    // typography of the text stands in the tekstareo word for word.
    const copied = kampo.skemo.bindings.filter(
      (binding) =>
        !KAMPO_OWN.includes(binding.part) &&
        binding.when?.state !== "readonly" &&
        !(binding.part === "box" && binding.property === "height") &&
        !(binding.part === "text" && binding.property === "typography"),
    );
    for (const binding of copied) expect(skemo.bindings).toContainEqual(binding);
    for (const [part, properties] of Object.entries(kampo.skemo.parts)) {
      if (KAMPO_OWN.includes(part)) continue;
      for (const [property, source] of Object.entries(properties)) {
        if (part === "box" && property === "height") continue;
        if (part === "text" && property === "typography") continue;
        expect(skemo.parts[part]?.[property as "color"], `${part}.${property}`).toEqual(source);
      }
    }
  });

  it("types the text by kind and size: body for text, the code typography for code (section ②)", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(skemo.parts.text?.typography).toEqual({ by: ["kind", "size"] });
    const typography = (kind: string, size: string) =>
      boundToken(skemo, "text", "typography", { kind, size })?.token;
    expect(typography("text", "small")).toBe("typography.body.2");
    expect(typography("text", "medium")).toBe("typography.body.1");
    expect(typography("text", "large")).toBe("typography.body.1");
    for (const size of ["small", "medium", "large"]) {
      expect(typography("code", size)).toBe("typography.code");
    }
    // kind keys a part now: it is an axis of the variants, with size (2 × 3 × 5 = 30).
    expect(styledProps(skemo)).toEqual(["kind", "size"]);
    expect(variantKeys(skemo)).toEqual(["kind", "size", "state"]);
    expect(combinationsOf(skemo, ["kind", "size", "state"])).toHaveLength(30);
  });

  it("speaks role textbox like the kampo: name, description, states, required in de and en; no key of its own", () => {
    expect(skemo?.a11y).toEqual({
      role: "textbox",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        loading: ["aria-busy"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
      },
      keys: [],
      texts: {
        required: { de: "erforderlich", en: "required" },
        loading: { de: "lädt", en: "loading" },
      },
    });
  });

  it("forbids an error text without invalid and disabled with readonly, like the kampo", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    expect(forbiddenBy(skemo, { disabled: "true", readonly: "true" })).toBeDefined();
  });

  it("knows the goal multi-line with the words of the spec, no all-purpose verb", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["multi-line", {}, "field-label-visible"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["comment", "description", "reason", "paragraph", "multiline"],
      de: ["kommentar", "beschreibung", "begründung", "absatz", "mehrzeilig"],
    });
  });
});

describe("the Uzo of the tekstareo (section ②, G5)", () => {
  it("states the purpose of the spec, requires the label, takes its width from the container and never wraps its label", () => {
    expect(uzo?.purpose).toBe(
      "Takes text that runs over several lines from a person: a comment, a description, a reason.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      help: { accepts: ["text"], max: 1, nesting: 0 },
      error: { accepts: ["text"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
  });

  it("sends one line to the kampo; asks a person about auto-grow and a character count; stops at rich text", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["one-line", "kampo"]]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["auto-grow", "ask-human"],
      ["character-count", "ask-human"],
      ["rich-text", "not-supported"],
      ["no-visible-label", "not-supported"],
    ]);
    expect(uzo?.boundary.find((entry) => entry.case === "no-visible-label")?.via).toEqual({
      regulo: "field-label-visible",
    });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a form and a dialog, with the kampo and the butono, never in a slot of the butono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual(["form", "dialog"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
  });

  it("carries the three text rules of the kampo's field: datum, error (fixed), help", () => {
    expect(
      uzo?.content.map((entry) => [
        entry.regulo,
        entry.fixed,
        entry.of ?? "slot:label",
        entry.check.kind,
      ]),
    ).toEqual([
      ["field-label-names-the-datum", false, "slot:label", "not-words"],
      ["error-says-what-to-do", true, "slot:error", "min-words"],
      ["help-is-one-sentence", false, "slot:help", "max-sentences"],
    ]);
  });

  it("the brief names the purpose, kind and size, the label as a duty, and stays under 750", () => {
    if (tekstareo === undefined) throw new Error("tekstareo missing");
    const brief = briefOf(tekstareo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["kind", "size"]);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the tekstareo (G6, E5)", () => {
  it.each(WIDENED)("%s is widened to the tekstareo, not duplicated", (name) => {
    const regulo = named(name);
    expect(regulo?.appliesTo?.eroj).toContain("tekstareo");
    expect(regulo?.appliesTo?.eroj).toContain("kampo");
    expect(modelo.reguloj.filter((candidate) => candidate.name.includes("textarea"))).toEqual([]);
    expect(modelo.reguloj.filter((candidate) => candidate.name.includes("tekstareo"))).toEqual([]);
  });

  it("spacing-owned-by-container applies to the tekstareo and the dialogo too", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toEqual([
      "butono",
      "ligilo",
      "kampo",
      "sxaltilo",
      "markobutono",
      "elekto",
      "elektilo",
      "tekstareo",
      "dialogo",
      "insigno",
      "avizo",
      "plenstato",
      "tabelo",
      "atributlisto",
      "mezurilo",
      "navigado",
      "langetaro",
      "ikono",
      "apartigilo",
      "saltligilo",
      "titolo",
      "teksto",
      "konsileto",
      "sxvebilo",
      "menuo",
      "faldilo",
      "kompletigilo",
      "pagxigilo",
      "spuro",
      "alsxutilo",
      "karto",
      "avataro",
      "kodbloko",
      "markdovido",
      "glitilo",
      "datelektilo",
      "signeto",
      "listelektilo",
      "plurelektilo",
      "lokredaktilo",
    ]);
  });

  it.each(["field-label-names-the-datum", "error-says-what-to-do", "help-is-one-sentence"])(
    "%s has an approved and a rejected example of the tekstareo in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === tekstareo?.ero.id,
      );
      expect(
        examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo]),
      ).toEqual([
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ]);
      for (const jugxo of examples) {
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        const rules = result.violations.map((violation) => violation.issue.rule);
        expect(rules, jugxo.id).toEqual(jugxo.decision === "rejected" ? [name] : []);
      }
    },
  );

  it("judges instances through the same enforcers as the kampo", () => {
    for (const name of [
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "help-is-one-sentence",
    ]) {
      expect(USAGE_ENFORCERS[name]).toBeDefined();
    }
  });
});

describe("check_usage and suggest_ero of the text area (G6, G7, Gvidanto)", () => {
  const judge = (instance: Record<string, unknown>) =>
    evaluateUsage(modelo, [{ ero: "tekstareo", props: {}, ...instance }]);

  it("a reason with a label, help of one sentence and an error that says what to do passes", () => {
    const right = judge({
      label: "Begründung",
      props: { rows: 3, required: true },
      texts: { help: "Die Prüfer lesen die Begründung." },
    });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
  });

  it("an empty label violates field-label-visible; 'Begründung eingeben' the datum rule; an error without invalid the constraint", () => {
    expect(rulesOf(judge({ label: "" }))).toEqual([["field-label-visible", "error"]]);
    expect(rulesOf(judge({ label: "Begründung eingeben" }))).toEqual([
      ["field-label-names-the-datum", "error"],
    ]);
    expect(
      rulesOf(judge({ label: "Begründung", texts: { error: "Gib eine Begründung ein" } })),
    ).toEqual([["ero-prop-constraint", "error"]]);
    expect(
      rulesOf(
        judge({ label: "Begründung", props: { invalid: true }, texts: { error: "Zu kurz" } }),
      ),
    ).toEqual([["error-says-what-to-do", "error"]]);
  });

  it("'Kommentarfeld für eine Begründung' is the tekstareo, with the kampo's multi-line beside it (the dialog of the spec)", () => {
    const answer = suggest("Kommentarfeld für eine Begründung");
    expect(answer.suggestion).toEqual({ ero: "tekstareo", props: {} });
    expect(answer.matched?.goal).toBe("multi-line");
    // The kampo sends several lines here (use-instead, G5): its kialo stands beside the answer
    // only as a boundary; an instead entry of another Ero confirms and stays out (Spec 008 D-08).
    const multiLine = kampo?.uzo?.instead.find((entry) => entry.goal === "multi-line");
    expect(multiLine?.ero).toBe("tekstareo");
    expect(multiLine?.kialo).not.toMatch(/no such Ero yet/);
  });

  it("'Kommentar, mehrere Absätze' is the tekstareo too; 'Eingabe mit fetter Formatierung' stops at rich-text", () => {
    expect(suggest("Kommentar, mehrere Absätze").suggestion).toEqual({
      ero: "tekstareo",
      props: {},
    });
    expect(suggest("Eingabe mit fetter Formatierung").boundary).toMatchObject({
      ero: "tekstareo",
      case: "rich-text",
      action: "not-supported",
    });
    expect(suggest("Feld mit Zeichenlimit").boundary).toMatchObject({
      ero: "tekstareo",
      case: "character-count",
      action: "ask-human",
    });
  });
});
