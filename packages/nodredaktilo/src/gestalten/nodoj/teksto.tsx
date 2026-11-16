// Spec 056 (MP-2a, T3, KBS-3.1): the seven text nodes – Ausgangslage, Zielgruppe, Wettbewerb,
// Markenkern, Werte, Persönlichkeit and Tonalität (product spec A, chosen mockup Option A „Alles im
// Knoten“). A person writes in the node itself; there is no form beside it. `TekstoNodo` is the
// component kanvaso.tsx registers for the node type „teksto“; the bodies live in
// `teksto-kampoj.tsx` (shared controls), `teksto-listoj.tsx` (Werte, Persönlichkeit, Wettbewerb)
// and `teksto-tonalitaet.tsx`.
//
// What the frame (`NodoSxelo`) does centrally: dashed and grey while the node is empty
// (`estasMalplena`), the „×“ of an added empty node, and the faded body with
// NE_KONEKTITA_MARKO_SATZ while the node's single output is detached. Nothing must be filled in, and
// nothing is counted: the help of an empty node stands calmly in its field (Option A: as the
// placeholder) or as a quiet line. Ports: one `${id}.el` on the right for every node but Werte,
// which has one per value. Saving: a field left, a pill added or removed, a slider let go.

import {
  ENHAVO_ETIKEDOJ,
  MARKENKERN_ETIKEDOJ,
  MARKENKERN_HINWEIS,
  TEKSTO_HILFOJ,
  type TekstoId,
  ZIELGRUPPE_ETIKEDOJ,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { Anschluss } from "../anschluss.js";
import type { TekstoFlowNodo } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import { LiberaTeksto } from "./teksto-kampoj.js";
import { PersoenlichkeitKorpo, WerteKorpo, WettbewerbKorpo } from "./teksto-listoj.js";
import { TonalitaetKorpo } from "./teksto-tonalitaet.js";

const STILO = `

.nr-g-teksto-frei {
  display: block;
  box-sizing: border-box;
  inline-size: calc(100% - var(--fm-spacing-medium) * 2);
  margin: var(--fm-spacing-small) var(--fm-spacing-medium) 0;
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) transparent;
  border-radius: var(--fm-radius-small);
  background: transparent;
  color: ${ROLOJ.teksto};
  font: inherit;
  resize: none;
  overflow: hidden;
  cursor: text;
}
.nr-g-teksto-frei:hover { background: ${ROLOJ.pinto}; }
.nr-g-teksto-frei:focus {
  outline: none;
  background: ${ROLOJ.scenejo};
  border-color: ${ROLOJ.linioForta};
  box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.ringo};
}
.nr-g-teksto-frei::placeholder { color: ${ROLOJ.mallauta}; opacity: 1; }

.nr-g-teksto-etikedo { display: block; }
.nr-g-teksto-etikedo > label {
  display: block;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-teksto-etikedo > .nr-g-teksto-frei { margin-block-start: 0; }

.nr-g-teksto-linio {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}

.nr-g-teksto-zugabe { display: flex; padding: var(--fm-spacing-small) var(--fm-spacing-large) 0; }
.nr-g-teksto-zugabe > fm-kampo { flex: 1; min-inline-size: 0; }
/* The native input of the Ero keeps its intrinsic width in a row; let it shrink (as the colour field). */
.nr-g-teksto-zugabe > fm-kampo::part(control),
.nr-g-teksto-zeile > fm-kampo::part(control) { min-inline-size: 0; inline-size: 100%; }
.nr-g-teksto-zeile > fm-kampo { min-inline-size: 0; }

.nr-g-teksto-x { flex: none; }

.nr-g-teksto-wert {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-xsmall);
  margin: var(--fm-spacing-xsmall) var(--fm-spacing-large) 0;
  padding: 0 var(--fm-spacing-xsmall) 0 var(--fm-spacing-medium);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-pill);
  background: ${ROLOJ.pinto};
}
.nr-g-teksto-wert > b,
.nr-g-teksto-eco > b {
  flex: 1;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--fm-font-weight-semibold);
}
.nr-g-teksto-wert[data-nr-geloest] { border-style: var(--fm-stroke-dashed); }
.nr-g-teksto-wert[data-nr-geloest] > :not(.nr-g-teksto-pordo) { opacity: var(--fm-opacity-disabled); }
/* The value's port sits on the node's right edge, level with its pill. */
.nr-g-teksto-pordo {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: calc(-1 * (var(--fm-spacing-large) + var(--fm-border-width-default) * 2));
  inline-size: 0;
  block-size: 0;
}

.nr-g-teksto-ecoj {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fm-spacing-xsmall);
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
}
.nr-g-teksto-eco {
  display: inline-flex;
  align-items: center;
  max-inline-size: 100%;
  gap: var(--fm-spacing-xsmall);
  padding-inline: var(--fm-spacing-medium) var(--fm-spacing-xsmall);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-pill);
  background: ${ROLOJ.pinto};
}

/* A Wettbewerb row: name above address, each the node's full width, the „×“ beside the name. */
.nr-g-teksto-zeile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--fm-size-icon-large);
  grid-template-areas: "name x" "adresse adresse";
  gap: var(--fm-spacing-xsmall);
  align-items: center;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
}
.nr-g-teksto-zeile > [data-nr-teksto-linio="name"] { grid-area: name; }
.nr-g-teksto-zeile > [data-nr-teksto-linio="adresse"] { grid-area: adresse; }
.nr-g-teksto-zeile > :last-child { grid-area: x; }

.nr-g-teksto-ton-listo { padding-block-start: var(--fm-spacing-xsmall); }
.nr-g-teksto-ton {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--fm-spacing-small);
  align-items: center;
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-teksto-ton > .nr-g-teksto-ton-rechts { text-align: end; }
.nr-g-teksto-ton-glitilo { display: grid; }
/* The thumb is taller than the track it overhangs: room above and below, so rows never touch. */
.nr-g-teksto-ton-glitilo > fm-glitilo { display: block; margin-block: var(--fm-spacing-small) 0; opacity: var(--fm-opacity-disabled); }
.nr-g-teksto-ton[data-nr-gesetzt] .nr-g-teksto-ton-glitilo > fm-glitilo,
.nr-g-teksto-ton:hover .nr-g-teksto-ton-glitilo > fm-glitilo { opacity: 1; }
.nr-g-teksto-ton[data-nr-flanko="links"] > .nr-g-teksto-ton-links,
.nr-g-teksto-ton[data-nr-flanko="rechts"] > .nr-g-teksto-ton-rechts { color: ${ROLOJ.teksto}; }
/* Under every slider a line of its own for the middle's name, so naming it moves nothing. */
.nr-g-teksto-ton-mitte {
  display: block;
  min-block-size: 1lh;
  padding-block-start: var(--fm-spacing-xsmall);
  text-align: center;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.teksto};
}
`;

/** The help of a node as the placeholder of its first field (Option A). */
const hilfeDe = (id: TekstoId): string | undefined => TEKSTO_HILFOJ[id];

function Korpo({ id }: { id: TekstoId }) {
  switch (id) {
    case "teksto-ausgangslage":
      return (
        <LiberaTeksto
          id={id}
          kampo="text"
          etikedo={ENHAVO_ETIKEDOJ[id]}
          placeholder={hilfeDe(id)}
        />
      );
    case "teksto-zielgruppe":
      return (
        <>
          {(["wer", "sorge", "vertrauen"] as const).map((kampo) => (
            <LiberaTeksto
              key={kampo}
              id={id}
              kampo={kampo}
              etikedo={ZIELGRUPPE_ETIKEDOJ[kampo]}
              montriEtikedon
              placeholder={kampo === "wer" ? hilfeDe(id) : undefined}
            />
          ))}
        </>
      );
    case "teksto-markenkern":
      return (
        <>
          <LiberaTeksto
            id={id}
            kampo="zweck"
            etikedo={MARKENKERN_ETIKEDOJ.zweck}
            montriEtikedon
            placeholder={hilfeDe(id)}
          />
          <LiberaTeksto
            id={id}
            kampo="versprechen"
            etikedo={MARKENKERN_ETIKEDOJ.versprechen}
            montriEtikedon
            placeholder={MARKENKERN_HINWEIS}
          />
        </>
      );
    case "teksto-wettbewerb":
      return <WettbewerbKorpo />;
    case "teksto-werte":
      return <WerteKorpo />;
    case "teksto-persoenlichkeit":
      return <PersoenlichkeitKorpo />;
    case "teksto-tonalitaet":
      return <TonalitaetKorpo />;
  }
}

export function TekstoNodo({ data }: NodeProps<TekstoFlowNodo>) {
  useStilo("teksto", STILO);
  const id = data.nodo.id as TekstoId;
  return (
    <NodoSxelo id={id} className="nr-g-teksto">
      <NodoKapo signo={{ art: "teksto" }} nomo={ENHAVO_ETIKEDOJ[id]} />
      <Korpo id={id} />
      {id === "teksto-werte" ? null : <Anschluss port={`${id}.el`} supro={42} />}
    </NodoSxelo>
  );
}
