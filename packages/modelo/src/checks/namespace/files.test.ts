import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { loadScanTree } from "./files.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

const tempDirs: string[] = [];

function makeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "fm-namespace-"));
  tempDirs.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("loadScanTree (filesystem walk)", () => {
  it("lists files relative to the root and skips node_modules, dist, .turbo and .git", async () => {
    const root = makeTree({
      "package.json": "{}",
      "src/a.ts": "",
      "node_modules/x/package.json": "{}",
      "dist/a.js": "",
      ".turbo/log": "",
      ".git/HEAD": "",
    });
    const tree = await loadScanTree(root);
    expect(tree.listing).toBe("walk");
    expect(tree.paths).toEqual(["package.json", "src/a.ts"]);
  });

  it("collects generated CSS under dist directories separately", async () => {
    const root = makeTree({
      "packages/p/dist/tokens.css": ":root{}",
      "packages/p/dist/a.js": "",
      "node_modules/x/dist/y.css": "",
    });
    const tree = await loadScanTree(root);
    expect(tree.generatedCss).toEqual(["packages/p/dist/tokens.css"]);
    expect(tree.texts.get("packages/p/dist/tokens.css")).toBe(":root{}");
  });

  it("excludes paths under test/fixtures/invalid", async () => {
    const root = makeTree({
      "test/fixtures/invalid/x/package.json": "{}",
      "test/fixtures/valid/x/package.json": "{}",
    });
    const tree = await loadScanTree(root);
    expect(tree.paths).toEqual(["test/fixtures/valid/x/package.json"]);
  });

  it("reads the texts of files the rules inspect and nothing else", async () => {
    const root = makeTree({ "a.json": "{}", "b.png": "x", "c.md": "# c" });
    const tree = await loadScanTree(root);
    expect([...tree.texts.keys()]).toEqual(["a.json"]);
  });
});

describe("loadScanTree (git listing)", () => {
  it("uses git ls-files inside the repo and never lists ignored files", async () => {
    const tree = await loadScanTree(repoRoot);
    expect(tree.listing).toBe("git");
    expect(tree.paths).toContain("package.json");
    expect(tree.paths).toContain("packages/modelo/src/checks/run.ts");
    expect(tree.paths.some((path) => path.split("/").includes("node_modules"))).toBe(false);
    expect(tree.paths.some((path) => path.includes("/test/fixtures/invalid/"))).toBe(false);
  });
});
