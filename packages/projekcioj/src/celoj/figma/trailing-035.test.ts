// Spec 035 2.1 (Nachtrag 30.10.), the right edge of a field set in Figma by the Skemo's trailing:
// in the control, after the text, from the inside out the status icon → the spinner → the clear
// button (✕) → the field's icon (the chevron of a select, the calendar of a date picker) – every
// one inside the control, the same order the web shows. The plan carries the Skemo's trailing and
// the plugin places the parts by it, not by an order of its own. The status icon is the kampo's own
// (A-kampo-4): the elektilo and the datelektilo have none to place.

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { komuna02PluginCode, modelDouble, pageNodes, plan, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const trailingOf = (ero: string) =>
  modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo.trailing;

/** The parts of the edge a set has: what the Figma control draws of the Skemo's trailing. */
const CASES = [
  { set: "kampo", state: "size=medium, state=", end: ["status-icon", "spinner", "clear"] },
  { set: "elektilo", state: "size=medium, state=", end: ["spinner", "clear", "indicator"] },
  {
    set: "datelektilo",
    state: "mode=single, expanded=false, state=",
    end: ["spinner", "clear", "trigger"],
  },
];
const STATUSES = ["warning", "invalid", "success"];

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

/** One run of a plugin source in the double, the sets on its page. */
async function draw(source: string) {
  const double = modelDouble();
  await run(double, source);
  return pageNodes(double);
}
let drawn: ReturnType<typeof draw> | undefined;
const nodes = () => {
  drawn ??= draw(komuna02PluginCode());
  return drawn;
};

/** A variant with every toggled part of the end shown, as an instance with them on shows it. */
function shown(sets: DoubleNode[], set: string, name: string) {
  const node = sets
    .find((candidate) => candidate.name === set)
    ?.children.find((child) => child.name === name);
  if (node === undefined) throw new Error(`${set}: ${name} missing`);
  for (const part of ["spinner", "clear"]) {
    const found = find(node, part);
    if (found !== undefined) Object.assign(found, { visible: true });
  }
  return node;
}

describe("Spec 035 2.1: the plan carries the Skemo's trailing", () => {
  it("the kampo's trailing names the status icon first, before the spinner", () => {
    expect(trailingOf("kampo")?.slice(0, 3)).toEqual(["status-icon", "spinner", "clear"]);
  });

  it.each(CASES)("$set: the plan's component carries the Skemo's trailing", ({ set }) => {
    const component = plan.components.find((each) => each.set === set) as
      | { trailing?: readonly string[] }
      | undefined;
    expect(trailingOf(set)).toBeDefined();
    expect(component?.trailing).toEqual(trailingOf(set));
  });
});

describe("Spec 035 2.1: text │ status icon → spinner → ✕ → field icon │ border, in Figma", () => {
  const cases = CASES.flatMap((entry) =>
    STATUSES.map((status) => ({ ...entry, variant: `${entry.state}${status}` })),
  );
  it.each(cases)(
    "$set, $variant: the text, then $end – in the control, in that order",
    async (entry) => {
      const variant = shown(await nodes(), entry.set, entry.variant);
      const control = find(variant, "control") as DoubleNode;
      const names = control.children.map((child) => child.name);
      expect(names.includes("status-icon"), "a status icon of its own").toBe(
        entry.end.includes("status-icon"),
      );
      expect(
        names.filter((name) =>
          ["text", "status-icon", "spinner", "clear", "indicator", "trigger"].includes(name),
        ),
      ).toEqual(["text", ...entry.end]);
      const inner = boxIn(control, variant);
      let previous = boxIn(find(control, "text") as DoubleNode, variant).right;
      for (const part of entry.end) {
        const node = find(control, part) as DoubleNode;
        expect(geometry(node).visible, `${part} shown`).not.toBe(false);
        const box = boxIn(node, variant);
        expect(box.left, `${part} after what stands before it`).toBeGreaterThanOrEqual(
          previous - 0.5,
        );
        expect(box.right, `${part} inside the control`).toBeLessThanOrEqual(inner.right + 0.5);
        expect(box.top, `${part} inside the control`).toBeGreaterThanOrEqual(inner.top - 0.5);
        expect(box.bottom, `${part} inside the control`).toBeLessThanOrEqual(inner.bottom + 0.5);
        previous = box.right;
      }
    },
  );

  it("the plugin places the parts by the plan's trailing, not by an order of its own", async () => {
    const source = komuna02PluginCode();
    const ordered = JSON.stringify(trailingOf("kampo"));
    const turned = JSON.stringify(["clear", "spinner", "status-icon", "decrement", "increment"]);
    const key = `"trailing":${ordered}`;
    expect(source.includes(key), "the plan in the plugin carries the kampo's trailing").toBe(true);
    const sets = await draw(source.replace(key, `"trailing":${turned}`));
    const control = find(shown(sets, "kampo", "size=medium, state=warning"), "control");
    expect(
      control?.children
        .map((child) => child.name)
        .filter((name) => ["text", "status-icon", "spinner", "clear"].includes(name)),
    ).toEqual(["text", "clear", "spinner", "status-icon"]);
  });
});
