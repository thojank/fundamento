// Spec 027, the switches of a set: B-3 help and error as BOOLEAN properties of every field Ero,
// B-6 the icon slots as BOOLEAN properties and an instance of an ikono that INSTANCE_SWAP sets,
// B-7 the trigger of a closed menuo in its target size, B-9 the edit icon of a lokredaktilo in
// its display state. And the plugin itself: a name of its own in the menu, the duration of a run.

import { describe, expect, it } from "vitest";
import { pluginManifest } from "./plugin.js";
import { modelDouble, once, pageNodes, repoFiles, repoPlan, run } from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

/** One run of the plan in the double, read by every case (Vitest collects nothing here). */
async function draw() {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  return double;
}
const drawn = once(draw);

type Definitions = Record<string, { type: string; defaultValue: unknown }>;
const setOf = (double: Awaited<ReturnType<typeof drawn>>, name: string) =>
  pageNodes(double).find(
    (node) => node.type === "COMPONENT_SET" && node.name === name,
  ) as DoubleNode;
const definitionsOf = (set: DoubleNode) =>
  (set.properties.componentPropertyDefinitions ?? {}) as Definitions;
const keyOf = (set: DoubleNode, name: string, type: string) =>
  Object.keys(definitionsOf(set)).find(
    (key) => key.split("#")[0] === name && definitionsOf(set)[key]?.type === type,
  );
const referencesOf = (node: DoubleNode | undefined) =>
  (node?.properties.componentPropertyReferences ?? {}) as Record<string, string>;
const named = (node: DoubleNode, name: string): DoubleNode[] =>
  node.children.flatMap((child) => [
    ...(child.name === name ? [child] : []),
    ...named(child, name),
  ]);
const mainOf = (node: DoubleNode | undefined) =>
  (node as unknown as { mainComponent?: DoubleNode } | undefined)?.mainComponent;
type Sized = DoubleNode & { width: number; height: number };

/** Every field Ero and the texts it carries (B-3). */
const FIELD_TEXTS: Readonly<Record<string, readonly ("help" | "error")[]>> = {
  alsxutilo: ["help", "error"],
  datelektilo: ["help", "error"],
  elektilo: ["help", "error"],
  elekto: ["help", "error"],
  glitilo: ["help", "error"],
  kampo: ["help", "error"],
  kompletigilo: ["help", "error"],
  listelektilo: ["help", "error"],
  markobutono: ["error"],
  plurelektilo: ["help", "error"],
  tekstareo: ["help", "error"],
};

describe("B-3: help and error are BOOLEAN properties of every field Ero", () => {
  it.each(Object.entries(FIELD_TEXTS))("%s", async (name, parts) => {
    const set = setOf(await drawn(), name);
    const help = keyOf(set, "help", "BOOLEAN");
    const error = keyOf(set, "error", "BOOLEAN");
    if (parts.includes("help")) expect(definitionsOf(set)[help ?? ""]?.defaultValue).toBe(true);
    expect(definitionsOf(set)[error ?? ""]?.defaultValue).toBe(false);
    for (const variant of set.children) {
      const invalid = variant.name.split(", ").includes("state=invalid");
      if (parts.includes("help")) {
        const node = named(variant, "help")[0];
        expect(node?.properties.visible, `${variant.name}: help`).not.toBe(false);
        expect(referencesOf(node).visible, `${variant.name}: help`).toBe(help);
      }
      const node = named(variant, "error")[0];
      if (invalid) {
        // Figma ties a layer's visibility to its property in every variant alike (measured M4a):
        // the error of the invalid state is shown and not connected, so it cannot be switched off.
        expect(node?.properties.visible, `${variant.name}: error`).not.toBe(false);
        expect(referencesOf(node).visible, `${variant.name}: error`).toBeUndefined();
      } else {
        expect(node?.properties.visible, `${variant.name}: error`).toBe(false);
        expect(referencesOf(node).visible, `${variant.name}: error`).toBe(error);
      }
    }
  });
});

/** The icon slots of the Skemo (B-6): set → slot → the BOOLEAN that shows it. */
const ICON_SLOTS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  butono: { "icon-start": "icon-start", "icon-end": "icon-end" },
  // The external mark of a link is shown by the Skemo's prop external (Nachlese 5 O-41).
  ligilo: { "icon-end": "external" },
  signeto: { "icon-start": "icon-start" },
};

describe("B-6: an icon slot is off by default and holds an ikono that INSTANCE_SWAP sets", () => {
  it.each(Object.entries(ICON_SLOTS))("%s", async (name, slots) => {
    const double = await drawn();
    const set = setOf(double, name);
    const ikono = setOf(double, "ikono");
    for (const [slot, shownBy] of Object.entries(slots)) {
      const shown = keyOf(set, shownBy, "BOOLEAN");
      const swap = keyOf(set, `${slot}-ikono`, "INSTANCE_SWAP");
      expect(definitionsOf(set)[shown ?? ""]?.defaultValue, `${name}: ${shownBy}`).toBe(false);
      expect(swap, `${name}: ${slot}-ikono`).toBeDefined();
      const icon = ikono.children.find(
        (variant) => variant.id === definitionsOf(set)[swap ?? ""]?.defaultValue,
      );
      expect(icon?.parent?.name, `${name}: the default of ${slot}-ikono`).toBe("ikono");
      for (const variant of set.children) {
        const frame = named(variant, slot)[0];
        expect(frame?.properties.visible, `${variant.name}: ${slot}`).toBe(false);
        expect(referencesOf(frame).visible, `${variant.name}: ${slot}`).toBe(shown);
        const instance = frame?.children.find((child) => child.type === "INSTANCE");
        expect(mainOf(instance)?.parent?.name, `${variant.name}: ${slot}`).toBe("ikono");
        expect(referencesOf(instance).mainComponent, `${variant.name}: ${slot}`).toBe(swap);
      }
    }
  });

  it("the icon is the ikono of the butono's size; a swapped one keeps the colour of the label", async () => {
    const double = await drawn();
    const set = setOf(double, "butono");
    const ikono = setOf(double, "ikono");
    const variant = set.children[0] as DoubleNode;
    const markOf = (node: DoubleNode) =>
      named(node, "mark")[0]?.properties.fills as {
        boundVariables?: { color?: { name: string } };
      }[];
    const before = markOf(named(variant, "icon-start")[0] as DoubleNode)?.[0]?.boundVariables?.color
      ?.name;
    expect(before).toBeDefined();
    // Figma takes no size bound on a layer of an instance (M11): the ikono of the same size.
    const size = /size=(\w+)/.exec(variant.name)?.[1];
    const held = (named(variant, "icon-start")[0]?.children ?? []).find(
      (child) => child.type === "INSTANCE",
    );
    expect(mainOf(held)?.name.split(", ")).toContain(`size=${size}`);
    const close = ikono.children.find((child) => child.name.split(", ").includes("name=close"));
    const instance = (variant as unknown as { createInstance(): DoubleNode }).createInstance();
    (instance as unknown as { setProperties(values: Record<string, unknown>): void }).setProperties(
      {
        [keyOf(set, "icon-start", "BOOLEAN") ?? ""]: true,
        [keyOf(set, "icon-start-ikono", "INSTANCE_SWAP") ?? ""]: close?.id,
      },
    );
    const slot = named(instance, "icon-start")[0] as DoubleNode;
    expect(slot.properties.visible).toBe(true);
    const icon = slot.children.find((child) => child.type === "INSTANCE");
    expect(mainOf(icon)?.name).toContain("name=close");
    expect(markOf(slot)?.[0]?.boundVariables?.color?.name).toBe(before);
  });
});

describe("B-7: the closed menuo shows its trigger in its target size", () => {
  it("the trigger is at least size.target.min high and wide, also in an instance with open off", async () => {
    const double = await drawn();
    const set = setOf(double, "menuo");
    for (const variant of set.children) {
      const trigger = named(variant, "trigger")[0] as DoubleNode;
      expect(trigger.boundVariables.minHeight?.name, variant.name).toBe("size/target/min");
      expect(trigger.boundVariables.minWidth?.name, variant.name).toBe("size/target/min");
    }
    const instance = (
      set.children[0] as unknown as { createInstance(): DoubleNode }
    ).createInstance();
    (double.figma as { currentPage: DoubleNode }).currentPage.appendChild(instance);
    (instance as unknown as { setProperties(values: Record<string, unknown>): void }).setProperties(
      {
        [keyOf(set, "open", "BOOLEAN") ?? ""]: false,
      },
    );
    expect((instance as Sized).height).toBeGreaterThanOrEqual(24);
    expect((named(instance, "trigger")[0] as Sized).width).toBeGreaterThanOrEqual(24);
    instance.remove();
  });
});

describe("B-9: the lokredaktilo shows its edit icon in the display state", () => {
  it("editing=false holds the icon edit at edit.size beside the text; editing=true does not", async () => {
    const set = setOf(await drawn(), "lokredaktilo");
    for (const variant of set.children) {
      const edit = named(variant, "edit")[0];
      if (variant.name.split(", ").includes("editing=false")) {
        expect(edit?.properties.visible, variant.name).not.toBe(false);
        expect(edit?.boundVariables.width?.name, variant.name).toBe("ero/lokredaktilo/edit/size");
        expect(edit?.parent?.name, variant.name).toBe("control");
        expect(
          edit?.parent?.children.map((child) => child.name),
          variant.name,
        ).toEqual(["text", "edit"]);
        expect(named(edit as DoubleNode, "mark").length, variant.name).toBeGreaterThan(0);
      } else {
        expect(edit === undefined || edit.properties.visible === false, variant.name).toBe(true);
      }
    }
  });
});

describe("the plugin of Spec 027 stands apart in the menu", () => {
  // Spec 029 ①: the plugin of the Grundlagen follows the Bauformen under a name and ids of its own.
  it("its name begins with „Fundamento Grundlagen“ and its id is its own", () => {
    const manifest = JSON.parse(pluginManifest(repoPlan, "abc1234")) as {
      name: string;
      id: string;
    };
    expect(manifest.name.startsWith("Fundamento Grundlagen 0.2.0")).toBe(true);
    expect(manifest.id.startsWith("fundamento-grundlagen")).toBe(true);
    expect(manifest.id).not.toBe("fundamento-apply-plan");
  });

  it("the report and its toast name the duration of the run", async () => {
    const double = modelDouble();
    const module = new Function("figma", "console", `${repoFiles["figma/plugin/code.js"] ?? ""}`);
    const lines: string[] = [];
    await module(
      { ...double.figma, command: "apply" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const head = JSON.parse(lines.find((line) => line.startsWith("{")) ?? "{}") as { ms?: unknown };
    expect(typeof head.ms).toBe("number");
    expect(double.notifications.at(-1)?.message).toMatch(/Lauf in [0-9]+,[0-9] s/);
  });
});
