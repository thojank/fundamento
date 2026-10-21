// The release path of the Make Kits (Spec 003 T020, Q2): what a publish would contain, and the
// workflow that does it. Nothing is published here; the maintainer publishes after the acceptance,
// through npm Trusted Publishing (OIDC), never with a token.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
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
      // F25: the LICENSE is written by the generator, so it lands in the package whatever tool
      // packs it — `npm publish` by hand left it out, pnpm had taken it from the repository root.
      // Spec 008: one guideline per Ero, the ligilo's next to the butono's.
      // Nachlese 6 N6-3: without the second (CJS) build, 47 files; Spec 020 ①: and a guideline
      // per Sxablono in patterns/, 49; Spec 020 ②: formularo and filtrilo, 51;
      // Spec 020 ③: kodbloko, markdovido and redaktilo, 54; Spec 025 ①: glitilo, 55.
      expect(files).toHaveLength(55);
      expect(files).toEqual([
        "LICENSE",
        "README.md",
        "dist/element.d.ts",
        "dist/element.js",
        "dist/index.d.ts",
        "dist/index.js",
        "guidelines/Guidelines.md",
        "guidelines/components/alsxutilo.md",
        "guidelines/components/apartigilo.md",
        "guidelines/components/atributlisto.md",
        "guidelines/components/avataro.md",
        "guidelines/components/avizo.md",
        "guidelines/components/butono.md",
        "guidelines/components/dialogo.md",
        "guidelines/components/elektilo.md",
        "guidelines/components/elekto.md",
        "guidelines/components/faldilo.md",
        "guidelines/components/glitilo.md",
        "guidelines/components/ikono.md",
        "guidelines/components/insigno.md",
        "guidelines/components/kampo.md",
        "guidelines/components/karto.md",
        "guidelines/components/kodbloko.md",
        "guidelines/components/kompletigilo.md",
        "guidelines/components/konsileto.md",
        "guidelines/components/langetaro.md",
        "guidelines/components/ligilo.md",
        "guidelines/components/markdovido.md",
        "guidelines/components/markobutono.md",
        "guidelines/components/menuo.md",
        "guidelines/components/mezurilo.md",
        "guidelines/components/navigado.md",
        "guidelines/components/pagxigilo.md",
        "guidelines/components/plenstato.md",
        "guidelines/components/saltligilo.md",
        "guidelines/components/spuro.md",
        "guidelines/components/sxaltilo.md",
        "guidelines/components/sxvebilo.md",
        "guidelines/components/tabelo.md",
        "guidelines/components/tekstareo.md",
        "guidelines/components/teksto.md",
        "guidelines/components/titolo.md",
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
      ]);
      expect(files.some((file) => file.startsWith("src/"))).toBe(false);
      expect(readFileSync(join(kits[aspekto] ?? "", "LICENSE"), "utf8")).toBe(
        readFileSync(new URL("../../../../../LICENSE", import.meta.url), "utf8"),
      );
    },
  );
});
