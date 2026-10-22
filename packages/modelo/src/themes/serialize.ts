// Canonical JSON text of the derived Tokens-Studio files. Pure.

import type { DerivedThemes } from "./derive.js";

// A plain loop, not `Object.fromEntries` over mapped pairs: the rezolvoj of a Modelo with the
// third level are a thousand tokens by a hundred combinations (B-16), and the copy is a third of
// the export's time.
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    const copy: unknown[] = new Array(value.length);
    for (let index = 0; index < value.length; index++) copy[index] = sortKeysDeep(value[index]);
    return copy;
  }
  if (typeof value === "object" && value !== null) {
    const copy: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort())
      copy[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    return copy;
  }
  return value;
}

/**
 * Canonical JSON: object keys sorted (code-point order) at every level, arrays in their given
 * (semantic) order, 2-space indent, trailing newline.
 */
export function serializeCanonicalJson(value: unknown): string {
  return `${JSON.stringify(sortKeysDeep(value), null, 2)}\n`;
}

/** The exact bytes `pnpm vortaro:themes` writes to `$themes.json` and `$metadata.json`. */
export function serializeThemes(derived: DerivedThemes): {
  themesJson: string;
  metadataJson: string;
} {
  return {
    themesJson: serializeCanonicalJson(derived.themes),
    metadataJson: serializeCanonicalJson(derived.metadata),
  };
}
