// Step „Zweitfarbe“ of the take-over (Spec 036 Teil 4, D-03): Weg A/B/C set the second colour in Teil
// 2b, which lays it on the proposal of the lead colour as the Agordo field `zweitfarbe` ({ farbe,
// herkunft? }). The step follows that proposal: its Zweitfarbe is the step's value, with the origin
// the proposal names (or the material's); a proposal that says the colour lies too close leaves the
// step open with that reason; otherwise the step is open (QA run 1, D-S36-QA1-1). Read as plain data,
// so the step needs nothing of Teil 2b to build. Pure.

import type { Agordo } from "@fundamento/agordilo";
import type { Propono } from "../rekono.js";
import { UEBERNAHME } from "./datoj.js";
import {
  anteilOf,
  type Herkunft,
  herkunftOf,
  type Schritt,
  type SchrittEniro,
} from "./vorschlag.js";

const VERWEIS = "Spec 036 Teil 2b (D-03): die Zweitfarbe setzen Weg A/B/C dort";

/** The Agordo field `zweitfarbe` of Teil 2b, as far as the step reads it. */
interface ZweitfarbeFeld {
  farbe: string;
  herkunft?: Partial<Herkunft>;
}

function zweitfarbeFeldOf(propono: Propono | undefined): ZweitfarbeFeld | undefined {
  const feld = (propono?.agordo as { zweitfarbe?: unknown } | undefined)?.zweitfarbe;
  if (typeof feld !== "object" || feld === null) return undefined;
  const { farbe, herkunft } = feld as { farbe?: unknown; herkunft?: unknown };
  if (typeof farbe !== "string" || farbe.trim() === "") return undefined;
  return typeof herkunft === "object" && herkunft !== null
    ? { farbe, herkunft: herkunft as Partial<Herkunft> }
    : { farbe };
}

/** The origin the proposal names for its Zweitfarbe, else the material's with the feature. */
function herkunftDerZweitfarbe(feld: ZweitfarbeFeld, eniro: SchrittEniro): Herkunft {
  const own = feld.herkunft;
  if (
    own !== undefined &&
    (own.quelle === "bild" || own.quelle === "pdf" || own.quelle === "link") &&
    typeof own.merkmal === "string" &&
    own.merkmal.trim() !== "" &&
    (own.datei !== undefined || own.adresse !== undefined)
  )
    return {
      quelle: own.quelle,
      ...(own.datei === undefined ? {} : { datei: own.datei }),
      ...(own.adresse === undefined ? {} : { adresse: own.adresse }),
      merkmal: own.merkmal,
      ...(typeof own.anteil === "number" ? { anteil: own.anteil } : {}),
    };
  return herkunftOf(
    eniro.kunteksto,
    undefined,
    `Zweitfarbe ${feld.farbe}`,
    typeof own?.anteil === "number" ? own.anteil : anteilOf(eniro.trovoj, feld.farbe),
  );
}

/** „…; keine Zweitfarbe, denn … zu nah …“ in the proposal's sentence (Teil 2b), as a sentence. */
function grundOhneZweitfarbe(propono: Propono | undefined): string | undefined {
  const clause = /keine Zweitfarbe, denn ([^.;]+)/.exec(propono?.satz ?? "")?.[1];
  return clause === undefined ? undefined : `Keine Zweitfarbe, denn ${clause.trim()}.`;
}

export const ZWEITFARBE: Schritt = {
  id: "zweitfarbe",
  faceto: "gvidkoloro",
  eigen: false,
  vorschlagOf: (eniro) => {
    const propono = eniro.proponoj.find((entry) => entry.faceto === "gvidkoloro");
    const feld = zweitfarbeFeldOf(propono);
    if (feld !== undefined) {
      const herkunft = herkunftDerZweitfarbe(feld, eniro);
      const anteil = herkunft.anteil;
      return {
        schritt: "zweitfarbe",
        wert: feld.farbe,
        herkunft,
        sicherheit:
          anteil !== undefined && anteil >= UEBERNAHME.leitfarbe.hoch_ab_anteil ? "hoch" : "mittel",
        satz: `Zweitfarbe ${feld.farbe} aus deinem Material${anteil === undefined ? "" : ` (${anteil} % der gefundenen Farbe)`}.`,
        agordo: { zweitfarbe: feld } as unknown as Partial<Agordo>,
      };
    }
    return {
      schritt: "zweitfarbe",
      offen: true,
      satz:
        grundOhneZweitfarbe(propono) ??
        "Eine Zweitfarbe schlägt dein Material nicht vor; dieser Schritt bleibt offen.",
      verweis: VERWEIS,
    };
  },
};
