// K8 „Erscheinung“ (Spec 038 Lauf 2, contract C-D): how close a rendered screen looks to
// Fundamento, per brand × scheme at contrast "default" (D-96). Pure: it reads only the stored K8
// facts of the renders, `facts.elements`, the Modelo's layout gaps (`listArangxoj(...).mankoj`)
// and the Sxablono instances the Modelo derives from the elements (`sxablonojElElementoj`, the
// derivation check_markup uses; Spec 038 S038-16, E-2).
//
// Every Sollwert comes from the render's own probes (D-S038-11-1): the brand's font families,
// colours and spacing steps as the browser computed them from the brand's tokens. No value is
// written here: no family, colour, length or token path.

import {
  type ArangxoCelo,
  listArangxoj,
  type Modelo,
  sxablonojElElementoj,
} from "@fundamento/modelo";
import type { Element, Facts, FaktoAspekto, Render } from "../facts.js";

export type K8Merkmal = "ersatzschrift" | "nativaj" | "interspacoj" | "sxablono";

/** The features in report order. */
export const K8_MERKMALOJ: readonly K8Merkmal[] = [
  "ersatzschrift",
  "nativaj",
  "interspacoj",
  "sxablono",
];

/** K8 of one brand × scheme. */
export interface K8Kombinacio {
  aspekto: string;
  scheme: "light" | "dark";
  /** Hit shares 0–1, rounded to 4 places (D-99). */
  merkmaloj: Record<K8Merkmal, number>;
  /** Mean of the four features, 4 places. */
  kvoto: number;
  /** One German sentence per feature (and the font-source line, if any). */
  kialoj: { merkmal: K8Merkmal; teksto: string }[];
  /** A brand family is declared but not loaded (edge case D-101); the value stays computed. */
  nekomparebla?: "tiparo-ne-sxargita";
}

/** K8 of one screen. */
export interface K8Rezulto {
  /** Mean of `kvoto` over the combinations (D-96), 4 places. */
  kvoto: number;
  /** Sorted by aspekto, then scheme. */
  kombinacioj: K8Kombinacio[];
  /** Features the Modelo has no means for (D-16, D-104); they count, but never block `k8Plena`. */
  mankoj: K8Merkmal[];
}

/** The layout purpose without a means → the feature it leaves without a means (D-104). */
export const MANKO_AL_MERKMAL: Record<
  Extract<ArangxoCelo, "row" | "column" | "stack">,
  K8Merkmal
> = {
  row: "interspacoj",
  column: "interspacoj",
  stack: "interspacoj",
};

/**
 * „Auf Stufe“: a length is on a spacing step when it lies at most this far from it, in px. This is
 * the definition of D-08 (the browser's sub-pixel layout), not a tolerance.
 */
export const AUF_STUFO = 0.5;

/** Places of every share and kvoto. */
const LOKOJ = 4;

/** Computed backgrounds that paint nothing: they pass the colour check (D-102). */
const TRAVIDEBLAJ = new Set(["transparent", "rgba(0, 0, 0, 0)"]);

/** A border side drawn with this style shows no colour (D-102). */
const SEN_RANDO = "none";

/** Tag levels of a place in a kialo. */
const PFAD_NIVELOJ = 3;

const rondigi = (valoro: number): number => {
  const faktoro = 10 ** LOKOJ;
  return Math.round(valoro * faktoro) / faktoro;
};

const mezo = (valoroj: readonly number[]): number =>
  valoroj.length === 0 ? 0 : valoroj.reduce((a, b) => a + b, 0) / valoroj.length;

const kompari = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** The distance in px, rounded to 0.01 like the facts, so that 0.5 stays 0.5. */
const distanco = (a: number, b: number): number => Math.round(Math.abs(a - b) * 100) / 100;

const surStupo = (px: number, stupoj: readonly number[]): boolean =>
  stupoj.some((stupo) => distanco(px, stupo) <= AUF_STUFO);

/** A side of padding or margin: 0, or on a spacing step. */
const flankoEnOrdo = (px: number, stupoj: readonly number[]): boolean =>
  px === 0 || surStupo(px, stupoj);

/** The place of an element as its tag path, at most three levels (`table > tr > td`). */
function pfadoDe(elementoj: readonly Element[], indekso: number): string {
  const etikedoj: string[] = [];
  let nuna = indekso;
  while (nuna >= 0 && etikedoj.length < PFAD_NIVELOJ) {
    const elemento = elementoj[nuna];
    if (elemento === undefined) break;
    etikedoj.unshift(elemento.tag);
    nuna = elemento.parent;
  }
  return etikedoj.length === 0 ? "body" : etikedoj.join(" > ");
}

const procento = (parto: number, tuto: number): number =>
  tuto === 0 ? 0 : Math.round((parto / tuto) * 100);

const germanaNombro = (nombro: number): string => String(nombro).replace(".", ",");

const NENIO = "nichts zu prüfen";
const PLENA = "vollständig";

/** The Sollwerte of one render, from its probes. */
interface Soloj {
  familioj: Set<string>;
  koloroj: Set<string>;
  stupoj: number[];
}

function solojElSondoj(fakto: FaktoAspekto): Soloj {
  const familioj = new Set<string>();
  const koloroj = new Set<string>();
  const stupoj = new Set<number>();
  for (const sondo of fakto.sondoj) {
    if (sondo.eco === "font-family") familioj.add(sondo.valoro);
    else if (sondo.eco === "color") koloroj.add(sondo.valoro);
    else {
      const px = Number.parseFloat(sondo.valoro);
      if (Number.isFinite(px)) stupoj.add(px);
    }
  }
  return { familioj, koloroj, stupoj: [...stupoj].sort((a, b) => a - b) };
}

type Rezulto = { valoro: number; teksto: string };

function ersatzschrift(fakto: FaktoAspekto, soloj: Soloj, elementoj: readonly Element[]): Rezulto {
  const tekstoj = [...fakto.tekstoj].sort(
    (a, b) => a.elemento - b.elemento || kompari(a.fontFamily, b.fontFamily) || a.signoj - b.signoj,
  );
  const tuto = tekstoj.reduce((sumo, t) => sumo + t.signoj, 0);
  if (tuto === 0) return { valoro: 1, teksto: NENIO };
  const fremdaj = tekstoj.filter((t) => !soloj.familioj.has(t.fontFamily));
  const fremdajSignoj = fremdaj.reduce((sumo, t) => sumo + t.signoj, 0);
  const unua = fremdaj[0];
  if (unua === undefined) return { valoro: 1, teksto: PLENA };
  return {
    valoro: (tuto - fremdajSignoj) / tuto,
    teksto: `${fremdaj.length} von ${tekstoj.length} Textläufen (${procento(fremdajSignoj, tuto)} % der Zeichen) in Ersatzschrift, zuerst \`${pfadoDe(elementoj, unua.elemento)}\``,
  };
}

/** What makes a native element raw (D-102), in a fixed order; empty when it is in brand style. */
function devioj(nativa: FaktoAspekto["nativaj"][number], soloj: Soloj): string[] {
  const kio: string[] = [];
  if (!soloj.familioj.has(nativa.fontFamily)) kio.push("Schrift");
  const fono = TRAVIDEBLAJ.has(nativa.backgroundColor) || soloj.koloroj.has(nativa.backgroundColor);
  const randoj = nativa.borderColor.every(
    (koloro, flanko) => nativa.borderStyle[flanko] === SEN_RANDO || soloj.koloroj.has(koloro),
  );
  if (!soloj.koloroj.has(nativa.color) || !fono || !randoj) kio.push("Farbe");
  const flankoj = [...nativa.padding, ...nativa.margin];
  if (!flankoj.every((px) => flankoEnOrdo(px, soloj.stupoj))) kio.push("Abstand");
  return kio;
}

function nativaj(fakto: FaktoAspekto, soloj: Soloj, elementoj: readonly Element[]): Rezulto {
  const listo = [...fakto.nativaj].sort((a, b) => a.elemento - b.elemento || kompari(a.tag, b.tag));
  if (listo.length === 0) return { valoro: 1, teksto: NENIO };
  const krudaj = listo
    .map((nativa) => ({ nativa, kio: devioj(nativa, soloj) }))
    .filter(({ kio }) => kio.length > 0);
  const unua = krudaj[0];
  if (unua === undefined) return { valoro: 1, teksto: PLENA };
  return {
    valoro: (listo.length - krudaj.length) / listo.length,
    teksto: `${krudaj.length} von ${listo.length} nativen Elementen roh (${unua.kio.join(", ")}), zuerst \`${pfadoDe(elementoj, unua.nativa.elemento)}\``,
  };
}

/**
 * The share of counted sibling gaps on a spacing step. A `verteilita` pair (free space an Ero or a
 * Sxablono distributes, D-052-01) is neither in the numerator nor in the denominator; the sentence
 * gets `, n verteilte Abstände nicht gezählt` for n > 0 (fixed wording, D-132, Spec 052 V-2).
 */
function interspacoj(fakto: FaktoAspekto, soloj: Soloj, elementoj: readonly Element[]): Rezulto {
  const listo = fakto.interspacoj
    .filter((interspaco) => interspaco.verteilita === undefined)
    .sort(
      (a, b) =>
        a.post - b.post ||
        a.antaux - b.antaux ||
        a.gepatro - b.gepatro ||
        kompari(a.akso, b.akso) ||
        a.px - b.px,
    );
  const verteilitaj = fakto.interspacoj.length - listo.length;
  const kun = (teksto: string): string =>
    verteilitaj > 0 ? `${teksto}, ${verteilitaj} verteilte Abstände nicht gezählt` : teksto;
  if (listo.length === 0) return { valoro: 1, teksto: kun(NENIO) };
  const ekster = listo.filter((interspaco) => !surStupo(interspaco.px, soloj.stupoj));
  const unua = ekster[0];
  if (unua === undefined) return { valoro: 1, teksto: kun(PLENA) };
  return {
    valoro: (listo.length - ekster.length) / listo.length,
    teksto: kun(
      `${ekster.length} von ${listo.length} Geschwisterabständen nicht auf einer Abstandsstufe, zuerst \`${pfadoDe(elementoj, unua.post)}\` (${germanaNombro(unua.px)} px)`,
    ),
  };
}

/**
 * 1 when a Sxablono instance, as the Modelo derives them (`sxablonojElElementoj`, the one
 * derivation check_markup uses, MG-5), has at least one region filled; the kialo names the path of
 * the element of the first such instance in document order.
 */
function sxablono(facts: Facts, modelo: Modelo): Rezulto {
  const unua = sxablonojElElementoj(facts.elements, modelo).find(
    ({ instanco }) => Object.keys(instanco.regions ?? {}).length > 0,
  );
  if (unua !== undefined)
    return { valoro: 1, teksto: `${PLENA}: \`${pfadoDe(facts.elements, unua.elemento)}\`` };
  return { valoro: 0, teksto: "keine Sxablono mit erkannter Region im Markup" };
}

function kombinacio(
  render: Render & { k8: FaktoAspekto },
  facts: Facts,
  sxablonoRezulto: Rezulto,
): K8Kombinacio {
  const fakto = render.k8;
  const soloj = solojElSondoj(fakto);
  const rezultoj: Record<K8Merkmal, Rezulto> = {
    ersatzschrift: ersatzschrift(fakto, soloj, facts.elements),
    nativaj: nativaj(fakto, soloj, facts.elements),
    interspacoj: interspacoj(fakto, soloj, facts.elements),
    sxablono: sxablonoRezulto,
  };
  const merkmaloj = {
    ersatzschrift: rondigi(rezultoj.ersatzschrift.valoro),
    nativaj: rondigi(rezultoj.nativaj.valoro),
    interspacoj: rondigi(rezultoj.interspacoj.valoro),
    sxablono: rondigi(rezultoj.sxablono.valoro),
  };
  const nesxargitaj = [
    ...new Set(
      fakto.tiparoj
        .filter((tiparo) => !tiparo.sxargita && soloj.familioj.has(tiparo.familio))
        .map((tiparo) => tiparo.familio),
    ),
  ].sort(kompari);
  const kialoj: K8Kombinacio["kialoj"] = [];
  for (const merkmal of K8_MERKMALOJ) {
    kialoj.push({ merkmal, teksto: rezultoj[merkmal].teksto });
    if (merkmal === "ersatzschrift" && nesxargitaj.length > 0)
      kialoj.push({
        merkmal,
        teksto: `Schriftquelle nicht erreichbar: ${nesxargitaj.join(", ")}`,
      });
  }
  return {
    aspekto: render.aspekto,
    scheme: render.scheme,
    merkmaloj,
    kvoto: rondigi(mezo(K8_MERKMALOJ.map((merkmal) => merkmaloj[merkmal]))),
    kialoj,
    ...(nesxargitaj.length > 0 ? { nekomparebla: "tiparo-ne-sxargita" as const } : {}),
  };
}

const havasK8 = (render: Render): render is Render & { k8: FaktoAspekto } =>
  render.contrast === "default" && render.k8 !== undefined;

/** The features the Modelo has no means for, in feature order (D-104). */
function mankojDe(modelo: Modelo): K8Merkmal[] {
  const celoj = new Set<string>(listArangxoj(modelo).mankoj.map(({ celo }) => celo));
  const merkmaloj = new Set(
    Object.entries(MANKO_AL_MERKMAL)
      .filter(([celo]) => celoj.has(celo))
      .map(([, merkmal]) => merkmal),
  );
  return K8_MERKMALOJ.filter((merkmal) => merkmaloj.has(merkmal));
}

/**
 * K8 of a screen: per render with K8 facts at contrast "default" (sorted by aspekto, scheme) the
 * four hit shares, their mean, and the reasons; `undefined` when no render carries K8 facts
 * (D-98: „nicht geprüft“).
 */
export function k8(facts: Facts, modelo: Modelo): K8Rezulto | undefined {
  const renders = facts.renders
    .filter(havasK8)
    .sort(
      (a, b) =>
        kompari(a.aspekto, b.aspekto) ||
        kompari(a.scheme, b.scheme) ||
        kompari(JSON.stringify(a.k8), JSON.stringify(b.k8)),
    );
  if (renders.length === 0) return undefined;
  const sxablonoRezulto = sxablono(facts, modelo);
  const kombinacioj = renders.map((render) => kombinacio(render, facts, sxablonoRezulto));
  return {
    kvoto: rondigi(mezo(kombinacioj.map((k) => k.kvoto))),
    kombinacioj,
    mankoj: mankojDe(modelo),
  };
}

/** D-105: every feature is 1 in every combination, except the features in `mankoj`. */
export function k8Plena(rezulto: K8Rezulto): boolean {
  const mankoj = new Set(rezulto.mankoj);
  return rezulto.kombinacioj.every((k) =>
    K8_MERKMALOJ.every((merkmal) => mankoj.has(merkmal) || k.merkmaloj[merkmal] === 1),
  );
}
