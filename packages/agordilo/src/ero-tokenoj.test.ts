// Constitution v2.3 (Spec 024 Runde 2): a brand assigns an Ero-Token with another alias or a value
// of its own (`festgelegt`), the derivation writes it into the main set, and the fixed rules hold
// on the third level: a cell whose text or fill departs from its role is measured for contrast.
// The case of a typography role (Großbuchstaben) is set the same way (`schreibweise`).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type Agordo, deriveAspekto, loadCalibration, readAgordo, readStructure } from "./index.js";

const provo = JSON.parse(
  readFileSync(
    new URL("../../modelo/test/fixtures/valid/aspekto-provo/agordo.json", import.meta.url),
    "utf8",
  ),
) as Agordo;

type Json = Record<string, unknown>;
const nodeOf = (set: Json, name: string): Json | undefined =>
  name.split(".").reduce<unknown>((node, key) => (node as Json | undefined)?.[key], set) as
    | Json
    | undefined;

const FILL = "ero.butono.surface.fill.emphasis.high.intent.neutral.rest";
const structure = readStructure();
const calibration = loadCalibration();

describe("festgelegt on the third level (Art. IV: an alias is an assignment)", () => {
  it("reads an alias on an Ero-Token and a case of a typography role", () => {
    const { agordo, issues } = readAgordo({
      name: "provo",
      leitfarbe: "#6b4fa0",
      festgelegt: {
        [FILL]: { alias: "color.palette.accent.900" },
        "typography.label.1": { schreibweise: "uppercase" },
      },
    });
    expect(issues).toEqual([]);
    expect(agordo?.festgelegt?.[FILL]?.alias).toBe("color.palette.accent.900");
    expect(agordo?.festgelegt?.["typography.label.1"]?.schreibweise).toBe("uppercase");
  });

  it("refuses a case that is none of the four", () => {
    const { issues } = readAgordo({
      name: "provo",
      leitfarbe: "#6b4fa0",
      festgelegt: { "typography.label.1": { schreibweise: "shouting" } },
    });
    expect(issues.map((issue) => issue.rule)).toContain("schema-violation");
  });

  it("writes the alias into the main set (and the dark one into the dark set); every other cell stays", () => {
    // The label of a primary action is light in light mode and dark in dark mode: a fill set for
    // both schemes names a step per scheme, as a role does.
    const agordo: Agordo = {
      ...provo,
      festgelegt: {
        [FILL]: {
          alias: "color.palette.accent.900",
          modoj: { "color-scheme=dark": { alias: "color.palette.accent.100" } },
        },
      },
    };
    const derivation = deriveAspekto(agordo, structure, calibration);
    const set = JSON.parse(derivation.files["sets/aspekto/provo.json"] ?? "{}") as Json;
    expect(nodeOf(set, FILL)?.$value).toBe("{color.palette.accent.900}");
    expect(nodeOf(set, "ero.butono.surface.fill.emphasis.high.intent.neutral.hover")?.$value).toBe(
      "{color.action.primary.hover}",
    );
    const dark = JSON.parse(
      derivation.files["sets/aspekto/provo+color-scheme/dark.json"] ?? "{}",
    ) as Json;
    expect(nodeOf(dark, FILL)?.$value).toBe("{color.palette.accent.100}");
    expect(derivation.issues).toEqual([]);
    expect(derivation.exportable).toBe(true);
  });

  it("holds the fixed contrast rule on the third level: a fill that fails against the label is refused", () => {
    const agordo: Agordo = {
      ...provo,
      festgelegt: { [FILL]: { alias: "color.palette.accent.100" } },
    };
    const derivation = deriveAspekto(agordo, structure, calibration);
    expect(derivation.exportable).toBe(false);
    const violation = derivation.raporto.violations.find(
      (entry) => entry.rule === "contrast-below-threshold" && entry.subject.includes("ero.butono"),
    );
    expect(violation?.fixed).toBe(true);
    expect(violation?.subject).toContain(
      "ero.butono.label.color.emphasis.high.intent.neutral.rest",
    );
  });

  it("writes the case of a typography role as its text transformation, and the Ero-Tokens follow", () => {
    const agordo: Agordo = {
      ...provo,
      festgelegt: { "typography.label.1": { schreibweise: "uppercase" } },
    };
    const derivation = deriveAspekto(agordo, structure, calibration);
    const set = JSON.parse(derivation.files["sets/aspekto/provo.json"] ?? "{}") as Json;
    const node = nodeOf(set, "typography.label.1");
    expect((node?.$extensions as Json | undefined)?.["com.ciferecigo.fundamento"]).toEqual({
      textTransform: "uppercase",
    });
    expect(derivation.exportable).toBe(true);
    expect(derivation.issues).toEqual([]);
  });

  it("the same Agordo gives the same bytes", () => {
    const agordo: Agordo = {
      ...provo,
      festgelegt: {
        [FILL]: {
          alias: "color.palette.accent.900",
          modoj: { "color-scheme=dark": { alias: "color.palette.accent.100" } },
        },
      },
    };
    const first = deriveAspekto(agordo, structure, calibration).files;
    const second = deriveAspekto(agordo, structure, calibration).files;
    expect(second).toEqual(first);
  });
});
