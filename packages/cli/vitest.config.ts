import { defineConfig } from "vitest/config";

// The cli tests spawn the built `fm` binary. On a cold CI runner a single spawn took 5.3 s, over
// Vitest's 5 s default, so these tests get a budget sized for a cold runner (Article X).
// jug_01M2W3K1YPP05F4XF86J71RGTK: spawn-heavy tests get factor 3 under CI. `fm projekcioj build`
// writes all eight Celoj in one spawn; it measured 14.8 s on the CI runner of PR #17 against the
// 30 s budget and timed out on a more loaded runner in PR #18. The factor buys time for the load,
// not for the work — locally the same build takes 2.3 s.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 30_000 * (process.env.CI === "true" ? 3 : 1),
    globalSetup: ["./vitest.global-setup.ts"],
  },
});
