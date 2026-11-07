// The normalisation cases of the K8 facts (Spec 038 Lauf 2, AC-L2-2): raw facts as the browser
// parts give them and the expected normalised facts. Shared by `faktoj.test.ts` and the twin test
// `zwilling.test.ts` (S038-29, T-2), which runs the same cases through both packages.

import type { FaktoAspekto, NativaFingrospuro } from "../../facts.js";
import type { FaktoAspektoKruda } from "../faktoj.js";

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
export const KRUDA: FaktoAspektoKruda = {
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
export const ATENDO: FaktoAspekto = {
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

export const permutita = (kruda: FaktoAspektoKruda): FaktoAspektoKruda => ({
  tekstoj: permuti(kruda.tekstoj),
  nativaj: permuti(kruda.nativaj),
  interspacoj: permuti(kruda.interspacoj),
  orientiloj: permuti(kruda.orientiloj),
  sondoj: permuti(kruda.sondoj),
  tiparoj: permuti(kruda.tiparoj),
});

export const MALPLENA: FaktoAspektoKruda = {
  tekstoj: [],
  nativaj: [],
  interspacoj: [],
  orientiloj: [],
  sondoj: [],
  tiparoj: [],
};

/** Two probes with the same value but another eco (a case of its own in `faktoj.test.ts`). */
export const SONDOJ_ALIA_ECO: FaktoAspektoKruda = {
  ...MALPLENA,
  sondoj: [
    { eco: "color", token: "b", valoro: "x" },
    { eco: "font-family", token: "a", valoro: "x" },
  ],
};

/** Every normalisation case of `faktoj.test.ts`, by name. */
export const NORMIGAJ_KAZOJ: readonly (readonly [string, FaktoAspektoKruda])[] = [
  ["KRUDA", KRUDA],
  ["KRUDA permutita", permutita(KRUDA)],
  ["MALPLENA", MALPLENA],
  ["SONDOJ_ALIA_ECO", SONDOJ_ALIA_ECO],
];
