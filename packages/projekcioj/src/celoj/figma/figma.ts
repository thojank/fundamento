// Figma Celo (Spec 003, FR-09, plan D-12, contracts/projekcioj §5). `plan.json` is a pure
// description of what Figma should hold: one variable collection per Dimensio (its modes are the
// Dimensio's values) plus the single-mode collection `fundamento` for everything no Dimensio
// changes, and the component set of every Ero.
//
// The cascade: a token that several Dimensioj change lives in the collection of its highest
// priority Dimensio; each mode aliases a hidden helper variable in the next lower Dimensio's
// collection, down to literal values. Figma resolves each alias with the mode the frame has chosen
// for that collection, so every combination resolves exactly as the resolver does — which
// `resolveFigmaPlan` proves without Figma. Token aliases stay aliases, so late binding is kept.
// Pure.

import {
  ASPEKTO_DIMENSIO,
  allResolutions,
  alphaOf,
  baseResolution,
  boundToken,
  CORE_SET_NAME,
  combinationsOf,
  eroTokenOf,
  isBindingKeyword,
  isEntryKey,
  isPositionKeyword,
  type LoadedEro,
  type LoadedSxablono,
  type Modelo,
  nomRegulo,
  PARITY_ALPHA_VARIES,
  PARITY_NOT_DRAWN,
  PART_PROPERTY_TYPES,
  type ParityItem,
  parityColorText,
  parityDimensionText,
  parityVariantKey,
  type Regulo,
  readDtcgColor,
  STATE_KEY,
  type Uzo,
  variantKeys,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import {
  VITRINO_AVATAR,
  VITRINO_CARD,
  VITRINO_CONTENT_TEXT,
  VITRINO_DATE,
  VITRINO_DIALOG_ACTIONS,
  VITRINO_ICON_EXAMPLE,
  VITRINO_LIST_ENTRIES,
  VITRINO_MEDIA_TEXT,
  VITRINO_MENU_ITEMS,
  VITRINO_NUMBER_EXAMPLES,
  VITRINO_OPTIONS,
  VITRINO_PROMPT,
  VITRINO_SHORT_COMMAND,
  VITRINO_SLIDER,
  VITRINO_SLOT_TEXTS,
  VITRINO_SUMMARY_TEXT,
  VITRINO_SURFACE,
  VITRINO_TABLE,
  VITRINO_TRIGGER_TEXT,
  VITRINO_UPLOAD_FILES,
  VITRINO_UPLOAD_HELP,
  type VitrinoCalendar,
  vitrinoCalendar,
} from "../vitrino/datumoj.js";
import { signOf } from "../web-component/element-template.js";
import {
  drawnPartPropertiesOf,
  pluginManifest,
  pluginSource,
  structureBoundPartPropertiesOf,
} from "./plugin.js";

/** A variable value: a literal, or an alias to another variable of the plan. */
export type FigmaValue = { alias: string } | string | number | FigmaColor | boolean;

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariable {
  name: string;
  /** BOOLEAN: the switch of a glyph per Aspekto (Spec 014 ②, plan ② D-08). */
  type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  /** Helper variables of the cascade are hidden from publishing. */
  hidden?: boolean;
  /** One entry per mode of the collection. */
  values: Record<string, FigmaValue>;
}

export interface FigmaCollection {
  name: string;
  /**
   * The modes, the default first: Figma's default mode of a collection is its first mode
   * (`defaultModeId` is read-only), so the order decides what "Automatisch" shows (F19).
   */
  modes: string[];
  /** The mode a frame gets without a choice: the default of the Dimensio in the Modelo. */
  defaultMode?: string;
  variables: FigmaVariable[];
}

/**
 * The paint the plugin applies for one colour binding (F8, Abnahme M1). Figma binds only the RGB
 * of a variable to a paint, so the deckkraft is part of the plan: the plugin sets
 * `paint.opacity = alpha` and keeps the binding to `color` in every case. The decision is taken
 * over **all modes of all Dimensioj, aspekto included**; where the alpha is not the same in all of
 * them, the plan says so instead of picking one mode (a projection projects the Modelo, never one
 * brand), and the projection check refuses the binding.
 */
export type FigmaPaint =
  | { hex: string; opacity: number }
  | { hex: string; alphaVariesByMode: true };

/** What a Figma side writes for a binding whose alpha is not the same in every mode. */
export const ALPHA_VARIES = PARITY_ALPHA_VARIES;

/**
 * Figma's names for the writing case; the Vortaro says it in CSS words (F31). `textCase` is a
 * property of the text node, not a bindable field, so the plan can state one value — and where two
 * modes disagree it says that instead of picking a brand, exactly as it does for a paint's alpha.
 */
const TEXT_CASES: Readonly<Record<string, string>> = {
  none: "ORIGINAL",
  uppercase: "UPPER",
  lowercase: "LOWER",
  capitalize: "TITLE",
};

/** What the plan writes where two modes want a different case. */
export const TEXT_CASE_VARIES = "text case varies by mode";

/**
 * The state in which the web component shows its focus ring (:focus-visible). Which state that is
 * is knowledge of this Celo, not of the Modelo (Art. VIII).
 */
const FOCUS_STATE = "focus";

/**
 * Parts the Figma Celo does not draw, each with the Jugxo that releases the difference. The
 * Vitrino decides: it shows no icons, so Figma draws none; the day it shows one, this entry goes
 * and the icon is drawn (Maintainer, 2026-09-21).
 */
export const FIGMA_NOT_DRAWN: Readonly<Record<string, string>> = {
  // The icon was released by jug_01M31TV1V4S3RNBPWSRB2CGEDK until Spec 014 ② (plan ② D-08): the
  // Vitrino shows icons now, so Figma draws them from the glyphs of every Aspekto; the Jugxo
  // stays as history with its note.
  // Spec 008 (plan D-11, Befund B-1): the underline is written as the label's text decoration,
  // on or off per variant; its thickness and colour bind to no variable in Figma. The underline
  // of a navigation's item (Spec 011 ⑤) is no text decoration but the item's block-end edge, and
  // the nav structure binds it as a stroke of its own (STRUCTURE_BINDINGS.nav): a part property
  // a structure binds on a node of its own is drawn, whatever release its name has here.
  underline: "jug_01M4RYCY61NK92JM6XYD00M012",
  // Spec 009 (plan D-09, Befund B-2; Abnahme F-4): the control of a field in the set is empty and
  // shows the placeholder, so the colour of the typed text has no node; the sign of the required
  // mark is the projection's — of the kampo and, since Spec 010 ② and ③, of the markobutono and the
  // elekto; since ④ both for the elektilo, whose closed field shows its prompt (the Jugxo's wording
  // names all four).
  text: "jug_01M4S2R85WRAC5SV7CARH8RE7S",
  "required-mark": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
  // Spec 020 ③ (plan ③ D-27): the ring of the scroll region and the announcement of a copy of the
  // kodbloko have no node — Figma has no scroll region and no live region. Since Nachlese 8 ②
  // (F-12) the caption of the kodbloko and the quote and indent of the markdovido are drawn.
  "scroll-ring": "jug_01M5D5JN34KAD7N6A822HW524H",
  announce: "jug_01M5D5JN34KAD7N6A822HW524H",
  // Spec 025 ① (plan ① D-05, B-1): the step buttons and the clear button of the kampo hang on kind
  // and stepper, which key no variant; the set shows the field alone, their picture is the
  // butono's with the glyphs subtract, add and close.
  decrement: "jug_01M5GCQAYC3R7C7DPHQGYDPYKM",
  increment: "jug_01M5GCQAYC3R7C7DPHQGYDPYKM",
  clear: "jug_01M5GCQAYC3R7C7DPHQGYDPYKM",
};

/**
 * The text the control of a field shows in the set (Abnahme Spec 009, F-4): an example in place
 * of the typed text (the placeholder). One neutral word per node, like the label's default (F14,
 * M-3); an instance overrides it. Without content a HUG frame shrinks to its paddings and a text
 * node is invisible. The field of a select (Spec 010 ④, plan ④ D-07) shows its prompt instead —
 * "Bitte wählen", the Vitrino's (one source for both pictures); an example of one option there
 * would read as chosen, which the Regulo select-placeholder-is-prompt forbids.
 */
export const FIELD_EXAMPLE = "Beispiel";

/**
 * The words of the heading and the details of a notice (Spec 011 ③, plan ③ D-14) where the
 * Vitrino does not export them yet (plan ③ D-15 adds `heading`, `details` and `description` to
 * its slot words): the same words, so both pictures stay one once the export is there —
 * `slotWord` takes the Vitrino's first and falls back to these.
 */
const SLOT_WORDS_FALLBACK: Readonly<Record<string, string>> = {
  heading: "Überschrift",
  details: "Einzelheit",
};

const slotWord = (slot: string): string | undefined =>
  VITRINO_SLOT_TEXTS[slot] ?? SLOT_WORDS_FALLBACK[slot];

/**
 * The words of the text slots of a Skemo besides its default slot (F-5: the same words the
 * Vitrino slots in, one source for both pictures): help and error of a field (F-4), the error of
 * a checkbox (Spec 010 ②), message and reason of a dialog (Spec 011 ②), heading and details of a
 * notice (Spec 011 ③). A slot the Vitrino has no word for, or whose entries are options (Spec 010
 * ③), is left out — and so is a hidden slot (Spec 011 ③: the description of a badge is spoken,
 * never seen; a set draws what is seen).
 */
function slotWordsOf(skemo: LoadedEro["skemo"]): Record<string, string> {
  return Object.fromEntries(
    skemo.slots
      .filter(
        (slot) =>
          slot.default !== true &&
          slot.text === true &&
          slot.entry === undefined &&
          slot.hidden !== true,
      )
      .flatMap((slot) => {
        const text = slotWord(slot.name);
        return text === undefined ? [] : [[slot.name, text]];
      }),
  );
}

/**
 * The texts of a field (F-4): the example (or the prompt of a select) in the control, the words
 * of its slots below. A text area (Spec 011 ②) shows the example followed by the empty lines of
 * its default rows, so the control — which has no box.height and hugs its text — is as high as
 * the rows the web shows; `rows` is a number, nothing to bind.
 */
function fieldTextsOf(skemo: LoadedEro["skemo"]): Record<string, string> {
  const rows = skemo.props.find((prop) => prop.name === "rows" && prop.kind === "number")?.default;
  const lines = typeof rows === "number" && rows > 1 ? rows : 1;
  const example = skemo.a11y.role === "combobox" ? VITRINO_PROMPT : FIELD_EXAMPLE;
  return { text: example + "\n".repeat(lines - 1), ...slotWordsOf(skemo) };
}

/**
 * The words of the two actions a dialog shows (Spec 011 ②): the Vitrino's — "Abbrechen" and
 * "Bestätigen", read from the markup of its actions, one source for both pictures (F-5). In the
 * set they stand in two simple frames, not in instances of the butono (candidate: instances once
 * the plugin composes sets).
 */
const DIALOG_ACTION_TEXTS: Readonly<Record<string, string>> = Object.fromEntries(
  [...VITRINO_DIALOG_ACTIONS.matchAll(/>([^<]+)</g)].map((match, index) => [
    `action-${index + 1}`,
    match[1] ?? "",
  ]),
);

/**
 * Which stand-in of a dialog looks like which butono (Abnahme Spec 011 ②, F-5; O-8): the last
 * action — „Bestätigen" — confirms and is a butono of emphasis high; „Abbrechen" before it is of
 * emphasis low and keeps the dialog's look (VITRINO_DIALOG_ACTIONS, one source for both
 * pictures). The parts a stand-in can show: its fill, the colour of its word and the radius of
 * its box — one frame with a text in it, as a control is. The roles are read from the butono's
 * Skemo at rest; nothing here names a token.
 */
export const DIALOG_CONFIRM_ACTION = {
  node: `action-${Object.keys(DIALOG_ACTION_TEXTS).length}`,
  ero: "butono",
  props: { emphasis: "high", intent: "neutral", [STATE_KEY]: "rest" } as Record<string, string>,
  parts: ["surface.fill", "label.color", "box.radius"] as readonly string[],
};

/**
 * The composed look of a dialog's confirming stand-in (F-5): the butono's bindings for the props
 * of DIALOG_CONFIRM_ACTION, by token name like every binding, with the paints' deckkraft decided
 * over every mode (F8). `undefined` where the Modelo has no butono or binds none of the parts —
 * then the stand-in keeps the dialog's look, and the test says so.
 */
function composedOf(
  eroj: readonly LoadedEro[],
  resolutions: ReturnType<typeof allResolutions>,
  base: Readonly<Record<string, { value: unknown }>>,
): FigmaComponentSet["composed"] {
  const { node, ero, props, parts } = DIALOG_CONFIRM_ACTION;
  const entry = eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) return undefined;
  const bindings: Record<string, string> = {};
  const paints: Record<string, FigmaPaint> = {};
  for (const key of parts) {
    const [part = "", property = ""] = key.split(".");
    const bound = boundToken(entry.skemo, part, property, props);
    if (bound === undefined || isBindingKeyword(bound.token)) continue;
    bindings[key] = variableName(eroTokenOf(entry, part, property, props) ?? bound.token);
    if (PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES] !== "color") continue;
    const paint = paintOf(bound.token, resolutions, base);
    if (paint !== undefined) paints[key] = paint;
  }
  const composed: NonNullable<FigmaComponentSet["composed"]> = {};
  if (Object.keys(bindings).length > 0) {
    composed[node] = {
      ero,
      props: { ...props },
      bindings,
      ...(Object.keys(paints).length === 0 ? {} : { paints }),
    };
  }
  // The help of the reason (Spec 014 ① D-02, ② O-5): the dialog hands it to its tekstareo, so
  // the stand-in takes the tekstareo's help colour and role, read from that Skemo.
  const area = eroj.find((candidate) => candidate.ero.name === DIALOG_REASON_HELP.ero);
  if (area !== undefined) {
    const helpBindings: Record<string, string> = {};
    const helpPaints: Record<string, FigmaPaint> = {};
    for (const key of DIALOG_REASON_HELP.parts) {
      const [part = "", property = ""] = key.split(".");
      const bound = boundToken(area.skemo, part, property, DIALOG_REASON_HELP.props);
      if (bound === undefined || isBindingKeyword(bound.token)) continue;
      helpBindings[key] = variableName(
        eroTokenOf(area, part, property, DIALOG_REASON_HELP.props) ?? bound.token,
      );
      if (PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES] !== "color") continue;
      const paint = paintOf(bound.token, resolutions, base);
      if (paint !== undefined) helpPaints[key] = paint;
    }
    if (Object.keys(helpBindings).length > 0) {
      composed[DIALOG_REASON_HELP.node] = {
        ero: DIALOG_REASON_HELP.ero,
        props: { ...DIALOG_REASON_HELP.props },
        bindings: helpBindings,
        ...(Object.keys(helpPaints).length === 0 ? {} : { paints: helpPaints }),
      };
    }
  }
  return Object.keys(composed).length === 0 ? undefined : composed;
}

/**
 * The composed butono of an upload (Spec 015 ②, plan ② D-06): the button that chooses is a
 * butono of emphasis medium, every remove one of emphasis low and size small; the stand-ins take
 * the butono's roles read from its Skemo at rest, as the confirming action of a dialog does.
 */
export const UPLOAD_COMPOSED: readonly {
  node: string;
  ero: string;
  props: Record<string, string>;
  parts: readonly string[];
}[] = [
  {
    node: "choose",
    ero: "butono",
    props: { emphasis: "medium", intent: "neutral", size: "medium", [STATE_KEY]: "rest" },
    parts: [
      "surface.fill",
      "border.color",
      "border.width",
      "label.color",
      "label.typography",
      "icon.color",
      "icon.size",
      "box.height",
      "box.inline-padding",
      "box.gap",
      "box.radius",
    ],
  },
  {
    node: "remove",
    ero: "butono",
    props: { emphasis: "low", intent: "neutral", size: "small", [STATE_KEY]: "rest" },
    parts: ["surface.fill", "icon.color", "icon.size", "box.radius"],
  },
];

/**
 * The composed butono and insigno of a card (Spec 015 ③, plan ③ D-05): its two actions — the
 * Vitrino's, in its order: emphasis high, then low — and the badge of its meta row, an insigno
 * of intent neutral. The stand-ins take the roles read from those Skemoj at rest in their default
 * size, as the upload's button does; not parts of the karto, so not in its parity inventory.
 */
export const CARD_COMPOSED: readonly {
  node: string;
  ero: string;
  props: Record<string, string>;
  parts: readonly string[];
}[] = [
  ...VITRINO_CARD.actions.map((action, index) => ({
    node: `action-${index + 1}`,
    ero: "butono",
    props: { emphasis: action.emphasis, intent: "neutral", size: "medium", [STATE_KEY]: "rest" },
    parts: [
      "surface.fill",
      "border.color",
      "border.width",
      "label.color",
      "label.typography",
      "box.height",
      "box.inline-padding",
      "box.radius",
    ],
  })),
  {
    node: "badge",
    ero: "insigno",
    props: { intent: "neutral", size: "medium", [STATE_KEY]: "rest" },
    parts: [
      "surface.fill",
      "border.color",
      "border.width",
      "text.color",
      "text.typography",
      "box.height",
      "box.inline-padding",
      "box.radius",
    ],
  },
];

/**
 * The looks of composed stand-ins, like composedOf for a dialog's action: an upload's (Spec 015
 * ②, UPLOAD_COMPOSED) and a card's (Spec 015 ③, CARD_COMPOSED).
 */
function standInsComposedOf(
  stands: typeof UPLOAD_COMPOSED,
  eroj: readonly LoadedEro[],
  resolutions: ReturnType<typeof allResolutions>,
  base: Readonly<Record<string, { value: unknown }>>,
): FigmaComponentSet["composed"] {
  const composed: NonNullable<FigmaComponentSet["composed"]> = {};
  for (const { node, ero, props, parts } of stands) {
    const entry = eroj.find((candidate) => candidate.ero.name === ero);
    if (entry === undefined) continue;
    const bindings: Record<string, string> = {};
    const paints: Record<string, FigmaPaint> = {};
    for (const key of parts) {
      const [part = "", property = ""] = key.split(".");
      const bound = boundToken(entry.skemo, part, property, props);
      if (bound === undefined || isBindingKeyword(bound.token)) continue;
      bindings[key] = variableName(eroTokenOf(entry, part, property, props) ?? bound.token);
      if (PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES] !== "color") continue;
      const paint = paintOf(bound.token, resolutions, base);
      if (paint !== undefined) paints[key] = paint;
    }
    if (Object.keys(bindings).length === 0) continue;
    composed[node] = {
      ero,
      props: { ...props },
      bindings,
      ...(Object.keys(paints).length === 0 ? {} : { paints }),
    };
  }
  return Object.keys(composed).length === 0 ? undefined : composed;
}

/**
 * The composed kampo of a slider (Spec 025 ①, plan ① D-04): the number field beside the track is a
 * kampo of kind number in the field's size at rest; the stand-in takes the kampo's roles read from
 * its Skemo — the surface, the border, the height and radius of the box, the typed text's role.
 */
export const SLIDER_COMPOSED: readonly {
  node: string;
  ero: string;
  props: Record<string, string>;
  parts: readonly string[];
}[] = [
  {
    node: "number",
    ero: "kampo",
    props: { kind: "number", size: "medium", [STATE_KEY]: "rest" },
    parts: [
      "surface.fill",
      "border.color",
      "border.width",
      "box.height",
      "box.radius",
      "box.inline-padding",
      "text.color",
      "text.typography",
    ],
  },
];

/**
 * The size of a file as the person reads it (Spec 015 ②): decimal units in German, as the web's
 * element writes them with Intl in the document's language — one rule for both pictures.
 */
export function fileSizeText(bytes: number, lingvo = "de"): string {
  const [unit, factor] =
    bytes >= 1_000_000
      ? ["megabyte", 1_000_000]
      : bytes >= 1_000
        ? ["kilobyte", 1_000]
        : ["byte", 1];
  return new Intl.NumberFormat(lingvo, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(bytes / Number(factor));
}

/** The name of the example frame beside an upload's set (Spec 015 ②: „mit zwei Dateien"). */
export const UPLOAD_EXAMPLE = "mit zwei Dateien";

/**
 * The name of the example frame beside a card's set (Spec 015 ③, plan ③ D-05): the default
 * variant with its media hidden, as `<set> – ohne Bild` — the media slot is optional.
 */
export const CARD_EXAMPLE = "ohne Bild";

/**
 * The stand-in of a picture (Spec 015 ③): its ground the sunken background, what it shows in the
 * subtle text colour — bound to their variables, no Skemo parts, so no parity. The media of a
 * card (plan ③ D-05) shows the Vitrino's word on it; the image of an avatar (plan ③ D-11) the
 * Vitrino's silhouette (avatarSilhouetteOf).
 */
const STAND_IN_FILL = "color.background.sunken";
const STAND_IN_COLOR = "color.text.subtle";

/**
 * The name of the example frame beside an avatar's set (Spec 015 ③, plan ③ D-11): the default
 * variant with its image shown over the initials, as `<set> – mit Bild`.
 */
export const AVATAR_EXAMPLE = "mit Bild";

/**
 * The silhouette an avatar's image shows in the set (Spec 015 ③, plan ③ D-11): the head and the
 * shoulders of the Vitrino's example picture (VITRINO_AVATAR.picture, one source for both
 * pictures), its circle written as two arcs so head and shoulders are one filled path, without
 * the picture's ground — the image frame's fill is the ground. The plugin imports it once and
 * binds the vector's fill; `undefined` where the picture holds no circle and path to read.
 */
export function avatarSilhouetteOf(picture: string): string | undefined {
  const svg = decodeURIComponent(picture.slice(picture.indexOf(",") + 1));
  const box = /viewBox=['"]([^'"]+)['"]/.exec(svg)?.[1];
  const circle = /<circle cx=['"]([\d.]+)['"] cy=['"]([\d.]+)['"] r=['"]([\d.]+)['"]/.exec(svg);
  const body = /<path d=['"]([^'"]+)['"]/.exec(svg)?.[1];
  if (box === undefined || circle === null || body === undefined) return undefined;
  const [cx = 0, cy = 0, r = 0] = circle.slice(1).map(Number);
  const [, , width = "16", height = "16"] = box.split(/\s+/);
  const head = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  return `<svg aria-hidden="true" viewBox="${box}" width="${width}" height="${height}" fill="currentColor"><path d="${head}${body}"/></svg>`;
}

/**
 * The width of a card in the set (Spec 015 ③, plan ③ D-05): the Uzo's columns-from — from this
 * width on a horizontal card stands beside its media —, px of the base combination, written, not
 * bound, as the separator's length; the Skemo gives the card no width (its container does).
 */
const CARD_WIDTH = "size.container.small";

/**
 * The share of the card's width its media takes along the card's flow (Spec 015 ③, plan ③ D-05):
 * its height above the body where vertical, its width beside it where horizontal. A number of
 * this Celo, not a token (the picture's size is the application's), named here once.
 */
const CARD_MEDIA_SHARE = 1 / 3;

/**
 * The help under the reason field of a dialog (Spec 014 ② O-5): a stand-in for the help of the
 * composed tekstareo — its colour and role at rest in the field's default size.
 */
export const DIALOG_REASON_HELP = {
  node: "reason-help",
  ero: "tekstareo",
  props: { size: "medium", [STATE_KEY]: "rest" } as Record<string, string>,
  parts: ["help.color", "help.typography"] as readonly string[],
};

/**
 * The texts of a dialog's set (Spec 011 ②): the message, the label of the reason field and its
 * help (Spec 014 ①, plan ① D-02; the same sentence the Vitrino shows, F-5) from the Vitrino's
 * slot words, the two action words; the heading is the label property.
 */
export const DIALOG_TEXTS: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    ["message", "reason", "reason-help"].flatMap((slot) => {
      const text = VITRINO_SLOT_TEXTS[slot];
      return text === undefined ? [] : [[slot, text]];
    }),
  ),
  ...DIALOG_ACTION_TEXTS,
};

/**
 * The name of the example frame beside a dialog's set (Spec 011 ②, spec „dialogo – Figma"): the
 * default variant on the backdrop (color.backdrop), as `<set> – mit Hintergrund`. The variants
 * themselves show the surface only: an instance of a dialog is its surface, the backdrop is the
 * page's.
 */
export const BACKDROP_EXAMPLE = "mit Hintergrund";

/**
 * The name of the example frame beside a meter's set (Spec 011 ④, spec „mezurilo – Figma": the
 * value examples 0, 66 and unknown; plan ④ D-14): the default variant with the unknown value, as
 * `<set> – unbekannt`. The variants show the known value (the Vitrino's example, `meterShareOf`);
 * an unknown value is not 0 (G4): the track keeps its fill, carries the dashed stroke of the part
 * unknown and holds no fill frame, and the value text says so.
 */
export const UNKNOWN_EXAMPLE = "unbekannt";

/**
 * The value text of an unknown value (Spec 011 ④, G4, Regulo meter-text-states-value: an unknown
 * value heißt „nicht geprüft", nie „0 %"): the word of the Regulo, which the Skemo's a11y texts
 * do not carry (the application writes the text; the set shows the Regulo's example).
 */
export const METER_UNKNOWN_TEXT = "nicht geprüft";

/**
 * The name of the example frame beside a navigation's set (Spec 011 ⑤): the default variant laid
 * out as a column, as `<set> – vertikal`. orientation keys no part (the Web stylesheet inventory
 * says props {}), so it is no variant axis of the set — a prop variant here would break parity;
 * the vertical picture is an example frame, as the unknown value of a meter is (Spec 011 ④).
 */
export const VERTICAL_EXAMPLE = "vertikal";

/**
 * The examples beside a separator's set (Nachlese 4 N-6, F-7: in the overview the line was hardly
 * visible, the vertical one not recognisable — a 1 px line alone in a cell of 640): each
 * orientation once more between two texts, as the Vitrino shows it, `<set> – waagerecht|senkrecht
 * zwischen zwei Texten`.
 */
export const SEPARATOR_EXAMPLE = "zwischen zwei Texten";

/** The words of the orientations in the names of a separator's examples. */
const SEPARATOR_ORIENTATION_WORDS: Readonly<Record<string, string>> = {
  horizontal: "waagerecht",
  vertical: "senkrecht",
};

/**
 * The role of the two texts of a separator's example: the running text the line divides, in its
 * colour on the Vitrino's ground. Bound like a label, nothing written as a number.
 */
const SEPARATOR_EXAMPLE_TEXT = {
  color: "color.text.default",
  typography: "typography.body.1",
} as const;

/**
 * The example of a Markdown view in Figma (Nachlese 8 ② F-12): the paragraph, the list and the
 * quote of the Vitrino's Markdown (VITRINO_MARKDOWN), as the markdovido shows them — the marks of
 * emphasis and code are the view's, the words are these.
 */
export const MARKDOWN_EXAMPLE = {
  paragraph: "Ein Absatz mit Hervorhebung, Gewicht und STD-1.",
  items: ["eins", "zwei"],
  quote: "Ein Zitat.",
} as const;

/** The number of pages of the pagination's examples (Spec 015 ①, O-2: „von 10"). */
export const PAGINATION_EXAMPLE_TOTAL = 10;

/** The gap of a pagination's row, written as the web's element writes it. */
export const PAGINATION_GAP = "\u2026";

/**
 * The words of a pagination's row on `page` of `total` (Spec 015 ①): the first and the last page,
 * the current one and `siblings` on either side, the gap sign for every gap — as the web's
 * element draws them, so both pictures show the same row.
 */
export function paginationWords(page: number, total: number, siblings: number): string[] {
  const low = Math.max(2, page - siblings);
  const high = Math.min(total - 1, page + siblings);
  const words = ["1"];
  if (low > 2) words.push(PAGINATION_GAP);
  for (let n = low; n <= high; n += 1) words.push(String(n));
  if (high < total - 1) words.push(PAGINATION_GAP);
  if (total > 1) words.push(String(total));
  return words;
}

/**
 * The texts of a tab list's set besides the tabs (Spec 011 ⑤): the word of the panel — the
 * Vitrino's panel shows the word of the first tab ("Eins"), one source for both pictures (F-5).
 * The panel's content is the application's: the set shows the word in the panel's colour
 * (panel.color) and, since the Skemo gives the panel no role, in the font of the tabs, bound to
 * nothing (a Befund for plan ⑤).
 */
export const TABS_TEXTS: Readonly<Record<string, string>> = { panel: VITRINO_OPTIONS[0] ?? "" };

/**
 * The share of the track the fill of a meter takes in the set (Spec 011 ④, plan ④ D-14): the
 * Vitrino's value example (66) in the Skemo's range (min 0, max 100 by default) — one source for
 * both pictures. A number of the drawing, no token: Figma binds no share, the plugin writes the
 * fill's width from the track's measured width.
 */
export function meterShareOf(skemo: LoadedEro["skemo"]): number {
  const bound = (name: string): number => {
    const prop = skemo.props.find(
      (candidate) => candidate.name === name && candidate.kind === "number",
    );
    return typeof prop?.default === "number" ? prop.default : Number(prop?.default ?? 0);
  };
  const example = Number(VITRINO_NUMBER_EXAMPLES.value ?? 0);
  const range = bound("max") - bound("min");
  return range > 0 ? (example - bound("min")) / range : 0;
}

/**
 * The value of the orientation prop that stacks a navigation (Spec 011 ⑤): `vertical`, where
 * the Skemo's enum has it; undefined for an Ero without it. Read, never assumed: a prop that keys
 * no part stands in no variant, and the example frame shows the one value the set does not.
 */
export function verticalOf(skemo: LoadedEro["skemo"]): string | undefined {
  const prop = skemo.props.find(
    (candidate) => candidate.name === "orientation" && candidate.kind === "enum",
  );
  return prop?.values?.includes("vertical") === true ? "vertical" : undefined;
}

/**
 * The dash of an empty value in a key-value list (Spec 011 ④, plan ④ D-14): the web draws a
 * short line as a sign of the projection and speaks „keine Angabe" (a11y.texts entries-empty);
 * the set shows the dash as the value's text, where the Vitrino's entry has none. One character,
 * named here once.
 */
export const LIST_EMPTY_VALUE = "–";

/**
 * The entries of a key-value list in the set (Spec 011 ④, F-5): the Vitrino's pairs, an empty
 * value as the dash.
 */
export const LIST_ENTRIES: readonly { term: string; value: string }[] = VITRINO_LIST_ENTRIES.map(
  ([term, value]) => ({ term, value: value === "" ? LIST_EMPTY_VALUE : value }),
);

/**
 * The table of the set (Spec 011 ④, spec „tabelo – Figma": ein Set mit Kopf + 3 Zeilen × 3
 * Spalten, eine numerisch, die Sortierung am ersten Kopf aufsteigend; F-5): read from the
 * Vitrino's table markup, one source for both pictures — the head words, the rows (a row header
 * and its cells), which columns are numeric (`numeric`) and which the sort button stands on
 * (`data-sort`). The direction is the Skemo's default of the prop direction.
 */
export const TABLE_TEXTS: { head: string[]; rows: string[][]; numeric: number[]; sorted: number } =
  (() => {
    const heads = [...VITRINO_TABLE.matchAll(/<th scope="col"([^>]*)>([^<]*)<\/th>/g)];
    const rows = [
      ...VITRINO_TABLE.matchAll(/<tr>(<th scope="row">(?:[^<]*<\/th>)(?:<td>[^<]*<\/td>)+)<\/tr>/g),
    ].map((row) => [...(row[1] ?? "").matchAll(/>([^<]+)</g)].map((cell) => cell[1] ?? ""));
    return {
      head: heads.map((head) => head[2] ?? ""),
      rows,
      numeric: heads.flatMap((head, index) => (/\bnumeric\b/.test(head[1] ?? "") ? [index] : [])),
      sorted: Math.max(
        0,
        heads.findIndex((head) => /\bdata-sort=/.test(head[1] ?? "")),
      ),
    };
  })();

/**
 * The sign of a loading state (Spec 011 ③, plan ③ D-14): the arc the web draws in its indicator
 * (element-template.ts, D-10: three quarters of a circle in a box of 16, a stroke in the current
 * colour), here in its own box of 16 like the signs of `signOf`. The plugin imports it once and
 * binds the vector's stroke to indicator.color. The path is the web's; a shared export of it is a
 * candidate (one source for both pictures), the other Celo's path is not exported today.
 */
export const STATE_SIGN =
  '<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2a6 6 0 1 1-6 6"/></svg>';

/**
 * The part a boolean prop shows or hides (Spec 011 ③, plan ③ D-14): dismissible shows the dismiss
 * butono of a notice. Celo knowledge (Art. VIII): the Skemo keys no part by the prop — the butono
 * is there or not, it does not change its look — so the plan declares it as a BOOLEAN property of
 * the set connected to the part's visibility, with the Skemo's default. Only where the Skemo has
 * both the prop and the part — or the slot (Spec 011 ④, plan ④ D-14: caption-hidden hides the
 * caption of a table, the text of its default slot, which the set draws as the label; `hides`
 * says the prop takes the part away where dismissible brings it).
 */
const BOOLEAN_TOGGLES: Readonly<
  Record<string, { part: string; hides?: boolean; shownAs?: string }>
> = {
  dismissible: { part: "dismiss" },
  "caption-hidden": { part: "caption", hides: true },
  // Nachlese 7 ② B-2: label-hidden hides the meter's label like caption-hidden the caption; the
  // property that shows it is named label-visible, because label is the TEXT property of the set.
  "label-hidden": { part: "label", hides: true, shownAs: "label-visible" },
  // Nachlese 5 O-41 (Nachlese 4 B-8): the ligilo's external shows the mark in its slot icon-end.
  external: { part: "icon-end" },
};

/**
 * The axis whose first value is an avatar's smallest size (Nachlese 5 N5-5, O-18): there it
 * shows one initial, in Figma as on the web.
 */
export const AVATAR_SIZE_PROP = "size";

/**
 * The dash pattern of a dashed stroke (Spec 011 ③, plan ③ D-14), in widths of the stroke: the
 * web says `border-style: dashed` and leaves the lengths to the browser (Chromium draws a thin
 * dashed border three widths on, three off); Figma knows no dashed style, only a pattern of
 * numbers, bound to no variable. The plan writes the pattern from the border's width in the base
 * combination, as it writes the underline (B-1) — a number, not a token, named here once.
 */
const DASH_IN_WIDTHS = 3;

/**
 * How the plugin draws a set (Spec 009, D-09): a control (variant → ring → gap → control → label)
 * for a button or a link, a field (label above, the control with its text, help and error below)
 * for a textbox, a toggle (Spec 010 ①, D-10: a row — ring → gap → control with the knob in it,
 * the label beside) for a switch and a checkbox (Spec 010 ②, D-09: the box with the check mark in
 * it, label and error in a column beside it; G1 gives the Wahl-Eroj one build, "control + label").
 * Celo knowledge from the a11y role (Art. VIII).
 */
export type FigmaStructure =
  | "control"
  | "field"
  | "toggle"
  | "choice"
  | "dialog"
  | "badge"
  | "notice"
  | "state"
  | "meter"
  | "table"
  | "list"
  | "nav"
  | "tabs"
  | "icon"
  | "separator"
  | "tooltip"
  | "popover"
  | "menu"
  | "disclosure"
  | "pagination"
  | "breadcrumb"
  | "upload"
  | "card"
  | "avatar"
  | "codeblock"
  | "markdown"
  | "slider";

/**
 * A radio group (Spec 010 ③, D-07) is a choice: the label (the question) above a column of
 * options, each a row — ring → gap → circle with the dot, the option's label beside it — and help
 * and error below. Its options are entries of a slot, not variants: selected is the state of one
 * option (E7). A select (Spec 010 ④, D-07) is a field: the closed field of the kampo with the
 * chevron at the end of its control; its list is the platform's and not drawn (E3, Manko of the
 * plan). A dialog (Spec 011 ②) is a structure of its own: the surface — a column of a width
 * bound by size — with heading, message, the reason field and two actions; a text area is a
 * textbox and therefore a field. Spec 011 ③ (plan ③ D-14): static text (role generic) is a badge
 * — the pill with its text, no ring (G2); a live region (role status) is a notice — a row with the
 * accent at its start, the texts in a column, the dismiss frame at the end — or, where its Skemo
 * has an indicator (the area is busy or empty), a state — a column with the arc, the text and the
 * actions. The parts tell the two apart: the role alone is the same. Spec 011 ④ (plan ④ D-14):
 * a meter (role meter) is a column — label, the track with the fill in it, value text; a table
 * (role table) is the caption above the region with the head and three rows, the sort button in
 * the first head cell; a list (role list) is a column of entries, each a row or a column by
 * layout. Spec 011 ⑤: a navigation (role navigation) is a nav — a row of three items, each ring
 * → gap → item (its fill, its underline as the block-end stroke) with the item's text, the
 * first the current one (the state of one entry, E7); a tab list (role tablist) is tabs — the
 * list (a row with its line as the block-end stroke) of three tabs, each ring → gap → tab (fill
 * by state, the selected indicator as the block-end stroke) with the tab's text, the first the
 * active one, and the panel with its word below.
 */
export const structureOf = (role: string, parts: readonly string[] = []): FigmaStructure =>
  // Spec 025 ① (plan ① D-04): a slider — label, the row of the end labels, the track with its fill
  // and thumbs and the number field, help, error.
  role === "slider"
    ? "slider"
    : // Spec 015 ② (plan ② D-06): the platform's file input is heard as a button; with a dropzone
      // part it is an upload — label, the dropzone with the button and its hint, help, error.
      role === "button" && parts.includes("dropzone")
      ? "upload"
      : role === "textbox" || role === "combobox"
        ? "field"
        : role === "switch" || role === "checkbox"
          ? "toggle"
          : role === "radiogroup"
            ? "choice"
            : role === "dialog"
              ? parts.length > 0 && !parts.includes("backdrop")
                ? "popover"
                : "dialog"
              : role === "generic"
                ? "badge"
                : role === "status"
                  ? parts.includes("indicator")
                    ? "state"
                    : "notice"
                  : role === "meter"
                    ? "meter"
                    : role === "table"
                      ? "table"
                      : role === "list"
                        ? "list"
                        : role === "navigation"
                          ? // Spec 015 ① (plan ① D-05): a navigation with an ellipsis part is a
                            // pagination, with a separator part a breadcrumb.
                            parts.includes("ellipsis")
                            ? "pagination"
                            : parts.includes("separator")
                              ? "breadcrumb"
                              : "nav"
                          : role === "tablist"
                            ? "tabs"
                            : // Spec 014 ② (plan ② D-08): an icon (role img) is the glyph of every
                              // Aspekto in a box; a separator (role separator) a line.
                              // Spec 015 ③ (plan ③ D-11): an avatar shares the role img; its
                              // initials tell it apart — the box with the initials and the image.
                              role === "img"
                              ? parts.includes("initials")
                                ? "avatar"
                                : "icon"
                              : role === "separator"
                                ? "separator"
                                : // Spec 014 ③ (plan ③ D-05): a heading and a paragraph are static
                                  // text, drawn as a badge is — the text in the role of the variant.
                                  role === "heading" || role === "paragraph"
                                  ? "badge"
                                  : // Nachlese 8 ② (F-12): a code block (role figure) is its caption,
                                    // the code in the code role and the copy button; a Markdown view
                                    // (role document) a paragraph, a list and a quote.
                                    role === "figure"
                                    ? "codeblock"
                                    : role === "document"
                                      ? "markdown"
                                      : // Spec 014 ④ (plan ④ D-06): the overlays — a tooltip, a menu, and
                                        // a popover (a dialog without a backdrop: non-modal, with a trigger).
                                        role === "tooltip"
                                        ? "tooltip"
                                        : role === "menu"
                                          ? "menu"
                                          : // Spec 014 ⑤ (plan ⑤ D-04): a disclosure (role group).
                                            role === "group"
                                            ? "disclosure"
                                            : // Spec 015 ③ (plan ③ D-05): a card (role article) — the
                                              // surface with the media and the body: heading,
                                              // content, the meta row and the actions.
                                              role === "article"
                                              ? "card"
                                              : "control";

/**
 * The neutral word every label template shows, per a11y role (M-3; Maintainer, F14, 2026-10-13,
 * Jugxo jug_01M4VCG06S4MWFPVPNWMBN9EWF): a button names an action, a link its target, a field what it asks for.
 * Celo knowledge from the a11y role (Art. VIII), like `structureOf`; instances override it.
 */
const LABEL_DEFAULTS: Readonly<Record<string, string>> = {
  button: "Aktion",
  link: "Ziel",
  textbox: "Beschriftung",
  // Spec 010 ① (plan D-10): a switch names a setting (Jugxo jug_01M50KAWKV5A1PYBARPMX4YKJE, O-1).
  switch: "Einstellung",
  // Spec 010 ② (plan ② D-11): a checkbox names an option (Jugxo jug_01M50KAWKW4N2AG37AJZY1P96V, O-5).
  checkbox: "Option",
  // Spec 010 ③ (plan ③ D-07): a radio group names its question (Jugxo jug_01M50KAWKW4N2AG37AJZY1P96W, O-9).
  radiogroup: "Frage",
  // Spec 010 ④ (plan ④ D-07): a select names what is chosen (Jugxo jug_01M50KAWKW4N2AG37AJZY1P96X, O-15).
  combobox: "Auswahl",
  // Spec 011 ②: a dialog's heading names the decision it asks for (Regulo
  // dialog-title-names-the-decision) — the default text of the heading property. For the
  // maintainer to confirm; no Jugxo created here.
  dialog: "Entscheidung",
  // Spec 011 ③ (plan ③ D-14): a badge (static text, role generic) names a status in one to three
  // words (Regulo badge-text-short). For the maintainer to confirm; no Jugxo created here.
  generic: "Status",
  // Spec 011 ③ (plan ③ D-14): a live region (role status) is a notice whose message tells what
  // happened — the default text of the message property. For the maintainer to confirm; no Jugxo.
  status: "Meldung",
  // Spec 011 ④ (plan ④ D-14): a meter's label names the measure it shows (Regulo
  // meter-text-states-value gives the number to the value text). For the maintainer to confirm;
  // no Jugxo created here.
  meter: "Messwert",
  // Spec 011 ④ (plan ④ D-14): a table's caption names what stands in the rows (Regulo
  // table-caption-names-the-content); the set's word is a caption's, like a field's label. For
  // the maintainer to confirm; no Jugxo created here.
  table: "Beschriftung",
  // Spec 011 ④ (plan ④ D-14): a key-value list's label is its accessible name, the record's
  // details (Goal details: Angaben). For the maintainer to confirm; no Jugxo created here.
  list: "Angaben",
  // Spec 011 ⑤: a navigation's label is the name of the landmark (Hauptnavigation), heard, never
  // seen; the set's word is the name of the Ero itself. Proposal for the maintainer to confirm;
  // no Jugxo created here.
  navigation: "Navigation",
  // Spec 011 ⑤: a tab list's label is the name of the group, never shown; the set's word is the
  // name of the Ero itself. Proposal for the maintainer to confirm; no Jugxo created here.
  tablist: "Reiter",
  // Spec 014 ③ (plan ③ D-05): a heading names its section, running text names itself. Proposal
  // for the maintainer to confirm; no Jugxo created here.
  heading: "Überschrift",
  paragraph: "Text",
  // Spec 020 ③ (plan ③ D-27): a code block shows code, a Markdown view running text. Proposals
  // for the maintainer to confirm; no Jugxo created here. Nachlese 8 ② (F-12): the code block's
  // label writes its code — the Vitrino's command.
  figure: VITRINO_SHORT_COMMAND,
  document: "Text",
  // Spec 014 ④ (plan ④ D-06): a tooltip is a short hint; the label of a menu names its trigger,
  // which offers more actions (the Modelo's own words, a11y.texts label-empty). Proposals.
  tooltip: "Kurzhinweis",
  menu: "Weitere Aktionen",
  // Spec 015 ③ (plan ③ D-05): a card's label property writes its heading, which names the thing
  // the card is about; the role word of the Vitrino's heading. Proposal for the maintainer to
  // confirm; no Jugxo created here.
  article: "Überschrift",
};

/**
 * The word of a structure where two Eroj share one role (Spec 011 ③, plan ③ D-14): the notice and
 * the loading or empty state are both a status, and a state's text says which of the two the
 * area is in — before the role's word. For the maintainer to confirm; no Jugxo created here.
 */
const STRUCTURE_LABEL_DEFAULTS: Readonly<Partial<Record<FigmaStructure, string>>> = {
  state: "Zustand",
  // Spec 014 ⑤ (plan ⑤ D-04): a disclosure's label property writes its summary; the Vitrino's
  // word, one source for both pictures. Proposal for the maintainer to confirm.
  disclosure: VITRINO_SUMMARY_TEXT,
  // Spec 014 ④ (plan ④ D-06): a popover shares the dialog's role; its label property writes its
  // heading, so the word is the heading's. Proposal for the maintainer to confirm.
  popover: "Überschrift",
  // Spec 015 ② (plan ② D-06): an upload's label names what is asked for, like a field's.
  upload: "Beschriftung",
  // Spec 025 ① (plan ① D-04): a slider's label names the value it sets, like a field's.
  slider: "Beschriftung",
  // Spec 015 ③ (plan ③ D-11): an avatar's label property writes its initials, the Vitrino's
  // (the icon shares the role img and carries no label). Proposal for the maintainer to confirm;
  // no Jugxo created here.
  avatar: VITRINO_AVATAR.initials,
};

/** The word a role without its own entry shows: the button's, as every set did before M-3. */
const LABEL_DEFAULT = "Aktion";

export const labelDefaultOf = (role: string, structure?: FigmaStructure): string =>
  (structure === undefined ? undefined : STRUCTURE_LABEL_DEFAULTS[structure]) ??
  LABEL_DEFAULTS[role] ??
  LABEL_DEFAULT;

/**
 * The part the label property writes (F11): the part named like the default text slot of the
 * Skemo — the label of a control or a field, the heading of a dialog (Spec 011 ②), the message of
 * a notice and the text of a state (Spec 011 ③) — or, where the slot has no part of its name, the
 * part `text` (the badge: its slot is `label`, its part `text`), else `label`. Its typography
 * decides the font the texts are written in and the case; its colour is drawn, whatever release
 * the part's name has elsewhere (the typed text of a field, B-2).
 */
export function labelPartOf(skemo: LoadedEro["skemo"]): string {
  const slot = skemo.slots.find(
    (candidate) => candidate.default === true && candidate.text === true,
  );
  if (slot !== undefined && skemo.parts[slot.name] !== undefined) return slot.name;
  if (skemo.parts.label === undefined && skemo.parts.text !== undefined) return "text";
  // Spec 014 ④ (plan ④ D-06): a popover's label property writes its heading (the part of its
  // heading slot); a menu's the word of its entries (the part item), whose role the rows take.
  if (skemo.parts.label === undefined && skemo.parts.heading !== undefined) return "heading";
  if (skemo.parts.label === undefined && skemo.parts.item !== undefined) return "item";
  // Spec 014 ⑤: a disclosure's label property writes its summary.
  if (skemo.parts.label === undefined && skemo.parts.summary !== undefined) return "summary";
  // Spec 015 ③ (plan ③ D-11): an avatar's label property writes its initials.
  if (skemo.parts.label === undefined && skemo.parts.initials !== undefined) return "initials";
  return "label";
}

/**
 * The section every component set of the library lies in (F-2, Nachlese Spec 008/009): one mode
 * set on the section switches the brand of the whole library, while the sets stay on
 * „Automatisch" (F35).
 */
export const FIGMA_SECTION = "Fundamento";

/**
 * The distance between two sets in the section and the section's padding (F-1, F-2). The
 * Vortaro's spacing.xlarge is the gap between the sections of one whole — a set is such a section
 * of the library; spacing.xxlarge is reserved for the sections of a page, which the Figma page
 * itself is. Resolved in the base combination, like the cell padding of the Vitrino.
 */
const SET_GAP = "spacing.xlarge";

/**
 * The frame in the section every set is a child of (F-8, gemessen 2026-10-14 in f10b-5): after
 * the run with seven sets, elektilo lay on ligilo — F-7's gap of half the left neighbour's width
 * came from the widths of the default mode, and the widths change per brand mode (Archivo Black is
 * wider). The frame has auto-layout (horizontal, wrapping, spacing.xlarge both ways, hugging), so
 * Figma places the sets from their sizes in the mode on screen; the plugin computes no place
 * (Regel 0: das Werkzeug kann es).
 */
export const FIGMA_SET_FRAME = "Eroj";

/**
 * The typography a label that inherits from its text (binding keyword `inherit`, Spec 008 E6,
 * plan D-11) shows in Figma: a component set has no container to inherit from, so the running
 * text's role stands in for it, bound like any role, and switches with the mode.
 */
export const INHERIT_TYPOGRAPHY = "typography.body.1";

/**
 * The colour a part that inherits from its text (binding keyword `inherit`, Spec 014 ②, plan ②
 * D-08: the glyph of a neutral icon) shows in Figma: a set has no text around it to inherit from,
 * so the default text colour stands in for it, bound like any role — an instance in a surface
 * takes the colour the designer gives it, as the web takes the text's.
 */
export const INHERIT_COLOR = "color.text.default";

/**
 * The icon every button carries in the set (Spec 014 ②, plan ② D-08): the Vitrino's example in
 * its icon-start slot (one source for both pictures, F-5).
 */
export const ICON_EXAMPLE = VITRINO_ICON_EXAMPLE;

export interface FigmaComponentSet {
  set: string;
  /** How the plugin draws the variants (Spec 009, D-09); a plan without it is a control. */
  structure?: FigmaStructure;
  /** A code block's words (Nachlese 8 ② F-12): its caption, its code, the copy button. */
  codeblock?: { caption: string; code: string; copy: string };
  /** A Markdown view's example (Nachlese 8 ② F-12): a paragraph, a list and a quote. */
  markdown?: { paragraph: string; items: string[]; quote: string };
  /** The role its example texts are bound to (the running text's, like a separator's examples). */
  markdownTexts?: {
    bindings: Record<string, string>;
    paints: Record<string, FigmaPaint>;
    font?: { family: string; style: string; families?: string[] };
  };
  /**
   * The default text of every text node of a field besides the label (F-4); of a toggle, of its
   * error (Spec 010 ②, D-09: the word the kampo's field shows).
   */
  texts?: Record<string, string>;
  /**
   * The sign the indicator of a toggle shows (Spec 010 ②, D-09): the check mark of a checkbox,
   * the SVG the web draws, in a box of 16. The plugin imports it once (createNodeFromSvg) and binds
   * the size of its frame and the colour of its vector; a knob has no sign.
   */
  sign?: string;
  /**
   * The axes of the variants that are no axes of the Skemo's parts (Spec 014 ②, plan ② D-08): the
   * name of an icon — one variant per name of the Ikonaro, drawn in its own column, while the
   * Skemo keys no part by it. The parity inventory leaves them out of the variant key.
   */
  extraAxes?: string[];
  /**
   * A separator (Spec 014 ②, plan ② D-06): the length of the horizontal line in the set, px of
   * size.container.small in the base combination — written, not bound; the line's width and
   * colour are bound, the vertical line's height too.
   */
  separator?: { length: number };
  /**
   * The options a choice shows in every variant (Spec 010 ③, D-07): the entry key of its slot
   * (selected), the words of the options — the Vitrino's — and which of them is chosen. The plugin
   * draws one row per word and binds each with the entry of the variant for its value of the key.
   * Spec 011 ⑤: the items of a navigation (current) and the tabs of a tab list (active) the same
   * way — the Vitrino's words, the first the current or active one.
   */
  /**
   * The entries of a set (E7): their words, the chosen one, and (Nachlese 4 N-8) the active one
   * where the entry has a second state — the variant's entries are then keyed `<key>,<active>`.
   */
  entry?: {
    key: string;
    texts: string[];
    selected: number;
    active?: number;
    activeKey?: string;
  };
  /**
   * A menu (Spec 014 ④, plan ④ D-06): the word of its trigger stand-in and its entries — the
   * Vitrino's three, one disabled, one danger — drawn as rows (entry carries the same words).
   */
  menu?: { trigger: string; items: { text: string; disabled?: boolean; danger?: boolean }[] };
  /**
   * The example frame beside the set of a dialog (Spec 011 ②): the named variant drawn once more
   * on a frame whose fill is bound to the backdrop, at the padding of the section's gap, placed
   * in the frame „Eroj" right after the set (F-8). The backdrop is drawn here only — the
   * variants are the surface — and this is where the plan's `backdrop.color` is applied.
   */
  /**
   * The examples beside a pagination's set (Spec 015 ①, O-2, the spec's „Seite 1, 5 und 10 von
   * 10"): the default variant drawn once more per example with the pages the web shows for that
   * page — the first, the last, the current one and its siblings, „…" for every gap — the current
   * one by its index among them.
   */
  examples?: {
    name: string;
    variant: Record<string, string>;
    padding: number;
    /** The pages of a pagination's example. */
    pages?: { texts: string[]; selected: number };
    /**
     * The chosen files an upload's example lists (Spec 015 ②, the spec's „mit zwei Dateien"):
     * the Vitrino's two files, each with its size in the person's units, a remove butono beside.
     */
    files?: { name: string; size: string }[];
    /**
     * The values of the set's toggles the example shows (Spec 015 ③, plan ③ D-05): `media`
     * false, the card „ohne Bild"; `image` true, the avatar „mit Bild" (plan ③ D-11) — written
     * as the visibility of the part, a frame outside the set has no property to switch.
     */
    toggled?: Record<string, boolean>;
    /**
     * The two texts a separator's example shows around its line (Nachlese 4 N-6), bound to the
     * role of running text as a label is: the plan's bindings, paints and font for them.
     */
    texts?: {
      words: [string, string];
      bindings: Record<string, string>;
      paints: Record<string, FigmaPaint>;
      font?: { family: string; style: string; families: string[] };
    };
  }[];
  example?: {
    name: string;
    variant: Record<string, string>;
    /** The backdrop of a dialog's example; a meter's example (Spec 011 ④) stands on the page. */
    backdrop?: { binding: string; paint: FigmaPaint };
    padding: number;
    /**
     * The words the example shows instead of the set's (Spec 011 ④): the value text of the
     * unknown value. Where the example has them, it is the unknown value: the track carries the
     * stroke of the part unknown with the plan's dash pattern and holds no fill frame.
     */
    texts?: Record<string, string>;
    /**
     * The values of props that key no part the example shows (Spec 011 ⑤: orientation vertical
     * of a navigation): written as the direction of the list, no variant and nothing bound.
     */
    props?: Record<string, string>;
  };
  /**
   * Stand-ins that look like a composed Ero (Abnahme Spec 011 ②, F-5), per node of the set: the
   * confirming action of a dialog is a butono of emphasis high (O-8), which the dialogo Skemo
   * gives no roles of its own. The plan reads the roles from the composed Ero's Skemo for the
   * named props — the butono's surface fill, label colour and box radius at rest — as bindings
   * the plugin applies to the stand-in like a control's, with the paints' deckkraft (F8). Not a
   * part of the set's Skemo, so not in its parity inventory.
   */
  composed?: Record<
    string,
    {
      ero: string;
      props: Record<string, string>;
      bindings: Record<string, string>;
      paints?: Record<string, FigmaPaint>;
    }
  >;
  /**
   * The boolean props that show or hide a part (Spec 011 ③, plan ③ D-14: dismissible shows the
   * dismiss frame of a notice): each a BOOLEAN property of the set, declared like the label, with
   * the part's visibility connected to it and the Skemo's default; an instance switches it. A
   * boolean that keys a part is an axis instead (Spec 010 ①) and stands in no list here. A prop
   * that `hides` (Spec 011 ④: caption-hidden) takes the part away where it is true; Figma shows a
   * layer when its property is true, so the plugin declares the inverse — the part's name as the
   * property, shown by default where the prop's default is false.
   */
  toggles?: {
    property: string;
    part: string;
    defaultValue: boolean;
    hides?: boolean;
    /** The name of the property that shows a part a prop hides, where the part's name is taken. */
    shownAs?: string;
  }[];
  /**
   * The share of the track the fill of a meter takes (Spec 011 ④, plan ④ D-14): the Vitrino's
   * value example in the Skemo's range, written as the fill's width from the measured track.
   */
  meter?: { share: number };
  /**
   * A slider (Spec 025 ①, plan ① D-04): the fill's share of the track for one thumb, and the
   * shares the two thumbs of a range stand at — the Vitrino's values over the Skemo's limits.
   */
  slider?: { share: number; start: number; end: number };
  /**
   * A date picker (Spec 025 ②, plan ② D-12): the Vitrino's month as the calendar shows it — the
   * weekday names, six weeks of days (outside the month marked), today, the chosen day and the
   * ends of the range; the plugin draws every cell from it.
   */
  calendar?: VitrinoCalendar;
  /**
   * The table of the set (Spec 011 ④, plan ④ D-14): the head words, the rows (row header first),
   * the numeric columns, the sorted column and the direction of its sort button — the Vitrino's
   * table, one source for both pictures.
   */
  table?: {
    head: string[];
    rows: string[][];
    numeric: number[];
    sorted: number;
    direction: string;
  };
  /** The entries of a key-value list (Spec 011 ④): the Vitrino's pairs, an empty value the dash. */
  entries?: { term: string; value: string }[];
  /**
   * A card (Spec 015 ③, plan ③ D-05): the width of its surface, px of size.container.small in
   * the base combination, written; the media's extent along the card's flow (its height where
   * vertical, its width where horizontal), written from CARD_MEDIA_SHARE of that width; the
   * stand-in image's fill and the colour of its word, each a variable with its paint (F8).
   */
  /**
   * An avatar (Spec 015 ③, plan ③ D-11): the silhouette its image shows (avatarSilhouetteOf, an
   * SVG in a box of 16, imported once), the image's ground and the silhouette's colour, each a
   * variable with its paint (F8) — a stand-in for the picture, no part of the Skemo.
   */
  avatar?: {
    picture: string;
    fill: { binding: string; paint: FigmaPaint };
    color: { binding: string; paint: FigmaPaint };
    /**
     * The smallest size shows one initial (Nachlese 5 N5-5, Spec 015 ③ O-18): the variants whose
     * `prop` has `value` (the first of the size axis) write `text`, the first initial of the
     * Vitrino's, unconnected to the label property — a text property holds one value for the
     * whole set, and two initials stood over the circle of 20 px.
     */
    oneInitial?: { prop: string; value: string; text: string };
  };
  card?: {
    width: number;
    media: {
      extent: number;
      fill: { binding: string; paint: FigmaPaint };
      color: { binding: string; paint: FigmaPaint };
    };
  };
  /** The purpose of the Uzo, one line, as the description of the set (Spec 007 T028, A12). */
  description?: string;
  /**
   * What the set should carry beyond the purpose (Spec 007 T029, A12, D-10, OP-9): boundaries,
   * slot rules and text rules, as Markdown for the field the plugin tries. Whether Figma takes it
   * is measured by the run (Art. VI); a part the tool refuses is reported as an open Manko.
   */
  uzo?: { field: "descriptionMarkdown"; parts: UzoPart[]; markdown: string };
  /**
   * The properties of the set, as Figma names them: an enum prop its values (a VARIANT axis
   * where it keys a part), a boolean BOOLEAN, a string TEXT. A number prop (Spec 011 ②: the
   * rows of a text area) is NUMBER — Figma's component properties know no number, an instance
   * would write it as text; the plan states the Skemo's kind so parity compares kinds, and the
   * plugin declares none of these properties (only the label, F11).
   */
  properties: Record<string, string[] | "BOOLEAN" | "TEXT" | "NUMBER">;
  variants: {
    props: Record<string, string>;
    /**
     * The icons the variant composes (Spec 014 ②, G3, plan ② D-08), by the part that holds each:
     * the icon-start of a butono (the Vitrino's example), the chevron of a select, the sort arrow
     * of a table, the status icon of a notice (its intent). Drawn from the glyphs of the plan.
     */
    icons?: Record<string, string>;
    bindings: Record<string, string>;
    /** Per colour binding the plugin draws, the paint it applies. */
    paints?: Record<string, FigmaPaint>;
    /** Per measure the plugin draws, its value in the base combination: `40px` (F11). */
    geometry?: Record<string, string>;
    /** Parts this Celo does not draw, with the Jugxo that releases each (named difference). */
    notDrawn?: Record<string, string>;
    /**
     * The writing case of the label's typography role, as Figma names it (F31), or
     * `TEXT_CASE_VARIES` where the modes disagree — `textCase` is written, not bound, so one value
     * has to stand for every mode, and choosing one brand would be no projection.
     */
    textCase?: string;
    /** Whether this variant shows the focus ring (F11); the space for it is always reserved. */
    focusVisible?: boolean;
    /**
     * The variables holding the corner radii of the ring and its gap: the control's radius grown
     * by what lies inside. Written as a number, the ring kept the base combination's radius in
     * every mode and enclosed a square button with a round ring (F32).
     */
    radii?: { "focus-ring": string; "focus-gap": string };
    /**
     * The font of the label, from its typography token: family and the style of its weight, and
     * every family of the token's stack a run may try (W3, F-2) — the generic CSS names left out,
     * `family` the first of them. The run loads the first that the file has.
     */
    font?: { family: string; style: string; families: string[] };
    /**
     * Whether the label is underlined in this variant (Spec 008, D-11): the part `underline`
     * bound to a width, not to `none`. Written as the text decoration, not bound (B-1).
     */
    underline?: boolean;
    /**
     * Where the knob of a switch stands in this variant (Spec 010 ①, D-04): the term of
     * `indicator.position`, start or end. A term binds no variable; the plugin writes it as the
     * alignment of the track, as the underline is written.
     */
    position?: "start" | "end";
    /**
     * The parts not drawn in this variant (Spec 010 ②, D-09): a colour bound to the keyword
     * none — the check mark of an unticked box. The plugin gives the part opacity 0; its place
     * stays, as on the web. A height bound to none (Spec 011 ②: the reason field of a dialog
     * without a reason) hides the part with its place: the plugin sets it invisible. So does a
     * part whose slot the Skemo's constraints forbid in this variant (Spec 011 ③: the actions of
     * a state while loading) — for a slot of elements; a text slot keeps its word in every
     * variant (F-4).
     */
    hidden?: string[];
    /**
     * The line style of a part's stroke (Spec 011 ③, plan ③ D-14): the term of the stroke.* token
     * the part binds — solid or dashed — or none, where the binding is the keyword. The variable
     * stands in the bindings; the style is written, since Figma binds no dash pattern: the
     * pattern in px of the base combination for dashed (`DASH_IN_WIDTHS` of the stroke's width),
     * empty otherwise. For none the plugin keeps the bound paint and shows it not.
     */
    stroke?: { part: string; style: string; dashPattern: number[] };
    /**
     * The shadow of a part (Spec 011 ②: elevation.shadow.modal of the dialog's surface), a
     * composite the plan holds field by field (F9): per layer the variables of its five fields
     * and their values in the base combination. The plugin binds them to a DROP_SHADOW effect
     * where the API binds effects (setBoundVariableForEffect), and writes the resolved layer
     * where it does not — and says which (Vojmapo: the shadow variables bound to no effect).
     */
    shadow?: {
      part: string;
      variable: string;
      layers: {
        fields: Record<"color" | "offsetX" | "offsetY" | "blur" | "spread", string>;
        /** The colour's deckkraft decided over every mode, like a paint's (F8). */
        color: FigmaPaint;
        /** The alpha of the base combination: what a written, unbound layer shows. */
        alpha: number;
        offsetX: number;
        offsetY: number;
        blur: number;
        spread: number;
      }[];
    };
    /**
     * What follows the state of one option (Spec 010 ③, E7), per value of the entry key: the
     * bindings, paints and measures of the parts keyed by selected, and the parts not drawn in it
     * (the dot of an option not chosen). The plugin binds a row with the entry of its value.
     */
    entries?: Record<
      string,
      {
        bindings: Record<string, string>;
        paints?: Record<string, FigmaPaint>;
        geometry?: Record<string, string>;
        hidden?: string[];
        /**
         * The font of the entry's text where a weight keyed by the entry departs from its role
         * (Spec 014 ①, plan ① D-01: the current item of a navigation in the semibold cut): the
         * role's family, the cut of the bound font.weight.* token. Absent, the variant's font.
         */
        font?: { family: string; style: string; families: string[] };
      }
    >;
    /**
     * What follows the second state of an entry (Nachlese 4 N-8: active, the suggestion the
     * keyboard stands on), per its value, like `entries`; the plugin binds a row with both.
     */
    activeEntries?: Record<
      string,
      {
        bindings: Record<string, string>;
        paints?: Record<string, FigmaPaint>;
        geometry?: Record<string, string>;
        hidden?: string[];
        font?: { family: string; style: string; families: string[] };
      }
    >;
    /**
     * The cell of the variant in the grid, as the Vitrino orders it: the row is its combination of
     * the keyed props (emphasis × intent × size) in the order of the plan, the column its state.
     * Figma does not distribute appended children itself (F14, measured): every variant is placed.
     */
    cell?: { row: number; column: number };
  }[];
  pluginData: { fundamento: { ero: string; skemo: string; version: string } };
  /**
   * The grid the variants stand in, as the Vitrino shows them: one row per combination of the
   * keyed props, one column per state. Gap and padding are the Vitrino's: every table cell has
   * the padding spacing.small, so two cells put 2 × spacing.small between two buttons (F11).
   */
  grid?: { rows: number; columns: number; gap: number; padding: number };
  /**
   * The label as a text property of the component (Maintainer, 2026-09-21): one neutral word as
   * its default — Figma keeps one default per property, not one per variant, so the Vitrino's text
   * per combination cannot be the default of 72 templates. Every instance may override it.
   */
  label?: { property: string; defaultValue: string };
  /**
   * Every font the set can need, over **all** combinations, with the Aspektoj that ask for it
   * (F30). A binding to a font variable only holds once every value the variable takes is loaded,
   * so the run loads this list before it binds — the base combination's font alone is not enough.
   */
  fonts?: { family: string; style: string; families: string[]; aspektoj: string[] }[];
  /**
   * The ground the set stands on: the Vitrino's surface, as a variable, so it follows color-scheme
   * and contrast (F16). The deckkraft is decided over every combination, like every paint (F8).
   */
  surface?: { variable: string; opacity: number };
}

/** The parts of a Uzo the plugin tries to carry beyond the purpose (T029). */
export type UzoPart = "boundary" | "slots" | "content";

/** The field the plugin tries for the Uzo beyond the purpose: Figma's Markdown description. */
export const UZO_FIELD = "descriptionMarkdown" as const;

/**
 * The purpose, then the boundaries, slot rules and text rules of a Uzo as Markdown (T029): the
 * words of the rules, not their enforcement — a description tells a designer, it does not stop
 * an instance. The purpose is the first line (Befund B1, measured 2026-10-12 in f10b-5):
 * `descriptionMarkdown` and `description` are one field in Figma, so what T029 writes is what
 * the set shows, and the purpose of T028 would otherwise be gone.
 */
export function uzoMarkdown(uzo: Uzo, reguloj: readonly Regulo[]): string {
  const statement = (name: string) => reguloj.find((regulo) => regulo.name === name)?.statement;
  const notFor = [
    ...uzo.boundary.map(
      (boundary) => `- **${boundary.case}** (${boundary.action}): ${boundary.kialo}`,
    ),
    ...uzo.instead.map(
      (alternative) =>
        `- **${alternative.goal}** (${alternative.ero === null ? "ask-human" : `use-instead: ${alternative.ero}`}): ${alternative.kialo}`,
    ),
  ];
  const slots = Object.entries(uzo.slots).map(
    ([slot, rule]) =>
      `- **${slot}**: ${(rule.accepts ?? []).join(", ") || "anything"}${rule.max === undefined ? "" : `, at most ${rule.max}`}${rule.nesting === undefined ? "" : `, nesting ${rule.nesting}`}`,
  );
  const content = uzo.content.map(
    (rule) =>
      `- **${rule.regulo}** (${rule.fixed ? "fixed" : "adjustable"}): ${statement(rule.regulo) ?? ""}`,
  );
  return [
    uzo.purpose.replace(/\s*\n\s*/g, " ").trim(),
    "",
    "## Not for this",
    ...notFor,
    "",
    "## Slots",
    ...slots,
    "",
    "## Text",
    ...content,
    "",
  ].join("\n");
}

export interface FigmaPlan {
  fundamento: string;
  /**
   * The one font the plugin falls back to when the model's font is not in the file — named, in
   * the same style, and reported as a warning (Maintainer, 2026-09-21).
   */
  fontFallback?: string;
  collections: FigmaCollection[];
  components: FigmaComponentSet[];
  /**
   * The glyphs of the Ikonaro (Spec 014 ②, G3, plan ② D-08): every name of the core, which of them
   * mirror in right-to-left writing, and per Aspekto the SVG the package draws for each name. An
   * icon in the file is one frame per Aspekto imported from its glyph, shown by the BOOLEAN
   * variable `ikonoj/<aspekto>` of the collection aspekto — so the brand mode switches the picture.
   */
  ikonoj?: { names: string[]; mirror: string[]; glyphs: Record<string, Record<string, string>> };
  /**
   * Where the sets lie (F-1, F-2, F-8): in the frame `frame` with auto-layout (horizontal,
   * wrapping, `gap` between the sets and between the rows, hugging both ways, no fill), at the
   * padding of the section of this name on the current page. Figma places the sets; the plugin
   * computes no x or y of a set. Gap and padding are px of spacing.xlarge, resolved in the base
   * combination.
   */
  section?: { name: string; gap: number; padding: number; frame: string };
  /**
   * The example frames of the Sxablonoj (Spec 020, G2, E3): no component set, no variants — a frame
   * per Sxablono in the frame `FIGMA_SXABLONO_FRAME` of the section, a frame per region (its
   * direction) holding instances of the Ero sets (the variant whose props match, with its label)
   * or a word. Outside `components`: the frames are an example and count for no parity.
   */
  sxablonoj?: FigmaSxablono[];
}

/** An example frame of a Sxablono in the plan (Spec 020, G2; Nachlese 8 ② F-9 to F-11). */
export interface FigmaSxablono {
  name: string;
  description: string;
  /** How the regions stand, as on the web: rows and columns of named frames, regions as leaves. */
  layout: FigmaSxablonoBox;
  regions: {
    name: string;
    direction: "HORIZONTAL" | "VERTICAL";
    items: FigmaSxablonoItem[];
  }[];
}

/** A row or a column of an example frame: a frame of its name holding boxes and regions. */
export interface FigmaSxablonoBox {
  name: string;
  direction: "HORIZONTAL" | "VERTICAL";
  children: (string | FigmaSxablonoBox)[];
}

/**
 * What stands in a region: an instance of a set (the variant whose props match, its label the
 * text, its BOOLEAN properties the toggles) or a word.
 */
export interface FigmaSxablonoItem {
  set?: string;
  props?: Record<string, string>;
  text?: string;
  toggles?: Record<string, boolean>;
}

/** The frame of the Sxablonoj in the section, beside the frame of the sets (Spec 020, E3). */
export const FIGMA_SXABLONO_FRAME = "Sxablonoj";

/**
 * The examples of the regions (Nachlese 8 ② F-10, F-11): what the Vitrino's example of each
 * Sxablono holds there, in its words — a test reads every word in the Vitrino's section. A region
 * the Vitrino leaves empty (the problems of the form) is not drawn either. The menu is closed.
 */
const SXABLONO_EXAMPLES: Readonly<Record<string, readonly FigmaSxablonoItem[]>> = {
  "sxelo/brand": [{ text: "Fundamento" }],
  "sxelo/principal": [{ text: "Erika Mustermann" }],
  "sxelo/nav": [{ set: "navigado" }],
  "sxelo/notices": [{ set: "avizo", props: { intent: "success" }, text: "Gespeichert." }],
  "sxelo/main": [
    { set: "titolo", props: { level: "1" }, text: "Standards" },
    { set: "teksto", text: "Alle Standards des Projekts." },
  ],
  "pagxo/title": [{ set: "titolo", props: { level: "1" }, text: "Standards" }],
  "pagxo/badges": [
    { set: "insigno", props: { intent: "success" }, text: "Gültig" },
    { set: "insigno", text: "Pflicht" },
  ],
  "pagxo/subtitle": [{ set: "teksto", text: "Alle Standards des Projekts." }],
  "pagxo/actions": [
    { set: "butono", props: { emphasis: "high" }, text: "Bearbeiten" },
    { set: "menuo", text: "Weitere Aktionen", toggles: { open: false } },
  ],
  "pagxo/sections": [
    { set: "titolo", props: { level: "2" }, text: "Geltung" },
    { set: "teksto", text: "Gilt in allen Projekten." },
  ],
  "formularo/fields": [{ set: "kampo", props: { kind: "password" }, text: "Token" }],
  "formularo/actions": [
    { set: "butono", props: { emphasis: "high", type: "submit" }, text: "Anmelden" },
  ],
  "filtrilo/fields": [
    { set: "elektilo", text: "Status" },
    { set: "kampo", props: { kind: "search" }, text: "Suche" },
  ],
  "filtrilo/actions": [{ set: "butono", props: { emphasis: "low" }, text: "Filter zurücksetzen" }],
  "filtrilo/status": [{ text: "3 von 7 Standards" }],
  "redaktilo/field": [{ set: "tekstareo", props: { kind: "code" }, text: "Quelltext" }],
  "redaktilo/preview": [{ set: "markdovido" }],
};

/** The regions that stand in a row on the web (sxablono-template): the rest are columns. */
function rowRegionsOf(entry: LoadedSxablono): readonly string[] {
  return [
    "header",
    "head",
    "heading",
    "badges",
    "actions",
    "principal",
    ...(entry.skemo.a11y.landmarks.includes("search") ? ["fields", "footer"] : []),
  ];
}

/**
 * The layout of an example frame (Nachlese 8 ② F-9), by the rules of the web's markup
 * (sxablonoMarkup): the frame of an application has its head row of the regions before the
 * navigation; a page its head — the title with its badges and the subtitle beside the actions —
 * over the sections; a filter bar its fields over the footer of actions and count; an editor its
 * field beside its preview; any other Sxablono its regions in a column. Only regions with an
 * example stand in it.
 */
function sxablonoLayoutOf(
  entry: LoadedSxablono,
  shown: (name: string) => boolean,
): FigmaSxablonoBox {
  const { regions, a11y } = entry.skemo;
  const names = regions.map((region) => region.name).filter(shown);
  const box = (
    name: string,
    direction: FigmaSxablonoBox["direction"],
    children: (string | FigmaSxablonoBox)[],
  ): FigmaSxablonoBox => ({ name, direction, children });
  if (a11y.landmarks.includes("banner") && a11y.landmarks.includes("main")) {
    const all = regions.map((region) => region.name);
    const navAt = all.indexOf("nav");
    const head = all.slice(0, navAt === -1 ? 2 : navAt).filter(shown);
    return box("frame", "VERTICAL", [
      box("header", "HORIZONTAL", head),
      ...names.filter((name) => !head.includes(name)),
    ]);
  }
  if (a11y.focus !== undefined && names.includes("actions")) {
    const lead = names.filter((name) => name === a11y.focus || name === "badges");
    const below: string[] = names.filter((name) => name === "subtitle");
    const after = names.filter(
      (name) => !lead.includes(name) && !below.includes(name) && name !== "actions",
    );
    return box("frame", "VERTICAL", [
      box("head", "HORIZONTAL", [
        box("lead", "VERTICAL", [box("heading", "HORIZONTAL", lead), ...below]),
        "actions",
      ]),
      ...after,
    ]);
  }
  if (a11y.landmarks.includes("search")) {
    const footer: string[] = names.filter((name) => name === "status" || name === "actions");
    return box("frame", "VERTICAL", [
      ...names.filter((name) => !footer.includes(name)),
      box("footer", "HORIZONTAL", footer),
    ]);
  }
  if (regions.some((region) => region.accepts?.includes("markdovido") === true)) {
    return box("frame", "HORIZONTAL", names);
  }
  return box("frame", "VERTICAL", names);
}

/**
 * The example frame of a Sxablono (Spec 020, G2, E3; Nachlese 8 ② F-9 to F-11): the layout of
 * the web, the regions as named frames with the Vitrino's example in them — instances of the Ero
 * sets with their words, or a word — and never the name of a region as a visible word.
 */
function sxablonoFrameOf(entry: LoadedSxablono, sets: ReadonlySet<string>): FigmaSxablono {
  const itemsOf = (region: string): FigmaSxablonoItem[] =>
    (SXABLONO_EXAMPLES[`${entry.sxablono.name}/${region}`] ?? [])
      .filter((item) => item.set === undefined || sets.has(item.set))
      .map((item) => structuredClone(item) as FigmaSxablonoItem);
  const rows = rowRegionsOf(entry);
  return {
    name: entry.sxablono.name,
    description: entry.uzo?.purpose ?? entry.sxablono.description,
    layout: sxablonoLayoutOf(entry, (name) => itemsOf(name).length > 0),
    regions: entry.skemo.regions.map((region) => ({
      name: region.name,
      direction: rows.includes(region.name) ? "HORIZONTAL" : "VERTICAL",
      items: itemsOf(region.name),
    })),
  };
}

/** The single-mode collection of everything no Dimensio changes, and its mode. */
const BASE_COLLECTION = "fundamento";
const BASE_MODE = "value";

/** Composite fields Figma gets as separate variables (Figma variables hold no composites). */
const COMPOSITE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  // `fontStyle` is no field of the DTCG type: Figma binds a text to a family and a *cut* ("Medium"),
  // where the Vortaro states a weight (500). It is derived from `fontWeight` and follows it through
  // the same cascade, so a brand that changes its weight changes its cut in the same mode (F30).
  typography: ["fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "lineHeight"],
  border: ["color", "width", "style"],
  shadow: ["color", "offsetX", "offsetY", "blur", "spread"],
};

/**
 * The fields one composite token needs, given every value it has across the Modelo (F9). A shadow
 * of several layers numbers them — `elevation/shadow/floating/2/blur` — because Figma holds no
 * list in a variable. The layer count is taken over **all** combinations: where one Aspekto has
 * two layers and another one, the variables exist for two, and the mode that has fewer says so
 * with a transparent colour and zero measures (see `layerValue`).
 */
export function compositeFields(type: string, values: readonly unknown[]): readonly string[] {
  const fields = COMPOSITE_FIELDS[type] ?? [];
  if (type !== "shadow") return fields;
  const layers = Math.max(1, ...values.map((value) => (Array.isArray(value) ? value.length : 1)));
  if (layers === 1) return fields;
  return Array.from({ length: layers }, (_, index) =>
    fields.map((field) => `${index + 1}/${field}`),
  ).flat();
}

/** The last segment of a field path: `2/offsetX` is an `offsetX`. */
const fieldKind = (field: string) => field.slice(field.lastIndexOf("/") + 1);

/**
 * The value of one field of a composite, following a layer number when there is one. A layer the
 * value does not have renders nothing, so its colour is fully transparent and its measures are 0
 * — that is what "this mode has fewer layers" means in a file whose variables are fixed (F9).
 */
function fieldValue(value: unknown, field: string): unknown {
  const kind = fieldKind(field);
  // The cut is no field of the value: it is read from the weight beside it (F30).
  const property = kind === "fontStyle" ? "fontWeight" : kind;
  // A value that is no list is the first (and only) layer: one Aspekto may have one shadow layer
  // where another has two.
  const layers = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const layer = field === kind ? value : layers[Number(field.slice(0, field.indexOf("/"))) - 1];
  if (layer === undefined) {
    return kind === "color"
      ? { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 }
      : { value: 0, unit: "px" };
  }
  return (layer as Record<string, unknown>)[property];
}

const ALIAS = /^\{([a-z0-9]+(?:\.[a-z0-9]+)*)\}$/;

const variableName = (token: string, field?: string) =>
  `${nomRegulo("figma").derive(token)}${field === undefined ? "" : `/${kebab(field)}`}`;

const kebab = (field: string) => field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function figmaColor(value: unknown): FigmaColor {
  const color = value as { components?: number[]; alpha?: number };
  const [r = 0, g = 0, b = 0] = color.components ?? [];
  return { r, g, b, a: color.alpha ?? 1 };
}

/** The Figma value of a token value of `type`, or an alias when the token aliases another. */
export function figmaValue(type: string, value: unknown, field?: string): FigmaValue {
  // The derived cut reads the weight and keeps its alias, pointed at the twin variable (F30); the
  // generic alias branch below would point it at the weight itself.
  if (type === "fontStyle") return styleValue(value);
  if (typeof value === "string") {
    const alias = ALIAS.exec(value);
    if (alias?.[1] !== undefined) return { alias: variableName(alias[1], field) };
  }
  switch (type) {
    case "color":
      return figmaColor(value);
    case "dimension":
    case "duration":
      return typeof value === "object" && value !== null ? (value as { value: number }).value : 0;
    case "number":
    case "fontWeight":
      return typeof value === "number" ? value : Number(value);
    case "fontFamily":
      // The first family of the stack; the others (system-ui, sans-serif) are the browser's
      // fallbacks and name no font Figma could pick. A binding needs a family that exists (F30).
      return String((Array.isArray(value) ? value[0] : value) ?? "");
    case "cubicBezier":
      return Array.isArray(value) ? `cubic-bezier(${value.join(", ")})` : String(value);
    default:
      if (typeof value === "number") return value;
      // The guard (F9): a composite that reached this point would arrive in Figma as
      // "[object Object]" — a value that looks like a value and is none. Whoever adds a token type
      // decides here: decompose it into fields (COMPOSITE_FIELDS) or leave it out with a kialo.
      if (typeof value === "object" && value !== null) {
        throw new Error(
          `The Figma Celo has no variable for a ${type} value: Figma variables hold COLOR, FLOAT, ` +
            "STRING and BOOLEAN, never a composite. Decompose the type into fields in " +
            "COMPOSITE_FIELDS, or leave it out of the plan with a kialo.",
        );
      }
      return String(value);
  }
}

/** Figma names a cut where the Vortaro names a weight; the rounding is Figma's own (F30). */
export function styleOfWeight(weight: number): string {
  return FONT_STYLES[Math.round(weight / 100) * 100] ?? "Regular";
}

/** The prefixes the derived style variables are twinned from (F30). */
const WEIGHT_PREFIX = "font/weight/";
const STYLE_PREFIX = "font/style/";

/**
 * The value of the derived `fontStyle` field of a typography role: the cut of the weight the role
 * names. A role names its weight with an alias, and the cut keeps that alias — pointed at the twin
 * variable — so Figma resolves the cut with the same mode as the weight (F30).
 */
function styleValue(weight: unknown): FigmaValue {
  if (typeof weight === "string") {
    const target = ALIAS.exec(weight)?.[1];
    if (target !== undefined) {
      const name = variableName(target);
      if (!name.startsWith(WEIGHT_PREFIX)) {
        throw new Error(
          `The Figma Celo derives the font style of a typography role from its fontWeight, and ` +
            `${target} is no font.weight.* token. Point the role's fontWeight at a font.weight.* ` +
            "token, or give the Celo a rule for deriving a cut from this token.",
        );
      }
      return { alias: `${STYLE_PREFIX}${name.slice(WEIGHT_PREFIX.length)}` };
    }
  }
  const number = typeof weight === "number" ? weight : Number(weight);
  return Number.isFinite(number) ? styleOfWeight(number) : "Regular";
}

/**
 * The name of the STRING twin of a weight variable: `font/style/semibold` of `font/weight/semibold`;
 * of an Ero-Token's weight (Constitution v2.3, `ero/navigado/items/weight/current/true`) the same
 * name with `style` for `weight`, the hidden helpers of the cascade alike. The plugin names the
 * twin by the same rule when it binds a weight (F30).
 */
export function styleTwinName(name: string): string {
  if (name.startsWith(WEIGHT_PREFIX)) return `${STYLE_PREFIX}${name.slice(WEIGHT_PREFIX.length)}`;
  return name.replace(/\/weight(?=\/|@|$)/, "/style");
}

/** The STRING twin of a weight variable: the same modes, the same cascade, cuts instead of numbers. */
function styleTwin(variable: FigmaVariable): FigmaVariable {
  const values: Record<string, FigmaValue> = {};
  for (const [mode, value] of Object.entries(variable.values)) {
    values[mode] =
      typeof value === "object" && value !== null && "alias" in value
        ? { alias: styleTwinName(value.alias) }
        : styleOfWeight(Number(value));
  }
  return {
    name: styleTwinName(variable.name),
    type: "STRING",
    hidden: variable.hidden ?? false,
    values,
  };
}

/** Figma variable type of a token type (and field). */
export function figmaType(type: string, field?: string): FigmaVariable["type"] {
  const effective = field === undefined ? type : (FIELD_TYPES[fieldKind(field)] ?? "dimension");
  switch (effective) {
    case "color":
      return "COLOR";
    case "dimension":
    case "duration":
    case "number":
    case "fontWeight":
      return "FLOAT";
    default:
      return "STRING";
  }
}

const FIELD_TYPES: Readonly<Record<string, string>> = {
  fontFamily: "fontFamily",
  fontStyle: "fontStyle",
  fontSize: "dimension",
  fontWeight: "fontWeight",
  letterSpacing: "dimension",
  lineHeight: "number",
  color: "color",
  width: "dimension",
  style: "strokeStyle",
};

/**
 * Every Figma variable of one token with its value: one, or one per field for composites. `fields`
 * is the field list the whole plan uses for this token; without it the fields are read from this
 * one value, which is right for a single combination and wrong for a shadow whose layer count
 * follows a Dimensio (F9).
 */
export function figmaValues(
  name: string,
  type: string,
  value: unknown,
  fields?: readonly string[],
): Record<string, FigmaValue> {
  if (COMPOSITE_FIELDS[type] === undefined) {
    return { [variableName(name)]: figmaValue(type, value) };
  }
  const alias = typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;
  const out: Record<string, FigmaValue> = {};
  for (const field of fields ?? compositeFields(type, [value])) {
    const property = variableName(name, field);
    out[property] =
      alias !== undefined
        ? { alias: variableName(alias, field) }
        : figmaValue(FIELD_TYPES[fieldKind(field)] ?? "dimension", fieldValue(value, field));
  }
  return out;
}

/** Dimensioj in priority order (ascending), as the collections follow them. */
function dimensiojOf(modelo: Modelo): { name: string; modes: string[]; defaultMode: string }[] {
  return modelo.dimensioj.map((dimensio) => {
    const names = (dimensio.valoroj ?? []).map((valoro) => valoro.name);
    // The Modelo's default first, the others in the order of the Modelo (F19).
    return {
      name: dimensio.name,
      modes: [dimensio.default, ...names.filter((name) => name !== dimensio.default)],
      defaultMode: dimensio.default,
    };
  });
}

/**
 * The Dimensioj whose sets define `token`, in priority order (ascending). A token of the core is
 * one every Aspekto sets (FR-10, Spec 001 D-04: every brand but the reference overrides every core
 * token, the reference's values live in core): it lives in the collection aspekto whatever brands
 * the build has (Nachlese 8 ②), so a build of komuna alone and a build with the test brands
 * place it alike, and the guard of the plugin never sees it move.
 */
function dimensiojOfToken(modelo: Modelo, token: string): string[] {
  const names = new Set<string>();
  for (const set of modelo.setoj) {
    if (set.tokens[token] === undefined) continue;
    if (set.name === CORE_SET_NAME) names.add(ASPEKTO_DIMENSIO);
    for (const kondicxo of set.kondicxoj) names.add(kondicxo.dimensio);
  }
  return modelo.dimensioj.map((dimensio) => dimensio.name).filter((name) => names.has(name));
}

/** The token's definition in the combination of `assignment` (the last winning set). */
function definitionOf(modelo: Modelo, token: string, assignment: Record<string, string>): unknown {
  let value: unknown;
  for (const set of orderedSets(modelo)) {
    const active = set.kondicxoj.every(
      (kondicxo) => assignment[kondicxo.dimensio] === kondicxo.valoro,
    );
    if (active && set.tokens[token] !== undefined) value = set.tokens[token]?.value;
  }
  return value;
}

const orderedCache: WeakMap<Modelo, Modelo["setoj"]> = new WeakMap();
function orderedSets(modelo: Modelo): Modelo["setoj"] {
  const cached = orderedCache.get(modelo);
  if (cached !== undefined) return cached;
  const priority = (name: string) =>
    modelo.dimensioj.find((dimensio) => dimensio.name === name)?.priority ?? 0;
  const sorted = [...modelo.setoj].sort((a, b) => {
    const key = (set: Modelo["setoj"][number]) => [
      Math.max(0, ...set.kondicxoj.map((kondicxo) => priority(kondicxo.dimensio))),
      set.kondicxoj.length,
      set.name,
    ];
    const [ap, ac, an] = key(a);
    const [bp, bc, bn] = key(b);
    if (ap !== bp) return (ap as number) - (bp as number);
    if (ac !== bc) return (ac as number) - (bc as number);
    return (an as string) < (bn as string) ? -1 : 1;
  });
  orderedCache.set(modelo, sorted);
  return sorted;
}

/** Every value a token has across the Modelo, for deciding the fields of a composite (F9). */
function valuesOf(resolutions: ReturnType<typeof allResolutions>, token: string): unknown[] {
  return resolutions.map(({ tokens }) => tokens[token]?.value);
}

/** The name of the variable a derived radius gets, and how it is computed from the parts (F32). */
const DERIVED_RADII = [
  {
    name: "radius/focus/gap",
    of: (px: (part: string, field?: string) => number) =>
      px("box.radius") + px("focus-ring.offset"),
  },
  {
    name: "radius/focus/ring",
    of: (px: (part: string, field?: string) => number) =>
      px("box.radius") + px("focus-ring.offset") + px("focus-ring.ring", "width"),
  },
] as const;

/** The parts a derived radius is computed from, as `<part>.<property>` of the Skemo. */
const RADIUS_PARTS = ["box.radius", "focus-ring.offset", "focus-ring.ring"] as const;

/**
 * The part the focus ring encloses (F32): the box, or — where the Skemo has no box with a radius
 * — the part whose fill the state keys (Spec 011 ④, plan ④ D-14: the sort button of a table; the
 * states are the button's, E3), so the ring grows from that part's radius.
 */
function ringedPartOf(skemo: LoadedEro["skemo"]): string {
  if (skemo.parts.box?.radius !== undefined) return "box";
  const keyed = Object.entries(skemo.parts).find(
    ([, properties]) =>
      properties.radius !== undefined &&
      properties.fill !== undefined &&
      "by" in properties.fill &&
      properties.fill.by.includes(STATE_KEY),
  );
  return keyed?.[0] ?? "box";
}

/** The px of a resolved dimension, optionally inside a field of a composite. */
function measureOf(value: unknown, field?: string): number {
  const measure =
    field === undefined ? value : (value as Record<string, unknown> | undefined)?.[field];
  return typeof (measure as { value?: unknown } | undefined)?.value === "number"
    ? (measure as { value: number }).value
    : 0;
}

/**
 * The tokens an Ero binds to the parts a derived radius reads. Every variant must agree: the ring
 * is one geometry, and a set whose variants disagreed would need one variable per variant.
 */
function radiusTokensOf(entry: LoadedEro): Record<string, string> | undefined {
  const keys = variantKeys(entry.skemo);
  let tokens: Record<string, string> | undefined;
  const ringed = ringedPartOf(entry.skemo);
  for (const combination of combinationsOf(entry.skemo, keys)) {
    const here: Record<string, string> = {};
    for (const part of RADIUS_PARTS) {
      const [name, property] = part.split(".");
      // The ring encloses the part that takes the state (Spec 011 ④: the sort button of a table,
      // whose radius is the one to grow); elsewhere the box, as before.
      const of = name === "box" ? ringed : (name ?? "");
      const bound = boundToken(entry.skemo, of, property ?? "", combination);
      if (bound !== undefined) here[part] = bound.token;
    }
    if (Object.keys(here).length !== RADIUS_PARTS.length) return undefined;
    if (tokens === undefined) tokens = here;
    else if (JSON.stringify(tokens) !== JSON.stringify(here)) {
      throw new Error(
        `The Ero ${entry.ero.name} binds different tokens to ${RADIUS_PARTS.join(", ")} in ` +
          "different variants; the Figma Celo derives one focus radius per set. Give the parts one " +
          "token each, or derive the radius per variant.",
      );
    }
  }
  return tokens;
}

/**
 * The radii of the focus ring and its gap, as variables (F32). A ring around a rounded rectangle
 * has the radius of what it encloses plus the distance to it — geometry, not a decision, and
 * therefore computed here instead of asked of every brand. Figma binds values, not expressions, so
 * the sum is a variable of its own; it cascades like a token, so it follows the mode. Where it
 * lives is decided by the Dimensioj along which the sum really changes: the width of the ring
 * moves with `contrast` in one Aspekto and not in another, and only a comparison over every
 * combination sees that.
 */
function derivedRadiusVariables(
  modelo: Modelo,
  resolutions: ReturnType<typeof allResolutions>,
): Map<string, FigmaVariable[]> {
  const out = new Map<string, FigmaVariable[]>();
  // The first Ero that binds the three parts (Spec 008: the ligilo has no radius and no say here).
  let tokens: Record<string, string> | undefined;
  for (const entry of modelo.eroj) {
    tokens = radiusTokensOf(entry);
    if (tokens !== undefined) break;
  }
  if (tokens === undefined) return out;
  const dimensioj = dimensiojOf(modelo);
  const defaults: Record<string, string> = {};
  for (const dimensio of dimensioj) defaults[dimensio.name] = dimensio.defaultMode;
  const key = (assignment: Record<string, string>) =>
    dimensioj.map((dimensio) => assignment[dimensio.name] ?? "").join("\u0000");
  const byAssignment = new Map(resolutions.map((entry) => [key(entry.assignment), entry.tokens]));
  const valueAt = (
    assignment: Record<string, string>,
    of: (typeof DERIVED_RADII)[number]["of"],
  ) => {
    const found = byAssignment.get(key({ ...defaults, ...assignment }));
    return of((part, field) => measureOf(found?.[tokens[part] ?? ""]?.value, field));
  };

  for (const derived of DERIVED_RADII) {
    // Every Dimensio along which two combinations that differ in it alone give different sums.
    const dims = dimensioj
      .filter((dimensio) =>
        resolutions.some((one) =>
          dimensio.modes.some(
            (mode) =>
              mode !== one.assignment[dimensio.name] &&
              derived.of((part, field) =>
                measureOf(
                  byAssignment.get(key({ ...one.assignment, [dimensio.name]: mode }))?.[
                    tokens[part] ?? ""
                  ]?.value,
                  field,
                ),
              ) !==
                derived.of((part, field) =>
                  measureOf(one.tokens[tokens[part] ?? ""]?.value, field),
                ),
          ),
        ),
      )
      .map((dimensio) => dimensio.name);
    // Nachlese 8 ②: the sum of core tokens is a brand's like its parts (FR-10), whatever brands
    // the build compares — so a build of komuna alone places it in aspekto too.
    if (!dims.includes(ASPEKTO_DIMENSIO) && dimensioj.some((one) => one.name === ASPEKTO_DIMENSIO))
      dims.unshift(ASPEKTO_DIMENSIO);
    dims.sort(
      (a, b) =>
        dimensioj.findIndex((one) => one.name === a) - dimensioj.findIndex((one) => one.name === b),
    );
    const add = (collection: string, variable: FigmaVariable) => {
      out.set(collection, [...(out.get(collection) ?? []), variable]);
    };
    if (dims.length === 0) {
      add(BASE_COLLECTION, {
        name: derived.name,
        type: "FLOAT",
        hidden: false,
        values: { [BASE_MODE]: valueAt({}, derived.of) },
      });
      continue;
    }
    const build = (level: number, suffix: string, chosen: Record<string, string>): void => {
      const dimensio = dims[level] ?? "";
      const variable: FigmaVariable = {
        name: `${derived.name}${suffix}`,
        type: "FLOAT",
        hidden: suffix !== "",
        values: {},
      };
      for (const mode of dimensioj.find((one) => one.name === dimensio)?.modes ?? []) {
        const assignment = { ...chosen, [dimensio]: mode };
        if (level === 0) variable.values[mode] = valueAt(assignment, derived.of);
        else {
          variable.values[mode] = { alias: `${derived.name}${suffix}@${dimensio}=${mode}` };
          build(level - 1, `${suffix}@${dimensio}=${mode}`, assignment);
        }
      }
      add(dimensio, variable);
    };
    build(dims.length - 1, "", {});
  }
  return out;
}

/** Builds the variables of every token, including the hidden helpers of the cascade. */
function variablesOf(modelo: Modelo, input: CeloInput): Map<string, FigmaVariable[]> {
  const byCollection = new Map<string, FigmaVariable[]>();
  const add = (collection: string, variable: FigmaVariable) => {
    byCollection.set(collection, [...(byCollection.get(collection) ?? []), variable]);
  };
  const dimensioj = dimensiojOf(modelo);
  const modesOf = (name: string) => dimensioj.find((d) => d.name === name)?.modes ?? [];
  // How many layers a shadow has may itself depend on a Dimensio, `aspekto` included, so the
  // fields of a composite are decided over every combination the Modelo has (F9).
  const resolutions = allResolutions(modelo);
  // The weight tokens whose variables get a STRING twin (F30): font.weight.* and every Ero-Token
  // of a weight (Constitution v2.3), with the hidden helpers of their cascade.
  const weights = new Set<string>();

  for (const token of input.modeloJson.tokens) {
    const dims = dimensiojOfToken(modelo, token.name);
    if (token.type === "fontWeight") weights.add(variableName(token.name));
    const composite = COMPOSITE_FIELDS[token.type] !== undefined;
    const names: (string | undefined)[] = composite
      ? [...compositeFields(token.type, valuesOf(resolutions, token.name))]
      : [undefined];
    for (const field of names) {
      const name = variableName(token.name, field);
      const type = figmaType(token.type, field);
      // Depth 0: no Dimensio changes it, so one value in the base collection.
      if (dims.length === 0) {
        const value = definitionOf(modelo, token.name, {});
        add(BASE_COLLECTION, {
          name,
          type,
          hidden: false,
          values: { [BASE_MODE]: modeValue(token.type, value, field) },
        });
        continue;
      }
      // Depth n: the variable lives in the highest Dimensio, each mode aliasing the level below.
      const build = (level: number, suffix: string, chosen: Record<string, string>): void => {
        const dimensio = dims[level] ?? "";
        const variable: FigmaVariable = {
          name: `${name}${suffix}`,
          type,
          hidden: suffix !== "",
          values: {},
        };
        for (const mode of modesOf(dimensio)) {
          const assignment = { ...chosen, [dimensio]: mode };
          if (level === 0) {
            variable.values[mode] = modeValue(
              token.type,
              definitionOf(modelo, token.name, assignment),
              field,
            );
          } else {
            variable.values[mode] = { alias: `${name}${suffix}@${dimensio}=${mode}` };
            build(level - 1, `${suffix}@${dimensio}=${mode}`, assignment);
          }
        }
        add(dimensio, variable);
      };
      build(dims.length - 1, "", {});
    }
  }
  // Figma binds a text to a family and a cut, the Vortaro states a weight: every weight variable
  // gets a STRING twin in its own collection, with its modes and its place in the cascade (F30).
  const isWeight = (name: string) => weights.has(name.split("@")[0] ?? name);
  for (const [collection, list] of byCollection) {
    const twins = list.filter((variable) => isWeight(variable.name)).map(styleTwin);
    if (twins.length > 0) byCollection.set(collection, [...list, ...twins]);
  }
  return byCollection;
}

function modeValue(type: string, value: unknown, field?: string): FigmaValue {
  if (COMPOSITE_FIELDS[type] === undefined || field === undefined) {
    return figmaValue(type, value, field);
  }
  const alias = typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;
  if (alias !== undefined) return { alias: variableName(alias, field) };
  return figmaValue(FIELD_TYPES[fieldKind(field)] ?? "dimension", fieldValue(value, field));
}

/** The six-digit hex of a colour, whatever its alpha: the paint's colour channel. */
function hexOf(color: Parameters<typeof alphaOf>[0]): string {
  return parityColorText({ ...color, alpha: 1 });
}

/**
 * The paint of one token, decided over every combination the Modelo has — `aspekto` included, so
 * a second brand cannot inherit the first one's decision (F8). Returns `undefined` for a token
 * that is no colour anywhere.
 */
function paintOf(
  token: string,
  resolutions: ReturnType<typeof allResolutions>,
  base: Readonly<Record<string, { value: unknown }>>,
  field?: string,
): FigmaPaint | undefined {
  // A composite (the focus ring's border) carries its colour in a field.
  const colorOf = (value: unknown) =>
    field === undefined ? value : (value as Record<string, unknown> | undefined)?.[field];
  const alphas = new Set<number>();
  for (const { tokens } of resolutions) {
    const color = readDtcgColor(colorOf(tokens[token]?.value));
    if (color !== undefined) alphas.add(alphaOf(color));
  }
  // The colour follows the bound variable and therefore the mode; the hex here is the one of the
  // base combination, the state a side can compare. Only the deckkraft is static (F8).
  const baseColor = readDtcgColor(colorOf(base[token]?.value));
  const hex = baseColor === undefined ? undefined : hexOf(baseColor);
  if (hex === undefined) return undefined;
  const [only] = [...alphas];
  return alphas.size === 1 && only !== undefined
    ? { hex, opacity: only }
    : { hex, alphaVariesByMode: true };
}

/**
 * The length of the horizontal line of a separator in the set (Spec 014 ②, plan ② D-06): the
 * smallest container a divider spans, px of the base combination — written, not bound.
 */
const SEPARATOR_LENGTH = "size.container.small";

/**
 * The icons a variant composes (Spec 014 ②, G3, G6, plan ② D-08), by the part that holds each:
 * a button with a decorative icon-start slot and the part icon shows the Vitrino's example; a
 * select its chevron-down in the indicator; a table its sort-ascending in the sort indicator; a
 * notice with the part icon the icon of its intent (the names of the Ikonaro are the intents).
 */
function iconsOf(
  skemo: LoadedEro["skemo"],
  structure: FigmaStructure,
  combination: Readonly<Record<string, string>>,
): Record<string, string> | undefined {
  if (
    structure === "control" &&
    skemo.a11y.role === "button" &&
    skemo.parts.icon !== undefined &&
    skemo.slots.some((slot) => slot.name === "icon-start" && slot.decorative === true)
  ) {
    return { "icon-start": ICON_EXAMPLE };
  }
  // Nachlese 5 O-41 (Nachlese 4 N-7, B-8): a link with a decorative icon-end slot and the prop
  // external marks an external target with the Ikonaro's external there, as the web's fallback
  // of that slot; the property external shows it (BOOLEAN_TOGGLES).
  if (
    structure === "control" &&
    skemo.a11y.role === "link" &&
    skemo.parts.icon !== undefined &&
    skemo.props.some((prop) => prop.name === "external" && prop.kind === "boolean") &&
    skemo.slots.some((slot) => slot.name === "icon-end" && slot.decorative === true)
  ) {
    return { "icon-end": "external" };
  }
  if (skemo.a11y.role === "combobox" && skemo.parts.indicator !== undefined) {
    return { indicator: "chevron-down" };
  }
  // Nachlese 4 N-7 (Spec 014 ② O-7): the check mark of a checkbox is the Ikonaro's check.
  if (
    structure === "toggle" &&
    skemo.a11y.role === "checkbox" &&
    skemo.parts.indicator !== undefined
  ) {
    return { indicator: "check" };
  }
  if (structure === "table" && skemo.parts["sort-indicator"] !== undefined) {
    return { "sort-indicator": "sort-ascending" };
  }
  if (structure === "notice" && skemo.parts.icon !== undefined) {
    const intent = combination.intent;
    return intent === undefined ? undefined : { icon: intent };
  }
  // An upload (Spec 015 ②): the composed button's icon upload; every remove the icon close.
  if (structure === "upload") return { "icon-start": "upload", remove: "close" };
  // A pagination (Spec 015 ①): the arrows back and forth; a breadcrumb: the chevron between two.
  if (structure === "pagination") return { prev: "chevron-left", next: "chevron-right" };
  // A date picker (Spec 025 ②): the calendar on the trigger, the chevrons on prev and next.
  if (structure === "field" && skemo.parts.calendar !== undefined) {
    return { trigger: "calendar", prev: "chevron-left", next: "chevron-right" };
  }
  if (structure === "breadcrumb") return { separator: "chevron-right" };
  // A disclosure (Spec 014 ⑤): the chevron points down where open, right where closed.
  if (structure === "disclosure" && skemo.parts.indicator !== undefined) {
    return { indicator: combination.open === "true" ? "chevron-down" : "chevron-right" };
  }
  return undefined;
}

/** The component set of one Ero: every variant with its variable bindings (D-12). */
function componentSetOf(
  entry: LoadedEro,
  version: string,
  resolutions: ReturnType<typeof allResolutions>,
  base: Readonly<Record<string, { value: unknown }>>,
  reguloj: readonly Regulo[],
  eroj: readonly LoadedEro[] = [],
): FigmaComponentSet {
  const skemo = entry.skemo;
  const description = entry.uzo?.purpose.replace(/\s*\n\s*/g, " ").trim();
  const uzo =
    entry.uzo === undefined
      ? undefined
      : {
          field: UZO_FIELD,
          parts: ["boundary", "slots", "content"] as UzoPart[],
          markdown: uzoMarkdown(entry.uzo, reguloj),
        };
  const properties: FigmaComponentSet["properties"] = {};
  for (const prop of skemo.props) {
    if (prop.kind === "enum") properties[prop.name] = [...(prop.values ?? [])];
    else if (prop.kind === "boolean") properties[prop.name] = "BOOLEAN";
    else if (prop.kind === "number") properties[prop.name] = "NUMBER";
    else properties[prop.name] = "TEXT";
  }
  properties.state = [...skemo.states];
  // Variants exist for what changes the appearance: the props the parts are keyed by, and state.
  // `type`, for example, is behaviour in a form and would only multiply the set. A keyed boolean
  // prop is an axis too (Spec 010 ①, D-03: checked of the switch).
  const structure = structureOf(skemo.a11y.role, Object.keys(skemo.parts));
  // An icon (Spec 014 ②): one variant per name of the Ikonaro besides the axes of its parts — the
  // name keys no part, the glyph does; the Figma side is told so (extraAxes).
  // A tooltip (Spec 014 ④): one variant per placement — the side keys no part, the layer takes
  // it on the page; the set shows each side beside a stand-in of the trigger.
  // A card (Spec 015 ③, plan ③ D-05): one variant per orientation — it keys no part, the layout
  // of surface and media does; the set shows the media above and beside the body.
  // A slider (Spec 025 ①, plan ① D-04): one variant per range — it keys no part, the second thumb
  // does; the set shows one thumb and two.
  const extraAxes =
    structure === "icon"
      ? ["name"]
      : structure === "tooltip"
        ? ["placement"]
        : structure === "card"
          ? ["orientation"]
          : structure === "slider"
            ? ["range"]
            : // A date picker (Spec 025 ②, plan ② D-12): one variant per mode — it keys no part,
              // the chosen days do; the set shows one day and a range.
              structure === "field" && skemo.parts.calendar !== undefined
              ? ["mode"]
              : [];
  const keys = [...extraAxes, ...variantKeys(skemo)];
  // What the plugin draws for this structure (Spec 011 ③): the bindings every structure shares and
  // the ones this structure binds elsewhere — the text's colour on the label of a badge. What the
  // structure binds on a node of its own (Spec 011 ⑤: the underline of a navigation's item as its
  // block-end stroke) is drawn whatever release the part's name has in FIGMA_NOT_DRAWN.
  const drawn = new Set(drawnPartPropertiesOf(structure));
  const ownBindings = new Set(structureBoundPartPropertiesOf(structure));
  // The focus radii only for an Ero that has a radius to grow (F32); the ligilo has none.
  const radiiOf =
    radiusTokensOf(entry) === undefined
      ? undefined
      : { "focus-gap": "radius/focus/gap", "focus-ring": "radius/focus/ring" };
  // The part the label property writes: the label, the heading of a dialog (Spec 011 ②), the
  // message of a notice or the text of a badge or a state (Spec 011 ③), whose role decides the
  // font the texts are written in and the case.
  const labelPart = labelPartOf(skemo);
  const typographyToken = (combination: Readonly<Record<string, string>>): string | undefined => {
    const bound = boundToken(skemo, labelPart, "typography", combination);
    if (bound === undefined) return undefined;
    return bound.token === "inherit" ? INHERIT_TYPOGRAPHY : bound.token;
  };
  // The font of a text part whose weight departs from its role (Spec 014 ①, plan ① D-01): the
  // family of the role, the cut of the bound font.weight.* token in these tokens — per Aspekto, as
  // every font (F30). A weight bound to none, or no weight, leaves the role's font: undefined.
  const weightedFontOf = (
    part: string,
    combination: Readonly<Record<string, string>>,
    tokens: Readonly<Record<string, { value?: unknown } | undefined>>,
  ): { family: string; style: string; families: string[] } | undefined => {
    if (skemo.parts[part]?.weight === undefined) return undefined;
    const weight = boundToken(skemo, part, "weight", combination);
    if (weight === undefined || isBindingKeyword(weight.token)) return undefined;
    const role = boundToken(skemo, part, "typography", combination);
    if (role === undefined) return undefined;
    const typography = role.token === "inherit" ? INHERIT_TYPOGRAPHY : role.token;
    const font = fontOf(tokens[typography]?.value);
    const value = Number(tokens[weight.token]?.value);
    if (font === undefined || !Number.isFinite(value)) return undefined;
    return { ...font, style: styleOfWeight(value) };
  };
  // The shadow of a part, field by field (Spec 011 ②, F9): the layers are counted over every
  // combination, like the variables, so the field names are the plan's; the values are the base
  // combination's, the deckkraft of the colour decided over every mode (F8).
  const shadowOf = (
    combination: Readonly<Record<string, string>>,
  ): FigmaComponentSet["variants"][number]["shadow"] => {
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      if (partProperties.shadow === undefined) continue;
      const bound = boundToken(skemo, part, "shadow", combination);
      if (bound === undefined || isBindingKeyword(bound.token)) continue;
      // The shadow binds its Ero-Token (Constitution v2.3); its layers are the role's.
      const token = eroTokenOf(entry, part, "shadow", combination) ?? bound.token;
      const fields = compositeFields("shadow", valuesOf(resolutions, token));
      const prefixes = [...new Set(fields.map((field) => field.slice(0, field.indexOf("/") + 1)))];
      const layers = prefixes.map((prefix) => {
        const field = (kind: string) => `${prefix}${kind}`;
        const alphas = new Set<number>();
        for (const { tokens } of resolutions) {
          const color = readDtcgColor(fieldValue(tokens[token]?.value, field("color")));
          if (color !== undefined) alphas.add(alphaOf(color));
        }
        const baseColor = readDtcgColor(fieldValue(base[token]?.value, field("color")));
        const hex = baseColor === undefined ? "#000000" : hexOf(baseColor);
        const alpha = baseColor === undefined ? 0 : alphaOf(baseColor);
        const [only] = [...alphas];
        const color: FigmaPaint =
          alphas.size === 1 && only !== undefined
            ? { hex, opacity: only }
            : { hex, alphaVariesByMode: true };
        const px = (kind: string) => measureOf(fieldValue(base[token]?.value, field(kind)));
        return {
          fields: {
            color: variableName(token, field("color")),
            offsetX: variableName(token, field("offsetX")),
            offsetY: variableName(token, field("offsetY")),
            blur: variableName(token, field("blur")),
            spread: variableName(token, field("spread")),
          },
          color,
          alpha,
          offsetX: px("offsetX"),
          offsetY: px("offsetY"),
          blur: px("blur"),
          spread: px("spread"),
        };
      });
      return { part, variable: variableName(token), layers };
    }
    return undefined;
  };
  // The stroke of a part as a term (Spec 011 ③): the value of the stroke.* token in the base
  // combination (solid, dashed) or none; the dash pattern from the part's width there.
  const strokeOf = (
    combination: Readonly<Record<string, string>>,
  ): FigmaComponentSet["variants"][number]["stroke"] => {
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      if (partProperties.stroke === undefined) continue;
      const bound = boundToken(skemo, part, "stroke", combination);
      if (bound === undefined) continue;
      const style = isBindingKeyword(bound.token)
        ? "none"
        : String(base[bound.token]?.value ?? "solid");
      const width = boundToken(skemo, part, "width", combination);
      const px = width === undefined ? 0 : measureOf(base[width.token]?.value);
      const dash = DASH_IN_WIDTHS * px;
      return { part, style, dashPattern: style === "dashed" && dash > 0 ? [dash, dash] : [] };
    }
    return undefined;
  };
  // The parts whose slot the constraints forbid in a combination (Spec 011 ③): a constraint
  // `slot:<name>: filled ⇒ <prop>: [values]` whose values do not include the combination's hides
  // the part of the slot's name — for a slot of elements (the actions of a state while loading);
  // a text slot keeps its word in every variant (F-4: the error of a field stands in every state).
  const forbiddenPartsOf = (combination: Readonly<Record<string, string>>): string[] =>
    (skemo.constraints ?? []).flatMap((constraint) => {
      const slots = Object.entries(constraint.when)
        .filter(([key, value]) => key.startsWith("slot:") && value === "filled")
        .map(([key]) => key.slice("slot:".length))
        .filter((slot) => {
          const declared = skemo.slots.find((candidate) => candidate.name === slot);
          return (
            declared !== undefined && declared.text !== true && skemo.parts[slot] !== undefined
          );
        });
      if (slots.length === 0) return [];
      const allowed = Object.entries(constraint.allowed).every(([prop, values]) => {
        const value = combination[prop];
        return value === undefined || values.includes(value);
      });
      return allowed ? [] : slots;
    });
  // The keys of one entry (Spec 010 ③, E7: selected) are no axis: the parts they key are bound
  // per value of the key, in the entries of each variant.
  const entryKeys = [
    ...new Set(
      Object.values(skemo.parts).flatMap((properties) =>
        Object.values(properties).flatMap((source) =>
          source !== undefined && "by" in source
            ? source.by.filter((key) => isEntryKey(skemo, key))
            : [],
        ),
      ),
    ),
  ];
  const keyedByEntry = (part: string, property: string): boolean =>
    entryKeys.some((key) => keyedByEntryKey(part, property, key));
  function keyedByEntryKey(part: string, property: string, key: string): boolean {
    const own = skemo.parts[part]?.[property as keyof (typeof skemo.parts)[string]];
    // A property that is the same as another (Spec 015 ①: the underline of a breadcrumb's item in
    // the item's colour) follows that one's keys.
    const [otherPart = "", otherProperty = ""] =
      own !== undefined && "sameAs" in own ? own.sameAs.split(".") : [];
    const source =
      own !== undefined && "sameAs" in own
        ? skemo.parts[otherPart]?.[otherProperty as keyof (typeof skemo.parts)[string]]
        : own;
    return source !== undefined && "by" in source && source.by.includes(key);
  }
  const bindParts = (
    combination: Readonly<Record<string, string>>,
    which: (part: string, property: string) => boolean,
    sink: {
      bindings: Record<string, string>;
      paints: Record<string, FigmaPaint>;
      geometry: Record<string, string>;
      notDrawn: Record<string, string>;
      hidden: string[];
    },
  ) => {
    const { bindings, paints, geometry, notDrawn, hidden } = sink;
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      for (const property of Object.keys(partProperties)) {
        if (!which(part, property)) continue;
        const bound = boundToken(skemo, part, property, combination);
        if (bound === undefined) continue;
        const key = `${part}.${property}`;
        // A position is a term (Spec 010 ①, D-04): written per variant below, never bound.
        if (isPositionKeyword(bound.token)) continue;
        // A keyword binds no variable (D-03): inherit takes the running text's role (D-11), none
        // leaves the field empty — nothing to bind, nothing to draw, nothing in the inventory.
        if (isBindingKeyword(bound.token)) {
          if (bound.token === "inherit" && property === "typography") {
            bindings[key] = variableName(INHERIT_TYPOGRAPHY);
          }
          // A colour that inherits (Spec 014 ②): the default text colour stands in, bound like
          // the inherited role (INHERIT_TYPOGRAPHY); no paint is claimed — the Skemo states none,
          // the web takes the text's colour around the icon.
          if (bound.token === "inherit" && property === "color" && drawn.has(key)) {
            bindings[key] = variableName(INHERIT_COLOR);
          }
          // A colour that is none is a part not drawn in this variant (Spec 010 ②, D-09); a
          // height that is none (Spec 011 ②: the reason field of a dialog without a reason) too.
          if (
            bound.token === "none" &&
            (property === "color" || property === "fill" || property === "height")
          ) {
            hidden.push(part);
          }
          continue;
        }
        // The part binds its Ero-Token (Constitution v2.3): the cell of the third level a brand
        // sets in its mode; where none exists, the role token itself.
        bindings[key] = variableName(eroTokenOf(entry, part, property, combination) ?? bound.token);
        const type = PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES];
        if (type !== "color" && type !== "dimension") continue;
        // What the plugin does not draw is named with its Jugxo, never claimed (Paket „Figma
        // zeigt das Ero"). What it does not draw and no Jugxo releases is simply absent, and
        // check:parity says so. The part the label property writes is drawn whatever its name
        // (Spec 011 ③: the text of a badge or a state is its label, not the typed text B-2
        // releases).
        const release =
          part === labelPart || ownBindings.has(key) ? undefined : FIGMA_NOT_DRAWN[part];
        if (release !== undefined) {
          notDrawn[key] = release;
          continue;
        }
        if (!drawn.has(key)) continue;
        if (type === "color") {
          const paint = paintOf(bound.token, resolutions, base);
          if (paint !== undefined) paints[key] = paint;
        } else {
          const text = parityDimensionText(base[bound.token]?.value);
          if (text !== undefined) geometry[key] = text;
        }
      }
    }
  };
  const variants = combinationsOf(skemo, keys).map((combination) => {
    const bindings: Record<string, string> = {};
    const paints: Record<string, FigmaPaint> = {};
    const geometry: Record<string, string> = {};
    const notDrawn: Record<string, string> = {};
    const hidden: string[] = [];
    bindParts(combination, (part, property) => !keyedByEntry(part, property), {
      bindings,
      paints,
      geometry,
      notDrawn,
      hidden,
    });
    // The parts keyed by one entry key, per value of that key. The first key of the entry (E7:
    // selected, current, active of a tab) fills `entries`; a second state of the entry (Nachlese
    // 4 N-8: the active suggestion) fills `activeEntries` — each part named only with the key
    // that keys it, as the Skemo side of the parity names it.
    const entriesOf = (key: string | undefined) => {
      const out: NonNullable<FigmaComponentSet["variants"][number]["entries"]> = {};
      if (key === undefined) return out;
      const which = (part: string, property: string) => keyedByEntryKey(part, property, key);
      for (const value of combinationsOf(skemo, [key])) {
        const sink = {
          bindings: {},
          paints: {},
          geometry: {},
          notDrawn: {},
          hidden: [] as string[],
        };
        bindParts({ ...combination, ...value }, which, sink);
        // A weight keyed by the entry writes the entry's text in its own cut (Spec 014 ①, plan ①
        // D-01): the current item of a navigation, the active tab.
        const entryFont = Object.keys(skemo.parts)
          .filter((part) => which(part, "weight"))
          .map((part) => weightedFontOf(part, { ...combination, ...value }, base))
          .find((font) => font !== undefined);
        out[value[key] ?? ""] = {
          bindings: sink.bindings,
          ...(Object.keys(sink.paints).length === 0 ? {} : { paints: sink.paints }),
          ...(Object.keys(sink.geometry).length === 0 ? {} : { geometry: sink.geometry }),
          ...(sink.hidden.length === 0 ? {} : { hidden: sink.hidden }),
          ...(entryFont === undefined ? {} : { font: entryFont }),
        };
      }
      return out;
    };
    const entries = entriesOf(entryKeys[0]);
    const activeEntries = entriesOf(entryKeys[1]);
    // The focus ring (F11). Its colour sits in a field of a composite token and is compared by
    // no side, so it is kept out of the parity inventory (only colour-typed parts are reported).
    const ring = boundToken(skemo, "focus-ring", "ring", combination);
    if (ring !== undefined) {
      const paint = paintOf(ring.token, resolutions, base, "color");
      if (paint !== undefined) paints["focus-ring.ring"] = paint;
    }
    for (const part of forbiddenPartsOf(combination)) {
      if (!hidden.includes(part)) hidden.push(part);
    }
    const stroke = strokeOf(combination);
    const typography = typographyToken(combination);
    // The label's own weight, where one departs from its role and follows the variant, not an
    // entry (Spec 014 ①, plan ① D-01).
    const font =
      (keyedByEntry(labelPart, "weight")
        ? undefined
        : weightedFontOf(labelPart, combination, base)) ??
      fontOf(typography === undefined ? undefined : base[typography]?.value);
    const underlineWidth =
      skemo.parts.underline?.width === undefined
        ? undefined
        : boundToken(skemo, "underline", "width", combination);
    const position = Object.entries(skemo.parts)
      .map(([part, properties]) =>
        properties.position === undefined
          ? undefined
          : boundToken(skemo, part, "position", combination)?.token,
      )
      .find((token) => token !== undefined && isPositionKeyword(token));
    // Die Schreibweise über alle Kombinationen entschieden, wie die Deckkraft (F8): Zwei Marken
    // dürfen sich unterscheiden, und dann nennt der Plan keinen Wert, sondern den Befund.
    const cases = new Set(
      typography === undefined
        ? []
        : resolutions.map(
            ({ tokens }) =>
              TEXT_CASES[tokens[typography]?.textTransform?.value ?? "none"] ?? "ORIGINAL",
          ),
    );
    const [onlyCase] = [...cases];
    const textCase = cases.size <= 1 ? (onlyCase ?? "ORIGINAL") : TEXT_CASE_VARIES;
    const shadow = shadowOf(combination);
    const icons = iconsOf(skemo, structure, combination);
    return {
      props: { ...combination },
      ...(icons === undefined ? {} : { icons }),
      bindings,
      paints,
      geometry,
      notDrawn,
      textCase,
      focusVisible: combination[STATE_KEY] === FOCUS_STATE,
      ...(radiiOf === undefined ? {} : { radii: radiiOf }),
      ...(font === undefined ? {} : { font }),
      ...(underlineWidth === undefined
        ? {}
        : { underline: !isBindingKeyword(underlineWidth.token) }),
      ...(position === undefined ? {} : { position: position as "start" | "end" }),
      ...(hidden.length === 0 ? {} : { hidden }),
      ...(Object.keys(entries).length === 0 ? {} : { entries }),
      ...(Object.keys(activeEntries).length === 0 ? {} : { activeEntries }),
      ...(shadow === undefined ? {} : { shadow }),
      ...(stroke === undefined ? {} : { stroke }),
    };
  });
  // Every font the label can carry, over every combination (F30). The typography role follows the
  // variant (size), and its family and weight follow the Dimensioj, so the pairs are collected over
  // both — each with the Aspektoj that ask for it, which is what the report names per mode.
  const fontsNeeded = new Map<
    string,
    { family: string; style: string; families: string[]; aspektoj: Set<string> }
  >();
  const need = (
    font: { family: string; style: string; families: string[] } | undefined,
    assignment: Readonly<Record<string, string>>,
  ) => {
    if (font === undefined) return;
    const key = `${font.family}\u0000${font.style}`;
    const seen = fontsNeeded.get(key) ?? { ...font, aspektoj: new Set<string>() };
    const aspekto = assignment[ASPEKTO_DIMENSIO];
    if (aspekto !== undefined) seen.aspektoj.add(aspekto);
    fontsNeeded.set(key, seen);
  };
  // Every part with a typography (Spec 009: a field has label, text, help and error).
  const typographyParts = Object.entries(skemo.parts)
    .filter(([, properties]) => properties.typography !== undefined)
    .map(([part]) => part);
  const weightedParts = Object.entries(skemo.parts)
    .filter(([, properties]) => properties.weight !== undefined)
    .map(([part]) => part);
  const entryValues = entryKeys.length === 0 ? [{}] : combinationsOf(skemo, entryKeys);
  for (const { assignment, tokens } of resolutions) {
    for (const variant of variants) {
      for (const part of typographyParts) {
        const bound = boundToken(skemo, part, "typography", variant.props);
        const typography =
          bound === undefined
            ? undefined
            : bound.token === "inherit"
              ? INHERIT_TYPOGRAPHY
              : bound.token;
        const font = typography === undefined ? undefined : fontOf(tokens[typography]?.value);
        need(font, assignment);
      }
      // A weight that departs from the role asks for the role's family in its own cut, per
      // Aspekto, in every value of the entry it may follow (Spec 014 ①, plan ① D-01).
      for (const part of weightedParts) {
        for (const value of entryValues) {
          need(weightedFontOf(part, { ...variant.props, ...value }, tokens), assignment);
        }
      }
    }
    // The texts of a separator's examples (Nachlese 4 N-6) and of a Markdown view's example
    // (Nachlese 8 ② F-12) in the running text's font.
    if (structure === "separator" || structure === "markdown") {
      need(fontOf(tokens[SEPARATOR_EXAMPLE_TEXT.typography]?.value), assignment);
    }
  }
  const fonts = [...fontsNeeded.values()]
    .map((entry) => ({
      family: entry.family,
      style: entry.style,
      families: entry.families,
      aspektoj: [...entry.aspektoj].sort(),
    }))
    .sort((a, b) => (`${a.family} ${a.style}` < `${b.family} ${b.style}` ? -1 : 1));
  const ground = paintOf(VITRINO_SURFACE, resolutions, base);
  // A ground whose alpha differs per mode has no faithful fill (F8); then the set gets none, and
  // the missing `surface` is what a test and the run see.
  const surface =
    ground !== undefined && "opacity" in ground
      ? { variable: variableName(VITRINO_SURFACE), opacity: ground.opacity }
      : undefined;
  // The grid: a row per combination, a column per state — an icon (Spec 014 ②) a row per
  // combination of its axes and a column per name, as the spec draws it (name × size).
  const names = skemo.props.find((prop) => prop.name === "name")?.values ?? [];
  const columns = structure === "icon" ? names.length : skemo.states.length;
  const rowOf = new Map<string, number>();
  for (const variant of variants) {
    const { [STATE_KEY]: state, name, ...combination } = variant.props;
    const key = JSON.stringify(structure === "icon" ? combination : { ...combination, name });
    if (!rowOf.has(key)) rowOf.set(key, rowOf.size);
    Object.assign(variant, {
      cell: {
        row: rowOf.get(key) ?? 0,
        column:
          structure === "icon" ? names.indexOf(name ?? "") : skemo.states.indexOf(state ?? ""),
      },
    });
  }
  const cell = parityPx(base[VITRINO_CELL_PADDING]?.value);
  // A toggle shows the words of its text slots besides the label, as the field does (Spec 010 ②):
  // the checkbox its error; the switch has none. A dialog (Spec 011 ②) its message, the label
  // of its reason, and the words of its two actions. A notice (Spec 011 ③) its heading and its
  // details; a badge and a state have no text beside the label (the badge's description is hidden).
  // A meter (Spec 011 ④) its value text; a table's empty slot has no word in the Vitrino and its
  // caption is the label; a list's entries are no text slot.
  const toggleTexts = slotWordsOf(skemo);
  const dialogTexts = { ...toggleTexts, ...DIALOG_ACTION_TEXTS };
  // The example frame of a dialog (Spec 011 ②): the default variant — every keyed prop at its
  // default, the first state — on the backdrop, at the padding of the section's gap.
  const defaults = Object.fromEntries(
    keys.map((key) => [
      key,
      key === STATE_KEY
        ? (skemo.states[0] ?? "")
        : String(skemo.props.find((prop) => prop.name === key)?.default ?? ""),
    ]),
  );
  const backdrop = boundToken(skemo, "backdrop", "color", defaults);
  const backdropPaint =
    backdrop === undefined || isBindingKeyword(backdrop.token)
      ? undefined
      : paintOf(backdrop.token, resolutions, base);
  // Spec 015 ① (O-2): the pagination on page 1, 5 and 10 of 10, with the web's own choice of
  // pages (the Skemo's default siblings).
  // Nachlese 4 N-6 (F-7): the separator once per orientation between two words of the Vitrino,
  // the line drawn as in the set, the texts bound to the role of running text.
  const separatorTextPaint = paintOf(SEPARATOR_EXAMPLE_TEXT.color, resolutions, base);
  const separatorTextFont = fontOf(base[SEPARATOR_EXAMPLE_TEXT.typography]?.value);
  const separatorExamples =
    structure === "separator"
      ? (skemo.props.find((prop) => prop.name === "orientation")?.values ?? []).map(
          (orientation) => ({
            name: `${entry.ero.name} – ${SEPARATOR_ORIENTATION_WORDS[orientation] ?? orientation} ${SEPARATOR_EXAMPLE}`,
            variant: { ...defaults, orientation },
            padding: parityPx(base[SET_GAP]?.value),
            texts: {
              words: [VITRINO_OPTIONS[0] ?? "", VITRINO_OPTIONS[1] ?? ""] as [string, string],
              bindings: {
                "label.color": variableName(SEPARATOR_EXAMPLE_TEXT.color),
                "label.typography": variableName(SEPARATOR_EXAMPLE_TEXT.typography),
              },
              paints: separatorTextPaint === undefined ? {} : { "label.color": separatorTextPaint },
              ...(separatorTextFont === undefined ? {} : { font: separatorTextFont }),
            },
          }),
        )
      : undefined;
  const examples =
    separatorExamples !== undefined
      ? separatorExamples
      : structure === "pagination"
        ? [1, 5, 10].map((page) => {
            const texts = paginationWords(
              page,
              PAGINATION_EXAMPLE_TOTAL,
              Number(skemo.props.find((prop) => prop.name === "siblings")?.default ?? 1),
            );
            return {
              name: `${entry.ero.name} – Seite ${page} von ${PAGINATION_EXAMPLE_TOTAL}`,
              variant: defaults,
              padding: parityPx(base[SET_GAP]?.value),
              pages: { texts, selected: texts.indexOf(String(page)) },
            };
          })
        : // Spec 015 ② (plan ② D-06): the upload with the Vitrino's two files beside its set.
          structure === "upload"
          ? [
              {
                name: `${entry.ero.name} – ${UPLOAD_EXAMPLE}`,
                variant: defaults,
                padding: parityPx(base[SET_GAP]?.value),
                files: VITRINO_UPLOAD_FILES.map((file) => ({
                  name: file.name,
                  size: fileSizeText(file.size),
                })),
              },
            ]
          : // Spec 015 ③ (plan ③ D-05): the card without its image beside its set.
            structure === "card"
            ? [
                {
                  name: `${entry.ero.name} – ${CARD_EXAMPLE}`,
                  variant: defaults,
                  padding: parityPx(base[SET_GAP]?.value),
                  toggled: { media: false },
                },
              ]
            : // Spec 015 ③ (plan ③ D-11): the avatar with its image shown beside its set.
              structure === "avatar"
              ? [
                  {
                    name: `${entry.ero.name} – ${AVATAR_EXAMPLE}`,
                    variant: defaults,
                    padding: parityPx(base[SET_GAP]?.value),
                    toggled: { image: true },
                  },
                ]
              : undefined;
  const example =
    structure === "dialog" && backdrop !== undefined && backdropPaint !== undefined
      ? {
          name: `${entry.ero.name} – ${BACKDROP_EXAMPLE}`,
          variant: defaults,
          backdrop: { binding: variableName(backdrop.token), paint: backdropPaint },
          padding: parityPx(base[SET_GAP]?.value),
        }
      : // The example of a meter (Spec 011 ④): the default variant with the unknown value — no
        // backdrop, the Regulo's word as its value text; the plugin leaves out the fill frame
        // and draws the stroke of the part unknown, whose term every variant carries.
        structure === "meter" && skemo.parts.unknown !== undefined
        ? {
            name: `${entry.ero.name} – ${UNKNOWN_EXAMPLE}`,
            variant: defaults,
            padding: parityPx(base[SET_GAP]?.value),
            texts: { "value-text": METER_UNKNOWN_TEXT },
          }
        : // The example of a navigation (Spec 011 ⑤): the default variant as a column, where the
          // Skemo knows the orientation vertical — a prop that keys no part and is no axis.
          structure === "nav" && verticalOf(skemo) !== undefined
          ? {
              name: `${entry.ero.name} – ${VERTICAL_EXAMPLE}`,
              variant: defaults,
              padding: parityPx(base[SET_GAP]?.value),
              props: { orientation: verticalOf(skemo) ?? "" },
            }
          : undefined;
  // The sign of the indicator: the check mark, the dot, and the chevron of a select's field
  // (Spec 010 ④, D-07); a text field has none. A state (Spec 011 ③) has the arc. A table (Spec
  // 011 ④) has the select's chevron as its sort indicator — the web turns the same sign by the
  // direction; one shape for both pictures.
  // Spec 014 ②: the chevron of a select and the sort arrow of a table are icons of the plan
  // (iconsOf), no sign; the dot and the arc stay signs. Nachlese 4 N-7: the check mark is an icon
  // too (signOf has no sign for a checkbox any more).
  const sign =
    structure === "state"
      ? STATE_SIGN
      : skemo.a11y.role === "combobox" || structure === "table"
        ? undefined
        : signOf(skemo.a11y.role, "16");
  // The boolean props that show a part (Spec 011 ③): BOOLEAN properties of the set, no axis. The
  // part may be the text of a slot (Spec 011 ④: the caption of a table is its default slot).
  const propToggles = skemo.props.flatMap((prop) => {
    const toggle = BOOLEAN_TOGGLES[prop.name];
    return prop.kind === "boolean" &&
      toggle !== undefined &&
      (skemo.parts[toggle.part] !== undefined ||
        skemo.slots.some((slot) => slot.name === toggle.part)) &&
      !keys.includes(prop.name)
      ? [
          {
            property: prop.name,
            part: toggle.part,
            defaultValue: prop.default === true,
            ...(toggle.hides === true ? { hides: true } : {}),
            ...(toggle.shownAs === undefined ? {} : { shownAs: toggle.shownAs }),
          },
        ]
      : [];
  });
  // Spec 015 ③ (plan ③ D-05): the media of a card is optional — a BOOLEAN property `media` shows
  // or hides its stand-in, no prop of the Skemo (so not in `properties`, nor in parity).
  // Spec 015 ③ (plan ③ D-11): an avatar shows its picture where it has one and loads it — a
  // BOOLEAN property `image` shows the stand-in over the initials, false by default (the
  // picture prop has no default); no prop of the Skemo either.
  // Nachlese 8 ② (F-12): copyable shows the copy button of a code block — a part of the Figma
  // Celo (the web's butono), not of the Skemo; (F-9) a menu's list shows by the BOOLEAN open,
  // true in the set (its variants show the states of the entries), false where an example closes
  // it.
  const ownToggles =
    structure === "codeblock" && skemo.props.some((prop) => prop.name === "copyable")
      ? [
          {
            property: "copyable",
            part: "copy",
            defaultValue: skemo.props.find((prop) => prop.name === "copyable")?.default === true,
          },
        ]
      : structure === "menu" && skemo.props.some((prop) => prop.name === "open")
        ? [{ property: "open", part: "surface", defaultValue: true }]
        : [];
  const toggles =
    ownToggles.length > 0
      ? [...propToggles, ...ownToggles]
      : structure === "card" && skemo.slots.some((slot) => slot.name === "media")
        ? [...propToggles, { property: "media", part: "media", defaultValue: true }]
        : structure === "avatar" && skemo.parts.image !== undefined
          ? [...propToggles, { property: "image", part: "image", defaultValue: false }]
          : propToggles;
  // The table of a table's set and the entries of a list's (Spec 011 ④): the Vitrino's words.
  const table =
    structure === "table"
      ? {
          ...TABLE_TEXTS,
          direction: String(
            skemo.props.find((prop) => prop.name === "direction")?.default ?? "ascending",
          ),
        }
      : undefined;
  const entries = structure === "list" ? [...LIST_ENTRIES] : undefined;
  // The options of a choice (Spec 010 ③, D-07): the Vitrino's words, the first chosen. The items
  // of a navigation and the tabs of a tab list (Spec 011 ⑤): the same words, the first current
  // or active.
  const [entryKey, activeKey] = entryKeys;
  // The second state of an entry (Nachlese 4 N-8): the active suggestion, the second row — the
  // first is the chosen one, so the set shows both states. Keyed after the first key.
  const activeEntry =
    activeKey !== undefined &&
    skemo.slots.some((slot) => slot.entry?.key === entryKey && slot.entry?.active === activeKey)
      ? { active: 1, activeKey }
      : {};
  // The suggestions of a field with a listbox (Spec 014 ⑤): rows like a choice's options.
  // Spec 015 ① (plan ① D-05): a pagination shows the pages 1, 2, 3 (the first current), a
  // breadcrumb the Vitrino's three words with the last the current page.
  const options =
    (structure === "choice" ||
      structure === "nav" ||
      structure === "tabs" ||
      structure === "pagination" ||
      structure === "breadcrumb" ||
      (structure === "field" && skemo.parts.listbox !== undefined)) &&
    entryKey !== undefined
      ? structure === "pagination"
        ? { key: entryKey, texts: ["1", "2", "3"], selected: 0 }
        : structure === "breadcrumb"
          ? { key: entryKey, texts: [...VITRINO_OPTIONS], selected: VITRINO_OPTIONS.length - 1 }
          : { key: entryKey, texts: [...VITRINO_OPTIONS], selected: 0, ...activeEntry }
      : undefined;
  // The confirming action of a dialog looks like the butono it composes (Abnahme Spec 011 ②,
  // F-5): its roles read from the butono's Skemo in the same Modelo.
  const composed =
    structure === "dialog"
      ? composedOf(eroj, resolutions, base)
      : structure === "upload"
        ? standInsComposedOf(UPLOAD_COMPOSED, eroj, resolutions, base)
        : // Spec 015 ③ (plan ③ D-05): a card's actions and badge look like a butono and an insigno.
          structure === "card"
          ? standInsComposedOf(CARD_COMPOSED, eroj, resolutions, base)
          : // Spec 025 ① (plan ① D-04): the number field beside a slider's track looks like a kampo.
            structure === "slider"
            ? standInsComposedOf(SLIDER_COMPOSED, eroj, resolutions, base)
            : undefined;
  // The overlays (Spec 014 ④, plan ④ D-06): a popover shows the words of its trigger stand-in and
  // its content beside the heading (the label property); a menu its three entries (the
  // Vitrino's: edit, duplicate disabled, delete danger) and the word of its trigger, the Modelo's
  // own (a11y.texts label-empty). The entries are drawn as rows like a tab list's (entry).
  const menu =
    structure === "menu"
      ? {
          trigger: skemo.a11y.texts?.["label-empty"]?.de ?? labelDefaultOf(skemo.a11y.role),
          items: VITRINO_MENU_ITEMS.map((item) => ({
            text: item.text,
            ...(item.disabled === true ? { disabled: true } : {}),
            ...(item.danger === true ? { danger: true } : {}),
          })),
        }
      : undefined;
  // A card (Spec 015 ③, plan ③ D-05): its width and the media's extent, written from the base
  // combination; the stand-in image's fill and word colour bound to their variables.
  const pictured = structure === "card" || structure === "avatar";
  const mediaFill = pictured ? paintOf(STAND_IN_FILL, resolutions, base) : undefined;
  const mediaColor = pictured ? paintOf(STAND_IN_COLOR, resolutions, base) : undefined;
  const cardWidth = parityPx(base[CARD_WIDTH]?.value);
  const card =
    structure === "card" && mediaFill !== undefined && mediaColor !== undefined
      ? {
          width: cardWidth,
          media: {
            extent: Math.round(cardWidth * CARD_MEDIA_SHARE),
            fill: { binding: variableName(STAND_IN_FILL), paint: mediaFill },
            color: { binding: variableName(STAND_IN_COLOR), paint: mediaColor },
          },
        }
      : undefined;
  // An avatar (Spec 015 ③, plan ③ D-11): the Vitrino's silhouette on the stand-in's ground.
  const silhouette =
    structure === "avatar" ? avatarSilhouetteOf(VITRINO_AVATAR.picture) : undefined;
  // Nachlese 5 N5-5 (O-18): the smallest size – the first value of the size axis – shows one
  // initial, the first grapheme of the Vitrino's initials, as the web does.
  const smallest = skemo.props.find((prop) => prop.name === AVATAR_SIZE_PROP)?.values?.[0];
  const firstInitial = [
    ...new Intl.Segmenter("de", { granularity: "grapheme" }).segment(VITRINO_AVATAR.initials),
  ][0]?.segment;
  const avatar =
    silhouette !== undefined && mediaFill !== undefined && mediaColor !== undefined
      ? {
          picture: silhouette,
          fill: { binding: variableName(STAND_IN_FILL), paint: mediaFill },
          color: { binding: variableName(STAND_IN_COLOR), paint: mediaColor },
          ...(smallest === undefined || firstInitial === undefined
            ? {}
            : { oneInitial: { prop: AVATAR_SIZE_PROP, value: smallest, text: firstInitial } }),
        }
      : undefined;
  return {
    set: entry.ero.name,
    structure,
    ...(structure === "field" ? { texts: fieldTextsOf(skemo) } : {}),
    ...((structure === "toggle" ||
      structure === "choice" ||
      structure === "notice" ||
      structure === "meter") &&
    Object.keys(toggleTexts).length > 0
      ? { texts: toggleTexts }
      : {}),
    ...(structure === "dialog" ? { texts: dialogTexts } : {}),
    // Spec 015 ② (plan ② D-06): the help names kinds and size (the Vitrino's), the error the
    // Vitrino's word; the button and the hint in the Modelo's words (a11y.texts).
    ...(structure === "upload"
      ? {
          texts: {
            help: VITRINO_UPLOAD_HELP,
            error: VITRINO_SLOT_TEXTS.error ?? "",
            choose: skemo.a11y.texts?.["choose-name"]?.de ?? "",
            "drop-hint": skemo.a11y.texts?.["drop-hint-name"]?.de ?? "",
          },
        }
      : {}),
    ...(structure === "tabs" ? { texts: { ...TABS_TEXTS } } : {}),
    // Spec 025 ① (plan ① D-04): the Vitrino's help and end labels, the error the Vitrino's word;
    // the fill from the Vitrino's values as shares of the track.
    ...(structure === "slider"
      ? {
          texts: {
            help: VITRINO_SLIDER.help,
            error: VITRINO_SLOT_TEXTS.error ?? "",
            "min-label": VITRINO_SLIDER.minLabel,
            "max-label": VITRINO_SLIDER.maxLabel,
          },
          slider: {
            share: Number(VITRINO_SLIDER.value) / 100,
            start: Number(VITRINO_SLIDER.start) / 100,
            end: Number(VITRINO_SLIDER.end) / 100,
          },
        }
      : {}),
    // Spec 025 ② (plan ② D-12): the Vitrino's help, month and dates (the error the Vitrino's
    // word); the calendar of the Vitrino's month.
    ...(structure === "field" && skemo.parts.calendar !== undefined
      ? {
          texts: {
            help: VITRINO_DATE.help,
            error: VITRINO_SLOT_TEXTS.error ?? "",
            month: VITRINO_DATE.month,
            value: VITRINO_DATE.shownValue,
            range: VITRINO_DATE.shownRange,
          },
          calendar: vitrinoCalendar(),
        }
      : {}),
    ...(structure === "popover"
      ? { texts: { trigger: VITRINO_TRIGGER_TEXT, content: VITRINO_CONTENT_TEXT } }
      : {}),
    ...(structure === "disclosure"
      ? { texts: { summary: VITRINO_SUMMARY_TEXT, content: VITRINO_CONTENT_TEXT } }
      : {}),
    // Spec 015 ③ (plan ③ D-05): the Vitrino's card — its text, the badge of the meta row, the two
    // actions in its order, the word of the stand-in image; the heading is the label property.
    ...(structure === "card"
      ? {
          texts: {
            content: VITRINO_CARD.text,
            badge: VITRINO_CARD.badge,
            ...Object.fromEntries(
              VITRINO_CARD.actions.map((action, index) => [`action-${index + 1}`, action.text]),
            ),
            media: VITRINO_MEDIA_TEXT,
          },
        }
      : {}),
    ...(menu === undefined
      ? {}
      : {
          menu,
          entry: { key: STATE_KEY, texts: menu.items.map((item) => item.text), selected: 0 },
        }),
    ...(extraAxes.length === 0 ? {} : { extraAxes }),
    ...(structure === "separator"
      ? { separator: { length: parityPx(base[SEPARATOR_LENGTH]?.value) } }
      : {}),
    // Nachlese 8 ② (F-12): the Vitrino's command with its caption and the Modelo's word of the
    // copy button; the Markdown view's example in the role of running text.
    ...(structure === "codeblock"
      ? {
          codeblock: {
            caption: VITRINO_SLOT_TEXTS.caption ?? "",
            code: VITRINO_SHORT_COMMAND,
            copy: skemo.a11y.texts?.copyable?.de ?? "",
          },
        }
      : {}),
    ...(structure === "markdown"
      ? {
          markdown: { ...MARKDOWN_EXAMPLE, items: [...MARKDOWN_EXAMPLE.items] },
          markdownTexts: {
            bindings: {
              "label.color": variableName(SEPARATOR_EXAMPLE_TEXT.color),
              "label.typography": variableName(SEPARATOR_EXAMPLE_TEXT.typography),
            },
            paints: separatorTextPaint === undefined ? {} : { "label.color": separatorTextPaint },
            ...(separatorTextFont === undefined ? {} : { font: separatorTextFont }),
          },
        }
      : {}),
    ...(sign === undefined ? {} : { sign }),
    ...(options === undefined ? {} : { entry: options }),
    ...(example === undefined ? {} : { example }),
    ...(examples === undefined ? {} : { examples }),
    ...(composed === undefined ? {} : { composed }),
    ...(toggles.length === 0 ? {} : { toggles }),
    ...(structure === "meter" ? { meter: { share: meterShareOf(skemo) } } : {}),
    ...(table === undefined ? {} : { table }),
    ...(entries === undefined ? {} : { entries }),
    ...(card === undefined ? {} : { card }),
    ...(avatar === undefined ? {} : { avatar }),
    ...(description === undefined ? {} : { description }),
    ...(uzo === undefined ? {} : { uzo }),
    properties,
    variants,
    pluginData: { fundamento: { ero: entry.ero.name, skemo: skemo.id, version } },
    grid: {
      rows: rowOf.size,
      columns,
      gap: 2 * cell,
      padding: cell,
    },
    // An icon and a separator carry no text (Spec 014 ②): no label property.
    ...(structure === "icon" || structure === "separator"
      ? {}
      : {
          label: {
            property: "label",
            // The Modelo's own word where the label is empty (a11y.texts label-empty: the menu's
            // trigger, Spec 014 ④; the landmarks of Spec 015 ①) names the set's label.
            defaultValue:
              (structure === "pagination" || structure === "breadcrumb"
                ? skemo.a11y.texts?.["label-empty"]?.de
                : undefined) ?? labelDefaultOf(skemo.a11y.role, structure),
          },
        }),
    fonts,
    ...(surface === undefined ? {} : { surface }),
  };
}

/** Figma's names for the weights of a font. Knowledge of this Celo (Art. VIII). */
const FONT_STYLES: Readonly<Record<number, string>> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

/** The font Figma cannot do without in a new file, and so the one the plugin falls back to. */
export const FIGMA_FONT_FALLBACK = "Inter";

/**
 * The names in a font stack that are no family: the generic keywords of CSS, which a browser
 * resolves to whatever it has, and Apple's PostScript alias SFMono-Regular. No Figma file lists a
 * font of these names, so a run that tried them would only be refused (W3, F-2). Menlo, Consolas
 * and the like are real families and stay candidates.
 */
const GENERIC_FONT_FAMILIES: ReadonlySet<string> = new Set([
  "ui-monospace",
  "monospace",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-rounded",
  "sans-serif",
  "serif",
  "cursive",
  "fantasy",
  "math",
  "emoji",
  "fangsong",
  "SFMono-Regular",
  "-apple-system",
  "BlinkMacSystemFont",
]);

/**
 * The families of a font stack a Figma run may try, in the stack's order, without the generic
 * names (W3, F-2). A stack that is generic throughout keeps its first name, so the plan still
 * names a family and the run reports what it could not load.
 */
export function figmaFontCandidates(stack: unknown): string[] {
  const names = (Array.isArray(stack) ? stack : [stack]).filter(
    (name): name is string => typeof name === "string",
  );
  const candidates = names.filter((name) => !GENERIC_FONT_FAMILIES.has(name));
  return candidates.length > 0 ? candidates : names.slice(0, 1);
}

/**
 * The Figma font of a typography value: the first family of its stack that is no generic CSS
 * name, every such family as the candidates a run may try (W3, F-2), and the style of its weight.
 */
function fontOf(value: unknown): { family: string; style: string; families: string[] } | undefined {
  const typography = value as { fontFamily?: unknown; fontWeight?: unknown } | undefined;
  const families = figmaFontCandidates(typography?.fontFamily);
  const family = families[0];
  const weight = typeof typography?.fontWeight === "number" ? typography.fontWeight : 400;
  if (family === undefined) return undefined;
  return { family, style: FONT_STYLES[Math.round(weight / 100) * 100] ?? "Regular", families };
}

/** The padding of a table cell in the Vitrino; the grid in Figma keeps the same distances. */
const VITRINO_CELL_PADDING = "spacing.small";

/** The px of a resolved dimension, 0 for anything else. */
function parityPx(value: unknown): number {
  const amount = (value as { value?: unknown } | undefined)?.value;
  return typeof amount === "number" ? amount : 0;
}

/** Resolves the plan by Figma's mode rules: the proof that the projection matches the resolver. */
export function resolveFigmaPlan(
  plan: FigmaPlan,
  assignment: Readonly<Record<string, string>>,
): Record<string, FigmaValue> {
  const index = new Map<string, { collection: FigmaCollection; variable: FigmaVariable }>();
  for (const collection of plan.collections) {
    for (const variable of collection.variables) index.set(variable.name, { collection, variable });
  }
  const resolve = (name: string, depth = 0): FigmaValue => {
    if (depth > 32) throw new Error(`Alias cycle at ${name}`);
    const found = index.get(name);
    if (found === undefined) throw new Error(`Unknown variable ${name}`);
    const mode =
      found.collection.name === BASE_COLLECTION
        ? BASE_MODE
        : (assignment[found.collection.name] ?? found.collection.modes[0] ?? "");
    const value = found.variable.values[mode];
    if (value === undefined) throw new Error(`${name} has no value for mode ${mode}`);
    return typeof value === "object" && value !== null && "alias" in value
      ? resolve(value.alias, depth + 1)
      : value;
  };
  const resolved: Record<string, FigmaValue> = {};
  for (const [name, entry] of index) {
    if (entry.variable.hidden === true) continue;
    resolved[name] = resolve(name);
  }
  return resolved;
}

export const FIGMA_CELO: Celo = {
  name: "figma",
  generate(input: CeloInput): GeneratedFile[] {
    const { modelo, modeloJson } = input;
    const variables = variablesOf(modelo, input);
    for (const [collection, derived] of derivedRadiusVariables(modelo, allResolutions(modelo))) {
      variables.set(collection, [...(variables.get(collection) ?? []), ...derived]);
    }
    const collections: FigmaCollection[] = [
      {
        name: BASE_COLLECTION,
        modes: [BASE_MODE],
        defaultMode: BASE_MODE,
        variables: sortVariables(variables.get(BASE_COLLECTION) ?? []),
      },
      ...dimensiojOf(modelo).map((dimensio) => ({
        name: dimensio.name,
        modes: dimensio.modes,
        defaultMode: dimensio.defaultMode,
        variables: sortVariables(variables.get(dimensio.name) ?? []),
      })),
    ];
    // The glyphs of every Aspekto (Spec 014 ②, G3): the picture per name, and a BOOLEAN variable
    // per Aspekto in the collection aspekto that is true in its own mode — the switch of the
    // glyph frames (plan ② D-08).
    const aspektoCollection = collections.find(
      (collection) => collection.name === ASPEKTO_DIMENSIO,
    );
    const aspektoj = aspektoCollection?.modes ?? [];
    const ikonoj =
      modelo.ikonaro.length === 0
        ? undefined
        : {
            names: modelo.ikonaro.map((ikono) => ikono.name),
            mirror: modelo.ikonaro
              .filter((ikono) => ikono.mirror === true)
              .map((ikono) => ikono.name),
            glyphs: Object.fromEntries(
              aspektoj.map((aspekto) => {
                const glyphs =
                  modelo.aspektoPackages.find((pkg) => pkg.aspekto === aspekto)?.ikonoj ?? {};
                return [
                  aspekto,
                  Object.fromEntries(
                    modelo.ikonaro.flatMap((ikono): [string, string][] => {
                      const svg = glyphs[ikono.name];
                      return svg === undefined ? [] : [[ikono.name, svg]];
                    }),
                  ),
                ];
              }),
            ),
          };
    if (ikonoj !== undefined && aspektoCollection !== undefined) {
      for (const aspekto of aspektoj) {
        aspektoCollection.variables.push({
          name: `ikonoj/${aspekto}`,
          type: "BOOLEAN",
          values: Object.fromEntries(aspektoj.map((mode) => [mode, mode === aspekto])),
        });
      }
    }
    const base = baseResolution(modelo);
    const gap = parityPx(base[SET_GAP]?.value);
    const plan: FigmaPlan = {
      fundamento: modeloJson.fundamento.version,
      fontFallback: FIGMA_FONT_FALLBACK,
      collections,
      ...(ikonoj === undefined ? {} : { ikonoj }),
      components: modelo.eroj.map((entry) =>
        componentSetOf(
          entry,
          modeloJson.fundamento.version,
          allResolutions(modelo),
          base,
          modelo.reguloj,
          modelo.eroj,
        ),
      ),
      section: { name: FIGMA_SECTION, gap, padding: gap, frame: FIGMA_SET_FRAME },
      ...((modelo.sxablonoj ?? []).length === 0
        ? {}
        : {
            sxablonoj: (modelo.sxablonoj ?? []).map((entry) =>
              sxablonoFrameOf(entry, new Set(modelo.eroj.map((ero) => ero.ero.name))),
            ),
          }),
    };
    return [
      { path: "figma/plan.json", text: `${JSON.stringify(plan, null, 2)}\n` },
      { path: "figma/plugin/manifest.json", text: pluginManifest(plan, input.build) },
      { path: "figma/plugin/code.js", text: pluginSource(plan, input.build) },
    ];
  },
};

function sortVariables(variables: readonly FigmaVariable[]): FigmaVariable[] {
  return [...variables].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** The name of the second state of a component's entries (Nachlese 4 N-8), or "". */
function activeKeyOf(component: FigmaComponentSet): string {
  return component.entry?.activeKey ?? "";
}

/**
 * What the Figma plan states about the components (Spec 003 T021, FR-12): every component
 * property with its values (`BOOLEAN`, `TEXT` and `NUMBER` as the kinds they stand for) and the
 * state property as the states. Read from `plan.json`, the file the plugin applies.
 */
export function figmaPlanInventory(plan: unknown): Record<string, ParityItem> {
  const components =
    typeof plan === "object" &&
    plan !== null &&
    "components" in plan &&
    Array.isArray(plan.components)
      ? (plan.components as FigmaComponentSet[])
      : [];
  const items: Record<string, ParityItem> = {};
  for (const component of components) {
    const props: Record<string, string[]> = {};
    for (const [name, values] of Object.entries(component.properties)) {
      if (name === STATE_KEY) continue;
      if (Array.isArray(values)) props[name] = [...values];
      else
        props[name] = [
          values === "BOOLEAN" ? "boolean" : values === "NUMBER" ? "number" : "string",
        ];
    }
    const states = component.properties[STATE_KEY];
    // F8: the side states what the plugin applies — the paint with its deckkraft, or the marker
    // for a binding whose alpha is not the same in every mode.
    const values: Record<string, string> = {};
    // The axes the Skemo keys no part by (Spec 014 ②: the name of an icon) are no part of the key
    // the Skemo side writes; every name states the same values.
    const extra = new Set(component.extraAxes ?? []);
    const keyed = (props: Readonly<Record<string, string>>) =>
      Object.fromEntries(Object.entries(props).filter(([key]) => !extra.has(key)));
    for (const variant of component.variants ?? []) {
      const at = `@${parityVariantKey(keyed(variant.props))}`;
      for (const [key, jugxo] of Object.entries(variant.notDrawn ?? {})) {
        values[`${key}${at}`] = `${PARITY_NOT_DRAWN} (${jugxo})`;
      }
      // What follows the state of one option (Spec 010 ③, E7) stands with the value of the entry
      // key in the variant name, as the Skemo side names it.
      const sides = [
        { props: variant.props, part: variant },
        ...Object.entries(variant.entries ?? {}).map(([value, part]) => ({
          props: { ...variant.props, [component.entry?.key ?? ""]: value },
          part,
        })),
        // The second state of an entry (Nachlese 4 N-8), named with its own key.
        ...Object.entries(variant.activeEntries ?? {}).map(([value, part]) => ({
          props: { ...variant.props, [activeKeyOf(component)]: value },
          part,
        })),
      ];
      for (const { props, part } of sides) {
        const where = `@${parityVariantKey(keyed(props))}`;
        for (const [key, text] of Object.entries(part.geometry ?? {}))
          values[`${key}${where}`] = text;
        for (const [binding, paint] of Object.entries(part.paints ?? {})) {
          // Only colour parts are compared; a colour inside a composite (the ring) is drawn, not
          // reported.
          const property = binding.slice(binding.lastIndexOf(".") + 1);
          if (PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES] !== "color") {
            continue;
          }
          values[`${binding}${where}`] =
            "alphaVariesByMode" in paint
              ? `${ALPHA_VARIES} (${part.bindings[binding]})`
              : parityColorText({
                  colorSpace: "srgb",
                  components: [0, 0, 0],
                  alpha: paint.opacity,
                  hex: paint.hex,
                });
        }
      }
    }
    items[component.set] = {
      props,
      states: Array.isArray(states) ? [...states] : [],
      values,
    };
  }
  return items;
}
