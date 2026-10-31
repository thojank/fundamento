import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Outside `turbo run test` the tests would run against whatever `dist` of the workspace packages
// lies around; build this package's workspace dependencies first (Turborepo replays what is
// unchanged). Under turbo, `test` waits for `build`. No test here starts a browser or calls a
// provider (Spec 037 D-17): the renderer, the chat model and the tools are doubles.
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--filter=@fundamento/ekranoj^..."], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({});
