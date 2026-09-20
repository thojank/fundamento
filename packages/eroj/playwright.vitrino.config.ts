import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// check:vitrino (Spec 004 T012): builds the projections and drives the one HTML file. One engine
// is enough — the rendering of the Eroj is proved in three by the other checks.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  testMatch: "**/vitrino.check.ts",
  testIgnore: [],
  timeout: 300_000,
  projects: [base.projects?.[0] ?? { name: "chromium" }],
});
