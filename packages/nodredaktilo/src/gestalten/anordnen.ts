// Spec 058 (MP-2c, T2, MAW-2.1, product spec A, US-1, AK-5): „Anordnen“ – every node of the canvas
// laid out left to right along its edges (inputs → Marke → colours and Schrift → Palette →
// previews) by dagre, from the measured sizes. It reuses the layout of the view „Verstehen“
// (`arangxi` in src/arangxo.ts, unchanged): the gaps follow from the measured sizes there, so no
// length is written down here either. Nodes and edges are sorted by id first, so the same canvas
// gives the same places. A node without any edge gets one imaginary edge of its start wiring
// (`startLigoDe`), so it lands in the column of its kind; imaginary edges are neither drawn nor
// stored. Pure: no React, no DOM, no clock.
// QA-Lauf 1 (B4): dagre centres every node in its column. A node with inputs only (no edge leaves
// it, e.g. „Namen und Beschreibung“) is moved to the left edge of its column instead, so the curves
// into its left inputs stay in the gap before the column and never cross a wider neighbour there
// (the Marke). Within its column it overlaps nothing: the column is as wide as its widest node and
// the nodes of one column lie one below the other.

import { anschlussDe, type BildoLigo, type Pozicio } from "@fundamento/metiejo/gestalten";
import { arangxi, type Mezurita } from "../arangxo.js";

/** The node a port belongs to (`farbo-primaer.el` → `farbo-primaer`). */
const nodoDe = (port: string): string => anschlussDe(port)?.nodo ?? port.split(".")[0] ?? port;

/** A fixed order of ids, independent of the locale. */
const laux = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The edge a node of this kind has in the start layout (source node, target node), for a node that
 * has no edge on the canvas: a text node, Grundlagen and Beispiele feed the Marke; „Namen und
 * Beschreibung“ is fed by Grundlagen; the Marke by Grundlagen; a colour node by the Marke; the
 * Palette by Primär; a preview by the Palette; Schrift and the Layout-Beispiel feed the light
 * preview. Undefined for an id of no known kind.
 */
export function startLigoDe(id: string): readonly [string, string] | undefined {
  if (id === "marko" || id === "ki-namen") return ["teksto-grundlagen", id];
  if (id === "schrift" || id === "layout-beispiel") return [id, "vorschau-hell"];
  if (id === "paletro") return ["farbo-primaer", id];
  if (id.startsWith("farbo-")) return ["marko", id];
  if (id.startsWith("vorschau-")) return ["paletro", id];
  if (id.startsWith("teksto-") || id === "beispiele") return [id, "marko"];
  return undefined;
}

/**
 * The top-left place of every node in `nodoj` (measured width and height) along the edges `ligoj`
 * (the session's visible edges, ports as ids). Edges are taken node to node, once per pair; an edge
 * with an end outside `nodoj` is left out. Places are whole pixels.
 */
export function anordnungDe(
  nodoj: readonly Mezurita[],
  ligoj: readonly BildoLigo[],
): Map<string, Pozicio> {
  const ordigitaj = [...nodoj].sort((a, b) => laux(a.id, b.id));
  const ids = new Set(ordigitaj.map((n) => n.id));
  const paroj = new Map<string, readonly [string, string]>();
  const aldoni = (de: string, al: string): void => {
    if (de !== al && ids.has(de) && ids.has(al)) paroj.set(`${de}>${al}`, [de, al]);
  };
  for (const ligo of ligoj) aldoni(nodoDe(ligo.de), nodoDe(ligo.al));
  const kunLigo = new Set([...paroj.values()].flat());
  for (const { id } of ordigitaj) {
    if (kunLigo.has(id)) continue;
    const start = startLigoDe(id);
    if (start !== undefined) aldoni(start[0], start[1]);
  }
  // `arangxi` lays an edge from its `al` to its `de` (inputs left): the source goes into `al`.
  const sichtLigoj = [...paroj.entries()]
    .sort(([a], [b]) => laux(a, b))
    .map(([, [de, al]]) => ({ de: al, al: de, nombro: 1 }));
  const pozicioj = arangxi(ordigitaj, sichtLigoj);
  const rondaj = new Map(
    [...pozicioj].map(([id, p]) => [id, { x: Math.round(p.x), y: Math.round(p.y) }] as const),
  );
  // A column: the nodes dagre centres on the same x (one rank). Its left edge: the leftmost place.
  const centroDe = (n: Mezurita): number => Math.round((pozicioj.get(n.id)?.x ?? 0) + n.largxo / 2);
  const maldekstre = new Map<number, number>();
  for (const n of ordigitaj) {
    const x = rondaj.get(n.id)?.x ?? 0;
    const c = centroDe(n);
    maldekstre.set(c, Math.min(maldekstre.get(c) ?? x, x));
  }
  const kunEliro = new Set([...paroj.values()].map(([de]) => de));
  const kunEniro = new Set([...paroj.values()].map(([, al]) => al));
  for (const n of ordigitaj) {
    const p = rondaj.get(n.id);
    const x = maldekstre.get(centroDe(n));
    if (p !== undefined && x !== undefined && kunEniro.has(n.id) && !kunEliro.has(n.id))
      rondaj.set(n.id, { x, y: p.y });
  }
  return rondaj;
}
