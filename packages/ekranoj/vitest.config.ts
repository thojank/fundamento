import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Outside `turbo run test` the tests would run against whatever `dist` of the workspace packages
// lies around; build this package and its workspace dependencies first (Turborepo replays what is
// unchanged) – the AC-10 test also reads this package's own `dist` (S037-13). Under turbo, `test`
// waits for `build`. No test here starts a browser or calls a
// provider (Spec 037 D-17): the renderer, the chat model and the tools are doubles. The real
// Chromium tests (`*.browser.test.ts`) run only with `test:browser` (vitest.browser.config.ts).
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--filter=@fundamento/ekranoj..."], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, "**/*.browser.test.ts"] },
});
