// The Skemo side of the parity comparison (Spec 003 T021, FR-12, D-15, AK-04).
//
// Every Celo writes, next to its projection, an inventory of what it emitted: the props with their
// values, the states and named values such as the defaults (`parity/<side>.json`). The Skemo is
// the side all of them are compared with, and this module states it. Reading a projection is Celo
// knowledge and stays in `@fundamento/projekcioj` (Art. VIII); only the comparison lives here.

import { alphaOf, readDtcgColor } from "../checks/alirebleco/color.js";
import type { ParityInventory, ParityItem } from "../checks/parity/inventory.js";
import type {
  LoadedEro,
  Modelo,
  ResolvedToken,
  Skemo,
  SkemoPartProperty,
  SkemoPartSource,
  SkemoProp,
} from "../contracts/modelo.js";
import type { ColorValue } from "../generated/modelo-schema.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolveCombination } from "../resolve/resolve.js";
import { boundToken, combinationsOf, PART_PROPERTY_TYPES, STATE_KEY } from "./skemo-rules.js";

/**
 * What a side of the comparison restates; a side that has no states compares props only. `values`
 * are the named values a side documents (`default.<prop>`), `paints` the resolved colours per
 * variant and part (`<part>.<property>@<variant>`, F8). Both live in the same `values` map of the
 * file; the key shape says which aspect a value belongs to.
 */
export const PARITY_ASPECTS = ["props", "states", "values", "paints", "geometry"] as const;

/**
 * The aspect a value key belongs to. Without `@` it is a documented default (`default.<prop>`);
 * with `@` it is a resolved part value per variant (`<part>.<property>@<variant>`), a colour
 * (`paints`, F8) or a measure (`geometry`, F11) by the type of the part property.
 */
export function parityAspectOfKey(key: string): "values" | "paints" | "geometry" {
  const at = key.indexOf("@");
  if (at === -1) return "values";
  const property = key.slice(key.lastIndexOf(".", at) + 1, at) as SkemoPartProperty;
  return PART_PROPERTY_TYPES[property] === "color" ? "paints" : "geometry";
}

/** A resolved part colour, not a documented default: `surface.fill@size=…,state=…`. */
export const isParityPaintKey = (key: string): boolean => parityAspectOfKey(key) === "paints";

/**
 * What a side writes for a part it does not draw. Followed by the ID of the Jugxo that releases
 * the difference, in parentheses, it is a named and released difference — a warning; without one
 * it is an ordinary mismatch (Paket „Figma zeigt das Ero", 2026-09-21).
 */
export const PARITY_NOT_DRAWN = "not drawn";

/**
 * What a side writes for a binding it cannot express because the alpha of the token is not the
 * same in every mode (F8). The comparison treats it as a named difference, never as equal: the
 * Modelo keeps its value, the projection says it cannot show it.
 */
export const PARITY_ALPHA_VARIES = "alpha varies by mode";

export type ParityAspect = (typeof PARITY_ASPECTS)[number];

export interface SkemoInventoryOptions {
  /** Defaults to every aspect. */
  aspects?: readonly ParityAspect[];
  /**
   * Resolved tokens of the base combination. With them the inventory states the colour every
   * projection has to show, per variant and part — the values F8 showed a projection can lose
   * (Abnahme M1). Without them the inventory keeps only the defaults, as before.
   */
  resolved?: Readonly<Record<string, ResolvedToken>>;
  /**
   * `all` (default) takes every prop; `styled` takes only the props a part binding is keyed by,
   * the ones a stylesheet can express.
   */
  props?: "all" | "styled";
}

/** A prop's values: the enum values, or the kind for a prop without a value list. */
export function propValues(prop: SkemoProp): string[] {
  return prop.kind === "enum" ? [...(prop.values ?? [])] : [prop.kind];
}

/** The keys a part property is keyed by, following `sameAs` (bounded against a cycle). */
function keysOf(skemo: Skemo, source: SkemoPartSource | undefined, depth = 0): string[] {
  if (source === undefined || depth > 8) return [];
  if ("by" in source) return [...source.by];
  if ("sameAs" in source) {
    const [part = "", property = ""] = source.sameAs.split(".");
    return keysOf(skemo, skemo.parts[part]?.[property as SkemoPartProperty], depth + 1);
  }
  return [];
}

/**
 * The props any part binding is keyed by, without the state key: what a projection of the Skemo's
 * appearance (a stylesheet, a variant set) has to distinguish.
 */
export function styledProps(skemo: Skemo): string[] {
  const keys = new Set<string>();
  for (const properties of Object.values(skemo.parts)) {
    for (const source of Object.values(properties)) {
      for (const key of keysOf(skemo, source)) {
        if (key !== STATE_KEY) keys.add(key);
      }
    }
  }
  return skemo.props.filter((prop) => keys.has(prop.name)).map((prop) => prop.name);
}

/** Keeps only the aspects a side restates; the others become empty. */
export function restrictParityInventory(
  inventory: ParityInventory,
  aspects: readonly ParityAspect[],
): ParityInventory {
  const items: Record<string, ParityItem> = {};
  for (const [name, item] of Object.entries(inventory.items)) {
    items[name] = {
      props: aspects.includes("props") ? item.props : {},
      states: aspects.includes("states") ? [...item.states] : [],
      values: Object.fromEntries(
        Object.entries(item.values).filter(([key]) => aspects.includes(parityAspectOfKey(key))),
      ),
    };
  }
  return { items };
}

/**
 * The inventory of the Skemoj: one item per Ero, its props with their values, its states and its
 * defaults as `default.<prop>`. A prop without a default has no entry, so a side that writes no
 * default matches it.
 */
export function skemoParityInventory(
  eroj: readonly LoadedEro[],
  options: SkemoInventoryOptions = {},
): ParityInventory {
  const aspects = options.aspects ?? PARITY_ASPECTS;
  const items: Record<string, ParityItem> = {};
  for (const entry of eroj) {
    const { skemo } = entry;
    const styled = options.props === "styled" ? new Set(styledProps(skemo)) : undefined;
    const props: Record<string, string[]> = {};
    const values: Record<string, string> = {};
    for (const prop of skemo.props) {
      if (styled !== undefined && !styled.has(prop.name)) continue;
      props[prop.name] = propValues(prop);
      if (prop.default !== undefined) values[`default.${prop.name}`] = String(prop.default);
    }
    if (options.resolved !== undefined) {
      Object.assign(values, skemoPartValues(skemo, options.resolved));
    }
    items[entry.ero.name] = { props, states: [...skemo.states], values };
  }
  return restrictParityInventory({ items }, aspects);
}

/** The resolved tokens of the base combination: every Dimensio at its default (Spec 003 T021). */
export function baseResolution(modelo: Modelo): Readonly<Record<string, ResolvedToken>> {
  const base: Record<string, string> = {};
  for (const dimensio of modelo.dimensioj) base[dimensio.name] = dimensio.default;
  return resolveCombination(modelo, base).tokens;
}

type Resolutions = {
  assignment: Record<string, string>;
  tokens: Readonly<Record<string, ResolvedToken>>;
}[];

/**
 * Resolving every combination is the most expensive thing a projection does, and a Celo needs the
 * same view several times (the paints of a component, the fields of a composite). The result only
 * depends on the Modelo, so it is kept per Modelo. Callers read it, they never change it.
 */
const resolutionsCache: WeakMap<Modelo, Resolutions> = new WeakMap();

/** Every combination of every Dimensio, resolved — the view a decision over all modes needs. */
export function allResolutions(modelo: Modelo): Resolutions {
  const cached = resolutionsCache.get(modelo);
  if (cached !== undefined) return cached;
  const resolutions = allAssignments(modelo).map((assignment) => ({
    assignment,
    tokens: resolveCombination(modelo, assignment).tokens,
  }));
  resolutionsCache.set(modelo, resolutions);
  return resolutions;
}

const colorText = (value: unknown): string | undefined => {
  const color = readDtcgColor(value);
  return color === undefined ? undefined : parityColorText(color);
};

/** A resolved DTCG dimension as canonical text: `40px`. Anything else has no text. */
export function parityDimensionText(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { value: amount, unit } = value as { value?: unknown; unit?: unknown };
  if (typeof amount !== "number" || typeof unit !== "string") return undefined;
  return `${Number(amount.toFixed(4))}${unit}`;
}

/** `#rrggbb` for an opaque colour, `#rrggbb/<alpha>` for a translucent one. Canonical text. */
export function parityColorText(color: ColorValue): string {
  const channel = (component: number | "none"): string =>
    Math.round((component === "none" ? 0 : component) * 255)
      .toString(16)
      .padStart(2, "0");
  const hex =
    typeof color.hex === "string"
      ? color.hex.toLowerCase().slice(0, 7)
      : `#${color.components.map(channel).join("")}`;
  const alpha = alphaOf(color);
  return alpha >= 1 ? hex : `${hex}/${Number(alpha.toFixed(4))}`;
}

/** The variant name a value key carries: every keyed prop and the state, in canonical order. */
export function parityVariantKey(combination: Readonly<Record<string, string>>): string {
  return Object.keys(combination)
    .sort()
    .map((key) => `${key}=${combination[key]}`)
    .join(",");
}

/** The keys a Skemo varies its part bindings by: the keyed enum props and the state. */
function variantKeys(skemo: Skemo): string[] {
  const keyed = new Set<string>();
  for (const partProperties of Object.values(skemo.parts)) {
    for (const source of Object.values(partProperties)) {
      if (source !== undefined && "by" in source) for (const key of source.by) keyed.add(key);
    }
  }
  return [
    ...skemo.props
      .filter((prop) => prop.kind === "enum" && keyed.has(prop.name))
      .map((prop) => prop.name),
    STATE_KEY,
  ];
}

/**
 * Per variant and colour-bearing part property, the resolved colour as canonical text. A
 * projection that shows something else — a lost alpha, a wrong step — differs here, and
 * `check:parity` says so (F8).
 */
export function skemoPartValues(
  skemo: Skemo,
  resolved: Readonly<Record<string, ResolvedToken>>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const combination of combinationsOf(skemo, variantKeys(skemo))) {
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      for (const property of Object.keys(partProperties)) {
        const type = PART_PROPERTY_TYPES[property as SkemoPartProperty];
        if (type !== "color" && type !== "dimension") continue;
        const bound = boundToken(skemo, part, property, combination);
        if (bound === undefined) continue;
        const key = `${part}.${property}@${parityVariantKey(combination)}`;
        const value = resolved[bound.token]?.value;
        const text = type === "color" ? colorText(value) : parityDimensionText(value);
        if (text !== undefined) values[key] = text;
      }
    }
  }
  return values;
}
