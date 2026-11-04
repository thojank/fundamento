// Spec 036, Befund 2.3: in Weg C a large picture of the first screen counts with its own weight –
// photos are not background. The defining colour of the invented brand „Ruvelo“ stands only in a
// large product photo of the first screen; the background of the page is another colour and fills
// three screens. With the weights of Spec 035 (D-73: logo 4, first screen 2, below 1) the
// background wins; with its own class „großes Bild im ersten Bildschirm“ the photo does. The
// weights and what counts as large are data in kreilo.json, with a Kialo. Offline: the renderer is
// a double that returns the synthetic screenshot and the box of the photo, as Chromium gives them
// (the real Chromium renders the same pages in packages/eroj/test/weg-c-bildgewicht-036.spec.ts).

import { describe, expect, it } from "vitest";
import { Budget } from "../asistanto/ki.js";
import { VIDO } from "../enportilo/bildilo.js";
import { grandaBildoOf, pezojOfEkrano } from "../enportilo/farboj.js";
import { KREILO } from "../kreilo/kreilo.js";
import {
  bildschirmFoto,
  FOTO_KESTO,
  FOTO_URL,
  fetchFoto,
  HINTERGRUND,
  LOGO_FOTO,
  PRODUKT,
} from "../test-doubles/foto.js";
import { blanka } from "../test-doubles/weg-c.js";
import { loadBases } from "../vorschau.js";
import { esplori } from "./esploro.js";

const bases = loadBases();

/** The renderer double: the page of Ruvelo with the boxes of its logo and of its photo. */
const renderer = (bildoj: readonly (typeof FOTO_KESTO)[]) => ({
  bildigi: async (page: { url: string }) =>
    page.url === FOTO_URL
      ? { bildo: bildschirmFoto(), logoj: [LOGO_FOTO], bildoj: [...bildoj] }
      : { bildo: blanka(), logoj: [], bildoj: [] },
  malkodi: async () => {
    throw new Error("Weg C decodes no upload.");
  },
});

const leadOf = async (bildoj: readonly (typeof FOTO_KESTO)[]) => {
  const result = await esplori({
    nomo: "Ruvelo",
    url: FOTO_URL,
    pageFetch: fetchFoto,
    bildilo: renderer(bildoj),
    budget: new Budget(1),
    bases,
  });
  return result.proponoj.find((propono) => propono.faceto === "gvidkoloro");
};

describe("the picture weight of Weg C (Spec 036, Befund 2.3)", () => {
  it("keeps the weights as data in kreilo.json: logo, first screen, below, a large picture and what is large, with a Kialo", () => {
    const pezoj = KREILO.weg_c;
    expect(pezoj).toMatchObject({ logo: 4, erster_bildschirm: 2, darunter: 1 });
    expect(Number.isInteger(pezoj.grosses_bild)).toBe(true);
    expect(pezoj.grosses_bild).toBeGreaterThan(pezoj.erster_bildschirm);
    expect(pezoj.grosses_bild).toBeLessThanOrEqual(255);
    expect(pezoj.grosses_bild_ab).toBeGreaterThan(0);
    expect(pezoj.grosses_bild_ab).toBeLessThan(1);
    // The Kialo names the values it gives the reason for.
    expect(pezoj.kialo).toContain(`Gewicht ${pezoj.grosses_bild}`);
    expect(pezoj.kialo).toContain(`${Math.round(pezoj.grosses_bild_ab * 100)} %`);
  });

  it("names the colour of the large product photo of the first screen as the lead, not the background", async () => {
    const lead = await leadOf([FOTO_KESTO]);
    expect(lead?.agordo, `${lead?.agordo.leitfarbe} statt ${PRODUKT}`).toEqual({
      leitfarbe: PRODUKT,
    });
    expect(lead?.agordo.leitfarbe).not.toBe(HINTERGRUND);
    expect(lead?.herkunft.map((entry) => entry.dosiero)).toContain(FOTO_URL);
  });

  it("keeps the background as the lead when the picture is small or not reported", async () => {
    // A teaser of 400 × 300 px (12 % of the screen) is no large picture; a double without boxes
    // measures as Weg C did before.
    for (const bildoj of [[{ ...FOTO_KESTO, width: 400, height: 300 }], []]) {
      const lead = await leadOf(bildoj);
      expect(lead?.agordo).toEqual({ leitfarbe: HINTERGRUND });
    }
  });
});

describe("the weight of a pixel of a rendered page (Spec 035 D-73, Spec 036 Befund 2.3)", () => {
  const { logo, erster_bildschirm, darunter, grosses_bild, grosses_bild_ab } = KREILO.weg_c;
  const screen = VIDO.width * VIDO.height;

  it("counts as large only the part of a picture in the first screen, from grosses_bild_ab of it", () => {
    const side = Math.ceil(Math.sqrt(grosses_bild_ab * screen));
    expect(grandaBildoOf({ x: 0, y: 0, width: side, height: side }, VIDO)).toEqual({
      x: 0,
      y: 0,
      width: side,
      height: side,
    });
    expect(grandaBildoOf({ x: 0, y: 0, width: side - 2, height: side - 2 }, VIDO)).toBeUndefined();
    // Below the first screen: no part in it.
    expect(
      grandaBildoOf({ x: 0, y: VIDO.height, width: VIDO.width, height: VIDO.height }, VIDO),
    ).toBeUndefined();
    // Half of a full-width picture of 800 px reaches into the first screen: that half counts.
    expect(
      grandaBildoOf({ x: -40, y: VIDO.height / 2, width: VIDO.width + 80, height: 800 }, VIDO),
    ).toEqual({ x: 0, y: VIDO.height / 2, width: VIDO.width, height: VIDO.height / 2 });
  });

  it("weighs logo, large picture, first screen and below; a pixel in two counts with the higher", () => {
    // At 1/8 of the viewport, three screens high, as the renderer doubles return a page.
    const width = VIDO.width / 8;
    const at = (pezoj: Uint8Array, x: number, y: number) => pezoj[(y / 8) * width + x / 8];
    const without = pezojOfEkrano(width, 300, VIDO, [LOGO_FOTO]);
    expect([at(without, 32, 32), at(without, 800, 400), at(without, 800, 1600)]).toEqual([
      logo,
      erster_bildschirm,
      darunter,
    ]);
    const hero = { x: 0, y: 0, width: VIDO.width, height: VIDO.height * 2 };
    const pezoj = pezojOfEkrano(width, 300, VIDO, [LOGO_FOTO], [hero, FOTO_KESTO]);
    expect([at(pezoj, 32, 32), at(pezoj, 800, 400), at(pezoj, 800, 1600)]).toEqual([
      Math.max(logo, grosses_bild),
      grosses_bild,
      darunter,
    ]);
  });
});
