// Spec 036 Befund 1.6 (the Figma findings of the plugin acceptance after Spec 035), as data in the
// double. The double draws the plan of this repository (the values of komuna); Figma's own pixels
// are the maintainer's acceptance (Messanleitung in the contribution of S36-1.3).
// 1.6 elekto: an option not chosen is an empty ring – no dot, its circle not filled like the
// chosen one or like its own border.
// 1.6 markobutono, sxaltilo: the label in the middle of its box or switch, not above it.

import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleCollection, DoubleNode, DoubleVariable } from "./test-doubles/plugin.js";

type Paint = { boundVariables?: { color?: { id?: string; name?: string } } };

function find(node: DoubleNode | undefined, name: string): DoubleNode | undefined {
  if (node === undefined) return undefined;
  for (const child of node.children) {
    if (child.name === name) return child;
    const found = find(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** One run of the repo's plugin in the double: its sets and its variables. */
async function draw() {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  const api = double.figma as unknown as {
    variables: {
      getLocalVariableCollectionsAsync: () => Promise<DoubleCollection[]>;
      getLocalVariablesAsync: () => Promise<DoubleVariable[]>;
    };
  };
  const collections = await api.variables.getLocalVariableCollectionsAsync();
  const variables = await api.variables.getLocalVariablesAsync();
  const sets = pageNodes(double).filter((node) => node.type === "COMPONENT_SET");
  return { sets, collections, variables };
}
const drawn = once(draw);

async function variantsOf(set: string) {
  const found = (await drawn()).sets.find((node) => node.name === set);
  if (found === undefined) throw new Error(`${set} missing`);
  return found.children;
}

/**
 * The value a variable stands for in a colour scheme: every collection in its default mode but the
 * scheme's, aliases followed – what a layer of that scheme shows.
 */
async function resolverOf(scheme: "light" | "dark") {
  const { collections, variables } = await drawn();
  const byId = new Map(variables.map((variable) => [variable.id, variable]));
  return (id: string | undefined): string => {
    let current = id === undefined ? undefined : byId.get(id);
    for (let depth = 0; current !== undefined && depth < 32; depth++) {
      const collection = collections.find((each) => each.id === current?.variableCollectionId);
      const mode =
        collection?.name === "color-scheme"
          ? collection.modes.find((each) => each.name === scheme)
          : collection?.modes.find((each) => each.modeId === collection.defaultModeId);
      const value = current.valuesByMode[mode?.modeId ?? ""] as
        | { type?: string; id?: string }
        | undefined;
      if (value?.type !== "VARIABLE_ALIAS") return JSON.stringify(value ?? null);
      current = byId.get(value.id ?? "");
    }
    return "unresolved";
  };
}

const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
  ((node?.properties[field] ?? []) as Paint[])[0]?.boundVariables?.color;

describe("Spec 036 1.6: an elekto option not chosen is an empty ring in Figma", () => {
  for (const scheme of ["light", "dark"] as const) {
    it(`every variant, ${scheme}: the dot not seen, the circle filled neither like the chosen one nor like its border`, async () => {
      const resolve = await resolverOf(scheme);
      const filled: string[] = [];
      for (const variant of await variantsOf("elekto")) {
        const options = find(variant, "options")?.children ?? [];
        const rows = options.map((option) => {
          const control = find(option, "control");
          return { option, control, indicator: find(control, "indicator") };
        });
        const chosen = rows.filter((row) => row.indicator?.properties.opacity !== 0);
        expect(chosen.length, `${variant.name}: one option chosen`).toBe(1);
        const chosenFill = resolve(paintOf(chosen[0]?.control, "fills")?.id);
        const others = rows.filter((row) => !chosen.includes(row));
        expect(others.length, `${variant.name}: options not chosen`).toBeGreaterThan(0);
        for (const row of others) {
          const fill = resolve(paintOf(row.control, "fills")?.id);
          const border = resolve(paintOf(row.control, "strokes")?.id);
          if (fill === chosenFill || fill === border) {
            filled.push(`${variant.name}: ${row.option.name} ${fill}`);
          }
        }
      }
      expect(filled).toEqual([]);
    });
  }
});

/** Where a node lies in its variant: its place and that of every layer between them. */
function placeIn(variant: DoubleNode, node: DoubleNode) {
  let x = 0;
  let y = 0;
  for (let current: DoubleNode | undefined = node; current !== undefined && current !== variant; ) {
    const box = current as unknown as { x: number; y: number };
    x += box.x;
    y += box.y;
    current = current.parent;
  }
  const { width, height } = node as unknown as { width: number; height: number };
  return { x, y, width, height };
}

/** The rounding of the double's picture (test-doubles/bild.ts): two places. */
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The vertical middle Figma gives a node: the double lays every child at the start of its row
 * (it knows no counterAxisAlignItems), Figma centres it where the row says CENTER. So the middle
 * of a node is that of the outermost row above it that centres its children across – each row of
 * that chain centres the next one in it – or the node's own where its parent does not centre it.
 */
function middleIn(variant: DoubleNode, node: DoubleNode) {
  let centred = node;
  for (
    let parent = node.parent;
    parent !== undefined &&
    parent !== variant &&
    parent.properties.layoutMode === "HORIZONTAL" &&
    parent.properties.counterAxisAlignItems === "CENTER";
    parent = parent.parent
  ) {
    centred = parent;
  }
  const box = placeIn(variant, centred);
  return round(box.y + box.height / 2);
}

describe("Spec 036 1.6: the label of markobutono and sxaltilo in the middle of its box or switch in Figma", () => {
  for (const set of ["markobutono", "sxaltilo"]) {
    it(`${set}, every variant: the middle of the label's line is the middle of the control`, async () => {
      const off: string[] = [];
      for (const variant of await variantsOf(set)) {
        const control = find(variant, "control") as DoubleNode;
        const label = find(variant, "label") as DoubleNode;
        const box = placeIn(variant, control);
        const line = placeIn(variant, label);
        const middle = middleIn(variant, control);
        const labelMiddle = middleIn(variant, label);
        if (middle !== labelMiddle)
          off.push(`${variant.name}: control ${middle}, label ${labelMiddle}`);
        expect(line.x, `${variant.name}: the label right of the control`).toBeGreaterThanOrEqual(
          box.x + box.width,
        );
      }
      expect(off).toEqual([]);
    });
  }
});
