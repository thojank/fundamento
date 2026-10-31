// Spec 036 Teil 3 – the stage of the assistant (Skizze 1 of Spec 035): the preview becomes the
// largest surface. It shows a page of the brand built of its Eroj (`buehne-<seite>` of the preview),
// in light or dark, now and with the step's proposal. Built of Fundamento's own Eroj (M-2):
// fm-elekto chooses the scheme, fm-glitilo cuts the two frames, fm-sxaltilo switches them. Pure.

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
