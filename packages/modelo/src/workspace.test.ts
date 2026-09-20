// Package layout of Phase 1 (Spec 001, plan D-01, D-13; task T001) and Phase 3 (Spec 003, D-01;
// task T008).

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
  eroj: "@fundamento/eroj",
  mcp: "@fundamento/mcp",
  modelo: "@fundamento/modelo",
  projekcioj: "@fundamento/projekcioj",
  vortaro: "@fundamento/vortaro",
} as const;

describe("workspace packages (plan D-01)", () => {
  it("has exactly the five Phase-1 packages and the two of Phase 3", () => {
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

  it("pins the MCP SDK v2 packages exactly (Spec 002 plan D-17)", () => {
    const mcp = manifest("mcp");
    expect(mcp.dependencies?.["@modelcontextprotocol/server"]).toBe("2.0.0");
    expect(mcp.dependencies?.["@modelcontextprotocol/node"]).toBe("2.0.0");
    expect(mcp.devDependencies?.["@modelcontextprotocol/client"]).toBe("2.0.0");
    expect(manifest("cli").devDependencies?.["@modelcontextprotocol/client"]).toBe("2.0.0");
    expect(mcp.dependencies?.["@fundamento/modelo"]).toBe("workspace:*");
  });

  it("no longer depends on the v1 SDK or on zod directly (D-17)", () => {
    for (const dir of Object.keys(PACKAGES)) {
      const { dependencies, devDependencies } = manifest(dir);
      const names = Object.keys({ ...dependencies, ...devDependencies });
      expect(names, dir).not.toContain("@modelcontextprotocol/sdk");
      expect(names, dir).not.toContain("zod");
    }
  });

  it("keeps aspekto-komuna a data-only package without dependencies", () => {
    const komuna = manifest("aspekto-komuna");
    expect(komuna.dependencies).toBeUndefined();
    expect(komuna.devDependencies).toBeUndefined();
    expect(komuna.peerDependencies).toBeUndefined();
  });

  it("gives both Phase-3 packages the MIT license (T008)", () => {
    expect((manifest("projekcioj") as Manifest & { license?: string }).license).toBe("MIT");
    expect((manifest("eroj") as Manifest & { license?: string }).license).toBe("MIT");
  });

  it("pins the Phase-3 dev dependencies exactly (plan: Dependencies)", () => {
    expect(manifest("projekcioj").devDependencies).toMatchObject({
      vite: "8.3.0",
      "@vitejs/plugin-react": "6.1.1",
      tailwindcss: "4.3.3",
      "@tailwindcss/vite": "4.3.3",
      "@figma/plugin-typings": "1.138.0",
      "@figma/code-connect": "2.0.1",
    });
    expect(manifest("eroj").devDependencies).toMatchObject({
      "@playwright/test": "1.63.0",
      "axe-core": "4.13.0",
      "@axe-core/playwright": "4.13.0",
      react: "19.3.0",
      "react-dom": "19.3.0",
      "react-18": "npm:react@18.3.1",
      "react-dom-18": "npm:react-dom@18.3.1",
    });
  });

  it("keeps @fundamento/eroj free of runtime dependencies; React is a peer >= 18 (D-08)", () => {
    const eroj = manifest("eroj");
    expect(eroj.dependencies).toBeUndefined();
    expect(eroj.peerDependencies).toEqual({ react: ">=18", "react-dom": ">=18" });
  });

  it("ignores the generated sources of @fundamento/eroj (Art. I: generated, never committed)", () => {
    const gitignore = readFileSync(new URL("../.gitignore", packagesDir), "utf8");
    expect(gitignore.split("\n")).toContain("packages/eroj/src/generated/");
  });
});
