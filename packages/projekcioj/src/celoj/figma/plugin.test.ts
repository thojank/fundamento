// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.

import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import {
  BACKDROP_EXAMPLE,
  FIGMA_CELO,
  type FigmaPlan,
  resolveFigmaPlan,
  UNKNOWN_EXAMPLE,
  VERTICAL_EXAMPLE,
} from "./figma.js";
import {
  type DoubleCollection,
  type DoubleNode,
  type DoubleVariable,
  figmaDouble,
} from "./test-doubles/plugin.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = Object.fromEntries(FIGMA_CELO.generate(prepared.input).map((f) => [f.path, f.text]));
const plan = JSON.parse(files["figma/plan.json"] ?? "{}") as FigmaPlan;

/**
 * A file that has the model's font, as a prepared test file would. Only the tests of the fallback
 * run in a bare file, where the label falls back to Inter with a warning.
 */
// The fonts the two-brand fixture asks for: komuna's Geist Medium and ekzemplo's Archivo SemiBold,
// and the two crossings a field-by-field binding passes through. A prepared file has all four; a
// real Geist and a real Archivo both ship these cuts (F30).
const MODEL_FONTS = [
  { family: "Geist", style: "Medium" },
  { family: "Geist", style: "Black" },
  // Spec 008: the inline ligilo takes the running text's role (typography.body.1), Regular in
  // komuna and Medium in ekzemplo (plan D-11).
  { family: "Geist", style: "Regular" },
  { family: "Archivo", style: "Regular" },
  { family: "Archivo", style: "Medium" },
  { family: "Archivo", style: "Black" },
  // Spec 011 ②: the heading of the dialogo is typography.headline.4, SemiBold in komuna and Black
  // in ekzemplo (above), with the crossing Archivo SemiBold a field-by-field binding passes
  // through (a real Archivo ships it). The code text of the tekstareo is typography.code: Geist
  // Mono in komuna, in the Regular cut and the Medium crossing. The fixture's ekzemplo names the
  // generic `ui-monospace` first in its code stack, and the plan takes the first family of a
  // stack (F30) — a prepared file cannot have a font of that name; it stands here so the two-brand
  // tests measure the binding, not the fixture's stack (Befund for the fixture, Spec 011 ②).
  { family: "Geist", style: "SemiBold" },
  { family: "Archivo", style: "SemiBold" },
  { family: "Geist Mono", style: "Regular" },
  { family: "Geist Mono", style: "Medium" },
  { family: "ui-monospace", style: "Regular" },
  { family: "ui-monospace", style: "Medium" },
] as const;
const modelDouble = () => figmaDouble({ fonts: MODEL_FONTS });

/**
 * The abort of F10c lifted: a test that takes a variant out of a set the plugin made and runs it
 * again measures what such a run reports — which is only there once the run goes on.
 */
const LIFT = { createInFoundSet: true } as const;

/** Runs the generated plugin source against a double. */
async function run(
  double: ReturnType<typeof figmaDouble>,
  source = files["figma/plugin/code.js"] ?? "",
  options?: typeof LIFT,
) {
  const module = new Function("figma", "options", `${source}\nreturn applyPlan(options);`);
  await module(double.figma, options);
}

/**
 * The nodes on the page, and those of every section on it in place of the section's children
 * (F-2), and those of the plugin's frame in the section (F-8: the sets lie in the frame „Eroj" in
 * the section „Fundamento"): a node a test looks for is found either way.
 */
function pageNodes(double: ReturnType<typeof figmaDouble>): DoubleNode[] {
  const open = (child: DoubleNode): DoubleNode[] =>
    child.type === "SECTION" ||
    (child.type === "FRAME" && child.getSharedPluginData("fundamento", "frame") !== "")
      ? [child, ...child.children.flatMap(open)]
      : [child];
  return (double.root.children[0]?.children ?? []).flatMap(open);
}

/**
 * Spec 014 ③ (F31): the ekzemplo fixture writes its display roles in capitals, komuna does not —
 * the titolo's display variants carry TEXT_CASE_VARIES, and the run says so once per set. The one
 * warning every run over both Aspektoj reports.
 */
const TITOLO_CASE_WARNING =
  "titolo: Die Schreibweise der Beschriftung ist nicht in allen Modi dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — eine Marke auszuwählen wäre keine Projektion.";

describe("Figma development plugin (T016)", () => {
  it("ships a manifest that Figma can import from disk", () => {
    const manifest = JSON.parse(files["figma/plugin/manifest.json"] ?? "{}") as Record<
      string,
      unknown
    >;
    expect(manifest).toMatchObject({ api: "1.0.0", main: "code.js", editorType: ["figma"] });
    expect(String(manifest.name)).toContain("Fundamento");
  });

  it("creates every collection, variable and the component set on the first run", async () => {
    const double = modelDouble();
    await run(double);
    expect(double.collections.map((collection) => collection.name)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
    const planned = plan.collections.flatMap((collection) => collection.variables);
    expect(double.variables).toHaveLength(planned.length);
    // Spec 011 ③: the avizo sorts before the butono; the set of the butono is read by name.
    const set = pageNodes(double).find(
      (child) => child.type === "COMPONENT_SET" && child.name === "butono",
    );
    expect(set?.name).toBe("butono");
    expect(set?.getSharedPluginData("fundamento", "ero")).toBe("butono");
    expect(set?.children).toHaveLength(butonoOf(plan.components)?.variants.length ?? 0);
  });

  it("changes nothing on a second run (idempotent)", async () => {
    const double = modelDouble();
    await run(double);
    const first = double.snapshot();
    const created = { ...double.counts };
    await run(double);
    expect(double.snapshot()).toBe(first);
    expect(double.counts.collections).toBe(created.collections);
    expect(double.counts.variables).toBe(created.variables);
    expect(double.counts.nodes).toBe(created.nodes);
  });

  it("updates a changed plan in place instead of duplicating", async () => {
    const double = modelDouble();
    await run(double);
    const created = { ...double.counts };
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const collection = changed.collections.find((candidate) => candidate.name === "color-scheme");
    const variable = collection?.variables.find((candidate) => candidate.hidden !== true);
    if (variable === undefined || collection === undefined) throw new Error("no variable");
    variable.values[collection.modes[0] ?? ""] = { r: 0.5, g: 0.25, b: 0.125, a: 1 };
    const source = (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );
    await run(double, source);
    expect(double.counts.variables).toBe(created.variables);
    expect(double.counts.nodes).toBe(created.nodes);
    const applied = double.variables.find((candidate) => candidate.name === variable.name);
    expect(Object.values(applied?.valuesByMode ?? {})).toContainEqual({
      r: 0.5,
      g: 0.25,
      b: 0.125,
      a: 1,
    });
  });

  it("creates no collection without variables, on either run (F1, review decision 2)", async () => {
    const empty = plan.collections.filter((collection) => collection.variables.length === 0);
    // Every Aspekto restates every core token (Art. IV), so `fundamento` carries none of them.
    expect(empty.map((collection) => collection.name)).toEqual(["fundamento"]);
    const double = modelDouble();
    await run(double);
    expect(double.collections.map((collection) => collection.name)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
    const created = { ...double.counts };
    await run(double);
    expect(double.counts.collections).toBe(created.collections);
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(false);
  });

  // A double that swallows is worse than none: it turns green into a statement about nothing
  // (Jugxo of 2026-09-20). What the double does not model must fail loudly, with the member named.
  it("refuses an API member it does not model, instead of pretending it exists", () => {
    const double = modelDouble();
    const api = double.figma as Record<string, unknown>;
    expect(() => api.createEllipse).toThrow(/createEllipse/);
    expect(() => api.getNodeByIdAsync).toThrow(/does not model/);
    // What it does model stays reachable, including the members the plugin only probes.
    expect(typeof api.createFrame).toBe("function");
    expect(api.command).toBeUndefined();
  });

  // Abnahme 014 ②–⑤ (2026-10-18, F-4): the real tool aborted the run with "no setter for property"
  // in write ← flush ← drawSeparator — the separator wrote `width` on its frame, which the Plugin
  // API declares read-only (resize sets it). The double had accepted the write. From now on it
  // refuses every read-only field on every node type the plugin creates, so a drawing that writes
  // one fails here first: the full runs below cover the tooltip, popover, menu, disclosure, the
  // listbox of the kompletigilo and the icons from createNodeFromSvg.
  it("refuses a write to a read-only field (width, height) on a frame, a text and a node from an SVG, as Figma does", () => {
    const double = modelDouble();
    const api = double.figma as {
      createFrame: () => DoubleNode;
      createText: () => DoubleNode;
      createNodeFromSvg: (svg: string) => DoubleNode;
    };
    const frame = api.createFrame();
    const text = api.createText();
    const glyph = api.createNodeFromSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M0 0h16v16z"/></svg>',
    );
    for (const node of [frame, text, glyph, glyph.children[0]]) {
      expect(() => {
        (node as unknown as { width: number }).width = 24;
      }, node?.type).toThrow(/no setter for property/);
      expect(() => {
        (node as unknown as { height: number }).height = 24;
      }, node?.type).toThrow(/no setter for property/);
    }
    // What resize sets stays settable through resize.
    expect(() => frame.resize(24, 24)).not.toThrow();
    expect((frame as unknown as { width: number }).width).toBe(24);
  });

  it("never touches a node without Fundamento plugin data", async () => {
    const double = modelDouble();
    const page = double.root.children[0];
    const foreign = { ...double.figma } as {
      createFrame: () => ReturnType<typeof figmaDouble>["root"];
    };
    const stranger = foreign.createFrame();
    stranger.name = "Not ours";
    page?.appendChild(stranger);
    await run(double);
    expect(stranger.parent).toBe(page);
    expect(stranger.pluginData).toEqual({});
    expect(stranger.children).toEqual([]);
  });
});

// F8 (Abnahme M1): Figma binds only the RGB of a variable to a paint — the deckkraft stays 1 and a
// translucent token renders opaque. The plugin therefore sets `paint.opacity` from the plan, in
// every case, and keeps the binding to `color` so the file still shows which variable rules the
// fill.
// The Modelo of this repository — the plan the maintainer runs in Figma.
const repo = celoInputOf(defaultModeloSource());
if (!repo.ok) throw new Error("the repo Modelo must be valid");
const repoFiles = Object.fromEntries(
  FIGMA_CELO.generate(repo.input).map((file) => [file.path, file.text]),
);
const repoPlan = JSON.parse(repoFiles["figma/plan.json"] ?? "{}") as FigmaPlan;

/**
 * The set of the butono in a list of components or of their reports: the Ero order sorts the
 * avizo before it since Spec 011 ③, so the butono is no longer the first set of the plan.
 */
const butonoOf = <T>(components: readonly T[] | undefined): T | undefined =>
  components?.find((component) => (component as { set?: unknown }).set === "butono");

/** The node of that name below `node`, at any depth: the control sits inside the focus ring. */
function descendant(node: DoubleNode | undefined, name: string): DoubleNode | undefined {
  for (const child of node?.children ?? []) {
    if (child.name === name) return child;
    const found = descendant(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

// Spec 007 T028 (A12, D-10): the plugin writes the purpose of the Uzo as the set's description.
describe("the set carries the purpose of the Uzo as its description (T028)", () => {
  it("writes plan.components[].description to the component set", async () => {
    const double = modelDouble();
    await run(double);
    const set = pageNodes(double).find((child) => child.name === "butono");
    const planned = plan.components.find((component) => component.set === "butono");
    expect(planned?.description).toBeDefined();
    // Befund B1: description and descriptionMarkdown are one field; the purpose is its first line.
    expect(String(set?.properties.description).split("\n")[0]).toBe(planned?.description);
  });
});

// Spec 007 T029 (A12, D-10, OP-9): the plugin tries to carry the boundaries, slot rules and text
// rules of the Uzo into the file and measures the answer, as Spec 005 A6 did for bindings. Against
// a double that refuses the field, the report lists the Manko as open; against one that accepts
// it, as closed. The Mankoj in mankoj.json come only with the measurement in real Figma.
describe("the plugin tries the Uzo beyond the purpose and reports open or closed (T029)", () => {
  type UzoReport = {
    components: { set: string; uzo?: { field: string; status: string; evidence: string } }[];
    mankoj: {
      open: { set: string; part: string; field: string; evidence: string }[];
      closed: { set: string; part: string; field: string; evidence: string }[];
    };
  };
  async function report(double: ReturnType<typeof figmaDouble>): Promise<UzoReport> {
    const module = new Function(
      "figma",
      "options",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, undefined)) as UzoReport;
  }
  const planned = plan.components.find((component) => component.set === "butono");

  it("against a double that refuses descriptionMarkdown: open, with the tool's words", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, refuse: ["descriptionMarkdown"] });
    const result = await report(double);
    const set = pageNodes(double).find((child) => child.name === "butono");
    expect(set?.properties.description).toBe(planned?.description);
    expect(set?.properties.descriptionMarkdown).toBeUndefined();
    const butono = result.components.find((component) => component.set === "butono");
    expect(butono?.uzo?.status).toBe("open");
    expect(butono?.uzo?.evidence).toContain("descriptionMarkdown");
    expect(result.mankoj.closed).toEqual([]);
    // Spec 008: two sets, three parts each; the butono's are read here, the ligilo's alike.
    const openButono = result.mankoj.open.filter((manko) => manko.set === "butono");
    expect(openButono.map((manko) => manko.part)).toEqual(["boundary", "slots", "content"]);
    expect(result.mankoj.open.map((manko) => manko.set)).toEqual([
      // Spec 014 ②: the apartigilo, the ikono and the saltligilo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "apartigilo"),
      // Spec 011 ④: the atributlisto, the mezurilo and the tabelo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "atributlisto"),
      // Spec 011 ③: the avizo, the insigno and the plenstato carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "avizo"),
      ...["boundary", "slots", "content"].map(() => "butono"),
      // Spec 011 ②: the dialogo and the tekstareo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "dialogo"),
      ...["boundary", "slots", "content"].map(() => "elektilo"),
      ...["boundary", "slots", "content"].map(() => "elekto"),
      // Spec 014 ⑤: the faldilo and the kompletigilo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "faldilo"),
      ...["boundary", "slots", "content"].map(() => "ikono"),
      ...["boundary", "slots", "content"].map(() => "insigno"),
      ...["boundary", "slots", "content"].map(() => "kampo"),
      ...["boundary", "slots", "content"].map(() => "kompletigilo"),
      // Spec 014 ④: the konsileto, the menuo and the sxvebilo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "konsileto"),
      // Spec 011 ⑤: the langetaro and the navigado carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "langetaro"),
      ...["boundary", "slots", "content"].map(() => "ligilo"),
      ...["boundary", "slots", "content"].map(() => "markobutono"),
      ...["boundary", "slots", "content"].map(() => "menuo"),
      ...["boundary", "slots", "content"].map(() => "mezurilo"),
      ...["boundary", "slots", "content"].map(() => "navigado"),
      // Spec 015 ①: the pagxigilo and the spuro carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "pagxigilo"),
      ...["boundary", "slots", "content"].map(() => "plenstato"),
      ...["boundary", "slots", "content"].map(() => "saltligilo"),
      ...["boundary", "slots", "content"].map(() => "spuro"),
      ...["boundary", "slots", "content"].map(() => "sxaltilo"),
      ...["boundary", "slots", "content"].map(() => "sxvebilo"),
      ...["boundary", "slots", "content"].map(() => "tabelo"),
      ...["boundary", "slots", "content"].map(() => "tekstareo"),
      ...["boundary", "slots", "content"].map(() => "teksto"),
      ...["boundary", "slots", "content"].map(() => "titolo"),
    ]);
    for (const manko of openButono) {
      expect(manko.set).toBe("butono");
      expect(manko.field).toBe("descriptionMarkdown");
      expect(manko.evidence).toContain("descriptionMarkdown");
    }
  });

  it("against a double that accepts it: closed, the Markdown written to the set", async () => {
    const double = modelDouble();
    const result = await report(double);
    const set = pageNodes(double).find((child) => child.name === "butono");
    expect(set?.properties.descriptionMarkdown).toBe(planned?.uzo?.markdown);
    // Befund B1 (Maintainer, f10b-5, 2026-10-12): Markdown and description are one field, so
    // the purpose (T028) has to be the first line of what T029 writes, or it is gone.
    expect(String(set?.properties.description).split("\n")[0]).toBe(planned?.description);
    const butono = result.components.find((component) => component.set === "butono");
    expect(butono?.uzo?.status).toBe("closed");
    expect(result.mankoj.open).toEqual([]);
    // Spec 008: both sets close their three parts; the butono's are read here.
    expect(
      result.mankoj.closed.filter((manko) => manko.set === "butono").map((manko) => manko.part),
    ).toEqual(["boundary", "slots", "content"]);
    expect(result.mankoj.closed.map((manko) => manko.set)).toEqual([
      // Spec 014 ②: the apartigilo, the ikono and the saltligilo close their three parts too.
      ...["apartigilo", "apartigilo", "apartigilo"],
      // Spec 011 ④: the atributlisto, the mezurilo and the tabelo close their three parts too.
      ...["atributlisto", "atributlisto", "atributlisto"],
      // Spec 011 ③: the avizo, the insigno and the plenstato close their three parts too.
      ...["avizo", "avizo", "avizo"],
      ...["butono", "butono", "butono"],
      // Spec 011 ②: the dialogo and the tekstareo close their three parts too.
      ...["dialogo", "dialogo", "dialogo"],
      ...["elektilo", "elektilo", "elektilo"],
      ...["elekto", "elekto", "elekto"],
      // Spec 014 ⑤: the faldilo and the kompletigilo close their three parts too.
      ...["faldilo", "faldilo", "faldilo"],
      ...["ikono", "ikono", "ikono"],
      ...["insigno", "insigno", "insigno"],
      ...["kampo", "kampo", "kampo"],
      ...["kompletigilo", "kompletigilo", "kompletigilo"],
      // Spec 014 ④: the overlays close their three parts too.
      ...["konsileto", "konsileto", "konsileto"],
      // Spec 011 ⑤: the langetaro and the navigado close their three parts too.
      ...["langetaro", "langetaro", "langetaro"],
      ...["ligilo", "ligilo", "ligilo"],
      ...["markobutono", "markobutono", "markobutono"],
      ...["menuo", "menuo", "menuo"],
      ...["mezurilo", "mezurilo", "mezurilo"],
      ...["navigado", "navigado", "navigado"],
      // Spec 015 ①: the pagxigilo and the spuro close their three parts too.
      ...["pagxigilo", "pagxigilo", "pagxigilo"],
      ...["plenstato", "plenstato", "plenstato"],
      ...["saltligilo", "saltligilo", "saltligilo"],
      ...["spuro", "spuro", "spuro"],
      ...["sxaltilo", "sxaltilo", "sxaltilo"],
      ...["sxvebilo", "sxvebilo", "sxvebilo"],
      ...["tabelo", "tabelo", "tabelo"],
      ...["tekstareo", "tekstareo", "tekstareo"],
      ...["teksto", "teksto", "teksto"],
      ...["titolo", "titolo", "titolo"],
    ]);
  });
});

describe("the paint carries the alpha of its token (F8)", () => {
  // One brand: the decision is unambiguous in every mode. With a second brand whose tertiary fill
  // is opaque the plan says `alphaVariesByMode`, and the guard refuses the binding — see the
  // Figma-side test.
  const variantOf = (props: Record<string, string>) =>
    butonoOf(repoPlan.components)?.variants.find((entry) =>
      Object.entries(props).every(([key, value]) => entry.props[key] === value),
    );

  type Paint = { opacity?: number; boundVariables?: unknown } | undefined;

  /**
   * The three paints of one variant. The fix touches every colour binding, so every colour binding
   * is measured: `surface.fill` on the control, `border.color` on its strokes and `label.color` on
   * the label. Measuring only the fill would leave the other two "proved by construction" — which
   * is no proof (maintainer, 2026-09-20).
   */
  async function paintsOf(props: Record<string, string>) {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    const name = Object.entries(variantOf(props)?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    const control = descendant(variant, "control");
    const label = descendant(control, "label");
    const paints = (node: typeof control, field: string) =>
      ((node?.properties[field] ?? []) as Paint[])[0];
    return {
      fill: paints(control, "fills"),
      stroke: paints(control, "strokes"),
      label: paints(label, "fills"),
    };
  }

  it("a fully transparent fill is not opaque, and keeps its binding", async () => {
    const { fill } = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(fill?.opacity).toBe(0);
    expect(fill?.boundVariables).toBeDefined();
  });

  it("an overlay carries its deckkraft", async () => {
    const { fill } = await paintsOf({ emphasis: "low", intent: "neutral", state: "hover" });
    expect(fill?.opacity).toBe(0.08);
  });

  it("an opaque fill stays opaque", async () => {
    const { fill } = await paintsOf({ emphasis: "high", intent: "neutral", state: "rest" });
    expect(fill?.opacity).toBe(1);
  });

  // `border.color` is the second of the two parts every tertiary role is bound to, and it carries
  // the same three cases as the fill.
  it("the border of a variant carries the same deckkraft as its fill", async () => {
    const rest = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(rest.stroke?.opacity).toBe(0);
    expect(rest.stroke?.boundVariables).toBeDefined();
    const hover = await paintsOf({ emphasis: "low", intent: "neutral", state: "hover" });
    expect(hover.stroke?.opacity).toBe(0.08);
    expect(hover.stroke?.boundVariables).toBeDefined();
    const primary = await paintsOf({ emphasis: "high", intent: "neutral", state: "rest" });
    expect(primary.stroke?.opacity).toBe(1);
  });

  // The label is the third bound paint. No label colour is translucent today — that is what the
  // measurement says, and it would catch the day a label arrives at deckkraft 1 by accident.
  it("the label carries its deckkraft and keeps its binding", async () => {
    const tertiary = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(tertiary.label?.opacity).toBe(1);
    expect(tertiary.label?.boundVariables).toBeDefined();
    const disabled = await paintsOf({ emphasis: "low", intent: "neutral", state: "disabled" });
    expect(disabled.label?.opacity).toBe(1);
    expect(disabled.label?.boundVariables).toBeDefined();
  });
});

// F10 (Abnahme M1): the run in Figma has to be a measurement, not a look. The plugin reports per
// component what it created, updated and found, warns symmetrically when the component holds more
// or fewer variants than the plan names, prints the whole report to the console and puts the
// headline in the toast. A rejected run no longer disappears: it says so.
describe("the plugin reports what it did (F10)", () => {
  const variants = butonoOf(plan.components)?.variants.length ?? 0;
  const nameOf = (index: number) =>
    Object.entries(butonoOf(plan.components)?.variants[index]?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");

  async function report(double: ReturnType<typeof figmaDouble>, options?: typeof LIFT) {
    const module = new Function(
      "figma",
      "options",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, options)) as {
      collections: number;
      variables: number;
      components: {
        set: string;
        created: string[];
        updated: string[];
        missing: string[];
        extra: string[];
      }[];
      warnings: string[];
    };
  }

  it("counts every variant as created on the first run and as updated on the second", async () => {
    const double = modelDouble();
    const first = await report(double);
    expect(butonoOf(first.components)?.set).toBe("butono");
    expect(butonoOf(first.components)?.created).toHaveLength(variants);
    expect(butonoOf(first.components)?.updated).toEqual([]);
    expect(first.warnings).toEqual([TITOLO_CASE_WARNING]);
    const second = await report(double);
    expect(butonoOf(second.components)?.created).toEqual([]);
    expect(butonoOf(second.components)?.updated).toHaveLength(variants);
    expect(second.warnings).toEqual([TITOLO_CASE_WARNING]);
  });

  // The finding that made this necessary: a document of mixed history held 71 of 72 variants, and
  // nothing said so. Both directions are named, with the names of the variants.
  it("names the variants that are missing and the ones too many", async () => {
    const double = modelDouble();
    await report(double);
    const set = pageNodes(double).find((child) => child.name === "butono");
    if (set === undefined) throw new Error("no component set");
    const gone = nameOf(0);
    set.children.find((child) => child.name === gone)?.remove();
    const stranger = double.figma.createFrame as () => DoubleNode;
    const extra = stranger();
    extra.name = "variant=phantom";
    extra.setSharedPluginData("fundamento", "variant", "variant=phantom");
    set.appendChild(extra);
    const again = await report(double, LIFT);
    expect(butonoOf(again.components)?.created).toEqual([gone]);
    expect(butonoOf(again.components)?.extra).toEqual(["variant=phantom"]);
    expect(again.warnings.join(" ")).toContain("variant=phantom");
  });

  it("prints the whole report and puts the headline in the toast", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const log = console.log;
    console.log = (...parts: unknown[]) => lines.push(parts.map(String).join(" "));
    try {
      const source = `${files["figma/plugin/code.js"] ?? ""}`;
      const module = new Function("figma", "console", source);
      await module({ ...double.figma, command: "run" }, { log: console.log, error: console.log });
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      console.log = log;
    }
    expect(lines.join("\n")).toContain('"set":"butono"');
    // Spec 014 ③: with the ekzemplo Aspekto the headline carries the one warning (the titolo's
    // display roles differ in case between the brands, F31) — the toast says so, not the sets.
    expect(double.notifications.map((entry) => entry.message).join(" ")).toContain("titolo");
    expect(double.notifications[0]?.message).toContain("Konsole");
  });

  it("says it when the run fails instead of swallowing the rejection", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const source = `${files["figma/plugin/code.js"] ?? ""}`;
    const module = new Function("figma", "console", source);
    await module(
      {
        ...double.figma,
        command: "run",
        loadFontAsync: async () => {
          throw new Error("Inter fehlt");
        },
      },
      {
        log: () => undefined,
        error: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(lines.join("\n")).toContain("Inter fehlt");
    expect(double.notifications[0]?.message).toContain("fehlgeschlagen");
    expect(double.notifications[0]?.options).toMatchObject({ error: true });
  });
});

// Abnahme 014 ②–⑤ (2026-10-18, F-5): the maintainer's file holds the 17 sets of before Spec 014 ②,
// the atributlisto without layout=auto. Against the strict double — it refuses sizing outside auto
// layout and read-only fields as Figma does — the whole plan must run twice without a refusal:
// fresh, and into that file with „auch in vorgefundenem Set anlegen" (the new sets and the auto
// variants of the found atributlisto are created). Before this, the real tool found the errors one
// by one (F-4 the separator, F-5 the first variant whose sizing was written before its parent had
// auto layout).
describe("the full plan against the strict double: fresh and into the file of before ② (Abnahme F-5)", () => {
  const BEFORE_2 = new Set([
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
  const before2 = structuredClone(repo.input);
  before2.modelo.eroj = before2.modelo.eroj.filter((entry) => !BEFORE_2.has(entry.ero.name));
  const list = before2.modelo.eroj.find((entry) => entry.ero.name === "atributlisto");
  if (list === undefined) throw new Error("atributlisto missing");
  const layout = list.skemo.props.find((prop) => prop.name === "layout");
  if (layout?.values !== undefined)
    layout.values = layout.values.filter((value) => value !== "auto");
  list.skemo.bindings = list.skemo.bindings.filter((binding) => binding.when?.layout !== "auto");
  const files17 = Object.fromEntries(
    FIGMA_CELO.generate(before2).map((file) => [file.path, file.text]),
  );
  type Report = {
    components: { set: string; found: boolean; created: string[]; updated: string[] }[];
    warnings: string[];
  };
  async function runWith(
    double: ReturnType<typeof figmaDouble>,
    source: string,
    options?: typeof LIFT,
  ): Promise<Report> {
    const module = new Function("figma", "options", `${source}\nreturn applyPlan(options);`);
    return (await module(double.figma, options)) as Report;
  }
  const refused = (report: Report) =>
    report.warnings.filter((warning) => /abgelehnt|no setter|auto-layout/.test(warning));

  it("fresh: every one of the 27 sets is drawn, nothing refused", async () => {
    const double = modelDouble();
    const report = await runWith(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(report.components).toHaveLength(repoPlan.components.length);
    expect(report.components.map((set) => set.set)).toEqual(
      repoPlan.components.map((component) => component.set),
    );
    expect(refused(report)).toEqual([]);
  });

  it("the file of before ②: 17 sets, the atributlisto without auto; then the current plan into the found file creates the 10 sets and the auto variants, nothing refused", async () => {
    const double = modelDouble();
    const first = await runWith(double, files17["figma/plugin/code.js"] ?? "");
    expect(first.components).toHaveLength(17);
    const listBefore = first.components.find((set) => set.set === "atributlisto");
    expect(listBefore?.created.some((name) => name.includes("layout=auto"))).toBe(false);
    const second = await runWith(double, repoFiles["figma/plugin/code.js"] ?? "", LIFT);
    expect(second.components).toHaveLength(repoPlan.components.length);
    const listAfter = second.components.find((set) => set.set === "atributlisto");
    expect(listAfter?.found).toBe(true);
    expect(listAfter?.created.length).toBeGreaterThan(0);
    expect(listAfter?.created.every((name) => name.includes("layout=auto"))).toBe(true);
    // The sets this branch adds beyond the 17 (on ② three, on ⑤ ten) are created, not found.
    const added = repoPlan.components
      .map((component) => component.set)
      .filter((name) => BEFORE_2.has(name));
    expect(added.length).toBeGreaterThan(0);
    for (const name of added) {
      const set = second.components.find((each) => each.set === name);
      expect(set?.found, name).toBe(false);
      expect(set?.created.length, name).toBeGreaterThan(0);
    }
    expect(refused(second)).toEqual([]);
    // A third run finds everything and creates nothing.
    const third = await runWith(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(third.components.every((set) => set.found && set.created.length === 0)).toBe(true);
  });
});

// F10b (Abnahme M1, frische Datei QtJRsTlm7NnIPC8wqNuAVm): Lauf 1 legte 72 Varianten an, Lauf 2
// meldete `found: true`, `created: 1` — und zwar die **letzte** Variante des Plans
// (emphasis=low, intent=neutral, size=large, state=loading), bei `updated: 71` und `warnings: []`.
// Hier wird der Fall nachgestellt: zwei Läufe hintereinander gegen den Plan dieses Repositories.
describe("a second run creates nothing (F10b, the maintainer's case)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>, options?: typeof LIFT) {
    const module = new Function(
      "figma",
      "options",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, options)) as {
      components: { set: string; found: boolean; created: string[]; updated: string[] }[];
      warnings: string[];
    };
  }

  it("finds all 72 variants again, creates none", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(butonoOf(first.components)?.created).toHaveLength(72);
    const second = await run2(double);
    expect(butonoOf(second.components)?.found).toBe(true);
    expect(butonoOf(second.components)?.created).toEqual([]);
    expect(butonoOf(second.components)?.updated).toHaveLength(72);
    // The variant Figma re-created is the last one of the plan; name it, so a failure here is
    // immediately comparable with the measurement in Figma.
    const last = butonoOf(repoPlan.components)?.variants.at(-1)?.props ?? {};
    expect(
      Object.entries(last)
        .map(([key, value]) => `${key}=${value}`)
        .join(", "),
    ).toBe("emphasis=low, intent=neutral, size=large, state=loading");
  });
});

// F10b, zweiter Teil: Der Lauf in Figma ging mit `warnings: []` durch, obwohl er in einem
// vorgefundenen Set eine Variante neu angelegt hat. Regel des Maintainers: Ist das Set
// vorgefunden und wird trotzdem etwas angelegt, ist das **immer** eine Warnung. Dazu meldet der
// Lauf, wie er das Set vorgefunden hat — das trennt „Knoten weg" von „Markierung weg", ohne zu
// raten.
describe("a run that creates in a set it found warns, and says what it found (F10b)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>, options?: typeof LIFT) {
    const module = new Function(
      "figma",
      "options",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, options)) as {
      components: {
        set: string;
        found: boolean;
        created: string[];
        updated: string[];
        missing: string[];
        extra: string[];
        duplicates: string[];
        before: { children: number; marked: number; unmarked: string[] };
        after: { children: number; marked: number };
      }[];
      warnings: string[];
    };
  }

  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = pageNodes(double).find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "emphasis=low, intent=neutral, size=large, state=loading";

  // Der entscheidende Messpunkt für den nächsten Lauf in Figma: Nach dem Lauf steht im Bericht,
  // wie viele Kinder das Set trägt und wie viele davon unsere Markierung tragen. Bleibt die
  // Markierung des letzten Knotens in Figma nicht haften, sagt das schon Lauf 1 — und nicht erst
  // Lauf 2 über den Umweg „created: 1".
  it("reports how it left the set, marks included", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(butonoOf(first.components)?.after).toEqual({ children: 72, marked: 72 });
    expect(first.warnings).toEqual([]);
  });

  it("warns when a child of the set has no mark after the run", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.setSharedPluginData("fundamento", "variant", "");
    // Der Lauf legt die Variante neu an; der unmarkierte Knoten bleibt daneben stehen.
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.after).toEqual({ children: 73, marked: 72 });
    expect(again.warnings.join(" ")).toContain("ohne Markierung");
  });

  it("reports how it found the set before it changed anything", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(butonoOf(first.components)?.before).toEqual({ children: 0, marked: 0, unmarked: [] });
    const second = await run2(double);
    expect(butonoOf(second.components)?.before).toEqual({ children: 72, marked: 72, unmarked: [] });
  });

  // End state one: the node is gone. That is what the maintainer's numbers say — 71 children at
  // the start of run 2, 72 after it.
  it("warns when it creates a variant in a set it found, and names it", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.found).toBe(true);
    expect(butonoOf(again.components)?.created).toEqual([LAST]);
    expect(butonoOf(again.components)?.before?.children).toBe(71);
    // Zwei Warnungen: die Regel („vorgefunden und trotzdem angelegt") und die Deutung des Paars
    // aus dem Endstand des vorigen Laufs und dem Anfangsstand dieses Laufs.
    const warnings = again.warnings;
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain(LAST);
    expect(warnings[0]).toContain("vorgefunden");
    expect(warnings[1]).toContain("zwischen den Läufen");
  });

  // End state two: the node is there but lost our mark. Then the run creates a second node of the
  // same name — the set ends with 73 children and a duplicate, and both are said out loud.
  it("names a child that lost its mark, and the duplicate it causes", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.setSharedPluginData("fundamento", "variant", "");
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.before?.unmarked).toEqual([LAST]);
    expect(butonoOf(again.components)?.before?.marked).toBe(71);
    expect(butonoOf(again.components)?.created).toEqual([LAST]);
    expect(butonoOf(again.components)?.duplicates).toEqual([LAST]);
    expect(setOf(double).children).toHaveLength(73);
    expect(again.warnings.join(" ")).toContain("doppelt");
  });
});

// F10b, dritter Teil (Maintainer, 2026-09-21): Lauf 2 lässt sich nur im Licht von Lauf 1 deuten.
// `before: 71` heißt „zwischen den Läufen verschwunden" nur dann, wenn Lauf 1 mit `after: 72`
// geendet hat; endete Lauf 1 schon mit 71, war der Knoten nie im Set. Der Lauf wertet dieses Paar
// selbst aus: Er legt seinen `after`-Stand als Plugin-Daten am Set ab und liest ihn beim nächsten
// Mal als `left` wieder ein. Damit braucht der Maintainer zwischen den Läufen nichts abzulesen —
// Ablesen hieße auswählen, und das wäre schon ein Eingriff.
describe("the run reads its own last state and says what happened (F10b)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>, options?: typeof LIFT) {
    const module = new Function(
      "figma",
      "options",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, options)) as {
      components: {
        planned: number;
        before: { children: number; marked: number; unmarked: string[] };
        after: { children: number; marked: number };
        left: { children: number; marked: number } | null;
        diagnosis: string;
        created: string[];
      }[];
      warnings: string[];
    };
  }

  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = pageNodes(double).find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "emphasis=low, intent=neutral, size=large, state=loading";

  it("leaves its state at the set and finds it again next time", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(butonoOf(first.components)?.planned).toBe(72);
    expect(butonoOf(first.components)?.left).toBeNull();
    expect(butonoOf(first.components)?.diagnosis).toBe("");
    const second = await run2(double);
    expect(butonoOf(second.components)?.left).toEqual({ children: 72, marked: 72 });
    expect(butonoOf(second.components)?.diagnosis).toBe("");
    expect(second.warnings).toEqual([]);
  });

  it("says 'gone between the runs' when the last run left the set complete", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.left).toEqual({ children: 72, marked: 72 });
    expect(butonoOf(again.components)?.diagnosis).toContain("zwischen den Läufen");
    expect(again.warnings.join(" ")).toContain("zwischen den Läufen");
  });

  // Der wahrscheinlichste Fall, und der, der zur alten Datei von gestern passt: Schon der erste
  // Lauf hinterließ 71 — die Variante ist beim Anlegen nie im Set angekommen.
  it("says 'never arrived' when the last run already left the set short", async () => {
    const double = modelDouble();
    await run2(double);
    const set = setOf(double);
    set.children.find((child) => child.name === LAST)?.remove();
    set.setSharedPluginData("fundamento", "after", JSON.stringify({ children: 71, marked: 71 }));
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.left).toEqual({ children: 71, marked: 71 });
    expect(butonoOf(again.components)?.diagnosis).toContain("nie im Set angekommen");
    expect(butonoOf(again.components)?.created).toEqual([LAST]);
  });

  it("says that the pair cannot be read yet when no earlier state is at the set", async () => {
    const double = modelDouble();
    await run2(double);
    const set = setOf(double);
    set.children.find((child) => child.name === LAST)?.remove();
    set.setSharedPluginData("fundamento", "after", "");
    const again = await run2(double, LIFT);
    expect(butonoOf(again.components)?.left).toBeNull();
    expect(butonoOf(again.components)?.diagnosis).toContain("früheren Laufs");
  });
});

// F10c (Maintainer, 2026-10-07): Schadensbegrenzung, nicht die Ursache. In Figma legte Lauf 2 in
// einem vorgefundenen Set die letzte Variante neu an, und das Double bildet das nicht ab — warum,
// ist offen. Bis es gemessen ist, darf ein solcher Lauf die Bibliothek nicht mehr verändern: Er
// bricht ab, bevor er irgendetwas schreibt, und nennt, was er angelegt hätte. Eine Warnung allein
// schützt die Bibliothek nicht. Wer bewusst weitermachen will, hebt den Abbruch auf; Default: aus.
describe("a run that would create in a set it found aborts before it writes (F10c)", () => {
  interface Abort {
    sets: {
      set: string;
      before: { children: number; marked: number; unmarked: string[] };
      left: { children: number; marked: number } | null;
      wouldCreate: { name: string; props: Record<string, string>; node: boolean }[];
    }[];
  }
  async function run2(double: ReturnType<typeof figmaDouble>, options?: unknown) {
    const module = new Function(
      "figma",
      "options",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module(double.figma, options)) as {
      components: { created: string[] }[];
      warnings: string[];
    };
  }
  async function abortOf(double: ReturnType<typeof figmaDouble>) {
    const error = await run2(double).then(
      () => undefined,
      (caught: unknown) => caught as Error & { abort?: Abort },
    );
    if (error === undefined) throw new Error("the run did not abort");
    return error;
  }

  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = pageNodes(double).find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "emphasis=low, intent=neutral, size=large, state=loading";
  const LAST_PROPS = { emphasis: "low", intent: "neutral", size: "large", state: "loading" };

  it("aborts when a variant is missing from the set it found, and has created no node", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const counts = { ...double.counts };
    const before = double.snapshot();
    await expect(run2(double)).rejects.toThrow();
    expect(double.counts).toEqual(counts);
    expect(double.snapshot()).toBe(before);
    expect(setOf(double).children).toHaveLength(71);
  });

  it("names the set, how it found it, and every variant it would have created, with props", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const error = await abortOf(double);
    expect(error.message).toContain("butono");
    expect(error.message).toContain(LAST);
    expect(error.abort).toEqual({
      sets: [
        {
          set: "butono",
          before: { children: 71, marked: 71, unmarked: [] },
          left: { children: 72, marked: 72 },
          wouldCreate: [{ name: LAST, props: LAST_PROPS, node: false }],
        },
      ],
    });
  });

  it("says when a node of that name is there but carries no mark", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.setSharedPluginData("fundamento", "variant", "");
    const counts = { ...double.counts };
    const error = await abortOf(double);
    expect(double.counts).toEqual(counts);
    expect(error.abort?.sets[0]?.before).toEqual({ children: 72, marked: 71, unmarked: [LAST] });
    expect(error.abort?.sets[0]?.wouldCreate).toEqual([
      { name: LAST, props: LAST_PROPS, node: true },
    ]);
  });

  it("does not abort a first run, nor a second run that finds every variant", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(butonoOf(first.components)?.created).toHaveLength(72);
    const second = await run2(double);
    expect(butonoOf(second.components)?.created).toEqual([]);
  });

  it("goes on when the maintainer lifts the abort on purpose, and still warns", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const again = await run2(double, { createInFoundSet: true });
    expect(butonoOf(again.components)?.created).toEqual([LAST]);
    expect(again.warnings.join(" ")).toContain("vorgefunden");
  });

  it("offers the lift as its own menu command; the plain command aborts and says so", async () => {
    const manifest = JSON.parse(repoFiles["figma/plugin/manifest.json"] ?? "{}") as {
      menu?: { name: string; command: string }[];
    };
    const commands = (manifest.menu ?? []).map((entry) => entry.command);
    expect(commands).toEqual(["apply", "apply-create-in-found-set"]);

    const runAs = async (double: ReturnType<typeof figmaDouble>, command: string) => {
      const module = new Function("figma", "console", repoFiles["figma/plugin/code.js"] ?? "");
      await module({ ...double.figma, command }, { log: () => undefined, error: () => undefined });
      await new Promise((resolve) => setTimeout(resolve, 0));
    };
    const double = modelDouble();
    await runAs(double, "apply");
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const counts = { ...double.counts };
    await runAs(double, "apply");
    expect(double.counts).toEqual(counts);
    expect(double.notifications.at(-1)?.message).toContain("Abbruch");
    expect(double.notifications.at(-1)?.message).toContain(LAST);
    expect(double.notifications.at(-1)?.options).toMatchObject({ error: true });
    await runAs(double, "apply-create-in-found-set");
    expect(setOf(double).children).toHaveLength(72);
  });
});

// F10d (Maintainer, 2026-10-07): Gemessen ist an QtJRsTlm7NnIPC8wqNuAVm nur, dass 1:895/896/897
// fehlen und 1:899/900/901 da sind — nicht, wann und wodurch. Das Plugin ruft nirgends remove()
// auf; verschwindet etwas, dann durch Figma. Deshalb misst jeder Lauf: Er nimmt beim Start jeden
// Knoten des Sets mit seiner ID auf, zählt am Ende erneut und meldet laut jede ID, die fehlt — mit
// der Angabe, ob der Knoten entfernt ist oder nur aus dem Set verdrängt. Eine Messung, kein Wächter:
// Der Lauf bricht deshalb nicht ab.
describe("a run reports every node of the set that was there at its start and is gone at its end (F10d)", () => {
  interface Lost {
    id: string;
    name: string;
    type: string;
    removed: boolean;
    parent: { id: string; type: string; name: string } | null;
  }
  interface Report {
    components: { nodes: { start: number; end: number }; lost: Lost[]; created: string[] }[];
    warnings: string[];
  }
  async function runWith(
    double: ReturnType<typeof figmaDouble>,
    figma: Record<string, unknown>,
    options?: typeof LIFT,
  ) {
    const module = new Function(
      "figma",
      "options",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan(options);`,
    );
    return (await module({ ...double.figma, ...figma }, options)) as Report;
  }
  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = pageNodes(double).find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "emphasis=low, intent=neutral, size=large, state=loading";
  /**
   * Variant, focus ring, focus gap, control, label: five nodes per variant, plus the set; since
   * Spec 014 ② the icon-start of every variant with its glyph frame and vector (the repo plan:
   * komuna alone): eight nodes per variant.
   */
  const NODES = 72 * 8 + 1;

  it("counts the same nodes at start and end of a clean run, and loses none", async () => {
    const double = modelDouble();
    const first = await runWith(double, {});
    expect(butonoOf(first.components)?.nodes).toEqual({ start: 0, end: NODES });
    expect(butonoOf(first.components)?.lost).toEqual([]);
    const second = await runWith(double, {});
    expect(butonoOf(second.components)?.nodes).toEqual({ start: NODES, end: NODES });
    expect(butonoOf(second.components)?.lost).toEqual([]);
    expect(second.warnings).toEqual([]);
  });

  it("names a node the tool removed during the run, by its ID", async () => {
    const double = modelDouble();
    await runWith(double, {});
    const old = setOf(double).children.find((child) => child.name === LAST);
    if (old === undefined) throw new Error("no last variant");
    old.setSharedPluginData("fundamento", "variant", "");
    const create = (double.figma as { createComponent: () => DoubleNode }).createComponent;
    // Stands in for Figma: while the run creates the variant anew, the old node goes.
    const again = await runWith(
      double,
      {
        createComponent: () => {
          old.remove();
          return create();
        },
      },
      LIFT,
    );
    expect(butonoOf(again.components)?.created).toEqual([LAST]);
    expect(butonoOf(again.components)?.lost.map((entry) => entry.id)).toContain(old.id);
    expect(butonoOf(again.components)?.lost.find((entry) => entry.id === old.id)).toMatchObject({
      name: LAST,
      type: "COMPONENT",
      removed: true,
      parent: null,
    });
    expect(again.warnings.join(" ")).toContain(old.id);
    expect(again.warnings.join(" ")).toContain("entfernt");
  });

  it("names a node the tool pushed out of the set, and where it lies now", async () => {
    const double = modelDouble();
    await runWith(double, {});
    const page = double.root.children[0];
    const old = setOf(double).children.find((child) => child.name === LAST);
    if (old === undefined || page === undefined) throw new Error("no last variant");
    old.setSharedPluginData("fundamento", "variant", "");
    const create = (double.figma as { createComponent: () => DoubleNode }).createComponent;
    const again = await runWith(
      double,
      {
        createComponent: () => {
          page.appendChild(old);
          return create();
        },
      },
      LIFT,
    );
    expect(butonoOf(again.components)?.lost.find((entry) => entry.id === old.id)).toMatchObject({
      removed: false,
      parent: { id: page.id, type: "PAGE" },
    });
    expect(again.warnings.join(" ")).toContain("verdrängt");
  });

  it("says it out loud even when the run is otherwise clean", async () => {
    const double = modelDouble();
    await runWith(double, {});
    const variant = setOf(double).children[0];
    const label = descendant(variant, "label");
    if (label === undefined) throw new Error("no label");
    const load = (double.figma as { loadFontAsync: (font: unknown) => Promise<void> })
      .loadFontAsync;
    let done = false;
    const again = await runWith(double, {
      loadFontAsync: async (font: unknown) => {
        if (!done) {
          done = true;
          label.remove();
        }
        return load(font);
      },
    });
    expect(butonoOf(again.components)?.created).toEqual([]);
    expect(butonoOf(again.components)?.nodes).toEqual({ start: NODES, end: NODES });
    expect(butonoOf(again.components)?.lost.map((entry) => entry.id)).toEqual([label.id]);
    expect(again.warnings).toHaveLength(1);
    expect(again.warnings[0]).toContain(label.id);
  });
});

// F-A (Messung 2026-10-08, Datei 9qNldNFlofRCwlkpnEKOS1, Build d1be8f0): Lauf 1 in einer leeren
// Datei stürzte ab mit „in set_textCase: Cannot write to node with unloaded font "Inter Regular"".
// Ein neuer Textknoten trägt Inter Regular; das Plugin schrieb textCase, bevor diese Schrift geladen
// war. In Dateien, in denen Inter Regular schon geladen war, fiel das nicht auf — im Double auch
// nicht, bis es das gemessene Verhalten lernte.
describe("a text is written only after its current font is loaded (F-A)", () => {
  it("runs through in an empty file where no font is loaded yet", async () => {
    const double = modelDouble();
    await expect(run(double, repoFiles["figma/plugin/code.js"] ?? "")).resolves.toBeUndefined();
    const set = pageNodes(double).find((child) => child.name === "butono");
    expect(set?.children).toHaveLength(72);
  });
});

// F-B (Messung 2026-10-08): Zwei lose, vollständig markierte Komponenten
// „emphasis=high, intent=neutral, size=small, state=rest" auf der Seite, in keinem Set. Jeder
// abgestürzte Lauf hinterließ eine; der nächste fand sie nicht (ours sucht im Set) und legte die
// Variante erneut an. F10c greift nicht, denn es gibt kein vorgefundenes Set. Vor dem ersten
// Schreiben sucht der Lauf deshalb auch markierte Komponenten außerhalb des Sets und bricht ab,
// wenn er welche findet — ohne sie still zu übernehmen und ohne sie still zu löschen.
describe("a marked component outside the set stops the run before it writes (F-B)", () => {
  // The first component a run makes: since Spec 011 ④ the atributlisto's, which sorts first.
  const FIRST = "layout=columns, state=rest";
  const FIRST_SET = "atributlisto";
  type Orphan = { id: string; name: string; set: string; parent: { id: string; type: string } };

  /** A run that crashes once its first component stands, as Figma's run did (F-A). */
  async function crashedRun(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    await module({
      ...double.figma,
      createText: () => {
        throw new Error("abgestürzt");
      },
    }).catch(() => undefined);
  }
  /**
   * F-B for itself, apart from F-A: a file where Inter Regular is already loaded, as in every file
   * before 2026-10-08 where the crash did not show.
   */
  const interLoaded = async (double: ReturnType<typeof figmaDouble>) =>
    (double.figma as { loadFontAsync: (font: object) => Promise<void> }).loadFontAsync({
      family: "Inter",
      style: "Regular",
    });
  const componentsNamed = (double: ReturnType<typeof figmaDouble>, name: string) => {
    const out: DoubleNode[] = [];
    const walk = (node: DoubleNode) => {
      if (node.type === "COMPONENT" && node.name === name) out.push(node);
      for (const child of node.children) walk(child);
    };
    walk(double.root);
    return out;
  };

  it("leaves no double behind after a crash and a new run, and names the orphan", async () => {
    const double = modelDouble();
    await crashedRun(double);
    const page = double.root.children[0];
    const orphans = componentsNamed(double, FIRST);
    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.parent).toBe(page);
    await interLoaded(double);
    const counts = { ...double.counts };
    const error = await run(double, repoFiles["figma/plugin/code.js"] ?? "").then(
      () => undefined,
      (caught: unknown) => caught as Error & { abort?: { orphans: Orphan[] } },
    );
    expect(componentsNamed(double, FIRST)).toHaveLength(1);
    expect(error?.message).toContain(orphans[0]?.id ?? "?");
    expect(error?.abort?.orphans).toEqual([
      { id: orphans[0]?.id, name: FIRST, set: FIRST_SET, parent: { id: page?.id, type: "PAGE" } },
    ]);
    expect(double.counts).toEqual(counts);
  });

  it("is not stopped by a component without Fundamento's mark", async () => {
    const double = modelDouble();
    const api = double.figma as { createComponent: () => DoubleNode };
    const stranger = api.createComponent();
    stranger.name = FIRST;
    await interLoaded(double);
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(stranger.parent).toBe(double.root.children[0]);
    expect(componentsNamed(double, FIRST)).toHaveLength(2);
  });
});

// Build-Stempel (Maintainer, 2026-10-08): Mit d1be8f0 hätte F10c beim zweiten Klick abbrechen
// müssen; gemessen war kein Abbruch, und welcher Stand wirklich lief, ließ sich aus der Datei nicht
// lesen. Jeder Lauf nennt deshalb seinen Build: im Bericht, im Toast, im Menünamen, und am Set als
// Plugin-Daten `build` — so zeigt jede Datei, welcher Stand sie zuletzt beschrieben hat.
describe("every run names its build", () => {
  const stamped = Object.fromEntries(
    FIGMA_CELO.generate({ ...repo.input, build: "abc1234" }).map((file) => [file.path, file.text]),
  );
  const LAST = "emphasis=low, intent=neutral, size=large, state=loading";
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    pageNodes(double).find((child) => child.name === "butono");

  it("carries the build in the source and in the menu name", () => {
    expect(stamped["figma/plugin/code.js"]?.split("\n")[0]).toContain("Build abc1234");
    const manifest = JSON.parse(stamped["figma/plugin/manifest.json"] ?? "{}") as { name: string };
    expect(manifest.name).toContain("abc1234");
  });

  it("names it in the report and stamps it on the set", async () => {
    const double = modelDouble();
    const module = new Function(
      "figma",
      `${stamped["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    const report = (await module(double.figma)) as { build: string };
    expect(report.build).toBe("abc1234");
    expect(setOf(double)?.getSharedPluginData("fundamento", "build")).toBe("abc1234");
  });

  it("says 'unbekannt' when the build was not given", async () => {
    const double = modelDouble();
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    const report = (await module(double.figma)) as { build: string };
    expect(report.build).toBe("unbekannt");
  });

  it("names it in the toast of a run and of an abort", async () => {
    const runAs = async (double: ReturnType<typeof figmaDouble>, command: string) => {
      const module = new Function("figma", "console", stamped["figma/plugin/code.js"] ?? "");
      await module({ ...double.figma, command }, { log: () => undefined, error: () => undefined });
      await new Promise((resolve) => setTimeout(resolve, 0));
    };
    const double = modelDouble();
    await runAs(double, "apply");
    expect(double.notifications.at(-1)?.message).toContain("abc1234");
    setOf(double)
      ?.children.find((child) => child.name === LAST)
      ?.remove();
    await runAs(double, "apply");
    expect(double.notifications.at(-1)?.message).toContain("Abbruch");
    expect(double.notifications.at(-1)?.message).toContain("abc1234");
  });
});

// F13 (Abnahme M1, Maintainer 2026-09-21): Jede Variante trug Figmas Vorgabefüllung #FFFFFF 100 %,
// die das Plugin nie entfernt hat — sie stammt nicht aus dem Modell und deckte die durchsichtige
// tertiäre Aktion wieder zu. Das Double legte Knoten ohne jede Vorgabe an und war genau an dieser
// Stelle blind (jug_01M3094ZC6F3XZ1H0MWQZ62MYV). Es lernt deshalb zuerst die Vorgaben des Werkzeugs;
// danach sichert der Test zu, dass nach dem Lauf keine Fläche mehr eine Vorgabe trägt.
//
// Geltungsbereich dieses Schritts: Flächen (`fills`, `strokes`). Die Vorgabegröße 100 × 100 und der
// leere Beschriftungstext sind F11 und werden dort derselben Zusicherung unterstellt.
describe("no paint in the file that the plan did not put there (F13)", () => {
  const WHITE = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

  it("knows the tool's defaults: a new frame and component are white, a text is black", () => {
    const double = modelDouble();
    const api = double.figma as {
      createFrame: () => DoubleNode;
      createComponent: () => DoubleNode;
      createText: () => DoubleNode;
    };
    expect(api.createFrame().properties.fills).toEqual(WHITE);
    expect(api.createComponent().properties.fills).toEqual(WHITE);
    expect(api.createText().properties.fills).toEqual([
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    ]);
  });

  it("leaves no variant, control or label holding a paint the tool put there", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.untouchedDefaults(["fills", "strokes"])).toEqual([]);
  });

  it("gives the variant itself no fill, so a transparent control shows what lies beneath", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    for (const variant of set?.children ?? []) {
      expect(variant.properties.fills, variant.name).toEqual([]);
    }
  });

  // Der Vorgabewert muss auch in einer Datei verschwinden, die ein älteres Plugin angelegt hat.
  it("clears the default on the second run too", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.untouchedDefaults(["fills", "strokes"])).toEqual([]);
  });
});

// F11, Geometrie (Paket „Figma zeigt das Ero", Schritt 2): Das Plugin setzte nie `layoutMode`. In
// Figma sind Innenabstände, Abstand und Mindestmaße ohne Auto-Layout wirkungslos — die Maße des
// Ero kamen nicht an, und die Abnahme sah Figmas 100 × 100. Das Double hat diese Bindungen
// stillschweigend angenommen; ab jetzt kennt es die Vorbedingung und scheitert laut
// (jug_01M3094ZC6F3XZ1H0MWQZ62MYV, erste Anwendung auf eine Vorbedingung des Werkzeugs).
describe("the geometry of the Ero reaches Figma (F11)", () => {
  const AUTO_LAYOUT_FIELDS = [
    "paddingLeft",
    "paddingRight",
    "itemSpacing",
    "minWidth",
    "minHeight",
  ];

  it("refuses an auto-layout binding on a frame without a layout mode", () => {
    const double = modelDouble();
    const api = double.figma as { createFrame: () => DoubleNode };
    const frame = api.createFrame();
    const variable = { name: "size/box/padding" } as unknown as Parameters<
      DoubleNode["setBoundVariable"]
    >[1];
    for (const field of AUTO_LAYOUT_FIELDS) {
      expect(() => frame.setBoundVariable(field, variable), field).toThrow(/layoutMode/);
    }
    frame.layoutMode = "HORIZONTAL";
    expect(() => frame.setBoundVariable("paddingLeft", variable)).not.toThrow();
  });

  async function controlOf(props: Record<string, string>) {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    const name = Object.entries(props)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    return descendant(variant, "control");
  }

  it("lays the control out horizontally, centred, and binds both inline paddings", async () => {
    const control = await controlOf({
      emphasis: "high",
      intent: "neutral",
      size: "medium",
      state: "rest",
    });
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.primaryAxisAlignItems).toBe("CENTER");
    expect(control?.properties.counterAxisAlignItems).toBe("CENTER");
    const bound = control?.boundVariables ?? {};
    expect(bound.paddingLeft).toBeDefined();
    expect(bound.paddingRight).toEqual(bound.paddingLeft);
    expect(bound.itemSpacing).toBeDefined();
    expect(bound.minHeight).toBeDefined();
  });
});

// Paket „Figma zeigt das Ero" (Maintainer, 2026-09-21): Der Fokusring wird gezeichnet — eine
// Schaltflächen-Bibliothek ohne sichtbaren Fokuszustand ist ein Mangel an Barrierefreiheit. Wie in
// der Web Component (outline mit outline-offset, dazwischen box-shadow in color.focus.inner): Ring
// außen, Abstand innen, Platz für beides in jedem Zustand reserviert, damit nichts abgeschnitten
// wird und die Varianten gleich groß bleiben. Sichtbar ist er nur im Zustand focus.
describe("the focus ring is drawn, and never clipped (F11)", () => {
  const find = (node: DoubleNode | undefined, part: string): DoubleNode | undefined => {
    if (node === undefined) return undefined;
    if (node.getSharedPluginData("fundamento", "part") === part) return node;
    for (const child of node.children) {
      const found = find(child, part);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  async function variantOf(double: ReturnType<typeof figmaDouble>, state: string) {
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    return set?.children.find(
      (child) => child.name === `emphasis=high, intent=neutral, size=medium, state=${state}`,
    );
  }

  it("nests ring, gap and control, and reserves the space in every state", async () => {
    const variant = await variantOf(modelDouble(), "rest");
    const ring = find(variant, "focus-ring");
    const gap = find(variant, "focus-gap");
    const control = find(variant, "control");
    expect(ring?.parent).toBe(variant);
    expect(gap?.parent).toBe(ring);
    expect(control?.parent).toBe(gap);
    expect(ring?.boundVariables.paddingLeft?.name).toBe("focus/ring/width");
    expect(ring?.boundVariables.paddingTop?.name).toBe("focus/ring/width");
    expect(gap?.boundVariables.paddingLeft?.name).toBe("focus/offset");
    expect(gap?.boundVariables.paddingBottom?.name).toBe("focus/offset");
    // Not focused: the space is there, the ring is not.
    expect(ring?.properties.fills).toEqual([]);
    expect(gap?.properties.fills).toEqual([]);
  });

  // F15 (Abnahme M1, Maintainer 2026-09-22): Der Fokus der tertiären Aktion war eine weiße Fläche
  // statt eines Rings. Die Web Component zeichnet den Fokus als outline plus box-shadow 0 0 0
  // offset — nur als Ring außerhalb, das Innere bleibt durchsichtig. In Figma füllte focus-gap die
  // ganze Fläche hinter control mit color.focus.inner; bei tertiary (durchsichtig) entstand ein
  // weißer Kasten. Ring und Abstand sind deshalb Striche, keine Füllungen.
  type Stroke = { boundVariables?: { color?: { name?: string } } };

  it("draws ring and gap as strokes bound to the tokens, in the focus state only", async () => {
    const focused = await variantOf(modelDouble(), "focus");
    const ring = find(focused, "focus-ring");
    const gap = find(focused, "focus-gap");
    const [ringStroke] = (ring?.properties.strokes ?? []) as Stroke[];
    const [gapStroke] = (gap?.properties.strokes ?? []) as Stroke[];
    expect(ringStroke?.boundVariables?.color).toMatchObject({ name: "focus/ring/color" });
    expect(gapStroke?.boundVariables?.color).toMatchObject({ name: "color/focus/inner" });
    // The stroke lies inside its frame and is as wide as the padding it fills: a band, no area.
    for (const [node, weight] of [
      [ring, "focus/ring/width"],
      [gap, "focus/offset"],
    ] as const) {
      expect(node?.properties.strokeAlign).toBe("INSIDE");
      expect(node?.boundVariables.strokeWeight?.name).toBe(weight);
      expect(node?.boundVariables.paddingLeft?.name).toBe(weight);
    }
    const resting = await variantOf(modelDouble(), "rest");
    expect(find(resting, "focus-ring")?.properties.strokes).toEqual([]);
    expect(find(resting, "focus-gap")?.properties.strokes).toEqual([]);
  });

  // Die rote Zusicherung des Maintainers: Die Fläche innerhalb von control trägt im Zustand focus
  // keine andere Füllung als in rest — für jede Kombination, tertiary eingeschlossen.
  it("fills nothing behind the control in focus that it does not fill in rest", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    const behind = (variant: DoubleNode | undefined) =>
      [variant, find(variant, "focus-ring"), find(variant, "focus-gap")].map(
        (node) => node?.properties.fills,
      );
    const focused = (set?.children ?? []).filter((child) => child.name.endsWith("state=focus"));
    expect(focused).toHaveLength(12);
    for (const variant of focused) {
      const rest = set?.children.find(
        (child) => child.name === variant.name.replace("state=focus", "state=rest"),
      );
      expect(behind(variant), variant.name).toEqual(behind(rest));
      expect(behind(variant), variant.name).toEqual([[], [], []]);
    }
  });

  it("clips nothing: no frame of the variant cuts its content", async () => {
    const variant = await variantOf(modelDouble(), "focus");
    for (const part of ["focus-ring", "focus-gap", "control"]) {
      expect(find(variant, part)?.properties.clipsContent, part).toBe(false);
    }
    expect(variant?.properties.clipsContent).toBe(false);
  });

  it("lets the variant wrap its content, so no 100 × 100 tile is left", async () => {
    const variant = await variantOf(modelDouble(), "rest");
    expect(variant?.properties.layoutMode).toBe("HORIZONTAL");
    expect(variant?.properties.layoutSizingHorizontal).toBe("HUG");
    expect(variant?.properties.layoutSizingVertical).toBe("HUG");
  });

  // A file an older plugin made keeps its control directly under the variant; the run moves it
  // into the new structure instead of creating a second one.
  it("moves an older control into the ring instead of duplicating it", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const created = double.counts.nodes;
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.counts.nodes).toBe(created);
  });
});

// Die Liste der Eigenschaften, die das Plugin besitzt (Maintainer, 2026-09-21): Füllung, Rand,
// Effekte, Radius, Deckkraft, Abschneiden, Layout — jeweils Wert aus dem Plan oder neutral. Das
// Komponentenset gehört dazu: combineAsVariants zeichnet Figmas lila gestrichelten Rahmen.
// Im ersten Lauf rot, aus einem echten Grund: Das Set trug noch Figmas layoutMode "NONE" — sein
// Layout ist das Raster (nächster Test).
describe("every property the plugin owns is from the plan or neutral", () => {
  const OWNED = [
    "fills",
    "strokes",
    "dashPattern",
    "strokeAlign",
    "strokeWeight",
    "effects",
    "cornerRadius",
    "opacity",
    "clipsContent",
    "layoutMode",
    // F14: the flow and the sizing belong to the plugin too; a default here left the variants
    // at 0 × 0 in Figma's grid.
    "layoutPositioning",
    "layoutSizingHorizontal",
    "layoutSizingVertical",
  ];

  it("leaves no tool default on any node it drew, the component set included", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    // The frame Eroj lies in the section Fundamento (F-8), in no flow: its position among
    // siblings is not the plugin's. The sets lie in the frame's flow, and that is the plugin's.
    const onPage = ["Document/Page 1/Fundamento/Eroj: layoutPositioning"];
    expect(double.untouchedDefaults(OWNED).filter((entry) => !onPage.includes(entry))).toEqual([]);
    const set = pageNodes(double).find((child) => child.name === "butono");
    expect(set?.properties.strokes).toEqual([]);
    expect(set?.properties.dashPattern).toEqual([]);
  });
});

// Raster wie in der Vitrino (Maintainer, 2026-09-21): Die Vitrino ordnet die Zeilen nach der
// Kombination (variant × tone × size), die Zustände nebeneinander. Figma bekommt dasselbe als
// Raster: 12 Zeilen × 6 Spalten, in der Reihenfolge des Plans — auch nachdem ein Lauf eine
// Variante neu anlegen musste, die sonst am Ende stünde.
describe("the variants stand in the grid of the Vitrino (F11)", () => {
  const names = (butonoOf(repoPlan.components)?.variants ?? []).map((variant) =>
    Object.entries(variant.props)
      .map(([key, value]) => `${key}=${value}`)
      .join(", "),
  );
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    pageNodes(double).find((child) => child.name === "butono");

  it("is a grid of 12 rows by 6 states, in the order of the plan", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = setOf(double);
    expect(set?.properties.layoutMode).toBe("GRID");
    expect(set?.properties.gridColumnCount).toBe(6);
    expect(set?.properties.gridRowCount).toBe(12);
    expect(set?.children.map((child) => child.name)).toEqual(names);
    // Row by row: every sixth variant starts a new combination.
    expect(names[6]).toContain("size=medium");
  });

  it("puts a variant a later run had to create back in its place", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    setOf(double)
      ?.children.find((child) => child.name === names[3])
      ?.remove();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "", LIFT);
    expect(setOf(double)?.children.map((child) => child.name)).toEqual(names);
    // Bestätigend (F14): die neu angelegte Variante bekommt ihre freie Zelle wieder.
    const cells = (setOf(double)?.children ?? []).map(
      (child) => `${child.gridRowAnchorIndex}/${child.gridColumnAnchorIndex}`,
    );
    expect(new Set(cells).size).toBe(72);
    expect(cells[3]).toBe("0/3");
  });
});

// Schrift aus dem Modell (Maintainer, 2026-09-21): Das Plugin lud fest Inter, das Modell nennt
// Geist. Rückfall nur auf eine benannte Schrift, mit Warnung. Das Double lernt dafür, was Figma
// tut: eine Schrift, die es nicht gibt, lehnt loadFontAsync ab, und eine ungeladene Schrift darf
// an keinem Text gesetzt werden.
describe("the label is set in the model's font (F11)", () => {
  const labelOf = (double: ReturnType<typeof figmaDouble>) =>
    descendant(
      pageNodes(double)
        .find((child) => child.name === "butono")
        ?.children.find(
          (child) => child.name === "emphasis=high, intent=neutral, size=medium, state=rest",
        ),
      "label",
    );

  it("knows which fonts exist, and refuses an unloaded one on a text", async () => {
    const double = figmaDouble();
    const api = double.figma as {
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
      createText: () => DoubleNode;
    };
    await expect(api.loadFontAsync({ family: "Geist", style: "Medium" })).rejects.toThrow(/Geist/);
    await expect(api.loadFontAsync({ family: "Inter", style: "Medium" })).resolves.toBeUndefined();
    const text = api.createText();
    expect(() => {
      text.fontName = { family: "Geist", style: "Medium" };
    }).toThrow(/not loaded/);
  });

  it("uses the model's font when the file has it", async () => {
    const double = figmaDouble({
      fonts: [
        { family: "Geist", style: "Medium" },
        // Spec 008: the inline ligilo shows the running text's role (Regular).
        { family: "Geist", style: "Regular" },
        // Spec 011 ②: the heading of the dialogo (SemiBold) and the code text of the tekstareo
        // (Geist Mono Regular, and the Medium crossing the field-by-field binding passes through).
        { family: "Geist", style: "SemiBold" },
        { family: "Geist Mono", style: "Regular" },
        { family: "Geist Mono", style: "Medium" },
      ],
    });
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(labelOf(double)?.properties.fontName).toEqual({ family: "Geist", style: "Medium" });
    expect(report.warnings.join(" ")).not.toContain("Geist");
  });

  it("falls back to a named font, in the same style, and says so", async () => {
    const double = figmaDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(labelOf(double)?.properties.fontName).toEqual({ family: "Inter", style: "Medium" });
    expect(report.warnings.join(" ")).toContain("Geist Medium");
    expect(report.warnings.join(" ")).toContain("Inter Medium");
  });
});

// Beschriftung (Maintainer, 2026-09-21): Text wie in der Vitrino, als Text-Eigenschaft der
// Komponente (label: TEXT) mit dem Vitrino-Text als Vorgabewert. Jede Instanz kann ihn
// überschreiben; realistische Maße entstehen dort, nicht in der Vorlage.
describe("the label is a text property of the component (F11)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    pageNodes(double).find((child) => child.name === "butono");
  type Definitions = Record<string, { type: string; defaultValue: string }>;

  // F14 (Maintainer): one neutral word — Figma keeps one default per property, not per variant.
  it("declares one TEXT property label, with the neutral word as its default", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ??
      {}) as Definitions;
    const keys = Object.keys(definitions).filter((key) => key.startsWith("label#"));
    expect(keys).toHaveLength(1);
    expect(definitions[keys[0] ?? ""]).toEqual({ type: "TEXT", defaultValue: "Aktion" });
  });

  it("connects every label to it", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = setOf(double);
    const [key] = Object.keys((set?.properties.componentPropertyDefinitions ?? {}) as Definitions);
    for (const variant of set?.children ?? []) {
      const label = descendant(variant, "label");
      expect(label?.properties.componentPropertyReferences, variant.name).toEqual({
        characters: key,
      });
    }
  });

  it("declares it once, also on a second run", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ??
      {}) as Definitions;
    expect(Object.keys(definitions)).toHaveLength(1);
  });
});

// F14 (Abnahme M1, Maintainer 2026-09-21): Das Raster wirkte nicht, und niemand merkte es. Alle 72
// Varianten lagen übereinander, der Bericht meldete keine Warnung. Belegte Ursache: Das Raster maß
// jede Variante als 0 × 0 — von Hand auf „Inhalt umschließen" gestellt, war das Set 48 × 96, genau
// Innenabstand plus Lücken bei Spuren der Größe null (8 + 5·8, 8 + 11·8). Die Zusage „die Variante
// umschließt ihren Inhalt" hielt im echten Figma nicht; das Double hatte sie geglaubt.
describe("the double measures sizes the way Figma did (F14)", () => {
  async function gridSet(double: ReturnType<typeof figmaDouble>, sized: boolean) {
    const api = double.figma as {
      createComponent: () => DoubleNode;
      createText: () => DoubleNode;
      combineAsVariants: (nodes: DoubleNode[], parent: DoubleNode) => DoubleNode;
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
    };
    await api.loadFontAsync({ family: "Inter", style: "Regular" });
    const variants = Array.from({ length: 72 }, () => {
      const variant = api.createComponent();
      variant.layoutMode = "HORIZONTAL";
      if (sized) {
        Object.assign(variant, { layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
      }
      const text = api.createText();
      Object.assign(text, { characters: "Aktion" });
      variant.appendChild(text);
      return variant;
    });
    const set = api.combineAsVariants(variants, double.root.children[0] as DoubleNode);
    Object.assign(set, {
      layoutMode: "GRID",
      gridColumnCount: 6,
      gridRowCount: 12,
      gridColumnGap: 8,
      gridRowGap: 8,
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
    });
    return { set, variants };
  }
  const size = (node: DoubleNode | undefined) => [
    (node as { width?: number } | undefined)?.width,
    (node as { height?: number } | undefined)?.height,
  ];

  // Messlauf 3 (Datei wSYaaAsB2EujMxGra84PoM, 2026-09-21) hat die Ursache aus den Rohdaten
  // geliefert: Set und Varianten waren korrekt (GRID 12 × 6, alle Spuren HUG, Varianten AUTO und
  // HUG in ihrer Größe), aber gridRowAnchorIndex und gridColumnAnchorIndex standen auf −1 — keine
  // Variante lag in einer Zelle. Figma verteilte die angehängten Kinder nicht selbst. Das erklärt
  // alle drei Messungen: leere HUG-Spuren sind 0 (48 × 96), alle Kinder liegen bei 0/0, und
  // zero/smaller sind leer. Das Double gibt genau das wieder.
  it.each([
    ["sized", true],
    ["unsized", false],
  ])(
    "leaves appended %s children unplaced: anchor −1, at 0/0, set 48 × 96",
    async (_name, sized) => {
      const { set, variants } = await gridSet(modelDouble(), sized);
      expect(size(set)).toEqual([48, 96]);
      for (const variant of variants) {
        const at = variant as unknown as {
          x: number;
          y: number;
          gridRowAnchorIndex: number;
          gridColumnAnchorIndex: number;
        };
        expect([at.gridRowAnchorIndex, at.gridColumnAnchorIndex, at.x, at.y]).toEqual([
          -1, -1, 0, 0,
        ]);
      }
    },
  );

  // What the API documents for a child of a grid (plugin-api.d.ts, GridChildrenMixin): out of
  // bounds throws, an occupied cell throws, and ROW_AUTO_FLOW refuses manual positions.
  it("places a child in its cell, and refuses what the API refuses", async () => {
    const { set, variants } = await gridSet(modelDouble(), true);
    type Placed = DoubleNode & {
      setGridChildPosition: (row: number, column: number) => void;
      gridRowAnchorIndex: number;
      gridColumnAnchorIndex: number;
    };
    const [first, second] = variants as Placed[];
    if (first === undefined || second === undefined) throw new Error("no variants");
    first.setGridChildPosition(2, 3);
    expect([first.gridRowAnchorIndex, first.gridColumnAnchorIndex]).toEqual([2, 3]);
    expect(() => second.setGridChildPosition(2, 3)).toThrow(/occupied/);
    expect(() => second.setGridChildPosition(12, 0)).toThrow(/out of bounds/);
    Object.assign(set, { gridItemsPositioning: "ROW_AUTO_FLOW" });
    expect(() => second.setGridChildPosition(0, 0)).toThrow(/ROW_AUTO_FLOW/);
  });

  it("lets only placed children size a track", async () => {
    const { set, variants } = await gridSet(modelDouble(), true);
    const first = variants[0] as DoubleNode & {
      setGridChildPosition: (row: number, column: number) => void;
    };
    const [width, height] = size(first);
    first.setGridChildPosition(0, 0);
    // One track of each axis now has the size of that child; the others stay 0.
    expect(size(set)).toEqual([48 + (width ?? 0), 96 + (height ?? 0)]);
  });

  it("gives a variant that hugs its content the size of that content", async () => {
    const { variants } = await gridSet(modelDouble(), true);
    const [width, height] = size(variants[0]);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});

describe("every variant has its size and its own place in the grid (F14)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    pageNodes(double).find((child) => child.name === "butono");
  const box = (node: DoubleNode | undefined) =>
    node as unknown as { width: number; height: number; x: number; y: number } | undefined;

  it("sizes every variant to its content, never 0", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    for (const variant of setOf(double)?.children ?? []) {
      const ring = descendant(variant, "focus-ring");
      expect(box(variant)?.width, variant.name).toBeGreaterThan(0);
      expect(box(variant)?.width, variant.name).toBeGreaterThanOrEqual(box(ring)?.width ?? 0);
      expect(box(variant)?.height, variant.name).toBeGreaterThanOrEqual(box(ring)?.height ?? 0);
    }
  });

  // Korrektur (Maintainer, Messlauf 3): Jede Variante bekommt ihre Zelle ausdrücklich — Zeile nach
  // variant × tone × size, Spalte nach state, in der Reihenfolge der Vitrino, jede Zelle einmal.
  type Anchored = DoubleNode & { gridRowAnchorIndex: number; gridColumnAnchorIndex: number };
  const butono = repo.ok ? repo.input.modelo.eroj.find((e) => e.ero.name === "butono") : undefined;

  it("gives every variant its own cell: 72 anchors ≥ 0, all pairs different", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const variants = (setOf(double)?.children ?? []) as Anchored[];
    expect(variants).toHaveLength(72);
    for (const variant of variants) {
      expect(variant.gridRowAnchorIndex, variant.name).toBeGreaterThanOrEqual(0);
      expect(variant.gridColumnAnchorIndex, variant.name).toBeGreaterThanOrEqual(0);
    }
    const cells = variants.map((v) => `${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`);
    expect(new Set(cells).size).toBe(72);
  });

  it("orders the cells like the Vitrino: a row per combination, a column per state", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const states = butono?.skemo.states ?? [];
    const rows = new Map<number, string>();
    for (const variant of (setOf(double)?.children ?? []) as Anchored[]) {
      const props = Object.fromEntries(variant.name.split(", ").map((pair) => pair.split("=")));
      expect(variant.gridColumnAnchorIndex, variant.name).toBe(states.indexOf(props.state));
      const combination = `${props.emphasis} · ${props.intent} · ${props.size}`;
      const known = rows.get(variant.gridRowAnchorIndex);
      if (known === undefined) rows.set(variant.gridRowAnchorIndex, combination);
      else expect(known, variant.name).toBe(combination);
    }
    // Rows in the order the Vitrino lists the combinations: the order of the plan.
    const planned = [
      ...new Set(
        (butonoOf(repoPlan.components)?.variants ?? []).map(
          (variant) =>
            `${variant.props.emphasis} · ${variant.props.intent} · ${variant.props.size}`,
        ),
      ),
    ];
    expect([...rows.entries()].sort(([a], [b]) => a - b).map(([, name]) => name)).toEqual(planned);
  });

  it("puts the 72 variants on 72 places, 6 columns by 12 rows, and says nothing", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const places = (setOf(double)?.children ?? []).map((variant) => box(variant));
    expect(new Set(places.map((place) => `${place?.x},${place?.y}`)).size).toBe(72);
    expect(new Set(places.map((place) => place?.x)).size).toBe(6);
    expect(new Set(places.map((place) => place?.y)).size).toBe(12);
    expect(report.warnings).toEqual([]);
  });

  it("keeps every cell on a second run, without moving anything", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const before = ((setOf(double)?.children ?? []) as Anchored[]).map(
      (v) => `${v.name}@${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`,
    );
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const after = ((setOf(double)?.children ?? []) as Anchored[]).map(
      (v) => `${v.name}@${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`,
    );
    expect(after).toEqual(before);
    expect(report.warnings).toEqual([]);
  });

  // Bericht: Varianten ohne Zelle werden gezählt und genannt. Hier lehnt das Werkzeug jede
  // Zuweisung ab — der Lauf bricht nicht ab, er sagt, was geschah, mit der Meldung des Werkzeugs.
  it("counts and names the variants without a cell, with the tool's message", async () => {
    const double = modelDouble();
    const api = double.figma as { createComponent: () => DoubleNode };
    const create = api.createComponent;
    const figma = {
      ...double.figma,
      createComponent: () =>
        Object.assign(create(), {
          setGridChildPosition: () => {
            throw new Error("in setGridChildPosition: refused");
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { unplaced: string[] } }[] };
    expect(butonoOf(report.components)?.layout.unplaced).toHaveLength(72);
    const text = report.warnings.join(" ");
    expect(text).toContain("72 von 72 Varianten liegen in keiner Zelle");
    expect(text).toContain("in setGridChildPosition: refused");
  });

  it("keeps every child of a variant in the flow, not freely placed", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const variant = setOf(double)?.children[0];
    for (const part of ["focus-ring", "focus-gap", "control", "label"]) {
      expect(descendant(variant, part)?.properties.layoutPositioning, part).toBe("AUTO");
    }
  });

  // Erst messen, dann bauen (Maintainer, 2026-09-21): Der Bericht trägt, was das Werkzeug
  // tatsächlich hält — Rohdaten, keine Deutung. Am Set die Definition der Spuren, an einer
  // Beispielvariante Lage, Positionierung und Zellenzuordnung. Eine Eigenschaft, die das Werkzeug
  // nicht kennt, steht als „nicht vorhanden" da; eine, bei der es wirft, mit seiner Meldung.
  it("reports what the tool holds: the tracks of the set and the cell of a variant", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          held: {
            set: Record<string, unknown>;
            variant: Record<string, unknown>;
            last: Record<string, unknown>;
          };
        };
      }[];
    };
    const held = butonoOf(report.components)?.layout.held;
    expect(held?.set).toMatchObject({
      type: "COMPONENT_SET",
      layoutMode: "GRID",
      gridRowCount: 12,
      gridColumnCount: 6,
      gridRowGap: 8,
      gridColumnGap: 8,
      gridItemsPositioning: "MANUAL",
      children: 72,
    });
    // Names the double does not know are reported as absent, not left out.
    expect(held?.set.gridRowSizes).toBe("nicht vorhanden");
    expect(held?.variant).toMatchObject({
      name: "emphasis=high, intent=neutral, size=small, state=rest",
      parent: "COMPONENT_SET",
      layoutPositioning: "AUTO",
      layoutSizingHorizontal: "HUG",
    });
    expect(held?.variant).toMatchObject({ gridRowAnchorIndex: 0, gridColumnAnchorIndex: 0 });
    expect(held?.last).toMatchObject({ gridRowAnchorIndex: 11, gridColumnAnchorIndex: 5 });
    expect(held?.last.name).toBe("emphasis=low, intent=neutral, size=large, state=loading");
  });

  it("reports a property the tool throws on with the tool's message", async () => {
    const double = modelDouble();
    const api = double.figma as { combineAsVariants: (...args: unknown[]) => DoubleNode };
    const combine = api.combineAsVariants;
    const figma = {
      ...double.figma,
      combineAsVariants: (...args: unknown[]) => {
        const set = combine(...args);
        return new Proxy(set, {
          get(target, key, receiver) {
            if (key === "gridRowSizes") throw new Error("in get_gridRowSizes: not supported");
            return Reflect.get(target, key, receiver);
          },
        });
      },
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { components: { layout: { held: { set: Record<string, unknown> } } }[] };
    expect(butonoOf(report.components)?.layout.held.set.gridRowSizes).toBe(
      "wirft: in get_gridRowSizes: not supported",
    );
  });

  it("labels every variant with the neutral word", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ?? {}) as Record<
      string,
      { defaultValue: string }
    >;
    expect(Object.values(definitions).map((definition) => definition.defaultValue)).toEqual([
      "Aktion",
    ]);
  });
});

// F16 (Abnahme M1, Maintainer 2026-09-22): Die Vitrino zeigt die Knöpfe auf dem Untergrund des
// Modells; in Figma standen sie auf der dunklen Leinwand, und tertiary war dort unlesbar. Das Set
// bekommt die Untergrundfarbe als Füllung — gebunden an die Variable, keine feste Farbe, damit sie
// mit color-scheme wechselt. Sie gehört zu den Eigenschaften, die das Plugin besitzt.
describe("the set stands on the model's background, like the Vitrino (F16)", () => {
  it("names the Vitrino's surface in the plan", () => {
    expect(butonoOf(repoPlan.components)?.surface).toEqual({
      variable: "color/background/canvas",
      opacity: 1,
    });
  });

  it("fills the set with it, bound to the variable, on both runs", async () => {
    const double = modelDouble();
    for (const _ of [1, 2]) {
      await run(double, repoFiles["figma/plugin/code.js"] ?? "");
      const set = pageNodes(double).find((child) => child.name === "butono");
      const fills = (set?.properties.fills ?? []) as {
        opacity?: number;
        boundVariables?: { color?: { name?: string } };
      }[];
      expect(fills).toHaveLength(1);
      expect(fills[0]?.boundVariables?.color).toMatchObject({ name: "color/background/canvas" });
      expect(fills[0]?.opacity).toBe(1);
    }
  });
});

// F17 (Messlauf #21, Datei Q7LOiRGeDyJ0JgdajzXg81, 2026-09-22): Alle 12 Fokus-Varianten waren 8 px
// breiter und höher als die übrigen Zustände ihrer Zeile (small 59 × 44 statt 51 × 36, medium
// 73 × 48 statt 65 × 40, large 85 × 56 statt 77 × 48). Die Reserve aus Innenabständen wirkte in
// jedem Zustand (28 + 8 = 36); dazu kamen im Fokus 2 × (2 + 2) = 8 — die sichtbaren Striche von
// Ring und Abstand nahmen zusätzlich Platz. In der Web Component ändert outline die Größe nicht.
//
// Warum das Double es nicht sah: Sein Layout zählte Striche nie mit. Es hatte stillschweigend
// angenommen, ein Strich nehme keinen Platz — gemessen hatte das niemand.
describe("a visible stroke takes space, as measured (F17)", () => {
  async function hugging(included: boolean | undefined) {
    const double = modelDouble();
    const api = double.figma as {
      createFrame: () => DoubleNode;
      createText: () => DoubleNode;
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
    };
    await api.loadFontAsync({ family: "Inter", style: "Regular" });
    const frame = api.createFrame();
    const text = api.createText();
    Object.assign(text, { characters: "Aktion" });
    frame.appendChild(text);
    Object.assign(frame, {
      layoutMode: "HORIZONTAL",
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
      strokeWeight: 2,
    });
    if (included !== undefined) Object.assign(frame, { strokesIncludedInLayout: included });
    const size = () => {
      const box = frame as unknown as { width: number; height: number };
      return [box.width, box.height];
    };
    const bare = size();
    Object.assign(frame, { strokes: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] });
    return { bare, stroked: size() };
  }

  it("grows a hugging frame by the weight on every side once the stroke is visible", async () => {
    const { bare, stroked } = await hugging(undefined);
    expect(stroked).toEqual([(bare[0] ?? 0) + 4, (bare[1] ?? 0) + 4]);
  });

  it("leaves the size alone when strokesIncludedInLayout is false", async () => {
    const { bare, stroked } = await hugging(false);
    expect(stroked).toEqual(bare);
  });
});

describe("every variant has the same outer size in all six states (F17)", () => {
  const rowsOf = (double: ReturnType<typeof figmaDouble>) => {
    const set = pageNodes(double).find((child) => child.name === "butono");
    const rows = new Map<number, string[]>();
    for (const variant of set?.children ?? []) {
      const box = variant as unknown as { width: number; height: number };
      const sizes = rows.get(variant.gridRowAnchorIndex) ?? [];
      sizes.push(`${box.width} × ${box.height}`);
      rows.set(variant.gridRowAnchorIndex, sizes);
    }
    return rows;
  };

  it("gives the six variants of a row one width and one height, focus included", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const rows = rowsOf(double);
    expect(rows.size).toBe(12);
    for (const [row, sizes] of rows) {
      expect(sizes, `row ${row}`).toHaveLength(6);
      expect(new Set(sizes).size, `row ${row}: ${sizes.join(", ")}`).toBe(1);
    }
  });

  it("owns strokesIncludedInLayout on ring and gap: the stroke lies in the reserve", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    const focused = set?.children.find((child) => child.name.endsWith("state=focus"));
    for (const part of ["focus-ring", "focus-gap"]) {
      expect(descendant(focused, part)?.properties.strokesIncludedInLayout, part).toBe(false);
    }
  });

  // Die Wirkung messen, nicht den Aufruf: In einem Werkzeug, das die Eigenschaft annimmt und
  // nichts bewirkt, nennt der Bericht die ungleichen Zeilen mit Zahlen.
  it("warns with numbers when a row is uneven", async () => {
    const double = modelDouble();
    const api = double.figma as { createFrame: () => DoubleNode };
    const create = api.createFrame;
    const figma = {
      ...double.figma,
      createFrame: () =>
        new Proxy(create(), {
          set(target, key, value, receiver) {
            if (key === "strokesIncludedInLayout") return true;
            return Reflect.set(target, key, value, receiver);
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { uneven: unknown[] } }[] };
    expect(butonoOf(report.components)?.layout.uneven).toHaveLength(12);
    const text = report.warnings.join(" ");
    expect(text).toContain("12 von 12 Zeilen");
    expect(text).toContain("state=focus");
    expect(text).toMatch(/\d+(\.\d+)? × \d+(\.\d+)? statt \d+(\.\d+)? × \d+(\.\d+)?/);
  });

  it("reports what the tool holds at the parts of a focused variant", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: { layout: { held: { focus: Record<string, Record<string, unknown>> } } }[];
    };
    const parts = butonoOf(report.components)?.layout.held.focus;
    expect(parts?.variant?.name).toBe("emphasis=high, intent=neutral, size=small, state=focus");
    expect(parts?.["focus-ring"]).toMatchObject({
      strokesIncludedInLayout: false,
      strokeAlign: "INSIDE",
    });
    expect(parts?.control).toHaveProperty("strokesIncludedInLayout");
    expect(parts?.label).toHaveProperty("width");
  });
});

// F19 (Abnahme M1, Maintainer 2026-09-22): Der Standardmodus jeder Sammlung ist der Standardwert
// der Dimension aus dem Modelo. Gemessen: density zeigte „Automatisch (compact)", weil compact der
// erste Modus war; richtig ist default. In Figma ist der Standardmodus der erste Modus
// (`defaultModeId` ist nur lesbar), also entscheidet die Reihenfolge.
describe("the default mode of every collection is the Modelo's default (F19)", () => {
  const defaults = new Map(
    (repo.ok ? repo.input.modelo.dimensioj : []).map((dimensio) => [
      dimensio.name,
      dimensio.default,
    ]),
  );

  it("names the default in the plan, and puts it first", () => {
    const collections = repoPlan.collections.filter((collection) => defaults.has(collection.name));
    expect(collections).toHaveLength(6);
    for (const collection of collections) {
      expect(collection.defaultMode, collection.name).toBe(defaults.get(collection.name));
      expect(collection.modes[0], collection.name).toBe(defaults.get(collection.name));
    }
  });

  it("leaves every collection with that default mode in the file", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const ofDimensioj = double.collections.filter((collection) => defaults.has(collection.name));
    expect(ofDimensioj).toHaveLength(6);
    for (const collection of ofDimensioj) {
      const mode = collection.modes.find((entry) => entry.modeId === collection.defaultModeId);
      expect(mode?.name, collection.name).toBe(defaults.get(collection.name));
    }
  });

  // Eine Datei, die ein älteres Plugin anlegte, behält ihren ersten Modus — die Reihenfolge lässt
  // sich dort nicht ändern. Der Lauf misst die Wirkung und sagt es.
  it("says so when a file keeps another default mode", async () => {
    const double = modelDouble();
    const api = double.figma as {
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
      };
    };
    const old = api.variables.createVariableCollection("density");
    old.renameMode(old.defaultModeId, "compact");
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const text = report.warnings.join(" ");
    expect(text).toContain("density");
    expect(text).toContain("compact");
    expect(text).toContain("default");
  });
});

// F20 (Abnahme M1, Maintainer 2026-09-22): Das Set umschließt sein Raster. Gemessen: Set 518 × 688,
// der Untergrund endet dort; die Spalte loading ragt rechts ca. 50 px hinaus, die Zeile
// tertiary · large liegt komplett unterhalb des Sets. Das Double hat es nicht erkannt: Zugesichert
// waren gesetzte Eigenschaften (layoutSizing HUG), nicht die Geometrie.
describe("the set encloses its grid (F20)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    pageNodes(double).find((child) => child.name === "butono");
  type Box = { x: number; y: number; width: number; height: number };

  it("holds every child inside its bounds plus padding, after the first and the second run", async () => {
    const double = modelDouble();
    for (const _ of [1, 2]) {
      await run(double, repoFiles["figma/plugin/code.js"] ?? "");
      const set = setOf(double);
      const bounds = set as unknown as Box;
      const padding = Number(set?.properties.paddingRight ?? 0);
      expect(set?.children).toHaveLength(72);
      for (const child of set?.children ?? []) {
        const box = child as unknown as Box;
        expect(box.x, child.name).toBeGreaterThanOrEqual(0);
        expect(box.y, child.name).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width + padding, child.name).toBeLessThanOrEqual(bounds.width);
        expect(box.y + box.height + padding, child.name).toBeLessThanOrEqual(bounds.height);
      }
    }
  });

  it("reports the size of the set and the bounding box of its children, raw", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          set: { width: number; height: number };
          bounds: { minX: number; minY: number; maxX: number; maxY: number };
          outside: string[];
        };
      }[];
    };
    const layout = butonoOf(report.components)?.layout;
    const set = setOf(double) as unknown as Box;
    expect(layout?.set).toEqual({ width: set.width, height: set.height });
    expect(layout?.bounds.minX).toBeGreaterThanOrEqual(0);
    expect(layout?.bounds.maxX).toBeLessThanOrEqual(set.width);
    expect(layout?.bounds.maxY).toBeLessThanOrEqual(set.height);
    expect(layout?.outside).toEqual([]);
  });

  // Die Wirkung messen: ein Werkzeug, dessen Set kleiner bleibt als sein Raster — die gemessenen
  // 518 × 688 —, während die Kinder darüber hinausreichen.
  it("warns with numbers when children lie outside the set", async () => {
    const double = modelDouble();
    const api = double.figma as { combineAsVariants: (...args: unknown[]) => DoubleNode };
    const combine = api.combineAsVariants;
    const figma = {
      ...double.figma,
      combineAsVariants: (...args: unknown[]) =>
        new Proxy(combine(...args), {
          get(target, key, receiver) {
            if (key === "width") return 300;
            if (key === "height") return 200;
            return Reflect.get(target, key, receiver);
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { outside: string[] } }[] };
    expect(butonoOf(report.components)?.layout.outside.length).toBeGreaterThan(0);
    const text = report.warnings.join(" ");
    expect(text).toContain("liegen außerhalb des Sets");
    expect(text).toContain("300 × 200");
    expect(text).toMatch(/Kinder reichen bis \d+(\.\d+)? × \d+(\.\d+)?/);
  });
});

// F21 (Messung Thorsten, Datei x8sFFyOkrnlMM4ngAsbnfs, 2026-09-22): Lauf 2 auf demselben Set, ohne
// Eingriff, scheiterte mit „in set_layoutMode: Cannot set grid row count: Cannot delete occupied
// row/column." Im Stand der F14-Abnahme lief Lauf 2 sauber — eine Regression. Hypothese des
// Maintainers, ungemessen: Das Neusetzen von layoutMode (oder der Spurenzahl) an einem Set mit
// belegten Zellen verkleinert das Raster kurzzeitig, und Figma lehnt das ab. Das Double lehnt
// dasselbe ab, mit genau dieser Meldung.
describe("the double refuses what Figma refused on the second run (F21)", () => {
  async function placedGrid() {
    const double = modelDouble();
    const api = double.figma as {
      createComponent: () => DoubleNode;
      combineAsVariants: (nodes: DoubleNode[], parent: DoubleNode) => DoubleNode;
    };
    const variants = Array.from({ length: 4 }, () => api.createComponent());
    const set = api.combineAsVariants(variants, double.root.children[0] as DoubleNode);
    Object.assign(set, { layoutMode: "GRID", gridRowCount: 2, gridColumnCount: 2 });
    variants.forEach((variant, index) => {
      variant.setGridChildPosition(index >> 1, index & 1);
    });
    return set;
  }
  const MESSAGE = "Cannot set grid row count: Cannot delete occupied row/column.";

  it("throws Figma's message when layoutMode is set again on a grid with occupied cells", async () => {
    const set = await placedGrid();
    expect(() => Object.assign(set, { layoutMode: "GRID" })).toThrow(
      `in set_layoutMode: ${MESSAGE}`,
    );
  });

  it("throws when a track count is lowered below an occupied cell, keeps equal or larger", async () => {
    const set = await placedGrid();
    expect(() => Object.assign(set, { gridRowCount: 1 })).toThrow(
      `in set_gridRowCount: ${MESSAGE}`,
    );
    expect(() => Object.assign(set, { gridRowCount: 2 })).not.toThrow();
    expect(() => Object.assign(set, { gridColumnCount: 3 })).not.toThrow();
  });
});

describe("the second run writes nothing that already holds (F21)", () => {
  it("updates 72, creates none, warns of nothing, and writes no property that already holds", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const written = double.counts.writes;
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: { created: string[]; updated: string[] }[];
      warnings: string[];
    };
    expect(butonoOf(report.components)?.created).toEqual([]);
    expect(butonoOf(report.components)?.updated).toHaveLength(72);
    expect(report.warnings).toEqual([]);
    expect(double.counts.writes - written).toBe(0);
  });
});

describe("a failed run leaves everything readable in the console (F21)", () => {
  it("prints message, stack and the report up to the abort, each as one string", async () => {
    const double = modelDouble();
    const calls: unknown[][] = [];
    const source = `${files["figma/plugin/code.js"] ?? ""}`;
    const module = new Function("figma", "console", source);
    const api = double.figma as { createComponent: () => DoubleNode };
    const create = api.createComponent;
    let made = 0;
    await module(
      {
        ...double.figma,
        command: "run",
        createComponent: () => {
          // Spec 011 ④: the atributlisto's three (layout auto since Spec 014 ①) and the avizo's
          // four variants are made first; the run fails in the butono.
          if (++made === 3 + 4 + 40)
            throw new Error("in set_layoutMode: Cannot delete occupied row/column.");
          return create();
        },
      },
      { log: () => undefined, error: (...parts: unknown[]) => calls.push(parts) },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Every console.error call carries exactly one string: nothing an object viewer would fold.
    for (const call of calls) {
      expect(call).toHaveLength(1);
      expect(typeof call[0]).toBe("string");
    }
    const text = calls.map((call) => String(call[0])).join("\n");
    expect(text).toContain("Cannot delete occupied row/column");
    expect(text).toMatch(/\n\s+at /);
    const json = calls.map((call) => String(call[0])).find((line) => line.startsWith("{"));
    const partial = JSON.parse(json ?? "{}") as {
      phase: string;
      collections: number;
      variables: number;
      components: { set: string; created: string[] }[];
    };
    expect(partial.phase).toBe("components");
    expect(partial.variables).toBeGreaterThan(0);
    expect(butonoOf(partial.components)?.set).toBe("butono");
    // Spec 014 ②: the icon-start of every variant takes two creations more per variant, so the
    // abort comes two variants earlier.
    expect(butonoOf(partial.components)?.created).toHaveLength(37);
  });

  it("prints the report of a good run as one JSON string too", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", `${files["figma/plugin/code.js"] ?? ""}`);
    await module(
      { ...double.figma, command: "run" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const json = lines.find((line) => line.startsWith("{"));
    expect(json).toBeDefined();
    expect(JSON.parse(json ?? "{}")).toMatchObject({ fundamento: expect.any(String) });
  });
});

// F22 (Messung Thorsten, Datei hEWHvBz7uRNrpYSau52OUN, 2026-09-22): Nach Lauf 2 war das ganze Set
// schwarz. Per Plugin-API gelesen: Set fills[0] SOLID {0,0,0}, Deckkraft 1, gebunden an
// color/background/canvas; control fills[0] {0,0,0}, gebunden an primary/rest; strokes[0]
// {0,0,0}, Deckkraft 1, OHNE Bindung; label fills[0] {0,0,0}, gebunden an primary/text. Die
// Variablenwerte selbst waren richtig. Figma rendert also die Farbe, die im Paint steht, nicht die
// Bindung; nur setBoundVariableForPaint löst die Farbe in die Kopie auf. Das Double bildet das ab.
describe("a paint shows the colour it holds; only setBoundVariableForPaint resolves it (F22)", () => {
  async function paintedFrame(double: ReturnType<typeof figmaDouble>) {
    const api = double.figma as {
      createFrame: () => DoubleNode;
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
        createVariable: (
          name: string,
          c: unknown,
          type: string,
        ) => (typeof double.variables)[number];
        setBoundVariableForPaint: (
          paint: unknown,
          field: string,
          v: unknown,
        ) => Record<string, unknown>;
      };
    };
    const collection = api.variables.createVariableCollection("farben");
    const variable = api.variables.createVariable("color/probo", collection, "COLOR");
    variable.setValueForMode(collection.defaultModeId, { r: 0.2, g: 0.4, b: 0.6, a: 1 });
    const frame = api.createFrame();
    return { api, variable, frame };
  }

  it("resolves the variable's colour into the copy that setBoundVariableForPaint returns", async () => {
    const { api, variable } = await paintedFrame(modelDouble());
    const bound = api.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      variable,
    );
    expect(bound.color).toEqual({ r: 0.2, g: 0.4, b: 0.6 });
    expect(bound.boundVariables).toMatchObject({ color: { id: variable.id } });
  });

  it("renders a raw paint with a binding in the colour it holds, and reads it back like Figma", async () => {
    const { frame, variable } = await paintedFrame(modelDouble());
    Object.assign(frame, {
      fills: [
        {
          type: "SOLID",
          color: { r: 0, g: 0, b: 0 },
          boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } },
        },
      ],
    });
    const [fill] = frame.properties.fills as {
      color: unknown;
      visible: boolean;
      opacity: number;
      blendMode: string;
    }[];
    expect(fill?.color).toEqual({ r: 0, g: 0, b: 0 });
    expect([fill?.visible, fill?.opacity, fill?.blendMode]).toEqual([true, 1, "NORMAL"]);
    expect(double_shown(frame, "fills")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

/** The colour a node shows for a paint field: what the first visible paint holds. */
function double_shown(node: DoubleNode, field: "fills" | "strokes") {
  const [paint] = (node.properties[field] ?? []) as { color?: unknown; visible?: boolean }[];
  return paint === undefined || paint.visible === false ? undefined : paint.color;
}

describe("every bound paint shows the plan's colour after the first and the second run (F22)", () => {
  type Paint = {
    color: { r: number; g: number; b: number };
    opacity: number;
    visible: boolean;
    boundVariables?: { color?: { id: string; name?: string } };
  };
  const paintsOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  const hex = (c: { r: number; g: number; b: number }) =>
    `#${[c.r, c.g, c.b]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;

  // The plan's paint per part and variant, in the default mode: hex and opacity (F8).
  const planned = (props: Record<string, string>) =>
    butonoOf(repoPlan.components)?.variants.find((v) =>
      Object.entries(props).every(([k, val]) => v.props[k] === val),
    )?.paints ?? {};

  it("matches hex, opacity and binding on both runs — fills, strokes and the label", async () => {
    const double = modelDouble();
    for (const run of [1, 2]) {
      await new Function(
        "figma",
        `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma);
      const set = pageNodes(double).find((child) => child.name === "butono");
      for (const [props, name] of [
        [{ emphasis: "high", intent: "neutral", size: "large", state: "rest" }, "high"],
        [{ emphasis: "low", intent: "neutral", size: "medium", state: "hover" }, "low"],
      ] as const) {
        const variant = set?.children.find(
          (child) =>
            child.name ===
            Object.entries(props)
              .map(([k, v]) => `${k}=${v}`)
              .join(", "),
        );
        const control = descendant(variant, "control");
        const label = descendant(control, "label");
        const plan = planned(props);
        for (const [node, field, part] of [
          [control, "fills", "surface.fill"],
          [control, "strokes", "border.color"],
          [label, "fills", "label.color"],
        ] as const) {
          const [paint] = paintsOf(node, field);
          const expected = plan[part] as { hex: string; opacity: number } | undefined;
          const where = `run ${run}, ${name} ${part}`;
          if (paint === undefined) throw new Error(`${where}: no paint`);
          expect(hex(paint.color), where).toBe(expected?.hex);
          expect(paint.opacity, where).toBe(expected?.opacity);
          expect(paint.visible, where).toBe(true);
          expect(paint.boundVariables?.color?.id, where).toBeDefined();
        }
      }
      const [ground] = paintsOf(set, "fills");
      if (ground === undefined) throw new Error(`run ${run}: no ground`);
      expect(ground.boundVariables?.color?.name, `run ${run} ground`).toBe(
        "color/background/canvas",
      );
      expect(hex(ground.color), `run ${run} ground`).not.toBe("#000000");
    }
  });

  it("rewrites no paint on the second run when variable, opacity and visibility hold", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const written = double.counts.writes;
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.counts.writes - written).toBe(0);
  });

  it("reports the paints of the set and of the first and last variant, raw", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          paints: {
            set: { fills: unknown[]; strokes: unknown[] };
            variant: Record<string, { fills: unknown[]; strokes: unknown[] }>;
            last: Record<string, { fills: unknown[]; strokes: unknown[] }>;
          };
        };
      }[];
    };
    const paints = butonoOf(report.components)?.layout.paints;
    expect(paints?.set.fills[0]).toMatchObject({ opacity: 1, variable: "color/background/canvas" });
    expect(paints?.set.fills[0]).toHaveProperty("color");
    expect(paints?.variant.control?.fills[0]).toMatchObject({
      variable: "color/action/primary/rest",
    });
    expect(paints?.variant.control?.strokes[0]).toHaveProperty("variable");
    expect(paints?.variant.label?.fills[0]).toHaveProperty("opacity");
    expect(paints?.last.control?.fills[0]).toMatchObject({ opacity: 0 });
  });

  // Figma kappt kopierte Konsolenzeilen bei 5 000 Zeichen: der Bericht kommt in Teilen unter 4 000.
  it("prints the report in parts under 4 000 characters, the headline with numbers first", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", `${repoFiles["figma/plugin/code.js"] ?? ""}`);
    await module(
      { ...double.figma, command: "run" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const line of lines) expect(line.length, line.slice(0, 60)).toBeLessThan(4000);
    const first = lines.find((line) => line.startsWith("{"));
    expect(JSON.parse(first ?? "{}")).toMatchObject({
      fundamento: expect.any(String),
      variables: expect.any(Number),
      warnings: [],
      // Spec 008: two sets; the ligilo has placement × size × state = 30 variants.
      components: [
        // Spec 014 ②: the apartigilo has orientation = 2 variants in one state.
        { set: "apartigilo", created: 2, updated: 0 },
        // Spec 011 ④: the atributlisto has layout = 3 variants in one state (auto since Spec 014 ①).
        { set: "atributlisto", created: 3, updated: 0 },
        // Spec 011 ③: the avizo has intent = 4 variants in one state (dismissible is no axis).
        { set: "avizo", created: 4, updated: 0 },
        { set: "butono", created: 72, updated: 0 },
        // Spec 011 ②: the dialogo has size × reason = 6 variants in one state.
        { set: "dialogo", created: 6, updated: 0 },
        // Spec 010 ④: the elektilo has size × state = 15 variants.
        { set: "elektilo", created: 15, updated: 0 },
        // Spec 010 ③: the elekto has size × state = 15 variants.
        { set: "elekto", created: 15, updated: 0 },
        // Spec 014 ⑤: the faldilo has open × state = 6 variants.
        { set: "faldilo", created: 6, updated: 0 },
        // Spec 014 ②: the ikono has name × size × intent = 225 variants in one state.
        { set: "ikono", created: 225, updated: 0 },
        // Spec 011 ③: the insigno has intent × size = 10 variants in one state.
        { set: "insigno", created: 10, updated: 0 },
        // Spec 009: the kampo has size × state = 18 variants.
        { set: "kampo", created: 18, updated: 0 },
        // Spec 014 ⑤: the kompletigilo has size × expanded × state = 30 variants.
        { set: "kompletigilo", created: 30, updated: 0 },
        // Spec 014 ④: the konsileto has placement = 4 variants in one state (an axis of its own).
        { set: "konsileto", created: 4, updated: 0 },
        // Spec 011 ⑤: the langetaro has state = 4 variants (active is the state of one tab, E7;
        // label and selected are strings, no axis).
        { set: "langetaro", created: 4, updated: 0 },
        { set: "ligilo", created: 30, updated: 0 },
        // Spec 010 ②: the markobutono has checked × size × state = 30 variants.
        { set: "markobutono", created: 30, updated: 0 },
        // Spec 014 ④: the menuo has state = 4 variants (the states of an entry).
        { set: "menuo", created: 4, updated: 0 },
        // Spec 011 ④: the mezurilo has intent = 4 variants in one state (value, min, max are
        // numbers, no axis).
        { set: "mezurilo", created: 4, updated: 0 },
        // Spec 011 ⑤: the navigado has state = 3 variants (current is the state of one item, E7;
        // orientation keys no part and is no axis).
        { set: "navigado", created: 3, updated: 0 },
        // Spec 015 ①: the pagxigilo has 4 states, the spuro 3.
        { set: "pagxigilo", created: 4, updated: 0 },
        // Spec 011 ③: the plenstato has kind = 2 variants in one state.
        { set: "plenstato", created: 2, updated: 0 },
        // Spec 014 ②: the saltligilo has state = 2 variants (rest and focus).
        { set: "saltligilo", created: 2, updated: 0 },
        { set: "spuro", created: 3, updated: 0 },
        // Spec 010 ①: the sxaltilo has checked × size × state = 24 variants.
        { set: "sxaltilo", created: 24, updated: 0 },
        // Spec 014 ④: the sxvebilo has one variant (placement and open are no axes).
        { set: "sxvebilo", created: 1, updated: 0 },
        // Spec 011 ④: the tabelo has density × state = 6 variants (the states of the sort button).
        { set: "tabelo", created: 6, updated: 0 },
        // Spec 011 ②: the tekstareo has kind × size × state = 30 variants.
        { set: "tekstareo", created: 30, updated: 0 },
        // Spec 014 ③: the teksto has kind × size × emphasis = 15 variants, the titolo size = 7.
        { set: "teksto", created: 15, updated: 0 },
        { set: "titolo", created: 7, updated: 0 },
      ],
    });
    const json = lines
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(json.some((part) => part.part === "layout")).toBe(true);
    expect(json.some((part) => part.part === "created")).toBe(true);
  });
});

// F27 (An P0, M2-Vorstufe): Die Marke ist ein Modus, und Modi je Sammlung sind in Figma begrenzt
// (Professional 10, Organization 20, Enterprise unbegrenzt; research §6.2, geprüft 2026-09-20).
// Ein Lauf, der mehr Aspektoj mitbringt, als die Sammlung tragen kann, darf nicht mit einem rohen
// Fehler abbrechen: Er sagt mit Zahlen, was nicht hineinpasst, und bringt den Rest zu Ende.
describe("the run says it when a collection has more modes than Figma allows (F27)", () => {
  /** A plan whose aspekto collection carries `count` brands, each an own mode. */
  function planWithAspektoj(count: number): FigmaPlan {
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const collection = changed.collections.find((candidate) => candidate.name === "aspekto");
    if (collection === undefined) throw new Error("no aspekto collection");
    const [first] = collection.modes;
    if (first === undefined) throw new Error("no mode");
    const names = [
      ...collection.modes,
      ...Array.from({ length: count - collection.modes.length }, (_, index) => `marko${index + 1}`),
    ];
    for (const variable of collection.variables) {
      const reference = variable.values[first];
      if (reference === undefined) throw new Error(`${variable.name} has no value in ${first}`);
      for (const mode of names) {
        if (variable.values[mode] === undefined) variable.values[mode] = reference;
      }
    }
    collection.modes = names;
    return changed;
  }

  const sourceOf = (changed: FigmaPlan) =>
    (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );

  it("warns with the numbers and keeps going when the modes do not fit", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(12))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[]; components: { set: string; created: string[] }[] };
    const warning = report.warnings.find((entry) => entry.includes("aspekto"));
    expect(warning).toContain("12");
    expect(warning).toContain("10");
    // The run does not stop at the limit: the component set is built either way.
    expect(butonoOf(report.components)?.created).toHaveLength(72);
  });

  it("names the Aspektoj that did not reach the file", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(12))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(report.warnings.join(" ")).toContain("marko9");
    expect(report.warnings.join(" ")).toContain("marko10");
    const collection = double.collections.find((candidate) => candidate.name === "aspekto");
    expect(collection?.modes).toHaveLength(10);
  });

  it("says nothing about the limit while the brands fit", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(10))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(report.warnings).toEqual([TITOLO_CASE_WARNING]);
  });
});

// F27: Die Messung in Figma soll ohne Ablesen möglich sein. Der Bericht nennt deshalb je Sammlung
// die Modi, die der Plan vorsieht, und die, die nach dem Lauf in der Datei stehen — Rohdaten, aus
// denen „aspekto hat zwei Modi" folgt, ohne die Oberfläche zu befragen.
describe("the report names the modes of every collection (F27)", () => {
  interface ModeReport {
    collection: string;
    planned: string[];
    actual: string[];
    default: string;
  }

  async function modesOf(double: ReturnType<typeof figmaDouble>, source: string) {
    const result = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as {
      modes: ModeReport[];
    };
    return result.modes;
  }

  it("names planned and applied modes per collection, the brand among them", async () => {
    const double = modelDouble();
    const modes = await modesOf(double, files["figma/plugin/code.js"] ?? "");
    const aspekto = modes.find((entry) => entry.collection === "aspekto");
    expect(aspekto?.planned).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.actual).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.default).toBe("komuna");
    expect(modes.map((entry) => entry.collection)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
  });

  it("shows a file whose modes differ from the plan", async () => {
    const double = modelDouble();
    const api = double.figma as {
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
      };
    };
    const old = api.variables.createVariableCollection("aspekto");
    old.renameMode(old.defaultModeId, "ekzemplo");
    const modes = await modesOf(double, files["figma/plugin/code.js"] ?? "");
    const aspekto = modes.find((entry) => entry.collection === "aspekto");
    expect(aspekto?.planned).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.actual).toEqual(["ekzemplo", "komuna"]);
    expect(aspekto?.default).toBe("ekzemplo");
  });

  it("puts the modes into the printed report, in the headline part", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", `${files["figma/plugin/code.js"] ?? ""}`);
    await module(
      { ...double.figma, command: "run" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const first = lines.find((line) => line.startsWith("{"));
    expect(first?.length ?? 0).toBeLessThan(4000);
    const headline = JSON.parse(first ?? "{}") as { modes?: ModeReport[] };
    expect(headline.modes?.find((entry) => entry.collection === "aspekto")?.actual).toEqual([
      "komuna",
      "ekzemplo",
    ]);
  });
});

// F30 (An P0, Maintainer 2026-09-23): the label's typeface follows the brand. Figma allows
// setBoundVariable("fontFamily", …) and ("fontStyle", …); the condition is that every font the
// bound variables resolve to — over **all** modes — is loaded before the binding is written,
// otherwise Figma throws. The double models exactly that condition, so the run can be measured
// here instead of guessed at.
describe("the label's font is bound, not written (F30)", () => {
  const BOTH = MODEL_FONTS;

  async function report(double: ReturnType<typeof figmaDouble>) {
    return (await new Function(
      "figma",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      warnings: string[];
      components: { set: string; fonts?: unknown }[];
    };
  }

  const labelOf = (double: ReturnType<typeof figmaDouble>) => {
    const set = pageNodes(double).find(
      (child) => child.type === "COMPONENT_SET" && child.name === "butono",
    );
    const find = (node: DoubleNode): DoubleNode | undefined =>
      node.type === "TEXT" ? node : node.children.map(find).find((found) => found !== undefined);
    return find(set as DoubleNode);
  };

  it("binds the family and the cut to the role's variables", async () => {
    const double = figmaDouble({ fonts: BOTH });
    const result = await report(double);
    expect(result.warnings).toEqual([TITOLO_CASE_WARNING]);
    const label = labelOf(double);
    // The label's typography role follows the size, so which of them a given variant carries
    // depends on the variant; both fields must name the same role, and it must be a label role.
    const family = label?.boundVariables.fontFamily?.name ?? "";
    const style = label?.boundVariables.fontStyle?.name ?? "";
    expect(family).toMatch(/^typography\/label\/[12]\/font-family$/);
    expect(style).toBe(family.replace("font-family", "font-style"));
  });

  it("loads every font of every mode before it binds, not only the base one", async () => {
    const double = figmaDouble({ fonts: BOTH });
    await report(double);
    expect(double.loadedFonts).toContain("Geist Medium");
    expect(double.loadedFonts).toContain("Archivo Black");
  });

  // A file that has only the reference's font: the run says which one is missing and what it
  // falls back to, and it does not die on the binding.
  it("warns with the name and the fallback when a mode's font is missing", async () => {
    const double = figmaDouble({ fonts: [{ family: "Geist", style: "Medium" }] });
    const result = await report(double);
    const warning = result.warnings.join(" | ");
    expect(warning).toContain("Archivo Black");
    expect(warning).toContain("Inter");
    const label = labelOf(double);
    expect(label?.boundVariables.fontFamily).toBeUndefined();
    expect(label?.properties.fontName).toBeDefined();
  });

  // Rohdaten im Bericht: welche Variable an welchem Text hängt, und welche Familie je Modus
  // dahinter steht.
  it("names the bound variables and the family per mode in the report", async () => {
    const double = figmaDouble({ fonts: BOTH });
    const result = await report(double);
    expect(butonoOf(result.components)?.fonts).toEqual({
      bound: {
        fontFamily: ["typography/label/2/font-family", "typography/label/1/font-family"],
        fontStyle: ["typography/label/2/font-style", "typography/label/1/font-style"],
      },
      loaded: ["Archivo Black", "Geist Medium"],
      missing: [],
      crossing: [],
      refused: [],
      perAspekto: { ekzemplo: "Archivo Black", komuna: "Geist Medium" },
    });
  });
});

// F32 Teil 1: Der Lauf bindet die Radien des Rings und seines Abstands, statt Zahlen einzutragen.
// Gemessen wurde in der Datei das Gegenteil: boundVariables der beiden Knoten trug Paddings,
// Strichstärken und Striche — keinen Radius.
describe("the focus ring's radius is bound, not written (F32)", () => {
  async function file() {
    const double = figmaDouble({ fonts: MODEL_FONTS });
    await run(double);
    const set = pageNodes(double).find(
      (child) => child.type === "COMPONENT_SET" && child.name === "butono",
    );
    const variant = set?.children[0];
    const ring = variant?.children.find(
      (child) => child.getSharedPluginData("fundamento", "part") === "focus-ring",
    );
    const gap = ring?.children.find(
      (child) => child.getSharedPluginData("fundamento", "part") === "focus-gap",
    );
    return { ring, gap };
  }

  it("binds both radii to the variables the plan names", async () => {
    const { ring, gap } = await file();
    expect(ring?.boundVariables.cornerRadius?.name).toBe("radius/focus/ring");
    expect(gap?.boundVariables.cornerRadius?.name).toBe("radius/focus/gap");
  });

  it("leaves no number behind on either node", async () => {
    const { ring, gap } = await file();
    // Neutral is what the plugin owns; anything else would be the base combination's radius.
    expect(ring?.properties.cornerRadius).toBe(0);
    expect(gap?.properties.cornerRadius).toBe(0);
  });
});

// F32 Nachtrag (Maintainer, 2026-09-23): „Ein Bericht, der Absicht statt Wirkung meldet, ist
// schlimmer als kein Bericht." fonts.perAspekto nannte die geplante Schrift, auch wenn der Lauf
// eine andere angewandt hatte. Gemeldet wird jetzt, was wirklich geladen wurde — und der Rückfall
// bleibt zuerst in der Familie der Marke: Archivo Regular sagt mehr über die Marke als Inter Black.
describe("the report names the font that was applied, not the one that was planned (F32)", () => {
  async function report(double: ReturnType<typeof figmaDouble>) {
    return (await new Function(
      "figma",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      warnings: string[];
      components: { fonts: { perAspekto: Record<string, string>; missing: string[] } }[];
    };
  }

  it("names Archivo Regular when the file has the family but not the cut", async () => {
    const double = figmaDouble({
      fonts: [
        { family: "Geist", style: "Medium" },
        { family: "Archivo", style: "Regular" },
      ],
    });
    const result = await report(double);
    const fonts = butonoOf(result.components)?.fonts;
    expect(fonts?.perAspekto.ekzemplo).toBe("Archivo Regular");
    expect(fonts?.perAspekto.komuna).toBe("Geist Medium");
    // What the plan asked for and did not get keeps its name, so both are readable.
    expect(fonts?.missing).toEqual(["Archivo Black"]);
    expect(result.warnings.join(" | ")).toContain("Archivo Regular");
  });

  it("leaves the family only when the family itself is missing", async () => {
    const double = figmaDouble({ fonts: [{ family: "Geist", style: "Medium" }] });
    const result = await report(double);
    const fonts = butonoOf(result.components)?.fonts;
    expect(fonts?.perAspekto.ekzemplo).toBe("Inter Black");
    expect(fonts?.missing).toEqual(["Archivo Black"]);
  });
});

// W3 (Nachlese 3, F-2; gemessen vom Maintainer am 2026-10-16): Die Code-Schrift fiel im Plugin-Lauf
// auf Inter zurück, weil die Datei Geist Mono nicht kennt. Der Token font.family.code nennt eine
// Liste; der Plan trägt sie als `families`, und das Plugin geht sie durch — jeder Kandidat im Schnitt
// des Modells, dann Regular — bevor es auf die benannte Schrift zurückfällt. Die Warnung bleibt, wo
// kein Kandidat lädt, und nennt, was versucht wurde. Kein Token ändert sich dafür.
describe("the code font is the first loadable family of its stack (W3, F-2)", () => {
  const CODE_FAMILIES = ["Geist Mono", "Menlo"];
  /** The fixture's plan with a second candidate for the code family of the tekstareo. */
  const withCandidates = () => {
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const set = changed.components.find((component) => component.set === "tekstareo");
    for (const font of set?.fonts ?? []) {
      if (font.family === "Geist Mono") font.families = [...CODE_FAMILIES];
    }
    for (const variant of set?.variants ?? []) {
      if (variant.font?.family === "Geist Mono") variant.font.families = [...CODE_FAMILIES];
    }
    return (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );
  };
  const withoutGeistMono = MODEL_FONTS.filter((font) => font.family !== "Geist Mono");
  const report = async (double: ReturnType<typeof figmaDouble>, source: string) =>
    (await new Function("figma", `${source}\nreturn applyPlan();`)(double.figma)) as {
      warnings: string[];
    };

  it("loads the second family when the file refuses the first, without the fallback warning", async () => {
    const double = figmaDouble({
      fonts: [
        ...withoutGeistMono,
        { family: "Menlo", style: "Regular" },
        { family: "Menlo", style: "Medium" },
      ],
    });
    const result = await report(double, withCandidates());
    expect(double.loadedFonts).toContain("Menlo Regular");
    expect(result.warnings.filter((warning) => warning.includes("ersatzweise"))).toEqual([]);
    // Befund (W3): what the code text shows is decided by its binding to the role's variable,
    // whose value is the token's first family — Geist Mono, which this file cannot load. Figma
    // refuses such a binding (F30), so the candidate is loaded, and the text keeps the label's
    // font. The variable, not the ladder, would have to resolve the stack.
    expect(
      result.warnings.some(
        (warning) =>
          warning.startsWith("tekstareo") &&
          warning.includes("abgelehnt") &&
          warning.includes("typography/code/font-family"),
      ),
    ).toBe(true);
  });

  it("falls back to the named font when no candidate loads, and names every candidate it tried", async () => {
    const double = figmaDouble({ fonts: withoutGeistMono });
    const result = await report(double, withCandidates());
    expect(double.loadedFonts).not.toContain("Menlo Regular");
    const warning = result.warnings.find((entry) => entry.includes("Geist Mono Regular"));
    expect(warning).toContain("Inter Regular");
    expect(warning).toContain("ersatzweise");
    expect(warning).toContain("Geist Mono, Menlo");
  });
});

// F31: Der Lauf bindet den Sperrsatz und schreibt die Schreibweise. Gebunden, wo Figma es zulässt
// — `letterSpacing` ist ein bindbares Feld des Textknotens, `textCase` ist es nicht.
describe("the label carries its tracking and its case (F31)", () => {
  const labelOf = (double: ReturnType<typeof figmaDouble>) => {
    const set = pageNodes(double).find(
      (child) => child.type === "COMPONENT_SET" && child.name === "butono",
    );
    const find = (node: DoubleNode): DoubleNode | undefined =>
      node.type === "TEXT" ? node : node.children.map(find).find((found) => found !== undefined);
    return find(set as DoubleNode);
  };

  it("binds the tracking to the role's variable", async () => {
    const double = modelDouble();
    await run(double);
    const label = labelOf(double);
    expect(label?.boundVariables.letterSpacing?.name).toMatch(
      /^typography\/label\/[12]\/letter-spacing$/,
    );
  });

  it("writes the case the plan states", async () => {
    const double = modelDouble();
    await run(double);
    expect(labelOf(double)?.properties.textCase).toBe("ORIGINAL");
  });

  // Wo zwei Marken sich über die Schreibweise nicht einig sind, schreibt der Lauf keine und sagt
  // es mit Namen — dieselbe Ehrlichkeit wie bei einer Deckkraft, die dem Modus nicht folgen kann.
  it("warns instead of choosing a brand when the case varies by mode", async () => {
    const double = modelDouble();
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    for (const variant of butonoOf(changed.components)?.variants ?? []) {
      variant.textCase = "text case varies by mode";
    }
    const source = (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );
    const result = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as {
      warnings: string[];
    };
    expect(result.warnings.join(" | ")).toContain("Schreibweise");
    expect(labelOf(double)?.properties.textCase).toBeUndefined();
  });
});

// F34 (An P0, Maintainer 2026-09-23, gemessen in aRrK0MFZri9D5sE0j3NooQ): Der Bericht nannte für
// denselben Knoten in Lauf 1 `opacity: 0` und in Lauf 2 `opacity: 1`, ohne Eingriff dazwischen —
// und `#000000 α1` gibt es in keiner der acht Kombinationen. Ein gebundener Paint behält die Farbe,
// mit der er zuletzt geschrieben wurde, und eine eigene Deckkraft; wer beide zusammen abliest,
// bekommt ein Paar, das kein Modus zeigt. Gemessen wird deshalb der aufgelöste Zustand.
describe("every paint the report names exists somewhere (F34)", () => {
  /** Every colour the plan can resolve for `variable`, as "<hex> <alpha>". */
  const shownSomewhere = (variable: string) => {
    const out = new Set<string>();
    for (const aspekto of ["komuna", "ekzemplo"]) {
      for (const scheme of ["light", "dark"]) {
        for (const contrast of ["default", "high"]) {
          const value = resolveFigmaPlan(plan, {
            aspekto,
            "color-scheme": scheme,
            contrast,
          })[variable] as { r: number; g: number; b: number; a: number } | undefined;
          if (value !== undefined) out.add(paintKey(value.r, value.g, value.b, value.a));
        }
      }
    }
    return out;
  };
  const paintKey = (r: number, g: number, b: number, a: number) =>
    `${[r, g, b].map((channel) => Math.round(channel * 255)).join(",")} a${Math.round(a * 100) / 100}`;

  async function paintsAfter(runs: number) {
    const double = modelDouble();
    let result: { components: { layout?: { paints?: Record<string, unknown> } }[] } = {
      components: [],
    };
    for (let index = 0; index < runs; index++) {
      result = (await new Function(
        "figma",
        `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma)) as typeof result;
    }
    const found: { where: string; variable: string; key: string }[] = [];
    const walk = (where: string, value: unknown) => {
      if (Array.isArray(value)) {
        for (const paint of value) {
          const entry = paint as {
            variable?: string | null;
            color?: { r: number; g: number; b: number };
            opacity?: number;
          };
          if (typeof entry.variable !== "string" || entry.color === undefined) continue;
          found.push({
            where,
            variable: entry.variable,
            key: paintKey(entry.color.r, entry.color.g, entry.color.b, entry.opacity ?? 1),
          });
        }
        return;
      }
      if (typeof value === "object" && value !== null) {
        for (const [key, inner] of Object.entries(value)) walk(`${where}.${key}`, inner);
      }
    };
    for (const component of result.components) walk("paints", component.layout?.paints);
    return found;
  }

  it.each([1, 2])("names only paints a mode can show, after run %i", async (runs) => {
    const paints = await paintsAfter(runs);
    expect(paints.length).toBeGreaterThan(4);
    const nowhere = paints.filter((paint) => !shownSomewhere(paint.variable).has(paint.key));
    expect(nowhere.map((paint) => `${paint.where} ${paint.variable} = ${paint.key}`)).toEqual([]);
  });
});

// F35 (An P0, Maintainer 2026-09-23): Nach beiden Läufen trug das Set
// explicitVariableModes = { aspekto: ekzemplo, contrast: default } — wer die Bibliothek öffnet,
// sieht die Beispielmarke als „den" Knopf. Und es erklärt F34 mit, weil zwei Läufe dann in
// verschiedenen Kontexten lesen.
describe("the set is left on no mode of its own (F35)", () => {
  async function setAfter(runs: number) {
    const double = modelDouble();
    for (let index = 0; index < runs; index++) await run(double);
    const set = pageNodes(double).find((child) => child.type === "COMPONENT_SET");
    return { double, set };
  }

  it.each([1, 2])("leaves the set with no explicit mode after run %i", async (runs) => {
    const { set } = await setAfter(runs);
    expect(set?.explicitVariableModes).toEqual({});
  });

  it("clears a mode a previous run or a designer left on the set", async () => {
    const { double, set } = await setAfter(1);
    const aspekto = double.collections.find((collection) => collection.name === "aspekto");
    const ekzemplo = aspekto?.modes.find((mode) => mode.name === "ekzemplo");
    if (aspekto === undefined || ekzemplo === undefined) throw new Error("no ekzemplo mode");
    set?.setExplicitVariableModeForCollection(aspekto, ekzemplo.modeId);
    expect(set?.explicitVariableModes).not.toEqual({});
    await run(double);
    expect(set?.explicitVariableModes).toEqual({});
  });
});

// F43 (An P0, Maintainer 2026-10-06): Zwei Läufe in derselben Datei meldeten für die Füllung des
// Knotens control der Variante tertiary/large/loading dieselbe Variable und dieselbe Farbe, aber
// Deckkraft 0 nach dem ersten und 1 nach dem zweiten Lauf. Zugesichert wird beides, was eine Zeile
// "opacity" im Bericht bedeuten kann: die Deckkraft, die der Paint im Knoten hält, und der Wert,
// den der Bericht meldet — nach jedem der beiden Läufe.
// Grün seit #29 (F36); Befund vom 06.10. als Messung mit einem Plugin vor #29 erklärt, seit #40
// nennt jeder Lauf seinen Build.
describe("the tertiary fill keeps its deckkraft over two runs (F43)", () => {
  const props = { emphasis: "low", intent: "neutral", size: "large", state: "loading" };
  const name = Object.entries(props)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
  type StoredPaint = { opacity?: number; boundVariables?: { color?: { id: string } } };
  type ReportedPaint = { opacity: number; resolved: boolean; stored: { opacity: number } };

  it("is the last variant of the plan, the one the report shows, and planned at deckkraft 0", () => {
    const variants = butonoOf(plan.components)?.variants ?? [];
    expect(variants.at(-1)?.props).toEqual(props);
    expect(variants.at(-1)?.paints?.["surface.fill"]).toEqual({ hex: "#000000", opacity: 0 });
    expect(variants.at(-1)?.paints?.["border.color"]).toEqual({ hex: "#000000", opacity: 0 });
  });

  it("holds deckkraft 0 on fill and stroke after the first and the second run", async () => {
    const double = modelDouble();
    for (const index of [1, 2]) {
      const report = (await new Function(
        "figma",
        `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma)) as {
        components: {
          layout: { paints: { last: Record<string, { fills: unknown[]; strokes: unknown[] }> } };
        }[];
      };
      const set = pageNodes(double).find((child) => child.name === "butono");
      const control = descendant(
        set?.children.find((child) => child.name === name),
        "control",
      );
      const reported = butonoOf(report.components)?.layout.paints.last.control;
      for (const field of ["fills", "strokes"] as const) {
        const where = `run ${index}, control ${field}`;
        const held = ((control?.properties[field] ?? []) as StoredPaint[])[0];
        expect(held?.boundVariables?.color?.id, where).toBeDefined();
        expect(held?.opacity, `${where}, held`).toBe(0);
        const line = (reported?.[field] ?? [])[0] as ReportedPaint | undefined;
        expect(line?.opacity, `${where}, reported`).toBe(0);
        expect(line?.stored.opacity, `${where}, reported stored`).toBe(0);
      }
    }
  });
});

// Sammlungswechsel (Maintainer, Messung 2026-10-09 in f10b-2, Plugin 7f57ee2): Die Datei hielt 364
// Variablen in `fundamento`, gebaut mit dem Ein-Marken-Plan; der Zwei-Marken-Plan legt sie in
// `aspekto` und lässt `fundamento` leer. Der Lauf fand jede am Namen, nahm den Modus von `aspekto`,
// und Figma lehnte ab: „in setValueForMode: mode with id 2:1 not defined for variable". Die
// Plugin-API kann eine Variable nicht in eine andere Sammlung verschieben: `variableCollectionId`
// ist nur lesbar (plugin-api.d.ts 1.138.0), und weder Variable noch VariableCollection noch
// VariablesAPI kennen einen Aufruf dafür. Löschen und Neuanlegen gäbe ihr eine neue Id, und jede
// Bindung an einen Knoten und jeder Alias einer anderen Variable verlöre sein Ziel. Also bricht der
// Lauf vor dem ersten Schreiben ab, wie F10c, und nennt jede betroffene Variable mit der Sammlung,
// in der sie liegt, und der, in die der Plan sie legt. Entscheidung des Maintainers (2026-10-11):
// `fundamento` darf leer sein, keine Modelo-Änderung; eine leere Sammlung wird gemeldet, nie
// gelöscht.
describe("a variable the file holds in another collection stops the run before it writes (Sammlung gewechselt)", () => {
  type Switched = { name: string; from: string; to: string };
  type SwitchAbort = Error & { abort?: { switched?: Switched[] } };
  interface VariablesApi {
    variables: {
      createVariableCollection: (name: string) => DoubleCollection;
      createVariable: (name: string, collection: DoubleCollection, type: string) => DoubleVariable;
    };
  }
  const TWO_BRANDS = files["figma/plugin/code.js"] ?? "";
  const ONE_BRAND = repoFiles["figma/plugin/code.js"] ?? "";

  /** The abort of a run instead of its rejection; undefined when the run went through. */
  const abortOf = (double: ReturnType<typeof figmaDouble>, source: string) =>
    (
      new Function("figma", `${source}\nreturn applyPlan();`)(double.figma) as Promise<unknown>
    ).then(
      () => undefined,
      (caught: unknown) => caught as SwitchAbort,
    );
  const named = (of: FigmaPlan, collection: string) =>
    of.collections.find((candidate) => candidate.name === collection)?.variables ?? [];
  /**
   * Every variable the one-brand file holds in another collection than the two-brand plan puts it
   * in, in the plan's order: the 364 of fundamento (362 to aspekto, 2 to contrast) and one more
   * the one-brand plan had in color-scheme — computed from the plans, not copied from the plugin.
   */
  const expectedSwitches = (): Switched[] => {
    const held = new Map<string, string>();
    for (const collection of repoPlan.collections) {
      for (const variable of collection.variables) held.set(variable.name, collection.name);
    }
    return plan.collections.flatMap((collection) =>
      collection.variables.flatMap((variable) => {
        const from = held.get(variable.name);
        return from === undefined || from === collection.name
          ? []
          : [{ name: variable.name, from, to: collection.name }];
      }),
    );
  };
  const firstOfAspekto = () => {
    const [first] = named(plan, "aspekto");
    if (first === undefined) throw new Error("the two-brand plan has no variable in aspekto");
    return first;
  };

  it("is the maintainer's case: the one-brand plan fills fundamento, the two-brand plan leaves it empty", () => {
    expect(named(repoPlan, "fundamento").length).toBeGreaterThan(0);
    expect(named(plan, "fundamento")).toEqual([]);
    const switches = expectedSwitches();
    expect(switches.length).toBeGreaterThan(0);
    // Most go to aspekto; the contrast tokens the one-brand plan kept in fundamento go to contrast.
    const targets = new Set(switches.map((entry) => entry.to));
    expect(targets.has("aspekto")).toBe(true);
    expect(targets.has("fundamento")).toBe(false);
  });

  it("the double refuses a value for a mode its collection does not have, with Figma's words", () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    const a = api.variables.createVariableCollection("A");
    const b = api.variables.createVariableCollection("B");
    const x = api.variables.createVariable("x", a, "FLOAT");
    expect(() => x.setValueForMode(b.defaultModeId, 1)).toThrow(
      `in setValueForMode: mode with id ${b.defaultModeId} not defined for variable`,
    );
    x.setValueForMode(a.defaultModeId, 1);
    expect(x.valuesByMode).toEqual({ [a.defaultModeId]: 1 });
  });

  it("aborts before the first write when the file holds the brand's variables in fundamento", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const counts = { ...double.counts };
    const before = double.snapshot();
    const error = await abortOf(double, TWO_BRANDS);
    expect(error?.message).toContain("Abbruch vor dem ersten Schreiben");
    expect(error?.message).toContain("Sammlung gewechselt");
    expect(error?.message).toContain("fundamento");
    expect(error?.message).toContain("aspekto");
    expect(double.counts).toEqual(counts);
    expect(double.snapshot()).toBe(before);
    // The plugin removes nothing: fundamento stands, with every variable it had.
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(true);
  });

  it("names every affected variable, the collection it lies in and the one the plan puts it in", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const error = await abortOf(double, TWO_BRANDS);
    const expected = expectedSwitches();
    expect(error?.abort?.switched).toEqual(expected);
    expect(error?.message).toContain(String(expected.length));
    expect(error?.message).toContain(expected[0]?.name ?? "?");
  });

  it("aborts for a single variable in a foreign collection, and leaves that collection standing", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    const other = api.variables.createVariableCollection("alt");
    const spec = firstOfAspekto();
    api.variables.createVariable(spec.name, other, spec.type);
    const counts = { ...double.counts };
    const error = await abortOf(double, TWO_BRANDS);
    expect(error?.abort?.switched).toEqual([{ name: spec.name, from: "alt", to: "aspekto" }]);
    expect(double.counts).toEqual(counts);
    expect(double.collections.map((collection) => collection.name)).toEqual(["alt"]);
  });

  it("is not stopped by a same-named variable elsewhere when the planned collection has its own", async () => {
    const double = modelDouble();
    await run(double, TWO_BRANDS);
    const api = double.figma as unknown as VariablesApi;
    const other = api.variables.createVariableCollection("alt");
    const spec = firstOfAspekto();
    const stranger = api.variables.createVariable(spec.name, other, spec.type);
    const error = await abortOf(double, TWO_BRANDS);
    expect(error).toBeUndefined();
    expect(stranger.valuesByMode).toEqual({});
    expect(stranger.variableCollectionId).toBe(other.id);
  });

  it("says it in the toast and prints the whole list as JSON lines in the console", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const lines: string[] = [];
    const module = new Function("figma", "console", TWO_BRANDS);
    await module(
      { ...double.figma, command: "apply" },
      {
        log: () => undefined,
        error: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const toast = double.notifications.at(-1);
    expect(toast?.message).toContain("Abbruch");
    expect(toast?.message).toContain("Sammlung gewechselt");
    expect(toast?.options).toMatchObject({ error: true });
    // Every line under Figma's limit for a copied line (F22), the list in parts, complete.
    for (const line of lines) expect(line.length).toBeLessThan(4000);
    const listed = lines
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as { part?: string; items?: Switched[] })
      .filter((part) => part.part === "switched")
      .flatMap((part) => part.items ?? []);
    expect(listed).toEqual(expectedSwitches());
  });

  it("reports a collection of the plan that stands empty in the file, and does not remove it", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    // The file after the maintainer moved the brand's variables out of fundamento by hand.
    api.variables.createVariableCollection("fundamento");
    const report = (await new Function("figma", `${TWO_BRANDS}\nreturn applyPlan();`)(
      double.figma,
    )) as { empty: string[]; warnings: string[]; variables: number };
    expect(report.empty).toEqual(["fundamento"]);
    expect(report.variables).toBeGreaterThan(0);
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(true);
    // Raw data, not a warning: an empty fundamento is in order (Maintainer, 2026-10-11).
    expect(report.warnings.filter((warning) => warning.includes("fundamento"))).toEqual([]);
  });

  it("puts the empty collections into the headline of the printed report", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    api.variables.createVariableCollection("fundamento");
    const lines: string[] = [];
    const module = new Function("figma", "console", TWO_BRANDS);
    await module(
      { ...double.figma, command: "apply" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const headline = JSON.parse(lines.find((line) => line.startsWith("{")) ?? "{}") as {
      empty?: string[];
    };
    expect(headline.empty).toEqual(["fundamento"]);
  });
});

// Abnahme Spec 009 (2026-10-13), F-4: the control of the kampo was a narrow tall strip — without a
// text node with content the HUG layout shrinks to its paddings, help and error are invisible. The
// field shows the placeholder as example text in the control, help and error with a default text.
describe("the field of the kampo has room and shows its texts (F-4)", () => {
  type Held = Record<string, Record<string, unknown>>;
  const fieldReport = async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: { set: string; layout: { held: { rest: Held } } }[];
    };
    const kampo = report.components.find((component) => component.set === "kampo");
    return { double, rest: kampo?.layout.held.rest ?? {} };
  };

  it("the control is wider than high and as high as size.control.medium in rest", async () => {
    const { rest } = await fieldReport();
    expect(rest.control).toBeDefined();
    const width = Number(rest.control?.width);
    const height = Number(rest.control?.height);
    expect(height, "size.control.medium of the first variant (size=small: 32)").toBe(32);
    expect(width, `${width} × ${height}`).toBeGreaterThan(height);
  });

  it("the text in the control, the help and the error carry a default text and are visible", async () => {
    const { double } = await fieldReport();
    const set = pageNodes(double).find((child) => child.name === "kampo");
    const variant = set?.children[0];
    const field = variant?.children.find((child) => child.name === "field");
    type Node = { name: string; children: Node[]; properties: Record<string, unknown> };
    const find = (node: Node | undefined, name: string): Node | undefined => {
      if (node === undefined) return undefined;
      if (node.name === name) return node;
      for (const child of node.children) {
        const found = find(child, name);
        if (found !== undefined) return found;
      }
      return undefined;
    };
    const texts = Object.fromEntries(
      ["text", "help", "error"].map((name) => [
        name,
        String(find(field as Node | undefined, name)?.properties.characters ?? ""),
      ]),
    );
    expect(texts).toEqual({ text: "Beispiel", help: "Hinweis", error: "Fehler" });
    for (const [name, text] of Object.entries(texts)) expect(text, name).not.toBe("");
  });
});

// F-1 / F-2 (Nachlese Spec 008/009, gemessen 2026-10-13 in f10b-5): Das neue Set ligilo lag auf
// dem Set butono bei 0/0 und musste von Hand verschoben werden. Jetzt liegen alle Sets in einer
// Section „Fundamento". Ein Modus auf der Section schaltet die Marke der ganzen Bibliothek; das
// Plugin setzt und löscht dort nie einen (F35 gilt für Sets).
// F-8 (gemessen 2026-10-14 in f10b-5): Nach dem Lauf mit sieben Sets lag elektilo auf ligilo —
// der Abstand von F-7 (halbe Breite des linken Nachbarn) kam aus den Breiten im Standardmodus,
// und die Breiten ändern sich je Markenmodus (Archivo Black ist breiter). Jetzt rechnet das Plugin
// keine Lage mehr: In der Section liegt ein Frame „Eroj" mit Auto-Layout (horizontal, Umbruch,
// Abstände spacing.xlarge, Hug), alle Sets sind seine Kinder, Figma legt sie aus. Was das Double
// dabei über layoutWrap annimmt, steht an layoutOf in test-doubles/plugin.ts (Messung in f10b-5).
describe("every set lies in the frame Eroj in the section Fundamento (F-1, F-2, F-8)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const FRAME = "Eroj";
  type Placement = { frame: string; action: string };
  type FrameReport = { name: string; found: boolean; created: boolean; wrap: string };
  type SectionReport = {
    name: string;
    found: boolean;
    created: boolean;
    moved: string[];
    frame: FrameReport;
  };
  type Report = {
    section: SectionReport;
    components: { set: string; placement: Placement }[];
    warnings: string[];
  };
  async function apply(double: ReturnType<typeof figmaDouble>, options?: typeof LIFT) {
    const module = new Function("figma", "options", `${source}\nreturn applyPlan(options);`);
    return (await module(double.figma, options)) as Report;
  }
  const pageOf = (double: ReturnType<typeof figmaDouble>) => {
    const page = double.root.children[0];
    if (page === undefined) throw new Error("no page");
    return page;
  };
  const sectionsOf = (double: ReturnType<typeof figmaDouble>) =>
    pageOf(double).children.filter((child) => child.type === "SECTION");
  const sectionOf = (double: ReturnType<typeof figmaDouble>) => {
    const [section] = sectionsOf(double);
    if (section === undefined) throw new Error("no section");
    return section;
  };
  const framesOf = (double: ReturnType<typeof figmaDouble>) =>
    sectionOf(double).children.filter((child) => child.type === "FRAME");
  const frameOf = (double: ReturnType<typeof figmaDouble>) => {
    const [frame] = framesOf(double);
    if (frame === undefined) throw new Error(`no frame ${FRAME} in the section`);
    return frame;
  };
  const named = (parent: DoubleNode, name: string) => {
    const found = parent.children.find((child) => child.name === name);
    if (found === undefined) throw new Error(`no ${name} in ${parent.name}`);
    return found;
  };
  type DoubleBoxLike = { x: number; y: number; width: number; height: number };
  /** Place and size as the double's layout computes them, as a plain object. */
  const box = (node: DoubleNode): DoubleBoxLike => {
    const { x, y, width, height } = node as unknown as DoubleBoxLike;
    return { x, y, width, height };
  };
  /** Place on the page: x and y of every ancestor up to the page added (F-8). */
  const onPage = (node: DoubleNode): DoubleBoxLike => {
    const own = box(node);
    let x = 0;
    let y = 0;
    for (let current: DoubleNode | undefined = node; current !== undefined; ) {
      if (current.type === "PAGE") break;
      const at = box(current);
      x += at.x;
      y += at.y;
      current = current.parent;
    }
    return { x, y, width: own.width, height: own.height };
  };
  const overlap = (a: DoubleBoxLike, b: DoubleBoxLike) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  /** Every pair of sets whose boxes on the page intersect, as "a × b". */
  const overlapping = (double: ReturnType<typeof figmaDouble>): string[] => {
    const sets = pageNodes(double).filter((node) => node.type === "COMPONENT_SET");
    const found: string[] = [];
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const a = sets[i] as DoubleNode;
        const b = sets[j] as DoubleNode;
        if (overlap(onPage(a), onPage(b))) found.push(`${a.name} × ${b.name}`);
      }
    }
    return found;
  };
  const setNamed = (double: ReturnType<typeof figmaDouble>, name: string) => {
    const set = pageNodes(double).find(
      (node) => node.type === "COMPONENT_SET" && node.name === name,
    );
    if (set === undefined) throw new Error(`no set ${name}`);
    return set;
  };
  /**
   * Every text under a node that carries the label property: the label of a control, the message
   * of a notice (Spec 011 ③: the avizo is the first set in the frame).
   */
  const labelsOf = (node: DoubleNode): DoubleNode[] =>
    node.children.flatMap((child) => [
      ...(child.type === "TEXT" &&
      (child.properties.componentPropertyReferences as { characters?: string } | undefined)
        ?.characters !== undefined
        ? [child]
        : []),
      ...labelsOf(child),
    ]);
  const names = repoPlan.components.map((component) => component.set);
  // Spec 011 ②: the example frame „mit Hintergrund" of the dialogo lies in the frame beside its
  // set; it is no set, so it is moved by no test and overlaps with none. Spec 011 ④: so does the
  // example frame „unbekannt" of the mezurilo; Spec 011 ⑤: and „vertikal" of the navigado.
  const inFrame = names.flatMap((name) =>
    name === "dialogo"
      ? [name, `dialogo – ${BACKDROP_EXAMPLE}`]
      : name === "mezurilo"
        ? [name, `mezurilo – ${UNKNOWN_EXAMPLE}`]
        : name === "navigado"
          ? [name, `navigado – ${VERTICAL_EXAMPLE}`]
          : [name],
  );
  const layout = repoPlan.section;
  const inLayout = names.map(() => ({ frame: FRAME, action: "in-layout" }));

  it("creates one section Fundamento with one frame Eroj, both stamped, every set in the frame", async () => {
    const double = modelDouble();
    const report = await apply(double);
    expect(sectionsOf(double)).toHaveLength(1);
    const section = sectionOf(double);
    expect(section.name).toBe("Fundamento");
    expect(section.getSharedPluginData("fundamento", "section")).toBe("Fundamento");
    expect(section.children.map((child) => child.name)).toEqual([FRAME]);
    const frame = frameOf(double);
    expect(frame.getSharedPluginData("fundamento", "frame")).toBe(FRAME);
    expect(frame.children.map((child) => child.name)).toEqual(inFrame);
    expect(pageOf(double).children.filter((child) => child.type === "COMPONENT_SET")).toEqual([]);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: false,
      created: true,
      moved: [],
      frame: { name: FRAME, found: false, created: true, wrap: "WRAP" },
    });
  });

  it("lets Figma lay the sets out: horizontal, wrapping, spacing.xlarge, hugging, no fill", async () => {
    const double = modelDouble();
    const report = await apply(double);
    const frame = frameOf(double);
    expect(frame.properties).toMatchObject({
      layoutMode: "HORIZONTAL",
      layoutWrap: "WRAP",
      itemSpacing: layout?.gap,
      counterAxisSpacing: layout?.gap,
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
      fills: [],
    });
    expect(box(frame)).toMatchObject({ x: layout?.padding, y: layout?.padding });
    // The plugin computes no place of a set: x and y are Figma's (the double's layout).
    for (const name of names) {
      const set = named(frame, name);
      expect(set.properties.x, name).toBeUndefined();
      expect(set.properties.y, name).toBeUndefined();
      expect(set.properties.layoutPositioning, name).toBe("AUTO");
    }
    expect(report.components.map((component) => component.placement)).toEqual(inLayout);
  });

  it("sizes the section to the frame plus its padding", async () => {
    const double = modelDouble();
    await apply(double);
    const section = box(sectionOf(double));
    const frame = box(frameOf(double));
    const padding = layout?.padding ?? NaN;
    expect(section.width).toBe(frame.x + frame.width + padding);
    expect(section.height).toBe(frame.y + frame.height + padding);
  });

  // The finding of 2026-10-14: in the brand mode a set grows (Archivo Black) and ran into its
  // right neighbour. The double cannot switch the mode of a size (it resolves the first mode), so
  // the wider brand is drawn as longer labels — the set grows by what it measures, not by a width
  // the test assigns.
  it("keeps two sets whose widths differ per mode apart, in either mode (F-8)", async () => {
    const double = modelDouble();
    await apply(double);
    expect(overlapping(double)).toEqual([]);
    // The first two sets with a label to lengthen: since Spec 011 ④ the atributlisto sorts first
    // and connects no text to its label (its label is the accessible name, never seen).
    const [left, right] = names.filter((name) => labelsOf(setNamed(double, name)).length > 0);
    if (left === undefined || right === undefined) throw new Error("2");
    const labels = labelsOf(setNamed(double, left));
    expect(labels.length).toBeGreaterThan(0);
    const narrow = labels.map((label) => String(label.properties.characters ?? ""));
    const narrowWidth = box(setNamed(double, left)).width;
    // The brand switch: every label of the left set eight times as long.
    for (const label of labels) {
      Object.assign(label, { characters: String(label.properties.characters ?? "").repeat(8) });
    }
    const wideWidth = box(setNamed(double, left)).width;
    // More than any reserve of half the width plus the gap (F-7) could carry.
    expect(wideWidth).toBeGreaterThan(narrowWidth * 1.5 + (layout?.gap ?? NaN));
    expect(overlapping(double)).toEqual([]);
    // The right neighbour keeps the gap of spacing.xlarge in the wide mode too, or lies below.
    const wideLeft = onPage(setNamed(double, left));
    const wideRight = onPage(setNamed(double, right));
    expect(
      wideRight.x >= wideLeft.x + wideLeft.width + (layout?.gap ?? NaN) ||
        wideRight.y >= wideLeft.y + wideLeft.height + (layout?.gap ?? NaN),
    ).toBe(true);
    // And back to the narrow brand: still apart, nobody ran the plugin in between.
    labels.forEach((label, index) => {
      Object.assign(label, { characters: narrow[index] ?? "" });
    });
    expect(box(setNamed(double, left)).width).toBe(narrowWidth);
    expect(overlapping(double)).toEqual([]);
  });

  // A frame that hugs its width has no width to wrap at (one row). The rows in f10b-5 come from a
  // width the maintainer gives the frame by hand; the next run must not take it back to HUG.
  it("keeps a fixed width the maintainer gave the frame, and the sets wrap into rows", async () => {
    const double = modelDouble();
    await apply(double);
    const frame = frameOf(double);
    const [first, second, third] = names;
    if (first === undefined || second === undefined || third === undefined) throw new Error("3");
    const gap = layout?.gap ?? Number.NaN;
    const width = box(named(frame, first)).width + gap + box(named(frame, second)).width;
    // A size given by hand is a resize (width is read-only in the Plugin API, F-4).
    frame.resize(width, (frame as unknown as { height: number }).height);
    Object.assign(frame, { layoutSizingHorizontal: "FIXED" });
    expect(box(named(frame, third)).y).toBeGreaterThan(box(named(frame, first)).y);
    const report = await apply(double);
    expect((frame as unknown as { layoutSizingHorizontal: string }).layoutSizingHorizontal).toBe(
      "FIXED",
    );
    expect(box(frame).width).toBe(width);
    expect(box(named(frame, third)).y).toBeGreaterThan(box(named(frame, first)).y);
    expect(overlapping(double)).toEqual([]);
    expect(report.section.frame).toEqual({
      name: FRAME,
      found: true,
      created: false,
      wrap: "WRAP",
    });
  });

  it("finds section and frame again on a second run, moves nothing and makes no second one", async () => {
    const double = modelDouble();
    await apply(double);
    const first = double.snapshot();
    const report = await apply(double);
    expect(sectionsOf(double)).toHaveLength(1);
    expect(framesOf(double)).toHaveLength(1);
    expect(double.snapshot()).toBe(first);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: true,
      created: false,
      moved: [],
      frame: { name: FRAME, found: true, created: false, wrap: "WRAP" },
    });
    expect(report.components.map((component) => component.placement)).toEqual(inLayout);
    expect(report.warnings).toEqual([]);
  });

  // The file f10b-5 after the run of 2026-10-14: section Fundamento, the sets directly in it, at
  // the places F-1/F-7 computed. The run moves them into a new frame Eroj, in the plan's order.
  it("moves the sets that lie directly in the section into a new frame Eroj (f10b-5)", async () => {
    const double = modelDouble();
    await apply(double);
    const section = sectionOf(double);
    let x = layout?.padding ?? NaN;
    for (const name of names) {
      const set = named(frameOf(double), name);
      section.appendChild(set);
      Object.assign(set, { x, y: layout?.padding });
      x += box(set).width + (layout?.gap ?? NaN);
    }
    frameOf(double).remove();
    const report = await apply(double);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: true,
      created: false,
      moved: names,
      frame: { name: FRAME, found: false, created: true, wrap: "WRAP" },
    });
    expect(section.children.map((child) => child.name)).toEqual([FRAME]);
    expect(frameOf(double).children.map((child) => child.name)).toEqual(inFrame);
    expect(report.components.map((component) => component.placement)).toEqual(inLayout);
    expect(overlapping(double)).toEqual([]);
    expect(report.warnings).toEqual([]);
    // The next run finds everything in place.
    const snapshot = double.snapshot();
    const again = await apply(double);
    expect(double.snapshot()).toBe(snapshot);
    expect(again.section.moved).toEqual([]);
  });

  // The file f10b-5 as measured on 2026-10-13: the sets lie on the page, ligilo on butono at 0/0.
  it("moves the sets that lie on the page into a new section and frame, the first kept in place", async () => {
    const double = modelDouble();
    await apply(double);
    const page = pageOf(double);
    for (const name of names) {
      const set = named(frameOf(double), name);
      page.appendChild(set);
      Object.assign(set, { x: 0, y: 0 });
    }
    sectionOf(double).remove();
    const report = await apply(double);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: false,
      created: true,
      moved: names,
      frame: { name: FRAME, found: false, created: true, wrap: "WRAP" },
    });
    expect(frameOf(double).children.map((child) => child.name)).toEqual(inFrame);
    expect(page.children.filter((child) => child.type === "COMPONENT_SET")).toEqual([]);
    // The first set stays where the maintainer saw it: section and frame open around it.
    const first = onPage(setNamed(double, names[0] ?? ""));
    expect({ x: first.x, y: first.y }).toEqual({ x: 0, y: 0 });
    expect(overlapping(double)).toEqual([]);
    expect(report.components.map((component) => component.placement)).toEqual(inLayout);
    // Nothing was created: every variant was found in its set.
    expect(report.warnings).toEqual([]);
  });

  it("moves a set from the page into the frame it finds, at its end", async () => {
    const double = modelDouble();
    await apply(double);
    const first = names[0];
    if (first === undefined) throw new Error("1");
    pageOf(double).appendChild(named(frameOf(double), first));
    const report = await apply(double);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: true,
      created: false,
      moved: [first],
      frame: { name: FRAME, found: true, created: false, wrap: "WRAP" },
    });
    expect(frameOf(double).children.map((child) => child.name)).toEqual([
      ...inFrame.slice(1),
      first,
    ]);
    expect(overlapping(double)).toEqual([]);
  });

  // WRAP on a frame that hugs its width is not measured yet (F-8): should Figma refuse it, the run
  // goes on without wrap, in one row, and says so with Figma's words — like a refused font binding.
  it("goes on when Figma refuses layoutWrap on the frame, and says so (F-8)", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, refuse: ["layoutWrap"] });
    const report = await apply(double);
    expect(report.section).toEqual({
      name: "Fundamento",
      found: false,
      created: true,
      moved: [],
      frame: { name: FRAME, found: false, created: true, wrap: "refused" },
    });
    const frame = frameOf(double);
    expect(frame.properties.layoutWrap).toBeUndefined();
    expect(frame.properties.layoutMode).toBe("HORIZONTAL");
    expect(frame.children.map((child) => child.name)).toEqual(inFrame);
    expect(report.components.map((component) => component.placement)).toEqual(inLayout);
    expect(overlapping(double)).toEqual([]);
    const refusals = report.warnings.filter((warning) => warning.includes("layoutWrap"));
    expect(refusals).toHaveLength(1);
    expect(refusals[0]).toContain("Fundamento/Eroj");
    expect(refusals[0]).toContain("The Figma double refuses layoutWrap");
    // A second run tries again and says it again; nothing else changes.
    const snapshot = double.snapshot();
    const again = await apply(double);
    expect(double.snapshot()).toBe(snapshot);
    expect(again.section.frame.wrap).toBe("refused");
  });

  it("never sets and never clears a mode on the section; the sets stay on none (F35)", async () => {
    const double = modelDouble();
    await apply(double);
    const section = sectionOf(double);
    expect(section.explicitVariableModes).toEqual({});
    const aspekto = double.collections.find((collection) => collection.name === "aspekto");
    const mode = aspekto?.modes.at(-1);
    if (aspekto === undefined || mode === undefined) throw new Error("no aspekto mode");
    section.setExplicitVariableModeForCollection(aspekto, mode.modeId);
    // From here on, any call on the section's modes is a failure of the run.
    const refuse = () => {
      throw new Error("the plugin touched the mode of the section");
    };
    Object.assign(section, {
      setExplicitVariableModeForCollection: refuse,
      clearExplicitVariableModeForCollection: refuse,
    });
    await apply(double);
    expect(section.explicitVariableModes).toEqual({ [aspekto.id]: mode.modeId });
    for (const frame of framesOf(double)) expect(frame.explicitVariableModes).toEqual({});
    for (const name of names) {
      const set = setNamed(double, name);
      expect(set.explicitVariableModes, name).toEqual({});
      // The set follows the section: one mode there switches the brand of the whole library.
      expect(set.resolvedVariableModes[aspekto.id], name).toBe(mode.modeId);
    }
  });

  it("names section, frame and placement in the headline of the report", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", source);
    await module(
      { ...double.figma, command: "run" },
      { log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")), error: () => {} },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const first = lines.find((line) => line.startsWith("{"));
    expect(first?.length ?? 0).toBeLessThan(4000);
    const headline = JSON.parse(first ?? "{}") as Report;
    expect(headline.section).toEqual({
      name: "Fundamento",
      found: false,
      created: true,
      moved: [],
      frame: { name: FRAME, found: false, created: true, wrap: "WRAP" },
    });
    // Spec 014 ②: with twenty sets the placement stands in the part state of every set.
    const placements = lines
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as { part?: string; value?: { placement?: unknown } })
      .filter((part) => part.part === "state")
      .map((part) => part.value?.placement);
    expect(placements).toEqual(inLayout);
  });
});

// What the double assumes about a wrapping auto-layout frame (F-8) — a belief until the
// maintainer has measured it in f10b-5: rows at the inner width of a fixed frame, counterAxisSpacing
// between the rows; a frame that hugs its width is one row; every read follows the current sizes.
describe("the double lays out a horizontal frame that wraps (F-8, Annahme bis zur Messung)", () => {
  const frameOf = (double: ReturnType<typeof figmaDouble>) =>
    (double.figma as { createFrame: () => DoubleNode }).createFrame();
  type DoubleBoxLike = { x: number; y: number; width: number; height: number };
  const box = (node: DoubleNode): DoubleBoxLike => {
    const { x, y, width, height } = node as unknown as DoubleBoxLike;
    return { x, y, width, height };
  };
  const wrapping = () => {
    const double = modelDouble();
    const frame = frameOf(double);
    // The width by hand is a resize (width is read-only in the Plugin API, F-4); the layout after
    // it, as in the editor: a frame resized by hand keeps hugging its height once told so again.
    frame.resize(250, (frame as unknown as { height: number }).height);
    Object.assign(frame, {
      layoutMode: "HORIZONTAL",
      layoutWrap: "WRAP",
      itemSpacing: 10,
      counterAxisSpacing: 20,
      layoutSizingVertical: "HUG",
    });
    const children = [0, 1, 2].map(() => {
      const child = frameOf(double);
      child.resize(100, 50);
      frame.appendChild(child);
      return child;
    });
    return { frame, children };
  };

  it("wraps a child that would end beyond the inner width into the next row", () => {
    const { frame, children } = wrapping();
    expect(children.map((child) => [box(child).x, box(child).y])).toEqual([
      [0, 0],
      [110, 0],
      [0, 70],
    ]);
    expect(box(frame)).toMatchObject({ width: 250, height: 120 });
  });

  it("lays a frame that hugs its width out in one row", () => {
    const { frame, children } = wrapping();
    Object.assign(frame, { layoutSizingHorizontal: "HUG" });
    expect(children.map((child) => [box(child).x, box(child).y])).toEqual([
      [0, 0],
      [110, 0],
      [220, 0],
    ]);
    expect(box(frame)).toMatchObject({ width: 320, height: 50 });
  });

  it("follows a child that grows: its neighbours move on the next read", () => {
    const { frame, children } = wrapping();
    Object.assign(frame, { layoutSizingHorizontal: "HUG" });
    (children[0] as DoubleNode).resize(300, 50);
    expect(children.map((child) => box(child).x)).toEqual([0, 310, 420]);
  });
});

// M-3 (Abnahme Spec 008, Befund B-6; Entscheidung des Maintainers F14, 2026-10-13): Die
// Beschriftung jedes Sets hatte den Vorgabewert „Aktion" — für einen Link und ein Feld falsch.
// butono „Aktion", ligilo „Ziel", kampo „Beschriftung". Ein vorgefundenes Set bekommt das neue
// Wort beim nächsten Lauf.
describe("the label default follows the role of the Ero (M-3)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  type Definitions = Record<string, { type: string; defaultValue: string }>;
  const defaultsOf = (set: DoubleNode | undefined) =>
    Object.values((set?.properties.componentPropertyDefinitions ?? {}) as Definitions).map(
      (definition) => definition.defaultValue,
    );

  it("writes Aktion, Beschriftung and Ziel as the defaults of the three sets", async () => {
    const double = modelDouble();
    await run(double, source);
    const of = (name: string) => defaultsOf(pageNodes(double).find((child) => child.name === name));
    expect(of("butono")).toEqual(["Aktion"]);
    expect(of("elekto")).toEqual(["Frage"]);
    expect(of("kampo")).toEqual(["Beschriftung"]);
    expect(of("ligilo")).toEqual(["Ziel"]);
    expect(of("markobutono")).toEqual(["Option"]);
    expect(of("sxaltilo")).toEqual(["Einstellung"]);
    // Spec 011 ③ (plan ③ D-14): the badge, the notice (with its BOOLEAN dismissible beside the
    // label) and the state, whose word is the structure's.
    expect(of("insigno")).toEqual(["Status"]);
    expect(of("avizo")).toEqual(["Meldung", false]);
    expect(of("plenstato")).toEqual(["Zustand"]);
    // Spec 011 ④ (plan ④ D-14): the meter, the list (its label is the accessible name, no text
    // node) and the table, whose BOOLEAN caption-hidden is declared as the caption's visibility —
    // Figma shows a layer when its property is true, so the property is „caption", default true.
    expect(of("mezurilo")).toEqual(["Messwert"]);
    expect(of("atributlisto")).toEqual(["Angaben"]);
    expect(of("tabelo")).toEqual(["Beschriftung", true]);
    // Spec 011 ⑤: the navigation and the tab list — their label is the accessible name, heard,
    // never seen (no text node carries it); the words are proposals for the maintainer.
    expect(of("navigado")).toEqual(["Navigation"]);
    expect(of("langetaro")).toEqual(["Reiter"]);
  });

  it("updates a found ligilo that still says Aktion to Ziel, property and every label", async () => {
    const double = modelDouble();
    const older = JSON.parse(JSON.stringify(repoPlan)) as FigmaPlan;
    for (const component of older.components) {
      if (component.label !== undefined) component.label.defaultValue = "Aktion";
    }
    await run(
      double,
      source.replace(/^const PLAN = .*$/m, `const PLAN = ${JSON.stringify(older)};`),
    );
    const ligilo = () => pageNodes(double).find((child) => child.name === "ligilo");
    expect(defaultsOf(ligilo())).toEqual(["Aktion"]);
    await run(double, source);
    expect(defaultsOf(ligilo())).toEqual(["Ziel"]);
    for (const variant of ligilo()?.children ?? []) {
      expect(descendant(variant, "label")?.properties.characters, variant.name).toBe("Ziel");
    }
  });
});

// Spec 010 ① (plan D-10): the switch is drawn as a toggle — a field in a row: the focus ring
// around the track (control) with the knob (indicator) in it, the label beside. The knob stands
// at the start or the end of the track as the variant says; the gap between track and label is
// the field's. Measured in f10b-5 (the double knows the slice of the API the plugin uses).
describe("the sxaltilo is drawn as a toggle: track, knob, label beside (Spec 010 ①)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const drawn = async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "sxaltilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { set, variant };
  };

  it("draws every variant of checked × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(24);
    expect(set?.children[0]?.name).toBe("checked=true, size=small, state=rest");
  });

  it("puts the label beside the ring, the knob in the track", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const field = on?.children.find((child) => child.name === "field");
    expect(field?.children.map((child) => child.name)).toEqual(["focus-ring", "label"]);
    expect(field?.properties.layoutMode).toBe("HORIZONTAL");
    const control = descendant(on, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["indicator"]);
    expect(descendant(on, "label")?.properties.characters).toBe("Einstellung");
    expect(bound(field, "itemSpacing")).toBe("spacing/small");
  });

  it("stands the knob at the end when checked and at the start when not (D-04)", async () => {
    const { variant } = await drawn();
    const on = descendant(variant("checked=true, size=medium, state=rest"), "control");
    const off = descendant(variant("checked=false, size=medium, state=rest"), "control");
    expect(on?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(off?.properties.primaryAxisAlignItems).toBe("MIN");
    // The border of the track takes its room, as on the web (box-sizing border-box).
    expect(on?.properties.strokesIncludedInLayout).toBe(true);
  });

  it("binds the knob's fill, size and radius, and the track's width", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const knob = descendant(on, "indicator");
    expect(bound(knob, "width")).toBe("size/icon/medium");
    expect(bound(knob, "height")).toBe("size/icon/medium");
    expect(bound(knob, "cornerRadius")).toBe("radius/role/pill");
    const fill = (
      (knob?.properties.fills ?? []) as { boundVariables?: { color?: { id: string } } }[]
    )[0];
    expect(fill?.boundVariables?.color).toBeDefined();
    expect(bound(descendant(on, "control"), "minWidth")).toBe("size/control/medium");
  });
});

// Spec 010 ② (plan ② D-09, D-10): the checkbox is drawn in the toggle structure — a field in a
// row: the focus ring around the box (control) with the check mark (indicator) in it, then a
// column with the label and the error under it. The check mark is the web's vector, imported
// with createNodeFromSvg: its frame takes the bound size, the vector its bound colour and scales
// with the frame; where the variant hides it (indicator.color none), the frame has opacity 0.
// Test-double assumptions until measured in f10b-5: createNodeFromSvg gives a FRAME of the SVG's
// width and height holding one VECTOR; a vector with constraints SCALE follows its frame's size.
describe("the markobutono is drawn as a toggle: box, check mark, label and error beside (Spec 010 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const drawn = async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "markobutono");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  };

  it("draws every variant of checked × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(30);
    expect(set?.children[0]?.name).toBe("checked=true, size=small, state=rest");
  });

  it("puts label and error in a column beside the ring, the check mark in the box", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const field = on?.children.find((child) => child.name === "field");
    expect(field?.children.map((child) => child.name)).toEqual(["focus-ring", "texts"]);
    expect(field?.properties.layoutMode).toBe("HORIZONTAL");
    expect(field?.properties.counterAxisAlignItems).toBe("MIN");
    const texts = field?.children.find((child) => child.name === "texts");
    expect(texts?.properties.layoutMode).toBe("VERTICAL");
    expect(texts?.children.map((child) => child.name)).toEqual(["label", "error"]);
    expect(descendant(on, "label")?.properties.characters).toBe("Option");
    expect(descendant(on, "error")?.properties.characters).toBe("Fehler");
    const control = descendant(on, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["indicator"]);
    expect(descendant(on, "indicator")?.children.map((child) => child.name)).toEqual(["mark"]);
    expect(bound(field, "itemSpacing")).toBe("spacing/small");
  });

  it("binds the size of the check mark's frame, the colour of its vector, and the box's radius", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const indicator = descendant(on, "indicator");
    expect(bound(indicator, "width")).toBe("size/icon/medium");
    expect(bound(indicator, "height")).toBe("size/icon/medium");
    const mark = descendant(on, "mark");
    expect(mark?.type).toBe("VECTOR");
    expect(mark?.properties.constraints).toEqual({ horizontal: "SCALE", vertical: "SCALE" });
    const fill = (
      (mark?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[]
    )[0];
    expect(fill?.boundVariables?.color?.name).toBe("color/action/primary/text");
    expect(bound(descendant(on, "control"), "cornerRadius")).toBe("radius/role/control");
    expect(indicator?.properties.opacity).toBe(1);
  });

  it("hides the check mark where the box is not ticked, and binds no colour to it", async () => {
    const { variant } = await drawn();
    const off = variant("checked=false, size=medium, state=rest");
    expect(descendant(off, "indicator")?.properties.opacity).toBe(0);
    const fills = (descendant(off, "mark")?.properties.fills ?? []) as unknown[];
    expect(fills).toEqual([]);
  });

  it("keeps the switch's knob a filled frame without a sign or a column (Spec 010 ①)", async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "sxaltilo");
    const on = set?.children.find(
      (child) => child.name === "checked=true, size=medium, state=rest",
    );
    expect(on?.children[0]?.children.map((child) => child.name)).toEqual(["focus-ring", "label"]);
    expect(descendant(on, "indicator")?.children).toEqual([]);
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 010 ③ (plan ③ D-07): the radio group is drawn in a structure of its own, choice — a field in a
// column: the label (the question), a column of options, help and error. Each option is a row:
// the focus ring around the circle (control) with the dot (indicator, the web's vector) in it, the
// option's label beside it. The bindings that follow selected come from the entry of the plan for
// that option (the first chosen, E7): the chosen circle filled, its dot drawn; the others filled
// with the ground and their dot at opacity 0. The focus ring shows on the first option only.
// Test-double assumptions until measured in f10b-5: as for the check mark (② D-09), and a
// componentPropertyReference on one text of each variant only (the label).
describe("the elekto is drawn as a choice: question, options with circle and dot, help and error (Spec 010 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const fillOf = (node: DoubleNode | undefined) =>
    ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  const strokeOf = (node: DoubleNode | undefined) =>
    ((node?.properties.strokes ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  const drawn = async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "elekto");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  };

  it("draws every variant of size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(15);
    expect(set?.children[0]?.name).toBe("size=small, state=rest");
  });

  it("stacks the question, the options, help and error; each option a row of ring and label", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const field = rest?.children.find((child) => child.name === "field");
    expect(field?.properties.layoutMode).toBe("VERTICAL");
    expect(field?.children.map((child) => child.name)).toEqual([
      "label",
      "options",
      "help",
      "error",
    ]);
    const options = field?.children.find((child) => child.name === "options");
    expect(options?.properties.layoutMode).toBe("VERTICAL");
    expect(options?.children.map((child) => child.name)).toEqual([
      "option-1",
      "option-2",
      "option-3",
    ]);
    const first = options?.children[0];
    expect(first?.properties.layoutMode).toBe("HORIZONTAL");
    expect(first?.children.map((child) => child.name)).toEqual(["focus-ring", "option-label"]);
    expect(descendant(first, "control")?.children.map((child) => child.name)).toEqual([
      "indicator",
    ]);
    expect(descendant(first, "indicator")?.children.map((child) => child.name)).toEqual(["mark"]);
    expect(descendant(rest, "label")?.properties.characters).toBe("Frage");
    expect(
      options?.children.map((option) => descendant(option, "option-label")?.properties.characters),
    ).toEqual(["Eins", "Zwei", "Drei"]);
    expect(descendant(rest, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(rest, "error")?.properties.characters).toBe("Fehler");
    expect(bound(field, "itemSpacing")).toBe("spacing/medium");
    expect(bound(options, "itemSpacing")).toBe("spacing/medium");
    expect(bound(first, "itemSpacing")).toBe("spacing/small");
  });

  it("fills the chosen circle and draws its dot; the other circles take the ground, their dot hidden", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const options = descendant(rest, "options")?.children ?? [];
    const [chosen, other] = options;
    expect(fillOf(descendant(chosen, "control"))).toBe("color/action/primary/rest");
    expect(fillOf(descendant(other, "control"))).toBe("color/background/default");
    expect(strokeOf(descendant(other, "control"))).toBe("color/border/strong");
    expect(bound(descendant(chosen, "control"), "cornerRadius")).toBe("radius/role/pill");
    expect(descendant(chosen, "indicator")?.properties.opacity).toBe(1);
    expect(fillOf(descendant(chosen, "mark"))).toBe("color/action/primary/text");
    expect(bound(descendant(chosen, "indicator"), "width")).toBe("size/icon/medium");
    expect(descendant(other, "indicator")?.properties.opacity).toBe(0);
    expect(descendant(other, "mark")?.properties.fills).toEqual([]);
    expect(fillOf(descendant(other, "option-label"))).toBe("color/text/default");
    expect(bound(descendant(other, "option-label"), "fontSize")).toBe(
      "typography/body/1/font-size",
    );
  });

  it("shows the focus ring on the first option only, in the focus variant only", async () => {
    const { variant } = await drawn();
    const focus = descendant(variant("size=medium, state=focus"), "options")?.children ?? [];
    expect(strokeOf(descendant(focus[0], "focus-ring"))).toBeDefined();
    expect(strokeOf(descendant(focus[1], "focus-ring"))).toBeUndefined();
    const rest = descendant(variant("size=medium, state=rest"), "options")?.children ?? [];
    expect(strokeOf(descendant(rest[0], "focus-ring"))).toBeUndefined();
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 010 ④ (plan ④ D-07, E3): the select is drawn as the field of the kampo — label above, ring →
// gap → control, help and error below — and its control holds the prompt and the chevron: the
// text "Bitte wählen" (the placeholder's colour, bound) and after it the indicator, the web's
// chevron imported as one vector, its frame sized by indicator.size, its fill bound to
// indicator.color; the gap between them is box.gap (the control's itemSpacing). Only the closed
// field is drawn: the list is the platform's (E3). Test-double assumptions until measured in
// f10b-5: as for the check mark (② D-09) — createNodeFromSvg makes a FRAME of 16 × 16 with one
// VECTOR per path, a SCALE constraint follows the bound frame.
describe("the elektilo is drawn as the field of the kampo with the chevron in its control (Spec 010 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const drawn = async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "elektilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  };

  it("draws every variant of size × state, named by the plan, and no list", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(15);
    expect(set?.children[0]?.name).toBe("size=small, state=rest");
    expect(set?.children.some((child) => /open/.test(child.name))).toBe(false);
  });

  it("stacks label, ring with the control, help and error; the control holds the prompt, then the chevron", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const field = rest?.children.find((child) => child.name === "field");
    expect(field?.properties.layoutMode).toBe("VERTICAL");
    expect(field?.children.map((child) => child.name)).toEqual([
      "label",
      "focus-ring",
      "help",
      "error",
    ]);
    const control = descendant(rest, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text", "indicator"]);
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(descendant(rest, "label")?.properties.characters).toBe("Auswahl");
    expect(descendant(rest, "text")?.properties.characters).toBe("Bitte wählen");
    expect(descendant(rest, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(rest, "error")?.properties.characters).toBe("Fehler");
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
  });

  it("binds the chevron's frame to size.icon.*, its vector's fill to color.text.muted, the prompt to the placeholder colour", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const indicator = descendant(rest, "indicator");
    expect(bound(indicator, "width")).toBe("size/icon/medium");
    expect(bound(indicator, "height")).toBe("size/icon/medium");
    expect(indicator?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(indicator?.properties.opacity).toBe(1);
    // Spec 014 ②: the chevron is a glyph frame per Aspekto of the plan (the repo plan: komuna).
    expect(descendant(rest, "indicator")?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
    ]);
    const mark = descendant(rest, "mark");
    expect(mark?.type).toBe("VECTOR");
    expect(mark?.properties.constraints).toEqual({ horizontal: "SCALE", vertical: "SCALE" });
    const paint = (node: DoubleNode | undefined) =>
      ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
        ?.boundVariables?.color?.name;
    expect(paint(mark)).toBe("color/text/muted");
    expect(paint(descendant(rest, "text"))).toBe("color/text/subtle");
    expect(bound(descendant(variant("size=large, state=invalid"), "indicator"), "width")).toBe(
      "size/icon/large",
    );
    const strokes = (
      (descendant(variant("size=large, state=invalid"), "control")?.properties.strokes ?? []) as {
        boundVariables?: { color?: { name: string } };
      }[]
    )[0];
    expect(strokes?.boundVariables?.color?.name).toBe("color/status/danger/border");
  });

  it("keeps the text field without a chevron (Spec 009)", async () => {
    const { double } = await drawn();
    const kampo = pageNodes(double).find((child) => child.name === "kampo");
    const control = descendant(kampo?.children[0], "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ② (spec „tekstareo", G7): the text area is drawn as the field of the kampo (Spec 009,
// D-09) with the axes kind × size × state. The text in the control binds the code role for
// kind=code and the body role for kind=text; the control has no box.height and hugs its text,
// which shows the example and the empty lines of the default rows (four), so the area is as high
// as four lines of its typography — `rows` is a number, nothing to bind.
describe("the tekstareo is drawn as the field of the kampo: kind × size × state, the code role bound (Spec 011 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const drawn = async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "tekstareo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  };

  it("draws every variant of kind × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(30);
    expect(set?.children[0]?.name).toBe("kind=text, size=small, state=rest");
    expect(
      set?.children.some((child) => child.name === "kind=code, size=large, state=invalid"),
    ).toBe(true);
  });

  it("binds the code role to the text of a code variant and the body role to a text variant; the control hugs", async () => {
    const { variant } = await drawn();
    const code = variant("kind=code, size=medium, state=rest");
    const text = variant("kind=text, size=medium, state=rest");
    expect(bound(descendant(code, "text"), "fontSize")).toBe("typography/code/font-size");
    expect(bound(descendant(code, "text"), "fontFamily")).toBe("typography/code/font-family");
    expect(bound(descendant(text, "text"), "fontSize")).toBe("typography/body/1/font-size");
    const control = descendant(text, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
    expect(control?.boundVariables.minHeight).toBeUndefined();
    expect(control?.properties.layoutSizingVertical).toBe("HUG");
    expect(descendant(text, "text")?.properties.characters).toBe("Beispiel\n\n\n");
    expect(descendant(text, "label")?.properties.characters).toBe("Beschriftung");
    expect(descendant(text, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(text, "error")?.properties.characters).toBe("Fehler");
    expect(bound(descendant(text, "label"), "fontSize")).toBe("typography/label/1/font-size");
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ② (spec „dialogo – Figma", G7): the dialog is a structure of its own — variant →
// surface (a column of fixed width, bound to size.container.*) → heading, message, content
// (the reason's label and a field frame standing in for the composed tekstareo, its height bound
// to size.control.large), actions (a row at the end, two frames with a word each standing in for
// the butono). Where the reason is none, the content is hidden (visible false): a hidden child of
// an auto-layout frame takes no space in Figma, so no gap remains. The shadow of the surface is
// bound as a drop shadow field by field (Spec 014 ④: the double models setBoundVariableForEffect,
// so the run reports the shadow as bound and the mode switches it). The example
// frame „mit Hintergrund" lies in the frame Eroj beside the set and shows the default variant on
// the backdrop (color.backdrop). Test-double assumptions until measured in f10b-5: a hidden child
// takes no space in auto-layout (the double measures no visibility); width and height bound on a
// FIXED frame take the variable's value (the double resolves bound numbers).
describe("the dialogo is drawn as a dialog: surface with heading, message, reason and two actions (Spec 011 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      shadow?: { part: string; variable: string; layers: number; status: string; evidence: string };
      example?: { name: string; found: boolean; created: boolean };
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "dialogo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const dialogo = report.components.find((component) => component.set === "dialogo");
    return { double, set, variant, report, dialogo };
  };

  it("draws the six variants of size × reason, named by the plan, in one column", async () => {
    const { set, dialogo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "size=small, reason=none, state=rest",
      "size=small, reason=optional, state=rest",
      "size=small, reason=required, state=rest",
      "size=medium, reason=none, state=rest",
      "size=medium, reason=optional, state=rest",
      "size=medium, reason=required, state=rest",
    ]);
    expect(dialogo?.layout.columns).toBe(1);
    expect(dialogo?.layout.rows).toBe(6);
  });

  it("stacks heading, message, content and actions in the surface, its width bound by size", async () => {
    const { variant } = await drawn();
    const small = variant("size=small, reason=none, state=rest");
    expect(small?.children.map((child) => child.name)).toEqual(["surface"]);
    const surface = descendant(small, "surface");
    expect(surface?.properties.layoutMode).toBe("VERTICAL");
    expect(surface?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(surface?.properties.layoutSizingVertical).toBe("HUG");
    expect(surface?.children.map((child) => child.name)).toEqual([
      "heading",
      "message",
      "content",
      "actions",
    ]);
    expect(bound(surface, "width")).toBe("size/container/small");
    expect(
      bound(descendant(variant("size=medium, reason=none, state=rest"), "surface"), "width"),
    ).toBe("size/container/medium");
    expect(paintOf(surface, "fills")).toBe("color/background/raised");
    expect(paintOf(surface, "strokes")).toBe("color/border/default");
    expect(bound(surface, "strokeWeight")).toBe("border/width/default");
    expect(bound(surface, "cornerRadius")).toBe("radius/role/surface");
    expect(bound(surface, "itemSpacing")).toBe("spacing/medium");
    for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
      expect(bound(surface, side), side).toBe("spacing/large");
    }
    const heading = descendant(small, "heading");
    expect(heading?.properties.characters).toBe("Entscheidung");
    expect(bound(heading, "fontSize")).toBe("typography/headline/4/font-size");
    expect(paintOf(heading, "fills")).toBe("color/text/default");
    expect(heading?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    const message = descendant(small, "message");
    expect(message?.properties.characters).toBe("Nachricht");
    expect(bound(message, "fontSize")).toBe("typography/body/1/font-size");
    const actions = descendant(small, "actions");
    expect(actions?.properties.layoutMode).toBe("HORIZONTAL");
    expect(actions?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(bound(actions, "itemSpacing")).toBe("spacing/small");
    expect(actions?.children.map((child) => child.name)).toEqual(["action-1", "action-2"]);
    expect(actions?.children.map((action) => action.children.map((child) => child.name))).toEqual([
      ["action-label"],
      ["action-label"],
    ]);
    expect(
      actions?.children.map((action) => descendant(action, "action-label")?.properties.characters),
    ).toEqual(["Abbrechen", "Bestätigen"]);
    // The stand-ins take the border of the surface and the message's role, bound.
    expect(paintOf(actions?.children[0], "strokes")).toBe("color/border/default");
    expect(bound(descendant(actions?.children[0], "action-label"), "fontSize")).toBe(
      "typography/body/1/font-size",
    );
  });

  // Abnahme Spec 011 ② (F-5, O-8): „Bestätigen" is a butono of emphasis high, „Abbrechen" of
  // emphasis low. The last stand-in binds its fill and its word's colour to the butono's roles
  // for emphasis=high, intent=neutral, state=rest, and its radius to the butono's box radius —
  // the plan's `composed` entry, read from the butono Skemo; the first keeps the dialog's look
  // (no fill, the message's colour, the surface's border). Both in every variant and on the
  // example frame.
  it("fills the confirming action with the butono's primary roles and leaves the cancelling one as it was (F-5)", async () => {
    const { double, variant } = await drawn();
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") === "Eroj",
    );
    const example = frame?.children.find((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`);
    const roots = [
      variant("size=small, reason=none, state=rest"),
      variant("size=medium, reason=required, state=rest"),
      example,
    ];
    for (const root of roots) {
      const actions = descendant(root, "actions");
      const [cancel, confirm] = actions?.children ?? [];
      expect(confirm?.name, root?.name).toBe("action-2");
      expect(paintOf(confirm, "fills"), root?.name).toBe("color/action/primary/rest");
      expect(paintOf(descendant(confirm, "action-label"), "fills"), root?.name).toBe(
        "color/action/primary/text",
      );
      expect(bound(confirm, "cornerRadius"), root?.name).toBe("radius/role/control");
      // The confirming stand-in keeps the dialog's border, padding and the message's role.
      expect(paintOf(confirm, "strokes"), root?.name).toBe("color/border/default");
      expect(bound(confirm, "paddingLeft"), root?.name).toBe("spacing/large");
      expect(bound(descendant(confirm, "action-label"), "fontSize"), root?.name).toBe(
        "typography/body/1/font-size",
      );
      expect(cancel?.name, root?.name).toBe("action-1");
      expect(cancel?.properties.fills, root?.name).toEqual([]);
      expect(paintOf(descendant(cancel, "action-label"), "fills"), root?.name).toBe(
        "color/text/default",
      );
      expect(bound(cancel, "cornerRadius"), root?.name).toBeUndefined();
    }
  });

  it("shows the reason field with its label where a reason is asked, its height bound; hides the content where none", async () => {
    const { variant } = await drawn();
    for (const reason of ["optional", "required"]) {
      const asked = variant(`size=small, reason=${reason}, state=rest`);
      const content = descendant(asked, "content");
      expect(content?.properties.visible, reason).not.toBe(false);
      expect(content?.properties.layoutMode, reason).toBe("VERTICAL");
      expect(bound(content, "itemSpacing"), reason).toBe("spacing/medium");
      expect(
        content?.children.map((child) => child.name),
        reason,
      ).toEqual(["reason-label", "reason-field", "reason-help"]);
      expect(descendant(asked, "reason-label")?.properties.characters, reason).toBe("Begründung");
      const field = descendant(asked, "reason-field");
      expect(bound(field, "height"), reason).toBe("size/control/large");
      expect(field?.properties.layoutSizingVertical, reason).toBe("FIXED");
      expect(paintOf(field, "strokes"), reason).toBe("color/border/default");
      expect(bound(field, "strokeWeight"), reason).toBe("border/width/default");
    }
    const none = descendant(variant("size=medium, reason=none, state=rest"), "content");
    expect(none?.properties.visible).toBe(false);
    expect(none?.children.map((child) => child.name)).toEqual([
      "reason-label",
      "reason-field",
      "reason-help",
    ]);
    expect(bound(descendant(none, "reason-field"), "height")).toBeUndefined();
  });

  it("writes the modal shadow as a drop shadow of the surface from the plan's layers, and reports that the double cannot bind it", async () => {
    const { variant, dialogo } = await drawn();
    const surface = descendant(variant("size=small, reason=none, state=rest"), "surface");
    const effects = surface?.properties.effects as Record<string, unknown>[];
    expect(effects).toHaveLength(2);
    expect(effects[0]).toMatchObject({
      type: "DROP_SHADOW",
      offset: { x: 0, y: 12 },
      radius: 32,
      spread: 0,
      visible: true,
    });
    expect(effects[0]?.color).toMatchObject({ r: expect.any(Number), a: expect.any(Number) });
    expect(effects[1]).toMatchObject({ type: "DROP_SHADOW", radius: 8 });
    expect(dialogo?.shadow).toMatchObject({
      part: "surface",
      variable: "elevation/shadow/modal",
      layers: 2,
      status: "bound",
    });
    expect(dialogo?.shadow?.evidence).toContain("setBoundVariableForEffect");
  });

  it('draws the example frame „mit Hintergrund" beside the set in the frame Eroj: the default variant on the backdrop', async () => {
    const { double, report, dialogo } = await drawn();
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") === "Eroj",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const example = frame?.children.find((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`);
    expect(example?.type).toBe("FRAME");
    expect(names.indexOf(`dialogo – ${BACKDROP_EXAMPLE}`)).toBe(names.indexOf("dialogo") + 1);
    expect(example?.getSharedPluginData("fundamento", "example")).toBe("dialogo");
    expect(paintOf(example, "fills")).toBe("color/backdrop");
    expect(example?.properties.layoutMode).toBe("HORIZONTAL");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    expect(example?.properties.layoutPositioning).toBe("AUTO");
    expect(example?.children.map((child) => child.name)).toEqual(["surface"]);
    const surface = descendant(example, "surface");
    expect(bound(surface, "width")).toBe("size/container/small");
    expect(descendant(example, "heading")?.properties.characters).toBe("Entscheidung");
    // A text outside a component can be connected to no property.
    expect(descendant(example, "heading")?.properties.componentPropertyReferences).toBeUndefined();
    expect(descendant(example, "content")?.properties.visible).toBe(false);
    expect(dialogo?.example).toEqual({
      name: `dialogo – ${BACKDROP_EXAMPLE}`,
      found: false,
      created: true,
    });
    expect(
      report.components.find((component) => component.set === "butono")?.example,
    ).toBeUndefined();
    // The second run finds it and makes no second one.
    const again = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    expect(again.components.find((component) => component.set === "dialogo")?.example).toEqual({
      name: `dialogo – ${BACKDROP_EXAMPLE}`,
      found: true,
      created: false,
    });
    expect(
      frame?.children.filter((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, and warns of nothing for the dialogo", async () => {
    const { dialogo, report } = await drawn();
    expect(dialogo?.layout.zero).toEqual([]);
    expect(dialogo?.layout.smaller).toEqual([]);
    expect(dialogo?.layout.unplaced).toEqual([]);
    expect(dialogo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("dialogo"))).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("tekstareo"))).toEqual([]);
    // The parts of the first variant in the report: the surface at size.container.small.
    expect(dialogo?.layout.held.rest.surface).toMatchObject({ width: 640 });
    expect(dialogo?.layout.held.rest.heading).toBeDefined();
    expect(dialogo?.layout.held.rest.actions).toBeDefined();
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ③ (spec „insigno", G2; plan ③ D-14): the badge is a structure of its own — variant →
// control (the pill: a row with fill, border, radius, minimum height and inline padding bound) →
// text (the label property, in the role of the text part). No focus ring: static text has no
// state but rest, and no part of the hidden slot description is drawn.
describe("the insigno is drawn as a badge: the pill with its text (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "insigno");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const insigno = report.components.find((component) => component.set === "insigno");
    return { double, set, variant, report, insigno };
  };

  it("draws ten variants of intent × size in one column, each the pill directly under the variant, the text as the label property", async () => {
    const { set, variant, insigno } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=neutral, size=small, state=rest",
      "intent=neutral, size=medium, state=rest",
      "intent=info, size=small, state=rest",
      "intent=info, size=medium, state=rest",
      "intent=success, size=small, state=rest",
      "intent=success, size=medium, state=rest",
      "intent=warning, size=small, state=rest",
      "intent=warning, size=medium, state=rest",
      "intent=danger, size=small, state=rest",
      "intent=danger, size=medium, state=rest",
    ]);
    expect(insigno?.layout.columns).toBe(1);
    expect(insigno?.layout.rows).toBe(10);
    const small = variant("intent=neutral, size=small, state=rest");
    expect(small?.children.map((child) => child.name)).toEqual(["control"]);
    expect(descendant(small, "focus-ring")).toBeUndefined();
    expect(descendant(small, "description")).toBeUndefined();
    const control = descendant(small, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    // The border lies in the size, as on the web (box-sizing border-box).
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paintOf(control, "fills")).toBe("color/background/sunken");
    expect(paintOf(control, "strokes")).toBe("color/border/default");
    expect(bound(control, "strokeWeight")).toBe("border/width/default");
    expect(bound(control, "minHeight")).toBe("size/icon/medium");
    expect(bound(control, "paddingLeft")).toBe("spacing/xsmall");
    expect(bound(control, "paddingRight")).toBe("spacing/xsmall");
    expect(bound(control, "cornerRadius")).toBe("radius/role/pill");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
    const text = descendant(small, "text");
    expect(text?.properties.characters).toBe("Status");
    expect(text?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(paintOf(text, "fills")).toBe("color/text/subtle");
    expect(bound(text, "fontSize")).toBe("typography/label/2/font-size");
    expect(bound(text, "fontFamily")).toBe("typography/label/2/font-family");
    const danger = variant("intent=danger, size=medium, state=rest");
    expect(paintOf(descendant(danger, "control"), "fills")).toBe("color/status/danger/subtle");
    expect(paintOf(descendant(danger, "text"), "fills")).toBe("color/status/danger/text");
    expect(bound(descendant(danger, "control"), "minHeight")).toBe("size/icon/large");
    expect(bound(descendant(danger, "control"), "paddingLeft")).toBe("spacing/small");
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, insigno, report } = await drawn();
    expect(insigno?.layout.zero).toEqual([]);
    expect(insigno?.layout.smaller).toEqual([]);
    expect(insigno?.layout.unplaced).toEqual([]);
    expect(insigno?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("insigno"))).toEqual([]);
    expect(insigno?.layout.held.rest.control).toBeDefined();
    expect(insigno?.layout.held.rest.text).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ③ (spec „avizo", G2, G4; plan ③ D-14): the notice is a structure of its own — variant
// → control (a row: surface fill, radius, the padding on every side; its stroke at the left — the
// inline start of the Figma file, which knows no writing direction — is the accent: colour bound,
// the left weight bound to accent.width, the other three sides 0) → texts (a column: heading,
// the message as the label property, details, the actions placeholder with its gap) and the
// dismiss frame (a square of dismiss.size) at the end. dismissible is a BOOLEAN property of the
// set that shows the dismiss frame; off by default, as the Skemo says. Test-double assumptions
// until measured in f10b-5: a stroke weight per side is bindable (strokeLeftWeight), and a
// BOOLEAN property connected to visible shows and hides the layer in an instance.
describe("the avizo is drawn as a notice: surface with accent, heading, message, details, actions and dismiss (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "avizo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const avizo = report.components.find((component) => component.set === "avizo");
    return { double, set, variant, report, avizo };
  };

  it("draws four variants by intent, the control a row with the accent at its start, the texts column and the dismiss frame", async () => {
    const { set, variant, avizo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=info, state=rest",
      "intent=success, state=rest",
      "intent=warning, state=rest",
      "intent=danger, state=rest",
    ]);
    expect(avizo?.layout.columns).toBe(1);
    expect(avizo?.layout.rows).toBe(4);
    const info = variant("intent=info, state=rest");
    expect(info?.children.map((child) => child.name)).toEqual(["control"]);
    const control = descendant(info, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paintOf(control, "fills")).toBe("color/status/info/weak");
    expect(paintOf(control, "strokes")).toBe("color/status/info/border");
    expect(bound(control, "strokeLeftWeight")).toBe("border/width/strong");
    expect(bound(control, "strokeWeight")).toBeUndefined();
    expect(control?.properties.strokeWeight).toBe(0);
    for (const side of ["strokeTopWeight", "strokeRightWeight", "strokeBottomWeight"]) {
      expect(control?.properties[side], side).toBe(0);
    }
    expect(bound(control, "cornerRadius")).toBe("radius/role/surface");
    for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
      expect(bound(control, side), side).toBe("spacing/medium");
    }
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
    // Spec 014 ②: the icon of the intent stands first.
    expect(control?.children.map((child) => child.name)).toEqual(["icon", "texts", "dismiss"]);
    const texts = descendant(info, "texts");
    expect(texts?.properties.layoutMode).toBe("VERTICAL");
    expect(bound(texts, "itemSpacing")).toBe("spacing/small");
    expect(texts?.children.map((child) => child.name)).toEqual([
      "heading",
      "message",
      "details",
      "actions",
    ]);
    const heading = descendant(info, "heading");
    expect(heading?.properties.characters).toBe("Überschrift");
    expect(bound(heading, "fontSize")).toBe("typography/label/1/font-size");
    expect(paintOf(heading, "fills")).toBe("color/text/default");
    const message = descendant(info, "message");
    expect(message?.properties.characters).toBe("Meldung");
    expect(message?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(bound(message, "fontSize")).toBe("typography/body/1/font-size");
    expect(paintOf(message, "fills")).toBe("color/text/default");
    const details = descendant(info, "details");
    expect(details?.properties.characters).toBe("Einzelheit");
    expect(bound(details, "fontSize")).toBe("typography/caption/font-size");
    const actions = descendant(info, "actions");
    expect(actions?.properties.layoutMode).toBe("HORIZONTAL");
    expect(bound(actions, "itemSpacing")).toBe("spacing/small");
    expect(actions?.properties.visible).not.toBe(false);
    expect(actions?.children).toEqual([]);
    const dismiss = descendant(info, "dismiss");
    expect(dismiss?.properties.layoutMode).toBe("NONE");
    expect(bound(dismiss, "width")).toBe("size/control/small");
    expect(bound(dismiss, "height")).toBe("size/control/small");
    expect(dismiss?.properties.fills).toEqual([]);
    expect(dismiss?.properties.visible).toBe(false);
    expect(dismiss?.properties.componentPropertyReferences).toEqual({
      visible: expect.stringMatching(/^dismissible#/),
    });
    const danger = variant("intent=danger, state=rest");
    expect(paintOf(descendant(danger, "control"), "fills")).toBe("color/status/danger/weak");
    expect(paintOf(descendant(danger, "control"), "strokes")).toBe("color/status/danger/border");
  });

  it("declares dismissible as a BOOLEAN property of the set beside the label, default false, once over two runs", async () => {
    const { double, set } = await drawn();
    const definitions = () => (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const keys = Object.keys(definitions()).filter((key) => key.startsWith("dismissible#"));
    expect(keys).toHaveLength(1);
    expect(definitions()[keys[0] ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: false });
    expect(Object.keys(definitions())).toHaveLength(2);
    for (const variant of set?.children ?? []) {
      expect(
        descendant(variant, "dismiss")?.properties.componentPropertyReferences,
        variant.name,
      ).toEqual({ visible: keys[0] });
    }
    await run(double, source);
    expect(Object.keys(definitions())).toHaveLength(2);
    // No other set declares it.
    const butono = pageNodes(double).find((child) => child.name === "butono");
    expect(
      Object.keys((butono?.properties.componentPropertyDefinitions ?? {}) as Definitions),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, avizo, report } = await drawn();
    expect(avizo?.layout.zero).toEqual([]);
    expect(avizo?.layout.smaller).toEqual([]);
    expect(avizo?.layout.unplaced).toEqual([]);
    expect(avizo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("avizo"))).toEqual([]);
    expect(avizo?.layout.held.rest.control).toBeDefined();
    expect(avizo?.layout.held.rest.message).toBeDefined();
    expect(avizo?.layout.held.rest.dismiss).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });

  // F-4 of the acceptance of Spec 011 ③ (measured in Figma, 2026-10-16): the notice stood with a
  // lot of empty space below its texts — a fixed height, where every frame of it says HUG. The
  // cause is the empty actions placeholder: an auto-layout frame without children keeps its size,
  // hug or not, so the 100 × 100 createFrame gives a frame stayed, and the column took it in. The
  // plugin makes an empty placeholder as small as the tool allows (0.01) before it writes its
  // layout, so the height of every variant follows its texts and padding — with the dismiss frame
  // shown or hidden — and the placeholder still hugs what a designer drops into it.
  it("hugs its height in every variant (F-4): the empty actions placeholder keeps no default size, the variant is as high as its texts and padding", async () => {
    const { double, set } = await drawn();
    const box = (node: DoubleNode | undefined) =>
      node as unknown as { width: number; height: number };
    const value = (node: DoubleNode | undefined, name: string) =>
      Number(
        double.variables
          .find((variable) => variable.name === name)
          ?.resolveForConsumer(node as DoubleNode).value,
      );
    expect(set?.children).toHaveLength(4);
    for (const variant of set?.children ?? []) {
      const control = descendant(variant, "control");
      const texts = descendant(variant, "texts");
      const actions = descendant(variant, "actions");
      const dismiss = descendant(variant, "dismiss");
      for (const frame of [variant, control, texts, actions]) {
        expect(frame?.properties.layoutSizingVertical, `${variant.name} ${frame?.name}`).toBe(
          "HUG",
        );
      }
      expect(actions?.properties.visible, variant.name).not.toBe(false);
      for (const shown of [false, true]) {
        if (dismiss !== undefined) (dismiss as unknown as { visible: boolean }).visible = shown;
        const where = `${variant.name}, dismiss ${shown ? "shown" : "hidden"}`;
        // The empty placeholder is no larger than the tool's smallest size.
        expect(box(actions).width, where).toBeLessThanOrEqual(0.01);
        expect(box(actions).height, where).toBeLessThanOrEqual(0.01);
        // The column is its three texts, the gaps between its four children and the placeholder.
        const words = ["heading", "message", "details"].map(
          (name) => box(descendant(variant, name)).height,
        );
        const gap = value(texts, "spacing/small");
        expect(gap).toBeGreaterThan(0);
        expect(box(texts).height, where).toBeCloseTo(
          words.reduce((sum, each) => sum + each, 0) + 3 * gap + box(actions).height,
          5,
        );
        // The control is the column and its padding; the variant is the control.
        const padding = value(control, "spacing/medium");
        expect(padding).toBeGreaterThan(0);
        expect(box(control).height, where).toBeCloseTo(box(texts).height + 2 * padding, 5);
        expect(box(variant).height, where).toBe(box(control).height);
      }
    }
  });
});

// Spec 011 ③ (spec „plenstato", G2, G4; plan ③ D-14): the state is a structure of its own —
// variant → control (a column, centred: the border's colour and width bound, the stroke dashed
// where the plan says dashed — a dash pattern written as a number, since Figma binds none — and
// the bound paint invisible where it says none) → indicator (the arc of the web, imported once;
// its size bound, the vector's stroke bound to indicator.color, the frame invisible where the
// colour is none), text (the label property) and the actions placeholder (invisible where the
// constraint forbids actions: while loading). The motion part binds nothing in the file: Figma
// has no duration to bind, as for the butono. Test-double assumptions until measured in f10b-5:
// an imported SVG path with a stroke arrives as a vector with that stroke; a paint with
// visible false shows nothing and keeps its binding.
describe("the plenstato is drawn as a state: the column with the arc, the text and the actions; dashed when empty (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "plenstato");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const plenstato = report.components.find((component) => component.set === "plenstato");
    return { double, set, variant, report, plenstato };
  };

  it("draws two variants by kind: the border dashed where empty, its paint invisible where loading", async () => {
    const { set, variant, plenstato } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "kind=loading, state=rest",
      "kind=empty, state=rest",
    ]);
    expect(plenstato?.layout.columns).toBe(1);
    expect(plenstato?.layout.rows).toBe(2);
    const loading = descendant(variant("kind=loading, state=rest"), "control");
    const empty = descendant(variant("kind=empty, state=rest"), "control");
    for (const [control, kind] of [
      [loading, "loading"],
      [empty, "empty"],
    ] as const) {
      expect(control?.properties.layoutMode, kind).toBe("VERTICAL");
      expect(control?.properties.primaryAxisAlignItems, kind).toBe("CENTER");
      expect(control?.properties.counterAxisAlignItems, kind).toBe("CENTER");
      expect(control?.properties.strokesIncludedInLayout, kind).toBe(true);
      expect(control?.properties.fills, kind).toEqual([]);
      expect(paints(control, "strokes")[0]?.boundVariables?.color?.name, kind).toBe(
        "color/border/subtle",
      );
      expect(bound(control, "strokeWeight"), kind).toBe("border/width/default");
      expect(bound(control, "cornerRadius"), kind).toBe("radius/role/surface");
      for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
        expect(bound(control, side), `${kind} ${side}`).toBe("spacing/large");
      }
      expect(bound(control, "itemSpacing"), kind).toBe("spacing/small");
      expect(
        control?.children.map((child) => child.name),
        kind,
      ).toEqual(["indicator", "text", "actions"]);
    }
    // The stroke: none while loading — the paint stays bound and is not shown; dashed when empty.
    expect(paints(loading, "strokes")[0]?.visible).toBe(false);
    expect(loading?.properties.dashPattern).toEqual([]);
    expect(paints(empty, "strokes")[0]?.visible).toBe(true);
    const planned = repoPlan.components
      .find((component) => component.set === "plenstato")
      ?.variants.find((entry) => entry.props.kind === "empty")?.stroke;
    expect(empty?.properties.dashPattern).toEqual(planned?.dashPattern);
    expect(empty?.properties.dashPattern).toHaveLength(2);
  });

  it("shows the arc with its colour bound while loading and hides it when empty; hides the actions while loading", async () => {
    const { variant } = await drawn();
    const loading = variant("kind=loading, state=rest");
    const empty = variant("kind=empty, state=rest");
    for (const [node, kind] of [
      [loading, "loading"],
      [empty, "empty"],
    ] as const) {
      const indicator = descendant(node, "indicator");
      expect(indicator?.properties.layoutMode, kind).toBe("NONE");
      expect(bound(indicator, "width"), kind).toBe("size/icon/small");
      expect(bound(indicator, "height"), kind).toBe("size/icon/small");
      expect(indicator?.properties.fills, kind).toEqual([]);
      const mark = descendant(node, "mark");
      expect(mark?.type, kind).toBe("VECTOR");
      expect(mark?.properties.fills, kind).toEqual([]);
      // The arc's stroke width is the sign's own (the SVG's), carried with the sign.
      expect(mark?.properties.strokeWeight, kind).toBe(2);
      const text = descendant(node, "text");
      expect(text?.properties.characters, kind).toBe("Zustand");
      expect(text?.properties.componentPropertyReferences, kind).toMatchObject({
        characters: expect.stringMatching(/^label/),
      });
      expect(paints(text, "fills")[0]?.boundVariables?.color?.name, kind).toBe("color/text/muted");
      expect(bound(text, "fontSize"), kind).toBe("typography/body/1/font-size");
      const actions = descendant(node, "actions");
      expect(actions?.properties.layoutMode, kind).toBe("HORIZONTAL");
      expect(bound(actions, "itemSpacing"), kind).toBe("spacing/small");
      expect(actions?.children, kind).toEqual([]);
    }
    expect(descendant(loading, "indicator")?.properties.visible).toBe(true);
    expect(paints(descendant(loading, "mark"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "color/status/info/basic",
    );
    expect(descendant(loading, "actions")?.properties.visible).toBe(false);
    expect(descendant(empty, "indicator")?.properties.visible).toBe(false);
    expect(paints(descendant(empty, "mark"), "strokes")).toEqual([]);
    expect(descendant(empty, "actions")?.properties.visible).toBe(true);
    // Nothing of the motion part is bound anywhere in the variant.
    const names = (node: DoubleNode | undefined): string[] =>
      node === undefined
        ? []
        : [
            ...Object.values(node.boundVariables).map((variable) => variable.name),
            ...node.children.flatMap(names),
          ];
    expect(names(loading).some((name) => name.startsWith("motion/"))).toBe(false);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, plenstato, report } = await drawn();
    expect(plenstato?.layout.zero).toEqual([]);
    expect(plenstato?.layout.smaller).toEqual([]);
    expect(plenstato?.layout.unplaced).toEqual([]);
    expect(plenstato?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("plenstato"))).toEqual([]);
    expect(plenstato?.layout.held.rest.control).toBeDefined();
    expect(plenstato?.layout.held.rest.indicator).toBeDefined();
    expect(plenstato?.layout.held.rest.text).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ④ (spec „mezurilo", G2, G4; plan ④ D-14): the meter is a structure of its own —
// variant → control (a column, the gap bound to box.gap; its width written from the wider of the
// two texts, measured — a set has no container to fill, and the meter takes the width of its
// container, Uzo size container) → label (the label property), track (its fill, radius and height
// as a minimum; it fills the column's width: FILL along the inline axis) holding the fill frame
// (its colour by intent, its radius, as high as the track, its width the share of the track: 66
// of 0 … 100, the Vitrino's value example, resized to the number since Figma binds no share), and
// the value text. The unknown value is the example frame beside the set, on the Vitrino's ground
// like the set: the track's stroke bound to unknown.color and unknown.width with the dash pattern
// of the plan, no fill frame, the text „nicht geprüft" in the value text's role (F-6).
// Acceptance of Spec 011 ④ (F-3): an empty auto-layout frame keeps its size, hug or not (③ F-4) —
// the fill frame stood at the 100 × 100 of createFrame and the track hugged it, a circle; the
// example's empty track stood at 100 × 100 too, a square. Measured against the double, which
// models that size, FILL, and resize.
describe("the mezurilo is drawn as a meter: label, track with the fill at 66 %, value text; the unknown example dashed (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Box = { width: number; height: number };
  const box = (node: DoubleNode | undefined): Box => {
    const { width, height } = (node ?? {}) as unknown as Box;
    return { width, height };
  };
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: { name: string; found: boolean; created: boolean };
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "mezurilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const mezurilo = report.components.find((component) => component.set === "mezurilo");
    return { double, set, variant, report, mezurilo };
  };
  const planned = repoPlan.components.find((component) => component.set === "mezurilo");

  it("draws four variants by intent: the column with label, track and value text, the fill's colour by intent", async () => {
    const { set, variant, mezurilo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=neutral, state=rest",
      "intent=success, state=rest",
      "intent=warning, state=rest",
      "intent=danger, state=rest",
    ]);
    expect(mezurilo?.layout.columns).toBe(1);
    expect(mezurilo?.layout.rows).toBe(4);
    const neutral = variant("intent=neutral, state=rest");
    const control = descendant(neutral, "control");
    expect(control?.properties.layoutMode).toBe("VERTICAL");
    expect(control?.properties.fills).toEqual([]);
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
    expect(control?.children.map((child) => child.name)).toEqual(["label", "track", "value-text"]);
    const label = descendant(neutral, "label");
    expect(label?.properties.characters).toBe("Messwert");
    expect(label?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(paints(label, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(label, "fontSize")).toBe("typography/label/1/font-size");
    const track = descendant(neutral, "track");
    expect(track?.properties.layoutMode).toBe("HORIZONTAL");
    expect(track?.properties.clipsContent).toBe(true);
    expect(paints(track, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    // In the set the track has no stroke: the unknown value is the example's.
    expect(track?.properties.strokes).toEqual([]);
    expect(track?.properties.dashPattern).toEqual([]);
    expect(bound(track, "cornerRadius")).toBe("radius/role/pill");
    expect(bound(track, "minHeight")).toBe("spacing/medium");
    expect(track?.children.map((child) => child.name)).toEqual(["fill"]);
    const fill = descendant(neutral, "fill");
    expect(paints(fill, "fills")[0]?.boundVariables?.color?.name).toBe("color/border/strong");
    expect(bound(fill, "cornerRadius")).toBe("radius/role/pill");
    expect(bound(fill, "minHeight")).toBe("spacing/medium");
    const valueText = descendant(neutral, "value-text");
    expect(valueText?.properties.characters).toBe("66 % von 3 prüfbaren");
    expect(paints(valueText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/subtle");
    expect(bound(valueText, "fontSize")).toBe("typography/label/2/font-size");
    for (const [intent, token] of [
      ["success", "color/status/success/border"],
      ["warning", "color/status/warning/border"],
      ["danger", "color/status/danger/border"],
    ] as const) {
      const colour = descendant(variant(`intent=${intent}, state=rest`), "fill");
      expect(paints(colour, "fills")[0]?.boundVariables?.color?.name, intent).toBe(token);
    }
  });

  it("gives the column the width of its wider text, the track fills it, and the fill is 66 % of the track, as high as the track (F-3)", async () => {
    const { variant } = await drawn();
    const trackHeight = Number.parseFloat(planned?.variants[0]?.geometry?.["track.height"] ?? "");
    expect(trackHeight).toBeGreaterThan(0);
    for (const intent of ["neutral", "success", "warning", "danger"]) {
      const node = variant(`intent=${intent}, state=rest`);
      const control = descendant(node, "control");
      const label = descendant(node, "label");
      const valueText = descendant(node, "value-text");
      const track = descendant(node, "track");
      const fill = descendant(node, "fill");
      const widest = Math.max(box(label).width, box(valueText).width);
      expect(widest, intent).toBeGreaterThan(0);
      // The column carries the written width (a set has no container to fill); the variant hugs.
      expect(control?.properties.layoutSizingHorizontal, intent).toBe("FIXED");
      expect(control?.properties.layoutSizingVertical, intent).toBe("HUG");
      expect(box(control).width, intent).toBe(widest);
      expect(node?.properties.layoutSizingHorizontal, intent).toBe("HUG");
      expect(box(node).width, intent).toBe(widest);
      // The track fills the column's inline axis and is as high as track.height, no 100 × 100.
      expect(track?.properties.layoutSizingHorizontal, intent).toBe("FILL");
      expect(track?.properties.layoutSizingVertical, intent).toBe("HUG");
      expect(track?.properties.minWidth, intent).toBeUndefined();
      expect(box(track).width, intent).toBe(widest);
      expect(box(track).height, intent).toBe(trackHeight);
      // The fill is the share of the track, measured from the track, and as high as the track:
      // an empty auto-layout frame keeps its size, so it is fixed and resized, not hugging.
      expect(planned?.meter?.share).toBe(0.66);
      expect(fill?.properties.layoutSizingHorizontal, intent).toBe("FIXED");
      expect(fill?.properties.layoutSizingVertical, intent).toBe("FIXED");
      expect(fill?.properties.minWidth, intent).toBeUndefined();
      expect(box(fill).width, intent).toBe(0.66 * widest);
      expect(box(fill).height, intent).toBe(trackHeight);
      expect(box(fill).height, intent).toBe(box(track).height);
      expect(bound(fill, "minHeight"), intent).toBe("spacing/medium");
    }
  });

  it('places the example „unbekannt" beside the set: the track dashed in the unknown stroke, no fill, the text nicht geprüft', async () => {
    const { double, mezurilo, set } = await drawn();
    const example = pageNodes(double).find((child) => child.name === "mezurilo – unbekannt");
    expect(example).toBeDefined();
    expect(example?.getSharedPluginData("fundamento", "example")).toBe("mezurilo");
    expect(mezurilo?.example).toEqual({
      name: "mezurilo – unbekannt",
      found: false,
      created: true,
    });
    // Right after the set in the frame Eroj (F-8), in its flow.
    const frame = set?.parent;
    expect(frame?.getSharedPluginData("fundamento", "frame")).toBe("Eroj");
    expect(frame?.children.indexOf(example as DoubleNode)).toBe(
      (frame?.children.indexOf(set as DoubleNode) ?? -2) + 1,
    );
    expect(example?.properties.layoutPositioning).toBe("AUTO");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    // No backdrop, but the ground of the set (F-6): the example is a picture of the Ero like a
    // variant, so its texts stand on the Vitrino's canvas they are paired with — not on whatever
    // the section shows in the mode it is in (in a dark scheme: light text on a white section).
    expect(mezurilo).toBeDefined();
    const ground = paints(example, "fills");
    expect(ground).toHaveLength(1);
    expect(ground[0]?.boundVariables?.color?.name).toBe("color/background/canvas");
    expect((ground[0] as { opacity?: number }).opacity).toBe(1);
    expect(ground[0]?.visible).toBe(true);
    const track = descendant(example, "track");
    expect(paints(track, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/default");
    expect(paints(track, "strokes")[0]?.visible).toBe(true);
    expect(bound(track, "strokeWeight")).toBe("border/width/default");
    expect(track?.properties.dashPattern).toEqual(planned?.variants[0]?.stroke?.dashPattern);
    expect(track?.properties.dashPattern).toHaveLength(2);
    expect(paints(track, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    expect(track?.children).toEqual([]);
    expect(descendant(example, "fill")).toBeUndefined();
    expect(descendant(example, "label")?.properties.characters).toBe("Messwert");
    const valueText = descendant(example, "value-text");
    expect(valueText?.properties.characters).toBe("nicht geprüft");
    // F-6: the value text of the example binds the role of the set's value text, color.text.subtle
    // from the Skemo's part value-text, with the paint's alpha as the token resolves (1) and no
    // opacity of its own — no disabled look, not the border colour of the unknown part.
    const setValueText = descendant(set?.children[0], "value-text");
    const role = paints(valueText, "fills");
    expect(role).toHaveLength(1);
    expect(role[0]?.boundVariables?.color?.name).toBe("color/text/subtle");
    expect(role[0]?.boundVariables?.color?.name).toBe(
      paints(setValueText, "fills")[0]?.boundVariables?.color?.name,
    );
    expect((role[0] as { opacity?: number }).opacity).toBe(1);
    expect(role[0]?.visible).toBe(true);
    expect(valueText?.properties.opacity).toBe(1);
    expect(valueText?.properties.effects).toEqual([]);
    expect(bound(valueText, "fontSize")).toBe("typography/label/2/font-size");
    expect(valueText?.properties.fontName).toEqual(setValueText?.properties.fontName);
    // The column and the track are as wide as in the set: the wider text, here the label; the
    // empty track keeps the height of track.height, not the 100 × 100 of createFrame (F-3).
    const widest = Math.max(box(descendant(example, "label")).width, box(valueText).width);
    const control = descendant(example, "control");
    expect(control?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(box(control).width).toBe(widest);
    expect(track?.properties.layoutSizingHorizontal).toBe("FILL");
    expect(track?.properties.layoutSizingVertical).toBe("HUG");
    expect(track?.properties.minWidth).toBeUndefined();
    expect(box(track).width).toBe(widest);
    expect(box(track).height).toBe(
      Number.parseFloat(planned?.variants[0]?.geometry?.["track.height"] ?? ""),
    );
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, mezurilo, report } = await drawn();
    expect(mezurilo?.layout.zero).toEqual([]);
    expect(mezurilo?.layout.smaller).toEqual([]);
    expect(mezurilo?.layout.unplaced).toEqual([]);
    expect(mezurilo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("mezurilo"))).toEqual([]);
    expect(mezurilo?.layout.held.rest.control).toBeDefined();
    expect(mezurilo?.layout.held.rest.track).toBeDefined();
    expect(mezurilo?.layout.held.rest.fill).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ④ (spec „tabelo", G2, G4; plan ④ D-14): the table is a structure of its own — variant
// (a column) → caption (the label property, shown by the BOOLEAN property „caption": Figma shows
// a layer when its property is true, so the Skemo's caption-hidden false is the caption's true),
// region (border, radius, clipping) → head (its fill, the bottom border) and three rows (the
// bottom border), each a row of three cells (inline padding and minimum height by density); every
// cell of a column at least as wide as the widest of the column, written from what the tool
// measured (Regel 0: the tool computes the layout, the plugin binds no width). The first head
// cell holds the sort button: focus-ring → focus-gap → sort (fill by state, radius) with the head
// text and the chevron of the select (sort-indicator, its size bound, the vector's fill bound to
// sort-indicator.color). The numeric column aligns its texts at the end; tabular figures are no
// property of a Figma text (noted, not drawn). The words are the Vitrino's table.
describe("the tabelo is drawn as a table: caption, region with head and three rows, the sort button in the first head cell (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Box = { width: number; height: number };
  const box = (node: DoubleNode | undefined): Box => {
    const { width, height } = (node ?? {}) as unknown as Box;
    return { width, height };
  };
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "tabelo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const tabelo = report.components.find((component) => component.set === "tabelo");
    return { double, set, variant, report, tabelo };
  };
  const REST = "density=comfortable, state=rest";
  const FOCUS = "density=comfortable, state=focus";

  it("draws six variants of density × state: the caption above the region with head and three rows of three cells", async () => {
    const { set, variant, tabelo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "density=comfortable, state=rest",
      "density=comfortable, state=hover",
      "density=comfortable, state=focus",
      "density=compact, state=rest",
      "density=compact, state=hover",
      "density=compact, state=focus",
    ]);
    expect(tabelo?.layout.columns).toBe(3);
    expect(tabelo?.layout.rows).toBe(2);
    const rest = variant(REST);
    expect(rest?.properties.layoutMode).toBe("VERTICAL");
    expect(rest?.children.map((child) => child.name)).toEqual(["caption", "region"]);
    const caption = descendant(rest, "caption");
    expect(caption?.properties.characters).toBe("Beschriftung");
    expect(caption?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
      visible: expect.stringMatching(/^caption#/),
    });
    expect(caption?.properties.visible).toBe(true);
    expect(paints(caption, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(caption, "fontSize")).toBe("typography/label/1/font-size");
    const region = descendant(rest, "region");
    expect(region?.properties.layoutMode).toBe("VERTICAL");
    expect(region?.properties.clipsContent).toBe(true);
    expect(region?.properties.fills).toEqual([]);
    expect(paints(region, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/subtle");
    expect(bound(region, "strokeWeight")).toBe("border/width/default");
    expect(bound(region, "cornerRadius")).toBe("radius/role/surface");
    expect(region?.children.map((child) => child.name)).toEqual([
      "head",
      "row-1",
      "row-2",
      "row-3",
    ]);
    const head = descendant(rest, "head");
    expect(head?.properties.layoutMode).toBe("HORIZONTAL");
    expect(paints(head, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    expect(paints(head, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/subtle");
    expect(bound(head, "strokeBottomWeight")).toBe("border/width/default");
    expect(head?.properties.strokeTopWeight).toBe(0);
    expect(head?.children.map((child) => child.name)).toEqual(["head-1", "head-2", "head-3"]);
    for (const row of [1, 2, 3]) {
      const node = descendant(rest, `row-${row}`);
      expect(node?.properties.layoutMode, `row-${row}`).toBe("HORIZONTAL");
      expect(node?.properties.fills, `row-${row}`).toEqual([]);
      expect(paints(node, "strokes")[0]?.boundVariables?.color?.name, `row-${row}`).toBe(
        "color/border/subtle",
      );
      expect(bound(node, "strokeBottomWeight"), `row-${row}`).toBe("border/width/default");
      expect(
        node?.children.map((child) => child.name),
        `row-${row}`,
      ).toEqual([`cell-${row}-1`, `cell-${row}-2`, `cell-${row}-3`]);
    }
    // The words of the Vitrino's table: head, row headers, text and numeric cells.
    expect(descendant(rest, "sort-text")?.properties.characters).toBe("Name");
    expect(descendant(rest, "head-text-2")?.properties.characters).toBe("Status");
    expect(descendant(rest, "head-text-3")?.properties.characters).toBe("Anzahl");
    expect(descendant(rest, "row-header-text-1")?.properties.characters).toBe("Barrierefreiheit");
    expect(descendant(rest, "cell-text-2-2")?.properties.characters).toBe("Entwurf");
    expect(descendant(rest, "cell-text-3-3")?.properties.characters).toBe("1");
    // Head texts in head.color and head.typography; row headers in row-header.typography; cells
    // in cell.color and cell.typography.
    const headText = descendant(rest, "head-text-2");
    expect(paints(headText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(headText, "fontSize")).toBe("typography/label/1/font-size");
    const rowHeader = descendant(rest, "row-header-text-2");
    expect(paints(rowHeader, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(rowHeader, "fontSize")).toBe("typography/label/1/font-size");
    const cellText = descendant(rest, "cell-text-2-2");
    expect(bound(cellText, "fontSize")).toBe("typography/body/2/font-size");
    // The numeric column at the end: the cell aligns at the end, the text to the right.
    for (const name of ["head-text-3", "cell-text-1-3", "cell-text-3-3"]) {
      expect(descendant(rest, name)?.properties.textAlignHorizontal, name).toBe("RIGHT");
    }
    expect(descendant(rest, "cell-text-1-2")?.properties.textAlignHorizontal).not.toBe("RIGHT");
    expect(descendant(rest, "cell-1-3")?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(descendant(rest, "cell-1-2")?.properties.primaryAxisAlignItems).toBe("MIN");
  });

  it("binds padding and minimum height of every cell by density, and gives every cell of a column the width of its widest", async () => {
    const { variant } = await drawn();
    const cells = (node: DoubleNode | undefined, column: number) =>
      [`head-${column}`, `cell-1-${column}`, `cell-2-${column}`, `cell-3-${column}`].map((name) =>
        descendant(node, name),
      );
    for (const [name, padding, height] of [
      [REST, "spacing/medium", "size/control/large"],
      ["density=compact, state=rest", "spacing/small", "size/control/small"],
    ] as const) {
      const node = variant(name);
      for (const column of [1, 2, 3]) {
        for (const cell of cells(node, column)) {
          expect(cell?.properties.layoutMode, `${name} ${cell?.name}`).toBe("HORIZONTAL");
          expect(cell?.properties.fills, `${name} ${cell?.name}`).toEqual([]);
          expect(bound(cell, "paddingLeft"), `${name} ${cell?.name}`).toBe(padding);
          expect(bound(cell, "paddingRight"), `${name} ${cell?.name}`).toBe(padding);
          expect(bound(cell, "minHeight"), `${name} ${cell?.name}`).toBe(height);
        }
        // One width per column (the widest cell's), written as the minimum of every cell.
        const widths = cells(node, column).map((cell) => box(cell).width);
        expect(new Set(widths).size, `${name} column ${column}`).toBe(1);
        expect(widths[0], `${name} column ${column}`).toBeGreaterThan(0);
        for (const cell of cells(node, column)) {
          expect(cell?.properties.minWidth, `${name} ${cell?.name}`).toBe(widths[0]);
        }
      }
      // The rows are as wide as the head: columns align.
      const widths = ["head", "row-1", "row-2", "row-3"].map(
        (row) => box(descendant(node, row)).width,
      );
      expect(new Set(widths).size, name).toBe(1);
    }
  });

  it("draws the sort button in the first head cell: fill by state, radius, the chevron bound, the ring in the focus variant only", async () => {
    const { variant } = await drawn();
    const rest = variant(REST);
    const hover = variant("density=comfortable, state=hover");
    const focus = variant(FOCUS);
    for (const [node, state] of [
      [rest, "rest"],
      [hover, "hover"],
      [focus, "focus"],
    ] as const) {
      const cell = descendant(node, "head-1");
      expect(
        cell?.children.map((child) => child.name),
        state,
      ).toEqual(["focus-ring"]);
      const ring = descendant(cell, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      const sort = descendant(gap, "sort");
      expect(sort?.properties.layoutMode, state).toBe("HORIZONTAL");
      expect(bound(sort, "cornerRadius"), state).toBe("radius/role/control");
      expect(
        sort?.children.map((child) => child.name),
        state,
      ).toEqual(["sort-text", "sort-indicator"]);
      const text = descendant(sort, "sort-text");
      expect(paints(text, "fills")[0]?.boundVariables?.color?.name, state).toBe(
        "color/text/default",
      );
      expect(bound(text, "fontSize"), state).toBe("typography/label/1/font-size");
      const indicator = descendant(sort, "sort-indicator");
      expect(indicator?.properties.layoutMode, state).toBe("NONE");
      expect(bound(indicator, "width"), state).toBe("size/icon/small");
      expect(bound(indicator, "height"), state).toBe("size/icon/small");
      expect(indicator?.properties.fills, state).toEqual([]);
      const mark = descendant(indicator, "mark");
      expect(mark?.type, state).toBe("VECTOR");
      expect(paints(mark, "fills")[0]?.boundVariables?.color?.name, state).toBe(
        "color/text/subtle",
      );
      expect(mark?.properties.strokes, state).toEqual([]);
      // The ring and its gap reserve their room in every state (F11).
      expect(bound(ring, "paddingLeft"), state).toBe("focus/ring/width");
      expect(bound(gap, "paddingLeft"), state).toBe("focus/offset");
      expect(bound(ring, "cornerRadius"), state).toBe("radius/focus/ring");
      expect(bound(gap, "cornerRadius"), state).toBe("radius/focus/gap");
    }
    expect(paints(descendant(rest, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/rest",
    );
    expect(paints(descendant(hover, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/hover",
    );
    expect(paints(descendant(focus, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/rest",
    );
    // The ring shows its colours in the focus state only.
    expect(paints(descendant(rest, "focus-ring"), "strokes")).toEqual([]);
    expect(paints(descendant(hover, "focus-ring"), "strokes")).toEqual([]);
    expect(paints(descendant(focus, "focus-ring"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "focus/ring/color",
    );
    expect(paints(descendant(focus, "focus-gap"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "color/focus/inner",
    );
    // The other head cells hold their text alone.
    expect(descendant(rest, "head-2")?.children.map((child) => child.name)).toEqual([
      "head-text-2",
    ]);
  });

  it("declares caption-hidden as the BOOLEAN property caption (shown), default true, connected to the caption's visibility, once over two runs", async () => {
    const { double, set, variant } = await drawn();
    const definitions = () => (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const key = () =>
      Object.keys(definitions()).find((candidate) => candidate.startsWith("caption#"));
    expect(key()).toBeDefined();
    expect(definitions()[key() ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
    expect(Object.keys(definitions())).toHaveLength(2);
    for (const node of set?.children ?? []) {
      const caption = descendant(node, "caption");
      expect(caption?.properties.visible, node.name).toBe(true);
      expect(caption?.properties.componentPropertyReferences, node.name).toMatchObject({
        visible: key(),
      });
    }
    expect(variant(REST)).toBeDefined();
    await run(double, source);
    expect(Object.keys(definitions())).toHaveLength(2);
    expect(definitions()[key() ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
  });

  it("measures every variant with a size and a cell, the three states of a density alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, tabelo, report } = await drawn();
    expect(tabelo?.layout.zero).toEqual([]);
    expect(tabelo?.layout.smaller).toEqual([]);
    expect(tabelo?.layout.unplaced).toEqual([]);
    expect(tabelo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("tabelo"))).toEqual([]);
    expect(tabelo?.layout.held.rest.caption).toBeDefined();
    expect(tabelo?.layout.held.rest.region).toBeDefined();
    expect(tabelo?.layout.held.rest.head).toBeDefined();
    expect(tabelo?.layout.held.rest.sort).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ④ (spec „atributlisto", G2; plan ④ D-14): the list is a structure of its own —
// variant → list (a column, the gap bound to list.gap) → three entries, the Vitrino's: in columns
// a row, term then value, the gap bound to box.inline-padding; stacked a column, the gap bound to
// box.gap. The term in term.color and term.typography, the value in value.color and
// value.typography; an empty value shows the dash. The label prop is the accessible name: the set
// declares the label property and connects no text to it (nothing seen, nothing drawn).
describe("the atributlisto is drawn as a list: three entries, rows in columns and columns stacked (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "atributlisto");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const atributlisto = report.components.find((component) => component.set === "atributlisto");
    return { double, set, variant, report, atributlisto };
  };

  it("draws three variants by layout: the list column with three entries, each term and value in their roles", async () => {
    const { set, variant, atributlisto } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "layout=columns, state=rest",
      "layout=stacked, state=rest",
      "layout=auto, state=rest",
    ]);
    expect(atributlisto?.layout.columns).toBe(1);
    expect(atributlisto?.layout.rows).toBe(3);
    // Spec 014 ① (layout auto, plan ① D-03): the set draws auto as the wide case, the columns.
    for (const [name, mode, gap] of [
      ["layout=columns, state=rest", "HORIZONTAL", "spacing/large"],
      ["layout=stacked, state=rest", "VERTICAL", "spacing/small"],
      ["layout=auto, state=rest", "HORIZONTAL", "spacing/large"],
    ] as const) {
      const node = variant(name);
      const list = descendant(node, "list");
      expect(list?.properties.layoutMode, name).toBe("VERTICAL");
      expect(list?.properties.fills, name).toEqual([]);
      expect(bound(list, "itemSpacing"), name).toBe("spacing/large");
      expect(
        list?.children.map((child) => child.name),
        name,
      ).toEqual(["entry-1", "entry-2", "entry-3"]);
      for (const index of [1, 2, 3]) {
        const entry = descendant(node, `entry-${index}`);
        expect(entry?.properties.layoutMode, `${name} entry-${index}`).toBe(mode);
        expect(bound(entry, "itemSpacing"), `${name} entry-${index}`).toBe(gap);
        expect(
          entry?.children.map((child) => child.name),
          `${name} entry-${index}`,
        ).toEqual([`term-${index}`, `value-${index}`]);
        const term = descendant(entry, `term-${index}`);
        expect(paints(term, "fills")[0]?.boundVariables?.color?.name, name).toBe(
          "color/text/muted",
        );
        expect(bound(term, "fontSize"), name).toBe("typography/label/2/font-size");
        const value = descendant(entry, `value-${index}`);
        expect(paints(value, "fills")[0]?.boundVariables?.color?.name, name).toBe(
          "color/text/default",
        );
        expect(bound(value, "fontSize"), name).toBe("typography/body/2/font-size");
      }
      expect(descendant(node, "term-1")?.properties.characters, name).toBe("Version");
      expect(descendant(node, "value-1")?.properties.characters, name).toBe("3");
      expect(descendant(node, "term-2")?.properties.characters, name).toBe("Verantwortlich");
      expect(descendant(node, "value-2")?.properties.characters, name).toBe("Team Fundamento");
      expect(descendant(node, "term-3")?.properties.characters, name).toBe("Gültig seit");
      expect(descendant(node, "value-3")?.properties.characters, name).toBe("–");
      // No text carries the label property: the label is the accessible name, never seen.
      const connected = (child: DoubleNode): boolean =>
        child.properties.componentPropertyReferences !== undefined ||
        child.children.some(connected);
      expect(connected(node as DoubleNode), name).toBe(false);
    }
  });

  it("declares the label property with the word Angaben and nothing else", async () => {
    const { set } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Angaben" }]);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, atributlisto, report } = await drawn();
    expect(atributlisto?.layout.zero).toEqual([]);
    expect(atributlisto?.layout.smaller).toEqual([]);
    expect(atributlisto?.layout.unplaced).toEqual([]);
    expect(atributlisto?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("atributlisto"))).toEqual([]);
    expect(atributlisto?.layout.held.rest.list).toBeDefined();
    expect(atributlisto?.layout.held.rest.entry).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ⑤ (spec „navigado", E7, G2): the navigation is a structure of its own — variant →
// control (the nav, a row with the gap bound to box.gap) → three entries, the Vitrino's words
// (Eins, Zwei, Drei), each ring → gap → item (fill by current and state, the box's height, radius
// and inline padding, the underline as the bottom stroke: bound where current, 0 elsewhere) with
// its text (colour by current, the label role). The first item is the current one. The label prop
// is the name of the landmark: the set declares the label property and connects no text to it.
// The example frame „vertikal" beside the set stacks the same items in a column; orientation is
// no variant axis (the Web stylesheet inventory says props {}).
describe("the navigado is drawn as a nav: three items in a row, the first current with the underline; the example vertical (Spec 011 ⑤)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: { name: string; found: boolean; created: boolean };
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "navigado");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const navigado = report.components.find((component) => component.set === "navigado");
    return { double, set, variant, report, navigado };
  };

  it("draws three variants by state: the nav row with three entries, each ring → gap → item with its text", async () => {
    const { set, variant, navigado } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
    ]);
    expect(navigado?.layout.columns).toBe(3);
    expect(navigado?.layout.rows).toBe(1);
    const rest = variant("state=rest");
    const control = descendant(rest, "control");
    expect(rest?.children.map((child) => child.name)).toEqual(["control"]);
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.fills).toEqual([]);
    expect(bound(control, "itemSpacing")).toBe("spacing/xsmall");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    for (const index of [1, 2, 3]) {
      const entry = descendant(control, `entry-${index}`);
      expect(
        entry?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual(["focus-ring"]);
      const ring = descendant(entry, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      expect(
        gap?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`item-${index}`]);
      const item = descendant(gap, `item-${index}`);
      expect(
        item?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`items-${index}`]);
      expect(item?.properties.layoutMode, `item-${index}`).toBe("HORIZONTAL");
      expect(bound(item, "minHeight"), `item-${index}`).toBe("size/target/min");
      expect(bound(item, "cornerRadius"), `item-${index}`).toBe("radius/role/control");
      expect(bound(item, "paddingLeft"), `item-${index}`).toBe("spacing/small");
      expect(bound(item, "paddingRight"), `item-${index}`).toBe("spacing/small");
      expect(item?.properties.strokesIncludedInLayout, `item-${index}`).toBe(true);
      expect(paints(item, "strokes")[0]?.boundVariables?.color?.name, `item-${index}`).toBe(
        "color/navigation/text/selected",
      );
      const text = descendant(item, `items-${index}`);
      expect(bound(text, "fontSize"), `items-${index}`).toBe("typography/label/1/font-size");
      expect(bound(text, "fontFamily"), `items-${index}`).toBe("typography/label/1/font-family");
    }
    expect(descendant(rest, "items-1")?.properties.characters).toBe("Eins");
    expect(descendant(rest, "items-2")?.properties.characters).toBe("Zwei");
    expect(descendant(rest, "items-3")?.properties.characters).toBe("Drei");
    // No text carries the label property: the label is the name of the landmark, never seen.
    const connected = (child: DoubleNode): boolean =>
      child.properties.componentPropertyReferences !== undefined || child.children.some(connected);
    expect(connected(rest as DoubleNode)).toBe(false);
  });

  it("marks the first item as current: selected fill, selected text, the underline bound; the others rest and hover by state, no underline", async () => {
    const { variant } = await drawn();
    for (const [name, fill] of [
      ["state=rest", "color/navigation/rest"],
      ["state=hover", "color/navigation/hover"],
      ["state=focus", "color/navigation/rest"],
    ] as const) {
      const node = variant(name);
      const current = descendant(node, "item-1");
      expect(paints(current, "fills")[0]?.boundVariables?.color?.name, name).toBe(
        "color/navigation/selected",
      );
      expect(bound(current, "strokeBottomWeight"), name).toBe("border/width/strong");
      expect(
        paints(descendant(node, "items-1"), "fills")[0]?.boundVariables?.color?.name,
        name,
      ).toBe("color/navigation/text/selected");
      // Spec 014 ① (Gewicht, plan ① D-01): the current item's text in the semibold cut, its style
      // bound to the STRING twin of the weight (F30), the others in the cut of their role.
      expect(descendant(node, "items-1")?.properties.fontName, name).toEqual({
        family: "Geist",
        style: "SemiBold",
      });
      expect(bound(descendant(node, "items-1"), "fontStyle"), name).toBe("font/style/semibold");
      expect(descendant(node, "items-2")?.properties.fontName, name).toEqual({
        family: "Geist",
        style: "Medium",
      });
      expect(bound(descendant(node, "items-2"), "fontStyle"), name).toBe(
        "typography/label/1/font-style",
      );
      for (const index of [2, 3]) {
        const other = descendant(node, `item-${index}`);
        expect(paints(other, "fills")[0]?.boundVariables?.color?.name, `${name} ${index}`).toBe(
          fill,
        );
        expect(bound(other, "strokeBottomWeight"), `${name} ${index}`).toBeUndefined();
        expect(other?.properties.strokeBottomWeight, `${name} ${index}`).toBe(0);
        expect(
          paints(descendant(node, `items-${index}`), "fills")[0]?.boundVariables?.color?.name,
          `${name} ${index}`,
        ).toBe("color/navigation/text/rest");
      }
    }
  });

  it("shows the focus ring on the first item in the focus variant only, its radii bound (F32)", async () => {
    const { variant } = await drawn();
    const focus = variant("state=focus");
    const ring = descendant(descendant(focus, "entry-1"), "focus-ring");
    const gap = descendant(ring, "focus-gap");
    expect(paints(ring, "strokes")).toHaveLength(1);
    expect(paints(ring, "strokes")[0]?.boundVariables?.color?.name).toBe("focus/ring/color");
    expect(paints(gap, "strokes")[0]?.boundVariables?.color?.name).toBe("color/focus/inner");
    expect(bound(ring, "cornerRadius")).toBe("radius/focus/ring");
    expect(bound(gap, "cornerRadius")).toBe("radius/focus/gap");
    expect(paints(descendant(descendant(focus, "entry-2"), "focus-ring"), "strokes")).toEqual([]);
    const rest = variant("state=rest");
    expect(paints(descendant(descendant(rest, "entry-1"), "focus-ring"), "strokes")).toEqual([]);
  });

  it("declares the label property with the word Navigation and nothing else", async () => {
    const { set } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Navigation" }]);
  });

  it('places the example „vertikal" right after the set: the same three items in a column, the first current', async () => {
    const { double, set, navigado } = await drawn();
    const frame = set?.parent as DoubleNode | undefined;
    const names = frame?.children.map((child) => child.name) ?? [];
    expect(names.indexOf(`navigado – ${VERTICAL_EXAMPLE}`)).toBe(names.indexOf("navigado") + 1);
    const example = frame?.children.find(
      (child) => child.name === `navigado – ${VERTICAL_EXAMPLE}`,
    );
    expect(example?.type).toBe("FRAME");
    expect(navigado?.example).toEqual({
      name: `navigado – ${VERTICAL_EXAMPLE}`,
      found: false,
      created: true,
    });
    const control = descendant(example, "control");
    expect(control?.properties.layoutMode).toBe("VERTICAL");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    expect(paints(descendant(example, "item-1"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/navigation/selected",
    );
    expect(bound(descendant(example, "item-1"), "strokeBottomWeight")).toBe("border/width/strong");
    expect(descendant(example, "items-3")?.properties.characters).toBe("Drei");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    // The example is found on the second run: nothing is created twice.
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    expect(report.components.find((component) => component.set === "navigado")?.example).toEqual({
      name: `navigado – ${VERTICAL_EXAMPLE}`,
      found: true,
      created: false,
    });
    expect(
      frame?.children.filter((child) => child.name === `navigado – ${VERTICAL_EXAMPLE}`),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, the three states alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, navigado, report } = await drawn();
    expect(navigado?.layout.zero).toEqual([]);
    expect(navigado?.layout.smaller).toEqual([]);
    expect(navigado?.layout.unplaced).toEqual([]);
    expect(navigado?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("navigado"))).toEqual([]);
    expect(navigado?.layout.held.rest.control).toBeDefined();
    expect(navigado?.layout.held.rest.entry).toBeDefined();
    expect(navigado?.layout.held.rest["item-1"]).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ⑤ (spec „langetaro", E7, G2): the tab list is a structure of its own — variant → a
// column of the control (the list: a row of three entries with its line as the bottom stroke in
// list.color and list.width, the gap bound to list.gap) and the panel (its inline padding bound,
// the Vitrino's word of the first tab in panel.color). Every entry is ring → gap → tab (fill by
// state, height and inline padding, the selected indicator as the bottom stroke: bound where
// active, 0 elsewhere) with its text (colour by active, the label role). The first tab is the
// active one. The label prop is the name of the group: the set declares the label property and
// connects no text to it.
describe("the langetaro is drawn as tabs: the list with three tabs, the first active with the indicator, the line, the panel below (Spec 011 ⑤)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = {
    visible: boolean;
    opacity?: number;
    boundVariables?: { color?: { name: string } };
  };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: unknown;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "langetaro");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const langetaro = report.components.find((component) => component.set === "langetaro");
    return { double, set, variant, report, langetaro };
  };

  it("draws four variants by state: the list row with three entries and the panel below, each tab ring → gap → tab with its text", async () => {
    const { set, variant, langetaro } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
      "state=disabled",
    ]);
    expect(langetaro?.layout.columns).toBe(4);
    expect(langetaro?.layout.rows).toBe(1);
    const rest = variant("state=rest");
    expect(rest?.properties.layoutMode).toBe("VERTICAL");
    expect(rest?.children.map((child) => child.name)).toEqual(["control", "panel"]);
    const control = descendant(rest, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.fills).toEqual([]);
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paints(control, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/default");
    expect(bound(control, "strokeBottomWeight")).toBe("border/width/default");
    expect(control?.properties.strokeTopWeight).toBe(0);
    expect(bound(control, "itemSpacing")).toBe("spacing/xsmall");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    for (const index of [1, 2, 3]) {
      const entry = descendant(control, `entry-${index}`);
      const ring = descendant(entry, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      expect(
        gap?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`tab-${index}`]);
      const tab = descendant(gap, `tab-${index}`);
      expect(
        tab?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`tabs-${index}`]);
      expect(bound(tab, "minHeight"), `tab-${index}`).toBe("size/target/min");
      expect(bound(tab, "paddingLeft"), `tab-${index}`).toBe("spacing/medium");
      expect(bound(tab, "paddingRight"), `tab-${index}`).toBe("spacing/medium");
      expect(tab?.properties.strokesIncludedInLayout, `tab-${index}`).toBe(true);
      expect(paints(tab, "strokes")[0]?.boundVariables?.color?.name, `tab-${index}`).toBe(
        "color/navigation/text/selected",
      );
      const text = descendant(tab, `tabs-${index}`);
      expect(bound(text, "fontSize"), `tabs-${index}`).toBe("typography/label/1/font-size");
    }
    expect(descendant(rest, "tabs-1")?.properties.characters).toBe("Eins");
    expect(descendant(rest, "tabs-2")?.properties.characters).toBe("Zwei");
    expect(descendant(rest, "tabs-3")?.properties.characters).toBe("Drei");
    const panel = descendant(rest, "panel");
    expect(panel?.properties.layoutMode).toBe("HORIZONTAL");
    expect(bound(panel, "paddingLeft")).toBe("spacing/medium");
    expect(bound(panel, "paddingRight")).toBe("spacing/medium");
    expect(panel?.children.map((child) => child.name)).toEqual(["panel-text"]);
    const panelText = descendant(panel, "panel-text");
    expect(panelText?.properties.characters).toBe("Eins");
    expect(paints(panelText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    // The panel's text has no role in the Skemo: nothing of its typography is bound.
    expect(bound(panelText, "fontSize")).toBeUndefined();
    const connected = (child: DoubleNode): boolean =>
      child.properties.componentPropertyReferences !== undefined || child.children.some(connected);
    expect(connected(rest as DoubleNode)).toBe(false);
  });

  it("fills every tab by state and marks the first as active: default text and the indicator bound; the others subtle, no indicator", async () => {
    const { variant } = await drawn();
    for (const [name, fill, opacity] of [
      ["state=rest", "color/action/tertiary/rest", 0],
      ["state=hover", "color/action/tertiary/hover", 0.08],
      ["state=focus", "color/action/tertiary/rest", 0],
      ["state=disabled", "color/action/tertiary/disabled", 0],
    ] as const) {
      const node = variant(name);
      for (const index of [1, 2, 3]) {
        const tab = descendant(node, `tab-${index}`);
        const fillPaint = paints(tab, "fills")[0];
        expect(fillPaint?.boundVariables?.color?.name, `${name} ${index}`).toBe(fill);
        expect(fillPaint?.opacity, `${name} ${index}`).toBe(opacity);
      }
      expect(bound(descendant(node, "tab-1"), "strokeBottomWeight"), name).toBe(
        "border/width/strong",
      );
      expect(
        paints(descendant(node, "tabs-1"), "fills")[0]?.boundVariables?.color?.name,
        name,
      ).toBe("color/text/default");
      for (const index of [2, 3]) {
        expect(
          bound(descendant(node, `tab-${index}`), "strokeBottomWeight"),
          `${name} ${index}`,
        ).toBeUndefined();
        expect(descendant(node, `tab-${index}`)?.properties.strokeBottomWeight).toBe(0);
        expect(
          paints(descendant(node, `tabs-${index}`), "fills")[0]?.boundVariables?.color?.name,
          `${name} ${index}`,
        ).toBe("color/text/subtle");
      }
    }
  });

  it("shows the focus ring on the first tab in the focus variant only", async () => {
    const { variant } = await drawn();
    const focus = variant("state=focus");
    const ring = descendant(descendant(focus, "entry-1"), "focus-ring");
    expect(paints(ring, "strokes")).toHaveLength(1);
    expect(paints(ring, "strokes")[0]?.boundVariables?.color?.name).toBe("focus/ring/color");
    expect(paints(descendant(descendant(focus, "entry-2"), "focus-ring"), "strokes")).toEqual([]);
    for (const name of ["state=rest", "state=hover", "state=disabled"]) {
      const other = variant(name);
      expect(
        paints(descendant(descendant(other, "entry-1"), "focus-ring"), "strokes"),
        name,
      ).toEqual([]);
    }
  });

  it("declares the label property with the word Reiter and nothing else; no example frame", async () => {
    const { set, langetaro } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Reiter" }]);
    expect(langetaro?.example).toBeUndefined();
  });

  it("measures every variant with a size and a cell, the four states alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, langetaro, report } = await drawn();
    expect(langetaro?.layout.zero).toEqual([]);
    expect(langetaro?.layout.smaller).toEqual([]);
    expect(langetaro?.layout.unplaced).toEqual([]);
    expect(langetaro?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("langetaro"))).toEqual([]);
    expect(langetaro?.layout.held.rest.control).toBeDefined();
    expect(langetaro?.layout.held.rest.panel).toBeDefined();
    expect(langetaro?.layout.held.rest["tab-1"]).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 014 ② (G3, plan ② D-08): the plugin draws icons. An icon is one frame per Aspekto, imported
// from the glyph of that Aspekto (createNodeFromSvg), its visibility bound to the BOOLEAN
// variable ikonoj/<aspekto> — so the brand mode switches the picture — and its vectors' fill
// bound to the colour of the part. The set ikono draws one variant per name × size × intent;
// the butono draws its icon-start, the elektilo its chevron, the tabelo its sort arrow and the
// avizo its status icon the same way; the dialog shows the help of its reason (O-5 of ①).
describe("icons are drawn from the glyphs of every Aspekto and switch with the brand (Spec 014 ②)", () => {
  // The plan of core + ekzemplo: two Aspektoj, two glyph frames per icon.
  const source = files["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  const vectorOf = (frame: DoubleNode | undefined) =>
    frame?.children.find((child) => child.type === "VECTOR");
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as { warnings: string[]; components: { set: string; layout: { zero: string[] } }[] };
    const setOf = (name: string) => pageNodes(double).find((child) => child.name === name);
    return { double, report, setOf };
  };

  it("the set ikono: 225 variants, each the control with one glyph frame per Aspekto, visible by the brand variable, filled in the bound colour, sized by the token", async () => {
    const { setOf, report } = await drawn();
    const set = setOf("ikono");
    expect(set?.children).toHaveLength(225);
    const variant = set?.children.find(
      (child) => child.name === "name=close, size=medium, intent=neutral, state=rest",
    );
    expect(variant?.children.map((child) => child.name)).toEqual(["control"]);
    const control = descendant(variant, "control");
    expect(control?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    expect(bound(control, "width")).toBe("size/icon/medium");
    expect(bound(control, "height")).toBe("size/icon/medium");
    const komuna = descendant(variant, "glyph-komuna");
    const ekzemplo = descendant(variant, "glyph-ekzemplo");
    expect(bound(komuna, "visible")).toBe("ikonoj/komuna");
    expect(bound(ekzemplo, "visible")).toBe("ikonoj/ekzemplo");
    expect(paintOf(vectorOf(komuna), "fills")).toBe("color/text/default");
    expect(paintOf(vectorOf(ekzemplo), "fills")).toBe("color/text/default");
    const danger = set?.children.find(
      (child) => child.name === "name=danger, size=large, intent=danger, state=rest",
    );
    expect(paintOf(vectorOf(descendant(danger, "glyph-komuna")), "fills")).toBe(
      "color/status/danger/text",
    );
    expect(bound(descendant(danger, "control"), "width")).toBe("size/icon/large");
    expect(descendant(variant, "label")).toBeUndefined();
    expect(descendant(variant, "focus-ring")).toBeUndefined();
    expect(report.warnings.filter((warning) => warning.startsWith("ikono"))).toEqual([]);
    expect(report.components.find((component) => component.set === "ikono")?.layout.zero).toEqual(
      [],
    );
  });

  it("the butono draws its icon-start before the label, in the label's colour and the icon's size; the elektilo its chevron, the tabelo its sort arrow", async () => {
    const { setOf } = await drawn();
    const butono = setOf("butono");
    const rest = butono?.children.find(
      (child) => child.name === "emphasis=high, intent=neutral, size=medium, state=rest",
    );
    const control = descendant(rest, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["icon-start", "label"]);
    const icon = descendant(rest, "icon-start");
    expect(icon?.children.map((child) => child.name)).toEqual(["glyph-komuna", "glyph-ekzemplo"]);
    expect(bound(icon, "width")).toBe("size/icon/medium");
    expect(paintOf(vectorOf(descendant(icon, "glyph-komuna")), "fills")).toBe(
      "color/action/primary/text",
    );
    const elektilo = setOf("elektilo");
    const indicator = descendant(elektilo?.children[0], "indicator");
    expect(indicator?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    // No hand-drawn sign: the only vectors are the imports of the glyphs.
    expect(descendant(elektilo?.children[0], "mark")?.parent?.name).toBe("glyph-komuna");
    expect(paintOf(vectorOf(descendant(indicator, "glyph-komuna")), "fills")).toBe(
      "color/text/muted",
    );
    const tabelo = setOf("tabelo");
    const sortIndicator = descendant(tabelo?.children[0], "sort-indicator");
    expect(sortIndicator?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    expect(bound(sortIndicator, "width")).toBe("size/icon/small");
  });

  it("the avizo draws the icon of its intent before its texts, in the status text colour; the dialog shows the help of its reason (O-5)", async () => {
    const { setOf } = await drawn();
    const avizo = setOf("avizo");
    const danger = avizo?.children.find((child) => child.name === "intent=danger, state=rest");
    const control = descendant(danger, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["icon", "texts", "dismiss"]);
    const icon = descendant(danger, "icon");
    expect(bound(icon, "width")).toBe("size/icon/medium");
    expect(paintOf(vectorOf(descendant(icon, "glyph-komuna")), "fills")).toBe(
      "color/status/danger/text",
    );
    const dialogo = setOf("dialogo");
    const withReason = dialogo?.children.find((child) => child.name.includes("reason=optional"));
    const content = descendant(withReason, "content");
    expect(content?.children.map((child) => child.name)).toEqual([
      "reason-label",
      "reason-field",
      "reason-help",
    ]);
    expect(descendant(withReason, "reason-help")?.properties.characters).toBe(
      "Nenne den Grund in einem Satz.",
    );
    expect(paintOf(descendant(withReason, "reason-help"), "fills")).toBe("color/text/muted");
  });

  it("draws the apartigilo as a line and the saltligilo as a control; writes nothing new on a second run", async () => {
    const { double, setOf } = await drawn();
    const apartigilo = setOf("apartigilo");
    expect(apartigilo?.children.map((child) => child.name)).toEqual([
      "orientation=horizontal, state=rest",
      "orientation=vertical, state=rest",
    ]);
    const horizontal = descendant(apartigilo?.children[0], "control");
    expect(paintOf(horizontal, "strokes")).toBe("color/border/subtle");
    expect(bound(horizontal, "strokeTopWeight")).toBe("border/width/default");
    const vertical = descendant(apartigilo?.children[1], "control");
    expect(bound(vertical, "strokeLeftWeight")).toBe("border/width/default");
    expect(bound(vertical, "height")).toBe("size/control/medium");
    const saltligilo = setOf("saltligilo");
    expect(saltligilo?.children.map((child) => child.name)).toEqual(["state=rest", "state=focus"]);
    expect(paintOf(descendant(saltligilo?.children[0], "control"), "fills")).toBe(
      "color/background/raised",
    );
    expect(descendant(saltligilo?.children[0], "label")?.properties.characters).toBe("Ziel");
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 014 ④ (plan ④ D-06): the plugin draws the overlays and binds every shadow (G4): the double
// models setBoundVariableForEffect since ④, so the dialogo's shadow and the overlay shadows report
// bound — the Vojmapo's finding „Schattenvariablen ungebunden" closes. A tooltip is a surface with
// its text beside a stand-in of its trigger on the side of its placement; a popover a trigger
// stand-in over the surface with heading and content; a menu a trigger stand-in over the surface
// with three rows (the third in the danger colour).
describe("the plugin draws the overlays and binds the shadows (Spec 014 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      shadow?: { part: string; variable: string; layers: number; status: string; evidence: string };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const setOf = (name: string) => pageNodes(double).find((child) => child.name === name);
    return { double, report, setOf };
  };

  it("binds the shadow of the dialogo, the konsileto, the sxvebilo and the menuo to DROP_SHADOW effects (status bound)", async () => {
    const { report, setOf } = await drawn();
    for (const name of ["dialogo", "konsileto", "sxvebilo", "menuo"]) {
      const component = report.components.find((candidate) => candidate.set === name);
      expect(component?.shadow, name).toMatchObject({ part: "surface", status: "bound" });
      expect(component?.shadow?.evidence, name).toContain("follows the mode");
    }
    const konsileto = setOf("konsileto");
    const surface = descendant(konsileto?.children[0], "control");
    const effects = (surface?.properties.effects ?? []) as {
      type: string;
      boundVariables?: Record<string, { name: string }>;
    }[];
    expect(effects[0]?.type).toBe("DROP_SHADOW");
    expect(effects[0]?.boundVariables?.color?.name).toMatch(/^elevation\/shadow\/overlay/);
    expect(effects[0]?.boundVariables?.radius?.name).toMatch(/blur$/);
  });

  it("the konsileto: four variants by placement, the surface on the side of the placement beside a stand-in of the trigger", async () => {
    const { setOf } = await drawn();
    const set = setOf("konsileto");
    expect(set?.children.map((child) => child.name)).toEqual([
      "placement=block-start, state=rest",
      "placement=block-end, state=rest",
      "placement=inline-start, state=rest",
      "placement=inline-end, state=rest",
    ]);
    const above = set?.children[0];
    expect(above?.children.map((child) => child.name)).toEqual(["control", "anchor"]);
    expect(above?.properties.layoutMode).toBe("VERTICAL");
    const below = set?.children[1];
    expect(below?.children.map((child) => child.name)).toEqual(["anchor", "control"]);
    const before = set?.children[2];
    expect(before?.properties.layoutMode).toBe("HORIZONTAL");
    const control = descendant(above, "control");
    expect(paintOf(control, "fills")).toBe("color/background/inverse");
    expect(bound(control, "cornerRadius")).toBe("radius/role/control");
    const text = descendant(above, "text");
    expect(paintOf(text, "fills")).toBe("color/text/inverse");
    expect(bound(text, "fontSize")).toBe("typography/caption/font-size");
    expect(text?.properties.characters).toBe("Kurzhinweis");
  });

  it("the sxvebilo: a trigger stand-in over the surface with heading and content, the width bound", async () => {
    const { setOf } = await drawn();
    const variant = setOf("sxvebilo")?.children[0];
    expect(variant?.children.map((child) => child.name)).toEqual(["trigger", "surface"]);
    const surface = descendant(variant, "surface");
    expect(surface?.children.map((child) => child.name)).toEqual(["heading", "content"]);
    expect(bound(surface, "width")).toBe("size/container/small");
    expect(paintOf(surface, "strokes")).toBe("color/border/subtle");
    expect(descendant(variant, "heading")?.properties.characters).toBe("Überschrift");
    expect(descendant(variant, "trigger-label")?.properties.characters).toBe("Auslöser");
    expect(descendant(variant, "content-text")?.properties.characters).toBe("Inhalt");
  });

  it("the menuo: four variants by state, each a trigger stand-in over the surface with three rows, the third in the danger colour", async () => {
    const { setOf } = await drawn();
    const set = setOf("menuo");
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
      "state=disabled",
    ]);
    const rest = set?.children[0];
    const surface = descendant(rest, "surface");
    // The rows are entries like a tab list's: ring → gap → item, one per word of the plan.
    expect(surface?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    expect(paintOf(descendant(rest, "item-1"), "fills")).toBe("color/action/tertiary/rest");
    expect(paintOf(descendant(rest, "items-1"), "fills")).toBe("color/text/default");
    expect(paintOf(descendant(rest, "items-3"), "fills")).toBe("color/status/danger/text");
    expect(descendant(rest, "items-1")?.properties.characters).toBe("Bearbeiten");
    expect(descendant(rest, "items-3")?.properties.characters).toBe("Löschen");
    expect(descendant(rest, "trigger-label")?.properties.characters).toBe("Weitere Aktionen");
    expect(bound(descendant(rest, "item-1"), "minHeight")).toBe("size/target/min");
  });
});
