// The colour part of the Phase-1 Vortaro (Spec 001, FR-02, FR-03, FR-08, D-02, D-12; task T013).

import { describe, expect, it } from "vitest";
import { alphaOf, readDtcgColor } from "../checks/alirebleco/color.js";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { resolutionsOf } from "../validate/resolutions.js";

const { modelo } = loadModelo(defaultModeloSource());
const core = modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
const colours = Object.values(core).filter((token) => token.type === "color");

describe("colour tokens of the core", () => {
  it("renames color.palette.blue.600 to the role palette accent, keeping its ID", () => {
    expect(core["color.palette.blue.600"]).toBeUndefined();
    expect(core["color.palette.accent.600"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVBE");
  });

  it("gives every colour token a role; primitives are role palette", () => {
    for (const token of colours) {
      expect(token.role, token.name).toBeDefined();
      expect(token.role === "palette", token.name).toBe(token.name.startsWith("color.palette."));
    }
  });

  it("aliases every semantic colour to a palette token (FR-02)", () => {
    for (const token of colours.filter((t) => !t.name.startsWith("color.palette."))) {
      expect(aliasTarget(token.value), token.name).toMatch(/^color\.palette\./);
    }
  });

  it("enforces its colour Reguloj automatically (D-19)", () => {
    const byName = new Map(modelo?.reguloj.map((regulo) => [regulo.name, regulo]));
    expect(byName.get("semantic-colors-alias-palette")?.checkability).toBe("automatic");
    expect(byName.get("color-roles-declared")?.checkability).toBe("automatic");
  });
});

// The tertiary action (Spec 004, maintainer's review of 2026-09-20): a tertiary button has no
// surface of its own — it takes the one it lies on. Its rest and disabled values are therefore
// fully transparent, hover and pressed are overlays (translucent), and only `selected`, which
// marks a lasting choice, is an opaque fill.
describe("color.action.tertiary takes the surface it lies on", () => {
  const combinations = resolutionsOf(modelo as Modelo);
  const alphaIn = (
    combination: (typeof combinations)[number],
    name: string,
  ): number | undefined => {
    const colour = readDtcgColor(combination.resolution.tokens[name]?.value);
    return colour === undefined ? undefined : alphaOf(colour);
  };

  it.each(["color.action.tertiary.rest", "color.action.tertiary.disabled"])(
    "%s is fully transparent in every combination",
    (name) => {
      for (const combination of combinations) {
        expect(
          alphaIn(combination, name),
          `${name} in ${JSON.stringify(combination.assignment)}`,
        ).toBe(0);
      }
    },
  );

  it.each(["color.action.tertiary.hover", "color.action.tertiary.pressed"])(
    "%s is an overlay, not a surface",
    (name) => {
      for (const combination of combinations) {
        const alpha = alphaIn(combination, name) ?? 1;
        expect(alpha, `${name} in ${JSON.stringify(combination.assignment)}`).toBeGreaterThan(0);
        expect(alpha, `${name} in ${JSON.stringify(combination.assignment)}`).toBeLessThan(1);
      }
    },
  );

  it("keeps color.action.tertiary.selected opaque: a lasting choice is a surface", () => {
    for (const combination of combinations) {
      expect(alphaIn(combination, "color.action.tertiary.selected")).toBe(1);
    }
  });
});
