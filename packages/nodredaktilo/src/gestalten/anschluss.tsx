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
// Spec 055 (plan D-18): a port can sit centred on the node's top or bottom edge (`rando`) and carry
// a handle id of its own (`tenilo`): the fixed Primär → Neutral edge leaves Primär at the bottom
// (`FESTA_TENILO`) and ends at the top of Neutral (`farbo-neutral.en.farbo`). Nobody draws from
// such an output, and a fixed edge is never picked up at its end.
// Spec 056 (T2, Teil V): ports are round – filled when connected, a ring otherwise – in their kind's
// colour (Text, Bild, Schrift, Maß, Marke; a colour port in its colour). The two inputs of the
// Marke take many edges (D-18): grabbing one picks up the selected edge there, else the last one.
// Spec 058 (MAW-3.3): the same for the two inputs of „Namen und Beschreibung“ (`estasMultaEnir`).

import { anschlussDe, estasMultaEnir, validaLigo } from "@fundamento/metiejo/gestalten";
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
.react-flow .react-flow__handle.nr-g-anschluss.bottom[data-nr-ziel],
.react-flow .react-flow__handle.nr-g-anschluss.bottom[data-nr-quelle] { transform: translate(-50%, 50%) scale(1.5); }
@media (prefers-reduced-motion: no-preference) {
  .react-flow .react-flow__handle.nr-g-anschluss { transition: transform var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), opacity var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
  .react-flow .react-flow__handle.nr-g-anschluss.bottom:hover { transform: translate(-50%, 50%) scale(1.5); }
}
`;

export interface AnschlussProps {
  /** The port id, as in `BildoLigo.de`/`.al`. */
  port: string;
  /** The distance of the port's centre from the node's top edge, in px (the head is ≈ 38). */
  supro: number;
  /** The colour of a colour port (`#rrggbb` from the Bildo); without one it takes a calm role. */
  hex?: string | undefined;
  /** D-18: the port sits centred on the top (`supro`) or bottom (`subo`) edge; `supro` is unused. */
  rando?: "supro" | "subo" | undefined;
  /** D-18: the handle id when it differs from the port id (`FESTA_TENILO`); never drawn from. */
  tenilo?: string | undefined;
}

const RANDO_POZICIO = { supro: Position.Top, subo: Position.Bottom } as const;

/** The port an edge is being drawn from (or, while one is moved, the end that stays), else null. */
const elConnection = (c: { inProgress: boolean; fromHandle: { id?: string | null } | null }) =>
  c.inProgress ? (c.fromHandle?.id ?? null) : null;

/**
 * Picks up the edge that ends at an input: a press on the port is handed to the reconnect anchor at
 * the edge's end (`.react-flow__edgeupdater-target`), which then moves that end with the pointer.
 */
/**
 * Spec 056 (D-18): of several edges at one input (the Marke's), the selected one, else the last.
 * The selection lives in React Flow; its edge element carries `selected`.
 */
function elektitaLigo(ids: readonly string[]): string | undefined {
  const elektita = ids.find(
    (id) =>
      document.querySelector(`.react-flow__edge.selected[data-id="${CSS.escape(id)}"]`) !== null,
  );
  return elektita ?? ids[ids.length - 1];
}

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

export function Anschluss({ port, supro, hex, rando, tenilo }: AnschlussProps) {
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
  // A fixed edge (D-18) stays where it is: its end is never picked up.
  const enaj = el ? [] : ligoj.filter((l) => l.al === port && l.fest !== true).map((l) => l.id);
  const ena = estasMultaEnir(port) ? undefined : enaj[0];
  const stilo = {
    ...(rando === undefined ? { top: supro } : {}),
    "--nr-g-art": artKoloro(anschluss.art, hex),
    "--nr-g-x": el && rando === undefined ? "50%" : "-50%",
  } as CSSProperties;
  return (
    <Handle
      id={tenilo ?? port}
      type={el ? "source" : "target"}
      position={rando === undefined ? (el ? Position.Right : Position.Left) : RANDO_POZICIO[rando]}
      isConnectableStart={el && tenilo === undefined}
      isConnectableEnd={!el}
      className="nr-g-anschluss"
      style={stilo}
      onMouseDown={
        enaj.length === 0
          ? undefined
          : (evento) => {
              const id = ena ?? elektitaLigo(enaj);
              if (id !== undefined) prenuLigon(id, evento);
            }
      }
      data-nr-anschluss={tenilo ?? port}
      data-nr-art={anschluss.art}
      data-nr-plena={plena ? "" : undefined}
      data-nr-ziel={stato === "ziel" ? "" : undefined}
      data-nr-quelle={stato === "quelle" ? "" : undefined}
      data-nr-zurueck={stato === "zurueck" ? "" : undefined}
    />
  );
}
