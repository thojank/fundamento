import { defineConfig } from "vitest/config";

// `pnpm perf`: the generation budget of Spec 003 T026 alone, one file, no parallel test files.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["src/perf.test.ts"],
    fileParallelism: false,
  },
});
