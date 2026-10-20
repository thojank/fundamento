// The data of the Vitrino (Spec 004, FR-06, data-model §4). Everything the document shows is
// computed here, at build time, from the Modelo: the browser only picks the slice that belongs to
// the combination on screen. A second contrast implementation in the browser would be a second
// truth (Art. VIII), so there is none.

import {
  type AspiroResult,
  combinationsOf,
  dimensioKovrado,
  evaluateAlirebleco,
  evaluateAspiroj,
  getEro,
  type LoadedEro,
  type Modelo,
  oklchLExtreme,
  oklchLightness,
  oklchLStepConsistency,
  palettePikoj,
  readDtcgColor,
  regularoEnforcementIssues,
  STATE_KEY,
  styledProps,
  typeScaleConsistency,
  type UzoOutput,
  type ValidationIssue,
} from "@fundamento/modelo";
import type { CeloInput } from "../../build.js";

const PALETTE = /^color\.palette\.([a-z0-9-]+)\.(\d+)$/;
const SURFACES = [
  "color.background.sunken",
  "color.background.canvas",
  "color.background.default",
  "color.background.raised",
];
const TEXT = ["color.text.default", "color.text.subtle", "color.text.muted"];
/** Opaque roles that are a surface: the page, an action's fill, a status fill (Spec 004). */
const SURFACE_PATTERNS = [
  /^color\.background\./,
  /^color\.action\.[a-z-]+\.(rest|hover|pressed|selected|disabled)$/,
  /^color\.status\.[a-z-]+\.(basic|weak|subtle)$/,
];
const TYPE_SCALE = /^font\.size\.scale\.(\d+)$/;

export interface VitrinoRolo {
  token: string;
  /** The value as text: a hex, or `durchsichtig` / `#rrggbb, N % Deckung` for an overlay. */
  hex: string;
  /** OKLCH lightness; absent for an overlay, which has none until it lies on a surface. */
  l?: number;
  /** Lightness distance to the previous row, where the roles form a ladder. */
  alNaskbo?: number;
  /** Distance to the nearer anchor (pure white, pure black). */
  alEkstremo?: number;
}

export interface VitrinoMezuro {
  /** For an overlay: the surface the pair was measured on, the worst it may lie on (Spec 004). */
  surfaco?: string;
  paro: string;
  kategorio: string;
  wcag2: number;
  sojlo?: number;
  rezervo?: number;
  apca: number;
  apcaSojlo?: number;
  pasis: boolean;
  brancxo: string;
  /** The same pair in the comparison state, when a baseline was given. */
  bazo?: { wcag2: number; apca: number };
}

export interface VitrinoDatumoj {
  fundamento: string;
  aspektoj: string[];
  dimensioj: { name: string; valoroj: string[]; default: string }[];
  kombinoj: string[];
  paletroj: Record<
    string,
    {
      rampo: string;
      /** `l` is absent for an overlay (shade, tint): it has no lightness until it lies on a surface. */
      stupoj: { stupo: number; token: string; hex: string; l?: number }[];
      regula: string;
    }[]
  >;
  roloj: Record<
    string,
    { surfaces: VitrinoRolo[]; text: VitrinoRolo[]; status: VitrinoRolo[]; agoj: VitrinoRolo[] }
  >;
  mezuroj: Record<string, VitrinoMezuro[]>;
  /** Per combination every automatic Regulo with its result; its kialo stands in regulojKialoj. */
  regularo: Record<string, { regulo: string; pasis: boolean; trovoj: string[] }[]>;
  /** The kialo of every automatic Regulo, once (Nachlese 6 N6-3: it stood in all 72 combinations). */
  regulojKialoj: Record<string, string>;
  aspiroj: Record<
    string,
    {
      metriko: string;
      limo: string;
      /** The tokens the goal applies to, or "alle Tokens": two coverage numbers need their scope. */
      amplekso: string;
      mezurita: string;
      atingita: boolean;
      kialo: string;
    }[]
  >;
  kovrado: Record<
    string,
    { dimensio: string; valoro: string; propraj: number; entute: number; parto: number }[]
  >;
  komparo: Record<string, { kriterio: string; a: string; b: string; pli: "a" | "b" | "egale" }[]>;
  /** Per Ero its grid as markup (`fm-<ero>`); the element upgrades it in the browser (Spec 008). */
  eroj: Record<string, string>;
  /**
   * The a11y role of every Ero (button, link, textbox): the section "Gebrauch" names the subject
   * of a layout sentence from it — the line of a textbox that never breaks is the input line, not
   * the label (Abnahme Spec 009, C8).
   */
  a11yRoloj: Record<string, string>;
  /** The Eroj whose textbox runs over several lines (Spec 011 ②: the tekstareo, by its rows). */
  plurliniaj: string[];
  /** The Eroj that show initials (Spec 015 ③: the avataro, an image with the part initials). */
  avataroj: string[];
  /**
   * The Uzo of every Ero that has one, as get_ero states it (Spec 007 T027, S5): the Vitrino
   * answers "Wann nehme ich den Butono nicht?" from the same data as the Gvidanto.
   */
  uzo: Record<string, UzoOutput>;
  /** Sum of the advisory APCA findings, now and in the baseline. */
  /**
   * Advisory APCA findings. `nun` counts this build, `kombinoj` how many combinations that is.
   * A snapshot may cover other combinations than this build (a second Aspekto doubles them), so
   * `komunaj` counts this build only where the snapshot has data, and `mankantaj` says how many
   * combinations of the snapshot are missing here — only then is `bazo` more than the comparison.
   */
  apcaHintoj: {
    nun: number;
    kombinoj: number;
    bazo?: number;
    bazoKombinoj?: number;
    komunaj?: { nun: number; kombinoj: number };
    mankantaj?: number;
    /**
     * Per KontrastKategorio, because a bare total says nothing (maintainer's decision of
     * 2026-09-20): how many measurements there are, how many of them are advisory findings, the
     * worst APCA value with its pair, and the same for the comparison state where it has data.
     */
    kategorioj: {
      kategorio: string;
      mezuroj: number;
      nun: number;
      /** The APCA thresholds that bind this category; two values when contrast=high raises it. */
      sojlo: string;
      plejMalbona: number;
      plejMalbonaParo: string;
      bazo?: number;
      bazoPlejMalbona?: number;
    }[];
  };
}

/** A measurement snapshot of another state of the Modelo (`fm modelo mezuroj`). */
export interface VitrinoBazo {
  mezuroj: Record<string, { paro: string; wcag2: number; apca: number }[]>;
  apcaHintoj: number;
}

/**
 * Rounds to `digits` places. Takes any finite number: the earlier form glued "e3" to the number's
 * text, and a number in exponent notation (1 − L of a pure white, "2e-16") became NaN — seen in
 * the Vitrino as the anchor distance of color.text.default in dark (Spec 004 M1, Befund 5).
 */
export const roundTo = (value: number, digits = 3): number => {
  const rounded = Number(value.toFixed(digits));
  return rounded === 0 ? 0 : rounded;
};

const plainHex = (color: { hex?: string; components: readonly (number | "none")[] }): string => {
  if (typeof color.hex === "string") return color.hex;
  const channel = (component: number | "none") =>
    Math.round((component === "none" ? 0 : component) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${color.components.map(channel).join("")}`;
};

/** An overlay is named as one: a fully transparent value has no colour, a translucent one a cover. */
const overlayText = (value: unknown): string | undefined => {
  const color = readDtcgColor(value);
  const alpha = color?.alpha ?? 1;
  if (color === undefined || alpha >= 1) return undefined;
  return alpha === 0 ? "durchsichtig" : `${plainHex(color)}, ${Math.round(alpha * 100)} % Deckung`;
};

const hexOf = (value: unknown): string => {
  const color = readDtcgColor(value);
  if (color === undefined) return "";
  const hex = color.hex;
  if (typeof hex === "string") return hex;
  const channel = (component: number | "none") =>
    Math.round((component === "none" ? 0 : component) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${color.components.map(channel).join("")}`;
};

const lightnessOf = (value: unknown): number => {
  const color = readDtcgColor(value);
  return color === undefined ? 0 : roundTo(oklchLightness(color));
};

/** `aspekto|color-scheme|contrast|density|viewport|motion`, in Dimensio priority order. */
export function kombinoKey(modelo: Modelo, assignment: Readonly<Record<string, string>>): string {
  return modelo.dimensioj.map((dimensio) => assignment[dimensio.name] ?? "").join("|");
}

const rolesKey = (assignment: Readonly<Record<string, string>>): string =>
  [assignment.aspekto, assignment["color-scheme"], assignment.contrast].join("|");

function roleRows(
  tokens: Record<string, { value: unknown }>,
  names: readonly string[],
  ladder: boolean,
): VitrinoRolo[] {
  const rows: VitrinoRolo[] = [];
  for (const [index, token] of names.entries()) {
    const entry = tokens[token];
    if (entry === undefined) continue;
    const color = readDtcgColor(entry.value);
    if (color === undefined) continue;
    const overlay = overlayText(entry.value);
    if (overlay !== undefined) {
      // An overlay has no lightness of its own until it lies on a surface (Spec 004).
      rows.push({ token, hex: overlay });
      continue;
    }
    const l = roundTo(oklchLightness(color));
    const previousL = rows.at(-1)?.l;
    rows.push({
      token,
      hex: hexOf(entry.value),
      l,
      ...(ladder && previousL !== undefined && index > 0
        ? { alNaskbo: roundTo(Math.abs(l - previousL)) }
        : {}),
      ...(ladder ? { alEkstremo: roundTo(Math.max(0, oklchLExtreme(color))) } : {}),
    });
  }
  return rows;
}

const byPrefix = (tokens: Record<string, { value: unknown }>, prefix: string): string[] =>
  Object.keys(tokens)
    .filter((name) => name.startsWith(prefix))
    .sort();

/**
 * The surface the Vitrino shows its Eroj on: the background of its page. Figma fills the component
 * set with the same token, so both pictures stand on the same ground (F16).
 */
export const VITRINO_SURFACE = "color.background.canvas";

/**
 * The props the Vitrino lays out in rows; the states stand in columns. The axes of the butono are
 * `emphasis` and `intent` since F1 (Spec 007, Jugxo jug_01M4DNSD0SV43Y943T21RQF7EM).
 */
export const VITRINO_ROW_KEYS = ["emphasis", "intent", "size"] as const;

/**
 * The text a button carries in the Vitrino: its combination, joined by " · ". Figma uses the same
 * rule for the default of its label property, so both pictures say the same (F11).
 */
export function vitrinoLabelOf(combination: Readonly<Record<string, string>>): string {
  return Object.values(combination).join(" · ");
}

/** The Uzo of every Ero of the Modelo that has one, from get_ero (one source, S5). */
export function uzojOf(modelo: Modelo): Record<string, UzoOutput> {
  const uzoj: Record<string, UzoOutput> = {};
  for (const entry of modelo.eroj) {
    const answer = getEro(modelo, { name: entry.ero.name });
    if (answer.ok && answer.output.uzo !== undefined) uzoj[entry.ero.name] = answer.output.uzo;
  }
  return uzoj;
}

/**
 * The example text of every text slot besides the label (Abnahme Spec 009, F-5): one neutral word
 * per slot, the same words the Figma set shows in its field (F-4: Hinweis, Fehler). Without them
 * the Vitrino showed a field without help and without error text.
 */
export const VITRINO_SLOT_TEXTS: Readonly<Record<string, string>> = {
  help: "Hinweis",
  error: "Fehler",
  // Spec 011 ② (plan ② D-15): the message and the reason's label of a dialog.
  message: "Nachricht",
  reason: "Begründung",
  // Spec 014 ① (plan ① D-02): the help of the reason field, one sentence (help-is-one-sentence).
  "reason-help": "Nenne den Grund in einem Satz.",
  // Spec 011 ③ (plan ③ D-13): the heading and the details of a notice, the hidden description
  // of a badge.
  heading: "Überschrift",
  details: "Einzelheit",
  description: "Beschreibung",
  // Spec 011 ④ (plan ④ D-13): the value text of a meter (the spec's example).
  "value-text": "66 % von 3 prüfbaren",
  // Spec 014 ⑤ (plan ⑤ D-05): the summary of a disclosure names what it hides.
  summary: "Lieferbedingungen",
};

/** The summary of the Vitrino's disclosure (Spec 014 ⑤); Figma shows the same word. */
export const VITRINO_SUMMARY_TEXT = "Lieferbedingungen";

/**
 * The value example of a meter in the Vitrino (Spec 011 ④, plan ④ D-13): a number prop without
 * a default is set to it, so the bar shows a fill; the Figma set shows the same share.
 */
export const VITRINO_NUMBER_EXAMPLES: Readonly<Record<string, string>> = {
  value: "66",
  // Spec 015 ① (plan ① D-06): the pagxigilo shows page 5 of 10 — both ellipses.
  "total-pages": "10",
  // Spec 015 ② (plan ② D-07): the alsxutilo takes files up to 5 MB.
  "max-size": "5000000",
};

/**
 * The kinds the Vitrino's alsxutilo takes and the help that names them with the size (Spec 015
 * ②, plan ② D-07, Regulo file-constraints-stated: the spec's example); the Figma set shows the
 * same help, and its example the same two files.
 */
export const VITRINO_UPLOAD_ACCEPT = ".pdf,.png";

/**
 * Nachlese 6 N6-1: the kinds of the kampo the Vitrino shows in a row of their own, each with an
 * example value of its kind — a date with its bounds (min before the value, max after it). Text,
 * search and tel look like text; the rows show what a kind changes.
 */
export const VITRINO_KAMPO_KINDS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  email: { value: "name@example.org" },
  url: { value: "https://example.org" },
  date: { value: "2026-10-20", min: "2026-10-01", max: "2026-12-31" },
  number: { value: "42" },
  password: { value: "beispiel1234" },
};
export const VITRINO_UPLOAD_HELP = "PDF oder PNG, höchstens 5 MB";
export const VITRINO_UPLOAD_FILES: readonly { name: string; size: number }[] = [
  { name: "Lebenslauf.pdf", size: 1_200_000 },
  { name: "Zeugnis.png", size: 340_000 },
];

/**
 * The card of the Vitrino (Spec 015 ③, plan ③ D-04): one of the standards of the Vitrino's table,
 * its heading, one sentence, a badge in the meta row and two actions — one with emphasis high
 * (one-primary-per-container); the Figma set shows the same words (one source for both pictures).
 */
export const VITRINO_CARD = {
  heading: "Barrierefreiheit",
  text: "Kontrast, Fokus und Namen in jeder Marke.",
  badge: "gültig",
  actions: [
    { text: "Öffnen", emphasis: "high" },
    { text: "Teilen", emphasis: "low" },
  ],
} as const;

/** The word Figma writes where a card shows its image (Spec 015 ③): a stand-in, not a picture. */
export const VITRINO_MEDIA_TEXT = "Bild";

/**
 * The picture of the Vitrino's card (Spec 015 ③, plan ③ D-06): an inline SVG in the text's colour
 * at three strengths — a landscape, decorative (the heading names the card) — since the Vitrino
 * loads nothing from outside itself, not even an image.
 */
export const VITRINO_CARD_PICTURE =
  '<svg slot="media" aria-hidden="true" viewBox="0 0 16 9"><rect width="16" height="9" fill="currentColor" opacity="0.12"></rect><circle cx="12" cy="3" r="1.5" fill="currentColor" opacity="0.35"></circle><path d="M0 9 5 4l3 3 2-2 6 4z" fill="currentColor" opacity="0.3"></path></svg>';

/**
 * The avatars of the Vitrino (Spec 015 ③, plan ③ D-10): one row per size — the picture, the
 * initials without one, the initials where the picture does not load, and a decorative one beside
 * the name it stands for.
 */
function avatarMarkup(tag: string): string {
  const { name, picture, broken } = VITRINO_AVATAR;
  const rows = ["small", "medium", "large"].map(
    (size) =>
      `<tr><th scope="row">${size}</th><td><${tag} size="${size}" name="${name}" picture="${picture}"></${tag}></td><td><${tag} size="${size}" name="${name}"></${tag}></td><td><${tag} size="${size}" name="${name}" picture="${broken}"></${tag}></td><td><div class="fm-row"><${tag} size="${size}" name="${name}" decorative></${tag}><span>${name}</span></div></td></tr>`,
  );
  return `<table><caption>${tag}, jede Größe mit Bild, Initialen und kaputtem Bild</caption><thead><tr><th scope="col">size</th><th scope="col">Bild</th><th scope="col">Initialen</th><th scope="col">kaputtes Bild</th><th scope="col">decorative</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

/**
 * The cards of the Vitrino (Spec 015 ③, plan ③ D-06): vertical with and without the picture,
 * horizontal across both columns — wide enough it lays the picture beside the text, narrower than
 * size.container.small it stacks; level 3 under the section's heading.
 */
function cardMarkup(tag: string): string {
  const actions = VITRINO_CARD.actions
    .map(
      (action) =>
        `<fm-butono slot="actions" emphasis="${action.emphasis}">${action.text}</fm-butono>`,
    )
    .join("");
  const one = (attributes: string, picture: boolean) =>
    `<${tag} level="3"${attributes}>${picture ? VITRINO_CARD_PICTURE : ""}<span slot="heading">${VITRINO_CARD.heading}</span>${VITRINO_CARD.text}<fm-insigno slot="meta">${VITRINO_CARD.badge}</fm-insigno>${actions}</${tag}>`;
  return `<table><caption>${tag}, beide Ausrichtungen, mit und ohne Bild</caption><thead><tr><th scope="col">orientation</th><th scope="col">mit Bild</th><th scope="col">ohne Bild</th></tr></thead><tbody><tr><th scope="row">vertical</th><td>${one("", true)}</td><td>${one("", false)}</td></tr><tr><th scope="row">horizontal</th><td colspan="2">${one(' orientation="horizontal"', true)}</td></tr></tbody></table>`;
}

/**
 * The avatar of the Vitrino (Spec 015 ③, plan ③ D-10): a name with two words and its initials,
 * the same in Figma; a picture as an inline SVG data address (the Vitrino loads nothing from
 * outside itself) and an address that never loads, so the initials stand in (E8: no colour from
 * the name, the initials on the sunken ground).
 */
export const VITRINO_AVATAR = {
  name: "Erika Mustermann",
  initials: "EM",
  picture:
    "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23d8dde3'/%3E%3Ccircle cx='8' cy='6' r='3' fill='%23687280'/%3E%3Cpath d='M2 16c1-4 3.5-5.5 6-5.5s5 1.5 6 5.5z' fill='%23687280'/%3E%3C/svg%3E",
  broken: "data:,",
} as const;

/** The row and label of the meter without a value in the Vitrino (Nachlese 3 W4, F-9). */
export const VITRINO_UNKNOWN_LABEL = "unbekannt";

/** The value text of a meter whose value is unknown (Spec 011 ④ G4); the Figma example says it too. */
export const VITRINO_UNKNOWN_TEXT = "nicht geprüft";

/**
 * The entries of a key-value list in the Vitrino (Spec 011 ④, plan ④ D-13): three pairs, the last
 * value empty (the dash and "keine Angabe"). The Figma set shows the same words.
 */
export const VITRINO_LIST_ENTRIES: readonly (readonly [string, string])[] = [
  ["Version", "3"],
  ["Verantwortlich", "Team Fundamento"],
  ["Gültig seit", ""],
];

/** The caption of the Vitrino's table (Spec 011 ④, plan ④ D-13); the Figma set's label word. */
export const VITRINO_TABLE_CAPTION = "Standards";

/**
 * The table of the Vitrino (Spec 011 ④, plan ④ D-13): a head with a sortable first column and a
 * numeric last column, three rows with row headers — the picture the Figma set draws too.
 */
export const VITRINO_TABLE =
  '<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th><th scope="col">Status</th><th scope="col" numeric>Anzahl</th></tr></thead><tbody><tr><th scope="row">Barrierefreiheit</th><td>gültig</td><td>0</td></tr><tr><th scope="row">Datenschutz</th><td>Entwurf</td><td>3</td></tr><tr><th scope="row">Sicherheit</th><td>in Prüfung</td><td>1</td></tr></tbody></table>';

/**
 * The names of the Eroj whose name is a required prop label (Spec 011 ⑤, plan ⑤ D-11): the
 * navigation and the tabs are heard by it; a link's `to` points at the section itself instead.
 */
export const VITRINO_LABELS: Readonly<Record<string, string>> = {
  navigation: "Navigation",
  tablist: "Reiter",
};

/**
 * The icon a button carries in its icon-start slot in the Vitrino (Spec 014 ②, G3, plan ② D-09):
 * one name of the Ikonaro, the same the Figma set draws (one source for both pictures). The
 * Vitrino shows icons, so Figma draws them (the Jugxo of the undrawn icon is lifted).
 */
export const VITRINO_ICON_EXAMPLE = "check";

/** The sizes the Ikonaro grid of the Vitrino shows, one row each (Spec 014 ②). */
const ICON_SIZES = ["small", "medium", "large"] as const;

/**
 * The grid of the Ikonaro (Spec 014 ②, G10, plan ② D-09): one row per size with every name of the
 * Ikonaro, decorative; one row per status intent with the status icon named by its meaning — a
 * status icon carries meaning and is named (icon-meaning-named). The pictures switch with the
 * Aspekto.
 */
function ikonaroMarkup(tag: string, ikonaro: readonly VitrinoIkono[]): string {
  const sizes = ICON_SIZES.map(
    (size) =>
      `<tr><th scope="row">${size}</th><td>${ikonaro
        .map((ikono) => `<${tag} name="${ikono.name}" size="${size}"></${tag}>`)
        .join("")}</td></tr>`,
  );
  const intents = ikonaro
    .filter((ikono) => STATUS_INTENTS.includes(ikono.name))
    .map(
      (ikono) =>
        `<tr><th scope="row">${ikono.name}</th><td><${tag} name="${ikono.name}" size="medium" intent="${ikono.name}" label="${ikono.meaning.de}"></${tag}></td></tr>`,
    );
  return `<table><caption>${tag}, das Ikonaro je Größe und die Status-Icons</caption><thead><tr><th scope="col">Größe / Intent</th><th scope="col">Namen</th></tr></thead><tbody>${[...sizes, ...intents].join("")}</tbody></table>`;
}

/** The intents of a status icon: the names of the Ikonaro that are an intent of the avizo (G3). */
const STATUS_INTENTS: readonly string[] = ["info", "success", "warning", "danger"];

/** What the Vitrino needs of one name of the Ikonaro. */
export interface VitrinoIkono {
  name: string;
  meaning: { de: string; en: string };
}

/** The dl of the Vitrino's key-value list (Spec 011 ④). */
export const VITRINO_LIST = `<dl>${VITRINO_LIST_ENTRIES.map(([term, value]) => `<dt>${term}</dt><dd>${value}</dd>`).join("")}</dl>`;

/**
 * The actions of a dialog in the Vitrino (Spec 011 ②, plan ② D-15): two butono, one with emphasis
 * high (one-primary-per-container), the words of the butono's own examples.
 */
export const VITRINO_DIALOG_ACTIONS =
  '<fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Bestätigen</fm-butono>';

/** The word on the button that opens a dialog of the Vitrino. */
export const VITRINO_OPEN = "Öffnen";

/**
 * The options of a slot whose entries are options (Spec 010 ③, D-13, E7): three neutral words, the
 * first chosen — the value of an option is its position. The Figma set shows the same words (one
 * source for both pictures, like the slot texts).
 */
export const VITRINO_OPTIONS: readonly string[] = ["Eins", "Zwei", "Drei"];

/**
 * The prompt a select shows while none of its options is chosen (Spec 010 ④, plan ④ D-13): the
 * closed field, as the Figma set draws it (one source for both pictures). A prompt, not an
 * example: the Regulo select-placeholder-is-prompt (at least two words).
 */
export const VITRINO_PROMPT = "Bitte wählen";

/** The hint of the Vitrino's tooltip (Spec 014 ④): the name of the icon-only butono it hangs on. */
export const VITRINO_TOOLTIP_TEXT = "Suchen";

/** The word in the content of the Vitrino's popover (Spec 014 ④); Figma shows the same. */
export const VITRINO_CONTENT_TEXT = "Inhalt";

/** The word of a popover's trigger stand-in in Figma (Spec 014 ④); the Vitrino's trigger says Öffnen. */
export const VITRINO_TRIGGER_TEXT = "Auslöser";

/**
 * The entries of the Vitrino's menu (Spec 014 ④, the spec's example): edit, duplicate (disabled),
 * delete (danger, behind a separator); Figma draws the same three.
 */
export const VITRINO_MENU_ITEMS: readonly {
  value: string;
  text: string;
  disabled?: boolean;
  danger?: boolean;
}[] = [
  { value: "edit", text: "Bearbeiten" },
  { value: "duplicate", text: "Duplizieren", disabled: true },
  { value: "delete", text: "Löschen", danger: true },
];

/**
 * The options of one cell: an element per option in its slot, with its value (Web Celo). The
 * entries of a default slot carry no slot name (Spec 011 ⑤: the tabs); the items of a navigation
 * are the platform's own links to the section, keyed by their position (D-11).
 */
function optionTexts(entry: LoadedEro): string {
  const navigation = entry.skemo.a11y.role === "navigation";
  // A pagination (Spec 015 ①) draws its pages itself from page and total-pages: no entries.
  if (navigation && entry.skemo.parts.ellipsis !== undefined) return "";
  const breadcrumb = navigation && entry.skemo.parts.separator !== undefined;
  return entry.skemo.slots
    .filter((slot) => slot.entry !== undefined)
    .map((slot) =>
      VITRINO_OPTIONS.map((text, index) =>
        // The current page of a breadcrumb (Spec 015 ①) is its last level: text, no destination.
        navigation && breadcrumb && index === VITRINO_OPTIONS.length - 1
          ? `<span data-page="${index + 1}">${text}</span>`
          : navigation
            ? `<a href="#fm-vitrino-${entry.ero.name}" data-page="${index + 1}">${text}</a>`
            : `<data${slot.default === true ? "" : ` slot="${slot.name}"`} value="${index + 1}">${text}</data>`,
      ).join(""),
    )
    .join("");
}

/**
 * The slotted example texts of one cell (F-5): every text slot besides the default one that has an
 * example word, and that the Skemo allows in this column. A constraint `slot:<name>: filled ⇒
 * <prop>: true` keeps the slot out of every column but that prop's (the error of the kampo stands
 * only under invalid; an error text without the state is a contradiction, Spec 009 D-04).
 */
function slotTexts(
  entry: LoadedEro,
  column: string | undefined,
  combination: Readonly<Record<string, string>>,
): string {
  return entry.skemo.slots
    .filter((slot) => slot.text === true && slot.default !== true)
    .flatMap((slot) => {
      // A file input names kinds and size in its help (Spec 015 ②, file-constraints-stated).
      const text =
        slot.name === "help" && entry.skemo.props.some((prop) => prop.name === "accept")
          ? VITRINO_UPLOAD_HELP
          : VITRINO_SLOT_TEXTS[slot.name];
      if (text === undefined) return [];
      const constraint = (entry.skemo.constraints ?? []).find(
        (candidate) => candidate.when[`slot:${slot.name}`] === "filled",
      );
      // A filled slot is allowed where the constraint's props hold: the boolean column of the cell
      // (the error under invalid) or the enum value of the row (Spec 014 ①, Abnahme ① F-2: the
      // reason-help only where the dialog has a reason field).
      const allowed =
        constraint === undefined ||
        Object.entries(constraint.allowed).every(
          ([prop, values]) =>
            (prop === column && values.includes("true")) ||
            (combination[prop] !== undefined && values.includes(combination[prop])),
        );
      return allowed ? [`<span slot="${slot.name}">${text}</span>`] : [];
    })
    .join("");
}

/**
 * The grid of one Ero (Spec 004 for the butono; Spec 008 D-12 for every Ero): one row per
 * combination of the enum props its parts are keyed by, one column at rest and one per boolean
 * prop that is a state (disabled, loading), carries an a11y text (external) or keys the parts
 * (Spec 010 ①, D-11: checked of the switch — a prop, not a state, and its first look). A required
 * string prop (the link's `to`, R-10) points at the section itself; the text slots carry their
 * example word where the Skemo allows it (F-5).
 */
export function eroMarkup(entry: LoadedEro, ikonaro: readonly VitrinoIkono[] = []): string {
  const tag = `fm-${entry.ero.name}`;
  // A card (Spec 015 ③): both orientations, with and without its picture.
  if (entry.skemo.a11y.role === "article") return cardMarkup(tag);
  // An avatar (Spec 015 ③): every size with the picture, with initials and with a broken picture.
  if (entry.skemo.parts.initials !== undefined) return avatarMarkup(tag);
  // The Ikonaro grid (Spec 014 ②): the icon shows every name, not every combination.
  if (entry.skemo.a11y.role === "img") return ikonaroMarkup(tag, ikonaro);
  // A separator (Spec 014 ②): both orientations, the vertical one between two words.
  if (entry.skemo.a11y.role === "separator") {
    return `<table><caption>${tag}, beide Richtungen</caption><thead><tr><th scope="col">orientation</th><th scope="col">rest</th></tr></thead><tbody><tr><th scope="row">horizontal</th><td><${tag} orientation="horizontal"></${tag}></td></tr><tr><th scope="row">vertical</th><td><div class="fm-row"><span>${VITRINO_OPTIONS[0] ?? ""}</span><${tag} orientation="vertical"></${tag}><span>${VITRINO_OPTIONS[1] ?? ""}</span></div></td></tr></tbody></table>`;
  }
  // The overlays (Spec 014 ④, plan ④ D-07): a tooltip on an icon-only butono of the Vitrino, a
  // popover behind a butono with a heading and a text, a menu with its own trigger and three
  // entries (one disabled, one danger behind a separator) — opened by a person, as on a page.
  if (entry.skemo.a11y.role === "tooltip") {
    return `<table><caption>${tag}, auf einer Icon-Schaltfläche</caption><thead><tr><th scope="col">Kombination</th><th scope="col">rest</th></tr></thead><tbody><tr><th scope="row">rest</th><td><div class="fm-row"><fm-butono id="fm-vitrino-konsileto-trigger" emphasis="low" label="${VITRINO_TOOLTIP_TEXT}"><fm-ikono name="search"></fm-ikono></fm-butono><${tag} for="fm-vitrino-konsileto-trigger">${VITRINO_TOOLTIP_TEXT}</${tag}></div></td></tr></tbody></table>`;
  }
  if (
    entry.skemo.a11y.role === "dialog" &&
    entry.skemo.slots.some((slot) => slot.name === "trigger")
  ) {
    return `<table><caption>${tag}, hinter seinem Auslöser</caption><thead><tr><th scope="col">Kombination</th><th scope="col">rest</th></tr></thead><tbody><tr><th scope="row">rest</th><td><${tag} label="${VITRINO_SLOT_TEXTS.heading ?? ""}"><fm-butono slot="trigger" emphasis="medium">${VITRINO_OPEN}</fm-butono><span slot="heading">${VITRINO_SLOT_TEXTS.heading ?? ""}</span><fm-teksto>${VITRINO_CONTENT_TEXT}</fm-teksto></${tag}></td></tr></tbody></table>`;
  }
  if (entry.skemo.a11y.role === "menu") {
    const items = VITRINO_MENU_ITEMS.map((item, index) => {
      const row = `<data value="${item.value}"${item.disabled === true ? " disabled" : ""}${item.danger === true ? ' intent="danger"' : ""}>${item.text}</data>`;
      return index === VITRINO_MENU_ITEMS.length - 1
        ? `<fm-apartigilo></fm-apartigilo>${row}`
        : row;
    });
    return `<table><caption>${tag}, mit eigenem Auslöser</caption><thead><tr><th scope="col">Kombination</th><th scope="col">rest</th></tr></thead><tbody><tr><th scope="row">rest</th><td><${tag}>${items.join("")}</${tag}></td></tr></tbody></table>`;
  }
  const styled = styledProps(entry.skemo);
  const keys = styled.filter((key) =>
    entry.skemo.props.some((prop) => prop.name === key && prop.kind === "enum"),
  );
  const texts = entry.skemo.a11y.texts ?? {};
  const columns = entry.skemo.props
    .filter(
      (prop) =>
        prop.kind === "boolean" &&
        (entry.skemo.states.includes(prop.name) ||
          prop.name in texts ||
          styled.includes(prop.name)),
    )
    .map((prop) => prop.name);
  // A link needs a target: the section itself (Spec 008); a required label (Spec 011 ⑤: the name
  // of a navigation or a tab list) takes the word of its role; a skip link (Spec 014 ②) the id of
  // the section without the fragment sign; every other string prop stays empty.
  const floats = entry.skemo.parts.surface?.layer !== undefined;
  // The prop an entry's value is compared with (page of the pagxigilo, Spec 015 ①) is written by
  // `chosen` below, not here.
  const equals = entry.skemo.slots.flatMap((slot) =>
    slot.entry === undefined ? [] : [slot.entry.equals],
  );
  const required = entry.skemo.props
    .filter(
      (prop) => prop.required === true && prop.kind === "string" && !equals.includes(prop.name),
    )
    .map(
      (prop) =>
        ` ${prop.name}="${prop.name === "label" ? (VITRINO_LABELS[entry.skemo.a11y.role] ?? `#fm-vitrino-${entry.ero.name}`) : floats ? `fm-vitrino-${entry.ero.name}` : `#fm-vitrino-${entry.ero.name}`}"`,
    )
    .join("");
  // A button shows the example icon in its icon-start slot (Spec 014 ②): the same name Figma draws.
  const icons =
    entry.skemo.a11y.role === "button" &&
    entry.skemo.parts.icon !== undefined &&
    entry.skemo.slots.some((slot) => slot.name === "icon-start" && slot.decorative === true)
      ? `<fm-ikono slot="icon-start" name="${VITRINO_ICON_EXAMPLE}"></fm-ikono>`
      : "";
  // The prop an option's value is compared with (Spec 010 ③, E7) holds the first option: one chosen.
  // An Ero with a placeholder besides (the select, Spec 010 ④, D-13) shows the closed field with
  // its prompt instead: its options are in the list that opens, the field says that none is chosen.
  const prompts = entry.skemo.props.some((prop) => prop.name === "placeholder");
  // Spec 015 ① (plan ① D-06): the pagxigilo stands on page 5 (of 10, both ellipses), the spuro's
  // current page is its last item.
  const chosenValue =
    entry.skemo.parts.ellipsis !== undefined
      ? "5"
      : entry.skemo.parts.separator !== undefined && entry.skemo.a11y.role === "navigation"
        ? String(VITRINO_OPTIONS.length)
        : "1";
  const chosen = entry.skemo.slots
    .flatMap((slot) =>
      slot.entry === undefined
        ? []
        : [prompts ? ` placeholder="${VITRINO_PROMPT}"` : ` ${slot.entry.equals}="${chosenValue}"`],
    )
    .join("");
  // A dialog (Spec 011 ②, plan ② D-15) is modal: six open at once would cover the page. Every cell
  // holds the closed dialog behind a button that opens it (data-fm-opens, read by the Vitrino's
  // script), with the two actions of the Vitrino in its slot.
  const dialog = entry.skemo.a11y.role === "dialog";
  // A light-DOM host (Spec 011 ④, plan ④ D-13, E10): the table or the list of the Vitrino in the
  // light DOM of every cell; a meter shows the value example.
  const role = entry.skemo.a11y.role;
  // Tabs (Spec 011 ⑤, plan ⑤ D-11) show the panel of the first tab beside their tabs.
  const light =
    role === "table"
      ? VITRINO_TABLE
      : role === "list"
        ? VITRINO_LIST
        : role === "tablist"
          ? `<div slot="panel">${VITRINO_OPTIONS[0] ?? ""}</div>`
          : "";
  // The default slot holds the entries where the Skemo makes it one (the items, the tabs): no
  // label text beside them; the list has no text slot at all.
  const entriesInDefault = entry.skemo.slots.some(
    (slot) => slot.default === true && slot.entry !== undefined,
  );
  const examples = entry.skemo.props
    .filter(
      (prop) =>
        prop.kind === "number" &&
        prop.default === undefined &&
        prop.name in VITRINO_NUMBER_EXAMPLES,
    )
    .map((prop) => ` ${prop.name}="${VITRINO_NUMBER_EXAMPLES[prop.name] ?? ""}"`)
    .join("")
    // Spec 015 ② (plan ② D-07): the kinds a file input takes, named by its help.
    .concat(
      entry.skemo.props.some((prop) => prop.name === "accept")
        ? ` accept="${VITRINO_UPLOAD_ACCEPT}"`
        : "",
    );
  const rows = combinationsOf(entry.skemo, keys)
    .filter((combination) => combination[STATE_KEY] === undefined)
    .map((combination) => {
      const attributes = Object.entries(combination)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("");
      // A required enum that keys no part (Spec 014 ③, plan ③ D-06: the level of a heading) takes
      // the value the row's size implies — the Vitrino shows every size once, each at a level
      // whose default size it is, so the page keeps its order of headings.
      const duties = entry.skemo.props
        .filter(
          (prop) => prop.required === true && prop.kind === "enum" && !keys.includes(prop.name),
        )
        .map((prop) => ` ${prop.name}="${vitrinoDutyValue(prop, combination)}"`)
        .join("");
      // An Ero whose parts no prop keys has one row (Spec 011 ⑤): its head says rest.
      const label = vitrinoLabelOf(combination) || "rest";
      const id = `fm-vitrino-${entry.ero.name}-${Object.values(combination).join("-")}`;
      const opener = dialog
        ? `<fm-butono emphasis="medium" data-fm-opens="${id}">${VITRINO_OPEN}</fm-butono>`
        : "";
      const identity = dialog ? ` id="${id}"` : "";
      const actions = dialog ? VITRINO_DIALOG_ACTIONS : "";
      // A light-DOM list carries its dl and no word of its own (Abnahme ① F-1): the prop value is
      // the row's heading, whatever layout the list chooses.
      const named = role !== "list" && !entriesInDefault;
      const cells = [undefined, ...columns]
        .map(
          (column) =>
            `<td>${opener}<${tag}${identity}${attributes}${duties}${examples}${required}${chosen}${column === undefined ? "" : ` ${column}`}>${icons}${named ? label : ""}${optionTexts(entry)}${slotTexts(entry, column, combination)}${actions}${light}</${tag}></td>`,
        )
        .join("");
      return `<tr><th scope="row">${label}</th>${cells}</tr>`;
    })
    .join("");
  // Nachlese 6 N6-1: an enum prop kind that keys no part (the kampo) shows each kind of
  // VITRINO_KAMPO_KINDS in a row of its own, with an example value in every column.
  const kinds = entry.skemo.props.some(
    (prop) => prop.name === "kind" && prop.kind === "enum" && !keys.includes("kind"),
  )
    ? (entry.skemo.props.find((prop) => prop.name === "kind")?.values ?? [])
        .filter((kind) => VITRINO_KAMPO_KINDS[kind] !== undefined)
        .map((kind) => {
          const example = Object.entries(VITRINO_KAMPO_KINDS[kind] ?? {})
            .map(([name, value]) => ` ${name}="${value}"`)
            .join("");
          const label = `kind=${kind}`;
          const cells = [undefined, ...columns]
            .map(
              (column) =>
                `<td><${tag} kind="${kind}"${example}${required}${column === undefined ? "" : ` ${column}`}>${label}${slotTexts(entry, column, { kind })}</${tag}></td>`,
            )
            .join("");
          return `<tr><th scope="row">${label}</th>${cells}</tr>`;
        })
        .join("")
    : "";
  // Nachlese 3 W4 (F-9): an Ero with a number prop without a default (the meter's value) shows one
  // more row without it — the unknown value, its text "nicht geprüft", once for every intent.
  // Spec 015 ①: only an Ero with a value text (the meter) shows the unknown row; the pagxigilo's
  // total-pages is an example number without an unknown.
  const unknown =
    examples === "" || !entry.skemo.slots.some((slot) => slot.name === "value-text")
      ? ""
      : `<tr><th scope="row">${VITRINO_UNKNOWN_LABEL}</th><td><${tag}>${VITRINO_UNKNOWN_LABEL}<span slot="value-text">${VITRINO_UNKNOWN_TEXT}</span></${tag}></td></tr>`;
  const heads = ["rest", ...columns].map((column) => `<th scope="col">${column}</th>`).join("");
  return `<table><caption>${tag}, jede Kombination der Skemo</caption><thead><tr><th scope="col">Kombination</th>${heads}</tr></thead><tbody>${rows}${kinds}${unknown}</tbody></table>`;
}

/**
 * The value of a required enum prop that keys no part, for one row (Spec 014 ③, plan ③ D-06):
 * the level of a heading follows the size of the row (display-* is the page, level 1; headline-n
 * the level n), so the Vitrino's headings stay in order; any other duty takes its first value.
 */
function vitrinoDutyValue(
  prop: LoadedEro["skemo"]["props"][number],
  combination: Readonly<Record<string, string>>,
): string {
  const size = combination.size;
  if (prop.name === "level" && size !== undefined) {
    const level = size.startsWith("display-") ? "1" : (size.split("-")[1] ?? "1");
    return prop.values?.includes(level) === true ? level : (prop.values?.[0] ?? "");
  }
  return prop.values?.[0] ?? "";
}

/** The grid of every Ero of the Modelo, by name (Spec 008, D-12); the icon shows the Ikonaro. */
export function erojMarkup(
  eroj: readonly LoadedEro[],
  ikonaro: readonly VitrinoIkono[] = [],
): Record<string, string> {
  return Object.fromEntries(eroj.map((entry) => [entry.ero.name, eroMarkup(entry, ikonaro)]));
}

function regularoOf(
  modelo: Modelo,
  issues: readonly ValidationIssue[],
): VitrinoDatumoj["regularo"] {
  const byCombination = new Map<string, Map<string, string[]>>();
  for (const issue of issues) {
    if (issue.combination === undefined) continue;
    const key = kombinoKey(modelo, issue.combination);
    const rules = byCombination.get(key) ?? new Map<string, string[]>();
    rules.set(issue.rule, [...(rules.get(issue.rule) ?? []), issue.path]);
    byCombination.set(key, rules);
  }
  const automatic = modelo.reguloj.filter((regulo) => regulo.checkability === "automatic");
  const result: VitrinoDatumoj["regularo"] = {};
  for (const assignment of allAssignments(modelo)) {
    const key = kombinoKey(modelo, assignment);
    const found = byCombination.get(key);
    result[key] = automatic.map((regulo) => ({
      regulo: regulo.name,
      pasis: found?.get(regulo.name) === undefined,
      trovoj: found?.get(regulo.name) ?? [],
    }));
  }
  return result;
}

/** Every combination of the Modelo, in canonical order. */
function allAssignments(modelo: Modelo): Record<string, string>[] {
  let assignments: Record<string, string>[] = [{}];
  for (const dimensio of modelo.dimensioj) {
    const values = dimensio.valoroj.map((valoro) => valoro.name);
    assignments = assignments.flatMap((assignment) =>
      values.map((value) => ({ ...assignment, [dimensio.name]: value })),
    );
  }
  return assignments;
}

function aspirojOf(results: readonly AspiroResult[]): VitrinoDatumoj["aspiroj"] {
  const result: VitrinoDatumoj["aspiroj"] = {};
  for (const entry of results) {
    const limo = [
      entry.aspiro.min === undefined ? undefined : `min ${entry.aspiro.min}`,
      entry.aspiro.max === undefined ? undefined : `max ${entry.aspiro.max}`,
    ]
      .filter((part): part is string => part !== undefined)
      .join(", ");
    result[entry.aspekto] = [
      ...(result[entry.aspekto] ?? []),
      {
        metriko: entry.aspiro.metriko,
        limo,
        amplekso: entry.aspiro.appliesTo?.tokens?.join(", ") ?? "alle Tokens",
        mezurita: entry.measured?.text ?? "–",
        atingita: entry.reached,
        kialo: entry.aspiro.kialo,
      },
    ];
  }
  return result;
}

export interface VitrinoDatumojInput {
  input: CeloInput;
  /** A measurement snapshot to compare with (`--bazo`), when one was given. */
  bazo?: VitrinoBazo;
}

export function vitrinoDatumoj({ input, bazo }: VitrinoDatumojInput): VitrinoDatumoj {
  const { modelo } = input;
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });
  const aspektoj = (
    modelo.dimensioj.find((dimensio) => dimensio.name === "aspekto")?.valoroj ?? []
  ).map((valoro) => valoro.name);

  const paletroj: VitrinoDatumoj["paletroj"] = {};
  const roloj: VitrinoDatumoj["roloj"] = {};
  // Per Aspekto, for the comparison (FR-08): the worst ramp regularity, the smallest distance an
  // opaque surface keeps from an anchor, and the regularity of the type scale.
  const rampoj = new Map<string, number>();
  const ankroj = new Map<string, number>();
  const tipoj = new Map<string, number>();
  for (const rezolvo of input.rezolvoj.rezolvoj) {
    const assignment = rezolvo.assignment as Record<string, string>;
    const tokens = rezolvo.tokens as Record<string, { value: unknown }>;
    const aspekto = assignment.aspekto ?? "";
    if (
      paletroj[aspekto] === undefined &&
      assignment["color-scheme"] === "light" &&
      assignment.contrast === "default"
    ) {
      const ramps = new Map<string, { stupo: number; token: string; hex: string; l?: number }[]>();
      for (const [name, token] of Object.entries(tokens)) {
        const match = PALETTE.exec(name);
        if (match?.[1] === undefined || match[2] === undefined) continue;
        // A step with alpha (shade, tint) is an overlay, named like the overlays of the action
        // roles: "#000000 with L 0.000" read like pure black (Spec 004 M1, Befund 5).
        const overlay = overlayText(token.value);
        ramps.set(match[1], [
          ...(ramps.get(match[1]) ?? []),
          {
            stupo: Number(match[2]),
            token: name,
            hex: overlay ?? hexOf(token.value),
            ...(overlay === undefined ? { l: lightnessOf(token.value) } : {}),
          },
        ]);
      }
      for (const [, steps] of palettePikoj(tokens)) {
        rampoj.set(aspekto, Math.max(rampoj.get(aspekto) ?? 0, oklchLStepConsistency(steps).worst));
      }
      paletroj[aspekto] = [...ramps.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([rampo, stupoj]) => {
          const sorted = [...stupoj].sort((a, b) => a.stupo - b.stupo);
          const steps = sorted.flatMap((step) => {
            const color = readDtcgColor(tokens[step.token]?.value);
            return color === undefined ? [] : [{ step: step.stupo, value: color }];
          });
          const consistency = oklchLStepConsistency(steps);
          return {
            rampo,
            stupoj: sorted,
            regula: `${(consistency.worst * 100).toFixed(1)} % vom Median ${consistency.median.toFixed(3)}`,
          };
        });
    }
    for (const [name, token] of Object.entries(tokens)) {
      if (!SURFACE_PATTERNS.some((pattern) => pattern.test(name))) continue;
      const colour = readDtcgColor(token.value);
      // An overlay has no surface of its own, so it keeps no distance from an anchor.
      if (colour === undefined || (colour.alpha ?? 1) < 1) continue;
      ankroj.set(
        aspekto,
        Math.min(ankroj.get(aspekto) ?? Number.POSITIVE_INFINITY, oklchLExtreme(colour)),
      );
    }
    if (tipoj.get(aspekto) === undefined) {
      const sizes = Object.entries(tokens)
        .filter(([name]) => TYPE_SCALE.test(name))
        .sort(([a], [b]) => Number(TYPE_SCALE.exec(a)?.[1]) - Number(TYPE_SCALE.exec(b)?.[1]))
        .flatMap(([, token]) => {
          const value = (token as { value: unknown }).value;
          const size =
            typeof value === "object" && value !== null && "value" in value
              ? Number((value as { value: unknown }).value)
              : Number.NaN;
          return Number.isFinite(size) ? [size] : [];
        });
      if (sizes.length > 2) tipoj.set(aspekto, typeScaleConsistency(sizes).worst);
    }

    const key = rolesKey(assignment);
    if (roloj[key] === undefined) {
      roloj[key] = {
        surfaces: roleRows(tokens, SURFACES, true),
        text: roleRows(tokens, TEXT, true),
        status: roleRows(tokens, byPrefix(tokens, "color.status."), false),
        agoj: roleRows(tokens, byPrefix(tokens, "color.action."), false),
      };
    }
  }

  const mezuroj: VitrinoDatumoj["mezuroj"] = {};
  let apcaNun = 0;
  let apcaKomunaj = 0;
  const apcaPerAspekto = new Map<string, number>();
  interface KategorioTally {
    mezuroj: number;
    nun: number;
    sojloMin: number;
    sojloMax: number;
    plejMalbona: number;
    plejMalbonaParo: string;
    bazo: number;
    bazoPlejMalbona: number;
    bazoMezuroj: number;
  }
  const perKategorio = new Map<string, KategorioTally>();
  const komunajKombinoj = new Set<string>();
  for (const measurement of evaluation.measurements ?? []) {
    const key = kombinoKey(modelo, measurement.combination);
    const branch = measurement.branch === "aux" ? measurement.aux : measurement.main;
    if (branch === undefined) continue;
    const wcag2 = branch.metrics.wcag2;
    const apca = branch.metrics.apca;
    const bazoEntry = bazo?.mezuroj[key]?.find((entry) => entry.paro === measurement.pair.name);
    const advisory =
      apca !== undefined && apca.threshold !== undefined && apca.passed === false ? 1 : 0;
    apcaNun += advisory;
    // With a comparison state the categories count where both states have the combination, so the
    // change column compares like with like (the header sentence says the same for the total).
    const counts = bazo === undefined || bazoEntry !== undefined;
    if (counts && apca?.threshold !== undefined && apca.value !== undefined) {
      const kategorio = measurement.kategorio;
      const tally = perKategorio.get(kategorio) ?? {
        mezuroj: 0,
        nun: 0,
        sojloMin: apca.threshold,
        sojloMax: apca.threshold,
        plejMalbona: Number.POSITIVE_INFINITY,
        plejMalbonaParo: "",
        bazo: 0,
        bazoPlejMalbona: Number.POSITIVE_INFINITY,
        bazoMezuroj: 0,
      };
      tally.mezuroj += 1;
      tally.nun += advisory;
      tally.sojloMin = Math.min(tally.sojloMin, apca.threshold);
      tally.sojloMax = Math.max(tally.sojloMax, apca.threshold);
      const value = Math.abs(apca.value);
      if (value < tally.plejMalbona) {
        tally.plejMalbona = value;
        tally.plejMalbonaParo = measurement.pair.name;
      }
      if (bazoEntry !== undefined) {
        // The comparison state is counted with today's categories and thresholds: the pair and
        // the combination are the same, only the values differ.
        const bazoValue = Math.abs(bazoEntry.apca);
        tally.bazoMezuroj += 1;
        if (bazoValue < apca.threshold) tally.bazo += 1;
        tally.bazoPlejMalbona = Math.min(tally.bazoPlejMalbona, bazoValue);
      }
      perKategorio.set(kategorio, tally);
    }
    const aspektoOfKey = key.slice(0, key.indexOf("|"));
    apcaPerAspekto.set(aspektoOfKey, (apcaPerAspekto.get(aspektoOfKey) ?? 0) + advisory);
    if (bazo?.mezuroj[key] !== undefined) {
      apcaKomunaj += advisory;
      komunajKombinoj.add(key);
    }
    mezuroj[key] = [
      ...(mezuroj[key] ?? []),
      {
        paro: measurement.pair.name,
        kategorio: measurement.kategorio,
        wcag2: roundTo(branch.ratio, 2),
        ...(wcag2?.threshold === undefined
          ? {}
          : { sojlo: wcag2.threshold, rezervo: roundTo(branch.ratio / wcag2.threshold - 1, 4) }),
        apca: roundTo(apca?.value ?? 0, 1),
        ...(apca?.threshold === undefined ? {} : { apcaSojlo: apca.threshold }),
        ...(measurement.surface === undefined ? {} : { surfaco: measurement.surface }),
        pasis: measurement.passed,
        brancxo: measurement.branch ?? "none",
        ...(bazoEntry === undefined
          ? {}
          : { bazo: { wcag2: bazoEntry.wcag2, apca: bazoEntry.apca } }),
      },
    ];
  }

  const kovrado: VitrinoDatumoj["kovrado"] = {};
  for (const aspekto of aspektoj) {
    for (const dimensio of modelo.dimensioj) {
      if (dimensio.name === "aspekto") continue;
      for (const valoro of dimensio.valoroj) {
        if (valoro.name === dimensio.default) continue;
        const result = dimensioKovrado(modelo, {
          aspekto,
          dimensio: dimensio.name,
          valoro: valoro.name,
        });
        if (result.total === 0) continue;
        kovrado[aspekto] = [
          ...(kovrado[aspekto] ?? []),
          {
            dimensio: dimensio.name,
            valoro: valoro.name,
            propraj: result.own,
            entute: result.total,
            parto: roundTo(result.share, 4),
          },
        ];
      }
    }
  }

  return {
    fundamento: input.modeloJson.fundamento.version,
    aspektoj,
    dimensioj: modelo.dimensioj
      .filter((dimensio) => dimensio.name !== "aspekto")
      .map((dimensio) => ({
        name: dimensio.name,
        valoroj: dimensio.valoroj.map((valoro) => valoro.name),
        default: dimensio.default,
      })),
    kombinoj: allAssignments(modelo).map((assignment) => kombinoKey(modelo, assignment)),
    paletroj,
    roloj,
    mezuroj,
    regularo: regularoOf(modelo, regularoEnforcementIssues(modelo)),
    regulojKialoj: Object.fromEntries(
      modelo.reguloj
        .filter((regulo) => regulo.checkability === "automatic")
        .map((regulo) => [regulo.name, regulo.kialo]),
    ),
    aspiroj: aspirojOf(evaluateAspiroj(modelo)),
    kovrado,
    komparo: komparoOf({
      aspektoj,
      mezuroj,
      kovrado,
      paletroj,
      roloj,
      apca: apcaPerAspekto,
      tipoj,
      rampoj,
      ankroj,
    }),
    eroj: erojMarkup(modelo.eroj, modelo.ikonaro),
    a11yRoloj: Object.fromEntries(
      modelo.eroj.map((entry) => [entry.ero.name, entry.skemo.a11y.role]),
    ),
    plurliniaj: modelo.eroj
      .filter((entry) => entry.skemo.props.some((prop) => prop.name === "rows"))
      .map((entry) => entry.ero.name),
    avataroj: modelo.eroj
      .filter((entry) => entry.skemo.parts.initials !== undefined)
      .map((entry) => entry.ero.name),
    uzo: uzojOf(modelo),
    apcaHintoj: {
      nun: apcaNun,
      kombinoj: Object.keys(mezuroj).length,
      kategorioj: [...perKategorio.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([kategorio, tally]) => ({
          kategorio,
          mezuroj: tally.mezuroj,
          nun: tally.nun,
          sojlo:
            tally.sojloMin === tally.sojloMax
              ? String(tally.sojloMin)
              : `${tally.sojloMin}–${tally.sojloMax}`,
          plejMalbona: roundTo(tally.plejMalbona, 1),
          plejMalbonaParo: tally.plejMalbonaParo,
          ...(tally.bazoMezuroj === 0
            ? {}
            : { bazo: tally.bazo, bazoPlejMalbona: roundTo(tally.bazoPlejMalbona, 1) }),
        })),
      ...(bazo === undefined
        ? {}
        : {
            bazo: bazo.apcaHintoj,
            bazoKombinoj: Object.keys(bazo.mezuroj).length,
            komunaj: { nun: apcaKomunaj, kombinoj: komunajKombinoj.size },
            mankantaj: Object.keys(bazo.mezuroj).filter((key) => mezuroj[key] === undefined).length,
          }),
    },
  };
}

/**
 * Criterion by criterion, two Aspektoj side by side; no overall verdict (FR-17). Every criterion
 * says which direction is ahead: fewer advisory APCA findings is better, a larger distance to the
 * anchor is better (maintainer's review of 2026-09-20).
 */
function komparoOf(input: {
  aspektoj: readonly string[];
  mezuroj: VitrinoDatumoj["mezuroj"];
  kovrado: VitrinoDatumoj["kovrado"];
  paletroj: VitrinoDatumoj["paletroj"];
  roloj: VitrinoDatumoj["roloj"];
  apca: ReadonlyMap<string, number>;
  tipoj: ReadonlyMap<string, number>;
  rampoj: ReadonlyMap<string, number>;
  ankroj: ReadonlyMap<string, number>;
}): VitrinoDatumoj["komparo"] {
  const { aspektoj, mezuroj, kovrado, apca, tipoj, rampoj: rampWorst, ankroj: anchor } = input;
  const result: VitrinoDatumoj["komparo"] = {};
  const rowsOf = (aspekto: string) =>
    Object.entries(mezuroj).flatMap(([key, rows]) => (key.startsWith(`${aspekto}|`) ? rows : []));
  const minReserve = (aspekto: string): number => {
    const reserves = rowsOf(aspekto).flatMap((row) =>
      row.rezervo === undefined ? [] : [row.rezervo],
    );
    return reserves.length === 0 ? 0 : Math.min(...reserves);
  };
  const passRate = (aspekto: string): number => {
    const rows = rowsOf(aspekto);
    return rows.length === 0 ? 0 : rows.filter((row) => row.pasis).length / rows.length;
  };
  const coverage = (aspekto: string, dimensio: string, valoro: string): number =>
    kovrado[aspekto]?.find((entry) => entry.dimensio === dimensio && entry.valoro === valoro)
      ?.parto ?? 0;
  const percent = (value: number): string => `${(value * 100).toFixed(1)} %`;
  const criteria: {
    kriterio: string;
    of: (aspekto: string) => number;
    format: (value: number) => string;
    /** Which side is ahead: "higher" for a reserve, "lower" for a finding count. */
    better: "higher" | "lower";
  }[] = [
    { kriterio: "kleinste Kontrast-Reserve", of: minReserve, format: percent, better: "higher" },
    {
      kriterio: "Bestehensquote der KontrastParoj",
      of: passRate,
      format: percent,
      better: "higher",
    },
    {
      kriterio: "Regelmäßigkeit der Paletten",
      of: (aspekto) => (input.paletroj[aspekto] === undefined ? 0 : (rampWorst.get(aspekto) ?? 0)),
      format: (value) => `${(value * 100).toFixed(1)} % vom Median`,
      better: "lower",
    },
    {
      kriterio: "Abstand zum Anker",
      of: (aspekto) => Math.max(0, anchor.get(aspekto) ?? 0),
      format: (value) => value.toFixed(3),
      better: "higher",
    },
    {
      kriterio: "Regelmäßigkeit der Typo-Skala",
      of: (aspekto) => tipoj.get(aspekto) ?? 0,
      format: (value) => `${(value * 100).toFixed(1)} % vom Median`,
      better: "lower",
    },
    {
      kriterio: "beratende APCA-Hinweise",
      of: (aspekto) => apca.get(aspekto) ?? 0,
      format: (value) => String(value),
      better: "lower",
    },
  ];
  // One row per Dimensio value the coverage knows: every brand decides for itself how much of a
  // Dimensio it sets (G10), and the comparison shows it value by value, not only for dark.
  const dimensioValues = new Map<string, { dimensio: string; valoro: string }>();
  for (const aspekto of aspektoj) {
    for (const entry of kovrado[aspekto] ?? []) {
      dimensioValues.set(`${entry.dimensio}=${entry.valoro}`, {
        dimensio: entry.dimensio,
        valoro: entry.valoro,
      });
    }
  }
  for (const [label, { dimensio, valoro }] of [...dimensioValues.entries()].sort(([a], [b]) =>
    a < b ? -1 : 1,
  )) {
    criteria.push({
      kriterio: `eigene Werte in ${label}`,
      of: (aspekto) => coverage(aspekto, dimensio, valoro),
      format: percent,
      better: "higher",
    });
  }

  for (const [index, a] of aspektoj.entries()) {
    for (const b of aspektoj.slice(index + 1)) {
      result[`${a}|${b}`] = criteria.map((criterion) => {
        const valueA = criterion.of(a);
        const valueB = criterion.of(b);
        const shownA = criterion.format(valueA);
        const shownB = criterion.format(valueB);
        // Equal is what the reader sees: two values that print the same are not a lead.
        const same = shownA === shownB;
        const aAhead = criterion.better === "higher" ? valueA > valueB : valueA < valueB;
        return {
          kriterio: criterion.kriterio,
          a: shownA,
          b: shownB,
          pli: same ? ("egale" as const) : aAhead ? ("a" as const) : ("b" as const),
        };
      });
    }
  }
  return result;
}
