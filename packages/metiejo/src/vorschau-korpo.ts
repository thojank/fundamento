// The body of the preview (Spec 023, §3): what a step shows of the brand — colour and states at
// step 3, the text roles at step 4, form, space, type size and icons at step 5, the five Sxablonoj
// in three widths at step 6, the page at step 7. Built of the Eroj and Sxablonoj with German
// example content, as the Vitrino shows them; no value of the brand stands here. Pure.

import type { Agordo } from "@fundamento/agordilo";
import { escapeHtml } from "./html.js";
import type { SxtupoKey } from "./sxtupoj.js";

const BREITEN = ["schmal", "mittel", "breit"] as const;

const PAGXO = `<fm-pagxo><fm-titolo slot="title" level="1" focusable>Standards</fm-titolo><fm-insigno slot="badges" intent="success">Gültig</fm-insigno><fm-insigno slot="badges">Pflicht</fm-insigno><fm-teksto slot="subtitle">Alle Standards des Projekts.</fm-teksto><fm-butono slot="actions" emphasis="high">Bearbeiten</fm-butono><fm-menuo slot="actions" label="Weitere Aktionen"><data value="delete" intent="danger">Löschen</data></fm-menuo><section><fm-titolo level="2">Geltung</fm-titolo><fm-teksto>Gilt in allen Projekten, die den Standard einbinden.</fm-teksto></section></fm-pagxo>`;

const SXELO = `<fm-sxelo><span slot="brand">Verwaltung</span><span slot="principal">Erika Mustermann</span><fm-navigado slot="nav" label="Hauptnavigation" page="standards"><a href="#standards" data-page="standards">Standards</a><a href="#projekte" data-page="projekte">Projekte</a></fm-navigado><fm-avizo slot="notices" intent="success">Gespeichert.</fm-avizo>${PAGXO}</fm-sxelo>`;

const FORMULARO = `<fm-formularo label="Anmeldung"><fm-kampo kind="password" name="token" required>Token<span slot="help">Der Token steht in den Einstellungen des Kontos.</span></fm-kampo><fm-markobutono name="merken">Angemeldet bleiben</fm-markobutono><fm-butono slot="actions" type="submit" emphasis="high">Anmelden</fm-butono></fm-formularo>`;

const FILTRILO = `<fm-filtrilo label="Standards filtern"><fm-elektilo name="status" empty-label="Alle">Status<data slot="options" value="valid">Gültig</data><data slot="options" value="draft">Entwurf</data></fm-elektilo><fm-kampo kind="search" name="q">Suche</fm-kampo><fm-butono slot="actions" emphasis="low">Filter zurücksetzen</fm-butono><span slot="status">3 von 7 Standards</span></fm-filtrilo>`;

const MARKDOWN =
  "## Geltung\n\nGilt in allen Projekten.\n\n- Lesen\n- Prüfen\n\n> Ein Satz je Ziel.";

const REDAKTILO = `<fm-redaktilo preview-label="Vorschau"><fm-tekstareo slot="field" kind="code" rows="6" value="${escapeHtml(MARKDOWN).replaceAll("\n", "&#10;")}">Quelltext</fm-tekstareo><fm-markdovido slot="preview" source="${escapeHtml(MARKDOWN).replaceAll("\n", "&#10;")}"></fm-markdovido></fm-redaktilo>`;

const SXABLONOJ: readonly { name: string; markup: string }[] = [
  { name: "sxelo", markup: SXELO },
  { name: "pagxo", markup: PAGXO },
  { name: "formularo", markup: FORMULARO },
  { name: "filtrilo", markup: FILTRILO },
  { name: "redaktilo", markup: REDAKTILO },
];

const ACTIONS = `<div class="mt-zeile"><fm-butono emphasis="high">Speichern</fm-butono><fm-butono emphasis="medium">Abbrechen</fm-butono><fm-butono emphasis="low">Mehr</fm-butono><fm-butono emphasis="high" intent="danger">Löschen</fm-butono><fm-butono emphasis="medium" disabled>Gesperrt</fm-butono></div>`;

const STATUS = `<div class="mt-spalte"><fm-avizo intent="info">Ein Hinweis zum Stand.</fm-avizo><fm-avizo intent="success">Gespeichert.</fm-avizo><fm-avizo intent="warning">Noch nicht geprüft.</fm-avizo><fm-avizo intent="danger">Das ging nicht.</fm-avizo></div><div class="mt-zeile"><fm-insigno>Neutral</fm-insigno><fm-insigno intent="info">Info</fm-insigno><fm-insigno intent="success">Gültig</fm-insigno><fm-insigno intent="warning">Entwurf</fm-insigno><fm-insigno intent="danger">Gesperrt</fm-insigno></div>`;

const TEXT = `<div class="mt-spalte"><fm-titolo level="1" size="display-2">Überschrift der Marke</fm-titolo><fm-titolo level="2">Eine Zwischenüberschrift</fm-titolo><fm-teksto>Fließtext: Der Konfigurator zeigt die Marke so, wie ein Projekt sie trägt. Jede Änderung ist sofort hier zu sehen.</fm-teksto><fm-teksto kind="caption">Eine Bildunterschrift in der kleinen Stufe.</fm-teksto><fm-teksto kind="code">pnpm fm metiejo</fm-teksto><fm-ligilo to="#" placement="standalone">Ein Link</fm-ligilo></div>`;

const FIELDS = `<div class="mt-spalte"><fm-kampo name="titel" value="Standard 7">Titel<span slot="help">Kurz und eindeutig.</span></fm-kampo><fm-kampo name="email" kind="email" invalid>E-Mail<span slot="error">Das ist keine E-Mail-Adresse.</span></fm-kampo><fm-elektilo name="status" empty-label="Alle">Status<data slot="options" value="valid">Gültig</data></fm-elektilo><fm-sxaltilo name="aktiv" checked>Aktiv</fm-sxaltilo><fm-mezurilo value="62" label-hidden>Fortschritt</fm-mezurilo></div>`;

const KARTO = `<fm-karto level="2"><span slot="heading">Standard 7</span><fm-teksto slot="content">Eine Karte mit Inhalt, Metadaten und Aktionen – Radius und Schatten der Marke sind hier zu sehen.</fm-teksto><fm-insigno slot="meta" intent="success">Gültig</fm-insigno><fm-butono slot="actions" emphasis="medium">Öffnen</fm-butono></fm-karto>`;

const IKONOJ = `<div class="mt-ikonoj">${[
  "check",
  "chevron-down",
  "chevron-right",
  "close",
  "danger",
  "info",
  "more",
  "search",
  "success",
  "upload",
  "warning",
]
  .map((name) => `<fm-ikono name="${name}" size="large" label="${name}"></fm-ikono>`)
  .join(
    "",
  )}</div><div class="mt-zeile"><fm-butono emphasis="high"><fm-ikono slot="icon-start" name="search"></fm-ikono>Suchen</fm-butono><fm-butono emphasis="medium"><fm-ikono slot="icon-start" name="upload"></fm-ikono>Hochladen</fm-butono></div>`;

function surface(title: string, inner: string): string {
  return `<section class="mt-flaeche"><h2>${escapeHtml(title)}</h2>${inner}</section>`;
}

function widths(markup: string, breite: string): string {
  const chosen = breite === "alle" ? BREITEN : BREITEN.filter((entry) => entry === breite);
  return `<div class="mt-breiten">${(chosen.length === 0 ? ["mittel"] : chosen)
    .map((entry) => `<div class="mt-breite" data-mt-breite="${entry}">${markup}</div>`)
    .join("")}</div>`;
}

/** The body of the preview for a step at a width (schmal, mittel, breit or alle). */
export function previewBody(sxtupo: SxtupoKey, breite: string, agordo: Agordo): string {
  switch (sxtupo) {
    case "farbe":
      return (
        surface("Aktionen", ACTIONS) +
        surface("Zustände und Meldungen", STATUS) +
        surface("Text", TEXT)
      );
    case "schrift":
    case "groesse":
      return surface("Text in der Schrift der Marke", TEXT) + surface("Felder", FIELDS);
    case "form":
      return surface("Form: Radius", `${ACTIONS}${KARTO}`) + surface("Felder", FIELDS);
    case "raum":
      return surface("Raum: Abstände", widths(FORMULARO, "mittel")) + surface("Aktionen", ACTIONS);
    case "ikono":
      return surface("Icons in der Strichstärke der Marke", IKONOJ);
    case "vorschau":
      return SXABLONOJ.map((sxablono) =>
        surface(sxablono.name, widths(sxablono.markup, breite)),
      ).join("");
    default:
      return surface(`Seite der Marke ${agordo.name}`, widths(SXELO, "mittel"));
  }
}
