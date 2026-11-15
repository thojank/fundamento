// Spec 054 (MP-1, T3): the chrome every node of the view Gestalten shares, so the node tickets
// only write bodies. `NodoSxelo` is the frame (a barely lighter surface, thin line, rounded
// corners; dashed when empty, muted when detached, a thin ring in the node's colour when selected,
// lifted while dragged). `NodoKapo` is the head: a small sign, the name in capitals (the kicker
// role) and, on the right, an optional tag (`Etikedo`, mono) or controls. `ArtSigno` is the square
// of a port kind, used in heads, the legend and the list „+ Knoten“.

import type { Zeichen } from "@fundamento/metiejo/gestalten";
import type { CSSProperties, ReactNode } from "react";
import { artKoloro } from "./roloj.js";

export interface ArtSignoProps {
  art: Zeichen;
  /** A colour sign takes the brand colour (inline). */
  hex?: string | undefined;
  /** Filled (a colour, a connected port) or hollow. */
  plena?: boolean;
}

export function ArtSigno({ art, hex, plena = false }: ArtSignoProps) {
  return (
    <i
      className="nr-g-signo"
      aria-hidden="true"
      data-nr-plena={plena ? "" : undefined}
      style={{ "--nr-g-art": artKoloro(art, hex) } as CSSProperties}
    />
  );
}

/** The small tag on the right of a head: „von Hand“, „abgeleitet“, „Tönung 0,35“, „abgehängt“. */
export function Etikedo({ children }: { children: ReactNode }) {
  return <span className="nr-g-etikedo">{children}</span>;
}

export interface NodoKapoProps {
  /** The sign before the name. */
  signo: ArtSignoProps;
  /** The name, written as in the product spec („Farbe · Primär“); shown in capitals. */
  nomo: string;
  /** What stands on the right: a tag, a switch, a „×“ (controls carry `nodrag`). */
  children?: ReactNode;
}

export function NodoKapo({ signo, nomo, children }: NodoKapoProps) {
  return (
    <div className="nr-g-kapo">
      <ArtSigno {...signo} />
      <span className="nr-g-kapo-nomo">{nomo}</span>
      {children === undefined ? null : <span className="nr-g-kapo-fino">{children}</span>}
    </div>
  );
}

export interface NodoSxeloProps {
  /** The node id; also `data-nr-nodo` for scripts. */
  id: string;
  /** The ring of the selected node: the node's colour (`#rrggbb`), else a calm role. */
  ringo?: string | undefined;
  /** Empty (field not in the Agordo): dashed frame. */
  leer?: boolean;
  /** Detached (no edge from the brand): muted body. */
  abgehaengt?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function NodoSxelo({
  id,
  ringo,
  leer = false,
  abgehaengt = false,
  className,
  style,
  children,
}: NodoSxeloProps) {
  const ringoStilo =
    ringo === undefined || ringo === "" ? {} : ({ "--nr-g-ringo": ringo } as CSSProperties);
  return (
    <div
      className={className === undefined ? "nr-g-nodo" : `nr-g-nodo ${className}`}
      data-nr-nodo={id}
      data-nr-leer={leer ? "" : undefined}
      data-nr-abgehaengt={abgehaengt ? "" : undefined}
      style={{ ...ringoStilo, ...style }}
    >
      {children}
    </div>
  );
}
