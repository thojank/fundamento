// The kompletigilo data (Spec 014 ⑤; G4, G5, section ⑤, plan ⑤ D-02): the combobox in the repo
// Modelo — the field of the kampo (parts and bindings copied, like the elektilo's) with a list of
// suggestions anchored to it: a popover of the platform, walked with the arrow keys, the number of
// suggestions announced (a11y.texts options-count); the value is a chosen suggestion or, with
// allow-free, the typed text. The field Reguloj are widened to it (E5, G8); kampo and elektilo
// send suggestions here.

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const kompletigilo = eroNamed("kompletigilo");
const skemo = kompletigilo?.skemo;
const uzo = kompletigilo?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("kompletigilo in the repo Modelo (section ⑤, G1, G2)", () => {
  it("lives in data/eroj/kompletigilo/skemo.json, one of forty Eroj", () => {
    expect(kompletigilo?.file).toBe("modelo/data/eroj/kompletigilo/skemo.json");
    expect(modelo.eroj).toHaveLength(40);
  });

  it("has the props of the elektilo without empty-label, plus allow-free, min-chars and expanded; the states of a field; label, options, help and error", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["value", "string", undefined],
      ["placeholder", "string", undefined],
      ["required", "boolean", false],
      ["invalid", "boolean", false],
      ["size", "enum", "medium"],
      ["disabled", "boolean", false],
      ["name", "string", undefined],
      ["allow-free", "boolean", false],
      ["min-chars", "number", 1],
      ["expanded", "boolean", false],
      // Nachlese 4 N-9 (O-24): the application loads new suggestions.
      ["loading", "boolean", false],
      ["clearable", "boolean", false],
      // Spec 029 ②b-1b (Nachlese 12): the visible label as an attribute.
      ["label", "string", undefined],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      // Nachlese 4 N-8 (O-23): the suggestion the keyboard stands on is a state of its entry too.
      {
        name: "options",
        text: true,
        entry: { key: "selected", equals: "value", active: "active" },
      },
      { name: "help", text: true },
      { name: "error", text: true },
      // Spec 029 ②b-1 M-1: the reason for disabled.
      { name: "disabled-reason", text: true },
    ]);
    // expanded keys the listbox: an axis beside size and state (E7: selected is the state of an entry).
    expect(variantKeys(skemoOrThrow())).toEqual(["size", "expanded", "state"]);
  });

  it("names the field's parts like the elektilo's (without the chevron) plus listbox, suggestion and no-results", () => {
    const elektilo = eroNamed("elektilo")?.skemo;
    for (const part of [
      "label",
      "required-mark",
      "surface",
      "border",
      "text",
      "placeholder",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
    ]) {
      expect(skemo?.parts[part], part).toEqual(elektilo?.parts[part]);
    }
    expect(skemo?.parts.indicator).toBeUndefined();
    expect(skemo?.parts.listbox).toEqual({
      fill: { fixed: "color.background.raised" },
      radius: { fixed: "radius.role.surface" },
      shadow: { fixed: "elevation.shadow.overlay" },
      layer: { fixed: "elevation.layer.overlay" },
      width: { fixed: "size.container.small" },
      height: { by: ["expanded"] },
    });
    expect(skemo?.parts.suggestion).toEqual({
      color: { by: ["selected"] },
      // Nachlese 4 N-8 (O-23): the active suggestion is a bound part, no class.
      fill: { by: ["active"] },
      typography: { fixed: "typography.label.1" },
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts["no-results"]).toEqual({
      color: { fixed: "color.text.subtle" },
      typography: { fixed: "typography.caption" },
    });
    expect(boundToken(skemoOrThrow(), "listbox", "height", { expanded: "false" })?.token).toBe(
      "none",
    );
    expect(boundToken(skemoOrThrow(), "suggestion", "color", { selected: "false" })?.token).toBe(
      "color.text.subtle",
    );
  });

  it("speaks role combobox like the elektilo, expanded as aria-expanded; announces the suggestions (texts) (G5)", () => {
    expect(skemo?.a11y.role).toBe("combobox");
    expect(skemo?.a11y.name).toEqual(["slot:label", "prop:label"]);
    expect(skemo?.a11y.description).toEqual(["slot:help", "slot:error", "slot:disabled-reason"]);
    expect(skemo?.a11y.states).toEqual({
      selected: ["aria-selected"],
      required: ["aria-required"],
      invalid: ["aria-invalid"],
      disabled: ["aria-disabled"],
      expanded: ["aria-expanded"],
      // Nachlese 4 N-9: busy while the application loads, still operable (no aria-disabled).
      loading: ["aria-busy"],
    });
    expect(skemo?.a11y.keys).toEqual(["ArrowUp", "ArrowDown", "Enter", "Escape"]);
    expect(skemo?.a11y.texts).toEqual({
      "clear-name": { de: "{label} leeren", en: "Clear {label}" },
      required: { de: "erforderlich", en: "required" },
      "options-empty": { de: "Keine Vorschläge", en: "No suggestions" },
      "options-count": { de: "Vorschläge", en: "suggestions" },
      // Nachlese 4 N-9 (O-24): heard while the application loads new suggestions.
      loading: { de: "lädt", en: "loading" },
    });
  });

  it("knows the goal suggest with the words of G7", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["suggest"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["autocomplete", "combobox", "typeahead", "suggestions"],
      de: ["autocomplete", "combobox", "typeahead", "vorschläge", "autovervollständigung"],
    });
  });
});

describe("the Uzo of the kompletigilo (section ⑤, G6)", () => {
  it("states the purpose; a handful of fixed options is the elekto's, a fixed list the elektilo's; multi-select asks, tags are not supported", () => {
    expect(uzo?.purpose).toBe(
      "A field that suggests matching values while the person types; the value may be one of the suggestions or, if allowed, free text.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["few-fixed-options", "elekto"],
      ["many-fixed-options-no-typing", "elektilo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      // Spec 025 ③: several values are the plurelektilo's.
      ["multi-select", "use-instead"],
      ["tags", "not-supported"],
    ]);
  });

  it("composes in a form with butono and kampo; the options are a duty of at least one; the field Reguloj are carried; kampo and elektilo send suggestions here", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["form"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["butono", "kampo"]);
    expect(uzo?.slots.options).toEqual({ accepts: ["text"], required: true, min: 1, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    expect(uzo?.content.map((entry) => entry.regulo)).toEqual([
      "option-labels-distinct",
      "select-placeholder-is-prompt",
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "help-is-one-sentence",
    ]);
    expect(eroNamed("kampo")?.uzo?.instead.find((entry) => entry.goal === "suggestions")?.ero).toBe(
      "kompletigilo",
    );
    // The elektilo's alternative search-in-list said null until ⑤: it is covered now.
    expect(
      eroNamed("elektilo")?.uzo?.instead.find((entry) => entry.goal === "search-in-list")?.ero,
    ).toBe("kompletigilo");
  });

  it("the brief names size and expanded as axes, label and options as duties, and stays under 750", () => {
    if (kompletigilo === undefined) throw new Error("missing");
    const brief = briefOf(kompletigilo);
    // selected is the state of an entry; the brief names it as an axis (Spec 011 ① O-3), and
    // active, the second state of the entry, too (Nachlese 4 N-8).
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "expanded", "selected", "active"]);
    expect(brief.required).toEqual({ props: [], slots: ["label", "options"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the kompletigilo (G8, E5)", () => {
  it("the nine field Reguloj are widened, not duplicated (E5)", () => {
    for (const name of [
      "field-label-visible",
      "placeholder-not-label",
      "error-says-what-to-do",
      "error-not-color-only",
      "required-marked",
      "field-label-names-the-datum",
      "help-is-one-sentence",
      "option-labels-distinct",
      "select-placeholder-is-prompt",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("kompletigilo");
    }
    expect(named("select-placeholder-is-prompt")?.statement).toContain("kompletigilo");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("kompletigilo");
  });

  it("two suggestions with the same text violate option-labels-distinct; a one-word placeholder breaks the prompt rule", () => {
    const judge = (instance: {
      props?: Record<string, string>;
      texts?: Record<string, string | string[]>;
    }) =>
      rulesOf(
        evaluateUsage(modelo, [{ ero: "kompletigilo", label: "Land", props: {}, ...instance }]),
      );
    expect(judge({ texts: { options: ["Deutschland", "Dänemark"] } })).toEqual([]);
    expect(judge({ texts: { options: ["Dänemark", "Dänemark"] } })).toEqual([
      ["option-labels-distinct", "error"],
    ]);
    expect(
      judge({ props: { placeholder: "Deutschland" }, texts: { options: ["Deutschland"] } }),
    ).toEqual([["select-placeholder-is-prompt", "error"]]);
  });
});

// Nachlese 4 N-8 (Spec 014 ⑤ O-23, Abweichung 2): the suggestion the keyboard stands on
// (aria-activedescendant) is a bound part — its fill by active: the sunken ground under the
// active one, the listbox's own raised fill under the others — with the KontrastParoj every text
// of the field needs on it (declared, measured, passed: plan D-08; the menuo's tertiary hover is
// no pair the field's help and error pass). N-9 (O-24): while the application loads, loading.
describe("the active suggestion and the loading field (Nachlese 4 N-8, N-9)", () => {
  it("active is a state of the entry, no prop: true for the one suggestion, false for the others", () => {
    expect(skemo?.props.some((prop) => prop.name === "active")).toBe(false);
    expect(boundToken(skemoOrThrow(), "suggestion", "fill", { active: "true" })?.token).toBe(
      "color.background.sunken",
    );
    expect(boundToken(skemoOrThrow(), "suggestion", "fill", { active: "false" })?.token).toBe(
      "color.background.raised",
    );
    // No axis of the variants: active, like selected, belongs to one entry.
    expect(variantKeys(skemoOrThrow())).toEqual(["size", "expanded", "state"]);
  });

  it("the texts on the active suggestion are declared pairs, and the Modelo is valid", () => {
    const pairs = new Set(
      modelo.kontrastParoj.map((pair) => `${pair.foreground} ${pair.background}`),
    );
    for (const background of ["color.background.sunken", "color.background.raised"]) {
      for (const foreground of [
        "color.text.default",
        "color.text.subtle",
        "color.text.muted",
        "color.status.danger.text",
      ]) {
        expect(pairs.has(`${foreground} ${background}`), `${foreground} on ${background}`).toBe(
          true,
        );
      }
    }
  });

  it("loading is a boolean prop that keys no part and is heard as 'lädt' (N-9)", () => {
    const loading = skemo?.props.find((prop) => prop.name === "loading");
    expect(loading).toMatchObject({ kind: "boolean", default: false });
    expect(loading?.description).toMatch(/aria-busy/);
    expect(skemo?.a11y.states.loading).toEqual(["aria-busy"]);
  });
});

describe("suggest_ero of the combobox (Gvidanto)", () => {
  it("'Feld, in dem man tippt und Vorschläge bekommt' is the kompletigilo with the kampo's reason", () => {
    const answer = suggest("Feld, in dem man tippt und Vorschläge bekommt");
    expect(answer.suggestion).toEqual({ ero: "kompletigilo", props: {} });
    expect(answer.boundary).toBeUndefined();
    expect(answer.matched?.goal).toBe("suggest");
  });

  it("'eine Handvoll fester Werte' goes to the elekto with the combobox's reason; 'Mehrfachauswahl' is the plurelektilo's (Spec 025 ③)", () => {
    const few = suggest("eine Handvoll fester Werte");
    expect(few.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(few.boundary).toMatchObject({ ero: "kompletigilo", case: "few-fixed-options" });
    // Spec 025 ③: several values are the plurelektilo's now (flipped with a Jugxo, OP-12).
    const multi = suggest("Mehrfachauswahl mit Vorschlägen");
    expect(multi.suggestion).toEqual({ ero: "plurelektilo", props: {} });
  });
});
