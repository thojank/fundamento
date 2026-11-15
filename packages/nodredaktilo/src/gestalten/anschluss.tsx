// Spec 054 (MP-1, T3, T7): a port of the view Gestalten – a small square by kind (Marke, Farbe, Maß;
// later Text and Schrift), filled when an edge of the session ends or starts there, hollow when
// free. A colour port carries the colour itself (inline, from the Bildo); every other kind takes its
// role (`ART_ROLOJ`, D-8). The port id is the handle id and the address in the Bildo's edges
// (`marko.el`, `farbo-primaer.en`, `paletro.en.neutral`, …): output (`el`) on the right, input
// (`en`) on the left. Whether a port can be dragged from is the canvas's setting
// (`nodesConnectable`), not the port's.
// T7 (E-11, Fluss B3): a new edge starts at an output and ends at an input. While an edge is drawn
// or moved, every port it may end on (`validaLigo`: same kind, forward, no cycle) lights up and the
// others recede; a refused port simply stays back, without any message. Grabbing an input that
// carries an edge picks that edge up at its end (React Flow's reconnect anchor of the edge), so it
// can be moved to another input or dropped into empty space, which detaches it.

import { anschlussDe, validaLigo } from "@fundamento/metiejo/gestalten";
import { Handle, Position, useConnection } from "@xyflow/react";
import type { CSSProperties, MouseEvent } from "react";
import { useGestalten } from "./kunteksto.js";
import { artKoloro, ROLOJ, useStilo } from "./roloj.js";

/** While an edge is drawn: the port it may end on lights up, the rest recede (mockup `.kabelt`). */
const STILO = `
.react-flow .react-flow__handle.nr-g-anschluss { z-index: 1; }
.react-flow .react-flow__handle.nr-g-anschluss[data-nr-zurueck] { opacity: var(--fm-opacity-disabled); }
.react-flow .react-flow__handle.nr-g-anschluss[data-nr-ziel],
.react-flow .react-flow__handle.nr-g-anschluss[data-nr-quelle] {
  transform: translate(var(--nr-g-x, -50%), -50%) scale(1.5);
  box-shadow: 0 0 0 var(--fm-border-width-strong) ${ROLOJ.pinto}, 0 0 0 calc(var(--fm-border-width-strong) * 2) ${ROLOJ.ringo};
  z-index: 2;
}
.react-flow .react-flow__handle.nr-g-anschluss.target[data-nr-plena] { pointer-events: all; cursor: grab; }
@media (prefers-reduced-motion: no-preference) {
  .react-flow .react-flow__handle.nr-g-anschluss { transition: transform var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), opacity var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
}
`;

export interface AnschlussProps {
  /** The port id, as in `BildoLigo.de`/`.al`. */
  port: string;
  /** The distance of the port's centre from the node's top edge, in px (the head is ≈ 38). */
  supro: number;
  /** The colour of a colour port (`#rrggbb` from the Bildo); without one it takes a calm role. */
  hex?: string | undefined;
}

/** The port an edge is being drawn from (or, while one is moved, the end that stays), else null. */
const elConnection = (c: { inProgress: boolean; fromHandle: { id?: string | null } | null }) =>
  c.inProgress ? (c.fromHandle?.id ?? null) : null;

/**
 * Picks up the edge that ends at an input: a press on the port is handed to the reconnect anchor at
 * the edge's end (`.react-flow__edgeupdater-target`), which then moves that end with the pointer.
 */
function prenuLigon(ligo: string, evento: MouseEvent<HTMLDivElement>): void {
  const ankro = document.querySelector(
    `.react-flow__edge[data-id="${CSS.escape(ligo)}"] .react-flow__edgeupdater-target`,
  );
  if (ankro === null) return;
  evento.preventDefault();
  evento.stopPropagation();
  ankro.dispatchEvent(
    new window.MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 0,
      buttons: 1,
      clientX: evento.clientX,
      clientY: evento.clientY,
      screenX: evento.screenX,
      screenY: evento.screenY,
    }),
  );
}

export function Anschluss({ port, supro, hex }: AnschlussProps) {
  useStilo("anschluss", STILO);
  const { verbunden, ligoj } = useGestalten();
  const de = useConnection(elConnection);
  const anschluss = anschlussDe(port);
  if (anschluss === undefined) return null;
  const el = anschluss.direkto === "el";
  const plena = verbunden(port);
  // While an edge is drawn from `de`: may it end here? (From an input when the moved end is the
  // output: then the outputs are the candidates.)
  let stato: "ziel" | "quelle" | "zurueck" | null = null;
  if (de !== null) {
    const deEl = anschlussDe(de)?.direkto === "el";
    if (de === port) stato = "quelle";
    else if (deEl ? !el && validaLigo(ligoj, de, port) : el && validaLigo(ligoj, port, de))
      stato = "ziel";
    else stato = "zurueck";
  }
  const ena = el ? undefined : ligoj.find((l) => l.al === port);
  const stilo = {
    top: supro,
    "--nr-g-art": artKoloro(anschluss.art, hex),
    "--nr-g-x": el ? "50%" : "-50%",
  } as CSSProperties;
  return (
    <Handle
      id={port}
      type={el ? "source" : "target"}
      position={el ? Position.Right : Position.Left}
      isConnectableStart={el}
      isConnectableEnd={!el}
      className="nr-g-anschluss"
      style={stilo}
      onMouseDown={ena === undefined ? undefined : (evento) => prenuLigon(ena.id, evento)}
      data-nr-anschluss={port}
      data-nr-art={anschluss.art}
      data-nr-plena={plena ? "" : undefined}
      data-nr-ziel={stato === "ziel" ? "" : undefined}
      data-nr-quelle={stato === "quelle" ? "" : undefined}
      data-nr-zurueck={stato === "zurueck" ? "" : undefined}
    />
  );
}
