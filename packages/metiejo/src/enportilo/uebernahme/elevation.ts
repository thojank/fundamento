// Step „Elevation“ of the take-over (Spec 036 Teil 4, Befund 4.1): shadow edges, yes or no. In an
// image a soft band under a card or a button says yes (form.schatten at its standard 1); a card
// without one says no (0, flat); buttons alone without a shadow or no shape at all leave the step
// open – a flat button says nothing about the surfaces. A link says yes with the line of its
// stylesheet that draws a shadow; a stylesheet without one is no proof of a flat brand, so it stays
// open, as does a PDF. Shapes and bands from bildformen.ts. Pure.

import { bildAnalyseOf, type Forma } from "./bildformen.js";
import { herkunftOf, type Schritt, type SchrittEniro, type Vorschlag } from "./vorschlag.js";

export interface ElevationWert {
  schatten: boolean;
}

/** form.schatten of a brand with shadows (the standard of the slider) and of a flat one. */
const MIT_SCHATTEN = 1;
const OHNE_SCHATTEN = 0;

const name = (forma: Forma) => (forma.art === "knopf" ? "dem Knopf" : "der Karte");

function ausBild(eniro: SchrittEniro): Vorschlag {
  const { formen } = bildAnalyseOf(eniro.bildo as NonNullable<SchrittEniro["bildo"]>);
  const at = (merkmal: string) => herkunftOf(eniro.kunteksto, undefined, merkmal);
  const mit = formen.filter((forma) => forma.schatten > 0);
  const [erste, ...weitere] = mit;
  if (erste !== undefined) {
    return {
      schritt: "elevation",
      wert: { schatten: true } satisfies ElevationWert,
      herkunft: at(
        `Schattenkante unter ${name(erste)} ${erste.width}×${erste.height} px, ${erste.schatten} Zeilen weich auslaufend`,
      ),
      ...(weitere.length === 0
        ? {}
        : {
            weitere: weitere.map((forma) =>
              at(`Schattenkante unter ${name(forma)} ${forma.width}×${forma.height} px`),
            ),
          }),
      sicherheit: mit.length >= 2 ? "hoch" : "mittel",
      satz: "Elevation: mit Schatten – unter den Flächen in deinem Bild läuft eine weiche Schattenkante aus.",
      agordo: { form: { schatten: MIT_SCHATTEN } },
    };
  }
  const karten = formen.filter((forma) => forma.art === "karte");
  const [karte, ...andere] = karten;
  if (karte !== undefined) {
    return {
      schritt: "elevation",
      wert: { schatten: false } satisfies ElevationWert,
      herkunft: at(`Karte ${karte.width}×${karte.height} px ohne Schattenkante`),
      ...(andere.length === 0
        ? {}
        : {
            weitere: andere.map((forma) =>
              at(`Karte ${forma.width}×${forma.height} px ohne Schattenkante`),
            ),
          }),
      sicherheit: "mittel",
      satz: "Elevation: flach – die Karten in deinem Bild haben keine Schattenkante; Ebenen unterscheiden sich dann nur durch ihre Helligkeit.",
      agordo: { form: { schatten: OHNE_SCHATTEN } },
    };
  }
  return {
    schritt: "elevation",
    offen: true,
    satz:
      formen.length > 0
        ? "Die Knöpfe in deinem Bild haben keinen Schatten; ob Karten und Flächen einen haben, sehe ich nicht. Die Elevation bleibt offen."
        : "Im Bild finde ich keine Karte und keinen Knopf, an dem ein Schatten sitzen könnte; die Elevation bleibt offen.",
  };
}

function ausStilvorlage(eniro: SchrittEniro): Vorschlag {
  const ombroj = eniro.trovoj.filter((trovo) => trovo.kind === "ombro");
  const [erste, ...weitere] = ombroj;
  const at = (trovo: (typeof ombroj)[number]) =>
    herkunftOf(
      eniro.kunteksto,
      trovo.herkunft.dosiero,
      `Schatten${trovo.herkunft.loko === undefined ? "" : ` (${trovo.herkunft.loko})`}`,
    );
  if (erste === undefined) {
    return {
      schritt: "elevation",
      offen: true,
      satz:
        eniro.kunteksto.quelle === "link"
          ? "In der Stilvorlage der Seite finde ich keinen Schatten; ob die Marke flach ist, sehe ich daraus nicht sicher. Die Elevation bleibt offen."
          : eniro.kunteksto.quelle === "pdf"
            ? "Aus einer PDF lese ich Schatten noch nicht ab; die Elevation bleibt offen."
            : "Schatten lese ich aus diesem Material nicht ab; die Elevation bleibt offen.",
    };
  }
  return {
    schritt: "elevation",
    wert: { schatten: true } satisfies ElevationWert,
    herkunft: at(erste),
    ...(weitere.length === 0 ? {} : { weitere: weitere.slice(0, 2).map(at) }),
    sicherheit: "mittel",
    satz: `Elevation: mit Schatten – die Stilvorlage zeichnet ${ombroj.length === 1 ? "einen Schatten" : `${ombroj.length} Schatten`}.`,
    agordo: { form: { schatten: MIT_SCHATTEN } },
  };
}

export const ELEVATION: Schritt = {
  id: "elevation",
  faceto: "elevacio",
  eigen: true,
  vorschlagOf: (eniro) => (eniro.bildo !== undefined ? ausBild(eniro) : ausStilvorlage(eniro)),
};
