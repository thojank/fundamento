// FUND-6.1 end-to-end: resolution (S4, AK-04) checked on the *repo* data as exported by the build,
// i.e. `packages/modelo/dist/rezolvoj.json` and `dist/modelo.json`, not on fixtures.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ModeloJson, ResolvedToken, Rezolvo } from "../contracts/modelo.js";
import { MODELO_DIST } from "./test-doubles/harness.js";

const modelo = JSON.parse(readFileSync(join(MODELO_DIST, "modelo.json"), "utf8")) as ModeloJson;
const rezolvoj = (
  JSON.parse(readFileSync(join(MODELO_DIST, "rezolvoj.json"), "utf8")) as { rezolvoj: Rezolvo[] }
).rezolvoj;

const setsByName = new Map(modelo.setoj.map((set) => [set.name, set]));
const tokenNames = modelo.tokens.map((token) => token.name).sort();

/** The first Rezolvo (in export order) whose assignment matches `partial` on every given Dimensio. */
function rezolvoWhere(partial: Record<string, string>): Rezolvo {
  const match = rezolvoj.find((rezolvo) =>
    Object.entries(partial).every(([dimensio, valoro]) => rezolvo.assignment[dimensio] === valoro),
  );
  if (match === undefined) throw new Error(`no Rezolvo for ${JSON.stringify(partial)}`);
  return match;
}

function tokenIn(rezolvo: Rezolvo, name: string): ResolvedToken {
  const token = rezolvo.tokens[name];
  if (token === undefined) throw new Error(`token ${name} missing`);
  return token;
}

/** Whether every kondicxo (`dimensio=valoro`) of the set holds in the assignment. */
function isActive(setName: string, assignment: Record<string, string>): boolean {
  const set = setsByName.get(setName);
  if (set === undefined) return false;
  return set.kondicxoj.every((kondicxo) => {
    const [dimensio, valoro] = kondicxo.split("=");
    return dimensio !== undefined && assignment[dimensio] === valoro;
  });
}

/** Whether the set's raw DTCG tree in `modelo.json` defines a `$value` at the token's path. */
function definesToken(setName: string, name: string): boolean {
  let node: unknown = setsByName.get(setName)?.tree;
  for (const segment of name.split(".")) {
    if (typeof node !== "object" || node === null) return false;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "object" && node !== null && "$value" in node;
}

describe("AK-04: all 72 combinations resolve to unique values with provenance", () => {
  it("AK-04: rezolvoj.json holds exactly the 72 distinct complete assignments", () => {
    const expectedCount = modelo.dimensioj.reduce(
      (product, dimensio) => product * dimensio.valoroj.length,
      1,
    );
    expect(expectedCount).toBe(72);
    expect(rezolvoj).toHaveLength(72);
    const keys = new Set(rezolvoj.map((rezolvo) => JSON.stringify(rezolvo.assignment)));
    expect(keys.size).toBe(72);
    for (const rezolvo of rezolvoj) {
      expect(Object.keys(rezolvo.assignment).sort()).toEqual(
        modelo.dimensioj.map((dimensio) => dimensio.name).sort(),
      );
      for (const dimensio of modelo.dimensioj) {
        expect(dimensio.valoroj.map((valoro) => valoro.name)).toContain(
          rezolvo.assignment[dimensio.name],
        );
      }
    }
  });

  it("AK-04: every combination has exactly one value and one provenance per core token", () => {
    expect(tokenNames.length).toBe(30);
    for (const rezolvo of rezolvoj) {
      expect(Object.keys(rezolvo.tokens).sort()).toEqual(tokenNames);
      for (const [name, token] of Object.entries(rezolvo.tokens)) {
        const where = `${name} in ${JSON.stringify(rezolvo.assignment)}`;
        expect(token.value, where).toBeDefined();
        expect(token.value, where).not.toBeNull();
        // A resolved value never contains an unresolved alias.
        expect(JSON.stringify(token.value), where).not.toMatch(/"\{[^"]*\}"/);
        // Provenance: the origin set exists, carries that set's ID, and is active here.
        const origin = setsByName.get(token.origin.set);
        expect(origin, where).toBeDefined();
        expect(token.origin.setId, where).toBe(origin?.id);
        expect(isActive(token.origin.set, rezolvo.assignment), where).toBe(true);
        // Every alias link names an active set.
        const links = [...token.aliasChain, ...Object.values(token.fieldAliases ?? {}).flat()];
        for (const link of links) {
          expect(isActive(link.set, rezolvo.assignment), `${where} via ${link.set}`).toBe(true);
        }
      }
    }
  });
});

describe("AK-04: priority, late binding and conjunction sets on the repo data", () => {
  it("AK-04 priority: color.border.default in dark + high comes from contrast/high", () => {
    const rezolvo = rezolvoWhere({ "color-scheme": "dark", contrast: "high" });
    const token = tokenIn(rezolvo, "color.border.default");
    expect(definesToken("color-scheme/dark", "color.border.default")).toBe(true);
    expect(definesToken("contrast/high", "color.border.default")).toBe(true);
    // Both color-scheme/dark and contrast/high override it; contrast has the higher priority.
    expect(isActive("color-scheme/dark", rezolvo.assignment)).toBe(true);
    expect(token.origin.set).toBe("contrast/high");
    expect(token.aliasChain[0]).toEqual({ set: "contrast/high", token: "color.border.default" });
    // The same token in dark + default contrast comes from the dark set instead.
    const darkDefault = tokenIn(
      rezolvoWhere({ "color-scheme": "dark", contrast: "default" }),
      "color.border.default",
    );
    expect(darkDefault.origin.set).toBe("color-scheme/dark");
  });

  it("AK-04 late binding: color.action.primary.rest in dark follows blue.600 from color-scheme/dark", () => {
    const dark = rezolvoWhere({ "color-scheme": "dark" });
    const light = rezolvoWhere({ "color-scheme": "light" });
    const token = tokenIn(dark, "color.action.primary.rest");
    // The alias is declared once in core and bound late, against the dark palette.
    expect(token.origin.set).toBe("core");
    expect(token.aliasChain).toEqual([
      { set: "core", token: "color.action.primary.rest" },
      { set: "color-scheme/dark", token: "color.palette.blue.600" },
    ]);
    expect(definesToken("core", "color.action.primary.rest")).toBe(true);
    expect(definesToken("color-scheme/dark", "color.action.primary.rest")).toBe(false);
    expect(token.value).toEqual(tokenIn(dark, "color.palette.blue.600").value);
    expect(tokenIn(dark, "color.palette.blue.600").origin.set).toBe("color-scheme/dark");
    expect(token.value).not.toEqual(tokenIn(light, "color.action.primary.rest").value);
  });

  it("AK-04 conjunction: color.palette.neutral.900 in dark comes from aspekto/neutra+color-scheme/dark", () => {
    const dark = rezolvoj.filter((rezolvo) => rezolvo.assignment["color-scheme"] === "dark");
    expect(dark).toHaveLength(36);
    expect(definesToken("color-scheme/dark", "color.palette.neutral.900")).toBe(true);
    expect(definesToken("aspekto/neutra+color-scheme/dark", "color.palette.neutral.900")).toBe(
      true,
    );
    for (const rezolvo of dark) {
      const token = tokenIn(rezolvo, "color.palette.neutral.900");
      // The single-condition set color-scheme/dark defines the same token and is active too.
      expect(isActive("color-scheme/dark", rezolvo.assignment)).toBe(true);
      expect(token.origin.set).toBe("aspekto/neutra+color-scheme/dark");
    }
  });
});
