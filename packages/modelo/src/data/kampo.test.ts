// The kampo data (Spec 009 T004; A1–A4, plan D-01–D-07): the first composite Ero in the repo
// Modelo, bound only to role tokens, its Uzo with the label as a required slot, eight Reguloj with
// a kialo, examples right and wrong for every text rule, and the slot constraint.

import { describe, expect, it } from "vitest";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, slotStates, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const kampo = modelo.eroj.find((entry) => entry.ero.name === "kampo");
if (kampo === undefined) throw new Error("kampo missing");
const { skemo, uzo } = kampo;

const TEXT_REGULOJ = [
  "field-label-names-the-datum",
  "error-says-what-to-do",
  "help-is-one-sentence",
  "placeholder-is-example",
];
const INSTANCE_REGULOJ = ["field-label-visible", "placeholder-not-label"];
const SKEMO_REGULOJ = ["required-marked", "error-not-color-only"];

describe("kampo in the repo Modelo (T004)", () => {
  it("lives in data/eroj/kampo/skemo.json, between elekto and ligilo, and the repo Modelo stays valid", () => {
    expect(kampo.file).toBe("modelo/data/eroj/kampo/skemo.json");
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
      // Spec 025 ①: the glitilo.
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

  it("has the props, states and slots of A1: kind not type, no label prop, three text slots (E2, E7)", () => {
    // Spec 011 ① (E8): kind takes password, number (whole numbers) and date (the platform's
    // dialog); min and max bound a number or a date; autocomplete names what the platform fills in.
    expect(skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual([
      // Spec 025 ①: time is the platform's own time input; stepper and step belong to a number.
      [
        "kind",
        ["text", "email", "tel", "url", "search", "password", "number", "date", "time"],
        "text",
      ],
      ["value", "string", undefined],
      ["placeholder", "string", undefined],
      ["required", "boolean", false],
      ["disabled", "boolean", false],
      ["readonly", "boolean", false],
      ["invalid", "boolean", false],
      ["size", ["small", "medium", "large"], "medium"],
      ["name", "string", undefined],
      ["min", "string", undefined],
      ["max", "string", undefined],
      ["autocomplete", "string", undefined],
      ["stepper", "boolean", false],
      ["step", "string", undefined],
      ["loading", "boolean", false],
      ["clearable", "boolean", false],
      // Spec 029 ②b-1b (Nachlese 12): the visible label as an attribute.
      ["label", "string", undefined],
    ]);
    // Spec 029 ②b-1b (Nachlese 12): label is a prop now, shown as the visible label.
    expect(skemo.props.find((prop) => prop.name === "label")?.shown).toBe(true);
    expect(skemo.props.map((prop) => prop.name)).not.toContain("type");
    expect(skemo.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
    expect(skemo.slots.map((slot) => [slot.name, slot.text])).toEqual([
      ["label", true],
      ["help", true],
      ["error", true],
      // Spec 029 ②b-1 M-1: the reason for disabled.
      ["disabled-reason", true],
    ]);
  });

  it("binds only role tokens, never palette steps, and names its parts without web words (D-03)", () => {
    const tokens = [
      ...skemo.bindings.map((binding) => binding.token),
      ...Object.values(skemo.parts).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(tokens.length).toBeGreaterThan(25);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "border",
      "box",
      // Spec 025 ①: the clear button of a search, the step buttons of a number (composed butono).
      "clear",
      "decrement",
      "error",
      "focus-ring",
      "help",
      "increment",
      "label",
      "motion",
      "placeholder",
      "required-mark",
      "spinner",
      "surface",
      "text",
    ]);
  });

  it("colours border and surface by state as A1 says; large takes spacing.medium (E4)", () => {
    const border = (state: string) => boundToken(skemo, "border", "color", { state })?.token;
    expect(border("rest")).toBe("color.border.default");
    expect(border("hover")).toBe("color.border.strong");
    expect(border("focus")).toBe("color.border.strong");
    expect(border("disabled")).toBe("color.border.disabled");
    expect(border("readonly")).toBe("color.border.default");
    expect(border("invalid")).toBe("color.status.danger.border");
    const fill = (state: string) => boundToken(skemo, "surface", "fill", { state })?.token;
    expect(fill("rest")).toBe("color.background.default");
    expect(fill("invalid")).toBe("color.background.default");
    expect(fill("disabled")).toBe("color.background.sunken");
    expect(fill("readonly")).toBe("color.background.sunken");
    expect(boundToken(skemo, "box", "inline-padding", { size: "large" })?.token).toBe(
      "spacing.medium",
    );
    expect(boundToken(skemo, "box", "height", { size: "small" })?.token).toBe("size.control.small");
    expect(combinationsOf(skemo, ["size", "state"])).toHaveLength(18);
  });

  it("speaks role textbox: name from the label, description from help then error, the states, required in de and en (D-02)", () => {
    expect(skemo.a11y.role).toBe("textbox");
    expect(skemo.a11y.name).toEqual(["slot:label", "prop:label"]);
    expect(skemo.a11y.description).toEqual(["slot:help", "slot:error", "slot:disabled-reason"]);
    expect(skemo.a11y.states).toEqual({
      loading: ["aria-busy"],
      required: ["aria-required"],
      invalid: ["aria-invalid"],
      disabled: ["aria-disabled"],
      readonly: ["aria-readonly"],
    });
    // Spec 025 ①: the words of the step buttons and the clear button (<part>-name).
    expect(skemo.a11y.texts).toEqual({
      required: { de: "erforderlich", en: "required" },
      loading: { de: "lädt", en: "loading" },
      "decrement-name": { de: "Verringern", en: "Decrease" },
      "increment-name": { de: "Erhöhen", en: "Increase" },
      // Spec 029 ②b-1 M-6: named after the field's label, as every clear button.
      "clear-name": { de: "{label} leeren", en: "Clear {label}" },
    });
    // Spec 011 ① (O-7): Enter in the one-line field sends the form, so the Skemo names the key.
    // Spec 025 ①: the arrows step a number, Escape clears a search.
    expect(skemo.a11y.keys).toEqual(["Enter", "ArrowUp", "ArrowDown", "Escape"]);
  });

  // Spec 011 ① (E8): a bound needs a scale — min and max belong to a number or a date; the
  // constraint reads the string props as filled or empty, like a slot (plan ① D-08).
  it("forbids min and max on a kind without a scale: text, email, tel, url, search, password", () => {
    for (const prop of ["min", "max"]) {
      expect(forbiddenBy(skemo, { [`prop:${prop}`]: "filled", kind: "text" })).toBeDefined();
      expect(forbiddenBy(skemo, { [`prop:${prop}`]: "filled", kind: "password" })).toBeDefined();
      expect(forbiddenBy(skemo, { [`prop:${prop}`]: "filled", kind: "number" })).toBeUndefined();
      expect(forbiddenBy(skemo, { [`prop:${prop}`]: "filled", kind: "date" })).toBeUndefined();
      expect(forbiddenBy(skemo, { [`prop:${prop}`]: "empty", kind: "text" })).toBeUndefined();
    }
    const result = evaluateUsage(modelo, [
      { ero: "kampo", props: { kind: "email", min: "3" }, label: "E-Mail" },
    ]);
    expect(result.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    expect(result.violations[0]?.issue.message).toContain("prop:min=filled");
    expect(
      evaluateUsage(modelo, [
        // Spec 025 ①: a bound is stated in the help (range-stated).
        {
          ero: "kampo",
          props: { kind: "number", min: "1", max: "99" },
          label: "Vorrang",
          texts: { help: "Zwischen 1 und 99." },
        },
      ]).violations,
    ).toEqual([]);
  });

  it("forbids an error text without invalid and disabled with readonly (D-04)", () => {
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    expect(forbiddenBy(skemo, { "slot:error": "empty", invalid: "false" })).toBeUndefined();
    expect(forbiddenBy(skemo, { disabled: "true", readonly: "true" })).toBeDefined();
    expect(forbiddenBy(skemo, { disabled: "true", readonly: "false" })).toBeUndefined();
    expect(
      slotStates(skemo, { ero: "kampo", props: {}, label: "E-Mail", texts: { error: "x" } }),
    ).toEqual({
      "slot:label": "filled",
      "slot:help": "empty",
      "slot:error": "filled",
      "slot:disabled-reason": "empty",
    });
    const result = evaluateUsage(modelo, [
      { ero: "kampo", props: {}, label: "E-Mail", texts: { error: "Gib eine Adresse mit @ ein" } },
    ]);
    expect(result.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
  });

  it("knows the goals enter-text, email, password, number and date without all-purpose verbs (OP-12)", () => {
    // Spec 011 ① (E8, Gvidanto „Passwortfeld?“): a password, a whole number and a date are kinds.
    expect(skemo.goals?.map((goal) => [goal.goal, goal.props])).toEqual([
      ["enter-text", {}],
      ["email", { kind: "email" }],
      ["password", { kind: "password" }],
      ["number", { kind: "number" }],
      ["date", { kind: "date" }],
      // Spec 025 ①: a counter is a number with its stepper; a time is the platform's own.
      ["count", { kind: "number", stepper: true }],
      ["time", { kind: "time" }],
    ]);
    const words = (skemo.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["eingeben", "enter", "type", "zur", "to"])
      expect(words).not.toContain(word);
  });
});

describe("the Uzo of the kampo (T004, A3)", () => {
  it("requires the label slot (E2, D-05) and takes its size from the container (E3)", () => {
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      help: { accepts: ["text"], max: 1, nesting: 0 },
      error: { accepts: ["text"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    expect(uzo?.purpose).toBe(
      "Takes one line of text from a person: a name, an address, an e-mail, a number, a time, a search term.",
    );
  });

  // Spec 010 ① (G5): toggle is the sxaltilo's since PR ①; multi-line stays open. Spec 010 ③ (G5,
  // plan ③ D-12): choose is two entries — choose-few the elekto's, choose-many the elektilo's since
  // PR ④ (plan ④ D-12).
  it("names multi-line as the tekstareo's, choose-many as the elektilo's, choose-few as the elekto's, toggle as the sxaltilo's, and the six boundaries of A3", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      // Spec 011 ② (G5): several lines are the tekstareo's now (use-instead).
      ["multi-line", "tekstareo"],
      ["choose-many", "elektilo"],
      ["choose-few", "elekto"],
      ["toggle", "sxaltilo"],
      // Spec 014 ⑤: suggestions while typing are the kompletigilo's.
      ["suggestions", "kompletigilo"],
      // Spec 025 ①: a value set by feel is the glitilo's.
      ["approximate", "glitilo"],
      // Spec 025 ③: a single value in a view is the lokredaktilo's.
      ["single-value", "lokredaktilo"],
    ]);
    // Spec 011 ① (G5, E8): password and date are kinds now, their boundaries are gone; what stays
    // outside is showing a password, a decimal and a range of dates.
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["reveal-password", "ask-human"],
      // Spec 025 ①: the stepper is the kampo's own now (kind number with stepper); a time zone stops.
      ["decimal", "not-supported"],
      ["date-range", "use-instead"],
      ["time-zone", "ask-human"],
      // Spec 015 ②: a file is the alsxutilo's.
      ["file", "use-instead"],
      ["no-visible-label", "not-supported"],
      ["icon-in-field", "not-supported"],
    ]);
    expect(uzo?.boundary.find((entry) => entry.case === "no-visible-label")?.via).toEqual({
      regulo: "field-label-visible",
    });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in form, dialog and search-bar, with kampo and butono; the butono composes with it (A4)", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "form",
      "dialog",
      "search-bar",
    ]);
    // Spec 025 ①: the field beside the track of a glitilo.
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "kampo",
      "butono",
      "glitilo",
      "datelektilo",
    ]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
    expect(butono?.uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "butono",
      "kampo",
      "ikono",
      "konsileto",
    ]);
  });

  it("carries four text rules: the error rule fixed on the error slot, the others adjustable (D-06)", () => {
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
      ["placeholder-is-example", false, "prop:placeholder", "not-words"],
      // Spec 025 ①: the limits of a number are stated in its help.
      ["range-stated", false, "slot:help", "min-words"],
    ]);
  });
});

describe("the Reguloj of the kampo (T003, T004, A2, D-07)", () => {
  const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);

  // Spec 010 ① (E5): field-label-visible and field-label-names-the-datum apply to the sxaltilo
  // as well; the same Regulo, widened, not a second one. Spec 010 ②: the markobutono has a label,
  // an error and required like the kampo, so five of the kampo's Reguloj are widened to it.
  const WIDENED = ["field-label-visible", "field-label-names-the-datum"];
  const CHECKBOX = [
    "field-label-visible",
    "field-label-names-the-datum",
    "error-says-what-to-do",
    "required-marked",
    "error-not-color-only",
  ];
  // Spec 010 ③: the elekto has a label, help, an error and required like the kampo; six of the
  // kampo's Reguloj are widened to it.
  const RADIO = [...CHECKBOX, "help-is-one-sentence"];
  // Spec 010 ④: the elektilo is a field with a list: seven of the kampo's Reguloj are widened to it,
  // placeholder-not-label too (its placeholder is a prompt, never the label); placeholder-is-example
  // is not (select-placeholder-is-prompt is the elektilo's own).
  const SELECT = [...RADIO, "placeholder-not-label"];

  it.each([...TEXT_REGULOJ, ...INSTANCE_REGULOJ, ...SKEMO_REGULOJ])(
    "%s applies to kampo with a kialo",
    (name) => {
      const regulo = named(name);
      expect(regulo?.appliesTo).toEqual({
        eroj: [
          "kampo",
          ...(WIDENED.includes(name) ? ["sxaltilo"] : []),
          ...(CHECKBOX.includes(name) ? ["markobutono"] : []),
          ...(RADIO.includes(name) ? ["elekto"] : []),
          ...(SELECT.includes(name) ? ["elektilo"] : []),
          // Spec 011 ②: the tekstareo is a field of several lines; the seven field Reguloj are
          // widened to it (E5), placeholder-is-example stays the kampo's.
          ...(name === "placeholder-is-example" ? [] : ["tekstareo"]),
          // Spec 011 ③: the message of an avizo with intent danger says what to do (E5).
          ...(name === "error-says-what-to-do" ? ["avizo"] : []),
          // Spec 014 ①: the help of the dialogo's reason field is one sentence too (E5).
          ...(name === "help-is-one-sentence" ? ["dialogo"] : []),
          // Spec 014 ⑤: the kompletigilo is a field with suggestions; every field Regulo but
          // placeholder-is-example is widened to it (its placeholder is a prompt, G8).
          ...(name === "placeholder-is-example" ? [] : ["kompletigilo"]),
          // Spec 015 ②: the alsxutilo is a field of files; every field Regulo but the two of the
          // placeholder is widened to it (it has none).
          ...(name.startsWith("placeholder-") ? [] : ["alsxutilo"]),
          // Spec 025 ①: the glitilo is a field of a value in limits; the same Reguloj, no placeholder.
          ...(name.startsWith("placeholder-") ? [] : ["glitilo", "datelektilo"]),
          // Spec 025 ③: the listelektilo and the plurelektilo are fields with a list; every field
          // Regulo but placeholder-is-example is widened to them; the lokredaktilo takes the two
          // of the error.
          ...(name === "placeholder-is-example" ? [] : ["listelektilo", "plurelektilo"]),
          ...(name === "error-says-what-to-do" || name === "error-not-color-only"
            ? ["lokredaktilo"]
            : []),
        ],
      });
      expect(regulo?.checkability).toBe("automatic");
      expect(regulo?.kialo.length ?? 0).toBeGreaterThan(40);
    },
  );

  it.each([...TEXT_REGULOJ, ...INSTANCE_REGULOJ])("%s judges instances", (name) => {
    expect(USAGE_ENFORCERS[name]).toBeDefined();
    expect(REGULO_ENFORCERS[name]).toBeUndefined();
  });

  it.each(SKEMO_REGULOJ)("%s judges the Skemo", (name) => {
    expect(REGULO_ENFORCERS[name]).toBeDefined();
    expect(USAGE_ENFORCERS[name]).toBeUndefined();
  });

  it("spacing-owned-by-container applies to the kampo and the other Eroj", () => {
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

  it.each(TEXT_REGULOJ)(
    "%s has an approved and a rejected example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      // The kampo's own examples; the sxaltilo brings its own for the widened Regulo (Spec 010 ①).
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === kampo.ero.id,
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
        expect(jugxo.ref).toEqual({ ero: kampo.ero.id });
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        const rules = result.violations.map((violation) => violation.issue.rule);
        expect(rules, jugxo.id).toEqual(jugxo.decision === "rejected" ? [name] : []);
        expect(result.valid, jugxo.id).toBe(jugxo.decision === "approved");
      }
    },
  );

  it("S2 and S3: no label is a violation of field-label-visible; 'Ungültig' of error-says-what-to-do, with the sentence that follows", () => {
    const noLabel = evaluateUsage(modelo, [
      { ero: "kampo", props: { kind: "email", placeholder: "E-Mail" } },
    ]);
    expect(noLabel.valid).toBe(false);
    expect(noLabel.violations.map((violation) => violation.issue.rule)).toEqual([
      "field-label-visible",
      "placeholder-not-label",
    ]);
    const vague = evaluateUsage(modelo, [
      {
        ero: "kampo",
        props: { kind: "email", invalid: true },
        label: "E-Mail",
        texts: { error: "Ungültig" },
      },
    ]);
    expect(vague.violations.map((violation) => violation.issue.rule)).toEqual([
      "error-says-what-to-do",
    ]);
    expect(vague.violations[0]?.issue.suggestion).toContain("Gib eine E-Mail-Adresse mit @ ein");
    const repeated = evaluateUsage(modelo, [
      { ero: "kampo", props: { placeholder: "E-Mail" }, label: "E-Mail" },
    ]);
    expect(repeated.valid).toBe(true);
    expect(
      repeated.violations.map((violation) => [violation.issue.rule, violation.issue.severity]),
    ).toEqual([["placeholder-not-label", "warning"]]);
    const both = evaluateUsage(modelo, [
      { ero: "kampo", props: { disabled: true, readonly: true }, label: "E-Mail" },
    ]);
    expect(both.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
  });

  it("declares the KontrastParoj of the field (A6, B-1)", () => {
    const names = modelo.kontrastParoj.map((pair) => pair.name);
    for (const name of [
      "border-on-background",
      "border-strong-on-background-default",
      "status-danger-border-on-background-default",
      "border-default-on-background-sunken",
      "status-danger-text-on-background-default",
      "status-danger-text-on-background-sunken",
      "text-muted-on-background-default",
    ]) {
      expect(names).toContain(name);
    }
  });
});

// Spec 011 ① (E8, G5, Gvidanto): the three new kinds answer the questions Arkitekturo bridged by
// hand — a token typed in plain text, a precedence checked in the view, an expiry as a text field.
describe("the kampo of Spec 011 ①: password, number and date", () => {
  const suggest = (goal: string) => {
    const result = suggestEro(modelo, { goal });
    if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
    return result.output;
  };

  it("'Passwortfeld' and 'password' are the kampo with kind password", () => {
    expect(suggest("Passwortfeld").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "password" },
    });
    expect(suggest("Feld für das Kennwort").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "password" },
    });
    expect(suggest("A password for the login").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "password" },
    });
  });

  it("'Ablaufdatum' is the kampo with kind date; 'Vorrang als ganze Zahl' with kind number", () => {
    expect(suggest("Ablaufdatum des Pins").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "date" },
    });
    expect(suggest("Vorrang als ganze Zahl").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "number" },
    });
  });

  it("showing the password, a decimal and a range of dates stop at the boundaries", () => {
    const reveal = suggest("Passwort einblenden");
    expect(reveal.action).toBe("ask-human");
    expect(
      reveal.candidates?.map((candidate) =>
        candidate.kind === "boundary" ? candidate.case : candidate.goal,
      ),
    ).toEqual(["reveal-password", "password"]);
    // Not "mit zwei Nachkommastellen": zwei is a word of choose-few (Spec 010 ③ B-2).
    expect(suggest("Dezimalzahl mit Nachkommastellen").boundary).toMatchObject({
      ero: "kampo",
      case: "decimal",
      action: "not-supported",
    });
    // Spec 025 ②: the date range is the datelektilo's now; the kampo's boundary is closed
    // (use-instead) and stands beside the answer (flipped with a Jugxo, OP-12).
    expect(suggest("Zeitraum von bis").suggestion).toEqual({
      ero: "datelektilo",
      props: { mode: "range" },
    });
    expect(suggest("Zeitraum von bis").boundary).toMatchObject({
      ero: "kampo",
      case: "date-range",
      action: "use-instead",
    });
    // Spec 025 ①: a counter with plus and minus is the kampo with its stepper now, no boundary.
    expect(suggest("Zähler mit Plus und Minus").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "number", stepper: true },
    });
  });

  it("the brief of the kampo stays under 750 with the three kinds and the three boundaries", () => {
    const brief = briefOf(kampo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["kind", "size"]);
    expect(brief.boundary?.map((entry) => entry.case)).toContain("reveal-password");
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});
