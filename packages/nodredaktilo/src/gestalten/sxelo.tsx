// Spec 054 (MP-1, T3): the chrome every node of the view Gestalten shares, so the node tickets
// only write bodies. `NodoSxelo` is the frame (a barely lighter surface, thin line, rounded
// corners; dashed when empty, muted when detached, a thin ring in the node's colour when selected,
// lifted while dragged). `NodoKapo` is the head: a small sign, the name in capitals (the kicker
// role) and, on the right, an optional tag (`Etikedo`, mono) or controls. `ArtSigno` is the square
// of a port kind, used in heads, the legend and the list „+ Knoten“.
// Spec 056 (T2, plan §2.2): for a node of this run (`estasEnhavoId(id)`) the frame does centrally
// what every such node shares: dashed while empty (`estasMalplena` of its content, or the node's own
// `leer`), the „×“ in the head of an added empty node (`forigi`), and – while the node's single
// output into the Marke is detached – the muted body with NE_KONEKTITA_MARKO_SATZ at its foot.
// Werte has one output per value: its pills fade on their own. Since Spec 056 ports and signs are
// round (Teil V).
// Spec 058 (T2, MAW-2.1): the frame does the same for the nodes of Spec 058 – Grundlagen (dashed
// without a description, muted with NE_KONEKTITA_MARKO_SATZ while its edge into the Marke is
// detached, never removable), the Layout-Beispiel (dashed without a file, never removable) and
// „Namen und Beschreibung“ (dashed and with „×“ while it holds no proposal).

import { estasMalplena } from "@fundamento/metiejo/enhavo";
import {
  BEISPIELE_ELIR,
  type EnhavoId,
  estasEnhavoId,
  FIKSAJ_TEKSTOJ,
  GRUNDLAGEN_ELIR,
  GRUNDLAGEN_ID,
  KI_NAMEN_ID,
  LAYOUT_ID,
  NE_KONEKTITA_MARKO_SATZ,
  type Zeichen,
} from "@fundamento/metiejo/gestalten";
import { type CSSProperties, createContext, type ReactNode, useContext } from "react";
import { useGestalten } from "./kunteksto.js";
import { artKoloro, NODRAG, NOPAN, ROLOJ, useStilo } from "./roloj.js";

/** The frame's rules of Spec 056: the sentence of a detached node and the „×“ in the head. */
const STILO = `
.nr-g-nodo-ne-konektita {
  margin: 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-kapo > .nr-g-kapo-fino > fm-butono.nr-g-nodo-forigi { text-transform: none; letter-spacing: 0; }
`;

/** Spec 056: what the frame tells its head – the „×“ of an added empty node, or nothing. */
const SxeloKunteksto = createContext<{ forigi: () => void } | null>(null);

/** The single output into the Marke of a node of this run; Werte (one per value) and Schrift: none. */
export function markoElirDe(id: EnhavoId): string | undefined {
  if (id === "beispiele") return BEISPIELE_ELIR;
  if (id === "schrift" || id === "teksto-werte") return undefined;
  return `${id}.el`;
}

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
  // Spec 056: an added empty node of this run carries „×“ at the end of its head (its frame says so).
  const sxelo = useContext(SxeloKunteksto);
  const forigi =
    sxelo === null ? null : (
      <fm-butono
        className={`nr-g-nodo-forigi ${NODRAG} ${NOPAN}`}
        size="small"
        emphasis="low"
        label="Knoten entfernen"
        title="Knoten entfernen"
        data-nr-nodo-forigi=""
        onClick={sxelo.forigi}
      >
        ×
      </fm-butono>
    );
  return (
    <div className="nr-g-kapo">
      <ArtSigno {...signo} />
      <span className="nr-g-kapo-nomo">{nomo}</span>
      {children === undefined && forigi === null ? null : (
        <span className="nr-g-kapo-fino">
          {children}
          {forigi}
        </span>
      )}
    </div>
  );
}

/**
 * Whether the frame of node `id` is empty by its content: a node of Spec 056 by `estasMalplena`;
 * Spec 058: Grundlagen without a description and the Layout-Beispiel without a file (both by
 * `estasMalplena`), „Namen und Beschreibung“ without a proposal; any other node never.
 */
function malplenaDe(
  id: string,
  enhavo: EnhavoId | undefined,
  inhaltDe: ReturnType<typeof useGestalten>["inhaltDe"],
): boolean {
  if (enhavo !== undefined) return estasMalplena(enhavo, inhaltDe(enhavo));
  if (id === GRUNDLAGEN_ID || id === LAYOUT_ID) return estasMalplena(id, inhaltDe(id));
  if (id === KI_NAMEN_ID) return inhaltDe(KI_NAMEN_ID)?.vorschlag === undefined;
  return false;
}

export interface NodoSxeloProps {
  /** The node id; also `data-nr-nodo` for scripts. */
  id: string;
  /** The ring of the selected node: the node's colour (`#rrggbb`), else a calm role. */
  ringo?: string | undefined;
  /**
   * Empty (field not in the Agordo): dashed frame. Spec 056: for a node of this run, when absent,
   * `estasMalplena(id, inhaltDe(id))` (Schrift passes its own: the font choice counts there too).
   */
  leer?: boolean | undefined;
  /**
   * Detached (no edge from the brand): muted body. Spec 056: for a node of this run, when absent,
   * whether its output into the Marke is detached – then NE_KONEKTITA_MARKO_SATZ stands at its foot.
   */
  abgehaengt?: boolean | undefined;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function NodoSxelo({
  id,
  ringo,
  leer,
  abgehaengt,
  className,
  style,
  children,
}: NodoSxeloProps) {
  useStilo("sxelo", STILO);
  const { inhaltDe, markoGeloest, forigi } = useGestalten();
  const ringoStilo =
    ringo === undefined || ringo === "" ? {} : ({ "--nr-g-ringo": ringo } as CSSProperties);
  // Spec 056: what the frame decides for a node of this run.
  const enhavo = estasEnhavoId(id) ? id : undefined;
  const malplena = leer ?? malplenaDe(id, enhavo, inhaltDe);
  const elir =
    id === GRUNDLAGEN_ID ? GRUNDLAGEN_ELIR : enhavo === undefined ? undefined : markoElirDe(enhavo);
  const geloest = elir !== undefined && markoGeloest.includes(elir);
  const malkonektita = abgehaengt ?? geloest;
  const forigebla =
    malplena &&
    ((enhavo !== undefined &&
      !FIKSAJ_TEKSTOJ.includes(enhavo as (typeof FIKSAJ_TEKSTOJ)[number])) ||
      id === KI_NAMEN_ID);
  return (
    <SxeloKunteksto.Provider value={forigebla ? { forigi: () => forigi(id) } : null}>
      <div
        className={className === undefined ? "nr-g-nodo" : `nr-g-nodo ${className}`}
        data-nr-nodo={id}
        data-nr-leer={malplena ? "" : undefined}
        data-nr-abgehaengt={malkonektita ? "" : undefined}
        data-nr-geloest={geloest ? "" : undefined}
        style={{ ...ringoStilo, ...style }}
      >
        {children}
        {geloest ? (
          <p className="nr-g-nodo-ne-konektita" data-nr-ne-konektita="">
            {NE_KONEKTITA_MARKO_SATZ}
          </p>
        ) : null}
      </div>
    </SxeloKunteksto.Provider>
  );
}
