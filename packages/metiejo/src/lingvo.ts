// The Lingvo-Schalter of the Studio and the Schnellstart (Spec 026 ②): the switch of the Vitrino
// (Esperanto / Deutsch / English, Esperanto the default) on every screen; the names of the page
// stand in spans with the key of their name, their German and English names in the page's data
// island (only the names the page shows); the choice stays per browser (localStorage, guarded).

import { buildModelo, nomoTabelo } from "@fundamento/modelo";
import { loadBases } from "./vorschau.js";

let cached: { de: Record<string, string>; en: Record<string, string> } | undefined;

/**
 * The names of the structure the Studio reads (core and komuna), German and English by key; German
 * with the texts of the Uzoj and Reguloj, English only names (it is the source of the texts).
 */
export function metiejoNomoj(): { de: Record<string, string>; en: Record<string, string> } {
  // Nachlese 10 N-6: German holds the texts of the Uzoj too (the purpose of a component).
  if (cached === undefined) {
    const modelo = buildModelo(loadBases().structure.files).modelo;
    const names = nomoTabelo(modelo);
    cached = { de: { ...(modelo.tradukoj?.de ?? {}), ...names.de }, en: names.en };
  }
  return cached;
}

/** The headings of the Studio's own words in English; German is the text they are written with. */
export const STUDIO_TEKSTOJ: Readonly<Record<string, { de?: string; en: string }>> = {
  // Nachlese 10 N-1: the switch is named in the language it shows; Esperanto „lingvo“.
  lingvo: { de: "Sprache", en: "Language" },
  "varianten-zustaende": { en: "Variants × states" },
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
  tekstoj: Readonly<Record<string, { de?: string; en: string }>>;
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

let dimensioj: Record<string, { key: string; valoroj: Record<string, string> }> | undefined;

/** The keys of the names of the Dimensioj and their values (Nachlese 10 N-7), by name. */
export function dimensioNomoj(): Record<string, { key: string; valoroj: Record<string, string> }> {
  dimensioj ??= Object.fromEntries(
    buildModelo(loadBases().structure.files).modelo.dimensioj.map((dimensio) => [
      dimensio.name,
      {
        key: `${dimensio.id}/name`,
        valoroj: Object.fromEntries(
          (dimensio.valoroj ?? []).map((valoro) => [valoro.name, `${valoro.id}/name`]),
        ),
      },
    ]),
  );
  return dimensioj;
}
