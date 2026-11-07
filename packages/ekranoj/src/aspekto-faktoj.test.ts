// The K8 facts twin of ekranoj (Spec 038 Lauf 3, 3.4b, AC-3, D-06): the normalisation cases of
// nordstelo's `k8/faktoj.test.ts` on the same raw facts, with every expected value derived here
// from the raw input by the documented rule (round to 0.01 px, first family unquoted and lower
// case, colour whitespace, sorted, without duplicates, one probe per `(eco, valoro)` with the
// smallest token) – and the guard that the two browser parts carry no module reference.

import { describe, expect, it } from "vitest";
import {
  aspektoFaktojEnPagxo,
  type FaktoAspekto,
  type FaktoAspektoKruda,
  type NativaFingrospuro,
  normigiAspektoFaktojn,
  type Sondo,
  sondojEnPagxo,
} from "./aspekto-faktoj.js";

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

/** Raw facts as the browser parts give them (nordstelo's cases): unrounded, quoted, duplicates. */
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

const MALPLENA: FaktoAspektoKruda = {
  tekstoj: [],
  nativaj: [],
  interspacoj: [],
  orientiloj: [],
  sondoj: [],
  tiparoj: [],
};

// --- The documented rule, applied here to the raw input (the expectation, never pinned) ---------

/** 0.01 px. */
const rondigi = (px: number): number => Math.round(px * 100) / 100;
/** The first entry of a family list, without its quotes, lower case. */
const familio = (listo: string): string =>
  (listo.split(",")[0] ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
/** One space after each comma, none elsewhere. */
const koloro = (valoro: string): string => valoro.replace(/\s+/g, "").replace(/,/g, ", ");
/** Equal entries once, in first-seen order. */
const unike = <T>(listo: readonly T[]): T[] => {
  const viditaj = new Set<string>();
  return listo.filter((ero) => {
    const json = JSON.stringify(ero);
    if (viditaj.has(json)) return false;
    viditaj.add(json);
    return true;
  });
};
/** Code-unit order over a key list. */
const laSxlosiloj =
  <T>(sxlosilo: (ero: T) => readonly (string | number | boolean)[]) =>
  (a: T, b: T): number => {
    const x = sxlosilo(a);
    const y = sxlosilo(b);
    for (let i = 0; i < x.length; i++) {
      const p = x[i];
      const q = y[i];
      if (p === q) continue;
      if (typeof p === "number" && typeof q === "number") return p - q;
      return String(p) < String(q) ? -1 : 1;
    }
    return 0;
  };

const normigitaSondo = (sondo: Sondo): Sondo => ({
  ...sondo,
  valoro:
    sondo.eco === "font-family"
      ? familio(sondo.valoro)
      : sondo.eco === "color"
        ? koloro(sondo.valoro)
        : String(rondigi(Number.parseFloat(sondo.valoro))),
});

/** The expected normalised facts of a raw input, by the rule above. */
function atendoDe(kruda: FaktoAspektoKruda): FaktoAspekto {
  const sondoj = new Map<string, Sondo>();
  for (const sondo of kruda.sondoj.map(normigitaSondo)) {
    const sxlosilo = `${sondo.eco}\u0000${sondo.valoro}`;
    const antaua = sondoj.get(sxlosilo);
    if (antaua === undefined || sondo.token < antaua.token) sondoj.set(sxlosilo, sondo);
  }
  const tiparoj = new Map<string, boolean>();
  for (const t of kruda.tiparoj) {
    const nomo = familio(t.familio);
    tiparoj.set(nomo, (tiparoj.get(nomo) ?? true) && t.sxargita);
  }
  return {
    tekstoj: unike(kruda.tekstoj.map((t) => ({ ...t, fontFamily: familio(t.fontFamily) }))).sort(
      laSxlosiloj((t) => [t.elemento, t.fontFamily, t.signoj]),
    ),
    nativaj: unike(
      kruda.nativaj.map(
        (n): NativaFingrospuro => ({
          ...n,
          fontFamily: familio(n.fontFamily),
          color: koloro(n.color),
          backgroundColor: koloro(n.backgroundColor),
          borderColor: [
            koloro(n.borderColor[0]),
            koloro(n.borderColor[1]),
            koloro(n.borderColor[2]),
            koloro(n.borderColor[3]),
          ],
          padding: [
            rondigi(n.padding[0]),
            rondigi(n.padding[1]),
            rondigi(n.padding[2]),
            rondigi(n.padding[3]),
          ],
          margin: [
            rondigi(n.margin[0]),
            rondigi(n.margin[1]),
            rondigi(n.margin[2]),
            rondigi(n.margin[3]),
          ],
        }),
      ),
    ).sort(laSxlosiloj((n) => [n.elemento, n.tag])),
    interspacoj: unike(kruda.interspacoj.map((i) => ({ ...i, px: rondigi(i.px) }))).sort(
      laSxlosiloj((i) => [i.gepatro, i.antaux, i.post, i.akso, i.px]),
    ),
    orientiloj: unike(kruda.orientiloj).sort(laSxlosiloj((o) => [o.elemento, o.rolo])),
    sondoj: [...sondoj.values()].sort(laSxlosiloj((s) => [s.eco, s.token, s.valoro])),
    tiparoj: Array.from(tiparoj, ([nomo, sxargita]) => ({ familio: nomo, sxargita })).sort(
      laSxlosiloj((t) => [t.familio]),
    ),
  };
}

/** A fixed permutation (no randomness): reversed, then rotated by one. */
const permuti = <T>(listo: readonly T[]): T[] => {
  const inversa = [...listo].reverse();
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

describe("normigiAspektoFaktojn, the twin (AC-3, nordstelo's cases)", () => {
  it("rounds px to 0.01", () => {
    const normigita = normigiAspektoFaktojn(KRUDA);
    const atendataj = [...new Set(KRUDA.interspacoj.map((i) => rondigi(i.px)))];
    expect([...new Set(normigita.interspacoj.map((i) => i.px))].sort()).toEqual(atendataj.sort());
    for (const kruda of KRUDA.nativaj) {
      expect(normigita.nativaj.find((n) => n.elemento === kruda.elemento)?.padding).toEqual(
        kruda.padding.map(rondigi),
      );
    }
  });

  it("gives the same JSON for the same facts in another order", () => {
    expect(JSON.stringify(normigiAspektoFaktojn(permutita(KRUDA)))).toBe(
      JSON.stringify(normigiAspektoFaktojn(KRUDA)),
    );
  });

  it("keeps the first family, unquoted, lower case", () => {
    const normigita = normigiAspektoFaktojn(KRUDA);
    expect(normigita.tekstoj.map((t) => t.fontFamily)).toEqual(
      atendoDe(KRUDA).tekstoj.map((t) => t.fontFamily),
    );
    for (const t of normigita.tekstoj) expect(t.fontFamily).toBe(t.fontFamily.toLowerCase());
    for (const t of [...normigita.tekstoj, ...normigita.nativaj]) {
      expect(t.fontFamily).not.toMatch(/["',]/);
    }
    expect(normigita.tiparoj.map((t) => t.familio)).toEqual(
      [...new Set(KRUDA.tiparoj.map((t) => familio(t.familio)))].sort(),
    );
  });

  it("removes duplicates and sorts every list by its keys", () => {
    expect(normigiAspektoFaktojn(KRUDA)).toEqual(atendoDe(KRUDA));
  });

  it("keeps one probe per (eco, valoro), the one with the smallest token name", () => {
    const { sondoj } = normigiAspektoFaktojn(KRUDA);
    expect(sondoj).toEqual(atendoDe(KRUDA).sondoj);
    const sxlosiloj = sondoj.map((sondo) => `${sondo.eco} ${sondo.valoro}`);
    expect(new Set(sxlosiloj).size).toBe(sondoj.length);
    const sameValoroj = new Set(
      KRUDA.sondoj.map(normigitaSondo).map((s) => `${s.eco} ${s.valoro}`),
    );
    expect(sondoj).toHaveLength(sameValoroj.size);
    expect(sondoj.length).toBeLessThan(KRUDA.sondoj.length);
  });

  it("keeps two probes with the same value but another eco apart", () => {
    const krudaj: Sondo[] = [
      { eco: "color", token: "b", valoro: "x" },
      { eco: "font-family", token: "a", valoro: "x" },
    ];
    const { sondoj } = normigiAspektoFaktojn({ ...MALPLENA, sondoj: krudaj });
    expect(sondoj).toEqual(krudaj);
  });

  it("keeps empty lists empty", () => {
    expect(normigiAspektoFaktojn(MALPLENA)).toEqual(MALPLENA);
  });
});

describe("browser parts (D-06: copies, no module reference)", () => {
  it.each([
    ["aspektoFaktojEnPagxo", aspektoFaktojEnPagxo.toString()],
    ["sondojEnPagxo", sondojEnPagxo.toString()],
  ])("%s refers to no module", (_nomo, fonto) => {
    expect(fonto).not.toMatch(/\bimport\b|\brequire\b|__vite_ssr|__vi_import/);
  });
});
