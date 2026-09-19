// The invented external Aspekto `ekzemplo`, complete against the real core and included through
// its own fundamento.config.json (Spec 001, D-16, AK-03, AK-05; task T018).

import { describe, expect, it } from "vitest";
import { evaluateAlirebleco } from "../checks/alirebleco/evaluate.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const CONFIG = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const source = projectModeloSource(CONFIG);
const { modelo } = loadModelo(source);

function tokens(assignment: Record<string, string>) {
  if (modelo === undefined) throw new Error("did not load");
  const outcome = resolve(modelo, assignment);
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
  return outcome.rezolvo.tokens;
}

describe("valid/aspekto-ekzemplo with the repo core (AK-03)", () => {
  it("composes core, the reference komuna and ekzemplo", () => {
    expect(source.sourceIssues).toEqual([]);
    expect(modelo?.aspektoPackages.map((pkg) => [pkg.aspekto, pkg.namespace])).toEqual([
      ["komuna", undefined],
      ["ekzemplo", "ekz"],
    ]);
  });

  // Full validation of 144 combinations: ~1 s alone, several seconds on a loaded runner.
  it("validates without errors or warnings: complete, namespaced, fonts declared", {
    timeout: 30_000,
  }, () => {
    const report = validateModelo(source);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.summary.combinations).toBe(144);
  });

  it("differs from komuna in weight, line height and tracking of the display roles (AK-05)", () => {
    const komuna = tokens({ aspekto: "komuna" })["typography.display.1"]?.value as Record<
      string,
      unknown
    >;
    const ekzemplo = tokens({ aspekto: "ekzemplo" })["typography.display.1"]?.value as Record<
      string,
      unknown
    >;
    for (const field of ["fontWeight", "lineHeight", "letterSpacing", "fontFamily"]) {
      expect(ekzemplo[field], field).not.toEqual(komuna[field]);
    }
  });

  it("changes its display roles in viewport=compact and keeps them in density=compact (AK-05, K3)", () => {
    const base = tokens({ aspekto: "ekzemplo" })["typography.display.1"]?.value;
    expect(
      tokens({ aspekto: "ekzemplo", viewport: "compact" })["typography.display.1"]?.value,
    ).not.toEqual(base);
    expect(
      tokens({ aspekto: "ekzemplo", density: "compact" })["typography.display.1"]?.value,
    ).toEqual(base);
  });

  it("answers the S7 analogues: dark text from its conjunction set, flat elevation", () => {
    const dark = tokens({ aspekto: "ekzemplo", "color-scheme": "dark" })["color.text.default"];
    expect(dark?.origin).toMatchObject({
      set: "aspekto/ekzemplo+color-scheme/dark",
      package: "aspekto-ekzemplo",
    });
    for (const level of ["raised", "overlay", "floating", "modal"]) {
      const shadow = tokens({ aspekto: "ekzemplo" })[`elevation.shadow.${level}`];
      expect(shadow?.origin.set, level).toBe("aspekto/ekzemplo");
      const layers = [shadow?.value].flat() as { color: { alpha?: number } }[];
      expect(
        layers.every((layer) => layer.color.alpha === 0),
        level,
      ).toBe(true);
    }
  });
});

describe("invalid/aspekto-incomplete (AK-03)", () => {
  it("fails with aspekto-incomplete for exactly the removed tokens", () => {
    const report = validateModelo(
      projectModeloSource(`${fixtureRoot("invalid", "aspekto-incomplete")}/fundamento.config.json`),
    );
    const set = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";
    expect(
      report.errors.map((issue) => [
        issue.rule,
        issue.path.replace(/^.*aspekto-ekzemplo\//, "aspekto-ekzemplo/"),
      ]),
    ).toEqual([
      ["aspekto-incomplete", `${set}#/color/action/primary/rest`],
      ["aspekto-incomplete", `${set}#/color/text/default`],
      ["aspekto-incomplete", `${set}#/motion/duration/fast`],
      ["aspekto-incomplete", `${set}#/typography/kicker`],
    ]);
  });
});

describe("the warning surface of ekzemplo holds through its border (Spec 002 S3, D-10)", () => {
  const PAIR = "status-warning-basic-on-background-default";
  if (modelo === undefined) throw new Error("did not load");
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });

  it("passes every pair in every combination of both Aspektoj", () => {
    expect(evaluation.errors).toEqual([]);
  });

  it("uses the aux branch in ekzemplo light/default only: fill below 3:1, border at least 3:1", () => {
    const warning = (evaluation.measurements ?? []).filter(
      (entry) => entry.pair.name === PAIR && entry.branch === "aux",
    );
    expect(warning.length).toBe(18);
    for (const entry of warning) {
      expect(entry.combination).toMatchObject({
        aspekto: "ekzemplo",
        "color-scheme": "light",
        contrast: "default",
      });
      expect(entry.main.ratio).toBeLessThan(3);
      expect(entry.aux?.ratio).toBeGreaterThanOrEqual(3);
    }
    expect(evaluation.branches.every((entry) => entry.pair === PAIR)).toBe(true);
  });
});
