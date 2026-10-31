// Spec 029 ②b-1, Abnahme #122 (Maintainer, 30.10.): the right edge of a field – one rule for all
// twelve fields, held in the Skemo. Everything at the end sits INSIDE the field's border, from the
// inside out: status icon (M-2, ②b-1b), spinner, clear button, the field's icon (chevron, calendar,
// the steppers of a number). The spinner stands in the field, not beside the label. A field
// without a box of its own (slider, choice, toggles, upload) keeps the same order at its end.
// The ✕ is as large as the field's icon (the chevron of a select, the calendar of a date picker).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const skemoOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry.skemo;
};

/** The parts at the end of each field, from the inside out. */
const TRAILING: Readonly<Record<string, readonly string[]>> = {
  // Spec 035 2.1 (Nachtrag 30.10.): the status icon of M-2 first, before the spinner.
  kampo: ["status-icon", "spinner", "clear", "decrement", "increment"],
  tekstareo: ["spinner"],
  elektilo: ["spinner", "clear", "indicator"],
  listelektilo: ["spinner", "clear", "indicator"],
  plurelektilo: ["spinner", "indicator"],
  kompletigilo: ["spinner", "clear"],
  datelektilo: ["spinner", "clear", "trigger"],
  glitilo: ["spinner"],
  elekto: ["spinner"],
  markobutono: ["spinner"],
  sxaltilo: ["spinner"],
  alsxutilo: ["spinner"],
};

const sizeOf = (ero: string, part: string, size?: string) => {
  const skemo = skemoOf(ero);
  const source = skemo.parts[part]?.size;
  if (source !== undefined && "fixed" in source) return source.fixed;
  return skemo.bindings.find(
    (binding) =>
      binding.part === part &&
      binding.property === "size" &&
      (size === undefined || binding.when?.size === size),
  )?.token;
};

describe("Abnahme #122: the right edge of the fields, one rule in the Skemo", () => {
  it.each(Object.entries(TRAILING))(
    "%s: the parts at its end, from the inside out",
    (ero, parts) => {
      const skemo = skemoOf(ero);
      expect(skemo.trailing).toEqual(parts);
      for (const part of parts) expect(skemo.parts[part], part).toBeDefined();
    },
  );

  // Decision of the maintainer (30.10.): a field without a border whose label stands beside its
  // control (markobutono, sxaltilo) shows its end directly after the text of the label, in the
  // web and in Figma; every other field at its own end.
  it("markobutono and sxaltilo: the end directly after the label's text (trailingAfter)", () => {
    for (const ero of Object.keys(TRAILING)) {
      const after = skemoOf(ero).trailingAfter;
      expect(after, ero).toBe(["markobutono", "sxaltilo"].includes(ero) ? "label" : undefined);
      if (after !== undefined) expect(skemoOf(ero).parts[after], ero).toBeDefined();
    }
  });

  it("the ✕ is as large as the field's icon: the chevron, the calendar, else the icon of the size", () => {
    for (const size of ["small", "medium", "large"]) {
      expect(sizeOf("elektilo", "clear", size)).toBe(sizeOf("elektilo", "indicator", size));
      expect(sizeOf("kampo", "clear", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kompletigilo", "clear", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kampo", "decrement", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kampo", "increment", size)).toBe(`size.icon.${size}`);
    }
    expect(sizeOf("listelektilo", "clear")).toBe(sizeOf("listelektilo", "indicator"));
    // Spec 035 2.3.1: the calendar is as large as the chevron of the elektilo (the date picker has
    // no size: the elektilo's medium); its button keeps the target of a pointer by its width.
    expect(sizeOf("datelektilo", "trigger")).toBe(sizeOf("elektilo", "indicator", "medium"));
    // Spec 035 2.3.3: its ✕ as large as the kampo's (size medium), as large as the calendar again.
    expect(sizeOf("datelektilo", "clear")).toBe(sizeOf("kampo", "clear", "medium"));
    expect(sizeOf("datelektilo", "clear")).toBe(sizeOf("datelektilo", "trigger"));
  });

  // WCAG 2.2, 2.5.8: a button at the end shows its icon at the field's size, yet stays a target of
  // at least size.target.min – its width (the web's minimum, square).
  it("every button at the end is a target of at least size.target.min", () => {
    const buttons: readonly (readonly [string, string])[] = [
      ["kampo", "clear"],
      ["kampo", "decrement"],
      ["kampo", "increment"],
      ["elektilo", "clear"],
      ["listelektilo", "clear"],
      ["kompletigilo", "clear"],
      // Spec 035 2.3.1: the calendar's glyph is the chevron's size, its button the target.
      ["datelektilo", "trigger"],
      // Spec 035 2.3.3: the ✕ of the date picker as the kampo's.
      ["datelektilo", "clear"],
    ];
    for (const [ero, part] of buttons) {
      const width = skemoOf(ero).parts[part]?.width;
      expect(width !== undefined && "fixed" in width ? width.fixed : width, `${ero}.${part}`).toBe(
        "size.target.min",
      );
    }
  });
});
