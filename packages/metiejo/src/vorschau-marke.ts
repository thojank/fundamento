// Spec 058 (MP-2c, T9, MAW-4.2, parts G and H): the bodies of the two views of a preview node,
// called by `servilo.ts` for `sxtupo=marke` and `sxtupo=komponenten`.
//
// „Marke“ (`markeKorpo`) is a designed page of the brand, not a management screen: a head with the
// name, a large headline, text and two buttons, three cards, a band in the primary colour, an area
// in the accent colour, marks (Insignoj), a field and a notice – real Eroj (`fm-titolo`, `fm-teksto`,
// `fm-butono` of high and medium emphasis, `fm-karto`, `fm-insigno`, `fm-kampo`, `fm-avizo`,
// `fm-ligilo`) in the brand's fonts, light and dark through the brand's stylesheet. Three prepared
// layouts after the chosen mockups, built of the same blocks (R-5):
//   - `titel` („Großer Titel“): the headline carries the page; below it cards, band and area;
//   - `raster` („Kartenraster“): the page is a grid of tiles – headline, colours and contents;
//   - `liste` („Ruhige Liste“): one left-aligned column, the Leitgedanken as a numbered list.
// The root carries `data-mt-aufbau`. Contents follow the source table of part G (Kernsatz → first
// sentence of the description → a neutral sentence; description → neutral text; Leitgedanken →
// first three Werte → neutral; Charakter → Persönlichkeit → neutral words); where the brand gives
// nothing, the content is invented and neutral (MARKE_NEUTRAL). Every text of the brand goes through
// `escapeHtml`.
//
// The accent (part H) stands in at least three places, each `data-mt-akzent`: „flaeche“ (an area in
// `color.sekundo.surface` with a large shape in `color.sekundo.illustration`), „marke“ (own badges in
// `color.sekundo.badge.fill` / `.text`, also the numbers of the three cards) and „hervorhebung“ (one
// word of the headline underlaid in `color.sekundo.illustration`; in `liste` the note's edge and one
// Charakter word). No Ero shows the accent (`fm-insigno` knows no such intent), so these are own
// markup; never a button, a link or the focus (`sekundo-not-action` stays as it is). The band takes
// `color.brand.fill` with `color.brand.text` (plan D-5). Without an accent the roles show what the
// brand derives (grey today: plan Q-7).
//
// Layout by own `mt-…` classes with `var(--fm-*)` only and logical properties; no literal value. The
// root is an inline-size container; the grids are intrinsic (`auto-fit` over token sizes), so the
// page follows the width of its frame without a breakpoint of its own. Long words wrap.
//
// „Komponenten“ (`komponentenKorpo`) is today's body of the canvas preview
// (`previewBody("vorschau", …)`, unchanged) with one accent badge before it (`akzentInsignoKorpo`).

import type { Agordo } from "@fundamento/agordilo";
import type { AufbauId, Leitgedanke, MarkeInhalt } from "./grafeo-gestalten-sicht.js";
import { escapeHtml } from "./html.js";
import { akzentInsignoKorpo, previewBody } from "./vorschau-korpo.js";

/** The invented, neutral contents where the brand gives nothing (part G, source table). */
export const MARKE_NEUTRAL = {
  kernsatz: "Gute Arbeit, die man gern weiterempfiehlt.",
  text: "Wir machen Dinge, die lange halten, und erklären, wie sie funktionieren. Wer eine Frage hat, bekommt eine Antwort von Menschen, die sich auskennen.",
  karten: [
    { titel: "Sorgfalt", text: "Jedes Detail wird geprüft, bevor es bei Ihnen ankommt." },
    { titel: "Klarheit", text: "Wir sagen vorher, was etwas kostet und wie lange es dauert." },
    { titel: "Nähe", text: "Sie erreichen Menschen, die zuhören und weiterhelfen." },
  ],
  /** The text of a card whose title is one of the brand's Werte. */
  wertText: "Ein Wert, an dem sich jede Entscheidung messen lässt.",
  worte: ["klar", "freundlich", "verlässlich"],
} as const;

/** The fixed, invented texts of the page (not from the brand). */
const TEKSTOJ = {
  neu: "Neu",
  leitet: "Was uns leitet",
  charakter: "Charakter",
  band: "Gemacht, um lange zu bleiben.",
  bandZusatz: "Mit Teilen zum Tauschen und einer Anleitung, die man versteht.",
  flaecheKicker: "Im Blick",
  flaecheTitel: "Mehr Zeit für Beratung, ab diesem Monat auch am Samstag.",
  flaecheText: "Wer vorbeikommt, bekommt einen Termin ohne Wartezeit.",
  neuigkeiten: "Neuigkeiten",
  feld: "E-Mail-Adresse",
  feldHilfe: "Höchstens eine Nachricht im Monat.",
  platzhalter: "name@beispiel.de",
  eintragen: "Eintragen",
  hinweis: "Antworten kommen innerhalb von zwei Werktagen.",
  mehr: "Mehr erfahren",
  kontakt: "Kontakt aufnehmen",
  nav: ["Angebot", "Über uns", "Kontakt"],
  impressum: "Impressum",
} as const;

const e = escapeHtml;

// ---------------------------------------------------------------------------------------------
// The contents by the source table

/** The first sentence of a text (up to `.`, `!`, `?` or `…` before a space), trimmed. */
function ersterSatzDe(teksto: string): string {
  const [unua = ""] = teksto.trim().split(/(?<=[.!?…])\s+/);
  return unua.trim();
}

const plena = (teksto: string | undefined): teksto is string =>
  teksto !== undefined && teksto.trim() !== "";

interface Karto {
  titel: string;
  text: string;
}

interface Enhavo {
  name: string;
  titel: string;
  text: string;
  karten: readonly Karto[];
  worte: readonly string[];
}

/** What the page shows, after the source table; three cards, always. */
function enhavoDe(inhalt: MarkeInhalt): Enhavo {
  const unua = plena(inhalt.beschreibung) ? ersterSatzDe(inhalt.beschreibung) : "";
  const titel = plena(inhalt.kernsatz)
    ? inhalt.kernsatz.trim()
    : unua !== ""
      ? unua
      : MARKE_NEUTRAL.kernsatz;
  const text = plena(inhalt.beschreibung) ? inhalt.beschreibung.trim() : MARKE_NEUTRAL.text;
  const gedanken = (inhalt.leitgedanken ?? []).filter((g: Leitgedanke) => plena(g.titel));
  const werte = (inhalt.werte ?? []).filter(plena);
  const karten: Karto[] =
    gedanken.length > 0
      ? gedanken.slice(0, 3).map((g) => ({ titel: g.titel, text: g.text }))
      : werte.slice(0, 3).map((w) => ({ titel: w, text: MARKE_NEUTRAL.wertText }));
  for (const neutral of MARKE_NEUTRAL.karten) if (karten.length < 3) karten.push(neutral);
  const charakter = (inhalt.charakter ?? []).filter(plena);
  const persoenlichkeit = (inhalt.persoenlichkeit ?? []).filter(plena);
  const worte =
    charakter.length > 0
      ? charakter
      : persoenlichkeit.length > 0
        ? persoenlichkeit
        : [...MARKE_NEUTRAL.worte];
  return { name: inhalt.name, titel, text, karten, worte };
}

// ---------------------------------------------------------------------------------------------
// The building blocks (each layout is an arrangement of these)

/** A badge in the accent roles (own markup: no Ero shows the accent). */
const marke = (teksto: string, klaso = "mt-kicker"): string =>
  `<span class="${klaso}" data-mt-akzent="marke">${e(teksto)}</span>`;

/** The number of a card, a badge in the accent roles. */
const nummer = (n: number, slot = ""): string =>
  `<span class="mt-nummer"${slot === "" ? "" : ` slot="${slot}"`} data-mt-akzent="marke">${String(n).padStart(2, "0")}</span>`;

/**
 * The headline with its longest word underlaid in the accent („hervorhebung“); the punctuation
 * around the word stays outside the mark.
 */
function hervorgehoben(teksto: string): string {
  const partoj = teksto.split(/(\s+)/);
  const longo = (p: string): number => (p.match(/[\p{L}\p{N}]/gu) ?? []).length;
  let plej = -1;
  partoj.forEach((p, i) => {
    if (longo(p) > (plej < 0 ? 0 : longo(partoj[plej] ?? ""))) plej = i;
  });
  return partoj
    .map((p, i) => {
      if (i !== plej) return e(p);
      const [, antaux = "", vorto = p, post = ""] =
        /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u.exec(p) ?? [];
      return `${e(antaux)}<mark class="mt-hervor" data-mt-akzent="hervorhebung">${e(vorto)}</mark>${e(post)}`;
    })
    .join("");
}

/** The head of the page: the name as a word mark, three links. */
function oben(name: string): string {
  const ligiloj = TEKSTOJ.nav
    .map((n) => `<fm-ligilo to="#${e(n.toLowerCase().replace(/\s+/g, "-"))}">${e(n)}</fm-ligilo>`)
    .join("");
  return `<header class="mt-oben"><span class="mt-wortmarke"><span class="mt-signo" aria-hidden="true"></span>${e(name)}</span><nav class="mt-nav" aria-label="Hauptnavigation">${ligiloj}</nav></header>`;
}

/** The two actions: a button of high and one of medium emphasis (never the accent). */
const knoepfe = (): string =>
  `<div class="mt-knoepfe"><fm-butono emphasis="high">${e(TEKSTOJ.mehr)}</fm-butono><fm-butono emphasis="medium">${e(TEKSTOJ.kontakt)}</fm-butono></div>`;

/** The headline (level 1) in a size of the brand's type scale. */
const titolo = (inhalt: string, size: string): string =>
  `<fm-titolo level="1" size="${size}">${inhalt}</fm-titolo>`;

/** The Charakter words as marks (Insignoj). */
const insignoj = (worte: readonly string[]): string =>
  worte.map((w) => `<fm-insigno>${e(w)}</fm-insigno>`).join("");

const charakterZeile = (worte: readonly string[], klaso: string): string =>
  `<div class="${klaso}"><fm-teksto kind="kicker" emphasis="low">${e(TEKSTOJ.charakter)}</fm-teksto><div class="mt-insignoj">${insignoj(worte)}</div></div>`;

/** One card of a Leitgedanke, numbered (`fm-karto` with its heading on level 3). */
const karto = (k: Karto, n: number, klaso = "mt-karto"): string =>
  `<fm-karto class="${klaso}" level="3">${nummer(n, "meta")}<span slot="heading">${e(k.titel)}</span><fm-teksto slot="content">${e(k.text)}</fm-teksto></fm-karto>`;

/** The band in the primary colour, with its text role (D-5). */
const band = (klaso = "mt-band"): string =>
  `<section class="${klaso}"><h2 class="mt-band-titel">${e(TEKSTOJ.band)}</h2><p class="mt-band-zusatz">${e(TEKSTOJ.bandZusatz)}</p></section>`;

/** The area in the accent colour with its large shape („flaeche“). */
const flaeche = (klaso = "mt-akzentflaeche"): string =>
  `<section class="${klaso}" data-mt-akzent="flaeche"><span class="mt-flaeche-kicker">${e(TEKSTOJ.flaecheKicker)}</span><h2 class="mt-flaeche-titel">${e(TEKSTOJ.flaecheTitel)}</h2><fm-teksto>${e(TEKSTOJ.flaecheText)}</fm-teksto></section>`;

/** The field with its label and the notice. */
const formular = (klaso: string): string =>
  `<section class="${klaso}"><fm-titolo level="2" size="headline-4">${e(TEKSTOJ.neuigkeiten)}</fm-titolo><form class="mt-feldzeile" onsubmit="return false"><fm-kampo kind="email" name="email" autocomplete="email" placeholder="${e(TEKSTOJ.platzhalter)}">${e(TEKSTOJ.feld)}<span slot="help">${e(TEKSTOJ.feldHilfe)}</span></fm-kampo><fm-butono type="submit" emphasis="high">${e(TEKSTOJ.eintragen)}</fm-butono></form><fm-avizo intent="info">${e(TEKSTOJ.hinweis)}</fm-avizo></section>`;

const fuss = (name: string): string =>
  `<footer class="mt-fuss"><fm-teksto kind="caption" emphasis="low">${e(name)}</fm-teksto><fm-ligilo to="#impressum" size="small">${e(TEKSTOJ.impressum)}</fm-ligilo></footer>`;

// ---------------------------------------------------------------------------------------------
// The three layouts

/** „Großer Titel“: the headline carries the page; below it cards, band and the accent area. */
function titelKorpo(x: Enhavo): string {
  return [
    oben(x.name),
    `<section class="mt-held">${marke(TEKSTOJ.neu)}${titolo(hervorgehoben(x.titel), "display-1")}<div class="mt-held-fuss"><fm-teksto class="mt-lead">${e(x.text)}</fm-teksto>${knoepfe()}</div></section>`,
    charakterZeile(x.worte, "mt-charakter"),
    `<section class="mt-abschnitt"><fm-titolo level="2" size="headline-4">${e(TEKSTOJ.leitet)}</fm-titolo><div class="mt-karten">${x.karten.map((k, i) => karto(k, i + 1)).join("")}</div></section>`,
    band("mt-band mt-band-breit"),
    `<div class="mt-unten">${flaeche()}${formular("mt-formular")}</div>`,
    fuss(x.name),
  ].join("");
}

/** „Kartenraster“: the page is a grid of tiles – headline, colours and contents are tiles. */
function rasterKorpo(x: Enhavo): string {
  return [
    oben(x.name),
    `<div class="mt-raster">`,
    `<section class="mt-kachel mt-kachel-titel">${marke(TEKSTOJ.neu)}${titolo(hervorgehoben(x.titel), "display-2")}<fm-teksto class="mt-lead">${e(x.text)}</fm-teksto>${knoepfe()}</section>`,
    band("mt-kachel mt-band"),
    flaeche("mt-kachel mt-akzentflaeche"),
    x.karten.map((k, i) => karto(k, i + 1, "mt-kachel-karto")).join(""),
    `<section class="mt-kachel mt-kachel-charakter"><fm-teksto kind="kicker" emphasis="low">${e(TEKSTOJ.charakter)}</fm-teksto><div class="mt-insignoj">${insignoj(x.worte)}</div></section>`,
    formular("mt-kachel mt-kachel-formular"),
    `</div>`,
    fuss(x.name),
  ].join("");
}

/** „Ruhige Liste“: one left-aligned column, the Leitgedanken as a numbered list. */
function listeKorpo(x: Enhavo): string {
  const listo = x.karten
    .map(
      (k, i) =>
        `<li class="mt-listero">${nummer(i + 1)}<div class="mt-listero-teksto"><fm-titolo level="3" size="headline-4">${e(k.titel)}</fm-titolo><fm-teksto emphasis="medium">${e(k.text)}</fm-teksto></div></li>`,
    )
    .join("");
  const lasta = x.worte.length - 1;
  const worte = x.worte
    .map((w, i) =>
      i === lasta
        ? `<span class="mt-wort mt-hervor" data-mt-akzent="hervorhebung">${e(w)}</span>`
        : `<span class="mt-wort">${e(w)}</span>`,
    )
    .join("");
  return [
    `<div class="mt-spalte-liste">`,
    oben(x.name),
    `<section class="mt-held mt-held-ruhig">${marke(TEKSTOJ.neu)}${titolo(e(x.titel), "headline-1")}<fm-teksto class="mt-lead">${e(x.text)}</fm-teksto>${knoepfe()}</section>`,
    `<section class="mt-abschnitt mt-abschnitt-linio"><fm-titolo level="2" size="headline-4">${e(TEKSTOJ.leitet)}</fm-titolo><ol class="mt-liste">${listo}</ol></section>`,
    band("mt-band"),
    `<section class="mt-notiz" data-mt-akzent="flaeche"><span class="mt-notiz-kante" data-mt-akzent="hervorhebung" aria-hidden="true"></span><div class="mt-notiz-teksto"><h2 class="mt-flaeche-titel">${e(TEKSTOJ.flaecheTitel)}</h2><fm-teksto emphasis="medium">${e(TEKSTOJ.flaecheText)}</fm-teksto></div></section>`,
    `<section class="mt-abschnitt mt-abschnitt-linio"><fm-teksto kind="kicker" emphasis="low">${e(TEKSTOJ.charakter)}</fm-teksto><p class="mt-worte">${worte}</p></section>`,
    formular("mt-abschnitt mt-abschnitt-linio mt-formular-ruhig"),
    fuss(x.name),
    `</div>`,
  ].join("");
}

// ---------------------------------------------------------------------------------------------
// The stylesheet of the page: roles of the brand only, logical properties, no literal value

/** A typography role as the four properties it sets. */
const tipo = (rolo: string): string =>
  `font-family: var(--fm-typography-${rolo}-font-family); font-size: var(--fm-typography-${rolo}-font-size); font-weight: var(--fm-typography-${rolo}-font-weight); line-height: var(--fm-typography-${rolo}-line-height);`;

/** The smallest width of a column of the grids: three steps of the largest size of the scale. */
const KOLUMNO = "min(100%, calc(var(--fm-size-scale-1000) * 3))";
const KOLUMNO_LARGXA = "min(100%, calc(var(--fm-size-scale-1000) * 4))";
const LINIO = "var(--fm-border-width-default) var(--fm-stroke-solid) var(--fm-color-border-subtle)";

const STILO = `
body:has(> .mt-marke) { padding: 0; gap: 0; }
.mt-marke { container-type: inline-size; box-sizing: border-box; min-block-size: 100vb; display: flex; flex-direction: column; gap: var(--fm-spacing-xlarge); padding: var(--fm-spacing-large) var(--fm-spacing-xlarge) var(--fm-spacing-xxlarge); background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); font-family: var(--fm-font-family-body); overflow-wrap: anywhere; }
.mt-marke h2, .mt-marke p, .mt-marke ol { margin: 0; }
.mt-oben { display: flex; flex-wrap: wrap; align-items: center; gap: var(--fm-spacing-medium) var(--fm-spacing-large); padding-block-end: var(--fm-spacing-medium); border-block-end: ${LINIO}; }
.mt-wortmarke { display: inline-flex; align-items: center; gap: var(--fm-spacing-small); min-inline-size: 0; margin-inline-end: auto; ${tipo("headline-4")} font-family: var(--fm-font-family-display); }
.mt-signo { flex: none; inline-size: var(--fm-size-icon-large); block-size: var(--fm-size-icon-large); border-radius: var(--fm-radius-role-pill); background-color: var(--fm-color-brand-fill); }
.mt-nav { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small) var(--fm-spacing-large); }
.mt-held { display: flex; flex-direction: column; align-items: flex-start; gap: var(--fm-spacing-large); padding-block: var(--fm-spacing-xlarge); }
.mt-held > fm-titolo { max-inline-size: 100%; }
.mt-held-fuss { display: grid; grid-template-columns: repeat(auto-fit, minmax(${KOLUMNO_LARGXA}, 1fr)); align-items: end; gap: var(--fm-spacing-large); inline-size: 100%; }
.mt-lead { color: var(--fm-color-text-subtle); }
.mt-knoepfe { display: flex; flex-wrap: wrap; align-items: center; gap: var(--fm-spacing-small); }
.mt-marke [data-mt-akzent="marke"] { display: inline-flex; align-items: center; align-self: flex-start; padding: var(--fm-spacing-xsmall) var(--fm-spacing-small); border-radius: var(--fm-radius-role-pill); background-color: var(--fm-color-sekundo-badge-fill); color: var(--fm-color-sekundo-badge-text); ${tipo("label-2")} }
.mt-nummer { font-family: var(--fm-font-family-code); font-variant-numeric: tabular-nums; }
.mt-marke [data-mt-akzent="hervorhebung"].mt-hervor { background-color: transparent; color: inherit; box-shadow: inset 0 calc(var(--fm-spacing-small) * -1) 0 0 var(--fm-color-sekundo-illustration); box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.mt-charakter { display: flex; flex-wrap: wrap; align-items: center; gap: var(--fm-spacing-medium); padding-block: var(--fm-spacing-medium); border-block: ${LINIO}; }
.mt-insignoj { display: flex; flex-wrap: wrap; align-items: center; gap: var(--fm-spacing-small); }
.mt-abschnitt { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.mt-karten { display: grid; grid-template-columns: repeat(auto-fit, minmax(${KOLUMNO}, 1fr)); gap: var(--fm-spacing-large); }
.mt-band { display: grid; gap: var(--fm-spacing-small); padding: var(--fm-spacing-xlarge); border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-brand-fill); color: var(--fm-color-brand-text); }
.mt-band-breit { margin-inline: calc(var(--fm-spacing-xlarge) * -1); border-radius: var(--fm-radius-none); padding-inline: var(--fm-spacing-xlarge); }
.mt-band-titel { ${tipo("headline-2")} font-family: var(--fm-font-family-display); color: inherit; }
.mt-band-zusatz { ${tipo("body-2")} color: inherit; }
.mt-unten { display: grid; grid-template-columns: repeat(auto-fit, minmax(${KOLUMNO_LARGXA}, 1fr)); align-items: start; gap: var(--fm-spacing-large); }
.mt-marke [data-mt-akzent="flaeche"] { background-color: var(--fm-color-sekundo-surface); color: var(--fm-color-text-default); }
.mt-akzentflaeche { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: var(--fm-spacing-small); min-block-size: calc(var(--fm-size-scale-1000) * 3); padding: var(--fm-spacing-xlarge); border-radius: var(--fm-radius-role-surface); }
.mt-akzentflaeche[data-mt-akzent="flaeche"]::before { content: ""; position: absolute; inset-block-start: calc(var(--fm-size-scale-1000) * -1); inset-inline-end: calc(var(--fm-size-scale-1000) * -1); inline-size: calc(var(--fm-size-scale-1000) * 2.5); aspect-ratio: 1; border-radius: var(--fm-radius-role-pill); background-color: var(--fm-color-sekundo-illustration); }
.mt-akzentflaeche > * { position: relative; max-inline-size: calc(100% - var(--fm-size-scale-1000)); }
.mt-flaeche-kicker { ${tipo("kicker")} text-transform: var(--fm-typography-kicker-text-transform); letter-spacing: var(--fm-typography-kicker-letter-spacing); }
.mt-flaeche-titel { ${tipo("headline-3")} font-family: var(--fm-font-family-display); }
.mt-formular { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); padding: var(--fm-spacing-large); border: ${LINIO}; border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-background-default); }
.mt-feldzeile { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--fm-spacing-small); margin: 0; }
.mt-feldzeile > fm-kampo { flex: 1 1 ${KOLUMNO}; min-inline-size: 0; }
.mt-fuss { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--fm-spacing-medium); padding-block-start: var(--fm-spacing-medium); border-block-start: ${LINIO}; }
.mt-raster { display: grid; grid-template-columns: repeat(auto-fit, minmax(${KOLUMNO}, 1fr)); grid-auto-flow: dense; gap: var(--fm-spacing-medium); }
.mt-raster > * { min-inline-size: 0; }
.mt-kachel { display: flex; flex-direction: column; gap: var(--fm-spacing-small); padding: var(--fm-spacing-large); border: ${LINIO}; border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-background-default); }
.mt-kachel.mt-band, .mt-kachel.mt-akzentflaeche { border-color: transparent; }
.mt-kachel.mt-band { background-color: var(--fm-color-brand-fill); color: var(--fm-color-brand-text); }
.mt-kachel.mt-akzentflaeche { min-block-size: 0; padding: var(--fm-spacing-large) var(--fm-spacing-large) var(--fm-size-scale-1000); }
.mt-kachel.mt-akzentflaeche > * { max-inline-size: none; }
.mt-kachel.mt-akzentflaeche[data-mt-akzent="flaeche"]::before { inset-block-start: auto; inset-block-end: calc(var(--fm-size-scale-1000) * -1); inline-size: calc(var(--fm-size-scale-1000) * 2); }
.mt-kachel-titel { grid-column: span 2; grid-row: span 2; justify-content: flex-end; gap: var(--fm-spacing-medium); }
.mt-kachel-formular { grid-column: span 2; }
.mt-spalte-liste { display: flex; flex-direction: column; gap: var(--fm-spacing-xlarge); max-inline-size: var(--fm-size-container-small); }
.mt-held-ruhig { padding-block: var(--fm-spacing-large) 0; gap: var(--fm-spacing-medium); }
.mt-abschnitt-linio { padding-block-start: var(--fm-spacing-large); border-block-start: ${LINIO}; }
.mt-liste { display: flex; flex-direction: column; padding: 0; list-style: none; }
.mt-listero { display: flex; align-items: flex-start; gap: var(--fm-spacing-medium); padding-block: var(--fm-spacing-medium); }
.mt-listero + .mt-listero { border-block-start: ${LINIO}; }
.mt-listero-teksto { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); min-inline-size: 0; }
.mt-notiz { display: flex; align-items: stretch; border-radius: var(--fm-radius-role-surface); overflow: hidden; }
.mt-marke [data-mt-akzent="hervorhebung"].mt-notiz-kante { flex: none; inline-size: var(--fm-spacing-small); background-color: var(--fm-color-sekundo-illustration); }
.mt-notiz-teksto { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); padding: var(--fm-spacing-large); }
.mt-worte { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small) var(--fm-spacing-large); ${tipo("body-1")} }
.mt-wort { padding-block-end: var(--fm-spacing-xsmall); }
.mt-formular-ruhig { gap: var(--fm-spacing-medium); }
`;

const STILO_ELEMENTO = `<style>${STILO.trim()}</style>`;

const KORPOJ: Readonly<Record<AufbauId, (x: Enhavo) => string>> = {
  titel: titelKorpo,
  raster: rasterKorpo,
  liste: listeKorpo,
};

/** The page „Marke“ in one of the three layouts. Pure; every text of the brand is escaped. */
export function markeKorpo(inhalt: MarkeInhalt, aufbau: AufbauId): string {
  return `<main class="mt-marke mt-aufbau-${aufbau}" data-mt-aufbau="${aufbau}">${STILO_ELEMENTO}${KORPOJ[aufbau](enhavoDe(inhalt))}</main>`;
}

/**
 * The view „Komponenten“: one badge in the accent roles, then today's body of the canvas preview
 * (`previewBody("vorschau", …)`, byte for byte).
 */
export function komponentenKorpo(
  breite: string,
  agordo: Agordo,
  zelo: Readonly<Record<string, string>> = {},
): string {
  return `${akzentInsignoKorpo()}\n${previewBody("vorschau", breite, agordo, zelo)}`;
}
