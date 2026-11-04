// Spec 036 Teil 4, Befund 4.1 (Schrift) and edge case „Schrift nicht erkannt“: a font of the
// material is recognised (in the catalogue, or a font file of the brand), else a similar webfont of
// the catalogue is proposed with the reason, else the step stays open and names the font found –
// never a font without provenance. Invented PDFs with known embedded fonts (test-doubles).

import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, grundPdf, grundPng } from "../test-doubles/uebernahme.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";

interface Wahl {
  familie: string;
  art: string;
  gefunden: string;
}
interface Vorschlag {
  schritt: string;
  wert?: { body?: Wahl };
  offen?: true;
  satz: string;
  sicherheit?: string;
  herkunft?: { quelle: string; datei?: string; merkmal: string };
  agordo?: { schriften?: { body?: { family: string; license: string } } };
}

const data = (file: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8")) as {
    uebernahme: { schrift: { ersatz: Record<string, string> } };
    tiparoj: { family: string; license: string }[];
  };
const ERSATZ = data("kreilo.json").uebernahme.schrift.ersatz;
const KATALOG = data("tiparoj.json").tiparoj;

let servilo: UebernahmeServilo;
let next = 0;

beforeAll(async () => {
  servilo = await startUebernahme();
});
afterAll(async () => {
  await servilo.close();
});

async function schriftOf(material: { filename: string; bytes: Buffer }): Promise<Vorschlag> {
  next += 1;
  const name = `skribo-${next}`;
  await servilo.marko(name);
  expect((await servilo.legi(name, material)).status).toBe(200);
  const body = (await (await fetch(`${servilo.url}/api/marko/${name}/uebernahme`)).json()) as {
    vorschlagoj: Vorschlag[];
  };
  const schrift = body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "schrift");
  expect(schrift).toBeDefined();
  return schrift as Vorschlag;
}

const pdf = (font: string) => ({ filename: "sablo.pdf", bytes: grundPdf(font) });

describe("Spec 036 Teil 4: Schrift erkannt, ähnlich oder offen (4.1)", () => {
  it("an embedded font of the catalogue is recognised, with the PDF and the font as provenance", async () => {
    const schrift = await schriftOf(pdf("Inter-Regular"));
    expect(schrift.wert?.body).toEqual({ familie: "Inter", art: "erkannt", gefunden: "Inter" });
    expect(schrift.sicherheit).toBe("hoch");
    expect(schrift.herkunft).toMatchObject({ quelle: "pdf", datei: "sablo.pdf" });
    expect(schrift.herkunft?.merkmal).toContain("„Inter“");
    expect(schrift.agordo?.schriften?.body?.family).toBe("Inter");
  });

  it("a font outside the catalogue whose name tells its kind: a similar webfont, with the reason", async () => {
    const schrift = await schriftOf(pdf("HelveticaNeue-Bold"));
    const ersatz = ERSATZ["sans-serif"];
    expect(schrift.wert?.body).toMatchObject({ familie: ersatz, art: "aehnlich" });
    expect(schrift.herkunft?.merkmal).toContain("Helvetica Neue");
    expect(schrift.herkunft?.merkmal).toContain("serifenlos");
    expect(schrift.satz).toContain(`ähnlich: ${ersatz}`);
    expect(KATALOG.find((tiparo) => tiparo.family === ersatz)?.license).toBe(
      schrift.agordo?.schriften?.body?.license,
    );
  });

  it("a font outside the catalogue sharing a part of its name with a family of the catalogue", async () => {
    const schrift = await schriftOf(pdf("Garamond"));
    const familie = schrift.wert?.body?.familie ?? "";
    expect(familie).toMatch(/Garamond/);
    expect(KATALOG.some((tiparo) => tiparo.family === familie)).toBe(true);
    expect(schrift.wert?.body?.art).toBe("aehnlich");
    expect(schrift.herkunft?.merkmal).toContain("Namensteil „Garamond“");
  });

  it("a font whose name tells nothing stays open, and the sentence names it", async () => {
    const schrift = await schriftOf(pdf("Xyzzq"));
    expect(schrift.offen).toBe(true);
    expect(schrift.satz).toContain("„Xyzzq“");
  });

  it("an image shows no font: open, and the sentence says what would help", async () => {
    const schrift = await schriftOf({ filename: "grund-hell.png", bytes: grundPng(GRUND_HELL) });
    expect(schrift.offen).toBe(true);
    expect(schrift.satz).toContain("Schriftdatei");
  });

  it("a font file of the brand outside the catalogue is recognised as its licensed font", async () => {
    const schrift = await schriftOf({
      filename: "Hausschrift-Regular.woff2",
      bytes: Buffer.from("wOF2fake"),
    });
    expect(schrift.wert?.body?.familie).toContain("Hausschrift");
    expect(schrift.wert?.body?.art).toBe("erkannt");
    expect(schrift.herkunft).toMatchObject({ quelle: "schriftdatei" });
    expect(schrift.agordo?.schriften?.body?.license).toBe("proprietary");
  });
});
