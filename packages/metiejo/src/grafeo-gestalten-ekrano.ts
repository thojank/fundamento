// Spec 054 T2 (MPFG-2.1): the page of the view Gestalten. It carries no judgment and nothing of the
// brand's look: the root names the neutral Belegung of the editor package (its stylesheet
// `/nodredaktilo/leinwand.css`), the canvas scheme comes from the URL (dark unless light is asked),
// and the canvas itself – header, phases, nodes – is drawn by the bundle into the mount point.

import { escapeHtml } from "./html.js";

/** What the page of the view Gestalten shows. */
export interface GestaltenScreen {
  /** The brand's identifier: the data URL and `data-nr-marko` of the mount point. */
  marko: string;
  /** The brand as written (`etikedoj.marko`, else the identifier), for the title only. */
  etikedo: string;
  /** The name of the Belegung: the root's `data-fm-aspekto`, the selector of its stylesheet. */
  aspekto: string;
  /** The scheme of the canvas itself (E-8); the switch in the header changes it in the browser. */
  scheme: "light" | "dark";
}

/** The stylesheet of the neutral Belegung, served by the Metiejo. */
export const LEINWAND_CSS_HREF = "/nodredaktilo/leinwand.css";

/**
 * The room of the canvas: the page fills the window and the mount point all of it. Only roles of
 * the Belegung; the native controls follow the scheme of the root.
 */
const GESTALTEN_CSS = `:root { block-size: 100%; color-scheme: dark; }
:root[data-fm-color-scheme="light"] { color-scheme: light; }
body { margin: 0; block-size: 100%; font-family: var(--fm-typography-body-1-font-family); background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); }
#nr-leinwand { block-size: 100%; }`;

/**
 * Spec 054 T2: the page of the view Gestalten – the Belegung on the root in the asked scheme, its
 * stylesheet, the Eroj, and the mount point of the bundle with the view, the data URL and the brand.
 */
export function gestaltenScreen(doc: GestaltenScreen): string {
  const marko = encodeURIComponent(doc.marko);
  return `<!doctype html>
<html lang="de" data-fm-aspekto="${escapeHtml(doc.aspekto)}" data-fm-color-scheme="${doc.scheme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leinwand ${escapeHtml(doc.etikedo)}</title>
<link rel="stylesheet" href="${LEINWAND_CSS_HREF}">
<style>${GESTALTEN_CSS}</style>
<script type="module" src="/eroj/define.js"></script>
</head>
<body>
<div id="nr-leinwand" data-nr-ansicht="gestalten" data-nr-fonto="/api/leinwand?marko=${escapeHtml(marko)}" data-nr-marko="${escapeHtml(doc.marko)}"></div>
<script type="module" src="/nodredaktilo/leinwand.js"></script>
</body>
</html>
`;
}
