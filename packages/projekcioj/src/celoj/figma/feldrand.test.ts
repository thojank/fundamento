// Spec 029 ②b-1, Abnahme #122 (Maintainer, 30.10.), the picture of the right edge in Figma: in the
// control of a field, after the text, from the inside out the spinner, the clear button and the
// field's icon (the chevron of a select, the calendar of a date picker) – every one inside the
// control, never over its border, never before the text; the ✕ as large as the field's icon; the
// spinner not beside the label; a field set as wide as a field stands (not its words alone).

import { describe, expect, it } from "vitest";
import { komuna02PluginCode, modelDouble, once, pageNodes, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

/** One run of the plan in the double, read by every case. */
async function draw() {
  const double = modelDouble();
  await run(double, komuna02PluginCode());
  return double;
}
const drawn = once(draw);

const geometry = (node: DoubleNode) =>
  node as unknown as { x: number; y: number; width: number; height: number; visible: boolean };

/** The node's box within the variant: its x and y summed up to the variant. */
function boxIn(node: DoubleNode, variant: DoubleNode) {
  let x = 0;
  let y = 0;
  let current: DoubleNode | undefined = node;
  while (current !== undefined && current !== variant) {
    x += geometry(current).x;
    y += geometry(current).y;
    current = current.parent as DoubleNode | undefined;
  }
  return { left: x, top: y, right: x + geometry(node).width, bottom: y + geometry(node).height };
}

function find(node: DoubleNode, name: string): DoubleNode | undefined {
  if (node.name === name) return node;
  for (const child of node.children) {
    const found = find(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** A variant of a set with every toggled part of the end shown, as an instance shows it. */
async function variantOf(set: string, name: string) {
  const double = await drawn();
  const node = pageNodes(double)
    .find((candidate) => candidate.name === set)
    ?.children.find((child) => child.name === name);
  if (node === undefined) throw new Error(`${set}: ${name} missing`);
  for (const part of ["spinner", "clear"]) {
    const found = find(node, part);
    if (found !== undefined) Object.assign(found, { visible: true });
  }
  return node;
}

const CASES = [
  { set: "kampo", variant: "size=medium, state=rest", end: ["spinner", "clear"] },
  { set: "elektilo", variant: "size=medium, state=rest", end: ["spinner", "clear", "indicator"] },
  {
    set: "datelektilo",
    variant: "mode=single, expanded=false, state=rest",
    end: ["spinner", "clear", "trigger"],
  },
];

describe("Abnahme #122: the right edge of a field set in Figma", () => {
  it.each(CASES)("$set: the text, then $end – inside the control, in that order", async (entry) => {
    const variant = await variantOf(entry.set, entry.variant);
    const control = find(variant, "control") as DoubleNode;
    const names = control.children.map((child) => child.name);
    expect(names.filter((name) => ["text", ...entry.end].includes(name))).toEqual([
      "text",
      ...entry.end,
    ]);
    const inner = boxIn(control, variant);
    let previous = boxIn(find(control, "text") as DoubleNode, variant).right;
    for (const part of entry.end) {
      const box = boxIn(find(control, part) as DoubleNode, variant);
      expect(box.left, `${part} after what stands before it`).toBeGreaterThanOrEqual(
        previous - 0.5,
      );
      expect(box.right, `${part} inside the control`).toBeLessThanOrEqual(inner.right + 0.5);
      expect(box.top, `${part} inside the control`).toBeGreaterThanOrEqual(inner.top - 0.5);
      expect(box.bottom, `${part} inside the control`).toBeLessThanOrEqual(inner.bottom + 0.5);
      previous = box.right;
    }
    // The spinner is the field's, not the label's.
    const labelRow = find(variant, "label-row");
    expect(labelRow === undefined ? undefined : find(labelRow, "spinner")).toBeUndefined();
  });

  it("the ✕ is as large as the field's icon, the button around it the target; the calendar of a date picker drawn", async () => {
    const elektilo = await variantOf("elektilo", "size=medium, state=rest");
    const datelektilo = await variantOf("datelektilo", "mode=single, expanded=false, state=rest");
    const trigger = find(datelektilo, "trigger") as DoubleNode;
    expect(trigger.children.length, "the calendar's glyphs").toBeGreaterThan(0);
    const glyphOf = (clear: DoubleNode) => geometry(clear.children[0] as DoubleNode).width;
    const clear = find(elektilo, "clear") as DoubleNode;
    expect(glyphOf(clear)).toBe(geometry(find(elektilo, "indicator") as DoubleNode).width);
    // The button is the target (size.target.min, as large as the calendar's trigger).
    expect(geometry(clear).width).toBe(geometry(trigger).width);
    expect(geometry(clear).height).toBe(geometry(trigger).width);
    // Spec 035 2.3.1 and 2.3.3: the ✕ of the date picker as large as the calendar beside it, both
    // as large as a chevron; the buttons around them the target.
    const dateClear = find(datelektilo, "clear") as DoubleNode;
    expect(glyphOf(dateClear)).toBe(glyphOf(trigger));
    expect(glyphOf(dateClear)).toBe(glyphOf(find(elektilo, "indicator") as DoubleNode));
    expect(geometry(dateClear).width).toBe(geometry(trigger).width);
  });

  // Decision of the maintainer (30.10.): markobutono and sxaltilo show the spinner directly after
  // the label's text, as the web does – in the row of the label, which hugs them.
  it.each(["markobutono", "sxaltilo"])("%s: the spinner directly after the label", async (set) => {
    const double = await drawn();
    const name = pageNodes(double)
      .find((candidate) => candidate.name === set)
      ?.children.map((child) => child.name)
      .find((each) => each.includes("size=medium") && each.includes("state=rest"));
    const variant = await variantOf(set, name ?? "");
    const row = find(variant, "label-row") as DoubleNode;
    expect(row.children.map((child) => child.name)).toEqual(["label", "spinner"]);
    expect(row.properties.layoutSizingHorizontal ?? "HUG").toBe("HUG");
    expect(row.properties.primaryAxisAlignItems ?? "MIN").toBe("MIN");
    const label = boxIn(find(row, "label") as DoubleNode, variant);
    const spinner = boxIn(find(row, "spinner") as DoubleNode, variant);
    expect(spinner.left - label.right).toBeGreaterThanOrEqual(-0.5);
    expect(spinner.left - label.right).toBeLessThanOrEqual(16);
  });

  it.each(CASES)("$set: as wide as a field stands, not its words alone", async (entry) => {
    const variant = await variantOf(entry.set, entry.variant);
    expect(geometry(variant).width).toBeGreaterThanOrEqual(240);
  });
});
