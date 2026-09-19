import { describe, expect, it } from "vitest";
import { ENTITY_TYPES, type IdsLock, idPatternFor } from "../contracts/index.js";
import {
  allocateIds,
  emptyIdsLock,
  parseIdsLock,
  retireId,
  serializeIdsLock,
  validateIdsLock,
} from "./lock.js";
import { createIdGenerator, fixedUlidSource } from "./ulid-source.js";

const T0 = Date.UTC(2026, 8, 19, 12, 0, 0);

function generator(seed = 1) {
  return createIdGenerator(fixedUlidSource(T0, seed));
}

describe("ID generation", () => {
  it.each(ENTITY_TYPES)("generates schema-conformant IDs for %s", (entityType) => {
    const next = generator();
    const id = next(entityType);
    expect(id).toMatch(idPatternFor(entityType));
  });

  it("prefixes the ULID with an Aspekto package namespace when given (D-06)", () => {
    const next = generator();
    const id = next("tokenSet", "ekz");
    expect(id).toMatch(/^set_ekz_[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    expect(id).toMatch(idPatternFor("tokenSet"));
  });

  it("allocates namespaced IDs into a package lock (D-06)", () => {
    const { ids } = allocateIds(emptyIdsLock(), "regulo", 2, generator(), "ekz");
    expect(ids).toHaveLength(2);
    for (const id of ids) {
      expect(id.startsWith("reg_ekz_")).toBe(true);
    }
  });

  it("is deterministic for the same time and random source", () => {
    const a = generator(7);
    const b = generator(7);
    expect([a("token"), a("token")]).toEqual([b("token"), b("token")]);
  });

  it("encodes the injected time", () => {
    // 2026-09-19T12:00:00Z encodes to this 10-character Crockford timestamp.
    const id = generator()("token");
    expect(id.slice(4, 14)).toBe("01M2WRK8G0");
  });

  it("produces strictly increasing IDs within the same millisecond", () => {
    const next = generator();
    const ids = [next("token"), next("token"), next("token")];
    expect(new Set(ids).size).toBe(3);
    expect([...ids].sort()).toEqual(ids);
  });
});

describe("lock serialization", () => {
  it("serializes the empty lock canonically", () => {
    expect(serializeIdsLock(emptyIdsLock())).toBe('{\n  "ids": {}\n}\n');
  });

  it("sorts keys at every level, 2-space indent, trailing newline", () => {
    const lock: IdsLock = {
      ids: {
        tok_01J00000000000000000000002: { status: "active", type: "token" },
        dim_01J00000000000000000000009: { type: "dimensio", status: "retired" },
        tok_01J00000000000000000000001: { type: "token", status: "active" },
      },
    };
    expect(serializeIdsLock(lock)).toBe(
      [
        "{",
        '  "ids": {',
        '    "dim_01J00000000000000000000009": {',
        '      "status": "retired",',
        '      "type": "dimensio"',
        "    },",
        '    "tok_01J00000000000000000000001": {',
        '      "status": "active",',
        '      "type": "token"',
        "    },",
        '    "tok_01J00000000000000000000002": {',
        '      "status": "active",',
        '      "type": "token"',
        "    }",
        "  }",
        "}",
        "",
      ].join("\n"),
    );
  });

  it("round-trips through parseIdsLock", () => {
    const { lock } = allocateIds(emptyIdsLock(), "regulo", 3, generator());
    const text = serializeIdsLock(lock);
    const parsed = parseIdsLock(text, "data/ids.lock.json");
    expect(parsed.issues).toEqual([]);
    expect(parsed.lock).toEqual(lock);
  });
});

describe("validateIdsLock", () => {
  it("accepts a valid lock", () => {
    expect(validateIdsLock({ ids: {} }, "data/ids.lock.json")).toEqual([]);
  });

  it("reports schema violations with a file path", () => {
    const issues = validateIdsLock(
      { ids: { "not-an-id": { type: "token", status: "active" } } },
      "data/ids.lock.json",
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]?.rule).toBe("schema-violation");
    expect(issues[0]?.path.startsWith("data/ids.lock.json#")).toBe(true);
  });

  it("reports an unknown status at its pointer", () => {
    const issues = validateIdsLock(
      { ids: { tok_01J00000000000000000000001: { type: "token", status: "gone" } } },
      "lock.json",
    );
    expect(issues.map((issue) => issue.path)).toContain(
      "lock.json#/ids/tok_01J00000000000000000000001/status",
    );
  });
});

describe("parseIdsLock", () => {
  it("reports malformed JSON as json-syntax", () => {
    const parsed = parseIdsLock("{ nope", "data/ids.lock.json");
    expect(parsed.lock).toBeUndefined();
    expect(parsed.issues[0]).toMatchObject({ rule: "json-syntax", path: "data/ids.lock.json#" });
  });
});

describe("allocateIds", () => {
  it("appends active entries of the requested type and keeps existing ones", () => {
    const existing: IdsLock = {
      ids: { tok_01J00000000000000000000001: { type: "token", status: "retired" } },
    };
    const { lock, ids } = allocateIds(existing, "token", 2, generator());
    expect(ids).toHaveLength(2);
    expect(lock.ids.tok_01J00000000000000000000001).toEqual({ type: "token", status: "retired" });
    for (const id of ids) {
      expect(lock.ids[id]).toEqual({ type: "token", status: "active" });
    }
    expect(existing.ids).not.toHaveProperty(ids[0] ?? "");
    expect(validateIdsLock(lock, "x")).toEqual([]);
  });

  it("never reissues an ID that is already in the lock", () => {
    const first = allocateIds(emptyIdsLock(), "token", 1, generator(3));
    const again = allocateIds(first.lock, "token", 1, generator(3));
    expect(again.ids[0]).not.toBe(first.ids[0]);
    expect(Object.keys(again.lock.ids)).toHaveLength(2);
  });

  it("rejects a count below 1", () => {
    expect(() => allocateIds(emptyIdsLock(), "token", 0, generator())).toThrow(/count/);
  });
});

describe("retireId", () => {
  const lock: IdsLock = {
    ids: { tok_01J00000000000000000000001: { type: "token", status: "active" } },
  };

  it("marks an active ID retired without mutating the input", () => {
    const result = retireId(lock, "tok_01J00000000000000000000001");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lock.ids.tok_01J00000000000000000000001?.status).toBe("retired");
      expect(result.alreadyRetired).toBe(false);
    }
    expect(lock.ids.tok_01J00000000000000000000001?.status).toBe("active");
  });

  it("is idempotent for an already retired ID", () => {
    const first = retireId(lock, "tok_01J00000000000000000000001");
    if (!first.ok) throw new Error("expected ok");
    const second = retireId(first.lock, "tok_01J00000000000000000000001");
    expect(second).toMatchObject({ ok: true, alreadyRetired: true });
  });

  it("errors for an unknown ID", () => {
    const result = retireId(lock, "tok_01J00000000000000000000009");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("tok_01J00000000000000000000009");
    }
  });
});
