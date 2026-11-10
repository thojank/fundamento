// Spec 047 (NE-1, 2.5): the layout of the visible nodes. dagre, left to right: an edge is laid
// from `al` to `de`, so the inputs sit on the left and what depends on them to the right. The
// sizes are the measured ones; the gaps follow from them, so no length is written down here.

import { Graph, layout } from "@dagrejs/dagre";
import type { SichtLigo } from "@fundamento/metiejo/grafeo";

export interface Mezurita {
  id: string;
  largxo: number;
  alteco: number;
}

export interface Pozicio {
  x: number;
  y: number;
}

/** The top-left position of every node; edges with an end outside `nodoj` are left out. */
export function arangxi(
  nodoj: readonly Mezurita[],
  ligoj: readonly SichtLigo[],
): Map<string, Pozicio> {
  const pozicioj = new Map<string, Pozicio>();
  if (nodoj.length === 0) return pozicioj;
  const unuo = Math.min(...nodoj.map((n) => n.alteco));
  const g = new Graph();
  g.setGraph({ rankdir: "LR", nodesep: unuo / 2, ranksep: unuo * 3 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of nodoj) g.setNode(n.id, { width: n.largxo, height: n.alteco });
  for (const l of ligoj) {
    if (g.hasNode(l.al) && g.hasNode(l.de)) g.setEdge(l.al, l.de);
  }
  layout(g);
  for (const n of nodoj) {
    const centro = g.node(n.id) as { x?: number; y?: number } | undefined;
    pozicioj.set(n.id, {
      x: (centro?.x ?? 0) - n.largxo / 2,
      y: (centro?.y ?? 0) - n.alteco / 2,
    });
  }
  return pozicioj;
}
