// The Lingvo-Schalter of the Studio and the Schnellstart (Spec 026 ②): the switch of the Vitrino
// (Esperanto / Deutsch / English, Esperanto the default) on every screen; the names of the page
// stand in spans with the key of their name, their German and English names in the page's data
// island (only the names the page shows); the choice stays per browser (localStorage, guarded).

import { buildModelo, nomoTabelo } from "@fundamento/modelo";
import { loadBases } from "./vorschau.js";

let cached: { de: Record<string, string>; en: Record<string, string> } | undefined;

/** The names of the structure the Studio reads (core and komuna), German and English by key. */
export function metiejoNomoj(): { de: Record<string, string>; en: Record<string, string> } {
  cached ??= nomoTabelo(buildModelo(loadBases().structure.files).modelo);
  return cached;
}

/** The headings of the Studio's own words in English; German is the text they are written with. */
export const STUDIO_TEKSTOJ: Readonly<Record<string, { en: string }>> = {
  farbe: { en: "Colour" },
  schrift: { en: "Type" },
  raum: { en: "Space" },
  form: { en: "Shape" },
  tiefe: { en: "Depth" },
  bewegung: { en: "Motion" },
  semantik: { en: "Semantics" },
  komponenten: { en: "Components" },
  anatomie: { en: "Anatomy" },
  gebrauch: { en: "Usage" },
  verhalten: { en: "Behaviour" },
};

/** The island of a page: the names its body shows, and the English headings. */
export function nomojIsland(body: string): {
  de: Record<string, string>;
  en: Record<string, string>;
  tekstoj: Readonly<Record<string, { en: string }>>;
} {
  const table = metiejoNomoj();
  const keys = new Set(
    [...body.matchAll(/data-fm-nomo="([^"]+)"/g)].map((match) => match[1] ?? ""),
  );
  const pick = (names: Record<string, string>) =>
    Object.fromEntries(
      [...keys].filter((key) => names[key] !== undefined).map((key) => [key, names[key] ?? ""]),
    );
  return { de: pick(table.de), en: pick(table.en), tekstoj: STUDIO_TEKSTOJ };
}
