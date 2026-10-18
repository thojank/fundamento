// The sxaltilo data (Spec 010 ①; G1–G6, section 1, plan D-01–D-16): the switch in the repo
// Modelo, bound only to role tokens, its Uzo with the label as a required slot and the coming
// checkbox named in a kialo, the new text rule switch-label-names-the-setting with examples right
// and wrong in de and en, field-label-visible and field-label-names-the-datum widened to it (E5),
// and the butono and the kampo pointing their alternative toggle at it (G5).

import { describe, expect, it } from "vitest";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const sxaltilo = modelo.eroj.find((entry) => entry.ero.name === "sxaltilo");
if (sxaltilo === undefined) throw new Error("sxaltilo missing");
const { skemo, uzo } = sxaltilo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const uzoOf = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.uzo;

describe("sxaltilo in the repo Modelo (G1, G2, section 1)", () => {
  it("lives in data/eroj/sxaltilo/skemo.json, after the other Eroj, and the repo Modelo stays valid", () => {
    expect(sxaltilo.file).toBe("modelo/data/eroj/sxaltilo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "ikono",
      "insigno",
      "kampo",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "plenstato",
      "saltligilo",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has checked, size, disabled and name as props; no label, required or invalid (G1, G2)", () => {
    expect(skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual([
      ["checked", "boolean", false],
      ["size", ["small", "medium", "large"], "medium"],
      ["disabled", "boolean", false],
      ["name", "string", undefined],
    ]);
    expect(skemo.states).toEqual(["rest", "hover", "focus", "disabled"]);
    expect(skemo.slots).toEqual([{ name: "label", default: true, text: true, beside: true }]);
  });

  it("names its parts like the butono and the kampo, plus the indicator (D-02)", () => {
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "border",
      "box",
      "focus-ring",
      "indicator",
      "label",
      "motion",
      "surface",
    ]);
    const tokens = [
      ...skemo.bindings.map((binding) => binding.token),
      ...Object.values(skemo.parts).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
  });

  it("colours track, border and knob by checked and state with role tokens only (G3, D-06)", () => {
    const at = (part: string, property: string, checked: string, state: string) =>
      boundToken(skemo, part, property, { checked, state, size: "medium" })?.token;
    expect(at("surface", "fill", "true", "rest")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "hover")).toBe("color.action.primary.hover");
    expect(at("surface", "fill", "true", "focus")).toBe("color.action.primary.rest");
    expect(at("surface", "fill", "true", "disabled")).toBe("color.action.primary.disabled");
    for (const state of skemo.states) {
      expect(at("surface", "fill", "false", state)).toBe("color.background.sunken");
    }
    expect(at("border", "color", "false", "rest")).toBe("color.border.strong");
    expect(at("border", "color", "false", "disabled")).toBe("color.border.disabled");
    expect(at("border", "color", "true", "hover")).toBe("color.action.primary.hover");
    expect(at("indicator", "fill", "true", "rest")).toBe("color.action.primary.text");
    expect(at("indicator", "fill", "false", "rest")).toBe("color.border.strong");
    expect(at("indicator", "fill", "false", "disabled")).toBe("color.border.disabled");
    expect(at("label", "color", "false", "disabled")).toBe("color.text.disabled");
  });

  it("places the knob at start or end by checked, as a term (D-04), and sizes it from role tokens (D-05)", () => {
    expect(boundToken(skemo, "indicator", "position", { checked: "false" })?.token).toBe("start");
    expect(boundToken(skemo, "indicator", "position", { checked: "true" })?.token).toBe("end");
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "indicator", "size", { size })?.token).toBe(`size.icon.${size}`);
      expect(boundToken(skemo, "box", "width", { size })?.token).toBe(`size.control.${size}`);
    }
    expect(boundToken(skemo, "box", "radius", {})?.token).toBe("radius.role.pill");
    expect(boundToken(skemo, "indicator", "radius", {})?.token).toBe("radius.role.pill");
    expect(boundToken(skemo, "box", "gap", {})?.token).toBe("spacing.small");
    // checked × size × state: the Figma set is 2 × 3 × 4 (E2).
    expect(combinationsOf(skemo, ["checked", "size", "state"])).toHaveLength(24);
  });

  it("speaks role switch: name from the label, checked as aria-checked, Space and Enter, no required (D-08)", () => {
    expect(skemo.a11y).toEqual({
      role: "switch",
      name: ["slot:label"],
      states: { checked: ["aria-checked"], disabled: ["aria-disabled"] },
      keys: ["Space", "Enter"],
    });
  });

  it("knows the goal toggle with whole words, no preposition, citing the switch label rule (D-15)", () => {
    expect(skemo.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["toggle", {}, "switch-label-names-the-setting"],
    ]);
    const keywords = skemo.goals?.[0]?.keywords ?? {};
    expect(keywords.en).toEqual(["toggle", "switch", "enable", "disable"]);
    expect(keywords.de).toEqual([
      "umschalten",
      "einschalten",
      "ausschalten",
      "aktivieren",
      "deaktivieren",
      "einschaltet",
      "ausschaltet",
    ]);
    for (const word of ["on", "off", "an", "aus", "zu"]) {
      expect([...(keywords.en ?? []), ...(keywords.de ?? [])]).not.toContain(word);
    }
  });
});

describe("the Uzo of the sxaltilo (section 1, G5, D-13)", () => {
  it("states the purpose of the spec, requires the label and keeps its own size on one line", () => {
    expect(uzo?.purpose).toBe(
      "Turns a setting on or off and applies it at once: notifications, dark mode, a feature.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
  });

  // Spec 010 ② (G5): the checkbox is an Ero now; the alternative says use-instead markobutono
  // (① D-13 closed).
  it("sends needs-confirmation to the markobutono, three states not supported, no visible label via its Regulo", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["needs-confirmation", "markobutono"],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/checkbox/);
    expect(uzo?.instead[0]?.kialo).toMatch(/markobutono/);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["three-states", "not-supported"],
      ["no-visible-label", "not-supported"],
    ]);
    expect(uzo?.boundary[1]?.via).toEqual({ regulo: "field-label-visible" });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a settings list and a dialog, with the kampo, never in a slot of the butono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "settings-list",
      "dialog",
    ]);
    // Spec 011 ② (G5): the switch names the dialogo among its companions.
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "dialogo"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
  });

  it("carries the switch label rule fixed and the datum rule adjustable, both on the label", () => {
    expect(
      uzo?.content.map((entry) => [
        entry.regulo,
        entry.fixed,
        entry.of ?? "slot:label",
        entry.check.kind,
      ]),
    ).toEqual([
      ["switch-label-names-the-setting", true, "slot:label", "not-words"],
      ["field-label-names-the-datum", false, "slot:label", "not-words"],
    ]);
  });

  // Spec 010 ②: the checkbox exists, the kialo names it without the PR (G5: one Ero per entry).
  it("the butono and the kampo send toggle to the sxaltilo, with the checkbox in the kialo (G5)", () => {
    for (const name of ["butono", "kampo"]) {
      const toggle = uzoOf(name)?.instead.find((entry) => entry.goal === "toggle");
      expect(toggle?.ero, name).toBe("sxaltilo");
      expect(toggle?.kialo, name).toMatch(/in a form, applied with it: markobutono\)\.$/);
      // Spec 010 ④: choose-many is the elektilo's now (use-instead, plan ④ D-12).
      expect(uzoOf(name)?.instead.find((entry) => entry.goal === "choose-many")?.ero, name).toBe(
        "elektilo",
      );
    }
    expect(uzoOf("kampo")?.instead.find((entry) => entry.goal === "multi-line")?.ero).toBe(
      "tekstareo",
    );
  });
});

describe("the Reguloj of the sxaltilo (G6, E5, D-14)", () => {
  it("switch-label-names-the-setting is new, judges instances and cites the APG switch pattern", () => {
    const regulo = named("switch-label-names-the-setting");
    expect(regulo?.appliesTo).toEqual({ eroj: ["sxaltilo"] });
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/APG/);
    expect(regulo?.kialo).toMatch(/4\.1\.2/);
    expect(USAGE_ENFORCERS["switch-label-names-the-setting"]).toBeDefined();
    expect(REGULO_ENFORCERS["switch-label-names-the-setting"]).toBeUndefined();
  });

  it.each(["field-label-visible", "field-label-names-the-datum"])(
    "%s is widened to the sxaltilo, not duplicated (E5)",
    (name) => {
      // Spec 010 ②: widened once more, to the markobutono (E5); ③ to the elekto, ④ the elektilo;
      // Spec 011 ② to the tekstareo.
      expect(named(name)?.appliesTo).toEqual({
        eroj: [
          "kampo",
          "sxaltilo",
          "markobutono",
          "elekto",
          "elektilo",
          "tekstareo",
          "kompletigilo",
        ],
      });
      expect(modelo.reguloj.filter((regulo) => regulo.name === name)).toHaveLength(1);
    },
  );

  it("spacing-owned-by-container applies to every Ero", () => {
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
    ]);
  });

  it.each(["switch-label-names-the-setting", "field-label-names-the-datum"])(
    "%s has an approved and a rejected sxaltilo example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === sxaltilo.ero.id,
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

  it("'Benachrichtigungen einschalten' violates the switch label rule (fixed); 'Benachrichtigungen' passes", () => {
    const wrong = evaluateUsage(modelo, [
      { ero: "sxaltilo", props: {}, label: "Benachrichtigungen einschalten" },
    ]);
    expect(wrong.valid).toBe(false);
    expect(
      wrong.violations.map((violation) => [violation.issue.rule, violation.issue.severity]),
    ).toEqual([["switch-label-names-the-setting", "error"]]);
    expect(wrong.violations[0]?.issue.suggestion).toContain("Benachrichtigungen");
    const right = evaluateUsage(modelo, [
      { ero: "sxaltilo", props: { checked: true }, label: "Benachrichtigungen" },
    ]);
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
  });

  it("a switch without a label violates field-label-visible; a butono in its label slot is no text", () => {
    const empty = evaluateUsage(modelo, [{ ero: "sxaltilo", props: {} }]);
    expect(empty.violations.map((violation) => violation.issue.rule)).toEqual([
      "field-label-visible",
    ]);
    const nested = evaluateUsage(modelo, [
      { ero: "sxaltilo", props: {}, label: "Dark Mode", slots: { label: [{ ero: "butono" }] } },
    ]);
    expect(nested.valid).toBe(false);
    expect(nested.violations.map((violation) => violation.issue.rule)).toContain(
      "uzo-slot-accepts",
    );
  });

  it("declares the KontrastParo of the knob on the unchecked track; the track is found by its border (D-16)", () => {
    const pair = (name: string) =>
      modelo.kontrastParoj.find((candidate) => candidate.name === name);
    expect(pair("border-strong-on-background-sunken")).toMatchObject({
      foreground: "color.border.strong",
      background: "color.background.sunken",
      kategorio: "ui",
    });
    // The unchecked track stands out from the page by its border, not by its fill (sunken on
    // default is about 1.2:1 by design); the border's pair is the field's (Spec 009).
    expect(pair("border-strong-on-background-default")?.kategorio).toBe("ui");
    expect(pair("background-sunken-on-background-default")).toBeUndefined();
    // The knob on the checked track is the pair of the butono's label on its fill (7.76:1 min).
    expect(pair("action-primary-text-on-fill")).toBeDefined();
  });
});

describe("suggest_ero and the switch (Gvidanto, example dialog)", () => {
  const suggest = (goal: string) => {
    const result = suggestEro(modelo, { goal });
    if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
    return result.output;
  };

  it("'Ich brauche einen Button, mit dem man den Dark Mode einschaltet' is a sxaltilo, not a button", () => {
    const answer = suggest("Ich brauche einen Button, mit dem man den Dark Mode einschaltet");
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.matched).toEqual({ goal: "toggle", keyword: "einschaltet", lingvo: "de" });
    expect(answer.regulo?.name).toBe("switch-label-names-the-setting");
    expect(answer.kialo).toBe(named("switch-label-names-the-setting")?.kialo);
  });

  it("'Toggle' hits the butono's alternative and the sxaltilo's goal: both say sxaltilo, the goal answers", () => {
    const answer = suggest("Toggle");
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.action).toBeUndefined();
  });

  // Spec 010 ②: the alternative needs-confirmation says use-instead markobutono.
  it("'Checkbox' is the alternative needs-confirmation of the sxaltilo: the markobutono since PR ②", () => {
    const answer = suggest("Checkbox");
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(answer.boundary).toMatchObject({
      ero: "sxaltilo",
      case: "needs-confirmation",
      action: "use-instead",
    });
  });
});
