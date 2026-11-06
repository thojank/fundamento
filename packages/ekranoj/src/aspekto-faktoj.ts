// The K8 facts extractor of ekranoj (Spec 038 Lauf 3, 3.4b, D-06, contract C-2): a structural
// twin of nordstelo's `src/k8/faktoj.ts`, copied, never imported (AC-10 of Spec 037). Two parts run
// in the browser and one is pure:
// - `aspektoFaktojEnPagxo` runs in the screen without the frame: text runs, native-element
//   fingerprints, sibling gaps and landmarks, indexed like `Fakto.elements` (same walk, same skip
//   rule as nordstelo, index = push order, D-S038-17-3).
// - `sondojEnPagxo` runs in the probe document (only the brand stylesheets, the same `data-fm-*`):
//   the computed values of the brand's tokens and whether its font families are loaded.
// - `normigiAspektoFaktojn` rounds, normalises, sorts and dedupes both into `FaktoAspekto`.
// The browser parts are handed to `page.evaluate` as source: they reference nothing outside their
// own body. The types keep nordstelo's names, so Lauf 4 can compare both 1:1.

/**
 * The style fingerprint of one visible native element (computed values). Sides are in CSS order:
 * top, right, bottom, left.
 */
export interface NativaFingrospuro {
  /** table, a, button, input, select, textarea, h1–h6, ul, ol. */
  tag: string;
  /** Index in `Fakto.elements` (same walk and count). */
  elemento: number;
  /** The element lies inside an `fm-*` Ero (only stored). */
  enEro: boolean;
  /** First family, unquoted, lower case. */
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderColor: [string, string, string, string];
  borderStyle: [string, string, string, string];
  /** px, rounded to 0.01. */
  padding: [number, number, number, number];
  /** px, rounded to 0.01. */
  margin: [number, number, number, number];
}

/** A run of rendered own text of one element, in the font of its flat-tree parent. */
export interface Tekstero {
  elemento: number;
  /** First family, unquoted, lower case. */
  fontFamily: string;
  /** Length of the text, whitespace collapsed. */
  signoj: number;
}

/** The gap between two adjacent visible element siblings; `gepatro` -1 is body. */
export interface Interspaco {
  gepatro: number;
  antaux: number;
  post: number;
  akso: "y" | "x";
  /** px, rounded to 0.01, always > 0. */
  px: number;
}

/**
 * The browser-computed value of one brand token, measured in the probe document. One entry per
 * distinct `(eco, valoro)`, `token` the smallest name with that value. Spacing values are the px
 * number as a string with at most two decimals.
 */
export interface Sondo {
  eco: "color" | "font-family" | "spacing";
  token: string;
  valoro: string;
}

/** The K8 facts („Erscheinung“) of one render, normalised and sorted. */
export interface FaktoAspekto {
  tekstoj: Tekstero[];
  nativaj: NativaFingrospuro[];
  interspacoj: Interspaco[];
  /** Landmarks (only stored). */
  orientiloj: { rolo: string; elemento: number }[];
  sondoj: Sondo[];
  /** `document.fonts.check` per brand family of the font-family probes. */
  tiparoj: { familio: string; sxargita: boolean }[];
}
/**
 * What the browser parts return, before `normigiAspektoFaktojn`: unrounded px, families and
 * colours as computed, lists in walk order with possible duplicates. `aspektoFaktojEnPagxo` leaves
 * `sondoj`/`tiparoj` empty; the caller spreads the result of `sondojEnPagxo` over it.
 */
export interface FaktoAspektoKruda {
  tekstoj: Tekstero[];
  nativaj: NativaFingrospuro[];
  interspacoj: Interspaco[];
  orientiloj: { rolo: string; elemento: number }[];
  sondoj: Sondo[];
  tiparoj: { familio: string; sxargita: boolean }[];
}

/** One probe request (structurally nordstelo's `SondoPeto`; injected as `Taksilo.sondoPetoj`). */
export interface SondoPetoForma {
  token: string;
  css: string;
  eco: "color" | "font-family" | "spacing";
}

const ankoraux = (nomo: string): never => {
  throw new Error(`${nomo}: not implemented yet (S038-17 red)`);
};

/** Stub (S038-17 red). */
export function aspektoFaktojEnPagxo(): FaktoAspektoKruda {
  return ankoraux("aspektoFaktojEnPagxo");
}

/** Stub (S038-17 red). */
export function sondojEnPagxo(
  _petoj: SondoPetoForma[],
): Pick<FaktoAspektoKruda, "sondoj" | "tiparoj"> {
  return ankoraux("sondojEnPagxo");
}

/** Stub (S038-17 red). */
export function unuaFamilio(_listo: string): string {
  return ankoraux("unuaFamilio");
}

/** Stub (S038-17 red). */
export function normigiAspektoFaktojn(_kruda: FaktoAspektoKruda): FaktoAspekto {
  return ankoraux("normigiAspektoFaktojn");
}
