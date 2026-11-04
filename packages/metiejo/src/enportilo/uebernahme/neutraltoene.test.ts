// Spec 036 Teil 4 (Neutraltöne): the edges of the step – a ground tinted away from the lead colour is
// named and only „mittel“ sure, a lead colour without hue leaves the neutrals grey, a calm colour
// below the ground's share is no ground – and the thresholds are data with their Kialo.

import { describe, expect, it } from "vitest";
import type { Trovo } from "../trovo.js";
import { UEBERNAHME } from "./datoj.js";
import { NEUTRALTOENE } from "./neutraltoene.js";
import type { SchrittEniro, WertVorschlag } from "./vorschlag.js";

const farbo = (valoro: string, pezo: number): Trovo => ({
  kind: "farbo",
  valoro,
  pezo,
  herkunft: { dosiero: "probe.png", loko: `${pezo} % der Fläche` },
});

const eniro = (trovoj: Trovo[], leitfarbe?: string): SchrittEniro => ({
  trovoj,
  proponoj:
    leitfarbe === undefined
      ? []
      : [{ faceto: "gvidkoloro", agordo: { leitfarbe }, satz: "", herkunft: [] }],
  kunteksto: { quelle: "bild", datei: "probe.png" },
});

describe("Neutraltöne: the edges of the step", () => {
  it("a warm ground under a blue lead colour: named, and only the strength of the tint is taken", () => {
    const vorschlag = NEUTRALTOENE.vorschlagOf(
      eniro([farbo("#f3ecdf", 80), farbo("#3b82f6", 20)], "#3b82f6"),
    ) as WertVorschlag;
    expect(vorschlag.sicherheit).toBe("mittel");
    expect(vorschlag.satz).toContain("anders getönt als die Leitfarbe");
    expect(vorschlag.wert).toMatchObject({ grund: "hell", getoent: true });
  });

  it("a lead colour without hue leaves the neutrals grey, and the sentence says why", () => {
    const vorschlag = NEUTRALTOENE.vorschlagOf(
      eniro([farbo("#f3ecdf", 80), farbo("#111111", 20)], "#111111"),
    ) as WertVorschlag;
    expect(vorschlag.agordo).toEqual({ neutral: { toenung: 0 } });
    expect(vorschlag.satz).toContain("keinen Farbton");
  });

  it("a calm colour below the ground's share is no ground: the step stays open", () => {
    const small = UEBERNAHME.neutraltoene.grund_anteil_min - 1;
    const vorschlag = NEUTRALTOENE.vorschlagOf(
      eniro([farbo("#f3ecdf", small), farbo("#c2255c", 100 - small)], "#c2255c"),
    );
    expect("offen" in vorschlag && vorschlag.offen).toBe(true);
  });

  it("every group of thresholds of the take-over has its Kialo", () => {
    for (const group of Object.values(UEBERNAHME)) expect(group.kialo.length).toBeGreaterThan(80);
  });
});
