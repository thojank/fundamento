// Spec 056 (MP-2a, T2, plan §2.2, D-14): the node Beispiele – a placeholder of the shell, so the
// canvas works end to end. KBS-3.2 replaces this file except the slot `<Erkannt />` (KBS-3.3).
//
// Contract:
//   - Props: React Flow's `NodeProps<BeispieleFlowNodo>`; `data.nodo.id` is "beispiele",
//     `data.sitzung` is true („+ Knoten“ added it).
//   - Frame: `<NodoSxelo id="beispiele">` with `<NodoKapo>` – dashed while empty (no image, no
//     reference), „×“ in the head while empty, faded with NE_KONEKTITA_MARKO_SATZ while
//     `beispiele.el` is detached.
//   - Port: `<Anschluss port={BEISPIELE_ELIR} supro={0} rando="subo" />` at the bottom edge.
//   - Content: `inhaltDe("beispiele")` / `inhaltMeti("beispiele", inhalt, true)` after every upload,
//     removed image and loaded image address, then `folgi("dateien", valoro)` from `../folgo.js`.
//   - `<Erkannt />` (nodoj/erkannt.tsx, no props) stands where „Erkannt“ goes.
//
// The placeholder: the title, the calm help, the slot and the port.

import { BEISPIELE_ELIR, BEISPIELE_HILFE, ENHAVO_ETIKEDOJ } from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { Anschluss } from "../anschluss.js";
import type { BeispieleFlowNodo } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import { Erkannt } from "./erkannt.js";

const STILO = `
.nr-g-beispiele-hilfe {
  margin: 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
`;

export function BeispieleNodo({ data }: NodeProps<BeispieleFlowNodo>) {
  useStilo("beispiele-platzhalter", STILO);
  return (
    <NodoSxelo id={data.nodo.id}>
      <NodoKapo signo={{ art: "bildo" }} nomo={ENHAVO_ETIKEDOJ.beispiele} />
      <p className="nr-g-beispiele-hilfe">{BEISPIELE_HILFE}</p>
      <Erkannt />
      <Anschluss port={BEISPIELE_ELIR} supro={0} rando="subo" />
    </NodoSxelo>
  );
}
