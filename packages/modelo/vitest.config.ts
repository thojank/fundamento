import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Outside `turbo run test` (`pnpm --filter @fundamento/modelo test`, `vitest` in this directory) the
// tests would run against whatever `dist` lies around, and a stale one fails far from its cause or
// not at all ("modelo.json has the bytes of `fm modelo export`", Vojmapo). So build the whole
// workspace first, not only this package's dependencies: tests spawn binaries of packages that
// depend on this one (modelo's e2e suite runs `packages/cli/dist`). Turborepo replays what is
// unchanged (0.3–0.4 s locally); a cold build took 3.7–4.4 s. Under turbo, `test` waits for `build`.
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--output-logs=errors-only"], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// Several modelo tests spawn node (the export build, the checks) or validate full compositions.
// On a cold or loaded runner, and on Node 22 during the acceptance, they ran into Vitest's 5 s
// default; the budget is sized for that (Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK, Spec 001 review A).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 30_000,
  },
});
