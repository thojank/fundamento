// Spec 033 S3 (Weg A, Kreilo): a new brand from a few sentences. The entry questions – what the brand
// stands for and for whom, its character as pairs of opposites, what is already fixed, inspiration –
// become a proposal per Faceto through the sliders of the Agordilo. The character is data with a
// Kialo per pair (kreilo.json), like the wish vocabulary; a fixed colour or font wins, then the
// colours of the inspiration, then the colour the character gives.

import type { Agordo } from "@fundamento/agordilo";
import { deriveAspekto, parseAgordoColor, reglerOf, reglerValue } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { farbojOfPixels } from "../enportilo/farboj.js";
import { decodePng } from "../enportilo/png.js";
import { encodePng } from "../test-doubles/png.js";
import { loadBases } from "../vorschau.js";
import { KREILO, kreiloProponoj } from "./kreilo.js";

const bases = loadBases();
const start: Agordo = { name: "lumo", leitfarbe: "#2f6fdb" };
const value = (agordo: Agordo, path: string) => {
  const regler = reglerOf(bases.gestalt).find((entry) => entry.path === path);
  if (regler === undefined) throw new Error(path);
  return reglerValue(agordo, regler);
};

describe("the character as data (Spec 033 S3)", () => {
  it("names the five pairs of the spec in order, each with movements and a Kialo", () => {
    expect(KREILO.paroj.map((paro) => [paro.maldekstre, paro.dekstre])).toEqual([
      ["ruhig", "lebhaft"],
      ["klassisch", "modern"],
      ["warm", "kühl"],
      ["sachlich", "verspielt"],
      ["leicht", "kräftig"],
    ]);
    for (const paro of KREILO.paroj) {
      expect(paro.kialo.length, paro.nomo).toBeGreaterThan(40);
      expect(paro.bewegungen.length, paro.nomo).toBeGreaterThan(0);
    }
    for (const regulo of KREILO.tiparoj) expect(regulo.kialo.length).toBeGreaterThan(20);
  });
});

describe("a proposal per Faceto from the entry questions (Spec 033 S3)", () => {
  it("lively raises the saturation, calm lowers it; light and strong move the weight of the type", () => {
    const lively = kreiloProponoj({ karaktero: { "ruhig-lebhaft": 2 } }, start, bases).agordo;
    const calm = kreiloProponoj({ karaktero: { "ruhig-lebhaft": -2 } }, start, bases).agordo;
    expect(value(lively, "regler.saettigung")).toBeGreaterThan(value(calm, "regler.saettigung"));
    const strong = kreiloProponoj({ karaktero: { "leicht-kraeftig": 2 } }, start, bases).agordo;
    const light = kreiloProponoj({ karaktero: { "leicht-kraeftig": -2 } }, start, bases).agordo;
    expect(value(strong, "schrift.gewicht")).toBeGreaterThan(value(light, "schrift.gewicht"));
  });

  it("every value stays inside its slider's range, even at the ends of every pair", () => {
    const extreme = kreiloProponoj(
      {
        karaktero: {
          "ruhig-lebhaft": 2,
          "klassisch-modern": 2,
          "warm-kuehl": 2,
          "sachlich-verspielt": 2,
          "leicht-kraeftig": 2,
        },
      },
      start,
      bases,
    ).agordo;
    for (const regler of reglerOf(bases.gestalt)) {
      const current = reglerValue(extreme, regler);
      expect(current, regler.path).toBeGreaterThanOrEqual(regler.min);
      expect(current, regler.path).toBeLessThanOrEqual(regler.max);
    }
  });

  it("warm gives a warm lead colour, cool a cool one; lively a stronger chroma", () => {
    const hue = (agordo: Agordo) => parseAgordoColor(agordo.leitfarbe)?.h ?? -1;
    const warm = kreiloProponoj({ karaktero: { "warm-kuehl": -2 } }, start, bases).agordo;
    const cool = kreiloProponoj({ karaktero: { "warm-kuehl": 2 } }, start, bases).agordo;
    expect(hue(warm)).toBeLessThan(90);
    expect(hue(cool)).toBeGreaterThan(180);
    const chroma = (agordo: Agordo) => parseAgordoColor(agordo.leitfarbe)?.c ?? 0;
    expect(
      chroma(kreiloProponoj({ karaktero: { "ruhig-lebhaft": 2 } }, start, bases).agordo),
    ).toBeGreaterThan(
      chroma(kreiloProponoj({ karaktero: { "ruhig-lebhaft": -2 } }, start, bases).agordo),
    );
  });

  it("classic gives a serif for the headings, modern a sans; playful a round sans", () => {
    const family = (karaktero: Record<string, number>, rolo: "display" | "body") =>
      kreiloProponoj({ karaktero }, start, bases).agordo.schriften?.[rolo]?.family;
    expect(family({ "klassisch-modern": -2 }, "display")).toBe("Fraunces");
    expect(family({ "klassisch-modern": 2 }, "body")).toBe("Inter");
    expect(family({ "sachlich-verspielt": 2 }, "body")).toBe("Nunito");
  });

  it("a fixed colour and a fixed font win over the character", () => {
    const fixed = kreiloProponoj(
      {
        karaktero: { "warm-kuehl": 2, "klassisch-modern": -2 },
        festgelegt: { farbe: "#c2410c", schrift: "Manrope" },
      },
      start,
      bases,
    ).agordo;
    expect(fixed.leitfarbe).toBe("#c2410c");
    expect(fixed.schriften?.body?.family).toBe("Manrope");
    expect(fixed.schriften?.display?.family).toBe("Manrope");
  });

  it("without a fixed colour the strongest colour of the inspiration is the lead colour", () => {
    const result = kreiloProponoj(
      {
        karaktero: { "warm-kuehl": 2 },
        inspiro: [
          { kind: "farbo", valoro: "#f4f4f2", pezo: 70, herkunft: { dosiero: "wald.png" } },
          { kind: "farbo", valoro: "#2f6b3a", pezo: 20, herkunft: { dosiero: "wald.png" } },
        ],
      },
      start,
      bases,
    );
    expect(result.agordo.leitfarbe).toBe("#2f6b3a");
    expect(result.herkunft.gvidkoloro?.[0]?.dosiero).toBe("wald.png");
  });

  it("names for every touched Faceto where the value came from: the answer or the material", () => {
    const result = kreiloProponoj(
      { celo: "Eine Bäckerei für die Nachbarschaft", karaktero: { "ruhig-lebhaft": 1 } },
      start,
      bases,
    );
    expect(result.facetoj).toEqual(expect.arrayContaining(["gvidkoloro", "tiparo"]));
    expect(result.herkunft.gvidkoloro?.[0]).toEqual({
      dosiero: "Einstiegsfragen",
      loko: expect.stringContaining("lebhaft"),
    });
    expect(result.satz.length).toBeGreaterThan(20);
  });
});

// Spec 035, Befund 4.2: from a picture with orange-red and a strong turquoise only the orange came.
// The picture is synthetic (generated here with the test double of the PNG encoder, read through
// the Enportilo's own decoder and area measurement, as an upload of the entry questions would be).
describe("an accent from the inspiration (Spec 035, Befund 4.2)", () => {
  const ORANGE = [0xe4, 0x57, 0x2e, 255];
  const TUERKIS = [0x17, 0xb3, 0xa8, 255];
  const WEISS = [0xfa, 0xfa, 0xf8, 255];
  /** 20 × 20 px: 60 % orange-red, then `second` on the given rows, the rest white. */
  const picture = (second: number[], rows: number) =>
    farbojOfPixels(
      decodePng(encodePng(20, 20, (_x, y) => (y < 12 ? ORANGE : y < 12 + rows ? second : WEISS)))
        .rgba,
      "inspiration.png",
    );

  it("orange-red and a strong turquoise: the lead colour plus the turquoise as accent, with its origin", () => {
    const result = kreiloProponoj({ inspiro: picture(TUERKIS, 5) }, start, bases);
    expect(result.agordo.leitfarbe).toBe("#e4572e");
    expect(result.akzent?.farbe).toBe("#17b3a8");
    expect(result.akzent?.faceto).toBe("gvidkoloro");
    expect(result.akzent?.anteil).toBe(25);
    expect(result.akzent?.herkunft[0]).toEqual({
      dosiero: "inspiration.png",
      loko: "25,0 % der Fläche",
    });
    expect(result.akzent?.abstand).toBeGreaterThanOrEqual(KREILO.akzent.abstand_min);
    expect(result.akzent?.satz).toContain("#17b3a8");
    expect(result.akzent?.satz).toContain("25 %");
  });

  it("the accent is proposed, not set: the brand has one brand palette, and the check refuses a literal brand surface", () => {
    const result = kreiloProponoj({ inspiro: picture(TUERKIS, 5) }, start, bases);
    expect(result.akzent?.agordo).toEqual({});
    expect(result.agordo.festgelegt).toBeUndefined();
    expect(
      result.akzent?.satz.split(/[.!?](\s|$)/).filter((part) => part.trim() !== ""),
    ).toHaveLength(1);
    // Why it stays a proposal: as a value of the brand surface the check refuses it (fixed rule).
    const literal = deriveAspekto(
      {
        ...result.agordo,
        festgelegt: {
          "color.brand.fill": {
            wert: { colorSpace: "srgb", components: [0.0902, 0.702, 0.6588], hex: "#17b3a8" },
          },
        },
      },
      bases.structure,
      bases.calibration,
    );
    expect(
      literal.raporto.violations
        .filter((violation) => violation.fixed)
        .map((violation) => violation.rule),
    ).toContain("color-semantic-literal");
  });

  it("no accent from a shade of the lead colour, nor from a colour with too small a share", () => {
    const shade = kreiloProponoj({ inspiro: picture([0xb0, 0x3e, 0x1c, 255], 5) }, start, bases);
    expect(shade.akzent).toBeUndefined();
    const speck = kreiloProponoj({ inspiro: picture(TUERKIS, 1) }, start, bases);
    expect(speck.akzent).toBeUndefined();
  });
});
