import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Real Chromium for ekranoj (Spec 037 D-17): local only, never in CI and never in `test`. Runs
// `src/**/*.browser.test.ts`: the brand builds come from this checkout's cli (`fm projekcioj
// build`), so the cli and its workspace dependencies are built first (Turborepo replays what is
// unchanged). The browser opens local files only; no provider is called. The timeouts equal the
// Eroj Playwright suite's test timeout (packages/eroj/playwright.config.ts, 120 000 ms) – two brand
// builds and the renders of two runs happen in the hook.
execFileSync(
  "pnpm",
  ["turbo", "run", "build", "--filter=@fundamento/ekranoj^...", "--filter=@fundamento/cli"],
  { cwd: fileURLToPath(new URL("../..", import.meta.url)), stdio: "inherit" },
);

// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["src/**/*.browser.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
