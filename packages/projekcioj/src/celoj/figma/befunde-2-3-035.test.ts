// Spec 035 2.3 (the Figma findings of the plugin acceptance of 30.10.), as data in the double:
// 2.3.1 the calendar in the 24 px trigger of the datelektilo is as large as the chevron of the
// elektilo – its glyph sized by the Skemo, the trigger a target of at least size.target.min.
// The double draws the plan of this repository (the values of komuna); Figma's own pixels are the
// maintainer's acceptance (Messanleitung in the contribution of PAK-2.4).

import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const TARGET_MIN = 24;

const geometry = (node: DoubleNode) =>
  node as unknown as { x: number; y: number; width: number; height: number };

function find(node: DoubleNode | undefined, name: string): DoubleNode | undefined {
  if (node === undefined) return undefined;
  for (const child of node.children) {
    if (child.name === name) return child;
    const found = find(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** The frames of the glyphs (one per Aspekto) a holder shows. */
const glyphsOf = (holder: DoubleNode | undefined) =>
  (holder?.children ?? []).filter((child) => child.name.startsWith("glyph-"));

/** One run of the repo's plugin in the double, its sets. */
async function draw() {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  return pageNodes(double).filter((node) => node.type === "COMPONENT_SET");
}
const drawn = once(draw);

async function variantOf(set: string, name: string) {
  const variant = (await drawn())
    .find((node) => node.name === set)
    ?.children.find((child) => child.name === name);
  if (variant === undefined) throw new Error(`${set}: ${name} missing`);
  return variant;
}

async function variantsOf(set: string) {
  const found = (await drawn()).find((node) => node.name === set);
  if (found === undefined) throw new Error(`${set} missing`);
  return found.children;
}

describe("Spec 035 2.3.1: the calendar of the datelektilo as large as the chevron of the elektilo", () => {
  it("every variant: the calendar's glyphs take the size the Skemo gives the trigger, the chevron's size", async () => {
    const chevron = glyphsOf(
      find(await variantOf("elektilo", "size=medium, state=rest"), "indicator"),
    );
    expect(chevron.length, "the chevron's glyphs").toBeGreaterThan(0);
    const side = geometry(chevron[0] as DoubleNode).width;
    for (const variant of await variantsOf("datelektilo")) {
      const trigger = find(variant, "trigger");
      const glyphs = glyphsOf(trigger);
      expect(glyphs.length, `${variant.name}: the calendar's glyphs`).toBe(chevron.length);
      for (const glyph of glyphs) {
        expect(glyph.boundVariables.width?.name, `${variant.name}: ${glyph.name} width`).toBe(
          "ero/datelektilo/trigger/size",
        );
        expect(glyph.boundVariables.height?.name, `${variant.name}: ${glyph.name} height`).toBe(
          "ero/datelektilo/trigger/size",
        );
        expect(
          [geometry(glyph).width, geometry(glyph).height],
          `${variant.name}: ${glyph.name} as large as the chevron`,
        ).toEqual([side, side]);
      }
    }
  });

  it("the calendar's vector scales with its glyph, as the chevron's does", async () => {
    const chevron = glyphsOf(
      find(await variantOf("elektilo", "size=medium, state=rest"), "indicator"),
    );
    const scale = (glyph: DoubleNode | undefined) =>
      glyph?.children.map((child) => JSON.stringify(child.properties.constraints ?? null));
    const variant = await variantOf("datelektilo", "mode=single, expanded=false, state=rest");
    const calendar = glyphsOf(find(variant, "trigger"));
    expect(calendar.map(scale)).toEqual(chevron.map(scale));
  });

  // The calendar is the icon of a butono of emphasis low on the web, as the ✕ beside it: its
  // vector takes that butono's label colour – a vector without a fill paints nothing in Figma.
  it("every variant: the calendar's vector is painted as the ✕ of the field", async () => {
    const paintOf = (node: DoubleNode | undefined) => {
      const [paint] = (node?.properties.fills ?? []) as {
        boundVariables?: { color?: { name?: string } };
      }[];
      return paint?.boundVariables?.color?.name;
    };
    const clear = find(
      await variantOf("datelektilo", "mode=single, expanded=false, state=rest"),
      "clear",
    );
    const cross = paintOf(glyphsOf(clear)[0]?.children[0]);
    expect(cross, "the ✕ is painted").toBeDefined();
    for (const variant of await variantsOf("datelektilo")) {
      for (const glyph of glyphsOf(find(variant, "trigger"))) {
        expect(glyph.children.length, `${variant.name}: ${glyph.name} holds its vector`).toBe(1);
        expect(paintOf(glyph.children[0]), `${variant.name}: ${glyph.name}`).toBe(cross);
      }
    }
  });

  it("every variant: the trigger stays a target of at least size.target.min, laid out as the ✕ of the kampo", async () => {
    const layout = (node: DoubleNode | undefined) =>
      ["layoutMode", "primaryAxisAlignItems", "counterAxisAlignItems"].map(
        (field) => node?.properties[field],
      );
    const clear = find(await variantOf("kampo", "size=medium, state=rest"), "clear");
    expect(layout(clear), "the ✕ of the kampo centres its glyph").toEqual([
      "HORIZONTAL",
      "CENTER",
      "CENTER",
    ]);
    for (const variant of await variantsOf("datelektilo")) {
      const trigger = find(variant, "trigger") as DoubleNode;
      expect(trigger.boundVariables.minWidth?.name, `${variant.name}: minWidth`).toBe(
        "ero/datelektilo/trigger/width",
      );
      expect(trigger.boundVariables.minHeight?.name, `${variant.name}: minHeight`).toBe(
        "ero/datelektilo/trigger/width",
      );
      const box = geometry(trigger);
      expect(box.width, `${variant.name}: trigger width`).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(box.height, `${variant.name}: trigger height`).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(layout(trigger), `${variant.name}: the calendar in the middle`).toEqual(layout(clear));
    }
  });
});

describe("Spec 035 2.3.3: the ✕ of the datelektilo as large and as strong as the kampo's", () => {
  it("every variant: the ✕'s glyphs bound to the field's clear size, as large as the kampo's (size medium)", async () => {
    const kampo = glyphsOf(find(await variantOf("kampo", "size=medium, state=rest"), "clear"));
    expect(kampo.length, "the kampo's ✕").toBeGreaterThan(0);
    const side = geometry(kampo[0] as DoubleNode).width;
    for (const variant of await variantsOf("datelektilo")) {
      const glyphs = glyphsOf(find(variant, "clear"));
      expect(glyphs.length, `${variant.name}: the ✕'s glyphs`).toBe(kampo.length);
      for (const glyph of glyphs) {
        expect(glyph.boundVariables.width?.name, `${variant.name}: ${glyph.name}`).toBe(
          "ero/datelektilo/clear/size",
        );
        expect(
          [geometry(glyph).width, geometry(glyph).height],
          `${variant.name}: ${glyph.name} as large as the kampo's`,
        ).toEqual([side, side]);
      }
    }
  });

  it("every variant: the ✕ stays a target of at least size.target.min, its glyph painted as the kampo's", async () => {
    const paintOf = (node: DoubleNode | undefined) => {
      const [paint] = (node?.properties.fills ?? []) as {
        boundVariables?: { color?: { name?: string } };
      }[];
      return paint?.boundVariables?.color?.name;
    };
    const kampo = glyphsOf(find(await variantOf("kampo", "size=medium, state=rest"), "clear"));
    const cross = paintOf(kampo[0]?.children[0]);
    expect(cross, "the kampo's ✕ is painted").toBeDefined();
    for (const variant of await variantsOf("datelektilo")) {
      const clear = find(variant, "clear") as DoubleNode;
      expect(clear.boundVariables.minWidth?.name, `${variant.name}: minWidth`).toBe(
        "ero/datelektilo/clear/width",
      );
      expect(geometry(clear).width, `${variant.name}: width`).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(geometry(clear).height, `${variant.name}: height`).toBeGreaterThanOrEqual(TARGET_MIN);
      for (const glyph of glyphsOf(clear)) {
        expect(paintOf(glyph.children[0]), `${variant.name}: ${glyph.name}`).toBe(cross);
      }
    }
  });
});

describe("Spec 035 2.3.2: the box of a toggle left of its texts in Figma, as on the web", () => {
  it("the double moves a child within its parent as Figma does (the acceptance of 30.10.)", () => {
    const api = modelDouble().figma as { createFrame: () => DoubleNode };
    const parent = api.createFrame();
    const [a, b, c] = [0, 1, 2].map((index) => {
      const child = api.createFrame();
      child.name = String.fromCharCode(97 + index);
      parent.appendChild(child);
      return child as DoubleNode;
    });
    const names = () => parent.children.map((child) => child.name).join("");
    // Towards the end: one place before the index, counted before the child is taken out.
    parent.insertChild(1, a as DoubleNode);
    expect(names()).toBe("abc");
    parent.insertChild(2, a as DoubleNode);
    expect(names()).toBe("bac");
    // Towards the start: at the index.
    parent.insertChild(0, c as DoubleNode);
    expect(names()).toBe("cba");
    expect(b).toBeDefined();
  });

  for (const set of ["markobutono", "sxaltilo"]) {
    it(`${set}, every variant: the ring with the box first, its texts after it, to its right`, async () => {
      for (const variant of await variantsOf(set)) {
        const field = find(variant, "field") as DoubleNode;
        const order = field.children
          .map((child) => child.name)
          .filter((name) => name === "focus-ring" || name === "texts");
        expect(order, variant.name).toEqual(["focus-ring", "texts"]);
        const ring = geometry(find(field, "focus-ring") as DoubleNode);
        const texts = geometry(find(field, "texts") as DoubleNode);
        expect(texts.x, `${variant.name}: the texts right of the box`).toBeGreaterThanOrEqual(
          ring.x + ring.width,
        );
      }
    });
  }

  it("elekto, every variant: in every option the ring with the box first, its label to its right", async () => {
    for (const variant of await variantsOf("elekto")) {
      const options = find(variant, "options") as DoubleNode;
      expect(options.children.length, variant.name).toBeGreaterThan(0);
      for (const option of options.children) {
        expect(
          option.children.map((child) => child.name),
          `${variant.name}: ${option.name}`,
        ).toEqual(["focus-ring", "option-label"]);
        const ring = geometry(option.children[0] as DoubleNode);
        const label = geometry(option.children[1] as DoubleNode);
        expect(label.x, `${variant.name}: ${option.name}`).toBeGreaterThanOrEqual(
          ring.x + ring.width,
        );
      }
    }
  });
});

describe("Spec 035 2.3.4: read-only in Figma, one rule for the twelve fields – the look of rest", () => {
  const READONLY_STATE = ["kampo", "listelektilo", "plurelektilo", "datelektilo"];
  const FIELDS = [
    "kampo",
    "tekstareo",
    "elektilo",
    "listelektilo",
    "plurelektilo",
    "kompletigilo",
    "datelektilo",
    "glitilo",
    "elekto",
    "markobutono",
    "sxaltilo",
    "alsxutilo",
  ];
  /** The colours the double paints a variant's control, text and label with (komuna, light). */
  const lookOf = (variant: DoubleNode) => {
    const shown = (node: DoubleNode | undefined, field: "fills" | "strokes") => {
      const [paint] = (node?.properties[field] ?? []) as { color?: unknown; visible?: boolean }[];
      return paint === undefined || paint.visible === false ? null : (paint.color ?? null);
    };
    const control = find(variant, "control");
    return {
      fill: shown(control, "fills"),
      border: shown(control, "strokes"),
      text: shown(find(control, "text"), "fills"),
      label: shown(find(variant, "label"), "fills"),
    };
  };

  it("only the fields with a read-only state have read-only variants", async () => {
    for (const set of FIELDS) {
      const readonly = (await variantsOf(set)).filter((variant) =>
        variant.name.includes("state=readonly"),
      );
      expect(readonly.length > 0, set).toBe(READONLY_STATE.includes(set));
    }
  });

  for (const set of READONLY_STATE) {
    it(`${set}, every read-only variant paints the fill, border, text and label of its rest`, async () => {
      const variants = await variantsOf(set);
      const readonly = variants.filter((variant) => variant.name.includes("state=readonly"));
      expect(readonly.length, set).toBeGreaterThan(0);
      for (const variant of readonly) {
        const rest = variants.find(
          (other) => other.name === variant.name.replace("state=readonly", "state=rest"),
        );
        expect(rest, `${variant.name}: its rest`).toBeDefined();
        expect(lookOf(variant), variant.name).toEqual(lookOf(rest as DoubleNode));
      }
    });
  }
});
