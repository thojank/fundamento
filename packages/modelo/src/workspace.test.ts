// Package layout of Phase 1 (Spec 001, plan D-01, D-13; task T001).

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packagesDir = new URL("../../", import.meta.url);

interface Manifest {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function manifest(dir: string): Manifest {
  return JSON.parse(readFileSync(new URL(`${dir}/package.json`, packagesDir), "utf8")) as Manifest;
}

const PACKAGES = {
  "aspekto-komuna": "@fundamento/aspekto-komuna",
  cli: "@fundamento/cli",
  mcp: "@fundamento/mcp",
  modelo: "@fundamento/modelo",
  vortaro: "@fundamento/vortaro",
} as const;

describe("workspace packages (plan D-01)", () => {
  it("has exactly the five Phase-1 packages", () => {
    const dirs = readdirSync(packagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(dirs).toEqual(Object.keys(PACKAGES));
    for (const [dir, name] of Object.entries(PACKAGES)) {
      expect(manifest(dir).name).toBe(name);
    }
  });

  it("puts every package and the workspace root on version 0.1.0", () => {
    for (const dir of Object.keys(PACKAGES)) {
      expect(manifest(dir).version, dir).toBe("0.1.0");
    }
    const root = JSON.parse(
      readFileSync(new URL("../package.json", packagesDir), "utf8"),
    ) as Manifest;
    expect(root.version).toBe("0.1.0");
  });

  it("pins the MCP SDK exactly and adds its zod peer (plan D-13)", () => {
    const mcp = manifest("mcp");
    expect(mcp.dependencies?.["@modelcontextprotocol/sdk"]).toBe("1.30.0");
    expect(mcp.dependencies?.zod).toMatch(/^\^4\./);
    expect(mcp.dependencies?.["@fundamento/modelo"]).toBe("workspace:*");
  });

  it("keeps aspekto-komuna a data-only package without dependencies", () => {
    const komuna = manifest("aspekto-komuna");
    expect(komuna.dependencies).toBeUndefined();
    expect(komuna.devDependencies).toBeUndefined();
    expect(komuna.peerDependencies).toBeUndefined();
  });
});
