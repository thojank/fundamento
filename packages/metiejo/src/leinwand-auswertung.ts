// Spec 058 (MP-2c, T1, plan §3.2): every rule of the evaluation that needs no model, shared by the
// server and the canvas (the bundle takes it through the alias `@fundamento/metiejo/auswertung`).
// The overview of the Marke without KI, the inputs of a model call as text (never a file name, an
// image or Pinterest address, never image data), the abdruck and „veraltet“, the orders to the model
// and the lenient reading of its answers (no rule, no contrast, no limit filters a value – Ä-4), the
// fixed mapping features → layout, the effective layout of a preview, the display estimate, the raw
// pieces of the view „Marke“, writing one node's content and „one Stand per result“ (E-2).
// Its only imports are the two shared modules. Pure and deterministic: no clock, no randomness, no
// storage; the abdruck is a hash written here that computes the same in Node and in the browser.

import {
  AUFBAU_ETIKEDOJ,
  AUFBAUOJ,
  type AufbauId,
  type BildoFarbo,
  ENHAVO_ETIKEDOJ,
  ETIKEDOJ_058,
  enhavoSpecoDe,
  estasAufbauWahl,
  type FarbVorschlag,
  GRUNDLAGEN_ELIR,
  GRUNDLAGEN_ID,
  type InhaltTonalitaet,
  KI_NAMEN_ID,
  KRONIKO_ZWECKOJ,
  LAYOUT_ID,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  type Leitgedanke,
  type MarkeInhalt,
  MERKMALE_WERTE,
  type Merkmale,
  type MerkmaleLego,
  type NamenIdee,
  type NamenVorschlag,
  type Profil,
  type ProfilEingaben,
  type ProfilVorschlag,
  senValora,
  TEKSTO_IDS,
  type TekstoId,
  TONALITAET_PAROJ,
  type Zweck,
} from "./grafeo-gestalten-sicht.js";
import {
  enhavoDe,
  erkanntDe,
  estasMalplena,
  kiNamenLigojDe,
  markoLigojDe,
} from "./leinwand-enhavo.js";

type Objekto = Record<string, unknown>;

const isObjekto = (x: unknown): x is Objekto =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** A text with something in it; whitespace alone counts as nothing. */
const plena = (x: unknown): x is string => typeof x === "string" && x.trim() !== "";

const HEX = /^#[0-9a-f]{6}$/i;

// ---------------------------------------------------------------------------------------------
// What both sides know: the canvas state, the Bildo's colours, the fonts

/** The part of the canvas state the rules read (the session's or the file's). */
export type StatoLego = {
  knoten: readonly LeinwandStatoKnoto[];
  geloest?: readonly string[] | undefined;
};

/** One font role as the Schrift route names it: the family, the catalog id when it is one. */
export interface SchriftEingabe {
  familie: string;
  tiparo?: string;
}

/**
 * The plain input of the overview and of the evaluation. The canvas builds it from its session
 * (`stato`, the live name, the Bildo's colour nodes, `GET …/schriften`), the server from
 * `leinwand.json`, the draft's `etikedoj.marko`, `gestaltenDe` and the Agordo's fonts.
 */
export interface AuswertungEnigo {
  stato: StatoLego;
  /** The display name (what Grundlagen holds while typing, else `etikedo`, else the identifier). */
  nomo: string;
  /** The colour nodes of the Bildo (Primär, Akzent, Neutral are read; others are ignored). */
  farben: readonly Pick<BildoFarbo, "rolo" | "hex" | "stato" | "wert">[];
  schriften: { display?: SchriftEingabe; body?: SchriftEingabe };
}

/** The outputs into the Marke that stand and are not detached (with Grundlagen, Spec 058). */
const markoVerbunden = (stato: AuswertungEnigo["stato"]): Set<string> =>
  new Set(markoLigojDe(stato.knoten, stato.geloest ?? [], { stufe: 58 }).map((l) => l.de));

const knotoDe = (
  knoten: readonly LeinwandStatoKnoto[],
  id: string,
): LeinwandStatoKnoto | undefined => knoten.find((k) => k.id === id);

/** What arrives through the connected outputs: one structure for overview, inputs and the page. */
interface Ankommendes {
  beschreibung?: string;
  ausgangslage?: string;
  zielgruppe?: { wer?: string; sorge?: string; vertrauen?: string };
  wettbewerb?: { name?: string; adresse?: string }[];
  kern?: { zweck?: string; versprechen?: string };
  werte?: string[];
  persoenlichkeit?: string[];
  tonalitaet?: InhaltTonalitaet;
  erkannt?: { hex: string; anteil: number; hell: boolean; bunt: boolean }[];
}

/** The contents of the nodes whose output is in `verbunden`; empty parts are absent. */
function ankommendesDe(
  knoten: readonly LeinwandStatoKnoto[],
  verbunden: ReadonlySet<string>,
): Ankommendes {
  const out: Ankommendes = {};
  const inhalt = (id: string) => knotoDe(knoten, id)?.inhalt;
  if (verbunden.has(GRUNDLAGEN_ELIR)) {
    const beschreibung = enhavoDe(GRUNDLAGEN_ID, inhalt(GRUNDLAGEN_ID))?.beschreibung;
    if (beschreibung !== undefined) out.beschreibung = beschreibung;
  }
  const verbundenTeksto = (id: TekstoId) =>
    verbunden.has(`${id}.el`) && !estasMalplena(id, inhalt(id));
  if (verbundenTeksto("teksto-ausgangslage")) {
    const text = enhavoDe("teksto-ausgangslage", inhalt("teksto-ausgangslage"))?.text;
    if (text !== undefined) out.ausgangslage = text;
  }
  if (verbundenTeksto("teksto-zielgruppe"))
    out.zielgruppe = enhavoDe("teksto-zielgruppe", inhalt("teksto-zielgruppe")) ?? {};
  if (verbundenTeksto("teksto-wettbewerb"))
    out.wettbewerb = enhavoDe("teksto-wettbewerb", inhalt("teksto-wettbewerb"))?.liste ?? [];
  if (verbundenTeksto("teksto-markenkern"))
    out.kern = enhavoDe("teksto-markenkern", inhalt("teksto-markenkern")) ?? {};
  const werte = (enhavoDe("teksto-werte", inhalt("teksto-werte"))?.werte ?? [])
    .filter((w) => verbunden.has(`teksto-werte.el.${w.id}`))
    .map((w) => w.text);
  if (werte.length > 0) out.werte = werte;
  if (verbundenTeksto("teksto-persoenlichkeit"))
    out.persoenlichkeit =
      enhavoDe("teksto-persoenlichkeit", inhalt("teksto-persoenlichkeit"))?.eigenschaften ?? [];
  if (verbundenTeksto("teksto-tonalitaet"))
    out.tonalitaet = enhavoDe("teksto-tonalitaet", inhalt("teksto-tonalitaet")) ?? {};
  if (verbunden.has("beispiele.el")) {
    const erkannt = erkanntDe(enhavoDe("beispiele", inhalt("beispiele"))?.dateien ?? []);
    if (erkannt.length > 0)
      out.erkannt = erkannt.map(({ hex, anteil, hell, bunt }) => ({ hex, anteil, hell, bunt }));
  }
  return out;
}

const layoutDe = (knoten: readonly LeinwandStatoKnoto[]) =>
  enhavoDe(LAYOUT_ID, knotoDe(knoten, LAYOUT_ID)?.inhalt);

// ---------------------------------------------------------------------------------------------
// The overview without KI (product spec E, level 1)

/** The inputs the overview names as open, in the order of the process. */
export const OFFEN_ORDO = [GRUNDLAGEN_ID, ...TEKSTO_IDS, "beispiele", LAYOUT_ID] as const;

export type OffenId = (typeof OFFEN_ORDO)[number];

/** The label of an open input, as the line „noch offen: …“ says it. */
export function offenEtikedoDe(id: OffenId): string {
  if (id === GRUNDLAGEN_ID || id === LAYOUT_ID) return ETIKEDOJ_058[id];
  return ENHAVO_ETIKEDOJ[id];
}

/** A colour field of the overview: its colour, and whether it is derived (no value of its own). */
export interface UebersichtFarbo {
  hex: string;
  abgeleitet: boolean;
}

/** What the Marken-Knoten shows without KI (`uebersichtDe`). */
export interface Uebersicht {
  name: string;
  /** The whole description; the node shortens it. */
  beschreibung?: string;
  kern?: { zweck?: string; versprechen?: string };
  werte?: string[];
  persoenlichkeit?: string[];
  tonalitaet?: InhaltTonalitaet;
  farben: { primaer?: UebersichtFarbo; akzent?: UebersichtFarbo; neutral?: UebersichtFarbo };
  /** The detected colours of the connected Beispiele and of the Layout-Beispiel. */
  erkannt: {
    beispiele: { hex: string; anteil: number }[];
    layout: { hex: string; anteil: number }[];
  };
  /** The families of display and body type. */
  schrift: { display?: string; body?: string };
  /** The inputs that bring nothing yet (absent, detached or empty), in the order of the process. */
  offen: OffenId[];
}

/**
 * The overview of the Marke (product spec E, AK-2): only connected inputs count; the name is the
 * display name regardless of the edge Grundlagen → Marke. Nothing is judged: „offen“ only names
 * what brings nothing yet.
 */
export function uebersichtDe(enigo: AuswertungEnigo): Uebersicht {
  const { knoten } = enigo.stato;
  const verbunden = markoVerbunden(enigo.stato);
  const a = ankommendesDe(knoten, verbunden);
  const farbo = (rolo: "primaer" | "akzent" | "neutral"): UebersichtFarbo | undefined => {
    const f = enigo.farben.find((x) => x.rolo === rolo);
    return f === undefined ? undefined : { hex: f.hex, abgeleitet: senValora(f.stato) };
  };
  const farben: Uebersicht["farben"] = {};
  for (const rolo of ["primaer", "akzent", "neutral"] as const) {
    const f = farbo(rolo);
    if (f !== undefined) farben[rolo] = f;
  }
  const layout = layoutDe(knoten);
  const schrift: Uebersicht["schrift"] = {};
  if (enigo.schriften.display !== undefined) schrift.display = enigo.schriften.display.familie;
  if (enigo.schriften.body !== undefined) schrift.body = enigo.schriften.body.familie;
  const bringt = (id: OffenId): boolean => {
    if (id === GRUNDLAGEN_ID) return a.beschreibung !== undefined;
    if (id === LAYOUT_ID) return layout?.datei !== undefined;
    if (id === "beispiele")
      return verbunden.has("beispiele.el") && !estasMalplena(id, knotoDe(knoten, id)?.inhalt);
    if (id === "teksto-werte") return a.werte !== undefined;
    return verbunden.has(`${id}.el`) && !estasMalplena(id, knotoDe(knoten, id)?.inhalt);
  };
  const out: Uebersicht = {
    name: enigo.nomo,
    farben,
    erkannt: {
      beispiele: (a.erkannt ?? []).map(({ hex, anteil }) => ({ hex, anteil })),
      layout: erkanntDe(layout?.datei === undefined ? [] : [layout.datei]).map(
        ({ hex, anteil }) => ({
          hex,
          anteil,
        }),
      ),
    },
    schrift,
    offen: OFFEN_ORDO.filter((id) => !bringt(id)),
  };
  if (a.beschreibung !== undefined) out.beschreibung = a.beschreibung;
  if (a.kern !== undefined) out.kern = a.kern;
  if (a.werte !== undefined) out.werte = a.werte;
  if (a.persoenlichkeit !== undefined) out.persoenlichkeit = a.persoenlichkeit;
  if (a.tonalitaet !== undefined) out.tonalitaet = a.tonalitaet;
  return out;
}

// ---------------------------------------------------------------------------------------------
// The inputs of a model call (tech spec „Was in den Auftrag geht“)

/** The whole input of a model call as text (`eingabenDe`); empty parts are absent. */
export interface Eingaben {
  name?: string;
  beschreibung?: string;
  /** The other connected text nodes: their title and their content as lines. */
  texte?: { thema: string; text: string }[];
  werte?: string[];
  persoenlichkeit?: string[];
  tonalitaet?: { links: string; rechts: string; wert: number }[];
  /** The detected colours of the connected Beispiele (hex, share, light/dark, colourful). */
  erkannt?: { hex: string; anteil: number; hell: boolean; bunt: boolean }[];
  /** The Layout-Beispiel: its features, its words and its colours (profile only). */
  layout?: {
    merkmale?: MerkmaleLego;
    worte?: string;
    farben?: { hex: string; anteil: number; hell: boolean; bunt: boolean }[];
  };
  /** The colours set on the canvas (profile only). */
  farben?: { primaer?: string; akzent?: string; neutral?: string };
  /** The fonts of display and body (profile only). */
  schriften?: { display?: SchriftEingabe; body?: SchriftEingabe };
}

/** An address that may stand in an order: none of Pinterest, none that ends in an image file. */
function sekuraAdreso(adresse: string): boolean {
  const teksto = adresse.toLowerCase();
  if (/pinterest\.|pin\.it|pinimg\./.test(teksto)) return false;
  return !/\.(png|jpe?g|webp|gif|svg|pdf|avif)(?:[?#].*)?$/.test(teksto);
}

/** The lines of the other connected text nodes (Ausgangslage, Zielgruppe, Wettbewerb, Kern). */
function texteDe(a: Ankommendes): { thema: string; text: string }[] {
  const out: { thema: string; text: string }[] = [];
  if (a.ausgangslage !== undefined)
    out.push({ thema: ENHAVO_ETIKEDOJ["teksto-ausgangslage"], text: a.ausgangslage });
  if (a.zielgruppe !== undefined) {
    const z = a.zielgruppe;
    const linioj = [
      z.wer === undefined ? "" : `Wer: ${z.wer}`,
      z.sorge === undefined ? "" : `Was sie sorgt: ${z.sorge}`,
      z.vertrauen === undefined ? "" : `Was Vertrauen schafft: ${z.vertrauen}`,
    ].filter((l) => l !== "");
    if (linioj.length > 0)
      out.push({ thema: ENHAVO_ETIKEDOJ["teksto-zielgruppe"], text: linioj.join("\n") });
  }
  if (a.wettbewerb !== undefined) {
    const linioj = a.wettbewerb.flatMap((zeile) => {
      const adresse =
        zeile.adresse !== undefined && sekuraAdreso(zeile.adresse) ? zeile.adresse : undefined;
      if (zeile.name === undefined) return adresse === undefined ? [] : [adresse];
      return [adresse === undefined ? zeile.name : `${zeile.name} (${adresse})`];
    });
    if (linioj.length > 0)
      out.push({ thema: ENHAVO_ETIKEDOJ["teksto-wettbewerb"], text: linioj.join("\n") });
  }
  if (a.kern !== undefined) {
    const linioj = [
      a.kern.zweck === undefined ? "" : `Zweck: ${a.kern.zweck}`,
      a.kern.versprechen === undefined ? "" : `Versprechen: ${a.kern.versprechen}`,
    ].filter((l) => l !== "");
    if (linioj.length > 0)
      out.push({ thema: ENHAVO_ETIKEDOJ["teksto-markenkern"], text: linioj.join("\n") });
  }
  return out;
}

const tonalitaetDe = (t: InhaltTonalitaet | undefined): Eingaben["tonalitaet"] =>
  t === undefined
    ? undefined
    : TONALITAET_PAROJ.flatMap(({ id, links, rechts }) => {
        const wert = t[id];
        return wert === undefined ? [] : [{ links, rechts, wert }];
      });

/** The text inputs both purposes share; the caller adds what only the profile has. */
function tekstaEingabenDe(a: Ankommendes): Eingaben {
  const out: Eingaben = {};
  const texte = texteDe(a);
  if (texte.length > 0) out.texte = texte;
  if (a.werte !== undefined) out.werte = a.werte;
  if (a.persoenlichkeit !== undefined && a.persoenlichkeit.length > 0)
    out.persoenlichkeit = a.persoenlichkeit;
  const tonalitaet = tonalitaetDe(a.tonalitaet);
  if (tonalitaet !== undefined && tonalitaet.length > 0) out.tonalitaet = tonalitaet;
  return out;
}

/** The value a colour node holds as written (#rrggbb in lower case), when it has one of its own. */
function gesetztDe(farbo: Pick<BildoFarbo, "stato" | "wert"> | undefined): string | undefined {
  if (farbo === undefined || senValora(farbo.stato) || farbo.stato === "startwert")
    return undefined;
  if (farbo.wert === undefined) return undefined;
  return HEX.test(farbo.wert) ? farbo.wert.toLowerCase() : farbo.wert;
}

/**
 * The whole input of a model call (tech spec „Was in den Auftrag geht“) as a plain structure:
 * - `profil`: the name, every input connected to the Marke (Grundlagen, the text nodes, values,
 *   traits, Tonalität as word pairs with their value, the colours detected in the Beispiele), the
 *   Layout-Beispiel's features, words and colours, the set colours and the fonts.
 * - `namen`: the inputs connected to „Namen und Beschreibung“ and the current description.
 * Never a file name, an image address, a Pinterest address or image data (AK-12, E-3).
 */
export function eingabenDe(enigo: AuswertungEnigo, zweck: "profil" | "namen" = "profil"): Eingaben {
  const { knoten } = enigo.stato;
  if (zweck === "namen") {
    const verbunden = new Set(kiNamenLigojDe(knoten).map((l) => l.de));
    const a = ankommendesDe(knoten, verbunden);
    const out = tekstaEingabenDe(a);
    // „Erkannt“ (the colours of connected Beispiele) is an input of the node too (product spec D).
    if (a.erkannt !== undefined) out.erkannt = a.erkannt;
    const beschreibung = enhavoDe(
      GRUNDLAGEN_ID,
      knotoDe(knoten, GRUNDLAGEN_ID)?.inhalt,
    )?.beschreibung;
    return beschreibung === undefined ? out : { beschreibung, ...out };
  }
  const a = ankommendesDe(knoten, markoVerbunden(enigo.stato));
  const out: Eingaben = { name: enigo.nomo };
  if (a.beschreibung !== undefined) out.beschreibung = a.beschreibung;
  Object.assign(out, tekstaEingabenDe(a));
  if (a.erkannt !== undefined) out.erkannt = a.erkannt;
  const layout = layoutDe(knoten);
  const layoutFarben = erkanntDe(layout?.datei === undefined ? [] : [layout.datei]).map(
    ({ hex, anteil, hell, bunt }) => ({ hex, anteil, hell, bunt }),
  );
  const layoutTeil: NonNullable<Eingaben["layout"]> = {};
  if (layout?.merkmale !== undefined) layoutTeil.merkmale = layout.merkmale;
  if (layout?.worte !== undefined) layoutTeil.worte = layout.worte;
  if (layoutFarben.length > 0) layoutTeil.farben = layoutFarben;
  if (Object.keys(layoutTeil).length > 0) out.layout = layoutTeil;
  const farben: NonNullable<Eingaben["farben"]> = {};
  for (const rolo of ["primaer", "akzent", "neutral"] as const) {
    const wert = gesetztDe(enigo.farben.find((f) => f.rolo === rolo));
    if (wert !== undefined) farben[rolo] = wert;
  }
  if (Object.keys(farben).length > 0) out.farben = farben;
  const schriften: NonNullable<Eingaben["schriften"]> = {};
  if (enigo.schriften.display !== undefined) schriften.display = enigo.schriften.display;
  if (enigo.schriften.body !== undefined) schriften.body = enigo.schriften.body;
  if (Object.keys(schriften).length > 0) out.schriften = schriften;
  return out;
}

/**
 * Whether no input has content („Noch keine Eingabe mit Inhalt“): the name, the set colours and
 * the fonts always exist and do not count.
 */
export function eingabenLeer(eingaben: Eingaben): boolean {
  return (
    eingaben.beschreibung === undefined &&
    eingaben.texte === undefined &&
    eingaben.werte === undefined &&
    eingaben.persoenlichkeit === undefined &&
    eingaben.tonalitaet === undefined &&
    eingaben.erkannt === undefined &&
    eingaben.layout?.merkmale === undefined &&
    eingaben.layout?.worte === undefined
  );
}

// ---------------------------------------------------------------------------------------------
// The abdruck and „veraltet“

/** Canonical JSON: object keys sorted, `undefined` fields left out, arrays in their order. */
function kanona(wert: unknown): string {
  if (Array.isArray(wert))
    return `[${wert.map((w) => (w === undefined ? "null" : kanona(w))).join(",")}]`;
  if (isObjekto(wert))
    return `{${Object.keys(wert)
      .filter((k) => wert[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${kanona(wert[k])}`)
      .join(",")}}`;
  return JSON.stringify(wert) ?? "null";
}

/** Two 32-bit FNV-1a hashes over the UTF-16 code units (different offsets), as 16 hex digits. */
function hashDe(teksto: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < teksto.length; i += 1) {
    const c = teksto.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x01000193) ^ (b >>> 15);
  }
  const hex = (n: number): string => (n >>> 0).toString(16).padStart(8, "0");
  return hex(a) + hex(b);
}

/**
 * A stable abdruck of any plain value: canonical JSON (sorted keys) and a hash written in this
 * module, the same in Node and in the browser. The preview's `inh` is
 * `abdruckDe(markeInhaltDe(…))`; results of the model carry `eingabenAbdruckDe(…)`.
 */
export function abdruckDe(wert: unknown): string {
  return hashDe(kanona(wert));
}

/**
 * The abdruck of the inputs: as `abdruckDe`, with every font as the one comparable value
 * `tiparo ?? familie` (the form of `ProfilEingaben`), so a takeover can be undone in `veraltet`.
 */
export function eingabenAbdruckDe(eingaben: Eingaben): string {
  return abdruckDe(projekcioDe(eingaben));
}

const schriftValoro = (s: SchriftEingabe | undefined): string | undefined =>
  s === undefined ? undefined : (s.tiparo ?? s.familie);

function projekcioDe(eingaben: Eingaben): unknown {
  if (eingaben.schriften === undefined) return eingaben;
  const schriften: { display?: string; body?: string } = {};
  const display = schriftValoro(eingaben.schriften.display);
  const body = schriftValoro(eingaben.schriften.body);
  if (display !== undefined) schriften.display = display;
  if (body !== undefined) schriften.body = body;
  const { schriften: _s, ...rest } = eingaben;
  return Object.keys(schriften).length === 0 ? rest : { ...rest, schriften };
}

/** The values of the five parts of the proposal in the inputs (`Profil.eingaben`). */
export function profilEingabenDe(eingaben: Eingaben): ProfilEingaben {
  const out: ProfilEingaben = {};
  const set = (k: keyof ProfilEingaben, v: string | undefined): void => {
    if (v !== undefined) out[k] = v;
  };
  set("primaer", eingaben.farben?.primaer);
  set("akzent", eingaben.farben?.akzent);
  set("neutral", eingaben.farben?.neutral);
  set("display", schriftValoro(eingaben.schriften?.display));
  set("body", schriftValoro(eingaben.schriften?.body));
  return out;
}

const sama = (a: string | undefined, b: string | undefined): boolean =>
  a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();

/** The inputs with every part equal to the own proposal set back to its value at evaluation. */
function senUebernahmoj(
  eingaben: Eingaben,
  vorschlag: ProfilVorschlag | undefined,
  dann: ProfilEingaben,
): unknown {
  const projekcio = projekcioDe(eingaben) as Omit<Eingaben, "schriften"> & {
    schriften?: { display?: string; body?: string };
  };
  const farben = { ...(projekcio.farben ?? {}) };
  for (const rolo of ["primaer", "akzent", "neutral"] as const) {
    if (!sama(farben[rolo], vorschlag?.[rolo]?.hex)) continue;
    const wert = dann[rolo];
    if (wert === undefined) delete farben[rolo];
    else farben[rolo] = wert;
  }
  const schriften = { ...(projekcio.schriften ?? {}) };
  for (const rolo of ["display", "body"] as const) {
    if (schriften[rolo] === undefined || schriften[rolo] !== vorschlag?.schrift?.[rolo]) continue;
    const wert = dann[rolo];
    if (wert === undefined) delete schriften[rolo];
    else schriften[rolo] = wert;
  }
  const out: Objekto = { ...projekcio };
  delete out.farben;
  delete out.schriften;
  if (Object.keys(farben).length > 0) out.farben = farben;
  if (Object.keys(schriften).length > 0) out.schriften = schriften;
  return out;
}

/**
 * Whether a result is stale (AK-16): its abdruck differs from that of the current inputs. For the
 * profile a colour or font that equals its own proposal counts as the value at the time of the
 * evaluation (`Profil.eingaben`), so taking over the own proposal does not make it stale.
 * Without a result: false.
 */
export function veraltet(
  ergebnis: (Pick<Profil, "abdruck"> & Partial<Pick<Profil, "eingaben" | "vorschlag">>) | undefined,
  eingabenJetzt: Eingaben,
): boolean {
  if (ergebnis === undefined) return false;
  const jetzt =
    ergebnis.eingaben === undefined
      ? projekcioDe(eingabenJetzt)
      : senUebernahmoj(eingabenJetzt, ergebnis.vorschlag, ergebnis.eingaben);
  return abdruckDe(jetzt) !== ergebnis.abdruck;
}

// ---------------------------------------------------------------------------------------------
// The orders to the model (German, exactly one JSON object, no response format)

/** One message of an order, in the shape of the chat-completions protocol. */
export interface AuftragMesagxo {
  role: "system" | "user";
  content: string;
}

const JSON_BITTE =
  "Antworte mit genau einem JSON-Objekt und sonst nichts: kein Text davor oder danach, keine Erklärung.";

const SYSTEM =
  "Du hilfst einer Person, ihre Marke zu beschreiben. Du schreibst Deutsch, klar und ohne Floskeln. Du beziehst dich auf die Eingaben der Person und erfindest keine Tatsachen.";

/** The inputs as German text, one block per part. */
function eingabenTeksto(e: Eingaben): string {
  const bloecke: string[] = [];
  if (e.name !== undefined) bloecke.push(`Name der Marke: ${e.name}`);
  if (e.beschreibung !== undefined) bloecke.push(`Beschreibung: ${e.beschreibung}`);
  for (const t of e.texte ?? []) bloecke.push(`${t.thema}:\n${t.text}`);
  if (e.werte !== undefined) bloecke.push(`Werte: ${e.werte.join(", ")}`);
  if (e.persoenlichkeit !== undefined)
    bloecke.push(`Persönlichkeit: ${e.persoenlichkeit.join(", ")}`);
  if (e.tonalitaet !== undefined)
    bloecke.push(
      `Tonalität (von -2 = ganz links bis 2 = ganz rechts):\n${e.tonalitaet
        .map((t) => `${t.links} – ${t.rechts}: ${t.wert}`)
        .join("\n")}`,
    );
  const farbLinio = (f: { hex: string; anteil: number; hell: boolean; bunt: boolean }) =>
    `${f.hex} (${f.anteil} %, ${f.hell ? "hell" : "dunkel"}, ${f.bunt ? "bunt" : "unbunt"})`;
  if (e.erkannt !== undefined)
    bloecke.push(`Farben aus den Beispielbildern:\n${e.erkannt.map(farbLinio).join("\n")}`);
  if (e.layout !== undefined) {
    const linioj: string[] = [];
    if (e.layout.merkmale !== undefined)
      linioj.push(
        `Merkmale: ${Object.entries(e.layout.merkmale)
          .map(([k, v]) => `${k} = ${v}`)
          .join(", ")}`,
      );
    if (e.layout.worte !== undefined) linioj.push(`In Worten: ${e.layout.worte}`);
    if (e.layout.farben !== undefined)
      linioj.push(`Farben: ${e.layout.farben.map(farbLinio).join("; ")}`);
    bloecke.push(`Layout-Beispiel (eine Seite, deren Gestaltung gefällt):\n${linioj.join("\n")}`);
  }
  if (e.farben !== undefined)
    bloecke.push(
      `Gesetzte Farben: ${Object.entries(e.farben)
        .map(
          ([k, v]) => `${k === "primaer" ? "Primär" : k === "akzent" ? "Akzent" : "Neutral"} ${v}`,
        )
        .join(", ")}`,
    );
  if (e.schriften !== undefined)
    bloecke.push(
      `Schriften: ${[
        e.schriften.display === undefined ? "" : `Überschrift ${e.schriften.display.familie}`,
        e.schriften.body === undefined ? "" : `Text ${e.schriften.body.familie}`,
      ]
        .filter((s) => s !== "")
        .join(", ")}`,
    );
  return bloecke.length === 0 ? "(Noch keine Eingaben.)" : bloecke.join("\n\n");
}

/** The order of „Marke auswerten“: the whole input as text, the profile as one JSON object. */
export function auftragProfil(eingaben: Eingaben): AuftragMesagxo[] {
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `Werte die Eingaben meiner Marke aus und fasse sie zu einem Markenprofil zusammen.\n\n${eingabenTeksto(
        eingaben,
      )}\n\n${JSON_BITTE} Aufbau:\n{"kernsatz": "ein Satz", "leitgedanken": [{"titel": "…", "text": "…"}, {"titel": "…", "text": "…"}, {"titel": "…", "text": "…"}], "charakter": ["drei bis fünf Wörter"], "passt": ["was zusammenpasst"], "reibt": ["was sich reibt"], "vorschlag": {"primaer": {"hex": "#rrggbb", "grund": "…"}, "akzent": {"hex": "#rrggbb", "grund": "…"}, "neutral": {"hex": "#rrggbb", "grund": "…"}, "schrift": {"display": "Familienname bei Fontsource", "body": "Familienname bei Fontsource", "grund": "…"}}}\nJeder Grund bezieht sich auf genannte Eingaben.`,
    },
  ];
}

/** The order of „Namen und Beschreibung“: six to eight names and a better description. */
export function auftragNamen(eingaben: Eingaben): AuftragMesagxo[] {
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `Schlage aus diesen Eingaben sechs bis acht Namen für die Marke vor, je mit einer Zeile Begründung, die sich auf genannte Eingaben bezieht, und schreibe eine bessere Beschreibung in ein paar Sätzen: was es ist, für wen, was es besonders macht.\n\n${eingabenTeksto(
        eingaben,
      )}\n\n${JSON_BITTE} Aufbau:\n{"namen": [{"name": "…", "grund": "…"}], "beschreibung": "…"}`,
    },
  ];
}

/** The order of „Aufbau erkennen“: a fixed question about the one image (no brand text). */
export function auftragAufbau(): AuftragMesagxo[] {
  const werte = (Object.keys(MERKMALE_WERTE) as (keyof Merkmale)[])
    .map((k) => `"${k}": ${MERKMALE_WERTE[k].map((w) => `"${w}"`).join(" | ")}`)
    .join(", ");
  return [
    {
      role: "system",
      content:
        "Du beschreibst den Aufbau einer gestalteten Seite (Website, Plakat, App) auf einem Bild. Du schreibst Deutsch.",
    },
    {
      role: "user",
      content: `Beschreibe den Aufbau der Seite auf dem Bild: großes Titelbild oder nicht, Kartenraster, Liste oder Fließtext, luftig oder dicht, mittig oder linksbündig, Schrift groß oder zurückhaltend. ${JSON_BITTE} Aufbau:\n{"merkmale": {${werte}}, "worte": "der Aufbau in ein bis zwei Sätzen"}`,
    },
  ];
}

// ---------------------------------------------------------------------------------------------
// Reading the answers (lenient; unreadable parts go to `verworfen`)

/** The JSON object of an answer: without code fences, from the first `{` to the last `}`. */
function objektoDe(teksto: string): Objekto | undefined {
  const sen = teksto.replace(/```[a-zA-Z]*\s*/g, "").replace(/```/g, "");
  const komenco = sen.indexOf("{");
  const fino = sen.lastIndexOf("}");
  if (komenco < 0 || fino <= komenco) return undefined;
  try {
    const wert: unknown = JSON.parse(sen.slice(komenco, fino + 1));
    return isObjekto(wert) ? wert : undefined;
  } catch {
    return undefined;
  }
}

/** One font family of the catalog, case ignored (then the id itself); undefined outside it. */
function tiparoDe(
  roh: unknown,
  katalogo: readonly { id: string; family: string }[],
): string | undefined {
  if (!plena(roh)) return undefined;
  const sxlosilo = roh.trim().toLowerCase();
  return (
    katalogo.find((t) => t.family.toLowerCase() === sxlosilo)?.id ??
    katalogo.find((t) => t.id.toLowerCase() === sxlosilo)?.id
  );
}

const farbVorschlagDe = (roh: unknown): FarbVorschlag | undefined =>
  isObjekto(roh) && typeof roh.hex === "string" && HEX.test(roh.hex.trim())
    ? { hex: roh.hex.trim().toLowerCase(), grund: plena(roh.grund) ? roh.grund : "" }
    : undefined;

/** What `legiProfil` reads: the profile without what the route adds (abdruck, inputs, cost). */
export type ProfilLego = Omit<Profil, "abdruck" | "eingaben" | "kosto" | "gesichert">;

/**
 * Reads the answer of „Marke auswerten“. Readable: a text with content; the first three readable
 * Leitgedanken (fewer: kept, and named in `verworfen`); three to five Charakter words (more: the
 * first five; fewer: kept and named); a colour `#rrggbb`; a font pair whose families are in the
 * catalog (stored as ids). Every other part goes to `verworfen`; undefined when nothing reads. No
 * rule, contrast or limit filters a value (Ä-4).
 */
export function legiProfil(
  teksto: string,
  katalogo: readonly { id: string; family: string }[],
): ProfilLego | undefined {
  const roh = objektoDe(teksto);
  if (roh === undefined) return undefined;
  const out: ProfilLego = {};
  const verworfen: string[] = [];
  if (plena(roh.kernsatz)) out.kernsatz = roh.kernsatz;
  else verworfen.push("kernsatz");
  const leitgedanken = Array.isArray(roh.leitgedanken)
    ? roh.leitgedanken.flatMap((e): Leitgedanke[] =>
        isObjekto(e) && plena(e.titel) && plena(e.text) ? [{ titel: e.titel, text: e.text }] : [],
      )
    : [];
  if (leitgedanken.length > 0) out.leitgedanken = leitgedanken.slice(0, 3);
  if (leitgedanken.length < 3) verworfen.push("leitgedanken");
  const charakter = Array.isArray(roh.charakter) ? roh.charakter.filter(plena) : [];
  if (charakter.length > 0) out.charakter = charakter.slice(0, 5);
  if (charakter.length < 3) verworfen.push("charakter");
  for (const kampo of ["passt", "reibt"] as const) {
    const listo = roh[kampo];
    if (Array.isArray(listo)) out[kampo] = listo.filter(plena);
    else verworfen.push(kampo);
  }
  const v = isObjekto(roh.vorschlag) ? roh.vorschlag : {};
  const vorschlag: ProfilVorschlag = {};
  for (const teil of ["primaer", "akzent", "neutral"] as const) {
    const farbo = farbVorschlagDe(v[teil]);
    if (farbo === undefined) verworfen.push(teil);
    else vorschlag[teil] = farbo;
  }
  const s = isObjekto(v.schrift) ? v.schrift : {};
  const display = tiparoDe(s.display, katalogo);
  const body = tiparoDe(s.body, katalogo);
  if (display === undefined || body === undefined) verworfen.push("schrift");
  else vorschlag.schrift = { display, body, grund: plena(s.grund) ? s.grund : "" };
  if (Object.keys(vorschlag).length > 0) out.vorschlag = vorschlag;
  if (Object.keys(out).length === 0) return undefined;
  if (verworfen.length > 0) out.verworfen = verworfen;
  return out;
}

/** What `legiNamen` reads: the proposal without what the route adds. */
export type NamenLego = Omit<NamenVorschlag, "abdruck" | "kosto" | "gesichert">;

/**
 * Reads the answer of „Namen und Beschreibung“: names with their reason (the first eight; fewer
 * than six, or one that does not read: kept and `namen` named in `verworfen`) and the description.
 * Undefined when neither a name nor the description reads.
 */
export function legiNamen(teksto: string): NamenLego | undefined {
  const roh = objektoDe(teksto);
  if (roh === undefined) return undefined;
  const listo = Array.isArray(roh.namen) ? roh.namen : [];
  const namen = listo.flatMap((e): NamenIdee[] =>
    isObjekto(e) && plena(e.name) ? [{ name: e.name, grund: plena(e.grund) ? e.grund : "" }] : [],
  );
  const beschreibung = plena(roh.beschreibung) ? roh.beschreibung : undefined;
  if (namen.length === 0 && beschreibung === undefined) return undefined;
  const out: NamenLego = { namen: namen.slice(0, 8) };
  if (beschreibung !== undefined) out.beschreibung = beschreibung;
  const verworfen: string[] = [];
  if (namen.length < 6 || namen.length < listo.length) verworfen.push("namen");
  if (beschreibung === undefined) verworfen.push("beschreibung");
  if (verworfen.length > 0) out.verworfen = verworfen;
  return out;
}

/** What `legiAufbau` reads. */
export interface AufbauLego {
  merkmale: MerkmaleLego;
  worte?: string;
  verworfen?: string[];
}

/**
 * Reads the answer of „Aufbau erkennen“: each feature on its own (a value outside its list makes
 * only that one unreadable) and the words. Undefined when neither a feature nor the words read.
 */
export function legiAufbau(teksto: string): AufbauLego | undefined {
  const roh = objektoDe(teksto);
  if (roh === undefined) return undefined;
  const m = isObjekto(roh.merkmale) ? roh.merkmale : {};
  const merkmale: MerkmaleLego = {};
  const verworfen: string[] = [];
  for (const k of Object.keys(MERKMALE_WERTE) as (keyof Merkmale)[]) {
    const wert = m[k];
    if (typeof wert === "string" && (MERKMALE_WERTE[k] as readonly string[]).includes(wert))
      (merkmale as Record<string, string>)[k] = wert;
    else verworfen.push(k);
  }
  const worte = plena(roh.worte) ? roh.worte : undefined;
  if (Object.keys(merkmale).length === 0 && worte === undefined) return undefined;
  const out: AufbauLego = { merkmale };
  if (worte === undefined) verworfen.push("worte");
  else out.worte = worte;
  if (verworfen.length > 0) out.verworfen = verworfen;
  return out;
}

// ---------------------------------------------------------------------------------------------
// The layout of the view „Marke“

/** „a, b und c“. */
const kaj = (partoj: readonly string[]): string =>
  partoj.length <= 1
    ? (partoj[0] ?? "")
    : `${partoj.slice(0, -1).join(", ")} und ${partoj[partoj.length - 1]}`;

/**
 * The fixed mapping features → layout (tech spec, in this order): „karten“ → Kartenraster; „liste“,
 * or left-aligned with restrained type and no large title image → Ruhige Liste; a large title image
 * or large type → Großer Titel; else the first layout. The reason is a finished German sentence
 * from the features (without a full stop: the node writes it after „wie Layout-Beispiel · “).
 */
export function aufbauDe(merkmale: MerkmaleLego | undefined): { aufbau: AufbauId; grund: string } {
  const m = merkmale ?? {};
  const satz = (aufbau: AufbauId, weil: string) => ({
    aufbau,
    grund: `${AUFBAU_ETIKEDOJ[aufbau]}, weil ${weil}`,
  });
  if (m.inhalt === "karten") {
    const dichte = m.dichte === "luftig" ? "luftiges " : m.dichte === "dicht" ? "dichtes " : "";
    return satz("raster", `das Beispiel ein ${dichte}Raster aus Karten zeigt`);
  }
  const ruhig = m.achse === "links" && m.schrift === "zurueckhaltend" && m.titelbild !== "gross";
  if (m.inhalt === "liste" || ruhig) {
    const partoj = [
      m.achse === "links" ? "linksbündig ist" : "",
      m.inhalt === "liste" ? "eine Liste zeigt" : "",
      m.schrift === "zurueckhaltend" ? "die Schrift zurückhält" : "",
    ].filter((p) => p !== "");
    return satz("liste", `das Beispiel ${kaj(partoj)}`);
  }
  if (m.titelbild === "gross" || m.schrift === "gross") {
    const partoj = [
      m.titelbild === "gross" ? "ein großes Titelbild" : "",
      m.schrift === "gross" ? "große Schrift" : "",
    ].filter((p) => p !== "");
    return satz("titel", `das Beispiel ${kaj(partoj)} zeigt`);
  }
  if (Object.keys(m).length === 0) return satz(AUFBAUOJ[0], "noch keine Merkmale erkannt sind");
  return satz(AUFBAUOJ[0], "die Merkmale zu keinem Aufbau eindeutig passen");
}

/**
 * The effective layout of a preview node: its hand choice; for „auto“ (also absent or unreadable)
 * the layout of the Layout-Beispiel's features, without features the first layout.
 */
export function wirksamerAufbau(
  knoto: { aufbau?: unknown } | undefined,
  layout: { merkmale?: MerkmaleLego } | undefined,
): AufbauId {
  const wahl = estasAufbauWahl(knoto?.aufbau) ? knoto.aufbau : "auto";
  if (wahl !== "auto") return wahl;
  const merkmale = layout?.merkmale;
  if (merkmale === undefined || Object.keys(merkmale).length === 0) return AUFBAUOJ[0];
  return aufbauDe(merkmale).aufbau;
}

// ---------------------------------------------------------------------------------------------
// The display estimate (never a limit)

/** Characters per token for the input estimate (display only). */
const ZEICHEN_JE_TOKEN = 4;

/**
 * The output tokens per purpose until the Kroniko has own calls of that purpose (display only;
 * documented in `specs/058-marke-auswerten/tasks.md`, MAW-1.1).
 */
export const SCHAETZUNG_STARTO: Readonly<Record<Zweck, number>> = {
  profil: 900,
  namen: 500,
  aufbau: 250,
};

/** One Kroniko entry as far as the estimate reads it. */
export interface KronikoSpuro {
  kosto?: { eligo?: number };
  detaloj?: Record<string, unknown>;
}

/** An estimate of a model call for the button: tokens, dollars when the model has a price, text. */
export interface Schaetzung {
  enigo: number;
  eligo: number;
  usd?: number;
  text: string;
}

/** Dollars as the screen says them (four places, a comma), as `dollarsOf` of the Takso does. */
const dolaroj = (usd: number): string =>
  usd === 0 ? "0 $" : usd < 0.00005 ? "< 0,0001 $" : `${usd.toFixed(4).replace(".", ",")} $`;

/**
 * The estimate of a call (tech spec „Kosten und Protokoll“): input from the length of the order,
 * output from the median of the own earlier calls of this purpose in the Kroniko
 * (`detaloj.zweck`), else the start value of the purpose. `preise`: dollars per million tokens of
 * the configured model (the caller's `prezoOf`); without them the text names tokens. Display only.
 */
export function schaetzungDe(
  zweck: Zweck,
  auftrag: readonly { content: string }[],
  preise: { enigo?: number; eligo?: number } | undefined,
  kroniko: readonly KronikoSpuro[],
): Schaetzung {
  const zeichen = auftrag.reduce((n, m) => n + m.content.length, 0);
  const enigo = Math.ceil(zeichen / ZEICHEN_JE_TOKEN);
  const eligoj = kroniko
    .filter((e) => e.detaloj?.zweck === KRONIKO_ZWECKOJ[zweck])
    .flatMap((e) => {
      const eligo = e.kosto?.eligo;
      return typeof eligo === "number" && Number.isFinite(eligo) ? [eligo] : [];
    })
    .sort((a, b) => a - b);
  const eligo =
    eligoj.length === 0 ? SCHAETZUNG_STARTO[zweck] : (eligoj[Math.floor(eligoj.length / 2)] ?? 0);
  if (preise === undefined) return { enigo, eligo, text: `≈ ${enigo + eligo} Tokens` };
  const usd = (enigo * (preise.enigo ?? 0) + eligo * (preise.eligo ?? 0)) / 1e6;
  return { enigo, eligo, usd, text: `≈ ${dolaroj(usd)}` };
}

// ---------------------------------------------------------------------------------------------
// The view „Marke“, writing one node's content, one Stand per result

/**
 * The raw pieces of the view „Marke“: the name, and from the Markenprofil Kernsatz, Leitgedanken
 * and Charakter; from the connected inputs the description, the values and the traits. The
 * fallback table is `markeKorpo`'s (MAW-4.2). `abdruckDe(markeInhaltDe(…))` is the preview's `inh`.
 */
export function markeInhaltDe(stato: StatoLego, name: string): MarkeInhalt {
  const a = ankommendesDe(stato.knoten, markoVerbunden(stato));
  const profil = enhavoDe("marko", knotoDe(stato.knoten, "marko")?.inhalt)?.profil;
  const out: MarkeInhalt = { name };
  if (profil?.kernsatz !== undefined) out.kernsatz = profil.kernsatz;
  if (a.beschreibung !== undefined) out.beschreibung = a.beschreibung;
  if (profil?.leitgedanken !== undefined && profil.leitgedanken.length > 0)
    out.leitgedanken = profil.leitgedanken;
  if (a.werte !== undefined) out.werte = a.werte;
  if (profil?.charakter !== undefined && profil.charakter.length > 0)
    out.charakter = profil.charakter;
  if (a.persoenlichkeit !== undefined && a.persoenlichkeit.length > 0)
    out.persoenlichkeit = a.persoenlichkeit;
  return out;
}

/** The `speco` a node carries in the state when it is added here (absent for fixed nodes). */
function specoDe(id: string): LeinwandStatoKnoto["speco"] {
  if (id === KI_NAMEN_ID) return "ki";
  if (id.startsWith("vorschau-") && id !== "vorschau-hell" && id !== "vorschau-dunkel")
    return "vorschau";
  return enhavoSpecoDe(id);
}

/**
 * The state with only the content of node `id` replaced (the KI routes write their result with
 * it): every other node, `kabloj` and `geloest` stay as they are; a node that is not in the state
 * yet is added at the end (with its `speco` when it is an added kind). The input is not changed.
 */
export function knotoInhaltMeti(
  stato: LeinwandStato,
  id: string,
  inhalt: Record<string, unknown>,
): LeinwandStato {
  const ekzistas = stato.knoten.some((k) => k.id === id);
  const speco = specoDe(id);
  const knoten = ekzistas
    ? stato.knoten.map((k) => (k.id === id ? { ...k, inhalt } : k))
    : [...stato.knoten, { id, ...(speco === undefined ? {} : { speco }), inhalt }];
  return { ...stato, knoten };
}

/** Whether taking over from this result first needs a Stand (E-2): while it has no `gesichert`. */
export function brauchtStand(ergebnis: Pick<Profil, "abdruck" | "gesichert"> | undefined): boolean {
  return ergebnis !== undefined && ergebnis.gesichert === undefined;
}
