// Spec 036 Teil 3 – the stage of the assistant (Skizze 1 of Spec 035): the preview becomes the
// largest surface. It shows a page of the brand built of its Eroj (`buehne-<seite>` of the preview),
// in light or dark, now and with the step's proposal. Built of Fundamento's own Eroj (M-2):
// fm-elekto chooses the scheme, fm-glitilo cuts the two frames, fm-sxaltilo switches them. Pure.

import type { Propono } from "./enportilo/rekono.js";
import type { Trovo } from "./enportilo/trovo.js";
import { escapeHtml } from "./html.js";

export interface BuehneInput {
  /** The brand. */
  name: string;
  /** The Studio page of the step: what the stage shows below the page. */
  studio: string;
  /** The step: the frame „Mit dem Vorschlag“ lays its open proposal on the draft. */
  faceto: string;
}

/** The address of the stage's frame for a brand and a Studio page. */
export const buehneSrc = (name: string, studio: string): string =>
  `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=buehne-${encodeURIComponent(studio)}&breite=mittel`;

/** The choice of light or dark, an fm-elekto as the screens' other switches. */
const SCHEMA_WAHL = `<fm-elekto name="schema" label="Darstellung" value="light" orientation="horizontal" size="small" data-mt-buehne-schema><data slot="options" value="light">Hell</data><data slot="options" value="dark">Dunkel</data></fm-elekto>`;

/** Where the cut between the two frames stands when the stage opens: in the middle. */
const SCHNITT_ANFANG = 50;

/**
 * The stage (Befund 3.2): the frame „Jetzt“ (the draft) and over it the frame „Mit dem Vorschlag“
 * (the step's open proposal laid on the draft, `propono`; without one both show the draft, D-92 of
 * Spec 035). An fm-glitilo cuts them – left of the cut now, right of it with the proposal; in a
 * narrow window an fm-sxaltilo shows one of the two instead. „Übernehmen“ is the step's action
 * `akcepto` of the existing route.
 */
export function buehneHtml(input: BuehneInput): string {
  const src = buehneSrc(input.name, input.studio);
  const vorschlagSrc = `${src}&propono=${encodeURIComponent(input.faceto)}`;
  return `<div class="mt-buehne" data-mt-buehne>
<div class="mt-buehne-leiste">${SCHEMA_WAHL}<fm-butono emphasis="medium" data-mt-faceto-ago="akcepto">Übernehmen</fm-butono></div>
<div class="mt-buehne-leiste" data-mt-buehne-beschriftung><fm-teksto kind="caption">Jetzt</fm-teksto><fm-teksto kind="caption">Mit dem Vorschlag</fm-teksto></div>
<div class="mt-buehne-rahmen" data-mt-buehne-rahmen style="--mt-schnitt: ${SCHNITT_ANFANG}%"><iframe data-mt-vorschau data-mt-src="${escapeHtml(src)}" title="Vorschau der Marke"></iframe><iframe data-mt-vorschau-propono data-mt-src="${escapeHtml(vorschlagSrc)}" title="Vorschau mit dem Vorschlag"></iframe><div class="mt-buehne-schnitt" aria-hidden="true"></div></div>
<fm-glitilo label="Jetzt und mit dem Vorschlag" min="0" max="100" step="1" value="${SCHNITT_ANFANG}" data-mt-schieber></fm-glitilo>
<fm-sxaltilo name="vorschlag" data-mt-umschalter>Mit dem Vorschlag</fm-sxaltilo>
</div>`;
}

/** A tile of what material or research found (Befund 3.4): a colour and its share in per cent. */
export interface Kahelo {
  farbo: string;
  /** Of everything the reading saw, rounded; absent where nothing measured an area or a count. */
  anteil?: number;
}

/** No more tiles than fit one look: the dialog shows the strongest colours. */
const KAHELOJ_MAX = 8;

const HEX6 = /^#[0-9a-f]{6}$/;

/**
 * The colours of a reading as tiles (Befund 3.4): per colour the weight of every finding of it –
 * the share of an image's area, the count in a PDF or a stylesheet – as a share of all colours
 * found, the largest first. Shares under one per cent are left out.
 */
export function kahelojElTrovoj(trovoj: readonly Trovo[]): Kahelo[] {
  const pezoj = new Map<string, number>();
  for (const trovo of trovoj) {
    if (trovo.kind !== "farbo" || typeof trovo.valoro !== "string") continue;
    const farbo = trovo.valoro.toLowerCase();
    if (!HEX6.test(farbo) || !(trovo.pezo > 0)) continue;
    pezoj.set(farbo, (pezoj.get(farbo) ?? 0) + trovo.pezo);
  }
  const total = [...pezoj.values()].reduce((sum, pezo) => sum + pezo, 0);
  return [...pezoj]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([farbo, pezo]) => ({ farbo, anteil: Math.round((100 * pezo) / total) }))
    .filter((kahelo) => kahelo.anteil >= 1)
    .slice(0, KAHELOJ_MAX);
}

/** A share an origin names: „62,0 % des Bildschirms“ (the Enportilo's words for an area). */
const ANTEIL = /^(\d+(?:,\d+)?)\s?%/;

/**
 * The colours of research as tiles (Befund 3.4): research answers with proposals, so a tile is a
 * colour a proposal sets, with the share its origin measured on a rendered page; a colour that
 * came from the code alone has no share and says so. The largest first.
 */
export function kahelojElProponoj(proponoj: readonly Propono[]): Kahelo[] {
  const anteile = new Map<string, number | undefined>();
  for (const propono of proponoj) {
    const measured = propono.herkunft
      .map((entry) => ANTEIL.exec(entry.loko ?? "")?.[1])
      .filter((value): value is string => value !== undefined)
      .map((value) => Number(value.replace(",", ".")));
    const anteil = measured.length === 0 ? undefined : Math.max(...measured);
    const walk = (value: unknown): void => {
      if (typeof value === "string") {
        const farbo = value.toLowerCase();
        if (!HEX6.test(farbo)) return;
        const known = anteile.get(farbo);
        anteile.set(farbo, known === undefined ? anteil : Math.max(known, anteil ?? 0));
      } else if (typeof value === "object" && value !== null) {
        for (const entry of Object.values(value)) walk(entry);
      }
    };
    walk(propono.agordo);
  }
  return [...anteile]
    .sort(([a, x], [b, y]) => (y ?? -1) - (x ?? -1) || a.localeCompare(b))
    .map(([farbo, anteil]) =>
      anteil === undefined ? { farbo } : { farbo, anteil: Math.round(anteil) },
    )
    .slice(0, KAHELOJ_MAX);
}
