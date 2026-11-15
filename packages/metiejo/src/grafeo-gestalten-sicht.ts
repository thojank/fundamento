// Spec 054 (MP-1, T1): the data of the view Gestalten that server and canvas share – the Bildo
// types, the fixed places ARANGXO_054 with the place rule, the connection rules of the session,
// the effective view `kabloj` as text, the catalog „+ Knoten“, the preview address and the calm
// German sentences. Like grafeo-sicht.ts this module has no import at all – not even a type – so
// the browser bundle of @fundamento/nodredaktilo takes it through an alias (047 D-2). Pure and
// deterministic: no clock, no randomness, no storage; outputs follow fixed orders.

// ---------------------------------------------------------------------------------------------
// Data model (tech spec „Datenmodell der Ansicht Gestalten“)

/** The kind of a port; only ports of the same kind connect. MP-1 uses farbo, mezuro and marko. */
export type Anschlussart = "teksto" | "farbo" | "tiparo" | "mezuro" | "marko";

/** The sign of a catalog entry: a port kind, or a kind only the catalog shows (picture, KI). */
export type Zeichen = Anschlussart | "bildo" | "ki";

/** A colour node and the palette row it feeds by default. */
export type FarboRolo =
  | "primaer"
  | "akzent"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type FazoId = "fazo-1" | "fazo-2" | "fazo-3" | "fazo-4" | "fazo-5" | "fazo-6";

/** The palettes the derivation writes (agordilo `DerivedPaletteName`, restated: no import here). */
export type DerivedPaletteName =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "sekundo";

/** The colour scheme of a preview node. */
export type Schema = "hell" | "dunkel";

/** Per palette row the colour node that feeds it, or null. Only deviations from the Agordo. */
export type Kabloj = Partial<Record<FarboRolo, FarboRolo | null>>;

/** What a colour node shows: no field in the Agordo, the start value, set by hand, from material. */
export type FarboStato = "leer" | "startwert" | "von-hand" | "aus-material";

export interface BildoFazo {
  id: FazoId;
  speco: "fazo";
  nr: 1 | 2 | 3 | 4 | 5 | 6;
  titolo: string;
  /** MP-1 fills only phases 4 and 5; the others show „kommt später“. */
  malplena: boolean;
}

export interface BildoMarko {
  id: "marko";
  speco: "marko";
  fazo: "fazo-4";
}

export interface BildoFarbo {
  id: `farbo-${FarboRolo}`;
  speco: "farbo";
  fazo: "fazo-4";
  rolo: FarboRolo;
  /** As in the Agordo (hex or oklch text); absent = empty. Neutral has none. */
  wert?: string;
  /**
   * `#rrggbb` to draw: the own value, or derived (Neutral: its light step 100; an empty Akzent: the
   * neutral step that would carry it). Empty only when nothing can be derived (`ableitung: "fehlt"`).
   */
  hex: string;
  stato: FarboStato;
  /** The kind of the output: Neutral gives its Tönung (Maß), every other node a colour. */
  elir: "farbo" | "mezuro";
  /** Only Neutral: `neutral.toenung`, 0 when the Agordo has none. */
  toenung?: number;
}

export interface Stufo {
  stufo: string;
  tokeno: string;
  /** The light value (main set). */
  hex: string;
  gesetzt: boolean;
  /** Only where the dark value differs from the light one. */
  hexDunkel?: string;
  gesetztDunkel: boolean;
}

/** One palette row; every row has an input. */
export interface Vico {
  rolo: FarboRolo;
  paletro: DerivedPaletteName;
  etikedo: string;
  enir: "farbo" | "mezuro";
  /** The colour node connected to this row in the effective view, or null. */
  fonto: FarboRolo | null;
  /** That node's colour, for the small swatch at the row. */
  fontoHex?: string;
  /** The step that carries the colour; absent for Neutral and when no colour feeds the row. */
  basis?: string;
  /** Empty when the row has no colour (Akzent without Zweitfarbe) or the derivation failed. */
  stufoj: Stufo[];
}

export interface BildoPaletro {
  id: "paletro";
  speco: "paletro";
  fazo: "fazo-4";
  vicoj: Vico[];
}

export interface BildoVorschau {
  id: "vorschau-hell" | "vorschau-dunkel";
  speco: "vorschau";
  fazo: "fazo-5";
  schema: Schema;
  /** From `vorschauHref`: `?sxtupo=vorschau&…&scheme=…&rev=…[&kabloj=…]`. */
  href: string;
}

export type BildoNodo = BildoFazo | BildoMarko | BildoFarbo | BildoPaletro | BildoVorschau;

/**
 * An edge between two ports: `marko.el`, `farbo-<rolo>.en`, `farbo-<rolo>.el`, `paletro.en.<rolo>`,
 * `paletro.el`, `vorschau-<id>.en`. `hex` on colour edges: the colour of the source.
 */
export interface BildoLigo {
  id: string;
  de: string;
  al: string;
  art: Anschlussart;
  hex?: string;
}

export interface Bildo {
  marko: { name: string; etikedo: string; stato: "entwurf-ungepruft" };
  rev: number;
  ableitung: "ok" | "fehlt";
  /** The effective view of this answer; {} = as in the Agordo. */
  kabloj: Kabloj;
  /** Phases first, then their nodes (R-13: a child after its parent). */
  nodoj: BildoNodo[];
  /** The edges that follow from the Agordo: the start of every session and of „zurücksetzen“. */
  ligoj: BildoLigo[];
}

/** One change the canvas writes (`POST /api/marko/:name/leinwand`), exactly one per request. */
export type LeinwandSxangxo =
  | { farbe: { rolle: Exclude<FarboRolo, "neutral">; wert: string | null } }
  | { toenung: number }
  | { stufe: { token: string; wert: string | null; schema?: Schema } };

// ---------------------------------------------------------------------------------------------
// Fixed orders and labels

/** The palette rows in their fixed order. */
export const FARBO_ROLOJ: readonly FarboRolo[] = [
  "neutral",
  "primaer",
  "akzent",
  "success",
  "warning",
  "danger",
  "info",
];

/** The Funktionsfarben, in the order they take the slots below Neutral. */
export const STATUS_ROLOJ: readonly FarboRolo[] = ["success", "warning", "danger", "info"];

export const ROLO_ETIKEDOJ: Readonly<Record<FarboRolo, string>> = {
  neutral: "Neutral",
  primaer: "Primär",
  akzent: "Akzent",
  success: "Erfolg",
  warning: "Warnung",
  danger: "Fehler",
  info: "Hinweis",
};

/** The derived palette of each row: Primär is the accent ramp, Akzent the Zweitfarbe's. */
export const ROLO_PALETRO: Readonly<Record<FarboRolo, DerivedPaletteName>> = {
  neutral: "neutral",
  primaer: "accent",
  akzent: "sekundo",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

export const FAZOJ: readonly BildoFazo[] = [
  { id: "fazo-1", speco: "fazo", nr: 1, titolo: "Ausgangslage", malplena: true },
  { id: "fazo-2", speco: "fazo", nr: 2, titolo: "Kern", malplena: true },
  { id: "fazo-3", speco: "fazo", nr: 3, titolo: "Stimme", malplena: true },
  { id: "fazo-4", speco: "fazo", nr: 4, titolo: "Gesicht", malplena: false },
  { id: "fazo-5", speco: "fazo", nr: 5, titolo: "Vorschau und Probe", malplena: false },
  { id: "fazo-6", speco: "fazo", nr: 6, titolo: "Einsatz", malplena: true },
];

// ---------------------------------------------------------------------------------------------
// Shared sentences (product spec, verbatim)

export const NELEGEBLA_SATZ =
  "Diesen Farbwert kann Fundamento nicht lesen. Schreibe ihn als #RRGGBB oder oklch(L C H).";
export const NE_KONSERVITA_SATZ = "Nicht gespeichert. Noch einmal versuchen.";
export const ABLEITUNG_FEHLT_SATZ = "Diesen Stand kann die Ableitung gerade nicht zeigen.";
export const NE_KONEKTITA_SATZ =
  "Nicht verbunden. Ziehe eine Verbindung von der Palette oder der Marke hierher.";

// ---------------------------------------------------------------------------------------------
// Fixed places (E-9): from the mockup's GRUPPEN, PLATZ, fnPlatz and vorschauPlatz

export interface Pozicio {
  x: number;
  y: number;
}

export interface Platz extends Pozicio {
  largxo: number;
}

export interface FazoPlatz extends Platz {
  alteco: number;
}

/**
 * Place and size of the phases (absolute), and the start places of the nodes relative to their
 * phase. The mockup lays the phases at y 96 with a height of 1016; a node's place there minus its
 * phase's origin is its place here. Never computed from the graph, never stored.
 */
export const ARANGXO_054 = {
  fazoj: {
    "fazo-1": { x: 24, y: 96, largxo: 150, alteco: 1016 },
    "fazo-2": { x: 186, y: 96, largxo: 150, alteco: 1016 },
    "fazo-3": { x: 348, y: 96, largxo: 150, alteco: 1016 },
    "fazo-4": { x: 510, y: 96, largxo: 910, alteco: 1016 },
    "fazo-5": { x: 1432, y: 96, largxo: 420, alteco: 1016 },
    "fazo-6": { x: 1864, y: 96, largxo: 150, alteco: 1016 },
  } satisfies Record<FazoId, FazoPlatz>,
  /** The fixed nodes, relative to their phase. */
  nodoj: {
    marko: { x: 24, y: 91, largxo: 190 },
    "farbo-primaer": { x: 260, y: 54, largxo: 264 },
    "farbo-akzent": { x: 260, y: 244, largxo: 264 },
    "farbo-neutral": { x: 260, y: 434, largxo: 264 },
    paletro: { x: 576, y: 54, largxo: 316 },
    "vorschau-hell": { x: 24, y: 54, largxo: 372 },
    "vorschau-dunkel": { x: 24, y: 524, largxo: 372 },
  } satisfies Record<string, Platz>,
  /** The Funktionsfarben present take these slots in STATUS_ROLOJ order: y + index · dy. */
  funkcioj: { x: 260, y: 630, largxo: 264, dy: 100 },
  /** Further previews of the session, the k-th (0-based) at x + k · dx, y + k · dy. */
  weitereVorschauen: { x: 54, y: 104, largxo: 372, dx: 30, dy: 30 },
} as const;

const FIKSAJ = ARANGXO_054.nodoj as Readonly<Record<string, Platz>>;
const FAZO_PLATZOJ = ARANGXO_054.fazoj as Readonly<Record<string, FazoPlatz>>;

const isStatusNodo = (id: string): boolean => STATUS_ROLOJ.some((rolo) => id === `farbo-${rolo}`);
const isWeitereVorschau = (id: string): boolean => id.startsWith("vorschau-") && !(id in FIKSAJ);

/** The width a node starts with (the mockup's); 0 for an unknown id. Phases: their width. */
export function largxoDe(id: string): number {
  return (
    FAZO_PLATZOJ[id]?.largxo ??
    FIKSAJ[id]?.largxo ??
    (isStatusNodo(id)
      ? ARANGXO_054.funkcioj.largxo
      : isWeitereVorschau(id)
        ? ARANGXO_054.weitereVorschauen.largxo
        : 0)
  );
}

/**
 * The places of the current nodes (E-9): a node or phase in `verschoben` keeps that place, every
 * other one gets its start place from ARANGXO_054 for the current nodes – phases absolute, every
 * other node relative to its phase, so nodes move with their phase. Present Funktionsfarben fill
 * their slots in the fixed order; further previews (`vorschau-*` beyond hell/dunkel) are offset in
 * the order they come. Entries for nodes that are gone drop out. An id without a start place
 * starts at the origin of its phase.
 */
export function poziciojKun(
  verschoben: ReadonlyMap<string, Pozicio>,
  nodoj: readonly { id: string; fazo?: FazoId }[],
): Map<string, Pozicio> {
  const ids = new Set(nodoj.map((n) => n.id));
  const statusSlot = new Map(
    STATUS_ROLOJ.map((rolo) => `farbo-${rolo}`)
      .filter((id) => ids.has(id))
      .map((id, index) => [id, index] as const),
  );
  const weitereSlot = new Map(
    nodoj
      .map((n) => n.id)
      .filter(isWeitereVorschau)
      .map((id, index) => [id, index] as const),
  );
  const out = new Map<string, Pozicio>();
  for (const { id } of nodoj) {
    if (out.has(id)) continue;
    const moved = verschoben.get(id);
    if (moved !== undefined) {
      out.set(id, { x: moved.x, y: moved.y });
      continue;
    }
    const platz = FAZO_PLATZOJ[id] ?? FIKSAJ[id];
    const status = statusSlot.get(id);
    const weitere = weitereSlot.get(id);
    if (platz !== undefined) out.set(id, { x: platz.x, y: platz.y });
    else if (status !== undefined) {
      const { x, y, dy } = ARANGXO_054.funkcioj;
      out.set(id, { x, y: y + status * dy });
    } else if (weitere !== undefined) {
      const { x, y, dx, dy } = ARANGXO_054.weitereVorschauen;
      out.set(id, { x: x + weitere * dx, y: y + weitere * dy });
    } else out.set(id, { x: 0, y: 0 });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Ports and connection rules (E-11)

export interface Anschluss {
  /** The node the port belongs to. */
  nodo: string;
  /** `el` = output, `en` = input. */
  direkto: "el" | "en";
  art: Anschlussart;
}

const isFarboRolo = (text: string): text is FarboRolo =>
  (FARBO_ROLOJ as readonly string[]).includes(text);

/** Where a node stands in the flow Marke → Farbe → Palette → Vorschau; edges only go forward. */
const RANGO: Readonly<Record<string, number>> = { marko: 0, farbo: 1, paletro: 2, vorschau: 3 };

/** The node, direction and kind of a port id; undefined for anything that is no port. */
export function anschlussDe(port: string): Anschluss | undefined {
  if (port === "marko.el") return { nodo: "marko", direkto: "el", art: "marko" };
  if (port === "paletro.el") return { nodo: "paletro", direkto: "el", art: "marko" };
  const farbo = /^farbo-([a-z]+)\.(el|en)$/.exec(port);
  if (farbo !== null) {
    const [, rolo = "", direkto] = farbo;
    if (!isFarboRolo(rolo)) return undefined;
    if (direkto === "en") return { nodo: `farbo-${rolo}`, direkto: "en", art: "marko" };
    return { nodo: `farbo-${rolo}`, direkto: "el", art: rolo === "neutral" ? "mezuro" : "farbo" };
  }
  const vico = /^paletro\.en\.([a-z]+)$/.exec(port);
  if (vico !== null) {
    const rolo = vico[1] ?? "";
    if (!isFarboRolo(rolo)) return undefined;
    return { nodo: "paletro", direkto: "en", art: rolo === "neutral" ? "mezuro" : "farbo" };
  }
  const vorschau = /^(vorschau-[a-z0-9-]+)\.en$/.exec(port);
  if (vorschau?.[1] !== undefined) return { nodo: vorschau[1], direkto: "en", art: "marko" };
  return undefined;
}

const specoDe = (nodo: string): string => nodo.split("-")[0] ?? nodo;

/** The id of the edge between two ports. */
export function ligoId(de: string, al: string): string {
  return `${de}>${al}`;
}

/**
 * Whether `de` → `al` may be drawn: `de` an output, `al` an input, both of the same kind, and the
 * edge closes no cycle. The flow Marke → Farbe → Palette → Vorschau has no way back, so an edge
 * must go forward in it: the Palette never feeds a colour node, a node never itself. `ligoj`
 * (the current edges) are checked for a cycle through the new edge as well.
 */
export function validaLigo(ligoj: readonly BildoLigo[], de: string, al: string): boolean {
  const el = anschlussDe(de);
  const en = anschlussDe(al);
  if (el === undefined || en === undefined) return false;
  if (el.direkto !== "el" || en.direkto !== "en" || el.art !== en.art) return false;
  const rangoDe = RANGO[specoDe(el.nodo)];
  const rangoAl = RANGO[specoDe(en.nodo)];
  if (rangoDe === undefined || rangoAl === undefined || rangoDe >= rangoAl) return false;
  // A path from the target node back to the source node would close a cycle.
  const naechste = new Map<string, string[]>();
  for (const ligo of ligoj) {
    const von = anschlussDe(ligo.de)?.nodo;
    const nach = anschlussDe(ligo.al)?.nodo;
    if (von === undefined || nach === undefined) continue;
    naechste.set(von, [...(naechste.get(von) ?? []), nach]);
  }
  const gesehen = new Set<string>([en.nodo]);
  const offen = [en.nodo];
  for (let index = 0; index < offen.length; index += 1) {
    const nodo = offen[index] ?? "";
    if (nodo === el.nodo) return false;
    for (const nach of naechste.get(nodo) ?? []) {
      if (gesehen.has(nach)) continue;
      gesehen.add(nach);
      offen.push(nach);
    }
  }
  return true;
}

/** What the session changed about the edges, kept in React state only. */
export interface LigoSitzung {
  /** Ids of edges of the Agordo (`bildo.ligoj`) the session detached. */
  geloest: readonly string[];
  /** Edges the session drew, oldest first; at the same input the later one wins. */
  gezogen: readonly { de: string; al: string }[];
  /** Nodes that live only in the session (an empty Funktionsfarbe, a further preview). */
  nodoj: readonly string[];
}

/**
 * The edges of the session after a new Bildo: the Agordo's edges without the detached ones, then
 * the drawn ones, each replacing the edge at its input. An input carries at most one edge. Edges
 * at nodes that exist neither in the Bildo nor in the session drop out, and so does a drawn edge
 * the rules refuse. A drawn colour edge carries the colour of its source node from the Bildo. To
 * keep an input empty after removing a drawn edge, the session also lists the Agordo's edge it
 * replaced in `geloest`.
 */
export function ligojKun(sitzung: LigoSitzung, bildo: Bildo): BildoLigo[] {
  const nodoj = new Set([...bildo.nodoj.map((n) => n.id), ...sitzung.nodoj]);
  const hexDe = new Map<string, string>(
    bildo.nodoj.flatMap((n) =>
      n.speco === "farbo" && n.hex !== "" ? [[n.id, n.hex] as const] : [],
    ),
  );
  const geloest = new Set(sitzung.geloest);
  const exists = (port: string): boolean => {
    const nodo = anschlussDe(port)?.nodo;
    return nodo !== undefined && nodoj.has(nodo);
  };
  let out = bildo.ligoj.filter((l) => !geloest.has(l.id) && exists(l.de) && exists(l.al));
  for (const { de, al } of sitzung.gezogen) {
    if (!exists(de) || !exists(al) || !validaLigo(out, de, al)) continue;
    const el = anschlussDe(de);
    if (el === undefined) continue;
    const ligo: BildoLigo = { id: ligoId(de, al), de, al, art: el.art };
    const hex = el.art === "farbo" ? hexDe.get(el.nodo) : undefined;
    if (hex !== undefined) ligo.hex = hex;
    out = [...out.filter((l) => l.al !== al), ligo];
  }
  return out;
}

/** Whether a colour node exists and carries a value: an empty one feeds nothing. */
function kolora(nodoj: ReadonlyMap<string, { stato?: string }>, rolo: FarboRolo): boolean {
  const nodo = nodoj.get(`farbo-${rolo}`);
  return nodo !== undefined && nodo.stato !== "leer";
}

/**
 * The effective view of the edges: per palette row the colour node at `paletro.en.<rolo>`,
 * provided that node hangs on `marko.el`, carries a value and is of the row's kind; else null.
 * Only rows that differ from the Agordo come back (the Agordo: each row fed by its own node, when
 * that node has a value). `{}` means nothing changed. `nodoj` are the Bildo's and the session's.
 */
export function kablojDe(
  ligoj: readonly BildoLigo[],
  nodoj: readonly { id: string; stato?: string }[],
): Kabloj {
  const byId = new Map(nodoj.map((n) => [n.id, n] as const));
  const quelleAn = new Map(ligoj.map((l) => [l.al, l.de] as const));
  const out: Kabloj = {};
  for (const rolo of FARBO_ROLOJ) {
    const vorgabe = kolora(byId, rolo) ? rolo : null;
    const quelle = /^farbo-([a-z]+)\.el$/.exec(quelleAn.get(`paletro.en.${rolo}`) ?? "")?.[1];
    let wirksam: FarboRolo | null = null;
    if (
      quelle !== undefined &&
      isFarboRolo(quelle) &&
      (quelle === "neutral") === (rolo === "neutral") &&
      quelleAn.get(`farbo-${quelle}.en`) === "marko.el" &&
      kolora(byId, quelle)
    ) {
      wirksam = quelle;
    }
    if (wirksam !== vorgabe) out[rolo] = wirksam;
  }
  return out;
}

/** `kabloj` as the parameter text: `ziel:quelle` in row order, `-` for null; "" for {}. */
export function kablojTeksto(kabloj: Kabloj): string {
  return FARBO_ROLOJ.flatMap((rolo) => {
    const quelle = kabloj[rolo];
    return quelle === undefined ? [] : [`${rolo}:${quelle ?? "-"}`];
  }).join(",");
}

/**
 * Reads the parameter text. Undefined (→ 400) for an unknown name, a duplicate target, a colour
 * on `neutral`, `neutral` on a colour row, or anything else that `kablojTeksto` does not write.
 */
export function kablojEl(teksto: string): Kabloj | undefined {
  const out: Kabloj = {};
  if (teksto === "") return out;
  for (const paro of teksto.split(",")) {
    const match = /^([a-z]+):([a-z]+|-)$/.exec(paro);
    const ziel = match?.[1] ?? "";
    const quelleTeksto = match?.[2] ?? "";
    if (!isFarboRolo(ziel) || ziel in out) return undefined;
    if (quelleTeksto === "-") {
      out[ziel] = null;
      continue;
    }
    if (!isFarboRolo(quelleTeksto)) return undefined;
    if ((ziel === "neutral") !== (quelleTeksto === "neutral")) return undefined;
    out[ziel] = quelleTeksto;
  }
  return out;
}

/**
 * The address of a preview node: the brand's preview without Prüfmarken (`sxtupo=vorschau`, never a
 * Bühne), its scheme, the rev, and `kabloj` when the view differs from the Agordo. The kabloj text
 * only holds `[a-z:,-]`, so it stands in the query as it is.
 */
export function vorschauHref(marko: string, schema: Schema, rev: number, kabloj: Kabloj): string {
  const teksto = kablojTeksto(kabloj);
  return `/marko/${encodeURIComponent(marko)}/vorschau?sxtupo=vorschau&breite=mittel&scheme=${
    schema === "hell" ? "light" : "dark"
  }&rev=${rev}${teksto === "" ? "" : `&kabloj=${teksto}`}`;
}

// ---------------------------------------------------------------------------------------------
// The catalog „+ Knoten“ (E-13)

export type KatalogoGrupo =
  | "Eingabe"
  | "Vorschlag"
  | "Probe"
  | "Gestalt"
  | "Vorschau"
  | "Ausgabe"
  | "Ordnung";

export type Lauf = "MP-1" | "MP-2" | "MP-3" | "MP-4" | "MP-5";

export interface KatalogoEnskribo {
  grupo: KatalogoGrupo;
  nomo: string;
  zeichen: Zeichen;
  lauf: Lauf;
  /** MP-1 entries: the node the entry stands for (`vorschau` for a further preview). */
  nodo?: string;
}

/** What an entry of „+ Knoten“ offers. */
export type AldonStato = "anlegen" | "setzen" | "weitere" | "da" | "spaeter";

/** The German word each state shows in the list. */
export const ALDON_ETIKEDOJ: Readonly<Record<AldonStato, string>> = {
  anlegen: "anlegen",
  setzen: "setzen",
  weitere: "weitere anlegen",
  da: "auf der Leinwand",
  spaeter: "kommt später",
};

export interface Aldoneblo extends KatalogoEnskribo {
  stato: AldonStato;
}

/**
 * Every node kind, grouped by purpose, after the mockup's KATALOG and the concept's catalog (9.3).
 * The run follows the concept's cut (8); „Anteile“, „Überschrift“ and „Rahmen“, which the concept
 * puts in MP-1, are not built in MP-1 (product spec, Scope) and come later.
 */
export const KATALOGO_054: readonly KatalogoEnskribo[] = [
  { grupo: "Eingabe", nomo: "Marke", zeichen: "marko", lauf: "MP-1", nodo: "marko" },
  { grupo: "Eingabe", nomo: "Text", zeichen: "teksto", lauf: "MP-2" },
  { grupo: "Eingabe", nomo: "Werte", zeichen: "teksto", lauf: "MP-2" },
  { grupo: "Eingabe", nomo: "Tonalität", zeichen: "mezuro", lauf: "MP-2" },
  { grupo: "Eingabe", nomo: "Material", zeichen: "bildo", lauf: "MP-5" },
  { grupo: "Eingabe", nomo: "Wettbewerb", zeichen: "teksto", lauf: "MP-5" },
  { grupo: "Vorschlag", nomo: "Richtung", zeichen: "ki", lauf: "MP-2" },
  { grupo: "Vorschlag", nomo: "Textvorschlag", zeichen: "ki", lauf: "MP-2" },
  { grupo: "Probe", nomo: "Belastungsprobe", zeichen: "ki", lauf: "MP-4" },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Primär",
    zeichen: "farbo",
    lauf: "MP-1",
    nodo: "farbo-primaer",
  },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Akzent",
    zeichen: "farbo",
    lauf: "MP-1",
    nodo: "farbo-akzent",
  },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Neutral",
    zeichen: "mezuro",
    lauf: "MP-1",
    nodo: "farbo-neutral",
  },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Erfolg",
    zeichen: "farbo",
    lauf: "MP-1",
    nodo: "farbo-success",
  },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Warnung",
    zeichen: "farbo",
    lauf: "MP-1",
    nodo: "farbo-warning",
  },
  {
    grupo: "Gestalt",
    nomo: "Farbe · Fehler",
    zeichen: "farbo",
    lauf: "MP-1",
    nodo: "farbo-danger",
  },
  { grupo: "Gestalt", nomo: "Farbe · Hinweis", zeichen: "farbo", lauf: "MP-1", nodo: "farbo-info" },
  { grupo: "Gestalt", nomo: "Palette", zeichen: "marko", lauf: "MP-1", nodo: "paletro" },
  { grupo: "Gestalt", nomo: "Anteile", zeichen: "farbo", lauf: "MP-3" },
  { grupo: "Gestalt", nomo: "Schrift", zeichen: "tiparo", lauf: "MP-3" },
  { grupo: "Gestalt", nomo: "Form und Raum", zeichen: "mezuro", lauf: "MP-3" },
  { grupo: "Gestalt", nomo: "Tiefe und Bewegung", zeichen: "mezuro", lauf: "MP-3" },
  { grupo: "Gestalt", nomo: "Logo", zeichen: "bildo", lauf: "MP-3" },
  { grupo: "Vorschau", nomo: "Komponenten", zeichen: "marko", lauf: "MP-1", nodo: "vorschau" },
  { grupo: "Vorschau", nomo: "Seite", zeichen: "marko", lauf: "MP-3" },
  { grupo: "Vorschau", nomo: "Harte Fälle", zeichen: "marko", lauf: "MP-4" },
  { grupo: "Ausgabe", nomo: "Leitfaden", zeichen: "marko", lauf: "MP-4" },
  { grupo: "Ausgabe", nomo: "Export", zeichen: "marko", lauf: "MP-4" },
  { grupo: "Ordnung", nomo: "Überschrift", zeichen: "teksto", lauf: "MP-3" },
  { grupo: "Ordnung", nomo: "Rahmen", zeichen: "teksto", lauf: "MP-3" },
  { grupo: "Ordnung", nomo: "Notiz", zeichen: "teksto", lauf: "MP-3" },
];

/**
 * The state of every catalog entry for the nodes on the canvas (Bildo and session): a
 * Funktionsfarbe not on the canvas → `anlegen`; Akzent while empty → `setzen`; the component
 * preview → `weitere`; any other MP-1 entry → `da`; every later run → `spaeter`.
 */
export function aldonebloj(
  katalogo: readonly KatalogoEnskribo[],
  nodoj: readonly { id: string; stato?: string }[],
): Aldoneblo[] {
  const byId = new Map(nodoj.map((n) => [n.id, n] as const));
  return katalogo.map((enskribo): Aldoneblo => {
    let stato: AldonStato = "da";
    if (enskribo.lauf !== "MP-1") stato = "spaeter";
    else if (enskribo.nodo === "vorschau") stato = "weitere";
    else if (enskribo.nodo === "farbo-akzent") {
      const akzent = byId.get("farbo-akzent");
      stato = akzent === undefined || akzent.stato === "leer" ? "setzen" : "da";
    } else if (enskribo.nodo !== undefined && isStatusNodo(enskribo.nodo)) {
      stato = byId.has(enskribo.nodo) ? "da" : "anlegen";
    }
    return { ...enskribo, stato };
  });
}
