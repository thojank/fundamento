// Spec 036 Teil 5 ②b-5 (Spec 029 A-signeto-6): a signeto (a tag a person picks or removes) and an
// insigno (a status badge) differ in their form. The form comes from a radius role: the insigno
// keeps the pill, the signeto takes the new role radius.role.tag – {radius.small} in komuna,
// komuna-0-2 (the structure every derived brand starts from) and so in every derived brand. A brand
// without any rounding (ekzemplo) stays square for both.

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolutionsOf } from "../validate/resolutions.js";

const CONFIG = fileURLToPath(
  new URL(
    "../../test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
const loaded = loadModelo(projectModeloSource(CONFIG));
if (loaded.modelo === undefined) throw new Error(JSON.stringify(loaded.issues.slice(0, 3)));
const modelo: Modelo = loaded.modelo;
const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

/** The px a token resolves to in the light standard combination of an Aspekto. */
function radiusIn(aspekto: string, token: string): number | undefined {
  const combination = resolutionsOf(modelo).find(
    (entry) =>
      entry.assignment[ASPEKTO_DIMENSIO] === aspekto &&
      Object.entries(entry.assignment).every(
        ([dimensio, valoro]) =>
          dimensio === ASPEKTO_DIMENSIO ||
          modelo.dimensioj.find((candidate) => candidate.name === dimensio)?.default === valoro,
      ),
  );
  const value = combination?.resolution.tokens[token]?.value as { value?: number } | undefined;
  return value?.value;
}

const ROUNDED = ["komuna", "komuna-0-2", "provo", "provo-kompakta"];

describe("signeto and insigno differ in form (A-signeto-6)", () => {
  it("the core has the role radius.role.tag, bounded, beside the pill", () => {
    expect(core["radius.role.tag"]?.id).toMatch(/^tok_/);
    expect(aliasTarget(core["radius.role.tag"]?.value)).toBe("radius.small");
    expect(aliasTarget(core["radius.role.pill"]?.value)).toBe("radius.full");
  });

  it("the signeto's box takes radius.role.tag, the insigno's keeps radius.role.pill", () => {
    expect(aliasTarget(core["ero.signeto.box.radius"]?.value)).toBe("radius.role.tag");
    expect(aliasTarget(core["ero.insigno.box.radius"]?.value)).toBe("radius.role.pill");
  });

  it.each(ROUNDED)("in %s the signeto is less round than the insigno", (aspekto) => {
    const signeto = radiusIn(aspekto, "ero.signeto.box.radius");
    const insigno = radiusIn(aspekto, "ero.insigno.box.radius");
    expect(signeto).toBeDefined();
    expect(insigno).toBe(9999);
    expect(signeto).toBeLessThan(insigno ?? 0);
  });

  it("ekzemplo, square throughout, stays square", () => {
    expect(radiusIn("ekzemplo", "ero.signeto.box.radius")).toBe(0);
    expect(radiusIn("ekzemplo", "ero.insigno.box.radius")).toBe(0);
  });
});
