// Make Kit Celo (Spec 003 T018; FR-11, plan D-14, contracts/projekcioj §6, Q2). One self-contained
// package per Aspekto, with guidelines generated from Modelo, Reguloj and Jugxoj — no hand-written
// line (Art. VII) — and a tarball that passes the clean-room fingerprints.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  findBrandValues,
  fingerprintOf,
  projectModeloSource,
  repoFingerprints,
} from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { buildMakeKits, MAKE_KIT_CELO, makeKitName } from "./make-kit.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const source = projectModeloSource(config);
const prepared = celoInputOf(source);
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = Object.fromEntries(
  MAKE_KIT_CELO.generate(prepared.input).map((f) => [f.path, f.text]),
);
const ASPEKTOJ = ["komuna", "ekzemplo"] as const;
const skemo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.skemo;
const reguloj = prepared.input.modelo.reguloj.filter(
  (regulo) => regulo.appliesTo?.eroj !== undefined,
);

const kit = (aspekto: string, path: string) => files[`make-kit/${aspekto}/${path}`] ?? "";

describe("Make Kit sources (T018)", () => {
  it.each(ASPEKTOJ)("%s: writes the package, the styles and the guidelines", (aspekto) => {
    const paths = Object.keys(files)
      .filter((path) => path.startsWith(`make-kit/${aspekto}/`))
      .map((path) => path.slice(`make-kit/${aspekto}/`.length))
      .sort();
    expect(paths).toEqual([
      "README.md",
      "guidelines/Guidelines.md",
      "guidelines/components/butono.md",
      "guidelines/foundations/color.md",
      "guidelines/foundations/dimensioj.md",
      "guidelines/foundations/spacing.md",
      "guidelines/foundations/typography.md",
      "guidelines/setup.md",
      "package.json",
      "src/index.ts",
      "src/react.ts",
      "styles.css",
      "tailwind.css",
    ]);
  });

  it.each(ASPEKTOJ)("%s: package.json follows the contract", (aspekto) => {
    const manifest = JSON.parse(kit(aspekto, "package.json")) as Record<string, unknown>;
    expect(manifest.name).toBe(makeKitName(aspekto));
    expect(String(manifest.version)).toMatch(/^0\.\d+\.\d+-/);
    expect(manifest.license).toBe("MIT");
    expect(manifest.publishConfig).toEqual({ access: "public", tag: "next" });
    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.peerDependencies).toEqual({ react: ">=18", "react-dom": ">=18" });
    expect(Object.keys(manifest.exports as object).sort()).toEqual([
      ".",
      "./guidelines/*",
      "./package.json",
      "./styles.css",
      "./tailwind.css",
    ]);
  });

  it.each(ASPEKTOJ)("%s: the guidelines carry every Ero Regulo with its kialo", (aspekto) => {
    const text = kit(aspekto, "guidelines/components/butono.md");
    expect(reguloj.length).toBeGreaterThan(2);
    for (const regulo of reguloj) {
      expect(text, regulo.name).toContain(regulo.name);
      expect(text, `${regulo.name} kialo`).toContain(regulo.kialo);
    }
  });

  it.each(ASPEKTOJ)(
    "%s: the guidelines show a CORRECT and a WRONG example from the Jugxoj",
    (aspekto) => {
      const text = kit(aspekto, "guidelines/components/butono.md");
      expect([...text.matchAll(/CORRECT/g)].length).toBeGreaterThanOrEqual(3);
      expect([...text.matchAll(/WRONG/g)].length).toBeGreaterThanOrEqual(3);
      const jugxo = prepared.input.modelo.jugxoj.find((entry) => entry.ekzemplo !== undefined);
      expect(text).toContain(jugxo?.kialo ?? "?");
    },
  );

  it.each(ASPEKTOJ)(
    "%s: every guideline names only props, classes and tokens that exist",
    (aspekto) => {
      const text = ASPEKTOJ.map((name) => name === aspekto)
        .map(() => "")
        .join("")
        .concat(
          [
            "Guidelines.md",
            "setup.md",
            "foundations/color.md",
            "foundations/typography.md",
            "foundations/spacing.md",
            "foundations/dimensioj.md",
            "components/butono.md",
          ]
            .map((file) => kit(aspekto, `guidelines/${file}`))
            .join("\n"),
        );
      expect(text).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      const styles = kit(aspekto, "styles.css");
      for (const match of text.matchAll(/`--fm-[a-z0-9-]+`/g)) {
        expect(styles, match[0]).toContain(match[0].slice(1, -1));
      }
      const tailwind = kit(aspekto, "tailwind.css");
      for (const match of text.matchAll(/`(?:bg|text|border|p|gap|rounded)-fm-[a-z0-9-]+`/g)) {
        const token = (match[0].split("-fm-")[1] ?? "").slice(0, -1);
        expect(tailwind, match[0]).toContain(`-fm-${token}`);
      }
      for (const match of text.matchAll(/`(variant|tone|size|type)=([a-z-]+)`/g)) {
        const prop = skemo?.props.find((candidate) => candidate.name === match[1]);
        expect(prop?.values, match[0]).toContain(match[2]);
      }
    },
  );

  it("ekzemplo ships its font as a name with generic fallbacks, never a file", () => {
    const styles = kit("ekzemplo", "styles.css");
    expect(styles).toContain("Ekzempla Grotesk");
    expect(styles).toMatch(/ui-sans-serif|system-ui|sans-serif/);
    expect(Object.keys(files).filter((path) => /\.(woff2?|ttf|otf)$/.test(path))).toEqual([]);
    const aspekto = JSON.parse(
      readFileSync(
        new URL(
          "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/aspekto-ekzemplo/aspekto.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ) as { license: string };
    expect(aspekto.license).toBe("MIT");
  });

  it("generates the same bytes twice", () => {
    expect(MAKE_KIT_CELO.generate(prepared.input)).toEqual(MAKE_KIT_CELO.generate(prepared.input));
  });
});

describe("Make Kit tarball (T018, clean room)", () => {
  let built: Record<string, string> = {};

  beforeAll(async () => {
    built = await buildMakeKits(mkdtempSync(join(tmpdir(), "fm-kits-")), source);
  }, 180_000);

  it("builds an ESM and a CJS bundle with types for every Aspekto", () => {
    for (const aspekto of ASPEKTOJ) {
      for (const file of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts"]) {
        expect(
          statSync(join(built[aspekto] ?? "", file)).size,
          `${aspekto}/${file}`,
        ).toBeGreaterThan(200);
      }
    }
  });

  it.each(ASPEKTOJ)(
    "%s: the packed tarball holds no brand value of the clean room",
    (aspekto) => {
      const dir = built[aspekto] ?? "";
      const target = mkdtempSync(join(tmpdir(), "fm-pack-"));
      const tarball = execFileSync("npm", ["pack", "--pack-destination", target], {
        cwd: dir,
        encoding: "utf8",
      }).trim();
      execFileSync("tar", ["-xzf", join(target, tarball), "-C", target]);
      const root = join(target, "package");
      const texts: [string, string][] = [];
      const walk = (current: string) => {
        for (const name of readdirSync(current)) {
          const path = join(current, name);
          if (statSync(path).isDirectory()) walk(path);
          else if (/\.(js|cjs|ts|css|json|md)$/.test(name)) {
            texts.push([relative(root, path), readFileSync(path, "utf8")]);
          }
        }
      };
      walk(root);
      expect(texts.length).toBeGreaterThan(10);
      for (const [path, text] of texts) {
        expect(findBrandValues(path, text, repoFingerprints()), path).toEqual([]);
      }
      // The check has teeth: the fingerprint of a colour the kit really contains is found.
      const styles = texts.find(([path]) => path.endsWith("styles.css"));
      const hex = /#[0-9a-f]{6}/.exec(styles?.[1] ?? "")?.[0] ?? "";
      expect(hex).not.toBe("");
      const planted = new Set([fingerprintOf({ kind: "hex", normalized: hex })]);
      expect(findBrandValues(styles?.[0] ?? "", styles?.[1] ?? "", planted).length).toBeGreaterThan(
        0,
      );
    },
    120_000,
  );
});
