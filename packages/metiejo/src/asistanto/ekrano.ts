// The screen of the Asistanto (Spec 033 S1): the step-by-step flow beside the Studio. Left the
// Facetoj with their states and the completeness (fm-mezurilo), in the middle the live preview of the
// Schnellstart, right the chat (fm-karto per message, fm-tekstareo, fm-butono) and the step's
// actions – take the proposal, release, reopen, and the link into the Studio page of the Faceto.
// Built of Fundamento's own Eroj (M-2); the chat family of Eroj-Runde 7 does not exist yet, what is
// missing is a Manko for E7, not a rebuild. Pure: the server gives the input, this module the HTML.

import type { Agordo } from "@fundamento/agordilo";
import { escapeHtml, jsonIsland, screenDocument } from "../html.js";
import type { StudioPage } from "../studio.js";
import { KONFIRMO_TEKSTO } from "./averto.js";
import { type FacetoStand, type FacetoStato, freigabeOf, type Vollstaendigkeit } from "./stato.js";

/** The Studio page and the Schnellstart step of each Faceto. */
export const FACETO_STUDIO: Readonly<Record<string, StudioPage>> = {
  gvidkoloro: "farbe",
  neutralaj: "farbe",
  statoj: "farbe",
  modoj: "farbe",
  tiparo: "schrift",
  formo: "form",
  spaco: "raum",
  elevacio: "tiefe",
  movo: "bewegung",
  fokuso: "form",
  grandoj: "raum",
  ikonoj: "form",
};

export const STATO_NOMOJ: Readonly<Record<FacetoStato, string>> = {
  offen: "offen",
  definiert: "definiert",
  freigegeben: "freigegeben",
};

const STATO_INTENT: Readonly<Record<FacetoStato, string>> = {
  offen: "neutral",
  definiert: "info",
  freigegeben: "success",
};

export interface AsistantoInput {
  marko: { name: string; label: string; rev: number };
  faceto: FacetoStand & { kialo: string };
  vollstaendigkeit: Vollstaendigkeit;
  historio: readonly { role: "user" | "assistant"; content: string }[];
  ki: { pret: boolean; modelo?: string; satz?: string };
  fremda?: { kiel: string; nomo?: string; konfirmita: boolean };
  /** Spec 033 S6: the counter of this brand from its Kroniko – tokens, dollars, time, requests. */
  zaehlilo: string;
  /** Spec 033 S6: the estimates before the start, one line each. */
  takso?: { babilo: string; parolo: string; esploro: string; materialo: string };
  /** Spec 033 S5: the Voxtral model when the server transcribes; absent: the browser's recognition. */
  parolo?: string | undefined;
  /** Spec 033 S2: the open proposal of the Enportilo for this step, with its provenance. */
  propono?: {
    satz: string;
    herkunft: readonly { dosiero: string; loko?: string }[];
    /** What the proposal sets (Spec 035, Befund 4.5.1: its colours are shown as swatches). */
    agordo?: Partial<Agordo>;
  };
}

type Propono = NonNullable<AsistantoInput["propono"]>;

/** The words that name where a value comes from: the origin stands beside the proposal. */
const ORIGIN_WORDS =
  /\s+(?:aus deinem Material|deines Materials|aus deiner Inspiration|deiner Inspiration)\b/g;

/**
 * A proposal in one sentence (Spec 035, Befund 4.5.1): the value it proposes, without the
 * explanation after the colon – the swatch, the crop and the preview show it – but with what is
 * not done (the clause after a dash or a semicolon: „noch nicht gesetzt …“, „jenseits vom Ende …“).
 */
export function kurzsatzOf(satz: string): string {
  const first = (satz.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)[0] ?? "").replace(/[.!?]$/, "");
  const colon = first.indexOf(": ");
  const head = colon === -1 ? first : first.slice(0, colon);
  if (colon === -1 || !/[#\d]/.test(head)) {
    return `${first.replace(/\s*\([^()]*\)/g, "").replace(ORIGIN_WORDS, "")}.`;
  }
  const tail = /(\s–\s|;\s)([^–;]*)$/.exec(first.slice(colon));
  return `${head}${tail === null ? "" : `${tail[1]}${tail[2]}`}.`;
}

const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;

/** The colours a proposal shows as swatches: what it sets, else what its sentence names. */
function farbenOf(propono: Propono): string[] {
  const set: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === "string")
      set.push(...(value.match(HEX) ?? []).filter((hex) => hex === value));
    else if (typeof value === "object" && value !== null)
      for (const entry of Object.values(value)) walk(entry);
  };
  walk(propono.agordo);
  const said = kurzsatzOf(propono.satz).match(HEX) ?? [];
  const named = set.length + said.length === 0 ? (propono.satz.match(HEX) ?? []) : said;
  return [...new Set([...set, ...named].map((hex) => hex.toLowerCase()))].slice(0, 6);
}

const BILDOJ = /\.(png|svg|jpe?g|webp)$/i;

/**
 * An open proposal as the assistant shows it (Spec 035, Befund 4.5.1): one sentence, the colours as
 * swatches, a crop of the material it comes from (an uploaded image; a link has none) and the origin.
 */
function proponoHtml(name: string, propono: Propono): string {
  const swatches = farbenOf(propono).map(
    (hex) =>
      `<span class="mt-propono-farbe" role="img" aria-label="Farbe ${hex}" data-mt-propono-farbe="${hex}" style="background-color: ${hex}"></span>`,
  );
  const files = [
    ...new Set(
      propono.herkunft
        .map((entry) => entry.dosiero)
        .filter((dosiero) => !dosiero.includes("://") && BILDOJ.test(dosiero)),
    ),
  ].slice(0, 2);
  const crops = files.map(
    (dosiero) =>
      `<img class="mt-ausschnitt" data-mt-propono-ausschnitt src="/marko/${encodeURIComponent(name)}/materialo/${encodeURIComponent(dosiero)}" alt="Ausschnitt aus ${escapeHtml(dosiero)}">`,
  );
  const bild =
    swatches.length + crops.length === 0
      ? ""
      : `<div class="mt-propono-bild">${swatches.join("")}${crops.join("")}</div>`;
  const herkunft =
    propono.herkunft.length === 0
      ? ""
      : `<fm-teksto kind="caption">Herkunft: ${propono.herkunft.map((entry) => escapeHtml(entry.loko === undefined ? entry.dosiero : `${entry.dosiero}, ${entry.loko}`)).join(" · ")}</fm-teksto>`;
  return `<fm-avizo intent="info" data-mt-propono><span slot="heading">Vorschlag aus deinem Material</span><fm-teksto data-mt-propono-satz>${escapeHtml(kurzsatzOf(propono.satz))}</fm-teksto>${bild}${herkunft}</fm-avizo>`;
}

const facetoUrl = (name: string, faceto: string) =>
  `/asistanto/${encodeURIComponent(name)}/${encodeURIComponent(faceto)}`;

/**
 * A step in the left bar: its name and its state (Spec 035, Befund 4.5.2). The badge stands in a
 * span of its own: fm-navigado keeps a direct fm-insigno of a link only as the count of data-count
 * and removed the state badge otherwise.
 */
function facetoLink(name: string, faceto: FacetoStand, current: string): string {
  const mark = faceto.gruen ? "" : " · Prüfung offen";
  return `<a href="${facetoUrl(name, faceto.name)}" data-page="${escapeHtml(faceto.name)}"${faceto.name === current ? ' aria-current="page"' : ""}><span>${escapeHtml(faceto.nomo)}</span> <span class="mt-schritt-stato"><fm-insigno intent="${STATO_INTENT[faceto.stato]}" data-mt-faceto-stato="${escapeHtml(faceto.name)}">${STATO_NOMOJ[faceto.stato]}${mark}</fm-insigno></span></a>`;
}

/**
 * The text of a chat message (Spec 035, Befund 4.5.3, D-02): what the person wrote is text; what the
 * model answered is the source of an fm-markdovido, which builds emphasis, lists and links from text
 * alone – no markup of the answer is parsed, so nothing of it runs.
 */
function nachrichtHtml(entry: AsistantoInput["historio"][number]): string {
  return entry.role === "user"
    ? `<fm-teksto>${escapeHtml(entry.content)}</fm-teksto>`
    : `<fm-markdovido source="${escapeHtml(entry.content).replaceAll("\n", "&#10;")}"></fm-markdovido>`;
}

function chatHtml(historio: AsistantoInput["historio"]): string {
  const items = historio.map(
    (entry) =>
      `<fm-karto data-mt-rolle="${entry.role}"><fm-teksto kind="caption">${entry.role === "user" ? "Du" : "Assistent"}</fm-teksto>${nachrichtHtml(entry)}</fm-karto>`,
  );
  return items.length === 0
    ? '<fm-karto data-mt-rolle="assistant"><fm-teksto kind="caption">Assistent</fm-teksto><fm-teksto>Sag mir, was du an diesem Schritt ändern möchtest, zum Beispiel „wärmer“, „runder“ oder „Akzent in Petrol“. Ich setze es über die Regler, und die Prüfung läuft mit.</fm-teksto></fm-karto>'
    : items.join("");
}

export function asistantoScreen(input: AsistantoInput): string {
  const { marko, faceto, vollstaendigkeit } = input;
  const name = marko.name;
  const studio = FACETO_STUDIO[faceto.name] ?? "farbe";
  const nav = vollstaendigkeit.facetoj
    .map((entry) => facetoLink(name, entry, faceto.name))
    .join("");
  // Spec 036, D-96: the first render says what every later state says (stato.ts).
  const { freigebbar: releasable, freigabeSatz: releaseHint } = freigabeOf(faceto);
  const fremda = input.fremda;
  const dialog =
    fremda !== undefined && !fremda.konfirmita
      ? `<fm-dialogo open label="Bestätigung" data-mt-konfirmo><fm-titolo slot="title" level="2">Deine Marke baut auf einer bestehenden Marke auf</fm-titolo><fm-teksto>${escapeHtml(fremda.nomo === undefined ? "Du hast eine bestehende Marke genannt." : `Du hast „${fremda.nomo}“ genannt.`)} Fundamento ist hier Plattform: Die Verantwortung für Marken- und Urheberrechte trägst du. Die Bestätigung steht mit Zeitpunkt im Protokoll der Marke.</fm-teksto><fm-markobutono name="rajtoj" value="ja" data-mt-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono><fm-butono slot="actions" emphasis="high" data-mt-konfirmi>Bestätigen</fm-butono></fm-dialogo>`
      : "";
  const kiSatz = input.ki.pret
    ? `Modell ${escapeHtml(input.ki.modelo ?? "")} · <span data-mt-zaehlilo>${escapeHtml(input.zaehlilo)}</span>`
    : escapeHtml(input.ki.satz ?? "Kein Sprachmodell eingerichtet.");
  const nochNicht = vollstaendigkeit.nochNicht
    .map(
      (entry) => `${escapeHtml(entry.nomo)} (Umfang ${entry.umfang}): noch nicht Teil des Modells`,
    )
    .join(" · ");
  const propono = input.propono === undefined ? "" : proponoHtml(name, input.propono);
  // Spec 033 S6: the estimate before the start, beside the action it is for.
  const takso = (zugo: keyof NonNullable<AsistantoInput["takso"]>, label: string) =>
    input.takso === undefined
      ? ""
      : `<fm-teksto kind="caption" data-mt-takso-${zugo}>${escapeHtml(label)} ${escapeHtml(input.takso[zugo])}</fm-teksto>`;
  const material = `<fm-faldilo data-mt-materialo><span slot="summary">Material deiner Marke (Screenshot, Logo, PDF, Schrift oder Link)</span><fm-alsxutilo name="materialo" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.woff2,.woff,.ttf,.otf" data-mt-materialo-dosiero>Datei</fm-alsxutilo><fm-kampo name="url" type="url" data-mt-materialo-url>Link auf eine Webseite</fm-kampo><fm-markobutono name="rajtoj-materialo" value="ja" data-mt-materialo-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono>${takso("materialo", "je Datei")}<fm-butono emphasis="medium" data-mt-materialo-legi>Material lesen</fm-butono></fm-faldilo>`;
  const esploro = `<fm-faldilo data-mt-esploro><span slot="summary">Bestehende Marke nur genannt (Recherche)</span><fm-kampo name="nomo" data-mt-esploro-nomo>Name der Marke</fm-kampo><fm-kampo name="url" type="url" data-mt-esploro-url>Adresse der Website (optional)</fm-kampo><fm-markobutono name="rajtoj-esploro" value="ja" data-mt-esploro-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono><fm-teksto kind="caption">Der Assistent liest öffentliche Seiten und misst Farben, Schriften, Radien und Abstände; er übernimmt keine Texte, Bilder oder Dateien. Das Ergebnis bleibt lokal.</fm-teksto>${takso("esploro", "Recherche")}<fm-butono emphasis="medium" data-mt-esploro-sendi>Recherchieren</fm-butono></fm-faldilo>`;
  const previewSrc = `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=studio-${studio}&breite=mittel`;
  // Spec 035, Befund 4.5.1: with an open proposal the preview shows the step now and with the
  // proposal laid on, one above the other, on the real Eroj of the brand.
  const vorschau =
    input.propono === undefined
      ? `<div class="mt-studio-vorschau"><iframe data-mt-vorschau data-mt-src="${previewSrc}" title="Vorschau der Marke"></iframe></div>`
      : `<div class="mt-studio-vorschau" data-mt-vergleich><fm-teksto kind="caption">Jetzt</fm-teksto><iframe data-mt-vorschau data-mt-src="${previewSrc}" title="Vorschau der Marke"></iframe><fm-teksto kind="caption">Mit dem Vorschlag</fm-teksto><iframe data-mt-vorschau-propono data-mt-src="${escapeHtml(`${previewSrc}&propono=${encodeURIComponent(faceto.name)}`)}" title="Vorschau mit dem Vorschlag"></iframe></div>`;
  const body = `<fm-sxelo>
<span slot="brand">Markenassistent</span>
<span slot="principal">Marke ${escapeHtml(marko.label)} · <fm-mezurilo value="${vollstaendigkeit.prozent}" min="0" max="100" data-mt-prozent>Vollständig (Umfang 1, visuell)</fm-mezurilo> <fm-teksto kind="caption" data-mt-definiert>freigegeben ${vollstaendigkeit.prozent} % · definiert ${vollstaendigkeit.definiert} %</fm-teksto></span>
<fm-avizo slot="notices" intent="warning" id="mt-asistanto-meldung" hidden></fm-avizo>
${dialog}
<fm-pagxo>
<fm-titolo slot="title" level="1" focusable>${escapeHtml(faceto.nomo)}</fm-titolo>
<fm-teksto slot="subtitle">${escapeHtml(faceto.kialo)}</fm-teksto>
<fm-ligilo slot="actions" to="/studio/${encodeURIComponent(name)}/${studio}" placement="standalone">Im Studio bearbeiten</fm-ligilo>
<section class="mt-studio">
<div class="mt-schritte"><fm-navigado label="Schritte" page="${escapeHtml(faceto.name)}" orientation="vertical">${nav}<a href="/studio/${encodeURIComponent(name)}/${studio}" data-page="studio">Studio</a><a href="/asistanto/${encodeURIComponent(name)}/komenco" data-page="komenco">Einstiegsfragen</a></fm-navigado><fm-teksto kind="caption">${nochNicht}</fm-teksto></div>
${vorschau}
<div class="mt-babilo">
<fm-teksto kind="caption" data-mt-ki>${kiSatz}</fm-teksto>
<div data-mt-babilo-listo>${chatHtml(input.historio)}</div>
<fm-tekstareo name="teksto" rows="3" data-mt-babilo-teksto${input.ki.pret ? "" : " disabled"}>Deine Nachricht</fm-tekstareo>
<fm-butono emphasis="high" data-mt-babilo-sendi${input.ki.pret ? "" : " disabled"}>Senden</fm-butono>
<fm-butono emphasis="medium" data-mt-parolo data-mt-parolo-voxtral="${input.parolo === undefined ? "ne" : "ja"}"${input.ki.pret ? "" : " disabled"}>Sprechen</fm-butono>
<fm-sxaltilo name="vorlesen" data-mt-vorlesen>Antworten vorlesen</fm-sxaltilo>
<fm-teksto kind="caption" data-mt-parolo-satz>${escapeHtml(input.parolo === undefined ? "Sprache: Der Browser erkennt sie selbst (Web Speech API), wo er das kann." : `Sprache: Voxtral (${input.parolo}) auf dem lokalen Server.`)}</fm-teksto>
${takso("babilo", "Schätzung je Wunsch")}${input.parolo === undefined ? "" : takso("parolo", "gesprochen")}
${propono}
${material}
${esploro}
<fm-teksto kind="caption" data-mt-freigabe-satz>${escapeHtml(releaseHint)}</fm-teksto>
<fm-butono emphasis="medium" data-mt-faceto-ago="akcepto">Vorschlag übernehmen</fm-butono>
<fm-butono emphasis="high" data-mt-faceto-ago="liberigo"${releasable ? "" : " disabled"}>Freigeben</fm-butono>
<fm-butono emphasis="low" data-mt-faceto-ago="remalfermo"${faceto.stato === "freigegeben" ? "" : " disabled"}>Wieder öffnen</fm-butono>
<fm-butono emphasis="low" data-mt-fremda>Baut auf einer bestehenden Marke auf</fm-butono>
</div>
</section>
</fm-pagxo>
</fm-sxelo>
<script type="application/json" id="mt-asistanto">${jsonIsland({ marko: name, faceto: faceto.name })}</script>`;
  return screenDocument({
    title: `Markenassistent – ${faceto.nomo} – ${name}`,
    body,
    root: {
      "data-mt-sxtupo": `asistanto-${faceto.name}`,
      "data-mt-marko": name,
      "data-mt-rev": String(marko.rev),
      "data-mt-scheme": "light",
    },
  });
}
