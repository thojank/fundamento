import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Outside `turbo run test` (`pnpm --filter @fundamento/mcp test`, `vitest` in this directory) the
// tests would run against whatever `dist` lies around, and a stale one fails far from its cause or
// not at all ("modelo.json has the bytes of `fm modelo export`", Vojmapo). So build the whole
// workspace first, not only this package's dependencies: tests spawn binaries of packages that
// depend on this one (modelo's e2e suite runs `packages/cli/dist`). Turborepo replays what is
// unchanged (0.3–0.4 s locally); a cold build took 3.7–4.4 s. Under turbo, `test` waits for `build`.
if (process.env.TURBO_HASH === undefined) {
  execFileSync("pnpm", ["turbo", "run", "build", "--output-logs=errors-only"], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

// The AK-07 timings (src/e2e/perf.test.ts) never run here: inside the parallel Turborepo test run
// they measure the machine's load, not the server (Spec 001 D-17). `pnpm perf` runs them alone.
// Composition and validation tests take 30 s on a loaded runner (14.5 s seen in CI; review A).
// Spec 004 made every validate do more work (seven new Reguloj over all tokens and combinations)
// and added the Vitrino tests to the gate: on the CI runner `gvidanto-tools` needed 63.9 s and
// `eroj-tools` 60.2 s for seven tests each, and `rules-resolve` — which validates two packages
// through a served Modelo — ran into the 30 s. The budget therefore follows the recorded ruling
// jug_01M2W3K1YPP05F4XF86J71RGTK: spawn-heavy tests get factor 3 under CI. A single
// `fm modelo validate` still takes 1.1 s, so this buys time for the load, not for the work.
const shared = {
  exclude: [...configDefaults.exclude, "src/e2e/perf.test.ts"],
  testTimeout: 30_000 * (process.env.CI === "true" ? 3 : 1),
};

// Spec 006 (B6): src/http.test.ts starts a child process that loads the Modelo. In CI it ran
// alongside the e2e files and their `beforeAll` hooks went from 1.2 s to 9–12 s, past the 10 s hook
// limit; locally the contest never shows because there are more cores. The file therefore runs in
// its own group, after every other file, never beside them.
const HTTP_SERVER = "src/http.test.ts";

// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          ...shared,
          name: "mcp",
          exclude: [...shared.exclude, HTTP_SERVER],
          sequence: { groupOrder: 0 },
        },
      },
      {
        test: {
          ...shared,
          name: "http-server",
          include: [HTTP_SERVER],
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
