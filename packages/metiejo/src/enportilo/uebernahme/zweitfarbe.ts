// Step „Zweitfarbe“ of the take-over (Spec 036 Teil 4, D-03): Weg A/B/C set the second colour in Teil
// 2b; this branch has no field for it yet, so the step stays open and names why (D-S36-3.3-4).

import type { Schritt } from "./vorschlag.js";

export const ZWEITFARBE: Schritt = {
  id: "zweitfarbe",
  faceto: "gvidkoloro",
  eigen: false,
  vorschlagOf: () => ({
    schritt: "zweitfarbe",
    offen: true,
    satz: "Eine Zweitfarbe übernehme ich aus dem Material noch nicht; dieser Schritt bleibt offen.",
    verweis: "Spec 036 Teil 2b (D-03): die Zweitfarbe setzen Weg A/B/C dort",
  }),
};
