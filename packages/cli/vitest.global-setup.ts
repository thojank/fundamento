// The cli tests drive `dist/index.js`, which imports the built `@fundamento/modelo`. Under
// `turbo run test` the build task has already run; anywhere else (`pnpm test` in this package,
// `vitest` directly) build the cli and its workspace dependencies first, so the tests never run
// against a missing or stale `dist` left over from an earlier build or a Turborepo cache.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliDir = fileURLToPath(new URL(".", import.meta.url));

export function setup(): void {
  if (process.env.TURBO_HASH !== undefined) return;
  execFileSync("pnpm", ["--filter", "@fundamento/cli...", "run", "build"], {
    cwd: cliDir,
    stdio: "inherit",
  });
}
