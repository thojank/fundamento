// Spec 055 (T4, LNS-2.2): the session of the canvas and the stored canvas state, both ways. Pure:
// no React, no fetch, no clock. The session holds what the person did on the canvas – moved places
// (`verschoben`), detached and drawn edges, further previews – and `statoDeSesio` turns it into the
// state `PUT /api/marko/:name/leinwand-stato` stores; `sesioDeStato` builds the session from the
// state `/api/leinwand` answers. The file keeps `kabloj`, not the raw edges (plan D-13): on load
// `sitzungDeKabloj` draws the session that has exactly these `kabloj`
// (`kablojDeSesio(bildo, sitzungDeKabloj(k, bildo)) = k` for every `k` the Bildo can carry).
// Spec 056 (T2, plan D-18, D-19, D-20): the session also holds the added nodes of this run (four
// text nodes, Beispiele, Schrift), the contents of every node of this run (the three fixed text
// nodes too) and the outputs whose edge into the Marke is detached (`markoGeloest`) – apart from the
// colour edges' `geloest`. The edges into the Marke are not drawn edges: they follow from the
// contents (`markoLigojDe` of the shared module, in kanvaso.tsx); plugging one only takes its output
// out of `markoGeloest`, and nothing else at that input changes (D-18). This file keeps exactly one
// import statement, from `@fundamento/metiejo/gestalten`, and none of the alias of leinwand-enhavo.ts:
// leinwand-stato-055 and leinwand-sxelo-056 load it by replacing that one import (D-20).
// Spec 058 (MP-2c, T2, MAW-2.1, plan §3.1, §3.4): the session also holds the contents of
// Grundlagen, „Namen und Beschreibung“, the Layout-Beispiel and the Marke (`inhaltoj`), whether
// „Namen und Beschreibung“ was added and which outputs are detached from it (`kiNamen`), and the
// view and layout choice of every preview, fixed and added (`wahloj`). Grundlagen's edge into the
// Marke detaches like a text node's (`markoGeloest`). Every addition is written only when present,
// so a session of Spec 055 or 056 gives the same state as before, and a state of Spec 055 or 056
// the same session.

import {
  type Ansicht,
  type AufbauWahl,
  ansichtDe,
  aufbauWahlDe,
  BEISPIELE_ELIR,
  type Bildo,
  type BildoLigo,
  type EnhavoId,
  type EnhavoId058,
  enhavoSpecoDe,
  estasAnsicht,
  estasAufbauWahl,
  estasEnhavoId,
  estasMarkoEnir,
  FARBO_ROLOJ,
  FIKSAJ_TEKSTOJ,
  GRUNDLAGEN_ELIR,
  GRUNDLAGEN_ID,
  type Kabloj,
  KI_NAMEN_BILDO_ENIR,
  KI_NAMEN_ID,
  KI_NAMEN_TEKSTO_ENIR,
  kablojDe,
  LAYOUT_ID,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  type LigoSitzung,
  ligoId,
  ligojKun,
  NODOJ_058,
  type Nodo058,
  type Pozicio,
  type Schema,
  TEKSTO_IDS,
  wertElirDe,
} from "@fundamento/metiejo/gestalten";

/**
 * A node that lives only in the session and the canvas state: a further preview (the Funktionsfarben
 * are in the Bildo). `inhalt` is passed on unchanged (reserved for Spec 056).
 */
export interface SesioNodo {
  speco: "vorschau";
  id: string;
  schema: Schema;
  inhalt?: Record<string, unknown>;
}

export interface Sesio {
  nodoj: readonly SesioNodo[];
  /** Edges drawn in the session, oldest first (`LigoSitzung.gezogen`). */
  gezogen: readonly { de: string; al: string }[];
  /** Edges the session detached (`LigoSitzung.geloest`), also the ones a drawn edge replaced. */
  geloest: readonly string[];
  /**
   * Spec 056: the nodes „+ Knoten“ added (`ALDONEBLAJ`: four text nodes, Beispiele, Schrift), in
   * the order added; absent = none. The three fixed text nodes are always on the canvas.
   */
  aldonitaj?: readonly EnhavoId[];
  /**
   * Spec 056: the content of each node of this run (`inhalt`, as `enhavoDe` reads it), fixed text
   * nodes included; absent = none. Spec 058: also Grundlagen, „Namen und Beschreibung“, the
   * Layout-Beispiel and the Marke (`marko`: the Markenprofil).
   */
  inhaltoj?: Readonly<Partial<Record<EnhavoId058, Record<string, unknown>>>>;
  /**
   * Spec 056 (D-19): the outputs whose edge into the Marke is detached (`"teksto-werte.el.w2"`,
   * `"beispiele.el"`); absent = every edge into the Marke stands. Never in `geloest`. Spec 058:
   * also Grundlagen's output (`"teksto-grundlagen.el"`).
   */
  markoGeloest?: readonly string[];
  /**
   * Spec 058: „Namen und Beschreibung“ (`ki-namen`) is on the canvas, with the outputs whose edge
   * into it is detached (its own, independent of the Marke's); absent = not on the canvas.
   */
  kiNamen?: { geloest: readonly string[] };
  /**
   * Spec 058: the view and layout choice of each preview by id (the two fixed ones and the added
   * ones); absent or a missing id = the defaults („marke“, „auto“).
   */
  wahloj?: Readonly<Record<string, VorschauWahl>>;
}

/** Spec 058: the choice of one preview node as the session keeps it (each part only when set). */
export interface VorschauWahl {
  ansicht?: Ansicht;
  aufbau?: AufbauWahl;
}

/** The state the canvas sends and the server answers (without `version`). */
export type StatoAntwort = Omit<LeinwandStato, "version">;

export const SESIO_KOMENCO: Sesio = { nodoj: [], gezogen: [], geloest: [] };

/** The first number of a further preview: `vorschau-3` follows the two fixed ones. */
export const UNUA_VORSCHAU = 3;

export const sesioId = (n: SesioNodo): string => n.id;

/** The edge a session node comes with, as if from the Agordo (Palette → preview). */
export const sesioLigoj = (n: SesioNodo): { de: string; al: string }[] => [
  { de: "paletro.el", al: `${n.id}.en` },
];

/** The session's edges as `ligojKun` reads them. */
export const ligoSitzungDe = (sesio: Sesio): LigoSitzung => ({
  geloest: sesio.geloest,
  gezogen: sesio.gezogen,
  nodoj: sesio.nodoj.map(sesioId),
});

/** Sorted and unique (the order of `LeinwandStato.geloest`). */
const ordigita = (eroj: Iterable<string>): string[] => [...new Set(eroj)].sort();

/**
 * Draws `de → al` into the session. The edge `al` carried until now (from the Agordo or drawn)
 * goes into `geloest`, so the input stays as drawn even when the new edge is detached later.
 * Spec 056 (D-18): at an input of the Marke it plugs `de` (its edge stands again) and changes
 * nothing else – the other edges there stay as they are.
 */
export function kunZiehen(nun: Sesio, ligoj: readonly BildoLigo[], de: string, al: string): Sesio {
  // Spec 058: at an input of „Namen und Beschreibung“ it plugs `de` there and changes nothing else.
  if (estasKiNamenEnir(al)) {
    if (nun.kiNamen === undefined) return nun;
    return { ...nun, kiNamen: { geloest: nun.kiNamen.geloest.filter((g) => g !== de) } };
  }
  if (estasMarkoEnir(al)) {
    const markoGeloest = (nun.markoGeloest ?? []).filter((g) => g !== de);
    const { markoGeloest: _m, ...resto } = nun;
    return markoGeloest.length === 0 ? resto : { ...resto, markoGeloest };
  }
  const id = ligoId(de, al);
  const anstatau = ligoj.filter((l) => l.al === al && l.id !== id).map((l) => l.id);
  return {
    ...nun,
    geloest: [...nun.geloest.filter((g) => g !== id && !anstatau.includes(g)), ...anstatau],
    gezogen: [...nun.gezogen.filter((g) => g.al !== al), { de, al }],
  };
}

/** Spec 056: the output of an edge into the Marke (`"<de>>marko.en.…"`), else undefined. */
export function markoElirDe(id: string): string | undefined {
  const indekso = id.lastIndexOf(">");
  if (indekso < 0) return undefined;
  return estasMarkoEnir(id.slice(indekso + 1)) ? id.slice(0, indekso) : undefined;
}

/** Spec 058: whether `port` is one of the two inputs of „Namen und Beschreibung“. */
export const estasKiNamenEnir = (port: string): boolean =>
  port === KI_NAMEN_TEKSTO_ENIR || port === KI_NAMEN_BILDO_ENIR;

/** Spec 058: the output of an edge into „Namen und Beschreibung“ (`"<de>>ki-namen.en.…"`), else undefined. */
export function kiNamenElirDe(id: string): string | undefined {
  const indekso = id.lastIndexOf(">");
  if (indekso < 0) return undefined;
  return estasKiNamenEnir(id.slice(indekso + 1)) ? id.slice(0, indekso) : undefined;
}

/**
 * Detaches edges in the session: from the Agordo's (`geloest`) and from the drawn ones. Spec 056
 * (D-19): an edge into the Marke detaches its output (`markoGeloest`), never a colour edge. Spec
 * 058: an edge into „Namen und Beschreibung“ detaches its output there only (`kiNamen.geloest`).
 */
export function kunLoesen(nun: Sesio, ids: readonly string[]): Sesio {
  const eliroj = ids.flatMap((id) => markoElirDe(id) ?? []);
  const kiEliroj = ids.flatMap((id) => kiNamenElirDe(id) ?? []);
  const weg = new Set(
    ids.filter((id) => markoElirDe(id) === undefined && kiNamenElirDe(id) === undefined),
  );
  let sesio: Sesio = {
    ...nun,
    geloest: [...nun.geloest.filter((g) => !weg.has(g)), ...weg],
    gezogen: nun.gezogen.filter((g) => !weg.has(ligoId(g.de, g.al))),
  };
  if (kiEliroj.length > 0 && nun.kiNamen !== undefined)
    sesio = { ...sesio, kiNamen: { geloest: ordigita([...nun.kiNamen.geloest, ...kiEliroj]) } };
  if (eliroj.length === 0) return sesio;
  return { ...sesio, markoGeloest: ordigita([...(nun.markoGeloest ?? []), ...eliroj]) };
}

/** Spec 056: the nodes of this run on the canvas – the three fixed text nodes, then the added. */
export function enhavoNodojDe(sesio: Sesio): EnhavoId[] {
  const aldonitaj = new Set(sesio.aldonitaj ?? []);
  return [...TEKSTO_IDS, "beispiele" as const, "schrift" as const].filter(
    (id) => FIKSAJ_TEKSTOJ.includes(id as (typeof FIKSAJ_TEKSTOJ)[number]) || aldonitaj.has(id),
  );
}

/**
 * Spec 056: the nodes of this run as the canvas state lists them (id, the `speco` of an added
 * node, the content), without places – what `markoLigojDe` and `markoEnhavoDe` read.
 */
export function enhavoKnotenDe(sesio: Sesio): LeinwandStatoKnoto[] {
  return enhavoNodojDe(sesio).map((id) => {
    const speco = FIKSAJ_TEKSTOJ.includes(id as (typeof FIKSAJ_TEKSTOJ)[number])
      ? undefined
      : enhavoSpecoDe(id);
    const inhalt = sesio.inhaltoj?.[id];
    return {
      id,
      ...(speco === undefined ? {} : { speco }),
      ...(inhalt === undefined ? {} : { inhalt }),
    };
  });
}

/**
 * Spec 056: adds a node of „+ Knoten“ (once; a fixed text node or an unknown id: nothing). Spec
 * 058: „Namen und Beschreibung“ starts connected to every input that goes into the Marke now – the
 * outputs detached from the Marke are detached from it as well.
 */
export function kunAldono(nun: Sesio, id: string): Sesio {
  if (id === KI_NAMEN_ID) {
    if (nun.kiNamen !== undefined) return nun;
    return { ...nun, kiNamen: { geloest: markoGeloestDe(nun) } };
  }
  if (!estasEnhavoId(id) || FIKSAJ_TEKSTOJ.includes(id as (typeof FIKSAJ_TEKSTOJ)[number]))
    return nun;
  if ((nun.aldonitaj ?? []).includes(id)) return nun;
  return { ...nun, aldonitaj: [...(nun.aldonitaj ?? []), id] };
}

/**
 * Spec 056: removes an added node with its content and its detached outputs (an added node is
 * removed only while empty – the node decides; a fixed one never).
 */
export function kunForigo(nun: Sesio, id: string): Sesio {
  // Spec 058: „Namen und Beschreibung“ goes with its content and its detached edges.
  if (id === KI_NAMEN_ID) {
    if (nun.kiNamen === undefined) return nun;
    const { kiNamen: _k, inhaltoj: _i, ...resto } = nun;
    const inhaltoj = Object.fromEntries(
      Object.entries(nun.inhaltoj ?? {}).filter(([k]) => k !== id),
    );
    return { ...resto, ...(Object.keys(inhaltoj).length === 0 ? {} : { inhaltoj }) };
  }
  if (!(nun.aldonitaj ?? []).includes(id as EnhavoId)) return nun;
  const { aldonitaj: _a, inhaltoj: _i, markoGeloest: _m, ...resto } = nun;
  const aldonitaj = (nun.aldonitaj ?? []).filter((a) => a !== id);
  const inhaltoj = Object.fromEntries(Object.entries(nun.inhaltoj ?? {}).filter(([k]) => k !== id));
  const markoGeloest = (nun.markoGeloest ?? []).filter((g) => !g.startsWith(`${id}.`));
  return {
    ...resto,
    ...(aldonitaj.length === 0 ? {} : { aldonitaj }),
    ...(Object.keys(inhaltoj).length === 0 ? {} : { inhaltoj }),
    ...(markoGeloest.length === 0 ? {} : { markoGeloest }),
  };
}

/** Spec 056: the value ids of Werte in a content (as far as they are value ids at all). */
function wertIdsDe(inhalt: Record<string, unknown> | undefined): string[] {
  const werte = inhalt?.werte;
  if (!Array.isArray(werte)) return [];
  return werte.flatMap((w: unknown) =>
    typeof w === "object" && w !== null && "id" in w && typeof w.id === "string" ? [w.id] : [],
  );
}

/**
 * The outputs that can run into the Marke now – of a text node on the canvas, a value of Werte,
 * Beispiele, and (Spec 058) Grundlagen, which stands on every canvas.
 */
function elirojDe(sesio: Sesio): Set<string> {
  const eliroj = new Set<string>([GRUNDLAGEN_ELIR]);
  for (const id of enhavoNodojDe(sesio)) {
    if (id === "schrift") continue;
    if (id === "beispiele") eliroj.add(BEISPIELE_ELIR);
    else if (id === "teksto-werte")
      for (const w of wertIdsDe(sesio.inhaltoj?.[id])) eliroj.add(wertElirDe(w));
    else eliroj.add(`${id}.el`);
  }
  return eliroj;
}

/**
 * Spec 056 (D-19): the detached outputs that still exist – of a text node on the canvas, a value
 * of Werte, Beispiele; Spec 058: Grundlagen – sorted and unique, as the reader keeps them
 * (`geloestDe`).
 */
export function markoGeloestDe(sesio: Sesio): string[] {
  const eliroj = elirojDe(sesio);
  return ordigita((sesio.markoGeloest ?? []).filter((g) => eliroj.has(g)));
}

/**
 * Spec 058: the outputs detached from „Namen und Beschreibung“ that still exist, sorted and unique
 * (empty while the node is not on the canvas).
 */
export function kiNamenGeloestDe(sesio: Sesio): string[] {
  if (sesio.kiNamen === undefined) return [];
  const eliroj = elirojDe(sesio);
  return ordigita(sesio.kiNamen.geloest.filter((g) => eliroj.has(g)));
}

/**
 * Spec 058: the nodes of Spec 058 on the canvas – Grundlagen, „Namen und Beschreibung“ while it was
 * added, the Layout-Beispiel – in the order of the process.
 */
export function nodoj058De(sesio: Sesio): Nodo058[] {
  return NODOJ_058.filter((id) => id !== KI_NAMEN_ID || sesio.kiNamen !== undefined);
}

/**
 * Spec 058: the nodes of Spec 058 as the canvas state lists them, without places – what
 * `kiNamenLigojDe` and the rules of the evaluation read: the content (when it has one), and on
 * „Namen und Beschreibung“ `speco: "ki"` and its detached outputs.
 */
export function knoten058De(sesio: Sesio): LeinwandStatoKnoto[] {
  return nodoj058De(sesio).map((id) => {
    const inhalt = sesio.inhaltoj?.[id];
    const geloest = id === KI_NAMEN_ID ? kiNamenGeloestDe(sesio) : [];
    return {
      id,
      ...(id === KI_NAMEN_ID ? { speco: "ki" as const } : {}),
      ...(inhalt === undefined ? {} : { inhalt }),
      ...(geloest.length === 0 ? {} : { geloest }),
    };
  });
}

/** Spec 058: the choice of a preview with the defaults filled in („marke“, „auto“). */
export function vorschauWahlDe(sesio: Sesio, id: string): { ansicht: Ansicht; aufbau: AufbauWahl } {
  const wahl = sesio.wahloj?.[id];
  return { ansicht: ansichtDe(wahl), aufbau: aufbauWahlDe(wahl) };
}

/** Spec 058: sets parts of the choice of a preview; the other part stays. */
export function kunWahl(nun: Sesio, id: string, wahl: VorschauWahl): Sesio {
  const nova: VorschauWahl = { ...nun.wahloj?.[id], ...wahl };
  return { ...nun, wahloj: { ...nun.wahloj, [id]: nova } };
}

/** Spec 058: the choice of a stored node, each part only when it reads. */
function wahlDeKnoto(k: LeinwandStatoKnoto): VorschauWahl {
  return {
    ...(estasAnsicht(k.ansicht) ? { ansicht: k.ansicht } : {}),
    ...(estasAufbauWahl(k.aufbau) ? { aufbau: k.aufbau } : {}),
  };
}

/** Spec 058: a content worth writing (not empty), else undefined. */
const plenaInhalt = (
  inhalt: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined =>
  inhalt === undefined || Object.keys(inhalt).length === 0 ? undefined : inhalt;

/** The colour nodes with their state and the session nodes: what `kablojDe` needs. */
export function nodojKunStato(
  bildo: Bildo,
  sesioNodoj: readonly SesioNodo[],
): { id: string; stato?: string }[] {
  return [
    ...bildo.nodoj.map((n) => (n.speco === "farbo" ? { id: n.id, stato: n.stato } : { id: n.id })),
    ...sesioNodoj.map((s) => ({ id: s.id })),
  ];
}

/** The effective view of a session's edges on a Bildo (`kablojDe(ligojKun(…))`). */
export function kablojDeSesio(bildo: Bildo, sesio: Sesio): Kabloj {
  return kablojDe(ligojKun(ligoSitzungDe(sesio), bildo), nodojKunStato(bildo, sesio.nodoj));
}

/**
 * The session that has exactly `kabloj` (plan D-13): the session nodes with their Palette edges,
 * then per row of `kabloj` its input at the Palette detached (`null`) or drawn from the named colour
 * node (an edge the Agordo already has stays as it is). Rows the Bildo cannot carry (a source
 * without a value) come back as „nicht verbunden“, as in MP-1.
 */
export function sitzungDeKabloj(
  kabloj: Kabloj,
  bildo: Bildo,
  nodoj: readonly SesioNodo[] = [],
): Sesio {
  let sesio: Sesio = { nodoj, gezogen: nodoj.flatMap(sesioLigoj), geloest: [] };
  for (const rolo of FARBO_ROLOJ) {
    const quelle = kabloj[rolo];
    if (quelle === undefined) continue;
    const al = `paletro.en.${rolo}`;
    const ligoj = ligojKun(ligoSitzungDe(sesio), bildo);
    if (quelle === null) {
      sesio = kunLoesen(
        sesio,
        ligoj.filter((l) => l.al === al).map((l) => l.id),
      );
      continue;
    }
    const de = `farbo-${quelle}.el`;
    if (!ligoj.some((l) => l.al === al && l.de === de)) sesio = kunZiehen(sesio, ligoj, de, al);
  }
  return sesio;
}

/**
 * The canvas state of a session: every node with a place of its own (moved or restored) with `x`/`y`,
 * Bildo first, then every session node with `speco`, `schema`, its place if it has one and its
 * `inhalt`; `kabloj` as the effective view. Nodes without an own place are left out (they take
 * their start place), so no state differs from the start before the first change.
 */
export function statoDeSesio(
  bildo: Bildo,
  sesio: Sesio,
  verschoben: ReadonlyMap<string, Pozicio>,
  kabloj: Kabloj,
): LeinwandStato {
  const knoten: LeinwandStatoKnoto[] = [];
  for (const n of bildo.nodoj) {
    const p = verschoben.get(n.id);
    // Spec 058: the Marke with its profile, a fixed preview with its choice – also without a place.
    const inhalt = n.id === "marko" ? plenaInhalt(sesio.inhaltoj?.marko) : undefined;
    const wahl = n.speco === "vorschau" ? (sesio.wahloj?.[n.id] ?? {}) : {};
    if (p === undefined && inhalt === undefined && Object.keys(wahl).length === 0) continue;
    knoten.push({
      id: n.id,
      ...(p === undefined ? {} : { x: p.x, y: p.y }),
      ...(inhalt === undefined ? {} : { inhalt }),
      ...wahl,
    });
  }
  for (const s of sesio.nodoj) {
    const p = verschoben.get(s.id);
    knoten.push({
      id: s.id,
      speco: s.speco,
      schema: s.schema,
      ...(p === undefined ? {} : { x: p.x, y: p.y }),
      ...(s.inhalt === undefined ? {} : { inhalt: s.inhalt }),
      ...sesio.wahloj?.[s.id],
    });
  }
  // Spec 056: the nodes of this run in a fixed order; a fixed text node only with a place or a
  // content, an empty content left out.
  for (const k of enhavoKnotenDe(sesio)) {
    const p = verschoben.get(k.id);
    const inhalt =
      k.inhalt === undefined || Object.keys(k.inhalt).length === 0 ? undefined : k.inhalt;
    if (k.speco === undefined && p === undefined && inhalt === undefined) continue;
    knoten.push({
      id: k.id,
      ...(k.speco === undefined ? {} : { speco: k.speco }),
      ...(p === undefined ? {} : { x: p.x, y: p.y }),
      ...(inhalt === undefined ? {} : { inhalt }),
    });
  }
  // Spec 058: Grundlagen and the Layout-Beispiel only with a place or a content, „Namen und
  // Beschreibung“ always while it is on the canvas (with `speco: "ki"` and its detached outputs).
  for (const k of knoten058De(sesio)) {
    const p = verschoben.get(k.id);
    const inhalt = plenaInhalt(k.inhalt);
    if (k.speco === undefined && p === undefined && inhalt === undefined) continue;
    knoten.push({
      id: k.id,
      ...(k.speco === undefined ? {} : { speco: k.speco }),
      ...(p === undefined ? {} : { x: p.x, y: p.y }),
      ...(inhalt === undefined ? {} : { inhalt }),
      ...(k.geloest === undefined ? {} : { geloest: k.geloest }),
    });
  }
  const geloest = markoGeloestDe(sesio);
  return {
    version: 1,
    knoten,
    kabloj: { ...kabloj },
    ...(geloest.length === 0 ? {} : { geloest }),
  };
}

/** A state as a text to compare two states by (the same construction gives the same text). */
export const statoTeksto = (stato: LeinwandStato): string => JSON.stringify(stato);

const NUMERO = /^vorschau-([1-9][0-9]*)$/;

/**
 * The session of a stored state on a Bildo: the added nodes as session nodes, the places of all
 * nodes that are on the canvas as `verschoben`, the edges from `kabloj` (`sitzungDeKabloj`), and the
 * number of the next further preview past the highest one stored. Without a state: the start.
 */
export function sesioDeStato(
  stato: StatoAntwort | null,
  bildo: Bildo,
): { sesio: Sesio; verschoben: Map<string, Pozicio>; vorschauNombro: number } {
  const nodoj: SesioNodo[] = [];
  const aldonitaj: EnhavoId[] = [];
  const inhaltoj: Partial<Record<EnhavoId058, Record<string, unknown>>> = {};
  const wahloj: Record<string, VorschauWahl> = {};
  let kiNamen: Sesio["kiNamen"];
  let vorschauNombro = UNUA_VORSCHAU;
  for (const k of stato?.knoten ?? []) {
    // Spec 058: the choice of every preview (fixed or added), the contents of the Marke, Grundlagen
    // and the Layout-Beispiel, and „Namen und Beschreibung“ with its detached outputs.
    if (k.speco === undefined || k.speco === "vorschau") {
      const wahl = wahlDeKnoto(k);
      if (Object.keys(wahl).length > 0 && k.id.startsWith("vorschau-")) wahloj[k.id] = wahl;
    }
    if (k.id === "marko" || k.id === GRUNDLAGEN_ID || k.id === LAYOUT_ID) {
      if (k.inhalt !== undefined) inhaltoj[k.id] = k.inhalt;
      continue;
    }
    if (k.id === KI_NAMEN_ID) {
      if (k.speco !== "ki") continue;
      kiNamen = { geloest: [...(k.geloest ?? [])] };
      if (k.inhalt !== undefined) inhaltoj[k.id] = k.inhalt;
      continue;
    }
    // Spec 056: the added nodes of this run and the contents (fixed text nodes too).
    if (estasEnhavoId(k.id)) {
      const fiksa = FIKSAJ_TEKSTOJ.includes(k.id as (typeof FIKSAJ_TEKSTOJ)[number]);
      if (!fiksa && k.speco !== enhavoSpecoDe(k.id)) continue;
      if (!fiksa) aldonitaj.push(k.id);
      if (k.inhalt !== undefined) inhaltoj[k.id] = k.inhalt;
      continue;
    }
    if (k.speco !== "vorschau" || k.schema === undefined) continue;
    nodoj.push({
      speco: "vorschau",
      id: k.id,
      schema: k.schema,
      ...(k.inhalt === undefined ? {} : { inhalt: k.inhalt }),
    });
    const numero = Number(NUMERO.exec(k.id)?.[1] ?? Number.NaN);
    if (Number.isFinite(numero)) vorschauNombro = Math.max(vorschauNombro, numero + 1);
  }
  const ekzistas = new Set<string>([
    ...bildo.nodoj.map((n) => n.id),
    ...nodoj.map(sesioId),
    ...FIKSAJ_TEKSTOJ,
    ...aldonitaj,
    GRUNDLAGEN_ID,
    LAYOUT_ID,
    ...(kiNamen === undefined ? [] : [KI_NAMEN_ID]),
  ]);
  const verschoben = new Map<string, Pozicio>();
  for (const k of stato?.knoten ?? []) {
    if (k.x !== undefined && k.y !== undefined && ekzistas.has(k.id))
      verschoben.set(k.id, { x: k.x, y: k.y });
  }
  const sesio: Sesio = sitzungDeKabloj(stato?.kabloj ?? {}, bildo, nodoj);
  const markoGeloest = [...(stato?.geloest ?? [])];
  return {
    sesio: {
      ...sesio,
      ...(aldonitaj.length === 0 ? {} : { aldonitaj }),
      ...(Object.keys(inhaltoj).length === 0 ? {} : { inhaltoj }),
      ...(markoGeloest.length === 0 ? {} : { markoGeloest }),
      ...(kiNamen === undefined ? {} : { kiNamen }),
      ...(Object.keys(wahloj).length === 0 ? {} : { wahloj }),
    },
    verschoben,
    vorschauNombro,
  };
}
