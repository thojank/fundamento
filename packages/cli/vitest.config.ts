import { defineConfig } from "vitest/config";

// The cli tests spawn the built `fm` binary. On a cold CI runner a single spawn took 5.3 s, over
// Vitest's 5 s default, so these tests get a budget sized for a cold runner (Article X).
// F12: Der Verdrahtungstest von `fm projekcioj build` baut nur noch einen Celo und trägt sein
// eigenes, an der Arbeit gemessenes Budget; ein pauschaler Faktor für die CI ist hier deshalb
// nicht mehr nötig.
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    testTimeout: 30_000,
    globalSetup: ["./vitest.global-setup.ts"],
  },
});
