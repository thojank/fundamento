// Spec 054 (MP-1, T3): the canvas of the view Gestalten. It reads the Bildo from `/api/leinwand`,
// lays every node at its place (Spec 055 T1: no phase frames – each node stands alone at an
// absolute place from `poziciojKun` over ARANGXO_054's successor ARANGXO_055, and a drag moves only
// that node), draws the session's edges (`ligojKun`) as right-angled edges with round corners on
// their lanes (055 D-4, D-5) between square ports, and holds the state of the session – React state
// (since Spec 055 mirrored into the brand's canvas state, see below), never browser storage, never
// the address except `?scheme=` (E-9, AK-15):
//   - moved places (`verschoben`, written at the end of a drag; no fetch on a drag),
//   - the session's edges (`LigoSitzung`: detached ones and drawn ones, T7, E-11): an edge is drawn
//     from an output to an input of the same kind (`validaLigo`; a refused one simply does not
//     happen), moved at its end, or detached by dropping its end into empty space, by Entf or
//     Rücktaste on the selected edge, or by its „×“. An input carries one edge; a new one replaces
//     it. Nodes are never deleted (`onBeforeDelete`). When the effective view (`kablojDe`) changes,
//     the Bildo is loaded again with `kabloj` and the previews get it; the Agordo never changes.
//     While the edges differ from the Agordo's (plus those of session nodes), the header shows
//     „Verbindungen geändert · gilt nur in dieser Sitzung“ with „zurücksetzen“. A fixed edge
//     (055 D-18, `fest`) is neither selectable, deletable nor reconnectable, and leaves Primär at
//     its bottom handle (`tenilojDe`),
//   - session-only nodes (further previews from „+ Knoten“; the Funktionsfarben are in the Bildo),
//   - the canvas's scheme (the switch „Leinwand hell | dunkel“ sets `data-fm-color-scheme` on the
//     root and `scheme` in the address with `history.replaceState`, without a reload).
// Spec 055 (T4): places, connections (as `kabloj`, D-13) and further previews persist per brand in
// `leinwand.json`. The session starts from the state the first answer carries (`sesioDeStato`);
// every change of the state (drag end, detach or plug, adding or removing a further preview) is
// written whole, coalesced to the next animation frame with at most one request in flight and the
// latest state pending – no timer. „Anordnung zurücksetzen“ is `statoForigi` + `rekomenci`.
// The nodes read the shell's capabilities from `GestaltenKunteksto` (plan §2.3). The mount element
// carries the marks the scripts and QA wait on: `data-nr-preta` after the first paint,
// `data-nr-rev` with the rev of each Bildo once painted. A late answer older than the one shown is
// dropped.
// Spec 056 (T2): the shell of the nodes of this run.
//   - Teil V (D-17): every edge a dashed Bezier curve (kanto.tsx), the drawing line too; round ports.
//   - The three fixed text nodes are always on the canvas; „+ Knoten“ (KATALOGO_056) adds the four
//     other text nodes, Beispiele and Schrift at their slots (ARANGXO_056), at most one each; an
//     added node can be removed while empty. Their contents live in the session (`inhaltoj`) and the
//     canvas state, never in the Agordo (D-3); a node sets its content with `inhaltMeti` – at once
//     in memory (the Marke follows on the same render), written with the state when `konservi`.
//   - The edges into the Marke follow from the contents (`markoLigojDe`): every text node and every
//     value of Werte into `marko.en.teksto`, Beispiele into `marko.en.bildo`, fainter from an empty
//     node. They are detached by „×“, Entf or by dropping their end into empty space, and plugged by
//     drawing from the output to the Marke's input of the same kind (D-18: plugging one changes no
//     other); detached outputs are kept apart from the colour edges (`markoGeloest`, D-19), stored
//     as `geloest`, and counted by the header notice (D-29), whose „zurücksetzen“ plugs them all.
//     Plugging `beispiele.el` again runs the follow rule (`folgi("gesteckt")`).
//   - Schrift on the canvas: a fixed edge Schrift → Vorschau to every preview (no „×“).
//   - Primär shows „aus Material“ as soon as the Beispiele say so (`primaerStatoKun`).
// Spec 058 (T2, MAW-2.1, plan §3.4): the shell of the tickets of Phases 3 and 4.
//   - It loads `/api/leinwand?…&stufe=58` and places every node by ARANGXO_058
//     (`poziciojKun(…, {stufe: 58})`, widths by `largxoDe(…, {stufe: 58})`).
//   - Grundlagen and the Layout-Beispiel stand on every canvas (also of a brand from before this
//     spec), never removable. Grundlagen's edge into `marko.en.teksto` detaches and plugs like a
//     text node's (`geloest`). The fixed edges Layout-Beispiel → `<preview>.en.bildo` go to every
//     preview, the added ones too (no „×“, like Schrift → Vorschau).
//   - „+ Knoten“ shows KATALOGO_058; „Namen und Beschreibung“ adds `ki-namen` once, connected to
//     every input that goes into the Marke then (`kiNamenLigojDe`); each of its edges detaches
//     (persisted on the node) and plugs again by drawing; both its inputs take many edges.
//   - The node types `grundlagen`, `ki` and `layout` (placeholder files of their owners); the
//     side panel `MarkoFlanko` (gestalten/flanko.tsx) in `<aside data-nr-flanko="marko">` while the
//     Marke is selected; the header slot `marken` and „Anordnen“.
//   - The context of §3.4: `nomo`/`nomoMeti`, `stato`, `vorschauWahl`/`vorschauWahlMeti` (the
//     choice of every preview, in session and state), `markeAbdruck` (of the last confirmed write),
//     `haltigiDum`, `konserviNun`, `schriften`, `auswertungEnigo`.
//   - „Anordnen“ (`anordnungDe`, anordnen.ts): the measured sizes and the visible edges, every place
//     into `verschoben` (one state write, as a drag), then the view fitted once the nodes stand.
//     The nodes jump (no glide), so nothing moves under `prefers-reduced-motion` either; a failed
//     write keeps the places for the session with NE_KONSERVITA_SATZ; nothing lays out by itself.

import {
  type AuswertungEnigo,
  abdruckDe,
  markeInhaltDe,
  wirksamerAufbau,
} from "@fundamento/metiejo/auswertung";
import {
  enhavoDe,
  estasMalplena,
  kiNamenLigojDe,
  markoEnhavoDe,
  markoLigojDe,
  primaerStatoKun,
} from "@fundamento/metiejo/enhavo";
import {
  type Aldoneblo,
  type Ansicht,
  type AufbauWahl,
  aldonebloj,
  anschlussDe,
  type Bildo,
  type BildoFarbo,
  type BildoLigo,
  type BildoNodo,
  type EnhavoId,
  type EnhavoId058,
  estasEnhavoId,
  estasMultaEnir,
  FIKSAJ_TEKSTOJ,
  GRUNDLAGEN_ID,
  type InhaltMapo058,
  type KATALOGO_056,
  KATALOGO_058,
  type Kabloj,
  KI_NAMEN_ID,
  kablojTeksto,
  LAYOUT_ELIR,
  LAYOUT_ID,
  type LeinwandStato,
  type LeinwandSxangxo,
  largxoDe,
  ligoId,
  ligojKun,
  MARKENPROFIL_EINZELHEITEN,
  type Nodo058,
  type Pozicio,
  poziciojKun,
  SCHRIFT_ELIR,
  type Schema,
  tenilojDe,
  validaLigo,
  vorschauBildoEnir,
  vorschauHref,
  vorschauTiparoEnir,
} from "@fundamento/metiejo/gestalten";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionLineType,
  ConnectionMode,
  type Edge,
  type EdgeChange,
  type FinalConnectionState,
  type NodeChange,
  type OnBeforeDelete,
  type OnNodeDrag,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { anordnungDe } from "./anordnen.js";
import {
  fonto058,
  gespeichertTeksto,
  type Respondo,
  type SkriboRezulto,
  type StatoRezulto,
  skribi,
  statoForigi,
  statoSkribi,
  sxargi,
} from "./datumoj.js";
import { MarkoFlanko } from "./flanko.js";
import { folgi } from "./folgo.js";
import { Kanto, type KantoFlowLigo } from "./kanto.js";
import { Kapo, type Konservo, LigoHinweis } from "./kapo.js";
import {
  type Datumo058,
  type EnhavoDatumo,
  type GestaltenFlowNodo,
  GestaltenKunteksto,
  type GestaltenValoro,
  type VorschauDatumo,
} from "./kunteksto.js";
import { Legendo, Zomo } from "./legendo.js";
import { Marken } from "./marken.js";
import { Menuo } from "./menuo.js";
import { BeispieleNodo } from "./nodoj/beispiele.js";
import { FarboNodo } from "./nodoj/farbo.js";
import { GrundlagenNodo } from "./nodoj/grundlagen.js";
import { KiNamenNodo } from "./nodoj/ki-namen.js";
import { LayoutBeispielNodo } from "./nodoj/layout-beispiel.js";
import { MarkoNodo } from "./nodoj/marko.js";
import { PaletroNodo } from "./nodoj/paletro.js";
import { SchriftNodo } from "./nodoj/schrift.js";
import { TekstoNodo } from "./nodoj/teksto.js";
import { VorschauNodo } from "./nodoj/vorschau.js";
import { BAZA_STILO, GESTALTEN_STILO, ROLOJ, useStilo } from "./roloj.js";
import { Staende } from "./staende.js";
import {
  enhavoKnotenDe,
  enhavoNodojDe,
  kablojDeSesio,
  knoten058De,
  kunAldono,
  kunForigo,
  kunLoesen,
  kunWahl,
  kunZiehen,
  ligoSitzungDe,
  markoGeloestDe,
  nodoj058De,
  type Sesio,
  sesioDeStato,
  sesioId,
  sesioLigoj,
  statoDeSesio,
  statoTeksto,
  vorschauWahlDe,
} from "./stato.js";
import { schriftenSxargi } from "./tiparo-datumoj.js";

export interface GestaltenProps {
  /** The mount element `#nr-leinwand`; it carries the ready marks. */
  ujo: HTMLElement;
  /** `data-nr-fonto`: `/api/leinwand?marko=:name`. */
  fonto: string;
  /** `data-nr-marko`: the brand's identifier (write path, links, preview addresses). */
  marko: string;
}

/** One node type per `speco`; the node tickets replace the component behind a name, not the map. */
const NODO_TIPOJ = {
  marko: MarkoNodo,
  farbo: FarboNodo,
  paletro: PaletroNodo,
  vorschau: VorschauNodo,
  teksto: TekstoNodo,
  beispiele: BeispieleNodo,
  schrift: SchriftNodo,
  // Spec 058: the placeholder nodes of MAW-3.2, MAW-3.3 and MAW-4.2 (each replaces its own file).
  grundlagen: GrundlagenNodo,
  ki: KiNamenNodo,
  layout: LayoutBeispielNodo,
};

/** Spec 058: every place, width and height of this canvas comes from ARANGXO_058. */
const STUFO_58 = { stufe: 58 } as const;

/**
 * Spec 058: the catalog „+ Knoten“ of this run. It is KATALOGO_056 with Grundlagen, „Namen und
 * Beschreibung“ and the Layout-Beispiel added at their groups, every other entry as there.
 */
const KATALOGO: typeof KATALOGO_056 = KATALOGO_058;

/** Spec 058: the node type of each node of Spec 058. */
const SPECOJ_058: Readonly<Record<Nodo058, Datumo058["speco"]>> = {
  "teksto-grundlagen": "grundlagen",
  "ki-namen": "ki",
  "layout-beispiel": "layout",
};

const LIGO_TIPOJ = { kanto: Kanto };

/** The z-index of a node raised while it shows a hint (`hervorheben`); siblings stay at 0. */
const LEVITA_Z = 10;

/** „Einpassen“ and the first view: room for the header above, nothing larger than 1:1. */
const ENPASO = {
  padding: { top: "72px", bottom: "40px", left: "16px", right: "16px" },
  maxZoom: 1,
  duration: 0,
} as const;

/**
 * Spec 058 (B-1): the frame of the side panel – on the right, below the header (where the list
 * „+ Knoten“ starts on the left), above the canvas, scrolling on its own. Its content is
 * `MarkoFlanko` (gestalten/flanko.tsx).
 */
const FLANKO_STILO = `
.nr-g-flanko {
  position: absolute;
  z-index: 10;
  inset-block-start: calc(var(--fm-spacing-large) + var(--fm-size-control-medium) + var(--fm-spacing-large));
  inset-inline-end: var(--fm-spacing-large);
  inline-size: var(--fm-size-container-small);
  max-inline-size: calc(100vw - 2 * var(--fm-spacing-large));
  max-block-size: calc(100vh - 8 * var(--fm-spacing-large));
  overflow: auto;
  box-sizing: border-box;
  padding: var(--fm-spacing-large);
  background: ${ROLOJ.tavolo};
  color: ${ROLOJ.teksto};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-medium);
  box-shadow: ${ROLOJ.ombroTavolo};
}
`;

/** Whether two edge lists hold the same edges (by id; an input carries at most one). */
function samajLigoj(a: readonly BildoLigo[], b: readonly BildoLigo[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((l) => l.id));
  return b.every((l) => ids.has(l.id));
}

/**
 * Nodes are never deleted on this canvas; Entf and Rücktaste detach only selected edges, never a
 * fixed one (055 D-18).
 */
const antauForigo: OnBeforeDelete<GestaltenFlowNodo, KantoFlowLigo> = async ({ edges }) => ({
  nodes: [],
  edges: edges.filter((e) => e.selected === true && e.data?.ligo.fest !== true),
});

/**
 * The line while an edge is drawn: a dashed curve in the calm text role (mockup `.kabel`; Spec 056
 * Teil V: the dash of every edge, round ends).
 */
const KABLO_STILO = { strokeDasharray: "4 4", strokeLinecap: "round" } as const;

/** The grab area of an edge's end in px (React Flow's reconnect anchor; default 10). */
const RECONNECT_RADIUSO = 12;

/** The keys that detach a selected edge (E-11). */
const FORIGO_KLAVOJ = ["Delete", "Backspace"];

/** The node a port belongs to (`farbo-primaer.el` → `farbo-primaer`). */
const nodoDe = (port: string): string => anschlussDe(port)?.nodo ?? port.split(".")[0] ?? port;

/** Spec 056: whether `id` is one of the three fixed text nodes (never removable). */
const estasFiksa = (id: string): boolean =>
  FIKSAJ_TEKSTOJ.includes(id as (typeof FIKSAJ_TEKSTOJ)[number]);

/** Spec 058: the fixed edges Layout-Beispiel → Vorschau (image input), one to every preview. */
function layoutLigojDe(vorschauen: readonly string[]): BildoLigo[] {
  return vorschauen.map((v) => ({
    id: ligoId(LAYOUT_ELIR, vorschauBildoEnir(v)),
    de: LAYOUT_ELIR,
    al: vorschauBildoEnir(v),
    art: "bildo",
    fest: true,
  }));
}

/** Spec 056: the fixed edges Schrift → Vorschau, one to every preview, while Schrift is there. */
function schriftLigojDe(vorschauen: readonly string[]): BildoLigo[] {
  return vorschauen.map((v) => ({
    id: ligoId(SCHRIFT_ELIR, vorschauTiparoEnir(v)),
    de: SCHRIFT_ELIR,
    al: vorschauTiparoEnir(v),
    art: "tiparo",
    fest: true,
  }));
}

/** Spec 056: the Bildo with Primär „aus Material“ when the session's Beispiele say so. */
function bildoKunPrimaer(bildo: Bildo, beispiele: Record<string, unknown> | undefined): Bildo {
  const primaer = bildo.nodoj.find((n) => n.id === "farbo-primaer");
  if (primaer?.speco !== "farbo" || primaer.stato === "aus-material") return bildo;
  if (primaerStatoKun(primaer.hex, beispiele) !== "aus-material") return bildo;
  return {
    ...bildo,
    nodoj: bildo.nodoj.map((n) => (n === primaer ? { ...primaer, stato: "aus-material" } : n)),
  };
}

/** Per Bildo, once: its nodes by id (an immutable input; the canvas asks this on every render). */
const indeksoj = new WeakMap<Bildo, ReadonlyMap<string, BildoNodo>>();
function indeksoDe(bildo: Bildo): ReadonlyMap<string, BildoNodo> {
  let indekso = indeksoj.get(bildo);
  if (indekso === undefined) {
    indekso = new Map(bildo.nodoj.map((n) => [n.id, n] as const));
    indeksoj.set(bildo, indekso);
  }
  return indekso;
}

/** Per Bildo, once: a fingerprint of each node the light may start from (colour nodes, palette). */
const spuroj = new WeakMap<Bildo, ReadonlyMap<string, string>>();
function spuroDe(bildo: Bildo): ReadonlyMap<string, string> {
  let spuro = spuroj.get(bildo);
  if (spuro === undefined) {
    spuro = new Map(
      bildo.nodoj.flatMap((n) =>
        n.speco === "farbo" || n.speco === "paletro" ? [[n.id, JSON.stringify(n)] as const] : [],
      ),
    );
    spuroj.set(bildo, spuro);
  }
  return spuro;
}

/** The nodes whose content changed between two Bildo: the sources whose edges light up. */
function sxangxitaj(antaua: Bildo, nova: Bildo): Set<string> {
  const a = spuroDe(antaua);
  const b = spuroDe(nova);
  const out = new Set<string>();
  for (const [id, spuro] of b) if (a.get(id) !== spuro) out.add(id);
  return out;
}

type CxiuNodo = {
  nodo: BildoNodo | VorschauDatumo | EnhavoDatumo | Datumo058;
  sitzung: boolean;
};

/**
 * The `data.nodo` of every node on the canvas: the Bildo's first, then the session's previews,
 * then (Spec 056) the nodes of this run – the three fixed text nodes and the added ones – then
 * (Spec 058) Grundlagen, „Namen und Beschreibung“ while added, and the Layout-Beispiel. An added
 * preview carries its choice and the 058 address (`inh`: the abdruck of the page „Marke“).
 */
function cxiujNodoj(
  bildo: Bildo,
  sesio: Sesio,
  enhavoj: readonly EnhavoId[],
  marko: string,
  kabloj: Kabloj,
  inh: string,
): CxiuNodo[] {
  const layout = enhavoDe(LAYOUT_ID, sesio.inhaltoj?.[LAYOUT_ID]);
  return [
    ...bildo.nodoj.map((nodo) => ({ nodo, sitzung: false })),
    ...sesio.nodoj.map((s) => {
      const { ansicht, aufbau } = vorschauWahlDe(sesio, s.id);
      return {
        nodo: {
          id: s.id,
          speco: "vorschau",
          fazo: "fazo-5",
          schema: s.schema,
          ansicht,
          aufbau,
          href: vorschauHref(marko, s.schema, bildo.rev, kabloj, {
            ...STUFO_58,
            ansicht,
            aufbau: wirksamerAufbau({ aufbau }, layout),
            inh,
          }),
        } satisfies VorschauDatumo,
        sitzung: true,
      };
    }),
    ...enhavoj.map((id) => ({
      nodo: {
        id,
        speco: id === "beispiele" || id === "schrift" ? id : ("teksto" as const),
      } satisfies EnhavoDatumo,
      sitzung: !estasFiksa(id),
    })),
    ...nodoj058De(sesio).map((id) => ({
      nodo: { id, speco: SPECOJ_058[id] } satisfies Datumo058,
      sitzung: id === KI_NAMEN_ID,
    })),
  ];
}

/** The React Flow node of one node of the canvas at its absolute place (no parent, 055 T1). */
function flowNodo(
  { nodo, sitzung }: CxiuNodo,
  pozicio: Pozicio,
  levita: boolean,
): GestaltenFlowNodo {
  const komuna = {
    id: nodo.id,
    position: pozicio,
    width: largxoDe(nodo.id, STUFO_58),
    ...(levita ? { zIndex: LEVITA_Z } : {}),
  };
  switch (nodo.speco) {
    case "marko":
      return { ...komuna, type: "marko", data: { nodo, sitzung } };
    case "farbo":
      return { ...komuna, type: "farbo", data: { nodo, sitzung } };
    case "paletro":
      return { ...komuna, type: "paletro", data: { nodo, sitzung } };
    case "vorschau":
      return { ...komuna, type: "vorschau", data: { nodo, sitzung } };
    case "teksto":
      return { ...komuna, type: "teksto", data: { nodo, sitzung } };
    case "beispiele":
      return {
        ...komuna,
        type: "beispiele",
        data: { nodo: { id: "beispiele", speco: "beispiele" }, sitzung },
      };
    case "schrift":
      return {
        ...komuna,
        type: "schrift",
        data: { nodo: { id: "schrift", speco: "schrift" }, sitzung },
      };
    case "grundlagen":
      return {
        ...komuna,
        type: "grundlagen",
        data: { nodo: { id: GRUNDLAGEN_ID, speco: "grundlagen" }, sitzung },
      };
    case "ki":
      return { ...komuna, type: "ki", data: { nodo: { id: KI_NAMEN_ID, speco: "ki" }, sitzung } };
    case "layout":
      return {
        ...komuna,
        type: "layout",
        data: { nodo: { id: LAYOUT_ID, speco: "layout" }, sitzung },
      };
  }
}

/** The writer of the canvas state (Spec 055 T4, plan §2.4); one per mounted canvas. */
interface StatoSkribilo {
  /** The state changed: one write in the next animation frame, at most one request in flight. */
  plani(): void;
  /** Stops writing (a scheduled write is dropped) and resolves once none is in flight. */
  atendi(): Promise<void>;
  /** Takes `teksto` as the state the server holds and writes again from now on. */
  konati(teksto: string): void;
  /** Writes again after `atendi` without a new state from the server (the load failed). */
  dauxrigi(): void;
  /**
   * Spec 058 (`konserviNun`): waits for a write in flight (a scheduled one is dropped), then writes
   * `stato` at once unless the server holds it, and writes on from there. Resolves whether the
   * server holds `stato` now.
   */
  nun(stato: LeinwandStato): Promise<boolean>;
}

/**
 * Coalesces the writes of the canvas state: a change asks for the next animation frame; a frame
 * sends the latest state unless it is the one the server holds; while a request is in flight
 * nothing more is sent, and once it is back the latest state goes if it differs from the one
 * sent. A failed write leaves the state as the browser has it; the next change tries again. No
 * timer, no new time limit.
 */
function statoSkribilo(o: {
  legi: () => LeinwandStato;
  sendi: (stato: LeinwandStato) => Promise<StatoRezulto>;
  /** What a write answered, with the state it sent (Spec 058: `markeAbdruck` follows it). */
  rezulto: (rezulto: StatoRezulto, stato: LeinwandStato) => void;
  konata: string;
}): StatoSkribilo {
  let konata = o.konata;
  let kadro: number | null = null;
  let flugo: Promise<void> | null = null;
  let haltita = false;
  const nuligi = (): void => {
    if (kadro === null) return;
    cancelAnimationFrame(kadro);
    kadro = null;
  };
  const sendi = async (): Promise<void> => {
    if (haltita || flugo !== null) return;
    const stato = o.legi();
    const teksto = statoTeksto(stato);
    if (teksto === konata) return;
    let fini = (): void => undefined;
    flugo = new Promise<void>((done) => {
      fini = done;
    });
    const rezulto = await o.sendi(stato);
    if (rezulto.speco === "ok") konata = teksto;
    flugo = null;
    fini();
    o.rezulto(rezulto, stato);
    if (statoTeksto(o.legi()) !== teksto) plani();
  };
  const plani = (): void => {
    if (haltita || kadro !== null) return;
    kadro = requestAnimationFrame(() => {
      kadro = null;
      void sendi();
    });
  };
  return {
    plani,
    atendi: async () => {
      haltita = true;
      nuligi();
      while (flugo !== null) await flugo;
    },
    konati: (teksto) => {
      nuligi();
      konata = teksto;
      haltita = false;
    },
    dauxrigi: () => {
      haltita = false;
      plani();
    },
    nun: async (stato) => {
      haltita = true;
      nuligi();
      while (flugo !== null) await flugo;
      const teksto = statoTeksto(stato);
      let tenata = teksto === konata;
      if (!tenata) {
        let fini = (): void => undefined;
        flugo = new Promise<void>((done) => {
          fini = done;
        });
        const rezulto = await o.sendi(stato);
        tenata = rezulto.speco === "ok";
        if (tenata) konata = teksto;
        flugo = null;
        fini();
        o.rezulto(rezulto, stato);
      }
      haltita = false;
      if (statoTeksto(o.legi()) !== konata) plani();
      return tenata;
    },
  };
}

/** The first answer: the Bildo and the stored canvas state. */
type Komenco = Extract<Respondo, { speco: "bildo" }>;

function Fluo({
  ujo,
  fonto,
  marko,
  komenca,
}: {
  ujo: HTMLElement;
  fonto: string;
  marko: string;
  komenca: Komenco;
}) {
  useStilo("baza", BAZA_STILO);
  useStilo("flanko-sxelo", FLANKO_STILO);
  // Spec 055 (T4): the session starts from the stored state (none: the start layout).
  const [unua] = useState(() => sesioDeStato(komenca.stato, komenca.bildo));
  const [bildo, setBildo] = useState(komenca.bildo);
  const [sesio, setSesio] = useState<Sesio>(unua.sesio);
  const [verschoben, setVerschoben] = useState<ReadonlyMap<string, Pozicio>>(unua.verschoben);
  const [levitaj, setLevitaj] = useState<ReadonlySet<string>>(new Set());
  const [elektitajLigoj, setElektitajLigoj] = useState<ReadonlySet<string>>(new Set());
  const [fokusPor, setFokusPor] = useState<string | null>(null);
  const [gespeichert, setGespeichert] = useState<Konservo | null>(null);
  const [statoUnlesbar, setStatoUnlesbar] = useState(komenca.statoUnlesbar);
  const [menuo, setMenuo] = useState(false);
  const [lumoj, setLumoj] = useState<ReadonlyMap<string, number>>(new Map());
  const [skemo, setSkemo] = useState<Schema>(
    document.documentElement.dataset.fmColorScheme === "light" ? "hell" : "dunkel",
  );
  const [nodoj, setNodoj] = useState<GestaltenFlowNodo[]>([]);
  // Spec 056: the contents as last saved (`inhaltMeti(…, true)`): what the state write carries.
  const [konservitaj, setKonservitaj] = useState<NonNullable<Sesio["inhaltoj"]>>(
    () => unua.sesio.inhaltoj ?? {},
  );
  // Spec 056: the light on the edges into the Marke of a node whose content was saved.
  const [markoLumoj, setMarkoLumoj] = useState<ReadonlyMap<string, number>>(new Map());
  const lumoNombro = useRef(0);
  /** The node to select once it is on the canvas (a new one from „+ Knoten“, Akzent). */
  const elektota = useRef<string | null>(null);
  /** Requests to `/api/leinwand`: sent and the newest whose answer is shown. */
  const petoj = useRef({ sendita: 0, montrita: 0 });
  const bildoRef = useRef(bildo);
  bildoRef.current = bildo;
  const sesioRef = useRef(sesio);
  sesioRef.current = sesio;
  const verschobenRef = useRef(verschoben);
  verschobenRef.current = verschoben;
  /** The number of the next further preview: past the highest one stored (`vorschau-3` first). */
  const vorschauNombro = useRef(unua.vorschauNombro);
  // Spec 058: the name while it is typed in Grundlagen (null: the Agordo's), the fonts for the
  // rules of the evaluation, and whether the view is fitted once the laid-out nodes stand.
  const [nomoTajpita, setNomoTajpita] = useState<string | null>(null);
  const [schriften, setSchriften] = useState<AuswertungEnigo["schriften"]>({});
  const enpasoPost = useRef(false);
  const { fitView } = useReactFlow();
  const preta = useNodesInitialized();

  const indekso = indeksoDe(bildo);
  const sesioNodoj = sesio.nodoj;
  // Spec 056: the nodes of this run, their contents as the shared rules read them, the detached
  // outputs that still exist, and what arrives at the Marke – all from the live session.
  const enhavoj = useMemo(() => enhavoNodojDe(sesio), [sesio]);
  const enhavoKnoten = useMemo(() => enhavoKnotenDe(sesio), [sesio]);
  // Spec 058: with Grundlagen, „Namen und Beschreibung“ and the Layout-Beispiel.
  const knotenCxiuj = useMemo(
    () => [...enhavoKnoten, ...knoten058De(sesio)],
    [enhavoKnoten, sesio],
  );
  const markoGeloest = useMemo(() => markoGeloestDe(sesio), [sesio]);
  const markoEnhavo = useMemo(
    () => markoEnhavoDe(enhavoKnoten, markoGeloest),
    [enhavoKnoten, markoGeloest],
  );
  const beispieleInhalt = sesio.inhaltoj?.beispiele;
  // Spec 056: Primär „aus Material“ as soon as the Beispiele say so (the server says so on load).
  const bildoMontrita = useMemo(
    () => bildoKunPrimaer(bildo, beispieleInhalt),
    [bildo, beispieleInhalt],
  );
  // The colour edges of the session (054/055), then (Spec 056) the edges into the Marke and the
  // fixed Schrift → Vorschau edges; Spec 058: Grundlagen's edge into the Marke first, the edges
  // into „Namen und Beschreibung“ and the fixed Layout-Beispiel → Vorschau edges.
  const farboLigoj = useMemo(() => ligojKun(ligoSitzungDe(sesio), bildo), [sesio, bildo]);
  const ligoj = useMemo(() => {
    const vorschauen = [
      ...bildo.nodoj.filter((n) => n.speco === "vorschau").map((n) => n.id),
      ...sesioNodoj.map(sesioId),
    ];
    return [
      ...farboLigoj,
      ...markoLigojDe(knotenCxiuj, markoGeloest, STUFO_58),
      ...kiNamenLigojDe(knotenCxiuj),
      ...(enhavoj.includes("schrift") ? schriftLigojDe(vorschauen) : []),
      ...layoutLigojDe(vorschauen),
    ];
  }, [farboLigoj, knotenCxiuj, markoGeloest, enhavoj, bildo, sesioNodoj]);
  const ligojRef = useRef(ligoj);
  ligojRef.current = ligoj;
  // Spec 056: Werte has one port per value; React Flow measures the ports of a node again only when
  // told (a value that replaces another of the same size would keep a stale port).
  const updateNodeInternals = useUpdateNodeInternals();
  const wertPordoj = markoLigojDe(enhavoKnoten, [])
    .filter((l) => l.de.startsWith("teksto-werte.el."))
    .map((l) => l.de)
    .join(" ");
  useEffect(() => {
    if (wertPordoj !== "") updateNodeInternals("teksto-werte");
  }, [wertPordoj, updateNodeInternals]);
  // The edges the session started from: the Agordo's plus those of the session nodes. The notice
  // in the header shows exactly while the session's edges differ from them (AK-19).
  const grundLigoj = useMemo(
    () =>
      ligojKun(
        {
          geloest: [],
          gezogen: sesioNodoj.flatMap(sesioLigoj),
          nodoj: sesioNodoj.map(sesioId),
        },
        bildo,
      ),
    [sesioNodoj, bildo],
  );
  const ligojSxangxitaj = !samajLigoj(farboLigoj, grundLigoj);

  const kabloj = useMemo(() => kablojDeSesio(bildo, sesio), [bildo, sesio]);
  // Spec 056 (D-29): the notice counts the changed colour rows and the detached edges into the
  // Marke (at least one while the colour edges differ from the Agordo's).
  const geloestNombro = Object.keys(kabloj).length + markoGeloest.length;
  const ligoHinweisNombro =
    ligojSxangxitaj || markoGeloest.length > 0 ? Math.max(geloestNombro, 1) : 0;

  // Load (again) with the session's kabloj and show only an answer newer than the one shown.
  const sxargiDenove = useCallback(
    async (k: Kabloj): Promise<void> => {
      const numero = ++petoj.current.sendita;
      const respondo = await sxargi(fonto, k);
      if (respondo.speco !== "bildo" || numero <= petoj.current.montrita) return;
      petoj.current.montrita = numero;
      const antaua = bildoRef.current;
      const nova = respondo.bildo;
      const lumigotaj = sxangxitaj(antaua, nova);
      if (lumigotaj.size > 0) {
        lumigotaj.add("paletro");
        setLumoj(new Map([...lumigotaj].map((id) => [id, nova.rev] as const)));
      }
      setBildo(nova);
    },
    [fonto],
  );

  // A change of the effective view reloads the Bildo with it (never on the first render).
  const kablojTekstoNun = kablojTeksto(kabloj);
  const kablojPetita = useRef(kablojTeksto(komenca.bildo.kabloj));
  const kablojRef = useRef(kabloj);
  kablojRef.current = kabloj;
  useEffect(() => {
    if (kablojTekstoNun === kablojPetita.current) return;
    kablojPetita.current = kablojTekstoNun;
    void sxargiDenove(kablojRef.current);
  }, [kablojTekstoNun, sxargiDenove]);

  // Spec 055 (T4): the canvas state of the session, written whenever it changes. The state the
  // first answer gave is the one the server holds, so nothing is written before a change (no
  // leinwand.json before the first change of the layout).
  // Spec 056: the contents as last saved; typing alone writes nothing.
  const stato = useMemo(
    () => statoDeSesio(bildo, { ...sesio, inhaltoj: konservitaj }, verschoben, kabloj),
    [bildo, sesio, konservitaj, verschoben, kabloj],
  );
  const statoRef = useRef(stato);
  statoRef.current = stato;
  const statoTekstoNun = statoTeksto(stato);
  // Spec 058: the state as it would be written now, typing included (`stato` of the context), and
  // the state the server confirmed last (`markeAbdruck` follows it).
  const statoSesio = useMemo(
    () => statoDeSesio(bildo, sesio, verschoben, kabloj),
    [bildo, sesio, verschoben, kabloj],
  );
  const [konfirmita, setKonfirmita] = useState<LeinwandStato>(stato);
  const skribiloRef = useRef<StatoSkribilo | null>(null);
  skribiloRef.current ??= statoSkribilo({
    legi: () => statoRef.current,
    sendi: (s) => statoSkribi(marko, s),
    rezulto: (r, sendita) => {
      if (r.speco === "ok") {
        setGespeichert({ speco: "ok", teksto: gespeichertTeksto(r.gespeichert) });
        setStatoUnlesbar(false);
        setKonfirmita(sendita);
      } else setGespeichert({ speco: "ne" });
    },
    konata: statoTekstoNun,
  });
  const skribilo = skribiloRef.current;
  useEffect(() => {
    if (statoTekstoNun !== "") skribilo.plani();
  }, [statoTekstoNun, skribilo]);

  // Spec 058: the live display name and the abdruck of the page „Marke“ as last confirmed.
  const etikedo = bildo.marko.etikedo;
  const nomo =
    nomoTajpita === null
      ? etikedo === ""
        ? marko
        : etikedo
      : nomoTajpita.trim() === ""
        ? marko
        : nomoTajpita.trim();
  const markeAbdruck = useMemo(
    () => abdruckDe(markeInhaltDe(konfirmita, etikedo)),
    [konfirmita, etikedo],
  );
  const cxiuj = useMemo(
    () => cxiujNodoj(bildoMontrita, sesio, enhavoj, marko, kabloj, markeAbdruck),
    [bildoMontrita, sesio, enhavoj, marko, kabloj, markeAbdruck],
  );

  // Spec 055 (T4): the session again from the stored state (plan §2.4, contract for LNS-3.1).
  const rekomenci = useCallback(async (): Promise<void> => {
    await skribilo.atendi();
    const numero = ++petoj.current.sendita;
    const respondo = await sxargi(fonto);
    if (respondo.speco !== "bildo") {
      skribilo.dauxrigi();
      return;
    }
    petoj.current.montrita = Math.max(petoj.current.montrita, numero);
    const nova = sesioDeStato(respondo.stato, respondo.bildo);
    const novajKabloj = kablojDeSesio(respondo.bildo, nova.sesio);
    kablojPetita.current = kablojTeksto(respondo.bildo.kabloj);
    vorschauNombro.current = nova.vorschauNombro;
    setBildo(respondo.bildo);
    setSesio(nova.sesio);
    setKonservitaj(nova.sesio.inhaltoj ?? {});
    setVerschoben(nova.verschoben);
    setStatoUnlesbar(respondo.statoUnlesbar);
    setElektitajLigoj(new Set());
    setFokusPor(null);
    // Spec 058: the Agordo may carry another name now; the reloaded state is the confirmed one.
    setNomoTajpita(null);
    const novaStato = statoDeSesio(respondo.bildo, nova.sesio, nova.verschoben, novajKabloj);
    setKonfirmita(novaStato);
    skribilo.konati(statoTeksto(novaStato));
  }, [fonto, skribilo]);

  // „Anordnung zurücksetzen“: start places, the Agordo's connections, added nodes stay at their
  // start slots; the Agordo does not change. When the server could not reset, nothing else does.
  const anordnungZuruecksetzen = useCallback(async (): Promise<void> => {
    await skribilo.atendi();
    const rezulto = await statoForigi(marko);
    if (rezulto.speco !== "ok") {
      setGespeichert({ speco: "ne" });
      skribilo.dauxrigi();
      return;
    }
    setGespeichert({ speco: "ok", teksto: gespeichertTeksto(rezulto.gespeichert) });
    await rekomenci();
    requestAnimationFrame(() => void fitView(ENPASO));
  }, [marko, skribilo, rekomenci, fitView]);

  // The nodes at their places; React Flow's measurements and selection carry over.
  useEffect(() => {
    const pozicioj = poziciojKun(
      verschoben,
      cxiuj.map(({ nodo }) => ({ id: nodo.id })),
      STUFO_58,
    );
    const elekti = elektota.current;
    elektota.current = null;
    setNodoj((antauaj) => {
      const antaue = new Map(antauaj.map((n) => [n.id, n] as const));
      return cxiuj.map((c) => {
        const nova = flowNodo(c, pozicioj.get(c.nodo.id) ?? { x: 0, y: 0 }, levitaj.has(c.nodo.id));
        const malnova = antaue.get(nova.id);
        const selected = elekti === null ? malnova?.selected === true : nova.id === elekti;
        return {
          ...nova,
          selected,
          ...(malnova?.measured === undefined ? {} : { measured: malnova.measured }),
        } as GestaltenFlowNodo;
      });
    });
  }, [cxiuj, verschoben, levitaj]);
  const nodojRef = useRef(nodoj);
  nodojRef.current = nodoj;
  // Spec 058: after „Anordnen“ the view is fitted once the nodes stand at their new places (React
  // Flow's store has them after this render's child effects).
  useEffect(() => {
    if (!enpasoPost.current || nodoj.length === 0) return;
    enpasoPost.current = false;
    void fitView(ENPASO);
  }, [nodoj, fitView]);

  const onNodesChange = useCallback((sxangxoj: NodeChange<GestaltenFlowNodo>[]) => {
    // Nodes are never removed here (`onBeforeDelete` keeps them); places, sizes and selection change.
    setNodoj((n) =>
      applyNodeChanges(
        sxangxoj.filter((s) => s.type !== "remove"),
        n,
      ),
    );
  }, []);

  // The end of a drag keeps the place in the session; nothing is sent during a drag (AK-15). Spec
  // 055 (T4): the new place goes into the canvas state, written once the drag has ended.
  const onNodeDragStop = useCallback<OnNodeDrag<GestaltenFlowNodo>>((_evento, _nodo, movitaj) => {
    setVerschoben((nun) => {
      const nova = new Map(nun);
      for (const n of movitaj) nova.set(n.id, { x: n.position.x, y: n.position.y });
      return nova;
    });
  }, []);

  // T7 (E-11): the session's connections. Every change goes through `kunZiehen`/`kunLoesen`; the
  // edges on the canvas stay `ligojKun(session, bildo)`, the Agordo never changes (AK-18).
  const ziehen = useCallback((de: string, al: string) => {
    setSesio((nun) => kunZiehen(nun, ligojRef.current, de, al));
  }, []);
  const loesen = useCallback((ids: readonly string[]) => {
    if (ids.length === 0) return;
    setSesio((nun) => kunLoesen(nun, ids));
    setElektitajLigoj((nun) => new Set([...nun].filter((id) => !ids.includes(id))));
  }, []);
  // „zurücksetzen“ of the notice: the Agordo's colour edges and (Spec 056) every edge into the
  // Marke plugged again.
  const zuruecksetzen = useCallback(() => {
    setSesio(({ markoGeloest: _m, ...nun }) => ({
      ...nun,
      geloest: [],
      gezogen: nun.nodoj.flatMap(sesioLigoj),
    }));
    setElektitajLigoj(new Set());
  }, []);
  // Same kind, output → input, forward, no cycle; the Palette never feeds a colour node (AK-17).
  const isValidConnection = useCallback(
    (c: Connection | Edge) =>
      c.sourceHandle != null &&
      c.targetHandle != null &&
      validaLigo(ligojRef.current, c.sourceHandle, c.targetHandle),
    [],
  );
  const onConnect = useCallback(
    (c: Connection) => {
      if (c.sourceHandle != null && c.targetHandle != null) ziehen(c.sourceHandle, c.targetHandle);
    },
    [ziehen],
  );
  // Moving an edge's end: onto a matching input it moves there; dropped into empty space it is
  // detached; dropped on a port it may not end on, nothing changes.
  const movita = useRef(false);
  const onReconnectStart = useCallback(() => {
    movita.current = false;
  }, []);
  const onReconnect = useCallback((malnova: Edge, c: Connection) => {
    movita.current = true;
    const { sourceHandle: de, targetHandle: al } = c;
    if (de == null || al == null) return;
    setSesio((nun) =>
      kunZiehen(
        kunLoesen(nun, [malnova.id]),
        ligojRef.current.filter((l) => l.id !== malnova.id),
        de,
        al,
      ),
    );
  }, []);
  const onReconnectEnd = useCallback(
    (
      _evento: MouseEvent | TouchEvent,
      malnova: Edge,
      _tipo: unknown,
      stato: FinalConnectionState,
    ) => {
      if (!movita.current && stato.toHandle === null) loesen([malnova.id]);
      movita.current = false;
    },
    [loesen],
  );
  const onEdgesChange = useCallback((sxangxoj: EdgeChange<KantoFlowLigo>[]) => {
    // Only the selection lives here; a removal comes through `onEdgesDelete` after `onBeforeDelete`.
    const elektoj = sxangxoj.filter((s) => s.type === "select");
    if (elektoj.length === 0) return;
    setElektitajLigoj((nun) => {
      const nova = new Set(nun);
      for (const s of elektoj) {
        if (s.selected) nova.add(s.id);
        else nova.delete(s.id);
      }
      return nova;
    });
  }, []);
  const onEdgesDelete = useCallback(
    (forigitaj: KantoFlowLigo[]) => loesen(forigitaj.map((e) => e.id)),
    [loesen],
  );

  const randoj = useMemo<KantoFlowLigo[]>(() => {
    const sesiaj = new Set(sesioNodoj.map(sesioId));
    const surMarko = new Set(ligoj.filter((l) => l.de === "marko.el").map((l) => nodoDe(l.al)));
    const nodoAl = (id: string) => indekso.get(id);
    const inhaltoj = new Map(knotenCxiuj.map((k) => [k.id, k.inhalt] as const));
    return ligoj.map((ligo: BildoLigo) => {
      const de = nodoDe(ligo.de);
      const fontaNodo = nodoAl(de);
      const malplena =
        sesiaj.has(de) || (fontaNodo?.speco === "farbo" && fontaNodo.stato === "leer");
      const farbo = de.startsWith("farbo-");
      // Spec 056: an edge into the Marke is fainter from an empty node, and lights up when the
      // node's content was saved. Spec 058: an edge into „Namen und Beschreibung“ as well.
      const enMarkon = estasMultaEnir(ligo.al);
      const malplenaEnhavo = enMarkon && estasMalplena(de, inhaltoj.get(de));
      // 055 D-18: a fixed edge leaves Primär at its bottom handle and cannot be touched.
      const teniloj = tenilojDe(ligo);
      const fest = ligo.fest === true;
      return {
        id: ligo.id,
        type: "kanto",
        source: de,
        sourceHandle: teniloj.de,
        target: nodoDe(ligo.al),
        targetHandle: teniloj.al,
        selected: !fest && elektitajLigoj.has(ligo.id),
        ...(fest ? { selectable: false, deletable: false, reconnectable: false } : {}),
        data: {
          ligo,
          matt: (farbo && (malplena || !surMarko.has(de))) || malplenaEnhavo,
          lumo: (enMarkon ? markoLumoj.get(de) : lumoj.get(de)) ?? 0,
        },
      };
    });
  }, [ligoj, sesioNodoj, indekso, lumoj, markoLumoj, elektitajLigoj, knotenCxiuj]);

  const skribiKaj = useCallback(
    async (sxangxo: LeinwandSxangxo): Promise<SkriboRezulto> => {
      const rezulto = await skribi(marko, sxangxo);
      if (rezulto.speco === "ok") {
        setGespeichert({ speco: "ok", teksto: gespeichertTeksto(rezulto.gespeichert) });
        await sxargiDenove(kablojRef.current);
        // Spec 058: the written name is the Agordo's now; the typed one gives way to it.
        if ("name" in sxangxo) setNomoTajpita(null);
      }
      return rezulto;
    },
    [marko, sxargiDenove],
  );

  const forigi = useCallback((id: string) => {
    // Spec 058: Grundlagen and the Layout-Beispiel stand on every canvas.
    if (id === GRUNDLAGEN_ID || id === LAYOUT_ID) return;
    // Spec 056: an added node of this run goes with its content and its detached outputs; Spec
    // 058: „Namen und Beschreibung“ too.
    if (estasEnhavoId(id) || id === KI_NAMEN_ID) {
      if (estasFiksa(id)) return;
      setSesio((nun) => kunForigo(nun, id));
      setKonservitaj(({ [id as EnhavoId058]: _weg, ...resto }) => resto);
    }
    setSesio((nun) => {
      if (!nun.nodoj.some((s) => sesioId(s) === id)) return nun;
      const { [id]: _wahl, ...wahloj } = nun.wahloj ?? {};
      return {
        ...nun,
        nodoj: nun.nodoj.filter((s) => sesioId(s) !== id),
        gezogen: nun.gezogen.filter((g) => nodoDe(g.de) !== id && nodoDe(g.al) !== id),
        ...(nun.wahloj === undefined ? {} : { wahloj }),
      };
    });
    setVerschoben((nun) => {
      if (!nun.has(id)) return nun;
      const nova = new Map(nun);
      nova.delete(id);
      return nova;
    });
    setFokusPor((nun) => (nun === id ? null : nun));
  }, []);

  const hervorheben = useCallback((id: string, on: boolean) => {
    setLevitaj((nun) => {
      if (nun.has(id) === on) return nun;
      const nova = new Set(nun);
      if (on) nova.add(id);
      else nova.delete(id);
      return nova;
    });
  }, []);

  const elektiSkemon = useCallback((nova: Schema) => {
    setSkemo(nova);
    document.documentElement.dataset.fmColorScheme = nova === "hell" ? "light" : "dark";
    const adreso = new URL(window.location.href);
    adreso.searchParams.set("scheme", nova === "hell" ? "light" : "dark");
    window.history.replaceState(window.history.state, "", adreso);
  }, []);

  const einpassen = useCallback(() => void fitView(ENPASO), [fitView]);

  // „+ Knoten“: the list of the catalog for every node on the canvas, Bildo and session.
  const listo = useMemo(
    () =>
      aldonebloj(
        KATALOGO,
        cxiuj.map(({ nodo }) =>
          nodo.speco === "farbo" ? { id: nodo.id, stato: nodo.stato } : { id: nodo.id },
        ),
      ),
    [cxiuj],
  );
  const hexDe = useCallback(
    (a: Aldoneblo): string | undefined => {
      if (a.zeichen !== "farbo" || a.nodo === undefined) return undefined;
      const nodo = cxiuj.find((c) => c.nodo.id === a.nodo)?.nodo;
      if (nodo?.speco === "farbo" && nodo.hex !== "") return nodo.hex;
      const primaer = indekso.get("farbo-primaer");
      return primaer?.speco === "farbo" ? primaer.hex : undefined;
    },
    [cxiuj, indekso],
  );
  // Spec 056: a node of „+ Knoten“ at its slot, selected (once; the list offers it only then).
  // Spec 058: also „Namen und Beschreibung“; a node already on the canvas stays as it is.
  const nodoAldoni = useCallback((id: EnhavoId | typeof KI_NAMEN_ID) => {
    if (id !== KI_NAMEN_ID && estasFiksa(id)) return;
    const sesioNun = sesioRef.current;
    const jam =
      id === KI_NAMEN_ID ? sesioNun.kiNamen !== undefined : enhavoNodojDe(sesioNun).includes(id);
    if (jam) return;
    elektota.current = id;
    setSesio((nun) => kunAldono(nun, id));
  }, []);
  const elekti = useCallback(
    (a: Aldoneblo) => {
      setMenuo(false);
      if (
        a.stato === "anlegen" &&
        a.nodo !== undefined &&
        (estasEnhavoId(a.nodo) || a.nodo === KI_NAMEN_ID)
      ) {
        nodoAldoni(a.nodo);
        return;
      }
      if (a.stato === "setzen" && a.nodo !== undefined) {
        elektota.current = a.nodo;
        setNodoj((n) => n.map((x) => ({ ...x, selected: x.id === a.nodo })));
        setFokusPor(a.nodo);
        return;
      }
      if (a.stato === "weitere") {
        const ekzistas = new Set(cxiuj.map((c) => c.nodo.id));
        let n = vorschauNombro.current;
        while (ekzistas.has(`vorschau-${n}`)) n += 1;
        vorschauNombro.current = n + 1;
        const id = `vorschau-${n}`;
        elektota.current = id;
        setSesio((nun) =>
          kunZiehen(
            { ...nun, nodoj: [...nun.nodoj, { speco: "vorschau", id, schema: "hell" }] },
            ligojRef.current,
            "paletro.el",
            `${id}.en`,
          ),
        );
      }
    },
    [cxiuj, nodoAldoni],
  );
  const fermiMenuon = useCallback(() => setMenuo(false), []);

  // Spec 056 (§2.2): a node sets its content; `konservi` also writes the state and lights its
  // edges into the Marke.
  const inhaltMeti = useCallback(
    <I extends EnhavoId058>(id: I, inhalt: InhaltMapo058[I], konservi: boolean): void => {
      const roh = inhalt as Record<string, unknown>;
      setSesio((nun) => ({ ...nun, inhaltoj: { ...nun.inhaltoj, [id]: roh } }));
      if (!konservi) return;
      setKonservitaj((nun) => ({ ...nun, [id]: roh }));
      lumoNombro.current += 1;
      setMarkoLumoj(new Map([[id, lumoNombro.current]]));
    },
    [],
  );
  const inhaltoj = sesio.inhaltoj;
  const inhaltDe = useCallback(
    <I extends EnhavoId058>(id: I): InhaltMapo058[I] | undefined => enhavoDe(id, inhaltoj?.[id]),
    [inhaltoj],
  );

  // Spec 058 (§3.4): the rest of the contract of Phases 3 and 4.
  const nomoMeti = useCallback((teksto: string) => setNomoTajpita(teksto), []);
  const vorschauWahl = useCallback((id: string) => vorschauWahlDe(sesio, id), [sesio]);
  const vorschauWahlMeti = useCallback(
    (id: string, wahl: { ansicht?: Ansicht; aufbau?: AufbauWahl }) =>
      setSesio((nun) => kunWahl(nun, id, wahl)),
    [],
  );
  // `haltigiDum`: the writer stands while `fn` runs; it resumes in the effect after the render
  // that follows (so a result put into the session right after the `await` is in that render).
  const haltoj = useRef(0);
  const [dauxrigoj, setDauxrigoj] = useState(0);
  useEffect(() => {
    if (dauxrigoj > 0 && haltoj.current === 0) skribilo.dauxrigi();
  }, [dauxrigoj, skribilo]);
  const haltigiDum = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      haltoj.current += 1;
      try {
        await skribilo.atendi();
        return await fn();
      } finally {
        haltoj.current -= 1;
        setDauxrigoj((n) => n + 1);
      }
    },
    [skribilo],
  );
  const nomoTajpitaRef = useRef(nomoTajpita);
  nomoTajpitaRef.current = nomoTajpita;
  const konserviNun = useCallback(async (): Promise<boolean> => {
    // A typed name that differs from the Agordo's (an empty one stands for the identifier).
    const tajpita = nomoTajpitaRef.current?.trim();
    if (
      tajpita !== undefined &&
      (tajpita === "" ? marko : tajpita) !== bildoRef.current.marko.etikedo
    ) {
      const rezulto = await skribiKaj({ name: tajpita });
      if (rezulto.speco !== "ok") {
        setGespeichert({ speco: "ne" });
        return false;
      }
    }
    // Contents still being typed count as saved from here (the writer reads them from now on).
    const nun = sesioRef.current;
    const nunaStato = statoDeSesio(
      bildoRef.current,
      nun,
      verschobenRef.current,
      kablojDeSesio(bildoRef.current, nun),
    );
    setKonservitaj(nun.inhaltoj ?? {});
    return skribilo.nun(nunaStato);
  }, [marko, skribiKaj, skribilo]);
  // Spec 058: the families of Überschrift and Text for the rules of the evaluation, per rev.
  const rev = bildo.rev;
  useEffect(() => {
    let nuligita = false;
    void schriftenSxargi(marko).then((datumoj) => {
      // An answer older than the Bildo shown is no news (as the node Schrift reads it).
      if (nuligita || datumoj === undefined || datumoj.rev < rev) return;
      const eingabe = (r: "display" | "body") => {
        const s = datumoj.schriften[r];
        return s === undefined
          ? {}
          : {
              [r]: { familie: s.familie, ...(s.tiparo === undefined ? {} : { tiparo: s.tiparo }) },
            };
      };
      setSchriften({ ...eingabe("display"), ...eingabe("body") });
    });
    return () => {
      nuligita = true;
    };
  }, [marko, rev]);
  const farben = useMemo(
    () => bildoMontrita.nodoj.filter((n): n is BildoFarbo => n.speco === "farbo"),
    [bildoMontrita],
  );
  const auswertungEnigo = useMemo<AuswertungEnigo>(
    () => ({ stato: statoSesio, nomo, farben, schriften }),
    [statoSesio, nomo, farben, schriften],
  );

  // Spec 058 (product spec A): „Anordnen“ from the measured sizes and the visible edges.
  const anordnen = useCallback(() => {
    const mezuritaj = nodojRef.current.map((n) => ({
      id: n.id,
      largxo: n.measured?.width ?? n.width ?? 0,
      alteco: n.measured?.height ?? n.height ?? 0,
    }));
    if (mezuritaj.length === 0 || mezuritaj.some((m) => m.alteco === 0)) return;
    enpasoPost.current = true;
    setVerschoben(anordnungDe(mezuritaj, ligojRef.current));
  }, []);

  const valoro = useMemo<GestaltenValoro>(
    () => ({
      marko,
      bildo: bildoMontrita,
      skribi: skribiKaj,
      kabloj,
      ligoj,
      verbunden: (port) => ligoj.some((l) => l.de === port || l.al === port),
      abgehaengt: (farboId) => !ligoj.some((l) => l.de === "marko.el" && l.al === `${farboId}.en`),
      forigi,
      fokusPor,
      fokusFarita: () => setFokusPor(null),
      hervorheben,
      skemo,
      rekomenci,
      statoAtendi: () => skribilo.atendi(),
      inhaltDe,
      inhaltMeti,
      markoEnhavo,
      markoGeloest,
      nodoAldoni,
      nomo,
      nomoMeti,
      stato: statoSesio,
      vorschauWahl,
      vorschauWahlMeti,
      markeAbdruck,
      haltigiDum,
      konserviNun,
      schriften,
      auswertungEnigo,
    }),
    [
      marko,
      bildoMontrita,
      skribiKaj,
      kabloj,
      ligoj,
      forigi,
      fokusPor,
      hervorheben,
      skemo,
      rekomenci,
      skribilo,
      inhaltDe,
      inhaltMeti,
      markoEnhavo,
      markoGeloest,
      nodoAldoni,
      nomo,
      nomoMeti,
      statoSesio,
      vorschauWahl,
      vorschauWahlMeti,
      markeAbdruck,
      haltigiDum,
      konserviNun,
      schriften,
      auswertungEnigo,
    ],
  );
  const valoroRef = useRef(valoro);
  valoroRef.current = valoro;

  // Spec 056 (§2.2, Teil M): `beispiele.el` plugged into the Marke again → the follow rule runs
  // once with the new session (the effect sees the context of that render).
  const beispieleGeloest = markoGeloest.includes("beispiele.el");
  const antauaBeispieleGeloest = useRef(beispieleGeloest);
  useEffect(() => {
    const antaua = antauaBeispieleGeloest.current;
    antauaBeispieleGeloest.current = beispieleGeloest;
    if (antaua && !beispieleGeloest && enhavoj.includes("beispiele"))
      void folgi("gesteckt", valoroRef.current);
  }, [beispieleGeloest, enhavoj]);

  // The first paint: fit, wait until painted, then the marks. Every later Bildo: its rev.
  useEffect(() => {
    if (!preta) return;
    let nuligita = false;
    const unua = ujo.dataset.nrPreta === undefined;
    const marki = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (nuligita) return;
          ujo.dataset.nrRev = String(bildo.rev);
          ujo.dataset.nrKabloj = kablojTeksto(bildo.kabloj);
          if (unua) ujo.dataset.nrPreta = String(Math.round(performance.now()));
        }),
      );
    if (unua) void fitView(ENPASO).then(marki);
    else marki();
    return () => {
      nuligita = true;
    };
  }, [preta, bildo, fitView, ujo]);

  const primaer = indeksoDe(bildoMontrita).get("farbo-primaer");
  // Spec 058: the side panel while the Marke is selected.
  const markoElektita = nodoj.some((n) => n.id === "marko" && n.selected === true);

  return (
    <GestaltenKunteksto.Provider value={valoro}>
      <div className="nr-g" style={GESTALTEN_STILO} data-nr-ansicht="gestalten">
        <ReactFlow
          nodes={nodoj}
          edges={randoj}
          nodeTypes={NODO_TIPOJ}
          edgeTypes={LIGO_TIPOJ}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onBeforeDelete={antauForigo}
          onConnect={onConnect}
          onReconnectStart={onReconnectStart}
          onReconnect={onReconnect}
          onReconnectEnd={onReconnectEnd}
          isValidConnection={isValidConnection}
          connectionMode={ConnectionMode.Strict}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={KABLO_STILO}
          colorMode={skemo === "hell" ? "light" : "dark"}
          nodesDraggable
          nodesConnectable
          edgesReconnectable
          reconnectRadius={RECONNECT_RADIUSO}
          deleteKeyCode={FORIGO_KLAVOJ}
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-center"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Legendo primaerHex={primaer?.speco === "farbo" ? primaer.hex : undefined} />
          <Zomo einpassen={einpassen} />
        </ReactFlow>
        <Kapo
          marko={marko}
          nomo={nomo}
          marken={<Marken />}
          anordnen={anordnen}
          menuoMalfermita={menuo}
          menuo={() => setMenuo((m) => !m)}
          gespeichert={gespeichert}
          statoUnlesbar={statoUnlesbar}
          anordnungZuruecksetzen={() => void anordnungZuruecksetzen()}
          staende={<Staende dauxrigi={skribilo.dauxrigi} />}
          skemo={skemo}
          elektiSkemon={elektiSkemon}
          ligoHinweis={
            ligoHinweisNombro > 0 ? (
              <LigoHinweis nombro={ligoHinweisNombro} zuruecksetzen={zuruecksetzen} />
            ) : null
          }
        />
        {menuo ? (
          <Menuo aldonebloj={listo} hexDe={hexDe} elekti={elekti} fermi={fermiMenuon} />
        ) : null}
        {markoElektita ? (
          <aside
            className="nr-g-flanko"
            aria-label={MARKENPROFIL_EINZELHEITEN}
            data-nr-flanko="marko"
          >
            <MarkoFlanko />
          </aside>
        ) : null}
      </div>
    </GestaltenKunteksto.Provider>
  );
}

/** The calm page instead of a canvas: an invalid draft or a problem of the server. */
function Ruhig({ respondo }: { respondo: Exclude<Respondo, { speco: "bildo" }> }) {
  return (
    <div className="nr-g" style={GESTALTEN_STILO}>
      <fm-karto id="nr-problemo" level="2">
        <span slot="heading">Diesen Stand kann die Leinwand nicht zeigen.</span>
        {respondo.speco === "eraroj" ? (
          respondo.eraroj.map((e) => (
            <fm-teksto key={`${e.path} ${e.message}`}>{`${e.path}: ${e.message}`}</fm-teksto>
          ))
        ) : (
          <fm-teksto>{respondo.teksto}</fm-teksto>
        )}
      </fm-karto>
    </div>
  );
}

export function Gestalten({ ujo, fonto: fontoMuntita, marko }: GestaltenProps) {
  // Spec 058: every load of this canvas asks for the answer of Spec 058 (`stufe=58`).
  const fonto = useMemo(() => fonto058(fontoMuntita), [fontoMuntita]);
  const [respondo, setRespondo] = useState<Respondo | null>(null);
  useEffect(() => {
    let nuligita = false;
    void sxargi(fonto).then((r) => {
      if (!nuligita) setRespondo(r);
    });
    return () => {
      nuligita = true;
    };
  }, [fonto]);

  if (respondo === null) return null;
  if (respondo.speco !== "bildo") return <Ruhig respondo={respondo} />;
  return (
    <ReactFlowProvider>
      <Fluo ujo={ujo} fonto={fonto} marko={marko} komenca={respondo} />
    </ReactFlowProvider>
  );
}
