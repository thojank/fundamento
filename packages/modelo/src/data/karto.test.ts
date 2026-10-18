// The karto data (Spec 015 ③; G1–G4, section ③, plan ③ D-01, D-02): the card in the repo Modelo
// — groups the content about one thing into a unit: a heading (a composed titolo at the level the
// card is given), an optional image, text, a meta row and up to two actions. It stands for itself
// (an article) or as a section of the page (standalone false: a region), named by its heading
// either way. The surface is a raised one with a subtle border; the room inside follows density
// (spacing.*). orientation horizontal lays the image beside the text and stacks below the Uzo's
// columns-from, as the atributlisto's layout auto does. No state of its own: a whole card as a link
// is a boundary (clickable-card), the grid of many cards too (card-grid, a Sxablono). G2: the
// atributlisto sends a record shown as a card here, the avizo content about one thing; the card
// sends the fields of a record and a notice back. one-primary-per-container is widened to its
// actions (E5).

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
const karto = eroNamed("karto");
const skemo = karto?.skemo;
const uzo = karto?.uzo;
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

describe("karto in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/karto/skemo.json, after the kampo", () => {
    expect(karto?.file).toBe("modelo/data/eroj/karto/skemo.json");
    const names = modelo.eroj.map((entry) => entry.ero.name);
    expect(names.indexOf("karto")).toBe(names.indexOf("kampo") + 1);
  });

  it("has level (a duty, handed to the titolo), orientation and standalone as props; one state, rest", () => {
    expect(
      skemo?.props.map((prop) => [
        prop.name,
        prop.values ?? prop.kind,
        prop.required ?? false,
        prop.default,
      ]),
    ).toEqual([
      ["level", ["1", "2", "3", "4", "5", "6"], true, undefined],
      ["orientation", ["vertical", "horizontal"], false, "vertical"],
      ["standalone", "boolean", false, true],
    ]);
    // The levels are the titolo's: a card hands its own on.
    expect(skemo?.props[0]?.values).toEqual(
      eroNamed("titolo")?.skemo.props.find((prop) => prop.name === "level")?.values,
    );
    expect(skemo?.states).toEqual(["rest"]);
    // No part is keyed by a prop: orientation is layout (Celo), standalone the landmark.
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
  });

  it("has the slots heading (text), media, content (default), meta and actions", () => {
    expect(skemo?.slots).toEqual([
      { name: "heading", text: true },
      { name: "media" },
      { name: "content", default: true },
      { name: "meta" },
      { name: "actions" },
    ]);
  });

  it("names its parts: the raised surface with its subtle border, heading, content, meta, actions and box — no new token (E1)", () => {
    expect(skemo?.parts).toEqual({
      surface: {
        fill: { fixed: "color.background.raised" },
        radius: { fixed: "radius.role.surface" },
        shadow: { fixed: "elevation.shadow.raised" },
      },
      border: {
        color: { fixed: "color.border.subtle" },
        width: { fixed: "border.width.default" },
      },
      heading: {
        color: { fixed: "color.text.default" },
        typography: { fixed: "typography.headline.4" },
      },
      content: {
        color: { fixed: "color.text.default" },
        typography: { fixed: "typography.body.1" },
      },
      meta: { gap: { fixed: "spacing.small" } },
      actions: { gap: { fixed: "spacing.small" } },
      box: { "inline-padding": { fixed: "spacing.medium" }, gap: { fixed: "spacing.small" } },
    });
    expect(skemo?.bindings).toEqual([]);
    // The heading lies on the raised surface: a declared pair (skemo-kontrastparo-missing silent).
    expect(
      modelo.kontrastParoj?.some(
        (pair) =>
          pair.foreground === "color.text.default" && pair.background === "color.background.raised",
      ),
    ).toBe(true);
    expect(boundToken(skemoOrThrow(), "surface", "fill", {})?.token).toBe(
      "color.background.raised",
    );
  });

  it("is an article named by its heading (standalone false: a region, Celo knowledge); no state, no key", () => {
    expect(skemo?.a11y).toEqual({ role: "article", name: ["slot:heading"], states: {}, keys: [] });
  });

  it("knows the goal card with the words of G3, citing one-primary-per-container", () => {
    expect(skemo?.goals).toEqual([
      {
        goal: "card",
        keywords: {
          en: ["card", "cards", "tile", "tiles"],
          de: ["karte", "karten", "kachel", "kacheln"],
        },
        props: {},
        regulo: "one-primary-per-container",
      },
    ]);
  });
});

describe("the Uzo of the karto (section ③, G2)", () => {
  it("states the purpose; a record is the atributlisto's, a notice the avizo's, a layout box a person's", () => {
    expect(uzo?.purpose).toBe(
      "Groups content about one thing into a unit: a heading, optional image and text, and up to two actions.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["data-record", "atributlisto"],
      ["notice", "avizo"],
      ["layout-box", null],
    ]);
    expect(uzo?.instead.find((entry) => entry.goal === "layout-box")?.kialo).toContain(
      "A card is content, not a frame for the layout",
    );
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("stops at a whole card as a link and at the grid of many cards (a person decides)", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["clickable-card", "ask-human"],
      ["card-grid", "ask-human"],
    ]);
    const clickable = uzo?.boundary.find((entry) => entry.case === "clickable-card");
    expect(clickable?.kialo).toContain("Nested controls inside a link are broken");
    expect(uzo?.boundary.find((entry) => entry.case === "card-grid")?.kialo).toContain("Sxablono");
  });

  it("requires the heading; the content takes text and teksto, the meta a badge, the actions at most two", () => {
    expect(uzo?.slots).toEqual({
      heading: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      content: { accepts: ["text", "teksto"], nesting: 0 },
      meta: { accepts: ["insigno"], nesting: 0 },
      actions: { accepts: ["butono", "ligilo"], max: 2, nesting: 0 },
    });
  });

  it("fills its container and stacks below size.container.small — the width of the atributlisto's layout auto", () => {
    expect(uzo?.layout).toEqual({
      size: "container",
      wrap: "allowed",
      "columns-from": "size.container.small",
    });
    expect(uzo?.layout["columns-from"]).toBe(eroNamed("atributlisto")?.uzo?.layout["columns-from"]);
  });

  it("composes in a page section and a dialog, with titolo, teksto, insigno, butono and ligilo", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "page-section",
      "dialog",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "titolo",
      "teksto",
      "insigno",
      "butono",
      "ligilo",
    ]);
    expect(uzo?.composes.spacing).toEqual({
      owner: "container",
      regulo: "spacing-owned-by-container",
    });
  });

  it("G2: the atributlisto sends a record shown as a card here, the avizo content about one thing", () => {
    const asCard = eroNamed("atributlisto")?.uzo?.instead.find((entry) => entry.ero === "karto");
    expect(asCard?.goal).toBe("as-card");
    expect(asCard?.kialo).toMatch(/because/);
    const content = eroNamed("avizo")?.uzo?.instead.find((entry) => entry.ero === "karto");
    expect(content?.goal).toBe("content");
    expect(content?.kialo).toMatch(/because/);
  });

  it("the brief names level and orientation as axes, level and heading as duties, and stays under 750", () => {
    if (karto === undefined) throw new Error("missing");
    const brief = briefOf(karto);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["level", "orientation"]);
    expect(brief.required).toEqual({ props: ["level"], slots: ["heading"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the karto (G4, E5)", () => {
  it("one-primary-per-container and spacing-owned-by-container are widened to the karto", () => {
    const primary = named("one-primary-per-container");
    expect(primary?.appliesTo?.eroj).toContain("karto");
    expect(primary?.statement).toContain("karto");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("karto");
  });

  it("two buttons with emphasis high in the actions of one card violate one-primary-per-container; one high and one medium pass", () => {
    const actions = (second: string) =>
      evaluateUsage(modelo, [
        { ero: "karto", props: { level: "3" }, label: "Projekt Alpha", texts: {}, lingvo: "de" },
        {
          ero: "butono",
          props: { emphasis: "high" },
          label: "Änderungen speichern",
          container: "card",
          lingvo: "de",
        },
        {
          ero: "butono",
          props: { emphasis: second },
          label: "Entwurf senden",
          container: "card",
          lingvo: "de",
        },
      ]);
    expect(rulesOf(actions("high"))).toEqual([["one-primary-per-container", "error"]]);
    expect(rulesOf(actions("medium"))).toEqual([]);
  });
});

describe("suggest_ero of the card (Gvidanto)", () => {
  it("'Karte', 'Kachel', 'card' and 'tile' are the karto, citing one-primary-per-container", () => {
    for (const goal of ["Karte", "Kachel", "card", "tile"]) {
      const answer = suggest(goal);
      expect(answer.suggestion, goal).toEqual({ ero: "karto", props: {} });
      expect(answer.regulo?.name, goal).toBe("one-primary-per-container");
    }
  });

  it("'Karten mit Bild für die Projekte' and 'Projekt-Karten mit Bild' are the karto (the spec's dialog; „Projektkarten“ as one word hits no goal, plan ③)", () => {
    for (const goal of ["Karten mit Bild für die Projekte", "Projekt-Karten mit Bild"]) {
      expect(suggest(goal).suggestion, goal).toEqual({ ero: "karto", props: {} });
    }
  });

  it("cards in a grid ask a person (card-grid); a whole card as a link too (clickable-card)", () => {
    const grid = suggest("Projektkarten im Raster");
    expect(grid.suggestion).toBeNull();
    expect(grid.boundary).toMatchObject({ ero: "karto", case: "card-grid", action: "ask-human" });
    const both = suggest("Karten im Raster");
    expect(both.action).toBe("ask-human");
    expect(both.candidates?.[0]).toMatchObject({ kind: "boundary", case: "card-grid" });
    expect(both.candidates?.[1]).toMatchObject({ kind: "goal", ero: "karto", goal: "card" });
    const clickable = suggest("Klickbare Karte");
    expect(clickable.action).toBe("ask-human");
    expect(clickable.candidates?.[0]).toMatchObject({ kind: "boundary", case: "clickable-card" });
  });

  it("G2 both ways: a card view of a record and a teaser are the karto with the reason of the atributlisto and the avizo", () => {
    const view = suggest("Kartenansicht der Projekte");
    expect(view.suggestion).toEqual({ ero: "karto", props: {} });
    expect(view.boundary).toMatchObject({ ero: "atributlisto", case: "as-card" });
    const teaser = suggest("Teaser");
    expect(teaser.suggestion).toEqual({ ero: "karto", props: {} });
    expect(teaser.boundary).toMatchObject({ ero: "avizo", case: "content" });
    // The words of the atributlisto and the avizo stay theirs.
    expect(suggest("Metadaten eines Standards").suggestion?.ero).toBe("atributlisto");
    expect(suggest("Meldung").suggestion?.ero).toBe("avizo");
  });
});
