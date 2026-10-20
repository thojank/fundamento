// Spec 020 ① (G2, E3, Abnahme 5): the plugin draws an example frame per Sxablono — no component
// set, no variants — in a frame „Sxablonoj" of the section „Fundamento" next to the frame „Eroj".
// Each region is an auto-layout frame of its name; what stands in it are instances of the Ero
// sets (not detached copies), so the example follows a change of mode as the sets do. A second
// run finds the frames again and makes no second one.

import { describe, expect, it } from "vitest";
import { descendant, modelDouble, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const source = repoFiles["figma/plugin/code.js"] ?? "";

const instancesIn = (node: DoubleNode | undefined): DoubleNode[] =>
  (node?.children ?? []).flatMap((child) =>
    child.type === "INSTANCE" ? [child, ...instancesIn(child)] : instancesIn(child),
  );

describe("the plugin draws the Sxablonoj as example frames (Spec 020 ①)", () => {
  it("a frame Sxablonoj beside Eroj, a frame per Sxablono, a frame per region with instances of the sets", async () => {
    const double = modelDouble();
    await run(double, source);
    const nodes = pageNodes(double);
    const frame = nodes.find((node) => node.name === "Sxablonoj");
    expect(frame?.type).toBe("FRAME");
    expect(nodes.find((node) => node.name === "Eroj")).toBeDefined();
    expect(frame?.children.map((child) => child.name)).toEqual(["pagxo", "sxelo"]);
    const sxelo = frame?.children.find((child) => child.name === "sxelo");
    expect(sxelo?.children.map((child) => child.name)).toEqual([
      "brand",
      "principal",
      "nav",
      "notices",
      "main",
    ]);
    for (const region of sxelo?.children ?? [])
      expect(region.properties.layoutMode, region.name).toMatch(/^(HORIZONTAL|VERTICAL)$/);
    const nav = instancesIn(descendant(sxelo, "nav"));
    expect(nav).toHaveLength(1);
    // An instance of a variant of the set navigado, not a copy.
    expect(nav[0]?.properties.mainComponent).toMatchObject({ parent: { name: "navigado" } });
    const pagxo = frame?.children.find((child) => child.name === "pagxo");
    const title = instancesIn(descendant(pagxo, "title"));
    expect(title[0]?.properties.mainComponent).toMatchObject({ parent: { name: "titolo" } });
    const actions = instancesIn(descendant(pagxo, "actions"));
    expect(
      actions.map((node) => (node.properties.mainComponent as DoubleNode).parent?.name),
    ).toEqual(["butono", "menuo"]);
  });

  it("a second run finds the frames again: no second Sxablonoj, no second instance", async () => {
    const double = modelDouble();
    await run(double, source);
    const count = () => pageNodes(double).filter((node) => node.name === "Sxablonoj").length;
    const instances = () =>
      instancesIn(pageNodes(double).find((node) => node.name === "Sxablonoj")).length;
    const before = instances();
    await run(double, source);
    expect(count()).toBe(1);
    expect(instances()).toBe(before);
  });
});
