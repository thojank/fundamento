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
  combinationsOf,
  isBindingKeyword,
  isEntryKey,
  isPositionKeyword,
  type LoadedEro,
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
  VITRINO_OPTIONS,
  VITRINO_PROMPT,
  VITRINO_SLOT_TEXTS,
  VITRINO_SURFACE,
} from "../vitrino/datumoj.js";
import { signOf } from "../web-component/element-template.js";
import { DRAWN_PART_PROPERTIES, pluginManifest, pluginSource } from "./plugin.js";

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
  type: "COLOR" | "FLOAT" | "STRING";
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
  icon: "jug_01M31TV1V4S3RNBPWSRB2CGEDK",
  // Spec 008 (plan D-11, Befund B-1): the underline is written as the label's text decoration,
  // on or off per variant; its thickness and colour bind to no variable in Figma.
  underline: "jug_01M4RYCY61NK92JM6XYD00M012",
  // Spec 009 (plan D-09, Befund B-2; Abnahme F-4): the control of a field in the set is empty and
  // shows the placeholder, so the colour of the typed text has no node; the sign of the required
  // mark is the projection's — of the kampo and, since Spec 010 ② and ③, of the markobutono and the
  // elekto; since ④ both for the elektilo, whose closed field shows its prompt (the Jugxo's wording
  // names all four).
  text: "jug_01M4S2R85WRAC5SV7CARH8RE7S",
  "required-mark": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
};

/**
 * The texts a field shows in the set (Abnahme Spec 009, F-4): the control an example in place of
 * the typed text (the placeholder), help and error a word each. One neutral word per node, like
 * the label's default (F14, M-3); an instance overrides them. Without content a HUG frame shrinks to
 * its paddings and a text node is invisible.
 */
export const FIELD_TEXTS: Readonly<Record<string, string>> = {
  text: "Beispiel",
  // The same words the Vitrino slots into the field (F-5): one source for both pictures.
  ...VITRINO_SLOT_TEXTS,
};

/**
 * The texts the field of a select shows in the set (Spec 010 ④, plan ④ D-07): the closed field
 * with its prompt where the kampo shows its example — "Bitte wählen", the Vitrino's prompt (one
 * source for both pictures); an example of one option there would read as chosen, which the
 * Regulo select-placeholder-is-prompt forbids. Help and error as in the kampo's field.
 */
export const SELECT_TEXTS: Readonly<Record<string, string>> = {
  ...FIELD_TEXTS,
  text: VITRINO_PROMPT,
};

/**
 * How the plugin draws a set (Spec 009, D-09): a control (variant → ring → gap → control → label)
 * for a button or a link, a field (label above, the control with its text, help and error below)
 * for a textbox, a toggle (Spec 010 ①, D-10: a row — ring → gap → control with the knob in it,
 * the label beside) for a switch and a checkbox (Spec 010 ②, D-09: the box with the check mark in
 * it, label and error in a column beside it; G1 gives the Wahl-Eroj one build, "control + label").
 * Celo knowledge from the a11y role (Art. VIII).
 */
export type FigmaStructure = "control" | "field" | "toggle" | "choice";

/**
 * A radio group (Spec 010 ③, D-07) is a choice: the label (the question) above a column of
 * options, each a row — ring → gap → circle with the dot, the option's label beside it — and help
 * and error below. Its options are entries of a slot, not variants: selected is the state of one
 * option (E7). A select (Spec 010 ④, D-07) is a field: the closed field of the kampo with the
 * chevron at the end of its control; its list is the platform's and not drawn (E3, Manko of the
 * plan).
 */
export const structureOf = (role: string): FigmaStructure =>
  role === "textbox" || role === "combobox"
    ? "field"
    : role === "switch" || role === "checkbox"
      ? "toggle"
      : role === "radiogroup"
        ? "choice"
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
};

/** The word a role without its own entry shows: the button's, as every set did before M-3. */
const LABEL_DEFAULT = "Aktion";

export const labelDefaultOf = (role: string): string => LABEL_DEFAULTS[role] ?? LABEL_DEFAULT;

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

export interface FigmaComponentSet {
  set: string;
  /** How the plugin draws the variants (Spec 009, D-09); a plan without it is a control. */
  structure?: FigmaStructure;
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
   * The options a choice shows in every variant (Spec 010 ③, D-07): the entry key of its slot
   * (selected), the words of the options — the Vitrino's — and which of them is chosen. The plugin
   * draws one row per word and binds each with the entry of the variant for its value of the key.
   */
  entry?: { key: string; texts: string[]; selected: number };
  /** The purpose of the Uzo, one line, as the description of the set (Spec 007 T028, A12). */
  description?: string;
  /**
   * What the set should carry beyond the purpose (Spec 007 T029, A12, D-10, OP-9): boundaries,
   * slot rules and text rules, as Markdown for the field the plugin tries. Whether Figma takes it
   * is measured by the run (Art. VI); a part the tool refuses is reported as an open Manko.
   */
  uzo?: { field: "descriptionMarkdown"; parts: UzoPart[]; markdown: string };
  properties: Record<string, string[] | "BOOLEAN" | "TEXT">;
  variants: {
    props: Record<string, string>;
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
    /** The font of the label, from its typography token: family and the style of its weight. */
    font?: { family: string; style: string };
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
     * stays, as on the web.
     */
    hidden?: string[];
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
  fonts?: { family: string; style: string; aspektoj: string[] }[];
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
   * Where the sets lie (F-1, F-2, F-8): in the frame `frame` with auto-layout (horizontal,
   * wrapping, `gap` between the sets and between the rows, hugging both ways, no fill), at the
   * padding of the section of this name on the current page. Figma places the sets; the plugin
   * computes no x or y of a set. Gap and padding are px of spacing.xlarge, resolved in the base
   * combination.
   */
  section?: { name: string; gap: number; padding: number; frame: string };
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

/** The STRING twin of a weight variable: the same modes, the same cascade, cuts instead of numbers. */
function styleTwin(variable: FigmaVariable): FigmaVariable {
  const values: Record<string, FigmaValue> = {};
  for (const [mode, value] of Object.entries(variable.values)) {
    values[mode] =
      typeof value === "object" && value !== null && "alias" in value
        ? { alias: `${STYLE_PREFIX}${value.alias.slice(WEIGHT_PREFIX.length)}` }
        : styleOfWeight(Number(value));
  }
  return {
    name: `${STYLE_PREFIX}${variable.name.slice(WEIGHT_PREFIX.length)}`,
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

/** The Dimensioj whose sets define `token`, in priority order (ascending). */
function dimensiojOfToken(modelo: Modelo, token: string): string[] {
  const names = new Set<string>();
  for (const set of modelo.setoj) {
    if (set.tokens[token] === undefined) continue;
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
  for (const combination of combinationsOf(entry.skemo, keys)) {
    const here: Record<string, string> = {};
    for (const part of RADIUS_PARTS) {
      const [name, property] = part.split(".");
      const bound = boundToken(entry.skemo, name ?? "", property ?? "", combination);
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

  for (const token of input.modeloJson.tokens) {
    const dims = dimensiojOfToken(modelo, token.name);
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
  for (const [collection, list] of byCollection) {
    const twins = list.filter((variable) => variable.name.startsWith(WEIGHT_PREFIX)).map(styleTwin);
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

/** The component set of one Ero: every variant with its variable bindings (D-12). */
function componentSetOf(
  entry: LoadedEro,
  version: string,
  resolutions: ReturnType<typeof allResolutions>,
  base: Readonly<Record<string, { value: unknown }>>,
  reguloj: readonly Regulo[],
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
    else properties[prop.name] = "TEXT";
  }
  properties.state = [...skemo.states];
  // Variants exist for what changes the appearance: the props the parts are keyed by, and state.
  // `type`, for example, is behaviour in a form and would only multiply the set. A keyed boolean
  // prop is an axis too (Spec 010 ①, D-03: checked of the switch).
  const keys = variantKeys(skemo);
  const drawn = new Set(DRAWN_PART_PROPERTIES);
  // The focus radii only for an Ero that has a radius to grow (F32); the ligilo has none.
  const radiiOf =
    radiusTokensOf(entry) === undefined
      ? undefined
      : { "focus-gap": "radius/focus/gap", "focus-ring": "radius/focus/ring" };
  const typographyToken = (combination: Readonly<Record<string, string>>): string | undefined => {
    const bound = boundToken(skemo, "label", "typography", combination);
    if (bound === undefined) return undefined;
    return bound.token === "inherit" ? INHERIT_TYPOGRAPHY : bound.token;
  };
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
  const keyedByEntry = (part: string, property: string): boolean => {
    const source = skemo.parts[part]?.[property as keyof (typeof skemo.parts)[string]];
    return (
      source !== undefined && "by" in source && source.by.some((key) => entryKeys.includes(key))
    );
  };
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
          // A colour that is none is a part not drawn in this variant (Spec 010 ②, D-09).
          if (bound.token === "none" && (property === "color" || property === "fill")) {
            hidden.push(part);
          }
          continue;
        }
        bindings[key] = variableName(bound.token);
        const type = PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES];
        if (type !== "color" && type !== "dimension") continue;
        // What the plugin does not draw is named with its Jugxo, never claimed (Paket „Figma
        // zeigt das Ero"). What it does not draw and no Jugxo releases is simply absent, and
        // check:parity says so.
        const release = FIGMA_NOT_DRAWN[part];
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
    const entries: NonNullable<FigmaComponentSet["variants"][number]["entries"]> = {};
    for (const value of combinationsOf(skemo, entryKeys)) {
      if (entryKeys.length === 0) break;
      const sink = { bindings: {}, paints: {}, geometry: {}, notDrawn: {}, hidden: [] as string[] };
      bindParts({ ...combination, ...value }, keyedByEntry, sink);
      entries[entryKeys.map((key) => value[key]).join(",")] = {
        bindings: sink.bindings,
        ...(Object.keys(sink.paints).length === 0 ? {} : { paints: sink.paints }),
        ...(Object.keys(sink.geometry).length === 0 ? {} : { geometry: sink.geometry }),
        ...(sink.hidden.length === 0 ? {} : { hidden: sink.hidden }),
      };
    }
    // The focus ring (F11). Its colour sits in a field of a composite token and is compared by
    // no side, so it is kept out of the parity inventory (only colour-typed parts are reported).
    const ring = boundToken(skemo, "focus-ring", "ring", combination);
    if (ring !== undefined) {
      const paint = paintOf(ring.token, resolutions, base, "color");
      if (paint !== undefined) paints["focus-ring.ring"] = paint;
    }
    const typography = typographyToken(combination);
    const font = fontOf(typography === undefined ? undefined : base[typography]?.value);
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
    return {
      props: { ...combination },
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
    };
  });
  // Every font the label can carry, over every combination (F30). The typography role follows the
  // variant (size), and its family and weight follow the Dimensioj, so the pairs are collected over
  // both — each with the Aspektoj that ask for it, which is what the report names per mode.
  const fontsNeeded = new Map<string, { family: string; style: string; aspektoj: Set<string> }>();
  // Every part with a typography (Spec 009: a field has label, text, help and error).
  const typographyParts = Object.entries(skemo.parts)
    .filter(([, properties]) => properties.typography !== undefined)
    .map(([part]) => part);
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
        if (font === undefined) continue;
        const key = `${font.family}\u0000${font.style}`;
        const seen = fontsNeeded.get(key) ?? { ...font, aspektoj: new Set<string>() };
        const aspekto = assignment[ASPEKTO_DIMENSIO];
        if (aspekto !== undefined) seen.aspektoj.add(aspekto);
        fontsNeeded.set(key, seen);
      }
    }
  }
  const fonts = [...fontsNeeded.values()]
    .map((entry) => ({
      family: entry.family,
      style: entry.style,
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
  const columns = skemo.states.length;
  const rowOf = new Map<string, number>();
  for (const variant of variants) {
    const { [STATE_KEY]: state, ...combination } = variant.props;
    const key = JSON.stringify(combination);
    if (!rowOf.has(key)) rowOf.set(key, rowOf.size);
    Object.assign(variant, {
      cell: { row: rowOf.get(key) ?? 0, column: skemo.states.indexOf(state ?? "") },
    });
  }
  const cell = parityPx(base[VITRINO_CELL_PADDING]?.value);
  const structure = structureOf(skemo.a11y.role);
  // A toggle shows the words of its text slots besides the label, as the field does (Spec 010 ②):
  // the checkbox its error; the switch has none.
  const toggleTexts = Object.fromEntries(
    skemo.slots
      .filter((slot) => slot.default !== true && slot.text === true && slot.entry === undefined)
      .flatMap((slot) => {
        const text = VITRINO_SLOT_TEXTS[slot.name];
        return text === undefined ? [] : [[slot.name, text]];
      }),
  );
  // The sign of the indicator: the check mark, the dot, and the chevron of a select's field
  // (Spec 010 ④, D-07); a text field has none.
  const sign = signOf(skemo.a11y.role, "16");
  // The options of a choice (Spec 010 ③, D-07): the Vitrino's words, the first chosen.
  const [entryKey] = entryKeys;
  const options =
    structure === "choice" && entryKey !== undefined
      ? { key: entryKey, texts: [...VITRINO_OPTIONS], selected: 0 }
      : undefined;
  return {
    set: entry.ero.name,
    structure,
    ...(structure === "field"
      ? { texts: { ...(skemo.a11y.role === "combobox" ? SELECT_TEXTS : FIELD_TEXTS) } }
      : {}),
    ...((structure === "toggle" || structure === "choice") && Object.keys(toggleTexts).length > 0
      ? { texts: toggleTexts }
      : {}),
    ...(sign === undefined ? {} : { sign }),
    ...(options === undefined ? {} : { entry: options }),
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
    label: { property: "label", defaultValue: labelDefaultOf(skemo.a11y.role) },
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
 * The Figma font of a typography value: the first family of its stack — the others (system-ui,
 * sans-serif) are fallbacks of the browser — and the style of its weight.
 */
function fontOf(value: unknown): { family: string; style: string } | undefined {
  const typography = value as { fontFamily?: unknown; fontWeight?: unknown } | undefined;
  const stack = typography?.fontFamily;
  const family = Array.isArray(stack) ? stack[0] : stack;
  const weight = typeof typography?.fontWeight === "number" ? typography.fontWeight : 400;
  if (typeof family !== "string") return undefined;
  return { family, style: FONT_STYLES[Math.round(weight / 100) * 100] ?? "Regular" };
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
    const base = baseResolution(modelo);
    const gap = parityPx(base[SET_GAP]?.value);
    const plan: FigmaPlan = {
      fundamento: modeloJson.fundamento.version,
      fontFallback: FIGMA_FONT_FALLBACK,
      collections,
      components: modelo.eroj.map((entry) =>
        componentSetOf(
          entry,
          modeloJson.fundamento.version,
          allResolutions(modelo),
          base,
          modelo.reguloj,
        ),
      ),
      section: { name: FIGMA_SECTION, gap, padding: gap, frame: FIGMA_SET_FRAME },
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

/**
 * What the Figma plan states about the components (Spec 003 T021, FR-12): every component
 * property with its values (`BOOLEAN` and `TEXT` as the kinds they stand for) and the state
 * property as the states. Read from `plan.json`, the file the plugin applies.
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
      else props[name] = [values === "BOOLEAN" ? "boolean" : "string"];
    }
    const states = component.properties[STATE_KEY];
    // F8: the side states what the plugin applies — the paint with its deckkraft, or the marker
    // for a binding whose alpha is not the same in every mode.
    const values: Record<string, string> = {};
    for (const variant of component.variants ?? []) {
      const at = `@${parityVariantKey(variant.props)}`;
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
      ];
      for (const { props, part } of sides) {
        const where = `@${parityVariantKey(props)}`;
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
