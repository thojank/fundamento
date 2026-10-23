// Spec 027 B-1 (Dehnung): an Ero that takes the width of its container in code (Uzo layout size
// container) fills the width of its instance in Figma. Its variant has a fixed width — the width
// it hugged before (measured, Abnahme 3) — and its inner parts fill it where the code lets them
// fill; icons, indicators and thumbs stay fixed; the rows of a table fill, its first column takes
// the rest. Measured in Figma (plan 027, M2/M3): a hugging root would shrink to its label once its
// whole chain fills, so the root is fixed. An instance in the double holds its main's layers since
// Spec 027, so the cases resize an instance, as a designer does.

import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

/** One run of the plan in the double, read by every case (Vitest collects nothing here). */
async function draw() {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  return double;
}
const drawn = once(draw);

type Sized = DoubleNode & { width: number; height: number; resize(w: number, h: number): void };
const sized = (node: DoubleNode | undefined) => node as Sized;

/** Every layer of that name below `node`, at any depth, in order. */
const named = (node: DoubleNode, name: string): DoubleNode[] =>
  node.children.flatMap((child) => [
    ...(child.name === name ? [child] : []),
    ...named(child, name),
  ]);

/**
 * The parts that grow with the instance, per container Ero (Uzo layout size container); a part
 * matched by a pattern grows wherever it stands. Not here, because fixed in code: icons,
 * indicators, thumbs, the stand-ins of buttons, the list and calendar of a field (their width is
 * size.container.small, bound), the actions of a notice (a placeholder that hugs what is dropped).
 */
const GROWING: Readonly<Record<string, readonly string[]>> = {
  kampo: ["field", "focus-ring", "focus-gap", "control"],
  elektilo: ["field", "focus-ring", "focus-gap", "control"],
  tekstareo: ["field", "focus-ring", "focus-gap", "control"],
  listelektilo: ["field", "control"],
  plurelektilo: ["field", "control"],
  kompletigilo: ["field", "control"],
  datelektilo: ["field", "row", "control"],
  alsxutilo: ["field", "dropzone"],
  glitilo: ["field", "row", "track"],
  apartigilo: ["control"],
  atributlisto: ["list", "entry-1", "entry-2", "entry-3"],
  avizo: ["control", "texts"],
  dialogo: ["surface", "actions"],
  faldilo: ["control", "focus-ring", "focus-gap", "summary", "content"],
  karto: ["surface", "body"],
  kodbloko: ["control"],
  langetaro: ["control", "panel"],
  markdovido: ["control", "items-list", "quote"],
  mezurilo: ["control", "track"],
  navigado: ["control"],
  pagxigilo: ["control"],
  plenstato: ["control"],
  spuro: ["control"],
  tabelo: [
    "region",
    "head",
    "row-1",
    "row-2",
    "row-3",
    "head-1",
    "cell-1-1",
    "cell-2-1",
    "cell-3-1",
  ],
  teksto: ["control"],
  titolo: ["control"],
};

/** The field Eros of Abnahme 2: at instance width 400 the field is 400, the control with it. */
const FIELDS = [
  "kampo",
  "elektilo",
  "tekstareo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
];

const instanceOf = (variant: DoubleNode, double: Awaited<ReturnType<typeof drawn>>) => {
  const instance = sized((variant as unknown as { createInstance(): DoubleNode }).createInstance());
  (double.figma as { currentPage: DoubleNode }).currentPage.appendChild(instance);
  return instance;
};

describe("B-1: a container Ero fills the width of its instance", () => {
  it.each(Object.entries(GROWING))(
    "%s: the variant is fixed, its parts grow with it",
    async (name, parts) => {
      const double = await drawn();
      const set = pageNodes(double).find(
        (node) => node.type === "COMPONENT_SET" && node.name === name,
      );
      expect(set, name).toBeDefined();
      for (const variant of set?.children ?? []) {
        // A vertical separator stands in a row; its length is its height, not its width.
        if (variant.name.includes("orientation=vertical")) continue;
        expect(variant.properties.layoutSizingHorizontal, variant.name).toBe("FIXED");
        const width = sized(variant).width;
        const target = width + 160;
        const before = new Map(
          parts.flatMap((part) =>
            named(variant, part).map((node, index) => [`${part}#${index}`, sized(node).width]),
          ),
        );
        const instance = instanceOf(variant, double);
        expect(instance.width, variant.name).toBe(width);
        instance.resize(target, instance.height);
        expect(instance.width).toBe(target);
        for (const part of parts) {
          named(instance, part).forEach((node, index) => {
            if (node.properties.visible === false) return;
            expect(sized(node).width, `${variant.name}: ${part}`).toBeCloseTo(
              (before.get(`${part}#${index}`) ?? 0) + 160,
              3,
            );
          });
        }
        instance.remove();
      }
    },
  );

  it.each(FIELDS)(
    "%s: at instance width 400 the field is 400 and the control fills it",
    async (name) => {
      const double = await drawn();
      const set = pageNodes(double).find(
        (node) => node.type === "COMPONENT_SET" && node.name === name,
      );
      let measured = 0;
      for (const variant of set?.children ?? []) {
        if (sized(variant).width > 400) continue;
        const reserve = sized(variant).width - sized(named(variant, "control")[0]).width;
        const instance = instanceOf(variant, double);
        instance.resize(400, instance.height);
        expect(sized(named(instance, "field")[0]).width, variant.name).toBe(400);
        // The ring and its gap keep their reserve, as in the default size (F17): the control is
        // 400 less what they reserve.
        expect(sized(named(instance, "control")[0]).width, variant.name).toBeCloseTo(
          400 - reserve,
          3,
        );
        // The control grew with the instance (a date picker keeps its trigger beside it).
        expect(400 - reserve, variant.name).toBeGreaterThan(sized(variant).width - reserve);
        measured++;
        instance.remove();
      }
      expect(measured, name).toBeGreaterThan(0);
    },
  );

  it("icons, indicators and thumbs keep their size; a hint text keeps hugging", async () => {
    const double = await drawn();
    const set = pageNodes(double).find(
      (node) => node.type === "COMPONENT_SET" && node.name === "elektilo",
    );
    const variant = set?.children[0] as DoubleNode;
    const instance = instanceOf(variant, double);
    const indicator = sized(named(instance, "indicator")[0]).width;
    instance.resize(400, instance.height);
    expect(sized(named(instance, "indicator")[0]).width).toBe(indicator);
    // The chevron stands at the end of the control, as on the web.
    const control = named(instance, "control")[0] as DoubleNode;
    expect(control.properties.primaryAxisAlignItems).toBe("SPACE_BETWEEN");
    instance.remove();
  });

  it("a content Ero keeps hugging (butono, insigno, signeto, sxaltilo)", async () => {
    const double = await drawn();
    for (const name of ["butono", "insigno", "signeto", "sxaltilo", "konsileto", "menuo"]) {
      const set = pageNodes(double).find(
        (node) => node.type === "COMPONENT_SET" && node.name === name,
      );
      for (const variant of set?.children ?? []) {
        expect(variant.properties.layoutSizingHorizontal, `${name}: ${variant.name}`).toBe("HUG");
      }
    }
  });
});
