// Spec 036 Teil 4, Befunde 4.1 (teilweise) and 4.2, AC-13: a material – an image, a PDF, a link –
// becomes one proposal per step of the brand, each a value with its provenance or open with a
// sentence; no value without provenance, no step silently missing. The proposals reach the store of
// the `propono` route and the Kroniko with their provenance, and the screen of a step names what is
// open. Through the local server, with invented material (test-doubles/uebernahme.ts).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "../asistanto/kroniko.js";
import { GRUND_HELL, grundPdf, grundPng } from "../test-doubles/uebernahme.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";

/** The steps of the take-over in their order (implementation spec 2.6, D-03). */
const SCHRITTE = [
  "leitfarbe",
  "zweitfarbe",
  "neutraltoene",
  "schrift",
  "form",
  "elevation",
  "dichte",
];

interface Vorschlag {
  schritt: string;
  wert?: unknown;
  offen?: true;
  satz: string;
  herkunft?: {
    quelle: string;
    datei?: string;
    adresse?: string;
    merkmal: string;
    anteil?: number;
  };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  for (const name of ["bildo", "pdfo", "ligilo"]) await servilo.marko(name);
});
afterAll(async () => {
  await servilo.close();
});

async function vorschlagojOf(name: string): Promise<Vorschlag[]> {
  const response = await fetch(`${servilo.url}/api/marko/${name}/uebernahme`);
  expect(response.status).toBe(200);
  return ((await response.json()) as { vorschlagoj: Vorschlag[] }).vorschlagoj;
}

/** The invariant of 2.6, step by step: a value with a complete provenance, or open with a sentence. */
function expectInvariant(vorschlagoj: readonly Vorschlag[], quelle: string, wo: string): void {
  expect(vorschlagoj.map((vorschlag) => vorschlag.schritt)).toEqual(SCHRITTE);
  for (const vorschlag of vorschlagoj) {
    if ("wert" in vorschlag) {
      expect(vorschlag.herkunft, vorschlag.schritt).toBeDefined();
      expect(vorschlag.herkunft?.quelle, vorschlag.schritt).toBe(quelle);
      expect(vorschlag.herkunft?.merkmal.trim(), vorschlag.schritt).not.toBe("");
      expect(vorschlag.herkunft?.datei ?? vorschlag.herkunft?.adresse, vorschlag.schritt).toContain(
        wo,
      );
      expect(vorschlag.offen, vorschlag.schritt).toBeUndefined();
    } else {
      expect(vorschlag.offen, vorschlag.schritt).toBe(true);
      expect(vorschlag.satz.trim(), vorschlag.schritt).not.toBe("");
    }
  }
}

describe("Spec 036 Teil 4: a proposal per step with provenance (AC-13)", () => {
  it("an image: every step once, every value with its provenance in the image, the rest open with a sentence", async () => {
    const read = await servilo.legi("bildo", {
      filename: "grund-hell.png",
      bytes: grundPng(GRUND_HELL),
    });
    expect(read.status).toBe(200);
    const vorschlagoj = await vorschlagojOf("bildo");
    expectInvariant(vorschlagoj, "bild", "grund-hell.png");
    const leitfarbe = vorschlagoj.find((vorschlag) => vorschlag.schritt === "leitfarbe");
    expect(leitfarbe?.wert).toBe(GRUND_HELL.leitfarbe);
    expect(leitfarbe?.herkunft?.anteil).toBe(10);
  });

  it("an image names what it cannot show as open: no font, no radius, no shadow, no spacing, no second colour", async () => {
    const vorschlagoj = await vorschlagojOf("bildo");
    const offen = vorschlagoj.filter((vorschlag) => vorschlag.offen === true);
    expect(offen.map((vorschlag) => vorschlag.schritt)).toEqual(
      expect.arrayContaining(["zweitfarbe", "schrift", "form", "elevation", "dichte"]),
    );
  });

  it("a PDF and a link give the same structure, with the PDF's file and the stylesheet's address", async () => {
    expect(
      (await servilo.legi("pdfo", { filename: "sablo.pdf", bytes: grundPdf("Inter-Regular") }))
        .status,
    ).toBe(200);
    expectInvariant(await vorschlagojOf("pdfo"), "pdf", "sablo.pdf");
    expect((await servilo.legi("ligilo", { url: servilo.seite })).status).toBe(200);
    expectInvariant(await vorschlagojOf("ligilo"), "link", servilo.seite);
  });

  it("every proposal of the reading in the Kroniko carries the proposals per step with their provenance", async () => {
    for (const name of ["bildo", "pdfo", "ligilo"]) {
      const proposals = readKroniko(servilo.workdir, name).filter(
        (entry) => entry.ago === "propono",
      );
      expect(proposals.length, name).toBeGreaterThan(0);
      const perStep = proposals.flatMap(
        (entry) => (entry.detaloj as { vorschlagoj?: Vorschlag[] } | undefined)?.vorschlagoj ?? [],
      );
      expect(perStep.length, name).toBeGreaterThan(0);
      for (const vorschlag of perStep) expect(vorschlag.herkunft?.merkmal, name).toBeTruthy();
    }
  });

  it("the screen of a step names its open steps with their sentence (4.2)", async () => {
    const vorschlagoj = await vorschlagojOf("bildo");
    const schrift = vorschlagoj.find((vorschlag) => vorschlag.schritt === "schrift");
    const html = await (await fetch(`${servilo.url}/asistanto/bildo/tiparo`)).text();
    expect(html).toContain("data-mt-offen");
    expect(html).toContain(schrift?.satz ?? "–");
  });
});
