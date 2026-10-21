// The mezurilo data (Spec 011 ④; G1–G7, section ④, plan ④ D-03, D-06): the meter in the repo
// Modelo — a known value in a known range with its number; intent is its axis, rest its only
// state (G2); an unknown value is not 0 (G4: no aria-valuenow, the text says "nicht geprüft"). The
// new Regulo meter-text-states-value (fixed, min-words on the value text). The cross-links of G5:
// a value in a range is the meter's (the insigno sends it here, closing ③'s null), a status word
// the insigno's.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const mezurilo = eroNamed("mezurilo");
const skemo = mezurilo?.skemo;
const uzo = mezurilo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("mezurilo in the repo Modelo (section ④, G1, G2)", () => {
  it("lives in data/eroj/mezurilo/skemo.json, among thirty-four Eroj", () => {
    expect(mezurilo?.file).toBe("modelo/data/eroj/mezurilo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "alsxutilo",
      "apartigilo",
      "atributlisto",
      "avataro",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "ikono",
      "insigno",
      "kampo",
      "karto",
      "kodbloko",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markdovido",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "saltligilo",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
  });

  it("has value (a number, empty = unknown), min 0, max 100 and intent (neutral, success, warning, danger); one state, rest", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["value", "number", undefined],
        ["min", "number", 0],
        ["max", "number", 100],
        ["intent", ["neutral", "success", "warning", "danger"], "neutral"],
        // Nachlese 7 ② B-2.
        ["label-hidden", "boolean", false],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("has the slots label (default, required) and value-text (required, visible and the aria-valuetext)", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "value-text", text: true },
    ]);
  });

  it("names its parts: track, fill keyed by intent, unknown with a dashed stroke, label, value-text, box", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "box",
      "fill",
      "label",
      "track",
      "unknown",
      "value-text",
    ]);
    expect(skemo.parts.track?.fill).toEqual({ fixed: "color.background.sunken" });
    expect(skemo.parts.track?.radius).toEqual({ fixed: "radius.role.pill" });
    expect(skemo.parts.track?.height).toEqual({ fixed: "spacing.medium" });
    expect(skemo.parts.fill?.color).toEqual({ by: ["intent"] });
    // Not the brand fill of the spec: on the sunken track it measures 1,3:1 in ekzemplo light
    // (yellow on grey); the strong border colour is a declared foreground on sunken (≥ 5,58:1).
    expect(boundToken(skemo, "fill", "color", { intent: "neutral" })?.token).toBe(
      "color.border.strong",
    );
    // The strong status colour (border), not basic: warning.basic measured 1,23:1 on the sunken
    // track in ekzemplo light; the border colours are declared on sunken (ui, ≥ 3:1).
    for (const intent of ["success", "warning", "danger"]) {
      expect(boundToken(skemo, "fill", "color", { intent })?.token).toBe(
        `color.status.${intent}.border`,
      );
    }
    expect(skemo.parts.unknown?.stroke).toEqual({ fixed: "stroke.dashed" });
    expect(skemo.parts.unknown?.color).toEqual({ fixed: "color.border.default" });
    expect(skemo.parts.label?.typography).toEqual({ fixed: "typography.label.1" });
    expect(skemo.parts["value-text"]?.typography).toEqual({ fixed: "typography.label.2" });
    expect(styledProps(skemo)).toEqual(["intent"]);
    expect(variantKeys(skemo)).toEqual(["intent", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(4);
  });

  it("speaks role meter, named by its label; the value text is its description (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "meter",
      name: ["slot:label"],
      description: ["slot:value-text"],
      states: {},
      keys: [],
    });
  });

  it("knows the goal meter with the words of the spec, citing meter-text-states-value", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.regulo])).toEqual([
      ["meter", "meter-text-states-value"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["meter", "gauge", "percentage", "score", "level"],
      de: ["messbalken", "anteil", "prozent", "quote", "stand"],
    });
  });
});

describe("the KontrastParoj of the meter (G3)", () => {
  it("declares the strong status colours and the strong border on the sunken track as ui pairs", () => {
    const pairs = modelo.kontrastParoj.filter(
      (pair) => pair.background === "color.background.sunken",
    );
    for (const intent of ["success", "warning", "danger"]) {
      const pair = pairs.find(
        (candidate) => candidate.foreground === `color.status.${intent}.border`,
      );
      expect(pair?.kategorio, intent).toBe("ui");
    }
    expect(pairs.some((pair) => pair.foreground === "color.border.strong")).toBe(true);
  });
});

describe("the Uzo of the mezurilo (section ④, G5)", () => {
  it("states the purpose, requires label and value text; size container, never wraps", () => {
    expect(uzo?.purpose).toBe(
      "Shows a known value within a known range, with its number: 66 % conform, 3 of 5 checked.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      "value-text": { accepts: ["text"], required: true, max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
  });

  it("names task progress as a person's decision, sends a status word to the insigno; stops at a chart and at segments", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["task-progress", null],
      ["status-word", "insigno"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["chart", "not-supported"],
      ["multi-segment", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a table cell, an attribute value and a page section", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "tabelo",
      "atributlisto",
      "page-section",
    ]);
  });

  it("carries meter-text-states-value, fixed, as min-words 2 on the value text", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "meter-text-states-value",
        fixed: true,
        of: "slot:value-text",
        check: { kind: "min-words", count: 2 },
      },
    ]);
  });

  it("the brief names intent as the axis, label and value text as duties, and stays under 750", () => {
    if (mezurilo === undefined) throw new Error("missing");
    const brief = briefOf(mezurilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["intent"]);
    expect(brief.required).toEqual({ props: [], slots: ["label", "value-text"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5: a value in a range is the meter's, a status word the insigno's", () => {
  it("the insigno's instead value-in-range is use-instead mezurilo now (it said null in ③)", () => {
    const entry = eroNamed("insigno")?.uzo?.instead.find((item) => item.goal === "value-in-range");
    expect(entry?.ero).toBe("mezurilo");
    expect(entry?.kialo).not.toContain("no such Ero yet");
  });

  it("'Anteil in Prozent' and 'Konformität in Prozent' are the mezurilo (the badge's instead and the meter's goal agree)", () => {
    expect(suggest("Anteil in Prozent").suggestion).toEqual({ ero: "mezurilo", props: {} });
    const ratio = suggest("Konformität in Prozent");
    expect(ratio.suggestion).toEqual({ ero: "mezurilo", props: {} });
    expect(ratio.matched?.goal).toBe("meter");
  });

  it("'ein Statuswort statt einer Zahl' is the insigno; a chart and a segmented bar stop", () => {
    expect(suggest("Status statt Zahl: Etikett").suggestion).toEqual({
      ero: "insigno",
      props: {},
    });
    expect(suggest("ein Diagramm der Verstöße").boundary).toMatchObject({
      ero: "mezurilo",
      case: "chart",
      action: "not-supported",
    });
  });
});

describe("the Reguloj of the mezurilo (G6)", () => {
  it("meter-text-states-value is new, fixed, automatic, the mezurilo's alone; spacing is widened", () => {
    const regulo = named("meter-text-states-value");
    expect(regulo?.appliesTo?.eroj).toEqual(["mezurilo"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/colour|0 is/i);
    expect(USAGE_ENFORCERS["meter-text-states-value"]).toBeDefined();
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("mezurilo");
  });

  it("has an approved and a rejected example in de and en that evaluate as they say", () => {
    const regulo = named("meter-text-states-value");
    if (regulo === undefined) throw new Error("missing");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    for (const jugxo of examples) {
      const instances = jugxo.ekzemplo?.instances ?? [];
      const rules = rulesOf(evaluateUsage(modelo, instances)).map(([rule]) => rule);
      if (jugxo.decision === "approved") expect(rules, jugxo.id).toEqual([]);
      else expect(rules, jugxo.id).toEqual(["meter-text-states-value"]);
      expect(jugxo.ref).toEqual({ ero: mezurilo?.ero.id });
    }
  });
});

describe("check_usage of the meter (G6, G7)", () => {
  const judge = (valueText: string, props: Record<string, string | number> = {}) =>
    rulesOf(
      evaluateUsage(modelo, [
        { ero: "mezurilo", props, label: "Konformität", texts: { "value-text": valueText } },
      ]),
    );

  it("'66 % von 3 prüfbaren' and 'nicht geprüft' pass; '0 %' and '66 %' alone violate the rule", () => {
    expect(judge("66 % von 3 prüfbaren", { value: 66 })).toEqual([]);
    expect(judge("nicht geprüft")).toEqual([]);
    expect(judge("0 %")).toEqual([["meter-text-states-value", "error"]]);
    expect(judge("66 %", { value: 66 })).toEqual([["meter-text-states-value", "error"]]);
  });
});
