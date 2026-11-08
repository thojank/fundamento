// The tabelo data (Spec 011 ④; G1–G7, section ④, E10, plan ④ D-01, D-04): the data table in the
// repo Modelo — many records as rows and columns, a native table the Ero styles and extends in the
// light DOM (E10): design, the scroll region, the empty state and the sort buttons; density is its
// axis, the states rest, hover and focus belong to the sort button (G2). The new Regulo
// table-caption-names-the-content (fixed). The cross-links of G5: one record is the list's, the
// empty state a plenstato, a status in a cell an insigno.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REPO_EROJ } from "../validate/test-doubles/eroj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const tabelo = eroNamed("tabelo");
const skemo = tabelo?.skemo;
const uzo = tabelo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("tabelo in the repo Modelo (section ④, G1, G2, E10)", () => {
  it("lives in data/eroj/tabelo/skemo.json, thirty-seventh of forty Eroj", () => {
    expect(tabelo?.file).toBe("modelo/data/eroj/tabelo/skemo.json");
    expect(modelo.eroj[REPO_EROJ.indexOf("tabelo")]?.ero.name).toBe("tabelo");
  });

  it("has density, caption-hidden, sort (the column) and direction as props; the states of the sort button", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        // Spec 036 Teil 5 ②b-2 (A-tabelo-1): three densities, comfortable stays the default; the
        // lines (lines, not rules: ②a-6).
        ["density", ["compact", "default", "comfortable"], "comfortable"],
        ["caption-hidden", "boolean", false],
        ["sort", "string", undefined],
        ["direction", ["ascending", "descending"], "ascending"],
        // Spec 046 T3 (plan D-18): selection, loading and a sticky header, off by default; lines
        // stays the last prop (achsen-2b2.test.ts).
        ["selectable", "boolean", false],
        ["loading", "boolean", false],
        ["sticky-header", "boolean", false],
        ["lines", ["rows", "columns", "grid", "none"], "rows"],
      ],
    );
    expect(skemo?.states).toEqual(["rest", "hover", "focus"]);
  });

  it("has the slots caption (default, required: the table's name), content (the table) and empty (the text of the plenstato)", () => {
    expect(skemo?.slots).toEqual([
      // The caption stands above the table on the ground of the page (beside): it is never
      // paired with the head's fill or the sort button's (skemo-kontrastparo-missing).
      { name: "caption", default: true, text: true, beside: true },
      { name: "content" },
      { name: "empty", text: true },
    ]);
  });

  it("names its parts: caption, head, cell keyed by density, row-header, border, region, sort keyed by state, sort-indicator, focus-ring", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(
      [
        "border",
        "caption",
        "cell",
        "focus-ring",
        "head",
        "region",
        "row-header",
        "sort",
        "sort-indicator",
        // Spec 036 Teil 5 ②b-3 (A-tabelo-4): the foot.
        "foot",
        // Spec 046 T3 (plan D-20): the bars of the skeleton rows while loading.
        "skeleton",
        // Spec 046 T3 Nachbesserung (F-T5-1): the target of the selection's boxes.
        "selection",
      ].sort(),
    );
    // The caption is text of the Ero too (axe measured black on the dark page without it).
    expect(skemo.parts.caption?.color).toEqual({ fixed: "color.text.default" });
    expect(skemo.parts.head?.fill).toEqual({ fixed: "color.background.sunken" });
    expect(skemo.parts.head?.typography).toEqual({ fixed: "typography.label.1" });
    expect(skemo.parts.cell?.["inline-padding"]).toEqual({ by: ["density"] });
    expect(boundToken(skemo, "cell", "inline-padding", { density: "comfortable" })?.token).toBe(
      "spacing.medium",
    );
    expect(boundToken(skemo, "cell", "inline-padding", { density: "compact" })?.token).toBe(
      "spacing.small",
    );
    expect(skemo.parts.cell?.height).toEqual({ by: ["density"] });
    expect(skemo.parts["row-header"]?.typography).toEqual({ fixed: "typography.label.1" });
    expect(skemo.parts.border?.color).toEqual({ fixed: "color.border.subtle" });
    expect(skemo.parts.region?.radius).toEqual({ fixed: "radius.role.surface" });
    expect(skemo.parts.sort?.fill).toEqual({ by: ["state"] });
    expect(boundToken(skemo, "sort", "fill", { state: "hover" })?.token).toBe(
      "color.action.tertiary.hover",
    );
    expect(skemo.parts["sort-indicator"]?.size).toEqual({ fixed: "size.icon.small" });
    expect(skemo.parts["focus-ring"]).toEqual({
      ring: { fixed: "focus.ring" },
      offset: { fixed: "focus.offset" },
      color: { fixed: "color.focus.inner" },
    });
    expect(styledProps(skemo)).toEqual(["density"]);
    expect(variantKeys(skemo)).toEqual(["density", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(9);
  });

  it("speaks role table, named by its caption; Enter and Space sort (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "table",
      name: ["slot:caption"],
      states: {},
      keys: ["Enter", "Space"],
      // Spec 046 T3 (plan D-19): the names of the selection boxes – a row's box (selectable,
      // followed by the row's name) and the box in the head.
      texts: {
        selectable: { de: "Zeile auswählen", en: "Select row" },
        "head-name": { de: "Alle Zeilen auswählen", en: "Select all rows" },
      },
    });
  });

  it("knows the goal table with the words of the spec (no word of another Ero), citing the caption rule", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.regulo])).toEqual([
      ["table", "table-caption-names-the-content"],
      // Spec 046 T3: the boundaries row-selection and sticky-header are closed by the table's props.
      ["row-selection", undefined],
      ["sticky-header", undefined],
    ]);
    expect(skemo?.goals?.slice(1).map((goal) => goal.props)).toEqual([
      { selectable: true },
      { "sticky-header": true },
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["table", "records", "grid", "datatable"],
      de: ["tabelle", "datensätze", "einträge", "zeilen"],
    });
  });
});

describe("the Uzo of the tabelo (section ④, G5)", () => {
  it("states the purpose, requires caption and content; size container, the region scrolls (never wraps)", () => {
    expect(uzo?.purpose).toBe(
      // Spec 036 Teil 5 ②b-3 (A-tabelo-4).
      "Shows many records with the same fields as rows and columns, so a person can compare and find: standards, versions, findings; a foot row (tfoot) holds sums.",
    );
    expect(uzo?.slots).toEqual({
      caption: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      content: { accepts: ["text"], required: true, max: 1, nesting: 1 },
      // Nachlese 7 ② B-3: the empty state names its next step with a butono.
      empty: { accepts: ["text", "butono"], max: 2, nesting: 1 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
  });

  it("sends one record to the atributlisto; a layout grid is a person's decision", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["one-record", "atributlisto"],
      ["layout-grid", null],
      // Spec 014 ④: the row actions are the menuo's (the boundary row-actions-menu is closed).
      ["row-actions", "menuo"],
    ]);
  });

  it("names its boundaries: pagination and inline edit are other Eroj', row tint asks a person; selection and a sticky header are its own (Spec 046 T3)", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      // Spec 015 ①: the pagination is the pagxigilo's.
      ["pagination", "use-instead"],
      ["inline-edit", "use-instead"],
      ["row-tint", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section, with insigno, ligilo and small butono in cells and the plenstato as its empty state", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "insigno",
      "ligilo",
      "butono",
      "mezurilo",
      "plenstato",
      "ikono",
      "titolo",
      "menuo",
      "pagxigilo",
    ]);
  });

  it("carries table-caption-names-the-content, fixed, as not-words against captions that name no content", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "table-caption-names-the-content",
        fixed: true,
        check: {
          kind: "not-words",
          words: {
            de: ["tabelle", "daten", "übersicht", "liste"],
            en: ["table", "data", "overview", "list"],
          },
        },
      },
    ]);
  });

  it("the brief names density as the axis, caption and content as duties, and stays under 750", () => {
    if (tabelo === undefined) throw new Error("missing");
    const brief = briefOf(tabelo);
    // direction is an enum prop too: the brief names every enum prop as an axis.
    expect(brief.axes.map((axis) => axis.name)).toEqual(["density", "direction", "lines"]);
    expect(brief.required).toEqual({ props: [], slots: ["caption", "content"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the tabelo (G6)", () => {
  it("table-caption-names-the-content is new, fixed, automatic, the tabelo's alone; spacing is widened", () => {
    const regulo = named("table-caption-names-the-content");
    expect(regulo?.appliesTo?.eroj).toEqual(["tabelo"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/screen reader/i);
    expect(USAGE_ENFORCERS["table-caption-names-the-content"]).toBeDefined();
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("tabelo");
  });

  it("has an approved and a rejected example in de and en that evaluate as they say", () => {
    const regulo = named("table-caption-names-the-content");
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
      else expect(rules, jugxo.id).toEqual(["table-caption-names-the-content"]);
      expect(jugxo.ref).toEqual({ ero: tabelo?.ero.id });
    }
  });
});

describe("check_usage and suggest_ero of the table (G6, G7, Gvidanto)", () => {
  it("a caption 'Standards' passes; 'Tabelle' violates the caption rule", () => {
    expect(
      rulesOf(evaluateUsage(modelo, [{ ero: "tabelo", props: {}, label: "Standards" }])),
    ).toEqual([]);
    expect(
      rulesOf(evaluateUsage(modelo, [{ ero: "tabelo", props: {}, label: "Tabelle" }])),
    ).toEqual([["table-caption-names-the-content", "error"]]);
  });

  it("'Tabelle der Standards' is the tabelo, citing the caption rule; 'ein Datensatz mit seinen Angaben' is the atributlisto", () => {
    const table = suggest("Tabelle der Standards");
    expect(table.suggestion).toEqual({ ero: "tabelo", props: {} });
    expect(table.regulo?.name).toBe("table-caption-names-the-content");
    const one = suggest("ein Datensatz mit seinen Angaben");
    expect(one.suggestion).toEqual({ ero: "atributlisto", props: {} });
  });

  it("pagination asks a person; row selection and a sticky header are the tabelo with its prop (Spec 046 T3)", () => {
    expect(suggest("Zeilenauswahl der Zeilen").suggestion).toEqual({
      ero: "tabelo",
      props: { selectable: true },
    });
    expect(suggest("Zeilen mit Seitennummerierung").action).toBe("ask-human");
    expect(suggest("eine feste Kopfzeile").suggestion).toEqual({
      ero: "tabelo",
      props: { "sticky-header": true },
    });
  });
});

// Spec 046 T3 (plan D-18 to D-22): the native table gets selection, loading and a sticky header;
// the application owns the selection as it owns the sort.
describe("tabelo selection, loading and sticky header (Spec 046 T3)", () => {
  it("says sort-change and select (detail keys: the data-key of the selected rows, in DOM order)", () => {
    expect(skemo?.events?.map((event) => event.name)).toEqual(["sort-change", "select"]);
    expect(skemo?.events?.[1]?.description).toMatch(/keys/);
    expect(skemo?.events?.[1]?.description).toMatch(/data-key/);
  });

  it("the new props are booleans without a binding: no axis, no data attribute, no new combination", () => {
    if (skemo === undefined) throw new Error("missing");
    for (const name of ["selectable", "loading", "sticky-header"]) {
      const prop = skemo.props.find((candidate) => candidate.name === name);
      expect(prop, name).toMatchObject({ kind: "boolean", default: false });
    }
    expect(variantKeys(skemo)).toEqual(["density", "state"]);
    expect(skemo.props.find((prop) => prop.name === "loading")?.description).toMatch(/three/);
  });

  it("the skeleton binds existing roles only: the sunken ground, the control's radius, the height of a small icon", () => {
    expect(skemo?.parts.skeleton).toEqual({
      fill: { fixed: "color.background.sunken" },
      radius: { fixed: "radius.role.control" },
      height: { fixed: "size.icon.small" },
    });
  });

  it("Nachbesserung F-T5-1: the box of the selection is a target of at least size.target.min, wide and high (WCAG 2.5.8)", () => {
    expect(skemo?.parts.selection).toEqual({
      width: { fixed: "size.target.min" },
      height: { fixed: "size.target.min" },
    });
  });

  it("the brief names the three as flags and stays under 750; the kampo's stays the largest", () => {
    if (tabelo === undefined) throw new Error("missing");
    const brief = briefOf(tabelo);
    expect(brief.flags).toEqual(["caption-hidden", "selectable", "loading", "sticky-header"]);
    const size = Math.ceil(JSON.stringify(brief).length / 3);
    expect(size).toBeLessThanOrEqual(750);
    const kampo = eroNamed("kampo");
    if (kampo === undefined) throw new Error("missing");
    expect(size).toBeLessThan(Math.ceil(JSON.stringify(briefOf(kampo)).length / 3));
  });
});
