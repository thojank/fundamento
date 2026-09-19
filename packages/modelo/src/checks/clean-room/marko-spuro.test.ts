// Clean room for the owner's own brand (Spec 001, D-15, K2, AK-08; task T022).

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { check } from "./index.js";
import {
  brandCandidates,
  fingerprintOf,
  MARKO_SPURO_ALLOWLIST,
  repoFingerprints,
} from "./marko-spuro.js";

const repoRoot = new URL("../../../../../", import.meta.url).pathname;
const fixture = (name: string) => `${repoRoot}packages/modelo/test/fixtures/invalid/${name}`;
const sha = (text: string) => createHash("sha256").update(text).digest("hex");

describe("brand candidates (K2)", () => {
  it("normalizes hex colours to lowercase 6-digit form", () => {
    const hex = (text: string) =>
      brandCandidates(text)
        .filter((c) => c.kind === "hex")
        .map((c) => c.normalized);
    expect(hex("#ABC")).toEqual(["#aabbcc"]);
    expect(hex("#AABBCCDD and #aabbcc")).toEqual(["#aabbcc", "#aabbcc"]);
    expect(hex("id #1234 or #12345")).toEqual([]);
  });

  it("normalizes cubic-bezier curves and DTCG arrays to the same numbers", () => {
    const curves = (text: string) =>
      brandCandidates(text)
        .filter((c) => c.kind === "curve")
        .map((c) => c.normalized);
    expect(curves("cubic-bezier( .11, .22 ,.33, .44 )")).toEqual(["0.11,0.22,0.33,0.44"]);
    expect(curves('"$value": [0.11, 0.22, 0.33, 0.44]')).toEqual(["0.11,0.22,0.33,0.44"]);
  });

  it("offers font families as lowercase word sequences without quotes", () => {
    const families = brandCandidates('fontFamily: ["Sintetika Sans", "x"]')
      .filter((c) => c.kind === "family")
      .map((c) => c.normalized);
    expect(families).toContain("sintetika sans");
    expect(families).toContain("sintetika");
  });

  it("never offers durations or length scalars", () => {
    const kinds = new Set(brandCandidates("650ms 0.72rem 12px 1.2em").map((c) => c.kind));
    expect(kinds.has("hex")).toBe(false);
    expect(kinds.has("curve")).toBe(false);
    expect(fingerprintOf({ kind: "family", normalized: "650ms" })).toBe(sha("family:650ms"));
  });
});

describe("marko-spuroj.json of the repo (D-15)", () => {
  it("holds hashes only, for hex colours, the brand family and the easing curve", () => {
    const fingerprints = repoFingerprints();
    expect(fingerprints.size).toBeGreaterThanOrEqual(9);
    for (const fingerprint of fingerprints) expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("allows brand values only in the spec and the research of Spec 001", () => {
    expect([...MARKO_SPURO_ALLOWLIST]).toEqual([
      "specs/001-vortaro-aspektoj-mcp/research.md",
      "specs/001-vortaro-aspektoj-mcp/spec.md",
    ]);
  });
});

describe("check:clean-room with fingerprints", () => {
  it("passes on the repo: brand values appear only in the allowlisted files", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors.filter((issue) => issue.rule === "clean-room-marko-spuro")).toEqual([]);
    expect(result.stats.fingerprintFiles).toBeGreaterThan(100);
  });

  it("reports every synthetic brand value in the fixture, and nothing else", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("clean-room-marko-spuro"),
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => [issue.rule, issue.path])).toEqual([
      ["clean-room-marko-spuro", "docs/notes.md:3:21"],
      ["clean-room-marko-spuro", "src/theme.css:2:16"],
      ["clean-room-marko-spuro", "src/theme.css:4:14"],
    ]);
  });
});
