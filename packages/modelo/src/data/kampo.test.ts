// The kampo data (Spec 009 T004; A1–A4, plan D-01–D-07): the first composite Ero in the repo
// Modelo, bound only to role tokens, its Uzo with the label as a required slot, eight Reguloj with
// a kialo, examples right and wrong for every text rule, and the slot constraint.

import { describe, expect, it } from "vitest";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, slotStates, USAGE_ENFORCERS } from "../eroj/usage.js";
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
  it("lives in data/eroj/kampo/skemo.json, between butono and ligilo, and the repo Modelo stays valid", () => {
    expect(kampo.file).toBe("modelo/data/eroj/kampo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual(["butono", "kampo", "ligilo"]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has the props, states and slots of A1: kind not type, no label prop, three text slots (E2, E7)", () => {
    expect(skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual([
      ["kind", ["text", "email", "tel", "url", "search"], "text"],
      ["value", "string", undefined],
      ["placeholder", "string", undefined],
      ["required", "boolean", false],
      ["disabled", "boolean", false],
      ["readonly", "boolean", false],
      ["invalid", "boolean", false],
      ["size", ["small", "medium", "large"], "medium"],
      ["name", "string", undefined],
    ]);
    expect(skemo.props.map((prop) => prop.name)).not.toContain("label");
    expect(skemo.props.map((prop) => prop.name)).not.toContain("type");
    expect(skemo.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
    expect(skemo.slots.map((slot) => [slot.name, slot.text])).toEqual([
      ["label", true],
      ["help", true],
      ["error", true],
    ]);
  });

  it("binds only role tokens, never palette steps, and names its parts without web words (D-03)", () => {
    const tokens = [
      ...skemo.bindings.map((binding) => binding.token),
      ...Object.values(skemo.parts).flatMap((part) =>
        Object.values(part).flatMap((source) => (source && "fixed" in source ? [source.fixed] : [])),
      ),
    ];
    expect(tokens.length).toBeGreaterThan(25);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "border",
      "box",
      "error",
      "focus-ring",
      "help",
      "label",
      "motion",
      "placeholder",
      "required-mark",
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
    expect(skemo.a11y.name).toEqual(["slot:label"]);
    expect(skemo.a11y.description).toEqual(["slot:help", "slot:error"]);
    expect(skemo.a11y.states).toEqual({
      required: ["aria-required"],
      invalid: ["aria-invalid"],
      disabled: ["aria-disabled"],
      readonly: ["aria-readonly"],
    });
    expect(skemo.a11y.texts).toEqual({ required: { de: "erforderlich", en: "required" } });
  });

  it("forbids an error text without invalid and disabled with readonly (D-04)", () => {
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    expect(forbiddenBy(skemo, { "slot:error": "empty", invalid: "false" })).toBeUndefined();
    expect(forbiddenBy(skemo, { disabled: "true", readonly: "true" })).toBeDefined();
    expect(forbiddenBy(skemo, { disabled: "true", readonly: "false" })).toBeUndefined();
    expect(
      slotStates(skemo, { ero: "kampo", props: {}, label: "E-Mail", texts: { error: "x" } }),
    ).toEqual({ "slot:label": "filled", "slot:help": "empty", "slot:error": "filled" });
    const result = evaluateUsage(modelo, [
      { ero: "kampo", props: {}, label: "E-Mail", texts: { error: "Gib eine Adresse mit @ ein" } },
    ]);
    expect(result.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
  });

  it("knows the goals enter-text and email (kind email) without all-purpose verbs (OP-12)", () => {
    expect(skemo.goals?.map((goal) => [goal.goal, goal.props])).toEqual([
      ["enter-text", {}],
      ["email", { kind: "email" }],
    ]);
    const words = (skemo.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["eingeben", "enter", "type", "zur", "to"]) expect(words).not.toContain(word);
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
      "Takes one line of text from a person: a name, an address, an e-mail, a search term.",
    );
  });

  it("names multi-line, choose and toggle as not covered, and the six boundaries of A3", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["multi-line", null],
      ["choose", null],
      ["toggle", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["password", "not-supported"],
      ["number-stepper", "not-supported"],
      ["date", "ask-human"],
      ["file", "ask-human"],
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
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
    expect(butono?.uzo?.composes.with.map((entry) => entry.ero)).toEqual(["butono", "kampo"]);
  });

  it("carries four text rules: the error rule fixed on the error slot, the others adjustable (D-06)", () => {
    expect(
      uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.of ?? "slot:label", entry.check.kind]),
    ).toEqual([
      ["field-label-names-the-datum", false, "slot:label", "not-words"],
      ["error-says-what-to-do", true, "slot:error", "min-words"],
      ["help-is-one-sentence", false, "slot:help", "max-sentences"],
      ["placeholder-is-example", false, "prop:placeholder", "not-words"],
    ]);
  });
});

describe("the Reguloj of the kampo (T003, T004, A2, D-07)", () => {
  const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);

  it.each([...TEXT_REGULOJ, ...INSTANCE_REGULOJ, ...SKEMO_REGULOJ])(
    "%s applies to kampo with a kialo",
    (name) => {
      const regulo = named(name);
      expect(regulo?.appliesTo).toEqual({ eroj: ["kampo"] });
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

  it("spacing-owned-by-container applies to all three Eroj", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toEqual([
      "butono",
      "ligilo",
      "kampo",
    ]);
  });

  it.each(TEXT_REGULOJ)(
    "%s has an approved and a rejected example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
      expect(examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo])).toEqual([
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
      { ero: "kampo", props: { kind: "email", invalid: true }, label: "E-Mail", texts: { error: "Ungültig" } },
    ]);
    expect(vague.violations.map((violation) => violation.issue.rule)).toEqual([
      "error-says-what-to-do",
    ]);
    expect(vague.violations[0]?.issue.suggestion).toContain("Gib eine E-Mail-Adresse mit @ ein");
    const repeated = evaluateUsage(modelo, [
      { ero: "kampo", props: { placeholder: "E-Mail" }, label: "E-Mail" },
    ]);
    expect(repeated.valid).toBe(true);
    expect(repeated.violations.map((violation) => [violation.issue.rule, violation.issue.severity])).toEqual([
      ["placeholder-not-label", "warning"],
    ]);
    const both = evaluateUsage(modelo, [
      { ero: "kampo", props: { disabled: true, readonly: true }, label: "E-Mail" },
    ]);
    expect(both.violations.map((violation) => violation.issue.rule)).toEqual(["ero-prop-constraint"]);
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
