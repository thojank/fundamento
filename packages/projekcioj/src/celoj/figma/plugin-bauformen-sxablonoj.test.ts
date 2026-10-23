// Spec 027 B-8: the five Sxablonoj are components in the frame „Sxablonoj", their regions Figma
// slots (measured M4c–M7, 2026-10-23: a slot of a component takes its default content, an
// instance takes a designer's content into it, a slot lies in a row of the component and fills
// it). The sxelo is a set: width compact, medium, expanded × sidebar true, false. What stands in
// a region by default is what the example frames held since Spec 020: instances of the Ero sets
// with the Vitrino's words. A second run makes nothing new.

import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const source = repoFiles["figma/plugin/code.js"] ?? "";

const drawn = once(async () => {
  const double = modelDouble();
  await run(double, source);
  return double;
});

const frameOf = (double: Awaited<ReturnType<typeof drawn>>) =>
  pageNodes(double).find((node) => node.name === "Sxablonoj") as DoubleNode;
const below = (node: DoubleNode, type: string): DoubleNode[] =>
  node.children.flatMap((child) => [
    ...(child.type === type ? [child] : []),
    ...below(child, type),
  ]);
const named = (node: DoubleNode, name: string): DoubleNode | undefined => {
  for (const child of node.children) {
    if (child.name === name) return child;
    const found = named(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
};
const mainOf = (node: DoubleNode | undefined) =>
  (node as unknown as { mainComponent?: DoubleNode } | undefined)?.mainComponent;
type Definitions = Record<string, { type: string }>;
const definitionsOf = (node: DoubleNode) =>
  (node.properties.componentPropertyDefinitions ?? {}) as Definitions;

const REGIONS: Readonly<Record<string, readonly string[]>> = {
  filtrilo: ["fields", "actions", "status"],
  formularo: ["fields", "actions"],
  pagxo: ["title", "badges", "subtitle", "actions", "sections"],
  redaktilo: ["field", "preview"],
  sxelo: ["brand", "principal", "nav", "notices", "main"],
};

describe("B-8: the Sxablonoj are components, their regions slots", () => {
  it("the frame Sxablonoj holds the set sxelo and a component per other Sxablono", async () => {
    const frame = frameOf(await drawn());
    expect(frame.children.map((child) => `${child.type} ${child.name}`)).toEqual([
      "COMPONENT filtrilo",
      "COMPONENT formularo",
      "COMPONENT pagxo",
      "COMPONENT redaktilo",
      "COMPONENT_SET sxelo",
    ]);
    const sxelo = frame.children.find((child) => child.name === "sxelo") as DoubleNode;
    expect(sxelo.children.map((variant) => variant.name).sort()).toEqual(
      ["compact", "medium", "expanded"]
        .flatMap((width) =>
          ["true", "false"].map((sidebar) => `width=${width}, sidebar=${sidebar}`),
        )
        .sort(),
    );
  });

  it.each(Object.entries(REGIONS))(
    "%s: one SLOT property per region, every slot connected to it",
    async (name, regions) => {
      const frame = frameOf(await drawn());
      const owner = frame.children.find((child) => child.name === name) as DoubleNode;
      const slots = Object.entries(definitionsOf(owner)).filter(
        ([, definition]) => definition.type === "SLOT",
      );
      expect(slots.map(([key]) => key.split("#")[0]).sort()).toEqual([...regions].sort());
      const components = owner.type === "COMPONENT_SET" ? owner.children : [owner];
      for (const component of components) {
        for (const region of regions) {
          const slot = named(component, region);
          expect(slot?.type, `${component.name}: ${region}`).toBe("SLOT");
          const key = (
            slot?.properties.componentPropertyReferences as { slotContentId?: string } | undefined
          )?.slotContentId;
          expect(key?.split("#")[0], `${component.name}: ${region}`).toBe(region);
          expect(Object.keys(definitionsOf(owner))).toContain(key);
        }
      }
    },
  );

  it("a slot holds the Vitrino's example: instances of the sets, with their words", async () => {
    const frame = frameOf(await drawn());
    const pagxo = frame.children.find((child) => child.name === "pagxo") as DoubleNode;
    const actions = named(pagxo, "actions") as DoubleNode;
    expect(actions.children.map((child) => mainOf(child)?.parent?.name)).toEqual([
      "butono",
      "menuo",
    ]);
    const sxelo = frame.children.find((child) => child.name === "sxelo") as DoubleNode;
    for (const variant of sxelo.children) {
      const nav = named(variant, "nav") as DoubleNode;
      expect(mainOf(nav.children[0])?.parent?.name, variant.name).toBe("navigado");
    }
  });

  it("sxelo: the width of a variant is its container token; with a sidebar the nav stands beside main", async () => {
    const frame = frameOf(await drawn());
    const sxelo = frame.children.find((child) => child.name === "sxelo") as DoubleNode;
    const widths: Record<string, string> = {
      compact: "size/container/small",
      medium: "size/container/medium",
      expanded: "size/container/large",
    };
    for (const variant of sxelo.children) {
      const width = /width=([a-z]+)/.exec(variant.name)?.[1] ?? "";
      expect(variant.boundVariables.width?.name, variant.name).toBe(widths[width]);
      expect(variant.properties.layoutSizingHorizontal, variant.name).toBe("FIXED");
      const nav = named(variant, "nav") as DoubleNode;
      const main = named(variant, "main") as DoubleNode;
      if (variant.name.includes("sidebar=true")) {
        expect(nav.parent, variant.name).toBe(named(variant, "body"));
        expect(nav.parent?.properties.layoutMode, variant.name).toBe("HORIZONTAL");
        expect(nav.properties.layoutMode, variant.name).toBe("VERTICAL");
      } else {
        expect(nav.parent, variant.name).toBe(main.parent);
      }
      // The web stacks the header below 960 px (its container query): compact is narrower.
      expect(named(variant, "header")?.properties.layoutMode, variant.name).toBe(
        width === "compact" ? "VERTICAL" : "HORIZONTAL",
      );
    }
  });

  it("the parts take the Sxablono's tokens: the header's fill, gap and padding, the line under it", async () => {
    const frame = frameOf(await drawn());
    const sxelo = frame.children.find((child) => child.name === "sxelo") as DoubleNode;
    const variant = sxelo.children[0] as DoubleNode;
    const header = named(variant, "header") as DoubleNode;
    expect(header.boundVariables.itemSpacing?.name).toBe("sxablono/sxelo/header/gap");
    expect(header.boundVariables.paddingLeft?.name).toBe("sxablono/sxelo/header/inline/padding");
    const fill = (
      header.properties.fills as { boundVariables?: { color?: { name: string } } }[]
    )[0];
    expect(fill?.boundVariables?.color?.name).toBe("sxablono/sxelo/header/fill");
    expect(header.boundVariables.strokeBottomWeight?.name).toBe("sxablono/sxelo/divider/width");
    expect(variant.boundVariables.itemSpacing?.name).toBe("sxablono/sxelo/frame/gap");
    const pagxo = frame.children.find((child) => child.name === "pagxo") as DoubleNode;
    expect(pagxo.boundVariables.width?.name).toBe("sxablono/pagxo/container/width");
  });

  it("an instance of a Sxablono takes a designer's content into a slot", async () => {
    const double = await drawn();
    const frame = frameOf(double);
    const pagxo = frame.children.find((child) => child.name === "pagxo") as DoubleNode;
    const instance = (pagxo as unknown as { createInstance(): DoubleNode }).createInstance();
    const text = (double.figma as { createText(): DoubleNode }).createText();
    const sections = named(instance, "sections") as DoubleNode;
    sections.appendChild(text);
    expect(sections.children).toContain(text);
    instance.remove();
  });

  it("a second run finds every component and slot again and makes no node", async () => {
    const double = modelDouble();
    await run(double, source);
    const count = () => {
      const frame = frameOf(double);
      return [
        below(frame, "COMPONENT").length,
        below(frame, "SLOT").length,
        below(frame, "INSTANCE").length,
      ];
    };
    const before = count();
    const nodes = double.counts.nodes;
    await run(double, source);
    expect(count()).toEqual(before);
    expect(double.counts.nodes).toBe(nodes);
  });
});
