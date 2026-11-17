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
// Spec 058 (MP-2c, T2, MAW-2.1, plan §3.4): the contract of the tickets of Phases 3 and 4 – the live
// display name (`nomo`, `nomoMeti`), the contents of Grundlagen, „Namen und Beschreibung“, the
// Layout-Beispiel and the Marke (`inhaltDe`, `inhaltMeti`), the session's canvas state (`stato`),
// the view and layout choice of each preview (`vorschauWahl`, `vorschauWahlMeti`), the abdruck of
// the page „Marke“ as last saved (`markeAbdruck`), a request while no state write runs
// (`haltigiDum`), writing now (`konserviNun`), and what the rules of the evaluation read (`schriften`,
// `auswertungEnigo`). The node types `grundlagen`, `ki` and `layout` carry `Datumo058`.

import type { AuswertungEnigo } from "@fundamento/metiejo/auswertung";
import type {
  Ansicht,
  AufbauWahl,
  Bildo,
  BildoFarbo,
  BildoLigo,
  BildoMarko,
  BildoPaletro,
  EnhavoId,
  EnhavoId058,
  InhaltMapo058,
  Kabloj,
  KI_NAMEN_ID,
  LeinwandStato,
  LeinwandSxangxo,
  MarkoEnhavo,
  Nodo058,
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
  /**
   * Spec 058: the view and layout choice the node was built with (a fixed preview: as the server
   * stored it; an added one: as the session holds it). The live choice is `vorschauWahl(id)`.
   */
  ansicht?: Ansicht;
  aufbau?: AufbauWahl;
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

/**
 * Spec 058: a node of Spec 058 – Grundlagen (node type „grundlagen“, fixed), „Namen und
 * Beschreibung“ („ki“, added through „+ Knoten“, `sitzung: true`) or the Layout-Beispiel („layout“,
 * fixed). Its content lives in the session (`inhaltDe`), not in the Bildo.
 */
export interface Datumo058<I extends Nodo058 = Nodo058> {
  id: I;
  speco: "grundlagen" | "ki" | "layout";
}

export type GrundlagenFlowNodo = Node<NodoDatumoj<Datumo058<"teksto-grundlagen">>, "grundlagen">;
export type KiNamenFlowNodo = Node<NodoDatumoj<Datumo058<"ki-namen">>, "ki">;
export type LayoutFlowNodo = Node<NodoDatumoj<Datumo058<"layout-beispiel">>, "layout">;

export type GestaltenFlowNodo =
  | MarkoFlowNodo
  | FarboFlowNodo
  | PaletroFlowNodo
  | VorschauFlowNodo
  | TekstoFlowNodo
  | BeispieleFlowNodo
  | SchriftFlowNodo
  | GrundlagenFlowNodo
  | KiNamenFlowNodo
  | LayoutFlowNodo;

/** Spec 058: the choice of a preview with the defaults filled in. */
export interface VorschauWahlo {
  /** „marke“ (the default) or „komponenten“. */
  ansicht: Ansicht;
  /** „auto“ (the default: as the Layout-Beispiel chooses) or a layout chosen by hand. */
  aufbau: AufbauWahl;
}

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
   * (`fehlt: true` on a file that is gone stays), or undefined while it has none. Spec 058: also
   * `teksto-grundlagen` (`{beschreibung?}`), `ki-namen` (`{vorschlag?}`), `layout-beispiel`
   * (`{datei?, merkmale?, worte?, abdruck?, kosto?}`) and `marko` (`{profil?}`; undefined while
   * there is no readable profile).
   */
  inhaltDe: <I extends EnhavoId058>(id: I) => InhaltMapo058[I] | undefined;
  /**
   * Spec 056: sets the content of a node at once (the Marke node follows on the same render).
   * `konservi: true` – a field left, a value added or removed, a slider let go, an image in or out –
   * also writes the canvas state (the writer of Spec 055: one request in flight, the latest waits,
   * no timer; then „gespeichert HH:MM“) and lights the node's edge(s) into the Marke; `false` keeps
   * it in memory only (typing), and the next write with `true` or any other change carries it.
   * Spec 058: also the four ids of `inhaltDe`; a KI result goes in with `konservi: true` after the
   * route stored it (the next state write then carries it, see `haltigiDum`).
   */
  inhaltMeti: <I extends EnhavoId058>(id: I, inhalt: InhaltMapo058[I], konservi: boolean) => void;
  /** Spec 056 (Teil M): what arrives at the Marke now (`markoEnhavoDe` of the session). */
  markoEnhavo: MarkoEnhavo;
  /**
   * Spec 056 (D-19): the outputs whose edge into the Marke is detached, sorted. A value of Werte
   * fades on its own while `wertElirDe(id)` stands here; a node with one output is faded by its frame.
   */
  markoGeloest: readonly string[];
  /**
   * Spec 056: adds a node of „+ Knoten“ at its slot and selects it (at most one per id; a node that
   * is on the canvas already stays as it is, so `nodoAldoni("schrift")` is safe to call). Spec 058:
   * also „Namen und Beschreibung“ (`ki-namen`), connected to every input that goes into the Marke at
   * that moment.
   */
  nodoAldoni: (id: EnhavoId | typeof KI_NAMEN_ID) => void;
  /**
   * Spec 058: the live display name – what Grundlagen holds while the name is typed (`nomoMeti`;
   * an empty one shows the identifier), else the Agordo's `etikedoj.marko` (`bildo.marko.etikedo`),
   * else the identifier. The header and the Marke pill read it.
   */
  nomo: string;
  /**
   * Spec 058: sets the name while it is typed; writes nothing. The write is `skribi({name})`; once
   * it succeeds (the Bildo carries the new `etikedo`) the typed name gives way to it. „Öffnen“ of a
   * Stand and „Anordnung zurücksetzen“ drop a typed name too.
   */
  nomoMeti: (teksto: string) => void;
  /**
   * Spec 058: the session's canvas state as it would be written now, typing included
   * (`statoDeSesio` over the live contents): the input of `eingabenDe`, `veraltet`, `uebersichtDe`
   * and `markeInhaltDe`. Fixed text nodes appear only with a place or a content (the rules know
   * they are there); Grundlagen's edge into the Marke stands unless `geloest` names it.
   */
  stato: LeinwandStato;
  /** Spec 058: the view and layout choice of the preview `id` (fixed or added), defaults filled in. */
  vorschauWahl: (id: string) => VorschauWahlo;
  /**
   * Spec 058: sets parts of the choice of the preview `id` (the other part stays). It goes into the
   * session at once and into the canvas state with the next write (one PUT, as every change), so it
   * survives a reload and is in every Stand.
   */
  vorschauWahlMeti: (id: string, wahl: { ansicht?: Ansicht; aufbau?: AufbauWahl }) => void;
  /**
   * Spec 058: `abdruckDe(markeInhaltDe(stato, bildo.marko.etikedo))` of the canvas state the server
   * confirmed last (the first answer, then every successful write, `konserviNun` and `rekomenci`):
   * the `inh` of a preview's address, so the page loads once what it shows is stored.
   */
  markeAbdruck: string;
  /**
   * Spec 058: waits until no state write is in flight (`atendi`; a scheduled one is dropped), runs
   * `fn` – a request that writes `leinwand.json` on the server (a KI route) – and then lets the writer
   * write again. The writer resumes only after the render that follows `fn`'s promise, so a result
   * the caller puts into the session with `inhaltMeti(…, true)` right after the `await` is in the
   * next write, and no older state lands over the route's write. Nested or parallel calls share one
   * halt: the writer resumes when the last one ends. Resolves or rejects as `fn` does.
   */
  haltigiDum: <T>(fn: () => Promise<T>) => Promise<T>;
  /**
   * Spec 058: writes the latest canvas state now – contents still being typed included (they count
   * as saved from here) – and a typed name that differs from the Agordo's (`skribi({name})`). Waits
   * for a write in flight first. Resolves `true` once both are saved (also when nothing differed),
   * `false` when a write failed: then the header shows NE_KONSERVITA_SATZ and the writer goes on.
   */
  konserviNun: () => Promise<boolean>;
  /**
   * Spec 058: the families (and catalog ids) of Überschrift and Text as `GET …/schriften` gives them,
   * loaded on the first paint and again on every new rev of the Bildo; `{}` until then or when the
   * route does not answer. Read only.
   */
  schriften: AuswertungEnigo["schriften"];
  /**
   * Spec 058: the plain input of `uebersichtDe` and `eingabenDe` from the live session: `stato`,
   * `nomo`, the Bildo's colour nodes and `schriften`.
   */
  auswertungEnigo: AuswertungEnigo;
}

export const GestaltenKunteksto = createContext<GestaltenValoro | null>(null);

/** The shell's capabilities; throws outside `<Gestalten>` (a node is never rendered elsewhere). */
export function useGestalten(): GestaltenValoro {
  const valoro = useContext(GestaltenKunteksto);
  if (valoro === null) throw new Error("useGestalten: outside <Gestalten>");
  return valoro;
}
