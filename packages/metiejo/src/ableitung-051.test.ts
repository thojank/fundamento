// Spec 051 T2 (AC-3, R0-i): the derivation stays byte-equal while the check gets faster. The
// fixture holds the SHA-256 of what a fixed course of invented Agordo derives, in this order, in one
// process: the palettes of the derivation basis for a course in which each Agordo differs from the
// one before in one input of the palettes (lead colour, Zweitfarbe set, changed and removed, the
// three sliders, a target of the Werkstatt, a status colour, the tint of the neutrals, the basis),
// then every file of `deriveAspekto` (`checkDraft`) for the bases `leer` and `komuna`, each with the
// Zweitfarbe set and removed. Whatever a derivation keeps for the next one, the next one must give
// the bytes it gave before. Written once with FM_ABLEITUNG_051=schreiben on 79a463bc, before any
// change of the code; afterwards only compared. No clock, no model, invented brands and values.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { type Agordo, derivationBasis } from "@fundamento/agordilo";
import { afterAll, describe, expect, it } from "vitest";
import { checkDraft, loadBases, startAgordo } from "./vorschau.js";

interface Fall {
  fall: string;
  sha256: string;
}

interface Fixture {
  stand: string;
  faelle: Fall[];
}

const FIXTURE = new URL("./test-doubles/ableitung-051.json", import.meta.url);
const SCHREIBEN = process.env.FM_ABLEITUNG_051 === "schreiben";
const STAND = "79a463bc";

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const fixture = (): Fixture => JSON.parse(readFileSync(FIXTURE, "utf8")) as Fixture;

const faelle: Fall[] = [];
afterAll(() => {
  if (SCHREIBEN) {
    const geschrieben: Fixture = { stand: STAND, faelle };
    writeFileSync(FIXTURE, `${JSON.stringify(geschrieben, null, 2)}\n`);
  }
});

/** Compares (or, once, records) the cases of one test in their order. */
function vergleiche(praefix: string, own: Fall[]): void {
  faelle.push(...own);
  if (SCHREIBEN) return;
  expect(own).toEqual(fixture().faelle.filter((entry) => entry.fall.startsWith(praefix)));
}

const bases = loadBases();
const leer = startAgordo("probekolora", "leer", bases);
const komuna = startAgordo("probekomuna", "komuna", bases);

/** The course of the palettes: each step changes one input against the step before (invented). */
const PALETTEN: readonly [string, Agordo][] = [
  ["leer", leer],
  ["zweitfarbe", { ...leer, zweitfarbe: { farbe: "#0f8f86" } }],
  ["zweitfarbe-anders", { ...leer, zweitfarbe: { farbe: "#17b3a8" } }],
  ["zweitfarbe-weg", leer],
  ["leitfarbe", { ...leer, leitfarbe: "#336699" }],
  ["leitfarbe-zweitfarbe", { ...leer, leitfarbe: "#336699", zweitfarbe: { farbe: "#17b3a8" } }],
  ["saettigung", { ...leer, zweitfarbe: { farbe: "#17b3a8" }, regler: { saettigung: 0.6 } }],
  ["helligkeit", { ...leer, zweitfarbe: { farbe: "#17b3a8" }, regler: { helligkeit: 0.5 } }],
  ["kontrast", { ...leer, zweitfarbe: { farbe: "#17b3a8" }, regler: { kontrast: -0.5 } }],
  ["ziel", { ...leer, zweitfarbe: { farbe: "#17b3a8" }, ziele: { "accent.500": { hell: 4.8 } } }],
  [
    "ziel-zweitfarbe",
    { ...leer, zweitfarbe: { farbe: "#17b3a8" }, ziele: { "sekundo.600": { hell: 6.2 } } },
  ],
  [
    "zusatzfarbe",
    { ...leer, zweitfarbe: { farbe: "#17b3a8" }, zusatzfarben: { danger: "#b3261e" } },
  ],
  ["toenung", { ...leer, zweitfarbe: { farbe: "#17b3a8" }, neutral: { toenung: 1 } }],
  ["komuna", komuna],
  ["komuna-zweitfarbe", { ...komuna, zweitfarbe: { farbe: "#8a4fff" } }],
  ["leer-wieder", leer],
  ["zweitfarbe-wieder", { ...leer, zweitfarbe: { farbe: "#0f8f86" } }],
];

/** The course of the whole derivation: both bases, the Zweitfarbe set and removed (invented). */
const ABLEITUNGEN: readonly [string, Agordo][] = [
  ["leer", leer],
  ["leer-zweitfarbe", { ...leer, zweitfarbe: { farbe: "#0f8f86" } }],
  ["leer-ohne", leer],
  ["komuna-zweitfarbe", { ...komuna, zweitfarbe: { farbe: "#17b3a8" } }],
  ["komuna-ohne", komuna],
];

describe("the derivation of a fixed course is byte-equal to 79a463bc (Spec 051 T2, AC-3)", () => {
  it("the palettes of the derivation basis, each input changed in turn", () => {
    const own = PALETTEN.map(([fall, agordo]): Fall => {
      const { palettes } = derivationBasis(agordo, bases.structure, bases.calibration);
      return { fall: `paletten/${fall}`, sha256: sha256(JSON.stringify(palettes)) };
    });
    vergleiche("paletten/", own);
  });

  it("every file of the derivation, its issues and its decision, for both bases", () => {
    const own = ABLEITUNGEN.flatMap(([fall, agordo]): Fall[] => {
      const derivation = checkDraft(agordo, bases);
      return [
        ...Object.entries(derivation.files).map(([pfad, text]) => ({
          fall: `ableitung/${fall}/${pfad}`,
          sha256: sha256(text),
        })),
        {
          fall: `ableitung/${fall}/(issues, exportable, palettes)`,
          sha256: sha256(
            JSON.stringify({
              issues: derivation.issues,
              exportable: derivation.exportable,
              palettes: derivation.palettes,
            }),
          ),
        },
      ];
    });
    vergleiche("ableitung/", own);
  });

  it("the fixture was written on 79a463bc and holds every case", () => {
    if (SCHREIBEN) return;
    const { stand, faelle: alle } = fixture();
    expect(stand).toBe(STAND);
    expect(alle.filter((entry) => entry.fall.startsWith("paletten/"))).toHaveLength(
      PALETTEN.length,
    );
    for (const [fall] of ABLEITUNGEN) {
      expect(alle.some((entry) => entry.fall.startsWith(`ableitung/${fall}/`))).toBe(true);
    }
  });
});
