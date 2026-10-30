// Spec 033 S3 (Weg A, Kreilo): a new brand from a few sentences. The entry questions – what the brand
// stands for and for whom, its character as pairs of opposites, what is already fixed, inspiration –
// become a proposal per Faceto through the sliders of the Agordilo. The character is data with a
// Kialo per pair (kreilo.json), like the wish vocabulary; a fixed colour or font wins, then the
// colours of the inspiration, then the colour the character gives.

import type { Agordo } from "@fundamento/agordilo";
import { parseAgordoColor, reglerOf, reglerValue } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
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
