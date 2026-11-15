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

import {
  type Aldoneblo,
  aldonebloj,
  anschlussDe,
  type Bildo,
  type BildoLigo,
  type BildoNodo,
  KATALOGO_054,
  type Kabloj,
  kablojTeksto,
  type LeinwandStato,
  type LeinwandSxangxo,
  largxoDe,
  ligojKun,
  type Pozicio,
  poziciojKun,
  type Schema,
  tenilojDe,
  validaLigo,
  vorschauHref,
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
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  gespeichertTeksto,
  type Respondo,
  type SkriboRezulto,
  type StatoRezulto,
  skribi,
  statoForigi,
  statoSkribi,
  sxargi,
} from "./datumoj.js";
import { Kanto, type KantoFlowLigo } from "./kanto.js";
import { Kapo, type Konservo, LigoHinweis } from "./kapo.js";
import {
  type GestaltenFlowNodo,
  GestaltenKunteksto,
  type GestaltenValoro,
  type VorschauDatumo,
} from "./kunteksto.js";
import { Legendo, Zomo } from "./legendo.js";
import { Menuo } from "./menuo.js";
import { FarboNodo } from "./nodoj/farbo.js";
import { MarkoNodo } from "./nodoj/marko.js";
import { PaletroNodo } from "./nodoj/paletro.js";
import { VorschauNodo } from "./nodoj/vorschau.js";
import { BAZA_STILO, GESTALTEN_STILO, useStilo } from "./roloj.js";
import {
  kablojDeSesio,
  kunLoesen,
  kunZiehen,
  ligoSitzungDe,
  type Sesio,
  type SesioNodo,
  sesioDeStato,
  sesioId,
  sesioLigoj,
  statoDeSesio,
  statoTeksto,
} from "./stato.js";

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

/** The line while an edge is drawn: dashed in the calm text role (mockup `.kabel`). */
const KABLO_STILO = { strokeDasharray: "5 4" } as const;

/** The grab area of an edge's end in px (React Flow's reconnect anchor; default 10). */
const RECONNECT_RADIUSO = 12;

/** The keys that detach a selected edge (E-11). */
const FORIGO_KLAVOJ = ["Delete", "Backspace"];

/** The node a port belongs to (`farbo-primaer.el` → `farbo-primaer`). */
const nodoDe = (port: string): string => anschlussDe(port)?.nodo ?? port.split(".")[0] ?? port;

/** The token whose radius the edges' corners take (055 D-5; the mockup's `pfad(pts, 12)`). */
const RADIUSO_TOKENO = "--fm-radius-role-surface";

/**
 * The corner radius of the edges in px: the resolved value of RADIUSO_TOKENO at the mount element
 * (px, or rem against the root's font size); 0 when it cannot be read.
 */
function radiusoDe(ujo: HTMLElement): number {
  const teksto = getComputedStyle(ujo).getPropertyValue(RADIUSO_TOKENO).trim();
  const valoro = Number.parseFloat(teksto);
  if (!Number.isFinite(valoro)) return 0;
  if (teksto.endsWith("rem")) {
    return valoro * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return teksto.endsWith("px") ? valoro : 0;
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

/** The `data.nodo` of every node on the canvas: the Bildo's first, then the session's. */
function cxiujNodoj(
  bildo: Bildo,
  sesio: readonly SesioNodo[],
  marko: string,
  kabloj: Kabloj,
): { nodo: BildoNodo | VorschauDatumo; sitzung: boolean }[] {
  return [
    ...bildo.nodoj.map((nodo) => ({ nodo, sitzung: false })),
    ...sesio.map((s) => ({
      nodo: {
        id: s.id,
        speco: "vorschau",
        fazo: "fazo-5",
        schema: s.schema,
        href: vorschauHref(marko, s.schema, bildo.rev, kabloj),
      } satisfies VorschauDatumo,
      sitzung: true,
    })),
  ];
}

/** The React Flow node of one node of the canvas at its absolute place (no parent, 055 T1). */
function flowNodo(
  { nodo, sitzung }: { nodo: BildoNodo | VorschauDatumo; sitzung: boolean },
  pozicio: Pozicio,
  levita: boolean,
): GestaltenFlowNodo {
  const komuna = {
    id: nodo.id,
    position: pozicio,
    width: largxoDe(nodo.id),
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
  rezulto: (rezulto: StatoRezulto) => void;
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
    o.rezulto(rezulto);
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
  /** The node to select once it is on the canvas (a new one from „+ Knoten“, Akzent). */
  const elektota = useRef<string | null>(null);
  /** Requests to `/api/leinwand`: sent and the newest whose answer is shown. */
  const petoj = useRef({ sendita: 0, montrita: 0 });
  const bildoRef = useRef(bildo);
  bildoRef.current = bildo;
  /** The number of the next further preview: past the highest one stored (`vorschau-3` first). */
  const vorschauNombro = useRef(unua.vorschauNombro);
  const { fitView } = useReactFlow();
  const preta = useNodesInitialized();
  /** 055 D-5: the corner radius of the edges, read once per mount. */
  const [radiuso] = useState(() => radiusoDe(ujo));

  const indekso = indeksoDe(bildo);
  const sesioNodoj = sesio.nodoj;
  const ligoj = useMemo(() => ligojKun(ligoSitzungDe(sesio), bildo), [sesio, bildo]);
  const ligojRef = useRef(ligoj);
  ligojRef.current = ligoj;
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
  const ligojSxangxitaj = !samajLigoj(ligoj, grundLigoj);

  const kabloj = useMemo(() => kablojDeSesio(bildo, sesio), [bildo, sesio]);
  const cxiuj = useMemo(
    () => cxiujNodoj(bildo, sesioNodoj, marko, kabloj),
    [bildo, sesioNodoj, marko, kabloj],
  );

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
  const stato = useMemo(
    () => statoDeSesio(bildo, sesio, verschoben, kabloj),
    [bildo, sesio, verschoben, kabloj],
  );
  const statoRef = useRef(stato);
  statoRef.current = stato;
  const statoTekstoNun = statoTeksto(stato);
  const skribiloRef = useRef<StatoSkribilo | null>(null);
  skribiloRef.current ??= statoSkribilo({
    legi: () => statoRef.current,
    sendi: (s) => statoSkribi(marko, s),
    rezulto: (r) => {
      if (r.speco === "ok") {
        setGespeichert({ speco: "ok", teksto: gespeichertTeksto(r.gespeichert) });
        setStatoUnlesbar(false);
      } else setGespeichert({ speco: "ne" });
    },
    konata: statoTekstoNun,
  });
  const skribilo = skribiloRef.current;
  useEffect(() => {
    if (statoTekstoNun !== "") skribilo.plani();
  }, [statoTekstoNun, skribilo]);

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
    setVerschoben(nova.verschoben);
    setStatoUnlesbar(respondo.statoUnlesbar);
    setElektitajLigoj(new Set());
    setFokusPor(null);
    skribilo.konati(
      statoTeksto(statoDeSesio(respondo.bildo, nova.sesio, nova.verschoben, novajKabloj)),
    );
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
  const zuruecksetzen = useCallback(() => {
    setSesio((nun) => ({
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
    return ligoj.map((ligo: BildoLigo) => {
      const de = nodoDe(ligo.de);
      const fontaNodo = nodoAl(de);
      const malplena =
        sesiaj.has(de) || (fontaNodo?.speco === "farbo" && fontaNodo.stato === "leer");
      const farbo = de.startsWith("farbo-");
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
          matt: farbo && (malplena || !surMarko.has(de)),
          lumo: lumoj.get(de) ?? 0,
          radiuso,
        },
      };
    });
  }, [ligoj, sesioNodoj, indekso, lumoj, elektitajLigoj, radiuso]);

  const skribiKaj = useCallback(
    async (sxangxo: LeinwandSxangxo): Promise<SkriboRezulto> => {
      const rezulto = await skribi(marko, sxangxo);
      if (rezulto.speco === "ok") {
        setGespeichert({ speco: "ok", teksto: gespeichertTeksto(rezulto.gespeichert) });
        await sxargiDenove(kablojRef.current);
      }
      return rezulto;
    },
    [marko, sxargiDenove],
  );

  const forigi = useCallback((id: string) => {
    setSesio((nun) => {
      if (!nun.nodoj.some((s) => sesioId(s) === id)) return nun;
      return {
        ...nun,
        nodoj: nun.nodoj.filter((s) => sesioId(s) !== id),
        gezogen: nun.gezogen.filter((g) => nodoDe(g.de) !== id && nodoDe(g.al) !== id),
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
        KATALOGO_054,
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
  const elekti = useCallback(
    (a: Aldoneblo) => {
      setMenuo(false);
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
    [cxiuj],
  );
  const fermiMenuon = useCallback(() => setMenuo(false), []);

  const valoro = useMemo<GestaltenValoro>(
    () => ({
      marko,
      bildo,
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
    }),
    [
      marko,
      bildo,
      skribiKaj,
      kabloj,
      ligoj,
      forigi,
      fokusPor,
      hervorheben,
      skemo,
      rekomenci,
      skribilo,
    ],
  );

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

  const primaer = indekso.get("farbo-primaer");

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
          connectionLineType={ConnectionLineType.Step}
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
          etikedo={bildo.marko.etikedo}
          menuoMalfermita={menuo}
          menuo={() => setMenuo((m) => !m)}
          gespeichert={gespeichert}
          statoUnlesbar={statoUnlesbar}
          anordnungZuruecksetzen={() => void anordnungZuruecksetzen()}
          skemo={skemo}
          elektiSkemon={elektiSkemon}
          ligoHinweis={ligojSxangxitaj ? <LigoHinweis zuruecksetzen={zuruecksetzen} /> : null}
        />
        {menuo ? (
          <Menuo aldonebloj={listo} hexDe={hexDe} elekti={elekti} fermi={fermiMenuon} />
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

export function Gestalten({ ujo, fonto, marko }: GestaltenProps) {
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
