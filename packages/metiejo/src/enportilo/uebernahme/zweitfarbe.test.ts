// Spec 036 Teil 4 with Teil 2b (QA run 1, issue 1): the step „Zweitfarbe“ follows the proposal of the
// lead colour. When that proposal lays a Zweitfarbe (Teil 2b's Agordo field `zweitfarbe`, here as
// plain data), the step has it as its value with a provenance; when the proposal says the colour lies
// too close, the step is open with that reason; otherwise it is open with a sentence that does not
// claim the Zweitfarbe is never taken over. The screen names only open steps.

import { describe, expect, it } from "vitest";
import type { Propono } from "../rekono.js";
import type { Trovo } from "../trovo.js";
import { offeneSaetzeOf, uebernahmeOf } from "./index.js";
import { istOffen, type Vorschlag, verletzungenOf, type WertVorschlag } from "./vorschlag.js";

const trovoj: Trovo[] = [
  {
    kind: "farbo",
    valoro: "#e4572e",
    pezo: 60,
    herkunft: { dosiero: "zwei.png", loko: "Fläche" },
  },
  {
    kind: "farbo",
    valoro: "#17b3a8",
    pezo: 25,
    herkunft: { dosiero: "zwei.png", loko: "Fläche" },
  },
  {
    kind: "farbo",
    valoro: "#ffffff",
    pezo: 15,
    herkunft: { dosiero: "zwei.png", loko: "Fläche" },
  },
];
const rezulto = { trovoj, kiel: "upload" as const, nomo: "zwei.png" };

/** The proposal of the lead colour as Teil 2b lays it; `extra` is the rest of its Agordo patch. */
const gvidkoloro = (
  extra: Record<string, unknown>,
  satz = "Leitfarbe #e4572e aus deinem Material.",
): Propono =>
  ({
    faceto: "gvidkoloro",
    agordo: { leitfarbe: "#e4572e", ...extra },
    satz,
    herkunft: [{ dosiero: "zwei.png", loko: "60 %" }],
  }) as Propono;

const zweitfarbeOf = (vorschlagoj: readonly Vorschlag[]) =>
  vorschlagoj.find((vorschlag) => vorschlag.schritt === "zweitfarbe");

describe("Spec 036 Teil 4: the step „Zweitfarbe“ reads the Zweitfarbe of the proposal", () => {
  it("a proposal with a Zweitfarbe and its origin: the step has the value, with that origin", () => {
    const { vorschlagoj } = uebernahmeOf(rezulto, [
      gvidkoloro({
        zweitfarbe: {
          farbe: "#17b3a8",
          herkunft: { quelle: "bild", datei: "zwei.png", merkmal: "Farbe #17b3a8", anteil: 25 },
        },
      }),
    ]);
    const step = zweitfarbeOf(vorschlagoj);
    expect(step !== undefined && istOffen(step)).toBe(false);
    const wert = step as WertVorschlag;
    expect(wert.wert).toBe("#17b3a8");
    expect(wert.herkunft).toEqual({
      quelle: "bild",
      datei: "zwei.png",
      merkmal: "Farbe #17b3a8",
      anteil: 25,
    });
    expect(wert.sicherheit).toBe("hoch");
    expect(wert.satz).toContain("#17b3a8");
    expect(verletzungenOf(vorschlagoj)).toEqual([]);
  });

  it("a Zweitfarbe without its own origin takes the material's, with the feature „Zweitfarbe“", () => {
    const { vorschlagoj } = uebernahmeOf(rezulto, [
      gvidkoloro({ zweitfarbe: { farbe: "#17b3a8" } }),
    ]);
    const wert = zweitfarbeOf(vorschlagoj) as WertVorschlag;
    expect(wert.wert).toBe("#17b3a8");
    expect(wert.herkunft.quelle).toBe("bild");
    expect(wert.herkunft.datei).toBe("zwei.png");
    expect(wert.herkunft.merkmal).toMatch(/^Zweitfarbe/);
    expect(wert.herkunft.anteil).toBe(25);
    expect(verletzungenOf(vorschlagoj)).toEqual([]);
  });

  it("the screen of „Leitfarbe und Akzente“ names no open Zweitfarbe once the step has a value", () => {
    const { vorschlagoj } = uebernahmeOf(rezulto, [
      gvidkoloro({ zweitfarbe: { farbe: "#17b3a8" } }),
    ]);
    expect(offeneSaetzeOf(vorschlagoj, "gvidkoloro").join(" ")).not.toMatch(/Zweitfarbe/);
  });

  it("a proposal that says the colour lies too close: the step is open with that reason", () => {
    const { vorschlagoj } = uebernahmeOf(rezulto, [
      gvidkoloro(
        {},
        "Leitfarbe #e4572e aus deinem Material; keine Zweitfarbe, denn #d9622f liegt zu nah an der Leitfarbe.",
      ),
    ]);
    const step = zweitfarbeOf(vorschlagoj);
    expect(step !== undefined && istOffen(step)).toBe(true);
    expect(step?.satz).toBe("Keine Zweitfarbe, denn #d9622f liegt zu nah an der Leitfarbe.");
    expect(offeneSaetzeOf(vorschlagoj, "gvidkoloro")).toContain(step?.satz);
  });

  it("otherwise the step is open with a sentence that does not say the Zweitfarbe is never taken over", () => {
    for (const proponoj of [[gvidkoloro({})], []]) {
      const step = zweitfarbeOf(uebernahmeOf(rezulto, proponoj).vorschlagoj);
      expect(step !== undefined && istOffen(step)).toBe(true);
      expect(step?.satz.trim()).not.toBe("");
      expect(step?.satz).not.toMatch(/noch nicht/);
    }
  });
});
