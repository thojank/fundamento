// Spec 036 Teil 4, Befund 4.1 (Neutraltöne): the tint and the light or dark ground come from the
// ground and the surface of the material, with the area and its share as provenance. Invented
// screenshots with known targets (test-doubles/uebernahme.ts): a warm light ground and a cool dark
// ground, each 70 % ground and 20 % surface; the same shares as fills of a PDF and as declarations of
// a stylesheet. A material without a calm area leaves the step open.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { encodePng } from "../test-doubles/png.js";
import {
  GRUND_DUNKEL,
  GRUND_HELL,
  type Grund,
  grundPdf,
  grundPng,
} from "../test-doubles/uebernahme.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";

interface Herkunft {
  quelle: string;
  datei?: string;
  adresse?: string;
  merkmal: string;
  anteil?: number;
}
interface Vorschlag {
  schritt: string;
  wert?: { grund?: string; getoent?: boolean; farbton?: number; toenung?: number };
  offen?: true;
  satz: string;
  herkunft?: Herkunft;
  weitere?: Herkunft[];
  sicherheit?: string;
  agordo?: { neutral?: { toenung?: number } };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  for (const name of ["hela", "malhela", "pdfo", "ligilo", "bunta"]) await servilo.marko(name);
});
afterAll(async () => {
  await servilo.close();
});

async function neutraltoeneOf(
  name: string,
  material: { filename: string; bytes: Buffer } | { url: string },
): Promise<Vorschlag | undefined> {
  expect((await servilo.legi(name, material)).status).toBe(200);
  const body = (await (await fetch(`${servilo.url}/api/marko/${name}/uebernahme`)).json()) as {
    vorschlagoj: Vorschlag[];
  };
  return body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "neutraltoene");
}

function expectGround(vorschlag: Vorschlag | undefined, grund: Grund): void {
  expect(vorschlag?.offen).toBeUndefined();
  expect(vorschlag?.wert?.grund).toBe(grund.ziel.grund);
  expect(vorschlag?.wert?.getoent).toBe(true);
  expect(vorschlag?.satz).toContain(`${grund.ziel.farbton} getönt`);
  expect(vorschlag?.herkunft?.merkmal).toBe(`Grundfläche ${grund.grund}`);
  expect(vorschlag?.weitere?.[0]?.merkmal).toBe(`Fläche ${grund.flaeche}`);
  expect(vorschlag?.agordo?.neutral?.toenung).toBeGreaterThan(0);
}

describe("Spec 036 Teil 4: Neutraltöne from the ground and the surface (4.1)", () => {
  it("a warm light ground: light, warm tint, the ground and the surface with their shares", async () => {
    const vorschlag = await neutraltoeneOf("hela", {
      filename: "grund-hell.png",
      bytes: grundPng(GRUND_HELL),
    });
    expectGround(vorschlag, GRUND_HELL);
    expect(vorschlag?.herkunft).toMatchObject({
      quelle: "bild",
      datei: "grund-hell.png",
      anteil: GRUND_HELL.ziel.grundAnteil,
    });
    expect(vorschlag?.weitere?.[0]?.anteil).toBe(GRUND_HELL.ziel.flaecheAnteil);
    expect(vorschlag?.sicherheit).toBe("hoch");
  });

  it("a cool dark ground: dark, cool tint, and the sentence names the dark mode", async () => {
    const vorschlag = await neutraltoeneOf("malhela", {
      filename: "grund-dunkel.png",
      bytes: grundPng(GRUND_DUNKEL),
    });
    expectGround(vorschlag, GRUND_DUNKEL);
    expect(vorschlag?.herkunft?.anteil).toBe(GRUND_DUNKEL.ziel.grundAnteil);
    expect(vorschlag?.satz).toContain("Dunkelmodus");
  });

  it("a PDF and a link: the same ground from the fills and from the declarations", async () => {
    const pdf = await neutraltoeneOf("pdfo", {
      filename: "sablo.pdf",
      bytes: grundPdf("Inter-Regular"),
    });
    expectGround(pdf, GRUND_HELL);
    expect(pdf?.herkunft).toMatchObject({ quelle: "pdf", datei: "sablo.pdf", anteil: 70 });
    const link = await neutraltoeneOf("ligilo", { url: servilo.seite });
    expectGround(link, GRUND_HELL);
    expect(link?.herkunft?.quelle).toBe("link");
    expect(link?.herkunft?.adresse).toBe(`${servilo.seite}stilo.css`);
  });

  it("the step shows the proposal with the ground as its provenance", async () => {
    const html = await (await fetch(`${servilo.url}/asistanto/hela/neutralaj`)).text();
    expect(html).toContain("data-mt-propono");
    expect(html).toContain(`Grundfläche ${GRUND_HELL.grund}, ${GRUND_HELL.ziel.grundAnteil} %`);
  });
  it("a material without a calm area leaves the neutrals open, with a sentence", async () => {
    const bunt = encodePng(30, 30, (x) =>
      x < 10 ? [0xc2, 0x25, 0x5c, 255] : x < 20 ? [0x25, 0x63, 0xeb, 255] : [0x16, 0xa3, 0x4a, 255],
    );
    const vorschlag = await neutraltoeneOf("bunta", { filename: "bunt.png", bytes: bunt });
    expect(vorschlag?.offen).toBe(true);
    expect(vorschlag?.satz).toContain("Neutraltöne bleiben offen");
  });
});
