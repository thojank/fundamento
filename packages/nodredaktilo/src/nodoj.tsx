// Spec 047 (NE-1, 2.5), extended in Spec 048 (NE-1b): the two node types of the canvas, each an
// fm-karto. Its heading is the `etikedo` in the card's heading slot – fm-karto composes the
// fm-titolo at its own `level` – and its meta row an fm-insigno with the kind. A group node (at any
// level) carries its toggle (`fm-butono[data-nr-faldi]`) in the actions; a click on it opens or
// closes the group and never selects the node. Where decisions inside the group lack a reason, a
// second fm-insigno names how many (`[data-nr-ohne-grund]`). A token node (or `enigo:` node) shows
// its value in the current scheme.

import type { Nodo, SichtNodo } from "@fundamento/metiejo/grafeo";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { createContext, type MouseEvent, useContext } from "react";

export type Skemo = "light" | "dark";

export type NodoDatumoj = {
  nodo: SichtNodo;
  /** Token nodes: the value in the current scheme (P-7). */
  valoro?: string;
};
export type GrupoFlowNodo = Node<NodoDatumoj, "grupo">;
export type TokenoFlowNodo = Node<NodoDatumoj, "nodo">;
export type FlowNodo = GrupoFlowNodo | TokenoFlowNodo;

/** The cards on the canvas and the side panel sit one level below the screen's heading. */
export const KARTO_NIVELO = "2";

/** Opens or closes a group; given by the canvas. */
export const FaldiKunteksto = createContext<(grupo: string) => void>(() => undefined);

/** The id of the selected node, or null; given by the canvas. */
export const ElektoKunteksto = createContext<string | null>(null);

/** The value of a node in `skemo`; `dark` falls back to `light` (P-7). */
export function valoroEn(nodo: Nodo, skemo: Skemo): string | undefined {
  if (nodo.valoro === undefined) return undefined;
  return skemo === "dark" ? (nodo.valoro.dark ?? nodo.valoro.light) : nodo.valoro.light;
}

/** The kind a token node shows in its badge. */
export const specoTeksto = (speco: SichtNodo["speco"]): string =>
  speco === "enigo" ? "Eingabe" : speco === "grupo" ? "Gruppe" : "Ableitung";

function Tenilo({ speco }: { speco: "target" | "source" }) {
  return (
    <Handle
      type={speco}
      position={speco === "target" ? Position.Left : Position.Right}
      isConnectable={false}
    />
  );
}

export function GrupoNodo({ data }: NodeProps<GrupoFlowNodo>) {
  const faldi = useContext(FaldiKunteksto);
  const { nodo } = data;
  const malfermita = nodo.malfermita === true;
  const ohneGrund = nodo.ohneGrund ?? 0;
  // The toggle's click is taken on the wrapper (delegation): the custom element gets no React event
  // prop, and the click stops here, so React Flow never treats it as a click on the node.
  const onClick = (evento: MouseEvent<HTMLDivElement>) => {
    if (!(evento.target instanceof Element) || evento.target.closest("[data-nr-faldi]") === null)
      return;
    evento.stopPropagation();
    faldi(nodo.id);
  };
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the click comes from the fm-butono inside, which carries focus and keys.
    <div data-nr-grupo={nodo.id} data-nr-malfermita={String(malfermita)} onClick={onClick}>
      <Tenilo speco="target" />
      <fm-karto level={KARTO_NIVELO}>
        <span slot="heading">{nodo.etikedo}</span>
        <fm-insigno slot="meta">{`${specoTeksto("grupo")} · ${nodo.nombro ?? 0}`}</fm-insigno>
        {ohneGrund > 0 ? (
          <fm-insigno slot="meta" intent="warning" data-nr-ohne-grund={String(ohneGrund)}>
            {`${ohneGrund} ohne Grund`}
          </fm-insigno>
        ) : null}
        <fm-butono slot="actions" data-nr-faldi="" size="small" emphasis="low">
          {malfermita ? "Zuklappen" : "Aufklappen"}
        </fm-butono>
      </fm-karto>
      <Tenilo speco="source" />
    </div>
  );
}

export function TokenoNodo({ data }: NodeProps<TokenoFlowNodo>) {
  const elektita = useContext(ElektoKunteksto) === data.nodo.id;
  const { nodo, valoro } = data;
  return (
    <div data-nr-nodo={nodo.id} data-nr-elektita={elektita ? "true" : undefined}>
      <Tenilo speco="target" />
      {/* The selected node takes the sunken surface of the card – a prop of the Ero, no style. */}
      <fm-karto level={KARTO_NIVELO} emphasis={elektita ? "medium" : "high"}>
        <span slot="heading">{nodo.etikedo}</span>
        {valoro === undefined ? null : (
          <fm-teksto slot="content" max-lines="2">
            {valoro}
          </fm-teksto>
        )}
        <fm-insigno slot="meta">{specoTeksto(nodo.speco)}</fm-insigno>
      </fm-karto>
      <Tenilo speco="source" />
    </div>
  );
}

export const NODO_TIPOJ = { grupo: GrupoNodo, nodo: TokenoNodo };
