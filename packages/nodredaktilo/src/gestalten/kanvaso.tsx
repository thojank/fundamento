// Spec 054 (MP-1, T3): the canvas of the view Gestalten. It reads the Bildo from `/api/leinwand`,
// lays the six phases as group nodes and every other node inside its phase (`parentId`, places
// relative to it, from `poziciojKun` over ARANGXO_054), draws the session's edges (`ligojKun`) as
// right-angled edges between square ports, and holds the state of the session – React state only,
// never storage, never the address except `?scheme=` (E-9, AK-15):
//   - moved places (`verschoben`, written at the end of a drag; no fetch on a drag),
//   - the session's edges (`LigoSitzung`: detached ones and drawn ones, T7, E-11): an edge is drawn
//     from an output to an input of the same kind (`validaLigo`; a refused one simply does not
//     happen), moved at its end, or detached by dropping its end into empty space, by Entf or
//     Rücktaste on the selected edge, or by its „×“. An input carries one edge; a new one replaces
//     it. Nodes are never deleted (`onBeforeDelete`). When the effective view (`kablojDe`) changes,
//     the Bildo is loaded again with `kabloj` and the previews get it; the Agordo never changes.
//     While the edges differ from the Agordo's (plus those of session nodes), the header shows
//     „Verbindungen geändert · gilt nur in dieser Sitzung“ with „zurücksetzen“,
//   - session-only nodes (an empty Funktionsfarbe, further previews from „+ Knoten“),
//   - the canvas's scheme (the switch „Leinwand hell | dunkel“ sets `data-fm-color-scheme` on the
//     root and `scheme` in the address with `history.replaceState`, without a reload).
// The nodes read the shell's capabilities from `GestaltenKunteksto` (plan §2.3). The mount element
// carries the marks the scripts and QA wait on: `data-nr-preta` after the first paint,
// `data-nr-rev` with the rev of each Bildo once painted. A late answer older than the one shown is
// dropped.

import {
  type Aldoneblo,
  ARANGXO_054,
  aldonebloj,
  anschlussDe,
  type Bildo,
  type BildoFarbo,
  type BildoLigo,
  type BildoNodo,
  FARBO_ROLOJ,
  type FarboRolo,
  type FazoId,
  KATALOGO_054,
  type Kabloj,
  kablojDe,
  kablojTeksto,
  type LeinwandSxangxo,
  type LigoSitzung,
  largxoDe,
  ligoId,
  ligojKun,
  type Pozicio,
  poziciojKun,
  ROLO_PALETRO,
  type Schema,
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
import { gespeichertTeksto, type Respondo, type SkriboRezulto, skribi, sxargi } from "./datumoj.js";
import { Kanto, type KantoFlowLigo } from "./kanto.js";
import { Kapo, LigoHinweis } from "./kapo.js";
import {
  type GestaltenFlowNodo,
  GestaltenKunteksto,
  type GestaltenValoro,
  type VorschauDatumo,
} from "./kunteksto.js";
import { Legendo, Zomo } from "./legendo.js";
import { Menuo } from "./menuo.js";
import { FarboNodo } from "./nodoj/farbo.js";
import { FAZO_TENILO, FazoNodo } from "./nodoj/fazo.js";
import { MarkoNodo } from "./nodoj/marko.js";
import { PaletroNodo } from "./nodoj/paletro.js";
import { VorschauNodo } from "./nodoj/vorschau.js";
import { BAZA_STILO, GESTALTEN_STILO, useStilo } from "./roloj.js";

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
  fazo: FazoNodo,
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

/** A node that lives only in the session: an empty Funktionsfarbe, or a further preview. */
type SesioNodo =
  | { speco: "farbo"; rolo: FarboRolo }
  | { speco: "vorschau"; id: string; schema: Schema };

interface Sesio {
  nodoj: readonly SesioNodo[];
  /** Edges drawn in the session, oldest first (`LigoSitzung.gezogen`). */
  gezogen: readonly { de: string; al: string }[];
  /** Edges the session detached (`LigoSitzung.geloest`), also the ones a drawn edge replaced. */
  geloest: readonly string[];
}

const SESIO_KOMENCO: Sesio = { nodoj: [], gezogen: [], geloest: [] };

const sesioId = (n: SesioNodo): string => (n.speco === "farbo" ? `farbo-${n.rolo}` : n.id);

/** The edges a session node comes with, as if from the Agordo (Marke → node → own row; Palette → preview). */
const sesioLigoj = (n: SesioNodo): { de: string; al: string }[] =>
  n.speco === "farbo"
    ? [
        { de: "marko.el", al: `farbo-${n.rolo}.en` },
        { de: `farbo-${n.rolo}.el`, al: `paletro.en.${n.rolo}` },
      ]
    : [{ de: "paletro.el", al: `${n.id}.en` }];

/**
 * Draws `de → al` into the session. The edge `al` carried until now (from the Agordo or drawn)
 * goes into `geloest`, so the input stays as drawn even when the new edge is detached later.
 */
function kunZiehen(nun: Sesio, ligoj: readonly BildoLigo[], de: string, al: string): Sesio {
  const id = ligoId(de, al);
  const anstatau = ligoj.filter((l) => l.al === al && l.id !== id).map((l) => l.id);
  return {
    ...nun,
    geloest: [...nun.geloest.filter((g) => g !== id && !anstatau.includes(g)), ...anstatau],
    gezogen: [...nun.gezogen.filter((g) => g.al !== al), { de, al }],
  };
}

/** Detaches edges in the session: from the Agordo's (`geloest`) and from the drawn ones. */
function kunLoesen(nun: Sesio, ids: readonly string[]): Sesio {
  const weg = new Set(ids);
  return {
    ...nun,
    geloest: [...nun.geloest.filter((g) => !weg.has(g)), ...weg],
    gezogen: nun.gezogen.filter((g) => !weg.has(ligoId(g.de, g.al))),
  };
}

/** Whether two edge lists hold the same edges (by id; an input carries at most one). */
function samajLigoj(a: readonly BildoLigo[], b: readonly BildoLigo[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((l) => l.id));
  return b.every((l) => ids.has(l.id));
}

/** Nodes are never deleted on this canvas; Entf and Rücktaste detach only selected edges. */
const antauForigo: OnBeforeDelete<GestaltenFlowNodo, KantoFlowLigo> = async ({ edges }) => ({
  nodes: [],
  edges: edges.filter((e) => e.selected === true),
});

/** The line while an edge is drawn: dashed in the calm text role (mockup `.kabel`). */
const KABLO_STILO = { strokeDasharray: "5 4" } as const;

/** The grab area of an edge's end in px (React Flow's reconnect anchor; default 10). */
const RECONNECT_RADIUSO = 12;

/** The keys that detach a selected edge (E-11). */
const FORIGO_KLAVOJ = ["Delete", "Backspace"];

/** The node a port belongs to (`farbo-primaer.el` → `farbo-primaer`). */
const nodoDe = (port: string): string => anschlussDe(port)?.nodo ?? port.split(".")[0] ?? port;

/** The step that stands for a Funktionsfarbe before it has a value (its Basis, 600). */
const FUNKCIO_BASIS = "600";

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

/** The empty colour node a session Funktionsfarbe shows: its row's derived Basis as the swatch. */
function sesioFarbo(bildo: Bildo, rolo: FarboRolo): BildoFarbo {
  const paletro = indeksoDe(bildo).get("paletro");
  const vico =
    paletro?.speco === "paletro"
      ? paletro.vicoj.find((v) => v.paletro === ROLO_PALETRO[rolo])
      : undefined;
  const hex = vico?.stufoj.find((s) => s.stufo === FUNKCIO_BASIS)?.hex ?? "";
  return {
    id: `farbo-${rolo}`,
    speco: "farbo",
    fazo: "fazo-4",
    rolo,
    hex,
    stato: "leer",
    elir: "farbo",
  };
}

/** The `data.nodo` of every node on the canvas: the Bildo's first (phases first, R-13), then the session's. */
function cxiujNodoj(
  bildo: Bildo,
  sesio: readonly SesioNodo[],
  marko: string,
  kabloj: Kabloj,
): { nodo: BildoNodo | VorschauDatumo; sitzung: boolean }[] {
  return [
    ...bildo.nodoj.map((nodo) => ({ nodo, sitzung: false })),
    ...sesio.map((s) => ({
      nodo:
        s.speco === "farbo"
          ? sesioFarbo(bildo, s.rolo)
          : ({
              id: s.id,
              speco: "vorschau",
              fazo: "fazo-5",
              schema: s.schema,
              href: vorschauHref(marko, s.schema, bildo.rev, kabloj),
            } satisfies VorschauDatumo),
      sitzung: true,
    })),
  ];
}

/** The React Flow node of one node of the canvas at its place. */
function flowNodo(
  { nodo, sitzung }: { nodo: BildoNodo | VorschauDatumo; sitzung: boolean },
  pozicio: Pozicio,
  levita: boolean,
): GestaltenFlowNodo {
  if (nodo.speco === "fazo") {
    const platz = ARANGXO_054.fazoj[nodo.id];
    return {
      id: nodo.id,
      type: "fazo",
      position: pozicio,
      data: { nodo, sitzung },
      width: platz.largxo,
      height: platz.alteco,
      dragHandle: `.${FAZO_TENILO}`,
      // The surface lets the pointer through to the pane (a drag there pans); the head takes it.
      style: { pointerEvents: "none" },
      zIndex: 0,
    };
  }
  const komuna = {
    id: nodo.id,
    position: pozicio,
    parentId: nodo.fazo,
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

/** The shift of the vertical segment of an edge into a palette row (rows fan out by 5 px). */
function sxovoDe(al: string): number {
  const rolo = /^paletro\.en\.([a-z]+)$/.exec(al)?.[1];
  const indekso = (FARBO_ROLOJ as readonly string[]).indexOf(rolo ?? "");
  return indekso < 0 ? 0 : (indekso - 3) * 5;
}

function Fluo({
  ujo,
  fonto,
  marko,
  komenca,
}: {
  ujo: HTMLElement;
  fonto: string;
  marko: string;
  komenca: Bildo;
}) {
  useStilo("baza", BAZA_STILO);
  const [bildo, setBildo] = useState(komenca);
  const [sesio, setSesio] = useState<Sesio>(SESIO_KOMENCO);
  const [verschoben, setVerschoben] = useState<ReadonlyMap<string, Pozicio>>(new Map());
  const [levitaj, setLevitaj] = useState<ReadonlySet<string>>(new Set());
  const [fokusPor, setFokusPor] = useState<string | null>(null);
  const [gespeichert, setGespeichert] = useState<string | null>(null);
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
  /** The number of the next further preview: `vorschau-3` follows the two fixed ones. */
  const vorschauNombro = useRef(3);
  const { fitView } = useReactFlow();
  const preta = useNodesInitialized();

  // Session nodes that the Bildo now carries itself (a Funktionsfarbe got its value) are hidden at
  // once (the effect below drops them from the session); their drawn edges equal the Bildo's.
  const indekso = indeksoDe(bildo);
  const sesioNodoj = useMemo(
    () => sesio.nodoj.filter((s) => !indekso.has(sesioId(s))),
    [sesio.nodoj, indekso],
  );
  const ligoSesio = useMemo<LigoSitzung>(
    () => ({ geloest: sesio.geloest, gezogen: sesio.gezogen, nodoj: sesioNodoj.map(sesioId) }),
    [sesio.geloest, sesio.gezogen, sesioNodoj],
  );
  const ligoj = useMemo(() => ligojKun(ligoSesio, bildo), [ligoSesio, bildo]);
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

  // A session node the Bildo now carries (a Funktionsfarbe got its value) leaves the session for
  // good: once its value is removed („↺“) it is gone, not back as an empty node.
  useEffect(() => {
    setSesio((nun) => {
      const restas = nun.nodoj.filter((s) => !indekso.has(sesioId(s)));
      return restas.length === nun.nodoj.length ? nun : { ...nun, nodoj: restas };
    });
  }, [indekso]);
  const kabloj = useMemo(() => {
    const nodojKunStato = [
      ...bildo.nodoj.map((n) =>
        n.speco === "farbo" ? { id: n.id, stato: n.stato } : { id: n.id },
      ),
      ...sesioNodoj.map((s) =>
        s.speco === "farbo" ? { id: sesioId(s), stato: "leer" } : { id: s.id },
      ),
    ];
    return kablojDe(ligoj, nodojKunStato);
  }, [bildo, sesioNodoj, ligoj]);
  const cxiuj = useMemo(
    () => cxiujNodoj(bildo, sesioNodoj, marko, kabloj),
    [bildo, sesioNodoj, marko, kabloj],
  );

  // Load (again) and show only an answer newer than the one shown.
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
  const kablojPetita = useRef(kablojTeksto(komenca.kabloj));
  const kablojRef = useRef(kabloj);
  kablojRef.current = kabloj;
  useEffect(() => {
    if (kablojTekstoNun === kablojPetita.current) return;
    kablojPetita.current = kablojTekstoNun;
    void sxargiDenove(kablojRef.current);
  }, [kablojTekstoNun, sxargiDenove]);

  // The nodes at their places; React Flow's measurements and selection carry over.
  useEffect(() => {
    const pozicioj = poziciojKun(
      verschoben,
      cxiuj.map(({ nodo }) =>
        "fazo" in nodo ? { id: nodo.id, fazo: nodo.fazo as FazoId } : { id: nodo.id },
      ),
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

  // The end of a drag keeps the place in the session; nothing is sent, nothing stored (AK-15).
  const onNodeDragStop = useCallback<OnNodeDrag<GestaltenFlowNodo>>((_evento, _nodo, movitaj) => {
    setVerschoben((nun) => {
      const nova = new Map(nun);
      for (const n of movitaj) nova.set(n.id, { x: n.position.x, y: n.position.y });
      return nova;
    });
  }, []);

  // T7 (E-11): the session's connections. Every change goes through `kunZiehen`/`kunLoesen`; the
  // edges on the canvas stay `ligojKun(session, bildo)`, the Agordo never changes (AK-18).
  const [elektitajLigoj, setElektitajLigoj] = useState<ReadonlySet<string>>(new Set());
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
      gezogen: nun.nodoj
        .filter((s) => !indeksoDe(bildoRef.current).has(sesioId(s)))
        .flatMap(sesioLigoj),
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
      return {
        id: ligo.id,
        type: "kanto",
        source: de,
        sourceHandle: ligo.de,
        target: nodoDe(ligo.al),
        targetHandle: ligo.al,
        selected: elektitajLigoj.has(ligo.id),
        data: {
          ligo,
          matt: farbo && (malplena || !surMarko.has(de)),
          lumo: lumoj.get(de) ?? 0,
          sxovo: sxovoDe(ligo.al),
        },
      };
    });
  }, [ligoj, sesioNodoj, indekso, lumoj, elektitajLigoj]);

  const skribiKaj = useCallback(
    async (sxangxo: LeinwandSxangxo): Promise<SkriboRezulto> => {
      const rezulto = await skribi(marko, sxangxo);
      if (rezulto.speco === "ok") {
        setGespeichert(gespeichertTeksto(rezulto.gespeichert));
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
      const rolo = a.nodo.replace(/^farbo-/, "");
      const r = FARBO_ROLOJ.find((x) => x === rolo);
      if (r !== undefined) return sesioFarbo(bildo, r).hex || undefined;
      const primaer = indekso.get("farbo-primaer");
      return primaer?.speco === "farbo" ? primaer.hex : undefined;
    },
    [cxiuj, bildo, indekso],
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
      if (a.stato === "anlegen" && a.nodo !== undefined) {
        const rolo = FARBO_ROLOJ.find((r) => `farbo-${r}` === a.nodo);
        if (rolo === undefined) return;
        const id = `farbo-${rolo}`;
        elektota.current = id;
        // Marke → node → its own row; an edge already at that row is replaced.
        setSesio((nun) =>
          sesioLigoj({ speco: "farbo", rolo }).reduce(
            (s, { de, al }) => kunZiehen(s, ligojRef.current, de, al),
            { ...nun, nodoj: [...nun.nodoj, { speco: "farbo", rolo } as const] } as Sesio,
          ),
        );
        setFokusPor(id);
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
    }),
    [marko, bildo, skribiKaj, kabloj, ligoj, forigi, fokusPor, hervorheben, skemo],
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
      <Fluo ujo={ujo} fonto={fonto} marko={marko} komenca={respondo.bildo} />
    </ReactFlowProvider>
  );
}
