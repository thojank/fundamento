// The langetaro data (Spec 011 ⑤; G1–G7, section ⑤, plan ⑤ D-02, D-05): the tabs in the repo
// Modelo — switch between views of one thing on one page; `active` is the state of one tab
// (SkemoSlot.entry, E7; the prop is `selected`, the id of the chosen tab), never colour alone
// (bold weight is no role — the underline carries it); option-labels-distinct is widened (E5). The
// cross-links of G5: a choice in a form is the elekto's, pages are the navigado's.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, entryKeysOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const langetaro = eroNamed("langetaro");
const skemo = langetaro?.skemo;
const uzo = langetaro?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("langetaro in the repo Modelo (section ⑤, G1, G2, E7)", () => {
  it("lives in data/eroj/langetaro/skemo.json, ninth of seventeen Eroj", () => {
    expect(langetaro?.file).toBe("modelo/data/eroj/langetaro/skemo.json");
    expect(modelo.eroj[8]?.ero.name).toBe("langetaro");
  });

  it("has label (a duty) and selected (the id of the chosen tab) as props; the states of a tab", () => {
    expect(
      skemo?.props.map((prop) => [
        prop.name,
        prop.values ?? prop.kind,
        prop.default,
        prop.required,
      ]),
    ).toEqual([
      ["label", "string", undefined, true],
      ["selected", "string", undefined, undefined],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled"]);
  });

  it("has the slots tabs (default; every tab an entry with the key active, true for the selected id) and panel", () => {
    expect(skemo?.slots).toEqual([
      { name: "tabs", default: true, text: true, entry: { key: "active", equals: "selected" } },
      { name: "panel" },
    ]);
    if (skemo === undefined) throw new Error("missing");
    expect(entryKeysOf(skemo)).toEqual([{ slot: "tabs", key: "active", equals: "selected" }]);
  });

  it("names its parts: tab keyed by state, tabs (the text) by active, the selected indicator, the list's line, the panel, focus-ring", () => {
    if (skemo === undefined) throw new Error("missing");
    // The text of the tabs is the part named after the slot (tabs): so the pair rule pairs its
    // colour with the tab's fill in every combination (skemo-kontrastparo-missing).
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "focus-ring",
      "list",
      "panel",
      "selected-indicator",
      "tab",
      "tabs",
    ]);
    expect(skemo.parts.tab?.fill).toEqual({ by: ["state"] });
    expect(boundToken(skemo, "tab", "fill", { state: "hover" })?.token).toBe(
      "color.action.tertiary.hover",
    );
    expect(boundToken(skemo, "tab", "fill", { state: "disabled" })?.token).toBe(
      "color.action.tertiary.disabled",
    );
    expect(skemo.parts.tabs?.color).toEqual({ by: ["active"] });
    expect(boundToken(skemo, "tabs", "color", { active: "true" })?.token).toBe(
      "color.text.default",
    );
    expect(boundToken(skemo, "tabs", "color", { active: "false" })?.token).toBe(
      "color.text.subtle",
    );
    expect(skemo.parts.tabs?.typography).toEqual({ fixed: "typography.label.1" });
    expect(skemo.parts.tab?.height).toEqual({ fixed: "size.target.min" });
    expect(skemo.parts["selected-indicator"]?.width).toEqual({ by: ["active"] });
    expect(boundToken(skemo, "selected-indicator", "width", { active: "true" })?.token).toBe(
      "border.width.strong",
    );
    expect(boundToken(skemo, "selected-indicator", "width", { active: "false" })?.token).toBe(
      "none",
    );
    // Nachbesserung F-7 (Abnahme 16.10.): color.navigation.selected is a background role — on the
    // light ground of komuna the indicator was invisible (a Spec error). The indicator binds the
    // brand fill, declared against the default ground as a ui pair (3:1, WCAG 1.4.11).
    expect(skemo.parts["selected-indicator"]?.color).toEqual({ fixed: "color.brand.fill" });
    expect(skemo.parts.list?.color).toEqual({ fixed: "color.border.default" });
    expect(skemo.parts.list?.width).toEqual({ fixed: "border.width.default" });
    expect(skemo.parts.panel?.["inline-padding"]).toEqual({ fixed: "spacing.medium" });
    // The panel is text of the Ero (axe measured black on the dark page without it, as ④ B-8).
    expect(skemo.parts.panel?.color).toEqual({ fixed: "color.text.default" });
    expect(styledProps(skemo)).toEqual([]);
    // The state of one entry (active) is no variant of the Ero (E7): the variants are the state alone.
    expect(variantKeys(skemo)).toEqual(["state"]);
    expect(combinationsOf(skemo, ["active", "state"])).toHaveLength(8);
  });

  it("speaks role tablist, named by its label; active is the state of a tab (aria-selected), disabled too; the arrows, Home and End (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "tablist",
      name: ["prop:label"],
      states: { active: ["aria-selected"], disabled: ["aria-disabled"] },
      keys: ["ArrowLeft", "ArrowRight", "Home", "End"],
    });
  });

  it("knows the goal switch-view with the words of the spec, citing option-labels-distinct", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.regulo])).toEqual([
      ["switch-view", "option-labels-distinct"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["tabs", "tabbar", "views", "sections"],
      de: ["reiter", "tabs", "registerkarten", "ansichten"],
    });
  });
});

describe("the KontrastParo of the indicator (F-7, G3)", () => {
  it("declares the brand fill on the default ground as a ui pair (3:1): the indicator is a graphic", () => {
    const pair = modelo.kontrastParoj.find(
      (candidate) =>
        candidate.foreground === "color.brand.fill" &&
        candidate.background === "color.background.default",
    );
    expect(pair?.kategorio).toBe("ui");
  });
});

describe("the Uzo of the langetaro (section ⑤, G5)", () => {
  it("states the purpose, requires at least two tabs and the panel; size container, never wraps", () => {
    expect(uzo?.purpose).toBe(
      "Switches between views of the same thing on one page: content, versions, rules, audit.",
    );
    expect(uzo?.slots).toEqual({
      tabs: { accepts: ["text"], required: true, min: 2, nesting: 0 },
      panel: { accepts: ["text"], required: true, max: 1, nesting: 1 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
  });

  it("sends a choice in a form to the elekto and pages to the navigado; names its boundaries", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["form-choice", "elekto"],
      ["pages", "navigado"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      // "overflow" is a web term of the Uzo (uzo-web-term): the case is named by what it is.
      ["many-tabs", "ask-human"],
      ["closable-tabs", "not-supported"],
      ["manual-activation", "ask-human"],
      ["vertical-tabs", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section; carries option-labels-distinct, fixed, as distinct on the tabs", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.content).toEqual([
      {
        regulo: "option-labels-distinct",
        fixed: true,
        of: "slot:tabs",
        check: { kind: "distinct" },
      },
    ]);
  });

  it("the brief names active as the axis of the tabs, label as a duty, panel and tabs as duties, and stays under 750", () => {
    if (langetaro === undefined) throw new Error("missing");
    const brief = briefOf(langetaro);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["active"]);
    expect(brief.required.props).toEqual(["label"]);
    expect([...brief.required.slots].sort()).toEqual(["panel", "tabs"]);
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the langetaro (G6, E5)", () => {
  it("option-labels-distinct is widened to the langetaro (E5); spacing too", () => {
    expect(named("option-labels-distinct")?.appliesTo?.eroj).toEqual([
      "elekto",
      "elektilo",
      "langetaro",
    ]);
    expect(named("option-labels-distinct")?.statement).toContain("langetaro");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("langetaro");
  });

  it("two tabs with the same text violate the rule; distinct tabs pass", () => {
    const judge = (tabs: string[]) =>
      rulesOf(
        evaluateUsage(modelo, [
          { ero: "langetaro", props: { label: "Standard" }, texts: { tabs } },
        ]),
      );
    expect(judge(["Inhalt", "Versionen", "Regeln"])).toEqual([]);
    expect(judge(["Inhalt", "Inhalt"])).toEqual([["option-labels-distinct", "error"]]);
  });
});

describe("suggest_ero of the tabs (Gvidanto)", () => {
  it("'Reiter Inhalt, Versionen, Regeln' is the langetaro; 'Registerkarten' too", () => {
    expect(suggest("Reiter für Inhalt, Versionen und Regeln").suggestion).toEqual({
      ero: "langetaro",
      props: {},
    });
    expect(suggest("Registerkarten einer Akte").suggestion).toEqual({
      ero: "langetaro",
      props: {},
    });
  });

  it("'eine Wahl im Formular' is the elekto with the tabs' reason; closable tabs stop; vertical tabs ask a person", () => {
    const choice = suggest("eine Wahl im Formular");
    expect(choice.suggestion).toEqual({ ero: "elekto", props: {} });
    // "Reiter" beside the boundary word would be the tabs' own goal next to their own boundary:
    // a conflict a person decides (Spec 011 ② D-10); the boundary alone answers.
    expect(suggest("mit Kreuz schließbar").boundary).toMatchObject({
      ero: "langetaro",
      case: "closable-tabs",
      action: "not-supported",
    });
    expect(suggest("senkrechte Reiter am Rand").action).toBe("ask-human");
    expect(suggest("senkrecht am Rand angeordnet").boundary).toMatchObject({
      ero: "langetaro",
      case: "vertical-tabs",
      action: "ask-human",
    });
  });
});
