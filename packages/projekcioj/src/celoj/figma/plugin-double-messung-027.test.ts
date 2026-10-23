// Spec 027: what the double believes about filling layers, instances and slots, set against the
// measurements of 2026-10-23 in the empty file „Fundamento Spec 027 Messung"
// (ErG5PAaxWHdoBYEm4HMPzD, plan 027 „Messungen in Figma", M1–M6). The words of a text are not
// Figma's widths in the double (0.6 × font size per glyph), so each case compares sizes with each
// other, as the measurement did. M4a (a layer's visibility bound to a BOOLEAN is the same in every
// variant of the set) is no belief of the double: the plugin never writes it (plan 027, D-03).

import { describe, expect, it } from "vitest";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

type Api = {
  createFrame(): DoubleNode;
  createText(): DoubleNode;
  createComponent(): DoubleNode;
  loadFontAsync(font: { family: string; style: string }): Promise<void>;
  combineAsVariants(components: DoubleNode[], parent: DoubleNode): DoubleNode;
  currentPage: DoubleNode;
};
type Sized = DoubleNode & { width: number; height: number; resize(w: number, h: number): void };
const sized = (node: DoubleNode | undefined) => node as Sized;

async function setup() {
  const double = figmaDouble();
  const figma = double.figma as unknown as Api;
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const text = (words: string) => {
    const node = figma.createText() as Record<string, unknown> & DoubleNode;
    node.characters = words;
    node.fontSize = 14;
    return node;
  };
  const row = (direction: "HORIZONTAL" | "VERTICAL", padding = 0) => {
    const node = figma.createFrame() as Record<string, unknown> & DoubleNode;
    node.layoutMode = direction;
    node.layoutSizingHorizontal = "HUG";
    node.layoutSizingVertical = "HUG";
    node.paddingLeft = padding;
    node.paddingRight = padding;
    return node;
  };
  return { double, figma, text, row };
}

const set = (node: DoubleNode, values: Record<string, unknown>) => Object.assign(node, values);

describe("a filling layer in a hugging parent (M2, M3)", () => {
  it("M2a: a hugging column counts its filling ring with the control the ring hugs", async () => {
    const { text, row } = await setup();
    const column = row("VERTICAL");
    column.appendChild(text("Kurz"));
    const ring = row("HORIZONTAL", 4);
    const control = row("HORIZONTAL", 12);
    control.appendChild(text("Ein ziemlich langer Wert"));
    ring.appendChild(control);
    column.appendChild(ring);
    set(ring, { layoutSizingHorizontal: "FILL" });
    expect(sized(column).width).toBe(sized(control).width + 8);
    expect(sized(ring).width).toBe(sized(column).width);
  });

  it("M3a: a hugging row keeps a filling ring as wide as it hugs, beside a fixed trigger", async () => {
    const { figma, text, row } = await setup();
    const line = row("HORIZONTAL");
    set(line, { itemSpacing: 8 });
    const ring = row("HORIZONTAL");
    const control = row("HORIZONTAL", 10);
    control.appendChild(text("24.10.2026"));
    ring.appendChild(control);
    line.appendChild(ring);
    const trigger = sized(figma.createFrame());
    trigger.resize(40, 40);
    line.appendChild(trigger);
    const natural = sized(ring).width;
    set(ring, { layoutSizingHorizontal: "FILL" });
    expect(sized(ring).width).toBe(natural);
    expect(sized(line).width).toBe(natural + 8 + 40);
  });

  it("M3b: where ring, gap and control all fill, a hugging component shrinks to its label", async () => {
    const { figma, text, row } = await setup();
    const component = figma.createComponent();
    set(component, {
      layoutMode: "VERTICAL",
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
    });
    const label = text("Beschriftung");
    component.appendChild(label);
    const ring = row("HORIZONTAL", 2);
    const control = row("HORIZONTAL", 6);
    control.appendChild(text("Ein Wert der breit ist"));
    ring.appendChild(control);
    component.appendChild(ring);
    const before = sized(component).width;
    set(ring, { layoutSizingHorizontal: "FILL" });
    set(control, { layoutSizingHorizontal: "FILL" });
    expect(sized(component).width).toBeLessThan(before);
    expect(sized(component).width).toBe(sized(label).width);
  });

  // Figma wrapped the text (height 204 for one line of 17); the double measures a filling text on
  // one line, as before Spec 027 — what it believes is its width.
  it("M3c: a hugging column takes a filling text at the width of its other child", async () => {
    const { text, row } = await setup();
    const column = row("VERTICAL");
    const short = text("Kurz");
    column.appendChild(short);
    const long = text("Eine lange Meldung, die im Code umbricht");
    column.appendChild(long);
    set(long, { layoutSizingHorizontal: "FILL", textAutoResize: "HEIGHT" });
    expect(sized(column).width).toBe(sized(short).width);
    expect(sized(long).width).toBe(sized(short).width);
  });

  it("M2b: a fixed root with a filling chain; its instance at 400 fills to 400", async () => {
    const { figma, text, row } = await setup();
    const component = figma.createComponent();
    set(component, {
      layoutMode: "VERTICAL",
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
    });
    component.appendChild(text("Beschriftung"));
    const ring = row("HORIZONTAL", 2);
    const control = row("HORIZONTAL", 6);
    control.appendChild(text("Wert"));
    ring.appendChild(control);
    component.appendChild(ring);
    const width = sized(component).width;
    sized(component).resize(width, sized(component).height);
    set(component, { layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });
    set(ring, { layoutSizingHorizontal: "FILL" });
    set(control, { layoutSizingHorizontal: "FILL" });
    expect(sized(ring).width).toBe(width);
    const instance = sized(
      (component as unknown as { createInstance(): DoubleNode }).createInstance(),
    );
    figma.currentPage.appendChild(instance);
    instance.resize(400, instance.height);
    expect(instance.width).toBe(400);
    const instanceRing = sized(instance.children[1]);
    expect(instanceRing.width).toBe(400);
    expect(sized(instanceRing.children[0]).width).toBe(396);
  });
});

describe("instances, properties and slots (M4, M5, M6)", () => {
  it("M4b: a swap keeps the fill written on a layer of the same name", async () => {
    const { figma } = await setup();
    const icon = (name: string) => {
      const component = figma.createComponent();
      set(component, { name });
      const mark = figma.createFrame();
      set(mark, { name: "mark" });
      component.appendChild(mark);
      return component;
    };
    const check = icon("name=check");
    const close = icon("name=close");
    figma.combineAsVariants([check, close], figma.currentPage);
    const button = figma.createComponent();
    set(button, { layoutMode: "HORIZONTAL" });
    const instance = (check as unknown as { createInstance(): DoubleNode }).createInstance();
    button.appendChild(instance);
    const key = (
      button as unknown as { addComponentProperty(n: string, t: string, v: string): string }
    ).addComponentProperty("icon-start-ikono", "INSTANCE_SWAP", check.id);
    set(instance, { componentPropertyReferences: { mainComponent: key } });
    const red = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
    set(instance.children[0] as DoubleNode, { fills: red });
    const use = (button as unknown as { createInstance(): DoubleNode }).createInstance();
    (use as unknown as { setProperties(v: Record<string, string>): void }).setProperties({
      [key]: close.id,
    });
    const inner = use.children[0] as DoubleNode & { mainComponent?: DoubleNode };
    expect(inner.mainComponent?.name).toBe("name=close");
    const fills = (inner.children[0]?.properties.fills ?? []) as { color: unknown }[];
    expect(fills[0]?.color).toEqual({
      r: 1,
      g: 0,
      b: 0,
    });
  });

  it("M4c/M5/M6: a slot per variant, renamed with its property, repointed to the first", async () => {
    const { figma } = await setup();
    const variants = ["width=compact", "width=expanded"].map((name) => {
      const component = figma.createComponent();
      set(component, { name, layoutMode: "VERTICAL" });
      return component;
    });
    const owner = figma.combineAsVariants(variants, figma.currentPage) as DoubleNode & {
      componentPropertyDefinitions: Record<string, { type: string }>;
      deleteComponentProperty(key: string): void;
    };
    const slots = variants.map((variant) => {
      const slot = (variant as unknown as { createSlot(): DoubleNode }).createSlot();
      set(slot, { name: "nav" });
      return slot;
    });
    const keys = slots.map(
      (slot) =>
        (slot.properties.componentPropertyReferences as { slotContentId: string }).slotContentId,
    );
    expect(keys.map((key) => key.split("#")[0])).toEqual(["nav", "nav"]);
    expect(keys[0]).not.toBe(keys[1]);
    set(slots[1] as DoubleNode, { componentPropertyReferences: { slotContentId: keys[0] } });
    owner.deleteComponentProperty(keys[1] ?? "");
    expect(Object.keys(owner.componentPropertyDefinitions)).toEqual([keys[0]]);
    // A text appended to the slot of an instance stands in it (M4c); a frame of an instance
    // takes no child.
    const instance = (variants[0] as unknown as { createInstance(): DoubleNode }).createInstance();
    const text = figma.createText();
    instance.children[0]?.appendChild(text);
    expect(instance.children[0]?.children).toContain(text);
    expect(() => instance.appendChild(figma.createText())).toThrow(/instance/);
  });

  it("M8: a second property of the same name, of any type, is numbered", async () => {
    const { figma } = await setup();
    const component = figma.createComponent() as DoubleNode & {
      addComponentProperty(name: string, type: string, value: unknown): string;
    };
    const keys = [
      component.addComponentProperty("help", "TEXT", "Hinweis"),
      component.addComponentProperty("help", "BOOLEAN", true),
      component.addComponentProperty("help", "TEXT", "Zweiter"),
      component.addComponentProperty("icon-start", "BOOLEAN", false),
      component.addComponentProperty("icon-start", "INSTANCE_SWAP", "1:1"),
    ];
    expect(keys.map((key) => key.split("#")[0])).toEqual([
      "help",
      "help2",
      "help3",
      "icon-start",
      "icon-start2",
    ]);
  });

  it("M11: a size bound on a layer of an instance is not taken; on the instance it is", async () => {
    const { double, figma } = await setup();
    const component = figma.createComponent();
    const layer = figma.createFrame();
    set(layer, { name: "control" });
    component.appendChild(layer);
    const instance = (component as unknown as { createInstance(): DoubleNode }).createInstance();
    const collection = (
      double.figma as unknown as {
        variables: { createVariableCollection(name: string): { modes: { modeId: string }[] } };
      }
    ).variables.createVariableCollection("M11");
    const variable = (
      double.figma as unknown as {
        variables: {
          createVariable(
            name: string,
            collection: unknown,
            type: string,
          ): DoubleNode & { setValueForMode(mode: string, value: number): void };
        };
      }
    ).variables.createVariable("size/icon/medium", collection, "FLOAT");
    variable.setValueForMode(collection.modes[0]?.modeId ?? "", 20);
    instance.children[0]?.setBoundVariable("width", variable as never);
    expect(instance.children[0]?.boundVariables.width).toBeUndefined();
    instance.setBoundVariable("width", variable as never);
    expect(instance.boundVariables.width).toBeDefined();
  });
});
