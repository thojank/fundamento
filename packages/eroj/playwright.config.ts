import { defineConfig, devices } from "@playwright/test";

const ENGINES = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];

// PLAYWRIGHT_ENGINES names the engines to run, separated by spaces; unset means all three. CI sets
// it to Chromium for a PR run and to all three for the merge run on main (ci.yml). An unknown name
// fails here instead of quietly running fewer engines than asked for.
function selectedEngines(): typeof ENGINES {
  const names = process.env.PLAYWRIGHT_ENGINES?.split(/\s+/).filter((name) => name !== "");
  if (names === undefined || names.length === 0) return ENGINES;
  for (const name of names) {
    if (!ENGINES.some((engine) => engine.name === name)) {
      throw new Error(`PLAYWRIGHT_ENGINES: unknown engine "${name}"`);
    }
  }
  return ENGINES.filter((engine) => names.includes(engine.name));
}

// Rendered checks of the Eroj (Spec 003 T009, T011, T013). T009 needs one engine; the component
// checks add Firefox and WebKit.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  testDir: "test",
  testMatch: "**/*.spec.ts",
  // The quickstart installs and builds a project of its own; it has its own config and CI step.
  testIgnore: "**/quickstart.spec.ts",
  timeout: 120_000,
  reporter: [["list"]],
  projects: selectedEngines(),
});
