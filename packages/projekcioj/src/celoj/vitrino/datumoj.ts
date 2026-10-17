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
  regularo: Record<string, { regulo: string; kialo: string; pasis: boolean; trovoj: string[] }[]>;
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
  // Spec 011 ③ (plan ③ D-13): the heading and the details of a notice, the hidden description
  // of a badge.
  heading: "Überschrift",
  details: "Einzelheit",
  description: "Beschreibung",
  // Spec 011 ④ (plan ④ D-13): the value text of a meter (the spec's example).
  "value-text": "66 % von 3 prüfbaren",
};

/**
 * The value example of a meter in the Vitrino (Spec 011 ④, plan ④ D-13): a number prop without
 * a default is set to it, so the bar shows a fill; the Figma set shows the same share.
 */
export const VITRINO_NUMBER_EXAMPLES: Readonly<Record<string, string>> = { value: "66" };

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

/** The options of one cell: an element per option in its slot, with its value (Web Celo). */
function optionTexts(entry: LoadedEro): string {
  return entry.skemo.slots
    .filter((slot) => slot.entry !== undefined)
    .map((slot) =>
      VITRINO_OPTIONS.map(
        (text, index) => `<data slot="${slot.name}" value="${index + 1}">${text}</data>`,
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
function slotTexts(entry: LoadedEro, column: string | undefined): string {
  return entry.skemo.slots
    .filter((slot) => slot.text === true && slot.default !== true)
    .flatMap((slot) => {
      const text = VITRINO_SLOT_TEXTS[slot.name];
      if (text === undefined) return [];
      const constraint = (entry.skemo.constraints ?? []).find(
        (candidate) => candidate.when[`slot:${slot.name}`] === "filled",
      );
      const allowed =
        constraint === undefined ||
        Object.entries(constraint.allowed).every(
          ([prop, values]) => prop === column && values.includes("true"),
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
export function eroMarkup(entry: LoadedEro): string {
  const tag = `fm-${entry.ero.name}`;
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
  // A link needs a target: the section itself (Spec 008); every other string prop stays empty.
  const required = entry.skemo.props
    .filter((prop) => prop.required === true && prop.kind === "string")
    .map((prop) => ` ${prop.name}="#fm-vitrino-${entry.ero.name}"`)
    .join("");
  // The prop an option's value is compared with (Spec 010 ③, E7) holds the first option: one chosen.
  // An Ero with a placeholder besides (the select, Spec 010 ④, D-13) shows the closed field with
  // its prompt instead: its options are in the list that opens, the field says that none is chosen.
  const prompts = entry.skemo.props.some((prop) => prop.name === "placeholder");
  const chosen = entry.skemo.slots
    .flatMap((slot) =>
      slot.entry === undefined
        ? []
        : [prompts ? ` placeholder="${VITRINO_PROMPT}"` : ` ${slot.entry.equals}="1"`],
    )
    .join("");
  // A dialog (Spec 011 ②, plan ② D-15) is modal: six open at once would cover the page. Every cell
  // holds the closed dialog behind a button that opens it (data-fm-opens, read by the Vitrino's
  // script), with the two actions of the Vitrino in its slot.
  const dialog = entry.skemo.a11y.role === "dialog";
  // A light-DOM host (Spec 011 ④, plan ④ D-13, E10): the table or the list of the Vitrino in the
  // light DOM of every cell; a meter shows the value example.
  const role = entry.skemo.a11y.role;
  const light = role === "table" ? VITRINO_TABLE : role === "list" ? VITRINO_LIST : "";
  const examples = entry.skemo.props
    .filter(
      (prop) =>
        prop.kind === "number" &&
        prop.default === undefined &&
        prop.name in VITRINO_NUMBER_EXAMPLES,
    )
    .map((prop) => ` ${prop.name}="${VITRINO_NUMBER_EXAMPLES[prop.name] ?? ""}"`)
    .join("");
  const rows = combinationsOf(entry.skemo, keys)
    .filter((combination) => combination[STATE_KEY] === undefined)
    .map((combination) => {
      const attributes = Object.entries(combination)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("");
      const label = vitrinoLabelOf(combination);
      const id = `fm-vitrino-${entry.ero.name}-${Object.values(combination).join("-")}`;
      const opener = dialog
        ? `<fm-butono emphasis="medium" data-fm-opens="${id}">${VITRINO_OPEN}</fm-butono>`
        : "";
      const identity = dialog ? ` id="${id}"` : "";
      const actions = dialog ? VITRINO_DIALOG_ACTIONS : "";
      const cells = [undefined, ...columns]
        .map(
          (column) =>
            `<td>${opener}<${tag}${identity}${attributes}${examples}${required}${chosen}${column === undefined ? "" : ` ${column}`}>${role === "list" ? "" : label}${optionTexts(entry)}${slotTexts(entry, column)}${actions}${light}</${tag}></td>`,
        )
        .join("");
      return `<tr><th scope="row">${label}</th>${cells}</tr>`;
    })
    .join("");
  const heads = ["rest", ...columns].map((column) => `<th scope="col">${column}</th>`).join("");
  return `<table><caption>${tag}, jede Kombination der Skemo</caption><thead><tr><th scope="col">Kombination</th>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
}

/** The grid of every Ero of the Modelo, by name (Spec 008, D-12). */
export function erojMarkup(eroj: readonly LoadedEro[]): Record<string, string> {
  return Object.fromEntries(eroj.map((entry) => [entry.ero.name, eroMarkup(entry)]));
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
      kialo: regulo.kialo,
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
    eroj: erojMarkup(modelo.eroj),
    a11yRoloj: Object.fromEntries(
      modelo.eroj.map((entry) => [entry.ero.name, entry.skemo.a11y.role]),
    ),
    plurliniaj: modelo.eroj
      .filter((entry) => entry.skemo.props.some((prop) => prop.name === "rows"))
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
