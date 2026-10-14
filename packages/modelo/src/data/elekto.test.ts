// The elekto data (Spec 010 ③; G1–G7, section 3, E7, plan ③ D-01–D-16): the radio group in the
// repo Modelo, bound only to role tokens, "selected" as the state of one option (the entry key of
// the slot options, E7) and not of the group, its Uzo with the label and the options as required
// slots, the two new text rules option-labels-distinct (fixed) and elekto-options-few (adjustable,
// a warning from the sixth option on) with examples right and wrong in de and en, the Reguloj of
// the kampo widened to it (E5), and the cross-links of G5: the markobutono sends one of a few to
// it, the butono and the kampo split choose into choose-few (elekto) and choose-many (not yet).

import { describe, expect, it } from "vitest";
import { skemoPartValues, styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, forbiddenBy, keyValues } from "../eroj/skemo-rules.js";
import { evaluateUsage, slotStates } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const elekto = modelo.eroj.find((entry) => entry.ero.name === "elekto");
const skemo = elekto?.skemo;
const uzo = elekto?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const uzoOf = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.uzo;
const kampo = modelo.eroj.find((entry) => entry.ero.name === "kampo");
const markobutono = modelo.eroj.find((entry) => entry.ero.name === "markobutono");

const SHIPPING = ["Standard", "Express", "Abholung"];
const COUNTRIES = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
];
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);

describe("elekto in the repo Modelo (G1, G2, section 3)", () => {
  it("lives in data/eroj/elekto/skemo.json, between butono and kampo, and the repo Modelo stays valid", () => {
    expect(elekto?.file).toBe("modelo/data/eroj/elekto/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "butono",
      "elekto",
      "kampo",
      "ligilo",
      "markobutono",
      "sxaltilo",
    ]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has value, required, invalid, size, disabled, name and orientation as props; no label prop (G1, G2)", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["value", "string", undefined],
        ["required", "boolean", false],
        ["invalid", "boolean", false],
        ["size", ["small", "medium", "large"], "medium"],
        ["disabled", "boolean", false],
        ["name", "string", undefined],
        ["orientation", ["vertical", "horizontal"], "vertical"],
      ],
    );
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
  });

  it("has the slots label, options, help and error beside the circles; every option is an entry with the key selected (E7)", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true, beside: true },
      {
        name: "options",
        text: true,
        beside: true,
        entry: { key: "selected", equals: "value" },
      },
      { name: "help", text: true, beside: true },
      { name: "error", text: true, beside: true },
    ]);
  });

  it("names its parts like the markobutono, plus the option label and the gap of the options (① D-02)", () => {
    expect(Object.keys(skemo?.parts ?? {}).sort()).toEqual([
      "border",
      "box",
      "error",
      "focus-ring",
      "help",
      "indicator",
      "label",
      "motion",
      "option-label",
      "options",
      "required-mark",
      "surface",
    ]);
    const tokens = [
      ...(skemo?.bindings ?? []).map((binding) => binding.token),
      ...Object.values(skemo?.parts ?? {}).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
  });

  it("selected is a state of the option, not of the group: a key with true and false, no prop, no axis (E7)", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    expect(keyValues(skemo, "selected")).toEqual(["true", "false"]);
    expect(skemo.props.map((prop) => prop.name)).not.toContain("selected");
    expect(variantKeys(skemo)).toEqual(["size", "state"]);
    expect(styledProps(skemo)).toEqual(["size"]);
    // size × state: the Figma set is 3 × 5, every variant with options chosen and not (G7).
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(15);
    expect(combinationsOf(skemo, ["selected", "state"])).toHaveLength(10);
  });

  it("fills the circle by selected and state, borders it by state, with the role tokens of G3 like the markobutono", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    const at = (part: string, property: string, selected: string, state: string) =>
      boundToken(skemo, part, property, { selected, state, size: "medium" })?.token;
    expect(at("surface", "fill", "true", "rest")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "hover")).toBe("color.action.primary.hover");
    expect(at("surface", "fill", "true", "focus")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "disabled")).toBe("color.action.primary.disabled");
    expect(at("surface", "fill", "true", "invalid")).toBe("color.action.primary.rest");
    for (const state of skemo.states) {
      expect(at("surface", "fill", "false", state)).toBe("color.background.default");
      expect(at("border", "color", "true", state)).toBe(at("border", "color", "false", state));
    }
    expect(at("border", "color", "false", "rest")).toBe("color.border.strong");
    expect(at("border", "color", "false", "disabled")).toBe("color.border.disabled");
    expect(at("border", "color", "false", "invalid")).toBe("color.status.danger.border");
    expect(at("label", "color", "false", "disabled")).toBe("color.text.disabled");
    expect(at("option-label", "color", "false", "rest")).toBe("color.text.default");
    expect(at("option-label", "color", "false", "disabled")).toBe("color.text.disabled");
    for (const part of ["help", "error", "required-mark"]) {
      expect(boundToken(skemo, part, "color", {})?.token, part).toBe(
        boundToken(kampo?.skemo ?? skemo, part, "color", {})?.token,
      );
    }
  });

  it("draws the dot only on the chosen option: its colour is none on the others (Spec 008 keyword, ② D-04)", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    expect(boundToken(skemo, "indicator", "color", { selected: "true" })?.token).toBe(
      "color.action.primary.text",
    );
    expect(boundToken(skemo, "indicator", "color", { selected: "false" })?.token).toBe("none");
    expect(skemo.parts.indicator?.position).toBeUndefined();
  });

  it("sizes the dot from size.icon.*, the circle is the dot box plus its border, radius pill, option labels in body", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "indicator", "size", { size })?.token).toBe(`size.icon.${size}`);
    }
    expect(boundToken(skemo, "box", "radius", {})?.token).toBe("radius.role.pill");
    expect(boundToken(skemo, "box", "gap", {})?.token).toBe("spacing.small");
    expect(boundToken(skemo, "options", "gap", {})?.token).toBe("spacing.medium");
    expect(boundToken(skemo, "border", "width", {})?.token).toBe("border.width.default");
    expect(boundToken(skemo, "option-label", "typography", { size: "small" })?.token).toBe(
      "typography.body.2",
    );
    expect(boundToken(skemo, "option-label", "typography", { size: "large" })?.token).toBe(
      "typography.body.1",
    );
    expect(boundToken(skemo, "label", "typography", { size: "medium" })?.token).toBe(
      "typography.label.1",
    );
  });

  it("states the colour of a chosen and an unchosen option per variant for parity (E7: the key in the variant name)", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    const grey = { colorSpace: "srgb", components: [0.5, 0.5, 0.5], hex: "#808080" };
    const values = skemoPartValues(skemo, {
      "color.action.primary.rest": { name: "x", type: "color", value: grey },
      "color.background.default": { name: "y", type: "color", value: grey },
      "color.action.primary.text": { name: "z", type: "color", value: grey },
    } as never);
    expect(values["surface.fill@selected=true,size=small,state=rest"]).toBe("#808080");
    expect(values["surface.fill@selected=false,size=small,state=rest"]).toBe("#808080");
    expect(values["indicator.color@selected=true,size=large,state=focus"]).toBe("#808080");
    expect(values["indicator.color@selected=false,size=large,state=focus"]).toBeUndefined();
  });

  it("speaks role radiogroup: name from the label, description from help and error, arrows and Space, required in de and en like the kampo", () => {
    expect(skemo?.a11y).toEqual({
      role: "radiogroup",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        selected: ["aria-checked"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        orientation: ["aria-orientation"],
      },
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"],
      texts: { required: { de: "erforderlich", en: "required" } },
    });
    expect(skemo?.a11y.texts).toEqual(kampo?.skemo.a11y.texts);
  });

  it("forbids an error text without invalid, like the kampo (constraint, Spec 009 D-04)", () => {
    if (skemo === undefined) throw new Error("elekto missing");
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    expect(skemo.constraints?.[0]?.kialo).toBe(kampo?.skemo.constraints?.[0]?.kialo);
    expect(
      slotStates(skemo, {
        ero: "elekto",
        props: {},
        label: "Versandart",
        texts: { options: SHIPPING },
      }),
    ).toEqual({
      "slot:label": "filled",
      "slot:options": "filled",
      "slot:help": "empty",
      "slot:error": "empty",
    });
  });

  it("knows the goal choose-few with whole words, no preposition, citing elekto-options-few", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["choose-few", {}, "elekto-options-few"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["choose", "pick", "option", "options", "which", "radio"],
      de: [
        "wähle",
        "wählen",
        "option",
        "optionen",
        "variante",
        "welche",
        "radiobutton",
        "optionsfeld",
      ],
    });
    const words = (skemo?.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["on", "of", "to", "for", "von", "aus", "zu", "an", "für", "one", "eine"]) {
      expect(words).not.toContain(word);
    }
    for (const word of words) expect(word).toMatch(/^\p{L}+$/u);
  });
});

describe("the Uzo of the elekto (section 3, G5)", () => {
  it("states the purpose of the spec, requires the label and at least two options, never breaks a line", () => {
    expect(uzo?.purpose).toBe(
      "Chooses one of a few options that all stay visible: payment method, shipping speed, yes/no/maybe.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      options: { accepts: ["text"], required: true, min: 2, nesting: 0 },
      help: { accepts: ["text"], max: 1, nesting: 0 },
      error: { accepts: ["text"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
  });

  it("names choose-many as not covered until PR ④ (elektilo), sends yes-no to the markobutono, multi not covered", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["choose-many", null],
      ["yes-no", "markobutono"],
      ["multi", null],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/elektilo, PR ④/);
    expect(uzo?.instead[1]?.kialo).toMatch(/A yes or no is a check mark/);
    expect(uzo?.instead[2]?.kialo).toMatch(/group of checkboxes/);
  });

  it("stops at a single option and never without a visible label", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["single-option", "not-supported"],
      ["no-visible-label", "not-supported"],
    ]);
    expect(uzo?.boundary[0]?.kialo).toMatch(/^A choice of one is no choice/);
    expect(uzo?.boundary[1]?.via).toEqual({ regulo: "field-label-visible" });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a form, a dialog and a filter bar, with the kampo and the butono, never in a slot of the butono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "form",
      "dialog",
      "filter-bar",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
  });

  it("carries the two new rules on the options, the datum rule with words of choosing, error and help like the kampo", () => {
    expect(
      uzo?.content.map((entry) => [
        entry.regulo,
        entry.fixed,
        entry.severity ?? "error",
        entry.of ?? "slot:label",
        entry.check,
      ]),
    ).toEqual([
      ["option-labels-distinct", true, "error", "slot:options", { kind: "distinct" }],
      ["elekto-options-few", false, "warning", "slot:options", { kind: "max-entries", count: 5 }],
      [
        "field-label-names-the-datum",
        false,
        "error",
        "slot:label",
        {
          kind: "not-words",
          words: { de: ["auswählen", "wählen", "wähle"], en: ["choose", "select", "pick"] },
        },
      ],
      ["error-says-what-to-do", true, "error", "slot:error", { kind: "min-words", count: 3 }],
      ["help-is-one-sentence", false, "error", "slot:help", { kind: "max-sentences", count: 1 }],
    ]);
  });

  it("the brief names the purpose, size and orientation, the label and the options as duties, and stays short", () => {
    if (elekto === undefined) throw new Error("elekto missing");
    const brief = briefOf(elekto);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "orientation"]);
    expect(brief.required).toEqual({ props: [], slots: ["label", "options"] });
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5 (one Ero per entry)", () => {
  it("the markobutono sends one of a few to the elekto now (closes ② D-10)", () => {
    const few = uzoOf("markobutono")?.instead.find((entry) => entry.goal === "choose-one-of-few");
    expect(few?.ero).toBe("elekto");
    expect(few?.kialo).toMatch(/Fundamento covers it with elekto\.$/);
    expect(few?.kialo).not.toMatch(/PR ③/);
  });

  it.each(["butono", "kampo"])(
    "the %s splits choose into choose-few (use-instead elekto) and choose-many (not yet, elektilo), keywords apart",
    (name) => {
      const instead = uzoOf(name)?.instead ?? [];
      expect(instead.map((entry) => entry.goal)).not.toContain("choose");
      const few = instead.find((entry) => entry.goal === "choose-few");
      const many = instead.find((entry) => entry.goal === "choose-many");
      expect(few?.ero).toBe("elekto");
      expect(many?.ero).toBeNull();
      expect(few?.kialo).toMatch(/elekto/);
      expect(many?.kialo).toMatch(/elektilo/);
      expect(few?.keywords).toEqual({
        en: ["choose", "pick", "option", "two", "three"],
        de: ["wählen", "wähle", "option", "variante", "zwei", "drei"],
      });
      expect(many?.keywords).toEqual({
        en: ["select", "list", "country", "language", "many"],
        de: ["auswählen", "liste", "land", "sprache", "vielen"],
      });
      for (const entry of [few, many]) expect(entry?.kialo).toMatch(/\bbecause\b/);
    },
  );

  it("the kampo keeps its brief under the ceiling of 750 with the split (B-2 of ①/②)", () => {
    if (kampo === undefined) throw new Error("kampo missing");
    const bytes = Buffer.byteLength(JSON.stringify(briefOf(kampo)), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });

  it("the markobutono's Skemo is unchanged by the radio group", () => {
    expect(markobutono?.skemo.slots.map((slot) => slot.name)).toEqual(["label", "error"]);
  });
});

describe("the Reguloj of the elekto (G6, E5)", () => {
  it("option-labels-distinct is new and fixed; elekto-options-few is new and adjustable; both judge instances", () => {
    expect(named("option-labels-distinct")).toMatchObject({
      checkability: "automatic",
      appliesTo: { eroj: ["elekto"] },
    });
    expect(named("option-labels-distinct")?.kialo).toMatch(/tell apart/);
    expect(named("elekto-options-few")).toMatchObject({
      checkability: "automatic",
      appliesTo: { eroj: ["elekto"] },
    });
    expect(named("elekto-options-few")?.kialo).toMatch(/six visible options/);
  });

  it.each([
    ["field-label-visible", ["kampo", "sxaltilo", "markobutono", "elekto"]],
    ["field-label-names-the-datum", ["kampo", "sxaltilo", "markobutono", "elekto"]],
    ["error-says-what-to-do", ["kampo", "markobutono", "elekto"]],
    ["required-marked", ["kampo", "markobutono", "elekto"]],
    ["error-not-color-only", ["kampo", "markobutono", "elekto"]],
    ["help-is-one-sentence", ["kampo", "elekto"]],
  ])("%s is widened to the elekto, not duplicated (E5)", (name, eroj) => {
    expect(named(name)?.appliesTo).toEqual({ eroj });
    expect(named(name)?.statement).toMatch(/elekto/);
    expect(modelo.reguloj.filter((regulo) => regulo.name === name)).toHaveLength(1);
  });

  it("spacing-owned-by-container applies to all six Eroj", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toEqual([
      "butono",
      "ligilo",
      "kampo",
      "sxaltilo",
      "markobutono",
      "elekto",
    ]);
  });

  it.each(["option-labels-distinct", "elekto-options-few", "field-label-names-the-datum"])(
    "%s has an approved and a rejected elekto example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === elekto?.ero.id,
      );
      expect(
        examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo]),
      ).toEqual([
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ]);
      const severity = name === "elekto-options-few" ? "warning" : "error";
      for (const jugxo of examples) {
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        expect(rulesOf(result), jugxo.id).toEqual(
          jugxo.decision === "rejected" ? [[name, severity]] : [],
        );
        expect(result.valid, jugxo.id).toBe(jugxo.decision === "approved" || severity !== "error");
      }
    },
  );
});

describe("check_usage of the radio group (G6, G7: the instance cases)", () => {
  const judge = (instance: Record<string, unknown>) =>
    evaluateUsage(modelo, [{ ero: "elekto", props: {}, ...instance }]);

  it("three shipping methods with a label pass", () => {
    const right = judge({ label: "Versandart", texts: { options: SHIPPING } });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
  });

  it("a radio group without a label violates field-label-visible", () => {
    const empty = judge({ label: "", texts: { options: SHIPPING } });
    expect(empty.valid).toBe(false);
    expect(rulesOf(empty)).toEqual([["field-label-visible", "error"]]);
  });

  it("two options with the same label violate option-labels-distinct (fixed: an error)", () => {
    const same = judge({
      label: "Versandart",
      texts: { options: ["Standard", "Express", "standard"] },
    });
    expect(same.valid).toBe(false);
    expect(rulesOf(same)).toEqual([["option-labels-distinct", "error"]]);
    expect(same.violations[0]?.issue.message).toMatch(/"Standard"/);
    expect(same.violations[0]?.issue.regulo?.kialo).toBe(named("option-labels-distinct")?.kialo);
  });

  it("seven options warn with elekto-options-few: the instances stay valid", () => {
    const seven = judge({ label: "Land", texts: { options: COUNTRIES } });
    expect(seven.valid).toBe(true);
    expect(rulesOf(seven)).toEqual([["elekto-options-few", "warning"]]);
    expect(seven.violations[0]?.issue.message).toMatch(/7 options/);
    expect(judge({ label: "Land", texts: { options: COUNTRIES.slice(0, 5) } }).violations).toEqual(
      [],
    );
  });

  it("a single option is no choice: the options slot takes at least two (boundary single-option)", () => {
    const one = judge({ label: "Versandart", texts: { options: ["Standard"] } });
    expect(one.valid).toBe(false);
    expect(rulesOf(one)).toEqual([["uzo-slot-min", "error"]]);
    expect(one.violations[0]?.issue.message).toMatch(/at least 2/);
  });

  it("'Versandart wählen' is a verb in the label; an error without invalid is a contradiction", () => {
    expect(rulesOf(judge({ label: "Versandart wählen", texts: { options: SHIPPING } }))).toEqual([
      ["field-label-names-the-datum", "error"],
    ]);
    expect(
      rulesOf(
        judge({
          label: "Versandart",
          props: { required: true },
          texts: { options: SHIPPING, error: "Wähle eine Versandart, um fortzufahren" },
        }),
      ),
    ).toEqual([["ero-prop-constraint", "error"]]);
  });
});

describe("suggest_ero and the radio group (Gvidanto, section 3)", () => {
  const suggest = (goal: string) => {
    const result = suggestEro(modelo, { goal });
    if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
    return result.output;
  };

  it("'Dropdown mit drei Versandarten' is an elekto: the butono's choose-few, with its kialo (spec dialog)", () => {
    const answer = suggest("Dropdown mit drei Versandarten");
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched).toEqual({ goal: "choose-few", keyword: "drei", lingvo: "de" });
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "choose-few",
      action: "use-instead",
      kialo: uzoOf("butono")?.instead.find((entry) => entry.goal === "choose-few")?.kialo,
    });
    expect(answer.action).toBeUndefined();
  });

  it("'Welche Versandart?' is the goal choose-few of the elekto, with the kialo of elekto-options-few", () => {
    const answer = suggest("Welche Versandart?");
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched?.goal).toBe("choose-few");
    expect(answer.regulo?.name).toBe("elekto-options-few");
    expect(answer.kialo).toBe(named("elekto-options-few")?.kialo);
  });

  it("'Radiobutton' is the elekto now: the goal answers, the markobutono's alternative confirms it", () => {
    const answer = suggest("Radiobutton");
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched?.goal).toBe("choose-few");
    expect(answer.action).toBeUndefined();
  });

  it("'Land aus einer Liste' is choose-many: not covered until PR ④, a person decides", () => {
    const answer = suggest("Land aus einer Liste");
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({ case: "choose-many", action: "ask-human" });
  });
});
