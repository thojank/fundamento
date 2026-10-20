// The prompt as a control (Spec 019 ③, G6, E3): a wish in words becomes movements of the sliders —
// from a vocabulary that is data (data/wuensche.json), never a language model. A word the
// vocabulary does not know moves nothing; a movement stops at the end of its slider's range.
// Pure, except reading the vocabulary and the structure once.

import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  type GestaltBasis,
  gestaltBasis,
  historioEintrag,
  loadCalibration,
  parseAgordoColor,
  parseWunsch,
  proponoOf,
  proposeAgordo,
  readStructure,
  readWuensche,
  reglerOf,
  type Wuensche,
} from "./index.js";

let basis: GestaltBasis;
let wuensche: Wuensche;
beforeAll(() => {
  basis = gestaltBasis(readStructure().files);
  wuensche = readWuensche();
});

const PROVO: Agordo = {
  name: "provo",
  leitfarbe: "#6b4fa0",
  neutral: { toenung: 0.4 },
  regler: { helligkeit: 0.1, kontrast: 0.1, saettigung: 1.1 },
  form: { radius: 1.6 },
  raum: { abstand: 1.15 },
};

describe("the wish vocabulary (data/wuensche.json)", () => {
  it("holds the ten words of the spec in German and English, each with movements and a kialo", () => {
    expect(wuensche.wuensche.map((entry) => entry.wort)).toEqual([
      "ruhiger",
      "kräftiger",
      "wärmer",
      "kühler",
      "runder",
      "eckiger",
      "luftiger",
      "kompakter",
      "größer",
      "kleiner",
    ]);
    const english = [
      "calmer",
      "bolder",
      "warmer",
      "cooler",
      "rounder",
      "sharper",
      "airier",
      "denser",
      "larger",
      "smaller",
    ];
    const paths = new Set([...reglerOf(basis).map((regler) => regler.path), "leitfarbe.ton"]);
    for (const [index, entry] of wuensche.wuensche.entries()) {
      expect(entry.de, entry.wort).toContain(entry.wort);
      expect(entry.en, entry.wort).toContain(english[index]);
      expect(entry.bewegungen.length, entry.wort).toBeGreaterThan(0);
      for (const bewegung of entry.bewegungen)
        expect(paths.has(bewegung.regler), bewegung.regler).toBe(true);
      expect(entry.kialo.startsWith(`${entry.wort}:`), entry.wort).toBe(true);
    }
  });

  it("knows no vague word: moderner, modern, schöner are missing on purpose", () => {
    const words = wuensche.wuensche.flatMap((entry) => [...entry.de, ...entry.en]);
    for (const vague of ["moderner", "modern", "more modern", "schöner", "nicer"]) {
      expect(words, vague).not.toContain(vague);
    }
  });
});

describe("parseWunsch", () => {
  it("finds every known word of a wish, in German and in English", () => {
    expect(
      parseWunsch("Mach die Marke runder und luftiger.", wuensche).treffer.map((t) => t.wort),
    ).toEqual(["runder", "luftiger"]);
    expect(parseWunsch("make it calmer", wuensche).treffer.map((t) => t.wort)).toEqual(["ruhiger"]);
  });

  it("knows nothing of a vague wish: no movement, the word is named", () => {
    const parsed = parseWunsch("Mach die Marke moderner.", wuensche);
    expect(parsed.treffer).toEqual([]);
    expect(parsed.unbekannt).toEqual(["moderner"]);
  });
});

describe("proponoOf (G6.1)", () => {
  it("ruhiger: less saturation, less contrast spread, softer shadows — from where the brand stands", () => {
    const propono = proponoOf(PROVO, { wunsch: "ruhiger" }, wuensche, basis);
    // Nachtrag 20.10. (③ O-3): the step of ruhiger on the contrast is −0.05.
    expect(propono.agordo.regler).toEqual({ helligkeit: 0.1, kontrast: 0.05, saettigung: 0.9 });
    expect(propono.agordo.form).toEqual({ radius: 1.6, schatten: 0.7 });
    expect(propono.diff).toEqual([
      { path: "regler.kontrast", label: "Kontrast", vorher: 0.1, nachher: 0.05 },
      { path: "regler.saettigung", label: "Sättigung", vorher: 1.1, nachher: 0.9 },
      { path: "form.schatten", label: "Schatten", vorher: 1, nachher: 0.7 },
    ]);
    expect(propono.saetze).toEqual([wuensche.wuensche[0]?.kialo]);
  });

  it("two words, two movements, one diff", () => {
    const propono = proponoOf(PROVO, { wunsch: "runder und luftiger" }, wuensche, basis);
    expect(propono.diff.map((entry) => [entry.path, entry.vorher, entry.nachher])).toEqual([
      ["form.radius", 1.6, 2],
      ["raum.abstand", 1.15, 1.3],
    ]);
  });

  it("stops at the end of a slider's range and says so", () => {
    const propono = proponoOf(PROVO, { wunsch: "runder" }, wuensche, basis);
    expect(propono.agordo.form?.radius).toBe(2);
    expect(propono.amEnde).toEqual([{ path: "form.radius", grenze: 2 }]);
  });

  it("takes explicit slider values beside a wish", () => {
    const propono = proponoOf(PROVO, { regler: { "schrift.skala": 1.25 } }, wuensche, basis);
    expect(propono.agordo.schrift).toEqual({ skala: 1.25 });
  });

  it("wärmer turns the lead colour's hue towards orange by 15°", () => {
    const before = parseAgordoColor(PROVO.leitfarbe)?.h ?? 0;
    const propono = proponoOf(PROVO, { wunsch: "wärmer" }, wuensche, basis);
    const after = parseAgordoColor(propono.agordo.leitfarbe)?.h ?? 0;
    const towards = (hue: number) => Math.abs(((hue - 60 + 540) % 360) - 180);
    expect(towards(after)).toBeCloseTo(towards(before) - 15, 0);
  });

  it("a wish it does not know moves nothing and asks back", () => {
    const propono = proponoOf(PROVO, { wunsch: "moderner" }, wuensche, basis);
    expect(propono.agordo).toEqual(PROVO);
    expect(propono.diff).toEqual([]);
    expect(propono.unbekannt).toEqual(["moderner"]);
  });
});

describe("historioEintrag (W-26)", () => {
  it("records the date, the wish (or Hand) and the diff of the sliders", () => {
    const after = proponoOf(PROVO, { wunsch: "ruhiger" }, wuensche, basis).agordo;
    expect(historioEintrag(PROVO, after, "ruhiger", "2026-10-20", basis)).toEqual({
      datum: "2026-10-20",
      wunsch: "ruhiger",
      diff: [
        { regler: "regler.kontrast", vorher: 0.1, nachher: 0.05 },
        { regler: "regler.saettigung", vorher: 1.1, nachher: 0.9 },
        { regler: "form.schatten", vorher: 1, nachher: 0.7 },
      ],
    });
    expect(historioEintrag(undefined, PROVO, undefined, "2026-10-20", basis).wunsch).toBe("Hand");
  });
});

describe("proposeAgordo (G6.2: stops before a fixed rule)", () => {
  it("ruhiger from contrast −0.05 would break contrast-reserve at −0.1: the movement goes half the way and says so", () => {
    const structure = readStructure();
    const proposed = proposeAgordo(
      { name: "marke", leitfarbe: "#375479", regler: { kontrast: -0.05 } },
      { wunsch: "ruhiger" },
      wuensche,
      basis,
      structure,
      loadCalibration(),
    );
    expect(proposed.angehalten).toEqual({ anteil: 0.5, regeln: ["contrast-reserve"] });
    expect(proposed.agordo.regler).toEqual({ kontrast: -0.075, saettigung: 0.9 });
    expect(proposed.derivation.raporto.violations.filter((violation) => violation.fixed)).toEqual(
      [],
    );
  });

  it("ruhiger from contrast 0 holds now (step −0.05): no stop", () => {
    const proposed = proposeAgordo(
      { name: "marke", leitfarbe: "#375479" },
      { wunsch: "ruhiger" },
      wuensche,
      basis,
      readStructure(),
      loadCalibration(),
    );
    expect(proposed.angehalten).toBeUndefined();
    expect(proposed.agordo.regler).toEqual({ kontrast: -0.05, saettigung: 0.8 });
  });
});
