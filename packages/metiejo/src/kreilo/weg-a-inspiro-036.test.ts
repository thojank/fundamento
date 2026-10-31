// Spec 036, Befund 1.5 (Spec 035 D-99): the run of Weg A proposed no accent, rightly (D-81) – the
// images of the script lay 0,058 apart in the colour plane, below the threshold of kreilo.json. The
// script's images carry a second strong, clearly different colour, so a run without a model
// proposes an accent. The threshold stays; the images are read as an upload would be: the
// Enportilo's own PNG decoder and area measurement, then the Kreilo with the script's answers.

import type { Agordo } from "@fundamento/agordilo";
import { parseAgordoColor } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { farbojOfPixels } from "../enportilo/farboj.js";
import { decodePng } from "../enportilo/png.js";
import { CELO_WEG_A, inspiroWegA, KARAKTERO_WEG_A } from "../test-doubles/weg-a.js";
import { loadBases } from "../vorschau.js";
import { farbAbstand, KREILO, kreiloProponoj } from "./kreilo.js";

const bases = loadBases();
const start: Agordo = { name: "pano", leitfarbe: "#2f6fdb" };

const trovoj = () =>
  inspiroWegA().flatMap(({ filename, bytes }) => farbojOfPixels(decodePng(bytes).rgba, filename));

describe("the inspiration of the Weg A script (Spec 036, D-99)", () => {
  it("has a second strong colour at least the accent threshold away from the lead colour", () => {
    const result = kreiloProponoj(
      { celo: CELO_WEG_A, karaktero: { ...KARAKTERO_WEG_A }, inspiro: trovoj() },
      start,
      bases,
    );
    const lead = parseAgordoColor(result.agordo.leitfarbe);
    if (lead === undefined) throw new Error("no lead colour");
    const strong = trovoj()
      .filter((trovo) => trovo.kind === "farbo")
      .map((trovo) => parseAgordoColor(String(trovo.valoro)))
      .filter((colour) => colour !== undefined)
      .filter((colour) => colour.c >= KREILO.akzent.chroma_min)
      .map((colour) => farbAbstand(colour, lead));
    expect(Math.max(...strong)).toBeGreaterThanOrEqual(KREILO.akzent.abstand_min);
  });

  it("so the Kreilo proposes an accent from it, with its origin, without a model", () => {
    const result = kreiloProponoj(
      { celo: CELO_WEG_A, karaktero: { ...KARAKTERO_WEG_A }, inspiro: trovoj() },
      start,
      bases,
    );
    expect(result.agordo.leitfarbe).toBe("#9c5a2b");
    expect(result.akzent).toBeDefined();
    expect(result.akzent?.abstand).toBeGreaterThanOrEqual(KREILO.akzent.abstand_min);
    expect(result.akzent?.anteil).toBeGreaterThanOrEqual(KREILO.akzent.anteil_min);
    expect(result.akzent?.herkunft[0]?.dosiero).toMatch(/\.png$/);
  });

  it("the threshold of kreilo.json is the one of Spec 035 (0,15)", () => {
    expect(KREILO.akzent.abstand_min).toBe(0.15);
  });
});
