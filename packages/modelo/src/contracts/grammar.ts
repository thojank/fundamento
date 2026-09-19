// Name grammars of the Modelo. The schema (`schema/modelo.schema.json`) carries the same
// patterns; a test keeps both in sync.

/** Canonical token name (FR-13a): dot-separated segments of `[a-z0-9]+`. */
export const TOKEN_NAME_PATTERN = /^[a-z0-9]+(\.[a-z0-9]+)*$/;

/**
 * Token pattern of `Regulo.appliesTo.tokens` (Spec 002, D-02): a token name whose segments may be
 * `*` (exactly one segment); the last segment may be `**` (one or more segments).
 */
export const TOKEN_PATTERN_PATTERN = /^(?:[a-z0-9]+|\*)(?:\.(?:[a-z0-9]+|\*))*(?:\.\*\*)?$/;

/** One segment of a canonical token name, i.e. one key of a DTCG group. */
export const TOKEN_NAME_SEGMENT_PATTERN = /^[a-z0-9]+$/;

/**
 * Names of Dimensioj, DimensioValoroj, Reguloj, KontrastParoj and schema-only entities:
 * lowercase ASCII words joined by `-` (e.g. `color-scheme`). Separate from the token grammar.
 */
export const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** One entry of a set's `kondicxoj`: `dimensio=valoro`. */
export const KONDICXO_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*=[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Canonical set name: `core`, or `<dimensio>/<valoro>` conditions joined by `+`
 * (ordered by Dimensio priority ascending, which the schema cannot check).
 */
export const SET_NAME_PATTERN =
  /^(core|[a-z0-9]+(-[a-z0-9]+)*\/[a-z0-9]+(-[a-z0-9]+)*(\+[a-z0-9]+(-[a-z0-9]+)*\/[a-z0-9]+(-[a-z0-9]+)*)*)$/;

/**
 * Curly-brace alias `{a.b.c}`, as a whole `$value` or a composite sub-field. Deliberately loose:
 * whether the reference is a grammatical, existing token is a semantic check (`alias-*` rules).
 */
export const ALIAS_PATTERN = /^\{[^{}]+\}$/;

/** Name of the core set, which has no kondicxoj and is always active. */
export const CORE_SET_NAME = "core";

export function isTokenName(name: string): boolean {
  return TOKEN_NAME_PATTERN.test(name);
}

/** Returns the referenced token name of an alias string, or `undefined` if it is no alias. */
export function aliasTarget(value: unknown): string | undefined {
  return typeof value === "string" && ALIAS_PATTERN.test(value) ? value.slice(1, -1) : undefined;
}

/** Whether a token name matches a `TokenPattern` (`*` = one segment, trailing `**` = one or more). */
export function matchesTokenPattern(pattern: string, name: string): boolean {
  const want = pattern.split(".");
  const have = name.split(".");
  if (want.at(-1) === "**") {
    const head = want.slice(0, -1);
    return have.length > head.length && head.every((part, i) => part === "*" || part === have[i]);
  }
  return want.length === have.length && want.every((part, i) => part === "*" || part === have[i]);
}
