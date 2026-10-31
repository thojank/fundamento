import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Modelo } from "../../contracts/modelo.js";
import { loadModelo } from "../../load/load-modelo.js";
import { fixtureModeloSource } from "../../load/source.js";
import { mutatedFixture } from "../../validate/test-doubles/fixtures.js";
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

// Nachlese 3 W2 (Spec 011 ⑤ B-8): the check measures every Aspekto the Modelo knows — the
// reference komuna as before, and every Aspekto fixture of this package with a config
// (aspekto-ekzemplo). A pair that fails in an external Aspekto is a warning
// `contrast-external-aspekto`, a finding for the maintainer, not a red run (Regel 0.3).
describe("alirebleco over every known Aspekto (Nachlese 3 W2)", () => {
  it("measures komuna and ekzemplo; failures of ekzemplo are warnings that name the Aspekto", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.stats.aspektoj).toBeGreaterThanOrEqual(2);
    expect(result.stats["ekzemplo:evaluations"]).toBeGreaterThan(0);
    // The composed source carries both Aspektoj: komuna's 72 combinations and ekzemplo's.
    expect(result.stats["ekzemplo:combinations"]).toBe(144);
    const external = result.warnings.filter((issue) => issue.rule === "contrast-external-aspekto");
    for (const issue of external) expect(issue.message).toContain("ekzemplo");
    expect(result.stats["ekzemplo:errors"]).toBe(external.length);
    expect(result.summary).toContain("ekzemplo");
    // komuna stays binding: its errors are errors.
    expect(result.ok).toBe(true);
  });

  // Spec 016 ①: the example Aspekto provo, derived by the Agordilo from its Agordo, is a known
  // Aspekto beside ekzemplo; it is measured the same way, its failures are warnings.
  it("measures the derived Aspekto provo as an external Aspekto (Spec 016 ①)", async () => {
    const result = await check({ json: true, repoRoot });
    // Spec 029 ①: and komuna-0-2, komuna as it was, measured beside them without a failing pair.
    expect(result.stats.aspektoj).toBe(5);
    expect(result.stats["komuna-0-2:errors"]).toBe(0);
    expect(result.stats["provo:combinations"]).toBe(144);
    expect(result.stats["provo:evaluations"]).toBeGreaterThan(0);
    expect(result.stats["provo:errors"]).toBe(0);
    expect(result.summary).toContain("provo");
  });

  // Spec 019 ①, G8: provo-kompakta, the counterpart of provo (sharp, dense, smaller type), is the
  // fourth known Aspekto; measured like provo.
  it("measures the derived Aspekto provo-kompakta as an external Aspekto (Spec 019 ①)", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.stats["provo-kompakta:combinations"]).toBe(144);
    expect(result.stats["provo-kompakta:evaluations"]).toBeGreaterThan(0);
    expect(result.stats["provo-kompakta:errors"]).toBe(0);
    expect(result.summary).toContain("provo-kompakta");
  });
});

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
    // Spec 029 ①b: the declared pairs and, beside them, the pairs of the Ero-Tokens komuna sets to
    // its own values (eroKontrastParojOf, only where a token departs from its role).
    expect(result.stats.pairs).toBeGreaterThanOrEqual(pairs);
    expect(result.stats.combinations).toBe(72);
    expect(result.stats.evaluations).toBe((result.stats.pairs ?? 0) * 72);
    // The lowest ratio belongs to a ui pair (threshold 3:1); text pairs need 4.5:1 or 7:1.
    expect(result.stats.minRatio).toBeGreaterThanOrEqual(3);
    expect(result.summary).toMatch(new RegExp(String((result.stats.pairs ?? 0) * 72)));
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
    // The advisory APCA warnings alone fill more than the default 1 MB pipe buffer.
    const pass = spawnSync(process.execPath, [builtRunner, "alirebleco"], {
      encoding: "utf8",
      env,
      maxBuffer: 16 * 1024 * 1024,
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

// An action without a surface of its own (Spec 004, maintainer's review of 2026-09-20): its fill
// is an overlay, and an overlay has no colour until it lies on something. A KontrastParo may name
// that something with `backdrop`; the check then measures the composited colour instead of
// refusing the pair.
describe("KontrastParo with a backdrop (translucent background)", () => {
  const withOverlay = (backdrop?: readonly string[]): string =>
    mutatedFixture("minimal", (edit) => {
      edit("vortaro/sets/core.json", (file: never) => {
        const colour = (file as { color: Record<string, Record<string, unknown>> }).color;
        (colour.background as Record<string, unknown>).overlay = {
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.12, hex: "#000000" },
          $extensions: {
            fundamento: {
              id: "tok_01K5FMAJ0K2ES2P0S3VGVDAXAA",
              role: "background",
            },
          },
        };
      });
      edit("data/kontrastparoj.json", (file: { kontrastParoj: Record<string, unknown>[] }) => {
        file.kontrastParoj.push({
          id: "kpa_01K5FMAJ0K2ES2P0S3VGVDAXAB",
          name: "text-on-overlay",
          foreground: "color.text.default",
          background: "color.background.overlay",
          kategorio: "text-normal",
          ...(backdrop === undefined ? {} : { backdrop }),
        });
      });
    });

  const issuesOf = (root: string) => {
    const { modelo } = loadModelo(fixtureModeloSource(root));
    if (modelo === undefined) throw new Error(`${root} did not load`);
    const result = evaluateAlirebleco(modelo, { kontrastParojFile: "data/kontrastparoj.json" });
    return [...result.errors, ...result.warnings];
  };

  it("measures the overlay over the named surface instead of refusing it", () => {
    const issues = issuesOf(withOverlay(["color.background.default"]));
    expect(issues.filter((issue) => issue.rule === "kontrastparo-background-transparent")).toEqual(
      [],
    );
  });

  // Without a backdrop the ladder is taken; only when none of the named surfaces resolves does
  // the pair stay unmeasurable.
  it("refuses a translucent background when no surface it may lie on resolves", () => {
    const issues = issuesOf(withOverlay(["color.background.absent"]));
    expect(
      issues.filter((issue) => issue.rule === "kontrastparo-background-transparent").length,
    ).toBeGreaterThan(0);
  });

  // A button with no surface of its own can sit on any surface of the ladder, so the worst one
  // decides (maintainer's review of 2026-09-20): an overlay that passes on raised and fails on
  // sunken must make the pair fail, and the finding must say on which surface.
  it("measures the overlay on every surface of the ladder and reports the worst one", () => {
    const root = mutatedFixture("minimal", (edit) => {
      edit("vortaro/sets/core.json", (file: never) => {
        const model = file as {
          color: { palette: Record<string, unknown>; background: Record<string, unknown> };
        };
        const step = (hex: string, component: number, id: string) => ({
          $value: { colorSpace: "srgb", components: [component, component, component], hex },
          $extensions: { fundamento: { id, role: "palette" } },
        });
        const neutral = model.color.palette.neutral as Record<string, unknown>;
        neutral["500"] = step("#8a8a8a", 0.541, "tok_01K5FMAJ0K2ES2P0S3VGVDAXAE");
        const alias = (target: string, id: string) => ({
          $value: `{${target}}`,
          $extensions: { fundamento: { id, role: "background" } },
        });
        // raised is white, sunken a mid grey: the same overlay passes on one and fails on the other.
        model.color.background.raised = alias(
          "color.palette.neutral.0",
          "tok_01K5FMAJ0K2ES2P0S3VGVDAXAC",
        );
        model.color.background.sunken = alias(
          "color.palette.neutral.500",
          "tok_01K5FMAJ0K2ES2P0S3VGVDAXAD",
        );
        model.color.background.overlay = {
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.12, hex: "#000000" },
          $extensions: {
            fundamento: {
              id: "tok_01K5FMAJ0K2ES2P0S3VGVDAXAA",
              role: "background",
            },
          },
        };
      });
      edit("data/kontrastparoj.json", (file: { kontrastParoj: Record<string, unknown>[] }) => {
        file.kontrastParoj.push({
          id: "kpa_01K5FMAJ0K2ES2P0S3VGVDAXAB",
          name: "text-on-overlay",
          foreground: "color.text.default",
          background: "color.background.overlay",
          kategorio: "text-normal",
        });
      });
    });
    const issues = issuesOf(root).filter(
      (issue) => issue.rule === "contrast-below-threshold" && issue.message.includes("overlay"),
    );
    const light = issues.find((issue) => issue.combination?.["color-scheme"] === "light");
    expect(light, "an overlay that fails on sunken must fail the pair").toBeDefined();
    expect(light?.message).toContain("over color.background.sunken");
    expect(light?.suggestion).toContain("which is an overlay");
  });

  it("refuses a backdrop that is itself translucent", () => {
    const issues = issuesOf(withOverlay(["color.background.overlay"]));
    const transparent = issues.filter(
      (issue) => issue.rule === "kontrastparo-background-transparent",
    );
    expect(transparent.length).toBeGreaterThan(0);
    expect(transparent[0]?.message).toContain("the surface 'color.background.overlay'");
  });
});

// Nachlese 6 N6-2 (Spec 016 ③ B-1, O-2): check:alirebleco --aspekto <dir> measures a package that
// is no known fixture — a brand's own, outside the repository — over the core and the reference;
// its failures are errors (the caller asked for this package), the known fixtures are not measured.
describe("alirebleco --aspekto <dir> (Nachlese 6 N6-2)", () => {
  const provo = fixture("valid/aspekto-provo/aspekto-provo");

  it("measures a package outside the repository in all its combinations", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-fremda-"));
    try {
      const own = join(dir, "aspekto-provo");
      cpSync(provo, own, { recursive: true });
      const result = await check({ json: true, repoRoot, aspekto: own });
      expect(result.errors).toEqual([]);
      expect(result.ok).toBe(true);
      expect(result.stats.aspektoj).toBe(2);
      expect(result.stats["provo:combinations"]).toBe(72);
      expect(result.stats["provo:evaluations"]).toBeGreaterThan(0);
      expect(result.stats["provo:errors"]).toBe(0);
      expect(result.summary).toContain("provo");
      expect(result.summary).not.toContain("ekzemplo");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);

  it("reports a failing pair of that package as an error, with the package named", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-fremda-"));
    try {
      const own = join(dir, "aspekto-provo");
      cpSync(provo, own, { recursive: true });
      // A pale lead step: white text on the primary action no longer reaches 4.5:1.
      const setFile = join(own, "sets/aspekto/provo.json");
      const set = JSON.parse(readFileSync(setFile, "utf8"));
      set.color.palette.accent["700"].$value = {
        colorSpace: "srgb",
        components: [0.8, 0.75, 0.95],
        hex: "#ccbff2",
      };
      writeFileSync(setFile, `${JSON.stringify(set, null, 2)}\n`);
      const result = await check({ json: true, repoRoot, aspekto: own });
      expect(result.ok).toBe(false);
      expect(result.stats["provo:errors"]).toBeGreaterThan(0);
      expect(result.errors.length).toBe(result.stats["provo:errors"]);
      expect(result.errors.every((issue) => issue.rule === "contrast-below-threshold")).toBe(true);
      expect(result.errors.some((issue) => issue.message.includes("provo"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
