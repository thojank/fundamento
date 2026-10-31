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
