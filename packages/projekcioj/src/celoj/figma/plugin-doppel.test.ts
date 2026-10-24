// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-doppel.test.ts (Nachlese 5 ①, O-5): the rules of the double itself: sizes, strokes, refusals, wrapping, invisible children.

import { describe, expect, it } from "vitest";
import { descendant, modelDouble, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

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

// Nachlese 4 N-5 (F-6): Figma lays out no invisible child of an auto-layout frame (documented:
// a hidden layer takes no space). The double counted it — the plenstato's hidden arc (empty) and
// hidden actions placeholder (loading) made both variants larger than in the file, and the
// 148 the maintainer measured was out of the double's reach.
describe("the double lays out no invisible child (N-5)", () => {
  const frameOf = (double: ReturnType<typeof figmaDouble>) =>
    (double.figma as { createFrame: () => DoubleNode }).createFrame();
  const size = (node: DoubleNode) => {
    const { width, height } = node as unknown as { width: number; height: number };
    return { width, height };
  };

  it("a column of two children, one hidden, is as high as the visible one, without spacing", () => {
    const double = modelDouble();
    const column = frameOf(double);
    Object.assign(column, {
      layoutMode: "VERTICAL",
      itemSpacing: 4,
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
    });
    const [shown, hidden] = [0, 1].map(() => {
      const child = frameOf(double);
      child.resize(40, 10);
      column.appendChild(child);
      return child;
    });
    expect(size(column)).toEqual({ width: 40, height: 24 });
    Object.assign(hidden as DoubleNode, { visible: false });
    expect(size(column)).toEqual({ width: 40, height: 10 });
    expect(shown).toBeDefined();
  });

  it("the plenstato while loading takes nothing from its hidden actions placeholder: no 0.01, no gap before it", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "plenstato");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const loading = descendant(variant("kind=loading, state=rest"), "control") as DoubleNode;
    expect(descendant(loading, "actions")?.properties.visible).toBe(false);
    // Arc, gap, text and paddings are whole numbers; only the hidden 0.01 placeholder (and the
    // spacing before it) made the column 78.01 high in the double — 74 in the file's terms.
    // Spec 029 ①: the sizes of the Fonto bring halves (and thousandths from the line heights), so
    // the hundredth of the placeholder is told apart in hundredths modulo a half.
    const hundredths = (height: number) => Math.round(height * 100) % 50;
    expect(hundredths(size(loading).height)).toBe(0);
    // The empty variant shows its placeholder: there the 0.01 belongs to the column.
    const empty = descendant(variant("kind=empty, state=rest"), "control") as DoubleNode;
    expect(hundredths(size(empty).height)).toBe(1);
  });
});
