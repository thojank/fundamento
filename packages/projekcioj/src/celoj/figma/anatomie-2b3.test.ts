// Spec 036 Teil 5 ②b-3 (Spec 029 abgleich.json, aspect "anatomie") in Figma: a new part is drawn
// where the set shows it by default, as the web does without the content that brings it; a part
// that only content or a property value shows has no node and names its Jugxo (FIGMA_NOT_DRAWN,
// check:parity).

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { FIGMA_NOT_DRAWN } from "./figma.js";
import {
  komuna02PluginCode,
  modelDouble,
  once,
  pageNodes,
  plan,
  run,
} from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const setOf = (name: string) => {
  const set = plan.components.find((candidate) => candidate.set === name);
  if (set === undefined) throw new Error(`${name} missing in the plan`);
  return set;
};

/** One run of the plan in the double, read by every case. */
async function draw() {
  const double = modelDouble();
  await run(double, komuna02PluginCode());
  return double;
}
const drawn = once(draw);

function find(node: DoubleNode, name: string): DoubleNode | undefined {
  if (node.name === name) return node;
  for (const child of node.children) {
    const found = find(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

const geometry = (node: DoubleNode) =>
  node as unknown as { x: number; y: number; width: number; height: number; visible: boolean };

/** The node's top within the variant: its y summed up to the variant. */
function topIn(node: DoubleNode, variant: DoubleNode): number {
  let y = 0;
  let current: DoubleNode | undefined = node;
  while (current !== undefined && current !== variant) {
    y += geometry(current).y;
    current = current.parent as DoubleNode | undefined;
  }
  return y;
}

async function firstVariant(set: string): Promise<DoubleNode> {
  const double = await drawn();
  const node = pageNodes(double).find((candidate) => candidate.name === set)?.children[0];
  if (node === undefined) throw new Error(`${set} missing`);
  return node;
}

/** The Jugxoj of the repo Modelo by id, for the parts Figma leaves out. */
const { modelo } = loadModelo(defaultModeloSource());
const jugxo = (id: string | undefined) =>
  (modelo?.jugxoj ?? []).find((candidate) => candidate.id === id);

/** A part without a node names an approved Jugxo of the target figma. */
function expectNotDrawn(key: string) {
  const id = FIGMA_NOT_DRAWN[key];
  expect(id, key).toMatch(/^jug_/);
  expect(jugxo(id)).toMatchObject({ decision: "approved", ref: { celo: "figma" } });
}

describe("②b-3 A-markobutono-4, A-sxaltilo-4 in Figma: help under the label", () => {
  it.each(["markobutono", "sxaltilo"])("%s: the plan gives help the Vitrino's words", (name) => {
    expect(typeof (setOf(name) as { texts?: Record<string, unknown> }).texts?.help).toBe("string");
  });

  it.each(["markobutono", "sxaltilo"])(
    "%s: every variant draws help under its label, shown by default",
    async (name) => {
      const variant = await firstVariant(name);
      const help = find(variant, "help");
      const label = find(variant, "label");
      if (help === undefined || label === undefined)
        throw new Error(`${name}: help or label missing`);
      expect(help.type).toBe("TEXT");
      expect(geometry(help).visible).toBe(true);
      expect(topIn(help, variant)).toBeGreaterThan(topIn(label, variant));
    },
  );
});

describe("②b-3 A-elekto-4 in Figma: the description of an option stands with its content", () => {
  it("elekto: option-description has no node and names its Jugxo", () => {
    expectNotDrawn("elekto:option-description");
  });
});

describe("②b-3 A-glitilo-4 in Figma: ticks a property, the tick stands with it", () => {
  it("glitilo: ticks is a BOOLEAN of the set; the part tick has no node and names its Jugxo", () => {
    expect(setOf("glitilo").properties.ticks).toBe("BOOLEAN");
    expectNotDrawn("glitilo:tick");
  });
});

describe("②b-3 A-alsxutilo-4 in Figma: the upload icon in the dropzone", () => {
  it("alsxutilo: a variant with a dropzone draws the icon first in the zone; without, it hides it", async () => {
    const double = await drawn();
    const set = pageNodes(double).find((candidate) => candidate.name === "alsxutilo");
    const variants = set?.children ?? [];
    const zoned = variants.find((variant) => variant.name.includes("dropzone=true"));
    const plain = variants.find((variant) => variant.name.includes("dropzone=false"));
    if (zoned === undefined || plain === undefined) throw new Error("alsxutilo variants missing");
    const zone = find(zoned, "dropzone");
    expect(zone?.children[0]?.name).toBe("icon");
    expect(geometry(zone?.children[0] as DoubleNode).visible).toBe(true);
    const plainZone = find(plain, "dropzone");
    expect(plainZone?.children[0]?.name).toBe("icon");
    expect(geometry(plainZone?.children[0] as DoubleNode).visible).toBe(false);
  });
});

describe("②b-3 A-elektilo-4, A-listelektilo-4, A-kompletigilo-4, A-plurelektilo-4 in Figma", () => {
  it.each([
    "elektilo:group-heading",
    "listelektilo:group-heading",
    "listelektilo:divider",
    "kompletigilo:group-heading",
    "plurelektilo:group-heading",
    "plurelektilo:select-all",
  ])("%s has no node and names its Jugxo", (key) => {
    expectNotDrawn(key);
  });

  it("plurelektilo: select-all is a BOOLEAN of the set", () => {
    expect(setOf("plurelektilo").properties["select-all"]).toBe("BOOLEAN");
  });
});

describe("②b-3 A-menuo-4 in Figma: icon and heading stand with their content", () => {
  it.each(["menuo:icon", "menuo:group-heading"])("%s has no node and names its Jugxo", (key) => {
    expectNotDrawn(key);
  });
});

describe("②b-3 A-navigado-4 in Figma: section headings and icons stand with their content", () => {
  it.each(["navigado:section-heading", "navigado:icon"])(
    "%s has no node and names its Jugxo",
    (key) => {
      expectNotDrawn(key);
    },
  );
});
