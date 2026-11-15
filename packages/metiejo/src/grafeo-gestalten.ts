// Spec 054 (MP-1, T1): the Bildo of the view Gestalten from the stored Agordo and the derivation
// of the effective Agordo, and the effective Agordo itself from the session's `kabloj` (E-11).
// Pure: no I/O, no clock, no check – the Bildo carries no Regulo, no report and no problem count
// (E-1). The shared types and rules live import-free in grafeo-gestalten-sicht.ts for the bundle.

import {
  type Agordo,
  CALIBRATED_RAMP,
  type DerivedPalettes,
  type DerivedStep,
  derivationBasis,
  REFERENCE_STEPS,
} from "@fundamento/agordilo";
import { serializeCanonicalJson } from "@fundamento/modelo";
import {
  type Bildo,
  type BildoFarbo,
  type BildoLigo,
  type BildoNodo,
  FARBO_ROLOJ,
  FAZOJ,
  type FarboRolo,
  type Kabloj,
  ligoId,
  ROLO_ETIKEDOJ,
  ROLO_PALETRO,
  STATUS_ROLOJ,
  type Stufo,
  type Vico,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import { hexOf } from "./sxtupoj.js";
import type { Bases } from "./vorschau.js";

export * from "./grafeo-gestalten-sicht.js";

/** What `gestaltenDe` needs besides the stored Agordo. */
export interface GestaltenEingaben {
  /** `startAgordo(name, "leer")`: its lead colour is the start value of Primär. */
  start: Agordo;
  /** The effective view this Bildo answers for; {} = as in the Agordo. */
  kabloj: Kabloj;
  /** `derivePalettes` + `withFestgelegtSteps` of the effective Agordo; undefined when it failed. */
  palettes: DerivedPalettes | undefined;
  /** The draft's revision, for the preview addresses. */
  rev: number;
}

/** The canonical JSON of a Bildo: the bytes `/api/leinwand` answers and the tests compare. */
export function serializeBildo(bildo: Bildo): string {
  return serializeCanonicalJson(bildo);
}

/**
 * The palettes of an (effective) Agordo as the preview derives them – derivation basis with the
 * steps the brand set – or undefined when the derivation throws (`Bildo.ableitung = "fehlt"`).
 */
export function paletrojDe(agordo: Agordo, bases: Bases): DerivedPalettes | undefined {
  try {
    return derivationBasis(agordo, bases.structure, bases.calibration).palettes;
  } catch {
    return undefined;
  }
}

/** The colour value a node holds in the stored Agordo; Neutral holds none. */
function wertDe(agordo: Agordo, rolo: FarboRolo): string | undefined {
  if (rolo === "primaer") return agordo.leitfarbe;
  if (rolo === "akzent") return agordo.zweitfarbe?.farbe;
  if (rolo === "neutral") return undefined;
  return agordo.zusatzfarben?.[rolo];
}

/**
 * The effective Agordo for `kabloj` (tech spec, table „Wirksamer Agordo“): per row the value of its
 * source node in the stored Agordo, or what the row falls back to without one – Primär the start
 * value, Akzent no Zweitfarbe, a Funktionsfarbe no field, Neutral no Tönung. A source without a
 * value, or of the wrong kind, counts as null. `festgelegt` and every other field stay as they are;
 * the input is never changed.
 */
export function wirksamerAgordo(agordo: Agordo, start: Agordo, kabloj: Kabloj): Agordo {
  let next: Agordo = { ...agordo };
  for (const ziel of FARBO_ROLOJ) {
    const quelle = kabloj[ziel];
    if (quelle === undefined) continue;
    if (ziel === "neutral") {
      if (quelle === "neutral") continue;
      const { toenung: _gone, ...neutral } = next.neutral ?? {};
      const { neutral: _old, ...rest } = next;
      next = Object.keys(neutral).length === 0 ? rest : { ...rest, neutral };
      continue;
    }
    const wert = quelle === null ? undefined : wertDe(agordo, quelle);
    if (ziel === "primaer") {
      next = { ...next, leitfarbe: wert ?? start.leitfarbe };
    } else if (ziel === "akzent") {
      const { zweitfarbe: _old, ...rest } = next;
      next = wert === undefined ? rest : { ...rest, zweitfarbe: { farbe: wert } };
    } else {
      const { [ziel]: _old, ...zusatz } = next.zusatzfarben ?? {};
      const zusatzfarben = wert === undefined ? zusatz : { ...zusatz, [ziel]: wert };
      const { zusatzfarben: _gone, ...rest } = next;
      next = Object.keys(zusatzfarben).length === 0 ? rest : { ...rest, zusatzfarben };
    }
  }
  return next;
}

const stepsOf = (palettes: DerivedPalettes | undefined, palette: string): DerivedStep[] =>
  palettes?.steps.filter((step) => step.palette === palette) ?? [];

/** The light hex of one derived step, or "" when there is none. */
const stepHex = (palettes: DerivedPalettes | undefined, palette: string, step: string): string =>
  palettes?.steps.find((entry) => entry.palette === palette && entry.step === step)?.hex ?? "";

/** The colour nodes from the stored Agordo: Primär, Akzent, Neutral, then the Funktionsfarben it has. */
function farbojDe(
  agordo: Agordo,
  start: Agordo,
  palettes: DerivedPalettes | undefined,
): BildoFarbo[] {
  const nodo = (rolo: FarboRolo, rest: Omit<BildoFarbo, "id" | "speco" | "fazo" | "rolo">) =>
    ({ id: `farbo-${rolo}`, speco: "farbo", fazo: "fazo-4", rolo, ...rest }) as BildoFarbo;
  const out: BildoFarbo[] = [
    nodo("primaer", {
      wert: agordo.leitfarbe,
      hex: hexOf(agordo.leitfarbe),
      stato: agordo.leitfarbe === start.leitfarbe ? "startwert" : "von-hand",
      elir: "farbo",
    }),
  ];
  const zweitfarbe = agordo.zweitfarbe;
  out.push(
    zweitfarbe === undefined
      ? // Without a Zweitfarbe its roles take the neutral ramp: show the step that would carry it.
        nodo("akzent", {
          hex: stepHex(palettes, "neutral", REFERENCE_STEPS.accent),
          stato: "leer",
          elir: "farbo",
        })
      : nodo("akzent", {
          wert: zweitfarbe.farbe,
          hex: hexOf(zweitfarbe.farbe),
          stato: zweitfarbe.herkunft === undefined ? "von-hand" : "aus-material",
          elir: "farbo",
        }),
  );
  const toenung = agordo.neutral?.toenung;
  out.push(
    nodo("neutral", {
      hex: stepHex(palettes, "neutral", "100"),
      stato: toenung === undefined ? "leer" : "von-hand",
      elir: "mezuro",
      toenung: toenung ?? 0,
    }),
  );
  for (const rolo of STATUS_ROLOJ) {
    const wert = wertDe(agordo, rolo);
    if (wert === undefined) continue;
    out.push(nodo(rolo, { wert, hex: hexOf(wert), stato: "von-hand", elir: "farbo" }));
  }
  return out;
}

/** The steps of one row: light from `steps`, dark from the dark `overrides` where it differs. */
function stufojDe(palettes: DerivedPalettes | undefined, palette: string): Stufo[] {
  return stepsOf(palettes, palette).map((step): Stufo => {
    const dark = palettes?.overrides.find(
      (entry) => entry.palette === palette && entry.step === step.step && entry.mode === "dark",
    );
    const stufo: Stufo = {
      stufo: step.step,
      tokeno: `color.palette.${palette}.${step.step}`,
      hex: step.hex,
      gesetzt: step.gesetzt === true,
      gesetztDunkel: dark?.gesetzt === true,
    };
    if (dark !== undefined && dark.hex !== step.hex) stufo.hexDunkel = dark.hex;
    return stufo;
  });
}

/** The seven rows in the effective view of `kabloj`. */
function vicojDe(
  farboj: readonly BildoFarbo[],
  kabloj: Kabloj,
  palettes: DerivedPalettes | undefined,
): Vico[] {
  const farboDe = new Map(farboj.map((farbo) => [farbo.rolo, farbo] as const));
  return FARBO_ROLOJ.map((rolo): Vico => {
    const paletro = ROLO_PALETRO[rolo];
    const gewaehlt = kabloj[rolo];
    const kandidat = gewaehlt === undefined ? rolo : gewaehlt;
    const fonto = kandidat === null ? undefined : farboDe.get(kandidat);
    const vico: Vico = {
      rolo,
      paletro,
      etikedo: ROLO_ETIKEDOJ[rolo],
      enir: rolo === "neutral" ? "mezuro" : "farbo",
      fonto: fonto?.rolo ?? null,
      stufoj: stufojDe(palettes, paletro),
    };
    if (fonto !== undefined && fonto.hex !== "") vico.fontoHex = fonto.hex;
    if (paletro !== "neutral" && fonto !== undefined && fonto.stato !== "leer") {
      const basis = REFERENCE_STEPS[CALIBRATED_RAMP[paletro] as keyof typeof REFERENCE_STEPS];
      if (vico.stufoj.some((stufo) => stufo.stufo === basis)) vico.basis = basis;
    }
    return vico;
  });
}

/** The edges that follow from the Agordo: Marke → colour → own row, Palette → previews. */
function ligojDe(farboj: readonly BildoFarbo[], vorschauen: readonly string[]): BildoLigo[] {
  const ligo = (de: string, al: string, art: BildoLigo["art"], hex?: string): BildoLigo =>
    hex === undefined || hex === ""
      ? { id: ligoId(de, al), de, al, art }
      : { id: ligoId(de, al), de, al, art, hex };
  return [
    ...farboj.map((farbo) => ligo("marko.el", `${farbo.id}.en`, "marko")),
    ...farboj.map((farbo) =>
      ligo(
        `${farbo.id}.el`,
        `paletro.en.${farbo.rolo}`,
        farbo.elir,
        farbo.elir === "farbo" ? farbo.hex : undefined,
      ),
    ),
    ...vorschauen.map((id) => ligo("paletro.el", `${id}.en`, "marko")),
  ];
}

/**
 * The Bildo of the view Gestalten (T1): six phases first, then Marke, the colour nodes of the
 * stored Agordo, the Palette of the effective one, and two previews (light, dark); the edges that
 * follow from the stored Agordo. No Regulo, no report, no problem count.
 */
export function gestaltenDe(agordo: Agordo, e: GestaltenEingaben): Bildo {
  const farboj = farbojDe(agordo, e.start, e.palettes);
  const vorschauen = (["hell", "dunkel"] as const).map(
    (schema): BildoNodo => ({
      id: `vorschau-${schema}`,
      speco: "vorschau",
      fazo: "fazo-5",
      schema,
      href: vorschauHref(agordo.name, schema, e.rev, e.kabloj),
    }),
  );
  const nodoj: BildoNodo[] = [
    ...FAZOJ.map((fazo) => ({ ...fazo })),
    { id: "marko", speco: "marko", fazo: "fazo-4" },
    ...farboj,
    {
      id: "paletro",
      speco: "paletro",
      fazo: "fazo-4",
      vicoj: vicojDe(farboj, e.kabloj, e.palettes),
    },
    ...vorschauen,
  ];
  return {
    marko: {
      name: agordo.name,
      etikedo: agordo.etikedoj?.marko ?? agordo.name,
      stato: "entwurf-ungepruft",
    },
    rev: e.rev,
    ableitung: e.palettes === undefined ? "fehlt" : "ok",
    kabloj: { ...e.kabloj },
    nodoj,
    ligoj: ligojDe(
      farboj,
      vorschauen.map((nodo) => nodo.id),
    ),
  };
}
