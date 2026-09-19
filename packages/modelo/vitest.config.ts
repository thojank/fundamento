import { defineConfig } from "vitest/config";

// Several modelo tests spawn node (the export build, the checks) or validate full compositions.
// On a cold or loaded runner, and on Node 22 during the acceptance, they ran into Vitest's 5 s
// default; the budget is sized for that (Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK, Spec 001 review A).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 30_000,
  },
});
