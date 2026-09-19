// The text hierarchy under contrast=high (Spec 002 T009; plan D-05, maintainer review R2 and R4).
//
// High contrast means maximum contrast for the main role, in both schemes: in light,
// color.text.default takes the darkest step and 950/900 stay for subtle and muted; in dark it
// takes the lightest step with 50/100. Boundary (R4): in dark/default pure white stays excluded,
// because full white on near-black halates for people with astigmatism; under contrast=high the
// user has asked for maximum contrast explicitly, so the exclusion does not apply there.

import { describe, expect, it } from "vitest";
import { readDtcgColor } from "../checks/alirebleco/color.js";
import { WCAG2_METRIC } from "../checks/alirebleco/metrics.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolveCombination } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const { modelo } = loadModelo(projectModeloSource(config));
if (modelo === undefined) throw new Error("core + ekzemplo must load");

const ROLES = ["default", "subtle", "muted"] as const;
const SURFACES = ["default", "canvas", "raised", "sunken"] as const;

function resolved(aspekto: string, scheme: string, contrast: string) {
  if (modelo === undefined) throw new Error("unreachable");
  return resolveCombination(modelo, { aspekto, "color-scheme": scheme, contrast }).tokens;
}

/** The palette step a role resolves to, e.g. neutral.1000. */
function stepOf(tokens: ReturnType<typeof resolved>, name: string): string | undefined {
  const target = tokens[name]?.aliasChain
    .map((link) => link.token)
    .find((token) => token.startsWith("color.palette."));
  return target?.slice("color.palette.".length);
}

describe.each(["komuna", "ekzemplo"])("text roles of %s under contrast=high", (aspekto) => {
  it.each([
    ["light", ["neutral.1000", "neutral.950", "neutral.900"]],
    ["dark", ["neutral.0", "neutral.50", "neutral.100"]],
  ] as const)("%s resolves default, subtle, muted to %j", (scheme, steps) => {
    const tokens = resolved(aspekto, scheme, "high");
    expect(ROLES.map((role) => stepOf(tokens, `color.text.${role}`))).toEqual(steps);
  });

  it.each(["light", "dark"])(
    "%s: three different values, each ≥ 7:1 on every surface, falling from default to muted",
    (scheme) => {
      const tokens = resolved(aspekto, scheme, "high");
      const color = (name: string) => {
        const value = readDtcgColor(tokens[name]?.value);
        if (value === undefined) throw new Error(`${name} is no colour`);
        return value;
      };
      const values = ROLES.map((role) => JSON.stringify(tokens[`color.text.${role}`]?.value));
      expect(new Set(values).size).toBe(3);
      for (const surface of SURFACES) {
        const ratios = ROLES.map((role) =>
          WCAG2_METRIC.compute(color(`color.text.${role}`), color(`color.background.${surface}`)),
        );
        for (const ratio of ratios)
          expect(ratio, `${scheme} on ${surface}`).toBeGreaterThanOrEqual(7);
        if (surface === "default") {
          expect(ratios[0]).toBeGreaterThan(ratios[1] ?? 0);
          expect(ratios[1]).toBeGreaterThan(ratios[2] ?? 0);
        }
      }
    },
  );

  it("keeps pure white out of dark/default text (halation, R4)", () => {
    expect(stepOf(resolved(aspekto, "dark", "default"), "color.text.default")).not.toBe(
      "neutral.0",
    );
  });
});
