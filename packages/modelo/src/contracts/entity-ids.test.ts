// ID namespaces for external Aspekto packages (Spec 001, plan D-06; task T003).

import { readFileSync } from "node:fs";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  ENTITY_ID_PREFIXES,
  ENTITY_TYPES,
  entityTypeOfId,
  ID_NAMESPACE_PATTERN,
  ID_PATTERN,
  idPatternFor,
  namespaceOfId,
} from "./entity-ids.js";

const ULID = "01M2VEEDQEJEE7MR7JA8JRPMJB";

const phase0Ids = Object.keys(
  (
    JSON.parse(
      readFileSync(new URL("../../test/fixtures/phase0-ids.lock.json", import.meta.url), "utf8"),
    ) as { ids: Record<string, unknown> }
  ).ids,
);

const ulidArb = fc
  .tuple(
    fc.constantFrom(..."01234567"),
    fc.string({
      unit: fc.constantFrom(..."0123456789ABCDEFGHJKMNPQRSTVWXYZ"),
      minLength: 25,
      maxLength: 25,
    }),
  )
  .map(([head, tail]) => `${head}${tail}`);
const namespaceArb = fc.string({
  unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"),
  minLength: 2,
  maxLength: 8,
});

describe("ID namespaces (D-06)", () => {
  it("accepts <prefix>_<ns>_<ULID> for every entity type and reports the namespace", () => {
    for (const entityType of ENTITY_TYPES) {
      const id = `${ENTITY_ID_PREFIXES[entityType]}_ekz_${ULID}`;
      expect(id).toMatch(ID_PATTERN);
      expect(id).toMatch(idPatternFor(entityType));
      expect(entityTypeOfId(id)).toBe(entityType);
      expect(namespaceOfId(id)).toBe("ekz");
    }
  });

  it("keeps the core format <prefix>_<ULID> without a namespace", () => {
    expect(namespaceOfId(`tok_${ULID}`)).toBeUndefined();
    expect(entityTypeOfId(`tok_${ULID}`)).toBe("token");
  });

  it.each([
    ["one letter", `tok_e_${ULID}`],
    ["nine letters", `tok_abcdefghi_${ULID}`],
    ["uppercase", `tok_EKZ_${ULID}`],
    ["digits", `tok_ek2_${ULID}`],
    ["empty", `tok__${ULID}`],
  ])("rejects a namespace with %s", (_label, id) => {
    expect(id).not.toMatch(ID_PATTERN);
    expect(namespaceOfId(id)).toBeUndefined();
    expect(entityTypeOfId(id)).toBeUndefined();
  });

  it("defines the namespace grammar as 2 to 8 lowercase letters", () => {
    expect("ekz").toMatch(ID_NAMESPACE_PATTERN);
    expect("cif").toMatch(ID_NAMESPACE_PATTERN);
    expect("e").not.toMatch(ID_NAMESPACE_PATTERN);
    expect("Ekz").not.toMatch(ID_NAMESPACE_PATTERN);
  });

  it("still accepts every Phase-0 ID, none of which has a namespace", () => {
    expect(phase0Ids).toHaveLength(65);
    for (const id of phase0Ids) {
      expect(id).toMatch(ID_PATTERN);
      expect(namespaceOfId(id)).toBeUndefined();
    }
  });

  it("round-trips entity type and namespace for any well-formed ID (property)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ENTITY_TYPES),
        fc.option(namespaceArb, { nil: undefined }),
        ulidArb,
        (entityType, namespace, ulid) => {
          const id = `${ENTITY_ID_PREFIXES[entityType]}_${namespace === undefined ? "" : `${namespace}_`}${ulid}`;
          return (
            idPatternFor(entityType).test(id) &&
            entityTypeOfId(id) === entityType &&
            namespaceOfId(id) === namespace
          );
        },
      ),
      { seed: 20260919, numRuns: 1000 },
    );
  });
});
