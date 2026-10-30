// Spec 035, AC-11: Playwright is an optional dependency of the Metiejo, imported only when Weg C
// renders a page or the Enportilo decodes a JPG or WebP. The start of the MCP server (AK-07) and of
// `fm` – its help and the Metiejo server, which carries the renderer – must not load it. A loader
// hook (module.registerHooks, for import and require alike) writes every module the process loads
// into a file; a control process that does import Playwright shows that the hook would see it.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const metiejo = join(repoRoot, "packages/metiejo");
const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-start-"));
const hook = join(scratch, "protokolo.mjs");
writeFileSync(
  hook,
  `import { appendFileSync } from "node:fs";
import { registerHooks } from "node:module";
const file = process.env.FM_MODULOJ_PROTOKOLO;
registerHooks({
  load(url, context, nextLoad) {
    appendFileSync(file, url + "\\n");
    return nextLoad(url, context);
  },
});
`,
);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** A module of Playwright (or its core), as pnpm lays it out or a plain node_modules. */
const PLAYWRIGHT = /\/node_modules\/(\.pnpm\/)?playwright(-core)?[@/]/;

let runs = 0;
/** Starts node with the hook; `ready` resolves when the process is up; the modules it loaded. */
async function loaded(
  args: readonly string[],
  ready: (child: ChildProcess) => Promise<void>,
  cwd = repoRoot,
): Promise<string[]> {
  runs += 1;
  const file = join(scratch, `moduloj-${runs}.txt`);
  const child = spawn(process.execPath, ["--import", pathToFileURL(hook).href, ...args], {
    cwd,
    env: { ...process.env, FM_MODULOJ_PROTOKOLO: file },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const exited = new Promise<void>((done) => child.once("exit", () => done()));
  try {
    await ready(child);
  } finally {
    child.kill();
    await exited;
  }
  return existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean) : [];
}

const exit = (child: ChildProcess) =>
  new Promise<void>((done) => {
    child.stdout?.resume();
    child.stderr?.resume();
    child.once("exit", () => done());
  });

/** The MCP server over stdio: initialize, then the first describe (the line AK-07 measures). */
const describeAnswered = (child: ChildProcess) =>
  new Promise<void>((done, fail) => {
    let out = "";
    child.stderr?.resume();
    child.stdout?.on("data", (chunk: Buffer) => {
      out += chunk.toString("utf8");
      if (out.includes('"id":1') && !out.includes('"id":2') && !child.stdin?.writableEnded) {
        child.stdin?.write(
          `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n${JSON.stringify(
            {
              jsonrpc: "2.0",
              id: 2,
              method: "tools/call",
              params: { name: "describe", arguments: {} },
            },
          )}\n`,
        );
      }
      if (out.includes('"id":2')) done();
    });
    child.once("exit", () => fail(new Error(`the MCP server ended early: ${out}`)));
    child.stdin?.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "start-ohne-playwright", version: "0" },
        },
      })}\n`,
    );
  });

describe("the start loads no Playwright (Spec 035, AC-11)", () => {
  it("control: a process that imports Playwright is seen by the hook", async () => {
    const modules = await loaded(
      ["--input-type=module", "-e", 'await import("playwright");'],
      exit,
      metiejo,
    );
    expect(modules.some((url) => PLAYWRIGHT.test(url))).toBe(true);
  });

  it("the MCP server up to its first describe answer", async () => {
    const modules = await loaded(
      [
        join(repoRoot, "packages/mcp/dist/index.js"),
        "--config",
        join(
          repoRoot,
          "packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
        ),
      ],
      describeAnswered,
    );
    expect(modules.some((url) => url.includes("/packages/mcp/dist/"))).toBe(true);
    expect(modules.filter((url) => PLAYWRIGHT.test(url))).toEqual([]);
  });

  it("fm --help", async () => {
    const modules = await loaded([join(repoRoot, "packages/cli/dist/index.js"), "--help"], exit);
    expect(modules.some((url) => url.includes("/packages/metiejo/dist/"))).toBe(true);
    expect(modules.filter((url) => PLAYWRIGHT.test(url))).toEqual([]);
  });

  it("fm metiejo up to its first page: the renderer is loaded, Playwright is not", async () => {
    const workdir = join(scratch, "marken");
    const port = 7600 + Math.floor(Math.random() * 300);
    const modules = await loaded(
      [
        join(repoRoot, "packages/cli/dist/index.js"),
        "metiejo",
        "--port",
        String(port),
        "--workdir",
        workdir,
      ],
      async (child) => {
        child.stdout?.resume();
        child.stderr?.resume();
        for (let attempt = 0; attempt < 100; attempt += 1) {
          if (child.exitCode !== null) throw new Error("fm metiejo ended early");
          try {
            if ((await fetch(`http://localhost:${port}/`)).ok) return;
          } catch {}
          await new Promise((done) => setTimeout(done, 200));
        }
        throw new Error("fm metiejo did not start");
      },
    );
    expect(modules.some((url) => url.endsWith("/packages/metiejo/dist/enportilo/bildilo.js"))).toBe(
      true,
    );
    expect(modules.filter((url) => PLAYWRIGHT.test(url))).toEqual([]);
  });
});
