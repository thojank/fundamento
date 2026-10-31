// Step „Elevation“ of the take-over (Spec 036 Teil 4): shadow edges (yes/no) are measured in S36-3.4;
// until then the step stays open and says so.

import type { Schritt } from "./vorschlag.js";

export const ELEVATION: Schritt = {
  id: "elevation",
  faceto: "elevacio",
  eigen: false,
  vorschlagOf: () => ({
    schritt: "elevation",
    offen: true,
    satz: "Schatten lese ich aus dem Material noch nicht ab; die Elevation bleibt offen.",
    verweis: "S36-3.4: Schattenkanten ja/nein",
  }),
};
