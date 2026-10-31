// The score of a flow „ganzer Ablauf“ per screen (Spec 037, Lieferliste 2.2): K1–K6 from the
// injected scorer (C-3; in the measurement the nordstelo adapter over the unchanged `score()` with
// the weights of the Modelo catalogue, C-8), the navigation from ekranoj (D-05, C-4) and the
// patterns (D-06). Navigation and patterns are separate columns, never mixed into `total`; K7, the
// effort, is reported by the run beside the score. Pure apart from reading stored runs (D-33):
// the same facts give the same result (AC-11).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type EkranaNavigado,
  type Fakto,
  type Kriterio,
  type NavigadoRezulto,
  navigado,
  type Plano,
  type Taksado,
  type Taksilo,
  type Varianto,
} from "@fundamento/ekranoj";
import {
  defaultModeloSource,
  type Modelo,
  type NordsteloFile,
  readNordstelo,
} from "@fundamento/modelo";
import { type AblaufTasko, planoDe } from "./katalogo.js";
import { type EkranaSxablono, type SxablonojRezulto, sxablonojSamaj } from "./sxablonoj-samaj.js";

const KRITERIOJ: readonly Kriterio[] = ["K1", "K2", "K3", "K4", "K5", "K6"];

const round1 = (value: number): number => Math.round(value * 10) / 10;
const round4 = (value: number): number => Math.round(value * 10000) / 10000;

/**
 * The catalogue of the north-star measure as the Modelo holds it (`data/nordstelo.json`): the
 * weights of K1–K6 and the gate come from there, never from a copy.
 */
export function legiKatalogon(dataDir: string = defaultModeloSource().dataDir): NordsteloFile {
  const katalogo = readNordstelo(dataDir);
  if (katalogo === undefined) {
    throw new Error(`Kein Aufgabenkatalog der Kennzahl unter ${dataDir} (nordstelo.json fehlt).`);
  }
  return katalogo;
}

/**
 * The facts as the navigation (D-05) reads them. ekranoj reads a link from `href`; an Ero whose
 * Skemo says it is a link (a11y role `link`) carries its target in its one required string prop
 * instead (the Modelo's fm-ligilo: no href). That target is copied to `href` of a copy of the
 * element, so a link written correctly with Fundamento counts; the stored facts stay unchanged.
 * Prop and role come from the Modelo, nothing is typed here.
 */
export function faktojPorNavigado(
  faktoj: Readonly<Record<string, Fakto>>,
  modelo: Modelo,
): Record<string, Fakto> {
  const targets = new Map<string, string>();
  for (const entry of modelo.eroj) {
    if (entry.skemo.a11y.role !== "link") continue;
    const target = entry.skemo.props.filter((prop) => prop.kind === "string" && prop.required);
    if (target.length === 1 && target[0] !== undefined)
      targets.set(`fm-${entry.ero.name}`, target[0].name);
  }
  const result: Record<string, Fakto> = {};
  for (const [slug, fakto] of Object.entries(faktoj)) {
    result[slug] = {
      ...fakto,
      elements: fakto.elements.map((element) => {
        const prop = targets.get(element.tag);
        const value = prop === undefined ? undefined : element.attrs[prop];
        return value === undefined || element.attrs.href !== undefined
          ? element
          : { ...element, attrs: { ...element.attrs, href: value } };
      }),
    };
  }
  return result;
}

/** One screen of one round. */
export interface EkranaPoento {
  varianto: Varianto;
  /** K1–K6 and the weighted total; null when the screen was not built (no facts). */
  taksado: Taksado | null;
  /** D-05 for this screen (planned edges present, no dead link). */
  navigado: EkranaNavigado;
  /** D-06 of the flow, as it concerns this screen. */
  sxablonoj: EkranaSxablono;
}

/** The flow in one round: per screen and the summary; navigation and patterns beside the total. */
export interface FluaPoento {
  tasko: string;
  varianto: Varianto;
  /** Per screen slug, in plan order. */
  ekranoj: Record<string, EkranaPoento>;
  navigado: NavigadoRezulto;
  sxablonoj: SxablonojRezulto;
  sumo: {
    /** Built screens of the planned ones. */
    konstruitaj: number;
    planitaj: number;
    /** Mean total over the planned screens; a screen that was not built counts 0. */
    total: number;
    /** Mean per criterion over the built screens where it applies; null where it never does. */
    k: Record<Kriterio, number | null>;
    /** D-05 share of the flow (separate column). */
    navigado: number;
    /** D-06 share of the flow (separate column). */
    sxablonoj: number;
  };
}

export interface PoentiEnigo {
  tasko: AblaufTasko;
  varianto: Varianto;
  /** Facts per screen slug; a planned screen without facts was not built. */
  faktoj: Readonly<Record<string, Fakto>>;
  taksilo: Taksilo;
  modelo: Modelo;
}

/** Scores one round of one flow. */
export function poentiFluon(enigo: PoentiEnigo): FluaPoento {
  const { tasko, varianto, faktoj, taksilo, modelo } = enigo;
  const plano = planoDe(tasko);
  const nav = navigado(plano, faktojPorNavigado(faktoj, modelo));
  const sxablonoj = sxablonojSamaj({ plano, faktoj, varianto, modelo });

  const ekranoj: Record<string, EkranaPoento> = {};
  for (const ekrano of plano.ekranoj) {
    const fakto = Object.hasOwn(faktoj, ekrano.slug) ? faktoj[ekrano.slug] : undefined;
    ekranoj[ekrano.slug] = {
      varianto,
      taksado: fakto === undefined ? null : taksilo.taksi({ fakto, ekrano, varianto }),
      navigado: nav.perEkrano[ekrano.slug] ?? { kompleta: false, mankantaj: [], mortaj: [] },
      sxablonoj: sxablonoj.perEkrano[ekrano.slug] ?? { celoj: [], neunuecaj: [], unueca: true },
    };
  }

  const scored = Object.values(ekranoj).flatMap((poento) =>
    poento.taksado === null ? [] : [poento.taksado],
  );
  const k = {} as Record<Kriterio, number | null>;
  for (const kriterio of KRITERIOJ) {
    const values = scored.flatMap((taksado) => {
      const value = taksado.k[kriterio];
      return value === null ? [] : [value];
    });
    k[kriterio] =
      values.length === 0 ? null : round4(values.reduce((a, b) => a + b, 0) / values.length);
  }
  const planitaj = plano.ekranoj.length;
  const total =
    planitaj === 0 ? 0 : round1(scored.reduce((sum, taksado) => sum + taksado.total, 0) / planitaj);

  return {
    tasko: tasko.slug,
    varianto,
    ekranoj,
    navigado: nav,
    sxablonoj,
    sumo: {
      konstruitaj: scored.length,
      planitaj,
      total,
      k,
      navigado: round4(nav.kvoto),
      sxablonoj: round4(sxablonoj.kvoto),
    },
  };
}

/** A stored run of one flow and variant (D-33): its plan and the facts of every round. */
export interface StokitaKuro {
  plano: Plano;
  /** Round number (as written in the folder) → facts per screen slug. */
  rondoj: Record<string, Record<string, Fakto>>;
}

const FAKTO = ".fakto.json";

/** Reads `plano.json` and `rondoj/<n>/<slug>.fakto.json` of a run folder; rounds in number order. */
export function legiKuron(dir: string): StokitaKuro {
  const plano = JSON.parse(readFileSync(join(dir, "plano.json"), "utf8")) as Plano;
  const rondoj: Record<string, Record<string, Fakto>> = {};
  const rondojDir = join(dir, "rondoj");
  const numbers = existsSync(rondojDir)
    ? readdirSync(rondojDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
        .map((entry) => entry.name)
        .sort((a, b) => Number(a) - Number(b))
    : [];
  for (const n of numbers) {
    const faktoj: Record<string, Fakto> = {};
    const files = readdirSync(join(rondojDir, n))
      .filter((name) => name.endsWith(FAKTO))
      .sort();
    for (const file of files) {
      faktoj[file.slice(0, -FAKTO.length)] = JSON.parse(
        readFileSync(join(rondojDir, n, file), "utf8"),
      ) as Fakto;
    }
    rondoj[n] = faktoj;
  }
  return { plano, rondoj };
}

/** Every round of a stored run, scored. */
export interface KuraPoento {
  tasko: string;
  varianto: Varianto;
  rondoj: Record<string, FluaPoento>;
}

/** Scores every round of a stored run of `tasko` in `varianto`. */
export function poentiKuron(
  enigo: Omit<PoentiEnigo, "faktoj"> & { kuro: StokitaKuro },
): KuraPoento {
  const rondoj: Record<string, FluaPoento> = {};
  for (const [n, faktoj] of Object.entries(enigo.kuro.rondoj)) {
    rondoj[n] = poentiFluon({ ...enigo, faktoj });
  }
  return { tasko: enigo.tasko.slug, varianto: enigo.varianto, rondoj };
}
