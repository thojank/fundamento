// `fundamento.config.json` (Spec 001, plan D-07; task T004).

import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CONFIG_FILE_NAME, readKonfiguro } from "./read-config.js";

let dir: string;

beforeEach(() => {
  // npm resolution returns real paths; macOS tmpdir is a symlink (/var → /private/var).
  dir = realpathSync(mkdtempSync(join(tmpdir(), "fundamento-config-")));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function aspektoPackage(path: string): string {
  const root = join(dir, path);
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "aspekto.json"), "{}");
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: path.split("node_modules/")[1] ?? "x" }),
  );
  return root;
}

function writeConfig(value: unknown, name = CONFIG_FILE_NAME): string {
  const file = join(dir, name);
  writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value));
  return file;
}

describe("readKonfiguro (D-07)", () => {
  it("resolves relative paths against the config file's directory", () => {
    const pkg = aspektoPackage("pkgs/aspekto-x");
    mkdirSync(join(dir, "project"));
    const file = writeConfig({ aspektoj: ["../pkgs/aspekto-x"] }, `project/${CONFIG_FILE_NAME}`);
    const result = readKonfiguro(file);
    expect(result.issues).toEqual([]);
    expect(result.konfiguro?.aspektoPackages).toEqual([pkg]);
  });

  it("resolves npm package names from the config file's directory", () => {
    const pkg = aspektoPackage("node_modules/@acme/aspekto-x");
    const result = readKonfiguro(writeConfig({ aspektoj: ["@acme/aspekto-x"] }));
    expect(result.issues).toEqual([]);
    expect(result.konfiguro?.aspektoPackages).toEqual([pkg]);
  });

  it("accepts a $schema member and keeps the listed order", () => {
    const a = aspektoPackage("a");
    const b = aspektoPackage("b");
    const result = readKonfiguro(
      writeConfig({ $schema: "./schema/config.schema.json", aspektoj: ["./b", "./a"] }),
    );
    expect(result.konfiguro?.aspektoPackages).toEqual([b, a]);
  });

  it("reports aspekto-package-missing with the resolved path and keeps the other packages", () => {
    const a = aspektoPackage("a");
    const file = writeConfig({ aspektoj: ["./missing", "./a", "@acme/nowhere"] });
    const result = readKonfiguro(file);
    expect(result.issues.map((i) => [i.rule, i.path])).toEqual([
      ["aspekto-package-missing", `${file}#/aspektoj/0`],
      ["aspekto-package-missing", `${file}#/aspektoj/2`],
    ]);
    expect(result.issues[0]?.message).toContain(join(dir, "missing"));
    expect(result.konfiguro?.aspektoPackages).toEqual([a]);
  });

  it("treats a directory without aspekto.json as a missing package", () => {
    mkdirSync(join(dir, "empty"));
    const result = readKonfiguro(writeConfig({ aspektoj: ["./empty"] }));
    expect(result.issues.map((i) => i.rule)).toEqual(["aspekto-package-missing"]);
  });

  it.each([
    [
      "a reference Aspekto field (Q2: the config lists packages only)",
      { aspektoj: [], referenceAspekto: "komuna" },
    ],
    ["a missing aspektoj list", {}],
    ["a non-string entry", { aspektoj: [1] }],
    ["duplicate entries", { aspektoj: ["./a", "./a"] }],
  ])("reports config-invalid for %s", (_label, value) => {
    aspektoPackage("a");
    const result = readKonfiguro(writeConfig(value));
    expect(result.konfiguro).toBeUndefined();
    expect(result.issues.length).toBeGreaterThan(0);
    expect(new Set(result.issues.map((i) => i.rule))).toEqual(new Set(["config-invalid"]));
  });

  it("reports json-syntax for malformed JSON and file-missing for a missing file", () => {
    expect(readKonfiguro(writeConfig('{ "aspektoj": [], }')).issues[0]?.rule).toBe("json-syntax");
    expect(readKonfiguro(join(dir, "nope.json")).issues[0]?.rule).toBe("file-missing");
  });
});
