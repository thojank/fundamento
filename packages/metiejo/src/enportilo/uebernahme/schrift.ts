// Step „Schrift“ of the take-over (Spec 036 Teil 4): provisional – the fonts the recognition proposes
// (rekono.ts); „ähnlich“ through the catalogue follows in its own commit.

import { vorschlagAusPropono } from "./aus-propono.js";
import type { Schritt } from "./vorschlag.js";

export const SCHRIFT: Schritt = {
  id: "schrift",
  faceto: "tiparo",
  eigen: false,
  vorschlagOf: (eniro) =>
    vorschlagAusPropono(
      {
        schritt: "schrift",
        faceto: "tiparo",
        wertOf: (propono) => propono.agordo.schriften,
        merkmalOf: (_, loko) => loko ?? "Schrift",
        sicherheitOf: () => "mittel",
        offenSatz: () => "In deinem Material finde ich keine Schrift; die Schrift bleibt offen.",
      },
      eniro,
    ),
};
