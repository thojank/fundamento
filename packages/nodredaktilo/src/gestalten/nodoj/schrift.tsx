// Spec 056 (MP-2a, T2, plan §2.2, D-14): the node Schrift – a placeholder of the shell, so the
// canvas works end to end. KBS-3.4 replaces this file except the slot `<SchriftEigene />` (KBS-3.5).
//
// Contract:
//   - Props: React Flow's `NodeProps<SchriftFlowNodo>`; `data.nodo.id` is "schrift",
//     `data.sitzung` is true („+ Knoten“ added it).
//   - Frame: `<NodoSxelo id="schrift" leer={…}>` with `<NodoKapo>` – pass `leer` yourself (the font
//     choice of the Agordo counts as content too; without `leer` only own fonts count). „×“ in the
//     head while empty. Schrift never runs into the Marke, so it is never faded.
//   - Port: `<Anschluss port={SCHRIFT_ELIR} supro={42} />` on the right; the shell draws the fixed
//     edge from it to `vorschauTiparoEnir(id)` of every preview (no „×“, never detached).
//   - Content: `inhaltDe("schrift")` / `inhaltMeti("schrift", inhalt, true)` (own fonts only; the
//     choice and the sliders go through `skribi({schrift}|{regler})` into the Agordo).
//   - `<SchriftEigene />` (nodoj/schrift-eigene.tsx, no props) stands where „Eigene Schrift
//     hochladen“ goes.
//
// The placeholder: the title, „Aa“, the slot and the port.

import { ENHAVO_ETIKEDOJ, SCHRIFT_AA, SCHRIFT_ELIR } from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { Anschluss } from "../anschluss.js";
import type { SchriftFlowNodo } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import { SchriftEigene } from "./schrift-eigene.js";

const STILO = `
.nr-g-schrift-aa {
  margin: 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-headline-3-font-size);
  color: ${ROLOJ.mallauta};
}
`;

export function SchriftNodo({ data }: NodeProps<SchriftFlowNodo>) {
  useStilo("schrift-platzhalter", STILO);
  return (
    <NodoSxelo id={data.nodo.id}>
      <NodoKapo signo={{ art: "tiparo" }} nomo={ENHAVO_ETIKEDOJ.schrift} />
      <p className="nr-g-schrift-aa" aria-hidden="true">
        {SCHRIFT_AA}
      </p>
      <SchriftEigene />
      <Anschluss port={SCHRIFT_ELIR} supro={42} />
    </NodoSxelo>
  );
}
