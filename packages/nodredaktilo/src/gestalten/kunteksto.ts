// Spec 054 (MP-1, T3, plan §2.3): what the canvas shell gives every node of the view Gestalten.
// The node tickets (Marke/Farbe, Palette, Vorschau, connections) read this context and never edit
// it: the current Bildo, the one write path, the session's edges and what follows from them, the
// removal of session-only nodes, the focus request of „Akzent setzen“ and the raise of a node while
// it shows a hint. Node components receive their own node as React Flow `data.nodo`.
// Spec 055 (T4): `rekomenci` starts the session again from the stored canvas state („Anordnung
// zurücksetzen“, and „Öffnen“ of a Stand).
// Spec 056 (T2, plan §2.2): the contract of the five node tickets – the content of each node of this
// run (`inhaltDe`, `inhaltMeti`), what arrives at the Marke (`markoEnhavo`), the detached outputs
// into the Marke (`markoGeloest`), adding a node of „+ Knoten“ (`nodoAldoni`) and removing an
// added one (`forigi`). `verbunden` also knows the edges into the Marke and the fixed edges
// Schrift → Vorschau. The frame `NodoSxelo` (sxelo.tsx) does the rest centrally: dashed while
// empty, „×“ on an added empty node, faded with NE_KONEKTITA_MARKO_SATZ while its output is
// detached.

import type {
  Bildo,
  BildoFarbo,
  BildoLigo,
  BildoMarko,
  BildoPaletro,
  EnhavoId,
  InhaltMapo,
  Kabloj,
  LeinwandSxangxo,
  MarkoEnhavo,
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
 * session and the canvas state (a further preview), a node of the same shape –
 * and whether it is such a session node (`sitzung: true`; it can be removed with `forigi`).
 */
export type NodoDatumoj<N> = { nodo: N; sitzung: boolean };

export type MarkoFlowNodo = Node<NodoDatumoj<BildoMarko>, "marko">;
export type FarboFlowNodo = Node<NodoDatumoj<BildoFarbo>, "farbo">;
export type PaletroFlowNodo = Node<NodoDatumoj<BildoPaletro>, "paletro">;
export type VorschauFlowNodo = Node<NodoDatumoj<VorschauDatumo>, "vorschau">;

/**
 * Spec 056: a node of this run – one of the seven text nodes (`teksto-<thema>`, node type
 * „teksto“), Beispiele or Schrift. Its content lives in the session (`inhaltDe`), not in the Bildo;
 * `sitzung` is true for a node „+ Knoten“ added (it can be removed while empty).
 */
export interface EnhavoDatumo<I extends EnhavoId = EnhavoId> {
  id: I;
  speco: "teksto" | "beispiele" | "schrift";
}

export type TekstoFlowNodo = Node<NodoDatumoj<EnhavoDatumo>, "teksto">;
export type BeispieleFlowNodo = Node<NodoDatumoj<EnhavoDatumo<"beispiele">>, "beispiele">;
export type SchriftFlowNodo = Node<NodoDatumoj<EnhavoDatumo<"schrift">>, "schrift">;

export type GestaltenFlowNodo =
  | MarkoFlowNodo
  | FarboFlowNodo
  | PaletroFlowNodo
  | VorschauFlowNodo
  | TekstoFlowNodo
  | BeispieleFlowNodo
  | SchriftFlowNodo;

/** The capabilities of the shell (plan §2.3). */
export interface GestaltenValoro {
  /** The brand's identifier (`data-nr-marko`). */
  marko: string;
  /**
   * The current Bildo: replaced after every successful write and every change of `kabloj`. Spec
   * 056: Primär carries „aus-material“ as soon as the session's Beispiele say so
   * (`primaerStatoKun`), without waiting for the server.
   */
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
  /**
   * Whether an edge of the session ends or starts at `port` (`"farbo-primaer.en"`, …). Spec 056:
   * also an edge into the Marke that is not detached (`"teksto-werte.el.w2"`, `"marko.en.teksto"`)
   * and the fixed edge Schrift → Vorschau (`"schrift.el"`, `"vorschau-hell.en.tiparo"`).
   */
  verbunden: (port: string) => boolean;
  /** Whether the colour node `farboId` (`"farbo-akzent"`) hangs on no edge from `marko.el`. */
  abgehaengt: (farboId: string) => boolean;
  /**
   * Removes a session-only node and its edges; does nothing for a node of the Bildo. Spec 056: also
   * a node „+ Knoten“ added, with its content and its detached outputs (the frame offers it only
   * while the node is empty); never one of the three fixed text nodes.
   */
  forigi: (nodeId: string) => void;
  /** The node whose field should take the focus („Akzent setzen“, a new Funktionsfarbe), or null. */
  fokusPor: string | null;
  /** Clears `fokusPor` once the node has focused its field. */
  fokusFarita: () => void;
  /** Raises a node above its neighbours (`on`) while it shows a hint, and lowers it again. */
  hervorheben: (nodeId: string, on: boolean) => void;
  /** The canvas's own scheme (the switch „Leinwand hell | dunkel“); previews keep their own. */
  skemo: Schema;
  /**
   * Spec 055 (T4): starts the session again from what the server stores. Waits for a state write
   * in flight (a scheduled one is dropped), reloads the Bildo without `kabloj` (the server applies
   * the stored state's), and takes the stored state as the new session: places → moved places,
   * `kabloj` → the session's edges (`sitzungDeKabloj`), added nodes → session nodes, the number of
   * the next further preview past the highest one. The old session is discarded. „Anordnung
   * zurücksetzen“ calls it after `statoForigi`; „Öffnen“ of a Stand (LNS-3.1) after the server
   * replaced draft and state. Resolves once the new session is set (also when the load failed:
   * then the canvas stays as it was).
   */
  rekomenci: () => Promise<void>;
  /**
   * Spec 055 (T4): resolves once no write of the canvas state is in flight; a scheduled one is
   * dropped. Call it before a request that replaces `leinwand.json` on the server (LNS-3.1:
   * „Öffnen“), so a late write of the old session cannot land after it.
   */
  statoAtendi: () => Promise<void>;
  /**
   * Spec 056: the session's current content of a node of this run, as `enhavoDe` reads it
   * (`fehlt: true` on a file that is gone stays), or undefined while it has none.
   */
  inhaltDe: <I extends EnhavoId>(id: I) => InhaltMapo[I] | undefined;
  /**
   * Spec 056: sets the content of a node at once (the Marke node follows on the same render).
   * `konservi: true` – a field left, a value added or removed, a slider let go, an image in or out –
   * also writes the canvas state (the writer of Spec 055: one request in flight, the latest waits,
   * no timer; then „gespeichert HH:MM“) and lights the node's edge(s) into the Marke; `false` keeps
   * it in memory only (typing), and the next write with `true` or any other change carries it.
   */
  inhaltMeti: <I extends EnhavoId>(id: I, inhalt: InhaltMapo[I], konservi: boolean) => void;
  /** Spec 056 (Teil M): what arrives at the Marke now (`markoEnhavoDe` of the session). */
  markoEnhavo: MarkoEnhavo;
  /**
   * Spec 056 (D-19): the outputs whose edge into the Marke is detached, sorted. A value of Werte
   * fades on its own while `wertElirDe(id)` stands here; a node with one output is faded by its frame.
   */
  markoGeloest: readonly string[];
  /** Spec 056: adds a node of „+ Knoten“ at its slot and selects it (at most one per id). */
  nodoAldoni: (id: EnhavoId) => void;
}

export const GestaltenKunteksto = createContext<GestaltenValoro | null>(null);

/** The shell's capabilities; throws outside `<Gestalten>` (a node is never rendered elsewhere). */
export function useGestalten(): GestaltenValoro {
  const valoro = useContext(GestaltenKunteksto);
  if (valoro === null) throw new Error("useGestalten: outside <Gestalten>");
  return valoro;
}
