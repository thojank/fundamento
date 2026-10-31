// Step „Dichte“ of the take-over (Spec 036 Teil 4): the spacing the recognition measures in a style
// sheet (rekono.ts, median of padding and gap); open otherwise. Coarse density from images (luftig /
// kompakt) is S36-3.4. Pure.

import { vorschlagAusPropono } from "./aus-propono.js";
import type { Schritt } from "./vorschlag.js";

export const DICHTE: Schritt = {
  id: "dichte",
  faceto: "spaco",
  eigen: false,
  vorschlagOf: (eniro) =>
    vorschlagAusPropono(
      {
        schritt: "dichte",
        faceto: "spaco",
        wertOf: (propono) => propono.agordo.raum?.abstand,
        merkmalOf: (_, loko) => `Innenabstand${loko === undefined ? "" : ` (${loko})`}`,
        sicherheitOf: () => "mittel",
        offenSatz: (entry) =>
          entry.kunteksto.quelle === "link"
            ? "Auf der Seite finde ich keine Abstände; die Dichte bleibt offen."
            : "Abstände lese ich aus diesem Material noch nicht ab; die Dichte bleibt offen.",
      },
      eniro,
    ),
};
