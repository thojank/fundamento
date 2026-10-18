import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Outside `turbo run test` the tests would run against whatever `dist` of @fundamento/modelo lies
// around; build this package's workspace dependencies first (Turborepo replays what is
// unchanged). Under turbo, `test` waits for `build`.
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--filter=@fundamento/agordilo^..."], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// Every derivation validates and resolves the whole Modelo with the derived Aspekto (about a
// second), and the tests run in parallel with the other packages', so they get a budget sized for
// a loaded CI runner.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 60_000,
  },
});
