// The K8 facts extractor (Spec 038 Lauf 2, 2.1, contract C-C). Red stub: signatures only.

import type { FaktoAspekto, Interspaco, NativaFingrospuro, Sondo, Tekstero } from "../facts.js";

/**
 * What the browser parts return, before `normigiAspektoFaktojn`: unrounded px, families and
 * colours as computed, lists in walk order with possible duplicates.
 */
export interface FaktoAspektoKruda {
  tekstoj: Tekstero[];
  nativaj: NativaFingrospuro[];
  interspacoj: Interspaco[];
  orientiloj: { rolo: string; elemento: number }[];
  sondoj: Sondo[];
  tiparoj: { familio: string; sxargita: boolean }[];
}

/** One probe request (structurally `SondoPeto` of `soloj.ts`, contract C-B). */
export interface SondoPetoForma {
  token: string;
  css: string;
  eco: "color" | "font-family" | "spacing";
}

export function aspektoFaktojEnPagxo(): FaktoAspektoKruda {
  return { tekstoj: [], nativaj: [], interspacoj: [], orientiloj: [], sondoj: [], tiparoj: [] };
}

export function sondojEnPagxo(
  petoj: SondoPetoForma[],
): Pick<FaktoAspektoKruda, "sondoj" | "tiparoj"> {
  void petoj;
  return { sondoj: [], tiparoj: [] };
}

export function normigiAspektoFaktojn(kruda: FaktoAspektoKruda): FaktoAspekto {
  void kruda;
  throw new Error("S038-10: not implemented");
}
