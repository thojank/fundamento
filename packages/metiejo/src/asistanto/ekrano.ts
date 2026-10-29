// The screen of the Asistanto (Spec 033 S1): the step-by-step flow beside the Studio. Left the
// Facetoj with their states and the completeness (fm-mezurilo), in the middle the live preview of the
// Schnellstart, right the chat (fm-karto per message, fm-tekstareo, fm-butono) and the step's
// actions – take the proposal, release, reopen, and the link into the Studio page of the Faceto.
// Built of Fundamento's own Eroj (M-2); the chat family of Eroj-Runde 7 does not exist yet, what is
// missing is a Manko for E7, not a rebuild. Pure: the server gives the input, this module the HTML.

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
  /** Tokens and time of the chat of this brand since the server started. */
  sumo: { enigo: number; eligo: number; ms: number };
}

const facetoUrl = (name: string, faceto: string) =>
  `/asistanto/${encodeURIComponent(name)}/${encodeURIComponent(faceto)}`;

function facetoLink(name: string, faceto: FacetoStand, current: string): string {
  const mark = faceto.gruen ? "" : " · Prüfung offen";
  return `<a href="${facetoUrl(name, faceto.name)}" data-page="${escapeHtml(faceto.name)}"${faceto.name === current ? ' aria-current="page"' : ""}>${escapeHtml(faceto.nomo)} <fm-insigno intent="${STATO_INTENT[faceto.stato]}" data-mt-faceto-stato="${escapeHtml(faceto.name)}">${STATO_NOMOJ[faceto.stato]}${mark}</fm-insigno></a>`;
}

function chatHtml(historio: AsistantoInput["historio"]): string {
  const items = historio.map(
    (entry) =>
      `<fm-karto data-mt-rolle="${entry.role}"><fm-teksto kind="caption">${entry.role === "user" ? "Du" : "Assistent"}</fm-teksto><fm-teksto>${escapeHtml(entry.content)}</fm-teksto></fm-karto>`,
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
    ? `Modell ${escapeHtml(input.ki.modelo ?? "")} · bisher ${input.sumo.enigo + input.sumo.eligo} Tokens, ${Math.round(input.sumo.ms / 1000)} s`
    : escapeHtml(input.ki.satz ?? "Kein Sprachmodell eingerichtet.");
  const nochNicht = vollstaendigkeit.nochNicht
    .map(
      (entry) => `${escapeHtml(entry.nomo)} (Umfang ${entry.umfang}): noch nicht Teil des Modells`,
    )
    .join(" · ");
  const previewSrc = `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=studio-${studio}&breite=mittel`;
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
<div><fm-navigado label="Schritte" page="${escapeHtml(faceto.name)}" orientation="vertical">${nav}<a href="/studio/${encodeURIComponent(name)}/${studio}" data-page="studio">Studio</a></fm-navigado><fm-teksto kind="caption">${nochNicht}</fm-teksto></div>
<div class="mt-studio-vorschau"><iframe data-mt-vorschau data-mt-src="${previewSrc}" title="Vorschau der Marke"></iframe></div>
<div class="mt-babilo">
<fm-teksto kind="caption" data-mt-ki>${kiSatz}</fm-teksto>
<div data-mt-babilo-listo>${chatHtml(input.historio)}</div>
<fm-tekstareo name="teksto" rows="3" data-mt-babilo-teksto${input.ki.pret ? "" : " disabled"}>Deine Nachricht</fm-tekstareo>
<fm-butono emphasis="high" data-mt-babilo-sendi${input.ki.pret ? "" : " disabled"}>Senden</fm-butono>
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
