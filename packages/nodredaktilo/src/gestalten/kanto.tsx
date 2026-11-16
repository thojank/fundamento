// Spec 054 (MP-1, T3, T7): the edge of the view Gestalten. Thin and right-angled, in the colour of
// its source: a colour edge carries the brand colour (inline, from the Bildo), a Marke edge the text
// role at half strength, a Maß edge its kind's role. Stronger under the pointer, dashed and muted
// from an empty or detached colour node.
// Spec 055 (T1, plan D-4, D-5): the corners are round (`getSmoothStepPath` with the radius of
// `--fm-radius-role-surface`, which the canvas reads once and hands in as `radiuso`; React Flow
// writes each corner as a `Q` segment), and the vertical piece runs on the edge's lane in the gap
// between two columns (`spuroX`), so no edge crosses a node at the start places.
// On a new rev an edge whose source changed carries a short light (`lumo`) along the same path,
// only without `prefers-reduced-motion: reduce` (the rule lives under `no-preference` in BAZA_STILO).
// T7 (E-11): a selected edge carries „×“ in its middle (an Ero, `nodrag nopan`); it detaches the
// edge through React Flow's own deletion (`deleteElements`, the same way as Entf on the canvas).
// A fixed edge (055 D-18, `fest`: Primär → Neutral) is never selected and never shows „×“.
// Spec 056 (T2, Teil V, plan D-15, D-17): every edge is a curve (`getBezierPath`): it leaves its
// output and enters its input along the port's side (Primär → Neutral top → bottom), so no lane
// and no corner radius any more (`spuroX` and `ARANGXO_055.spuroj` stay unused in the shared
// module). The „×“ and the light use the curve's middle and path. Dashed with round ends (roloj.ts);
// a colour edge keeps the colour of its source, every other edge takes `ROLOJ.kanto`. An edge from
// an empty or detached source is only fainter. The edges into the Marke and the fixed Schrift →
// Vorschau edges are drawn the same way; a fixed one has no „×“.

import type { Anschlussart, BildoLigo } from "@fundamento/metiejo/gestalten";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import type { CSSProperties } from "react";
import { ART_ROLOJ, NODRAG, NOPAN, ROLOJ, useStilo } from "./roloj.js";

export type KantoDatumoj = {
  ligo: BildoLigo;
  /** From an empty or detached source: fainter (the stroke stays the same). */
  matt: boolean;
  /** Changes when the edge should light up once (a new rev or a saved content); 0 = never. */
  lumo: number;
};

export type KantoFlowLigo = Edge<KantoDatumoj, "kanto">;

/** The „×“ of a selected edge: a small round button in the middle of its curve. */
const STILO = `
.nr-g-kanto-x {
  position: absolute;
  pointer-events: all;
  z-index: 1;
}
.nr-g-kanto-x > fm-butono {
  display: block;
  border-radius: var(--fm-radius-full);
  background: ${ROLOJ.tavolo};
  box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.linioForta}, var(--fm-elevation-shadow-raised);
}
`;

/** The stroke of an edge of `art`: the source's colour for Farbe, the light grey otherwise. */
function strekoDe(art: Anschlussart, hex: string | undefined): CSSProperties {
  if (art === "farbo") return { stroke: hex ?? ART_ROLOJ.farbo };
  return { stroke: ROLOJ.kanto };
}

export function Kanto({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<KantoFlowLigo>) {
  useStilo("kanto", STILO);
  const { deleteElements } = useReactFlow();
  const ligo = data?.ligo;
  const [vojo, mezoX, mezoY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const art = ligo?.art ?? "marko";
  const fest = ligo?.fest === true;
  const lumo = data?.lumo ?? 0;
  return (
    <>
      <BaseEdge
        id={id}
        path={vojo}
        className="nr-g-kanto"
        style={strekoDe(art, ligo?.hex)}
        data-nr-ligo={id}
        data-nr-art={art}
        data-nr-matt={data?.matt === true ? "" : undefined}
        data-nr-gewaehlt={selected === true ? "" : undefined}
        data-nr-fest={fest ? "" : undefined}
      />
      {lumo === 0 ? null : <path key={lumo} className="nr-g-lumo" pathLength={100} d={vojo} />}
      {selected === true && !fest ? (
        <EdgeLabelRenderer>
          <div
            className={`nr-g-kanto-x ${NODRAG} ${NOPAN}`}
            style={{ transform: `translate(-50%, -50%) translate(${mezoX}px, ${mezoY}px)` }}
          >
            <fm-butono
              className={NODRAG}
              size="small"
              emphasis="low"
              label="Verbindung lösen"
              title="Verbindung lösen"
              data-nr-ligo-forigi={id}
              onClick={() => void deleteElements({ edges: [{ id }] })}
            >
              ×
            </fm-butono>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
