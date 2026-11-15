// Spec 054 (MP-1, T3): the header of the view Gestalten. Left: „Fundamento“, „+ Knoten“, the brand
// with „Entwurf · ungeprüft“ and the switch Gestalten | Verstehen. Right: the slot for the notice
// about changed connections (`LigoHinweis`, T7), „gespeichert HH:MM“ (nothing before the first
// write of this session), the switch „Leinwand hell | dunkel“ and „Im Studio öffnen“. No cost hint,
// no menus „Datei“/„Bearbeiten“, no judgment. Controls are Eroj in the neutral Belegung.

import type { Schema } from "@fundamento/metiejo/gestalten";
import type { ReactNode } from "react";
import { ROLOJ, useStilo } from "./roloj.js";

const STILO = `
.nr-g-kapleisto {
  position: absolute;
  z-index: 10;
  inset-block-start: var(--fm-spacing-large);
  inset-inline: var(--fm-spacing-large);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--fm-spacing-large);
  pointer-events: none;
}
.nr-g-grupo {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  min-block-size: calc(var(--fm-size-control-medium) + var(--fm-spacing-small));
  padding-inline: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  background: ${ROLOJ.nodo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-medium);
  white-space: nowrap;
}
.nr-g-grupo strong { font-weight: var(--fm-font-weight-bold); }
.nr-g-trenilo { inline-size: var(--fm-border-width-default); block-size: var(--fm-size-icon-small); background: ${ROLOJ.linio}; }
.nr-g-segmento {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-spacing-xsmall);
  padding: var(--fm-spacing-xsmall);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.scenejo};
}
.nr-g-segmento-nun {
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.pinto};
  font-weight: var(--fm-font-weight-medium);
}
.nr-g-segmento > fm-ligilo { padding-inline: var(--fm-spacing-medium); }
.nr-g-gespeichert { font-family: var(--fm-font-family-code); font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-kapo-etikedo { font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-ligo-hinweis { display: inline-flex; align-items: center; gap: var(--fm-spacing-medium); font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
`;

export interface KapoProps {
  marko: string;
  /** The brand's name as written (`bildo.marko.etikedo`). */
  etikedo: string;
  menuoMalfermita: boolean;
  /** Opens or closes the list „+ Knoten“. */
  menuo: () => void;
  /** „gespeichert HH:MM“ of the last write in this session, or null before the first. */
  gespeichert: string | null;
  skemo: Schema;
  /** Sets the canvas's own scheme. */
  elektiSkemon: (skemo: Schema) => void;
  /** The slot for the notice „Verbindungen geändert · gilt nur in dieser Sitzung“ (`LigoHinweis`). */
  ligoHinweis: ReactNode;
}

/**
 * T7 (E-11, AK-19): the notice while the session's connections differ from those of the Agordo,
 * with „zurücksetzen“, which brings the Agordo's connections back. Calm text, no judgment.
 */
export function LigoHinweis({ zuruecksetzen }: { zuruecksetzen: () => void }) {
  return (
    <span className="nr-g-ligo-hinweis" aria-live="polite" data-nr-ligo-hinweis="">
      Verbindungen geändert · gilt nur in dieser Sitzung
      <fm-butono size="small" emphasis="low" data-nr-ligoj-zuruecksetzen="" onClick={zuruecksetzen}>
        zurücksetzen
      </fm-butono>
      <span className="nr-g-trenilo" />
    </span>
  );
}

/** The two schemes of the switch, in the order of the product spec. */
const SKEMOJ: readonly Schema[] = ["hell", "dunkel"];

export function Kapo({
  marko,
  etikedo,
  menuoMalfermita,
  menuo,
  gespeichert,
  skemo,
  elektiSkemon,
  ligoHinweis,
}: KapoProps) {
  useStilo("kapo", STILO);
  const nomo = encodeURIComponent(marko);
  return (
    <header className="nr-g-kapleisto" data-nr-kapo="">
      <div className="nr-g-grupo">
        <strong>Fundamento</strong>
        <fm-butono
          size="small"
          emphasis="medium"
          data-nr-malfermita={menuoMalfermita ? "true" : "false"}
          data-nr-aldoni=""
          onClick={menuo}
        >
          + Knoten
        </fm-butono>
        <span className="nr-g-trenilo" />
        <strong>{etikedo}</strong>
        <span className="nr-g-etikedo">Entwurf · ungeprüft</span>
        <span className="nr-g-trenilo" />
        <nav className="nr-g-segmento" aria-label="Ansicht">
          <span className="nr-g-segmento-nun" aria-current="page" data-nr-ansicht="gestalten">
            Gestalten
          </span>
          <fm-ligilo
            to={`/marko/${nomo}/grafeo?ansicht=verstehen`}
            placement="standalone"
            size="small"
            data-nr-ansicht="verstehen"
          >
            Verstehen
          </fm-ligilo>
        </nav>
      </div>
      <div className="nr-g-grupo">
        {ligoHinweis}
        {gespeichert === null ? null : (
          <span className="nr-g-gespeichert" aria-live="polite" data-nr-gespeichert="">
            {gespeichert}
          </span>
        )}
        <span className="nr-g-kapo-etikedo">Leinwand</span>
        <span className="nr-g-segmento" data-nr-skemoj="">
          {SKEMOJ.map((s) => (
            <fm-butono
              key={s}
              size="small"
              emphasis={s === skemo ? "medium" : "low"}
              data-nr-aktiva={s === skemo ? "true" : "false"}
              data-nr-skemo={s}
              onClick={() => elektiSkemon(s)}
            >
              {s}
            </fm-butono>
          ))}
        </span>
        <fm-ligilo to={`/studio/${nomo}/farbe`} placement="standalone" size="small">
          Im Studio öffnen
        </fm-ligilo>
      </div>
    </header>
  );
}
