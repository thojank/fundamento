// `fm metiejo` (Spec 023, K-1): the configurator's local server through the built binary, as
// `pnpm fm metiejo` runs it. The server itself is tested in @fundamento/metiejo; here the command
// line: help, flags, usage errors.

import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));

function fm(args: readonly string[]) {
  const child = spawnSync(process.execPath, [built, ...args], {
    cwd: repoRoot,
    env: { ...process.env, INIT_CWD: repoRoot },
    encoding: "utf8",
  });
  return { code: child.status, stdout: child.stdout, stderr: child.stderr };
}

describe("fm metiejo (Spec 023)", () => {
  it("is listed in the top-level help", () => {
    expect(fm(["--help"]).stdout).toMatch(/^\s+metiejo\s+/m);
  });

  it("explains itself: the port, the working directory, the .env of the checkout", () => {
    const run = fm(["metiejo", "--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("fm metiejo");
    expect(run.stdout).toContain("--port");
    expect(run.stdout).toContain("--workdir");
    expect(run.stdout).toContain(".env");
    expect(run.stdout).toContain("http://localhost:");
    expect(run.stdout).not.toContain("ciferecigo");
  });

  it("refuses a port that is no port number and an unknown option, with a hint", () => {
    const port = fm(["metiejo", "--port", "abc"]);
    expect(port.code).toBe(2);
    expect(port.stderr).toMatch(/port/i);
    const option = fm(["metiejo", "--prot", "7301"]);
    expect(option.code).toBe(2);
    expect(option.stderr).toContain("Did you mean");
    const positional = fm(["metiejo", "etwas"]);
    expect(positional.code).toBe(2);
  });
});
