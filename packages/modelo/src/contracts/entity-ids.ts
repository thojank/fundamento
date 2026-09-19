// Entity types and their opaque ID format (§2.3): `<prefix>_<26-char Crockford ULID>`, or
// `<prefix>_<namespace>_<ULID>` for IDs minted in an external Aspekto package (Spec 001, D-06).

import type { EntityType } from "../generated/modelo-schema.js";

export type { EntityType, IdStatus, IdsLock, IdsLockEntry } from "../generated/modelo-schema.js";

/** ID prefix per entity type. Key order is the canonical entity-type order. */
export const ENTITY_ID_PREFIXES = {
  token: "tok",
  tokenSet: "set",
  dimensio: "dim",
  dimensioValoro: "dva",
  regulo: "reg",
  jugxo: "jug",
  kontrastParo: "kpa",
  ero: "ero",
  skemo: "ske",
  sxablono: "sxa",
  projekcio: "prj",
  celo: "cel",
} as const satisfies Record<EntityType, string>;

export type IdPrefix = (typeof ENTITY_ID_PREFIXES)[EntityType];

export const ENTITY_TYPES = [
  "token",
  "tokenSet",
  "dimensio",
  "dimensioValoro",
  "regulo",
  "jugxo",
  "kontrastParo",
  "ero",
  "skemo",
  "sxablono",
  "projekcio",
  "celo",
] as const satisfies readonly EntityType[];

/**
 * A 26-character Crockford base32 ULID (uppercase, no I/L/O/U). The first character is at
 * most 7 because the 48-bit timestamp must fit into 26 base32 digits.
 */
export const ULID_PATTERN_SOURCE = "[0-7][0-9A-HJKMNP-TV-Z]{25}";

/**
 * The ID namespace of an external Aspekto package (`idNamespace` in `aspekto.json`): 2 to 8
 * lowercase letters. Core and reference-Aspekto IDs have no namespace.
 */
export const ID_NAMESPACE_PATTERN_SOURCE = "[a-z]{2,8}";
export const ID_NAMESPACE_PATTERN = new RegExp(`^${ID_NAMESPACE_PATTERN_SOURCE}$`);

/** Matches any well-formed Fundamento ID and captures its prefix and optional namespace. */
export const ID_PATTERN = new RegExp(
  `^(${Object.values(ENTITY_ID_PREFIXES).join("|")})_(?:(${ID_NAMESPACE_PATTERN_SOURCE})_)?${ULID_PATTERN_SOURCE}$`,
);

/** The ID pattern of one entity type, with or without a namespace. */
export function idPatternFor(entityType: EntityType): RegExp {
  return new RegExp(
    `^${ENTITY_ID_PREFIXES[entityType]}_(?:${ID_NAMESPACE_PATTERN_SOURCE}_)?${ULID_PATTERN_SOURCE}$`,
  );
}

/** The entity type encoded in a well-formed ID, or `undefined` for a malformed ID. */
export function entityTypeOfId(id: string): EntityType | undefined {
  const prefix = ID_PATTERN.exec(id)?.[1];
  return ENTITY_TYPES.find((entityType) => ENTITY_ID_PREFIXES[entityType] === prefix);
}

/** The namespace of a well-formed namespaced ID; `undefined` for core IDs and malformed IDs. */
export function namespaceOfId(id: string): string | undefined {
  return ID_PATTERN.exec(id)?.[2];
}
