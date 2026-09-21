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
  allResolutions,
  alphaOf,
  baseResolution,
  boundToken,
  combinationsOf,
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
  readDtcgColor,
  STATE_KEY,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import { VITRINO_SURFACE } from "../vitrino/datumoj.js";
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
  modes: string[];
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
};

export interface FigmaComponentSet {
  set: string;
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
    /** Whether this variant shows the focus ring (F11); the space for it is always reserved. */
    focusVisible?: boolean;
    /** Corner radii of the ring and its gap: the control's radius grown by what lies inside. */
    radii?: { "focus-ring": number; "focus-gap": number };
    /** The font of the label, from its typography token: family and the style of its weight. */
    font?: { family: string; style: string };
    /**
     * The cell of the variant in the grid, as the Vitrino orders it: the row is its combination of
     * the keyed props (variant × tone × size) in the order of the plan, the column its state.
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
   * The ground the set stands on: the Vitrino's surface, as a variable, so it follows color-scheme
   * and contrast (F16). The deckkraft is decided over every combination, like every paint (F8).
   */
  surface?: { variable: string; opacity: number };
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
}

/** The single-mode collection of everything no Dimensio changes, and its mode. */
const BASE_COLLECTION = "fundamento";
const BASE_MODE = "value";

/** Composite fields Figma gets as separate variables (Figma variables hold no composites). */
const COMPOSITE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  typography: ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight"],
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
  // A value that is no list is the first (and only) layer: one Aspekto may have one shadow layer
  // where another has two.
  const layers = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const layer = field === kind ? value : layers[Number(field.slice(0, field.indexOf("/"))) - 1];
  if (layer === undefined) {
    return kind === "color"
      ? { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 }
      : { value: 0, unit: "px" };
  }
  return (layer as Record<string, unknown>)[kind];
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
      return (Array.isArray(value) ? value : [value]).map(String).join(", ");
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
function dimensiojOf(modelo: Modelo): { name: string; modes: string[] }[] {
  return modelo.dimensioj.map((dimensio) => ({
    name: dimensio.name,
    modes: (dimensio.valoroj ?? []).map((valoro) => valoro.name),
  }));
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
): FigmaComponentSet {
  const skemo = entry.skemo;
  const properties: FigmaComponentSet["properties"] = {};
  for (const prop of skemo.props) {
    if (prop.kind === "enum") properties[prop.name] = [...(prop.values ?? [])];
    else if (prop.kind === "boolean") properties[prop.name] = "BOOLEAN";
    else properties[prop.name] = "TEXT";
  }
  properties.state = [...skemo.states];
  // Variants exist for what changes the appearance: the props the parts are keyed by, and state.
  // `type`, for example, is behaviour in a form and would only multiply the set.
  const keyed = new Set<string>();
  for (const partProperties of Object.values(skemo.parts)) {
    for (const source of Object.values(partProperties)) {
      if (source !== undefined && "by" in source) for (const key of source.by) keyed.add(key);
    }
  }
  const keys = [
    ...skemo.props
      .filter((prop) => prop.kind === "enum" && keyed.has(prop.name))
      .map((prop) => prop.name),
    "state",
  ];
  const drawn = new Set(DRAWN_PART_PROPERTIES);
  const variants = combinationsOf(skemo, keys).map((combination) => {
    const bindings: Record<string, string> = {};
    const paints: Record<string, FigmaPaint> = {};
    const geometry: Record<string, string> = {};
    const notDrawn: Record<string, string> = {};
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      for (const property of Object.keys(partProperties)) {
        const bound = boundToken(skemo, part, property, combination);
        if (bound === undefined) continue;
        const key = `${part}.${property}`;
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
    // The focus ring (F11). Its colour sits in a field of a composite token and is compared by
    // no side, so it is kept out of the parity inventory (only colour-typed parts are reported).
    const ring = boundToken(skemo, "focus-ring", "ring", combination);
    if (ring !== undefined) {
      const paint = paintOf(ring.token, resolutions, base, "color");
      if (paint !== undefined) paints["focus-ring.ring"] = paint;
    }
    const px = (part: string, property: string, field?: string): number => {
      const bound = boundToken(skemo, part, property, combination);
      const value = bound === undefined ? undefined : base[bound.token]?.value;
      const measure = field === undefined ? value : (value as Record<string, unknown>)?.[field];
      return typeof (measure as { value?: unknown })?.value === "number"
        ? (measure as { value: number }).value
        : 0;
    };
    const gapRadius = px("box", "radius") + px("focus-ring", "offset");
    const radii = {
      "focus-gap": gapRadius,
      "focus-ring": gapRadius + px("focus-ring", "ring", "width"),
    };
    const typography = boundToken(skemo, "label", "typography", combination);
    const font = fontOf(typography === undefined ? undefined : base[typography.token]?.value);
    return {
      props: { ...combination },
      bindings,
      paints,
      geometry,
      notDrawn,
      focusVisible: combination[STATE_KEY] === FOCUS_STATE,
      radii,
      ...(font === undefined ? {} : { font }),
    };
  });
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
  return {
    set: entry.ero.name,
    properties,
    variants,
    pluginData: { fundamento: { ero: entry.ero.name, skemo: skemo.id, version } },
    grid: {
      rows: rowOf.size,
      columns,
      gap: 2 * cell,
      padding: cell,
    },
    label: { property: "label", defaultValue: LABEL_DEFAULT },
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

/** The neutral word every label template shows; instances override it (Maintainer, F14). */
const LABEL_DEFAULT = "Aktion";

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
    const collections: FigmaCollection[] = [
      {
        name: BASE_COLLECTION,
        modes: [BASE_MODE],
        variables: sortVariables(variables.get(BASE_COLLECTION) ?? []),
      },
      ...dimensiojOf(modelo).map((dimensio) => ({
        name: dimensio.name,
        modes: dimensio.modes,
        variables: sortVariables(variables.get(dimensio.name) ?? []),
      })),
    ];
    const plan: FigmaPlan = {
      fundamento: modeloJson.fundamento.version,
      fontFallback: FIGMA_FONT_FALLBACK,
      collections,
      components: modelo.eroj.map((entry) =>
        componentSetOf(
          entry,
          modeloJson.fundamento.version,
          allResolutions(modelo),
          baseResolution(modelo),
        ),
      ),
    };
    return [
      { path: "figma/plan.json", text: `${JSON.stringify(plan, null, 2)}\n` },
      { path: "figma/plugin/manifest.json", text: pluginManifest(plan) },
      { path: "figma/plugin/code.js", text: pluginSource(plan) },
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
      for (const [key, text] of Object.entries(variant.geometry ?? {}))
        values[`${key}${at}`] = text;
      for (const [key, jugxo] of Object.entries(variant.notDrawn ?? {})) {
        values[`${key}${at}`] = `${PARITY_NOT_DRAWN} (${jugxo})`;
      }
      for (const [binding, paint] of Object.entries(variant.paints ?? {})) {
        // Only colour parts are compared; a colour inside a composite (the ring) is drawn, not
        // reported.
        const property = binding.slice(binding.lastIndexOf(".") + 1);
        if (PART_PROPERTY_TYPES[property as keyof typeof PART_PROPERTY_TYPES] !== "color") continue;
        values[`${binding}@${parityVariantKey(variant.props)}`] =
          "alphaVariesByMode" in paint
            ? `${ALPHA_VARIES} (${variant.bindings[binding]})`
            : parityColorText({
                colorSpace: "srgb",
                components: [0, 0, 0],
                alpha: paint.opacity,
                hex: paint.hex,
              });
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
