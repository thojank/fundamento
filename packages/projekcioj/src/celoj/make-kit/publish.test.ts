// The release path of the Make Kits (Spec 003 T020, Q2): what a publish would contain, and the
// workflow that does it. Nothing is published here; the maintainer publishes after the acceptance,
// through npm Trusted Publishing (OIDC), never with a token.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { buildMakeKits, makeKitName } from "./make-kit.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;

const ASPEKTOJ = ["komuna", "ekzemplo"] as const;

/** Spec 046 T1: the number of Eroj, read from the folders of the repo Modelo (testing.md). */
const EROJ_DIR = fileURLToPath(new URL("../../../../modelo/data/eroj/", import.meta.url));
const ERO_COUNT = readdirSync(EROJ_DIR).filter((name) =>
  existsSync(join(EROJ_DIR, name, "skemo.json")),
).length;
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
      // F25: the LICENSE is written by the generator, so it lands in the package whatever tool
      // packs it — `npm publish` by hand left it out, pnpm had taken it from the repository root.
      // Spec 008: one guideline per Ero, the ligilo's next to the butono's.
      // Nachlese 6 N6-3: without the second (CJS) build, 47 files; Spec 020 ①: and a guideline
      // per Sxablono in patterns/, 49; Spec 020 ②: formularo and filtrilo, 51;
      // Spec 020 ③: kodbloko, markdovido and redaktilo, 54; Spec 025 ①: glitilo, 55; Spec 025 ②: datelektilo, 56; Spec 025 ③: four more, 60.
      // Spec 046 T1: twenty files beside one guideline per Ero.
      expect(files).toHaveLength(20 + ERO_COUNT);
      expect(files).toEqual(
        [
          "LICENSE",
          "README.md",
          "dist/element.d.ts",
          "dist/element.js",
          "dist/index.d.ts",
          "dist/index.js",
          "guidelines/Guidelines.md",
          "guidelines/foundations/color.md",
          "guidelines/foundations/dimensioj.md",
          "guidelines/foundations/spacing.md",
          "guidelines/foundations/typography.md",
          "guidelines/patterns/filtrilo.md",
          "guidelines/patterns/formularo.md",
          "guidelines/patterns/pagxo.md",
          "guidelines/patterns/redaktilo.md",
          "guidelines/patterns/sxelo.md",
          "guidelines/setup.md",
          "package.json",
          "styles.css",
          "tailwind.css",
          ...readdirSync(EROJ_DIR)
            .filter((name) => existsSync(join(EROJ_DIR, name, "skemo.json")))
            .map((name) => `guidelines/components/${name}.md`),
        ].sort(),
      );
      expect(files.some((file) => file.startsWith("src/"))).toBe(false);
      expect(readFileSync(join(kits[aspekto] ?? "", "LICENSE"), "utf8")).toBe(
        readFileSync(new URL("../../../../../LICENSE", import.meta.url), "utf8"),
      );
    },
  );
});
