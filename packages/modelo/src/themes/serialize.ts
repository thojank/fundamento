// Canonical JSON text of the derived Tokens-Studio files. Pure.

import type { DerivedThemes } from "./derive.js";

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])]),
    );
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
