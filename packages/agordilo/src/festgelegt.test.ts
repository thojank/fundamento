// Spec 024 Runde 1 (§ 4 Grundlagen und Semantik, S-2): the Studio sets single values and aliases of
// a brand — a palette step, a role, a font size per viewport — and names palettes and roles. They
// travel in the Agordo (`festgelegt`, `etikedoj`) so that Schnellstart and Studio work on the same
// data: the derivation keeps a set value where it would derive one, writes an alias where the
// brand re-points a role, and a value for a Dimensio into the brand's conjunction set of that
// Dimensio. The report marks a set step. The same Agordo gives the same bytes.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type Agordo, deriveAspekto, loadCalibration, readAgordo, readStructure } from "./index.js";

const FILE = "agordo.json";
const provo = JSON.parse(
  readFileSync(
    new URL("../../modelo/test/fixtures/valid/aspekto-provo/agordo.json", import.meta.url),
    "utf8",
  ),
) as Agordo;

type Json = Record<string, unknown>;
const setOf = (files: Record<string, string>, path: string): Json =>
  JSON.parse(files[path] ?? "{}") as Json;
const tokenValue = (set: Json, name: string): unknown =>
  name.split(".").reduce<unknown>((node, key) => (node as Json | undefined)?.[key], set) ===
  undefined
    ? undefined
    : ((
        name
          .split(".")
          .reduce<unknown>((node, key) => (node as Json | undefined)?.[key], set) as Json
      ).$value as unknown);

describe("readAgordo with festgelegt and etikedoj (Spec 024)", () => {
  it("reads set values, aliases, values per Dimensio and display names", () => {
    const { agordo, issues } = readAgordo(
      {
        name: "provo",
        leitfarbe: "#6b4fa0",
        festgelegt: {
          "color.palette.accent.700": {
            wert: { colorSpace: "srgb", components: [0.1, 0.2, 0.5], hex: "#1a3380" },
          },
          "color.text.default": {
            alias: "color.palette.neutral.800",
            modoj: { "color-scheme=dark": { alias: "color.palette.neutral.100" } },
          },
          "font.size.display.1": {
            modoj: { "viewport=compact": { alias: "font.size.scale.900" } },
          },
        },
        etikedoj: {
          marko: "Provo GmbH",
          "color.palette.accent": "Ozean",
          "color.text.default": "Fließtext",
        },
      },
      FILE,
    );
    expect(issues).toEqual([]);
    expect(agordo?.etikedoj?.marko).toBe("Provo GmbH");
    expect(agordo?.festgelegt?.["color.text.default"]?.alias).toBe("color.palette.neutral.800");
  });

  it("refuses a set entry outside the shape, and a display name that is empty", () => {
    const { issues } = readAgordo(
      { name: "provo", leitfarbe: "#6b4fa0", festgelegt: { "color.text.default": { foo: 1 } } },
      FILE,
    );
    expect(issues.map((issue) => issue.rule)).toEqual(["schema-violation"]);
    expect(issues[0]?.path).toContain("/festgelegt/color.text.default");
    const empty = readAgordo(
      { name: "provo", leitfarbe: "#6b4fa0", etikedoj: { marko: "" } },
      FILE,
    );
    expect(empty.issues.map((issue) => issue.path)).toEqual([`${FILE}#/etikedoj/marko`]);
  });
});

describe("deriveAspekto with festgelegt (Spec 024, S-2)", () => {
  const structure = readStructure();
  const calibration = loadCalibration();
  const agordo: Agordo = {
    ...provo,
    name: "festa",
    festgelegt: {
      "color.palette.accent.700": {
        wert: { colorSpace: "srgb", components: [0.1647, 0.2, 0.5608], hex: "#2a338f" },
      },
      "color.text.default": {
        alias: "color.palette.neutral.800",
        modoj: { "color-scheme=dark": { alias: "color.palette.neutral.100" } },
      },
      "font.size.display.1": { modoj: { "viewport=compact": { alias: "font.size.scale.900" } } },
      "radius.role.control": { alias: "radius.full" },
    },
    etikedoj: { marko: "Festa", "color.palette.accent": "Ozean" },
  };
  const derivation = deriveAspekto(agordo, structure, calibration);

  it("keeps a set palette step where it would derive one, and the report marks it", () => {
    expect(derivation.issues.filter((issue) => issue.rule === "schema-violation")).toEqual([]);
    const main = setOf(derivation.files, "sets/aspekto/festa.json");
    expect(tokenValue(main, "color.palette.accent.700")).toMatchObject({ hex: "#2a338f" });
    const step = derivation.raporto.palettes.find(
      (entry) => entry.token === "color.palette.accent.700" && entry.mode === "light",
    );
    expect(step?.hex).toBe("#2a338f");
    expect(step?.gesetzt).toBe(true);
    expect(step?.achieved).toBeGreaterThan(1);
    const other = derivation.raporto.palettes.find(
      (entry) => entry.token === "color.palette.accent.600" && entry.mode === "light",
    );
    expect(other?.gesetzt).toBeUndefined();
  });

  it("writes an alias for a re-pointed role, light and dark", () => {
    const main = setOf(derivation.files, "sets/aspekto/festa.json");
    expect(tokenValue(main, "color.text.default")).toBe("{color.palette.neutral.800}");
    expect(tokenValue(main, "radius.role.control")).toBe("{radius.full}");
    const dark = setOf(derivation.files, "sets/aspekto/festa+color-scheme/dark.json");
    expect(tokenValue(dark, "color.text.default")).toBe("{color.palette.neutral.100}");
  });

  it("writes a value for a Dimensio into the brand's conjunction set of that Dimensio, listed in $themes.json", () => {
    const path = "sets/aspekto/festa+viewport/compact.json";
    expect(Object.keys(derivation.files)).toContain(path);
    const set = setOf(derivation.files, path);
    expect(tokenValue(set, "font.size.display.1")).toBe("{font.size.scale.900}");
    expect(derivation.files["$themes.json"]).toContain("festa+viewport/compact");
  });

  it("writes the display names into aspekto.json and the whole Agordo into its origin", () => {
    const aspekto = JSON.parse(derivation.files["aspekto.json"] ?? "{}") as Json;
    expect(aspekto.etikedoj).toEqual({ marko: "Festa", "color.palette.accent": "Ozean" });
    expect((aspekto.agordilo as Json).agordo).toEqual(agordo);
  });

  it("passes the checks of the Modelo and gives the same bytes twice", () => {
    expect(derivation.issues.map((issue) => issue.rule)).toEqual([]);
    expect(derivation.exportable).toBe(true);
    const again = deriveAspekto(agordo, structure, calibration);
    expect(again.files).toEqual(derivation.files);
  });

  it("without festgelegt nothing changes against the derivation of before", () => {
    const plain = deriveAspekto({ ...provo, name: "festa" }, structure, calibration);
    const main = setOf(plain.files, "sets/aspekto/festa.json");
    expect(tokenValue(main, "color.text.default")).toBe("{color.palette.neutral.900}");
    expect(Object.keys(plain.files)).not.toContain("sets/aspekto/festa+viewport/compact.json");
    expect(plain.raporto.palettes.every((step) => step.gesetzt === undefined)).toBe(true);
  });
});
