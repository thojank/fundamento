// The Skemo side of the parity comparison (Spec 003 T021, FR-12, D-15, AK-04).
//
// Every Celo writes, next to its projection, an inventory of what it emitted: the props with their
// values, the states and named values such as the defaults (`parity/<side>.json`). The Skemo is
// the side all of them are compared with, and this module states it. Reading a projection is Celo
// knowledge and stays in `@fundamento/projekcioj` (Art. VIII); only the comparison lives here.

import type { ParityInventory, ParityItem } from "../checks/parity/inventory.js";
import type {
  LoadedEro,
  Skemo,
  SkemoPartProperty,
  SkemoPartSource,
  SkemoProp,
} from "../contracts/modelo.js";
import { STATE_KEY } from "./skemo-rules.js";

/** What a side of the comparison restates; a side that has no states compares props only. */
export const PARITY_ASPECTS = ["props", "states", "values"] as const;

export type ParityAspect = (typeof PARITY_ASPECTS)[number];

export interface SkemoInventoryOptions {
  /** Defaults to every aspect. */
  aspects?: readonly ParityAspect[];
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
      values: aspects.includes("values") ? { ...item.values } : {},
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
    items[entry.ero.name] = { props, states: [...skemo.states], values };
  }
  return restrictParityInventory({ items }, aspects);
}
