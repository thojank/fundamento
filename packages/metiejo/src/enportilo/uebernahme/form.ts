// Step „Form“ of the take-over (Spec 036 Teil 4): the radius the recognition measures in a style sheet
// (rekono.ts, median of the radii found); open otherwise. Measuring radii in images is S36-3.4. Pure.

import { vorschlagAusPropono } from "./aus-propono.js";
import type { Schritt } from "./vorschlag.js";

export const FORM: Schritt = {
  id: "form",
  faceto: "formo",
  eigen: false,
  vorschlagOf: (eniro) =>
    vorschlagAusPropono(
      {
        schritt: "form",
        faceto: "formo",
        wertOf: (propono) => propono.agordo.form?.radius,
        merkmalOf: (_, loko) => `Radius${loko === undefined ? "" : ` (${loko})`}`,
        sicherheitOf: () => "mittel",
        offenSatz: (entry) =>
          entry.kunteksto.quelle === "link"
            ? "Auf der Seite finde ich keinen Radius; die Form bleibt offen."
            : "Radien lese ich aus diesem Material noch nicht ab; die Form bleibt offen.",
      },
      eniro,
    ),
};
