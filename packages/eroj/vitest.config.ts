import { defineConfig } from "vitest/config";

// Unit tests only; the rendered checks in test/*.spec.ts run under Playwright (playwright.config.ts).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
