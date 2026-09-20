// The Vitrino document (Spec 004, FR-05, FR-09, contracts/vitrino §2). A pure function: it holds
// no colour and no number of its own — the stylesheet, the element bundle and the data island come
// from the build. Every colour stands in a table row next to its token name and its measurement,
// so colour is never the only information (WCAG 1.4.1).

import type { VitrinoDatumoj } from "./datumoj.js";
import { vitrinoSkripto } from "./skripto.js";

export interface VitrinoInput {
  /** The CSS Celo's stylesheet with every Aspekto and Dimensio. */
  css: string;
  /** The bundled, React-free element module of the reference kit. */
  elementJs: string;
  datumoj: VitrinoDatumoj;
}

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  );

/** JSON for a `<script type="application/json">`: `</` must not end the element. */
const jsonIsland = (value: unknown): string =>
  JSON.stringify(value).replaceAll("</", "<\\/").replaceAll("<!--", "<\\!--");

const LAYOUT = `:root { color-scheme: light dark; }
body { margin: 0; font-family: var(--fm-typography-body-1-font-family); background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); }
header, main { padding: var(--fm-spacing-large); display: flex; flex-direction: column; gap: var(--fm-spacing-large); }
h1, h2 { margin: 0; font-family: var(--fm-typography-headline-2-font-family); }
table { border-collapse: collapse; width: 100%; font-size: var(--fm-typography-label-1-font-size); }
caption { text-align: start; padding-block-end: var(--fm-spacing-small); }
th, td { text-align: start; padding: var(--fm-spacing-small); border-block-end: var(--fm-border-width-default) solid var(--fm-color-border-subtle); }
.fm-swatch { display: inline-block; inline-size: 2.5rem; block-size: 1.25rem; border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); vertical-align: middle; }
.fm-group { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); align-items: center; }
.fm-group button { font: inherit; padding: var(--fm-spacing-small); background-color: var(--fm-color-action-secondary-rest); color: var(--fm-color-action-secondary-text); border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); cursor: pointer; }
.fm-group button[aria-pressed="true"] { background-color: var(--fm-color-action-primary-rest); color: var(--fm-color-action-primary-text); }
.fm-kolumnoj { display: grid; grid-template-columns: 1fr 1fr; gap: var(--fm-spacing-large); }
.fm-kolumno { padding: var(--fm-spacing-medium); background-color: var(--fm-color-background-default); }
[hidden] { display: none !important; }`;

function switcher(datumoj: VitrinoDatumoj): string {
  const dimensioj = datumoj.dimensioj
    .map((dimensio) => {
      const buttons = dimensio.valoroj
        .map(
          (valoro) =>
            `<button type="button" data-fm-switch="${escapeHtml(dimensio.name)}" data-fm-valoro="${escapeHtml(valoro)}" aria-pressed="${valoro === dimensio.default}">${escapeHtml(valoro)}</button>`,
        )
        .join("");
      return `<div class="fm-group" role="group" aria-label="${escapeHtml(dimensio.name)}"><span>${escapeHtml(dimensio.name)}</span>${buttons}</div>`;
    })
    .join("");
  const aspektoj = datumoj.aspektoj
    .map(
      (aspekto) =>
        `<button type="button" data-fm-switch="aspekto" data-fm-valoro="${escapeHtml(aspekto)}" aria-pressed="${aspekto === datumoj.aspektoj[0]}">${escapeHtml(aspekto)}</button>`,
    )
    .join("");
  return `<div class="fm-group" role="group" aria-label="aspekto"><span>aspekto</span>${aspektoj}</div>${dimensioj}
<div class="fm-group"><button type="button" id="fm-vitrino-komparo-switch" aria-pressed="false">Gegenüberstellung</button></div>`;
}

const section = (id: string, title: string, body: string): string =>
  `<section id="fm-vitrino-${id}"><h2>${escapeHtml(title)}</h2>${body}</section>`;

const table = (caption: string, head: readonly string[], rows: readonly string[]): string =>
  `<table><caption>${escapeHtml(caption)}</caption><thead><tr>${head
    .map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`)
    .join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;

const swatch = (token: string): string =>
  `<span class="fm-swatch" style="background-color: var(--fm-${token.replaceAll(".", "-")})" aria-hidden="true"></span>`;

function paletroj(datumoj: VitrinoDatumoj): string {
  return Object.entries(datumoj.paletroj)
    .map(([aspekto, ramps]) => {
      const tables = ramps
        .map((ramp) =>
          table(
            `${aspekto} · ${ramp.rampo}`,
            ["Stufe", "Farbe", "Token", "Hex", "OKLCH L"],
            ramp.stupoj.map(
              (step) =>
                `<tr><th scope="row">${step.stupo}</th><td>${swatch(step.token)}</td><td><code>${escapeHtml(step.token)}</code></td><td>${escapeHtml(step.hex)}</td><td>${step.l.toFixed(3)}</td></tr>`,
            ),
          ),
        )
        .join("");
      return `<div data-fm-aspekto-panel="${escapeHtml(aspekto)}">${tables}</div>`;
    })
    .join("");
}

function roleTable(caption: string, rows: VitrinoDatumoj["roloj"][string]["surfaces"]): string {
  return table(
    caption,
    ["Rolle", "Farbe", "Hex", "OKLCH L", "Abstand zur Nachbarin", "Abstand zum Anker"],
    rows.map(
      (row) =>
        `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th><td>${swatch(row.token)}</td><td>${escapeHtml(row.hex)}</td><td>${row.l.toFixed(3)}</td><td>${row.alNaskbo === undefined ? "–" : row.alNaskbo.toFixed(3)}</td><td>${row.alEkstremo === undefined ? "–" : row.alEkstremo.toFixed(3)}</td></tr>`,
    ),
  );
}

/** The whole document; `datumoj` decides everything that is shown. */
export function vitrinoHtml({ css, elementJs, datumoj }: VitrinoInput): string {
  const first = datumoj.kombinoj[0] ?? "";
  const attributes = datumoj.dimensioj
    .map((dimensio) => ` data-fm-${dimensio.name}="${escapeHtml(dimensio.default)}"`)
    .join("");
  const roles = Object.entries(datumoj.roloj)
    .map(
      ([key, entry]) =>
        `<div data-fm-roloj="${escapeHtml(key)}" hidden>${roleTable("Flächen", entry.surfaces)}${roleTable("Text", entry.text)}${roleTable("Status", entry.status)}${roleTable("Aktionen", entry.agoj)}</div>`,
    )
    .join("");
  return `<!doctype html>
<html lang="de" data-fm-aspekto="${escapeHtml(datumoj.aspektoj[0] ?? "")}"${attributes}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fundamento Vitrino</title>
<style id="fm-vitrino-css">${css}</style>
<style id="fm-vitrino-layout">${LAYOUT}</style>
<script type="application/json" id="fm-vitrino">${jsonIsland(datumoj)}</script>
</head>
<body data-fm-kombino="${escapeHtml(first)}">
<header id="fm-vitrino-kapo">
  <h1>Fundamento Vitrino <small>v${escapeHtml(datumoj.fundamento)}</small></h1>
  ${switcher(datumoj)}
</header>
<main>
${section("paletroj", "Paletten", paletroj(datumoj))}
${section("roloj", "Flächen, Text, Status und Aktionen", roles)}
${section("butono", "butono", datumoj.butono)}
${section("kontrasto", "Kontrastmatrix", '<div id="fm-vitrino-kontrasto-tabelo"></div>')}
${section("regularo", "Regularo und Ziele", '<div id="fm-vitrino-regularo-tabelo"></div>')}
${section("kovrado", "Eigene Werte je Dimensio", '<div id="fm-vitrino-kovrado-tabelo"></div>')}
${section("komparo", "Gegenüberstellung", '<div id="fm-vitrino-komparo-tabelo"></div>')}
</main>
<script type="module" id="fm-vitrino-elemento">${elementJs}</script>
<script type="module" id="fm-vitrino-skripto">${vitrinoSkripto()}</script>
</body>
</html>
`;
}
