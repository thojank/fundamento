// Determinism of K8 (Spec 038 Lauf 2, AC-L2-4): on the stored fixtures, k8 gives the same bytes
// twice, for a structured clone, and for renders and every K8 list in another order (a fixed
// seed, no Math.random); one combination per Aspekto × scheme of the renderer.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadModelo, type Modelo, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { stabilaJson } from "../ablauf/raporto.js";
import type { Facts, FaktoAspekto } from "../facts.js";
import { ASPEKTOJ, SCHEMES } from "../render.js";
import { k8 } from "./k8.js";

const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
const { modelo: ladita } = loadModelo(projectModeloSource(CXIUJ_CONFIG));
if (ladita === undefined) throw new Error("the cxiuj-config Modelo must load");
const modelo: Modelo = ladita;

// Every generated K8 fixture (Spec 052 K8I-006: also the M-1 fixtures and the counter-probes, some
// with verteilita pairs), derived from the fixture folder, not listed by hand.
const K8_FIKSAJXOJ = fileURLToPath(new URL("../../test/fixtures/k8/", import.meta.url));
const FIKSAJXOJ = readdirSync(K8_FIKSAJXOJ, { withFileTypes: true })
  .filter((ero) => ero.isDirectory())
  .map((ero) => ero.name)
  .sort();
const faktojDe = (nomo: string): Facts =>
  JSON.parse(readFileSync(join(K8_FIKSAJXOJ, nomo, "faktoj.json"), "utf8")) as Facts;

/** A seeded generator (mulberry32): the same permutation on every run. */
function hazardo(semo: number): () => number {
  let a = semo >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function miksi<T>(listo: readonly T[], sekva: () => number): T[] {
  const kopio = [...listo];
  for (let i = kopio.length - 1; i > 0; i--) {
    const j = Math.floor(sekva() * (i + 1));
    const [x, y] = [kopio[i], kopio[j]];
    if (x === undefined || y === undefined) continue;
    kopio[i] = y;
    kopio[j] = x;
  }
  return kopio;
}

function miksitajFaktoj(faktoj: Facts, semo: number): Facts {
  const sekva = hazardo(semo);
  const miksiK8 = (f: FaktoAspekto): FaktoAspekto => ({
    tekstoj: miksi(f.tekstoj, sekva),
    nativaj: miksi(f.nativaj, sekva),
    interspacoj: miksi(f.interspacoj, sekva),
    orientiloj: miksi(f.orientiloj, sekva),
    sondoj: miksi(f.sondoj, sekva),
    tiparoj: miksi(f.tiparoj, sekva),
  });
  return {
    ...faktoj,
    renders: miksi(faktoj.renders, sekva).map((render) =>
      render.k8 === undefined ? render : { ...render, k8: miksiK8(render.k8) },
    ),
  };
}

describe("k8 is deterministic (AC-L2-4)", () => {
  it("covers every generated K8 fixture, those with verteilita pairs among them", () => {
    expect(FIKSAJXOJ).toEqual(expect.arrayContaining(["roh", "sxablono", "konto-m1"]));
    const kunVerteilita = FIKSAJXOJ.filter((nomo) =>
      faktojDe(nomo).renders.some((render) =>
        render.k8?.interspacoj.some((interspaco) => interspaco.verteilita !== undefined),
      ),
    );
    expect(kunVerteilita.length).toBeGreaterThan(0);
  });

  for (const nomo of FIKSAJXOJ) {
    const faktoj = faktojDe(nomo);

    it(`${nomo}: the same bytes twice and for a structured clone`, () => {
      const unua = stabilaJson(k8(faktoj, modelo));
      expect(stabilaJson(k8(faktoj, modelo))).toBe(unua);
      expect(stabilaJson(k8(structuredClone(faktoj), modelo))).toBe(unua);
    });

    it(`${nomo}: the same bytes for renders and lists in another order`, () => {
      const unua = stabilaJson(k8(faktoj, modelo));
      const malsamaj: number[] = [];
      for (const semo of [1, 2, 3, 38, 2026]) {
        const miksita = miksitajFaktoj(faktoj, semo);
        if (stabilaJson(k8(miksita, modelo)) !== unua) malsamaj.push(semo);
      }
      expect(malsamaj).toEqual([]);
    });

    it(`${nomo}: one combination per Aspekto × scheme`, () => {
      const kombinacioj = k8(faktoj, modelo)?.kombinacioj ?? [];
      expect(kombinacioj).toHaveLength(ASPEKTOJ.length * SCHEMES.length);
      const atenditaj = ASPEKTOJ.flatMap((aspekto) => SCHEMES.map((s) => `${aspekto}/${s}`));
      expect(kombinacioj.map((k) => `${k.aspekto}/${k.scheme}`).sort()).toEqual(
        [...atenditaj].sort(),
      );
    });
  }
});
