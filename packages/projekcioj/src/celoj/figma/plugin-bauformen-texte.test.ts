// Spec 027 (Figma-Bauformen), the texts of every set: B-2 every text paints with a bound fill,
// B-4 every text is a TEXT property of its set, B-5 a text that wraps in code fills its column and
// grows in height. One run of the repository's plan in the double, read by every case.

import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

/** One run of the plan in the double, read by every case (Vitest collects nothing here). */
async function draw() {
  const double = modelDouble();
  const report = (await new Function(
    "figma",
    `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
  )(double.figma)) as { components: { set: string; properties?: Record<string, number> }[] };
  return { double, report };
}
const drawn = once(draw);

/** The sets of the Eroj (the Sxablono sxelo is a set too: its texts are slot content, B-8). */
const setsOf = (double: Parameters<typeof pageNodes>[0]) =>
  pageNodes(double).filter(
    (node) => node.type === "COMPONENT_SET" && node.getSharedPluginData("fundamento", "ero") !== "",
  );

const textsIn = (node: DoubleNode): DoubleNode[] =>
  node.children.flatMap((child) => (child.type === "TEXT" ? [child] : textsIn(child)));

type Definitions = Record<string, { type: string; defaultValue: unknown }>;
const definitionsOf = (set: DoubleNode) =>
  (set.properties.componentPropertyDefinitions ?? {}) as Definitions;
const referencesOf = (node: DoubleNode) =>
  (node.properties.componentPropertyReferences ?? {}) as Record<string, string>;

describe("B-2: every text of every set paints with a fill bound to its role", () => {
  it("no text layer without a bound fill (datelektilo text, glitilo number-text, the stand-ins)", async () => {
    const { double } = await drawn();
    const unbound: string[] = [];
    for (const set of setsOf(double)) {
      for (const variant of set.children) {
        for (const text of textsIn(variant)) {
          const fills = (text.properties.fills ?? []) as {
            visible?: boolean;
            boundVariables?: { color?: unknown };
          }[];
          if (
            !fills.some(
              (paint) => paint.visible !== false && paint.boundVariables?.color !== undefined,
            )
          ) {
            unbound.push(`${set.name}/${text.name}`);
          }
        }
      }
    }
    expect([...new Set(unbound)].sort()).toEqual([]);
  });
});

describe("B-4: every text of a set is a TEXT property, named after its slot", () => {
  it("every text layer of every variant is connected to a TEXT property of its set", async () => {
    const { double } = await drawn();
    const loose: string[] = [];
    for (const set of setsOf(double)) {
      const definitions = definitionsOf(set);
      for (const variant of set.children) {
        for (const text of textsIn(variant)) {
          const key = referencesOf(text).characters;
          if (key === undefined || definitions[key]?.type !== "TEXT")
            loose.push(`${set.name}/${text.name}`);
        }
      }
    }
    expect([...new Set(loose)].sort()).toEqual([]);
  });

  it("as many TEXT properties as text slots, each the words its layers show (the picture stays)", async () => {
    const { double } = await drawn();
    for (const set of setsOf(double)) {
      const definitions = definitionsOf(set);
      const texts = Object.entries(definitions).filter(
        ([, definition]) => definition.type === "TEXT",
      );
      const used = new Map<string, Set<string>>();
      for (const variant of set.children) {
        for (const text of textsIn(variant)) {
          const key = referencesOf(text).characters;
          if (key === undefined) continue;
          if (!used.has(key)) used.set(key, new Set());
          used.get(key)?.add(String(text.properties.characters));
        }
      }
      // The label of a navigation, a tab list or a list is its accessible name, never seen: a
      // property without a layer, the maintainer's proposal since Spec 011 ⑤.
      const unseen = texts.filter(([key]) => !used.has(key)).map(([key]) => key.split("#")[0]);
      expect(unseen, set.name).toEqual(unseen.length === 0 ? [] : ["label"]);
      expect(texts.length - unseen.length, set.name).toBe(used.size);
      for (const [key, words] of used) {
        expect([...words], `${set.name}: ${key}`).toEqual([String(definitions[key]?.defaultValue)]);
      }
      const names = texts.map(([key]) => key.split("#")[0]);
      expect(new Set(names).size, `${set.name}: names`).toBe(names.length);
    }
  });

  it("names the properties after the slots of the Skemo and the layers", async () => {
    const { double } = await drawn();
    const namesOf = (name: string) =>
      Object.entries(
        definitionsOf(setsOf(double).find((set) => set.name === name) ?? ({} as DoubleNode)),
      )
        .filter(([, definition]) => definition.type === "TEXT")
        .map(([key]) => key.split("#")[0])
        .sort();
    // A BOOLEAN of the same name stands beside (B-3; Figma numbers a second name, M8): the words of
    // help and error are `help-text` and `error-text`, as the words of the tabelo's caption are not
    // `caption` either.
    expect(namesOf("kampo")).toEqual(["error-text", "help-text", "label", "text"]);
    expect(namesOf("avizo")).toEqual(["details", "heading", "label"]);
    expect(namesOf("menuo")).toEqual(["items-1", "items-2", "items-3", "label"]);
    expect(namesOf("navigado")).toEqual(["items-1", "items-2", "items-3", "label"]);
    expect(namesOf("dialogo")).toEqual(
      expect.arrayContaining(["action-1", "action-2", "label", "message", "reason-label"]),
    );
    expect(namesOf("elekto")).toEqual([
      "error-text",
      "help-text",
      "label",
      "option-1",
      "option-2",
      "option-3",
    ]);
    // The value of a date picker shows a day or a range, by its axis mode.
    expect(namesOf("datelektilo")).toEqual(expect.arrayContaining(["text-range", "text-single"]));
  });

  it("the report counts the properties of every set (the Figma limit, measured: none up to 400)", async () => {
    const { report } = await drawn();
    const datelektilo = report.components.find((component) => component.set === "datelektilo");
    expect(datelektilo?.properties?.TEXT).toBeGreaterThan(50);
    const kampo = report.components.find((component) => component.set === "kampo");
    expect(kampo?.properties).toEqual({ BOOLEAN: 2, TEXT: 4 });
  });
});

/** The texts that wrap in code, per set (B-5): they fill their column and grow in height. */
const WRAPPING: Readonly<Record<string, readonly string[]>> = {
  alsxutilo: ["help", "error"],
  datelektilo: ["help", "error"],
  elektilo: ["help", "error"],
  glitilo: ["help", "error"],
  kampo: ["help", "error"],
  kompletigilo: ["help", "error"],
  listelektilo: ["help", "error"],
  plurelektilo: ["help", "error"],
  tekstareo: ["help", "error"],
  avizo: ["heading", "message", "details"],
  dialogo: ["heading", "message", "reason-help"],
  faldilo: ["content-text"],
  karto: ["heading", "content"],
  langetaro: ["panel-text"],
  markdovido: ["paragraph", "item-text-1", "item-text-2", "quote-text"],
  plenstato: ["text"],
  sxvebilo: ["content-text"],
  teksto: ["text"],
  titolo: ["text"],
};

describe("B-5: a text that wraps in code fills its column and grows in height", () => {
  it.each(Object.entries(WRAPPING))("%s", async (name, texts) => {
    const { double } = await drawn();
    const set = setsOf(double).find((candidate) => candidate.name === name);
    expect(set, name).toBeDefined();
    for (const variant of set?.children ?? []) {
      for (const text of textsIn(variant).filter((candidate) => texts.includes(candidate.name))) {
        expect(
          [text.properties.layoutSizingHorizontal, text.properties.textAutoResize],
          `${variant.name}/${text.name}`,
        ).toEqual(["FILL", "HEIGHT"]);
        // A centred column centres its wrapped lines too.
        if (name === "plenstato") expect(text.properties.textAlignHorizontal).toBe("CENTER");
      }
    }
  });
});
