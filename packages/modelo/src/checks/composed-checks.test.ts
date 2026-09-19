// The conformance checks over a project composition (Spec 001, T021): --config.

import { describe, expect, it } from "vitest";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { check as alirebleco } from "./alirebleco/index.js";
import { check as regularo } from "./regularo/index.js";

const repoRoot = new URL("../../../../", import.meta.url).pathname;
const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;

describe("checks with --config (core + komuna + ekzemplo)", () => {
  it("alirebleco evaluates every combination of both Aspektoj", { timeout: 60_000 }, async () => {
    const result = await alirebleco({ json: true, repoRoot, config });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats.combinations).toBe(144);
  });

  it("regularo includes the package Reguloj", async () => {
    const result = await regularo({ json: true, repoRoot, config });
    expect(result.ok).toBe(true);
    const core = await regularo({ json: true, repoRoot });
    expect(result.stats.reguloj).toBe((core.stats.reguloj ?? 0) + 1);
  });
});
