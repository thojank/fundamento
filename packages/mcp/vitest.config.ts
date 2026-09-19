import { configDefaults, defineConfig } from "vitest/config";

// The AK-07 timings (src/e2e/perf.test.ts) never run here: inside the parallel Turborepo test run
// they measure the machine's load, not the server (Spec 001 D-17). `pnpm perf` runs them alone.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "src/e2e/perf.test.ts"],
  },
});
