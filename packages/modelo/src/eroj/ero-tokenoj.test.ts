// The Ero-Tokens (Constitution v2.3, Spec 024 Runde 2, § 3 A): the third level of the Vortaro,
// derived mechanically from the Skemoj — one token per Ero, part, variant and state, by default an
// alias on the role token the Skemo binds. The core defines every one of them (ero-tokeno-missing)
// and none the Skemoj do not derive (ero-tokeno-unknown); `pnpm vortaro:ero-tokenoj` writes them,
// with IDs from the lock, into the core and into the main set of every Aspekto package.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { CORE_SET_NAME, isTokenName } from "../contracts/grammar.js";
import { RULE_IDS } from "../contracts/issues.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource, projectModeloSource } from "../load/source.js";
import { resolveCombination } from "../resolve/resolve.js";
import { validateModelo } from "../validate/validate-modelo.js";
import {
  ERO_TOKEN_PREFIX,
  eroTokenOf,
  eroTokenojIssues,
  eroTokenojOf,
  eroTokenojOfModelo,
  isEroTokenName,
  SXABLONO_TOKEN_PREFIX,
  sxablonoTokenOf,
  sxablonoTokenojOf,
} from "./ero-tokenoj.js";
import { runEroTokenojCli } from "./ero-tokenoj-cli.js";

const fixtures = fileURLToPath(new URL("../../test/fixtures/", import.meta.url));
const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("The repository Modelo does not load.");
const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
const ligilo = modelo.eroj.find((entry) => entry.ero.name === "ligilo");
const sxaltilo = modelo.eroj.find((entry) => entry.ero.name === "sxaltilo");
const teksto = modelo.eroj.find((entry) => entry.ero.name === "teksto");
const pagxo = (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === "pagxo");
if (!butono || !ligilo || !sxaltilo || !teksto || !pagxo || !core) throw new Error("fixtures");

const scratch: string[] = [];
afterAll(() => {
  for (const dir of scratch.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the derivation of the Ero-Tokens from a Skemo (Art. II: mechanical)", () => {
  const tokens = eroTokenojOf(butono);
  const byName = new Map(tokens.map((token) => [token.name, token]));

  it("names a token per Ero, part, property, axis value and state, every segment of the grammar", () => {
    const fill = byName.get("ero.butono.surface.fill.emphasis.high.intent.neutral.hover");
    expect(fill).toMatchObject({
      type: "color",
      alias: "color.action.primary.hover",
      kind: ERO_TOKEN_PREFIX,
      owner: "butono",
      part: "surface",
      property: "fill",
      when: { emphasis: "high", intent: "neutral", state: "hover" },
    });
    for (const token of tokens) expect(isTokenName(token.name), token.name).toBe(true);
    expect(new Set(tokens.map((token) => token.name)).size).toBe(tokens.length);
  });

  it("gives a state without a binding of its own the token of rest as its alias, so every cell of the matrix has a token", () => {
    expect(byName.get("ero.butono.label.color.emphasis.high.intent.neutral.hover")?.alias).toBe(
      "color.action.primary.text",
    );
    expect(byName.get("ero.butono.label.color.emphasis.high.intent.neutral.focus")?.alias).toBe(
      "color.action.primary.text",
    );
  });

  it("derives a fixed property as one token, a hyphen of the Skemo as a segment, and a typography as a typography token", () => {
    expect(byName.get("ero.butono.border.width")).toMatchObject({
      type: "dimension",
      alias: "border.width.default",
      when: {},
    });
    expect(byName.get("ero.butono.focus.ring.color")?.alias).toBe("color.focus.inner");
    expect(byName.get("ero.butono.box.inline.padding.size.small")?.alias).toBe("spacing.small");
    expect(byName.get("ero.butono.label.typography.size.large")).toMatchObject({
      type: "typography",
      alias: "typography.label.1",
    });
  });

  it("leaves out what is no value of a brand: a sameAs, a keyword binding, a position", () => {
    expect([...byName.keys()].some((name) => name.startsWith("ero.butono.icon.color"))).toBe(false);
    expect(
      eroTokenOf(butono, "icon", "color", { emphasis: "high", intent: "neutral", state: "rest" }),
    ).toBe("ero.butono.label.color.emphasis.high.intent.neutral.rest");
    const inline = eroTokenojOf(ligilo).filter(
      (token) => token.alias === "inherit" || token.alias === "none",
    );
    expect(inline).toEqual([]);
    const position = eroTokenojOf(sxaltilo).filter((token) => token.property === "position");
    expect(position).toEqual([]);
    expect(
      eroTokenOf(sxaltilo, "knob", "position", { checked: "true", state: "rest" }),
    ).toBeUndefined();
  });

  it("forbids a combination the constraints forbid (a danger button of medium emphasis)", () => {
    expect(byName.has("ero.butono.surface.fill.emphasis.medium.intent.danger.rest")).toBe(false);
    expect(byName.has("ero.butono.surface.fill.emphasis.high.intent.danger.rest")).toBe(true);
  });

  it("derives one token per fixed part property of a Sxablono under its own prefix", () => {
    const tokens = sxablonoTokenojOf(pagxo);
    expect(tokens.map((token) => token.name)).toContain("sxablono.pagxo.frame.gap");
    expect(tokens.find((token) => token.name === "sxablono.pagxo.frame.gap")?.alias).toBe(
      "spacing.xlarge",
    );
    expect(tokens.every((token) => token.kind === SXABLONO_TOKEN_PREFIX)).toBe(true);
    expect(sxablonoTokenOf(pagxo, "container", "width")).toBe("sxablono.pagxo.container.width");
    expect(isEroTokenName("sxablono.pagxo.frame.gap")).toBe(true);
    expect(isEroTokenName("color.action.primary.rest")).toBe(false);
  });

  it("counts the tokens of the repository: every Ero and every Sxablono, the cells bound to a keyword stay out (32 after Spec 025)", () => {
    const all = eroTokenojOfModelo(modelo);
    expect(all.filter((token) => token.kind === ERO_TOKEN_PREFIX).length).toBeGreaterThan(800);
    expect(all.filter((token) => token.kind === SXABLONO_TOKEN_PREFIX).length).toBe(34);
    expect(new Set(all.map((token) => token.owner)).size).toBe(
      modelo.eroj.length + (modelo.sxablonoj ?? []).length,
    );
    process.stderr.write(
      `Ero-Tokens: ${all.length} (${all.filter((token) => token.kind === ERO_TOKEN_PREFIX).length} of the Eroj, ${all.filter((token) => token.kind === SXABLONO_TOKEN_PREFIX).length} of the Sxablonoj)\n`,
    );
  });
});

describe("the core carries the third level (migration as alias, Art. IV)", () => {
  it("defines every derived Ero-Token with its type, an ID in the lock and the alias the Skemo binds", () => {
    const missing: string[] = [];
    for (const token of eroTokenojOfModelo(modelo)) {
      const defined = core.tokens[token.name];
      if (defined === undefined) {
        missing.push(`${token.name} missing`);
        continue;
      }
      if (defined.type !== token.type) missing.push(`${token.name} type ${defined.type}`);
      if (defined.value !== `{${token.alias}}`)
        missing.push(`${token.name} value ${JSON.stringify(defined.value)}`);
      if (!/^tok_[0-9A-Z]{26}$/.test(defined.id ?? "")) missing.push(`${token.name} id`);
      else if (modelo.idsLock.ids[defined.id ?? ""]?.status !== "active")
        missing.push(`${token.name} lock`);
    }
    expect(missing).toEqual([]);
  });

  it("every Aspekto of the fixtures assigns every Ero-Token (an alias counts)", () => {
    const provoj = loadModelo(
      projectModeloSource(
        join(fixtures, "valid/aspekto-provo-kompakta/fundamento.provoj.config.json"),
      ),
    ).modelo;
    const ekzemplo = loadModelo(
      projectModeloSource(join(fixtures, "valid/aspekto-ekzemplo/fundamento.config.json")),
    ).modelo;
    const names = eroTokenojOfModelo(modelo).map((token) => token.name);
    for (const [loaded, aspekto] of [
      [provoj, "provo"],
      [provoj, "provo-kompakta"],
      [ekzemplo, "ekzemplo"],
    ] as const) {
      const set = loaded?.setoj.find((candidate) => candidate.name === `aspekto/${aspekto}`);
      expect(
        names.filter((name) => set?.tokens[name] === undefined),
        aspekto,
      ).toEqual([]);
    }
  });

  it("resolves an Ero-Token to the value of its alias in every brand and scheme, and a typography alias carries the case of its role", () => {
    const provoj = loadModelo(
      projectModeloSource(
        join(fixtures, "valid/aspekto-provo-kompakta/fundamento.provoj.config.json"),
      ),
    ).modelo;
    if (provoj === undefined) throw new Error("provoj");
    const differences: string[] = [];
    for (const aspekto of ["komuna", "provo", "provo-kompakta"]) {
      for (const scheme of ["light", "dark"]) {
        const { tokens } = resolveCombination(provoj, { aspekto, "color-scheme": scheme });
        for (const token of eroTokenojOfModelo(provoj)) {
          const own = tokens[token.name];
          const target = tokens[token.alias];
          if (JSON.stringify(own?.value) !== JSON.stringify(target?.value))
            differences.push(`${aspekto} ${scheme} ${token.name}`);
          if (own?.textTransform?.value !== target?.textTransform?.value)
            differences.push(`${aspekto} ${scheme} ${token.name} case`);
        }
      }
    }
    expect(differences).toEqual([]);
    const kicker = resolveCombination(modelo, {}).tokens[
      "ero.teksto.text.typography.kind.kicker.size.1"
    ];
    expect(kicker?.textTransform?.value).toBe("uppercase");
  });
});

describe("ero-tokeno-missing and ero-tokeno-unknown", () => {
  it("are rules of the catalogue", () => {
    expect(RULE_IDS).toContain("ero-tokeno-missing");
    expect(RULE_IDS).toContain("ero-tokeno-unknown");
  });

  it("the repository has no drift", () => {
    expect(eroTokenojIssues(modelo)).toEqual([]);
  });

  it("reports a derived token the core lacks, at the pointer where it would sit", () => {
    const report = validateModelo(
      fixtureModeloSource(join(fixtures, "invalid/ero-tokeno-missing")),
    );
    const issues = report.errors.filter((issue) => issue.rule === "ero-tokeno-missing");
    expect(issues.map((issue) => issue.path)).toContain(
      "vortaro/sets/core.json#/ero/butono/surface/fill/emphasis/high/rest",
    );
    expect(issues[0]?.suggestion).toContain("pnpm vortaro:ero-tokenoj");
    expect(report.valid).toBe(false);
  });

  it("reports a token of the third level no Skemo derives", () => {
    const report = validateModelo(
      fixtureModeloSource(join(fixtures, "invalid/ero-tokeno-unknown")),
    );
    const issue = report.errors.find((candidate) => candidate.rule === "ero-tokeno-unknown");
    expect(issue?.path).toBe("vortaro/sets/core.json#/ero/butono/surface/fill/emphasis/low/rest");
    expect(issue?.suggestion).toContain("pnpm vortaro:ero-tokenoj");
  });
});

describe("pnpm vortaro:ero-tokenoj", () => {
  const env = (cwd: string) => {
    const out: string[] = [];
    const err: string[] = [];
    return {
      env: {
        cwd,
        defaultSource: defaultModeloSource,
        stdout: (text: string) => out.push(text),
        stderr: (text: string) => err.push(text),
      },
      out,
      err,
    };
  };

  it("writes the missing tokens into the core with IDs from the lock, removes a stale one, and --check sees no drift afterwards", () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-ero-tokenoj-"));
    scratch.push(dir);
    cpSync(join(fixtures, "invalid/ero-tokeno-unknown"), dir, { recursive: true });
    const before = env(dir);
    expect(runEroTokenojCli(["--root", ".", "--check"], before.env)).toBe(1);
    expect(before.err.join("")).toContain("core.json");
    const run = env(dir);
    expect(runEroTokenojCli(["--root", "."], run.env)).toBe(0);
    const coreText = readFileSync(join(dir, "vortaro/sets/core.json"), "utf8");
    const written = JSON.parse(coreText) as {
      ero: { butono: { surface: { fill: { emphasis: Record<string, Record<string, unknown>> } } } };
    };
    expect(written.ero.butono.surface.fill.emphasis.high?.rest).toMatchObject({
      $type: "color",
      $value: "{color.background.default}",
    });
    expect(written.ero.butono.surface.fill.emphasis.low).toBeUndefined();
    const lock = JSON.parse(readFileSync(join(dir, "data/ids.lock.json"), "utf8")) as {
      ids: Record<string, { type: string }>;
    };
    const rest = written.ero.butono.surface.fill.emphasis.high?.rest as
      | { $extensions: { "com.ciferecigo.fundamento": { id: string } } }
      | undefined;
    const id = rest?.$extensions["com.ciferecigo.fundamento"].id ?? "";
    expect(lock.ids[id]?.type).toBe("token");
    // The hand-written part of the core is untouched: the first lines are the same bytes.
    expect(
      coreText.startsWith(
        readFileSync(
          join(fixtures, "invalid/ero-tokeno-unknown/vortaro/sets/core.json"),
          "utf8",
        ).slice(0, 200),
      ),
    ).toBe(true);
    const after = env(dir);
    expect(runEroTokenojCli(["--root", ".", "--check"], after.env)).toBe(0);
    expect(validateModelo(fixtureModeloSource(dir)).valid).toBe(true);
  });

  it("with --config writes every Ero-Token as an alias into the main set of each package and leaves the core alone", () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-ero-tokenoj-pkg-"));
    scratch.push(dir);
    cpSync(join(fixtures, "valid/aspekto-ekzemplo"), dir, { recursive: true });
    const setPath = join(dir, "aspekto-ekzemplo/sets/aspekto/ekzemplo.json");
    const stripped = JSON.parse(readFileSync(setPath, "utf8")) as Record<string, unknown>;
    delete stripped.ero;
    delete stripped.sxablono;
    writeFileSync(setPath, `${JSON.stringify(stripped, null, 2)}\n`);
    const run = env(dir);
    expect(runEroTokenojCli(["--config", "fundamento.config.json"], run.env)).toBe(0);
    const set = JSON.parse(readFileSync(setPath, "utf8")) as {
      ero: {
        butono: {
          surface: {
            fill: { emphasis: { high: { intent: { neutral: Record<string, unknown> } } } };
          };
        };
      };
    };
    expect(set.ero.butono.surface.fill.emphasis.high.intent.neutral.rest).toEqual({
      $type: "color",
      $value: "{color.action.primary.rest}",
    });
    expect(validateModelo(projectModeloSource(join(dir, "fundamento.config.json"))).valid).toBe(
      true,
    );
  });

  it("explains itself and refuses unknown arguments", () => {
    const help = env(process.cwd());
    expect(runEroTokenojCli(["--help"], help.env)).toBe(0);
    expect(help.out.join("")).toContain("--check");
    const bad = env(process.cwd());
    expect(runEroTokenojCli(["--nope"], bad.env)).toBe(2);
  });
});
