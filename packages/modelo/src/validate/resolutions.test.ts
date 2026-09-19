// Shared resolutions of every combination (Spec 002, D-04): validation resolves each combination
// once, and every per-combination rule reads the same result.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolveCombination } from "../resolve/resolve.js";
import { resolutionsOf } from "./resolutions.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";

const load = () => {
  const { modelo } = loadModelo(fixtureModeloSource(fixtureRoot("valid", "minimal")));
  if (modelo === undefined) throw new Error("valid/minimal must load");
  return modelo;
};

describe("resolutionsOf", () => {
  it("resolves every combination, in allAssignments order, like resolveCombination", () => {
    const modelo = load();
    const entries = resolutionsOf(modelo);
    expect(entries.map((entry) => entry.assignment)).toEqual(allAssignments(modelo));
    for (const entry of entries) {
      expect(entry.resolution).toEqual(resolveCombination(modelo, entry.assignment));
    }
  });

  it("returns the same entries for the same Modelo and new ones for another", () => {
    const modelo = load();
    expect(resolutionsOf(modelo)).toBe(resolutionsOf(modelo));
    expect(resolutionsOf(load())).not.toBe(resolutionsOf(modelo));
  });
});
