// Fixture-level test of the `ids-*` negative fixtures (AK-02). Collecting occurrences from a
// loaded Modelo is FUND-3.2's job, so the occurrences are listed by hand here. The test guards
// the hand list against drift: every listed pointer must resolve to the ID in the fixture file,
// and every `id` field of every entity file must be listed.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { EntityType, IdOccurrence, IdsLock } from "../contracts/index.js";
import { checkIds } from "./check-ids.js";
import { parseIdsLock } from "./lock.js";

const FIXTURES = fileURLToPath(new URL("../../test/fixtures/invalid/", import.meta.url));
const CORE = "vortaro/sets/core.json";
const EXT = "$extensions/com.ciferecigo.fundamento/id";

/** The entities of both fixtures (they share one layout). */
const ENTITIES: ReadonlyArray<[EntityType, string, string]> = [
  ["dimensio", "data/dimensioj.json", "/dimensioj/0/id"],
  ["dimensioValoro", "data/dimensioj.json", "/dimensioj/0/valoroj/0/id"],
  ["dimensioValoro", "data/dimensioj.json", "/dimensioj/0/valoroj/1/id"],
  ["dimensio", "data/dimensioj.json", "/dimensioj/1/id"],
  ["dimensioValoro", "data/dimensioj.json", "/dimensioj/1/valoroj/0/id"],
  ["dimensioValoro", "data/dimensioj.json", "/dimensioj/1/valoroj/1/id"],
  ["tokenSet", CORE, `/${EXT}`],
  ["token", CORE, `/color/palette/neutral/0/${EXT}`],
  ["token", CORE, `/color/palette/neutral/900/${EXT}`],
  ["token", CORE, `/color/background/default/${EXT}`],
  ["token", CORE, `/color/text/default/${EXT}`],
];

interface Expected {
  issues: { rule: string; path: string }[];
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function unescapePointerSegment(segment: string): string {
  return segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function resolvePointer(document: unknown, pointer: string): unknown {
  let current = document;
  for (const segment of pointer.split("/").slice(1).map(unescapePointerSegment)) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** Pointers of every `id` string property in a JSON document. */
function idPointers(value: unknown, pointer = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [];
  }
  const found: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const childPointer = `${pointer}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
    if (key === "id" && typeof child === "string") {
      found.push(childPointer);
    }
    found.push(...idPointers(child, childPointer));
  }
  return found;
}

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => join(entry.parentPath, entry.name));
}

function collect(root: string): IdOccurrence[] {
  return ENTITIES.map(([entityType, file, pointer]) => {
    const value = resolvePointer(readJson(join(root, file)), pointer);
    return {
      id: typeof value === "string" ? value : undefined,
      entityType,
      location: { file, pointer },
    };
  });
}

function readLock(root: string): IdsLock {
  const parsed = parseIdsLock(
    readFileSync(join(root, "data/ids.lock.json"), "utf8"),
    "data/ids.lock.json",
  );
  expect(parsed.issues).toEqual([]);
  if (parsed.lock === undefined) {
    throw new Error("fixture lock did not parse");
  }
  return parsed.lock;
}

describe.each(["ids-duplicate", "ids-retired-reused"])("fixture invalid/%s", (name) => {
  const root = join(FIXTURES, name);

  it("lists every entity ID of the fixture (hand list is complete)", () => {
    const listed = new Set(ENTITIES.map(([, file, pointer]) => `${file}#${pointer}`));
    const actual = new Set<string>();
    for (const path of jsonFiles(root)) {
      const file = relative(root, path).split(sep).join("/");
      // $themes.json reuses DimensioValoro IDs as theme IDs; the lock and expectations are not entities.
      if (
        file === "vortaro/$themes.json" ||
        file.startsWith("data/ids.lock") ||
        !file.includes("/")
      ) {
        continue;
      }
      for (const pointer of idPointers(readJson(path))) {
        actual.add(`${file}#${pointer}`);
      }
    }
    expect(actual).toEqual(listed);
    for (const occurrence of collect(root)) {
      expect(
        occurrence.id,
        `${occurrence.location.file}#${occurrence.location.pointer}`,
      ).toBeTypeOf("string");
    }
  });

  it("produces exactly the issues in expected-issues.json", () => {
    const expected = readJson(join(root, "expected-issues.json")) as Expected;
    const issues = checkIds(collect(root), readLock(root));
    expect(issues.map(({ rule, path }) => ({ rule, path }))).toEqual(expected.issues);
  });
});
