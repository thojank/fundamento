import { defineConfig } from "vitest/config";

// Every build validates and resolves the whole Modelo (seconds, not milliseconds), and the tests
// run in parallel with the other packages', so they get a budget sized for a loaded CI runner.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: { testTimeout: 60_000 },
});
