// Spec 036, Befund 2.2 (V-2, Teil 2 von 2): Weg C sets the Zweitfarbe when a page has two defining
// colours – here page A (weg-c.ts), whose screenshot shows its teal in logo and hero and the orange
// of its CSS in a large block below. The renderer is a double that returns the synthetic screenshot;
// no network, no model.

import { describe, expect, it } from "vitest";
import { Budget } from "../asistanto/ki.js";
import { KREILO } from "../kreilo/kreilo.js";
import { blanka, fetchA, LOGO_A, MARKO_URL, NEBEN, PRAEGEND } from "../test-doubles/weg-c.js";
import { bildschirmZweifarbig } from "../test-doubles/zweitfarbe.js";
import { loadBases } from "../vorschau.js";
import { esplori } from "./esploro.js";

const bases = loadBases();

/** A renderer double: page A as a screenshot with two defining colours, any other page white. */
const renderer = () => ({
  bildigi: async (page: { url: string }) =>
    page.url === MARKO_URL
      ? { bildo: bildschirmZweifarbig(), logoj: [LOGO_A] }
      : { bildo: blanka(), logoj: [] },
  malkodi: async () => {
    throw new Error("Weg C decodes no upload.");
  },
});

describe("Weg C sets the Zweitfarbe of a page with two defining colours (Spec 036, Befund 2.2)", () => {
  it("the teal leads, the orange becomes the Zweitfarbe, with the page as its origin", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: renderer(),
      budget: new Budget(1),
      bases,
    });
    const lead = result.proponoj.find((propono) => propono.faceto === "gvidkoloro");
    expect(lead?.agordo.leitfarbe).toBe(PRAEGEND);
    expect(lead?.agordo.zweitfarbe).toEqual({
      farbe: NEBEN,
      herkunft: {
        quelle: "link",
        adresse: MARKO_URL,
        merkmal: expect.stringContaining(NEBEN),
        anteil: expect.any(Number),
      },
    });
    expect(lead?.agordo.zweitfarbe?.herkunft?.anteil ?? 0).toBeGreaterThanOrEqual(
      KREILO.akzent.anteil_min,
    );
    expect(lead?.herkunft.map((entry) => entry.dosiero)).toContain(MARKO_URL);
  });
});
