// Spec 019 ③ (G8, Abnahme 5): the values of stage 2 are ordinary token values of the Aspekto —
// Figma follows without a way of its own. A config with provo and provo-kompakta
// (fundamento.provoj.config.json, like fundamento.tri.config.json) gives the collection aspekto the
// modes komuna, provo, provo-kompakta; radius, spacing, type and control height are variables with
// a value per mode, and the glyphs follow the icon weight of each brand.

import { projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok)
  throw new Error(
    `core + provo + provo-kompakta must be valid: ${JSON.stringify(prepared.errors.slice(0, 2))}`,
  );
const plan = JSON.parse(
  FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
) as FigmaPlan & { ikonoj: { glyphs: Record<string, Record<string, string>> } };
const collection = plan.collections.find((candidate) => candidate.name === "aspekto");
const valuesOf = (name: string) =>
  collection?.variables.find((variable) => variable.name === name)?.values;

describe("provo and provo-kompakta in Figma (Spec 019 ③, G8)", () => {
  it("are modes of the collection aspekto beside komuna", () => {
    expect(collection?.modes).toEqual(["komuna", "provo", "provo-kompakta"]);
  });

  it("radius, spacing, type size and control height are variables with a value per brand", () => {
    // Spec 029 ①: komuna's radius and type are the Fonto's (element 10, base 14).
    expect(valuesOf("radius/medium")).toEqual({ komuna: 10, provo: 6, "provo-kompakta": 1 });
    expect(valuesOf("spacing/scale/400")).toEqual({ komuna: 16, provo: 20, "provo-kompakta": 12 });
    // Spec 029 ①: komuna's type scale changes at a narrow width (touch and narrow of the Fonto), so
    // its steps cascade over viewport; the medium width holds the base.
    expect(valuesOf("font/size/scale/300@viewport=medium")).toEqual({
      komuna: 14,
      provo: 16,
      "provo-kompakta": 14,
    });
    expect(valuesOf("size/scale/700")).toEqual({ komuna: 36, provo: 40, "provo-kompakta": 36 });
  });

  it("draws the Ikonaro of each brand in its own Phosphor weight", () => {
    const glyphs = plan.ikonoj.glyphs;
    expect(Object.keys(glyphs)).toEqual(["komuna", "provo", "provo-kompakta"]);
    expect(glyphs.provo?.check).not.toBe(glyphs.komuna?.check);
    expect(glyphs["provo-kompakta"]?.check).not.toBe(glyphs.komuna?.check);
    expect(glyphs.provo?.check).not.toBe(glyphs["provo-kompakta"]?.check);
  });
});
