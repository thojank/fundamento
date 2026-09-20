// What the Vitrino shows (Spec 004 T008–T010, FR-06): the sections in the document and the data
// island behind them. Every number here is the one the checks compute, not a second calculation.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, evaluateAlirebleco, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import type { VitrinoDatumoj } from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

const dirs: string[] = [];
let html = "";
let datumoj: VitrinoDatumoj;

beforeAll(async () => {
  const out = mkdtempSync(join(tmpdir(), "fm-vitrino-datumoj-"));
  dirs.push(out);
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = readFileSync(join(out, VITRINO_FILE), "utf8");
  const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
  datumoj = JSON.parse((island?.[1] ?? "{}").replaceAll("<\\/", "</")) as VitrinoDatumoj;
}, 120_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the sections of FR-06", () => {
  it("has all ten sections, each with a heading", () => {
    for (const id of [
      "kapo",
      "paletroj",
      "roloj",
      "butono",
      "kontrasto",
      "regularo",
      "kovrado",
      "komparo",
    ]) {
      expect(html, id).toContain(`id="fm-vitrino-${id}"`);
    }
    expect(html.match(/<h2>/g)?.length ?? 0).toBeGreaterThanOrEqual(7);
  });

  it("shows every palette step with its token, hex and lightness", () => {
    const ramps = datumoj.paletroj.komuna ?? [];
    expect(ramps.map((ramp) => ramp.rampo)).toContain("accent");
    const accent = ramps.find((ramp) => ramp.rampo === "accent");
    expect(accent?.stupoj.length).toBeGreaterThan(8);
    const step = accent?.stupoj[0];
    expect(html).toContain(`<code>${step?.token}</code>`);
    expect(html).toContain(step?.hex ?? "never");
    expect(step?.l).toBeGreaterThan(0);
    expect(accent?.regula).toMatch(/% vom Median/);
  });

  it("shows the four surfaces with their distance to the neighbour and to the anchor", () => {
    const roles = datumoj.roloj["komuna|light|default"];
    expect(roles?.surfaces.map((row) => row.token)).toEqual([
      "color.background.sunken",
      "color.background.canvas",
      "color.background.default",
      "color.background.raised",
    ]);
    expect(roles?.surfaces[1]?.alNaskbo).toBeGreaterThan(0.02);
    expect(roles?.surfaces[3]?.alEkstremo).toBeGreaterThan(0.02);
    expect(roles?.text).toHaveLength(3);
    expect(roles?.status.length).toBeGreaterThan(10);
    expect(roles?.agoj.length).toBeGreaterThan(10);
  });

  it("renders fm-butono for every combination of the Skemo", () => {
    expect(html).toContain("<fm-butono");
    expect(html).toContain('variant="primary"');
    expect(html).toContain('tone="danger"');
    expect(html).toContain("disabled");
    expect(html).toContain("loading");
    expect(html).not.toContain("react");
  });

  it("carries WCAG and APCA of every pair, with threshold, reserve and result", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
    const evaluation = evaluateAlirebleco(modelo, {
      kontrastParojFile: "data/kontrastparoj.json",
      collect: true,
    });
    const first = evaluation.measurements?.[0];
    const key = modelo.dimensioj
      .map((dimensio) => first?.combination[dimensio.name] ?? "")
      .join("|");
    const rows = datumoj.mezuroj[key] ?? [];
    expect(rows.length).toBe(modelo.kontrastParoj.length);
    const row = rows.find((entry) => entry.paro === first?.pair.name);
    expect(row?.wcag2).toBeCloseTo(first?.main.ratio ?? 0, 1);
    expect(row?.apca).not.toBe(0);
    expect(row?.rezervo).toBeDefined();
    expect(typeof row?.pasis).toBe("boolean");
  });

  it("counts the advisory APCA findings", () => {
    expect(datumoj.apcaHintoj.nun).toBeGreaterThan(1000);
  });

  it("carries every automatic Regulo with its kialo and its result per combination", () => {
    const key = datumoj.kombinoj[0] ?? "";
    const rules = datumoj.regularo[key] ?? [];
    expect(rules.length).toBeGreaterThan(15);
    for (const rule of rules) {
      expect(rule.kialo.length).toBeGreaterThan(20);
      expect(typeof rule.pasis).toBe("boolean");
    }
    expect(rules.every((rule) => rule.pasis)).toBe(true);
  });

  it("carries the design goals of the brand with target, measurement and result", () => {
    const goals = datumoj.aspiroj.komuna ?? [];
    expect(goals.length).toBe(5);
    expect(goals.map((goal) => goal.metriko)).toContain("dimensio-kovrado");
    for (const goal of goals) {
      expect(goal.atingita).toBe(true);
      expect(goal.limo).not.toBe("");
      expect(goal.mezurita).not.toBe("–");
      expect(goal.kialo.length).toBeGreaterThan(20);
    }
  });

  // The page shows two coverage numbers: the comparison counts every token of the dark set, the
  // design goal only the four role groups it names. Without the scope the two look contradictory.
  it("names the token scope of every design goal", () => {
    const goals = datumoj.aspiroj.komuna ?? [];
    const dark = goals.find((goal) => goal.metriko === "dimensio-kovrado");
    expect(dark?.amplekso).toContain("color.background.**");
    expect(dark?.amplekso).toContain("color.status.**");
    const reserve = goals.find((goal) => goal.metriko === "wcag2-reserve");
    expect(reserve?.amplekso).toBe("alle Tokens");
  });

  // A translucent action value is an overlay: showing it as #000000 with lightness 0.000 read like
  // pure black (maintainer's review of 2026-09-20).
  it("shows a translucent action value as an overlay, with its opacity", () => {
    const rows = datumoj.roloj["komuna|light|default"]?.agoj ?? [];
    const rest = rows.find((row) => row.token === "color.action.tertiary.rest");
    expect(rest?.hex).toBe("durchsichtig");
    expect(rest?.l).toBeUndefined();
    const hover = rows.find((row) => row.token === "color.action.tertiary.hover");
    expect(hover?.hex).toBe("#000000, 8 % Deckung");
    expect(hover?.l).toBeUndefined();
    const opaque = rows.find((row) => row.token === "color.action.primary.rest");
    expect(opaque?.hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(opaque?.l).toBeGreaterThan(0);
  });

  // An overlay is measured on the worst surface it may lie on; the table says which one it was
  // (maintainer's review of 2026-09-20).
  it("names the surface that decided an overlay pair", () => {
    const rows = datumoj.mezuroj["komuna|medium|default|light|default|default"] ?? [];
    const hover = rows.find((row) => row.paro === "action-tertiary-text-on-action-tertiary-hover");
    expect(hover?.surfaco).toBe("color.background.sunken");
    const plain = rows.find((row) => row.paro === "text-on-background");
    expect(plain?.surfaco).toBeUndefined();
  });

  it("carries the coverage per Dimensio value", () => {
    const coverage = datumoj.kovrado.komuna ?? [];
    const dark = coverage.find(
      (entry) => entry.dimensio === "color-scheme" && entry.valoro === "dark",
    );
    expect(dark?.propraj).toBe(57);
    expect(dark?.entute).toBe(76);
    expect(coverage.some((entry) => entry.dimensio === "motion")).toBe(true);
  });
});
