// Gegenprobe 2.3 (Spec 038 Lauf 2, AC-L2-5): on the stored facts of two generated fixtures (D-95,
// `test/k8/generi.mjs`), K8 separates a raw screen from a Sxablono screen – `roh` is not
// k8Plena, with a substitute font and raw native elements in at least one combination; `sxablono`
// is k8Plena – and both results equal the stored `atendo.json` byte for byte. The cross-check
// „Projektion = Modelo“ (D-S038-11-2): the probed font families and spacing steps of every
// combination are the Modelo's own Sollwerte (`solojDe`).

import { readFileSync } from "node:fs";
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
import { k8, k8Plena } from "./k8.js";
import { solojDe } from "./soloj.js";

const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);

function sxargi(source: Parameters<typeof loadModelo>[0], kio: string): Modelo {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error(`${kio} must load`);
  return modelo;
}

const cxiujModelo = sxargi(projectModeloSource(CXIUJ_CONFIG), "the cxiuj-config Modelo");
const defaultModelo = sxargi(defaultModeloSource(), "the repository Modelo");

const legi = (nomo: string, dosiero: string): string =>
  readFileSync(
    fileURLToPath(new URL(`../../test/fixtures/k8/${nomo}/${dosiero}`, import.meta.url)),
    "utf8",
  );

const FIKSAJXOJ = ["roh", "sxablono"] as const;
const fiksajxo = Object.fromEntries(
  FIKSAJXOJ.map((nomo) => [
    nomo,
    { faktoj: JSON.parse(legi(nomo, "faktoj.json")) as Facts, atendo: legi(nomo, "atendo.json") },
  ]),
) as Record<(typeof FIKSAJXOJ)[number], { faktoj: Facts; atendo: string }>;

describe("Gegenprobe 2.3 (AC-L2-5)", () => {
  it("roh is not k8Plena, with a substitute font and raw native elements", () => {
    const rezulto = k8(fiksajxo.roh.faktoj, cxiujModelo);
    if (rezulto === undefined) throw new Error("roh carries K8 facts");
    expect(k8Plena(rezulto)).toBe(false);
    expect(rezulto.kombinacioj.some((k) => k.merkmaloj.ersatzschrift < 1)).toBe(true);
    expect(rezulto.kombinacioj.some((k) => k.merkmaloj.nativaj < 1)).toBe(true);
  });

  it("sxablono is k8Plena", () => {
    const rezulto = k8(fiksajxo.sxablono.faktoj, cxiujModelo);
    if (rezulto === undefined) throw new Error("sxablono carries K8 facts");
    expect(k8Plena(rezulto)).toBe(true);
  });

  it("both results equal atendo.json byte for byte", () => {
    for (const nomo of FIKSAJXOJ)
      expect(stabilaJson(k8(fiksajxo[nomo].faktoj, cxiujModelo)), nomo).toBe(fiksajxo[nomo].atendo);
  });

  it("gives the same result with the repository Modelo, which score() uses", () => {
    for (const nomo of FIKSAJXOJ)
      expect(stabilaJson(k8(fiksajxo[nomo].faktoj, defaultModelo)), nomo).toBe(
        fiksajxo[nomo].atendo,
      );
  });
});

describe("Projektion = Modelo (D-S038-11-2)", () => {
  it("probes the Modelo's font families and spacing steps in every combination", () => {
    const malobservoj: string[] = [];
    let kombinacioj = 0;
    for (const nomo of FIKSAJXOJ) {
      for (const render of fiksajxo[nomo].faktoj.renders) {
        if (render.k8 === undefined) continue;
        kombinacioj += 1;
        const soloj = solojDe(cxiujModelo, render);
        const familioj = [
          ...new Set(render.k8.sondoj.filter((s) => s.eco === "font-family").map((s) => s.valoro)),
        ].sort();
        const stupoj = [
          ...new Set(
            render.k8.sondoj.filter((s) => s.eco === "spacing").map((s) => Number(s.valoro)),
          ),
        ].sort((a, b) => a - b);
        const kie = `${nomo} ${render.aspekto}/${render.scheme}`;
        if (JSON.stringify(familioj) !== JSON.stringify(soloj.familioj))
          malobservoj.push(`${kie} families ${familioj.join()} ≠ ${soloj.familioj.join()}`);
        if (JSON.stringify(stupoj) !== JSON.stringify(soloj.interspacoj))
          malobservoj.push(`${kie} steps ${stupoj.join()} ≠ ${soloj.interspacoj.join()}`);
      }
    }
    expect(kombinacioj).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });
});
