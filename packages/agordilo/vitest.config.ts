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

// Every derivation validates and resolves the whole Modelo with the derived Aspekto (1.7 s on a
// quiet machine: validation 1.1 s, Alirebleco 0.4 s, the palettes 0.09 s), and the tests run in
// parallel with the other packages' (measured: a beforeAll with two derivations passed 10 s under
// that load; the suite took 117 s in CI run 39158336356). The tests derive as rarely as they can
// (four derivations in all); tests and hooks that derive get a budget sized for a loaded runner.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
