// The markobutono data (Spec 010 ②; G1–G6, section 2, plan ② D-01–D-14): the checkbox in the
// repo Modelo, bound only to role tokens, its Uzo with the label as a required slot, the switch
// for what applies at once and the coming radio group named in the alternatives, the existing
// text rules field-label-names-the-datum and error-says-what-to-do with examples right and wrong in
// de and en, the Reguloj of the kampo widened to it (E5), and the sxaltilo pointing its
// alternative needs-confirmation at it (G5).

import { describe, expect, it } from "vitest";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, slotStates } from "../eroj/usage.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const markobutono = modelo.eroj.find((entry) => entry.ero.name === "markobutono");
const skemo = markobutono?.skemo;
const uzo = markobutono?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const uzoOf = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.uzo;
const kampo = modelo.eroj.find((entry) => entry.ero.name === "kampo");

describe("markobutono in the repo Modelo (G1, G2, section 2)", () => {
  it("lives in data/eroj/markobutono/skemo.json, after ligilo and before sxaltilo, and the repo Modelo stays valid", () => {
    expect(markobutono?.file).toBe("modelo/data/eroj/markobutono/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "ligilo",
      "markobutono",
      "plenstato",
      "sxaltilo",
      "tekstareo",
    ]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has checked, required, invalid, size, disabled and name as props; no label prop (G1, G2)", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["checked", "boolean", false],
        ["required", "boolean", false],
        ["invalid", "boolean", false],
        ["size", ["small", "medium", "large"], "medium"],
        ["disabled", "boolean", false],
        ["name", "string", undefined],
      ],
    );
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    // Label and error stand beside the box, on the ground of the container (① D-07).
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true, beside: true },
      { name: "error", text: true, beside: true },
    ]);
  });

  it("names its parts like the kampo and the sxaltilo: surface, border, box, indicator (① D-02)", () => {
    expect(Object.keys(skemo?.parts ?? {}).sort()).toEqual([
      "border",
      "box",
      "error",
      "focus-ring",
      "indicator",
      "label",
      "motion",
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

  it("fills the box by checked and state, borders it by state, with the role tokens of G3", () => {
    if (skemo === undefined) throw new Error("markobutono missing");
    const at = (part: string, property: string, checked: string, state: string) =>
      boundToken(skemo, part, property, { checked, state, size: "medium" })?.token;
    expect(at("surface", "fill", "true", "rest")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "hover")).toBe("color.action.primary.hover");
    expect(at("surface", "fill", "true", "focus")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "disabled")).toBe("color.action.primary.disabled");
    expect(at("surface", "fill", "true", "invalid")).toBe("color.action.primary.rest");
    for (const state of skemo.states) {
      expect(at("surface", "fill", "false", state)).toBe("color.background.default");
    }
    // Border by state alone (section 2): the edge of the box is the same ticked or not.
    for (const checked of ["true", "false"]) {
      expect(at("border", "color", checked, "rest")).toBe("color.border.strong");
      expect(at("border", "color", checked, "hover")).toBe("color.border.strong");
      expect(at("border", "color", checked, "disabled")).toBe("color.border.disabled");
      expect(at("border", "color", checked, "invalid")).toBe("color.status.danger.border");
    }
    expect(at("label", "color", "false", "disabled")).toBe("color.text.disabled");
    expect(boundToken(skemo, "error", "color", {})?.token).toBe("color.status.danger.text");
    expect(boundToken(skemo, "required-mark", "color", {})?.token).toBe("color.status.danger.text");
  });

  it("draws the check mark only when checked: its colour is none unchecked (Spec 008 keyword)", () => {
    if (skemo === undefined) throw new Error("markobutono missing");
    expect(boundToken(skemo, "indicator", "color", { checked: "true" })?.token).toBe(
      "color.action.primary.text",
    );
    expect(boundToken(skemo, "indicator", "color", { checked: "false" })?.token).toBe("none");
    expect(skemo.parts.indicator?.fill).toBeUndefined();
    expect(skemo.parts.indicator?.position).toBeUndefined();
  });

  it("sizes the check mark from size.icon.*, the box is the mark plus its border, radius control", () => {
    if (skemo === undefined) throw new Error("markobutono missing");
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "indicator", "size", { size })?.token).toBe(`size.icon.${size}`);
    }
    expect(skemo.parts.box?.width).toBeUndefined();
    expect(boundToken(skemo, "box", "radius", {})?.token).toBe("radius.role.control");
    expect(boundToken(skemo, "box", "gap", {})?.token).toBe("spacing.small");
    expect(boundToken(skemo, "border", "width", {})?.token).toBe("border.width.default");
    // checked × size × state: the Figma set is 2 × 3 × 5 (E2).
    expect(combinationsOf(skemo, ["checked", "size", "state"])).toHaveLength(30);
  });

  it("speaks role checkbox: name from the label, description from the error, Space, required in de and en like the kampo", () => {
    expect(skemo?.a11y).toEqual({
      role: "checkbox",
      name: ["slot:label"],
      description: ["slot:error"],
      states: {
        checked: ["aria-checked"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
      },
      keys: ["Space"],
      texts: { required: { de: "erforderlich", en: "required" } },
    });
    expect(skemo?.a11y.texts).toEqual(kampo?.skemo.a11y.texts);
  });

  it("forbids an error text without invalid, like the kampo (constraint, Spec 009 D-04)", () => {
    if (skemo === undefined) throw new Error("markobutono missing");
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    expect(forbiddenBy(skemo, { "slot:error": "empty", invalid: "false" })).toBeUndefined();
    expect(skemo.constraints?.[0]?.kialo).toBe(kampo?.skemo.constraints?.[0]?.kialo);
    expect(
      slotStates(skemo, {
        ero: "markobutono",
        props: {},
        label: "Ich akzeptiere die AGB",
        texts: { error: "x" },
      }),
    ).toEqual({ "slot:label": "filled", "slot:error": "filled" });
  });

  it("knows the goals agree (required) and opt-in with whole words, no preposition", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["agree", { required: true }, "required-marked"],
      ["opt-in", {}, "field-label-visible"],
    ]);
    const [agree, optIn] = skemo?.goals ?? [];
    expect(agree?.keywords).toEqual({
      en: ["accept", "agree", "terms", "consent"],
      de: ["akzeptieren", "zustimmen", "agb", "einwilligen"],
    });
    expect(optIn?.keywords).toEqual({
      en: ["newsletter", "remember", "subscribe"],
      de: ["newsletter", "merken", "abonnieren"],
    });
    const words = (skemo?.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["on", "to", "for", "zu", "an", "für", "go", "open", "öffnen", "gehen"]) {
      expect(words).not.toContain(word);
    }
  });
});

describe("the Uzo of the markobutono (section 2, G5)", () => {
  it("states the purpose of the spec, requires the label, keeps its size and lets long labels break", () => {
    expect(uzo?.purpose).toBe(
      "Marks one option as yes or no inside a form; it applies when the form is sent: terms accepted, newsletter, remember me.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      error: { accepts: ["text"], max: 1, nesting: 0 },
    });
    // The spec says with-text for "long labels break"; in the schema with-text is the link's
    // break inside running text, standing alone never (Spec 008 D-04). allowed says what the
    // spec means (plan ② D-10, Abweichung).
    expect(uzo?.layout).toEqual({ size: "content", wrap: "allowed" });
  });

  // Spec 010 ③ (G5, plan ③ D-12): the radio group exists; one of a few is its use-instead now.
  it("sends what applies at once to the sxaltilo and one of a few to the elekto", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["immediate", "sxaltilo"],
      ["choose-one-of-few", "elekto"],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/applies at once is a switch/);
    expect(uzo?.instead[1]?.kialo).toMatch(/Fundamento covers it with elekto\.$/);
    expect(uzo?.instead[1]?.kialo).not.toMatch(/PR ③/);
  });

  it("stops at the indeterminate state and at a group, and never without a visible label", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["indeterminate", "not-supported"],
      ["checkbox-group", "ask-human"],
      ["no-visible-label", "not-supported"],
    ]);
    expect(uzo?.boundary[1]?.kialo).toMatch(/heading the form owns/);
    expect(uzo?.boundary[2]?.via).toEqual({ regulo: "field-label-visible" });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a form and a dialog, with the kampo and the butono, never in a slot of the butono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual(["form", "dialog"]);
    // Spec 011 ② (G5): the checkbox names the dialogo among its companions.
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono", "dialogo"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
  });

  it("carries the datum rule adjustable on the label and the error rule fixed on the error", () => {
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
    ]);
  });

  it("the sxaltilo sends needs-confirmation to the markobutono now (G5; ① D-13 closed)", () => {
    const needs = uzoOf("sxaltilo")?.instead.find((entry) => entry.goal === "needs-confirmation");
    expect(needs?.ero).toBe("markobutono");
    expect(needs?.kialo).toMatch(/applies only when the form is sent is a checkbox/);
    expect(needs?.kialo).not.toMatch(/PR ②/);
  });

  it("the butono and the kampo keep toggle with the sxaltilo, one Ero per entry, the form case named in the kialo", () => {
    for (const name of ["butono", "kampo"]) {
      const toggle = uzoOf(name)?.instead.find((entry) => entry.goal === "toggle");
      expect(toggle?.ero, name).toBe("sxaltilo");
      expect(toggle?.kialo, name).toMatch(/\(in a form, applied with it: markobutono\)\.$/);
    }
  });
});

describe("the Reguloj of the markobutono (G6, E5)", () => {
  it.each([
    // Spec 010 ③: the elekto follows the markobutono in each list (E5); ④ the elektilo.
    [
      "field-label-visible",
      ["kampo", "sxaltilo", "markobutono", "elekto", "elektilo", "tekstareo"],
    ],
    [
      "field-label-names-the-datum",
      ["kampo", "sxaltilo", "markobutono", "elekto", "elektilo", "tekstareo"],
    ],
    ["error-says-what-to-do", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo", "avizo"]],
    ["required-marked", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo"]],
    ["error-not-color-only", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo"]],
  ])("%s is widened to the markobutono, not duplicated (E5)", (name, eroj) => {
    expect(named(name)?.appliesTo).toEqual({ eroj });
    expect(named(name)?.statement).toMatch(/markobutono/);
    expect(modelo.reguloj.filter((regulo) => regulo.name === name)).toHaveLength(1);
  });

  it("spacing-owned-by-container applies to the markobutono and every other Ero", () => {
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
    ]);
  });

  it.each(["field-label-names-the-datum", "error-says-what-to-do"])(
    "%s has an approved and a rejected markobutono example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === markobutono?.ero.id,
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
        expect(result.valid, jugxo.id).toBe(jugxo.decision === "approved");
      }
    },
  );

  it("a checkbox without a label violates field-label-visible; with its label it passes", () => {
    const empty = evaluateUsage(modelo, [{ ero: "markobutono", props: { required: true } }]);
    expect(empty.valid).toBe(false);
    expect(empty.violations.map((violation) => violation.issue.rule)).toEqual([
      "field-label-visible",
    ]);
    const right = evaluateUsage(modelo, [
      { ero: "markobutono", props: { required: true }, label: "Ich akzeptiere die AGB" },
    ]);
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
  });

  it("an error text without invalid violates the constraint; 'Pflichtfeld' says nothing about what to do", () => {
    const contradiction = evaluateUsage(modelo, [
      {
        ero: "markobutono",
        props: { required: true },
        label: "Ich akzeptiere die AGB",
        texts: { error: "Akzeptiere die AGB, um fortzufahren" },
      },
    ]);
    expect(contradiction.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    const vague = evaluateUsage(modelo, [
      {
        ero: "markobutono",
        props: { required: true, invalid: true },
        label: "Ich akzeptiere die AGB",
        texts: { error: "Pflichtfeld" },
      },
    ]);
    expect(
      vague.violations.map((violation) => [violation.issue.rule, violation.issue.severity]),
    ).toEqual([["error-says-what-to-do", "error"]]);
  });

  it("the Skemo of the markobutono carries what required-marked and error-not-color-only ask for", () => {
    expect(skemo?.parts["required-mark"]).toBeDefined();
    expect(skemo?.slots.some((slot) => slot.name === "error" && slot.text === true)).toBe(true);
    const issues = validateModelo(defaultModeloSource()).errors.filter(
      (issue) =>
        ["required-marked", "error-not-color-only"].includes(issue.rule) &&
        issue.path.includes("markobutono"),
    );
    expect(issues).toEqual([]);
  });
});

describe("suggest_ero and the checkbox (Gvidanto, section 2)", () => {
  const suggest = (goal: string) => {
    const result = suggestEro(modelo, { goal });
    if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
    return result.output;
  };

  it("'AGB akzeptieren' is a markobutono that must be ticked, with the kialo of required-marked", () => {
    const answer = suggest("AGB akzeptieren");
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: { required: true } });
    expect(answer.matched?.goal).toBe("agree");
    expect(answer.regulo?.name).toBe("required-marked");
    expect(answer.kialo).toBe(named("required-marked")?.kialo);
    expect(answer.action).toBeUndefined();
  });

  it.each(["Newsletter abonnieren", "Remember me"])(
    "'%s' is the opt-in of the markobutono",
    (text) => {
      const answer = suggest(text);
      expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
      expect(answer.matched?.goal).toBe("opt-in");
    },
  );

  it("'Checkbox' is the switch's alternative needs-confirmation: use-instead markobutono now", () => {
    const answer = suggest("Checkbox");
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(answer.boundary).toMatchObject({
      ero: "sxaltilo",
      case: "needs-confirmation",
      action: "use-instead",
    });
  });

  it("'Eine Checkbox, die den Dark Mode sofort einschaltet' is a sxaltilo, not a markobutono", () => {
    const answer = suggest("Eine Checkbox, die den Dark Mode sofort einschaltet");
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.matched?.goal).toBe("toggle");
    expect(answer.action).toBeUndefined();
  });

  it("'sofort' alone is the alternative immediate of the markobutono: use-instead sxaltilo", () => {
    const answer = suggest("Eine Einstellung, die sofort gilt");
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "markobutono",
      case: "immediate",
      action: "use-instead",
      kialo: uzo?.instead[0]?.kialo,
    });
  });

  // Spec 010 ③: the alternative choose-one-of-few says use-instead elekto, and the elekto has
  // the goal choose-few with the word; both say elekto, so the goal answers (Spec 008 D-08).
  it("'Radiobutton' is the elekto since PR ③: the goal choose-few answers, no ask-human", () => {
    const answer = suggest("Radiobutton");
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched?.goal).toBe("choose-few");
    expect(answer.action).toBeUndefined();
  });
});
