// Spec 055 (T4, LNS-2.2): the session of the canvas and the stored canvas state, both ways. Pure:
// no React, no fetch, no clock. The session holds what the person did on the canvas – moved places
// (`verschoben`), detached and drawn edges, further previews – and `statoDeSesio` turns it into the
// state `PUT /api/marko/:name/leinwand-stato` stores; `sesioDeStato` builds the session from the
// state `/api/leinwand` answers. The file keeps `kabloj`, not the raw edges (plan D-13): on load
// `sitzungDeKabloj` draws the session that has exactly these `kabloj`
// (`kablojDeSesio(bildo, sitzungDeKabloj(k, bildo)) = k` for every `k` the Bildo can carry).

import {
  type Bildo,
  type BildoLigo,
  FARBO_ROLOJ,
  type Kabloj,
  kablojDe,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  type LigoSitzung,
  ligoId,
  ligojKun,
  type Pozicio,
  type Schema,
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

/**
 * Draws `de → al` into the session. The edge `al` carried until now (from the Agordo or drawn)
 * goes into `geloest`, so the input stays as drawn even when the new edge is detached later.
 */
export function kunZiehen(nun: Sesio, ligoj: readonly BildoLigo[], de: string, al: string): Sesio {
  const id = ligoId(de, al);
  const anstatau = ligoj.filter((l) => l.al === al && l.id !== id).map((l) => l.id);
  return {
    ...nun,
    geloest: [...nun.geloest.filter((g) => g !== id && !anstatau.includes(g)), ...anstatau],
    gezogen: [...nun.gezogen.filter((g) => g.al !== al), { de, al }],
  };
}

/** Detaches edges in the session: from the Agordo's (`geloest`) and from the drawn ones. */
export function kunLoesen(nun: Sesio, ids: readonly string[]): Sesio {
  const weg = new Set(ids);
  return {
    ...nun,
    geloest: [...nun.geloest.filter((g) => !weg.has(g)), ...weg],
    gezogen: nun.gezogen.filter((g) => !weg.has(ligoId(g.de, g.al))),
  };
}

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
    if (p !== undefined) knoten.push({ id: n.id, x: p.x, y: p.y });
  }
  for (const s of sesio.nodoj) {
    const p = verschoben.get(s.id);
    knoten.push({
      id: s.id,
      speco: s.speco,
      schema: s.schema,
      ...(p === undefined ? {} : { x: p.x, y: p.y }),
      ...(s.inhalt === undefined ? {} : { inhalt: s.inhalt }),
    });
  }
  return { version: 1, knoten, kabloj: { ...kabloj } };
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
  let vorschauNombro = UNUA_VORSCHAU;
  for (const k of stato?.knoten ?? []) {
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
  const ekzistas = new Set([...bildo.nodoj.map((n) => n.id), ...nodoj.map(sesioId)]);
  const verschoben = new Map<string, Pozicio>();
  for (const k of stato?.knoten ?? []) {
    if (k.x !== undefined && k.y !== undefined && ekzistas.has(k.id))
      verschoben.set(k.id, { x: k.x, y: k.y });
  }
  return { sesio: sitzungDeKabloj(stato?.kabloj ?? {}, bildo, nodoj), verschoben, vorschauNombro };
}
