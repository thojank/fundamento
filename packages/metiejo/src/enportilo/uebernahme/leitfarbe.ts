// Step „Leitfarbe“ of the take-over (Spec 036 Teil 4): the lead colour the recognition proposes
// (rekono.ts, with the achromatic brand of Befund 2.1 where that is merged), with its provenance and
// its share of the colour found; open when the material has no colour. Pure.

import { vorschlagAusPropono } from "./aus-propono.js";
import { UEBERNAHME } from "./datoj.js";
import { anteilOf, type Schritt } from "./vorschlag.js";

export const LEITFARBE: Schritt = {
  id: "leitfarbe",
  faceto: "gvidkoloro",
  eigen: false,
  vorschlagOf: (eniro) =>
    vorschlagAusPropono(
      {
        schritt: "leitfarbe",
        faceto: "gvidkoloro",
        wertOf: (propono) => propono.agordo.leitfarbe,
        merkmalOf: (propono, loko) =>
          `Farbe ${String(propono.agordo.leitfarbe)}${loko === undefined ? "" : ` (${loko})`}`,
        anteilOf: (propono, entry) => anteilOf(entry.trovoj, String(propono.agordo.leitfarbe)),
        sicherheitOf: (anteil) =>
          anteil !== undefined && anteil >= UEBERNAHME.leitfarbe.hoch_ab_anteil ? "hoch" : "mittel",
        offenSatz: (entry) =>
          entry.kunteksto.quelle === "schriftdatei"
            ? "Eine Schriftdatei hat keine Farben; die Leitfarbe bleibt offen."
            : "In deinem Material finde ich keine Farbe, die eine Leitfarbe tragen kann; die Leitfarbe bleibt offen.",
      },
      eniro,
    ),
};
