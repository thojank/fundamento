// Spec 036, Befund 2.1 (V-1): a brand may be achromatic. Weg B (a screenshot) and Weg C (a page)
// detect it by the chroma of the candidates and propose a black or very dark neutral lead colour
// instead of a colourful side colour; the sentence says „unbunt“ and names the colourful tones it
// did not take, so nothing falls back silently to a colour. The thresholds are data in
// kreilo.json, next to `akzent`, with a Kialo. Synthetic material only (test-doubles/unbunt/).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ACHROMATIC, parseAgordoColor } from "@fundamento/agordilo";
import { afterAll, describe, expect, it } from "vitest";
import { Budget } from "../asistanto/ki.js";
import { esplori } from "../esploro/esploro.js";
import { KREILO } from "../kreilo/kreilo.js";
import {
  bildschirmInko,
  fetchInko,
  INKO_URL,
  LOGO_INKO,
  PASTELOJ,
  unbuntFixture,
} from "../test-doubles/unbunt.js";
import { blanka } from "../test-doubles/weg-c.js";
import { loadBases } from "../vorschau.js";
import { legiMaterialon } from "./materialo.js";
import { type Propono, proponojOf } from "./rekono.js";

const bases = loadBases();
const workdir = mkdtempSync(join(tmpdir(), "fm-unbunt-036-"));
afterAll(() => rmSync(workdir, { recursive: true, force: true }));

/** The renderer double: the page of Inko as its synthetic screenshot with the logo. */
const renderer = () => ({
  bildigi: async (page: { url: string }) =>
    page.url === INKO_URL
      ? { bildo: bildschirmInko(), logoj: [LOGO_INKO] }
      : { bildo: blanka(), logoj: [] },
  malkodi: async () => {
    throw new Error("Weg C decodes no upload.");
  },
});

/** The lead colour proposal: a black or very dark neutral, said to be achromatic, with its origin. */
function expectAchromaticLead(proponoj: readonly Propono[], dosiero: string) {
  const lead = proponoj.find((propono) => propono.faceto === "gvidkoloro");
  const leitfarbe = lead?.agordo.leitfarbe ?? "";
  const oklch = parseAgordoColor(leitfarbe);
  expect(leitfarbe, "not a pastel accent").not.toMatch(new RegExp(PASTELOJ.join("|")));
  expect(oklch?.c ?? 1, `${leitfarbe} is achromatic`).toBeLessThan(ACHROMATIC);
  expect(oklch?.l ?? 1, `${leitfarbe} is very dark`).toBeLessThanOrEqual(KREILO.unbunt.dunkel_bis);
  expect(lead?.satz).toContain("unbunt");
  // No silent fallback: the colourful tones found are named, and that they are not the lead.
  for (const pastel of PASTELOJ) expect(lead?.satz).toContain(pastel);
  expect(lead?.herkunft.map((entry) => entry.dosiero)).toContain(dosiero);
}

describe("an achromatic brand (Spec 036, Befund 2.1, V-1)", () => {
  it("keeps its thresholds as data in kreilo.json next to akzent, named, with a Kialo", () => {
    const { unbunt } = KREILO;
    for (const value of [
      unbunt.neutral_bis,
      unbunt.dunkel_bis,
      unbunt.dunkel_anteil_min,
      unbunt.bunt_ab,
      unbunt.pastell_ab,
      unbunt.bunt_anteil_max,
    ])
      expect(typeof value).toBe("number");
    expect(unbunt.kialo.length).toBeGreaterThan(80);
    // A proposed lead colour must be achromatic as the Agordilo reads it (palettes.ts).
    expect(unbunt.neutral_bis).toBe(ACHROMATIC);
  });

  it("Weg B: the screenshot of Inko gives a very dark neutral lead colour, not a pastel", async () => {
    const material = await legiMaterialon(
      { filename: "bild.png", bytes: unbuntFixture("bild.png") },
      { workdir, name: "inko", familyOf: (filename) => filename },
    );
    expectAchromaticLead(proponojOf(material.trovoj, bases), "bild.png");
  });

  it("Weg C: the rendered page of Inko gives a very dark neutral lead colour, not a pastel", async () => {
    const result = await esplori({
      nomo: "Inko",
      url: INKO_URL,
      pageFetch: fetchInko,
      bildilo: renderer(),
      budget: new Budget(1),
      bases,
    });
    expect(result.seitoj).toEqual([INKO_URL]);
    expect(result.proponoj[0]?.faceto).toBe("gvidkoloro");
    expectAchromaticLead(result.proponoj, INKO_URL);
  });
});
