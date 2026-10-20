// Make Kit Celo (Spec 003 T018; FR-11, plan D-14, contracts/projekcioj §6, Q2). One self-contained
// package per Aspekto, with guidelines generated from Modelo, Reguloj and Jugxoj — no hand-written
// line (Art. VII) — and a tarball that passes the clean-room fingerprints.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
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
      "guidelines/components/ikono.md",
      "guidelines/components/insigno.md",
      "guidelines/components/kampo.md",
      "guidelines/components/karto.md",
      "guidelines/components/kompletigilo.md",
      "guidelines/components/konsileto.md",
      "guidelines/components/langetaro.md",
      "guidelines/components/ligilo.md",
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
    // Nachlese 6 N6-3: one built version per entry (ESM); require() of Node 22+ loads it too.
    expect(manifest.sideEffects).toEqual(["**/*.css", "./dist/element.js", "./dist/index.js"]);
    expect(manifest.main).toBe("./dist/index.js");
    expect((manifest.exports as Record<string, unknown>)["."]).toEqual({
      types: "./dist/index.d.ts",
      default: "./dist/index.js",
    });
    expect((manifest.exports as Record<string, unknown>)["./element"]).toEqual({
      types: "./dist/element.d.ts",
      default: "./dist/element.js",
    });
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

  it("builds one ESM bundle with types per entry for every Aspekto, no second CJS version (Nachlese 6 N6-3)", () => {
    for (const aspekto of ASPEKTOJ) {
      expect(existsSync(join(built[aspekto] ?? "", "dist/index.cjs"))).toBe(false);
      expect(existsSync(join(built[aspekto] ?? "", "dist/element.cjs"))).toBe(false);
      for (const file of [
        "dist/index.js",
        "dist/index.d.ts",
        "dist/element.js",
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

// The version of a kit is set from outside (release.yml, F25): a pre-release of the Modelo's
// version (0.1.0-next.1), or — for the release itself (Spec 015 "Nach der Abnahme", Nachlese 5 ③)
// — exactly the Modelo's version (0.1.0). Anything else is refused: it would publish under a
// number the Modelo does not have.
describe("the kit version comes from FUNDAMENTO_KIT_VERSION (release step, Nachlese 5 ③)", () => {
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
  const escaped = modelo.replaceAll(".", "\\.");

  it("defaults to <modelo>-next.0", () => {
    expect(versionOf(MAKE_KIT_CELO.generate(withEnv(undefined)))).toBe(`${modelo}-next.0`);
  });

  it("takes the requested pre-release of the Modelo's version", () => {
    expect(versionOf(MAKE_KIT_CELO.generate(withEnv(`${modelo}-next.1`)))).toBe(`${modelo}-next.1`);
    expect(versionOf(MAKE_KIT_CELO.generate(withEnv(`${modelo}-next.5`)))).toBe(`${modelo}-next.5`);
  });

  it("takes exactly the Modelo's version: the release itself (0.1.0)", () => {
    expect(modelo).toBe("0.1.0");
    const generated = MAKE_KIT_CELO.generate(withEnv(modelo));
    for (const aspekto of ASPEKTOJ) {
      const pkg = JSON.parse(
        generated.find((f) => f.path.endsWith(`${aspekto}/package.json`))?.text ?? "{}",
      ) as { version: string };
      expect(pkg.version, aspekto).toBe(modelo);
    }
  });

  it("refuses every other number — 0.2.0, 0.1.0.1, 0.2.0-next.0 — and names both allowed forms", () => {
    for (const bad of ["0.2.0", "0.1.0.1", "0.2.0-next.0", "0.1.0-", "v0.1.0", "0.1.0 "]) {
      const attempt = () => MAKE_KIT_CELO.generate(withEnv(bad));
      expect(attempt, bad).toThrow(
        new RegExp(`FUNDAMENTO_KIT_VERSION=${bad.replaceAll(".", "\\.")}`),
      );
      // The error names both forms the build accepts: the Modelo's version and a pre-release of it.
      expect(attempt, bad).toThrow(new RegExp(`${escaped}-<Vorabkennung>`));
      expect(attempt, bad).toThrow(new RegExp(`(^|[^-.\\d])${escaped}([^-.\\d]|$)`));
    }
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

// Spec 010 ② (G7, plan ② D-12): Make builds every yes/no that applies with the form from the
// checkbox and sends what applies at once to the switch — one sentence in the guidelines,
// generated from every Ero with role checkbox; the page of the checkbox names its props.
describe("Make Kit and the markobutono (Spec 010 ②)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines say that every yes/no of a form is a <Markobutono>",
    (aspekto) => {
      expect(kit(aspekto, "guidelines/Guidelines.md")).toContain(
        "- Every yes/no that applies with the form is a `<Markobutono>`; a setting that applies at once is a `<Sxaltilo>`.",
      );
      const page = kit(aspekto, "guidelines/components/markobutono.md");
      expect(page).toContain("# Markobutono");
      expect(page).toContain("`checked`");
      expect(page).toContain("`required`");
      expect(page).not.toContain("set `label` as its accessible name");
    },
  );
});

// Spec 010 ③ (G7, plan ③ D-11): Make builds a choice of one among a few visible options from the
// radio group — one sentence in the guidelines, generated from every Ero with role radiogroup; the
// list for six or more is named only once the Modelo has it (elektilo, PR ④: now it does, plan ④
// D-11). The page of the radio group says how an option is written (an element in the slot options
// with its value) and shows the options of its examples.
describe("Make Kit and the elekto (Spec 010 ③)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines say that a choice of one among a few visible options is an <Elekto>",
    (aspekto) => {
      expect(kit(aspekto, "guidelines/Guidelines.md")).toContain(
        "- A choice of one among a few visible options is an `<Elekto>`; six or more go into an `<Elektilo>` list.",
      );
      const page = kit(aspekto, "guidelines/components/elekto.md");
      expect(page).toContain("# Elekto");
      expect(page).toContain("`value`");
      expect(page).toContain("`orientation`");
      expect(page).toContain(
        'Each option is an element in the slot `options` with its value: `<data slot="options" value="express">Express</data>`; the option whose value is `value` is chosen.',
      );
      expect(page).toContain('<data slot="options" value="1">Standard</data>');
      expect(page).toContain("**option-labels-distinct**");
      expect(page).toContain(
        "**elekto-options-few** (adjustable: a brand may override it with a Jugxo; reports a warning)",
      );
      expect(page).not.toContain("set `label` as its accessible name");
    },
  );
});

// Spec 010 ④ (G7, plan ④ D-11): Make builds a choice of one among many options from the select —
// one sentence in the guidelines, generated from every Ero with role combobox, the radio group
// named for up to five visible options; the kit no longer tells Make to ask a person for a list.
// The page of the select says how an option is written and shows the prompt of its examples.
describe("Make Kit and the elektilo (Spec 010 ④)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines say that a choice of one among many options is an <Elektilo> list",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- A choice of one among many options is an `<Elektilo>` list; up to five visible options are an `<Elekto>`.",
      );
      expect(guidelines).not.toContain("which this kit does not have yet");
      const page = kit(aspekto, "guidelines/components/elektilo.md");
      expect(page).toContain("# Elektilo");
      expect(page).toContain("`placeholder`");
      expect(page).toContain(
        'Each option is an element in the slot `options` with its value: `<data slot="options" value="express">Express</data>`; the option whose value is `value` is chosen.',
      );
      expect(page).toContain(' placeholder="Bitte wählen"');
      expect(page).toContain('<data slot="options" value="1">Deutschland</data>');
      expect(page).toContain("**select-placeholder-is-prompt** (adjustable");
      expect(page).toContain("**option-labels-distinct**");
      expect(page).not.toContain("set `label` as its accessible name");
    },
  );
});

// Spec 011 ① (G8, plan ① D-02): the Arkitekturo contract. The --fm-* variables the first consumer
// of the kit reads are recorded as observed usage, with source and date; every one of them must be
// declared in the styles.css of every kit. A renamed or removed variable turns this red, and is
// then allowed only with a Jugxo that names the replacement and the consumer.
describe("the observed usage of the Make Kit by Arkitekturo (Spec 011 ① G8)", () => {
  const observed = JSON.parse(
    readFileSync(new URL("./observed-usage/arkitekturo.json", import.meta.url), "utf8"),
  ) as { consumer: string; kit: string; source: string; date: string; variables: string[] };

  it("names the consumer, the kit, the source and the date of the observation", () => {
    expect(observed.consumer).toBe("arkitekturo");
    expect(observed.kit).toMatch(/^@fundamento\/make-kit-komuna@/);
    expect(observed.source).toContain("arkitekturo-kandidaten.md");
    expect(observed.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(observed.variables.length).toBeGreaterThan(50);
    expect(observed.variables).toEqual([...new Set(observed.variables)].sort());
    for (const name of observed.variables) expect(name).toMatch(/^--fm-[a-z0-9-]+$/);
  });

  it.each(ASPEKTOJ)("%s: every observed variable is declared in styles.css", (aspekto) => {
    const styles = kit(aspekto, "styles.css");
    const declared = new Set(
      [...styles.matchAll(/(--fm-[a-z0-9-]+)\s*:/g)].map((match) => match[1] ?? ""),
    );
    const missing = observed.variables.filter((name) => !declared.has(name));
    expect(missing, "renamed or removed without a Jugxo naming replacement and consumer").toEqual(
      [],
    );
  });
});

// Spec 011 ② (G7, plan ② D-14): Make builds every text of several lines from the text area and
// every confirmation before an irreversible action from the dialog — one sentence each in the
// guidelines, generated from the Eroj (a textbox with rows, an Ero with role dialog); the pages
// of both exist and name their props and slots.
describe("Make Kit and the tekstareo and dialogo (Spec 011 ②)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines send several lines to the Tekstareo and a question to the Dialogo",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every text that runs over several lines (a comment, a description, a reason) is a `<Tekstareo>`; one line is a `<Kampo>`.",
      );
      expect(guidelines).toContain(
        "- Every confirmation before an action that cannot be undone is a `<Dialogo>` whose heading names the decision; never a second button that asks.",
      );
      // The kampo's sentence names the field, not the area: one sentence per Ero.
      expect(guidelines).toContain("- Every entry of text is a `<Kampo>`");
      expect(guidelines).not.toContain("- Every entry of text is a `<Tekstareo>`");
      const area = kit(aspekto, "guidelines/components/tekstareo.md");
      expect(area).toContain("# Tekstareo");
      expect(area).toContain("`rows`");
      expect(area).toContain("`kind`");
      expect(area).toContain("**rich-text**");
      const dialog = kit(aspekto, "guidelines/components/dialogo.md");
      expect(dialog).toContain("# Dialogo");
      expect(dialog).toContain("`reason`");
      expect(dialog).toContain("`actions`");
      expect(dialog).toContain("**dialog-title-names-the-decision**");
      expect(dialog).toContain("Version freigeben?");
    },
  );
});

// Spec 011 ③ (G7, plan ③ D-12): one sentence per Ero in the Guidelines — a status word is the
// Insigno, a message in the flow of the page the Avizo, a loading or empty area the Plenstato —
// and a component page each, generated from Skemo, Uzo and Jugxoj like every other.
describe("Make Kit and the insigno, avizo and plenstato (Spec 011 ③)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines send a status word to the Insigno, a message to the Avizo, a loading area to the Plenstato",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every status in one to three words next to what it describes (draft, in review, 3 violations) is an `<Insigno>`; a sentence is an `<Avizo>`.",
      );
      expect(guidelines).toContain(
        "- Every message in the flow of the page about what happened or what to watch for (saved, could not save) is an `<Avizo>`; never a toast, and what needs a decision is a `<Dialogo>`.",
      );
      expect(guidelines).toContain(
        "- Every area whose content loads or is empty shows a `<Plenstato>` with a text; never a bare spinner, and a working button is the `<Butono>`'s own loading.",
      );
      const badge = kit(aspekto, "guidelines/components/insigno.md");
      expect(badge).toContain("# Insigno");
      expect(badge).toContain("`intent`");
      expect(badge).toContain("**badge-text-short**");
      expect(badge).toContain("In Prüfung");
      expect(badge).toContain("**dot-only**");
      const notice = kit(aspekto, "guidelines/components/avizo.md");
      expect(notice).toContain("# Avizo");
      expect(notice).toContain("`dismissible`");
      expect(notice).toContain("**toast**");
      expect(notice).toContain("**error-says-what-to-do**");
      const state = kit(aspekto, "guidelines/components/plenstato.md");
      expect(state).toContain("# Plenstato");
      expect(state).toContain("`kind`");
      expect(state).toContain("**empty-state-says-what-next**");
      expect(state).toContain("Noch keine Standards. Lege den ersten an.");
      expect(state).toContain("**skeleton**");
    },
  );
});

// Spec 011 ④ (G7, plan ④ D-12): one sentence per Ero in the Guidelines — many records are the
// Tabelo, one record the Atributlisto, a value in a range the Mezurilo — and a component page each.
describe("Make Kit and the tabelo, atributlisto and mezurilo (Spec 011 ④)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines send many records to the Tabelo, one record to the Atributlisto, a value in a range to the Mezurilo",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every list of records with the same fields is a `<Tabelo>` around the platform's own table with a caption; one record is an `<Atributlisto>`.",
      );
      expect(guidelines).toContain(
        "- Every record shown as names and values is an `<Atributlisto>` around the platform's own description list; never a table for one record, and editing is a form of `<Kampo>`.",
      );
      expect(guidelines).toContain(
        "- Every known value within a known range is a `<Mezurilo>` with its number as text; an unknown value is never 0, and a status in a word is an `<Insigno>`.",
      );
      const table = kit(aspekto, "guidelines/components/tabelo.md");
      expect(table).toContain("# Tabelo");
      expect(table).toContain("`density`");
      expect(table).toContain("**table-caption-names-the-content**");
      expect(table).toContain("**sticky-header**");
      const list = kit(aspekto, "guidelines/components/atributlisto.md");
      expect(list).toContain("# Atributlisto");
      expect(list).toContain("`layout`");
      expect(list).toContain("**nested**");
      const meter = kit(aspekto, "guidelines/components/mezurilo.md");
      expect(meter).toContain("# Mezurilo");
      expect(meter).toContain("`intent`");
      expect(meter).toContain("**meter-text-states-value**");
      expect(meter).toContain("66 % von 3 prüfbaren");
    },
  );
});

// Spec 011 ⑤ (G7, plan ⑤ D-10): one sentence per Ero in the Guidelines — the navigation between
// the main pages is the Navigado around the platform's own links, a switch of views the Langetaro
// — and a component page each.
describe("Make Kit and the navigado and langetaro (Spec 011 ⑤)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines send the navigation to the Navigado, a switch of views to the Langetaro",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every navigation between the main pages of an application is a `<Navigado>` around the platform's own links, named and with the current page marked; a single link is a `<Ligilo>`.",
      );
      expect(guidelines).toContain(
        "- Every switch between views of the same thing on one page is a `<Langetaro>` with distinct tab labels; a choice in a form is an `<Elekto>`, and the pages of an application are a `<Navigado>`.",
      );
      const navigation = kit(aspekto, "guidelines/components/navigado.md");
      expect(navigation).toContain("# Navigado");
      expect(navigation).toContain("`orientation`");
      expect(navigation).toContain("**link-label-names-destination**");
      expect(navigation).toContain("**breadcrumb**");
      const tabs = kit(aspekto, "guidelines/components/langetaro.md");
      expect(tabs).toContain("# Langetaro");
      expect(tabs).toContain("`selected`");
      expect(tabs).toContain("**option-labels-distinct**");
      expect(tabs).toContain("**closable-tabs**");
    },
  );
});

// Spec 014 ② (G10, plan ② D-10): Make builds every icon from the ikono with a name of the Ikonaro
// and never pastes an SVG, every dividing line from the apartigilo, and the first focusable
// element of a page from the saltligilo — three sentences in the guidelines, generated from the
// roles img, separator and the link that floats (the skip link).
describe("Make Kit and the Grundbausteine (Spec 014 ②)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines name the ikono, the apartigilo and the saltligilo",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every icon is an `<Ikono>` with a name from the Ikonaro, decorative unless it carries meaning (then with a `label`); never paste an SVG.",
      );
      expect(guidelines).toContain(
        "- Every line that separates groups of content is an `<Apartigilo>`; where space alone separates, use spacing and no line.",
      );
      expect(guidelines).toContain(
        "- The first focusable element of a page is a `<Saltligilo>` to the main content; a reference inside the text is a `<Ligilo>`.",
      );
      for (const ero of ["ikono", "apartigilo", "saltligilo"]) {
        const page = kit(aspekto, `guidelines/components/${ero}.md`);
        expect(page, ero).toContain(`# ${ero.charAt(0).toUpperCase()}${ero.slice(1)}`);
      }
      expect(kit(aspekto, "guidelines/components/ikono.md")).toContain("`name`");
      expect(kit(aspekto, "guidelines/components/saltligilo.md")).toContain("`to`");
    },
  );
});

// Spec 014 ③ (plan ③ D-07): Make builds every heading from the titolo with its level and every
// running text from the teksto — two sentences, generated from the roles heading and paragraph.
describe("Make Kit and the Typografie (Spec 014 ③)", () => {
  it.each(ASPEKTOJ)("%s: the guidelines name the titolo and the teksto", (aspekto) => {
    const guidelines = kit(aspekto, "guidelines/Guidelines.md");
    expect(guidelines).toContain(
      "- Every heading is a `<Titolo>` with its `level` (the structure of the page); its `size` is design, never a level chosen for its size.",
    );
    expect(guidelines).toContain(
      "- Every running text, caption, kicker or inline code is a `<Teksto>` in a type role; never a styled span.",
    );
    expect(kit(aspekto, "guidelines/components/titolo.md")).toContain("`level`");
    expect(kit(aspekto, "guidelines/components/teksto.md")).toContain("`emphasis`");
  });
});

// Spec 014 ④ (plan ④ D-08): Make builds every hover hint from the konsileto bound to its control,
// every non-modal layer from the sxvebilo and every set of actions on one object from the menuo —
// three sentences in the guidelines, generated from the roles tooltip, dialog with a trigger and
// menu.
describe("Make Kit and the Overlays (Spec 014 ④)", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines name the konsileto, the sxvebilo and the menuo",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every name or short hint of a control shown on hover or focus is a `<Konsileto>` bound to it with `htmlFor`; what a person needs to act stands visibly as text.",
      );
      expect(guidelines).toContain(
        "- Every non-modal layer with content beside its trigger is a `<Sxvebilo>`; a layer that asks for a decision is a `<Dialogo>`.",
      );
      expect(guidelines).toContain(
        "- Every set of actions on one object behind a single button is a `<Menuo>` whose entries name their actions; never a button per action in a row.",
      );
      expect(kit(aspekto, "guidelines/components/konsileto.md")).toContain("`htmlFor`");
      expect(kit(aspekto, "guidelines/components/menuo.md")).toContain("`placement`");
    },
  );
});

// Spec 014 ⑤ (plan ⑤ D-06): Make hides secondary content behind the faldilo and builds every
// field with suggestions from the kompletigilo — two sentences, from the roles group with a
// summary slot and combobox with a listbox part.
describe("Make Kit and the Aufklappen (Spec 014 ⑤)", () => {
  it.each(ASPEKTOJ)("%s: the guidelines name the faldilo and the kompletigilo", (aspekto) => {
    const guidelines = kit(aspekto, "guidelines/Guidelines.md");
    expect(guidelines).toContain(
      "- Every secondary content a person opens on demand is a `<Faldilo>` whose summary names what it hides; several with one `group` open one at a time.",
    );
    expect(guidelines).toContain(
      "- Every field whose values a person types and picks from suggestions is a `<Kompletigilo>`; a fixed short list is an `<Elektilo>`.",
    );
    expect(kit(aspekto, "guidelines/components/faldilo.md")).toContain("`group`");
    expect(kit(aspekto, "guidelines/components/kompletigilo.md")).toContain("`allow-free`");
  });
});

// Spec 015 ① (plan ① D-07): Make pages every long list with the pagxigilo and shows the path of a
// page with the spuro — two sentences, from the role navigation with the parts ellipsis and
// separator.
describe("Make Kit and the Navigation of Spec 015 ①", () => {
  it.each(ASPEKTOJ)("%s: the guidelines name the pagxigilo and the spuro", (aspekto) => {
    const guidelines = kit(aspekto, "guidelines/Guidelines.md");
    expect(guidelines).toContain(
      "- Every long list in pages gets a `<Pagxigilo>` under it, the current page marked and an arrow back and forth; more on demand is a `<Butono>`, views of one thing are a `<Langetaro>`.",
    );
    expect(guidelines).toContain(
      "- Every page inside a hierarchy shows its path in a `<Spuro>` at its head, each level a link and the current page text; the places beside a page are the `<Navigado>`.",
    );
    expect(kit(aspekto, "guidelines/components/pagxigilo.md")).toContain("`total-pages`");
    expect(kit(aspekto, "guidelines/components/spuro.md")).toContain("`page`");
  });
});

// Spec 015 ② (plan ② D-08): Make takes every file a form asks for from the alsxutilo, its help
// naming kinds and size — one sentence, from the role button with the part dropzone; the butono
// stays the button of every other sentence.
describe("Make Kit and the Eingabe of Spec 015 ②", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines name the alsxutilo; the butono stays the button",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every file a form asks for is an `<Alsxutilo>` whose help names the kinds and the size it takes (`accept`, `max-size`); a text a person types is a `<Kampo>`, and sending the files is the application's.",
      );
      expect(guidelines).toContain("more on demand is a `<Butono>`");
      expect(guidelines).not.toContain("more on demand is a `<Alsxutilo>`");
      const component = kit(aspekto, "guidelines/components/alsxutilo.md");
      expect(component).toContain("# Alsxutilo");
      expect(component).toContain("`max-size`");
      expect(component).toContain("**file-constraints-stated**");
    },
  );
});

// Spec 015 ③ (plan ③ D-06): Make takes every summary of one thing from the karto, at the level of
// its heading — one sentence from the role article, the record list and the notice named beside.
describe("Make Kit and the Inhalt of Spec 015 ③", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines name the karto beside the atributlisto and the avizo",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every summary of one thing — a heading, an image, a sentence and at most two actions — is a `<Karto>` with the `level` of its heading; the fields of one record are an `<Atributlisto>`, what happened is an `<Avizo>`, and a whole card is never one link.",
      );
      const component = kit(aspekto, "guidelines/components/karto.md");
      expect(component).toContain("# Karto");
      expect(component).toContain("`standalone`");
      expect(component).toContain("card-grid");
    },
  );
});

// Spec 015 ③ (plan ③ D-10): Make takes every person or thing as a picture or initials from the
// avataro with its name — one sentence from the image with an initials part; the ikono keeps the
// icon sentence alone.
describe("Make Kit and the avataro of Spec 015 ③", () => {
  it.each(ASPEKTOJ)(
    "%s: the guidelines name the avataro beside the insigno; the icon sentence stays the ikono's",
    (aspekto) => {
      const guidelines = kit(aspekto, "guidelines/Guidelines.md");
      expect(guidelines).toContain(
        "- Every person or thing shown as a picture or as initials is an `<Avataro>` with its `name` (`decorative` where the name stands beside it); a status is an `<Insigno>`, never a dot or a colour worked out from the name.",
      );
      expect(guidelines).toContain("- Every icon is an `<Ikono>`");
      expect(guidelines).not.toContain("- Every icon is an `<Avataro>`");
      const component = kit(aspekto, "guidelines/components/avataro.md");
      expect(component).toContain("# Avataro");
      expect(component).toContain("`picture`");
      expect(component).toContain("presence-dot");
    },
  );
});
