// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-sets.test.ts (Nachlese 5 ①, O-5): the sets: geometry, focus ring, grid, label and its font, sizes, the background of a set.

import { describe, expect, it } from "vitest";
import { traRolojFigmaName } from "../../test-doubles/tra-roloj.js";
import type { FigmaPlan } from "./figma.js";
import {
  butonoOf,
  descendant,
  files,
  LIFT,
  MODEL_FONTS,
  modelDouble,
  pageNodes,
  plan,
  prepared,
  repo,
  repoFiles,
  repoPlan,
  run,
  TITOLO_CASE_WARNING,
} from "./plugin-test-helpers.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

// A bound name read through the role its Ero-Token aliases (Constitution v2.3, tra-roloj.ts): the
// file keeps stating the roles every part binds; that the nodes bind the Ero-Tokens stands in
// ero-tokenoj.test.ts.
const role = (name: string | undefined) => traRolojFigmaName(name, prepared.input.modelo);
const roleText = (text: string) =>
  text.replaceAll(/\b(?:ero|sxablono)\/[a-z0-9]+(?:\/[a-z0-9-]+)*/g, (name) => role(name) ?? name);

// F11, Geometrie (Paket „Figma zeigt das Ero", Schritt 2): Das Plugin setzte nie `layoutMode`. In
// Figma sind Innenabstände, Abstand und Mindestmaße ohne Auto-Layout wirkungslos — die Maße des
// Ero kamen nicht an, und die Abnahme sah Figmas 100 × 100. Das Double hat diese Bindungen
// stillschweigend angenommen; ab jetzt kennt es die Vorbedingung und scheitert laut
// (jug_01M3094ZC6F3XZ1H0MWQZ62MYV, erste Anwendung auf eine Vorbedingung des Werkzeugs).
/** The BOOLEAN properties Spec 027 adds (B-3 help and error, B-6 the icon slots). */
const SPEC_027_SWITCHES = new Set(["help", "error", "icon-start", "icon-end"]);

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
    expect(role(ring?.boundVariables.paddingLeft?.name)).toBe("focus/ring/width");
    expect(role(ring?.boundVariables.paddingTop?.name)).toBe("focus/ring/width");
    expect(role(gap?.boundVariables.paddingLeft?.name)).toBe("focus/offset");
    expect(role(gap?.boundVariables.paddingBottom?.name)).toBe("focus/offset");
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
    expect(role(ringStroke?.boundVariables?.color?.name)).toBe("focus/ring/color");
    expect(role(gapStroke?.boundVariables?.color?.name)).toBe("color/focus/inner");
    // The stroke lies inside its frame and is as wide as the padding it fills: a band, no area.
    for (const [node, weight] of [
      [ring, "focus/ring/width"],
      [gap, "focus/offset"],
    ] as const) {
      expect(node?.properties.strokeAlign).toBe("INSIDE");
      expect(role(node?.boundVariables.strokeWeight?.name)).toBe(weight);
      expect(role(node?.boundVariables.paddingLeft?.name)).toBe(weight);
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
    // Spec 020 ①: the frame Sxablonoj lies beside it in the section, in no flow either.
    const onPage = [
      "Document/Page 1/Fundamento/Eroj: layoutPositioning",
      "Document/Page 1/Fundamento/Sxablonoj: layoutPositioning",
    ];
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
        // Spec 029 ①: the headlines 3 and 4 of komuna are bold, as in the Fonto.
        { family: "Geist", style: "Bold" },
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
    // Spec 027 B-6: beside the label the icon slots, a BOOLEAN and an INSTANCE_SWAP each.
    expect(Object.keys(definitions).filter((key) => key.startsWith("label#"))).toHaveLength(1);
    expect(
      Object.keys(definitions)
        .map((key) => key.split("#")[0])
        .sort(),
    ).toEqual(["icon-end", "icon-end-ikono", "icon-start", "icon-start-ikono", "label"]);
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
    // Spec 027 B-6: the icon slots of the butono beside the label, off.
    expect(
      Object.entries(definitions)
        .filter(([key]) => !key.includes("-ikono#"))
        .map(([, definition]) => definition.defaultValue),
    ).toEqual(["Aktion", false, false]);
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
    const family = role(label?.boundVariables.fontFamily?.name) ?? "";
    const style = role(label?.boundVariables.fontStyle?.name) ?? "";
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
    const fonts = butonoOf(result.components)?.fonts as { bound: Record<string, string[]> };
    const bound = Object.fromEntries(
      // The report names the Ero-Token variables of every size; read as roles, two sizes share one.
      Object.entries(fonts.bound).map(([field, names]) => [
        field,
        [...new Set(names.map((name) => role(name)))],
      ]),
    );
    expect({ ...fonts, bound }).toEqual({
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
  /**
   * The fixture's plan with a second candidate for the code family — of every set that writes it:
   * the tekstareo, since Spec 020 ③ the kodbloko and the markdovido too.
   */
  const withCandidates = () => {
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    for (const set of changed.components) {
      for (const font of set.fonts ?? []) {
        if (font.family === "Geist Mono") font.families = [...CODE_FAMILIES];
      }
      for (const variant of set.variants ?? []) {
        if (variant.font?.family === "Geist Mono") variant.font.families = [...CODE_FAMILIES];
      }
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
          roleText(warning).includes("typography/code/font-family"),
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
    expect(role(label?.boundVariables.letterSpacing?.name)).toMatch(
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

// M-3 (Abnahme Spec 008, Befund B-6; Entscheidung des Maintainers F14, 2026-10-13): Die
// Beschriftung jedes Sets hatte den Vorgabewert „Aktion" — für einen Link und ein Feld falsch.
// butono „Aktion", ligilo „Ziel", kampo „Beschriftung". Ein vorgefundenes Set bekommt das neue
// Wort beim nächsten Lauf.
describe("the label default follows the role of the Ero (M-3)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  type Definitions = Record<string, { type: string; defaultValue: string }>;
  // Spec 027 adds the words of the other texts (B-4), help and error (B-3) and the icon slots
  // with their INSTANCE_SWAP (B-6); these cases are about the label and the switches before it.
  const defaultsOf = (set: DoubleNode | undefined) =>
    Object.entries((set?.properties.componentPropertyDefinitions ?? {}) as Definitions)
      .filter(([key, definition]) => {
        const name = key.split("#")[0] ?? "";
        if (definition.type === "BOOLEAN") return !SPEC_027_SWITCHES.has(name);
        return definition.type === "TEXT" && name === "label";
      })
      .map(([, definition]) => definition.defaultValue);

  it("writes Aktion, Beschriftung and Ziel as the defaults of the three sets", async () => {
    const double = modelDouble();
    await run(double, source);
    const of = (name: string) => defaultsOf(pageNodes(double).find((child) => child.name === name));
    // Spec 027 B-6: the icon slots of the butono are switches of their own (icon-start, icon-end).
    expect(of("butono")).toEqual(["Aktion"]);
    expect(of("elekto")).toEqual(["Frage"]);
    expect(of("kampo")).toEqual(["Beschriftung"]);
    // Nachlese 5 O-41: the BOOLEAN external beside the label, hidden by default.
    expect(of("ligilo")).toEqual(["Ziel", false]);
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
    // Nachlese 7 ② B-2: the BOOLEAN label-visible (label-hidden false) beside the label.
    expect(of("mezurilo")).toEqual(["Messwert", true]);
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
    expect(defaultsOf(ligilo())).toEqual(["Aktion", false]);
    await run(double, source);
    expect(defaultsOf(ligilo())).toEqual(["Ziel", false]);
    for (const variant of ligilo()?.children ?? []) {
      expect(descendant(variant, "label")?.properties.characters, variant.name).toBe("Ziel");
    }
  });
});
