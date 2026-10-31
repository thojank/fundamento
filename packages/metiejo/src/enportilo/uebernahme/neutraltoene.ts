// Step „Neutraltöne“ of the take-over (Spec 036 Teil 4): provisional – the tint the recognition
// proposes (rekono.ts); the ground and surface of the material follow in the next commit.

import { vorschlagAusPropono } from "./aus-propono.js";
import type { Schritt } from "./vorschlag.js";

export const NEUTRALTOENE: Schritt = {
  id: "neutraltoene",
  faceto: "neutralaj",
  eigen: false,
  vorschlagOf: (eniro) =>
    vorschlagAusPropono(
      {
        schritt: "neutraltoene",
        faceto: "neutralaj",
        wertOf: (propono) => propono.agordo.neutral,
        merkmalOf: (_, loko) => `helle Fläche${loko === undefined ? "" : ` (${loko})`}`,
        sicherheitOf: () => "mittel",
        offenSatz: () =>
          "In deinem Material finde ich keine helle Fläche; die Neutraltöne bleiben offen.",
      },
      eniro,
    ),
};
