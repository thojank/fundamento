import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Modelo } from "../../contracts/modelo.js";
import { loadModelo } from "../../load/load-modelo.js";
import { fixtureModeloSource } from "../../load/source.js";
import { evaluateAlirebleco } from "./evaluate.js";
import { check } from "./index.js";
import { WCAG2_METRIC } from "./metrics.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const builtRunner = fileURLToPath(new URL("../../../dist/checks/run.js", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));

interface ExpectedIssue {
  rule: string;
  path: string;
}
interface ExpectedIssues {
  issues: ExpectedIssue[];
  warnings?: ExpectedIssue[];
}

const expectedIssues = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(`${fixture(path)}expected-issues.json`, "utf8")) as ExpectedIssues;

const pairs = (issues: readonly ExpectedIssue[]): ExpectedIssue[] =>
  issues.map(({ rule, path }) => ({ rule, path }));

function minimalModelo(): Modelo {
  const { modelo, issues } = loadModelo(fixtureModeloSource(fixture("valid/minimal")));
  expect(issues).toEqual([]);
  if (modelo === undefined) {
    throw new Error("valid/minimal did not load");
  }
  return modelo;
}

const DATA = "data/kontrastparoj.json";

describe("alirebleco on the repo", () => {
  it("passes every KontrastParo in all 72 combinations", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.check).toBe("alirebleco");
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    const pairs = (
      JSON.parse(
        readFileSync(new URL("../../../data/kontrastparoj.json", import.meta.url), "utf8"),
      ) as { kontrastParoj: unknown[] }
    ).kontrastParoj.length;
    expect(result.stats.pairs).toBe(pairs);
    expect(result.stats.combinations).toBe(72);
    expect(result.stats.evaluations).toBe(pairs * 72);
    // The lowest ratio belongs to a ui pair (threshold 3:1); text pairs need 4.5:1 or 7:1.
    expect(result.stats.minRatio).toBeGreaterThanOrEqual(3);
    expect(result.summary).toMatch(new RegExp(String(pairs * 72)));
    for (const warning of result.warnings) {
      expect(warning.rule).toBe("contrast-advisory");
      expect(warning.severity).toBe("warning");
    }
  });
});

describe("alirebleco on valid/minimal", () => {
  it("passes with stats per pair and combination", async () => {
    const result = await check({ json: true, repoRoot, fixture: fixture("valid/minimal") });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats).toMatchObject({ pairs: 1, combinations: 4, evaluations: 4 });
    expect(result.stats.apcaEvaluations).toBe(4);
  });
});

describe("alirebleco fixtures", () => {
  it("AK-13: passes contrast=default, fails contrast=high below 7:1 and names only contrast=high", async () => {
    const name = "invalid/alirebleco-high-contrast-fail";
    const result = await check({ json: true, repoRoot, fixture: fixture(name) });
    const expected = expectedIssues(name);
    expect(result.ok).toBe(false);
    expect(pairs(result.errors)).toEqual(expected.issues);
    expect(pairs(result.warnings)).toEqual(expected.warnings ?? []);
    expect(result.errors.length).toBeGreaterThan(0);
    for (const issue of result.errors) {
      expect(issue.rule).toBe("contrast-below-threshold");
      expect(issue.severity).toBe("error");
      expect(issue.combination?.contrast).toBe("high");
      expect(issue.path).toMatch(
        /^rezolvo\(.*contrast=high.*\)\/kontrastParo\/text-on-background$/,
      );
      expect(issue.message).toContain("text-on-background");
      expect(issue.message).toMatch(/\d+\.\d{2}:1/);
      expect(issue.message).toContain("7:1");
      expect(issue.suggestion).not.toMatch(/^\s*$/);
    }
    for (const issue of [...result.errors, ...result.warnings]) {
      expect(issue.combination?.contrast).not.toBe("default");
    }
  });

  it("fails alirebleco-transparent-background with kontrastparo-background-transparent", async () => {
    const name = "invalid/alirebleco-transparent-background";
    const result = await check({ json: true, repoRoot, fixture: fixture(name) });
    const expected = expectedIssues(name);
    expect(result.ok).toBe(false);
    expect(pairs(result.errors)).toEqual(expected.issues);
    expect(pairs(result.warnings)).toEqual(expected.warnings ?? []);
    expect(result.errors.map((issue) => issue.rule)).toContain(
      "kontrastparo-background-transparent",
    );
    for (const issue of result.errors) {
      expect(issue.combination?.["color-scheme"]).toBe("dark");
      expect(issue.message).toContain("0.5");
    }
  });

  it("reports an unloadable fixture structurally instead of crashing", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/json-trailing-comma"),
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => issue.rule)).toContain("json-syntax");
  });
});

describe("evaluateAlirebleco", () => {
  it("composites a translucent foreground over the background before measuring", () => {
    const modelo = minimalModelo();
    const core = modelo.setoj.find((set) => set.name === "core");
    const neutral900 = core?.tokens["color.palette.neutral.900"];
    if (neutral900 === undefined) {
      throw new Error("missing token");
    }
    // 50% black over #f2f2f2 (light) is about 3.8:1: fails 4.5 and 7.
    neutral900.value = { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.5 };
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    const failing = result.errors.filter((issue) => issue.rule === "contrast-below-threshold");
    expect(failing.map((issue) => issue.combination)).toEqual([
      { "color-scheme": "light", contrast: "default" },
    ]);
    const composited = WCAG2_METRIC.compute(
      { colorSpace: "srgb", components: [0.475, 0.475, 0.475] },
      { colorSpace: "srgb", components: [0.95, 0.95, 0.95] },
    );
    expect(failing[0]?.message).toContain(`${(Math.floor(composited * 100) / 100).toFixed(2)}:1`);
  });

  it("takes thresholds from the data, not from the code", () => {
    const modelo = minimalModelo();
    const contrast = modelo.dimensioj.find((dimensio) => dimensio.name === "contrast");
    const valoro = contrast?.valoroj.find((entry) => entry.name === "default");
    if (valoro?.kontrastSojloj === undefined) {
      throw new Error("missing thresholds");
    }
    valoro.kontrastSojloj.wcag2["text-normal"] = 21.5;
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(result.errors.map((issue) => issue.combination?.contrast)).toEqual([
      "default",
      "default",
    ]);
    expect(result.errors[0]?.message).toContain("21.5:1");
  });

  it("skips APCA where a contrast value has no APCA thresholds", () => {
    const modelo = minimalModelo();
    for (const dimensio of modelo.dimensioj) {
      for (const valoro of dimensio.valoroj) {
        if (valoro.kontrastSojloj !== undefined) {
          delete valoro.kontrastSojloj.apca;
        }
      }
    }
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(result.errors).toEqual([]);
    expect(result.stats.apcaEvaluations).toBe(0);
    expect(result.stats.evaluations).toBe(4);
  });

  it("reports a missing token once, at the pair's field", () => {
    const modelo = minimalModelo();
    const [pair] = modelo.kontrastParoj;
    if (pair === undefined) {
      throw new Error("missing pair");
    }
    pair.foreground = "color.text.primary";
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(pairs(result.errors)).toEqual([
      { rule: "kontrastparo-token-missing", path: `${DATA}#/kontrastParoj/0/foreground` },
    ]);
    expect(result.stats.evaluations).toBe(0);
  });

  it("reports a non-color token once, at the pair's field", () => {
    const modelo = minimalModelo();
    const [pair] = modelo.kontrastParoj;
    if (pair === undefined) {
      throw new Error("missing pair");
    }
    pair.background = "spacing.small";
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(pairs(result.errors)).toEqual([
      { rule: "kontrastparo-not-color", path: `${DATA}#/kontrastParoj/0/background` },
    ]);
  });

  it("reports a token that does not resolve in a combination as missing there", () => {
    const modelo = minimalModelo();
    const dark = modelo.setoj.find((set) => set.name === "color-scheme/dark");
    const text = dark?.tokens["color.text.default"];
    if (text === undefined) {
      throw new Error("missing token");
    }
    text.value = "{color.palette.neutral.404}";
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(pairs(result.errors)).toEqual([
      {
        rule: "kontrastparo-token-missing",
        path: "rezolvo(color-scheme=dark,contrast=default)/kontrastParo/text-on-background",
      },
    ]);
    expect(result.errors[0]?.combination).toEqual({ "color-scheme": "dark", contrast: "default" });
  });

  it("reports a resolved value that is not a DTCG color as not-color", () => {
    const modelo = minimalModelo();
    const core = modelo.setoj.find((set) => set.name === "core");
    const neutral100 = core?.tokens["color.palette.neutral.100"];
    if (neutral100 === undefined) {
      throw new Error("missing token");
    }
    neutral100.value = { colorSpace: "cmyk", components: [0, 0, 0, 0] };
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: DATA });
    expect(result.errors.length).toBeGreaterThan(0);
    expect(new Set(result.errors.map((issue) => issue.rule))).toEqual(
      new Set(["kontrastparo-not-color"]),
    );
  });
});

describe("built runner", () => {
  it("exits 0 on the repo and 1 on the AK-13 fixture, printing only JSON with --json", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const env = { ...process.env, INIT_CWD: repoRoot };
    const pass = spawnSync(process.execPath, [builtRunner, "alirebleco"], {
      encoding: "utf8",
      env,
    });
    expect(pass.status).toBe(0);
    expect(pass.stdout).toContain("PASS alirebleco");

    const fail = spawnSync(
      process.execPath,
      [
        builtRunner,
        "alirebleco",
        "--json",
        "--fixture",
        fixture("invalid/alirebleco-high-contrast-fail"),
      ],
      { encoding: "utf8", env },
    );
    expect(fail.status).toBe(1);
    expect(fail.stderr).toBe("");
    const result = JSON.parse(fail.stdout) as { errors: { rule: string }[] };
    expect(new Set(result.errors.map(({ rule }) => rule))).toEqual(
      new Set(["contrast-below-threshold"]),
    );
  });
});

describe("KontrastParo aux branches (Spec 002 FR-07, D-09, AK-03)", () => {
  const PAIR = "status-warning-basic-on-background-default";

  it("passes when the fill misses 3:1 and the border reaches it, and reports the aux branch", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("valid/kontrastparo-aux-carries"),
    });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats.auxBranch).toBe(4);
    expect(result.stats[`branch:aux:${PAIR}`]).toBe(4);
    expect(result.branches?.map((entry) => [entry.pair, entry.branch])).toEqual(
      Array.from({ length: 4 }, () => [PAIR, "aux"]),
    );
    // The minimum reported for a pair is the ratio of the branch that carries it.
    expect(result.stats[`minRatio:${PAIR}`]).toBeGreaterThanOrEqual(3);
  });

  it("fails when both branches miss and names both pairs with their ratios", async () => {
    const name = "invalid/kontrastparo-aux-both-fail";
    const result = await check({ json: true, repoRoot, fixture: fixture(name) });
    expect(pairs(result.errors)).toEqual(expectedIssues(name).issues);
    for (const issue of result.errors) {
      expect(issue.message).toContain("color.status.warning.basic on color.background.default");
      expect(issue.message).toContain("color.status.warning.border on color.background.default");
      expect(issue.message.match(/\d+\.\d{2}:1/g)?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("collects one measurement per pair and combination, in canonical order", () => {
    const { modelo } = loadModelo(fixtureModeloSource(fixture("valid/kontrastparo-aux-carries")));
    if (modelo === undefined) throw new Error("fixture did not load");
    const evaluation = evaluateAlirebleco(modelo, { kontrastParojFile: DATA, collect: true });
    const measurements = evaluation.measurements ?? [];
    expect(measurements).toHaveLength(8);
    const warning = measurements.filter((entry) => entry.pair.name === PAIR);
    expect(warning.map((entry) => entry.branch)).toEqual(["aux", "aux", "aux", "aux"]);
    for (const entry of warning) {
      expect(entry.main.passed).toBe(false);
      expect(entry.aux?.passed).toBe(true);
      expect(entry.passed).toBe(true);
      expect(entry.pair.kialo).toContain("1.4.11");
    }
    const text = measurements.filter((entry) => entry.pair.name === "text-on-background");
    expect(text.every((entry) => entry.branch === "main" && entry.aux === undefined)).toBe(true);
  });

  it("measures and returns the aux pair even when the main pair passes", () => {
    const { modelo } = loadModelo(fixtureModeloSource(fixture("valid/kontrastparo-aux-carries")));
    if (modelo === undefined) throw new Error("fixture did not load");
    const core = modelo.setoj.find((set) => set.name === "core");
    const basic = core?.tokens["color.status.warning.basic"];
    if (basic === undefined) throw new Error("missing token");
    basic.value = "{color.palette.neutral.900}";
    const evaluation = evaluateAlirebleco(modelo, { kontrastParojFile: DATA, collect: true });
    const light = (evaluation.measurements ?? []).find(
      (entry) => entry.pair.name === PAIR && entry.combination["color-scheme"] === "light",
    );
    expect(light?.branch).toBe("main");
    expect(light?.aux?.ratio).toBeGreaterThan(0);
  });
});
