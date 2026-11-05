import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import { vitestAusgabe } from "../../scripts/reporter/knapp-vitest.mjs";

// Outside `turbo run test` (`pnpm --filter @fundamento/eroj test`, `vitest` in this directory) the
// tests would run against whatever `dist` lies around, and a stale one fails far from its cause or
// not at all ("modelo.json has the bytes of `fm modelo export`", Vojmapo). So build the whole
// workspace first, not only this package's dependencies: tests spawn binaries of packages that
// depend on this one (modelo's e2e suite runs `packages/cli/dist`). Turborepo replays what is
// unchanged (0.3–0.4 s locally); a cold build took 3.7–4.4 s. Under turbo, `test` waits for `build`.
// Spec 040 T-5: in CI the job's Build step has built what the job needs (a filtered
// `turbo run build`, .github/workflows/ci.yml) and says so with FM_GEBAUT; locally it is unset.
if (process.env.TURBO_HASH === undefined && process.env.FM_GEBAUT === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--output-logs=errors-only"], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// Unit tests only; the rendered checks in test/*.spec.ts run under Playwright (playwright.config.ts).
// Spec 040 B-1: test/*.test.ts too, for the completeness of the Vitrino's parts (vitrino-partoj).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    // Spec 040 T-7 (C-4): terse with FM_AUSGABE=knapp; JUnit in test-reports/vitest/ always.
    ...vitestAusgabe("vitest", configDefaults.reporters),
  },
});
