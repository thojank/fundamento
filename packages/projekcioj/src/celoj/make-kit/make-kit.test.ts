// Make Kit Celo (Spec 003 T018; FR-11, plan D-14, contracts/projekcioj §6, Q2). One self-contained
// package per Aspekto, with guidelines generated from Modelo, Reguloj and Jugxoj — no hand-written
// line (Art. VII) — and a tarball that passes the clean-room fingerprints.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  findBrandValues,
  fingerprintIndex,
  fingerprintOf,
  projectModeloSource,
  repoFingerprintIndex,
} from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { buildMakeKits, guidelinesInventory, MAKE_KIT_CELO, makeKitName } from "./make-kit.js";

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
      "LICENSE",
      "README.md",
      "guidelines/Guidelines.md",
      "guidelines/components/butono.md",
      "guidelines/components/kampo.md",
      "guidelines/components/ligilo.md",
      "guidelines/components/sxaltilo.md",
      "guidelines/foundations/color.md",
      "guidelines/foundations/dimensioj.md",
      "guidelines/foundations/spacing.md",
      "guidelines/foundations/typography.md",
      "guidelines/setup.md",
      "package.json",
      "src/element.ts",
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
    // Tree shaking in a user's build must keep the registration and the stylesheets (K1).
    expect(manifest.sideEffects).toEqual([
      "**/*.css",
      "./dist/element.js",
      "./dist/element.cjs",
      "./dist/index.js",
      "./dist/index.cjs",
    ]);
    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.peerDependencies).toEqual({ react: ">=18", "react-dom": ">=18" });
    // Provenance fails when repository.url does not match the repository the workflow runs in (F7).
    // The directory must exist in the repository, so the link from npm leads somewhere: the kit
    // is generated, its source is the generator (K2).
    expect(manifest.repository).toEqual({
      type: "git",
      url: "git+https://github.com/thojank/fundamento.git",
      directory: "packages/projekcioj",
    });
    expect(manifest.homepage).toBe("https://github.com/thojank/fundamento#readme");
    expect(Object.keys(manifest.exports as object).sort()).toEqual([
      ".",
      "./element",
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
      for (const match of text.matchAll(/`(emphasis|intent|size|type)=([a-z-]+)`/g)) {
        const prop = skemo?.props.find((candidate) => candidate.name === match[1]);
        expect(prop?.values, match[0]).toContain(match[2]);
      }
    },
  );

  it("ekzemplo ships its font as a name with generic fallbacks, never a file", () => {
    const styles = kit("ekzemplo", "styles.css");
    expect(styles).toContain("Archivo");
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

// Spec 007 T026 (A12, D-10): the component guideline carries the Uzo, generated, no hand-written
// line. The sections are the ones plan D-10 names (Wofür, Nicht dafür, Zusammen mit, Slots,
// Layout, Text), in the English the guideline is written in.
describe("Make Kit guidelines carry the Uzo (T026)", () => {
  const uzo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
  const text = kit("komuna", "guidelines/components/butono.md");
  const section = (heading: string) => {
    const start = text.indexOf(`\n## ${heading}\n`);
    expect(start, heading).toBeGreaterThan(-1);
    const rest = text.slice(start + heading.length + 5);
    const end = rest.indexOf("\n## ");
    return end === -1 ? rest : rest.slice(0, end);
  };

  it.each(["What it is for", "Not for this", "Together with", "Slots", "Layout", "Text"])(
    "has the section %s",
    (heading) => {
      expect(text).toContain(`\n## ${heading}\n`);
    },
  );

  it("What it is for: the purpose of the Uzo", () => {
    expect(section("What it is for")).toContain(uzo?.purpose ?? "?");
  });

  it("Not for this: every boundary and alternative with its action and kialo", () => {
    const body = section("Not for this");
    for (const boundary of uzo?.boundary ?? []) {
      expect(body, boundary.case).toContain(`**${boundary.case}**`);
      expect(body, boundary.case).toContain(boundary.action);
      expect(body, boundary.case).toContain(boundary.kialo);
    }
    for (const alternative of uzo?.instead ?? []) {
      expect(body, alternative.goal).toContain(`**${alternative.goal}**`);
      expect(body, alternative.goal).toContain(alternative.kialo);
    }
  });

  it("Together with: containers, companions and who owns the spacing, each with its kialo", () => {
    const body = section("Together with");
    for (const container of uzo?.composes.containers ?? []) {
      expect(body).toContain(`\`${container.name}\``);
      expect(body).toContain(container.kialo);
    }
    for (const companion of uzo?.composes.with ?? []) expect(body).toContain(companion.kialo);
    expect(body).toContain("spacing-owned-by-container");
  });

  it("Slots: what each slot accepts, how many, and the nesting", () => {
    const body = section("Slots");
    for (const [slot, rule] of Object.entries(uzo?.slots ?? {})) {
      expect(body).toContain(`\`${slot}\``);
      for (const accepted of rule.accepts ?? []) expect(body).toContain(accepted);
    }
  });

  it("Layout: size, wrap and the full-width allowance with its Regulo", () => {
    const body = section("Layout");
    expect(body).toContain(uzo?.layout.size ?? "?");
    expect(body).toContain(uzo?.layout.wrap ?? "?");
    expect(body).toContain("action-bar");
    expect(body).toContain("viewport=compact");
    expect(body).toContain("full-width-in-action-bar-or-compact");
  });

  it("Text: every text rule as fixed or adjustable, with one CORRECT and one WRONG label", () => {
    const body = section("Text");
    for (const rule of uzo?.content ?? []) {
      expect(body, rule.regulo).toContain(`**${rule.regulo}**`);
      expect(body, rule.regulo).toContain(rule.fixed ? "fixed" : "adjustable");
    }
    expect(body).toContain("Projekt löschen");
    expect(body).toContain("Entwurf verwerfen");
    expect(body).toMatch(/CORRECT/);
    expect(body).toMatch(/WRONG/);
  });

  it("guidelinesInventory knows the sections and still reads only the props table", () => {
    const item = guidelinesInventory(text);
    expect(item.sections).toEqual([
      "Props",
      "Which butono for which goal",
      "Rules",
      "Examples",
      "What it is for",
      "Not for this",
      "Together with",
      "Slots",
      "Layout",
      "Text",
    ]);
    // The slot and layout tables name `label`, `icon-start`, `size`: none of them is a prop value.
    expect(Object.keys(item.props).sort()).toEqual(
      (skemo?.props ?? []).map((prop) => prop.name).sort(),
    );
    expect(item.props.label).toEqual(["string"]);
  });
});

describe("Make Kit tarball (T018, clean room)", () => {
  let built: Record<string, string> = {};

  beforeAll(async () => {
    built = await buildMakeKits(mkdtempSync(join(tmpdir(), "fm-kits-")), source);
  }, 180_000);

  it("builds an ESM and a CJS bundle with types for every Aspekto", () => {
    for (const aspekto of ASPEKTOJ) {
      for (const file of [
        "dist/index.js",
        "dist/index.cjs",
        "dist/index.d.ts",
        "dist/element.js",
        "dist/element.cjs",
        "dist/element.d.ts",
      ]) {
        expect(
          statSync(join(built[aspekto] ?? "", file)).size,
          `${aspekto}/${file}`,
        ).toBeGreaterThan(100);
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
        expect(findBrandValues(path, text, repoFingerprintIndex()), path).toEqual([]);
      }
      // The check has teeth: the fingerprint of a colour the kit really contains is found.
      const styles = texts.find(([path]) => path.endsWith("styles.css"));
      const hex = /#[0-9a-f]{6}/.exec(styles?.[1] ?? "")?.[0] ?? "";
      expect(hex).not.toBe("");
      const planted = fingerprintIndex([
        { source: "testmarko", fingerprints: [fingerprintOf({ kind: "hex", normalized: hex })] },
      ]);
      expect(findBrandValues(styles?.[0] ?? "", styles?.[1] ?? "", planted).length).toBeGreaterThan(
        0,
      );
    },
    120_000,
  );
});

// The pre-release number of a kit is set from outside (release.yml, F25): the next publish is
// 0.1.0-next.1, and nothing in the repository changes for it. It has to be a pre-release of the
// Modelo's version — anything else would publish under a number the Modelo does not have.
describe("the kit version comes from FUNDAMENTO_KIT_VERSION (release step)", () => {
  if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
  const withEnv = (value: string | undefined) => ({
    ...prepared.input,
    env: value === undefined ? {} : { FUNDAMENTO_KIT_VERSION: value },
  });
  const versionOf = (files: { path: string; text: string }[]) =>
    (
      JSON.parse(files.find((f) => f.path.endsWith("komuna/package.json"))?.text ?? "{}") as {
        version: string;
      }
    ).version;
  const modelo = prepared.input.modeloJson.fundamento.version;

  it("defaults to <modelo>-next.0", () => {
    expect(versionOf(MAKE_KIT_CELO.generate(withEnv(undefined)))).toBe(`${modelo}-next.0`);
  });

  it("takes the requested pre-release of the Modelo's version", () => {
    expect(versionOf(MAKE_KIT_CELO.generate(withEnv(`${modelo}-next.1`)))).toBe(`${modelo}-next.1`);
  });

  it("refuses a version that is not a pre-release of the Modelo's version, and says why", () => {
    expect(() => MAKE_KIT_CELO.generate(withEnv("0.2.0-next.0"))).toThrow(
      new RegExp(`0\\.2\\.0-next\\.0.*${modelo.replaceAll(".", "\\.")}`),
    );
    expect(() => MAKE_KIT_CELO.generate(withEnv(modelo))).toThrow(/pre-release|Vorab/);
  });
});

// Spec 010 ① (G7, plan D-12): Make builds every on/off setting from the switch, never from a
// button that pretends — one sentence in the guidelines, generated from every Ero with role switch;
// the switch's own page names no label prop it does not have.
describe("Make Kit and the sxaltilo (Spec 010 ①)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines say that every on/off setting is a <Sxaltilo>",
    (aspekto) => {
      expect(kit(aspekto, "guidelines/Guidelines.md")).toContain(
        "- Every on/off setting that applies at once is a `<Sxaltilo>`; never a button that pretends.",
      );
      const page = kit(aspekto, "guidelines/components/sxaltilo.md");
      expect(page).toContain("# Sxaltilo");
      expect(page).toContain("`checked`");
      expect(page).not.toContain("set `label` as its accessible name");
      // The butono has the label prop, and its page still says how to use it.
      expect(kit(aspekto, "guidelines/components/butono.md")).toContain(
        "set `label` as its accessible name",
      );
    },
  );
});
