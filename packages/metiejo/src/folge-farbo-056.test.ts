// Spec 056 (MP-2a, T1, Teil M „Farbe folgt den Bildern“): the follow rule as a pure function
// (plan D-6, D-7). Candidate = the first detected colour that may be a lead colour (colourful, not
// pastel). Primär follows while the edge Beispiele → Marke stands, `folgt` is true and the lead
// colour is the start value, `zuletzt` or the anchor `seit`; a lead colour changed elsewhere ends
// following. „folgen lassen“ re-enables it with `seit` = the current lead colour. `primaerStatoKun`
// gives Primär „aus Material“ when the lead colour is the one that came from here. Invented colours.

import { describe, expect, it } from "vitest";
import { farbArtDe } from "./farb-arto.js";
import type { ErkanntaFarbo, FolgoEnigo, Primaer } from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { erkanntDe, folgeFarboDe, primaerStatoKun } from "./leinwand-enhavo.js";
import { parseLeinwandStato, serializeLeinwandStato } from "./leinwand-stato.js";

function farbo(hex: string, anteil: number): ErkanntaFarbo {
  const arto = farbArtDe(hex, KREILO.unbunt);
  if (arto === undefined) throw new Error(`no colour: ${hex}`);
  return { hex, anteil, ...arto };
}

const START = "#3b5bdb";
const BLAU = "#2f5bff";
const ROT = "#d7263d";
const GRAU = "#808080";
const PASTELL = "#e8f7a6";
const HAND = "#118844";

/** The detected colours of images (via erkanntDe, so the order is the real one). */
const erkannt = (...farben: ErkanntaFarbo[]): ErkanntaFarbo[] =>
  erkanntDe([{ name: "a.png", art: "png", farben }]);

const eniro = (teile: Partial<FolgoEnigo>): FolgoEnigo => ({
  erkannt: erkannt(farbo(BLAU, 60), farbo(ROT, 40)),
  leitfarbe: START,
  estasStartwert: true,
  primaer: { folgt: true },
  verbunden: true,
  ...teile,
});

describe("Spec 056 T1: folgeFarboDe (D-6, D-7)", () => {
  it("the start value follows: the largest colourful colour becomes Primär", () => {
    expect(folgeFarboDe(eniro({}))).toEqual({
      farbe: BLAU,
      primaer: { folgt: true, zuletzt: BLAU },
      linio: "folgt",
    });
  });

  it("another image changes Primär while it follows from `zuletzt`", () => {
    const rezulto = folgeFarboDe(
      eniro({
        erkannt: erkannt(farbo(ROT, 70), farbo(BLAU, 30)),
        leitfarbe: BLAU,
        estasStartwert: false,
        primaer: { folgt: true, zuletzt: BLAU },
      }),
    );
    expect(rezulto).toEqual({ farbe: ROT, primaer: { folgt: true, zuletzt: ROT }, linio: "folgt" });
  });

  it("a value by hand does not follow; a hand change ends following (also from the Studio)", () => {
    const vonHand = folgeFarboDe(
      eniro({ leitfarbe: HAND, estasStartwert: false, primaer: { folgt: false, zuletzt: BLAU } }),
    );
    expect(vonHand).toEqual({ primaer: { folgt: false, zuletzt: BLAU }, linio: "folgt-nicht" });
    // It followed (zuletzt = BLAU), then the lead colour was changed elsewhere.
    const studio = folgeFarboDe(
      eniro({ leitfarbe: HAND, estasStartwert: false, primaer: { folgt: true, zuletzt: BLAU } }),
    );
    expect(studio).toEqual({ primaer: { folgt: false, zuletzt: BLAU }, linio: "folgt-nicht" });
  });

  it("a detached edge does not follow, and the colour stays", () => {
    expect(folgeFarboDe(eniro({ verbunden: false }))).toEqual({
      primaer: { folgt: true },
      linio: "folgt-nicht",
    });
  });

  it("without a colourful colour Primär stays; pastel and grey are skipped", () => {
    expect(folgeFarboDe(eniro({ erkannt: erkannt(farbo(GRAU, 70), farbo(PASTELL, 30)) }))).toEqual({
      primaer: { folgt: true },
      linio: "keine-bunte",
    });
    expect(folgeFarboDe(eniro({ erkannt: erkannt(farbo(PASTELL, 70), farbo(ROT, 30)) }))).toEqual({
      farbe: ROT,
      primaer: { folgt: true, zuletzt: ROT },
      linio: "folgt",
    });
  });

  it("the last image removed keeps the last colour", () => {
    expect(
      folgeFarboDe(
        eniro({
          erkannt: [],
          leitfarbe: BLAU,
          estasStartwert: false,
          primaer: { folgt: true, zuletzt: BLAU },
        }),
      ),
    ).toEqual({ primaer: { folgt: true, zuletzt: BLAU }, linio: "keine-bunte" });
  });

  it("equal shares: the first in the order of „Erkannt“ (share, then hex) wins", () => {
    const gleich = erkannt(farbo(ROT, 50), farbo(BLAU, 50));
    expect(gleich.map((f) => f.hex)).toEqual([BLAU, ROT]);
    expect(folgeFarboDe(eniro({ erkannt: gleich })).farbe).toBe(BLAU);
  });

  it("writes nothing when the candidate already is Primär, but notes it as `zuletzt`", () => {
    expect(
      folgeFarboDe(
        eniro({
          leitfarbe: BLAU.toUpperCase(),
          estasStartwert: false,
          primaer: { folgt: true, seit: BLAU },
        }),
      ),
    ).toEqual({ primaer: { folgt: true, zuletzt: BLAU }, linio: "folgt" });
  });

  it("„folgen lassen“ after a hand value follows at once, with `seit` as the anchor", () => {
    const verlangt = folgeFarboDe(
      eniro({
        leitfarbe: HAND,
        estasStartwert: false,
        primaer: { folgt: false, zuletzt: BLAU },
        verlangt: true,
      }),
    );
    expect(verlangt).toEqual({
      farbe: BLAU,
      primaer: { folgt: true, zuletzt: BLAU },
      linio: "folgt",
    });
  });

  it("„folgen lassen“ without a colourful colour waits; a later colourful image follows", () => {
    const warten = folgeFarboDe(
      eniro({
        erkannt: erkannt(farbo(GRAU, 100)),
        leitfarbe: HAND,
        estasStartwert: false,
        primaer: { folgt: false },
        verlangt: true,
      }),
    );
    expect(warten).toEqual({ primaer: { folgt: true, seit: HAND }, linio: "keine-bunte" });
    const spaeter = folgeFarboDe(
      eniro({ leitfarbe: HAND, estasStartwert: false, primaer: warten.primaer }),
    );
    expect(spaeter).toEqual({
      farbe: BLAU,
      primaer: { folgt: true, zuletzt: BLAU },
      linio: "folgt",
    });
    // After following, a return to the old hand value is a hand change again.
    const zurueck = folgeFarboDe(
      eniro({ leitfarbe: HAND, estasStartwert: false, primaer: spaeter.primaer }),
    );
    expect(zurueck.linio).toBe("folgt-nicht");
    expect(zurueck.primaer.folgt).toBe(false);
  });

  it("Akzent never follows: the rule only ever names one colour, for Primär", () => {
    const rezulto = folgeFarboDe(eniro({}));
    expect(Object.keys(rezulto).sort()).toEqual(["farbe", "linio", "primaer"]);
  });
});

describe("Spec 056 T1: primaerStatoKun and the opened Stand", () => {
  const beispiele = (primaer: Primaer) => ({ dateien: [], primaer });

  it("gives „aus-material“ only when the lead colour is `zuletzt`", () => {
    expect(primaerStatoKun(BLAU, beispiele({ folgt: true, zuletzt: BLAU }))).toBe("aus-material");
    expect(primaerStatoKun("#2F5BFF", beispiele({ folgt: false, zuletzt: BLAU }))).toBe(
      "aus-material",
    );
    const keine = [
      primaerStatoKun(HAND, beispiele({ folgt: true, zuletzt: BLAU })),
      primaerStatoKun(BLAU, beispiele({ folgt: true, seit: BLAU })),
      primaerStatoKun(BLAU, undefined),
      primaerStatoKun(undefined, beispiele({ folgt: true, zuletzt: BLAU })),
    ].filter((x) => x !== undefined);
    expect(keine).toEqual([]);
  });

  it("an opened Stand keeps `folgt` and its colour until the next change", () => {
    const stand = {
      version: 1 as const,
      knoten: [
        {
          id: "beispiele",
          speco: "beispiele" as const,
          inhalt: { dateien: [], primaer: { folgt: true, zuletzt: ROT } },
        },
      ],
      kabloj: {},
    };
    const lego = parseLeinwandStato(serializeLeinwandStato(stand));
    expect(lego).toEqual({ stato: stand });
    // Nothing is computed on opening: the state still says it follows, Primär shows „aus Material“.
    expect(primaerStatoKun(ROT, stand.knoten[0]?.inhalt)).toBe("aus-material");
  });
});
