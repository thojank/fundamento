// The frozen Phase-0 ID registry (Spec 001, K1; task T002). AK-04 compares the current
// registries against this file instead of `git show 6e517c6:…`, because CI checks out with
// fetch-depth 1. The hash pins the file so it cannot drift unnoticed.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FIXTURE = new URL("../../test/fixtures/phase0-ids.lock.json", import.meta.url);
const FIXTURE_SHA256 = "6f441a28fa60f0f3b65ee40442b74851000139f194e7428a2001172a3bb8ed8c";

describe("test/fixtures/phase0-ids.lock.json (K1)", () => {
  it("is pinned by its SHA-256", () => {
    const bytes = readFileSync(FIXTURE);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(FIXTURE_SHA256);
  });

  it("records its origin in a leading $comment and holds the 65 active Phase-0 IDs", () => {
    const lock = JSON.parse(readFileSync(FIXTURE, "utf8")) as {
      $comment: string;
      ids: Record<string, { status: string; type: string }>;
    };
    expect(Object.keys(lock)).toEqual(["$comment", "ids"]);
    expect(lock.$comment).toContain("packages/modelo/data/ids.lock.json");
    expect(lock.$comment).toContain("6e517c6");
    const entries = Object.values(lock.ids);
    expect(entries).toHaveLength(65);
    expect(entries.every((entry) => entry.status === "active")).toBe(true);
  });
});
