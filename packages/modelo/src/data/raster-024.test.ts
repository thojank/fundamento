// Spec 024, decision O-1 of the maintainer (plan ①, Raster-Vorschlag): the five coloured palettes
// get the four steps of the neutral palette they lacked — 25, 150, 850, 975 — so every palette has
// a step for very light tints, light borders, text on very dark surfaces and the deepest ground of
// the dark mode. A token change by spec, no amendment: 20 new core tokens with IDs, komuna's values
// measured on the calibration, the fixtures derived anew, the palette Reguloj still green.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { oklchLightness, readDtcgColor } from "../checks/alirebleco/color.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const COLOURED = ["accent", "success", "warning", "danger", "info"] as const;
const NEW_STEPS = ["25", "150", "850", "975"] as const;
const STEPS = [
  "25",
  "50",
  "100",
  "150",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "850",
  "900",
  "950",
  "975",
];

const fixture = (name: string) =>
  new URL(`../../test/fixtures/valid/${name}/fundamento.config.json`, import.meta.url).pathname;

const { modelo } = loadModelo(defaultModeloSource());
const core = modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

const stepsOf = (tokens: Readonly<Record<string, unknown>>, palette: string): string[] =>
  Object.keys(tokens)
    .filter((name) => name.startsWith(`color.palette.${palette}.`))
    .map((name) => name.split(".").at(-1) ?? "")
    .sort((a, b) => Number(a) - Number(b));

describe("O-1: the coloured palettes carry the steps 25, 150, 850 and 975 (Spec 024, plan ①)", () => {
  it("core defines 15 steps per coloured palette, the neutral palette keeps its 17", () => {
    for (const palette of COLOURED) expect(stepsOf(core, palette), palette).toEqual(STEPS);
    expect(stepsOf(core, "neutral")).toEqual(["0", ...STEPS, "1000"]);
  });

  it("every new step is a palette token with an ID in the lock and a description", () => {
    const lock = JSON.parse(
      readFileSync(new URL("../../data/ids.lock.json", import.meta.url), "utf8"),
    ) as { ids: Record<string, { type: string; status: string }> };
    for (const palette of COLOURED) {
      for (const step of NEW_STEPS) {
        const token = core[`color.palette.${palette}.${step}`];
        expect(token?.type, `${palette}.${step}`).toBe("color");
        expect(token?.role, `${palette}.${step}`).toBe("palette");
        expect(token?.id, `${palette}.${step}`).toMatch(/^tok_[0-9A-Z]{26}$/);
        expect(lock.ids[token?.id ?? ""], `${palette}.${step}`).toEqual({
          type: "token",
          status: "active",
        });
        expect(token?.description, `${palette}.${step}`).toMatch(/step/);
        const value = token?.value as { hex?: string } | undefined;
        expect(value?.hex, `${palette}.${step}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("the new steps lie between their neighbours in OKLCH lightness, so every ramp stays monotone", () => {
    const lightness = (name: string): number => {
      const colour = readDtcgColor(core[name]?.value);
      return colour === undefined ? Number.NaN : oklchLightness(colour);
    };
    const between: [string, string, string][] = [
      ["50", "25", "0"],
      ["200", "150", "100"],
      ["900", "850", "800"],
      ["1000", "975", "950"],
    ];
    for (const palette of COLOURED) {
      for (const [darker, step, lighter] of between) {
        const name = `color.palette.${palette}.${step}`;
        const above = lighter === "0" ? 1 : lightness(`color.palette.${palette}.${lighter}`);
        const below = darker === "1000" ? 0 : lightness(`color.palette.${palette}.${darker}`);
        expect(lightness(name), name).toBeLessThan(above);
        expect(lightness(name), name).toBeGreaterThan(below);
      }
    }
  });

  it.each(["aspekto-ekzemplo", "aspekto-provo", "aspekto-provo-kompakta"])(
    "%s assigns every new step (Art. IV)",
    (name) => {
      const aspekto = name.replace(/^aspekto-/, "");
      const loaded = loadModelo(projectModeloSource(fixture(name))).modelo;
      const set = loaded?.setoj.find((candidate) => candidate.name === `aspekto/${aspekto}`);
      expect(set).toBeDefined();
      for (const palette of COLOURED)
        expect(stepsOf(set?.tokens ?? {}, palette), palette).toEqual(STEPS);
    },
  );

  it("the palette Reguloj hold with the new steps in the repository and in every fixture brand", () => {
    const rules = new Set(["palette-even", "palette-aligned", "srgb-gamut"]);
    for (const source of [
      defaultModeloSource(),
      projectModeloSource(fixture("aspekto-ekzemplo")),
      projectModeloSource(fixture("aspekto-provo-kompakta")),
    ]) {
      const report = validateModelo(source);
      expect(
        [...report.errors, ...report.warnings]
          .filter((issue) => rules.has(issue.rule))
          .map((issue) => `${issue.rule} ${issue.path}`),
      ).toEqual([]);
    }
  });
});
