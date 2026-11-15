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

import { type Anschlussart, type BildoLigo, spuroX } from "@fundamento/metiejo/gestalten";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import type { CSSProperties } from "react";
import { ART_ROLOJ, NODRAG, NOPAN, ROLOJ, useStilo } from "./roloj.js";

export type KantoDatumoj = {
  ligo: BildoLigo;
  /** From an empty or detached colour node: dashed and muted. */
  matt: boolean;
  /** Changes when the edge should light up once (a new rev touched its source); 0 = never. */
  lumo: number;
  /** The corner radius in px (`--fm-radius-role-surface`, read once by the canvas). */
  radiuso: number;
};

export type KantoFlowLigo = Edge<KantoDatumoj, "kanto">;

/** The „×“ of a selected edge: a small round button in the middle of its vertical piece. */
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

/** The stroke of an edge of `art`: the source's colour for Farbe, the kind's role otherwise. */
function strekoDe(art: Anschlussart, hex: string | undefined): CSSProperties {
  if (art === "farbo") return { stroke: hex ?? ART_ROLOJ.farbo };
  if (art === "marko")
    return { stroke: ART_ROLOJ.marko, strokeOpacity: "var(--fm-opacity-overlay)" };
  return { stroke: ART_ROLOJ[art] };
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
  // D-4: the lane of the vertical piece; without one (the fixed top → bottom edge) React Flow's own.
  const centerX = ligo === undefined ? undefined : spuroX(ligo.de, ligo.al, sourceX, targetX);
  const [vojo, mezoX, mezoY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: data?.radiuso ?? 0,
    ...(centerX === undefined ? {} : { centerX }),
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
