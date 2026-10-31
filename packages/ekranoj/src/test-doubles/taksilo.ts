// A scorer double (C-3): the n-th score of a screen is the n-th round of that screen (green screens
// are not scored again), and a function decides what the round gets.

import type { Fakto, PlanoEkrano, Taksado, Taksilo, Varianto } from "../tipoj.js";
import { taksado } from "./faktoj.js";

export type Decido = (slug: string, rondo: number) => Taksado;

/** Green on every criterion D-04 asks of the score. */
export const VERDA: Taksado = taksado();

/** Not green: K5 = 0 because of a raw value and a rebuilt Ero. */
export const MALVERDA: Taksado = {
  k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 0, K6: null },
  total: 70,
  mankoj: [
    { kind: "raw-value", key: "color" },
    { kind: "rebuilt-ero", key: "button" },
  ],
};

export class TaksiloDouble implements Taksilo {
  readonly vokoj: { slug: string; rondo: number; varianto: Varianto; fakto: Fakto }[] = [];
  readonly #decido: Decido;
  readonly #nombroj = new Map<string, number>();

  constructor(decido: Decido) {
    this.#decido = decido;
  }

  taksi(e: { fakto: Fakto; ekrano: PlanoEkrano; varianto: Varianto }): Taksado {
    const rondo = (this.#nombroj.get(e.ekrano.slug) ?? 0) + 1;
    this.#nombroj.set(e.ekrano.slug, rondo);
    this.vokoj.push({ slug: e.ekrano.slug, rondo, varianto: e.varianto, fakto: e.fakto });
    return this.#decido(e.ekrano.slug, rondo);
  }
}

/** Never green. */
export const neniamVerda = (): TaksiloDouble => new TaksiloDouble(() => MALVERDA);
/** Green from round `n` on. */
export const verdaEkde = (n: number): TaksiloDouble =>
  new TaksiloDouble((_slug, rondo) => (rondo >= n ? VERDA : MALVERDA));
