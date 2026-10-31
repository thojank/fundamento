// Spec 035, Befund 4.5.4: on „Fertig“ the same warning with the same suggestion stood once per step
// of the accent palette (six times „Leitfarbe … setzen.“). Equal warnings with an equal suggestion
// are one message now, with the number of the steps they are about.

import { describe, expect, it } from "vitest";
import type { Klartext, Problemo } from "../klartext.js";
import { klartextHtml } from "../sxtupoj.js";
import * as averto from "./averto.js";

const STUFEN = ["100", "200", "300", "400", "500", "600"];
const leitfarbe = (stufe: string): Problemo => ({
  satz: `Zu wenig Kontrast bei color.palette.accent.${stufe} (hell).`,
  vorschlag: "Leitfarbe #2f6b3a setzen.",
  apply: { leitfarbe: "#2f6b3a" },
  fest: true,
  regulo: "contrast-below-threshold",
});
const kontrast: Problemo = {
  satz: "Zu wenig Kontrast bei action.primary (dunkel).",
  vorschlag: "Kontrast auf 0,2 setzen.",
  apply: { regler: { kontrast: 0.2 } },
  fest: true,
  regulo: "contrast-below-threshold",
};
const klartext = (probleme: Problemo[]): Klartext => ({
  exportable: false,
  gut: ["6400 von 6408 Kontrastpaaren bestehen; 8 fallen durch."],
  angepasst: [],
  probleme,
  jugxoNoetig: false,
});

describe("Spec 035, Befund 4.5.4: equal warnings are one message", () => {
  it("six steps with the same suggestion are one message that names the number of steps", () => {
    const meldungen = averto.meldungenOf([...STUFEN.map(leitfarbe), kontrast]);
    expect(meldungen).toHaveLength(2);
    const [first, second] = meldungen;
    expect(first?.anzahl).toBe(6);
    expect(first?.satz).toBe("Zu wenig Kontrast bei 6 Farbstufen.");
    expect(first?.vorschlag).toBe("Leitfarbe #2f6b3a setzen.");
    expect(first?.betroffen).toEqual(STUFEN.map((stufe) => `color.palette.accent.${stufe} (hell)`));
    expect(second?.anzahl).toBe(1);
    expect(second?.satz).toBe(kontrast.satz);
  });

  it("a different suggestion stays a message of its own", () => {
    const other = {
      ...leitfarbe("700"),
      vorschlag: "Leitfarbe #1d4a28 setzen.",
      apply: { leitfarbe: "#1d4a28" },
    };
    expect(averto.meldungenOf([leitfarbe("100"), other]).map((m) => m.anzahl)).toEqual([1, 1]);
  });

  it("the report on „Fertig“ shows the six as one warning with one button", () => {
    const html = klartextHtml(klartext(STUFEN.map(leitfarbe)), { firstAsMain: false });
    expect(html.match(/Leitfarbe #2f6b3a setzen\./g)).toHaveLength(1);
    expect(html.match(/data-apply=/g)).toHaveLength(1);
    expect(html).toContain("Zu wenig Kontrast bei 6 Farbstufen.");
    expect(html).toContain("color.palette.accent.600 (hell)");
  });
});
