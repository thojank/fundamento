// Spec 036 Teil 3 – the stage of the assistant (Skizze 1 of Spec 035): the preview becomes the
// largest surface. It shows a page of the brand built of its Eroj (`buehne-<seite>` of the preview),
// in light or dark. Built of Fundamento's own Eroj (M-2): fm-elekto chooses the scheme. Pure.

import { escapeHtml } from "./html.js";

export interface BuehneInput {
  /** The brand. */
  name: string;
  /** The Studio page of the step: what the stage shows below the page. */
  studio: string;
  /** The step; with an open proposal the stage shows it as well. */
  faceto: string;
  /** Whether the step has an open proposal. */
  propono: boolean;
}

/** The address of the stage's frame for a brand and a Studio page. */
export const buehneSrc = (name: string, studio: string): string =>
  `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=buehne-${encodeURIComponent(studio)}&breite=mittel`;

/** The choice of light or dark, an fm-elekto as the screens' other switches. */
const SCHEMA_WAHL = `<fm-elekto name="schema" label="Darstellung" value="light" orientation="horizontal" size="small" data-mt-buehne-schema><data slot="options" value="light">Hell</data><data slot="options" value="dark">Dunkel</data></fm-elekto>`;

/** The stage: the scheme switch and the frame of the page – with an open proposal, both states. */
export function buehneHtml(input: BuehneInput): string {
  const src = buehneSrc(input.name, input.studio);
  const jetzt = `<iframe data-mt-vorschau data-mt-src="${escapeHtml(src)}" title="Vorschau der Marke"></iframe>`;
  const rahmen = input.propono
    ? `<fm-teksto kind="caption">Jetzt</fm-teksto><div class="mt-buehne-rahmen">${jetzt}</div><fm-teksto kind="caption">Mit dem Vorschlag</fm-teksto><div class="mt-buehne-rahmen"><iframe data-mt-vorschau-propono data-mt-src="${escapeHtml(`${src}&propono=${encodeURIComponent(input.faceto)}`)}" title="Vorschau mit dem Vorschlag"></iframe></div>`
    : `<div class="mt-buehne-rahmen">${jetzt}</div>`;
  return `<div class="mt-buehne" data-mt-buehne><div class="mt-buehne-leiste">${SCHEMA_WAHL}</div>${rahmen}</div>`;
}
