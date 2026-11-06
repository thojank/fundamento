// The K8 facts extractor (Spec 038 Lauf 2, 2.1, AC-L2-2): the normaliser is pure and deterministic
// (rounded to 0.01 px, first family lower case, sorted, without duplicates), `Render.k8` is
// optional (C-2), and the two browser parts carry no module references (twin in Lauf 3).

import type { Fakto } from "@fundamento/ekranoj";
import { describe, expect, it } from "vitest";
import { stabilaJson } from "../ablauf/raporto.js";
import type { Facts, FaktoAspekto, NativaFingrospuro } from "../facts.js";
import { facts, h } from "../test-doubles/facts.js";
import {
  aspektoFaktojEnPagxo,
  type FaktoAspektoKruda,
  normigiAspektoFaktojn,
  sondojEnPagxo,
} from "./faktoj.js";

const KOLORO = "rgb(10, 20, 30)";
const TRAVIDEBLA = "rgba(0, 0, 0, 0)";

const fingrospuro = (
  elemento: number,
  aliaj: Partial<NativaFingrospuro> = {},
): NativaFingrospuro => ({
  tag: "button",
  elemento,
  enEro: false,
  fontFamily: '"Foo Sans", system-ui',
  color: KOLORO,
  backgroundColor: TRAVIDEBLA,
  borderColor: [KOLORO, KOLORO, KOLORO, KOLORO],
  borderStyle: ["none", "none", "none", "none"],
  padding: [0, 0, 0, 0],
  margin: [0, 0, 0, 0],
  ...aliaj,
});

/** Raw facts as the browser parts give them: unrounded, quoted families, walk order, duplicates. */
const KRUDA: FaktoAspektoKruda = {
  tekstoj: [
    { elemento: 4, fontFamily: '"Foo Sans", system-ui', signoj: 7 },
    { elemento: 1, fontFamily: "'Bar Serif', serif", signoj: 3 },
    { elemento: 4, fontFamily: '"Foo Sans", system-ui', signoj: 7 },
  ],
  nativaj: [
    fingrospuro(5, {
      tag: "a",
      enEro: true,
      color: "rgb(10,  20,30)",
      padding: [0.005, 12.344, 0, 4.996],
      margin: [1.125, 0, 0, 0],
    }),
    fingrospuro(2),
    fingrospuro(2),
  ],
  interspacoj: [
    { gepatro: 0, antaux: 1, post: 2, akso: "y", px: 12.344 },
    { gepatro: -1, antaux: 0, post: 3, akso: "y", px: 0.005 },
    { gepatro: 0, antaux: 1, post: 2, akso: "y", px: 12.344 },
    { gepatro: 0, antaux: 1, post: 2, akso: "x", px: 8 },
  ],
  orientiloj: [
    { rolo: "navigation", elemento: 3 },
    { rolo: "main", elemento: 0 },
    { rolo: "navigation", elemento: 3 },
  ],
  sondoj: [
    { eco: "spacing", token: "spacing.m", valoro: "16" },
    { eco: "color", token: "color.b", valoro: "rgb(1,  2, 3)" },
    { eco: "spacing", token: "spacing.4", valoro: "16.004" },
    { eco: "font-family", token: "font.family.body", valoro: '"Foo Sans", system-ui' },
    { eco: "color", token: "color.a", valoro: " rgb(1, 2, 3)" },
    { eco: "color", token: "color.c", valoro: "rgb(4, 5, 6)" },
    { eco: "font-family", token: "font.family.aa", valoro: "'Foo Sans'" },
  ],
  tiparoj: [
    { familio: "Foo Sans", sxargita: true },
    { familio: '"Bar Serif"', sxargita: false },
    { familio: "Foo Sans", sxargita: true },
  ],
};

/** The expected normalised facts of `KRUDA`. */
const ATENDO: FaktoAspekto = {
  tekstoj: [
    { elemento: 1, fontFamily: "bar serif", signoj: 3 },
    { elemento: 4, fontFamily: "foo sans", signoj: 7 },
  ],
  nativaj: [
    { ...fingrospuro(2), fontFamily: "foo sans" },
    {
      ...fingrospuro(5),
      tag: "a",
      enEro: true,
      fontFamily: "foo sans",
      padding: [0.01, 12.34, 0, 5],
      margin: [1.13, 0, 0, 0],
    },
  ],
  interspacoj: [
    { gepatro: -1, antaux: 0, post: 3, akso: "y", px: 0.01 },
    { gepatro: 0, antaux: 1, post: 2, akso: "x", px: 8 },
    { gepatro: 0, antaux: 1, post: 2, akso: "y", px: 12.34 },
  ],
  orientiloj: [
    { rolo: "main", elemento: 0 },
    { rolo: "navigation", elemento: 3 },
  ],
  sondoj: [
    { eco: "color", token: "color.a", valoro: "rgb(1, 2, 3)" },
    { eco: "color", token: "color.c", valoro: "rgb(4, 5, 6)" },
    { eco: "font-family", token: "font.family.aa", valoro: "foo sans" },
    { eco: "spacing", token: "spacing.4", valoro: "16" },
  ],
  tiparoj: [
    { familio: "bar serif", sxargita: false },
    { familio: "foo sans", sxargita: true },
  ],
};

/** A fixed permutation (no randomness): reversed, then rotated by one. */
const permuti = <T>(list: readonly T[]): T[] => {
  const inversa = [...list].reverse();
  return [...inversa.slice(1), ...inversa.slice(0, 1)];
};

const permutita = (kruda: FaktoAspektoKruda): FaktoAspektoKruda => ({
  tekstoj: permuti(kruda.tekstoj),
  nativaj: permuti(kruda.nativaj),
  interspacoj: permuti(kruda.interspacoj),
  orientiloj: permuti(kruda.orientiloj),
  sondoj: permuti(kruda.sondoj),
  tiparoj: permuti(kruda.tiparoj),
});

const MALPLENA: FaktoAspektoKruda = {
  tekstoj: [],
  nativaj: [],
  interspacoj: [],
  orientiloj: [],
  sondoj: [],
  tiparoj: [],
};

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
    const { sondoj } = normigiAspektoFaktojn({
      ...MALPLENA,
      sondoj: [
        { eco: "color", token: "b", valoro: "x" },
        { eco: "font-family", token: "a", valoro: "x" },
      ],
    });
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
