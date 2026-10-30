// The steps of the configurator (Spec 023, §3): a step is one screen with one question, one
// suggestion and one preview; at most one main button, beside it Zurück and Weiter; no term of
// the Vortaro outside the link to the Expertenansicht. The screens are built of Fundamento's own
// Sxablonoj and Eroj: fm-sxelo as the frame, fm-pagxo as the page, fm-formularo for the fields.
// Two controls have no Ero — the colour picker and the slider stay native (Manko, plan ①), as the
// Werkstatt of the Vitrino has them. Pure: the server gives the input, this module gives the HTML.

import {
  type Agordo,
  deutscheZahl,
  parseAgordoColor,
  type Regler,
  reglerOf,
  reglerValue,
} from "@fundamento/agordilo";
import { oklchColor, srgbComponentsOf } from "@fundamento/modelo";
import { AVERTO_EKSPORTO } from "./asistanto/averto.js";
import { escapeHtml, jsonIsland, screenDocument } from "./html.js";
import { markoLabel } from "./ident.js";
import type { Klartext } from "./klartext.js";
import { readTiparoj, searchTiparoj, type Tiparo } from "./tiparoj.js";
import { loadBases } from "./vorschau.js";

export type SxtupoKey =
  | "start"
  | "farbe"
  | "schrift"
  | "form"
  | "raum"
  | "groesse"
  | "ikono"
  | "vorschau"
  | "fertig";

export interface Sxtupo {
  key: SxtupoKey;
  /** The number of the step in the spec (§3): the four of Gestalt share the 5. */
  spec: number;
  /** The short name, for the step navigation. */
  title: string;
  /** The one question of the screen. */
  question: string;
  /** The explanation in one sentence (no term without it, §3). */
  hint: string;
  /** The main button, where the step has an action beyond Weiter. */
  main?: string;
}

export const SXTUPOJ: readonly Sxtupo[] = [
  {
    key: "start",
    spec: 1,
    title: "Start",
    question: "Wie heißt deine Marke? Womit fängst du an?",
    hint: "Der Konfigurator legt für die Marke einen Ordner im Markenordner an (FM_MARKEN_DIR in der .env, sonst ~/Fundamento/marken) und arbeitet darin.",
    main: "Anlegen",
  },
  {
    key: "farbe",
    spec: 3,
    title: "Farbe",
    question: "Ist das deine Leitfarbe?",
    hint: "Aus der Leitfarbe werden alle Farbflächen, Texte und Zustände abgeleitet und sofort auf Kontrast geprüft.",
  },
  {
    key: "schrift",
    spec: 4,
    title: "Schrift",
    question: "Welche Schrift?",
    hint: "Eine Open-Source-Webfont kommt mit ihrer Lizenz in die Marke; eine eigene lizenzierte Schrift wird nur genannt, ihre Datei bleibt in deinem privaten Repo.",
  },
  {
    key: "form",
    spec: 5,
    title: "Form",
    question: "Wie rund soll die Marke sein?",
    hint: "Eine Wahl: eckig, leicht gerundet, rund oder ganz rund. Bei ganz rund werden Bedienelemente zur Pille; Karten und Dialoge bleiben groß gerundet.",
  },
  {
    key: "raum",
    spec: 5,
    title: "Raum",
    question: "Wie luftig soll die Marke sein?",
    hint: "Der Regler skaliert alle Abstände gemeinsam; die Mindestgröße der Bedienelemente bleibt.",
  },
  {
    key: "groesse",
    spec: 5,
    title: "Schriftgröße",
    question: "Wie groß soll die Schrift sein?",
    hint: "Der Regler verschiebt alle Schriftgrößen um bis zu zwei Stufen; 0 ist die Ausgangsgröße.",
  },
  {
    key: "ikono",
    spec: 5,
    title: "Icons",
    question: "Wie kräftig sollen die Icons sein?",
    hint: "Die Strichstärke der Icons, in den Stärken, die im Repo vorliegen.",
  },
  {
    key: "vorschau",
    spec: 6,
    title: "Vorschau",
    question: "Passt das?",
    hint: "Die fünf Seitenmuster in drei Breiten, hell und dunkel umschaltbar.",
  },
  {
    key: "fertig",
    spec: 7,
    title: "Fertig",
    question: "Speichern?",
    hint: "Der Prüfbericht in Klartext; Speichern legt die Marke ab und schreibt die gewählten Exporte.",
    main: "Speichern",
  },
];

export function sxtupoOf(key: SxtupoKey): Sxtupo {
  const found = SXTUPOJ.find((sxtupo) => sxtupo.key === key);
  if (found === undefined) throw new Error(`no step ${key}`);
  return found;
}

export const isSxtupoKey = (value: string): value is SxtupoKey =>
  SXTUPOJ.some((sxtupo) => sxtupo.key === value);

export function nextOf(key: SxtupoKey): Sxtupo | undefined {
  return SXTUPOJ[SXTUPOJ.findIndex((sxtupo) => sxtupo.key === key) + 1];
}

export function previousOf(key: SxtupoKey): Sxtupo | undefined {
  const index = SXTUPOJ.findIndex((sxtupo) => sxtupo.key === key);
  return index > 0 ? SXTUPOJ[index - 1] : undefined;
}

export interface MarkoView {
  name: string;
  agordo: Agordo;
  saved: boolean;
  rev: number;
}

export interface ScreenInput {
  sxtupo: SxtupoKey;
  marko?: MarkoView;
  /** The brands of the working directory (step 1: open one). */
  markoj: string[];
  /** A problem to show at the top (a name that is none …). */
  problem?: string;
  /** A message to show at the top (Gespeichert …). */
  message?: string;
  /** Step 4: the search and its results. */
  tiparoj?: { query: string; results: Tiparo[] };
  /** Step 4: an upload stored in <brand>/fontoj/, waiting for the confirmation. */
  upload?: { filename: string; family: string };
  /** Step 4: the state of the private repository, and the result of an upload. */
  privata: { locked: boolean; sentence: string; result?: string };
  /** Steps 3 and 7: the report in plain words. */
  klartext?: Klartext;
  /** The Expertenansicht: a link into the Werkstatt of the Vitrino, or the sentence how to build it. */
  expert: { href?: string; sentence?: string; hinweis?: string };
  /** The sliders of the Agordo, from the structure. */
  regler: readonly Regler[];
  /** The icon weights the structure draws. */
  ikonoGewichte: readonly string[];
  /** Step 7, after a save: what the export wrote, or why not. */
  eksporto?: { sentences: string[]; issues: string[] };
}

/** K-5 (Spec 024): the form is a choice; each maps to the radius factor of the Agordo. */
export const FORM_WAHL: readonly { key: string; label: string; radius: number }[] = [
  { key: "eckig", label: "Eckig", radius: 0 },
  { key: "leicht", label: "Leicht gerundet", radius: 0.5 },
  { key: "rund", label: "Rund", radius: 1 },
  { key: "ganz-rund", label: "Ganz rund (Bedienelemente als Pille)", radius: 2 },
];

/** The choice an Agordo stands at: the nearest radius factor, the pill when the control role is radius.full. */
export function formWahlOf(agordo: Agordo): string {
  if (agordo.festgelegt?.["radius.role.control"]?.alias === "radius.full") return "ganz-rund";
  const radius = agordo.form?.radius ?? 1;
  return (
    [...FORM_WAHL]
      .filter((wahl) => wahl.key !== "ganz-rund")
      .sort((a, b) => Math.abs(a.radius - radius) - Math.abs(b.radius - radius))[0]?.key ?? "rund"
  );
}

const STEP_SLIDERS: Readonly<Partial<Record<SxtupoKey, string>>> = {
  raum: "raum.abstand",
  groesse: "schrift.groesse",
};

/** A colour of the Agordo as `#rrggbb`, for the native picker. */
export function hexOf(colour: string): string {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(colour);
  if (short !== null)
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(colour)) return colour.toLowerCase();
  const oklch = parseAgordoColor(colour);
  if (oklch === undefined) return "#000000";
  return `#${srgbComponentsOf(oklchColor(oklch.l, oklch.c, oklch.h))
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const stepLine = (key: SxtupoKey): string =>
  `Schritt ${SXTUPOJ.findIndex((sxtupo) => sxtupo.key === key) + 1} von ${SXTUPOJ.length}`;

const url = (name: string, key: SxtupoKey): string => `/marko/${encodeURIComponent(name)}/${key}`;

function navigation(input: ScreenInput): string {
  if (input.marko === undefined) return "";
  const name = input.marko.name;
  const links = SXTUPOJ.filter((sxtupo) => sxtupo.key !== "start")
    .map(
      (sxtupo) =>
        `<a href="${url(name, sxtupo.key)}" data-page="${sxtupo.key}">${escapeHtml(sxtupo.title)}</a>`,
    )
    .join("");
  return `<fm-navigado slot="nav" label="Schritte" page="${input.sxtupo}">${links}</fm-navigado>`;
}

function notices(input: ScreenInput): string {
  const parts: string[] = [];
  if (input.problem !== undefined) {
    parts.push(
      `<fm-avizo slot="notices" intent="danger" id="mt-problem">${escapeHtml(input.problem)}</fm-avizo>`,
    );
  }
  if (input.message !== undefined) {
    parts.push(`<fm-avizo slot="notices" intent="success">${escapeHtml(input.message)}</fm-avizo>`);
  }
  // Nachlese 10 N-5: the Expertenansicht says when its build is not the Metiejo's.
  if (input.expert.hinweis !== undefined) {
    parts.push(
      `<fm-avizo slot="notices" intent="warning" data-mt-expert-hinweis>${escapeHtml(input.expert.hinweis)}</fm-avizo>`,
    );
  }
  return parts.join("");
}

/** The report in plain words as HTML: good, adjusted, problems with one suggestion each (the first as the main button). */
export function klartextHtml(klartext: Klartext, options: { firstAsMain: boolean }): string {
  const parts: string[] = [];
  parts.push(
    `<fm-avizo intent="${klartext.exportable ? "success" : klartext.probleme.some((p) => p.fest) ? "danger" : "warning"}"><span slot="heading">${
      klartext.exportable
        ? "Alles geprüft, die Marke kann gespeichert werden."
        : klartext.jugxoNoetig && !klartext.probleme.some((p) => p.fest)
          ? "Eine Abweichung braucht eine Begründung in der Expertenansicht."
          : "Ein Problem hält das Speichern noch auf."
    }</span>${klartext.gut.map((satz) => `<fm-teksto>${escapeHtml(satz)}</fm-teksto>`).join("")}</fm-avizo>`,
  );
  if (klartext.angepasst.length > 0) {
    parts.push(
      `<fm-teksto kind="caption">Angepasst: ${klartext.angepasst.map(escapeHtml).join(" ")}</fm-teksto>`,
    );
  }
  klartext.probleme.forEach((problem, index) => {
    const apply =
      problem.apply === undefined
        ? ""
        : `<fm-butono slot="actions" emphasis="${index === 0 && options.firstAsMain ? "high" : "medium"}" data-apply="${escapeHtml(JSON.stringify(problem.apply))}">Vorschlag übernehmen</fm-butono>`;
    parts.push(
      `<fm-avizo intent="${problem.fest ? "danger" : "warning"}"><span slot="heading">${escapeHtml(problem.satz)}</span><fm-teksto>Vorschlag: ${escapeHtml(problem.vorschlag)}</fm-teksto>${apply}</fm-avizo>`,
    );
  });
  return parts.join("");
}

function sliderField(input: ScreenInput, path: string): string {
  const regler = input.regler.find((entry) => entry.path === path);
  if (regler === undefined || input.marko === undefined) return "";
  const value = reglerValue(input.marko.agordo, regler);
  return `<div class="mt-regilo"><fm-teksto kind="caption" id="mt-regilo-label">${escapeHtml(regler.label)} (${deutscheZahl(regler.min)} bis ${deutscheZahl(regler.max)}, Ausgangswert ${deutscheZahl(regler.standard)})</fm-teksto><output aria-live="polite">${deutscheZahl(value)}</output><input type="range" name="${path}" min="${regler.min}" max="${regler.max}" step="${regler.step}" value="${value}" data-live="${path}" data-live-kind="number" aria-labelledby="mt-regilo-label"></div>`;
}

function fields(input: ScreenInput): string {
  const marko = input.marko;
  switch (input.sxtupo) {
    case "start": {
      const open =
        input.markoj.length === 0
          ? ""
          : `<fm-elektilo name="oeffnen" empty-label="Marke wählen">Vorhandene Marke${input.markoj
              .map(
                (name) =>
                  `<data slot="options" value="${escapeHtml(name)}">${escapeHtml(name)}</data>`,
              )
              .join("")}</fm-elektilo>`;
      return `<fm-kampo name="name" required autocomplete="off" placeholder="Bluna">Name der Marke<span slot="help">So, wie du ihn schreibst. Kennung: <output data-mt-kennung aria-live="polite">–</output></span></fm-kampo><fm-elekto name="basis" value="leer">Womit fängst du an?<data slot="options" value="leer">Leer: nur der Name und eine Leitfarbe zum Ändern</data><data slot="options" value="komuna">Beispiel komuna: die Farbe und die Schriften der Referenz</data><data slot="options" value="komuna-0-2">Beispiel komuna-0-2: die Referenz, wie sie vor den neuen Grundlagen aussah</data>${
        input.markoj.length === 0
          ? ""
          : '<data slot="options" value="oeffnen">Vorhandene Marke öffnen</data>'
      }</fm-elekto>${open}`;
    }
    case "farbe": {
      if (marko === undefined) return "";
      const hex = hexOf(marko.agordo.leitfarbe);
      return `<div class="mt-koloro"><input type="color" name="leitfarbe" value="${hex}" data-live="leitfarbe" aria-labelledby="mt-koloro-label"><fm-teksto id="mt-koloro-label">Leitfarbe <output aria-live="polite">${hex}</output></fm-teksto></div>`;
    }
    case "schrift": {
      if (marko === undefined) return "";
      const current = marko.agordo.schriften?.body ?? marko.agordo.schriften?.display;
      const parts: string[] = [];
      if (input.upload !== undefined) {
        parts.push(
          `<fm-kampo name="datei" value="${escapeHtml(input.upload.filename)}" readonly>Datei</fm-kampo><fm-kampo name="family" value="${escapeHtml(input.upload.family)}" required>Name der Schrift<span slot="help">So nennt die Marke die Schrift: „${escapeHtml(input.upload.family)}, lizenziert, nicht enthalten“, mit Rückfall auf die Ausgangsschrift.</span></fm-kampo>`,
        );
        return parts.join("");
      }
      parts.push(
        `<fm-kampo kind="search" name="q" value="${escapeHtml(input.tiparoj?.query ?? "")}" placeholder="Inter, Source Sans …">Schrift suchen<span slot="help">${
          current === undefined
            ? "Open-Source-Webfonts mit Lizenz; die Suche zeigt bis zu zwölf Treffer."
            : `Aktuell: ${escapeHtml(current.family)} (${escapeHtml(current.license)}). Open-Source-Webfonts mit Lizenz; die Suche zeigt bis zu zwölf Treffer.`
        }</span></fm-kampo>`,
      );
      // Spec 024 ② (two families): which role the chosen font takes.
      parts.push(
        `<fm-elekto name="rolle" value="beide" orientation="horizontal" size="small">Für welche Schrift?<data slot="options" value="display">Anzeige</data><data slot="options" value="body">Fließtext</data><data slot="options" value="beide">Beide</data></fm-elekto>`,
      );
      const results = input.tiparoj?.results ?? [];
      if (results.length > 0) {
        parts.push(
          `<fm-elekto name="tiparo" id="mt-treffer">Treffer${results
            .map(
              (tiparo) =>
                `<data slot="options" value="${escapeHtml(tiparo.id)}">${escapeHtml(tiparo.family)} · ${escapeHtml(tiparo.license)} · ${escapeHtml(tiparo.category)}</data>`,
            )
            .join("")}</fm-elekto>`,
        );
      }
      if (!input.privata.locked) {
        parts.push(
          `<fm-alsxutilo name="datei" accept=".woff2,.woff,.ttf,.otf" data-mt-upload>Eigene Schrift hochladen<span slot="help">${escapeHtml(input.privata.sentence)}</span><span slot="error" id="mt-upload-problem" hidden></span></fm-alsxutilo>`,
        );
      }
      return parts.join("");
    }
    case "form": {
      if (marko === undefined) return "";
      const current = formWahlOf(marko.agordo);
      return `<fm-elekto name="form.wahl" value="${current}" data-live="form.wahl">Form${FORM_WAHL.map(
        (wahl) => `<data slot="options" value="${wahl.key}">${escapeHtml(wahl.label)}</data>`,
      ).join("")}</fm-elekto>`;
    }
    case "raum":
    case "groesse":
      return sliderField(input, STEP_SLIDERS[input.sxtupo] ?? "");
    case "ikono": {
      if (marko === undefined) return "";
      const weight = marko.agordo.ikono?.gewicht ?? "regular";
      return `<fm-elekto name="ikono.gewicht" value="${escapeHtml(weight)}" orientation="horizontal" data-live="ikono.gewicht">Strichstärke${input.ikonoGewichte
        .map(
          (name) => `<data slot="options" value="${escapeHtml(name)}">${escapeHtml(name)}</data>`,
        )
        .join("")}</fm-elekto>`;
    }
    case "vorschau":
      return '<fm-sxaltilo name="dunkel" data-mt-scheme>Dunkel</fm-sxaltilo>';
    case "fertig":
      return [
        '<fm-markobutono name="eksporto-aspekto" value="ja" checked>Paket der Marke (für ein Projekt mit fundamento.config.json)</fm-markobutono>',
        '<fm-markobutono name="eksporto-css" value="ja" checked>CSS mit allen Werten</fm-markobutono>',
        '<fm-markobutono name="eksporto-figma" value="ja" checked>Figma-Plugin</fm-markobutono>',
      ].join("");
  }
}

function problems(input: ScreenInput): string {
  const parts: string[] = [];
  if (input.sxtupo === "schrift") {
    // K-4 (Spec 024): without a hit, a sentence that says what to do.
    const query = input.tiparoj?.query ?? "";
    parts.push(
      `<fm-avizo slot="problems" intent="info" id="mt-keine-schrift"${query !== "" && (input.tiparoj?.results.length ?? 0) === 0 ? "" : " hidden"}>Keine Schrift gefunden für „<span data-mt-suche>${escapeHtml(query)}</span>“: Versuche einen Teil des Namens, zum Beispiel „Sans“ oder „Serif“, oder lade eine eigene Schrift hoch.</fm-avizo>`,
    );
    if (input.privata.locked) {
      parts.push(
        `<fm-avizo slot="problems" intent="info">${escapeHtml(input.privata.sentence)}</fm-avizo>`,
      );
    }
    if (input.upload !== undefined) {
      parts.push(
        `<fm-avizo slot="problems" intent="info"><span slot="heading">Diese Datei geht in dein privates Repo (FM_TIPAROJ_REPO).</span><fm-teksto>${escapeHtml(input.upload.filename)} liegt bis dahin nur in marken/${escapeHtml(input.marko?.name ?? "")}/fontoj/. Erst nach „In privates Repo hochladen“ wird sie dort abgelegt.</fm-teksto></fm-avizo>`,
      );
    }
    if (input.privata.result !== undefined) {
      parts.push(
        `<fm-avizo slot="problems" intent="${input.privata.result.startsWith("Kein Push") ? "warning" : "success"}">${escapeHtml(input.privata.result)}</fm-avizo>`,
      );
    }
  }
  if (input.sxtupo === "fertig") {
    // Constitution v2.5, Art. VI, 2: before every export a visible notice of possible confusability.
    parts.push(
      `<fm-avizo slot="problems" intent="info" data-mt-averto>${escapeHtml(AVERTO_EKSPORTO)}</fm-avizo>`,
    );
  }
  if (input.sxtupo === "fertig" && input.eksporto !== undefined) {
    for (const sentence of input.eksporto.sentences) {
      parts.push(`<fm-avizo slot="problems" intent="success">${escapeHtml(sentence)}</fm-avizo>`);
    }
    for (const issue of input.eksporto.issues) {
      parts.push(`<fm-avizo slot="problems" intent="danger">${escapeHtml(issue)}</fm-avizo>`);
    }
  }
  return parts.join("");
}

function actions(input: ScreenInput): string {
  const sxtupo = sxtupoOf(input.sxtupo);
  const previous = previousOf(input.sxtupo);
  const next = nextOf(input.sxtupo);
  const name = input.marko?.name;
  const parts: string[] = [];
  if (previous !== undefined && name !== undefined) {
    parts.push(
      `<fm-butono slot="actions" emphasis="low" data-href="${url(name, previous.key)}">Zurück</fm-butono>`,
    );
  }
  const main =
    input.sxtupo === "schrift" && input.upload !== undefined
      ? "In privates Repo hochladen"
      : sxtupo.main;
  if (main !== undefined) {
    parts.push(
      `<fm-butono slot="actions" type="submit" emphasis="high">${escapeHtml(main)}</fm-butono>`,
    );
    if (next !== undefined && name !== undefined) {
      parts.push(
        `<fm-butono slot="actions" emphasis="medium" data-href="${url(name, next.key)}">Weiter</fm-butono>`,
      );
    }
  } else if (next !== undefined) {
    // The first suggestion of the colour check is the main button (rendered with the report);
    // Weiter stays the submit of the form.
    parts.push('<fm-butono slot="actions" type="submit" emphasis="medium">Weiter</fm-butono>');
  }
  return parts.join("");
}

function expertSection(input: ScreenInput): string {
  if (input.expert.href !== undefined) return "";
  return `<section><fm-titolo level="2">Expertenansicht</fm-titolo><fm-teksto>${escapeHtml(
    input.expert.sentence ??
      "Die Expertenansicht ist die Werkstatt der Vitrino: alle Regler, der vollständige Bericht, die Gegenüberstellung.",
  )}</fm-teksto></section>`;
}

function preview(input: ScreenInput): string {
  if (input.marko === undefined) return "";
  const full = input.sxtupo === "vorschau";
  const src = `/marko/${encodeURIComponent(input.marko.name)}/vorschau?sxtupo=${input.sxtupo}&breite=${full ? "alle" : "mittel"}`;
  const report =
    input.sxtupo === "farbe" || input.sxtupo === "fertig"
      ? `<div id="mt-pruefung" class="mt-pruefung">${
          input.klartext === undefined
            ? '<fm-teksto kind="caption">Die Prüfung läuft …</fm-teksto>'
            : klartextHtml(input.klartext, { firstAsMain: input.sxtupo === "farbe" })
        }</div>`
      : "";
  return `<div class="mt-vorschau"${full ? ' data-mt-breite="voll"' : ""}>${report}<fm-teksto kind="caption">Vorschau in der Marke${full ? ", drei Breiten" : ""}</fm-teksto><iframe data-mt-vorschau data-mt-src="${src}" title="Vorschau der Marke"></iframe></div>`;
}

/** The screen of a step: a document in komuna built of sxelo, pagxo and formularo. */
export function screen(input: ScreenInput): string {
  const sxtupo = sxtupoOf(input.sxtupo);
  const name = input.marko?.name;
  const action =
    input.sxtupo === "start"
      ? "/marko"
      : input.sxtupo === "fertig" && name !== undefined
        ? `/marko/${encodeURIComponent(name)}/speichern`
        : input.sxtupo === "schrift" && input.upload !== undefined && name !== undefined
          ? `/marko/${encodeURIComponent(name)}/privata`
          : name === undefined
            ? "/marko"
            : url(name, input.sxtupo);
  const expertLink = `${
    name === undefined
      ? ""
      : `<fm-ligilo slot="actions" to="/studio/${encodeURIComponent(name)}/farbe" placement="standalone">Studio</fm-ligilo>`
  }${
    input.expert.href === undefined
      ? ""
      : `<fm-ligilo slot="actions" to="${escapeHtml(input.expert.href)}" placement="standalone" external>Expertenansicht</fm-ligilo>`
  }`;
  const body = `<fm-sxelo>
<span slot="brand">Metiejo</span>
<span slot="principal">${name === undefined ? "Neue Marke" : `Marke ${escapeHtml(markoLabel(name, input.marko?.agordo.etikedoj?.marko))}`} · ${stepLine(input.sxtupo)}</span>
${navigation(input)}
${notices(input)}
<fm-pagxo>
<fm-titolo slot="title" level="1" focusable>${escapeHtml(sxtupo.question)}</fm-titolo>
<fm-teksto slot="subtitle">${escapeHtml(sxtupo.hint)}</fm-teksto>
${expertLink}
<section class="mt-sxtupo"${input.sxtupo === "vorschau" || input.marko === undefined ? " data-mt-plena" : ""}>
<fm-formularo label="${escapeHtml(sxtupo.title)}" data-action="${action}">
${problems(input)}
${fields(input)}
${actions(input)}
</fm-formularo>
${preview(input)}
</section>
${expertSection(input)}
</fm-pagxo>
</fm-sxelo>
<script type="application/json" id="mt-sxtupo">${jsonIsland({ sxtupo: input.sxtupo, marko: name ?? null })}</script>`;
  const root: Record<string, string> = { "data-mt-sxtupo": input.sxtupo };
  if (input.marko !== undefined) {
    root["data-mt-marko"] = input.marko.name;
    root["data-mt-rev"] = String(input.marko.rev);
  }
  return screenDocument({
    title: `Metiejo – ${sxtupo.title}${name === undefined ? "" : ` – ${name}`}`,
    body,
    root,
  });
}

export interface ScreenInventory {
  /** Titles of level 1 that end in a question mark. */
  questions: number;
  /** Buttons of high emphasis. */
  mainButtons: number;
  mainLabel?: string;
  back: boolean;
  next: boolean;
  /** The visible text of the screen, tags removed. */
  text: string;
}

const decode = (text: string): string =>
  text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

/** What a screen shows, counted for M-2. */
export function screenInventory(html: string): ScreenInventory {
  const titles = [
    ...html.matchAll(/<fm-titolo[^>]*\bslot="title"[^>]*\blevel="1"[^>]*>([\s\S]*?)<\/fm-titolo>/g),
  ];
  const questions = titles.filter(([, text = ""]) => decode(text).trim().endsWith("?")).length;
  const mains = [
    ...html.matchAll(/<fm-butono[^>]*\bemphasis="high"[^>]*>([\s\S]*?)<\/fm-butono>/g),
  ];
  const inventory: ScreenInventory = {
    questions,
    mainButtons: mains.length,
    back: /<fm-butono[^>]*>\s*Zurück\s*<\/fm-butono>/.test(html),
    next: /<fm-butono[^>]*>\s*Weiter\s*<\/fm-butono>/.test(html),
    text: decode(
      html
        .replace(/<script[\s\S]*?<\/script>/g, "")
        .replace(/<style[\s\S]*?<\/style>/g, "")
        .replace(/<[^>]+>/g, " "),
    )
      .replace(/\s+/g, " ")
      .trim(),
  };
  const label = mains[0]?.[1];
  if (label !== undefined) inventory.mainLabel = decode(label).trim();
  return inventory;
}

/** An input per step for the tests: a brand like provo, one problem with a suggestion, the Expertenansicht as a link. */
export function exampleScreenInput(key: SxtupoKey): ScreenInput {
  const bases = loadBases();
  const agordo: Agordo = {
    name: "provo",
    leitfarbe: "#6b4fa0",
    regler: { kontrast: 0.1 },
    form: { radius: 1.6 },
    raum: { abstand: 1.15 },
    ikono: { gewicht: "bold" },
    schriften: {
      body: {
        family: "Inter",
        license: "OFL-1.1",
        source: "https://fontsource.org/fonts/inter",
        redistributable: true,
        scripts: ["Latn"],
      },
    },
  };
  const klartext: Klartext = {
    exportable: false,
    gut: ["6400 von 6408 Kontrastpaaren bestehen; 8 fallen durch."],
    angepasst: ["Die Sättigung von 3 Farbstufen wurde gesenkt, damit der Kontrast stimmt."],
    probleme: [
      {
        satz: "Zu wenig Kontrast bei action.primary (hell).",
        vorschlag: "Kontrast auf 0,2 setzen.",
        apply: { regler: { kontrast: 0.2 } },
        fest: true,
        regulo: "contrast-below-threshold",
      },
    ],
    jugxoNoetig: false,
  };
  const input: ScreenInput = {
    sxtupo: key,
    markoj: ["provo"],
    privata: {
      locked: false,
      sentence:
        "Eine hochgeladene lizenzierte Schrift geht nach deiner Bestätigung in dein privates Repo (FM_TIPAROJ_REPO).",
    },
    expert: { href: "/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=ekzemplo" },
    regler: reglerOf(bases.gestalt),
    ikonoGewichte: ["regular", ...Object.keys(bases.structure.ikonoGewichte?.glyphs ?? {})],
  };
  if (key !== "start") input.marko = { name: "provo", agordo, saved: false, rev: 1 };
  if (key === "schrift")
    input.tiparoj = { query: "inter", results: searchTiparoj(readTiparoj(), "inter", 5) };
  if (key === "farbe" || key === "fertig") input.klartext = klartext;
  return input;
}
