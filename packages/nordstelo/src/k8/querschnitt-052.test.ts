// Spec 052 K8I-006 (cross-cutting): the same `verteilita` semantics everywhere and nothing loosened.
//
// - Every generated K8 fixture folder is one the generator writes (`NOMOJ` of `test/k8/generi.mjs`),
//   and for every one of them `k8()` equals the generator's own reference computation
//   (`atendo.json`, independent of `k8.ts`) byte for byte – with the Modelo of the cxiuj config the
//   generator uses and with the repository Modelo `score()` uses.
// - AC-G1: the step tolerance of D-08 is still 0.5 px.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  projectModeloSource,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { stabilaJson } from "../ablauf/raporto.js";
import type { Facts } from "../facts.js";
import { AUF_STUFO, k8 } from "./k8.js";

const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
const GENERILO = fileURLToPath(new URL("../../test/k8/generi.mjs", import.meta.url));
const K8_FIKSAJXOJ = fileURLToPath(new URL("../../test/fixtures/k8/", import.meta.url));

function sxargi(source: Parameters<typeof loadModelo>[0], kio: string): Modelo {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error(`${kio} must load`);
  return modelo;
}

const cxiujModelo = sxargi(projectModeloSource(CXIUJ_CONFIG), "the cxiuj-config Modelo");
const defaultModelo = sxargi(defaultModeloSource(), "the repository Modelo");

const dosierujoj = readdirSync(K8_FIKSAJXOJ, { withFileTypes: true })
  .filter((ero) => ero.isDirectory())
  .map((ero) => ero.name)
  .sort();

/** The names in `const NOMOJ = [ … ];` of the generator (string literals, comments skipped). */
function nomojDeGenerilo(): string[] {
  const fonto = readFileSync(GENERILO, "utf8");
  const listo = /^const NOMOJ = \[\n([\s\S]*?)\n\];$/m.exec(fonto)?.[1];
  if (listo === undefined) throw new Error("generi.mjs has no NOMOJ list");
  return listo
    .split("\n")
    .map((linio) => linio.trim())
    .filter((linio) => linio !== "" && !linio.startsWith("//"))
    .map((linio) => {
      const nomo = /^"([^"]+)",$/.exec(linio)?.[1];
      if (nomo === undefined) throw new Error(`NOMOJ line not understood: ${linio}`);
      return nomo;
    });
}

const legi = (nomo: string, dosiero: string): string =>
  readFileSync(join(K8_FIKSAJXOJ, nomo, dosiero), "utf8");

describe("Spec 052 K8I-006: one verteilita semantics in k8.ts and in generi.mjs", () => {
  it("the fixture folders are exactly the names the generator renders", () => {
    const nomoj = nomojDeGenerilo();
    expect(nomoj.length).toBeGreaterThan(0);
    expect(new Set(nomoj).size).toBe(nomoj.length);
    expect([...nomoj].sort()).toEqual(dosierujoj);
  });

  it("some fixtures carry verteilita pairs (the semantics is exercised, not vacuous)", () => {
    const kunVerteilita = dosierujoj.filter((nomo) =>
      (JSON.parse(legi(nomo, "faktoj.json")) as Facts).renders.some((render) =>
        render.k8?.interspacoj.some((interspaco) => interspaco.verteilita !== undefined),
      ),
    );
    expect(kunVerteilita).toEqual(expect.arrayContaining(["konto-m1", "konto-m1-plena"]));
  });

  for (const nomo of dosierujoj) {
    it(`${nomo}: k8() equals atendo.json with the cxiuj-config and the repository Modelo`, () => {
      const faktoj = JSON.parse(legi(nomo, "faktoj.json")) as Facts;
      const atendo = legi(nomo, "atendo.json");
      expect(stabilaJson(k8(faktoj, cxiujModelo))).toBe(atendo);
      expect(stabilaJson(k8(faktoj, defaultModelo))).toBe(atendo);
    });
  }
});

describe("Spec 052 AC-G1: nothing loosened", () => {
  it("AUF_STUFO is still 0.5 px (D-08)", () => {
    expect(AUF_STUFO).toBe(0.5);
  });
});
