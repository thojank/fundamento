import { defineConfig } from "vitest/config";

// `pnpm perf`: the AK-07 timings alone, one file, no parallel test files (Spec 001 D-17).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["src/e2e/perf.test.ts"],
    fileParallelism: false,
  },
});
