// aspekto.json in a composed Modelo (Spec 001, T018b, D-20): font scripts are required,
// tavoloj are ignored beyond the schema.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type AspektoFile = { fonts: Record<string, unknown>[]; tavoloj?: unknown };
const errors = (change: (aspekto: AspektoFile) => void) => {
  const root = mutatedFixture("compose-two-aspektoj", (edit) =>
    edit("aspekto-ekzemplo/aspekto.json", (aspekto: AspektoFile) => change(aspekto)),
  );
  roots.push(root);
  return validateModelo(fixtureModeloSource(root)).errors.map((issue) => [issue.rule, issue.path]);
};

describe("aspekto-font-scripts-missing", () => {
  it("is reported at the font whose scripts are missing", () => {
    expect(
      errors((aspekto) => {
        delete aspekto.fonts[0]?.scripts;
      }),
    ).toEqual([["aspekto-font-scripts-missing", "aspekto-ekzemplo/aspekto.json#/fonts/0/scripts"]]);
  });

  it("is reported for an empty list", () => {
    expect(
      errors((aspekto) => {
        if (aspekto.fonts[0]) aspekto.fonts[0].scripts = [];
      }),
    ).toEqual([["aspekto-font-scripts-missing", "aspekto-ekzemplo/aspekto.json#/fonts/0/scripts"]]);
  });
});

describe("tavoloj", () => {
  it("validates with the reserved key vida and ignores unknown keys", () => {
    expect(
      errors((aspekto) => {
        aspekto.tavoloj = { vida: {}, sono: { brand: "jingle" } };
      }),
    ).toEqual([]);
  });
});

describe("komuna (repo)", () => {
  it("declares Latin for Geist and Geist Mono", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    expect(modelo?.aspektoPackages[0]?.fonts?.map((font) => [font.family, font.scripts])).toEqual([
      ["Geist", ["Latn"]],
      ["Geist Mono", ["Latn"]],
    ]);
  });
});
