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
  kampo: ["spinner", "clear", "decrement", "increment"],
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

  it("the ✕ is as large as the field's icon: the chevron, the calendar, else the icon of the size", () => {
    for (const size of ["small", "medium", "large"]) {
      expect(sizeOf("elektilo", "clear", size)).toBe(sizeOf("elektilo", "indicator", size));
      expect(sizeOf("kampo", "clear", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kompletigilo", "clear", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kampo", "decrement", size)).toBe(`size.icon.${size}`);
      expect(sizeOf("kampo", "increment", size)).toBe(`size.icon.${size}`);
    }
    expect(sizeOf("listelektilo", "clear")).toBe(sizeOf("listelektilo", "indicator"));
    expect(sizeOf("datelektilo", "trigger")).toBe("size.icon.medium");
    expect(sizeOf("datelektilo", "clear")).toBe(sizeOf("datelektilo", "trigger"));
  });
});
