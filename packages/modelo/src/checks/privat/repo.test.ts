// Spec 036 Teil 6 (6.4, AC-11): check:privat on the repository itself. Red on the base of the run
// (every file the codemod has not yet rewritten is a finding), green after the script run commit
// of scripts/neutrale-namen/ (S36-5.2); only the verbatim spec copies of escepoj.json remain.

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

describe("check:privat on the repo (Spec 036 6.4)", () => {
  it("no tracked file names the word of R-12 or the private font repository", async () => {
    const result = await check({ json: true, repoRoot });
    const files = [...new Set(result.errors.map((issue) => issue.path.split(":")[0]))];
    expect(files, `${files.length} files name an old name`).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats.files).toBeGreaterThan(3_000);
  });
});
