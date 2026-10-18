// The Vitrino document (Spec 004, FR-05, FR-09, contracts/vitrino §2). A pure function: it holds
// no colour and no number of its own — the stylesheet, the element bundle and the data island come
// from the build. Every colour stands in a table row next to its token name and its measurement,
// so colour is never the only information (WCAG 1.4.1).

import { VITRINO_SURFACE, type VitrinoDatumoj } from "./datumoj.js";
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
body { margin: 0; font-family: var(--fm-typography-body-1-font-family); background-color: var(--fm-${VITRINO_SURFACE.replaceAll(".", "-")}); color: var(--fm-color-text-default); }
header, main { padding: var(--fm-spacing-large); display: flex; flex-direction: column; gap: var(--fm-spacing-large); }
h1, h2 { margin: 0; font-family: var(--fm-typography-headline-2-font-family); }
table { border-collapse: collapse; width: 100%; font-size: var(--fm-typography-label-1-font-size); }
caption { text-align: start; padding-block-end: var(--fm-spacing-small); }
th, td { text-align: start; padding: var(--fm-spacing-small); border-block-end: var(--fm-border-width-default) solid var(--fm-color-border-subtle); }
.fm-swatch { display: inline-block; inline-size: 2.5rem; block-size: 1.25rem; border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); vertical-align: middle; }
.fm-group { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); align-items: center; }
.fm-group button { font: inherit; padding: var(--fm-spacing-small); background-color: var(--fm-color-action-secondary-rest); color: var(--fm-color-action-secondary-text); border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); cursor: pointer; }
.fm-group button[aria-pressed="true"] { background-color: var(--fm-color-action-primary-rest); color: var(--fm-color-action-primary-text); }
.fm-row { display: flex; align-items: center; gap: var(--fm-spacing-small); }
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
<div class="fm-group"><button type="button" id="fm-vitrino-komparo-switch">Zur Gegenüberstellung</button></div>`;
}

/** A section; one the header's button leads to takes the focus (`tabindex="-1"`). */
const section = (id: string, title: string, body: string, focusable = false): string =>
  `<section id="fm-vitrino-${id}"${focusable ? ' tabindex="-1"' : ""}><h2>${escapeHtml(title)}</h2>${body}</section>`;

/** `butono` → `Butono`, for the question of a section. */
const capitalised = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * The use of every Ero (Spec 007 T027, S5): purpose, what not to use it for, what to use instead,
 * what its slots take, how it lays out and what its label may say — the same data as get_ero.
 */
function uzo(datumoj: VitrinoDatumoj): string {
  const entries = Object.entries(datumoj.uzo);
  if (entries.length === 0) return "<p>Kein Ero mit Uzo im Modelo.</p>";
  return entries
    .map(([ero, use]) => {
      const boundaries = [
        ...use.boundary.map(
          (boundary) =>
            `<li><strong>${escapeHtml(boundary.case)}</strong> (${escapeHtml(boundary.action)}${boundary.ero === undefined ? "" : `: ${escapeHtml(boundary.ero)}`}): ${escapeHtml(boundary.kialo)}</li>`,
        ),
        ...use.instead.map(
          (alternative) =>
            `<li><strong>${escapeHtml(alternative.goal)}</strong> (${alternative.ero === null ? "nicht abgedeckt, ask-human" : `stattdessen ${escapeHtml(alternative.ero)}`}): ${escapeHtml(alternative.kialo)}</li>`,
        ),
      ].join("");
      const together = [
        ...use.composes.containers.map(
          (entry) =>
            `<li>in <code>${escapeHtml(entry.name)}</code>: ${escapeHtml(entry.kialo)}</li>`,
        ),
        ...use.composes.with.map(
          (entry) =>
            `<li>mit <code>${escapeHtml(entry.ero)}</code>: ${escapeHtml(entry.kialo)}</li>`,
        ),
        ...use.composes.never.map(
          (entry) =>
            `<li>nie mit <code>${escapeHtml(entry.ero)}</code>: ${escapeHtml(entry.kialo)}</li>`,
        ),
        `<li>Abstand: beim ${escapeHtml(use.composes.spacing.owner)} (<code>${escapeHtml(use.composes.spacing.regulo.name)}</code>)</li>`,
      ].join("");
      // F-6 (Abnahme Spec 009): the table says which slot is a duty.
      const slots = Object.entries(use.slots).map(
        ([slot, rule]) =>
          `<tr><th scope="row"><code>${escapeHtml(slot)}</code></th><td>${escapeHtml((rule.accepts ?? []).join(", "))}</td><td>${rule.max ?? "–"}</td><td>${rule.nesting ?? "–"}</td><td>${rule.required === true ? "ja" : "–"}</td></tr>`,
      );
      const allowances = Object.entries(use.layout)
        .flatMap(([prop, allowance]) => {
          if (typeof allowance !== "object") return [];
          const places = [
            ...(allowance.allowedIn.containers ?? []).map((name) => `Container ${name}`),
            ...Object.entries(allowance.allowedIn.dimensioj ?? {}).flatMap(([dimensio, values]) =>
              values.map((value) => `${dimensio}=${value}`),
            ),
          ];
          return [
            `<li><code>${escapeHtml(prop)}</code> nur in ${escapeHtml(places.join(" oder "))} (<code>${escapeHtml(allowance.regulo.name)}</code>): ${escapeHtml(allowance.regulo.kialo)}</li>`,
          ];
        })
        .join("");
      const text = use.content
        .map(
          (rule) =>
            `<li><strong>${escapeHtml(rule.regulo.name)}</strong> (${rule.fixed ? "fest" : "anpassbar"}): ${escapeHtml(rule.regulo.statement)} <em>${escapeHtml(rule.regulo.kialo)}</em></li>`,
        )
        .join("");
      return `<article><h3>${escapeHtml(ero)}</h3><p>${escapeHtml(use.purpose)}</p><h4>Wann nehme ich den ${escapeHtml(capitalised(ero))} nicht?</h4><ul>${boundaries}</ul><h4>Zusammen mit</h4><ul>${together}</ul>${table("Slots", ["Slot", "nimmt auf", "max", "Verschachtelung", "Pflicht"], slots)}<h4>Layout</h4><p>Größe aus dem ${use.layout.size === "content" ? "Inhalt" : "Container"}, ${wrapSentence(datumoj.a11yRoloj[ero], use.layout.wrap, datumoj.plurliniaj.includes(ero))}.</p><ul>${allowances}</ul><h4>Text</h4><ul>${text}</ul></article>`;
    })
    .join("");
}

/**
 * The sentence on wrapping (Abnahme Spec 008 and 009, C8): its subject is what the Ero lays out
 * in one line — the input line of a textbox, the label of everything else — and `with-text` says
 * where the label may break (inline) and where never (standalone), instead of "darf umbrechen"
 * for both.
 */
function wrapSentence(role: string | undefined, wrap: string, multiline = false): string {
  // A radio group (Spec 010 ③): what never breaks is each option and the row of options.
  if (role === "radiogroup" && wrap === "never") return "keine Option bricht um";
  // A select (Spec 010 ④): what never breaks is the closed field with the chosen option. A text
  // area (Spec 011 ②): its text wraps by nature, what never breaks is its label; a dialog: what
  // may break is its heading.
  const subject =
    role === "textbox"
      ? multiline
        ? "Beschriftung"
        : "Eingabezeile"
      : role === "combobox"
        ? "Feld"
        : role === "dialog"
          ? "Überschrift"
          : // Spec 011 ③: a live region (notice, state) wraps its text; a badge its label (never).
            role === "status"
            ? "Text"
            : // Spec 011 ④: a table scrolls its region (never wraps), a list wraps its values, a
              // meter never wraps its text.
              role === "table"
              ? "Region"
              : role === "list"
                ? "Wert"
                : role === "meter"
                  ? "Wertetext"
                  : // Spec 011 ⑤: a navigation wraps its row of items, the tabs never wrap.
                    role === "navigation"
                    ? "Leiste"
                    : role === "tablist"
                      ? "Reiter"
                      : // Spec 014 ②: an icon never wraps its glyph, a separator its line.
                        role === "img"
                        ? "Glyphe"
                        : role === "separator"
                          ? "Linie"
                          : // Spec 014 ③: a heading wraps its words, a paragraph its text.
                            role === "heading"
                            ? "Überschrift"
                            : role === "paragraph"
                              ? "Text"
                              : // Spec 014 ④: a tooltip wraps its hint, a menu never wraps an entry.
                                role === "tooltip"
                                ? "Hinweis"
                                : role === "menu"
                                  ? "Eintrag"
                                  : "Label";
  if (wrap === "never") return `${subject} bricht nie um`;
  if (wrap === "with-text") return `${subject} darf umbrechen (inline), standalone nie`;
  return `${subject} darf umbrechen`;
}

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
                `<tr><th scope="row">${step.stupo}</th><td>${swatch(step.token)}</td><td><code>${escapeHtml(step.token)}</code></td><td>${escapeHtml(step.hex)}</td><td>${step.l === undefined ? "–" : step.l.toFixed(3)}</td></tr>`,
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
        `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th><td>${swatch(row.token)}</td><td>${escapeHtml(row.hex)}</td><td>${row.l === undefined ? "–" : row.l.toFixed(3)}</td><td>${row.alNaskbo === undefined ? "–" : row.alNaskbo.toFixed(3)}</td><td>${row.alEkstremo === undefined ? "–" : row.alEkstremo.toFixed(3)}</td></tr>`,
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
${Object.entries(datumoj.eroj)
  .map(([ero, markup]) => section(ero, ero, markup))
  .join("\n")}
${section("uzo", "Gebrauch", uzo(datumoj))}
${section("kontrasto", "Kontrastmatrix", '<div id="fm-vitrino-kontrasto-tabelo"></div>')}
${section("regularo", "Regularo und Ziele", '<div id="fm-vitrino-regularo-tabelo"></div>')}
${section("kovrado", "Eigene Werte je Dimensio", '<div id="fm-vitrino-kovrado-tabelo"></div>')}
${section("komparo", "Gegenüberstellung", '<div id="fm-vitrino-komparo-tabelo"></div>', true)}
</main>
<script type="module" id="fm-vitrino-elemento">${elementJs}</script>
<script type="module" id="fm-vitrino-skripto">${vitrinoSkripto()}</script>
</body>
</html>
`;
}
