// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-lauf.test.ts (Nachlese 5 ①, O-5): the run itself: first and second run, the report, the aborts before a write, the build.

import { describe, expect, it } from "vitest";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";
import {
  butonoOf,
  descendant,
  files,
  LIFT,
  MODEL_FONTS,
  modelDouble,
  pageNodes,
  plan,
  repo,
  repoFiles,
  repoPlan,
  run,
  TITOLO_CASE_WARNING,
} from "./plugin-test-helpers.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

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
      // Spec 015 ②: the alsxutilo carries a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "alsxutilo"),
      ...["boundary", "slots", "content"].map(() => "apartigilo"),
      // Spec 011 ④: the atributlisto, the mezurilo and the tabelo carry a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "atributlisto"),
      // Spec 015 ③: the avataro carries a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "avataro"),
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
      // Spec 015 ③: the karto carries a Uzo like every set.
      ...["boundary", "slots", "content"].map(() => "karto"),
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
      ...["alsxutilo", "alsxutilo", "alsxutilo"],
      ...["apartigilo", "apartigilo", "apartigilo"],
      // Spec 011 ④: the atributlisto, the mezurilo and the tabelo close their three parts too.
      ...["atributlisto", "atributlisto", "atributlisto"],
      // Spec 015 ③: the avataro closes its three parts too.
      ...["avataro", "avataro", "avataro"],
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
      // Spec 015 ③: the karto closes its three parts too.
      ...["karto", "karto", "karto"],
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
    // Spec 015 ①: the pagination and the breadcrumb are new to that file too.
    "pagxigilo",
    "spuro",
    // Spec 015 ②: and the file input.
    "alsxutilo",
    // Spec 015 ③: and the card and the avatar.
    "karto",
    "avataro",
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

  it("the file of before ②: 17 sets, the atributlisto without auto; then the current plan into the found file creates the new sets and the auto variants, nothing refused", async () => {
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
  // Spec 015 ②: the alsxutilo is the first set with a text; its first variant stands first.
  const FIRST = "dropzone=true, state=rest";
  const FIRST_SET = "alsxutilo";
  type Orphan = { id: string; name: string; set: string; parent: { id: string; type: string } };

  /**
   * A run that crashes once its first component stands, as Figma's run did (F-A): at the first
   * text of a component. The apartigilo draws no text in its set, only in its two examples beside
   * it (Nachlese 4 N-6) — two texts each, written after its set stands; those four still arrive.
   */
  async function crashedRun(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    const create = (double.figma as { createText: () => DoubleNode }).createText;
    let texts = 0;
    await module({
      ...double.figma,
      createText: () => {
        texts += 1;
        if (texts > 4) throw new Error("abgestürzt");
        return create();
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
          // four variants are made first; the run fails in the butono. Spec 015 ②: the
          // alsxutilo's twelve before them; Spec 015 ③: and the avataro's three.
          if (++made === 12 + 3 + 3 + 4 + 40)
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
