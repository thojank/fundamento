// The `fundamento-mcp` bin (Spec 001 T027): the same flags as `fm mcp`, driven as built.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const BIN = new URL("../dist/index.js", import.meta.url).pathname;
const run = (args: readonly string[]) =>
  spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8" });

describe("fundamento-mcp", { timeout: 30_000 }, () => {
  it("is declared as a bin with a node shebang", () => {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    expect(pkg.bin).toEqual({ "fundamento-mcp": "dist/index.js" });
    expect(readFileSync(BIN, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });

  it("shows help and exits 0", () => {
    const help = run(["--help"]);
    expect(help.status).toBe(0);
    expect(help.stdout).toContain("fundamento-mcp");
    expect(help.stdout).toContain("--http");
  });

  it("exits 2 with a suggestion on an unknown flag", () => {
    const typo = run(["--htp"]);
    expect(typo.status).toBe(2);
    expect(typo.stderr).toContain("Did you mean `--http`?");
    expect(typo.stderr).not.toMatch(/\n\s+at /);
  });
});
