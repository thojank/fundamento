import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Outside `turbo run test` the tests would run against whatever `dist` lies around: the tests of
// the command line (kontrolo-cli) and the server (the built Eroj) need this package and its
// workspace dependencies built. Under turbo, `test` waits for `build`.
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--filter=@fundamento/metiejo..."], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// A derivation checks the whole Modelo with the brand composed (1.6 s on a quiet machine), an
// export builds projections on top; the budgets are sized for a loaded CI runner.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // The files of this package derive, build projections and run a server; side by side they
    // flooded the four cores of the CI runner next to the other packages of the unit job (run
    // 39651272243: the derivation spawns of the CLI's agordilo.test.ts ran past their 120 s).
    // One file at a time keeps the load of this package to one worker.
    fileParallelism: false,
  },
});
