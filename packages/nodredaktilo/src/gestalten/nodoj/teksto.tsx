// Spec 056 (MP-2a, T2, plan §2.2, D-14): the seven text nodes – a placeholder of the shell, so the
// canvas works end to end. KBS-3.1 replaces this file (and may split it into `nodoj/teksto*.tsx`;
// `TekstoNodo` stays the component kanvaso.tsx registers for the node type „teksto“).
//
// Contract:
//   - Props: React Flow's `NodeProps<TekstoFlowNodo>`; `data.nodo.id` is the node
//     (`teksto-ausgangslage|zielgruppe|wettbewerb|markenkern|werte|persoenlichkeit|tonalitaet`),
//     `data.sitzung` whether „+ Knoten“ added it.
//   - Frame: `<NodoSxelo id={id}>` with `<NodoKapo>` – the frame makes it dashed while empty
//     (`estasMalplena`), puts „×“ into the head of an added empty node and fades it with
//     NE_KONEKTITA_MARKO_SATZ while its output is detached. Werte: one output per value, each pill
//     fades on its own (`markoGeloest.includes(wertElirDe(w.id))`).
//   - Ports: `<Anschluss port={`${id}.el`} supro={42} />` on the right; Werte one
//     `<Anschluss port={wertElirDe(w.id)} … />` per value instead (each must exist while its value
//     does, or React Flow cannot draw the value's edge).
//   - Content: `useGestalten().inhaltDe(id)` and `inhaltMeti(id, inhalt, konservi)`.
//
// The placeholder: the title, the calm help of an empty node, and the ports (Werte: each value as a
// read-only pill with its port).

import {
  ENHAVO_ETIKEDOJ,
  TEKSTO_HILFOJ,
  type TekstoId,
  wertElirDe,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { Anschluss } from "../anschluss.js";
import { type TekstoFlowNodo, useGestalten } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";

const STILO = `
.nr-g-teksto-hilfe {
  margin: 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
.nr-g-teksto-wert {
  position: relative;
  margin: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-pill);
  font-weight: var(--fm-font-weight-semibold);
}
.nr-g-teksto-wert[data-nr-geloest] > b { opacity: var(--fm-opacity-disabled); }
`;

export function TekstoNodo({ data }: NodeProps<TekstoFlowNodo>) {
  useStilo("teksto-platzhalter", STILO);
  const { inhaltDe, markoGeloest } = useGestalten();
  const id = data.nodo.id as TekstoId;
  const werte = id === "teksto-werte" ? (inhaltDe("teksto-werte")?.werte ?? []) : [];
  const hilfe = TEKSTO_HILFOJ[id];
  return (
    <NodoSxelo id={id}>
      <NodoKapo signo={{ art: "teksto" }} nomo={ENHAVO_ETIKEDOJ[id]} />
      {hilfe === undefined ? null : <p className="nr-g-teksto-hilfe">{hilfe}</p>}
      {werte.map((w) => (
        <div
          key={w.id}
          className="nr-g-teksto-wert"
          data-nr-wert={w.id}
          data-nr-geloest={markoGeloest.includes(wertElirDe(w.id)) ? "" : undefined}
        >
          <b>{w.text}</b>
          <Anschluss port={wertElirDe(w.id)} supro={14} />
        </div>
      ))}
      {id === "teksto-werte" ? null : <Anschluss port={`${id}.el`} supro={42} />}
    </NodoSxelo>
  );
}
