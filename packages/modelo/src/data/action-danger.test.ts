// Danger action and target size (Spec 003 T003; plan Q1, D-04; WCAG 2.5.8).
//
// `tone=danger` of `butono` binds four role tokens: a filled surface in three states and its
// text. The three text-on-fill pairs are KontrastParoj like every action, and `state-distinct`
// applies to hover and pressed through its appliesTo. `size.target.min` is the threshold of the
// Ero Regulo `touch-target-min`: one core value, changed by no Dimensio and no Aspekto.

import { describe, expect, it } from "vitest";
import { oklchLightness, readDtcgColor } from "../checks/alirebleco/color.js";
import { WCAG2_METRIC } from "../checks/alirebleco/metrics.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolveCombination } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const { modelo } = loadModelo(projectModeloSource(config));
if (modelo === undefined) throw new Error("core + ekzemplo must load");

const DANGER = ["rest", "hover", "pressed"] as const;
const CLASSES = [
  ["light", "default"],
  ["light", "high"],
  ["dark", "default"],
  ["dark", "high"],
] as const;

function tokensOf(aspekto: string, scheme: string, contrast: string) {
  if (modelo === undefined) throw new Error("unreachable");
  return resolveCombination(modelo, { aspekto, "color-scheme": scheme, contrast }).tokens;
}

describe("danger action tokens in core (Q1)", () => {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

  it.each([
    ["color.action.danger.rest", "background"],
    ["color.action.danger.hover", "background"],
    ["color.action.danger.pressed", "background"],
    ["color.action.danger.text", "foreground"],
  ])("%s exists with role %s and a description", (name, role) => {
    const token = core[name];
    expect(token, name).toBeDefined();
    expect(token?.role).toBe(role);
    expect(token?.description?.length ?? 0).toBeGreaterThan(20);
  });

  it("declares the three text-on-fill pairs as normal text", () => {
    const pairs = modelo.kontrastParoj.filter((pair) =>
      pair.foreground.startsWith("color.action.danger."),
    );
    expect(pairs.map((pair) => [pair.name, pair.background, pair.kategorio]).sort()).toEqual([
      ["action-danger-text-on-action-danger-hover", "color.action.danger.hover", "text-normal"],
      ["action-danger-text-on-action-danger-pressed", "color.action.danger.pressed", "text-normal"],
      ["action-danger-text-on-fill", "color.action.danger.rest", "text-normal"],
    ]);
  });
});

describe.each(["komuna", "ekzemplo"])("danger action of %s", (aspekto) => {
  it.each(CLASSES)("%s/%s: text on every fill ≥ 4.5:1, ≥ 7:1 under high", (scheme, contrast) => {
    const tokens = tokensOf(aspekto, scheme, contrast);
    const color = (name: string) => {
      const value = readDtcgColor(tokens[name]?.value);
      if (value === undefined) throw new Error(`${name} is no colour in ${aspekto}`);
      return value;
    };
    const minimum = contrast === "high" ? 7 : 4.5;
    for (const state of DANGER) {
      const ratio = WCAG2_METRIC.compute(
        color("color.action.danger.text"),
        color(`color.action.danger.${state}`),
      );
      expect(ratio, `${state}`).toBeGreaterThanOrEqual(minimum);
    }
  });

  it.each(CLASSES)(
    "%s/%s: hover and pressed differ from rest by ≥ 0.05 in OKLCH L",
    (scheme, contrast) => {
      const tokens = tokensOf(aspekto, scheme, contrast);
      const lightness = (name: string) => {
        const value = readDtcgColor(tokens[name]?.value);
        if (value === undefined) throw new Error(`${name} is no colour in ${aspekto}`);
        return oklchLightness(value);
      };
      const rest = lightness("color.action.danger.rest");
      for (const state of ["hover", "pressed"]) {
        expect(
          Math.abs(lightness(`color.action.danger.${state}`) - rest),
          state,
        ).toBeGreaterThanOrEqual(0.05);
      }
    },
  );
});

describe("size.target.min (WCAG 2.5.8, touch-target-min)", () => {
  it("is a 24 px dimension in core with a description citing WCAG 2.5.8", () => {
    const token = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens["size.target.min"];
    expect(token?.type).toBe("dimension");
    expect(token?.description).toContain("2.5.8");
    const value = tokensOf("komuna", "light", "default")["size.target.min"]?.value;
    expect(value).toEqual({ value: 24, unit: "px" });
  });

  // Art. IV: every Aspekto restates every core token, so the Aspekto sets carry it as the same
  // alias; no Dimensio set may change it, and it resolves to 24 px everywhere.
  it("is set by no Dimensio set and resolves to 24 px in every combination of both Aspektoj", () => {
    const setters = modelo.setoj
      .filter(
        (set) =>
          set.name !== CORE_SET_NAME &&
          !set.name.startsWith("aspekto/") &&
          "size.target.min" in set.tokens,
      )
      .map((set) => set.name);
    expect(setters).toEqual([]);
    for (const aspekto of ["komuna", "ekzemplo"]) {
      for (const density of ["compact", "default", "comfortable"]) {
        for (const viewport of ["compact", "medium", "expanded"]) {
          if (modelo === undefined) throw new Error("unreachable");
          const value = resolveCombination(modelo, { aspekto, density, viewport }).tokens[
            "size.target.min"
          ]?.value;
          expect(value, `${aspekto} ${density} ${viewport}`).toEqual({ value: 24, unit: "px" });
        }
      }
    }
  });
});
