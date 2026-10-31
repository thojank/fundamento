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

  // Spec 035 Befund 1.3 (AK-07): the validation rules only read these resolutions, so the start
  // copies no value of them. A whole-value alias holds the very value of its target; copying every
  // value of every core token in every combination (144 at the heaviest fixture) was part of the
  // start of the MCP server.
  it("holds an alias's target value itself, without a copy per token (Spec 035 Befund 1.3, AK-07)", () => {
    const modelo = load();
    const first = resolutionsOf(modelo)[0];
    if (first === undefined) throw new Error("valid/minimal has a combination");
    const { tokens } = first.resolution;
    const targetOf = (token: { aliasChain: { token: string }[] }) =>
      token.aliasChain.at(-1)?.token ?? "";
    const aliases = Object.entries(tokens).filter(
      ([, token]) =>
        token.aliasChain.length > 0 &&
        typeof token.value === "object" &&
        Object.hasOwn(tokens, targetOf(token)),
    );
    expect(aliases.length).toBeGreaterThan(0);
    for (const [name, token] of aliases) {
      const target = targetOf(token);
      expect(tokens[target]?.value, `${name} -> ${target}`).toBe(token.value);
    }
    // resolveCombination itself still hands out copies a caller may change.
    const [name, token] = aliases[0] ?? [];
    const copied = resolveCombination(modelo, first.assignment).tokens[name ?? ""];
    expect(copied?.value).toEqual(token?.value);
    expect(copied?.value).not.toBe(token?.value);
  });
});
