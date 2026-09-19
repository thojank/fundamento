// Parity (Art. X gate 2, S5.2): a generic comparator of two normalized inventories of props,
// states and values. Phase 0 has no real inventories (Figma / Code Connect come later); the
// comparator is pure so later phases can feed it whatever they extract.

import { formatIssuePath, type ValidationIssue } from "../../contracts/issues.js";
import { appendPointer } from "../../json/pointer.js";

export interface ParityItem {
  /** Prop name → allowed values. Order and duplicates are insignificant. */
  props: Record<string, string[]>;
  /** State names. Order and duplicates are insignificant. */
  states: string[];
  /** Value name → value. */
  values: Record<string, string>;
}

export interface ParityInventory {
  items: Record<string, ParityItem>;
}

/** The only inventory Phase 0 has. Treat as read-only. */
export const EMPTY_PARITY_INVENTORY: ParityInventory = { items: {} };

export interface CompareInventoriesOptions {
  /** How the two sides are named in messages; defaults to `["a", "b"]`. */
  labels?: readonly [string, string];
}

/** Whitespace is insignificant: trim, and collapse inner runs to one space. */
export function normalizeParityText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

const byCodePoint = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const normalizedList = (list: readonly string[]): string[] =>
  [...new Set(list.map(normalizeParityText))].sort(byCodePoint);

interface MergedItem {
  props: Map<string, string[]>;
  states: string[];
  values: Map<string, string>;
}

/**
 * Canonical form of an inventory: every name and value normalized with `normalizeParityText`,
 * lists deduplicated and sorted, keys sorted. Pure and idempotent. Keys that only differ in
 * whitespace are merged (lists united; for values the last key in code-point order wins);
 * `parseParityInventory` rejects such input, so files never merge silently.
 */
export function normalizeInventory(inventory: ParityInventory): ParityInventory {
  const merged = new Map<string, MergedItem>();
  for (const rawName of Object.keys(inventory.items).sort(byCodePoint)) {
    const item = inventory.items[rawName];
    if (item === undefined) {
      continue;
    }
    const name = normalizeParityText(rawName);
    const target: MergedItem = merged.get(name) ?? {
      props: new Map(),
      states: [],
      values: new Map(),
    };
    merged.set(name, target);
    for (const rawProp of Object.keys(item.props).sort(byCodePoint)) {
      const prop = normalizeParityText(rawProp);
      target.props.set(prop, [...(target.props.get(prop) ?? []), ...(item.props[rawProp] ?? [])]);
    }
    target.states.push(...item.states);
    for (const rawKey of Object.keys(item.values).sort(byCodePoint)) {
      const value = item.values[rawKey];
      if (value !== undefined) {
        target.values.set(normalizeParityText(rawKey), normalizeParityText(value));
      }
    }
  }

  const items: Record<string, ParityItem> = {};
  for (const name of [...merged.keys()].sort(byCodePoint)) {
    const item = merged.get(name);
    if (item === undefined) {
      continue;
    }
    const props: Record<string, string[]> = {};
    for (const prop of [...item.props.keys()].sort(byCodePoint)) {
      props[prop] = normalizedList(item.props.get(prop) ?? []);
    }
    const values: Record<string, string> = {};
    for (const key of [...item.values.keys()].sort(byCodePoint)) {
      const value = item.values.get(key);
      if (value !== undefined) {
        values[key] = value;
      }
    }
    items[name] = { props, states: normalizedList(item.states), values };
  }
  return { items };
}

const PLAIN_SEGMENT = /^[A-Za-z0-9_$-]+$/;

/**
 * Dotted logical path of a parity finding, e.g. `items.x.props.variant`. Segments that are not
 * plain identifiers (dots, spaces, …) are written as `["…"]` so the path stays unambiguous.
 */
export function formatParityPath(segments: readonly string[]): string {
  return segments
    .map((segment, index) => {
      if (PLAIN_SEGMENT.test(segment)) {
        return index === 0 ? segment : `.${segment}`;
      }
      return `[${JSON.stringify(segment)}]`;
    })
    .join("");
}

const listText = (list: readonly string[]): string => `[${list.join(", ")}]`;

const onlyIn = (list: readonly string[], other: readonly string[]): string[] =>
  list.filter((entry) => !other.includes(entry));

const sameList = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);

function compareIssues(a: ValidationIssue, b: ValidationIssue): number {
  return byCodePoint(a.path, b.path) || byCodePoint(a.rule, b.rule);
}

/**
 * Compares two inventories after normalizing both. Returns one error per difference, sorted by
 * path: `parity-item-missing` (`items.<item>`), `parity-prop-mismatch`
 * (`items.<item>.props.<prop>`), `parity-state-mismatch` (`items.<item>.states.<state>`) and
 * `parity-value-mismatch` (`items.<item>.values.<key>`). Symmetric apart from message wording.
 */
export function compareInventories(
  a: ParityInventory,
  b: ParityInventory,
  options: CompareInventoriesOptions = {},
): ValidationIssue[] {
  const [labelA, labelB] = options.labels ?? ["a", "b"];
  const left = normalizeInventory(a);
  const right = normalizeInventory(b);
  const issues: ValidationIssue[] = [];
  const add = (
    rule: ValidationIssue["rule"],
    segments: string[],
    message: string,
    suggestion: string,
  ): void => {
    issues.push({ rule, severity: "error", path: formatParityPath(segments), message, suggestion });
  };

  const names = [...new Set([...Object.keys(left.items), ...Object.keys(right.items)])];
  for (const name of names) {
    const itemA = left.items[name];
    const itemB = right.items[name];
    if (itemA === undefined || itemB === undefined) {
      const [has, lacks] = itemA === undefined ? [labelB, labelA] : [labelA, labelB];
      add(
        "parity-item-missing",
        ["items", name],
        `Item "${name}" exists in ${has} but not in ${lacks}.`,
        `Add item "${name}" to ${lacks}, or remove it from ${has}.`,
      );
      continue;
    }

    const props = [...new Set([...Object.keys(itemA.props), ...Object.keys(itemB.props)])];
    for (const prop of props) {
      const listA = itemA.props[prop];
      const listB = itemB.props[prop];
      if (listA !== undefined && listB !== undefined && sameList(listA, listB)) {
        continue;
      }
      const describe = (label: string, list: string[] | undefined): string =>
        list === undefined ? `${label} does not declare it` : `${label} has ${listText(list)}`;
      const detail =
        listA !== undefined && listB !== undefined
          ? ` (only in ${labelA}: ${listText(onlyIn(listA, listB))}; only in ${labelB}: ${listText(onlyIn(listB, listA))})`
          : "";
      add(
        "parity-prop-mismatch",
        ["items", name, "props", prop],
        `Prop "${prop}" of item "${name}" differs: ${describe(labelA, listA)}, ${describe(labelB, listB)}${detail}.`,
        `Declare prop "${prop}" with the same values in ${labelA} and ${labelB}.`,
      );
    }

    for (const state of [
      ...onlyIn(itemA.states, itemB.states),
      ...onlyIn(itemB.states, itemA.states),
    ]) {
      const [has, lacks] = itemA.states.includes(state) ? [labelA, labelB] : [labelB, labelA];
      add(
        "parity-state-mismatch",
        ["items", name, "states", state],
        `State "${state}" of item "${name}" exists in ${has} but not in ${lacks}.`,
        `Add state "${state}" to item "${name}" in ${lacks}, or remove it from ${has}.`,
      );
    }

    const keys = [...new Set([...Object.keys(itemA.values), ...Object.keys(itemB.values)])];
    for (const key of keys) {
      const valueA = itemA.values[key];
      const valueB = itemB.values[key];
      if (valueA === valueB) {
        continue;
      }
      const describe = (label: string, value: string | undefined): string =>
        value === undefined
          ? `${label} does not declare it`
          : `${label} has ${JSON.stringify(value)}`;
      add(
        "parity-value-mismatch",
        ["items", name, "values", key],
        `Value "${key}" of item "${name}" differs: ${describe(labelA, valueA)}, ${describe(labelB, valueB)}.`,
        `Give value "${key}" of item "${name}" the same value in ${labelA} and ${labelB}.`,
      );
    }
  }
  return issues.sort(compareIssues);
}

export interface ParseParityInventoryResult {
  /** Present only when `issues` is empty. */
  inventory?: ParityInventory;
  issues: ValidationIssue[];
}

const INVENTORY_SHAPE =
  "{ items: { <item>: { props: { <prop>: string[] }, states: string[], values: { <key>: string } } } }";
const ITEM_FIELDS = ["props", "states", "values"] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Structural validation of a strictly parsed inventory file (`value` from `parseStrictJson`).
 * Every problem is a `schema-violation` at `<file>#<pointer>`: wrong types, missing or unknown
 * fields, names that are empty after normalization, and keys that collide after normalization.
 */
export function parseParityInventory(value: unknown, file: string): ParseParityInventoryResult {
  const issues: ValidationIssue[] = [];
  const violation = (pointer: string, message: string): void => {
    issues.push({
      rule: "schema-violation",
      severity: "error",
      path: formatIssuePath({ file, pointer }),
      message: `${file}: ${message}`,
      suggestion: `Make ${file} a parity inventory of the shape ${INVENTORY_SHAPE}.`,
    });
  };

  /** Checks the keys of an object for empty names and whitespace collisions. */
  const checkKeys = (object: Record<string, unknown>, pointer: string, what: string): void => {
    const seen = new Map<string, string>();
    for (const key of Object.keys(object)) {
      const normalized = normalizeParityText(key);
      const keyPointer = appendPointer(pointer, key);
      if (normalized === "") {
        violation(keyPointer, `${what} name ${JSON.stringify(key)} is empty.`);
        continue;
      }
      const earlier = seen.get(normalized);
      if (earlier !== undefined) {
        violation(
          keyPointer,
          `${what} name ${JSON.stringify(key)} is the same as ${JSON.stringify(earlier)} once whitespace is ignored.`,
        );
        continue;
      }
      seen.set(normalized, key);
    }
  };

  const checkStringList = (list: unknown, pointer: string, what: string): void => {
    if (!Array.isArray(list)) {
      violation(pointer, `${what} must be an array of strings.`);
      return;
    }
    list.forEach((entry: unknown, index) => {
      if (typeof entry !== "string") {
        violation(appendPointer(pointer, index), `${what} entry must be a string.`);
      } else if (normalizeParityText(entry) === "") {
        violation(appendPointer(pointer, index), `${what} entry is empty.`);
      }
    });
  };

  if (!isPlainObject(value)) {
    violation("", "the root must be an object with an `items` object.");
    return { issues };
  }
  for (const key of Object.keys(value)) {
    if (key !== "items") {
      violation(
        appendPointer("", key),
        `unknown root field ${JSON.stringify(key)}; only \`items\` is allowed.`,
      );
    }
  }
  const items = value.items;
  if (items === undefined) {
    violation("", "the root has no `items` object.");
    return { issues };
  }
  if (!isPlainObject(items)) {
    violation("/items", "`items` must be an object keyed by item name.");
    return { issues };
  }
  checkKeys(items, "/items", "Item");

  for (const [name, item] of Object.entries(items)) {
    const itemPointer = appendPointer("/items", name);
    if (!isPlainObject(item)) {
      violation(
        itemPointer,
        `item ${JSON.stringify(name)} must be an object with props, states and values.`,
      );
      continue;
    }
    const missing = ITEM_FIELDS.filter((field) => !(field in item));
    if (missing.length > 0) {
      violation(
        itemPointer,
        `item ${JSON.stringify(name)} is missing ${missing.map((field) => `\`${field}\``).join(", ")}.`,
      );
    }
    for (const key of Object.keys(item)) {
      if (!(ITEM_FIELDS as readonly string[]).includes(key)) {
        violation(
          appendPointer(itemPointer, key),
          `unknown field ${JSON.stringify(key)} in item ${JSON.stringify(name)}; allowed are props, states and values.`,
        );
      }
    }

    const props = item.props;
    const propsPointer = appendPointer(itemPointer, "props");
    if (props !== undefined) {
      if (isPlainObject(props)) {
        checkKeys(props, propsPointer, "Prop");
        for (const [prop, list] of Object.entries(props)) {
          checkStringList(list, appendPointer(propsPointer, prop), `prop ${JSON.stringify(prop)}`);
        }
      } else {
        violation(propsPointer, "`props` must be an object of string arrays.");
      }
    }

    if (item.states !== undefined) {
      checkStringList(item.states, appendPointer(itemPointer, "states"), "`states`");
    }

    const values = item.values;
    const valuesPointer = appendPointer(itemPointer, "values");
    if (values !== undefined) {
      if (isPlainObject(values)) {
        checkKeys(values, valuesPointer, "Value");
        for (const [key, entry] of Object.entries(values)) {
          if (typeof entry !== "string") {
            violation(
              appendPointer(valuesPointer, key),
              `value ${JSON.stringify(key)} must be a string.`,
            );
          }
        }
      } else {
        violation(valuesPointer, "`values` must be an object of strings.");
      }
    }
  }

  if (issues.length > 0) {
    return { issues };
  }
  // Every field was checked above, so the value has the inventory shape.
  return { inventory: value as unknown as ParityInventory, issues };
}
