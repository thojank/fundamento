// Spec 054 (MP-1, T3): the two quiet corners of the stage. Bottom left the legend of the port kinds
// (Text, Farbe – which carries itself, so its sign takes the brand's Primär –, Schrift, Maß,
// Marke); bottom right „Verkleinern“, „Vergrößern“ and „Einpassen“. Both are React Flow panels, so
// they stay put while the canvas pans and zooms.
// Spec 056 (T2): the kind Bild joins (Beispiele → Marke); the order of the mockup: Text, Bild,
// Schrift, Maß, Marke, then „Farbe trägt sich selbst“. The signs are round, as the ports.

import type { Anschlussart } from "@fundamento/metiejo/gestalten";
import { Panel, useReactFlow } from "@xyflow/react";
import { ROLOJ, useStilo } from "./roloj.js";
import { ArtSigno } from "./sxelo.js";

const STILO = `
.nr-g-legendo {
  display: flex;
  gap: var(--fm-spacing-large);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
  pointer-events: none;
}
.nr-g-legendo > span { display: inline-flex; align-items: center; gap: var(--fm-spacing-small); }
.nr-g-zomo {
  display: flex;
  gap: var(--fm-spacing-xsmall);
  padding: var(--fm-spacing-xsmall);
  background: ${ROLOJ.nodo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-medium);
}
`;

/** The kinds in the legend's order (mockup). */
const LEGENDO: readonly { art: Anschlussart; teksto: string }[] = [
  { art: "teksto", teksto: "Text" },
  { art: "bildo", teksto: "Bild" },
  { art: "tiparo", teksto: "Schrift" },
  { art: "mezuro", teksto: "Maß" },
  { art: "marko", teksto: "Marke" },
  { art: "farbo", teksto: "Farbe trägt sich selbst" },
];

/** The duration of a zoom step and of „Einpassen“; 0 keeps them instant (no motion). */
const ZOMO_DAURO = 0;

export function Legendo({ primaerHex }: { primaerHex: string | undefined }) {
  useStilo("legendo", STILO);
  return (
    <Panel position="bottom-left">
      <div className="nr-g-legendo" data-nr-legendo="">
        {LEGENDO.map(({ art, teksto }) => (
          <span key={art} data-nr-art={art}>
            <ArtSigno art={art} hex={primaerHex} plena={art === "farbo"} />
            {teksto}
          </span>
        ))}
      </div>
    </Panel>
  );
}

export interface ZomoProps {
  /** Fits the whole canvas (the same view as on opening). */
  einpassen: () => void;
}

export function Zomo({ einpassen }: ZomoProps) {
  useStilo("legendo", STILO);
  const { zoomIn, zoomOut } = useReactFlow();
  return (
    <Panel position="bottom-right">
      <div className="nr-g-zomo" data-nr-zomo="">
        <fm-butono
          size="small"
          emphasis="low"
          label="Verkleinern"
          data-nr-zomo="-"
          onClick={() => void zoomOut({ duration: ZOMO_DAURO })}
        >
          −
        </fm-butono>
        <fm-butono
          size="small"
          emphasis="low"
          label="Vergrößern"
          data-nr-zomo="+"
          onClick={() => void zoomIn({ duration: ZOMO_DAURO })}
        >
          +
        </fm-butono>
        <fm-butono size="small" emphasis="low" data-nr-zomo="fit" onClick={einpassen}>
          Einpassen
        </fm-butono>
      </div>
    </Panel>
  );
}
