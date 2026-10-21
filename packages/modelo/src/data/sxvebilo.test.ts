// The sxvebilo data (Spec 014 ④; G4, G5, section ④, plan ④ D-02): the popover in the repo Modelo —
// a non-modal layer with content next to its trigger; the page stays usable. A layer of the
// platform (light dismiss) anchored to the trigger button, with a heading (a titolo) and content;
// the focus moves in on opening and back on closing. A decision is the dialogo's, a short hint the
// konsileto's, a list of actions the menuo's; the dialogo closes its boundary non-modal here.

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const sxvebilo = eroNamed("sxvebilo");
const skemo = sxvebilo?.skemo;
const uzo = sxvebilo?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("sxvebilo in the repo Modelo (section ④, G1, G2, G4)", () => {
  it("lives in data/eroj/sxvebilo/skemo.json, one of thirty-four Eroj", () => {
    expect(sxvebilo?.file).toBe("modelo/data/eroj/sxvebilo/skemo.json");
    expect(modelo.eroj).toHaveLength(34);
  });

  it("has label (a duty), placement (block-end) and open as props; one state; trigger, content (default) and heading slots", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default, prop.required])).toEqual(
      [
        ["label", "string", undefined, true],
        ["placement", "enum", "block-end", undefined],
        ["open", "boolean", false, undefined],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([
      { name: "trigger" },
      { name: "content", default: true },
      { name: "heading", text: true },
    ]);
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
  });

  it("names its parts: the raised surface with radius, shadow, layer and the small container as width; the subtle border; heading, content and box", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "surface",
      "border",
      "heading",
      "content",
      "box",
    ]);
    expect(skemo?.parts.surface).toEqual({
      fill: { fixed: "color.background.raised" },
      radius: { fixed: "radius.role.surface" },
      shadow: { fixed: "elevation.shadow.overlay" },
      layer: { fixed: "elevation.layer.overlay" },
      width: { fixed: "size.container.small" },
    });
    expect(skemo?.parts.border).toEqual({
      color: { fixed: "color.border.subtle" },
      width: { fixed: "border.width.default" },
    });
    expect(skemo?.parts.heading?.typography).toEqual({ fixed: "typography.headline.4" });
    expect(skemo?.parts.content?.typography).toEqual({ fixed: "typography.body.1" });
    expect(skemo?.parts.box).toEqual({
      "inline-padding": { fixed: "spacing.medium" },
      gap: { fixed: "spacing.small" },
    });
  });

  it("speaks role dialog (non-modal), named by its label; Escape is its key (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "dialog",
      name: ["prop:label"],
      states: {},
      keys: ["Escape"],
    });
  });

  it("knows the goal popover with the words of G7", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["popover"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["popover", "flyout"],
      de: ["popover", "flyout", "ausklappfenster"],
    });
  });
});

describe("the Uzo of the sxvebilo (section ④, G6)", () => {
  it("states the purpose; a decision is the dialogo's, a short hint the konsileto's, a list of actions the menuo's; nested is not supported, a drawer asks", () => {
    expect(uzo?.purpose).toBe(
      "Opens a non-modal layer with content next to its trigger; the page stays usable.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["decision", "dialogo"],
      ["short-hint", "konsileto"],
      ["actions-list", "menuo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["nested-popover", "not-supported"],
      ["drawer", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section with the butono (trigger) and the titolo (heading); the trigger and the content are duties; size content", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["butono", "titolo"]);
    expect(uzo?.slots.trigger).toEqual({ accepts: ["butono"], max: 1, required: true, nesting: 0 });
    expect(uzo?.slots.content?.required).toBe(true);
    expect(uzo?.slots.content?.accepts).toContain("kampo");
    expect(uzo?.slots.heading).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "allowed" });
    expect(uzo?.content).toEqual([]);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("sxvebilo");
  });

  it("the dialogo closes its boundary non-modal: use-instead sxvebilo, without the konsileto's word", () => {
    const dialogo = eroNamed("dialogo")?.uzo;
    expect(dialogo?.boundary.map((entry) => entry.case)).not.toContain("non-modal");
    const nonModal = dialogo?.instead.find((entry) => entry.goal === "non-modal");
    expect(nonModal?.ero).toBe("sxvebilo");
    expect(nonModal?.keywords?.en).not.toContain("tooltip");
    expect(nonModal?.keywords?.en).not.toContain("popover");
  });

  it("the brief names placement as the axis, label, trigger and content as duties, and stays under 750", () => {
    if (sxvebilo === undefined) throw new Error("missing");
    const brief = briefOf(sxvebilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["placement"]);
    expect(brief.required).toEqual({ props: ["label"], slots: ["trigger", "content"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("suggest_ero of the popover (Gvidanto)", () => {
  it("'a flyout beside its trigger' and 'Popover mit verbindlicher Frage'? no — the binding question goes to the dialogo", () => {
    expect(suggest("a flyout beside its trigger").suggestion).toEqual({
      ero: "sxvebilo",
      props: {},
    });
    // "Entscheidung" is the avizo's redirect word (first in Ero order); the popover's own are
    // verbindlich and unumkehrbar.
    const decision = suggest("Popover, verbindlich und unumkehrbar");
    expect(decision.suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(decision.boundary).toMatchObject({ ero: "sxvebilo", case: "decision" });
  });

  it("'Aktionsliste im Popover' goes to the menuo with the popover's reason; 'a sidepanel that slides in' asks a person", () => {
    const actions = suggest("Aktionsliste im Popover");
    expect(actions.suggestion).toEqual({ ero: "menuo", props: {} });
    expect(actions.boundary).toMatchObject({ ero: "sxvebilo", case: "actions-list" });
    // Nachlese 8 ① F-1 (Jugxo jug_01M5EYQ8T67D7J99BBS0VJHVPR): „slides in“ is the drawer of the
    // navigado now, which comes first in Ero order; the case, the action and the kialo (O-39)
    // are the same.
    expect(suggest("a sidepanel that slides in").boundary).toMatchObject({
      ero: "navigado",
      case: "drawer",
      action: "ask-human",
    });
  });

  it("O-39 (Nachlese 5): the drawer of the dialogo and of the sxvebilo is one case – both ask a person with the same kialo", () => {
    const drawerOf = (name: string) =>
      eroNamed(name)?.uzo?.boundary.find((entry) => entry.case === "drawer");
    const ofDialogo = drawerOf("dialogo");
    const ofSxvebilo = drawerOf("sxvebilo");
    expect(ofDialogo?.action).toBe("ask-human");
    expect(ofSxvebilo?.action).toBe("ask-human");
    expect(ofDialogo?.kialo).toBe(ofSxvebilo?.kialo);
    expect(ofSxvebilo?.kialo).toMatch(/neither a dialog nor a popover/);
    // Whichever Uzo speaks, the answer is the same.
    for (const text of ["Drawer", "Seitenpaneel mit dem Inhalt", "a sidepanel that slides in"]) {
      const answer = suggest(text);
      expect(answer.boundary?.action, text).toBe("ask-human");
      expect(answer.boundary?.kialo, text).toBe(ofSxvebilo?.kialo);
    }
  });
});
