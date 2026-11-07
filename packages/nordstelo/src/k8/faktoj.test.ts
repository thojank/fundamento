// The K8 facts extractor (Spec 038 Lauf 2, 2.1, AC-L2-2): the normaliser is pure and deterministic
// (rounded to 0.01 px, first family lower case, sorted, without duplicates), `Render.k8` is
// optional (C-2), and the two browser parts carry no module references (twin in Lauf 3).

import type { Fakto } from "@fundamento/ekranoj";
import { describe, expect, it } from "vitest";
import { stabilaJson } from "../ablauf/raporto.js";
import type { Facts } from "../facts.js";
import { facts, h } from "../test-doubles/facts.js";
import { aspektoFaktojEnPagxo, normigiAspektoFaktojn, sondojEnPagxo } from "./faktoj.js";
import {
  ATENDO,
  KRUDA,
  MALPLENA,
  permutita,
  SONDOJ_ALIA_ECO,
} from "./test-doubles/aspekto-kazoj.js";

// C-2 at compile time: an ekranoj Fakto (renders without `k8`) is still a nordstelo Facts.
const fakto: Fakto = facts([h("main", {}, h("p", {}, "Team Nord"))], []);
const alFacts = (valoro: Fakto): Facts => valoro;

describe("normigiAspektoFaktojn (AC-L2-2)", () => {
  it("rounds px to 0.01 (0.005 → 0.01, 12.344 → 12.34)", () => {
    const normigita = normigiAspektoFaktojn(KRUDA);
    expect(normigita.interspacoj.map((interspaco) => interspaco.px)).toEqual(
      ATENDO.interspacoj.map((interspaco) => interspaco.px),
    );
    expect(normigita.interspacoj.map((interspaco) => interspaco.px)).toContain(0.01);
    expect(normigita.interspacoj.map((interspaco) => interspaco.px)).toContain(12.34);
    expect(normigita.nativaj.find((nativa) => nativa.elemento === 5)?.padding).toEqual([
      0.01, 12.34, 0, 5,
    ]);
  });

  it("gives the same JSON for the same facts in another order", () => {
    const unua = stabilaJson(normigiAspektoFaktojn(KRUDA));
    const dua = stabilaJson(normigiAspektoFaktojn(permutita(KRUDA)));
    expect(dua).toBe(unua);
    expect(JSON.stringify(normigiAspektoFaktojn(permutita(KRUDA)))).toBe(
      JSON.stringify(normigiAspektoFaktojn(KRUDA)),
    );
  });

  it("keeps the first family, unquoted, lower case", () => {
    const normigita = normigiAspektoFaktojn(KRUDA);
    expect(normigita.tekstoj.map((tekstero) => tekstero.fontFamily)).toEqual([
      "bar serif",
      "foo sans",
    ]);
    expect(normigita.nativaj.map((nativa) => nativa.fontFamily)).toEqual(["foo sans", "foo sans"]);
    expect(normigita.tiparoj.map((tiparo) => tiparo.familio)).toEqual(["bar serif", "foo sans"]);
  });

  it("removes duplicates and sorts every list by its keys", () => {
    expect(normigiAspektoFaktojn(KRUDA)).toEqual(ATENDO);
  });

  it("keeps one probe per (eco, valoro), the one with the smallest token name", () => {
    const { sondoj } = normigiAspektoFaktojn(KRUDA);
    expect(sondoj).toEqual(ATENDO.sondoj);
    const sxlosiloj = sondoj.map((sondo) => `${sondo.eco} ${sondo.valoro}`);
    expect(new Set(sxlosiloj).size).toBe(sondoj.length);
  });

  it("keeps two probes with the same value but another eco apart", () => {
    const { sondoj } = normigiAspektoFaktojn(SONDOJ_ALIA_ECO);
    expect(sondoj).toEqual([
      { eco: "color", token: "b", valoro: "x" },
      { eco: "font-family", token: "a", valoro: "x" },
    ]);
  });

  it("keeps empty lists empty", () => {
    expect(normigiAspektoFaktojn(MALPLENA)).toEqual(MALPLENA);
  });
});

describe("Render.k8 is optional (D-97, C-2)", () => {
  it("accepts an ekranoj Fakto without k8 as Facts", () => {
    const valoro = alFacts(fakto);
    expect(valoro.renders.length).toBeGreaterThan(0);
    expect(valoro.renders.every((render) => render.k8 === undefined)).toBe(true);
  });
});

describe("browser parts (twin in Lauf 3)", () => {
  it.each([
    ["aspektoFaktojEnPagxo", aspektoFaktojEnPagxo.toString()],
    ["sondojEnPagxo", sondojEnPagxo.toString()],
  ])("%s refers to no module", (_nomo, fonto) => {
    expect(fonto).not.toMatch(/\bimport\b|\brequire\b|__vite_ssr|__vi_import/);
  });
});
