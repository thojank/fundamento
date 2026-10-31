// The screen of the Asistanto (Spec 033 S1): the step-by-step flow beside the Studio. Left the
// Facetoj with their states and the completeness (fm-mezurilo), the chat (fm-karto per message,
// fm-tekstareo, fm-butono) and the step's actions – take the proposal, release, reopen, and the link
// into the Studio page of the Faceto; on two thirds of the width the stage (Spec 036 Teil 3).
// Built of Fundamento's own Eroj (M-2); the chat family of Eroj-Runde 7 does not exist yet, what is
// missing is a Manko for E7, not a rebuild. Pure: the server gives the input, this module the HTML.

import type { Agordo } from "@fundamento/agordilo";
import { buehneHtml } from "../buehne.js";
import { escapeHtml, jsonIsland, screenDocument } from "../html.js";
import type { StudioPage } from "../studio.js";
import { KONFIRMO_TEKSTO } from "./averto.js";
import type { FacetoStand, FacetoStato, Vollstaendigkeit } from "./stato.js";

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

/** What the assistant says before the first wish. */
const GRUSS =
  "Sag mir, was du an diesem Schritt ändern möchtest, zum Beispiel „wärmer“, „runder“ oder „Akzent in Petrol“. Ich setze es über die Regler, und die Prüfung läuft mit.";

function chatHtml(historio: AsistantoInput["historio"]): string {
  const items = historio.map(
    (entry) =>
      `<fm-karto data-mt-rolle="${entry.role}"><fm-teksto kind="caption">${entry.role === "user" ? "Du" : "Assistent"}</fm-teksto>${nachrichtHtml(entry)}</fm-karto>`,
  );
  return items.length === 0
    ? `<fm-karto data-mt-rolle="assistant"><fm-teksto kind="caption">Assistent</fm-teksto><fm-teksto>${GRUSS}</fm-teksto></fm-karto>`
    : items.join("");
}

/** The last answer of the assistant, else its greeting: what the bar shows of the chat. */
function letzteAntwortHtml(historio: AsistantoInput["historio"]): string {
  const last = historio.findLast((entry) => entry.role === "assistant");
  return `<div class="mt-letzte-antwort" data-mt-letzte-antwort><fm-teksto kind="caption">Letzte Antwort</fm-teksto>${last === undefined ? `<fm-teksto>${GRUSS}</fm-teksto>` : nachrichtHtml(last)}</div>`;
}

/**
 * Spec 036, Befund 3.3: the chat as a bar below the stage – the input with sending, speaking and
 * reading aloud, the last answer, the model and the counter; the history in a fold (fm-faldilo).
 */
function chatleisteHtml(
  input: AsistantoInput,
  kiSatz: string,
  takso: (zugo: keyof NonNullable<AsistantoInput["takso"]>, label: string) => string,
): string {
  const off = input.ki.pret ? "" : " disabled";
  // With a model the sentence of the model names the counter; without one it stands on its own.
  const zaehler = input.ki.pret
    ? ""
    : `<fm-teksto kind="caption">Zähler: <span data-mt-zaehlilo>${escapeHtml(input.zaehlilo)}</span></fm-teksto>`;
  return `<div class="mt-chatleiste" data-mt-chatleiste>
<div class="mt-chatleiste-eingabe"><fm-tekstareo name="teksto" rows="2" data-mt-babilo-teksto${off}>Deine Nachricht</fm-tekstareo><div class="mt-zeile"><fm-butono emphasis="high" data-mt-babilo-sendi${off}>Senden</fm-butono><fm-butono emphasis="medium" data-mt-parolo data-mt-parolo-voxtral="${input.parolo === undefined ? "ne" : "ja"}"${off}>Sprechen</fm-butono><fm-sxaltilo name="vorlesen" data-mt-vorlesen>Antworten vorlesen</fm-sxaltilo></div></div>
${letzteAntwortHtml(input.historio)}
<div class="mt-zeile"><fm-teksto kind="caption" data-mt-ki>${kiSatz}</fm-teksto>${zaehler}<fm-teksto kind="caption" data-mt-parolo-satz>${escapeHtml(input.parolo === undefined ? "Sprache: Der Browser erkennt sie selbst (Web Speech API), wo er das kann." : `Sprache: Voxtral (${input.parolo}) auf dem lokalen Server.`)}</fm-teksto>${takso("babilo", "Schätzung je Wunsch")}${input.parolo === undefined ? "" : takso("parolo", "gesprochen")}</div>
<fm-faldilo data-mt-verlauf><span slot="summary">Verlauf</span><div data-mt-babilo-listo>${chatHtml(input.historio)}</div></fm-faldilo>
</div>`;
}

export function asistantoScreen(input: AsistantoInput): string {
  const { marko, faceto, vollstaendigkeit } = input;
  const name = marko.name;
  const studio = FACETO_STUDIO[faceto.name] ?? "farbe";
  const nav = vollstaendigkeit.facetoj
    .map((entry) => facetoLink(name, entry, faceto.name))
    .join("");
  const releasable = faceto.stato === "definiert" && faceto.gruen;
  const releaseHint =
    faceto.stato === "offen"
      ? "Übernimm den Vorschlag oder passe ihn an, dann kannst du freigeben."
      : !faceto.gruen
        ? `Die Prüfung meldet ${faceto.probleme} offene${faceto.probleme === 1 ? "s Problem" : " Probleme"} in diesem Schritt.`
        : faceto.stato === "freigegeben"
          ? "Freigegeben. Du kannst den Schritt wieder öffnen."
          : "Bereit zur Freigabe.";
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
  // In a dialog the estimate stands in its content (slot).
  const takso = (zugo: keyof NonNullable<AsistantoInput["takso"]>, label: string, slot?: string) =>
    input.takso === undefined
      ? ""
      : `<fm-teksto${slot === undefined ? "" : ` slot="${slot}"`} kind="caption" data-mt-takso-${zugo}>${escapeHtml(label)} ${escapeHtml(input.takso[zugo])}</fm-teksto>`;
  // Spec 036, Befund 3.4: material and research open in a dialog (fm-dialogo) instead of a fold; what
  // they find comes back as tiles in it (buehne-klient.ts), the proposal on the stage right first.
  const material = `<fm-dialogo size="medium" data-mt-materialo><span slot="heading">Material deiner Marke</span><span slot="message">Screenshot, Logo, PDF, Schrift oder Link. Der Assistent misst Farben, Schriften, Radien und Abstände; der Vorschlag erscheint auf der Bühne zuerst rechts.</span><fm-alsxutilo slot="content" name="materialo" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.woff2,.woff,.ttf,.otf" data-mt-materialo-dosiero>Datei</fm-alsxutilo><fm-kampo slot="content" name="url" type="url" data-mt-materialo-url>Link auf eine Webseite</fm-kampo><fm-markobutono slot="content" name="rajtoj-materialo" value="ja" data-mt-materialo-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono>${takso("materialo", "je Datei", "content")}<fm-avizo slot="content" intent="info" hidden data-mt-dialogo-meldung></fm-avizo><div slot="content" class="mt-kaheloj" data-mt-kaheloj></div><fm-butono slot="actions" emphasis="low">Schließen</fm-butono><fm-butono slot="actions" emphasis="high" data-mt-materialo-legi>Material lesen</fm-butono></fm-dialogo>`;
  const esploro = `<fm-dialogo size="medium" data-mt-esploro><span slot="heading">Bestehende Marke recherchieren</span><span slot="message">Der Assistent liest öffentliche Seiten und misst Farben, Schriften, Radien und Abstände; er übernimmt keine Texte, Bilder oder Dateien. Das Ergebnis bleibt lokal.</span><fm-kampo slot="content" name="nomo" data-mt-esploro-nomo>Name der Marke</fm-kampo><fm-kampo slot="content" name="url" type="url" data-mt-esploro-url>Adresse der Website (optional)</fm-kampo><fm-markobutono slot="content" name="rajtoj-esploro" value="ja" data-mt-esploro-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono>${takso("esploro", "Recherche", "content")}<fm-avizo slot="content" intent="info" hidden data-mt-dialogo-meldung></fm-avizo><div slot="content" class="mt-kaheloj" data-mt-kaheloj></div><fm-butono slot="actions" emphasis="low">Schließen</fm-butono><fm-butono slot="actions" emphasis="high" data-mt-esploro-sendi>Recherchieren</fm-butono></fm-dialogo>`;
  // Spec 036, Befund 3.1: the preview is the stage – two thirds of the width (buehne.ts).
  const vorschau = buehneHtml({ name, studio, faceto: faceto.name });
  const body = `<fm-sxelo>
<span slot="brand">Markenassistent</span>
<span slot="principal">Marke ${escapeHtml(marko.label)} · <fm-mezurilo value="${vollstaendigkeit.prozent}" min="0" max="100" data-mt-prozent>Vollständig (Umfang 1, visuell)</fm-mezurilo> <fm-teksto kind="caption" data-mt-definiert>freigegeben ${vollstaendigkeit.prozent} % · definiert ${vollstaendigkeit.definiert} %</fm-teksto></span>
<fm-avizo slot="notices" intent="warning" id="mt-asistanto-meldung" hidden></fm-avizo>
${dialog}
<fm-pagxo>
<fm-titolo slot="title" level="1" focusable>${escapeHtml(faceto.nomo)}</fm-titolo>
<fm-teksto slot="subtitle">${escapeHtml(faceto.kialo)}</fm-teksto>
<fm-ligilo slot="actions" to="/studio/${encodeURIComponent(name)}/${studio}" placement="standalone">Im Studio bearbeiten</fm-ligilo>
<section class="mt-buehne-layout" data-mt-buehne-layout>
<div class="mt-schritte"><fm-navigado label="Schritte" page="${escapeHtml(faceto.name)}" orientation="vertical">${nav}<a href="/studio/${encodeURIComponent(name)}/${studio}" data-page="studio">Studio</a><a href="/asistanto/${encodeURIComponent(name)}/komenco" data-page="komenco">Einstiegsfragen</a></fm-navigado><fm-teksto kind="caption">${nochNicht}</fm-teksto>
<div class="mt-babilo">
${propono}
<div class="mt-zeile"><fm-butono emphasis="medium" data-mt-dialogo-oeffnen="materialo">Material hinzufügen</fm-butono><fm-butono emphasis="medium" data-mt-dialogo-oeffnen="esploro">Recherche</fm-butono></div>
${material}
${esploro}
<fm-teksto kind="caption" data-mt-freigabe-satz>${escapeHtml(releaseHint)}</fm-teksto>
<fm-butono emphasis="high" data-mt-faceto-ago="liberigo"${releasable ? "" : " disabled"}>Freigeben</fm-butono>
<fm-butono emphasis="low" data-mt-faceto-ago="remalfermo"${faceto.stato === "freigegeben" ? "" : " disabled"}>Wieder öffnen</fm-butono>
<fm-butono emphasis="low" data-mt-fremda>Baut auf einer bestehenden Marke auf</fm-butono>
</div>
</div>
<div class="mt-buehne-spalte">${vorschau}
${chatleisteHtml(input, kiSatz, takso)}
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
