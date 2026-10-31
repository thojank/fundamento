// Spec 036 Teil 4, Befund 4.1 (Elevation): shadow edges yes or no. In an image a soft band under a
// card says yes, a card without it says no – the shadow of the Form on or off, with the card as
// provenance; buttons alone or no shape at all leave the step open. A link names the line of its
// stylesheet that draws a shadow; a page without one, and a PDF, stay open with a sentence.
// Invented screenshots with known targets (test-doubles/uebernahme-bilder.ts).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, grundPdf, grundPng } from "../test-doubles/uebernahme.js";
import {
  bildPng,
  ELEVATION_FLACH,
  ELEVATION_SCHATTEN,
  FORM_KNOPF,
} from "../test-doubles/uebernahme-bilder.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";
import { readProponoj } from "./materialo.js";

interface Vorschlag {
  schritt: string;
  wert?: { schatten?: boolean };
  offen?: true;
  satz: string;
  herkunft?: { quelle: string; datei?: string; adresse?: string; merkmal: string };
  agordo?: { form?: { schatten?: number } };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  for (const name of ["schatten", "flach", "ohne", "knoepfe", "stufen", "seite", "pdfo"])
    await servilo.marko(name);
});
afterAll(async () => {
  await servilo.close();
});

async function elevationOf(
  name: string,
  material: { filename: string; bytes: Buffer } | { url: string },
): Promise<Vorschlag | undefined> {
  expect((await servilo.legi(name, material)).status).toBe(200);
  const body = (await (await fetch(`${servilo.url}/api/marko/${name}/uebernahme`)).json()) as {
    vorschlagoj: Vorschlag[];
  };
  return body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "elevation");
}

describe("Spec 036 Teil 4, Befund 4.1: elevation from the shadow edges of the material", () => {
  it("a card with a soft band under it: shadow yes, the card's shadow edge as provenance", async () => {
    const elevation = await elevationOf("schatten", {
      filename: "elevation-schatten.png",
      bytes: bildPng(ELEVATION_SCHATTEN),
    });
    expect(elevation?.offen).toBeUndefined();
    expect(elevation?.wert).toEqual({ schatten: true });
    expect(elevation?.agordo?.form?.schatten).toBe(1);
    expect(elevation?.herkunft).toMatchObject({ quelle: "bild", datei: "elevation-schatten.png" });
    expect(elevation?.herkunft?.merkmal).toMatch(/Schattenkante unter der Karte/);
    const propono = readProponoj(servilo.workdir, "schatten").find(
      (entry) => entry.faceto === "elevacio",
    );
    expect(propono?.agordo.form?.schatten).toBe(1);
  });

  it("the same card without the band: shadow no, the Form without shadow", async () => {
    const elevation = await elevationOf("flach", {
      filename: "elevation-flach.png",
      bytes: bildPng(ELEVATION_FLACH),
    });
    expect(elevation?.wert).toEqual({ schatten: false });
    expect(elevation?.agordo?.form?.schatten).toBe(0);
    expect(elevation?.herkunft?.merkmal).toMatch(/ohne Schattenkante/);
  });

  it("no card and no button: open, the sentence says there is nothing a shadow could sit on", async () => {
    const elevation = await elevationOf("ohne", {
      filename: "grund-hell.png",
      bytes: grundPng(GRUND_HELL),
    });
    expect(elevation?.offen).toBe(true);
    expect(elevation?.satz).toMatch(/keine Karte/);
  });

  it("buttons without a shadow alone do not tell: open with a sentence", async () => {
    const elevation = await elevationOf("knoepfe", {
      filename: "form-knopf.png",
      bytes: bildPng(FORM_KNOPF),
    });
    expect(elevation?.offen).toBe(true);
    expect(elevation?.satz).toMatch(/Knöpfe/);
  });

  it("a link names the line with the shadow; without one, and from a PDF, it is open with a sentence", async () => {
    const link = await elevationOf("stufen", { url: servilo.stufen });
    expect(link?.wert).toEqual({ schatten: true });
    expect(link?.herkunft?.quelle).toBe("link");
    expect(link?.herkunft?.adresse).toContain("stufen.css");
    expect(link?.herkunft?.merkmal).toMatch(/Schatten \(Zeile \d+\)/);
    const ohne = await elevationOf("seite", { url: servilo.seite });
    expect(ohne?.offen).toBe(true);
    expect(ohne?.satz).toMatch(/Stilvorlage/);
    const pdf = await elevationOf("pdfo", {
      filename: "sablo.pdf",
      bytes: grundPdf("Inter-Regular"),
    });
    expect(pdf?.offen).toBe(true);
    expect(pdf?.satz).toMatch(/PDF/);
  });
});
