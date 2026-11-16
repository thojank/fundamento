// Spec 054 (MP-1, T4/T5): the write path of the canvas, pure. One change per request – the colour of
// a node, the Tönung, a palette step for light or dark, or (Spec 055 T3) the own Neutral colour
// `neutral.farbe` – applied to the stored Agordo and read
// against the schema (`readAgordo`). It refuses only what is no valid Agordo or no readable colour,
// with the field and a calm German sentence; it never runs a check or a rule (E-1, E-6). The route
// (`POST /api/marko/:name/leinwand` in servilo.ts) loads the draft, calls `leinwandSchreiben` and
// writes the result with `setDraft`. The write path knows no `kabloj`: it always writes the stored
// Agordo, never the effective view.
// Spec 056 (MP-2a, T1, plan D-23): with the font catalog and the sliders as an optional fourth
// argument it also sets a font of the catalog or an own font for heading, text or code, one of the
// three Schrift sliders within its range, and Akzent with its origin (`zweitfarbe.herkunft`).
// Without that argument it behaves exactly as before.

import {
  type Agordo,
  CALIBRATED_RAMP,
  type Calibration,
  DERIVED_PALETTES,
  type DerivedPaletteName,
  parseAgordoColor,
  type Regler,
  readAgordo,
  withRegler,
  ZWEITFARBE_PALETTE,
  ZWEITFARBE_STEPS,
} from "@fundamento/agordilo";
import {
  type FarboRolo,
  type LeinwandHerkunft,
  type LeinwandSxangxo,
  NELEGEBLA_SATZ,
  type Schema,
  type SchriftPfad,
  type SchriftRolle,
} from "./grafeo-gestalten-sicht.js";
import { hexOf } from "./sxtupoj.js";
import { fontoOf, licencedFonto, type Tiparo } from "./tiparoj.js";

// ---------------------------------------------------------------------------------------------
// The calm sentences of a refusal (product spec: „ruhig am Feld, in neutraler Farbe, auf Deutsch“)

/** `neutral.toenung` outside the bounds of the schema (`$defs/Agordo`, minimum 0, maximum 1). */
export const TOENUNG_SATZ = "Die Tönung ist eine Zahl von 0 bis 1.";
/** A step token the palettes do not have (B-3: e.g. a Zweitfarbe step outside ZWEITFARBE_STEPS). */
export const STUFO_SATZ = "Diese Stufe gibt es in der Palette nicht.";
/** A scheme other than light or dark. */
export const SCHEMA_SATZ = "Eine Stufe gilt für hell oder für dunkel.";
/** Primär cannot be emptied: the Agordo needs its lead colour. */
export const PRIMAER_SATZ = "Primär braucht einen Farbwert.";
/** Any other value the Agordo does not take. */
export const NEVALIDA_SATZ = "Diesen Wert nimmt der Entwurf nicht an.";

const DUNKEL = "color-scheme=dark";
const STUFO_TOKENO = /^color\.palette\.([a-z]+)\.(\d+)$/;
const FARBO_ROLLEN: readonly Exclude<FarboRolo, "neutral">[] = [
  "primaer",
  "akzent",
  "success",
  "warning",
  "danger",
  "info",
];

/** What the write path answers: the next Agordo, a refusal of one field, or a malformed body. */
export type SkriboRezulto =
  | { speco: "ok"; agordo: Agordo }
  | { speco: "rifuzita"; feld: string; satz: string }
  | { speco: "malformita"; mesagxo: string };

/**
 * Spec 056 (D-23): what the write path needs for fonts and sliders – the font catalog
 * (`readTiparoj().tiparoj`) and the sliders (`reglerOf(bases.gestalt)`). The route passes it.
 */
export interface SkriboKatalogo {
  tiparoj: readonly Tiparo[];
  regler: readonly Regler[];
}

/** Spec 056: a Schrift slider outside its range, in the manner of the Tönung sentence. */
export function reglerSatzDe(regler: Pick<Regler, "label" | "min" | "max">): string {
  return `„${regler.label}“ ist eine Zahl von ${regler.min} bis ${regler.max}.`;
}

const SCHRIFT_ROLLEN: readonly SchriftRolle[] = ["display", "body", "code"];
const SCHRIFT_PFADE: readonly SchriftPfad[] = [
  "schrift.groesse",
  "schrift.skala",
  "schrift.gewicht",
];

// ---------------------------------------------------------------------------------------------
// Colours

/**
 * A colour of the canvas as `#rrggbb`: hex with three or six digits or `oklch(L C H)` (L 0…1 or a
 * percentage), surrounding spaces ignored. Anything else – and an oklch lightness outside 0…1 – is
 * `undefined`. An oklch colour outside sRGB is clipped per channel (as `hexOf` does).
 */
export function farboHex(teksto: string): string | undefined {
  const wert = teksto.trim();
  const oklch = parseAgordoColor(wert);
  if (oklch === undefined || !(oklch.l >= 0 && oklch.l <= 1)) return undefined;
  return hexOf(wert);
}

/** `#rrggbb` as the DTCG value a step is stored as (the shape of the Studio's `colourWert`). */
export function dtcgDe(hex: string): { colorSpace: "srgb"; components: number[]; hex: string } {
  const klein = hex.toLowerCase();
  const components = [1, 3, 5].map(
    (index) =>
      Math.round((Number.parseInt(klein.slice(index, index + 2), 16) / 255) * 10_000) / 10_000,
  );
  return { colorSpace: "srgb", components, hex: klein };
}

// ---------------------------------------------------------------------------------------------
// Steps

/**
 * The steps each derived palette has: the steps of its calibrated ramp, the Zweitfarbe only
 * ZWEITFARBE_STEPS (as `derivePalettes` solves them). A step outside this map can be stored in
 * `festgelegt` but no derivation would ever read it (B-3), so the write path refuses it.
 */
export function paletroStufojDe(
  calibration: Calibration,
): ReadonlyMap<DerivedPaletteName, ReadonlySet<string>> {
  const out = new Map<DerivedPaletteName, ReadonlySet<string>>();
  for (const paletro of DERIVED_PALETTES) {
    const stufoj = Object.keys(calibration.palettes[CALIBRATED_RAMP[paletro]].steps).filter(
      (stufo) => paletro !== ZWEITFARBE_PALETTE || ZWEITFARBE_STEPS.includes(stufo),
    );
    out.set(paletro, new Set(stufoj));
  }
  return out;
}

const valida = (
  stufoj: ReadonlyMap<DerivedPaletteName, ReadonlySet<string>>,
  token: string,
): boolean => {
  const trafo = STUFO_TOKENO.exec(token);
  const paletro = trafo?.[1];
  const stufo = trafo?.[2];
  if (paletro === undefined || stufo === undefined) return false;
  return stufoj.get(paletro as DerivedPaletteName)?.has(stufo) === true;
};

type Festgelegt = NonNullable<Agordo["festgelegt"]>;
type Eintrag = Festgelegt[string];

/** The Agordo with `festgelegt[token]` replaced (undefined removes it; an empty map goes). */
function kunEintrag(agordo: Agordo, token: string, eintrag: Eintrag | undefined): Agordo {
  const festgelegt: Festgelegt = { ...(agordo.festgelegt ?? {}) };
  if (eintrag === undefined || Object.keys(eintrag).length === 0) delete festgelegt[token];
  else festgelegt[token] = eintrag;
  const { festgelegt: _alt, ...rest } = agordo;
  return Object.keys(festgelegt).length === 0 ? (rest as Agordo) : { ...rest, festgelegt };
}

/**
 * A step by hand (tech spec, step 4). Light: `wert` replaces value and alias of the main set, the
 * modes stay; null removes value and alias. Dark: `modoj["color-scheme=dark"]` takes the value as a
 * whole; null removes it. Empty modes and empty entries go (as `festlegen` with `zurueck`).
 */
function kunStufo(agordo: Agordo, token: string, hex: string | null, schema: Schema): Agordo {
  const eintrag: Eintrag = { ...(agordo.festgelegt?.[token] ?? {}) };
  if (schema === "hell") {
    const { wert: _w, alias: _a, ...rest } = eintrag;
    return kunEintrag(agordo, token, hex === null ? rest : { ...rest, wert: dtcgDe(hex) });
  }
  const modoj = { ...(eintrag.modoj ?? {}) };
  if (hex === null) delete modoj[DUNKEL];
  else modoj[DUNKEL] = { wert: dtcgDe(hex) };
  const { modoj: _m, ...rest } = eintrag;
  return kunEintrag(agordo, token, Object.keys(modoj).length === 0 ? rest : { ...rest, modoj });
}

/**
 * A colour of a node, as `patched` in servilo.ts maps it (a test holds them equal): Primär the lead
 * colour, Akzent the Zweitfarbe as a whole (without `herkunft`; null removes it), a Funktionsfarbe
 * its field in `zusatzfarben` (null removes it, an empty group goes).
 */
function kunFarbo(
  agordo: Agordo,
  rolle: Exclude<FarboRolo, "neutral">,
  wert: string | null,
  herkunft?: LeinwandHerkunft,
): Agordo {
  const next = structuredClone(agordo) as Agordo & Record<string, unknown>;
  if (rolle === "primaer") {
    // Never reached with null (the route refuses it first); the schema would refuse it anyway.
    if (wert === null) return { ...next, leitfarbe: undefined } as unknown as Agordo;
    next.leitfarbe = wert;
    return next;
  }
  if (rolle === "akzent") {
    if (wert === null) delete next.zweitfarbe;
    else if (herkunft === undefined) next.zweitfarbe = { farbe: wert };
    // Spec 056 (D-23): the origin as the Enportilo writes it; without a feature it names the
    // colour (enportilo/zweitfarbe.ts: „Farbe <wert>“).
    else
      next.zweitfarbe = {
        farbe: wert,
        herkunft: { ...herkunft, merkmal: herkunft.merkmal ?? `Farbe ${wert}` },
      };
    return next;
  }
  const zusatzfarben: Record<string, string> = { ...(next.zusatzfarben ?? {}) };
  if (wert === null) delete zusatzfarben[rolle];
  else zusatzfarben[rolle] = wert;
  if (Object.keys(zusatzfarben).length === 0) delete next.zusatzfarben;
  else next.zusatzfarben = zusatzfarben;
  return next;
}

/**
 * Spec 055 T3: the own Neutral colour. A colour comes with Tönung 1 when the Agordo has none, so
 * the slider shows the value the derivation uses; a Tönung set before stays. null removes the
 * colour, keeps the Tönung, and drops `neutral` when nothing is left in it.
 */
function kunNeutralfarbo(agordo: Agordo, farbe: string | null): Agordo {
  const next = structuredClone(agordo) as Agordo & Record<string, unknown>;
  const { farbe: _alt, ...rest }: NonNullable<Agordo["neutral"]> = agordo.neutral ?? {};
  if (farbe !== null) {
    next.neutral = { toenung: rest.toenung ?? 1, farbe };
    return next;
  }
  if (Object.keys(rest).length === 0) delete next.neutral;
  else next.neutral = rest;
  return next;
}

/** The Tönung, as `patched(a, { neutral: { toenung } })`: the value is left to the schema. */
function kunToenung(agordo: Agordo, toenung: unknown): Agordo {
  const next = structuredClone(agordo) as unknown as Record<string, unknown>;
  next.neutral = { ...(agordo.neutral ?? {}), toenung };
  return next as unknown as Agordo;
}

type Fonto = NonNullable<NonNullable<Agordo["schriften"]>["display"]>;

/**
 * Spec 056 (D-23): one font role, as the Studio's `schriftenOf` with `patched` merges it – the
 * other roles stay.
 */
function kunSchrift(agordo: Agordo, rolle: SchriftRolle, fonto: Fonto): Agordo {
  const next = structuredClone(agordo);
  next.schriften = { ...(agordo.schriften ?? {}), [rolle]: fonto };
  return next;
}

// ---------------------------------------------------------------------------------------------
// The body

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

type Legita = { speco: "ok"; sxangxo: LeinwandSxangxo } | { speco: "malformita"; mesagxo: string };

const plena = (x: unknown): x is string => typeof x === "string" && x.trim() !== "";

/**
 * Spec 056 (D-23): the origin of an Akzent: `quelle` bild or pdf, optionally `datei` and `merkmal`
 * (texts) and `anteil` (a finite number), nothing else; undefined for any other shape.
 */
function herkunftEl(roh: unknown): LeinwandHerkunft | undefined {
  if (!isObjekto(roh) || (roh.quelle !== "bild" && roh.quelle !== "pdf")) return undefined;
  if (Object.keys(roh).some((k) => !["quelle", "datei", "merkmal", "anteil"].includes(k)))
    return undefined;
  const herkunft: LeinwandHerkunft = { quelle: roh.quelle };
  for (const kampo of ["datei", "merkmal"] as const) {
    if (!(kampo in roh)) continue;
    const wert = roh[kampo];
    if (!plena(wert)) return undefined;
    herkunft[kampo] = wert;
  }
  if ("anteil" in roh) {
    if (typeof roh.anteil !== "number" || !Number.isFinite(roh.anteil)) return undefined;
    herkunft.anteil = roh.anteil;
  }
  return herkunft;
}

/** Spec 056 (D-23): `{schrift: {rolle, tiparo | eigene}}` and `{regler: {pfad, wert}}`. */
function sxangxo056El(korpo: Record<string, unknown>): Legita | undefined {
  const malformita = (mesagxo: string): Legita => ({ speco: "malformita", mesagxo });
  if ("schrift" in korpo) {
    const schrift = korpo.schrift;
    const rolle = isObjekto(schrift) ? schrift.rolle : undefined;
    if (!isObjekto(schrift) || !SCHRIFT_ROLLEN.includes(rolle as SchriftRolle))
      return malformita("schrift needs rolle (display, body, code) and tiparo or eigene");
    const kampoj = Object.keys(schrift).filter((k) => k !== "rolle");
    const [kampo] = kampoj;
    const wert = kampo === undefined ? undefined : schrift[kampo];
    if (kampoj.length !== 1 || (kampo !== "tiparo" && kampo !== "eigene") || !plena(wert))
      return malformita("schrift needs rolle (display, body, code) and tiparo or eigene");
    const r = rolle as SchriftRolle;
    return {
      speco: "ok",
      sxangxo:
        kampo === "tiparo"
          ? { schrift: { rolle: r, tiparo: wert } }
          : { schrift: { rolle: r, eigene: wert } },
    };
  }
  if ("regler" in korpo) {
    const regler = korpo.regler;
    const pfad = isObjekto(regler) ? regler.pfad : undefined;
    const wert = isObjekto(regler) ? regler.wert : undefined;
    if (
      !SCHRIFT_PFADE.includes(pfad as SchriftPfad) ||
      typeof wert !== "number" ||
      !Number.isFinite(wert)
    )
      return malformita(
        "regler needs pfad (schrift.groesse, schrift.skala, schrift.gewicht) and wert",
      );
    return { speco: "ok", sxangxo: { regler: { pfad: pfad as SchriftPfad, wert } } };
  }
  return undefined;
}

/**
 * The shape of the body: exactly one of `farbe`, `toenung`, `stufe`, `neutral`, with a known role,
 * a string token and a value that is a string or null; `neutral` carries `farbe` and nothing else
 * (Spec 055 T3). The values themselves are read afterwards (422);
 * `toenung` and `schema` are left as they came, so their bounds give a refusal with a field.
 * Spec 056 (D-23), only with `kun056`: also `schrift` and `regler`, and `farbe.herkunft` for Akzent
 * (any other role, or another shape, is malformed). Without it nothing of that is read.
 */
export function sxangxoEl(korpo: unknown, kun056 = false): Legita {
  const malformita = (mesagxo: string): Legita => ({ speco: "malformita", mesagxo });
  const ununura = kun056
    ? "send exactly one change: farbe, toenung, stufe, neutral, schrift or regler"
    : "send exactly one change: farbe, toenung, stufe or neutral";
  if (!isObjekto(korpo)) return malformita("the body is no JSON object");
  const sxlosiloj = Object.keys(korpo);
  if (sxlosiloj.length !== 1) return malformita(ununura);
  const wertOk = (x: Record<string, unknown>): boolean =>
    "wert" in x && (x.wert === null || typeof x.wert === "string");
  if (kun056) {
    const legita = sxangxo056El(korpo);
    if (legita !== undefined) return legita;
  }
  if (isObjekto(korpo.farbe)) {
    const { rolle } = korpo.farbe;
    if (!FARBO_ROLLEN.includes(rolle as Exclude<FarboRolo, "neutral">) || !wertOk(korpo.farbe))
      return malformita(
        "farbe needs rolle (primaer, akzent, success, warning, danger, info) and wert",
      );
    if (kun056 && "herkunft" in korpo.farbe) {
      const herkunft = herkunftEl(korpo.farbe.herkunft);
      const wert = korpo.farbe.wert;
      if (rolle !== "akzent" || typeof wert !== "string" || herkunft === undefined)
        return malformita(
          "herkunft only for akzent with a colour: quelle (bild, pdf), datei, merkmal, anteil",
        );
      return { speco: "ok", sxangxo: { farbe: { rolle: "akzent", wert, herkunft } } };
    }
    return {
      speco: "ok",
      sxangxo: {
        farbe: {
          rolle: rolle as Exclude<FarboRolo, "neutral">,
          wert: korpo.farbe.wert as string | null,
        },
      },
    };
  }
  if ("toenung" in korpo) return { speco: "ok", sxangxo: { toenung: korpo.toenung as number } };
  if (isObjekto(korpo.stufe)) {
    const { token, schema } = korpo.stufe;
    if (typeof token !== "string" || !wertOk(korpo.stufe))
      return malformita("stufe needs token and wert");
    return {
      speco: "ok",
      sxangxo: {
        stufe: {
          token,
          wert: korpo.stufe.wert as string | null,
          ...(schema === undefined ? {} : { schema: schema as Schema }),
        },
      },
    };
  }
  if (isObjekto(korpo.neutral)) {
    const { farbe } = korpo.neutral;
    if (
      Object.keys(korpo.neutral).join() !== "farbe" ||
      (farbe !== null && typeof farbe !== "string")
    )
      return malformita("neutral needs farbe (a colour or null) and nothing else");
    return { speco: "ok", sxangxo: { neutral: { farbe } } };
  }
  return malformita(ununura);
}

// ---------------------------------------------------------------------------------------------
// The write path

/**
 * The field a refusal names: `farbe.primaer`, `toenung`, `stufe.color.palette.accent.500`,
 * `neutral.farbe`; Spec 056: `schrift.display|body|code` and the slider's path.
 */
export function feldDe(sxangxo: LeinwandSxangxo): string {
  if ("farbe" in sxangxo) return `farbe.${sxangxo.farbe.rolle}`;
  if ("stufe" in sxangxo) return `stufe.${sxangxo.stufe.token}`;
  if ("neutral" in sxangxo) return "neutral.farbe";
  if ("schrift" in sxangxo) return `schrift.${sxangxo.schrift.rolle}`;
  if ("regler" in sxangxo) return sxangxo.regler.pfad;
  return "toenung";
}

/**
 * Applies one change of the canvas to the stored Agordo (tech spec, steps 2–5). Pure: no I/O, no
 * clock, no check. `stufoj` is `paletroStufojDe(calibration)`. Spec 056 (D-23): with `katalogo`
 * also fonts, the Schrift sliders and Akzent's origin; an unknown font id or a slider outside its
 * range is refused with its field. Without `katalogo` exactly as before.
 */
export function leinwandSchreiben(
  agordo: Agordo,
  korpo: unknown,
  stufoj: ReadonlyMap<DerivedPaletteName, ReadonlySet<string>>,
  katalogo?: SkriboKatalogo,
): SkriboRezulto {
  const legita = sxangxoEl(korpo, katalogo !== undefined);
  if (legita.speco === "malformita") return legita;
  const { sxangxo } = legita;
  const feld = feldDe(sxangxo);
  const rifuzo = (satz: string): SkriboRezulto => ({ speco: "rifuzita", feld, satz });

  let next: Agordo;
  if ("farbe" in sxangxo) {
    const { rolle, wert, herkunft } = sxangxo.farbe;
    if (wert === null && rolle === "primaer") return rifuzo(PRIMAER_SATZ);
    if (wert !== null && farboHex(wert) === undefined) return rifuzo(NELEGEBLA_SATZ);
    next = kunFarbo(agordo, rolle, wert === null ? null : wert.trim(), herkunft);
  } else if ("schrift" in sxangxo && katalogo !== undefined) {
    const { schrift } = sxangxo;
    let fonto: Fonto;
    if ("tiparo" in schrift) {
      const tiparo = katalogo.tiparoj.find((t) => t.id === schrift.tiparo.trim());
      if (tiparo === undefined) return rifuzo(NEVALIDA_SATZ);
      fonto = fontoOf(tiparo);
    } else fonto = licencedFonto(schrift.eigene.trim(), ["Latn"]);
    next = kunSchrift(agordo, schrift.rolle, fonto);
  } else if ("regler" in sxangxo && katalogo !== undefined) {
    const { pfad, wert } = sxangxo.regler;
    const regler = katalogo.regler.find((r) => r.path === pfad);
    if (regler === undefined) return rifuzo(NEVALIDA_SATZ);
    if (wert < regler.min || wert > regler.max) return rifuzo(reglerSatzDe(regler));
    next = withRegler(agordo, pfad, wert);
  } else if ("stufe" in sxangxo) {
    const { token, wert, schema = "hell" } = sxangxo.stufe;
    if (!valida(stufoj, token)) return rifuzo(STUFO_SATZ);
    if (schema !== "hell" && schema !== "dunkel") return rifuzo(SCHEMA_SATZ);
    const hex = wert === null ? null : farboHex(wert);
    if (hex === undefined) return rifuzo(NELEGEBLA_SATZ);
    next = kunStufo(agordo, token, hex, schema);
  } else if ("neutral" in sxangxo) {
    // No judgement (E-1): only whether the colour reads, as for the colour of a node.
    const { farbe } = sxangxo.neutral;
    if (farbe !== null && farboHex(farbe) === undefined) return rifuzo(NELEGEBLA_SATZ);
    next = kunNeutralfarbo(agordo, farbe === null ? null : farbe.trim());
  } else if ("toenung" in sxangxo) {
    next = kunToenung(agordo, sxangxo.toenung);
  } else {
    // A schrift or regler change is only read with the catalog (sxangxoEl); never reached.
    return { speco: "malformita", mesagxo: "schrift and regler need the catalog" };
  }

  const legitaAgordo = readAgordo(next);
  if (legitaAgordo.agordo === undefined) {
    const unua = legitaAgordo.issues[0]?.path ?? "";
    if (unua.includes("/neutral/farbe")) return rifuzo(NELEGEBLA_SATZ);
    if (unua.includes("/neutral")) return rifuzo(TOENUNG_SATZ);
    if (/\/(leitfarbe|zweitfarbe|zusatzfarben)/.test(unua)) return rifuzo(NELEGEBLA_SATZ);
    return rifuzo(NEVALIDA_SATZ);
  }
  return { speco: "ok", agordo: legitaAgordo.agordo };
}
