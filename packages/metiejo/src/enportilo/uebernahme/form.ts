// Step „Form“ of the take-over (Spec 036 Teil 4, Befund 4.1): in an image, the buttons tell the form
// – the corner radius against the button's height is a stage of the Form (0 · 0,5 · 1 · 2) or the
// pill (bildformen.ts, thresholds in kreilo.json › uebernahme.form). A card alone tells only
// „eckig“; a rounded card without a button, or a picture without any shape, leaves the form open
// with a sentence. Without pixels (a link, a PDF) the radius the recognition measures in a style
// sheet stays the value, with file and line (D-S36-3.3-5); otherwise open. Pure.

import { type Agordo, withBedienform } from "@fundamento/agordilo";
import { vorschlagAusPropono } from "./aus-propono.js";
import { bildAnalyseOf, type Forma } from "./bildformen.js";
import { UEBERNAHME } from "./datoj.js";
import { herkunftOf, type Schritt, type SchrittEniro, type Vorschlag } from "./vorschlag.js";

export interface FormWert {
  /** form.radius of the Agordo: the stage (2 with the pill). */
  radius: number;
  /** The controls as pills (radius.role.control on radius.full). */
  pille: boolean;
}

const comma = (value: number) => String(value).replace(".", ",");
const round2 = (value: number) => Math.round(value * 100) / 100;

/** The stage of a button: its radius against its height, or the pill. */
export function stufeOf(forma: Pick<Forma, "radius" | "height">): number | "pille" {
  const ratio = forma.radius / forma.height;
  return UEBERNAHME.form.stufen.find((entry) => ratio < entry.bis)?.stufe ?? "pille";
}

const merkmalOf = (forma: Forma) =>
  `${forma.art === "knopf" ? "Knopf" : "Karte"} ${forma.width}×${forma.height} px, Radius ${comma(forma.radius)} px (${comma(round2(forma.radius / forma.height))} der Höhe)`;

const PILLE_FESTGELEGT = withBedienform({} as Agordo, "pille").festgelegt ?? {};

function ausBild(eniro: SchrittEniro): Vorschlag {
  const analyse = bildAnalyseOf(eniro.bildo as NonNullable<SchrittEniro["bildo"]>);
  const knoepfe = analyse.formen.filter((forma) => forma.art === "knopf");
  const karten = analyse.formen.filter((forma) => forma.art === "karte");
  const at = (forma: Forma) => herkunftOf(eniro.kunteksto, undefined, merkmalOf(forma));
  if (knoepfe.length === 0) {
    const eckig = karten.filter((karte) => karte.radius <= UEBERNAHME.form.eckig_bis_px);
    const [karte, ...rest] = eckig;
    if (karte !== undefined && eckig.length === karten.length) {
      return {
        schritt: "form",
        wert: { radius: 0, pille: false } satisfies FormWert,
        herkunft: at(karte),
        ...(rest.length === 0 ? {} : { weitere: rest.map(at) }),
        sicherheit: "mittel",
        satz: "Form: Stufe 0 (eckig) – die Karten in deinem Bild haben scharfe Ecken; einen Knopf finde ich nicht.",
        agordo: { form: { radius: 0 } },
      };
    }
    return {
      schritt: "form",
      offen: true,
      satz:
        karten.length > 0
          ? "Ich sehe eine Karte mit runden Ecken, aber keinen Knopf; wie rund die Bedienelemente sind, lese ich daraus nicht sicher ab. Die Form bleibt offen."
          : "Im Bild finde ich keinen Knopf und keine Karte, an deren Ecken ich den Radius ablesen kann; die Form bleibt offen.",
    };
  }
  // The stage most buttons show; on a tie the one of the largest button (the list is by size).
  const stufen = knoepfe.map(stufeOf);
  const counts = new Map<number | "pille", number>();
  for (const stufe of stufen) counts.set(stufe, (counts.get(stufe) ?? 0) + 1);
  const stufe = [...new Set(stufen)].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0];
  const traeger = knoepfe.filter((_, index) => stufen[index] === stufe);
  const [erster, ...weitere] = traeger;
  if (stufe === undefined || erster === undefined)
    return { schritt: "form", offen: true, satz: "Die Form bleibt offen." };
  const pille = stufe === "pille";
  const radius = pille ? 2 : stufe;
  const einig = knoepfe.length >= 2 && traeger.length === knoepfe.length;
  const name = UEBERNAHME.form.stufen_namen[String(radius)] ?? "";
  const knopfWort = knoepfe.length === 1 ? "der Knopf" : "die Knöpfe";
  return {
    schritt: "form",
    wert: { radius, pille } satisfies FormWert,
    herkunft: at(erster),
    ...(weitere.length + karten.length === 0 ? {} : { weitere: [...weitere, ...karten].map(at) }),
    sicherheit: einig ? "hoch" : "mittel",
    satz: pille
      ? `Form: Pille – ${knopfWort} in deinem Bild ${knoepfe.length === 1 ? "ist" : "sind"} ganz rund; rund werden nur die Bedienelemente, Karten und Flächen behalten ihren Radius.`
      : `Form: Stufe ${comma(radius)} (${name}) – die Ecken ${knoepfe.length === 1 ? "des Knopfs" : "der Knöpfe"} in deinem Bild sind ${comma(round2(erster.radius / erster.height))} so groß wie ${knoepfe.length === 1 ? "seine" : "ihre"} Höhe.`,
    agordo: pille ? { form: { radius }, festgelegt: PILLE_FESTGELEGT } : { form: { radius } },
  };
}

export const FORM: Schritt = {
  id: "form",
  faceto: "formo",
  eigen: true,
  vorschlagOf: (eniro) => {
    if (eniro.bildo !== undefined) return ausBild(eniro);
    return vorschlagAusPropono(
      {
        schritt: "form",
        faceto: "formo",
        wertOf: (propono) =>
          ({ radius: propono.agordo.form?.radius ?? 1, pille: false }) satisfies FormWert,
        merkmalOf: (_, loko) => `Radius${loko === undefined ? "" : ` (${loko})`}`,
        sicherheitOf: () => "mittel",
        offenSatz: (entry) =>
          entry.kunteksto.quelle === "link"
            ? "Auf der Seite finde ich keinen Radius; die Form bleibt offen."
            : entry.kunteksto.quelle === "pdf"
              ? "Aus einer PDF lese ich Knöpfe und Ecken noch nicht ab; die Form bleibt offen."
              : "Radien lese ich aus diesem Material nicht ab; die Form bleibt offen.",
      },
      eniro,
    );
  },
};
