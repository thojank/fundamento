// Spec 054 (MP-1, T4): the node Marke – the start of phase 4, after the mockup: a pill with a round
// sign in the Primär colour (the brand's initial), the name as written (`etikedoj.marko` or the
// identifier) and „Entwurf · ungeprüft“ in mono below it; one output port `marko.el` (kind Marke).
// It writes nothing.
//
// Spec 056 (T2, Teil M): two inputs – Text on the left (`marko.en.teksto`), Bild at the top edge
// (`marko.en.bildo`) – and below the head what arrives. The width stays, the node grows downward;
// it only shows, it writes nothing.
//
// Spec 058 (MP-2c, T6, MAW-3.4, mockup `marken-knoten-option-b.html` „Tafel“): the node is a board
// of tiles, 700 px wide in ARANGXO_058. This file is its frame: the ring in the Primär colour, the
// three ports, and the two slots – on top `MarkoUebersicht` (nodoj/marko-uebersicht.tsx: the name
// tile with the sign, the live `nomo` and „Entwurf · ungeprüft“, then the overview without KI) and
// below it `MarkoProfil` (nodoj/marko-profil.tsx, MAW-4.1). The three ports stay where they are –
// Text on the left, Bild centred on the top edge, `marko.el` on the right – and are rendered from
// the first render on.
//
// Marks for scripts: `[data-nr-nodo=marko]` (the frame); the sign `[data-nr-marko-signo]` and the
// overview's marks live in marko-uebersicht.tsx.

import { MARKO_BILDO_ENIR, MARKO_TEKSTO_ENIR } from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { Anschluss } from "../anschluss.js";
import { type MarkoFlowNodo, useGestalten } from "../kunteksto.js";
import { useStilo } from "../roloj.js";
import { NodoSxelo } from "../sxelo.js";
import { MarkoProfil } from "./marko-profil.js";
import { MarkoUebersicht } from "./marko-uebersicht.js";

const STILO = `
.nr-g-nodo.nr-g-marko {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-medium);
  padding: var(--fm-spacing-medium);
  border-radius: var(--fm-radius-large);
}
`;

export function MarkoNodo({ data }: NodeProps<MarkoFlowNodo>) {
  useStilo("marko", STILO);
  const { bildo } = useGestalten();
  const primaer = bildo.nodoj.find((n) => n.id === "farbo-primaer");
  const hex = primaer?.speco === "farbo" ? primaer.hex : "";
  return (
    <NodoSxelo id={data.nodo.id} ringo={hex} className="nr-g-marko">
      <MarkoUebersicht />
      <MarkoProfil />
      <Anschluss port={MARKO_TEKSTO_ENIR} supro={28} />
      <Anschluss port={MARKO_BILDO_ENIR} supro={0} rando="supro" />
      <Anschluss port="marko.el" supro={28} />
    </NodoSxelo>
  );
}
