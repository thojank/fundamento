// The release path of the Make Kits (Spec 003 T020, Q2): what a publish would contain, and the
// workflow that does it. Nothing is published here; the maintainer publishes after the acceptance,
// through npm Trusted Publishing (OIDC), never with a token.

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectModeloSource } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { buildMakeKits, makeKitName } from "./make-kit.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;

const ASPEKTOJ = ["komuna", "ekzemplo"] as const;
let kits: Record<string, string> = {};

beforeAll(async () => {
  kits = await buildMakeKits(
    mkdtempSync(join(tmpdir(), "fm-publish-")),
    projectModeloSource(config),
  );
}, 300_000);

interface PackResult {
  name: string;
  version: string;
  files: { path: string }[];
  publishConfig?: { tag?: string; access?: string };
}

function packed(dir: string): PackResult {
  const output = execFileSync("pnpm", ["pack", "--dry-run", "--json"], {
    cwd: dir,
    encoding: "utf8",
    stdio: "pipe",
  });
  return JSON.parse(output.slice(output.indexOf("{"))) as PackResult;
}

describe("what a publish would contain (T020)", () => {
  it.each(ASPEKTOJ)(
    "%s: exactly the files of the contract, nothing of the workspace",
    (aspekto) => {
      const result = packed(kits[aspekto] ?? "");
      expect(result.name).toBe(makeKitName(aspekto));
      expect(result.version).toMatch(/^0\.\d+\.\d+-next\.\d+$/);
      const files = result.files.map((file) => file.path).sort();
      expect(files).toEqual([
        "README.md",
        "dist/element.cjs",
        "dist/element.d.ts",
        "dist/element.js",
        "dist/index.cjs",
        "dist/index.d.ts",
        "dist/index.js",
        "guidelines/Guidelines.md",
        "guidelines/components/butono.md",
        "guidelines/foundations/color.md",
        "guidelines/foundations/dimensioj.md",
        "guidelines/foundations/spacing.md",
        "guidelines/foundations/typography.md",
        "guidelines/setup.md",
        "package.json",
        "styles.css",
        "tailwind.css",
      ]);
      expect(files.some((file) => file.startsWith("src/"))).toBe(false);
    },
  );
});
