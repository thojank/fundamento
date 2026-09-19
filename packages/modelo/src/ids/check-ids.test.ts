import { describe, expect, it } from "vitest";
import type { EntityType, IdOccurrence, IdsLock } from "../contracts/index.js";
import { checkIds, DEFAULT_LOCK_FILE } from "./check-ids.js";

/** A well-formed 26-character ULID whose tail is `seed` (Crockford characters only). */
function ulid(seed: string): string {
  return `01J${seed.padStart(23, "0")}`;
}

const TOK_A = `tok_${ulid("A")}`;
const TOK_B = `tok_${ulid("B")}`;
const SET_CORE = `set_${ulid("C")}`;
const DIM_X = `dim_${ulid("D")}`;

function occ(id: string | undefined, entityType: EntityType, file: string, pointer: string) {
  const occurrence: IdOccurrence = { id, entityType, location: { file, pointer } };
  return occurrence;
}

function lockOf(entries: Record<string, [EntityType, "active" | "retired"]>): IdsLock {
  const ids: IdsLock["ids"] = {};
  for (const [id, [type, status]] of Object.entries(entries)) {
    ids[id] = { type, status };
  }
  return { ids };
}

const CORE = "vortaro/sets/core.json";
const idPointer = (tokenPath: string) =>
  `/${tokenPath.split(".").join("/")}/$extensions/com.ciferecigo.fundamento/id`;

describe("checkIds", () => {
  it("reports nothing for consistent occurrences and lock", () => {
    const issues = checkIds(
      [
        occ(TOK_A, "token", CORE, idPointer("color.a")),
        occ(SET_CORE, "tokenSet", CORE, "/$extensions/com.ciferecigo.fundamento/id"),
      ],
      lockOf({ [TOK_A]: ["token", "active"], [SET_CORE]: ["tokenSet", "active"] }),
    );
    expect(issues).toEqual([]);
  });

  it("id-missing: an entity without an ID", () => {
    const issues = checkIds([occ(undefined, "token", CORE, "/color/a")], lockOf({}));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-missing",
      severity: "error",
      path: "vortaro/sets/core.json#/color/a",
    });
    expect(issues[0]?.suggestion).toContain("pnpm id:new token");
  });

  it("id-format: a malformed ULID", () => {
    const bad = "tok_01JILOU0000000000000000000";
    const issues = checkIds([occ(bad, "token", CORE, idPointer("color.a"))], lockOf({}));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-format",
      path: `${CORE}#${idPointer("color.a")}`,
    });
  });

  it("id-format: lowercase ULIDs are malformed", () => {
    const issues = checkIds(
      [occ(TOK_A.toLowerCase(), "token", CORE, idPointer("color.a"))],
      lockOf({}),
    );
    expect(issues.map((issue) => issue.rule)).toEqual(["id-format"]);
  });

  it("id-format: a prefix that does not match the entity type", () => {
    const wrongPrefix = `set_${ulid("A")}`;
    const issues = checkIds(
      [occ(wrongPrefix, "token", CORE, idPointer("color.a"))],
      lockOf({ [wrongPrefix]: ["tokenSet", "active"] }),
    );
    expect(issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["id-format", `${CORE}#${idPointer("color.a")}`],
    ]);
    expect(issues[0]?.message).toContain("tok_");
  });

  it("id-duplicate: the same ID on two entities, reported at the later occurrence", () => {
    const issues = checkIds(
      [
        occ(TOK_A, "token", CORE, idPointer("color.b")),
        occ(TOK_A, "token", CORE, idPointer("color.a")),
      ],
      lockOf({ [TOK_A]: ["token", "active"] }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-duplicate",
      path: `${CORE}#${idPointer("color.b")}`,
    });
    expect(issues[0]?.message).toContain(`${CORE}#${idPointer("color.a")}`);
  });

  it("id-type-mismatch: the lock registers the ID for another entity type", () => {
    const issues = checkIds(
      [occ(TOK_A, "token", CORE, idPointer("color.a"))],
      lockOf({ [TOK_A]: ["dimensio", "active"] }),
    );
    expect(issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["id-type-mismatch", `${CORE}#${idPointer("color.a")}`],
    ]);
  });

  it("id-retired-reused: a retired ID appears again", () => {
    const issues = checkIds(
      [occ(TOK_A, "token", CORE, idPointer("color.a"))],
      lockOf({ [TOK_A]: ["token", "retired"] }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-retired-reused",
      path: `${CORE}#${idPointer("color.a")}`,
    });
  });

  it("id-unregistered: an ID that is not in the lock", () => {
    const issues = checkIds([occ(TOK_A, "token", CORE, idPointer("color.a"))], lockOf({}));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-unregistered",
      path: `${CORE}#${idPointer("color.a")}`,
    });
    expect(issues[0]?.suggestion).toContain("pnpm id:new token");
  });

  it("id-orphaned: an active lock ID that no entity uses; suggests retiring it", () => {
    const issues = checkIds(
      [],
      lockOf({ [TOK_A]: ["token", "active"], [TOK_B]: ["token", "retired"] }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "id-orphaned",
      severity: "error",
      path: `data/ids.lock.json#/ids/${TOK_A}`,
    });
    expect(issues[0]?.suggestion).toContain(`pnpm id:retire ${TOK_A}`);
  });

  it("uses the given lock file for id-orphaned paths", () => {
    const issues = checkIds([], lockOf({ [DIM_X]: ["dimensio", "active"] }), {
      lockFile: "custom/lock.json",
    });
    expect(issues[0]?.path).toBe(`custom/lock.json#/ids/${DIM_X}`);
    expect(DEFAULT_LOCK_FILE).toBe("data/ids.lock.json");
  });

  it("every issue has a non-empty message and suggestion", () => {
    const issues = checkIds(
      [
        occ(undefined, "token", CORE, "/color/x"),
        occ("nope", "token", CORE, idPointer("color.y")),
        occ(TOK_A, "token", CORE, idPointer("color.a")),
        occ(TOK_A, "token", CORE, idPointer("color.b")),
        occ(TOK_B, "token", CORE, idPointer("color.c")),
      ],
      lockOf({ [TOK_A]: ["dimensio", "retired"], [DIM_X]: ["dimensio", "active"] }),
    );
    expect(new Set(issues.map((issue) => issue.rule))).toEqual(
      new Set([
        "id-missing",
        "id-format",
        "id-duplicate",
        "id-type-mismatch",
        "id-retired-reused",
        "id-unregistered",
        "id-orphaned",
      ]),
    );
    for (const issue of issues) {
      expect(issue.message.length).toBeGreaterThan(0);
      expect(issue.suggestion.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic regardless of occurrence order", () => {
    const occurrences = [
      occ(undefined, "token", CORE, "/color/x"),
      occ(TOK_A, "token", "vortaro/sets/b.json", idPointer("color.a")),
      occ(TOK_A, "token", CORE, idPointer("color.a")),
      occ(TOK_B, "token", CORE, idPointer("color.c")),
      occ("nope", "dimensio", "data/dimensioj.json", "/dimensioj/0/id"),
    ];
    const lock = lockOf({ [TOK_A]: ["token", "active"], [DIM_X]: ["dimensio", "active"] });
    const forward = checkIds(occurrences, lock);
    const backward = checkIds([...occurrences].reverse(), lock);
    expect(backward).toEqual(forward);
    const paths = forward.map((issue) => issue.path);
    expect(paths).toEqual([...paths].sort());
  });

  it("escapes JSON Pointer characters in orphan paths", () => {
    // IDs never contain `~` or `/`, but the lock path must stay a valid pointer regardless.
    const issues = checkIds([], { ids: { "tok_a/b~c": { type: "token", status: "active" } } });
    expect(issues[0]?.path).toBe("data/ids.lock.json#/ids/tok_a~1b~0c");
  });
});
