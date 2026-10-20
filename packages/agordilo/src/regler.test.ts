// The sliders of the Werkstatt as one list (Spec 019 ②, G7; ③ G6): stage 1 and stage 2 with their
// group, label, range and standard — the panel, the history, the suggestion bar and propose_agordo
// read the same list, so a movement is named the same way everywhere.

import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  type GestaltBasis,
  gestaltBasis,
  readStructure,
  reglerDiff,
  reglerOf,
  reglerValue,
  vorschlagSatz,
  withRegler,
} from "./index.js";

let basis: GestaltBasis;
beforeAll(() => {
  basis = gestaltBasis(readStructure().files);
});

const BASE: Agordo = { name: "provo", leitfarbe: "#6b4fa0" };

describe("reglerOf (G7)", () => {
  it("lists the twelve sliders in the groups of the panel, with label and standard", () => {
    expect(reglerOf(basis).map((regler) => [regler.group, regler.path, regler.label])).toEqual([
      ["farbe", "neutral.toenung", "Neutral-Tönung"],
      ["farbe", "regler.helligkeit", "Helligkeit"],
      ["farbe", "regler.kontrast", "Kontrast"],
      ["farbe", "regler.saettigung", "Sättigung"],
      ["form", "form.radius", "Radius"],
      ["form", "form.rahmen", "Rahmen"],
      ["form", "form.schatten", "Schatten"],
      ["raum", "raum.abstand", "Abstand"],
      ["raum", "raum.hoehe", "Höhe"],
      ["schrift", "schrift.groesse", "Schriftgröße"],
      ["schrift", "schrift.skala", "Skala"],
      ["schrift", "schrift.gewicht", "Schriftgewicht"],
    ]);
    const standard = Object.fromEntries(
      reglerOf(basis).map((regler) => [regler.path, regler.standard]),
    );
    expect(standard["regler.saettigung"]).toBe(1);
    expect(standard["schrift.skala"]).toBe(1.167);
  });

  it("reads a value, or the standard where the Agordo names none", () => {
    const of = (path: string) => {
      const regler = reglerOf(basis).find((entry) => entry.path === path);
      if (regler === undefined) throw new Error(`no slider ${path}`);
      return regler;
    };
    expect(reglerValue({ ...BASE, neutral: { toenung: 0.4 } }, of("neutral.toenung"))).toBe(0.4);
    expect(reglerValue(BASE, of("regler.saettigung"))).toBe(1);
  });

});

describe("withRegler (W-8: back to the standard)", () => {
  it("sets a slider and takes it back: undefined removes the field and an empty group", () => {
    const moved = withRegler(BASE, "form.radius", 1.6);
    expect(moved.form).toEqual({ radius: 1.6 });
    expect(withRegler(moved, "form.radius", undefined)).toEqual(BASE);
    const both = withRegler(withRegler(BASE, "raum.abstand", 1.2), "raum.hoehe", 0.9);
    expect(withRegler(both, "raum.abstand", undefined).raum).toEqual({ hoehe: 0.9 });
  });
});

describe("reglerDiff and vorschlagSatz (G7: the suggestion bar)", () => {
  it("lists every slider that moves, before → after, and the icon weight", () => {
    const after: Agordo = {
      ...BASE,
      regler: { saettigung: 0.8, kontrast: -0.2 },
      form: { schatten: 0.7 },
      ikono: { gewicht: "light" },
    };
    expect(reglerDiff(BASE, after, basis)).toEqual([
      { path: "regler.kontrast", label: "Kontrast", vorher: 0, nachher: -0.2 },
      { path: "regler.saettigung", label: "Sättigung", vorher: 1, nachher: 0.8 },
      { path: "form.schatten", label: "Schatten", vorher: 1, nachher: 0.7 },
      { path: "ikono.gewicht", label: "Icon-Gewicht", vorher: "regular", nachher: "light" },
    ]);
  });

  it("says the movement in one line, with German numbers", () => {
    const diff = reglerDiff(BASE, { ...BASE, regler: { saettigung: 0.8, kontrast: -0.2 } }, basis);
    expect(vorschlagSatz("ruhiger", diff)).toBe(
      "Vorgeschlagen: ruhiger (Kontrast 0,0 → −0,2, Sättigung 1,0 → 0,8)",
    );
    expect(vorschlagSatz(undefined, [])).toBe("Vorgeschlagen: keine Bewegung");
  });
});
