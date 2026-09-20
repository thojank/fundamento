import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// check:quickstart (Spec 003 T027, AK-07): installs the packed Eroj in a fresh Vite project and
// builds it. Like the Make Kit check it runs outside the parallel test gate, which would otherwise
// measure the machine's load; one engine is enough, the rendering is proved in three elsewhere.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  testMatch: "**/quickstart.spec.ts",
  testIgnore: [],
  timeout: 900_000,
  projects: [base.projects?.[0] ?? { name: "chromium" }],
});
