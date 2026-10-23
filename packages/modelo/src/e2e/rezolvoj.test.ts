// FUND-6.1 end-to-end: resolution (S4, AK-04) checked on the *repo* data as exported by the build,
// i.e. `packages/modelo/dist/rezolvoj.json` and `dist/modelo.json`, not on fixtures.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ModeloJson, ResolvedToken, Rezolvo } from "../contracts/modelo.js";
import { expandRezolvo, type RezolvojJson } from "../export/export-modelo.js";
import { MODELO_DIST } from "./test-doubles/harness.js";

const modelo = JSON.parse(readFileSync(join(MODELO_DIST, "modelo.json"), "utf8")) as ModeloJson;
// The file writes the tokens of the third level as references (Nachlese 9, O-8); followed here,
// every check below reads whole tokens.
const rezolvoj = (
  JSON.parse(readFileSync(join(MODELO_DIST, "rezolvoj.json"), "utf8")) as RezolvojJson
).rezolvoj.map(expandRezolvo);

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
      (product, dimensio) => product * (dimensio.valoroj ?? []).length,
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
        expect((dimensio.valoroj ?? []).map((valoro) => valoro.name)).toContain(
          rezolvo.assignment[dimensio.name],
        );
      }
    }
  });

  it("AK-04: every combination has exactly one value and one provenance per core token", () => {
    expect(tokenNames.length).toBeGreaterThanOrEqual(30);
    // One assertion over all ~24 000 resolved tokens: per-token expect calls took >10 s on CI.
    const violations: string[] = [];
    for (const rezolvo of rezolvoj) {
      const names = Object.keys(rezolvo.tokens).sort();
      if (JSON.stringify(names) !== JSON.stringify(tokenNames)) {
        violations.push(`token set differs in ${JSON.stringify(rezolvo.assignment)}`);
      }
      for (const [name, token] of Object.entries(rezolvo.tokens)) {
        const where = `${name} in ${JSON.stringify(rezolvo.assignment)}`;
        if (token.value === undefined || token.value === null)
          violations.push(`${where}: no value`);
        // A resolved value never contains an unresolved alias.
        if (/"\{[^"]*\}"/.test(JSON.stringify(token.value)))
          violations.push(`${where}: alias left`);
        // Provenance: the origin set exists, carries that set's ID, and is active here.
        const origin = setsByName.get(token.origin.set);
        if (origin === undefined || token.origin.setId !== origin.id) {
          violations.push(`${where}: origin ${token.origin.set} unknown or with a wrong ID`);
        }
        if (!isActive(token.origin.set, rezolvo.assignment)) {
          violations.push(`${where}: origin ${token.origin.set} not active`);
        }
        // Every alias link names an active set.
        const links = [...token.aliasChain, ...Object.values(token.fieldAliases ?? {}).flat()];
        for (const link of links) {
          if (!isActive(link.set, rezolvo.assignment)) violations.push(`${where} via ${link.set}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("AK-04: priority, late binding and conjunction sets on the repo data", () => {
  it("AK-04 priority: color.border.strong comes from the most specific active set", () => {
    // komuna states its own text in dark (Spec 004, G9); the borders stay with the generic sets.
    const origin = (assignment: Record<string, string>) =>
      tokenIn(rezolvoWhere(assignment), "color.border.strong").origin.set;
    for (const set of ["color-scheme/dark", "contrast/high", "color-scheme/dark+contrast/high"]) {
      expect(definesToken(set, "color.border.strong"), set).toBe(true);
    }
    // contrast (priority 5) beats color-scheme (4); their conjunction beats both. Spec 029 ①: komuna
    // states every colour role of its dark mode in its conjunction set, borders included.
    expect(origin({ "color-scheme": "light", contrast: "high" })).toBe("contrast/high");
    expect(origin({ "color-scheme": "dark", contrast: "default" })).toBe(
      "aspekto/komuna+color-scheme/dark",
    );
    expect(origin({ "color-scheme": "dark", contrast: "high" })).toBe(
      "color-scheme/dark+contrast/high",
    );
    expect(origin({ "color-scheme": "light", contrast: "default" })).toBe("core");
  });

  it("AK-04 late binding: color.link.rest in dark is re-pointed by color-scheme/dark", () => {
    const dark = rezolvoWhere({ "color-scheme": "dark" });
    const light = rezolvoWhere({ "color-scheme": "light" });
    // Spec 029 ①: komuna states every colour role of its dark mode, links included; the set only
    // re-points the alias (D-03), the value comes from the core palette.
    const token = tokenIn(dark, "color.link.rest");
    expect(definesToken("color-scheme/dark", "color.link.rest")).toBe(true);
    expect(token.origin.set).toBe("aspekto/komuna+color-scheme/dark");
    expect(token.aliasChain[0]).toEqual({
      set: "aspekto/komuna+color-scheme/dark",
      token: "color.link.rest",
    });
    expect(token.aliasChain.at(-1)?.set).toBe("core");
    expect(token.value).not.toEqual(tokenIn(light, "color.link.rest").value);
  });

  it("AK-04 conjunction: komuna tints palette steps in dark via its conjunction set", () => {
    // Spec 029 ①: the steps of the dark ramps of the Fonto, which komuna's dark roles use.
    const dark = rezolvoj.filter((rezolvo) => rezolvo.assignment["color-scheme"] === "dark");
    expect(dark).toHaveLength(36);
    for (const rezolvo of dark) {
      const tinted = Object.entries(rezolvo.tokens).filter(
        ([name, token]) =>
          name.startsWith("color.palette.") &&
          token.origin.set === "aspekto/komuna+color-scheme/dark",
      );
      expect(tinted.length).toBeGreaterThan(0);
      for (const [name] of tinted) {
        expect(definesToken("color-scheme/dark", name)).toBe(false);
      }
      const users = Object.values(rezolvo.tokens).filter(
        (token) => token.aliasChain.at(-1)?.set === "aspekto/komuna+color-scheme/dark",
      );
      expect(users.length).toBeGreaterThan(0);
    }
  });
});
