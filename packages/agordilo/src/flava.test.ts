// No guessing (Spec 016 G6, Abnahme 3): a light yellow lead colour cannot keep its tone at every
// step and still meet its contrast target. The Agordilo names each violation with its pair, its
// cause and exactly one suggestion. A fixed rule refuses the export; an adjustable rule refuses it
// until a Jugxo (reason, date, name) records the deviation, and the Jugxo travels in the package.

import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  type Derivation,
  deriveAspekto,
  loadCalibration,
  readAgordo,
  readStructure,
} from "./index.js";

function agordoOf(value: unknown): Agordo {
  const { agordo, issues } = readAgordo(value, "agordo.json");
  expect(issues).toEqual([]);
  if (agordo === undefined) throw new Error("the Agordo does not read");
  return agordo;
}

const FLAVA = { name: "flava", leitfarbe: "#F5C400" };

describe("a light yellow lead colour (G6)", () => {
  let derivation: Derivation;
  beforeAll(() => {
    derivation = deriveAspekto(agordoOf(FLAVA), readStructure(), loadCalibration());
  });

  it("reports at least one violation, each with its pair, its cause and one suggestion", () => {
    const { violations } = derivation.raporto;
    expect(violations.length).toBeGreaterThan(0);
    for (const violation of violations) {
      expect(violation.subject.length, violation.rule).toBeGreaterThan(0);
      expect(violation.cause.length, violation.rule).toBeGreaterThan(0);
      expect(typeof violation.suggestion, violation.rule).toBe("string");
      expect(violation.suggestion.length, violation.rule).toBeGreaterThan(0);
      expect(typeof violation.fixed, violation.rule).toBe("boolean");
    }
  });

  it("refuses the export without a Jugxo and writes nothing", () => {
    expect(derivation.exportable).toBe(false);
    expect(derivation.issues.length).toBeGreaterThan(0);
    for (const issue of derivation.issues) {
      expect(issue.path.length).toBeGreaterThan(0);
      expect(issue.suggestion.length).toBeGreaterThan(0);
    }
  });

  it("exports with a Jugxo for every adjustable rule exactly when no fixed rule is violated", () => {
    const adjustable = [
      ...new Set(derivation.raporto.violations.filter((v) => !v.fixed).map((v) => v.rule)),
    ];
    const fixed = derivation.raporto.violations.filter((violation) => violation.fixed);
    const withJugxoj = deriveAspekto(
      agordoOf({
        ...FLAVA,
        jugxoj: adjustable.map((regulo) => ({
          regulo,
          kialo: "The brand keeps its yellow; the deviation is recorded for the test.",
          date: "2026-10-18",
          name: "Test Maintainer",
        })),
      }),
      readStructure(),
      loadCalibration(),
    );
    expect(withJugxoj.exportable).toBe(fixed.length === 0);
    for (const violation of withJugxoj.raporto.violations.filter((v) => !v.fixed)) {
      expect(violation.jugxo, violation.rule).toMatch(/^jug_[a-z]+_[0-9A-Z]{26}$/);
    }
    if (adjustable.length > 0) {
      const jugxoj = JSON.parse(withJugxoj.files["jugxoj.json"] ?? "{}");
      expect(jugxoj.jugxoj).toHaveLength(adjustable.length);
      for (const jugxo of jugxoj.jugxoj) {
        expect(jugxo.decision).toBe("deviation-recorded");
        expect(jugxo.aspekto).toBe("flava");
        expect(jugxo.date).toBe("2026-10-18");
        expect(jugxo.context).toContain("Test Maintainer");
      }
    }
  });

  it("names a darker lead colour as its value, and that colour is free of violations", () => {
    const suggested = derivation.raporto.violations
      .map((violation) => /lead colour (#[0-9a-f]{6})/.exec(violation.suggestion)?.[1])
      .find((value) => value !== undefined);
    expect(suggested).toBeDefined();
    const followed = deriveAspekto(
      agordoOf({ ...FLAVA, leitfarbe: suggested }),
      readStructure(),
      loadCalibration(),
    );
    expect(followed.raporto.violations).toEqual([]);
    expect(followed.exportable).toBe(true);
  });

  it("never lets a Jugxo open a fixed rule", () => {
    const withFixed = deriveAspekto(
      agordoOf({
        ...FLAVA,
        jugxoj: [
          {
            regulo: "contrast-reserve",
            kialo: "A fixed rule cannot be deviated from.",
            date: "2026-10-18",
            name: "Test Maintainer",
          },
        ],
      }),
      readStructure(),
      loadCalibration(),
    );
    expect(withFixed.exportable).toBe(false);
    expect(withFixed.issues.map((issue) => issue.rule)).toContain("agordo-jugxo-fixed");
  });
});
