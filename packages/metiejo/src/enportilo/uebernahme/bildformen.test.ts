// Spec 036 Teil 4, Befund 4.1: the shapes of an image – buttons and cards with their corner radius –
// and the stage of the Form a button's radius gives against its height.

import { describe, expect, it } from "vitest";
import { GRUND_HELL } from "../../test-doubles/uebernahme.js";
import {
  bildPng,
  DICHTE_KOMPAKT,
  DICHTE_LUFTIG,
  ELEVATION_FLACH,
  ELEVATION_SCHATTEN,
  FORM_KARTE,
  FORM_KNOPF,
  FORM_PILLE,
} from "../../test-doubles/uebernahme-bilder.js";
import { decodePng } from "../png.js";
import { bildAnalyseOf } from "./bildformen.js";
import { UEBERNAHME } from "./datoj.js";
import { dichteOf } from "./dichte.js";
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

  it("a soft band under a card is a shadow of as many rows; no band, or one dark line, is none", () => {
    expect(analyse(ELEVATION_SCHATTEN).formen.map((forma) => forma.schatten)).toEqual([6]);
    expect(analyse(ELEVATION_FLACH).formen.map((forma) => forma.schatten)).toEqual([0]);
    const karte = ELEVATION_FLACH.rechtecke[0];
    if (karte === undefined) throw new Error("no card");
    const linie = {
      x: karte.x,
      y: karte.y + karte.height,
      width: karte.width,
      height: 1,
      radius: 0,
      farbe: "#c9bfae",
    };
    const mitLinie = { ...ELEVATION_FLACH, rechtecke: [karte, linie] };
    expect(analyse(mitLinie).formen.find((forma) => forma.art === "karte")?.schatten).toBe(0);
  });

  it("blocks and gaps are counted without the margins; their ratio gives the class from the data", () => {
    expect(analyse(DICHTE_LUFTIG).abstaende).toEqual({ bloecke: [16, 16, 16], luecken: [30, 30] });
    expect(analyse(DICHTE_KOMPAKT).abstaende.luecken).toEqual([4, 4, 4, 4]);
    const { kompakt_bis, luftig_ab } = UEBERNAHME.dichte;
    expect(dichteOf(kompakt_bis - 0.01)).toBe("kompakt");
    expect(dichteOf((kompakt_bis + luftig_ab) / 2)).toBe("ausgewogen");
    expect(dichteOf(luftig_ab)).toBe("luftig");
  });

  it("smoothed edges as in a screenshot: the radius within half a pixel, the stage of a sharp button 0", () => {
    const { leitfarbe } = GRUND_HELL;
    for (const [radius, height, stufe] of [
      [3, 46, 0],
      [10, 32, 1],
      [5, 40, 0.5],
    ] as const) {
      const bild = {
        width: 400,
        height: 400,
        grund: "#ffffff",
        glatt: true,
        rechtecke: [{ x: 40, y: 60, width: 250, height, radius, farbe: leitfarbe }],
      };
      const [knopf] = analyse(bild).formen;
      expect(knopf?.art, `${radius}/${height}`).toBe("knopf");
      expect(Math.abs((knopf?.radius ?? 0) - radius), `${radius}/${height}`).toBeLessThanOrEqual(
        0.5,
      );
      expect(stufeOf(knopf ?? { radius: 0, height: 1 }), `${radius}/${height}`).toBe(stufe);
    }
  });

  it("an area over nearly the whole picture is the page, not a card", () => {
    const { flaeche, leitfarbe } = GRUND_HELL;
    const seite = { x: 10, y: 10, width: 380, height: 280, radius: 8, farbe: flaeche };
    const inhalt = ["#3d3427", leitfarbe, "#2255aa"].map((farbe, index) => ({
      x: 15,
      y: 15 + index * 92,
      width: 370,
      height: 88,
      radius: 0,
      farbe,
    }));
    const formen = analyse({
      width: 400,
      height: 300,
      grund: "#e5e5e5",
      rechtecke: [seite, ...inhalt],
    }).formen;
    expect(formen.filter((forma) => forma.width >= 0.9 * 400)).toEqual([]);
  });
});
