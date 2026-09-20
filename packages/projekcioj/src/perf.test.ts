// Generation budget (Spec 003 T026, plan: Technical Context): every projection of the repository
// Modelo — CSS, Tailwind, the Ero sources, the Figma plan, Code Connect and both Make Kits with
// their bundles and parity inventories — in under ten seconds. Factor 3 only under CI=true
// (shared runners; Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK). Raw timings go to stderr either way.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "./build.js";

const FACTOR = process.env.CI === "true" ? 3 : 1;
const BUILD_BUDGET_MS = 10_000 * FACTOR;

const dirs: string[] = [];
afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("performance of the projections (T026)", { timeout: 120_000 }, () => {
  it(`generates every projection within ${BUILD_BUDGET_MS} ms`, async () => {
    const timings: number[] = [];
    for (let run = 0; run < 3; run++) {
      const out = mkdtempSync(join(tmpdir(), "fm-perf-projekcioj-"));
      dirs.push(out);
      const started = performance.now();
      const result = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
      timings.push(performance.now() - started);
      expect(result.ok).toBe(true);
    }
    process.stderr.write(
      `T026 fm projekcioj build ms: ${timings.map((value) => value.toFixed(0)).join(" ")} (budget ${BUILD_BUDGET_MS} ms)\n`,
    );
    expect(Math.max(...timings)).toBeLessThan(BUILD_BUDGET_MS);
  });
});
