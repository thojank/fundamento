// The colour part of the Phase-1 Vortaro (Spec 001, FR-02, FR-03, FR-08, D-02, D-12; task T013).

import { describe, expect, it } from "vitest";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

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
