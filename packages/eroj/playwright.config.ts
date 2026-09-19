import { defineConfig, devices } from "@playwright/test";

// Rendered checks of the Eroj (Spec 003 T009, T011, T013). T009 needs one engine; the component
// checks add Firefox and WebKit.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  testDir: "test",
  testMatch: "**/*.spec.ts",
  timeout: 120_000,
  reporter: [["list"]],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
