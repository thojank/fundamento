// The menuo data (Spec 014 ④; G4, G5, G6, section ④, plan ④ D-03): the action menu in the repo
// Modelo — actions for one object behind a single button: edit, duplicate, delete. A layer of the
// platform anchored to its trigger with the roles menu and menuitem, walked with the arrow keys;
// an entry fires select with its id. An entry of intent danger stands in the danger text colour,
// groups are separated by an apartigilo; label-names-action and option-labels-distinct are widened
// to its entries (E5); the tabelo sends its row actions here (its boundary closes).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const menuo = eroNamed("menuo");
const skemo = menuo?.skemo;
const uzo = menuo?.uzo;
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

describe("menuo in the repo Modelo (section ④, G1, G2, G4)", () => {
  it("lives in data/eroj/menuo/skemo.json, one of thirty-two Eroj", () => {
    expect(menuo?.file).toBe("modelo/data/eroj/menuo/skemo.json");
    expect(modelo.eroj).toHaveLength(32);
  });

  it("has label (optional, the Modelo's words stand in), placement (block-end) and open as props; the states of an entry; items (default) and trigger slots", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default, prop.required])).toEqual(
      [
        ["label", "string", undefined, undefined],
        ["placement", "enum", "block-end", undefined],
        ["open", "boolean", false, undefined],
      ],
    );
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled"]);
    expect(skemo?.slots).toEqual([
      { name: "items", default: true, text: true },
      { name: "trigger" },
    ]);
    // Only the state is an axis: placement keys no part, label and open are no axes (E7).
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
    expect(combinationsOf(skemoOrThrow(), ["state"])).toHaveLength(4);
  });

  it("names its parts: the raised surface like the popover's, the item by state, the danger item, box and focus ring", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "surface",
      "border",
      "item",
      "danger-item",
      "box",
      "focus-ring",
    ]);
    expect(skemo?.parts.surface?.shadow).toEqual({ fixed: "elevation.shadow.overlay" });
    expect(skemo?.parts.surface?.width).toEqual({ fixed: "size.container.small" });
    expect(skemo?.parts.item).toEqual({
      fill: { by: ["state"] },
      color: { by: ["state"] },
      typography: { fixed: "typography.label.1" },
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts["danger-item"]).toEqual({ color: { fixed: "color.status.danger.text" } });
    if (skemo === undefined) throw new Error("missing");
    expect(boundToken(skemo, "item", "fill", { state: "hover" })?.token).toBe(
      "color.action.tertiary.hover",
    );
    expect(boundToken(skemo, "item", "color", { state: "disabled" })?.token).toBe(
      "color.text.disabled",
    );
  });

  it("speaks role menu, named by its label, disabled as aria-disabled of an entry; the keys of a menu button; the words that stand in for an empty label (G5)", () => {
    expect(skemo?.a11y.role).toBe("menu");
    expect(skemo?.a11y.name).toEqual(["prop:label"]);
    expect(skemo?.a11y.states).toEqual({ disabled: ["aria-disabled"] });
    expect(skemo?.a11y.keys).toEqual([
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "Escape",
      "Enter",
      "Space",
    ]);
    expect(skemo?.a11y.texts).toEqual({
      "label-empty": { de: "Weitere Aktionen", en: "More actions" },
    });
  });

  it("knows the goal action-menu with compound words only (Menü alone is the navigado's, O-28)", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["action-menu"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["actionmenu", "contextmenu", "overflowmenu", "kebabmenu", "rowactions"],
      // Nachlese 4 N-3 (F-1): "in jeder Tabellenzeile" names the menuo of the row.
      de: ["aktionsmenü", "kontextmenü", "zeilenaktionen", "zeilenmenü", "tabellenzeile"],
    });
    expect(skemo?.goals?.[0]?.keywords.en).not.toContain("menu");
    expect(skemo?.goals?.[0]?.keywords.de).not.toContain("menü");
  });
});

describe("the Uzo of the menuo (section ④, G6)", () => {
  it("states the purpose; pages are the navigado's, values the elektilo's, one action the butono's; a submenu is not supported, checkable items ask", () => {
    expect(uzo?.purpose).toBe(
      "Offers actions for one object behind a single button: edit, duplicate, delete.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["navigate", "navigado"],
      ["choose-value", "elektilo"],
      ["single-action", "butono"],
    ]);
    expect(uzo?.instead[2]?.kialo).toMatch(/hides an action/);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["submenu", "not-supported"],
      ["checkable-items", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in the head of a record with tabelo, butono, ikono and apartigilo; the items are a duty of at least one; wraps never", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["record-header"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "tabelo",
      "butono",
      "ikono",
      "apartigilo",
    ]);
    expect(uzo?.slots).toEqual({
      items: { accepts: ["text", "ikono", "apartigilo"], required: true, min: 1, nesting: 1 },
      trigger: { accepts: ["butono"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
    for (const name of ["tabelo", "ikono", "apartigilo"]) {
      expect(
        eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero),
        name,
      ).toContain("menuo");
    }
  });

  it("the tabelo sends its row actions here: the boundary row-actions-menu is closed, use-instead menuo", () => {
    const tabelo = eroNamed("tabelo")?.uzo;
    expect(tabelo?.boundary.map((entry) => entry.case)).not.toContain("row-actions-menu");
    expect(tabelo?.instead.find((entry) => entry.goal === "row-actions")?.ero).toBe("menuo");
  });

  it("carries label-names-action (warning) and option-labels-distinct (fixed) on its entries", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "label-names-action",
        fixed: false,
        severity: "warning",
        of: "slot:items",
        check: { kind: "names-goal" },
      },
      {
        regulo: "option-labels-distinct",
        fixed: true,
        of: "slot:items",
        check: { kind: "distinct" },
      },
    ]);
  });

  it("the brief names placement and state as axes, the items as a duty, and stays under 750", () => {
    if (menuo === undefined) throw new Error("missing");
    const brief = briefOf(menuo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["placement"]);
    expect(brief.required).toEqual({ props: [], slots: ["items"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the menuo (G8, E5)", () => {
  it("label-names-action and option-labels-distinct are widened to the menuo, not duplicated (E5)", () => {
    expect(named("label-names-action")?.appliesTo?.eroj).toEqual(["butono", "menuo"]);
    expect(named("label-names-action")?.statement).toContain("menuo");
    expect(named("option-labels-distinct")?.appliesTo?.eroj).toEqual([
      "elekto",
      "elektilo",
      "langetaro",
      "menuo",
      "kompletigilo",
    ]);
    expect(named("option-labels-distinct")?.statement).toContain("menuo");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("menuo");
  });

  it("two entries with the same text violate option-labels-distinct; distinct verbs pass", () => {
    const judge = (items: string[]) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "menuo", props: {}, texts: { items } }]));
    expect(judge(["Bearbeiten", "Duplizieren", "Löschen"])).toEqual([]);
    expect(judge(["Löschen", "Löschen"])).toEqual([["option-labels-distinct", "error"]]);
  });
});

describe("suggest_ero of the action menu (Gvidanto)", () => {
  it("'Zeilenmenü' is the menuo with the tabelo's reason; 'Kontextmenü zum Objekt' and 'row-actions behind one button' too", () => {
    const rows = suggest("Zeilenmenü");
    expect(rows.suggestion).toEqual({ ero: "menuo", props: {} });
    expect(suggest("Kontextmenü zum Objekt").suggestion).toEqual({ ero: "menuo", props: {} });
    expect(suggest("row-actions behind one button").suggestion).toEqual({
      ero: "menuo",
      props: {},
    });
  });

  it("'Menü' alone stays the navigado's (O-28); 'a context-menu that leads to pages' goes there with the menuo's reason", () => {
    expect(suggest("Menü").suggestion).toEqual({ ero: "navigado", props: {} });
    const pages = suggest("a context-menu that leads to pages");
    expect(pages.suggestion).toEqual({ ero: "navigado", props: {} });
    expect(pages.boundary).toMatchObject({ ero: "menuo", case: "navigate", action: "use-instead" });
  });

  it("one action is a butono, values are the elektilo's; a cascading menu and checkmarks ask a person", () => {
    expect(suggest("a kebab-menu for only one action").suggestion).toEqual({
      ero: "butono",
      props: {},
    });
    expect(suggest("Kontextmenü mit einem Wert je Eintrag").suggestion).toEqual({
      ero: "elektilo",
      props: {},
    });
    for (const phrase of ["Kontextmenü, kaskadierend", "Kontextmenü mit Häkchen"]) {
      const answer = suggest(phrase);
      expect(answer.suggestion, phrase).toBeNull();
      expect(answer.action, phrase).toBe("ask-human");
    }
  });
});
