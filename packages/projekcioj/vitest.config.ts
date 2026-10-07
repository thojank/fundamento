import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Outside `turbo run test` (`pnpm --filter @fundamento/projekcioj test`, `vitest` in this directory) the
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

// Every build validates and resolves the whole Modelo (seconds, not milliseconds), and the tests
// run in parallel with the other packages', so they get a budget sized for a loaded CI runner.
// The generation budget (src/perf.test.ts, Spec 003 T026) never runs here: inside the parallel
// run it measures the machine's load, not the generator. `pnpm perf` runs it alone. The snapshot
// comparison (src/celoj/vitrino/bazo.test.ts, Spec 004 T012) stays out too: four full builds,
// 106 s on the CI runner, which left the MCP tests short of their 30 s. `pnpm check:vitrino`
// runs it.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "src/perf.test.ts", "src/celoj/vitrino/bazo.test.ts"],
    testTimeout: 60_000,
  },
});
