// ID generation: `<prefix>_<ULID>` with an injectable time and random source, so tests are
// deterministic and never read the wall clock.

import { monotonicFactory } from "ulid";
import { ENTITY_ID_PREFIXES, type EntityType } from "../contracts/entity-ids.js";

/** Time and randomness for ULID generation. */
export interface UlidSource {
  /** Milliseconds since the Unix epoch. */
  now(): number;
  /** A uniformly distributed number in `[0, 1)`. */
  random(): number;
}

/** Generates the next ID of an entity type. IDs from one generator strictly increase. */
export type IdGenerator = (entityType: EntityType) => string;

/** The real clock plus a cryptographically secure random source (used by the CLI edge). */
export function systemUlidSource(): UlidSource {
  const buffer = new Uint32Array(1);
  return {
    now: () => Date.now(),
    random: () => {
      globalThis.crypto.getRandomValues(buffer);
      return (buffer[0] ?? 0) / 2 ** 32;
    },
  };
}

/**
 * A reproducible source: fixed time and a seeded PRNG (mulberry32). For tests and fixtures only;
 * never use it to allocate real IDs.
 */
export function fixedUlidSource(time: number, seed: number): UlidSource {
  let state = seed >>> 0;
  return {
    now: () => time,
    random: () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    },
  };
}

/**
 * An ID generator over a source. It is monotonic: several IDs in the same millisecond still sort
 * in generation order and never collide.
 */
export function createIdGenerator(source: UlidSource): IdGenerator {
  const nextUlid = monotonicFactory(() => source.random());
  return (entityType) => `${ENTITY_ID_PREFIXES[entityType]}_${nextUlid(source.now())}`;
}
