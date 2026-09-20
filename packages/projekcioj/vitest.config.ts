import { configDefaults, defineConfig } from "vitest/config";

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
