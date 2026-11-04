import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import { vitestAusgabe } from "../../scripts/reporter/knapp-vitest.mjs";

// Outside `turbo run test` the tests would run against whatever `dist` of the workspace packages
// lies around; build this package's workspace dependencies first (Turborepo replays what is
// unchanged). Under turbo, `test` waits for `build`. No test here starts a browser or calls a
// provider: scoring is pure, the agent and the runner run against doubles (Spec 030: not in CI).
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--filter=@fundamento/nordstelo^..."], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    // Spec 040 T-7 (C-4): terse with FM_AUSGABE=knapp; JUnit in test-reports/vitest/ always.
    ...vitestAusgabe("vitest", configDefaults.reporters),
  },
});
