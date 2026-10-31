// Step „Neutraltöne“ of the take-over (Spec 036 Teil 4, Befund 4.1): the tint and the light or dark
// ground from the calm areas of the material – the largest calm colour is the ground, the next calm
// colour of the same lightness the surface on it. Their chroma (weighted by share, the hue averaged
// as a vector) against a quarter of the lead colour is the tint of the Agordo; a dark ground is named
// for the dark mode, which the Agordo has no field for. Thresholds and hue names in kreilo.json ›
// uebernahme.neutraltoene. Open when no calm colour covers enough to be a ground. Pure.

import {
  ACHROMATIC,
  hueDifference,
  NEUTRAL_SHARE,
  type OklchColor,
  parseAgordoColor,
} from "@fundamento/agordilo";
import type { Herkunft as TrovoHerkunft } from "../trovo.js";
import { UEBERNAHME } from "./datoj.js";
import { type Herkunft, herkunftOf, type Schritt, type SchrittEniro } from "./vorschlag.js";

interface Area {
  hex: string;
  oklch: OklchColor;
  /** Percent of the colour found. */
  anteil: number;
  herkunft: TrovoHerkunft;
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const comma = (value: number) => String(value).replace(".", ",");

/** The colours of the reading, equal ones summed, with their share of the colour found. */
function areasOf(eniro: SchrittEniro): Area[] {
  const sums = new Map<string, { pezo: number; herkunft: TrovoHerkunft }>();
  // A stylesheet says which colours paint a background; only those can be the ground or a surface
  // (its text colour is often named more often than its ground).
  const flaechen = eniro.trovoj.some((trovo) => trovo.kind === "farbo" && trovo.flaeche === true);
  for (const trovo of eniro.trovoj) {
    if (trovo.kind !== "farbo" || (flaechen && trovo.flaeche !== true)) continue;
    const hex = String(trovo.valoro).toLowerCase();
    const entry = sums.get(hex) ?? { pezo: 0, herkunft: trovo.herkunft };
    entry.pezo += trovo.pezo;
    sums.set(hex, entry);
  }
  const total = [...sums.values()].reduce((sum, entry) => sum + entry.pezo, 0);
  if (total <= 0) return [];
  return [...sums.entries()]
    .flatMap(([hex, entry]) => {
      const oklch = parseAgordoColor(hex);
      return oklch === undefined
        ? []
        : [{ hex, oklch, anteil: (100 * entry.pezo) / total, herkunft: entry.herkunft }];
    })
    .sort((a, b) => b.anteil - a.anteil);
}

/** The name of a hue from the data (each range up to, excluding, its `bis`). */
function farbtonName(hue: number): string {
  const ranges = UEBERNAHME.neutraltoene.farbtoene;
  return (ranges.find((range) => hue < range.bis) ?? ranges[ranges.length - 1])?.name ?? "";
}

/** The lead colour the neutrals follow: the material's proposal, else the draft's. */
function leadOf(eniro: SchrittEniro): OklchColor | undefined {
  const proposed = eniro.proponoj.find((propono) => propono.faceto === "gvidkoloro")?.agordo
    .leitfarbe;
  const hex = proposed ?? eniro.leitfarbe;
  return hex === undefined ? undefined : parseAgordoColor(hex);
}

const OFFEN =
  "In deinem Material deckt keine ruhige Farbe eine größere Fläche; Tönung und Hell/Dunkel des Grunds kann ich nicht ablesen, die Neutraltöne bleiben offen.";

export const NEUTRALTOENE: Schritt = {
  id: "neutraltoene",
  faceto: "neutralaj",
  eigen: true,
  vorschlagOf: (eniro) => {
    const data = UEBERNAHME.neutraltoene;
    const calm = areasOf(eniro).filter((area) => area.oklch.c < data.chroma_bis);
    const grund = calm[0];
    if (grund === undefined || grund.anteil < data.grund_anteil_min)
      return { schritt: "neutraltoene", offen: true, satz: OFFEN };
    const hell = grund.oklch.l >= data.hell_ab;
    const flaeche = calm
      .slice(1)
      .find(
        (area) => area.anteil >= data.flaeche_anteil_min && area.oklch.l >= data.hell_ab === hell,
      );
    const areas = flaeche === undefined ? [grund] : [grund, flaeche];
    const weight = areas.reduce((sum, area) => sum + area.anteil, 0);
    const vector = areas.reduce(
      (sum, area) => {
        const angle = (area.oklch.h * Math.PI) / 180;
        return {
          a: sum.a + area.anteil * area.oklch.c * Math.cos(angle),
          b: sum.b + area.anteil * area.oklch.c * Math.sin(angle),
        };
      },
      { a: 0, b: 0 },
    );
    const chroma = Math.hypot(vector.a, vector.b) / weight;
    const getoent = chroma >= data.getoent_ab;
    const farbton = ((((Math.atan2(vector.b, vector.a) * 180) / Math.PI) % 360) + 360) % 360;
    const lead = leadOf(eniro);
    const leadHasHue = lead !== undefined && lead.c >= ACHROMATIC;
    const toenung =
      getoent && leadHasHue
        ? round2(Math.min(1, Math.max(0, chroma / (lead.c * NEUTRAL_SHARE))))
        : 0;
    const abweichend =
      getoent &&
      leadHasHue &&
      Math.abs(hueDifference(farbton, lead.h)) > data.farbton_abweichung_max;
    const anteil = (area: Area) => Math.round(area.anteil);
    const herkunft: Herkunft = herkunftOf(
      eniro.kunteksto,
      grund.herkunft.dosiero,
      `Grundfläche ${grund.hex}`,
      anteil(grund),
    );
    const weitere =
      flaeche === undefined
        ? []
        : [
            herkunftOf(
              eniro.kunteksto,
              flaeche.herkunft.dosiero,
              `Fläche ${flaeche.hex}`,
              anteil(flaeche),
            ),
          ];
    const ton = getoent ? `${farbtonName(farbton)} getönt` : "ungetönt grau";
    const saetze = [
      `Neutraltöne: Grund ${hell ? "hell" : "dunkel"}, ${ton}; Tönung ${comma(toenung)} (Grundfläche ${grund.hex}${flaeche === undefined ? "" : `, Fläche ${flaeche.hex}`}).`,
      ...(hell
        ? []
        : [
            "Einen dunklen Grund zeigt die Marke im Dunkelmodus; den stellst du im Schritt „Dunkelmodus und hoher Kontrast“ ein.",
          ]),
      ...(getoent && !leadHasHue
        ? ["Die Leitfarbe hat keinen Farbton, darum bleiben die Neutraltöne grau."]
        : []),
      ...(abweichend
        ? [
            "Der Grund ist anders getönt als die Leitfarbe; die Neutraltöne folgen der Leitfarbe, übernommen wird nur die Stärke der Tönung.",
          ]
        : []),
    ];
    return {
      schritt: "neutraltoene",
      wert: {
        grund: hell ? "hell" : "dunkel",
        getoent,
        ...(getoent ? { farbton: Math.round(farbton) } : {}),
        toenung,
      },
      herkunft,
      ...(weitere.length === 0 ? {} : { weitere }),
      sicherheit: eniro.kunteksto.quelle === "bild" && !abweichend ? "hoch" : "mittel",
      satz: saetze.join(" "),
      agordo: { neutral: { toenung } },
    };
  },
};
