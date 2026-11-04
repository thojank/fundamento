// Spec 036 Teil 4, Befund 4.1 (Dichte): the spacing, coarse – airy or compact from the space between
// the blocks of an image against their size, as a step of raum.abstand above or below the standard,
// with the blocks and gaps as provenance. Fewer blocks than make a spacing leave the step open. A
// link keeps the padding the recognition measures in its stylesheet, in the same structure; a PDF
// stays open with a sentence. Invented screenshots with known targets (test-doubles/uebernahme-bilder.ts).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, grundPdf, grundPng } from "../test-doubles/uebernahme.js";
import {
  bildPng,
  DICHTE_KOMPAKT,
  DICHTE_LUFTIG,
  FORM_KNOPF,
} from "../test-doubles/uebernahme-bilder.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";
import { readProponoj } from "./materialo.js";

interface Vorschlag {
  schritt: string;
  wert?: { dichte?: string; abstand?: number };
  offen?: true;
  satz: string;
  herkunft?: { quelle: string; datei?: string; adresse?: string; merkmal: string };
  agordo?: { raum?: { abstand?: number } };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  for (const name of ["luftig", "kompakt", "knoepfe", "ohne", "stufen", "pdfo"])
    await servilo.marko(name);
});
afterAll(async () => {
  await servilo.close();
});

async function dichteOf(
  name: string,
  material: { filename: string; bytes: Buffer } | { url: string },
): Promise<Vorschlag | undefined> {
  expect((await servilo.legi(name, material)).status).toBe(200);
  const body = (await (await fetch(`${servilo.url}/api/marko/${name}/uebernahme`)).json()) as {
    vorschlagoj: Vorschlag[];
  };
  return body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "dichte");
}

describe("Spec 036 Teil 4, Befund 4.1: density from the spacing of the material", () => {
  it("three blocks far apart: airy, more space than the standard, blocks and gaps as provenance", async () => {
    const dichte = await dichteOf("luftig", {
      filename: "dichte-luftig.png",
      bytes: bildPng(DICHTE_LUFTIG),
    });
    expect(dichte?.offen).toBeUndefined();
    expect(dichte?.wert?.dichte).toBe("luftig");
    expect(dichte?.wert?.abstand).toBeGreaterThan(1);
    expect(dichte?.agordo?.raum?.abstand).toBe(dichte?.wert?.abstand);
    expect(dichte?.herkunft).toMatchObject({ quelle: "bild", datei: "dichte-luftig.png" });
    expect(dichte?.herkunft?.merkmal).toMatch(/Abstand 30 px zwischen 3 Blöcken von 16 px/);
    const propono = readProponoj(servilo.workdir, "luftig").find(
      (entry) => entry.faceto === "spaco",
    );
    expect(propono?.agordo.raum?.abstand).toBe(dichte?.wert?.abstand);
  });

  it("five blocks close together: compact, less space than the standard", async () => {
    const dichte = await dichteOf("kompakt", {
      filename: "dichte-kompakt.png",
      bytes: bildPng(DICHTE_KOMPAKT),
    });
    expect(dichte?.wert?.dichte).toBe("kompakt");
    expect(dichte?.wert?.abstand).toBeLessThan(1);
    expect(dichte?.herkunft?.merkmal).toMatch(/Abstand 4 px zwischen 5 Blöcken von 20 px/);
  });

  it("too few blocks for a spacing: open with a sentence that says so", async () => {
    for (const [name, material] of [
      ["knoepfe", { filename: "form-knopf.png", bytes: bildPng(FORM_KNOPF) }],
      ["ohne", { filename: "grund-hell.png", bytes: grundPng(GRUND_HELL) }],
    ] as const) {
      const dichte = await dichteOf(name, material);
      expect(dichte?.offen, name).toBe(true);
      expect(dichte?.satz, name).toMatch(/Blöcke/);
    }
  });

  it("a link gives the same structure from the padding of its stylesheet; a PDF names why it is open", async () => {
    const link = await dichteOf("stufen", { url: servilo.stufen });
    expect(Object.keys(link?.wert ?? {}).sort()).toEqual(["abstand", "dichte"]);
    expect(link?.herkunft?.quelle).toBe("link");
    expect(link?.herkunft?.adresse).toContain("stufen.css");
    expect(link?.herkunft?.merkmal).toMatch(/Zeile \d+/);
    const pdf = await dichteOf("pdfo", { filename: "sablo.pdf", bytes: grundPdf("Inter-Regular") });
    expect(pdf?.offen).toBe(true);
    expect(pdf?.satz).toMatch(/PDF/);
  });
});
