// Spec 054 (MP-1, T1): the data of the view Gestalten that server and canvas share – the Bildo
// types, the fixed places with the place rule, the connection rules of the session, the effective
// view `kabloj` as text, the catalog „+ Knoten“, the preview address and the calm German sentences.
// Spec 055 (MP-1b, T1): no phase frames any more – every item is a node at an absolute start place
// (ARANGXO_055, with the maximum height of each node kind), every edge runs on its lane in the gap
// between two columns, and the contracts of the canvas state and the Stände live here too.
// Like grafeo-sicht.ts this module has no import at all – not even a type – so the browser bundle
// of @fundamento/nodredaktilo takes it through an alias (047 D-2). Pure and deterministic: no
// clock, no randomness, no storage; outputs follow fixed orders.

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

/**
 * The purpose tag a node carries (Spec 055 T1: the former phase ids). Never drawn and never used
 * for placement; the catalog „+ Knoten“ groups by its own `grupo`.
 */
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

/**
 * What a colour node shows: no field in the Agordo, the start value, set by hand, from material,
 * or derived (Spec 055 T2: a Funktionsfarbe without a value shows the Basis of its palette). In the
 * pure rules „abgeleitet“ counts like „leer“: a node without a value of its own (plan D-17).
 */
export type FarboStato = "leer" | "startwert" | "von-hand" | "aus-material" | "abgeleitet";

/**
 * Transitional (Spec 055 T1): the Bildo has no phase nodes any more, so no value has this type.
 * Only `nodredaktilo/src/gestalten/kunteksto.ts` still names it (its `FazoFlowNodo`); it goes
 * once that file drops the name.
 */
export type BildoFazo = never;

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

export type BildoNodo = BildoMarko | BildoFarbo | BildoPaletro | BildoVorschau;

/**
 * An edge between two ports: `marko.el`, `farbo-<rolo>.en`, `farbo-<rolo>.el`, `paletro.en.<rolo>`,
 * `paletro.el`, `vorschau-<id>.en`, `farbo-neutral.en.farbo`. `hex` on colour edges: the colour of
 * the source.
 */
export interface BildoLigo {
  id: string;
  de: string;
  al: string;
  art: Anschlussart;
  hex?: string;
  /**
   * Spec 055 (plan D-18): a fixed edge (Primär → Neutral while Neutral is derived). It has no „×“,
   * is neither selectable for deletion nor reconnectable, and is no entry of `Kabloj`; a person
   * cannot draw it (`validaLigo` refuses colour → colour).
   */
  fest?: true;
}

export interface Bildo {
  marko: { name: string; etikedo: string; stato: "entwurf-ungepruft" };
  rev: number;
  ableitung: "ok" | "fehlt";
  /** The effective view of this answer; {} = as in the Agordo. */
  kabloj: Kabloj;
  /** Marke, the seven colour nodes, Palette, the two previews – nodes only, no frames. */
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
// Canvas state and Stände (Spec 055 T4, T5: contracts; the file and routes come with LNS-2.2/3.1)

/**
 * One node of the canvas state (`marken/<name>/leinwand.json`). A fixed node carries `id`, `x`, `y`.
 * An added node (today only `vorschau-<n>`, n ≥ 3) carries `speco` and `schema` as well, a place
 * only once it has one (absent = its start slot), and `inhalt`, which 055 passes on unchanged
 * (reserved for Spec 056).
 */
export interface LeinwandStatoKnoto {
  id: string;
  x?: number;
  y?: number;
  speco?: "vorschau";
  schema?: Schema;
  inhalt?: Record<string, unknown>;
}

/** The whole canvas state as the file holds it (canonical JSON, `version: 1`). */
export interface LeinwandStato {
  version: 1;
  knoten: LeinwandStatoKnoto[];
  /** As `Bildo.kabloj`: only the rows that differ from the Agordo. */
  kabloj: Kabloj;
}

/**
 * The answer of `GET /api/leinwand`: the Bildo plus the stored state (null without a file or when
 * it cannot be read) and `statoUnlesbar` when a file exists but cannot be read.
 */
export type LeinwandAntwort = Bildo & {
  stato: Omit<LeinwandStato, "version"> | null;
  statoUnlesbar?: true;
};

/** One row of the list „Stände“: `lesbar: false` for a file that cannot be read (no colours). */
export interface StandZeile {
  id: string;
  name: string;
  /** ISO time of saving. */
  zeit: string;
  lesbar: boolean;
  farben?: { primaer: string; akzent?: string; neutral: string };
}

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

/** The Funktionsfarben, in the order they stand below Akzent. */
export const STATUS_ROLOJ: readonly FarboRolo[] = ["success", "warning", "danger", "info"];

/**
 * The colour column from top to bottom (product spec A): Neutral directly below Primär. A node's
 * index here is also its lane between the column and the Palette (plan D-4).
 */
export const FARBO_KOLUMNO: readonly FarboRolo[] = [
  "primaer",
  "neutral",
  "akzent",
  "success",
  "warning",
  "danger",
  "info",
];

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

// ---------------------------------------------------------------------------------------------
// Shared sentences (product spec, verbatim)

export const NELEGEBLA_SATZ =
  "Diesen Farbwert kann Fundamento nicht lesen. Schreibe ihn als #RRGGBB oder oklch(L C H).";
export const NE_KONSERVITA_SATZ = "Nicht gespeichert. Noch einmal versuchen.";
export const ABLEITUNG_FEHLT_SATZ = "Diesen Stand kann die Ableitung gerade nicht zeigen.";
export const NE_KONEKTITA_SATZ =
  "Nicht verbunden. Ziehe eine Verbindung von der Palette oder der Marke hierher.";

// ---------------------------------------------------------------------------------------------
// Start places (Spec 055 T1, plan §2.2, D-2): absolute, from the mockup's startplaetze()

export interface Pozicio {
  x: number;
  y: number;
}

export interface Platz extends Pozicio {
  largxo: number;
}

/** The node kinds by their maximum height (plan D-2). */
export type AltecoSpeco =
  | "marko"
  | "farbo-granda"
  | "farbo-neutral"
  | "farbo-kompakta"
  | "paletro"
  | "vorschau";

/**
 * The start places of the fixed nodes (absolute, flow units = px at zoom 1) with their widths, the
 * maximum height of each node kind, the slots of further previews and the lanes of the edges. Four
 * columns left to right: Marke → the seven colours (FARBO_KOLUMNO) → Palette → previews. The
 * maximum heights include room for what Spec 055 adds to a node (Neutral: its sentence and the open
 * field of an own colour; a Funktionsfarbe: „zurück zur Ableitung“). The browser check (plan D-19)
 * is binding: a real height above its maximum is fixed in the node or by a larger gap, never by a
 * smaller maximum. Never computed from the graph.
 */
export const ARANGXO_055 = {
  nodoj: {
    marko: { x: 24, y: 48, largxo: 190 },
    "farbo-primaer": { x: 300, y: 24, largxo: 264 },
    "farbo-neutral": { x: 300, y: 252, largxo: 264 },
    "farbo-akzent": { x: 300, y: 570, largxo: 264 },
    "farbo-success": { x: 300, y: 778, largxo: 264 },
    "farbo-warning": { x: 300, y: 892, largxo: 264 },
    "farbo-danger": { x: 300, y: 1006, largxo: 264 },
    "farbo-info": { x: 300, y: 1120, largxo: 264 },
    paletro: { x: 700, y: 24, largxo: 316 },
    "vorschau-hell": { x: 1136, y: 24, largxo: 372 },
    "vorschau-dunkel": { x: 1136, y: 524, largxo: 372 },
  } satisfies Record<string, Platz>,
  /** The maximum height per node kind (D-2); `altecoDe` gives it per node id. */
  alteco: {
    marko: 72,
    "farbo-granda": 190,
    "farbo-neutral": 300,
    "farbo-kompakta": 96,
    paletro: 520,
    vorschau: 480,
  } satisfies Record<AltecoSpeco, number>,
  /** Further previews below the two fixed ones: the k-th (0-based) at x, y + k · dy. */
  weitereVorschauen: { x: 1136, y: 1024, largxo: 372, dy: 500 },
  /** The lanes of the vertical edge pieces in px (plan D-4, see `spuroX`). */
  spuroj: {
    /** Marke → colour: one shared lane right of Marke, at sourceX + 34. */
    marko: 34,
    /** Palette → preview: one shared lane right of the Palette, at sourceX + 46. */
    paletro: 46,
    /** Colour → row: targetX − farboRando − (6 − index in FARBO_KOLUMNO) · farboDx. */
    farboRando: 22,
    farboDx: 12,
  },
} as const;

const FIKSAJ = ARANGXO_055.nodoj as Readonly<Record<string, Platz>>;

const isStatusNodo = (id: string): boolean => STATUS_ROLOJ.some((rolo) => id === `farbo-${rolo}`);
const isWeitereVorschau = (id: string): boolean => id.startsWith("vorschau-") && !(id in FIKSAJ);

/** The width a node starts with (the mockup's); 0 for an unknown id. */
export function largxoDe(id: string): number {
  return FIKSAJ[id]?.largxo ?? (isWeitereVorschau(id) ? ARANGXO_055.weitereVorschauen.largxo : 0);
}

/** The kind of a node by its maximum height; undefined for an unknown id. */
export function altecoSpecoDe(id: string): AltecoSpeco | undefined {
  if (id === "marko" || id === "paletro" || id === "farbo-neutral") return id;
  if (id === "farbo-primaer" || id === "farbo-akzent") return "farbo-granda";
  if (isStatusNodo(id)) return "farbo-kompakta";
  if (id.startsWith("vorschau-")) return "vorschau";
  return undefined;
}

/** The maximum height of a node (D-2); 0 for an unknown id. */
export function altecoDe(id: string): number {
  const speco = altecoSpecoDe(id);
  return speco === undefined ? 0 : ARANGXO_055.alteco[speco];
}

/**
 * The absolute places of the current nodes: a node in `verschoben` (moved in the session, or stored
 * with the canvas state) keeps that place; every fixed node gets its start place from ARANGXO_055;
 * further previews (`vorschau-*` beyond hell/dunkel) take the slots below the fixed ones in the
 * order they come. Entries for nodes that are gone drop out. An unknown id starts at the origin.
 */
export function poziciojKun(
  verschoben: ReadonlyMap<string, Pozicio>,
  nodoj: readonly { id: string }[],
): Map<string, Pozicio> {
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
    const platz = FIKSAJ[id];
    const weitere = weitereSlot.get(id);
    if (moved !== undefined) out.set(id, { x: moved.x, y: moved.y });
    else if (platz !== undefined) out.set(id, { x: platz.x, y: platz.y });
    else if (weitere !== undefined) {
      const { x, y, dy } = ARANGXO_055.weitereVorschauen;
      out.set(id, { x, y: y + weitere * dy });
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
  // Spec 055 (D-18): the colour input at the top of Neutral, the end of the fixed edge from Primär.
  if (port === NEUTRAL_FARBO_ENIR) return { nodo: "farbo-neutral", direkto: "en", art: "farbo" };
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

/** Spec 055 (D-18): the port at the top of Neutral where the fixed edge from Primär ends. */
export const NEUTRAL_FARBO_ENIR = "farbo-neutral.en.farbo";

/**
 * Spec 055 (D-18): the handle at the bottom of Primär the fixed edge leaves from. A handle id of
 * the canvas only: it never stands in the Bildo, in `kabloj` or in the canvas state.
 */
export const FESTA_TENILO = "farbo-primaer.el.unten";

/**
 * The handle ids an edge is drawn between: its port ids, except for the fixed Primär → Neutral
 * edge, which leaves Primär at the bottom (`FESTA_TENILO`) and ends at the top of Neutral.
 */
export function tenilojDe(ligo: BildoLigo): { de: string; al: string } {
  if (ligo.fest === true && ligo.de === "farbo-primaer.el" && ligo.al === NEUTRAL_FARBO_ENIR) {
    return { de: FESTA_TENILO, al: ligo.al };
  }
  return { de: ligo.de, al: ligo.al };
}

/**
 * The x of the vertical piece of the edge `de` → `al` (plan D-4), from the x of its two ends as the
 * canvas reports them. A colour → row edge takes the lane of its source node (index in
 * FARBO_KOLUMNO, Primär leftmost), also when it was drawn onto another row; the Marke edges share
 * one lane right of Marke, the Palette → preview edges one right of the Palette. Undefined for any
 * other edge (the fixed Primär → Neutral edge runs top → bottom as one vertical piece).
 */
export function spuroX(
  de: string,
  al: string,
  sourceX: number,
  targetX: number,
): number | undefined {
  const el = anschlussDe(de);
  const en = anschlussDe(al);
  if (el?.direkto !== "el" || en?.direkto !== "en") return undefined;
  const { spuroj } = ARANGXO_055;
  if (el.nodo === "marko") return sourceX + spuroj.marko;
  if (el.nodo === "paletro") return sourceX + spuroj.paletro;
  if (en.nodo !== "paletro") return undefined;
  const indekso = FARBO_KOLUMNO.findIndex((rolo) => el.nodo === `farbo-${rolo}`);
  if (indekso < 0) return undefined;
  return targetX - spuroj.farboRando - (FARBO_KOLUMNO.length - 1 - indekso) * spuroj.farboDx;
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
  /** Nodes that live only in the session (today: further previews). */
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

/**
 * Whether a colour node's state means it has no value of its own: empty, or derived (Spec 055
 * D-17: a Funktionsfarbe without a value shows its derived Basis but feeds no other row).
 */
export function senValora(stato: string | undefined): boolean {
  return stato === "leer" || stato === "abgeleitet";
}

/** Whether a colour node exists and carries a value: an empty or derived one feeds nothing. */
function kolora(nodoj: ReadonlyMap<string, { stato?: string }>, rolo: FarboRolo): boolean {
  const nodo = nodoj.get(`farbo-${rolo}`);
  return nodo !== undefined && !senValora(nodo.stato);
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
