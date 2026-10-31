// Spec 036 Teil 4, Befund 4.1: the shapes of an image – buttons and cards with their corner radius –
// and the stage of the Form a button's radius gives against its height.

import { describe, expect, it } from "vitest";
import { GRUND_HELL } from "../../test-doubles/uebernahme.js";
import {
  bildPng,
  FORM_KARTE,
  FORM_KNOPF,
  FORM_PILLE,
} from "../../test-doubles/uebernahme-bilder.js";
import { decodePng } from "../png.js";
import { bildAnalyseOf } from "./bildformen.js";
import { UEBERNAHME } from "./datoj.js";
import { stufeOf } from "./form.js";

const analyse = (bild: Parameters<typeof bildPng>[0]) => bildAnalyseOf(decodePng(bildPng(bild)));

describe("Spec 036 Teil 4: shapes in an image", () => {
  it("finds both buttons with the radius they were drawn with", () => {
    const formen = analyse(FORM_KNOPF).formen;
    expect(formen.map((forma) => forma.art)).toEqual(["knopf", "knopf"]);
    for (const [index, forma] of formen.entries()) {
      const drawn = FORM_KNOPF.rechtecke[index];
      expect(forma.width).toBe(drawn?.width);
      expect(forma.height).toBe(drawn?.height);
      expect(Math.abs(forma.radius - (drawn?.radius ?? 0))).toBeLessThanOrEqual(0.5);
    }
    expect(analyse(FORM_PILLE).formen.every((forma) => forma.radius >= 15)).toBe(true);
  });

  it("a large light area is a card, a circle and a stripe across the picture are no shapes", () => {
    expect(analyse(FORM_KARTE).formen.map((forma) => forma.art)).toEqual(["karte"]);
    const { grund, leitfarbe } = GRUND_HELL;
    const kreis = { x: 80, y: 40, width: 60, height: 60, radius: 30, farbe: leitfarbe };
    const streifen = { x: 0, y: 70, width: 240, height: 20, radius: 0, farbe: leitfarbe };
    expect(analyse({ width: 240, height: 160, grund, rechtecke: [kreis] }).formen).toEqual([]);
    expect(analyse({ width: 240, height: 160, grund, rechtecke: [streifen] }).formen).toEqual([]);
  });

  it("a button's radius against its height gives the stage, from the data; fully round is the pill", () => {
    const stufen = UEBERNAHME.form.stufen;
    for (const [index, entry] of stufen.entries()) {
      const from = index === 0 ? 0 : (stufen[index - 1]?.bis ?? 0);
      const middle = (from + entry.bis) / 2;
      expect(stufeOf({ radius: middle * 32, height: 32 })).toBe(entry.stufe);
    }
    expect(stufeOf({ radius: 16, height: 32 })).toBe("pille");
    expect(stufeOf({ radius: 10, height: 32 })).toBe(1);
  });
});
