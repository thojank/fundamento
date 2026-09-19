// The generic Dimensio sets of the repo (Spec 001, D-03, K3, K4; task T016).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { dimensioSetIssues, isGenericDimensioSet } from "../validate/dimensio-set-rules.js";

const { modelo } = loadModelo(defaultModeloSource());
const setoj = modelo?.setoj ?? [];
const tokensOf = (prefix: string) =>
  setoj.filter((set) => set.name.startsWith(prefix)).flatMap((set) => Object.keys(set.tokens));

describe("generic Dimensio sets", () => {
  it("are alias-only and re-point roles only (D-03, K4)", () => {
    expect(setoj.filter(isGenericDimensioSet).length).toBeGreaterThanOrEqual(8);
    if (modelo === undefined) throw new Error("repo did not load");
    expect(dimensioSetIssues(modelo)).toEqual([]);
  });

  it("density re-points spacing and control-size roles only, never typography (K3)", () => {
    const density = tokensOf("density/");
    expect(density.length).toBeGreaterThan(0);
    for (const name of density) {
      expect(name, name).toMatch(/^(spacing\.[a-z]+|size\.control\.[a-z]+)$/);
    }
  });

  it("never lets viewport and density shift the same token (K3)", () => {
    const viewport = new Set(tokensOf("viewport/"));
    expect(tokensOf("density/").filter((name) => viewport.has(name))).toEqual([]);
  });

  it("is backed by the automatic Regulo dimensio-sets-alias-only and the Regulo density-affects-layout-only", () => {
    const byName = new Map(modelo?.reguloj.map((regulo) => [regulo.name, regulo]));
    expect(byName.get("dimensio-sets-alias-only")?.checkability).toBe("automatic");
    expect(byName.get("density-affects-layout-only")?.kialo).toMatch(/viewport/);
  });
});
