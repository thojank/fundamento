// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-bauformen-eingabe.test.ts (Nachlese 5 ①, O-5): the structures of input: toggle, choice, select, text area, dialog, upload, suggest.

import { describe, expect, it } from "vitest";
import { traRolojFigmaName } from "../../test-doubles/tra-roloj.js";
import { BACKDROP_EXAMPLE } from "./figma.js";
import {
  descendant,
  modelDouble,
  once,
  pageNodes,
  prepared,
  repoFiles,
  repoPlan,
  run,
} from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

// A bound variable's name read as the role its Ero-Token aliases (Constitution v2.3).
const role = (name: string | undefined) => traRolojFigmaName(name, prepared.input.modelo);

// Spec 010 ① (plan D-10): the switch is drawn as a toggle — a field in a row: the focus ring
// around the track (control) with the knob (indicator) in it, the label beside. The knob stands
// at the start or the end of the track as the variant says; the gap between track and label is
// the field's. Measured in f10b-5 (the double knows the slice of the API the plugin uses).
describe("the sxaltilo is drawn as a toggle: track, knob, label beside (Spec 010 ①)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const drawn = once(async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "sxaltilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { set, variant };
  });

  it("draws every variant of checked × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(24);
    expect(set?.children[0]?.name).toBe("checked=true, size=small, state=rest");
  });

  it("puts the label beside the ring, the knob in the track", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const field = on?.children.find((child) => child.name === "field");
    expect(field?.children.map((child) => child.name)).toEqual(["focus-ring", "label"]);
    expect(field?.properties.layoutMode).toBe("HORIZONTAL");
    const control = descendant(on, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["indicator"]);
    expect(descendant(on, "label")?.properties.characters).toBe("Einstellung");
    expect(bound(field, "itemSpacing")).toBe("spacing/small");
  });

  it("stands the knob at the end when checked and at the start when not (D-04)", async () => {
    const { variant } = await drawn();
    const on = descendant(variant("checked=true, size=medium, state=rest"), "control");
    const off = descendant(variant("checked=false, size=medium, state=rest"), "control");
    expect(on?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(off?.properties.primaryAxisAlignItems).toBe("MIN");
    // The border of the track takes its room, as on the web (box-sizing border-box).
    expect(on?.properties.strokesIncludedInLayout).toBe(true);
  });

  it("binds the knob's fill, size and radius, and the track's width", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const knob = descendant(on, "indicator");
    expect(bound(knob, "width")).toBe("size/icon/medium");
    expect(bound(knob, "height")).toBe("size/icon/medium");
    expect(bound(knob, "cornerRadius")).toBe("radius/role/pill");
    const fill = (
      (knob?.properties.fills ?? []) as { boundVariables?: { color?: { id: string } } }[]
    )[0];
    expect(fill?.boundVariables?.color).toBeDefined();
    expect(bound(descendant(on, "control"), "minWidth")).toBe("size/control/medium");
  });
});

// Spec 010 ② (plan ② D-09, D-10): the checkbox is drawn in the toggle structure — a field in a
// row: the focus ring around the box (control) with the check mark (indicator) in it, then a
// column with the label and the error under it. The check mark is the web's vector, imported
// with createNodeFromSvg: its frame takes the bound size, the vector its bound colour and scales
// with the frame; where the variant hides it (indicator.color none), the frame has opacity 0.
// Test-double assumptions until measured in f10b-5: createNodeFromSvg gives a FRAME of the SVG's
// width and height holding one VECTOR; a vector with constraints SCALE follows its frame's size.
describe("the markobutono is drawn as a toggle: box, check mark, label and error beside (Spec 010 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const drawn = once(async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "markobutono");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  });
  // The Aspektoj of the repository's Modelo, whose glyphs the plan carries (Nachlese 4 N-7).
  const aspektoj = Object.keys(repoPlan.ikonoj?.glyphs ?? {});
  const glyphFrames = aspektoj.map((aspekto) => `glyph-${aspekto}`);

  it("draws every variant of checked × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(30);
    expect(set?.children[0]?.name).toBe("checked=true, size=small, state=rest");
  });

  it("puts label and error in a column beside the ring, the check mark in the box", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const field = on?.children.find((child) => child.name === "field");
    expect(field?.children.map((child) => child.name)).toEqual(["focus-ring", "texts"]);
    expect(field?.properties.layoutMode).toBe("HORIZONTAL");
    expect(field?.properties.counterAxisAlignItems).toBe("MIN");
    const texts = field?.children.find((child) => child.name === "texts");
    expect(texts?.properties.layoutMode).toBe("VERTICAL");
    expect(texts?.children.map((child) => child.name)).toEqual(["label", "error"]);
    expect(descendant(on, "label")?.properties.characters).toBe("Option");
    expect(descendant(on, "error")?.properties.characters).toBe("Fehler");
    const control = descendant(on, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["indicator"]);
    // Nachlese 4 N-7: the check mark is the Ikonaro's check — a glyph frame per Aspekto of the
    // Modelo, its visibility bound to the Aspekto's switch; no hand-drawn sign.
    expect(descendant(on, "indicator")?.children.map((child) => child.name)).toEqual(glyphFrames);
    expect(descendant(on, "mark")?.parent?.name).toBe("glyph-komuna");
    expect(bound(field, "itemSpacing")).toBe("spacing/small");
  });

  it("binds the size of the check mark's frame and glyphs, the colour of its vectors, and the box's radius", async () => {
    const { variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const indicator = descendant(on, "indicator");
    expect(bound(indicator, "width")).toBe("size/icon/medium");
    expect(bound(indicator, "height")).toBe("size/icon/medium");
    for (const aspekto of aspektoj) {
      const glyph = descendant(indicator, `glyph-${aspekto}`);
      expect(bound(glyph, "width"), aspekto).toBe("size/icon/medium");
      expect(bound(glyph, "visible"), aspekto).toBe(`ikonoj/${aspekto}`);
      const mark = glyph?.children.find((child) => child.type === "VECTOR");
      const fill = (
        (mark?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[]
      )[0];
      expect(role(fill?.boundVariables?.color?.name), aspekto).toBe("color/action/primary/text");
    }
    expect(bound(descendant(on, "control"), "cornerRadius")).toBe("radius/role/control");
    expect(indicator?.properties.opacity).toBe(1);
  });

  it("hides the check mark where the box is not ticked, and binds no colour to it", async () => {
    const { variant } = await drawn();
    const off = variant("checked=false, size=medium, state=rest");
    expect(descendant(off, "indicator")?.properties.opacity).toBe(0);
    const vector = descendant(descendant(off, "indicator"), "glyph-komuna")?.children.find(
      (child) => child.type === "VECTOR",
    );
    const fills = (vector?.properties.fills ?? []) as { boundVariables?: unknown }[];
    expect(fills.some((fill) => fill.boundVariables !== undefined)).toBe(false);
  });

  // Nachlese 4 N-7: a file drawn before holds the hand-drawn check vector directly in the
  // indicator; the run takes it out, so only the Ikonaro's glyphs are left.
  it("takes the hand-drawn check vector of an earlier run out of the indicator (N-7)", async () => {
    const { double, variant } = await drawn();
    const on = variant("checked=true, size=medium, state=rest");
    const indicator = descendant(on, "indicator") as DoubleNode;
    const api = double.figma as { createNodeFromSvg: (svg: string) => DoubleNode };
    const old = api.createNodeFromSvg(
      '<svg viewBox="0 0 16 16"><path d="M6.4 12.6 2.2 8.4l1.4-1.4 2.8 2.8 6-6 1.4 1.4z"/></svg>',
    ).children[0] as DoubleNode;
    indicator.appendChild(old);
    old.setSharedPluginData("fundamento", "part", "mark");
    expect(indicator.children.some((child) => child.type === "VECTOR")).toBe(true);
    await run(double, source);
    expect(indicator.children.map((child) => child.name)).toEqual(glyphFrames);
  });

  it("keeps the switch's knob a filled frame without a sign or a column (Spec 010 ①)", async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "sxaltilo");
    const on = set?.children.find(
      (child) => child.name === "checked=true, size=medium, state=rest",
    );
    expect(on?.children[0]?.children.map((child) => child.name)).toEqual(["focus-ring", "label"]);
    expect(descendant(on, "indicator")?.children).toEqual([]);
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 010 ③ (plan ③ D-07): the radio group is drawn in a structure of its own, choice — a field in a
// column: the label (the question), a column of options, help and error. Each option is a row:
// the focus ring around the circle (control) with the dot (indicator, the web's vector) in it, the
// option's label beside it. The bindings that follow selected come from the entry of the plan for
// that option (the first chosen, E7): the chosen circle filled, its dot drawn; the others filled
// with the ground and their dot at opacity 0. The focus ring shows on the first option only.
// Test-double assumptions until measured in f10b-5: as for the check mark (② D-09), and a
// componentPropertyReference on one text of each variant only (the label).
describe("the elekto is drawn as a choice: question, options with circle and dot, help and error (Spec 010 ③)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const fillOf = (node: DoubleNode | undefined) =>
    role(
      ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
        ?.boundVariables?.color?.name,
    );
  const strokeOf = (node: DoubleNode | undefined) =>
    role(
      ((node?.properties.strokes ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
        ?.boundVariables?.color?.name,
    );
  const drawn = once(async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "elekto");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  });

  it("draws every variant of size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(15);
    expect(set?.children[0]?.name).toBe("size=small, state=rest");
  });

  it("stacks the question, the options, help and error; each option a row of ring and label", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const field = rest?.children.find((child) => child.name === "field");
    expect(field?.properties.layoutMode).toBe("VERTICAL");
    expect(field?.children.map((child) => child.name)).toEqual([
      "label",
      "options",
      "help",
      "error",
    ]);
    const options = field?.children.find((child) => child.name === "options");
    expect(options?.properties.layoutMode).toBe("VERTICAL");
    expect(options?.children.map((child) => child.name)).toEqual([
      "option-1",
      "option-2",
      "option-3",
    ]);
    const first = options?.children[0];
    expect(first?.properties.layoutMode).toBe("HORIZONTAL");
    expect(first?.children.map((child) => child.name)).toEqual(["focus-ring", "option-label"]);
    expect(descendant(first, "control")?.children.map((child) => child.name)).toEqual([
      "indicator",
    ]);
    expect(descendant(first, "indicator")?.children.map((child) => child.name)).toEqual(["mark"]);
    expect(descendant(rest, "label")?.properties.characters).toBe("Frage");
    expect(
      options?.children.map((option) => descendant(option, "option-label")?.properties.characters),
    ).toEqual(["Eins", "Zwei", "Drei"]);
    expect(descendant(rest, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(rest, "error")?.properties.characters).toBe("Fehler");
    expect(bound(field, "itemSpacing")).toBe("spacing/medium");
    expect(bound(options, "itemSpacing")).toBe("spacing/medium");
    expect(bound(first, "itemSpacing")).toBe("spacing/small");
  });

  it("fills the chosen circle and draws its dot; the other circles take the ground, their dot hidden", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const options = descendant(rest, "options")?.children ?? [];
    const [chosen, other] = options;
    expect(fillOf(descendant(chosen, "control"))).toBe("color/action/primary/rest");
    expect(fillOf(descendant(other, "control"))).toBe("color/background/default");
    expect(strokeOf(descendant(other, "control"))).toBe("color/border/strong");
    expect(bound(descendant(chosen, "control"), "cornerRadius")).toBe("radius/role/pill");
    expect(descendant(chosen, "indicator")?.properties.opacity).toBe(1);
    expect(fillOf(descendant(chosen, "mark"))).toBe("color/action/primary/text");
    expect(bound(descendant(chosen, "indicator"), "width")).toBe("size/icon/medium");
    expect(descendant(other, "indicator")?.properties.opacity).toBe(0);
    expect(descendant(other, "mark")?.properties.fills).toEqual([]);
    expect(fillOf(descendant(other, "option-label"))).toBe("color/text/default");
    expect(bound(descendant(other, "option-label"), "fontSize")).toBe(
      "typography/body/1/font-size",
    );
  });

  it("shows the focus ring on the first option only, in the focus variant only", async () => {
    const { variant } = await drawn();
    const focus = descendant(variant("size=medium, state=focus"), "options")?.children ?? [];
    expect(strokeOf(descendant(focus[0], "focus-ring"))).toBeDefined();
    expect(strokeOf(descendant(focus[1], "focus-ring"))).toBeUndefined();
    const rest = descendant(variant("size=medium, state=rest"), "options")?.children ?? [];
    expect(strokeOf(descendant(rest[0], "focus-ring"))).toBeUndefined();
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 010 ④ (plan ④ D-07, E3): the select is drawn as the field of the kampo — label above, ring →
// gap → control, help and error below — and its control holds the prompt and the chevron: the
// text "Bitte wählen" (the placeholder's colour, bound) and after it the indicator, the web's
// chevron imported as one vector, its frame sized by indicator.size, its fill bound to
// indicator.color; the gap between them is box.gap (the control's itemSpacing). Only the closed
// field is drawn: the list is the platform's (E3). Test-double assumptions until measured in
// f10b-5: as for the check mark (② D-09) — createNodeFromSvg makes a FRAME of 16 × 16 with one
// VECTOR per path, a SCALE constraint follows the bound frame.
describe("the elektilo is drawn as the field of the kampo with the chevron in its control (Spec 010 ④)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const drawn = once(async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "elektilo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  });

  it("draws every variant of size × state, named by the plan, and no list", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(15);
    expect(set?.children[0]?.name).toBe("size=small, state=rest");
    expect(set?.children.some((child) => /open/.test(child.name))).toBe(false);
  });

  it("stacks label, ring with the control, help and error; the control holds the prompt, then the chevron", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const field = rest?.children.find((child) => child.name === "field");
    expect(field?.properties.layoutMode).toBe("VERTICAL");
    expect(field?.children.map((child) => child.name)).toEqual([
      "label",
      "focus-ring",
      "help",
      "error",
    ]);
    const control = descendant(rest, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text", "indicator"]);
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(descendant(rest, "label")?.properties.characters).toBe("Auswahl");
    expect(descendant(rest, "text")?.properties.characters).toBe("Bitte wählen");
    expect(descendant(rest, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(rest, "error")?.properties.characters).toBe("Fehler");
    expect(bound(control, "itemSpacing")).toBe("spacing/small");
  });

  it("binds the chevron's frame to size.icon.*, its vector's fill to color.text.muted, the prompt to the placeholder colour", async () => {
    const { variant } = await drawn();
    const rest = variant("size=medium, state=rest");
    const indicator = descendant(rest, "indicator");
    expect(bound(indicator, "width")).toBe("size/icon/medium");
    expect(bound(indicator, "height")).toBe("size/icon/medium");
    expect(indicator?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(indicator?.properties.opacity).toBe(1);
    // Spec 014 ②: the chevron is a glyph frame per Aspekto of the plan (the repo plan: komuna).
    expect(descendant(rest, "indicator")?.children.map((child) => child.name)).toEqual([
      "glyph-komuna",
    ]);
    const mark = descendant(rest, "mark");
    expect(mark?.type).toBe("VECTOR");
    expect(mark?.properties.constraints).toEqual({ horizontal: "SCALE", vertical: "SCALE" });
    const paint = (node: DoubleNode | undefined) =>
      role(
        ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
          ?.boundVariables?.color?.name,
      );
    expect(paint(mark)).toBe("color/text/muted");
    expect(paint(descendant(rest, "text"))).toBe("color/text/subtle");
    expect(bound(descendant(variant("size=large, state=invalid"), "indicator"), "width")).toBe(
      "size/icon/large",
    );
    const strokes = (
      (descendant(variant("size=large, state=invalid"), "control")?.properties.strokes ?? []) as {
        boundVariables?: { color?: { name: string } };
      }[]
    )[0];
    expect(role(strokes?.boundVariables?.color?.name)).toBe("color/status/danger/border");
  });

  it("keeps the text field without a chevron (Spec 009)", async () => {
    const { double } = await drawn();
    const kampo = pageNodes(double).find((child) => child.name === "kampo");
    const control = descendant(kampo?.children[0], "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ② (spec „tekstareo", G7): the text area is drawn as the field of the kampo (Spec 009,
// D-09) with the axes kind × size × state. The text in the control binds the code role for
// kind=code and the body role for kind=text; the control has no box.height and hugs its text,
// which shows the example and the empty lines of the default rows (four), so the area is as high
// as four lines of its typography — `rows` is a number, nothing to bind.
describe("the tekstareo is drawn as the field of the kampo: kind × size × state, the code role bound (Spec 011 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const drawn = once(async () => {
    const double = modelDouble();
    await run(double, source);
    const set = pageNodes(double).find((child) => child.name === "tekstareo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    return { double, set, variant };
  });

  it("draws every variant of kind × size × state, named by the plan", async () => {
    const { set } = await drawn();
    expect(set?.children).toHaveLength(30);
    expect(set?.children[0]?.name).toBe("kind=text, size=small, state=rest");
    expect(
      set?.children.some((child) => child.name === "kind=code, size=large, state=invalid"),
    ).toBe(true);
  });

  it("binds the code role to the text of a code variant and the body role to a text variant; the control hugs", async () => {
    const { variant } = await drawn();
    const code = variant("kind=code, size=medium, state=rest");
    const text = variant("kind=text, size=medium, state=rest");
    expect(bound(descendant(code, "text"), "fontSize")).toBe("typography/code/font-size");
    expect(bound(descendant(code, "text"), "fontFamily")).toBe("typography/code/font-family");
    expect(bound(descendant(text, "text"), "fontSize")).toBe("typography/body/1/font-size");
    const control = descendant(text, "control");
    expect(control?.children.map((child) => child.name)).toEqual(["text"]);
    expect(control?.boundVariables.minHeight).toBeUndefined();
    expect(control?.properties.layoutSizingVertical).toBe("HUG");
    expect(descendant(text, "text")?.properties.characters).toBe("Beispiel\n\n\n");
    expect(descendant(text, "label")?.properties.characters).toBe("Beschriftung");
    expect(descendant(text, "help")?.properties.characters).toBe("Hinweis");
    expect(descendant(text, "error")?.properties.characters).toBe("Fehler");
    expect(bound(descendant(text, "label"), "fontSize")).toBe("typography/label/1/font-size");
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 011 ② (spec „dialogo – Figma", G7): the dialog is a structure of its own — variant →
// surface (a column of fixed width, bound to size.container.*) → heading, message, content
// (the reason's label and a field frame standing in for the composed tekstareo, its height bound
// to size.control.large), actions (a row at the end, two frames with a word each standing in for
// the butono). Where the reason is none, the content is hidden (visible false): a hidden child of
// an auto-layout frame takes no space in Figma, so no gap remains. The shadow of the surface is
// bound as a drop shadow field by field (Spec 014 ④: the double models setBoundVariableForEffect,
// so the run reports the shadow as bound and the mode switches it). The example
// frame „mit Hintergrund" lies in the frame Eroj beside the set and shows the default variant on
// the backdrop (color.backdrop). Test-double assumptions until measured in f10b-5: a hidden child
// takes no space in auto-layout (the double measures no visibility); width and height bound on a
// FIXED frame take the variable's value (the double resolves bound numbers).
describe("the dialogo is drawn as a dialog: surface with heading, message, reason and two actions (Spec 011 ②)", () => {
  const source = repoFiles["figma/plugin/code.js"] ?? "";
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const paintOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    role(
      ((node?.properties[field] ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
        ?.boundVariables?.color?.name,
    );
  type Report = {
    warnings: string[];
    components: {
      set: string;
      shadow?: { part: string; variable: string; layers: number; status: string; evidence: string };
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
  const drawn = once(async () => {
    const double = modelDouble();
    const report = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    const set = pageNodes(double).find((child) => child.name === "dialogo");
    const variant = (name: string) => set?.children.find((child) => child.name === name);
    const dialogo = report.components.find((component) => component.set === "dialogo");
    return { double, set, variant, report, dialogo };
  });

  it("draws the six variants of size × reason, named by the plan, in one column", async () => {
    const { set, dialogo } = await drawn();
    expect(set?.children.map((child) => child.name)).toEqual([
      "size=small, reason=none, state=rest",
      "size=small, reason=optional, state=rest",
      "size=small, reason=required, state=rest",
      "size=medium, reason=none, state=rest",
      "size=medium, reason=optional, state=rest",
      "size=medium, reason=required, state=rest",
    ]);
    expect(dialogo?.layout.columns).toBe(1);
    expect(dialogo?.layout.rows).toBe(6);
  });

  it("stacks heading, message, content and actions in the surface, its width bound by size", async () => {
    const { variant } = await drawn();
    const small = variant("size=small, reason=none, state=rest");
    expect(small?.children.map((child) => child.name)).toEqual(["surface"]);
    const surface = descendant(small, "surface");
    expect(surface?.properties.layoutMode).toBe("VERTICAL");
    // Spec 027 B-1: the dialog takes the width of its container: the variant holds the width
    // bound by size, the surface fills it.
    expect(surface?.properties.layoutSizingHorizontal).toBe("FILL");
    expect(small?.properties.layoutSizingHorizontal).toBe("FIXED");
    expect(surface?.properties.layoutSizingVertical).toBe("HUG");
    expect(surface?.children.map((child) => child.name)).toEqual([
      "heading",
      "message",
      "content",
      "actions",
    ]);
    expect(bound(small, "width")).toBe("size/container/small");
    expect(bound(variant("size=medium, reason=none, state=rest"), "width")).toBe(
      "size/container/medium",
    );
    expect(paintOf(surface, "fills")).toBe("color/background/raised");
    expect(paintOf(surface, "strokes")).toBe("color/border/default");
    expect(bound(surface, "strokeWeight")).toBe("border/width/default");
    expect(bound(surface, "cornerRadius")).toBe("radius/role/surface");
    expect(bound(surface, "itemSpacing")).toBe("spacing/medium");
    for (const side of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
      expect(bound(surface, side), side).toBe("spacing/large");
    }
    const heading = descendant(small, "heading");
    expect(heading?.properties.characters).toBe("Entscheidung");
    expect(bound(heading, "fontSize")).toBe("typography/headline/4/font-size");
    expect(paintOf(heading, "fills")).toBe("color/text/default");
    expect(heading?.properties.componentPropertyReferences).toMatchObject({
      characters: expect.stringMatching(/^label/),
    });
    const message = descendant(small, "message");
    expect(message?.properties.characters).toBe("Nachricht");
    expect(bound(message, "fontSize")).toBe("typography/body/1/font-size");
    const actions = descendant(small, "actions");
    expect(actions?.properties.layoutMode).toBe("HORIZONTAL");
    expect(actions?.properties.primaryAxisAlignItems).toBe("MAX");
    expect(bound(actions, "itemSpacing")).toBe("spacing/small");
    expect(actions?.children.map((child) => child.name)).toEqual(["action-1", "action-2"]);
    expect(actions?.children.map((action) => action.children.map((child) => child.name))).toEqual([
      ["action-label"],
      ["action-label"],
    ]);
    expect(
      actions?.children.map((action) => descendant(action, "action-label")?.properties.characters),
    ).toEqual(["Abbrechen", "Bestätigen"]);
    // The stand-ins take the border of the surface and the message's role, bound.
    expect(paintOf(actions?.children[0], "strokes")).toBe("color/border/default");
    expect(bound(descendant(actions?.children[0], "action-label"), "fontSize")).toBe(
      "typography/body/1/font-size",
    );
  });

  // Abnahme Spec 011 ② (F-5, O-8): „Bestätigen" is a butono of emphasis high, „Abbrechen" of
  // emphasis low. The last stand-in binds its fill and its word's colour to the butono's roles
  // for emphasis=high, intent=neutral, state=rest, and its radius to the butono's box radius —
  // the plan's `composed` entry, read from the butono Skemo; the first keeps the dialog's look
  // (no fill, the message's colour, the surface's border). Both in every variant and on the
  // example frame.
  it("fills the confirming action with the butono's primary roles and leaves the cancelling one as it was (F-5)", async () => {
    const { double, variant } = await drawn();
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") === "Eroj",
    );
    const example = frame?.children.find((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`);
    const roots = [
      variant("size=small, reason=none, state=rest"),
      variant("size=medium, reason=required, state=rest"),
      example,
    ];
    for (const root of roots) {
      const actions = descendant(root, "actions");
      const [cancel, confirm] = actions?.children ?? [];
      expect(confirm?.name, root?.name).toBe("action-2");
      expect(paintOf(confirm, "fills"), root?.name).toBe("color/action/primary/rest");
      expect(paintOf(descendant(confirm, "action-label"), "fills"), root?.name).toBe(
        "color/action/primary/text",
      );
      expect(bound(confirm, "cornerRadius"), root?.name).toBe("radius/role/control");
      // The confirming stand-in keeps the dialog's border, padding and the message's role.
      expect(paintOf(confirm, "strokes"), root?.name).toBe("color/border/default");
      expect(bound(confirm, "paddingLeft"), root?.name).toBe("spacing/large");
      expect(bound(descendant(confirm, "action-label"), "fontSize"), root?.name).toBe(
        "typography/body/1/font-size",
      );
      expect(cancel?.name, root?.name).toBe("action-1");
      expect(cancel?.properties.fills, root?.name).toEqual([]);
      expect(paintOf(descendant(cancel, "action-label"), "fills"), root?.name).toBe(
        "color/text/default",
      );
      expect(bound(cancel, "cornerRadius"), root?.name).toBeUndefined();
    }
  });

  it("shows the reason field with its label where a reason is asked, its height bound; hides the content where none", async () => {
    const { variant } = await drawn();
    for (const reason of ["optional", "required"]) {
      const asked = variant(`size=small, reason=${reason}, state=rest`);
      const content = descendant(asked, "content");
      expect(content?.properties.visible, reason).not.toBe(false);
      expect(content?.properties.layoutMode, reason).toBe("VERTICAL");
      expect(bound(content, "itemSpacing"), reason).toBe("spacing/medium");
      expect(
        content?.children.map((child) => child.name),
        reason,
      ).toEqual(["reason-label", "reason-field", "reason-help"]);
      expect(descendant(asked, "reason-label")?.properties.characters, reason).toBe("Begründung");
      const field = descendant(asked, "reason-field");
      expect(bound(field, "height"), reason).toBe("size/control/large");
      expect(field?.properties.layoutSizingVertical, reason).toBe("FIXED");
      expect(paintOf(field, "strokes"), reason).toBe("color/border/default");
      expect(bound(field, "strokeWeight"), reason).toBe("border/width/default");
    }
    const none = descendant(variant("size=medium, reason=none, state=rest"), "content");
    expect(none?.properties.visible).toBe(false);
    expect(none?.children.map((child) => child.name)).toEqual([
      "reason-label",
      "reason-field",
      "reason-help",
    ]);
    expect(bound(descendant(none, "reason-field"), "height")).toBeUndefined();
  });

  it("writes the modal shadow as a drop shadow of the surface from the plan's layers, and reports that the double cannot bind it", async () => {
    const { variant, dialogo } = await drawn();
    const surface = descendant(variant("size=small, reason=none, state=rest"), "surface");
    const effects = surface?.properties.effects as Record<string, unknown>[];
    // Spec 029 ①: shadow-high of the Fonto (0 4 6, 0 12 24) and the rim of light of the dark mode,
    // an inner shadow that is transparent in light.
    expect(effects).toHaveLength(3);
    expect(effects[0]).toMatchObject({
      type: "DROP_SHADOW",
      offset: { x: 0, y: 4 },
      radius: 6,
      spread: 0,
      visible: true,
    });
    expect(effects[0]?.color).toMatchObject({ r: expect.any(Number), a: expect.any(Number) });
    expect(effects[1]).toMatchObject({ type: "DROP_SHADOW", radius: 24 });
    expect(effects[2]).toMatchObject({ type: "INNER_SHADOW" });
    expect({ ...dialogo?.shadow, variable: role(dialogo?.shadow?.variable) }).toMatchObject({
      part: "surface",
      variable: "elevation/shadow/modal",
      layers: 3,
      status: "bound",
    });
    expect(dialogo?.shadow?.evidence).toContain("setBoundVariableForEffect");
  });

  it('draws the example frame „mit Hintergrund" beside the set in the frame Eroj: the default variant on the backdrop', async () => {
    const { double, report, dialogo } = await drawn();
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") === "Eroj",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const example = frame?.children.find((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`);
    expect(example?.type).toBe("FRAME");
    expect(names.indexOf(`dialogo – ${BACKDROP_EXAMPLE}`)).toBe(names.indexOf("dialogo") + 1);
    expect(example?.getSharedPluginData("fundamento", "example")).toBe("dialogo");
    expect(paintOf(example, "fills")).toBe("color/backdrop");
    expect(example?.properties.layoutMode).toBe("HORIZONTAL");
    expect(example?.properties.paddingLeft).toBe(repoPlan.section?.gap);
    expect(example?.properties.layoutPositioning).toBe("AUTO");
    expect(example?.children.map((child) => child.name)).toEqual(["surface"]);
    const surface = descendant(example, "surface");
    expect(bound(surface, "width")).toBe("size/container/small");
    expect(descendant(example, "heading")?.properties.characters).toBe("Entscheidung");
    // A text outside a component can be connected to no property.
    expect(descendant(example, "heading")?.properties.componentPropertyReferences).toBeUndefined();
    expect(descendant(example, "content")?.properties.visible).toBe(false);
    expect(dialogo?.example).toEqual({
      name: `dialogo – ${BACKDROP_EXAMPLE}`,
      found: false,
      created: true,
    });
    expect(
      report.components.find((component) => component.set === "butono")?.example,
    ).toBeUndefined();
    // The second run finds it and makes no second one.
    const again = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as Report;
    expect(again.components.find((component) => component.set === "dialogo")?.example).toEqual({
      name: `dialogo – ${BACKDROP_EXAMPLE}`,
      found: true,
      created: false,
    });
    expect(
      frame?.children.filter((child) => child.name === `dialogo – ${BACKDROP_EXAMPLE}`),
    ).toHaveLength(1);
  });

  it("measures every variant with a size and a cell, and warns of nothing for the dialogo", async () => {
    const { dialogo, report } = await drawn();
    expect(dialogo?.layout.zero).toEqual([]);
    expect(dialogo?.layout.smaller).toEqual([]);
    expect(dialogo?.layout.unplaced).toEqual([]);
    expect(dialogo?.layout.uneven).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("dialogo"))).toEqual([]);
    expect(report.warnings.filter((warning) => warning.startsWith("tekstareo"))).toEqual([]);
    // The parts of the first variant in the report: the surface at the width of the Fonto's dialog
    // (Spec 029 ①b: komuna's Ero-Token, 400 px; size.container.small before).
    expect(dialogo?.layout.held.rest.surface).toMatchObject({ width: 400 });
    expect(dialogo?.layout.held.rest.heading).toBeDefined();
    expect(dialogo?.layout.held.rest.actions).toBeDefined();
  });

  it("a second run writes nothing new", async () => {
    const { double } = await drawn();
    const before = double.snapshot();
    await run(double, source);
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 015 ② (plan ② D-06): the plugin draws the alsxutilo — every variant a column of label,
// dropzone, help and error; the dropzone a row of the ring around the button (the butono's look,
// its word and the glyphs of the icon upload) and the hint, shown only with a dropzone; the border
// dashed with a dropzone, invisible without; the example „mit zwei Dateien" lists the two files,
// each with its size and a remove of the butono's look with the glyphs of close. A second run
// writes nothing.
describe("the plugin draws the alsxutilo (Spec 015 ②)", () => {
  const bound = (node: DoubleNode | undefined, field: string) =>
    traRolojFigmaName(node?.boundVariables[field]?.name, prepared.input.modelo);
  const paintOf = (node: DoubleNode | undefined) =>
    role(
      (
        node?.properties.fills as { boundVariables?: { color?: { name: string } } }[] | undefined
      )?.[0]?.boundVariables?.color?.name,
    );

  it("every variant: label, dropzone, help, error; the button in the dropzone with its word and icon; the hint only with a dropzone", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "alsxutilo");
    expect(set?.children).toHaveLength(12);
    for (const variant of set?.children ?? []) {
      const field = descendant(variant, "field");
      expect(field?.properties.layoutMode, variant.name).toBe("VERTICAL");
      expect(field?.children.map((child) => child.name)).toEqual([
        "label",
        "dropzone",
        "help",
        "error",
      ]);
      const zone = descendant(variant, "dropzone");
      expect(zone?.children.map((child) => child.name)).toEqual(["focus-ring", "drop-hint"]);
      expect(descendant(variant, "choose-label")?.properties.characters).toBe("Datei auswählen");
      expect(descendant(variant, "help")?.properties.characters).toBe(
        "PDF oder PNG, höchstens 5 MB",
      );
      const withZone = variant.name.includes("dropzone=true");
      expect(descendant(variant, "drop-hint")?.properties.visible, variant.name).toBe(withZone);
      expect(bound(descendant(variant, "choose"), "minHeight")).toBe("size/control/medium");
      expect(bound(zone, "strokeWeight")).toBe("border/width/default");
      // The button holds one glyph frame per Aspekto of the icon upload.
      expect(descendant(variant, "icon")?.children.length).toBeGreaterThan(0);
    }
    const dashed = set?.children.find((child) => child.name === "dropzone=true, state=rest");
    const pattern = descendant(dashed, "dropzone")?.properties.dashPattern as number[] | undefined;
    expect(pattern?.length).toBe(2);
    const solid = set?.children.find((child) => child.name === "dropzone=true, state=dragover");
    expect(descendant(solid, "dropzone")?.properties.dashPattern).toEqual([]);
    expect(paintOf(descendant(solid, "dropzone"))).toBe("color/background/sunken");
  });

  it("the example „mit zwei Dateien“: two rows of name, size and a remove of the butono's look; a second run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const frame = pageNodes(double).find(
      (node) => node.type === "FRAME" && node.getSharedPluginData("fundamento", "frame") !== "",
    );
    const names = frame?.children.map((child) => child.name) ?? [];
    const at = names.indexOf("alsxutilo");
    expect(names.slice(at, at + 2)).toEqual(["alsxutilo", "alsxutilo – mit zwei Dateien"]);
    const example = frame?.children.find((child) => child.name === "alsxutilo – mit zwei Dateien");
    const list = descendant(example, "file-list");
    expect(list?.children.map((child) => child.name)).toEqual(["file-row-1", "file-row-2"]);
    expect(descendant(list, "file-name-1")?.properties.characters).toBe("Lebenslauf.pdf");
    expect(descendant(list, "file-size-1")?.properties.characters).toBe("1,2 MB");
    expect(descendant(list, "file-name-2")?.properties.characters).toBe("Zeugnis.png");
    expect(bound(descendant(list, "remove-1"), "width")).toBe("size/control/small");
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Nachlese 4 N-8 (Spec 014 ⑤ O-23): the open kompletigilo shows both states of an entry — the
// first suggestion chosen (its text in color.text.default), the second the active one under the
// keyboard, its row filled with color.background.sunken; the others with the listbox's raised fill.
describe("the kompletigilo fills the active suggestion (N-8)", () => {
  const fillOf = (node: DoubleNode | undefined) =>
    role(
      ((node?.properties.fills ?? []) as { boundVariables?: { color?: { name: string } } }[])[0]
        ?.boundVariables?.color?.name,
    );

  it("the second suggestion of an open field is filled as active, the first written as chosen", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "kompletigilo");
    const open = set?.children.find(
      (child) => child.name === "size=medium, expanded=true, state=rest",
    );
    expect(fillOf(descendant(open, "suggestion-1"))).toBe("color/background/raised");
    expect(fillOf(descendant(open, "suggestion-2"))).toBe("color/background/sunken");
    expect(fillOf(descendant(open, "suggestion-3"))).toBe("color/background/raised");
    expect(fillOf(descendant(open, "suggestions-1"))).toBe("color/text/default");
    expect(fillOf(descendant(open, "suggestions-2"))).toBe("color/text/subtle");
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });

  // Nachlese 5 N5-6 (Messung 2026-10-19, Auftrag 7.): the fill of the active suggestion wrapped
  // only its word („Zwei“), not the row. Every row – the active, the chosen and the others – fills
  // the width of the listbox, as the row on the web does; its word stands at the start.
  it("N5-6: every suggestion row fills the width of the listbox, the word at its start", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "kompletigilo");
    const open = (set?.children ?? []).filter((child) => child.name.includes("expanded=true"));
    expect(open.length).toBeGreaterThan(0);
    const width = (node: DoubleNode | undefined) =>
      (node as unknown as { width: number } | undefined)?.width ?? 0;
    for (const variant of open) {
      const listbox = descendant(variant, "listbox");
      expect(width(listbox), variant.name).toBeGreaterThan(0);
      for (const n of [1, 2, 3]) {
        const entry = descendant(listbox, `entry-${n}`);
        const row = descendant(entry, `suggestion-${n}`);
        const text = descendant(row, `suggestions-${n}`);
        for (const node of [
          entry,
          descendant(entry, "focus-ring"),
          descendant(entry, "focus-gap"),
          row,
        ]) {
          expect(node?.properties.layoutSizingHorizontal, `${variant.name} ${node?.name}`).toBe(
            "FILL",
          );
        }
        const inner =
          width(listbox) -
          Number(listbox?.properties.paddingLeft ?? 0) -
          Number(listbox?.properties.paddingRight ?? 0);
        expect(width(entry), `${variant.name} entry-${n}`).toBe(inner);
        // The row lies in the reserve of its focus ring and gap (F17), the same reserve the
        // field's control has in its own ring.
        const field = descendant(variant, "field");
        const reserve =
          width(descendant(field, "focus-ring")) - width(descendant(field, "control"));
        expect(reserve).toBeGreaterThan(0);
        expect(width(row), `${variant.name} suggestion-${n}`).toBe(inner - reserve);
        expect(width(text), `${variant.name} suggestions-${n}`).toBeLessThan(width(row));
        expect(row?.properties.primaryAxisAlignItems, variant.name).toBe("MIN");
      }
    }
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 025 ① (plan ① D-04): the plugin draws the glitilo — every variant a column of label, the
// row (start label, the track with its fill and the ring around the thumb — two thumbs with
// range — the end label, the stand-in of the number field shown only with field), help and error; the
// fill the plan's share of the track. A second run writes nothing.
describe("the plugin draws the glitilo (Spec 025 ①)", () => {
  const bound = (node: DoubleNode | undefined, field: string) =>
    role(node?.boundVariables[field]?.name);
  const paintOf = (node: DoubleNode | undefined) =>
    role(
      (
        node?.properties.fills as { boundVariables?: { color?: { name: string } } }[] | undefined
      )?.[0]?.boundVariables?.color?.name,
    );

  it("every variant: label, row, help, error; the track with fill and thumb(s); the number field only with field; a second run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "glitilo");
    expect(set?.children).toHaveLength(24);
    for (const variant of set?.children ?? []) {
      const field = descendant(variant, "field");
      expect(field?.properties.layoutMode, variant.name).toBe("VERTICAL");
      expect(field?.children.map((child) => child.name)).toEqual(["label", "row", "help", "error"]);
      const row = descendant(variant, "row");
      expect(row?.properties.layoutMode, variant.name).toBe("HORIZONTAL");
      expect(row?.children.map((child) => child.name)).toEqual([
        "min-label",
        "track",
        "max-label",
        "number",
      ]);
      expect(descendant(variant, "min-label")?.properties.characters).toBe("0");
      expect(descendant(variant, "max-label")?.properties.characters).toBe("100");
      expect(descendant(variant, "help")?.properties.characters).toBe("Zwischen 0 und 100.");
      const ranged = variant.name.includes("range=true");
      const track = descendant(variant, "track");
      expect(
        track?.children.map((child) => child.name),
        variant.name,
      ).toEqual(ranged ? ["lead", "focus-ring", "fill", "focus-ring-end"] : ["fill", "focus-ring"]);
      expect(descendant(variant, "thumb")).toBeDefined();
      expect(descendant(variant, "thumb-end") !== undefined, variant.name).toBe(ranged);
      const withField = variant.name.includes("field=true");
      expect(descendant(variant, "number")?.properties.visible, variant.name).toBe(withField);
      expect(bound(descendant(variant, "thumb"), "width")).toBe("size/target/min");
      expect(bound(track, "minHeight")).toBe("spacing/small");
      expect(bound(track, "cornerRadius")).toBe("radius/full");
    }
    const rest = set?.children.find(
      (child) => child.name === "range=false, field=false, state=rest",
    );
    expect(paintOf(descendant(rest, "track"))).toBe("color/background/sunken");
    expect(paintOf(descendant(rest, "fill"))).toBe("color/action/primary/rest");
    expect(paintOf(descendant(rest, "thumb"))).toBe("color/action/primary/rest");
    const invalid = set?.children.find(
      (child) => child.name === "range=false, field=false, state=invalid",
    );
    expect(paintOf(descendant(invalid, "thumb"))).toBe("color/status/danger/basic");
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 025 ② (plan ② D-12): the plugin draws the datelektilo — every variant the field's column
// (label, the row of the ring around the control with its text and the trigger with the calendar
// glyph, help, error) and, where expanded, the calendar below: the head (prev, month, next), the
// row of seven weekdays and six rows of seven cells; the chosen day, the days in between, today
// and the days outside the month carry their own looks. A second run writes nothing.
describe("the plugin draws the datelektilo (Spec 025 ②)", () => {
  const bound = (node: DoubleNode | undefined, field: string) =>
    role(node?.boundVariables[field]?.name);
  const paintOf = (node: DoubleNode | undefined, field = "fills") =>
    role(
      (
        node?.properties[field] as { boundVariables?: { color?: { name: string } } }[] | undefined
      )?.[0]?.boundVariables?.color?.name,
    );

  it("every variant: the field with its row and trigger; the calendar only where expanded, with head, weekdays and six weeks; the looks of the cells bound; a second run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((node) => node.name === "datelektilo");
    expect(set?.children).toHaveLength(24);
    for (const variant of set?.children ?? []) {
      const field = descendant(variant, "field");
      expect(field?.properties.layoutMode, variant.name).toBe("VERTICAL");
      expect(field?.children.map((child) => child.name)).toEqual([
        "label",
        "row",
        "calendar",
        "help",
        "error",
      ]);
      const row = descendant(variant, "row");
      expect(row?.properties.layoutMode, variant.name).toBe("HORIZONTAL");
      expect(row?.children.map((child) => child.name)).toEqual(["focus-ring", "trigger"]);
      expect(descendant(variant, "control")).toBeDefined();
      const ranged = variant.name.includes("mode=range");
      expect(descendant(variant, "text")?.properties.characters).toBe(
        ranged ? "06.10.2026 – 10.10.2026" : "24.10.2026",
      );
      expect(descendant(variant, "help")?.properties.characters).toBe("Ein Datum ab heute.");
      const expanded = variant.name.includes("expanded=true");
      const calendar = descendant(variant, "calendar");
      expect(calendar?.properties.visible, variant.name).toBe(expanded);
      expect(calendar?.children.map((child) => child.name)).toEqual([
        "head",
        "weekdays",
        "week-1",
        "week-2",
        "week-3",
        "week-4",
        "week-5",
        "week-6",
      ]);
      expect(descendant(variant, "head")?.children.map((child) => child.name)).toEqual([
        "prev",
        "month",
        "next",
      ]);
      expect(descendant(variant, "month")?.properties.characters).toBe("Oktober 2026");
      expect(descendant(variant, "weekdays")?.children).toHaveLength(7);
      expect(descendant(variant, "weekday-1")?.properties.characters).toBe("Mo");
      for (const week of ["week-1", "week-6"]) {
        expect(descendant(variant, week)?.children, variant.name).toHaveLength(7);
      }
      expect(bound(descendant(variant, "trigger"), "width")).toBe("size/control/medium");
      expect(bound(descendant(variant, "cell-4"), "width")).toBe("size/target/min");
      expect(bound(descendant(variant, "cell-4"), "cornerRadius")).toBe("radius/role/control");
      // The 28th of September stands first, outside the month; the 1st is the fourth cell.
      expect(descendant(variant, "cell-text-1")?.properties.characters).toBe("28");
      expect(descendant(variant, "cell-text-4")?.properties.characters).toBe("1");
      expect(paintOf(descendant(variant, "cell-text-1"))).toBe("color/text/muted");
      // Today, the 22nd (cell 25), carries the strong border; the chosen day the primary fill
      // (the 24th, cell 27) or the range (the 6th to the 10th, cells 9 to 13).
      expect(paintOf(descendant(variant, "cell-25"), "strokes")).toBe("color/border/strong");
      expect(bound(descendant(variant, "cell-25"), "strokeWeight")).toBe("border/width/default");
      if (ranged) {
        expect(paintOf(descendant(variant, "cell-9"))).toBe("color/action/primary/selected");
        expect(paintOf(descendant(variant, "cell-13"))).toBe("color/action/primary/selected");
        expect(paintOf(descendant(variant, "cell-11"))).toBe("color/action/secondary/selected");
        expect(paintOf(descendant(variant, "cell-text-9"))).toBe("color/action/primary/text");
      } else {
        expect(paintOf(descendant(variant, "cell-27"))).toBe("color/action/primary/selected");
        expect(paintOf(descendant(variant, "cell-text-27"))).toBe("color/action/primary/text");
        // A plain day takes the cell's ground of the variant's state.
        const ground = variant.name.includes("state=hover")
          ? "color/action/tertiary/hover"
          : variant.name.includes("state=disabled")
            ? "color/action/tertiary/disabled"
            : "color/action/tertiary/rest";
        expect(paintOf(descendant(variant, "cell-11")), variant.name).toBe(ground);
      }
    }
    const rest = set?.children.find(
      (child) => child.name === "mode=single, expanded=true, state=rest",
    );
    expect(paintOf(descendant(rest, "calendar"))).toBe("color/background/raised");
    expect(paintOf(descendant(rest, "control"))).toBe("color/background/default");
    const hover = set?.children.find(
      (child) => child.name === "mode=single, expanded=true, state=hover",
    );
    expect(paintOf(descendant(hover, "cell-11"))).toBe("color/action/tertiary/hover");
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});

// Spec 025 ③ (plan ③ D-18): the plugin draws the four sets of the selection round — the signeto's
// 160 chips, the two fields with their listbox rows, the editor's twelve texts — and writes
// nothing on a second run.
describe("the plugin draws the selection Eroj (Spec 025 ③)", () => {
  it("four sets with their variants; a second run writes nothing", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const sets = Object.fromEntries(
      ["signeto", "listelektilo", "plurelektilo", "lokredaktilo"].map((name) => [
        name,
        pageNodes(double).find((node) => node.name === name),
      ]),
    );
    // 160, not 240 (plan ③ Abweichung 3): the constraint selected ⇒ mode selectable prunes the set.
    expect(sets.signeto?.children).toHaveLength(160);
    expect(sets.listelektilo?.children).toHaveLength(12);
    expect(sets.plurelektilo?.children).toHaveLength(12);
    expect(sets.lokredaktilo?.children).toHaveLength(12);
    const open = sets.listelektilo?.children.find(
      (child) => child.name === "expanded=true, state=rest",
    );
    expect(descendant(open, "listbox")?.properties.visible).toBe(true);
    expect(descendant(open, "suggestions-1")?.properties.characters).toBe("Eins");
    const chip = sets.signeto?.children.find(
      (child) => child.name === "mode=static, selected=false, size=medium, intent=info, state=rest",
    );
    expect(descendant(chip, "text")).toBeDefined();
    const before = double.snapshot();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.snapshot()).toBe(before);
  });
});
