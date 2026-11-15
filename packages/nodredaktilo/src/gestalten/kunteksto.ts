// Spec 054 (MP-1, T3, plan §2.3): what the canvas shell gives every node of the view Gestalten.
// The node tickets (Marke/Farbe, Palette, Vorschau, connections) read this context and never edit
// it: the current Bildo, the one write path, the session's edges and what follows from them, the
// removal of session-only nodes, the focus request of „Akzent setzen“ and the raise of a node while
// it shows a hint. Node components receive their own node as React Flow `data.nodo`.

import type {
  Bildo,
  BildoFarbo,
  BildoFazo,
  BildoLigo,
  BildoMarko,
  BildoPaletro,
  Kabloj,
  LeinwandSxangxo,
  Schema,
} from "@fundamento/metiejo/gestalten";
import type { Node } from "@xyflow/react";
import { createContext, useContext } from "react";
import type { SkriboRezulto } from "./datumoj.js";

/**
 * A preview node: one of the two fixed ones of the Bildo (`vorschau-hell`, `vorschau-dunkel`) or a
 * further one of the session (`vorschau-3`, `vorschau-4`, …). `href` is `vorschauHref` for the
 * current rev and `kabloj` in the node's scheme.
 */
export interface VorschauDatumo {
  id: string;
  speco: "vorschau";
  fazo: "fazo-5";
  schema: Schema;
  href: string;
}

/**
 * The `data` of every node: its node from the Bildo – or, for a node that lives only in the
 * session (an empty Funktionsfarbe from „+ Knoten“, a further preview), a node of the same shape –
 * and whether it is such a session node (`sitzung: true`; it can be removed with `forigi`).
 */
export type NodoDatumoj<N> = { nodo: N; sitzung: boolean };

export type FazoFlowNodo = Node<NodoDatumoj<BildoFazo>, "fazo">;
export type MarkoFlowNodo = Node<NodoDatumoj<BildoMarko>, "marko">;
export type FarboFlowNodo = Node<NodoDatumoj<BildoFarbo>, "farbo">;
export type PaletroFlowNodo = Node<NodoDatumoj<BildoPaletro>, "paletro">;
export type VorschauFlowNodo = Node<NodoDatumoj<VorschauDatumo>, "vorschau">;
export type GestaltenFlowNodo =
  | FazoFlowNodo
  | MarkoFlowNodo
  | FarboFlowNodo
  | PaletroFlowNodo
  | VorschauFlowNodo;

/** The capabilities of the shell (plan §2.3). */
export interface GestaltenValoro {
  /** The brand's identifier (`data-nr-marko`). */
  marko: string;
  /** The current Bildo: replaced after every successful write and every change of `kabloj`. */
  bildo: Bildo;
  /**
   * Writes one change through `POST /api/marko/:name/leinwand`. On success the canvas reloads the
   * Bildo (the promise resolves after the new one is in) and shows „gespeichert HH:MM“; while it
   * writes, the old Bildo stays. Never carries `kabloj`.
   */
  skribi: (sxangxo: LeinwandSxangxo) => Promise<SkriboRezulto>;
  /** The effective view of the session's edges (`kablojDe`); `{}` = as in the Agordo. */
  kabloj: Kabloj;
  /** The session's edges: `ligojKun(session, bildo)` (= `bildo.ligoj` plus session nodes' edges). */
  ligoj: readonly BildoLigo[];
  /** Whether an edge of the session ends or starts at `port` (`"farbo-primaer.en"`, …). */
  verbunden: (port: string) => boolean;
  /** Whether the colour node `farboId` (`"farbo-akzent"`) hangs on no edge from `marko.el`. */
  abgehaengt: (farboId: string) => boolean;
  /** Removes a session-only node and its edges; does nothing for a node of the Bildo. */
  forigi: (nodeId: string) => void;
  /** The node whose field should take the focus („Akzent setzen“, a new Funktionsfarbe), or null. */
  fokusPor: string | null;
  /** Clears `fokusPor` once the node has focused its field. */
  fokusFarita: () => void;
  /** Raises a node above its neighbours (`on`) while it shows a hint, and lowers it again. */
  hervorheben: (nodeId: string, on: boolean) => void;
  /** The canvas's own scheme (the switch „Leinwand hell | dunkel“); previews keep their own. */
  skemo: Schema;
}

export const GestaltenKunteksto = createContext<GestaltenValoro | null>(null);

/** The shell's capabilities; throws outside `<Gestalten>` (a node is never rendered elsewhere). */
export function useGestalten(): GestaltenValoro {
  const valoro = useContext(GestaltenKunteksto);
  if (valoro === null) throw new Error("useGestalten: outside <Gestalten>");
  return valoro;
}
