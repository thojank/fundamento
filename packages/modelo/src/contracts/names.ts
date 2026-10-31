// Spec 036 Teil 6 (6.3, D-23, D-25): Fundamento's own identifiers – the DTCG extension key, the
// schema IDs and the ontology base – exist in two forms for one version: the old one, which named
// a foreign domain, and the new, neutral one. Every reader normalises what it reads to the form
// the code writes (`currentNameForm`), so a token set, an Aspekto, a config, a schema or the
// Ontologio written in either form loads the same; every writer writes only that form.
//
// The old names never stand here as plain text: they are composed at run time (D-23), so neither
// `check:privat` nor the codemod of `scripts/neutrale-namen/` treats this file as a finding. The
// codemod's rule table (`rules.mjs`, `mapIdentifiers`) and this module agree; a test proves it.

import type { ModeloAjv } from "./ajv.js";
import { FUNDAMENTO_EXTENSION_KEY } from "./dtcg.js";

/** The two forms: `legacy` is read for one version, `neutral` is the form of Spec 036 Teil 6. */
export type NameFormId = "legacy" | "neutral";

export interface NameForm {
  readonly id: NameFormId;
  /** The `$extensions` key of Fundamento's metadata on tokens and sets. */
  readonly extensionKey: string;
  /** The base of every Ontologio URI (a fragment `#<Term>` may follow). */
  readonly ontologio: string;
  /** The ID of a schema file by its path (`modelo.schema.json`, `mcp/common.json`). */
  schemaId(path: string): string;
  /** The path of a schema ID of this form (without fragment); `undefined` for any other ID. */
  schemaPath(id: string): string | undefined;
}

const legacyWord = ["cif", "ere", "cigo"].join("");
const LEGACY_SCHEMA_BASE = `https://${legacyWord}.com/fundamento/schema/`;
const NEUTRAL_SCHEMA_PREFIX = "urn:fundamento:schema:";

const LEGACY: NameForm = Object.freeze({
  id: "legacy",
  extensionKey: `com.${legacyWord}.fundamento`,
  ontologio: `https://fundamento.${legacyWord}.com/ontologio`,
  schemaId: (path: string) => `${LEGACY_SCHEMA_BASE}${path}`,
  schemaPath: (id: string) =>
    id.startsWith(LEGACY_SCHEMA_BASE) && id.length > LEGACY_SCHEMA_BASE.length
      ? id.slice(LEGACY_SCHEMA_BASE.length)
      : undefined,
});

const NEUTRAL: NameForm = Object.freeze({
  id: "neutral",
  extensionKey: "fundamento",
  ontologio: "urn:fundamento:ontologio",
  // D-25: without `.schema.json`/`.json`, every `/` becomes `:` (`mcp/common.json` → `…:mcp:common`).
  schemaId: (path: string) =>
    `${NEUTRAL_SCHEMA_PREFIX}${path
      .replace(/\.schema\.json$/, "")
      .replace(/\.json$/, "")
      .split("/")
      .join(":")}`,
  // The repo's convention: a top-level schema ends in `.schema.json`, a nested one (mcp/…) in `.json`.
  schemaPath: (id: string) => {
    if (!id.startsWith(NEUTRAL_SCHEMA_PREFIX) || id.length === NEUTRAL_SCHEMA_PREFIX.length)
      return undefined;
    const segments = id.slice(NEUTRAL_SCHEMA_PREFIX.length).split(":");
    return `${segments.join("/")}${segments.length > 1 ? ".json" : ".schema.json"}`;
  },
});

/** Both forms, the old one first. */
export const NAME_FORMS: readonly NameForm[] = Object.freeze([LEGACY, NEUTRAL]);

/** A form by its ID. */
export function nameForm(id: NameFormId): NameForm {
  return id === "legacy" ? LEGACY : NEUTRAL;
}

/** The form the code writes: the one its extension key belongs to. */
export function currentNameForm(): NameForm {
  return FUNDAMENTO_EXTENSION_KEY === NEUTRAL.extensionKey ? NEUTRAL : LEGACY;
}

/** Splits `id#fragment`; the fragment keeps its `#`. */
function splitFragment(value: string): [string, string] {
  const hash = value.indexOf("#");
  return hash === -1 ? [value, ""] : [value.slice(0, hash), value.slice(hash)];
}

/**
 * A schema ID or reference (`<id>#<pointer>`) of either form in the form `to`; any other string
 * comes back unchanged.
 */
export function schemaIdInForm(value: string, to: NameForm = currentNameForm()): string {
  const [id, fragment] = splitFragment(value);
  for (const form of NAME_FORMS) {
    if (form === to) continue;
    const path = form.schemaPath(id);
    if (path !== undefined) return `${to.schemaId(path)}${fragment}`;
  }
  return value;
}

/** An Ontologio URI (the base, or the base with `#<Term>`) of either form in the form `to`. */
function ontologioInForm(value: string, to: NameForm): string {
  for (const form of NAME_FORMS) {
    if (form === to) continue;
    if (value === form.ontologio || value.startsWith(`${form.ontologio}#`)) {
      return `${to.ontologio}${value.slice(form.ontologio.length)}`;
    }
  }
  return value;
}

/** A string value: a schema reference or an Ontologio URI in the form `to`. */
function stringInForm(value: string, to: NameForm): string {
  // Fast path: every identifier starts with `https:` or `urn:`.
  const first = value.charCodeAt(0);
  if (first !== 104 && first !== 117) return value;
  const schema = schemaIdInForm(value, to);
  return schema !== value ? schema : ontologioInForm(value, to);
}

/**
 * Where an object key is Fundamento's extension key: in `$extensions` of a token, group or set, or
 * in the `properties` of a schema def named `…Extensions`. Nowhere else is a key renamed (the
 * export's top-level `fundamento` field, for one, is no extension key).
 */
function isExtensionKeyPlace(parentKey: string | undefined, grandKey: string | undefined): boolean {
  return (
    parentKey === "$extensions" ||
    (parentKey === "properties" && grandKey !== undefined && grandKey.endsWith("Extensions"))
  );
}

function convert(
  value: unknown,
  to: NameForm,
  parentKey: string | undefined,
  grandKey: string | undefined,
): unknown {
  if (typeof value === "string") return stringInForm(value, to);
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) {
    let copy: unknown[] | undefined;
    value.forEach((item, index) => {
      const next = convert(item, to, undefined, parentKey);
      if (next !== item) {
        copy ??= [...value];
        copy[index] = next;
      }
    });
    return copy ?? value;
  }
  const record = value as Record<string, unknown>;
  // A key is renamed only where the target key is not taken already; both keys side by side stay
  // as they are, and validation reports the stray one.
  const renames =
    isExtensionKeyPlace(parentKey, grandKey) && !Object.hasOwn(record, to.extensionKey);
  let changed = false;
  const entries = Object.entries(record).map(([key, child]): [string, unknown] => {
    const nextKey =
      renames && key !== to.extensionKey && NAME_FORMS.some((form) => form.extensionKey === key)
        ? to.extensionKey
        : key;
    const nextChild = convert(child, to, key, parentKey);
    if (nextKey !== key || nextChild !== child) changed = true;
    return [nextKey, nextChild];
  });
  return changed ? Object.fromEntries(entries) : value;
}

/**
 * A parsed JSON value with every identifier in the form `to`: the extension key where it is one,
 * schema IDs and references, Ontologio URIs. Key order and every other value stay; a value that
 * holds nothing to change comes back as the same object.
 */
export function convertNames<T>(value: T, to: NameForm): T {
  return convert(value, to, undefined, undefined) as T;
}

/**
 * Whether a text may hold an identifier of a form other than `to` (a cheap test before the walk):
 * false means `convertNames` would change nothing.
 */
function mayHoldOtherForm(text: string, to: NameForm): boolean {
  return NAME_FORMS.some(
    (form) =>
      form !== to &&
      (text.includes(form.extensionKey) ||
        text.includes(form.ontologio) ||
        text.includes(form === LEGACY ? LEGACY_SCHEMA_BASE : NEUTRAL_SCHEMA_PREFIX)),
  );
}

/**
 * The readers' normalisation (Spec 036 6.3): a parsed JSON value with every identifier in the
 * form the code writes. Pass the text it was parsed from to skip the walk when it holds nothing
 * of the other form.
 */
export function normalizeNames<T>(value: T, text?: string): T {
  const to = currentNameForm();
  if (text !== undefined && !mayHoldOtherForm(text, to)) return value;
  return convertNames(value, to);
}

/**
 * Adds a schema to Ajv under its ID and, for one version, a copy under the ID of the other form,
 * so a schema that refers to it by either ID resolves (Spec 036 6.3). The schema is normalised
 * first; the copy is compiled only when something refers to it.
 */
export function addSchemaWithBothIds(ajv: ModeloAjv, schema: Record<string, unknown>): void {
  const normalized = normalizeNames(schema);
  ajv.addSchema(normalized);
  const id = normalized.$id;
  if (typeof id !== "string") return;
  for (const form of NAME_FORMS) {
    const other = schemaIdInForm(id, form);
    if (other !== id && ajv.getSchema(other) === undefined) {
      ajv.addSchema({ ...normalized, $id: other });
    }
  }
}
