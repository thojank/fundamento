// Spec 047 (NE-1, 2.5): the two node types of the canvas. A group node carries its toggle
// (`fm-butono[data-nr-faldi]`); a click on it opens or closes the group and never selects the
// node. A token node (or `enigo:` node) shows its label and kind. Content and look grow in T3/T4.

import type { SichtNodo } from "@fundamento/metiejo/grafeo";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { createContext, type MouseEvent, useContext } from "react";

export type NodoDatumoj = { nodo: SichtNodo };
export type GrupoFlowNodo = Node<NodoDatumoj, "grupo">;
export type TokenoFlowNodo = Node<NodoDatumoj, "nodo">;
export type FlowNodo = GrupoFlowNodo | TokenoFlowNodo;

/** Opens or closes a group; given by the canvas. */
export const FaldiKunteksto = createContext<(grupo: string) => void>(() => undefined);

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
      <fm-karto level="2">
        <fm-titolo level="3">{nodo.etikedo}</fm-titolo>
        <fm-insigno>{`Gruppe · ${nodo.nombro ?? 0}`}</fm-insigno>
        <fm-butono data-nr-faldi="" size="small" emphasis="low">
          {malfermita ? "Zuklappen" : "Aufklappen"}
        </fm-butono>
      </fm-karto>
      <Tenilo speco="source" />
    </div>
  );
}

export function TokenoNodo({ data }: NodeProps<TokenoFlowNodo>) {
  const { nodo } = data;
  return (
    <div data-nr-nodo={nodo.id}>
      <Tenilo speco="target" />
      <fm-karto level="3">
        <fm-titolo level="4">{nodo.etikedo}</fm-titolo>
        <fm-insigno>{nodo.speco === "enigo" ? "Eingabe" : "Ableitung"}</fm-insigno>
      </fm-karto>
      <Tenilo speco="source" />
    </div>
  );
}

export const NODO_TIPOJ = { grupo: GrupoNodo, nodo: TokenoNodo };
