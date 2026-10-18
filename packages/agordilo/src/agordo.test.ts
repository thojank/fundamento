// The Agordo (Spec 016 G4): the recipe of a brand, read against `$defs/Agordo` of the Modelo
// schema. Every problem is a structured issue with a path, a rule and a suggestion.

import { describe, expect, it } from "vitest";
import { parseAgordoColor, readAgordo } from "./index.js";

const FILE = "agordo.json";

describe("readAgordo (G4)", () => {
  it("reads the smallest Agordo: a name and a lead colour", () => {
    const { agordo, issues } = readAgordo({ name: "provo", leitfarbe: "#1d4ed8" }, FILE);
    expect(issues).toEqual([]);
    expect(agordo?.name).toBe("provo");
    expect(agordo?.leitfarbe).toBe("#1d4ed8");
  });

  it("refuses an Agordo without leitfarbe with path, rule and suggestion", () => {
    const { agordo, issues } = readAgordo({ name: "provo" }, FILE);
    expect(agordo).toBeUndefined();
    expect(issues.map(({ path, rule }) => [rule, path])).toEqual([
      ["schema-violation", `${FILE}#/leitfarbe`],
    ]);
    expect(issues[0]?.suggestion).toMatch(/leitfarbe/);
  });

  it.each([
    ["a name outside the grammar", { name: "Provo", leitfarbe: "#1d4ed8" }, "#/name"],
    [
      "a colour that is neither hex nor oklch()",
      { name: "provo", leitfarbe: "blue" },
      "#/leitfarbe",
    ],
    [
      "a slider outside its range",
      { name: "provo", leitfarbe: "#1d4ed8", regler: { saettigung: 3 } },
      "#/regler/saettigung",
    ],
    [
      "a tint outside 0…1",
      { name: "provo", leitfarbe: "#1d4ed8", neutral: { toenung: -0.1 } },
      "#/neutral/toenung",
    ],
    [
      "an unknown status colour",
      { name: "provo", leitfarbe: "#1d4ed8", zusatzfarben: { brand: "#ff0000" } },
      "#/zusatzfarben/brand",
    ],
  ])("refuses %s at its path", (_label, value, pointer) => {
    const { agordo, issues } = readAgordo(value, FILE);
    expect(agordo).toBeUndefined();
    expect(issues.map((issue) => issue.path)).toContain(`${FILE}${pointer}`);
    for (const issue of issues) expect(issue.suggestion.length).toBeGreaterThan(0);
  });
});

describe("parseAgordoColor", () => {
  it("reads hex in three and six digits and oklch() with L as number or percentage", () => {
    expect(parseAgordoColor("#ffffff")?.l).toBeCloseTo(1, 4);
    expect(parseAgordoColor("#000")?.l).toBeCloseTo(0, 4);
    const oklch = parseAgordoColor("oklch(0.62 0.15 250)");
    expect(oklch).toEqual({ l: 0.62, c: 0.15, h: 250 });
    expect(parseAgordoColor("oklch(62% 0.15 250)")).toEqual({ l: 0.62, c: 0.15, h: 250 });
  });

  it("returns undefined for anything else", () => {
    for (const text of ["blue", "#12345", "rgb(0 0 0)", "oklch(0.5 0.1)", ""]) {
      expect(parseAgordoColor(text), text).toBeUndefined();
    }
  });
});
