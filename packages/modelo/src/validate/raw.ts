// Helpers over raw (parsed, unvalidated) Modelo JSON, shared by the validation rules. Pure.

import { FUNDAMENTO_EXTENSION_KEY } from "../contracts/dtcg.js";
import { appendPointer } from "../json/pointer.js";
import { isJsonObject, type JsonObject } from "../load/guards.js";

export { isJsonObject, type JsonObject };

/** Pointer suffix of the Fundamento extension object inside a token, group or set root. */
export const EXTENSION_POINTER = `/$extensions/${FUNDAMENTO_EXTENSION_KEY.replaceAll("~", "~0").replaceAll("/", "~1")}`;

/**
 * Visits every token (object with `$value`) of a raw DTCG set tree, in document order, with its
 * path segments and JSON Pointer. Unlike the loader it ignores types, so tokens with an unknown
 * or missing type are visited too.
 */
export function walkRawTokens(
  tree: unknown,
  visit: (token: JsonObject, segments: readonly string[], pointer: string) => void,
): void {
  const walk = (group: JsonObject, segments: readonly string[], pointer: string): void => {
    for (const [key, child] of Object.entries(group)) {
      if (key.startsWith("$") || !isJsonObject(child)) {
        continue;
      }
      const childSegments = [...segments, key];
      const childPointer = appendPointer(pointer, key);
      if ("$value" in child) {
        visit(child, childSegments, childPointer);
      } else {
        walk(child, childSegments, childPointer);
      }
    }
  };
  if (isJsonObject(tree)) {
    walk(tree, [], "");
  }
}

/** Splits an RFC 6901 pointer into unescaped segments (`""` gives `[]`). */
export function pointerSegments(pointer: string): string[] {
  if (pointer === "") {
    return [];
  }
  return pointer
    .slice(1)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
}

/** The value at `pointer` inside `document`, or `undefined` if the pointer leads nowhere. */
export function valueAtPointer(document: unknown, pointer: string): unknown {
  let current = document;
  for (const segment of pointerSegments(pointer)) {
    if (Array.isArray(current)) {
      current = current[Number(segment)];
    } else if (isJsonObject(current) && Object.hasOwn(current, segment)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

/** The object entries of the array `document[key]`, each with its index (non-objects skipped). */
export function rawEntries(document: unknown, key: string): { entry: JsonObject; index: number }[] {
  const list = isJsonObject(document) ? document[key] : undefined;
  if (!Array.isArray(list)) {
    return [];
  }
  return list.flatMap((entry: unknown, index) => (isJsonObject(entry) ? [{ entry, index }] : []));
}

export function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
