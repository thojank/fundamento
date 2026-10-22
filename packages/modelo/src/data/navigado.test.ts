// The navigado data (Spec 011 ⑤; G1–G7, section ⑤, E10, plan ⑤ D-01, D-04): the navigation in the
// repo Modelo — leads between the main pages and shows where the person is; the links stay in the
// light DOM (native anchors), `current` is the state of one entry (SkemoSlot.entry, E7), never
// colour alone (bold and underline). Two link Reguloj are widened to it (E5). The cross-links of G5:
// a single link is the ligilo's, a switch of views the langetaro's.

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
const navigado = eroNamed("navigado");
const skemo = navigado?.skemo;
const uzo = navigado?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("navigado in the repo Modelo (section ⑤, G1, G2, E7)", () => {
  it("lives in data/eroj/navigado/skemo.json, among thirty-six Eroj", () => {
    expect(navigado?.file).toBe("modelo/data/eroj/navigado/skemo.json");
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

  it("has orientation, label (a duty) and page (the key of the current page) as props; the states of an item", () => {
    expect(
      skemo?.props.map((prop) => [
        prop.name,
        prop.values ?? prop.kind,
        prop.default,
        prop.required,
      ]),
    ).toEqual([
      ["orientation", ["horizontal", "vertical"], "horizontal", undefined],
      ["label", "string", undefined, true],
      ["page", "string", undefined, undefined],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus"]);
  });

  it("has one slot items (default): every item an entry with the key current, true for the page (E7)", () => {
    expect(skemo?.slots).toEqual([
      { name: "items", default: true, text: true, entry: { key: "current", equals: "page" } },
    ]);
    if (skemo === undefined) throw new Error("missing");
    expect(entryKeysOf(skemo)).toEqual([{ slot: "items", key: "current", equals: "page" }]);
  });

  it("names its parts: item keyed by current and state, items (the text) by current, the underline of the current page, box, focus-ring", () => {
    if (skemo === undefined) throw new Error("missing");
    // The text of the items is the part named after the slot (items): so the pair rule pairs
    // its colour with the item's fill in every combination (skemo-kontrastparo-missing).
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "box",
      "focus-ring",
      "item",
      "items",
      "underline",
    ]);
    expect(skemo.parts.item?.fill).toEqual({ by: ["current", "state"] });
    expect(boundToken(skemo, "item", "fill", { current: "false", state: "rest" })?.token).toBe(
      "color.navigation.rest",
    );
    expect(boundToken(skemo, "item", "fill", { current: "false", state: "hover" })?.token).toBe(
      "color.navigation.hover",
    );
    expect(boundToken(skemo, "item", "fill", { current: "true", state: "rest" })?.token).toBe(
      "color.navigation.selected",
    );
    expect(skemo.parts.items?.color).toEqual({ by: ["current"] });
    expect(boundToken(skemo, "items", "color", { current: "true" })?.token).toBe(
      "color.navigation.text.selected",
    );
    expect(boundToken(skemo, "items", "color", { current: "false" })?.token).toBe(
      "color.navigation.text.rest",
    );
    expect(skemo.parts.items?.typography).toEqual({ fixed: "typography.label.1" });
    // Spec 014 ① (Gewicht): the current item is heavier too — weight by current, semibold where
    // current, none (the role's own weight stands) elsewhere; the underline stays (G4).
    expect(skemo.parts.items?.weight).toEqual({ by: ["current"] });
    expect(boundToken(skemo, "items", "weight", { current: "true" })?.token).toBe(
      "font.weight.semibold",
    );
    expect(boundToken(skemo, "items", "weight", { current: "false" })?.token).toBe("none");
    // The current page is never colour alone (G4): the underline of border.width.strong.
    expect(skemo.parts.underline?.width).toEqual({ by: ["current"] });
    expect(boundToken(skemo, "underline", "width", { current: "true" })?.token).toBe(
      "border.width.strong",
    );
    expect(boundToken(skemo, "underline", "width", { current: "false" })?.token).toBe("none");
    expect(skemo.parts.box?.height).toEqual({ fixed: "size.target.min" });
    expect(skemo.parts.box?.radius).toEqual({ fixed: "radius.role.control" });
    expect(styledProps(skemo)).toEqual([]);
    // The state of one entry (current) is no variant of the Ero (E7): the variants are the state alone.
    expect(variantKeys(skemo)).toEqual(["state"]);
    expect(combinationsOf(skemo, ["current", "state"])).toHaveLength(6);
  });

  it("speaks role navigation, named by its label; current is the state of an item (aria-current)", () => {
    expect(skemo?.a11y).toEqual({
      role: "navigation",
      name: ["prop:label"],
      states: { current: ["aria-current"] },
      keys: [],
    });
  });

  it("knows the goal navigate-app with words that no other Ero has, citing link-label-names-destination", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.regulo])).toEqual([
      ["navigate-app", "link-label-names-destination"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      // Not "navigation" (the ligilo's goal navigate) and not "menu"/"menü" (the tabelo's boundary
      // row-actions-menu): the words of the spec that another Ero holds stay with it (④ B-4).
      // Nachlese 3 G1 (O-28): "navigation" and "menu"/"menü" come to the navigado; the ligilo
      // keeps navigate/navigieren and overview/übersicht (one destination). "main menu" is two
      // words and no keyword can hit it (wordsOf splits): hauptmenü stands for it.
      en: ["navbar", "sidebar", "nav", "navigation", "menu"],
      de: [
        "hauptnavigation",
        "hauptmenü",
        "seitenleiste",
        "navigationsleiste",
        "navigation",
        "menü",
      ],
    });
  });
});

describe("the Uzo of the navigado (section ⑤, G5)", () => {
  it("states the purpose, requires at least two items; size container, wraps (horizontal breaks, the order stays)", () => {
    expect(uzo?.purpose).toBe(
      "Leads between the main pages of an application and shows where the person is.",
    );
    expect(uzo?.slots).toEqual({
      items: { accepts: ["text"], required: true, min: 2, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
  });

  it("sends a single link to the ligilo, a switch of views to the langetaro; steps are a person's decision", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["single-link", "ligilo"],
      ["switch-view", "langetaro"],
      ["steps", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["submenu", "ask-human"],
      ["collapsed-mobile", "not-supported"],
      // Spec 015 ①: the breadcrumb is the spuro's.
      ["breadcrumb", "use-instead"],
      // Nachlese 8 ① F-1: a sidebar that slides in is a drawer, a person decides.
      ["drawer", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in the shell, with ligilo and insigno (the counter)", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["shell"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["ligilo", "insigno"]);
  });

  it("carries link-label-names-destination, fixed, as not-words on the items", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "link-label-names-destination",
        fixed: true,
        of: "slot:items",
        check: {
          kind: "not-words",
          words: { de: ["hier", "klicken", "mehr", "link"], en: ["here", "click", "more", "link"] },
        },
      },
    ]);
  });

  it("the brief names current as an axis of the items, label as a duty, and stays under 750", () => {
    if (navigado === undefined) throw new Error("missing");
    const brief = briefOf(navigado);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["orientation", "current"]);
    expect(brief.required).toEqual({ props: ["label"], slots: ["items"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the navigado (G6, E5)", () => {
  it("link-label-names-destination and link-not-color-only are widened to the navigado; spacing too", () => {
    expect(named("link-label-names-destination")?.appliesTo?.eroj).toEqual([
      "ligilo",
      "navigado",
      "saltligilo",
      "spuro",
    ]);
    expect(named("link-not-color-only")?.appliesTo?.eroj).toEqual(["ligilo", "navigado"]);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("navigado");
  });

  it("an item 'hier' violates the destination rule; 'Standards' passes", () => {
    // At least two items (uzo-slot-min): a navigation with one place is a ligilo.
    const judge = (items: string[]) =>
      rulesOf(
        evaluateUsage(modelo, [
          { ero: "navigado", props: { label: "Hauptnavigation" }, texts: { items } },
        ]),
      );
    expect(judge(["Standards", "Versionen"])).toEqual([]);
    expect(judge(["hier", "Versionen"])).toEqual([["link-label-names-destination", "error"]]);
    expect(judge(["Standards"])).toEqual([["uzo-slot-min", "error"]]);
  });
});

describe("Nachlese 3 G1: 'Navigation' leads to the navigado (O-28, OP-12)", () => {
  it("'Navigation' is the navigado; 'Link zur Datenschutzerklärung' stays the ligilo", () => {
    expect(suggest("Navigation").suggestion).toEqual({ ero: "navigado", props: {} });
    expect(suggest("Navigation").matched?.goal).toBe("navigate-app");
    expect(suggest("Link zur Datenschutzerklärung").suggestion).toEqual({
      ero: "ligilo",
      props: {},
    });
  });

  it("carries a Jugxo for the answer that changed: 'Navigation' → navigado instead of ligilo", () => {
    const jugxo = modelo.jugxoj.find(
      (candidate) =>
        "ero" in candidate.ref &&
        candidate.ref.ero === navigado?.ero.id &&
        candidate.kialo.includes("Wer Navigation sagt, meint die Menge mit aktueller Seite"),
    );
    expect(jugxo?.decision).toBe("approved");
    expect(jugxo?.context).toMatch(/OP-12/);
  });
});

describe("Nachlese 3 G2: a tie of two goals asks a person", () => {
  it("'Tabs, um zwischen Liste und Formular zu wechseln' hits the elektilo (liste) and the langetaro (tabs) alike: ask-human with both", () => {
    const answer = suggest("Tabs, um zwischen Liste und Formular zu wechseln");
    expect(answer.action).toBe("ask-human");
    expect(answer.suggestion).toBeNull();
    // The goals of both Eroj, in Ero order; a boundary that hit stands first with its kialo.
    expect(
      answer.candidates
        ?.filter((candidate) => candidate.kind === "goal")
        .map((candidate) => [candidate.ero, candidate.goal]),
    ).toEqual([
      ["elektilo", "choose-many"],
      ["langetaro", "switch-view"],
    ]);
    for (const candidate of answer.candidates ?? []) {
      expect(candidate.keyword.length).toBeGreaterThan(0);
      expect(candidate.kialo?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("a hit on one Ero only is no tie: 'Registerkarten einer Akte' stays the langetaro", () => {
    expect(suggest("Registerkarten einer Akte").suggestion).toEqual({
      ero: "langetaro",
      props: {},
    });
  });
});

describe("suggest_ero of the navigation (Gvidanto)", () => {
  it("'Hauptnavigation mit aktueller Seite' is the navigado; 'Seitenleiste' too", () => {
    expect(suggest("Hauptnavigation mit aktueller Seite").suggestion).toEqual({
      ero: "navigado",
      props: {},
    });
    expect(suggest("eine Seitenleiste").suggestion).toEqual({ ero: "navigado", props: {} });
  });

  it("'ein einzelner Verweis' is the ligilo; a hamburger menu stops; a breadcrumb is the spuro's", () => {
    expect(suggest("ein einzelner Verweis").suggestion).toEqual({ ero: "ligilo", props: {} });
    // "Menü" is the navigado's own goal word since Nachlese 3 G1: beside the own boundary it is
    // a conflict a person decides (Spec 011 ② D-10); the boundary alone answers "Hamburger".
    expect(suggest("ein Hamburger für schmale Bildschirme").boundary).toMatchObject({
      ero: "navigado",
      case: "collapsed-mobile",
      action: "not-supported",
    });
    // Spec 015 ①: the breadcrumb is the spuro's, with the navigado's reason.
    expect(suggest("Brotkrumen über der Seite").suggestion).toEqual({ ero: "spuro", props: {} });
    expect(suggest("Brotkrumen über der Seite").boundary).toMatchObject({
      ero: "navigado",
      case: "breadcrumb",
      action: "use-instead",
    });
  });
});
