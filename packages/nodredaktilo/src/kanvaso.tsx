// Spec 047 (NE-1, 2.5): the canvas. It fetches the graph once, computes the view with `sichtbaro`
// (collapsed on open), lets React Flow measure the nodes, lays them out with dagre on the measured
// sizes and fits the view. The mount element carries the ready marks the measuring script and
// QA wait on: `data-nr-preta` after the first layout, `data-nr-rev` and `data-nr-dauro` after each
// expand or collapse once it is painted. State lives in React only; nothing is stored or written.

import { type Grafeo, type Sicht, sichtbaro } from "@fundamento/metiejo/grafeo";
import {
  type ColorMode,
  Controls,
  type Edge,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { arangxi } from "./arangxo.js";
import { type Respondo, sxargi } from "./datumoj.js";
import { FaldiKunteksto, type FlowNodo, NODO_TIPOJ } from "./nodoj.js";

export interface KanvasoProps {
  /** The mount element `#nr-leinwand`; it carries the ready marks. */
  ujo: HTMLElement;
  /** The JSON URL from `data-nr-fonto`. */
  fonto: string;
  koloro: ColorMode;
}

const abhaengigkeiten = (nombro: number): string =>
  nombro === 1 ? "1 Abhängigkeit" : `${nombro} Abhängigkeiten`;

const randoj = (sicht: Sicht): Edge[] =>
  sicht.ligoj.map((l) => ({
    id: `${l.al}→${l.de}`,
    source: l.al,
    target: l.de,
    label: abhaengigkeiten(l.nombro),
  }));

const flowNodoj = (sicht: Sicht): FlowNodo[] =>
  sicht.nodoj.map((nodo) => ({
    id: nodo.id,
    type: nodo.speco === "grupo" ? "grupo" : "nodo",
    position: { x: 0, y: 0 },
    data: { nodo },
    // Measured first, shown once laid out.
    style: { visibility: "hidden" },
  }));

const mezurita = (n: FlowNodo): boolean =>
  (n.measured?.width ?? 0) > 0 && (n.measured?.height ?? 0) > 0;

function Grafeujo({
  ujo,
  grafeo,
  koloro,
}: {
  ujo: HTMLElement;
  grafeo: Grafeo;
  koloro: ColorMode;
}) {
  const [malfermitaj, setMalfermitaj] = useState<string[]>([]);
  const sicht = useMemo(() => sichtbaro(grafeo, malfermitaj), [grafeo, malfermitaj]);
  const [nodoj, setNodoj, onNodesChange] = useNodesState<FlowNodo>([]);
  const [ligoj, setLigoj] = useState<Edge[]>([]);
  /** Bumped after each layout; the fit and the ready marks follow it. */
  const [arangxoj, setArangxoj] = useState(0);
  const atendas = useRef(false);
  const klakita = useRef<number | null>(null);
  const rev = useRef(0);
  const { fitView } = useReactFlow();

  const faldi = useCallback((grupo: string) => {
    klakita.current = performance.now();
    setMalfermitaj((nun) =>
      nun.includes(grupo) ? nun.filter((id) => id !== grupo) : [...nun, grupo].sort(),
    );
  }, []);

  // A new view: render the nodes unplaced so React Flow measures them.
  useEffect(() => {
    atendas.current = sicht.nodoj.length > 0;
    setLigoj([]);
    setNodoj(flowNodoj(sicht));
    if (sicht.nodoj.length === 0) setArangxoj((n) => n + 1);
  }, [sicht, setNodoj]);

  // All measured: lay out on the measured sizes, then show.
  useEffect(() => {
    // The nodes of this view only: in the commit that brings a new view, `nodoj` still holds the
    // old (measured) ones.
    const deLaSicht =
      nodoj.length === sicht.nodoj.length && nodoj.every((n, i) => n.data.nodo === sicht.nodoj[i]);
    if (!atendas.current || !deLaSicht || nodoj.length === 0 || !nodoj.every(mezurita)) return;
    atendas.current = false;
    const pozicioj = arangxi(
      nodoj.map((n) => ({
        id: n.id,
        largxo: n.measured?.width ?? 0,
        alteco: n.measured?.height ?? 0,
      })),
      sicht.ligoj,
    );
    setNodoj(
      nodoj.map((n) => {
        const { style: _kasxita, ...resto } = n;
        return { ...resto, position: pozicioj.get(n.id) ?? n.position };
      }),
    );
    setLigoj(randoj(sicht));
    setArangxoj((n) => n + 1);
  }, [nodoj, sicht, setNodoj]);

  // Laid out: fit, wait until painted, then set the marks.
  useEffect(() => {
    if (arangxoj === 0) return;
    let nuligita = false;
    void fitView().then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (nuligita) return;
          if (ujo.dataset.nrPreta === undefined) {
            ujo.dataset.nrRev = "0";
            ujo.dataset.nrPreta = String(Math.round(performance.now()));
            return;
          }
          if (klakita.current === null) return;
          ujo.dataset.nrDauro = String(Math.round(performance.now() - klakita.current));
          klakita.current = null;
          rev.current += 1;
          ujo.dataset.nrRev = String(rev.current);
        }),
      );
    });
    return () => {
      nuligita = true;
    };
  }, [arangxoj, fitView, ujo]);

  return (
    <FaldiKunteksto.Provider value={faldi}>
      <ReactFlow
        nodes={nodoj}
        edges={ligoj}
        nodeTypes={NODO_TIPOJ}
        onNodesChange={onNodesChange}
        colorMode={koloro}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </FaldiKunteksto.Provider>
  );
}

export function Kanvaso({ ujo, fonto, koloro }: KanvasoProps) {
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
  if (respondo.speco === "eraroj") {
    return (
      <fm-karto id="nr-eraroj" level="2">
        <fm-titolo level="2">Agordo ungültig</fm-titolo>
        {respondo.eraroj.map((e) => (
          <fm-teksto key={`${e.path} ${e.rule}`}>{`${e.path} · ${e.rule}: ${e.message}`}</fm-teksto>
        ))}
      </fm-karto>
    );
  }
  if (respondo.speco === "problemo") {
    return (
      <fm-karto id="nr-problemo" level="2">
        <fm-teksto>{respondo.teksto}</fm-teksto>
      </fm-karto>
    );
  }
  return (
    <ReactFlowProvider>
      <Grafeujo ujo={ujo} grafeo={respondo.grafeo} koloro={koloro} />
    </ReactFlowProvider>
  );
}
