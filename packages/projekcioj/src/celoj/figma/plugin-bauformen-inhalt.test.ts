// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-bauformen-inhalt.test.ts (Nachlese 5 ①, O-5): the structures of content and navigation: badge, notice, state, meter, table, list, nav, tabs, icons, overlays, card, avatar.

import { describe, expect, it } from "vitest";
import { VERTICAL_EXAMPLE } from "./figma.js";
import {
  descendant,
  files,
  MODEL_FONTS,
  modelDouble,
  pageNodes,
  repoFiles,
  repoPlan,
  run,
  SEPARATOR_EXAMPLE_NAMES,
} from "./plugin-test-helpers.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

// Spec 011 ③ (spec „insigno", G2; plan ③ D-14): the badge is a structure of its own — variant →
// control (the pill: a row with fill, border, radius, minimum height and inline padding bound) →
// text (the label property, in the role of the text part). No focus ring: static text has no
// state but rest, and no part of the hidden slot description is drawn.
describe("the insigno is drawn as a badge: the pill with its text (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "insigno");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const insigno = report.components.find((component) => component.set === "insigno");
    return { double, set, variant, report, insigno };
  };

  it("draws ten variants of intent × size in one column, each the pill directly under the variant, the text as the label property", async () => {
    const { set, variant, insigno } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=neutral, size=small, state=rest",
      "intent=neutral, size=medium, state=rest",
      "intent=info, size=small, state=rest",
      "intent=info, size=medium, state=rest",
      "intent=success, size=small, state=rest",
      "intent=success, size=medium, state=rest",
      "intent=warning, size=small, state=rest",
      "intent=warning, size=medium, state=rest",
      "intent=danger, size=small, state=rest",
      "intent=danger, size=medium, state=rest",
    ]);
    expect(insigno?.layout.columns).toBe(1);
    expect(insigno?.layout.rows).toBe(10);
    const small = variant("intent=neutral, size=small, state=rest");
    expect(small?.children.map((child) => child.name)).toEqual(["control"]);
    expect(descendant(small, "focus-ring")).toBeUndefined();
    expect(descendant(small, "description")).toBeUndefined();
    const control = descendant(small, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    // The border lies in the size, as on the web (box-sizing border-box).
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paintOf(control, "fills")).toBe("color/background/sunken");
    expect(paintOf(control, "strokes")).toBe("color/border/default");
    expect(bound(control, "strokeWeight")).toBe("border/width/default");
    expect(bound(control, "minHeight")).toBe("size/icon/medium");
    expect(bound(control, "paddingLeft")).toBe("spacing/xsmall");
    expect(bound(control, "paddingRight")).toBe("spacing/xsmall");
    expect(bound(control, "cornerRadius")).toBe("radius/role/pill");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
    const text = descendant(small, "text");
    expect(text?.properties.characters).toBe("Status");
    expect(text?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(paintOf(text, "fills")).toBe("color/text/subtle");
    expect(bound(text, "fontSize")).toBe("typography/label/2/font-size");
    expect(bound(text, "fontFamily")).toBe("typography/label/2/font-family");
    const danger = variant("intent=danger, size=medium, state=rest");
    expect(paintOf(descendant(danger, "control"), "fills")).toBe("color/status/danger/subtle");
    expect(paintOf(descendant(danger, "text"), "fills")).toBe("color/status/danger/text");
    expect(bound(descendant(danger, "control"), "minHeight")).toBe("size/icon/large");
    expect(bound(descendant(danger, "control"), "paddingLeft")).toBe("spacing/small");
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, insigno, report } = await drawn();
    expect(insigno?.layout.zero).toEqual([]);
    expect(insigno?.layout.smaller).toEqual([]);
    expect(insigno?.layout.unplaced).toEqual([]);
    expect(insigno?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("insigno"))).toEqual([]);
    expect(insigno?.layout.held.rest.control).toBeDefined();
    expect(insigno?.layout.held.rest.text).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ③ (spec „avizo", G2, G4; plan ③ D-14): the notice is a structure of its own — variant
// → control (a row: surface fill, radius, the padding on every side; its stroke at the left — the
// inline start of the Figma file, which knows no writing direction — is the accent: colour bound,
// the left weight bound to accent.width, the other three sides 0) → texts (a column: heading,
// the message as the label property, details, the actions placeholder with its gap) and the
// dismiss frame (a square of dismiss.size) at the end. dismissible is a BOOLEAN property of the
// set that shows the dismiss frame; off by default, as the Skemo says. Test-double assumptions
// until measured in f10b-5: a stroke weight per side is bindable (strokeLeftWeight), and a
// BOOLEAN property connected to visible shows and hides the layer in an instance.
describe("the avizo is drawn as a notice: surface with accent, heading, message, details, actions and dismiss (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "avizo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const avizo = report.components.find((component) => component.set === "avizo");
    return { double, set, variant, report, avizo };
  };

  it("draws four variants by intent, the control a row with the accent at its start, the texts column and the dismiss frame", async () => {
    const { set, variant, avizo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=info, state=rest",
      "intent=success, state=rest",
      "intent=warning, state=rest",
      "intent=danger, state=rest",
    ]);
    expect(avizo?.layout.columns).toBe(1);
    expect(avizo?.layout.rows).toBe(4);
    const info = variant("intent=info, state=rest");
    expect(info?.children.map((child) => child.name)).toEqual(["control"]);
    const control = descendant(info, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paintOf(control, "fills")).toBe("color/status/info/weak");
    expect(paintOf(control, "strokes")).toBe("color/status/info/border");
    expect(bound(control, "strokeLeftWeight")).toBe("border/width/strong");
    expect(bound(control, "strokeWeight")).toBeUndefined();
    expect(control?.properties.strokeWeight).toBe(0);
    for (const side of ["strokeTopWeight", "strokeRightWeight", "strokeBottomWeight"]) {
      expect(control?.properties[side], side).toBe(0);
    }
    expect(bound(control, "cornerRadius")).toBe("radius/role/surface");
    for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
      expect(bound(control, side), side).toBe("spacing/medium");
    }
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
    // Spec 014 ②: the icon of the intent stands first.
    expect(control?.children.map((child) => child.name)).toEqual(["icon", "texts", "dismiss"]);
    const texts = descendant(info, "texts");
    expect(texts?.properties.layoutMode).toBe("VERTICAL");
    expect(bound(texts, "itemSpacing")).toBe("spacing/small");
    expect(texts?.children.map((child) => child.name)).toEqual([
      "heading",
      "message",
      "details",
      "actions",
    ]);
    const heading = descendant(info, "heading");
    expect(heading?.properties.characters).toBe("Überschrift");
    expect(bound(heading, "fontSize")).toBe("typography/label/1/font-size");
    expect(paintOf(heading, "fills")).toBe("color/text/default");
    const message = descendant(info, "message");
    expect(message?.properties.characters).toBe("Meldung");
    expect(message?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(bound(message, "fontSize")).toBe("typography/body/1/font-size");
    expect(paintOf(message, "fills")).toBe("color/text/default");
    const details = descendant(info, "details");
    expect(details?.properties.characters).toBe("Einzelheit");
    expect(bound(details, "fontSize")).toBe("typography/caption/font-size");
    const actions = descendant(info, "actions");
    expect(actions?.properties.layoutMode).toBe("HORIZONTAL");
    expect(bound(actions, "itemSpacing")).toBe("spacing/small");
    expect(actions?.properties.visible).not.toBe(false);
    expect(actions?.children).toEqual([]);
    const dismiss = descendant(info, "dismiss");
    expect(dismiss?.properties.layoutMode).toBe("NONE");
    expect(bound(dismiss, "width")).toBe("size/control/small");
    expect(bound(dismiss, "height")).toBe("size/control/small");
    expect(dismiss?.properties.fills).toEqual([]);
    expect(dismiss?.properties.visible).toBe(false);
    expect(dismiss?.properties.componentPropertyReferences).toEqual({
      visible: expect.stringMatching(/^dismissible#/),
    });
    const danger = variant("intent=danger, state=rest");
    expect(paintOf(descendant(danger, "control"), "fills")).toBe("color/status/danger/weak");
    expect(paintOf(descendant(danger, "control"), "strokes")).toBe("color/status/danger/border");
  });

  it("declares dismissible as a BOOLEAN property of the set beside the label, default false, once over two runs", async () => {
    const { double, set } = await drawn();
    const definitions = () => (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const keys = Object.keys(definitions()).filter((key) => key.startsWith("dismissible#"));
    expect(keys).toHaveLength(1);
    expect(definitions()[keys[0] ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: false });
    expect(Object.keys(definitions())).toHaveLength(2);
    for (const variant of set?.children ?? []) {
      expect(
        descendant(variant, "dismiss")?.properties.componentPropertyReferences,
        variant.name,
      ).toEqual({ visible: keys[0] });
    }
    await run(double, source);
    expect(Object.keys(definitions())).toHaveLength(2);
    // No other set declares it.
    const butono = pageNodes(double).find((child) => child.name === "butono");
    expect(
      Object.keys((butono?.properties.componentPropertyDefinitions ?? {}) as Definitions),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, avizo, report } = await drawn();
    expect(avizo?.layout.zero).toEqual([]);
    expect(avizo?.layout.smaller).toEqual([]);
    expect(avizo?.layout.unplaced).toEqual([]);
    expect(avizo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("avizo"))).toEqual([]);
    expect(avizo?.layout.held.rest.control).toBeDefined();
    expect(avizo?.layout.held.rest.message).toBeDefined();
    expect(avizo?.layout.held.rest.dismiss).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });

  // F-4 of the acceptance of Spec 011 ③ (measured in Figma, 2026-10-16): the notice stood with a
  // lot of empty space below its texts — a fixed height, where every frame of it says HUG. The
  // cause is the empty actions placeholder: an auto-layout frame without children keeps its size,
  // hug or not, so the 100 × 100 createFrame gives a frame stayed, and the column took it in. The
  // plugin makes an empty placeholder as small as the tool allows (0.01) before it writes its
  // layout, so the height of every variant follows its texts and padding — with the dismiss frame
  // shown or hidden — and the placeholder still hugs what a designer drops into it.
  it("hugs its height in every variant (F-4): the empty actions placeholder keeps no default size, the variant is as high as its texts and padding", async () => {
    const { double, set } = await drawn();
    const box = (node: DoubleNode | undefined) =>
      node as unknown as { width: number; height: number };
    const value = (node: DoubleNode | undefined, name: string) =>
      Number(
        double.variables
          .find((variable) => variable.name === name)
          ?.resolveForConsumer(node as DoubleNode).value,
      );
    expect(set?.children).toHaveLength(4);
    for (const variant of set?.children ?? []) {
      const control = descendant(variant, "control");
      const texts = descendant(variant, "texts");
      const actions = descendant(variant, "actions");
      const dismiss = descendant(variant, "dismiss");
      for (const frame of [variant, control, texts, actions]) {
        expect(frame?.properties.layoutSizingVertical, `${variant.name} ${frame?.name}`).toBe(
          "HUG",
        );
      }
      expect(actions?.properties.visible, variant.name).not.toBe(false);
      for (const shown of [false, true]) {
        if (dismiss !== undefined) (dismiss as unknown as { visible: boolean }).visible = shown;
        const where = `${variant.name}, dismiss ${shown ? "shown" : "hidden"}`;
        // The empty placeholder is no larger than the tool's smallest size.
        expect(box(actions).width, where).toBeLessThanOrEqual(0.01);
        expect(box(actions).height, where).toBeLessThanOrEqual(0.01);
        // The column is its three texts, the gaps between its four children and the placeholder.
        const words = ["heading", "message", "details"].map(
          (name) => box(descendant(variant, name)).height,
        );
        const gap = value(texts, "spacing/small");
        expect(gap).toBeGreaterThan(0);
        expect(box(texts).height, where).toBeCloseTo(
          words.reduce((sum, each) => sum + each, 0) + 3 * gap + box(actions).height,
          5,
        );
        // The control is the column and its padding; the variant is the control.
        const padding = value(control, "spacing/medium");
        expect(padding).toBeGreaterThan(0);
        expect(box(control).height, where).toBeCloseTo(box(texts).height + 2 * padding, 5);
        expect(box(variant).height, where).toBe(box(control).height);
      }
    }
  });
});

// Spec 011 ③ (spec „plenstato", G2, G4; plan ③ D-14): the state is a structure of its own —
// variant → control (a column, centred: the border's colour and width bound, the stroke dashed
// where the plan says dashed — a dash pattern written as a number, since Figma binds none — and
// the bound paint invisible where it says none) → indicator (the arc of the web, imported once;
// its size bound, the vector's stroke bound to indicator.color, the frame invisible where the
// colour is none), text (the label property) and the actions placeholder (invisible where the
// constraint forbids actions: while loading). The motion part binds nothing in the file: Figma
// has no duration to bind, as for the butono. Test-double assumptions until measured in f10b-5:
// an imported SVG path with a stroke arrives as a vector with that stroke; a paint with
// visible false shows nothing and keeps its binding.
describe("the plenstato is drawn as a state: the column with the arc, the text and the actions; dashed when empty (Spec 011 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "plenstato");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const plenstato = report.components.find((component) => component.set === "plenstato");
    return { double, set, variant, report, plenstato };
  };

  it("draws two variants by kind: the border dashed where empty, its paint invisible where loading", async () => {
    const { set, variant, plenstato } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "kind=loading, state=rest",
      "kind=empty, state=rest",
    ]);
    expect(plenstato?.layout.columns).toBe(1);
    expect(plenstato?.layout.rows).toBe(2);
    const loading = descendant(variant("kind=loading, state=rest"), "control");
    const empty = descendant(variant("kind=empty, state=rest"), "control");
    for (const [control, kind] of [
      [loading, "loading"],
      [empty, "empty"],
    ] as const) {
      expect(control?.properties.layoutMode, kind).toBe("VERTICAL");
      expect(control?.properties.primaryAxisAlignItems, kind).toBe("CENTER");
      expect(control?.properties.counterAxisAlignItems, kind).toBe("CENTER");
      expect(control?.properties.strokesIncludedInLayout, kind).toBe(true);
      expect(control?.properties.fills, kind).toEqual([]);
      expect(paints(control, "strokes")[0]?.boundVariables?.color?.name, kind).toBe(
        "color/border/subtle",
      );
      expect(bound(control, "strokeWeight"), kind).toBe("border/width/default");
      expect(bound(control, "cornerRadius"), kind).toBe("radius/role/surface");
      for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
        expect(bound(control, side), `${kind} ${side}`).toBe("spacing/large");
      }
      expect(bound(control, "itemSpacing"), kind).toBe("spacing/small");
      expect(
        control?.children.map((child) => child.name),
        kind,
      ).toEqual(["indicator", "text", "actions"]);
    }
    // The stroke: none while loading — the paint stays bound and is not shown; dashed when empty.
    expect(paints(loading, "strokes")[0]?.visible).toBe(false);
    expect(loading?.properties.dashPattern).toEqual([]);
    expect(paints(empty, "strokes")[0]?.visible).toBe(true);
    const planned = repoPlan.components
      .find((component) => component.set === "plenstato")
      ?.variants.find((entry) => entry.props.kind === "empty")?.stroke;
    expect(empty?.properties.dashPattern).toEqual(planned?.dashPattern);
    expect(empty?.properties.dashPattern).toHaveLength(2);
  });

  it("shows the arc with its colour bound while loading and hides it when empty; hides the actions while loading", async () => {
    const { variant } = await drawn();
    const loading = variant("kind=loading, state=rest");
    const empty = variant("kind=empty, state=rest");
    for (const [node, kind] of [
      [loading, "loading"],
      [empty, "empty"],
    ] as const) {
      const indicator = descendant(node, "indicator");
      expect(indicator?.properties.layoutMode, kind).toBe("NONE");
      expect(bound(indicator, "width"), kind).toBe("size/icon/small");
      expect(bound(indicator, "height"), kind).toBe("size/icon/small");
      expect(indicator?.properties.fills, kind).toEqual([]);
      const mark = descendant(node, "mark");
      expect(mark?.type, kind).toBe("VECTOR");
      expect(mark?.properties.fills, kind).toEqual([]);
      // The arc's stroke width is the sign's own (the SVG's), carried with the sign.
      expect(mark?.properties.strokeWeight, kind).toBe(2);
      const text = descendant(node, "text");
      expect(text?.properties.characters, kind).toBe("Zustand");
      expect(text?.properties.componentPropertyReferences, kind).toMatchObject({
        characters: expect.stringMatching(/^label/),
      });
      expect(paints(text, "fills")[0]?.boundVariables?.color?.name, kind).toBe("color/text/muted");
      expect(bound(text, "fontSize"), kind).toBe("typography/body/1/font-size");
      const actions = descendant(node, "actions");
      expect(actions?.properties.layoutMode, kind).toBe("HORIZONTAL");
      expect(bound(actions, "itemSpacing"), kind).toBe("spacing/small");
      expect(actions?.children, kind).toEqual([]);
    }
    expect(descendant(loading, "indicator")?.properties.visible).toBe(true);
    expect(paints(descendant(loading, "mark"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "color/status/info/basic",
    );
    expect(descendant(loading, "actions")?.properties.visible).toBe(false);
    expect(descendant(empty, "indicator")?.properties.visible).toBe(false);
    expect(paints(descendant(empty, "mark"), "strokes")).toEqual([]);
    expect(descendant(empty, "actions")?.properties.visible).toBe(true);
    // Nothing of the motion part is bound anywhere in the variant.
    const names = (node: DoubleNode | undefined): string[] =>
      node === undefined
        ? []
        : [
            ...Object.values(node.boundVariables).map((variable) => variable.name),
            ...node.children.flatMap(names),
          ];
    expect(names(loading).some((name) => name.startsWith("motion/"))).toBe(false);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, plenstato, report } = await drawn();
    expect(plenstato?.layout.zero).toEqual([]);
    expect(plenstato?.layout.smaller).toEqual([]);
    expect(plenstato?.layout.unplaced).toEqual([]);
    expect(plenstato?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("plenstato"))).toEqual([]);
    expect(plenstato?.layout.held.rest.control).toBeDefined();
    expect(plenstato?.layout.held.rest.indicator).toBeDefined();
    expect(plenstato?.layout.held.rest.text).toBeDefined();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });

  // Nachlese 4 N-5 (F-6, Figma-Lauf 09909f5): „das Set misst 101 × 148, die Kinder reichen bis
  // 97 × 144" — the variant kind=empty ends exactly where the padding of 4 begins, and the run
  // still called it outside. Figma keeps geometry as 32-bit floats; the empty variant carries the
  // 0.01 of its empty actions placeholder (the loading variant hides it), and 0.01 has no exact
  // float: the sum of a child's y and height came out a few millionths above the set's height.
  it("warns of nothing where a variant ends at the padding but for float noise below what the report prints (N-5, F-6)", async () => {
    // Geometry as Figma keeps it: 32-bit floats.
    const double = figmaDouble({ fonts: MODEL_FONTS, float32: true });
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as {
      warnings: string[];
      components: { set: string; layout: { outside: string[]; smaller: string[] } }[];
    };
    const plenstato = report.components.find((component) => component.set === "plenstato");
    expect(plenstato?.layout.outside).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("plenstato"))).toEqual([]);
    // No set at all reads a float's last digits as an overlap.
    for (const component of report.components) {
      expect(component.layout.outside, component.set).toEqual([]);
      expect(component.layout.smaller, component.set).toEqual([]);
    }
  });
});

// Spec 011 ④ (spec „mezurilo", G2, G4; plan ④ D-14): the meter is a structure of its own —
// variant → control (a column, the gap bound to box.gap; its width written from the wider of the
// two texts, measured — a set has no container to fill, and the meter takes the width of its
// container, Uzo size container) → label (the label property), track (its fill, radius and height
// as a minimum; it fills the column's width: FILL along the inline axis) holding the fill frame
// (its colour by intent, its radius, as high as the track, its width the share of the track: 66
// of 0 … 100, the Vitrino's value example, resized to the number since Figma binds no share), and
// the value text. The unknown value is the example frame beside the set, on the Vitrino's ground
// like the set: the track's stroke bound to unknown.color and unknown.width with the dash pattern
// of the plan, no fill frame, the text „nicht geprüft" in the value text's role (F-6).
// Acceptance of Spec 011 ④ (F-3): an empty auto-layout frame keeps its size, hug or not (③ F-4) —
// the fill frame stood at the 100 × 100 of createFrame and the track hugged it, a circle; the
// example's empty track stood at 100 × 100 too, a square. Measured against the double, which
// models that size, FILL, and resize.
describe("the mezurilo is drawn as a meter: label, track with the fill at 66 %, value text; the unknown example dashed (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Box = { width: number; height: number };
  const box = (node: DoubleNode | undefined): Box => {
    const { width, height } = (node ?? {}) as unknown as Box;
    return { width, height };
  };
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: { name: string; found: boolean; created: boolean };
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "mezurilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const mezurilo = report.components.find((component) => component.set === "mezurilo");
    return { double, set, variant, report, mezurilo };
  };
  const planned = repoPlan.components.find((component) => component.set === "mezurilo");

  it("draws four variants by intent: the column with label, track and value text, the fill's colour by intent", async () => {
    const { set, variant, mezurilo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "intent=neutral, state=rest",
      "intent=success, state=rest",
      "intent=warning, state=rest",
      "intent=danger, state=rest",
    ]);
    expect(mezurilo?.layout.columns).toBe(1);
    expect(mezurilo?.layout.rows).toBe(4);
    const neutral = variant("intent=neutral, state=rest");
    const control = descendant(neutral, "control");
    expect(control?.properties.layoutMode).toBe("VERTICAL");
    expect(control?.properties.fills).toEqual([]);
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
    expect(control?.children.map((child) => child.name)).toEqual(["label", "track", "value-text"]);
    const label = descendant(neutral, "label");
    expect(label?.properties.characters).toBe("Messwert");
    expect(label?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    expect(paints(label, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(label, "fontSize")).toBe("typography/label/1/font-size");
    const track = descendant(neutral, "track");
    expect(track?.properties.layoutMode).toBe("HORIZONTAL");
    expect(track?.properties.clipsContent).toBe(true);
    expect(paints(track, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    // In the set the track has no stroke: the unknown value is the example's.
    expect(track?.properties.strokes).toEqual([]);
    expect(track?.properties.dashPattern).toEqual([]);
    expect(bound(track, "cornerRadius")).toBe("radius/role/pill");
    expect(bound(track, "minHeight")).toBe("spacing/medium");
    expect(track?.children.map((child) => child.name)).toEqual(["fill"]);
    const fill = descendant(neutral, "fill");
    expect(paints(fill, "fills")[0]?.boundVariables?.color?.name).toBe("color/border/strong");
    expect(bound(fill, "cornerRadius")).toBe("radius/role/pill");
    expect(bound(fill, "minHeight")).toBe("spacing/medium");
    const valueText = descendant(neutral, "value-text");
    expect(valueText?.properties.characters).toBe("66 % von 3 prüfbaren");
    expect(paints(valueText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/subtle");
    expect(bound(valueText, "fontSize")).toBe("typography/label/2/font-size");
    for (const [intent, token] of [
      ["success", "color/status/success/border"],
      ["warning", "color/status/warning/border"],
      ["danger", "color/status/danger/border"],
    ] as const) {
      const colour = descendant(variant(`intent=${intent}, state=rest`), "fill");
      expect(paints(colour, "fills")[0]?.boundVariables?.color?.name, intent).toBe(token);
    }
  });

  it("gives the column the width of its wider text, the track fills it, and the fill is 66 % of the track, as high as the track (F-3)", async () => {
    const { variant } = await drawn();
    const trackHeight = Number.parseFloat(planned?.variants[0]?.geometry?.["track.height"] ?? "");
    expect(trackHeight).toBeGreaterThan(0);
    for (const intent of ["neutral", "success", "warning", "danger"]) {
      const node = variant(`intent=${intent}, state=rest`);
      const control = descendant(node, "control");
      const label = descendant(node, "label");
      const valueText = descendant(node, "value-text");
      const track = descendant(node, "track");
      const fill = descendant(node, "fill");
      const widest = Math.max(box(label).width, box(valueText).width);
      expect(widest, intent).toBeGreaterThan(0);
      // The column carries the written width (a set has no container to fill); the variant hugs.
      expect(control?.properties.layoutSizingHorizontal, intent).toBe("FIXED");
      expect(control?.properties.layoutSizingVertical, intent).toBe("HUG");
      expect(box(control).width, intent).toBe(widest);
      expect(node?.properties.layoutSizingHorizontal, intent).toBe("HUG");
      expect(box(node).width, intent).toBe(widest);
      // The track fills the column's inline axis and is as high as track.height, no 100 × 100.
      expect(track?.properties.layoutSizingHorizontal, intent).toBe("FILL");
      expect(track?.properties.layoutSizingVertical, intent).toBe("HUG");
      expect(track?.properties.minWidth, intent).toBeUndefined();
      expect(box(track).width, intent).toBe(widest);
      expect(box(track).height, intent).toBe(trackHeight);
      // The fill is the share of the track, measured from the track, and as high as the track:
      // an empty auto-layout frame keeps its size, so it is fixed and resized, not hugging.
      expect(planned?.meter?.share).toBe(0.66);
      expect(fill?.properties.layoutSizingHorizontal, intent).toBe("FIXED");
      expect(fill?.properties.layoutSizingVertical, intent).toBe("FIXED");
      expect(fill?.properties.minWidth, intent).toBeUndefined();
      expect(box(fill).width, intent).toBe(0.66 * widest);
      expect(box(fill).height, intent).toBe(trackHeight);
      expect(box(fill).height, intent).toBe(box(track).height);
      expect(bound(fill, "minHeight"), intent).toBe("spacing/medium");
    }
  });

  it('places the example „unbekannt" beside the set: the track dashed in the unknown stroke, no fill, the text nicht geprüft', async () => {
    const { double, mezurilo, set } = await drawn();
    const example = pageNodes(double).find((child) => child.name === "mezurilo – unbekannt");
    expect(example).toBeDefined();
    expect(example?.getSharedPluginData("fundamento", "example")).toBe("mezurilo");
    expect(mezurilo?.example).toEqual({
      name: "mezurilo – unbekannt",
      found: false,
      created: true,
    });
    // Right after the set in the frame Eroj (F-8), in its flow.
    const frame = set?.parent;
    expect(frame?.getSharedPluginData("fundamento", "frame")).toBe("Eroj");
    expect(frame?.children.indexOf(example as DoubleNode)).toBe(
      (frame?.children.indexOf(set as DoubleNode) ?? -2) + 1,
    );
    expect(example?.properties.layoutPositioning).toBe("AUTO");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    // No backdrop, but the ground of the set (F-6): the example is a picture of the Ero like a
    // variant, so its texts stand on the Vitrino's canvas they are paired with — not on whatever
    // the section shows in the mode it is in (in a dark scheme: light text on a white section).
    expect(mezurilo).toBeDefined();
    const ground = paints(example, "fills");
    expect(ground).toHaveLength(1);
    expect(ground[0]?.boundVariables?.color?.name).toBe("color/background/canvas");
    expect((ground[0] as { opacity?: number }).opacity).toBe(1);
    expect(ground[0]?.visible).toBe(true);
    const track = descendant(example, "track");
    expect(paints(track, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/default");
    expect(paints(track, "strokes")[0]?.visible).toBe(true);
    expect(bound(track, "strokeWeight")).toBe("border/width/default");
    expect(track?.properties.dashPattern).toEqual(planned?.variants[0]?.stroke?.dashPattern);
    expect(track?.properties.dashPattern).toHaveLength(2);
    expect(paints(track, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    expect(track?.children).toEqual([]);
    expect(descendant(example, "fill")).toBeUndefined();
    expect(descendant(example, "label")?.properties.characters).toBe("Messwert");
    const valueText = descendant(example, "value-text");
    expect(valueText?.properties.characters).toBe("nicht geprüft");
    // F-6: the value text of the example binds the role of the set's value text, color.text.subtle
    // from the Skemo's part value-text, with the paint's alpha as the token resolves (1) and no
    // opacity of its own — no disabled look, not the border colour of the unknown part.
    const setValueText = descendant(set?.children[0], "value-text");
    const role = paints(valueText, "fills");
    expect(role).toHaveLength(1);
    expect(role[0]?.boundVariables?.color?.name).toBe("color/text/subtle");
    expect(role[0]?.boundVariables?.color?.name).toBe(
      paints(setValueText, "fills")[0]?.boundVariables?.color?.name,
    );
    expect((role[0] as { opacity?: number }).opacity).toBe(1);
    expect(role[0]?.visible).toBe(true);
    expect(valueText?.properties.opacity).toBe(1);
    expect(valueText?.properties.effects).toEqual([]);
    expect(bound(valueText, "fontSize")).toBe("typography/label/2/font-size");
    expect(valueText?.properties.fontName).toEqual(setValueText?.properties.fontName);
    // The column and the track are as wide as in the set: the wider text, here the label; the
    // empty track keeps the height of track.height, not the 100 × 100 of createFrame (F-3).
    const widest = Math.max(box(descendant(example, "label")).width, box(valueText).width);
    const control = descendant(example, "control");
    expect(control?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(box(control).width).toBe(widest);
    expect(track?.properties.layoutSizingHorizontal).toBe("FILL");
    expect(track?.properties.layoutSizingVertical).toBe("HUG");
    expect(track?.properties.minWidth).toBeUndefined();
    expect(box(track).width).toBe(widest);
    expect(box(track).height).toBe(
      Number.parseFloat(planned?.variants[0]?.geometry?.["track.height"] ?? ""),
    );
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, mezurilo, report } = await drawn();
    expect(mezurilo?.layout.zero).toEqual([]);
    expect(mezurilo?.layout.smaller).toEqual([]);
    expect(mezurilo?.layout.unplaced).toEqual([]);
    expect(mezurilo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("mezurilo"))).toEqual([]);
    expect(mezurilo?.layout.held.rest.control).toBeDefined();
    expect(mezurilo?.layout.held.rest.track).toBeDefined();
    expect(mezurilo?.layout.held.rest.fill).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ④ (spec „tabelo", G2, G4; plan ④ D-14): the table is a structure of its own — variant
// (a column) → caption (the label property, shown by the BOOLEAN property „caption": Figma shows
// a layer when its property is true, so the Skemo's caption-hidden false is the caption's true),
// region (border, radius, clipping) → head (its fill, the bottom border) and three rows (the
// bottom border), each a row of three cells (inline padding and minimum height by density); every
// cell of a column at least as wide as the widest of the column, written from what the tool
// measured (Regel 0: the tool computes the layout, the plugin binds no width). The first head
// cell holds the sort button: focus-ring → focus-gap → sort (fill by state, radius) with the head
// text and the chevron of the select (sort-indicator, its size bound, the vector's fill bound to
// sort-indicator.color). The numeric column aligns its texts at the end; tabular figures are no
// property of a Figma text (noted, not drawn). The words are the Vitrino's table.
describe("the tabelo is drawn as a table: caption, region with head and three rows, the sort button in the first head cell (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Box = { width: number; height: number };
  const box = (node: DoubleNode | undefined): Box => {
    const { width, height } = (node ?? {}) as unknown as Box;
    return { width, height };
  };
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "tabelo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const tabelo = report.components.find((component) => component.set === "tabelo");
    return { double, set, variant, report, tabelo };
  };
  const REST = "density=comfortable, state=rest";
  const FOCUS = "density=comfortable, state=focus";

  it("draws six variants of density × state: the caption above the region with head and three rows of three cells", async () => {
    const { set, variant, tabelo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "density=comfortable, state=rest",
      "density=comfortable, state=hover",
      "density=comfortable, state=focus",
      "density=compact, state=rest",
      "density=compact, state=hover",
      "density=compact, state=focus",
    ]);
    expect(tabelo?.layout.columns).toBe(3);
    expect(tabelo?.layout.rows).toBe(2);
    const rest = variant(REST);
    expect(rest?.properties.layoutMode).toBe("VERTICAL");
    expect(rest?.children.map((child) => child.name)).toEqual(["caption", "region"]);
    const caption = descendant(rest, "caption");
    expect(caption?.properties.characters).toBe("Beschriftung");
    expect(caption?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
      visible: expect.stringMatching(/^caption#/),
    });
    expect(caption?.properties.visible).toBe(true);
    expect(paints(caption, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(caption, "fontSize")).toBe("typography/label/1/font-size");
    const region = descendant(rest, "region");
    expect(region?.properties.layoutMode).toBe("VERTICAL");
    expect(region?.properties.clipsContent).toBe(true);
    expect(region?.properties.fills).toEqual([]);
    expect(paints(region, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/subtle");
    expect(bound(region, "strokeWeight")).toBe("border/width/default");
    expect(bound(region, "cornerRadius")).toBe("radius/role/surface");
    expect(region?.children.map((child) => child.name)).toEqual([
      "head",
      "row-1",
      "row-2",
      "row-3",
    ]);
    const head = descendant(rest, "head");
    expect(head?.properties.layoutMode).toBe("HORIZONTAL");
    expect(paints(head, "fills")[0]?.boundVariables?.color?.name).toBe("color/background/sunken");
    expect(paints(head, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/subtle");
    expect(bound(head, "strokeBottomWeight")).toBe("border/width/default");
    expect(head?.properties.strokeTopWeight).toBe(0);
    expect(head?.children.map((child) => child.name)).toEqual(["head-1", "head-2", "head-3"]);
    for (const row of [1, 2, 3]) {
      const node = descendant(rest, `row-${row}`);
      expect(node?.properties.layoutMode, `row-${row}`).toBe("HORIZONTAL");
      expect(node?.properties.fills, `row-${row}`).toEqual([]);
      expect(paints(node, "strokes")[0]?.boundVariables?.color?.name, `row-${row}`).toBe(
        "color/border/subtle",
      );
      expect(bound(node, "strokeBottomWeight"), `row-${row}`).toBe("border/width/default");
      expect(
        node?.children.map((child) => child.name),
        `row-${row}`,
      ).toEqual([`cell-${row}-1`, `cell-${row}-2`, `cell-${row}-3`]);
    }
    // The words of the Vitrino's table: head, row headers, text and numeric cells.
    expect(descendant(rest, "sort-text")?.properties.characters).toBe("Name");
    expect(descendant(rest, "head-text-2")?.properties.characters).toBe("Status");
    expect(descendant(rest, "head-text-3")?.properties.characters).toBe("Anzahl");
    expect(descendant(rest, "row-header-text-1")?.properties.characters).toBe("Barrierefreiheit");
    expect(descendant(rest, "cell-text-2-2")?.properties.characters).toBe("Entwurf");
    expect(descendant(rest, "cell-text-3-3")?.properties.characters).toBe("1");
    // Head texts in head.color and head.typography; row headers in row-header.typography; cells
    // in cell.color and cell.typography.
    const headText = descendant(rest, "head-text-2");
    expect(paints(headText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(headText, "fontSize")).toBe("typography/label/1/font-size");
    const rowHeader = descendant(rest, "row-header-text-2");
    expect(paints(rowHeader, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    expect(bound(rowHeader, "fontSize")).toBe("typography/label/1/font-size");
    const cellText = descendant(rest, "cell-text-2-2");
    expect(bound(cellText, "fontSize")).toBe("typography/body/2/font-size");
    // The numeric column at the end: the cell aligns at the end, the text to the right.
    for (const name of ["head-text-3", "cell-text-1-3", "cell-text-3-3"]) {
      expect(descendant(rest, name)?.properties.textAlignHorizontal, name).toBe("RIGHT");
    }
    expect(descendant(rest, "cell-text-1-2")?.properties.textAlignHorizontal).not.toBe("RIGHT");
    expect(descendant(rest, "cell-1-3")?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(descendant(rest, "cell-1-2")?.properties.primaryAxisAlignItems).toBe("MIN");
  });

  it("binds padding and minimum height of every cell by density, and gives every cell of a column the width of its widest", async () => {
    const { variant } = await drawn();
    const cells = (node: DoubleNode | undefined, column: number) =>
      [`head-${column}`, `cell-1-${column}`, `cell-2-${column}`, `cell-3-${column}`].map((name) =>
        descendant(node, name),
      );
    for (const [name, padding, height] of [
      [REST, "spacing/medium", "size/control/large"],
      ["density=compact, state=rest", "spacing/small", "size/control/small"],
    ] as const) {
      const node = variant(name);
      for (const column of [1, 2, 3]) {
        for (const cell of cells(node, column)) {
          expect(cell?.properties.layoutMode, `${name} ${cell?.name}`).toBe("HORIZONTAL");
          expect(cell?.properties.fills, `${name} ${cell?.name}`).toEqual([]);
          expect(bound(cell, "paddingLeft"), `${name} ${cell?.name}`).toBe(padding);
          expect(bound(cell, "paddingRight"), `${name} ${cell?.name}`).toBe(padding);
          expect(bound(cell, "minHeight"), `${name} ${cell?.name}`).toBe(height);
        }
        // One width per column (the widest cell's), written as the minimum of every cell.
        const widths = cells(node, column).map((cell) => box(cell).width);
        expect(new Set(widths).size, `${name} column ${column}`).toBe(1);
        expect(widths[0], `${name} column ${column}`).toBeGreaterThan(0);
        for (const cell of cells(node, column)) {
          expect(cell?.properties.minWidth, `${name} ${cell?.name}`).toBe(widths[0]);
        }
      }
      // The rows are as wide as the head: columns align.
      const widths = ["head", "row-1", "row-2", "row-3"].map(
        (row) => box(descendant(node, row)).width,
      );
      expect(new Set(widths).size, name).toBe(1);
    }
  });

  it("draws the sort button in the first head cell: fill by state, radius, the chevron bound, the ring in the focus variant only", async () => {
    const { variant } = await drawn();
    const rest = variant(REST);
    const hover = variant("density=comfortable, state=hover");
    const focus = variant(FOCUS);
    for (const [node, state] of [
      [rest, "rest"],
      [hover, "hover"],
      [focus, "focus"],
    ] as const) {
      const cell = descendant(node, "head-1");
      expect(
        cell?.children.map((child) => child.name),
        state,
      ).toEqual(["focus-ring"]);
      const ring = descendant(cell, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      const sort = descendant(gap, "sort");
      expect(sort?.properties.layoutMode, state).toBe("HORIZONTAL");
      expect(bound(sort, "cornerRadius"), state).toBe("radius/role/control");
      expect(
        sort?.children.map((child) => child.name),
        state,
      ).toEqual(["sort-text", "sort-indicator"]);
      const text = descendant(sort, "sort-text");
      expect(paints(text, "fills")[0]?.boundVariables?.color?.name, state).toBe(
        "color/text/default",
      );
      expect(bound(text, "fontSize"), state).toBe("typography/label/1/font-size");
      const indicator = descendant(sort, "sort-indicator");
      expect(indicator?.properties.layoutMode, state).toBe("NONE");
      expect(bound(indicator, "width"), state).toBe("size/icon/small");
      expect(bound(indicator, "height"), state).toBe("size/icon/small");
      expect(indicator?.properties.fills, state).toEqual([]);
      const mark = descendant(indicator, "mark");
      expect(mark?.type, state).toBe("VECTOR");
      expect(paints(mark, "fills")[0]?.boundVariables?.color?.name, state).toBe(
        "color/text/subtle",
      );
      expect(mark?.properties.strokes, state).toEqual([]);
      // The ring and its gap reserve their room in every state (F11).
      expect(bound(ring, "paddingLeft"), state).toBe("focus/ring/width");
      expect(bound(gap, "paddingLeft"), state).toBe("focus/offset");
      expect(bound(ring, "cornerRadius"), state).toBe("radius/focus/ring");
      expect(bound(gap, "cornerRadius"), state).toBe("radius/focus/gap");
    }
    expect(paints(descendant(rest, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/rest",
    );
    expect(paints(descendant(hover, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/hover",
    );
    expect(paints(descendant(focus, "sort"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/action/tertiary/rest",
    );
    // The ring shows its colours in the focus state only.
    expect(paints(descendant(rest, "focus-ring"), "strokes")).toEqual([]);
    expect(paints(descendant(hover, "focus-ring"), "strokes")).toEqual([]);
    expect(paints(descendant(focus, "focus-ring"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "focus/ring/color",
    );
    expect(paints(descendant(focus, "focus-gap"), "strokes")[0]?.boundVariables?.color?.name).toBe(
      "color/focus/inner",
    );
    // The other head cells hold their text alone.
    expect(descendant(rest, "head-2")?.children.map((child) => child.name)).toEqual([
      "head-text-2",
    ]);
  });

  it("declares caption-hidden as the BOOLEAN property caption (shown), default true, connected to the caption's visibility, once over two runs", async () => {
    const { double, set, variant } = await drawn();
    const definitions = () => (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const key = () =>
      Object.keys(definitions()).find((candidate) => candidate.startsWith("caption#"));
    expect(key()).toBeDefined();
    expect(definitions()[key() ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
    expect(Object.keys(definitions())).toHaveLength(2);
    for (const node of set?.children ?? []) {
      const caption = descendant(node, "caption");
      expect(caption?.properties.visible, node.name).toBe(true);
      expect(caption?.properties.componentPropertyReferences, node.name).toMatchObject({
        visible: key(),
      });
    }
    expect(variant(REST)).toBeDefined();
    await run(double, source);
    expect(Object.keys(definitions())).toHaveLength(2);
    expect(definitions()[key() ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
  });

  it("measures every variant with a size and a cell, the three states of a density alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, tabelo, report } = await drawn();
    expect(tabelo?.layout.zero).toEqual([]);
    expect(tabelo?.layout.smaller).toEqual([]);
    expect(tabelo?.layout.unplaced).toEqual([]);
    expect(tabelo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("tabelo"))).toEqual([]);
    expect(tabelo?.layout.held.rest.caption).toBeDefined();
    expect(tabelo?.layout.held.rest.region).toBeDefined();
    expect(tabelo?.layout.held.rest.head).toBeDefined();
    expect(tabelo?.layout.held.rest.sort).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ④ (spec „atributlisto", G2; plan ④ D-14): the list is a structure of its own —
// variant → list (a column, the gap bound to list.gap) → three entries, the Vitrino's: in columns
// a row, term then value, the gap bound to box.inline-padding; stacked a column, the gap bound to
// box.gap. The term in term.color and term.typography, the value in value.color and
// value.typography; an empty value shows the dash. The label prop is the accessible name: the set
// declares the label property and connects no text to it (nothing seen, nothing drawn).
describe("the atributlisto is drawn as a list: three entries, rows in columns and columns stacked (Spec 011 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "atributlisto");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const atributlisto = report.components.find((component) => component.set === "atributlisto");
    return { double, set, variant, report, atributlisto };
  };

  it("draws three variants by layout: the list column with three entries, each term and value in their roles", async () => {
    const { set, variant, atributlisto } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "layout=columns, state=rest",
      "layout=stacked, state=rest",
      "layout=auto, state=rest",
    ]);
    expect(atributlisto?.layout.columns).toBe(1);
    expect(atributlisto?.layout.rows).toBe(3);
    // Spec 014 ① (layout auto, plan ① D-03): the set draws auto as the wide case, the columns.
    for (const [name, mode, gap] of [
      ["layout=columns, state=rest", "HORIZONTAL", "spacing/large"],
      ["layout=stacked, state=rest", "VERTICAL", "spacing/small"],
      ["layout=auto, state=rest", "HORIZONTAL", "spacing/large"],
    ] as const) {
      const node = variant(name);
      const list = descendant(node, "list");
      expect(list?.properties.layoutMode, name).toBe("VERTICAL");
      expect(list?.properties.fills, name).toEqual([]);
      expect(bound(list, "itemSpacing"), name).toBe("spacing/large");
      expect(
        list?.children.map((child) => child.name),
        name,
      ).toEqual(["entry-1", "entry-2", "entry-3"]);
      for (const index of [1, 2, 3]) {
        const entry = descendant(node, `entry-${index}`);
        expect(entry?.properties.layoutMode, `${name} entry-${index}`).toBe(mode);
        expect(bound(entry, "itemSpacing"), `${name} entry-${index}`).toBe(gap);
        expect(
          entry?.children.map((child) => child.name),
          `${name} entry-${index}`,
        ).toEqual([`term-${index}`, `value-${index}`]);
        const term = descendant(entry, `term-${index}`);
        expect(paints(term, "fills")[0]?.boundVariables?.color?.name, name).toBe(
          "color/text/muted",
        );
        expect(bound(term, "fontSize"), name).toBe("typography/label/2/font-size");
        const value = descendant(entry, `value-${index}`);
        expect(paints(value, "fills")[0]?.boundVariables?.color?.name, name).toBe(
          "color/text/default",
        );
        expect(bound(value, "fontSize"), name).toBe("typography/body/2/font-size");
      }
      expect(descendant(node, "term-1")?.properties.characters, name).toBe("Version");
      expect(descendant(node, "value-1")?.properties.characters, name).toBe("3");
      expect(descendant(node, "term-2")?.properties.characters, name).toBe("Verantwortlich");
      expect(descendant(node, "value-2")?.properties.characters, name).toBe("Team Fundamento");
      expect(descendant(node, "term-3")?.properties.characters, name).toBe("Gültig seit");
      expect(descendant(node, "value-3")?.properties.characters, name).toBe("–");
      // No text carries the label property: the label is the accessible name, never seen.
      const connected = (child: DoubleNode): boolean =>
        child.properties.componentPropertyReferences !== undefined ||
        child.children.some(connected);
      expect(connected(node as DoubleNode), name).toBe(false);
    }
  });

  it("declares the label property with the word Angaben and nothing else", async () => {
    const { set } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Angaben" }]);
  });

  it("measures every variant with a size and a cell, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, atributlisto, report } = await drawn();
    expect(atributlisto?.layout.zero).toEqual([]);
    expect(atributlisto?.layout.smaller).toEqual([]);
    expect(atributlisto?.layout.unplaced).toEqual([]);
    expect(atributlisto?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("atributlisto"))).toEqual([]);
    expect(atributlisto?.layout.held.rest.list).toBeDefined();
    expect(atributlisto?.layout.held.rest.entry).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ⑤ (spec „navigado", E7, G2): the navigation is a structure of its own — variant →
// control (the nav, a row with the gap bound to box.gap) → three entries, the Vitrino's words
// (Eins, Zwei, Drei), each ring → gap → item (fill by current and state, the box's height, radius
// and inline padding, the underline as the bottom stroke: bound where current, 0 elsewhere) with
// its text (colour by current, the label role). The first item is the current one. The label prop
// is the name of the landmark: the set declares the label property and connects no text to it.
// The example frame „vertikal" beside the set stacks the same items in a column; orientation is
// no variant axis (the Web stylesheet inventory says props {}).
describe("the navigado is drawn as a nav: three items in a row, the first current with the underline; the example vertical (Spec 011 ⑤)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = { visible: boolean; boundVariables?: { color?: { name: string } } };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: { name: string; found: boolean; created: boolean };
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "navigado");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const navigado = report.components.find((component) => component.set === "navigado");
    return { double, set, variant, report, navigado };
  };

  it("draws three variants by state: the nav row with three entries, each ring → gap → item with its text", async () => {
    const { set, variant, navigado } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
    ]);
    expect(navigado?.layout.columns).toBe(3);
    expect(navigado?.layout.rows).toBe(1);
    const rest = variant("state=rest");
    const control = descendant(rest, "control");
    expect(rest?.children.map((child) => child.name)).toEqual(["control"]);
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.fills).toEqual([]);
    expect(bound(control, "itemSpacing")).toBe("spacing/xsmall");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    for (const index of [1, 2, 3]) {
      const entry = descendant(control, `entry-${index}`);
      expect(
        entry?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual(["focus-ring"]);
      const ring = descendant(entry, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      expect(
        gap?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`item-${index}`]);
      const item = descendant(gap, `item-${index}`);
      expect(
        item?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`items-${index}`]);
      expect(item?.properties.layoutMode, `item-${index}`).toBe("HORIZONTAL");
      expect(bound(item, "minHeight"), `item-${index}`).toBe("size/target/min");
      expect(bound(item, "cornerRadius"), `item-${index}`).toBe("radius/role/control");
      expect(bound(item, "paddingLeft"), `item-${index}`).toBe("spacing/small");
      expect(bound(item, "paddingRight"), `item-${index}`).toBe("spacing/small");
      expect(item?.properties.strokesIncludedInLayout, `item-${index}`).toBe(true);
      expect(paints(item, "strokes")[0]?.boundVariables?.color?.name, `item-${index}`).toBe(
        "color/navigation/text/selected",
      );
      const text = descendant(item, `items-${index}`);
      expect(bound(text, "fontSize"), `items-${index}`).toBe("typography/label/1/font-size");
      expect(bound(text, "fontFamily"), `items-${index}`).toBe("typography/label/1/font-family");
    }
    expect(descendant(rest, "items-1")?.properties.characters).toBe("Eins");
    expect(descendant(rest, "items-2")?.properties.characters).toBe("Zwei");
    expect(descendant(rest, "items-3")?.properties.characters).toBe("Drei");
    // No text carries the label property: the label is the name of the landmark, never seen.
    const connected = (child: DoubleNode): boolean =>
      child.properties.componentPropertyReferences !== undefined || child.children.some(connected);
    expect(connected(rest as DoubleNode)).toBe(false);
  });

  it("marks the first item as current: selected fill, selected text, the underline bound; the others rest and hover by state, no underline", async () => {
    const { variant } = await drawn();
    for (const [name, fill] of [
      ["state=rest", "color/navigation/rest"],
      ["state=hover", "color/navigation/hover"],
      ["state=focus", "color/navigation/rest"],
    ] as const) {
      const node = variant(name);
      const current = descendant(node, "item-1");
      expect(paints(current, "fills")[0]?.boundVariables?.color?.name, name).toBe(
        "color/navigation/selected",
      );
      expect(bound(current, "strokeBottomWeight"), name).toBe("border/width/strong");
      expect(
        paints(descendant(node, "items-1"), "fills")[0]?.boundVariables?.color?.name,
        name,
      ).toBe("color/navigation/text/selected");
      // Spec 014 ① (Gewicht, plan ① D-01): the current item's text in the semibold cut, its style
      // bound to the STRING twin of the weight (F30), the others in the cut of their role.
      expect(descendant(node, "items-1")?.properties.fontName, name).toEqual({
        family: "Geist",
        style: "SemiBold",
      });
      expect(bound(descendant(node, "items-1"), "fontStyle"), name).toBe("font/style/semibold");
      expect(descendant(node, "items-2")?.properties.fontName, name).toEqual({
        family: "Geist",
        style: "Medium",
      });
      expect(bound(descendant(node, "items-2"), "fontStyle"), name).toBe(
        "typography/label/1/font-style",
      );
      for (const index of [2, 3]) {
        const other = descendant(node, `item-${index}`);
        expect(paints(other, "fills")[0]?.boundVariables?.color?.name, `${name} ${index}`).toBe(
          fill,
        );
        expect(bound(other, "strokeBottomWeight"), `${name} ${index}`).toBeUndefined();
        expect(other?.properties.strokeBottomWeight, `${name} ${index}`).toBe(0);
        expect(
          paints(descendant(node, `items-${index}`), "fills")[0]?.boundVariables?.color?.name,
          `${name} ${index}`,
        ).toBe("color/navigation/text/rest");
      }
    }
  });

  it("shows the focus ring on the first item in the focus variant only, its radii bound (F32)", async () => {
    const { variant } = await drawn();
    const focus = variant("state=focus");
    const ring = descendant(descendant(focus, "entry-1"), "focus-ring");
    const gap = descendant(ring, "focus-gap");
    expect(paints(ring, "strokes")).toHaveLength(1);
    expect(paints(ring, "strokes")[0]?.boundVariables?.color?.name).toBe("focus/ring/color");
    expect(paints(gap, "strokes")[0]?.boundVariables?.color?.name).toBe("color/focus/inner");
    expect(bound(ring, "cornerRadius")).toBe("radius/focus/ring");
    expect(bound(gap, "cornerRadius")).toBe("radius/focus/gap");
    expect(paints(descendant(descendant(focus, "entry-2"), "focus-ring"), "strokes")).toEqual([]);
    const rest = variant("state=rest");
    expect(paints(descendant(descendant(rest, "entry-1"), "focus-ring"), "strokes")).toEqual([]);
  });

  it("declares the label property with the word Navigation and nothing else", async () => {
    const { set } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Navigation" }]);
  });

  it('places the example „vertikal" right after the set: the same three items in a column, the first current', async () => {
    const { double, set, navigado } = await drawn();
    const frame = set?.parent as DoubleNode | undefined;
    const names = frame?.children.map((child) => child.name) ?? [];
    expect(names.indexOf(`navigado – ${VERTICAL_EXAMPLE}`)).toBe(names.indexOf("navigado") + 1);
    const example = frame?.children.find(
      (child) => child.name === `navigado – ${VERTICAL_EXAMPLE}`,
    );
    expect(example?.type).toBe("FRAME");
    expect(navigado?.example).toEqual({
      name: `navigado – ${VERTICAL_EXAMPLE}`,
      found: false,
      created: true,
    });
    const control = descendant(example, "control");
    expect(control?.properties.layoutMode).toBe("VERTICAL");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    expect(paints(descendant(example, "item-1"), "fills")[0]?.boundVariables?.color?.name).toBe(
      "color/navigation/selected",
    );
    expect(bound(descendant(example, "item-1"), "strokeBottomWeight")).toBe("border/width/strong");
    expect(descendant(example, "items-3")?.properties.characters).toBe("Drei");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    // The example is found on the second run: nothing is created twice.
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    expect(report.components.find((component) => component.set === "navigado")?.example).toEqual({
      name: `navigado – ${VERTICAL_EXAMPLE}`,
      found: true,
      created: false,
    });
    expect(
      frame?.children.filter((child) => child.name === `navigado – ${VERTICAL_EXAMPLE}`),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, the three states alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, navigado, report } = await drawn();
    expect(navigado?.layout.zero).toEqual([]);
    expect(navigado?.layout.smaller).toEqual([]);
    expect(navigado?.layout.unplaced).toEqual([]);
    expect(navigado?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("navigado"))).toEqual([]);
    expect(navigado?.layout.held.rest.control).toBeDefined();
    expect(navigado?.layout.held.rest.entry).toBeDefined();
    expect(navigado?.layout.held.rest["item-1"]).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 011 ⑤ (spec „langetaro", E7, G2): the tab list is a structure of its own — variant → a
// column of the control (the list: a row of three entries with its line as the bottom stroke in
// list.color and list.width, the gap bound to list.gap) and the panel (its inline padding bound,
// the Vitrino's word of the first tab in panel.color). Every entry is ring → gap → tab (fill by
// state, height and inline padding, the selected indicator as the bottom stroke: bound where
// active, 0 elsewhere) with its text (colour by active, the label role). The first tab is the
// active one. The label prop is the name of the group: the set declares the label property and
// connects no text to it.
describe("the langetaro is drawn as tabs: the list with three tabs, the first active with the indicator, the line, the panel below (Spec 011 ⑤)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  type Paint = {
    visible: boolean;
    opacity?: number;
    boundVariables?: { color?: { name: string } };
  };
  const paints = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      example?: unknown;
      layout: {
        zero: string[];
        smaller: string[];
        unplaced: string[];
        uneven: unknown[];
        columns: number;
        rows: number;
        held: { rest: Record<string, Record<string, unknown>> };
      };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "langetaro");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const langetaro = report.components.find((component) => component.set === "langetaro");
    return { double, set, variant, report, langetaro };
  };

  it("draws four variants by state: the list row with three entries and the panel below, each tab ring → gap → tab with its text", async () => {
    const { set, variant, langetaro } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
      "state=disabled",
    ]);
    expect(langetaro?.layout.columns).toBe(4);
    expect(langetaro?.layout.rows).toBe(1);
    const rest = variant("state=rest");
    expect(rest?.properties.layoutMode).toBe("VERTICAL");
    expect(rest?.children.map((child) => child.name)).toEqual(["control", "panel"]);
    const control = descendant(rest, "control");
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.fills).toEqual([]);
    expect(control?.properties.strokesIncludedInLayout).toBe(true);
    expect(paints(control, "strokes")[0]?.boundVariables?.color?.name).toBe("color/border/default");
    expect(bound(control, "strokeBottomWeight")).toBe("border/width/default");
    expect(control?.properties.strokeTopWeight).toBe(0);
    expect(bound(control, "itemSpacing")).toBe("spacing/xsmall");
    expect(control?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    for (const index of [1, 2, 3]) {
      const entry = descendant(control, `entry-${index}`);
      const ring = descendant(entry, "focus-ring");
      const gap = descendant(ring, "focus-gap");
      expect(
        gap?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`tab-${index}`]);
      const tab = descendant(gap, `tab-${index}`);
      expect(
        tab?.children.map((child) => child.name),
        `entry-${index}`,
      ).toEqual([`tabs-${index}`]);
      expect(bound(tab, "minHeight"), `tab-${index}`).toBe("size/target/min");
      expect(bound(tab, "paddingLeft"), `tab-${index}`).toBe("spacing/medium");
      expect(bound(tab, "paddingRight"), `tab-${index}`).toBe("spacing/medium");
      expect(tab?.properties.strokesIncludedInLayout, `tab-${index}`).toBe(true);
      expect(paints(tab, "strokes")[0]?.boundVariables?.color?.name, `tab-${index}`).toBe(
        "color/navigation/text/selected",
      );
      const text = descendant(tab, `tabs-${index}`);
      expect(bound(text, "fontSize"), `tabs-${index}`).toBe("typography/label/1/font-size");
    }
    expect(descendant(rest, "tabs-1")?.properties.characters).toBe("Eins");
    expect(descendant(rest, "tabs-2")?.properties.characters).toBe("Zwei");
    expect(descendant(rest, "tabs-3")?.properties.characters).toBe("Drei");
    const panel = descendant(rest, "panel");
    expect(panel?.properties.layoutMode).toBe("HORIZONTAL");
    expect(bound(panel, "paddingLeft")).toBe("spacing/medium");
    expect(bound(panel, "paddingRight")).toBe("spacing/medium");
    expect(panel?.children.map((child) => child.name)).toEqual(["panel-text"]);
    const panelText = descendant(panel, "panel-text");
    expect(panelText?.properties.characters).toBe("Eins");
    expect(paints(panelText, "fills")[0]?.boundVariables?.color?.name).toBe("color/text/default");
    // The panel's text has no role in the Skemo: nothing of its typography is bound.
    expect(bound(panelText, "fontSize")).toBeUndefined();
    const connected = (child: DoubleNode): boolean =>
      child.properties.componentPropertyReferences !== undefined || child.children.some(connected);
    expect(connected(rest as DoubleNode)).toBe(false);
  });

  it("fills every tab by state and marks the first as active: default text and the indicator bound; the others subtle, no indicator", async () => {
    const { variant } = await drawn();
    for (const [name, fill, opacity] of [
      ["state=rest", "color/action/tertiary/rest", 0],
      ["state=hover", "color/action/tertiary/hover", 0.08],
      ["state=focus", "color/action/tertiary/rest", 0],
      ["state=disabled", "color/action/tertiary/disabled", 0],
    ] as const) {
      const node = variant(name);
      for (const index of [1, 2, 3]) {
        const tab = descendant(node, `tab-${index}`);
        const fillPaint = paints(tab, "fills")[0];
        expect(fillPaint?.boundVariables?.color?.name, `${name} ${index}`).toBe(fill);
        expect(fillPaint?.opacity, `${name} ${index}`).toBe(opacity);
      }
      expect(bound(descendant(node, "tab-1"), "strokeBottomWeight"), name).toBe(
        "border/width/strong",
      );
      expect(
        paints(descendant(node, "tabs-1"), "fills")[0]?.boundVariables?.color?.name,
        name,
      ).toBe("color/text/default");
      for (const index of [2, 3]) {
        expect(
          bound(descendant(node, `tab-${index}`), "strokeBottomWeight"),
          `${name} ${index}`,
        ).toBeUndefined();
        expect(descendant(node, `tab-${index}`)?.properties.strokeBottomWeight).toBe(0);
        expect(
          paints(descendant(node, `tabs-${index}`), "fills")[0]?.boundVariables?.color?.name,
          `${name} ${index}`,
        ).toBe("color/text/subtle");
      }
    }
  });

  it("shows the focus ring on the first tab in the focus variant only", async () => {
    const { variant } = await drawn();
    const focus = variant("state=focus");
    const ring = descendant(descendant(focus, "entry-1"), "focus-ring");
    expect(paints(ring, "strokes")).toHaveLength(1);
    expect(paints(ring, "strokes")[0]?.boundVariables?.color?.name).toBe("focus/ring/color");
    expect(paints(descendant(descendant(focus, "entry-2"), "focus-ring"), "strokes")).toEqual([]);
    for (const name of ["state=rest", "state=hover", "state=disabled"]) {
      const other = variant(name);
      expect(
        paints(descendant(descendant(other, "entry-1"), "focus-ring"), "strokes"),
        name,
      ).toEqual([]);
    }
  });

  it("declares the label property with the word Reiter and nothing else; no example frame", async () => {
    const { set, langetaro } = await drawn();
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    expect(Object.values(definitions)).toEqual([{ type: "TEXT", defaultValue: "Reiter" }]);
    expect(langetaro?.example).toBeUndefined();
  });

  it("measures every variant with a size and a cell, the four states alike, warns of nothing, and writes nothing new on a second run", async () => {
    const { double, langetaro, report } = await drawn();
    expect(langetaro?.layout.zero).toEqual([]);
    expect(langetaro?.layout.smaller).toEqual([]);
    expect(langetaro?.layout.unplaced).toEqual([]);
    expect(langetaro?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("langetaro"))).toEqual([]);
    expect(langetaro?.layout.held.rest.control).toBeDefined();
    expect(langetaro?.layout.held.rest.panel).toBeDefined();
    expect(langetaro?.layout.held.rest["tab-1"]).toBeDefined();
    const before = double.snapshot();
    const written = double.counts.writes;
    await run(double, source);
    expect(double.snapshot()).toBe(before);
    expect(double.counts.writes - written).toBe(0);
  });
});

// Spec 014 ② (G3, plan ② D-08): the plugin draws icons. An icon is one frame per Aspekto, imported
// from the glyph of that Aspekto (createNodeFromSvg), its visibility bound to the BOOLEAN
// variable ikonoj/<aspekto> — so the brand mode switches the picture — and its vectors' fill
// bound to the colour of the part. The set ikono draws one variant per name × size × intent;
// the butono draws its icon-start, the elektilo its chevron, the tabelo its sort arrow and the
// avizo its status icon the same way; the dialog shows the help of its reason (O-5 of ①).
describe("icons are drawn from the glyphs of every Aspekto and switch with the brand (Spec 014 ②)", () => {
  // The plan of core + ekzemplo: two Aspektoj, two glyph frames per icon.
  const source = files["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  const vectorOf = (frame: DoubleNode | undefined) =>
    frame?.children.find((child) => child.type === "VECTOR");
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as { warnings: string[]; components: { set: string; layout: { zero: string[] } }[] };
    const setOf = (name: string) => pageNodes(double).find((child) => child.name === name);
    return { double, report, setOf };
  };

  it("the set ikono: 300 variants, each the control with one glyph frame per Aspekto, visible by the brand variable, filled in the bound colour, sized by the token", async () => {
    const { setOf, report } = await drawn();
    const set = setOf("ikono");
    // Spec 025 ①: nineteen names (add, subtract) × 3 sizes × 5 intents.
    expect(set?.children).toHaveLength(300);
    const variant = set?.children.find(
      (child) => child.name === "name=close, size=medium, intent=neutral, state=rest",
    );
    expect(variant?.children.map((child) => child.name)).toEqual(["control"]);
    const control = descendant(variant, "control");
    expect(control?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    expect(bound(control, "width")).toBe("size/icon/medium");
    expect(bound(control, "height")).toBe("size/icon/medium");
    const komuna = descendant(variant, "glyph-komuna");
    const ekzemplo = descendant(variant, "glyph-ekzemplo");
    expect(bound(komuna, "visible")).toBe("ikonoj/komuna");
    expect(bound(ekzemplo, "visible")).toBe("ikonoj/ekzemplo");
    expect(paintOf(vectorOf(komuna), "fills")).toBe("color/text/default");
    expect(paintOf(vectorOf(ekzemplo), "fills")).toBe("color/text/default");
    const danger = set?.children.find(
      (child) => child.name === "name=danger, size=large, intent=danger, state=rest",
    );
    expect(paintOf(vectorOf(descendant(danger, "glyph-komuna")), "fills")).toBe(
      "color/status/danger/text",
    );
    expect(bound(descendant(danger, "control"), "width")).toBe("size/icon/large");
    expect(descendant(variant, "label")).toBeUndefined();
    expect(descendant(variant, "focus-ring")).toBeUndefined();
    expect(report.warnings.filter((warning) => warning.startsWith("ikono"))).toEqual([]);
    expect(report.components.find((component) => component.set === "ikono")?.layout.zero).toEqual(
      [],
    );
  });

  it("the butono draws its icon-start before the label, in the label's colour and the icon's size; the elektilo its chevron, the tabelo its sort arrow", async () => {
    const { setOf } = await drawn();
    const butono = setOf("butono");
    const rest = butono?.children.find(
      (child) => child.name === "emphasis=high, intent=neutral, size=medium, state=rest",
    );
    const control = descendant(rest, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["icon-start", "label"]);
    const icon = descendant(rest, "icon-start");
    expect(icon?.children.map((child) => child.name)).toEqual(["glyph-komuna", "glyph-ekzemplo"]);
    expect(bound(icon, "width")).toBe("size/icon/medium");
    expect(paintOf(vectorOf(descendant(icon, "glyph-komuna")), "fills")).toBe(
      "color/action/primary/text",
    );
    const elektilo = setOf("elektilo");
    const indicator = descendant(elektilo?.children[0], "indicator");
    expect(indicator?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    // No hand-drawn sign: the only vectors are the imports of the glyphs.
    expect(descendant(elektilo?.children[0], "mark")?.parent?.name).toBe("glyph-komuna");
    expect(paintOf(vectorOf(descendant(indicator, "glyph-komuna")), "fills")).toBe(
      "color/text/muted",
    );
    const tabelo = setOf("tabelo");
    const sortIndicator = descendant(tabelo?.children[0], "sort-indicator");
    expect(sortIndicator?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
      "glyph-ekzemplo",
    ]);
    expect(bound(sortIndicator, "width")).toBe("size/icon/small");
  });

  it("the avizo draws the icon of its intent before its texts, in the status text colour; the dialog shows the help of its reason (O-5)", async () => {
    const { setOf } = await drawn();
    const avizo = setOf("avizo");
    const danger = avizo?.children.find((child) => child.name === "intent=danger, state=rest");
    const control = descendant(danger, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["icon", "texts", "dismiss"]);
    const icon = descendant(danger, "icon");
    expect(bound(icon, "width")).toBe("size/icon/medium");
    expect(paintOf(vectorOf(descendant(icon, "glyph-komuna")), "fills")).toBe(
      "color/status/danger/text",
    );
    const dialogo = setOf("dialogo");
    const withReason = dialogo?.children.find((child) => child.name.includes("reason=optional"));
    const content = descendant(withReason, "content");
    expect(content?.children.map((child) => child.name)).toEqual([
      "reason-label",
      "reason-field",
      "reason-help",
    ]);
    expect(descendant(withReason, "reason-help")?.properties.characters).toBe(
      "Nenne den Grund in einem Satz.",
    );
    expect(paintOf(descendant(withReason, "reason-help"), "fills")).toBe("color/text/muted");
  });

  it("draws the apartigilo as a line and the saltligilo as a control; writes nothing new on a second run", async () => {
    const { double, setOf } = await drawn();
    const apartigilo = setOf("apartigilo");
    expect(apartigilo?.children.map((child) => child.name)).toEqual([
      "orientation=horizontal, state=rest",
      "orientation=vertical, state=rest",
    ]);
    const horizontal = descendant(apartigilo?.children[0], "control");
    expect(paintOf(horizontal, "strokes")).toBe("color/border/subtle");
    expect(bound(horizontal, "strokeTopWeight")).toBe("border/width/default");
    const vertical = descendant(apartigilo?.children[1], "control");
    expect(bound(vertical, "strokeLeftWeight")).toBe("border/width/default");
    expect(bound(vertical, "height")).toBe("size/control/medium");
    const saltligilo = setOf("saltligilo");
    expect(saltligilo?.children.map((child) => child.name)).toEqual(["state=rest", "state=focus"]);
    expect(paintOf(descendant(saltligilo?.children[0], "control"), "fills")).toBe(
      "color/background/raised",
    );
    expect(descendant(saltligilo?.children[0], "label")?.properties.characters).toBe("Ziel");
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });

  // Nachlese 4 N-6 (F-7, Figma-Lauf 09909f5): the line was hardly visible in the overview and the
  // vertical one not recognisable — a 1 px line alone in a cell as wide as the horizontal one.
  // The role is right (border.subtle on the Vitrino's ground, as on the web); an example frame
  // shows each orientation where a line is seen: between two texts.
  it("draws the apartigilo once more per orientation between two texts, beside the set (N-6)", async () => {
    const { double } = await drawn();
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const at = names.indexOf("apartigilo");
    expect(names.slice(at, at + 3)).toEqual(["apartigilo", ...SEPARATOR_EXAMPLE_NAMES]);
    const [across, upright] = SEPARATOR_EXAMPLE_NAMES.map((name) =>
      frame?.children.find((child) => child.name === name),
    );
    // A column for the horizontal line, a row for the vertical one: text, line, text.
    expect(across?.properties.layoutMode).toBe("VERTICAL");
    expect(upright?.properties.layoutMode).toBe("HORIZONTAL");
    for (const example of [across, upright]) {
      expect(example?.children.map((child) => child.name)).toEqual(["before", "line", "after"]);
      expect(descendant(example, "before")?.properties.characters).toBe("Eins");
      expect(descendant(example, "after")?.properties.characters).toBe("Zwei");
      for (const text of ["before", "after"]) {
        expect(paintOf(descendant(example, text), "fills")).toBe("color/text/default");
        expect(bound(descendant(example, text), "fontSize")).toBe("typography/body/1/font-size");
      }
      // The frame stands on the Vitrino's ground, as the set does.
      expect(paintOf(example, "fills")).toBe("color/background/canvas");
    }
    // The line is the set's: the same colour and weight, on the edge of its orientation.
    const acrossLine = descendant(descendant(across, "line"), "control");
    expect(paintOf(acrossLine, "strokes")).toBe("color/border/subtle");
    expect(bound(acrossLine, "strokeTopWeight")).toBe("border/width/default");
    const uprightLine = descendant(descendant(upright, "line"), "control");
    expect(paintOf(uprightLine, "strokes")).toBe("color/border/subtle");
    expect(bound(uprightLine, "strokeLeftWeight")).toBe("border/width/default");
    expect(bound(uprightLine, "height")).toBe("size/control/medium");
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 014 ④ (plan ④ D-06): the plugin draws the overlays and binds every shadow (G4): the double
// models setBoundVariableForEffect since ④, so the dialogo's shadow and the overlay shadows report
// bound — the Vojmapo's finding „Schattenvariablen ungebunden" closes. A tooltip is a surface with
// its text beside a stand-in of its trigger on the side of its placement; a popover a trigger
// stand-in over the surface with heading and content; a menu a trigger stand-in over the surface
// with three rows (the third in the danger colour).
describe("the plugin draws the overlays and binds the shadows (Spec 014 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Report = {
    warnings: string[];
    components: {
      set: string;
      shadow?: { part: string; variable: string; layers: number; status: string; evidence: string };
    }[];
  };
  const drawn = async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const setOf = (name: string) => pageNodes(double).find((child) => child.name === name);
    return { double, report, setOf };
  };

  it("binds the shadow of the dialogo, the konsileto, the sxvebilo and the menuo to DROP_SHADOW effects (status bound)", async () => {
    const { report, setOf } = await drawn();
    for (const name of ["dialogo", "konsileto", "sxvebilo", "menuo"]) {
      const component = report.components.find((candidate) => candidate.set === name);
      expect(component?.shadow, name).toMatchObject({ part: "surface", status: "bound" });
      expect(component?.shadow?.evidence, name).toContain("follows the mode");
    }
    const konsileto = setOf("konsileto");
    const surface = descendant(konsileto?.children[0], "control");
    const effects = (surface?.properties.effects ?? []) as {
      type: string;
      boundVariables?: Record<string, { name: string }>;
    }[];
    expect(effects[0]?.type).toBe("DROP_SHADOW");
    expect(effects[0]?.boundVariables?.color?.name).toMatch(/^elevation\/shadow\/overlay/);
    expect(effects[0]?.boundVariables?.radius?.name).toMatch(/blur$/);
  });

  it("the konsileto: four variants by placement, the surface on the side of the placement beside a stand-in of the trigger", async () => {
    const { setOf } = await drawn();
    const set = setOf("konsileto");
    expect(set?.children.map((child) => child.name)).toEqual([
      "placement=block-start, state=rest",
      "placement=block-end, state=rest",
      "placement=inline-start, state=rest",
      "placement=inline-end, state=rest",
    ]);
    const above = set?.children[0];
    expect(above?.children.map((child) => child.name)).toEqual(["control", "anchor"]);
    expect(above?.properties.layoutMode).toBe("VERTICAL");
    const below = set?.children[1];
    expect(below?.children.map((child) => child.name)).toEqual(["anchor", "control"]);
    const before = set?.children[2];
    expect(before?.properties.layoutMode).toBe("HORIZONTAL");
    const control = descendant(above, "control");
    expect(paintOf(control, "fills")).toBe("color/background/inverse");
    expect(bound(control, "cornerRadius")).toBe("radius/role/control");
    const text = descendant(above, "text");
    expect(paintOf(text, "fills")).toBe("color/text/inverse");
    expect(bound(text, "fontSize")).toBe("typography/caption/font-size");
    expect(text?.properties.characters).toBe("Kurzhinweis");
  });

  it("the sxvebilo: a trigger stand-in over the surface with heading and content, the width bound", async () => {
    const { setOf } = await drawn();
    const variant = setOf("sxvebilo")?.children[0];
    expect(variant?.children.map((child) => child.name)).toEqual(["trigger", "surface"]);
    const surface = descendant(variant, "surface");
    expect(surface?.children.map((child) => child.name)).toEqual(["heading", "content"]);
    expect(bound(surface, "width")).toBe("size/container/small");
    expect(paintOf(surface, "strokes")).toBe("color/border/subtle");
    expect(descendant(variant, "heading")?.properties.characters).toBe("Überschrift");
    expect(descendant(variant, "trigger-label")?.properties.characters).toBe("Auslöser");
    expect(descendant(variant, "content-text")?.properties.characters).toBe("Inhalt");
  });

  it("the menuo: four variants by state, each a trigger stand-in over the surface with three rows, the third in the danger colour", async () => {
    const { setOf } = await drawn();
    const set = setOf("menuo");
    expect(set?.children.map((child) => child.name)).toEqual([
      "state=rest",
      "state=hover",
      "state=focus",
      "state=disabled",
    ]);
    const rest = set?.children[0];
    const surface = descendant(rest, "surface");
    // The rows are entries like a tab list's: ring → gap → item, one per word of the plan.
    expect(surface?.children.map((child) => child.name)).toEqual(["entry-1", "entry-2", "entry-3"]);
    expect(paintOf(descendant(rest, "item-1"), "fills")).toBe("color/action/tertiary/rest");
    expect(paintOf(descendant(rest, "items-1"), "fills")).toBe("color/text/default");
    expect(paintOf(descendant(rest, "items-3"), "fills")).toBe("color/status/danger/text");
    expect(descendant(rest, "items-1")?.properties.characters).toBe("Bearbeiten");
    expect(descendant(rest, "items-3")?.properties.characters).toBe("Löschen");
    expect(descendant(rest, "trigger-label")?.properties.characters).toBe("Weitere Aktionen");
    expect(bound(descendant(rest, "item-1"), "minHeight")).toBe("size/target/min");
  });
});

// Spec 015 ③ (plan ③ D-05): the plugin draws the karto — every variant the surface (fill, radius,
// the border, the shadow as an effect, clipping) with the media and the body; the media a
// stand-in image across the top where vertical, at the start beside the body where horizontal,
// shown by the BOOLEAN property media; the body the heading (the label property), the content,
// the meta row with the badge in the insigno's look and the actions row with the two actions in
// the butono's looks; the example „ohne Bild" after the set, its media hidden.
describe("the plugin draws the karto (Spec 015 ③)", () => {
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined, field = "fills") =>
    (
      node?.properties[field] as { boundVariables?: { color?: { name: string } } }[] | undefined
    )?.[0]?.boundVariables?.color?.name;
  const box = (node: DoubleNode | undefined) =>
    node as unknown as { x: number; y: number; width: number; height: number };
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;

  it("both orientations: surface, media and body with their bindings, the stand-ins' looks, the media toggle, the example „ohne Bild“ after the set", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "karto");
    expect(set?.children.map((child) => child.name)).toEqual([
      "orientation=vertical, state=rest",
      "orientation=horizontal, state=rest",
    ]);
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const media = Object.keys(definitions).find((key) => key.startsWith("media#"));
    expect(definitions[media ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
    for (const variant of set?.children ?? []) {
      const horizontal = variant.name.includes("horizontal");
      const surface = descendant(variant, "surface");
      expect(surface?.properties.layoutMode, variant.name).toBe(
        horizontal ? "HORIZONTAL" : "VERTICAL",
      );
      expect(surface?.children.map((child) => child.name)).toEqual(["media", "body"]);
      expect(paintOf(surface)).toBe("color/background/raised");
      expect(paintOf(surface, "strokes")).toBe("color/border/subtle");
      expect(bound(surface, "strokeWeight")).toBe("border/width/default");
      expect(bound(surface, "cornerRadius")).toBe("radius/role/surface");
      expect(surface?.properties.clipsContent).toBe(true);
      const effects = (surface?.properties.effects ?? []) as { type: string }[];
      expect(effects[0]?.type).toBe("DROP_SHADOW");
      expect(box(surface).width).toBe(640);
      const body = descendant(variant, "body");
      expect(body?.children.map((child) => child.name)).toEqual([
        "heading",
        "content",
        "meta",
        "actions",
      ]);
      expect(bound(body, "paddingTop")).toBe("spacing/medium");
      expect(bound(body, "paddingLeft")).toBe("spacing/medium");
      expect(bound(body, "itemSpacing")).toBe("spacing/small");
      const heading = descendant(body, "heading");
      expect(heading?.properties.characters).toBe("Überschrift");
      expect(heading?.properties.componentPropertyReferences).toEqual({
        characters: expect.stringMatching(/^label#/),
      });
      expect(paintOf(heading)).toBe("color/text/default");
      expect(bound(heading, "fontSize")).toBe("typography/headline/4/font-size");
      const content = descendant(body, "content");
      expect(content?.properties.characters).toBe("Kontrast, Fokus und Namen in jeder Marke.");
      expect(paintOf(content)).toBe("color/text/default");
      expect(bound(content, "fontSize")).toBe("typography/body/1/font-size");
      expect(bound(descendant(body, "meta"), "itemSpacing")).toBe("spacing/small");
      const badge = descendant(body, "badge");
      expect(paintOf(badge)).toBe("color/background/sunken");
      expect(bound(badge, "cornerRadius")).toBe("radius/role/pill");
      expect(descendant(badge, "badge-label")?.properties.characters).toBe("gültig");
      expect(paintOf(descendant(badge, "badge-label"))).toBe("color/text/subtle");
      const actions = descendant(body, "actions");
      expect(bound(actions, "itemSpacing")).toBe("spacing/small");
      expect(actions?.children.map((child) => child.name)).toEqual(["action-1", "action-2"]);
      expect(paintOf(actions?.children[0])).toBe("color/action/primary/rest");
      expect(descendant(actions?.children[0], "action-label")?.properties.characters).toBe(
        "Öffnen",
      );
      expect(paintOf(descendant(actions?.children[1], "action-label"))).toBe(
        "color/action/tertiary/text",
      );
      const image = descendant(variant, "media");
      expect(paintOf(image)).toBe("color/background/sunken");
      expect(descendant(image, "media-text")?.properties.characters).toBe("Bild");
      expect(paintOf(descendant(image, "media-text"))).toBe("color/text/subtle");
      expect(image?.properties.visible).toBe(true);
      expect(image?.properties.componentPropertyReferences).toEqual({ visible: media });
      // Vertical: the media across the top, edge to edge; horizontal: a third at the start, as
      // high as the body beside it.
      if (horizontal) {
        expect(box(image).width).toBe(213);
        expect(box(image).x).toBeLessThan(box(body).x);
        expect(box(image).height).toBe(box(body).height);
      } else {
        expect(box(image).height).toBe(213);
        expect(box(image).y).toBeLessThan(box(body).y);
        expect(box(image).width).toBe(box(body).width);
      }
    }
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const at = names.indexOf("karto");
    expect(names.slice(at, at + 2)).toEqual(["karto", "karto – ohne Bild"]);
    const example = frame?.children.find((child) => child.name === "karto – ohne Bild");
    expect(descendant(example, "surface")?.properties.layoutMode).toBe("VERTICAL");
    expect(descendant(example, "media")?.properties.visible).toBe(false);
    expect(descendant(example, "heading")?.properties.characters).toBe("Überschrift");
  });
});

// Spec 015 ③ K-1 (Abnahme 2026-10-19, file f10b-5): in every variant of the karto set with its
// image the heading stood one glyph per line, in komuna and ekzemplo; the example „ohne Bild" was
// right. The heading of a set variant took FILL while it was still empty — its word came later,
// through the label property — and stayed at the width of its empty box. Expected: the heading
// fills the body (FILL, textAutoResize HEIGHT) and stands at the start like the content below it;
// no text of a card is narrower than a glyph.
describe("the karto's heading fills the body in every variant (K-1)", () => {
  const box = (node: DoubleNode | undefined) =>
    node as unknown as { width: number; height: number };
  const cardsOf = (double: ReturnType<typeof figmaDouble>) => {
    const nodes = pageNodes(double);
    const set = nodes.find((node) => node.name === "karto");
    const frame = nodes.find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const example = frame?.children.find((child) => child.name === "karto – ohne Bild");
    return [...(set?.children ?? []), ...(example === undefined ? [] : [example])];
  };
  const textsOf = (node: DoubleNode): DoubleNode[] =>
    node.children.flatMap((child) => (child.type === "TEXT" ? [child] : textsOf(child)));

  it("set and example: the heading fills the body like the content, wraps at its width and stands at the start; no text is narrower than a glyph", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const cards = cardsOf(double);
    expect(cards.map((card) => card.name)).toEqual([
      "orientation=vertical, state=rest",
      "orientation=horizontal, state=rest",
      "karto – ohne Bild",
    ]);
    const narrow: string[] = [];
    for (const card of cards) {
      const heading = descendant(card, "heading");
      const content = descendant(card, "content");
      expect(heading?.properties.characters, card.name).toBe("Überschrift");
      // Both fill the same body: as wide as each other, and more than one word wide.
      expect(box(heading).width, card.name).toBe(box(content).width);
      expect(box(heading).width, card.name).toBeGreaterThan(200);
      for (const text of [heading, content]) {
        expect(text?.properties.layoutSizingHorizontal, `${card.name} ${text?.name}`).toBe("FILL");
        expect(text?.properties.textAutoResize, `${card.name} ${text?.name}`).toBe("HEIGHT");
        expect(text?.properties.textAlignHorizontal, `${card.name} ${text?.name}`).toBe("LEFT");
      }
      for (const text of textsOf(card)) {
        const characters = String(text.properties.characters ?? "");
        // The smallest text of a card is a label of 12 px or more: a glyph is 0.6 × 12 wide here.
        if (characters !== "" && box(text).width < 0.6 * 12) {
          narrow.push(`${card.name} › ${text.name} „${characters}" ${box(text).width}`);
        }
      }
    }
    expect(narrow).toEqual([]);
  });

  it("a heading a run left at width 0 (reporting FILL) fills the body again on the next run, and a third run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    // The state the maintainer's file holds after the runs of 2026-10-19: every heading of the
    // set took FILL while empty and got its word afterwards — it reports FILL and stands at
    // width 0, one glyph a line (the double's K-1 belief), so a run that compares changes nothing.
    const set = pageNodes(double).find((node) => node.name === "karto");
    for (const variant of set?.children ?? []) {
      const heading = descendant(variant, "heading");
      if (heading === undefined) continue;
      const word = heading.properties.characters;
      heading.properties.characters = "";
      (heading as unknown as { layoutSizingHorizontal: string }).layoutSizingHorizontal = "FILL";
      heading.properties.characters = word;
      expect(box(heading).width, variant.name).toBe(0);
    }
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    for (const card of cardsOf(double)) {
      const heading = descendant(card, "heading");
      expect(heading?.properties.layoutSizingHorizontal, card.name).toBe("FILL");
      expect(box(heading).width, card.name).toBe(box(descendant(card, "content")).width);
    }
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 015 ③ (plan ③ D-11): the plugin draws the avataro — every variant the box (a square of
// box.size) with the initials (a circle: fill, radius, the label property „EM" in its colour and
// role) and the image over it (a circle: radius, clipping, the silhouette on the stand-in ground),
// shown by the BOOLEAN property image, hidden by default; the example „mit Bild" after the set.
// Nachlese 5 O-41 (Nachlese 4 B-8): the ligilo's property external stood in the set but hung on no
// layer – Figma drew no mark. Now every variant draws the frame icon-end after the label with the
// glyphs external of every Aspekto (size and colour of the part icon, bound), its visibility
// connected to the BOOLEAN property external, hidden by default (the way of dismissible).
describe("the plugin draws the ligilo's external mark (Nachlese 5 O-41)", () => {
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined) =>
    (node?.properties.fills as { boundVariables?: { color?: { name: string } } }[] | undefined)?.[0]
      ?.boundVariables?.color?.name;
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;

  it("every variant: label, then icon-end with the glyphs external, hidden, shown by external; a second run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "ligilo");
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const external = Object.keys(definitions).find((key) => key.startsWith("external#"));
    expect(definitions[external ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: false });
    expect(set?.children.length).toBe(30);
    for (const variant of set?.children ?? []) {
      const control = descendant(variant, "control");
      expect(
        control?.children.map((child) => child.name),
        variant.name,
      ).toEqual(["label", "icon-end"]);
      const icon = descendant(control, "icon-end");
      expect(icon?.properties.visible, variant.name).toBe(false);
      expect(icon?.properties.componentPropertyReferences).toEqual({ visible: external });
      const size = variant.name.match(/size=(\w+)/)?.[1];
      expect(bound(icon, "width"), variant.name).toBe(`size/icon/${size}`);
      const glyphs = icon?.children ?? [];
      expect(glyphs.map((glyph) => glyph.name)).toEqual(["glyph-komuna"]);
      for (const glyph of glyphs) {
        expect(bound(glyph, "width"), variant.name).toBe(`size/icon/${size}`);
        expect(paintOf(descendant(glyph, "mark")), variant.name).toBe(
          paintOf(descendant(control, "label")),
        );
      }
    }
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

describe("the plugin draws the avataro (Spec 015 ③)", () => {
  const bound = (node: DoubleNode | undefined, field: string) => node?.boundVariables[field]?.name;
  const paintOf = (node: DoubleNode | undefined) =>
    (node?.properties.fills as { boundVariables?: { color?: { name: string } } }[] | undefined)?.[0]
      ?.boundVariables?.color?.name;
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;

  it("three sizes: the box, the initials circle with „EM“, the image circle with the silhouette; the image toggle; the example „mit Bild“ after the set", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "avataro");
    expect(set?.children.map((child) => child.name)).toEqual([
      "size=small, state=rest",
      "size=medium, state=rest",
      "size=large, state=rest",
    ]);
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const image = Object.keys(definitions).find((key) => key.startsWith("image#"));
    expect(definitions[image ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: false });
    const sizes: Record<string, string> = {
      small: "size/icon/medium",
      medium: "size/icon/large",
      large: "size/control/large",
    };
    for (const variant of set?.children ?? []) {
      const size = sizes[variant.name.slice("size=".length, variant.name.indexOf(","))];
      const box = descendant(variant, "control");
      expect(box?.children.map((child) => child.name)).toEqual(["initials", "image"]);
      for (const node of [box, descendant(box, "initials"), descendant(box, "image")]) {
        expect(bound(node, "width"), variant.name).toBe(size);
        expect(bound(node, "height"), variant.name).toBe(size);
      }
      const initials = descendant(box, "initials");
      expect(paintOf(initials)).toBe("color/background/sunken");
      expect(bound(initials, "cornerRadius")).toBe("radius/full");
      const text = descendant(initials, "initials-text");
      // Nachlese 5 N5-5 (O-18): the smallest size shows one initial – „EM“ stood over the circle
      // of 20 px; the label property holds both, so the smallest size's text is not connected.
      if (variant.name.startsWith("size=small")) {
        expect(text?.properties.characters, variant.name).toBe("E");
        expect(text?.properties.componentPropertyReferences ?? {}, variant.name).toEqual({});
      } else {
        expect(text?.properties.characters, variant.name).toBe("EM");
        expect(text?.properties.componentPropertyReferences).toEqual({
          characters: expect.stringMatching(/^label#/),
        });
      }
      expect(paintOf(text)).toBe("color/text/subtle");
      expect(bound(text, "fontSize")).toBe(
        variant.name.startsWith("size=large")
          ? "typography/label/1/font-size"
          : "typography/label/2/font-size",
      );
      const picture = descendant(box, "image");
      expect(bound(picture, "cornerRadius")).toBe("radius/full");
      expect(picture?.properties.clipsContent).toBe(true);
      expect(paintOf(picture)).toBe("color/background/sunken");
      expect(picture?.properties.visible).toBe(false);
      expect(picture?.properties.componentPropertyReferences).toEqual({ visible: image });
      expect(paintOf(descendant(descendant(picture, "picture"), "mark"))).toBe("color/text/subtle");
    }
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const at = names.indexOf("avataro");
    expect(names.slice(at, at + 2)).toEqual(["avataro", "avataro – mit Bild"]);
    const example = frame?.children.find((child) => child.name === "avataro – mit Bild");
    expect(bound(descendant(example, "control"), "width")).toBe("size/icon/large");
    expect(descendant(example, "image")?.properties.visible).toBe(true);
    expect(descendant(example, "initials-text")?.properties.characters).toBe("EM");
  });

  it("N5-5: a smallest size connected to the label by an earlier run is disconnected and shows one initial; a third run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "avataro");
    const small = descendant(
      set?.children.find((child) => child.name.startsWith("size=small")),
      "initials-text",
    );
    const medium = descendant(
      set?.children.find((child) => child.name.startsWith("size=medium")),
      "initials-text",
    );
    if (small === undefined || medium === undefined) throw new Error("no initials");
    // As a run before Nachlese 5 left it: connected to the label, with both initials.
    small.properties.componentPropertyReferences = {
      ...(medium.properties.componentPropertyReferences as Record<string, string>),
    };
    small.properties.characters = "EM";
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(small.properties.characters).toBe("E");
    expect(small.properties.componentPropertyReferences ?? {}).toEqual({});
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Nachlese 7 ② (B-2, B-4): where an addition is a visible part, Figma draws it. label-hidden of
// the mezurilo hides its label like caption-hidden the caption of the tabelo — a BOOLEAN property
// connected to the label's visibility, named label-visible (label is the set's TEXT property); the disabled menuo shows its
// trigger stand-in locked in the variant disabled — the look of a disabled entry (the trigger
// on the web is a butono of emphasis low: the same tertiary fill and the disabled text).
describe("the plugin draws the additions of Nachlese 7 ② (B-2, B-4)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes" = "fills") =>
    ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
      ?.boundVariables?.color?.name;
  type Definitions = Record<string, { type: string; defaultValue: string | boolean }>;
  const drawn = async () => {
    const double = modelDouble();
    await new Function("figma", `${source}\nreturn applyPlan();`)(double.figma);
    const setOf = (name: string) => pageNodes(double).find((child) => child.name === name);
    return { double, setOf };
  };

  it("B-2: the mezurilo declares label-hidden as the BOOLEAN property label-visible (shown), connected to the label of every variant", async () => {
    const { double, setOf } = await drawn();
    const set = setOf("mezurilo");
    const definitions = () => (set?.properties.componentPropertyDefinitions ?? {}) as Definitions;
    const key = () =>
      Object.keys(definitions()).find(
        (candidate) =>
          candidate.startsWith("label-visible#") && definitions()[candidate]?.type === "BOOLEAN",
      );
    expect(key()).toBeDefined();
    expect(definitions()[key() ?? ""]).toEqual({ type: "BOOLEAN", defaultValue: true });
    for (const node of set?.children ?? []) {
      const label = descendant(node, "label");
      expect(label?.properties.visible, node.name).toBe(true);
      expect(label?.properties.componentPropertyReferences, node.name).toMatchObject({
        visible: key(),
      });
    }
    const before = Object.keys(definitions()).length;
    await run(double, source);
    expect(Object.keys(definitions())).toHaveLength(before);
  });

  it("B-4: the disabled variant of the menuo shows its trigger stand-in locked, like a disabled entry", async () => {
    const { setOf } = await drawn();
    const set = setOf("menuo");
    const disabled = set?.children.find((child) => child.name === "state=disabled");
    const rest = set?.children.find((child) => child.name === "state=rest");
    expect(paintOf(descendant(disabled, "trigger"))).toBe("color/action/tertiary/disabled");
    expect(paintOf(descendant(disabled, "trigger-label"))).toBe(
      paintOf(descendant(disabled, "items-1")),
    );
    // In every other state the stand-in stays the neutral sketch of a trigger it was.
    expect(paintOf(descendant(rest, "trigger"))).toBeUndefined();
  });
});
