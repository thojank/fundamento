// Spec 036 Teil 5 ②b-5 (Spec 029 ①-7, B-2/B-3): the fallback of a brand font follows its category,
// and every typography role takes the nearest weight the font has. The category and the weights
// travel in the Agordo's Fonto (written by the Metiejo from its catalogue); the Agordilo reads no
// catalogue of its own (Spec 036, Blocker 11). Without them the derivation stays as it was.

import type { Fonto } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type Agordo, deriveAspekto, loadCalibration, readAgordo, readStructure } from "./index.js";

type Files = Record<string, string>;

/** The `$value` at a dotted token name of a set file of a derivation. */
function valueAt(files: Files, path: string, name: string): unknown {
  let node: unknown = JSON.parse(files[path] ?? "{}");
  for (const key of name.split(".")) node = (node as Record<string, unknown> | undefined)?.[key];
  return (node as { $value?: unknown } | undefined)?.$value;
}

/** The weight a typography role of the main set resolves to (through font.weight.* of that set). */
function weightOf(files: Files, path: string, role: string): number | undefined {
  const typography = valueAt(files, path, `typography.${role}`) as { fontWeight?: unknown };
  const weight = typography?.fontWeight;
  if (typeof weight === "number") return weight;
  const alias = typeof weight === "string" ? /^\{(.+)\}$/.exec(weight)?.[1] : undefined;
  const value = alias === undefined ? undefined : valueAt(files, path, alias);
  return typeof value === "number" ? value : undefined;
}

const SERIF: Fonto = {
  family: "Prata",
  license: "OFL-1.1",
  source: "https://fontsource.org/fonts/prata",
  redistributable: true,
  scripts: ["Cyrl", "Latn"],
};

const structure = readStructure();
const calibration = loadCalibration();
const derive = (agordo: Agordo): Files => deriveAspekto(agordo, structure, calibration).files;
const main = (name: string) => `sets/aspekto/${name}.json`;

describe("a Fonto may name its category and its weights (①-7)", () => {
  it("the Agordo schema takes category and weights, and refuses an unknown category", () => {
    const fonto = { ...SERIF, category: "serif", weights: [400] };
    expect(
      readAgordo({ name: "serifa", leitfarbe: "#6b4fa0", schriften: { display: fonto } }).issues,
    ).toEqual([]);
    const wrong = readAgordo({
      name: "serifa",
      leitfarbe: "#6b4fa0",
      schriften: { display: { ...fonto, category: "round" } },
    });
    expect(wrong.issues.map((issue) => issue.rule)).toEqual(["schema-violation"]);
  });
});

describe("the fallback by category (①-7, B-3)", () => {
  it("a serif font falls back to the platform's serif, not to a sans", () => {
    const files = derive({
      name: "serifa",
      leitfarbe: "#6b4fa0",
      schriften: { display: { ...SERIF, category: "serif", weights: [400] } },
    });
    expect(valueAt(files, main("serifa"), "font.family.display")).toEqual([
      "Prata",
      "ui-serif",
      "serif",
    ]);
    // The body keeps the reference's family and fallback.
    expect(valueAt(files, main("serifa"), "font.family.body")).toEqual([
      "Geist",
      "system-ui",
      "sans-serif",
    ]);
  });

  it("a monospaced font in the body falls back to the platform's monospace", () => {
    const files = derive({
      name: "mona",
      leitfarbe: "#336699",
      schriften: {
        body: {
          family: "Geist Mono",
          license: "OFL-1.1",
          source: "https://fontsource.org/fonts/geist-mono",
          redistributable: true,
          scripts: ["Latn"],
          category: "monospace",
        },
      },
    });
    expect(valueAt(files, main("mona"), "font.family.body")).toEqual([
      "Geist Mono",
      "ui-monospace",
      "monospace",
    ]);
  });

  it("a category without a generic family of its own keeps the structure's fallback", () => {
    const files = derive({
      name: "ornama",
      leitfarbe: "#336699",
      schriften: { display: { ...SERIF, family: "Abril Fatface", category: "display" } },
    });
    expect(valueAt(files, main("ornama"), "font.family.display")).toEqual([
      "Abril Fatface",
      "system-ui",
      "sans-serif",
    ]);
  });
});

describe("the nearest weight the font has (①-7, B-2)", () => {
  it("a font with only 400 sets every role it carries in 400; other roles keep theirs", () => {
    const plain = derive({ name: "serifa", leitfarbe: "#6b4fa0" });
    const files = derive({
      name: "serifa",
      leitfarbe: "#6b4fa0",
      schriften: { display: { ...SERIF, category: "serif", weights: [400] } },
    });
    for (const role of ["display.1", "headline.1", "headline.2", "headline.3", "headline.4"]) {
      expect(weightOf(files, main("serifa"), role), role).toBe(400);
    }
    // The body roles are not in Prata: their weights stay those of the structure.
    for (const role of ["body.1", "label.1", "kicker", "code"]) {
      expect(weightOf(files, main("serifa"), role), role).toBe(
        weightOf(plain, main("serifa"), role),
      );
    }
  });

  it("takes the nearest weight; on a tie the lighter up to 500, the heavier above", () => {
    const files = derive({
      name: "duona",
      leitfarbe: "#336699",
      schriften: {
        body: { ...SERIF, family: "Duona", category: "sans-serif", weights: [300, 700] },
      },
    });
    // body.1 regular 400 → 300; label.1 medium 500 → 300 (tie, lighter); kicker semibold 600 → 700.
    expect(weightOf(files, main("duona"), "body.1")).toBe(300);
    expect(weightOf(files, main("duona"), "label.1")).toBe(300);
    expect(weightOf(files, main("duona"), "kicker")).toBe(700);
  });

  it("without category and weights the derivation is byte for byte the one before", () => {
    const fonto = { ...SERIF };
    const before = derive({ name: "serifa", leitfarbe: "#6b4fa0", schriften: { display: fonto } });
    expect(valueAt(before, main("serifa"), "font.family.display")).toEqual([
      "Prata",
      "system-ui",
      "sans-serif",
    ]);
    expect(weightOf(before, main("serifa"), "headline.1")).toBe(600);
  });
});
