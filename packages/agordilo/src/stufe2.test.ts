// Stage 2 through the whole derivation (Spec 019 ①, G3, G4, E6): the calibration byte for byte
// against the stage-1 package of provo, the corners of the sliders through every check of the
// Modelo (fixed rules stay unviolated), and an icon weight without its full set of glyphs refused.
// Each test here derives and checks the whole Modelo (about 1.7 s), so they derive as rarely as
// they can (vitest.config.ts).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type Agordo,
  deriveAspekto,
  gestaltBasis,
  gestaltSliders,
  loadCalibration,
  readStructure,
  type Structure,
} from "./index.js";

interface Stufe1 {
  agordo: Agordo;
  sha256: Record<string, string>;
}

const STUFE1: Stufe1 = JSON.parse(
  readFileSync(new URL("../fixtures/stufe1-provo.json", import.meta.url), "utf8"),
);

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const hashes = (files: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([path, text]) => [path, sha256(text)]));

describe("calibration (G3): the standard sliders give the stage-1 derivation byte for byte", () => {
  it("the Agordo provo of stage 1 derives the package of stage 1 (main ac5deb3), every file", () => {
    const { files } = deriveAspekto(STUFE1.agordo, readStructure(), loadCalibration());
    expect(hashes(files)).toEqual(STUFE1.sha256);
  });

  it("with every slider of stage 2 written out on its standard, every value is the one of stage 1", () => {
    const structure = readStructure();
    const standard = Object.fromEntries(
      gestaltSliders(gestaltBasis(structure.files)).map((s) => [s.path, s.standard]),
    );
    const agordo: Agordo = {
      ...STUFE1.agordo,
      form: {
        radius: standard["form.radius"] as number,
        rahmen: standard["form.rahmen"] as number,
        schatten: standard["form.schatten"] as number,
      },
      raum: {
        abstand: standard["raum.abstand"] as number,
        hoehe: standard["raum.hoehe"] as number,
      },
      schrift: {
        groesse: standard["schrift.groesse"] as number,
        skala: standard["schrift.skala"] as number,
        gewicht: standard["schrift.gewicht"] as number,
      },
      ikono: { gewicht: "regular" },
    };
    const { files } = deriveAspekto(agordo, structure, loadCalibration());
    const { "aspekto.json": aspekto, ...rest } = files;
    const { "aspekto.json": stufe1Aspekto, ...stufe1Rest } = STUFE1.sha256;
    // Sets, lock, $themes, glyphs and the Raporto: the bytes of stage 1.
    expect(hashes(rest)).toEqual(stufe1Rest);
    // aspekto.json carries the Agordo as its origin; without the fields of stage 2 it is stage 1's.
    const parsed = JSON.parse(aspekto ?? "{}");
    for (const field of ["form", "raum", "schrift", "ikono"]) delete parsed.agordilo.agordo[field];
    expect(sha256(`${JSON.stringify(parsed, null, 2)}\n`)).toBe(stufe1Aspekto);
  });
});

describe("the corners of the sliders through every check (G4)", () => {
  const corner = (end: "min" | "max", structure: Structure): Agordo => {
    const at = Object.fromEntries(
      gestaltSliders(gestaltBasis(structure.files)).map((s) => [s.path, s[end]]),
    );
    return {
      name: `ecke-${end}`,
      leitfarbe: "#375479",
      form: {
        radius: at["form.radius"] as number,
        rahmen: at["form.rahmen"] as number,
        schatten: at["form.schatten"] as number,
      },
      raum: { abstand: at["raum.abstand"] as number, hoehe: at["raum.hoehe"] as number },
      schrift: {
        groesse: at["schrift.groesse"] as number,
        skala: at["schrift.skala"] as number,
        gewicht: at["schrift.gewicht"] as number,
      },
      ikono: { gewicht: end === "min" ? "thin" : "bold" },
    };
  };

  it.each(["min", "max"] as const)("every slider at its %s: no fixed rule violated", (end) => {
    const structure = readStructure();
    const { raporto } = deriveAspekto(corner(end, structure), structure, loadCalibration());
    expect(raporto.violations.filter((violation) => violation.fixed)).toEqual([]);
    expect(raporto.summary.pairs.failed).toBe(0);
  });
});

describe("ikono.gewicht (G2, E6)", () => {
  it("an icon weight without a glyph for every name of the Ikonaro is refused, at its path", () => {
    const structure = readStructure();
    const weights = structure.ikonoGewichte;
    expect(weights?.glyphs.bold).toBeDefined();
    const { check: _dropped, ...partial } = weights?.glyphs.bold ?? {};
    const broken: Structure = {
      ...structure,
      ikonoGewichte: {
        provenance: weights?.provenance ?? {},
        glyphs: { ...weights?.glyphs, bold: partial },
      },
    } as Structure;
    const derivation = deriveAspekto(
      { name: "halb", leitfarbe: "#375479", ikono: { gewicht: "bold" } },
      broken,
      loadCalibration(),
    );
    expect(derivation.exportable).toBe(false);
    const issue = derivation.issues.find((entry) => entry.rule === "ikonaro-glyph-missing");
    expect(issue?.path).toBe("agordo#/ikono/gewicht");
    expect(issue?.message).toContain('"check"');
    expect(issue?.suggestion).toMatch(/Phosphor/);
  });
});
