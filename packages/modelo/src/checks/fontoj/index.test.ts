// Spec 029 ① (Constitution v2.4, Art. V and VII): check:fontoj on the repository. Every value taken
// from a Fonto points at a pinned Fonto with its licence text in THIRD_PARTY_NOTICES.md, names a
// token of its set with the value written there, and an adapted value names its Jugxo. The
// failing cases are the fixtures fontoj-registro and fontoj-deveno (e2e/checks.test.ts).

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

describe("check:fontoj on the repository", () => {
  it("passes: one Fonto, pinned, with its notice; every value of komuna in order", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats.fontoj).toBe(1);
    expect(result.stats.valoroj).toBeGreaterThan(350);
    expect(result.stats.adaptitaj).toBeGreaterThan(20);
    expect(result.summary).toContain("astryx");
  });
});
