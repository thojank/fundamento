// The Vitrino document (Spec 004, FR-05, FR-09, contracts/vitrino §2). A pure function: it holds
// no colour and no number of its own — the stylesheet, the element bundle and the data island come
// from the build. Every colour stands in a table row next to its token name and its measurement,
// so colour is never the only information (WCAG 1.4.1).

import type { Calibration, IkonoGewichte } from "@fundamento/agordilo";
import type { ModeloFiles } from "@fundamento/modelo";
import { VITRINO_SURFACE, type VitrinoDatumoj } from "./datumoj.js";
import { vitrinoSkripto } from "./skripto.js";

/**
 * The data island of the Werkstatt (Spec 016 ②, plan ② D-02): what the Agordilo needs to derive
 * and check in the browser. Every path in it is relative to the Modelo root; no machine path.
 */
export interface WerkstattDatumoj {
  structure: { files: ModeloFiles; fingerprint: string; ikonoGewichte?: IkonoGewichte };
  calibration: Calibration;
  schemas: { modelo: Record<string, unknown>; config: Record<string, unknown> };
  /** The reference Aspekto the draft is derived over (komuna). */
  reference: string;
  /** Every Aspekto of the build, for the comparison. */
  aspektoj: string[];
}

export interface VitrinoInput {
  /** The CSS Celo's stylesheet with every Aspekto and Dimensio. */
  css: string;
  /** The bundled, React-free element module of the reference kit. */
  elementJs: string;
  datumoj: VitrinoDatumoj;
  /** The Werkstatt (Spec 016 ②): its data island and the bundled Agordilo; absent without a reference Aspekto. */
  werkstatt?: WerkstattDatumoj;
  werkstattJs?: string;
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
.fm-breiten { display: flex; flex-direction: column; gap: var(--fm-spacing-large); }
.fm-sxablono { margin: 0; display: flex; flex-direction: column; gap: var(--fm-spacing-small); }
.fm-breite { overflow-x: auto; border: var(--fm-border-width-default) dashed var(--fm-color-border-default); }
.fm-breite[data-fm-breite="schmal"] { inline-size: calc(var(--fm-size-container-small) / 2); }
.fm-breite[data-fm-breite="mittel"] { inline-size: var(--fm-size-container-medium); max-inline-size: 100%; }
.fm-breite[data-fm-breite="breit"] { inline-size: var(--fm-size-container-large); max-inline-size: 100%; }
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
[hidden] { display: none !important; }
/* The Werkstatt (Spec 016 ②): the panel beside the report, the palettes and the comparison below. */
#fm-vitrino-werkstatt { gap: var(--fm-spacing-large); }
.fm-werkstatt-kolumnoj { display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: var(--fm-spacing-large); align-items: start; }
.fm-werkstatt-panelo, .fm-werkstatt-raporto { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.fm-werkstatt-regilo { display: grid; grid-template-columns: 1fr auto; gap: var(--fm-spacing-small); align-items: center; }
.fm-werkstatt-regilo input[type="range"] { grid-column: 1 / -1; inline-size: 100%; accent-color: var(--fm-color-action-primary-rest); }
.fm-werkstatt-regilo output { font-variant-numeric: tabular-nums; }
.fm-werkstatt-koloro { display: grid; grid-template-columns: auto 1fr; gap: var(--fm-spacing-small); align-items: end; }
.fm-werkstatt-koloro input[type="color"] { inline-size: 2.75rem; block-size: 2.75rem; padding: 0; border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); background: none; }
.fm-werkstatt-stato { margin: 0; padding: var(--fm-spacing-small); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-role-control); }
.fm-werkstatt-zahloj { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); align-items: center; margin: 0; }
.fm-werkstatt-zahloj dt { font-size: var(--fm-typography-label-1-font-size); }
.fm-werkstatt-zahloj dd { margin: 0; }
.fm-werkstatt-zahloj div { display: flex; gap: var(--fm-spacing-small); align-items: center; }
#fm-werkstatt-malobservoj { padding-inline-start: var(--fm-spacing-large); display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
#fm-werkstatt-malobservoj li { border-block-end: var(--fm-border-width-default) solid var(--fm-color-border-subtle); padding-block-end: var(--fm-spacing-small); }
#fm-werkstatt-malobservoj p { margin: 0 0 var(--fm-spacing-small); }
.fm-werkstatt-celo { inline-size: 5.5rem; font: inherit; padding: var(--fm-spacing-small); border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); background-color: var(--fm-color-background-default); color: var(--fm-color-text-default); }
tr[data-fm-superskribita="true"] th { text-decoration: underline; }
.fm-werkstatt-flankoj { display: grid; grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr)); gap: var(--fm-spacing-large); align-items: start; }
[data-fm-side] { padding: var(--fm-spacing-large); background-color: var(--fm-${VITRINO_SURFACE.replaceAll(".", "-")}); color: var(--fm-color-text-default); font-family: var(--fm-typography-body-1-font-family); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); display: flex; flex-direction: column; gap: var(--fm-spacing-large); }
/* Spec 019 ② (G5): in the Werkstatt every section of the Vitrino and every clone on the two sides
   of the comparison skip the work of rendering while off screen, so a slider recomputes what is
   visible, not the page. */
[data-fm-modus="werkstatt"] main > section:not(#fm-vitrino-werkstatt), #fm-werkstatt-paletroj > table { content-visibility: auto; contain-intrinsic-size: auto 30rem; }
[data-fm-modus="werkstatt"] [data-fm-side] { content-visibility: auto; contain-intrinsic-size: auto 200rem; }
/* Spec 019 ②: the suggestion bar of a link from propose_agordo, the groups of the panel. */
.fm-werkstatt-vorschlag:not([hidden]) { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-medium); align-items: center; justify-content: space-between; padding: var(--fm-spacing-medium); border: var(--fm-border-width-strong) solid var(--fm-color-status-info-border); border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-status-info-subtle); color: var(--fm-color-text-default); }
.fm-werkstatt-vorschlag p { margin: 0; }
.fm-werkstatt-grupo { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); padding-block: var(--fm-spacing-small); }
.fm-werkstatt-kasxita { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`;

function switcher(datumoj: VitrinoDatumoj, werkstatt: boolean): string {
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
  // Spec 016 ② (G7): the mode — Ansehen, or the Werkstatt where a brand is derived live. The
  // mode stands in the fragment (modus=werkstatt), so a link leads straight into the workshop.
  const modus = `<div class="fm-group" role="group" aria-label="Modus"><span>Modus</span><button type="button" data-fm-modus="ansehen" aria-pressed="true">Ansehen</button><button type="button" data-fm-modus="werkstatt" aria-pressed="false"${werkstatt ? "" : " disabled"}>Werkstatt</button></div>`;
  return `${modus}<div class="fm-group" role="group" aria-label="aspekto"><span>aspekto</span>${aspektoj}</div>${dimensioj}
<div class="fm-group"><button type="button" id="fm-vitrino-komparo-switch">Zur Gegenüberstellung</button></div>`;
}

/**
 * A section; one the header's button leads to takes the focus (`tabindex="-1"`). A section of the
 * Ansehen mode that the Werkstatt replaces says so (`data-fm-modus-only`); the Eroj stay in both.
 */
const section = (
  id: string,
  title: string,
  body: string,
  focusable = false,
  modusOnly?: "ansehen" | "werkstatt",
): string =>
  `<section id="fm-vitrino-${id}"${focusable ? ' tabindex="-1"' : ""}${modusOnly === undefined ? "" : ` data-fm-modus-only="${modusOnly}"${modusOnly === "werkstatt" ? " hidden" : ""}`}><h2>${escapeHtml(title)}</h2>${body}</section>`;

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
      return `<article><h3>${escapeHtml(ero)}</h3><p>${escapeHtml(use.purpose)}</p><h4>Wann nehme ich den ${escapeHtml(capitalised(ero))} nicht?</h4><ul>${boundaries}</ul><h4>Zusammen mit</h4><ul>${together}</ul>${table("Slots", ["Slot", "nimmt auf", "max", "Verschachtelung", "Pflicht"], slots)}<h4>Layout</h4><p>Größe aus dem ${use.layout.size === "content" ? "Inhalt" : "Container"}, ${wrapSentence(datumoj.avataroj.includes(ero) ? "avatar" : datumoj.a11yRoloj[ero], use.layout.wrap, datumoj.plurliniaj.includes(ero))}.</p><ul>${allowances}</ul><h4>Text</h4><ul>${text}</ul></article>`;
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
                                  : // Spec 014 ⑤: a disclosure wraps its summary.
                                    role === "group"
                                    ? "Zusammenfassung"
                                    : // Spec 015 ③: a card wraps its content; an avatar never
                                      // wraps its initials.
                                      role === "article"
                                      ? "Inhalt"
                                      : role === "avatar"
                                        ? "Initialen"
                                        : // Spec 020 ③: a code block never wraps a line of
                                          // code (it scrolls), a Markdown view wraps its text.
                                          role === "figure"
                                          ? "Codezeile"
                                          : role === "document"
                                            ? "Text"
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

/**
 * The shell of the Werkstatt (Spec 016 ②, plan ② D-04): the bundled script fills it — panel,
 * report, palettes and comparison are built from the data, in the browser, on first use.
 */
function werkstattShell(werkstatt: WerkstattDatumoj | undefined): string {
  if (werkstatt === undefined)
    return "<p>Kein Referenz-Aspekto im Modelo; die Werkstatt braucht eine.</p>";
  return `<div data-fm-referenco="${escapeHtml(werkstatt.reference)}" id="fm-werkstatt-ujo"><p>Die Werkstatt lädt den Agordilo …</p></div>`;
}

/** The whole document; `datumoj` decides everything that is shown. */
/**
 * Nachlese 8 ② (M5): the panel and the report of the Werkstatt follow a slider without
 * transitions — every motion duration of the CSS Celo is 0 there. A colour that changes started a
 * transition on each of their controls, and its frames ran into the style of the next change: the
 * longest block of the main thread (M5, measured with a CPU three times slower: 52–63 ms with
 * them, 0–50 ms without). The Eroj of the page and of the comparison keep their motion.
 */
function stillControls(css: string): string {
  const durations = [...new Set(css.match(/--fm-motion-duration-[a-z0-9-]+/g) ?? [])].sort();
  return durations.length === 0
    ? ""
    : `[data-fm-modus="werkstatt"] .fm-werkstatt-kolumnoj { ${durations.map((name) => `${name}: 0ms;`).join(" ")} }`;
}

export function vitrinoHtml({
  css,
  elementJs,
  datumoj,
  werkstatt,
  werkstattJs,
}: VitrinoInput): string {
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
<style id="fm-vitrino-layout">${LAYOUT}
${stillControls(css)}</style>
<script type="application/json" id="fm-vitrino">${jsonIsland({ ...datumoj, werkstatt: werkstatt !== undefined })}</script>
${werkstatt === undefined ? "" : `<script type="application/json" id="fm-werkstatt">${jsonIsland(werkstatt)}</script>`}
</head>
<body data-fm-kombino="${escapeHtml(first)}">
<header id="fm-vitrino-kapo">
  <h1>Fundamento Vitrino <small>v${escapeHtml(datumoj.fundamento)}</small></h1>
  ${switcher(datumoj, werkstatt !== undefined)}
</header>
<main>
${section("werkstatt", "Werkstatt", werkstattShell(werkstatt), true, "werkstatt")}
${section("paletroj", "Paletten", paletroj(datumoj), false, "ansehen")}
${section("roloj", "Flächen, Text, Status und Aktionen", roles, false, "ansehen")}
${Object.entries(datumoj.eroj)
  .map(([ero, markup]) => section(ero, ero, markup))
  .join("\n")}
${
  Object.keys(datumoj.sxablonoj).length === 0
    ? ""
    : section(
        "sxablonoj",
        "Sxablonoj",
        Object.entries(datumoj.sxablonoj)
          .map(
            ([name, markup]) =>
              `<h3>${escapeHtml(name)}</h3><div class="fm-breiten">${markup}</div>`,
          )
          .join(""),
      )
}
${section("uzo", "Gebrauch", uzo(datumoj), false, "ansehen")}
${section("kontrasto", "Kontrastmatrix", '<div id="fm-vitrino-kontrasto-tabelo"></div>', false, "ansehen")}
${section("regularo", "Regularo und Ziele", '<div id="fm-vitrino-regularo-tabelo"></div>', false, "ansehen")}
${section("kovrado", "Eigene Werte je Dimensio", '<div id="fm-vitrino-kovrado-tabelo"></div>', false, "ansehen")}
${section("komparo", "Gegenüberstellung", '<div id="fm-vitrino-komparo-tabelo"></div>', true, "ansehen")}
</main>
<script type="module" id="fm-vitrino-elemento">${elementJs}</script>
<script type="module" id="fm-vitrino-skripto">${vitrinoSkripto()}</script>
${werkstattJs === undefined ? "" : `<script type="module" id="fm-vitrino-werkstatt-skripto">${werkstattJs.replaceAll("</script", "<\\/script")}</script>`}
</body>
</html>
`;
}
