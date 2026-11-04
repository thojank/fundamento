// Step „Dichte“ of the take-over (Spec 036 Teil 4, Befund 4.1): the spacing, coarse. In an image the
// median gap between the blocks against the median block (rows and columns, bildformen.ts) says
// kompakt, ausgewogen or luftig, proposed as raum.abstand one wish step below, at or above the
// standard; with fewer blocks than make a spacing the step is open. Without pixels the padding the
// recognition measures in a stylesheet stays the value (D-S36-3.3-5), named in the same classes;
// otherwise open. Thresholds in kreilo.json › uebernahme.dichte. Pure.

import { vorschlagAusPropono } from "./aus-propono.js";
import { bildAnalyseOf, median } from "./bildformen.js";
import { UEBERNAHME } from "./datoj.js";
import { herkunftOf, type Schritt, type SchrittEniro, type Vorschlag } from "./vorschlag.js";

export type DichteKlasse = "kompakt" | "ausgewogen" | "luftig";

export interface DichteWert {
  dichte: DichteKlasse;
  /** raum.abstand of the Agordo. */
  abstand: number;
}

const comma = (value: number) => String(value).replace(".", ",");
const round1 = (value: number) => Math.round(value * 10) / 10;

/** The class of a ratio of gap to block in an image. */
export function dichteOf(ratio: number): DichteKlasse {
  const data = UEBERNAHME.dichte;
  return ratio < data.kompakt_bis ? "kompakt" : ratio >= data.luftig_ab ? "luftig" : "ausgewogen";
}

/** The class of a raum.abstand factor measured in a stylesheet. */
function dichteOfFaktor(faktor: number): DichteKlasse {
  const data = UEBERNAHME.dichte;
  return faktor <= data.link_kompakt_bis
    ? "kompakt"
    : faktor >= data.link_luftig_ab
      ? "luftig"
      : "ausgewogen";
}

const SAETZE: Record<DichteKlasse, string> = {
  kompakt:
    "Dichte: kompakt – zwischen den Blöcken deines Bildes ist wenig Platz, weniger als halb so viel wie ein Block.",
  ausgewogen:
    "Dichte: ausgewogen – Abstand und Blöcke deines Bildes halten sich die Waage; der Abstand bleibt beim Standard.",
  luftig:
    "Dichte: luftig – zwischen den Blöcken deines Bildes ist mehr Platz als ein Block groß ist.",
};

function ausBild(eniro: SchrittEniro): Vorschlag {
  const { abstaende } = bildAnalyseOf(eniro.bildo as NonNullable<SchrittEniro["bildo"]>);
  const data = UEBERNAHME.dichte;
  if (abstaende.bloecke.length < data.bloecke_min || abstaende.luecken.length === 0)
    return {
      schritt: "dichte",
      offen: true,
      satz: `Im Bild finde ich zu wenige Blöcke mit Abstand dazwischen (mindestens ${data.bloecke_min}); die Dichte bleibt offen.`,
    };
  const luecke = median(abstaende.luecken);
  const block = median(abstaende.bloecke);
  const dichte = dichteOf(luecke / block);
  const abstand = data.abstand[dichte];
  return {
    schritt: "dichte",
    wert: { dichte, abstand } satisfies DichteWert,
    herkunft: herkunftOf(
      eniro.kunteksto,
      undefined,
      `Abstand ${comma(round1(luecke))} px zwischen ${abstaende.bloecke.length} Blöcken von ${comma(round1(block))} px`,
    ),
    sicherheit: abstaende.bloecke.length > data.bloecke_min ? "mittel" : "niedrig",
    satz: SAETZE[dichte],
    agordo: { raum: { abstand } },
  };
}

export const DICHTE: Schritt = {
  id: "dichte",
  faceto: "spaco",
  eigen: true,
  vorschlagOf: (eniro) => {
    if (eniro.bildo !== undefined) return ausBild(eniro);
    return vorschlagAusPropono(
      {
        schritt: "dichte",
        faceto: "spaco",
        wertOf: (propono) => {
          const abstand = propono.agordo.raum?.abstand ?? 1;
          return { dichte: dichteOfFaktor(abstand), abstand } satisfies DichteWert;
        },
        merkmalOf: (_, loko) => `Innenabstand${loko === undefined ? "" : ` (${loko})`}`,
        sicherheitOf: () => "mittel",
        offenSatz: (entry) =>
          entry.kunteksto.quelle === "link"
            ? "Auf der Seite finde ich keine Abstände; die Dichte bleibt offen."
            : entry.kunteksto.quelle === "pdf"
              ? "Aus einer PDF lese ich Abstände noch nicht ab; die Dichte bleibt offen."
              : "Abstände lese ich aus diesem Material nicht ab; die Dichte bleibt offen.",
      },
      eniro,
    );
  },
};
