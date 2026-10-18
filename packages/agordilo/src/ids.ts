// The IDs of a derived Aspekto (Spec 016, plan ① D-03): minted by the Modelo's own ULID
// generator, but from a source that depends on the Aspekto's name only — so two runs give the same
// IDs, and an Agordo that changes its colours keeps the IDs of its brand. They live in the
// package's own namespace (letters of the name), which no other registry shares. Pure.

import { createIdGenerator, type EntityType, fixedUlidSource } from "@fundamento/modelo";

/** The time part of every derived ID: the day Spec 016 ① was built (2026-10-18, UTC). */
export const AGORDILO_EPOCH = Date.UTC(2026, 9, 18);

/** FNV-1a (32 bit) of a text: the seed of the name. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** The ID namespace of a derived Aspekto: the letters of its name, 2 to 8 of them. */
export function namespaceOf(name: string): string {
  const letters = name.replace(/[^a-z]/g, "").slice(0, 8);
  return letters.length >= 2 ? letters : `${letters}ag`.slice(0, 8);
}

/** A generator of the package's IDs; call it in a fixed order. */
export function derivedIdGenerator(name: string): (type: EntityType) => string {
  const generate = createIdGenerator(fixedUlidSource(AGORDILO_EPOCH, fnv1a(name)));
  const namespace = namespaceOf(name);
  return (type) => generate(type, namespace);
}
