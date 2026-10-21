// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-rahmen-beispiele.test.ts (Nachlese 5 ①, O-5): the frame Eroj in the section Fundamento and the examples beside the sets.

import { describe, expect, it } from "vitest";
import {
  BACKDROP_EXAMPLE,
  FIGMA_SXABLONO_FRAME,
  UNKNOWN_EXAMPLE,
  VERTICAL_EXAMPLE,
} from "./figma.js";
import {
  descendant,
  type LIFT,
  MODEL_FONTS,
  modelDouble,
  pageNodes,
  repoFiles,
  repoPlan,
  run,
  SEPARATOR_EXAMPLE_NAMES,
} from "./plugin-test-helpers.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

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
  // The frames of the sets; the frame of the Sxablonoj (Spec 020 ①) lies beside them.
  const framesOf = (double: ReturnType<typeof figmaDouble>) =>
    sectionOf(double).children.filter(
      (child) => child.type === "FRAME" && child.name !== FIGMA_SXABLONO_FRAME,
    );
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
    // Nachlese 4 N-6 (F-7): the separator between two texts, once per orientation.
    name === "apartigilo"
      ? [name, ...SEPARATOR_EXAMPLE_NAMES]
      : name === "dialogo"
        ? [name, `dialogo – ${BACKDROP_EXAMPLE}`]
        : name === "mezurilo"
          ? [name, `mezurilo – ${UNKNOWN_EXAMPLE}`]
          : name === "navigado"
            ? [name, `navigado – ${VERTICAL_EXAMPLE}`]
            : // Spec 015 ① (O-2): the pagination on page 1, 5 and 10 of 10 beside its set.
              name === "pagxigilo"
              ? [name, ...[1, 5, 10].map((page) => `pagxigilo – Seite ${page} von 10`)]
              : // Spec 015 ②: the upload with two files beside its set.
                name === "alsxutilo"
                ? [name, "alsxutilo – mit zwei Dateien"]
                : // Spec 015 ③: the card without its image beside its set, the avatar with its
                  // image beside its.
                  name === "karto"
                  ? [name, "karto – ohne Bild"]
                  : name === "avataro"
                    ? [name, "avataro – mit Bild"]
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
    // Spec 020 ①: the frame of the Sxablonoj lies below the frame of the sets.
    expect(section.children.map((child) => child.name)).toEqual([FRAME, FIGMA_SXABLONO_FRAME]);
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
    // Spec 020 ①: the frame of the Sxablonoj lies below the frame of the sets, a gap between.
    const found = sectionOf(double).children.find((child) => child.name === FIGMA_SXABLONO_FRAME);
    if (found === undefined) throw new Error("no frame Sxablonoj");
    const patterns = box(found);
    expect(patterns.y).toBe(frame.y + frame.height + (layout?.gap ?? NaN));
    expect(section.width).toBe(
      Math.max(frame.x + frame.width, patterns.x + patterns.width) + padding,
    );
    expect(section.height).toBe(patterns.y + patterns.height + padding);
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
    // Spec 020 ①: the frame of the Sxablonoj lies beside the new frame of the sets.
    expect(section.children.map((child) => child.name).sort()).toEqual(
      [FRAME, FIGMA_SXABLONO_FRAME].sort(),
    );
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
    // The set moves to the end, its example frames with it (Spec 015 ②: the alsxutilo's; since
    // Nachlese 4 N-6 the apartigilo has two).
    const own = inFrame.filter((name) => name === first || name.startsWith(`${first} – `));
    expect(frameOf(double).children.map((child) => child.name)).toEqual([
      ...inFrame.filter((name) => !own.includes(name)),
      ...own,
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

// Abnahme 015 ① (S-1, S-2), checked in Figma too: the breadcrumb is one row of its three levels,
// a chevron after the first two and none after the current page; the pagination one row of the
// arrow back, the pages, the ellipsis and the arrow forth.
describe("the plugin draws the breadcrumb in one row with a chevron between two levels (Abnahme 015 ① S-1, S-2)", () => {
  const named = (node: DoubleNode | undefined, prefix: string): DoubleNode[] =>
    node === undefined
      ? []
      : [
          ...(node.name.startsWith(prefix) ? [node] : []),
          ...node.children.flatMap((child) => named(child, prefix)),
        ];

  it("spuro: the control is a horizontal row of three entries; two chevrons, the last entry has none", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "spuro");
    expect(set?.children).toHaveLength(3);
    for (const variant of set?.children ?? []) {
      const control = descendant(variant, "control");
      expect(control?.properties.layoutMode, variant.name).toBe("HORIZONTAL");
      const entries = control?.children.filter((child) => child.name.startsWith("entry-")) ?? [];
      expect(entries.map((entry) => entry.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
      for (const entry of entries) expect(entry.properties.layoutMode).toBe("HORIZONTAL");
      expect(
        named(variant, "separator-").filter((node) => /^separator-\d+$/.test(node.name)),
      ).toHaveLength(2);
      expect(named(entries[2], "separator-")).toEqual([]);
    }
  });

  it("pagxigilo: the control is a horizontal row — arrow back, the pages, the ellipsis, arrow forth", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "pagxigilo");
    const control = descendant(set?.children[0], "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.children.map((child) => child.name)).toEqual(["arrow-1", "pages", "arrow-2"]);
    const pages = descendant(control, "pages");
    expect(pages?.properties.layoutMode).toBe("HORIZONTAL");
    // The set shows 1 2 3 and the gap after the third page, in the third page's entry.
    expect(pages?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    expect(descendant(pages?.children[2], "ellipsis-3")?.properties.characters).toBe("\u2026");
    expect(descendant(pages?.children[0], "ellipsis-1")).toBeUndefined();
  });

  // Spec 015 ① (O-2): the examples Seite 1, 5 und 10 von 10 stand beside the set, each the row
  // the web shows for that page, the current page marked by its stroke.
  it("pagxigilo: three examples beside the set — page 1, 5 and 10 of 10 with their gaps", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const at = names.indexOf("pagxigilo");
    expect(names.slice(at, at + 4)).toEqual([
      "pagxigilo",
      "pagxigilo – Seite 1 von 10",
      "pagxigilo – Seite 5 von 10",
      "pagxigilo – Seite 10 von 10",
    ]);
    const row = (name: string) => {
      const pages = descendant(
        frame?.children.find((child) => child.name === name),
        "pages",
      );
      return (pages?.children ?? []).flatMap((entry) => {
        const n = entry.name.slice("entry-".length);
        const number = String(descendant(entry, `items-${n}`)?.properties.characters ?? "");
        const gap = descendant(entry, `ellipsis-${n}`);
        return gap === undefined ? [number] : [number, "\u2026"];
      });
    };
    expect(row("pagxigilo – Seite 1 von 10")).toEqual(["1", "2", "\u2026", "10"]);
    expect(row("pagxigilo – Seite 5 von 10")).toEqual([
      "1",
      "\u2026",
      "4",
      "5",
      "6",
      "\u2026",
      "10",
    ]);
    expect(row("pagxigilo – Seite 10 von 10")).toEqual(["1", "\u2026", "9", "10"]);
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Nachlese 5 N5-4 (Messung 2026-10-19, Auftrag 5.): the examples of the alsxutilo (the list of
// files) and of the avataro (the silhouette) stood without a ground directly on the canvas of the
// page; help, file names and sizes were hardly legible. Every example frame stands on the Vitrino's
// ground, as the set and the examples of the apartigilo do (color/background/canvas, bound) — but
// the dialog's, whose ground is its backdrop.
describe("every example frame stands on the Vitrino's ground (Nachlese 5 N5-4)", () => {
  const paintOf = (node: DoubleNode | undefined) =>
    ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;

  it("every example beside a set is filled with color/background/canvas; the dialog's with its backdrop", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const examples = (frame?.children ?? []).filter(
      (child) => child.getSharedPluginData("fundamento", "example") !== "",
    );
    // Every kind of example the repo plan draws: the list of files, the silhouette, the card
    // without its image, the pages, the separators, the unknown meter, the vertical navigation.
    for (const name of [
      "alsxutilo – mit zwei Dateien",
      "avataro – mit Bild",
      "karto – ohne Bild",
      "pagxigilo – Seite 1 von 10",
      `mezurilo – ${UNKNOWN_EXAMPLE}`,
      `navigado – ${VERTICAL_EXAMPLE}`,
      ...SEPARATOR_EXAMPLE_NAMES,
    ]) {
      expect(
        examples.map((example) => example.name),
        name,
      ).toContain(name);
    }
    const bare = examples
      .filter((example) => !example.name.endsWith(BACKDROP_EXAMPLE))
      .filter((example) => paintOf(example) !== "color/background/canvas")
      .map((example) => example.name);
    expect(bare).toEqual([]);
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});
