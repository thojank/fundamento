// The atributlisto data (Spec 011 ④; G1–G7, section ④, E10, plan ④ D-02, D-05): the key-value
// list in the repo Modelo — the fields of one record as name and value, a native dl/dt/dd the Ero
// styles in the light DOM (E10, like the table); layout is its axis, rest its only state (G2). An
// empty value shows "–" and is heard as "keine Angabe" (a11y.texts keyed <slot>-empty, D-05). The
// cross-links of G5: many records are the tabelo's, one record the list's; editing is a form.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const atributlisto = eroNamed("atributlisto");
const skemo = atributlisto?.skemo;
const uzo = atributlisto?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("atributlisto in the repo Modelo (section ④, G1, G2, E10)", () => {
  it("lives in data/eroj/atributlisto/skemo.json, third of forty Eroj", () => {
    expect(atributlisto?.file).toBe("modelo/data/eroj/atributlisto/skemo.json");
    expect(modelo.eroj[2]?.ero.name).toBe("atributlisto");
  });

  it("has layout (columns, stacked, auto since Spec 014 ①) and label (the optional name) as props; one state, rest", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["layout", ["columns", "stacked", "auto"], "columns"],
        ["label", "string", undefined],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
    // auto: columns while the container is wide enough, else stacked; the default stays columns.
    expect(skemo?.props[0]?.description).toMatch(/auto/);
  });

  it("has one slot entries (default): the dl with its dt/dd pairs in the light DOM (E10)", () => {
    expect(skemo?.slots).toEqual([{ name: "entries", default: true }]);
  });

  it("names its parts: term in the muted label role, value in the default text, the gaps of the list and the box", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(["box", "list", "term", "value"]);
    expect(skemo.parts.term?.color).toEqual({ fixed: "color.text.muted" });
    expect(skemo.parts.term?.typography).toEqual({ fixed: "typography.label.2" });
    expect(skemo.parts.value?.color).toEqual({ fixed: "color.text.default" });
    expect(skemo.parts.value?.typography).toEqual({ fixed: "typography.body.2" });
    expect(skemo.parts.list?.gap).toEqual({ fixed: "spacing.large" });
    expect(skemo.parts.box?.gap).toEqual({ fixed: "spacing.small" });
    // layout keys the gap of the box: the term stands beside the value or above it.
    expect(skemo.parts.box?.["inline-padding"]).toEqual({ by: ["layout"] });
    // Spec 014 ① (layout auto): the wide case is the columns case; the stacked case below the
    // threshold is the stacked binding — the projection decides by the container, not the Skemo.
    expect(boundToken(skemo, "box", "inline-padding", { layout: "auto" })?.token).toBe(
      "spacing.large",
    );
    expect(styledProps(skemo)).toEqual(["layout"]);
    expect(variantKeys(skemo)).toEqual(["layout", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(3);
  });

  it("Spec 014 ①: the Uzo names the width from which auto lays name and value side by side — a container size, no new number", () => {
    expect(uzo?.layout).toEqual({
      size: "container",
      wrap: "allowed",
      "columns-from": "size.container.small",
    });
  });

  it("speaks role list, named by its label prop; an empty value is heard as 'keine Angabe' (G4, D-05)", () => {
    expect(skemo?.a11y.role).toBe("list");
    expect(skemo?.a11y.name).toEqual(["prop:label"]);
    expect(skemo?.a11y.texts).toEqual({
      "entries-empty": { de: "keine Angabe", en: "not specified" },
    });
  });

  it("knows the goal details with the words of the spec", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["details"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["details", "metadata", "properties", "attributes"],
      de: ["details", "metadaten", "eigenschaften", "angaben"],
    });
  });
});

describe("the Uzo of the atributlisto (section ④, G5)", () => {
  it("states the purpose, requires the entries; size container, values may wrap", () => {
    expect(uzo?.purpose).toBe(
      "Shows the fields of one record as name and value: version, owner, valid since.",
    );
    expect(uzo?.slots).toEqual({ entries: { accepts: ["text"], required: true, nesting: 0 } });
    expect(uzo?.layout).toMatchObject({ size: "container", wrap: "allowed" });
  });

  it("sends many records to the tabelo, editing to the kampo (a form) and a record shown as a card to the karto (Spec 015 ③, G2); stops at nesting", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["many-records", "tabelo"],
      ["editable", "kampo"],
      ["as-card", "karto"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["nested", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section and a dialog, with insigno, ligilo and mezurilo as values", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "page-section",
      "dialog",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["insigno", "ligilo", "mezurilo"]);
    expect(uzo?.content).toEqual([]);
  });

  it("the brief names layout as the axis, the entries as a duty, and stays under 750", () => {
    if (atributlisto === undefined) throw new Error("missing");
    const brief = briefOf(atributlisto);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["layout"]);
    expect(brief.required).toEqual({ props: [], slots: ["entries"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });

  it("spacing-owned-by-container is widened to the atributlisto (E5)", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("atributlisto");
  });
});

describe("suggest_ero of the list (Gvidanto)", () => {
  it("'Metadaten eines Standards' is the atributlisto; 'viele Datensätze' is the tabelo with the list's reason", () => {
    expect(suggest("Metadaten eines Standards").suggestion).toEqual({
      ero: "atributlisto",
      props: {},
    });
    const many = suggest("Metadaten vieler Datensätze");
    expect(many.suggestion).toEqual({ ero: "tabelo", props: {} });
    expect(many.boundary).toMatchObject({ ero: "atributlisto", case: "many-records" });
  });

  it("'Eigenschaften bearbeiten' is the kampo (a form, with the list's reason); a nested list stops", () => {
    const edit = suggest("Eigenschaften bearbeiten");
    expect(edit.suggestion).toEqual({ ero: "kampo", props: {} });
    expect(edit.boundary).toMatchObject({ ero: "atributlisto", case: "editable" });
    expect(suggest("verschachtelte Werte").boundary).toMatchObject({
      ero: "atributlisto",
      case: "nested",
      action: "not-supported",
    });
  });
});
