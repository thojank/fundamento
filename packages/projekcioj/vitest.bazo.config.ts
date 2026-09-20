import { defineConfig } from "vitest/config";

// check:bazo (Spec 004 T012): the snapshot comparison alone. It takes a measurement of all 72
// combinations through the CLI and builds the projections three times — 106 s on the CI runner,
// enough to starve the MCP tests next to it. It therefore runs with the Vitrino check, outside
// the parallel test gate, like `check:make-kit` and `check:quickstart`.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["src/celoj/vitrino/bazo.test.ts"],
    testTimeout: 240_000,
  },
});
