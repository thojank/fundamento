// Spec 054 (MP-1, T3): the header of the view Gestalten. Left: „Fundamento“, „+ Knoten“, the brand
// with „Entwurf · ungeprüft“ and the switch Gestalten | Verstehen. Right: the slot for the notice
// about changed connections (`LigoHinweis`, T7), „gespeichert HH:MM“ (nothing before the first
// write of this session), the switch „Leinwand hell | dunkel“ and „Im Studio öffnen“. No cost hint,
// no menus „Datei“/„Bearbeiten“, no judgment. Controls are Eroj in the neutral Belegung.
// Spec 055 (T4, plan §2.4, Option A): right of the notice the calm line „Anordnung ließ sich nicht
// lesen, Startanordnung“ (while the stored state does not read, until the next write), „gespeichert
// HH:MM“ or calmly NE_KONSERVITA_SATZ, the slot `staende` for „Stand speichern“ and „Stände“
// (LNS-3.1), then „Anordnung zurücksetzen“, before „Leinwand hell | dunkel“.
// Spec 056 (T2, plan D-29): the notice counts – „1 Verbindung gelöst · zurücksetzen“, „n
// Verbindungen gelöst · zurücksetzen“ – the changed colour rows and the detached edges into the
// Marke; „gilt nur in dieser Sitzung“ goes (both persist in the canvas state since Spec 055/056).

import { geloestHinweisDe, NE_KONSERVITA_SATZ, type Schema } from "@fundamento/metiejo/gestalten";
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
.nr-g-stato-unlesbar { font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-ligo-hinweis { display: inline-flex; align-items: center; gap: var(--fm-spacing-medium); font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
`;

/** The last write of this session: saved at a time („gespeichert HH:MM“), or not saved. */
export type Konservo = { speco: "ok"; teksto: string } | { speco: "ne" };

/** The calm line while the stored canvas state does not read (product spec, Randfälle). */
export const STATO_UNLESBAR_SATZ = "Anordnung ließ sich nicht lesen, Startanordnung";

export interface KapoProps {
  marko: string;
  /** The brand's name as written (`bildo.marko.etikedo`). */
  etikedo: string;
  menuoMalfermita: boolean;
  /** Opens or closes the list „+ Knoten“. */
  menuo: () => void;
  /**
   * The last write in this session (a colour or the canvas state): „gespeichert HH:MM“, or
   * NE_KONSERVITA_SATZ when it failed; null before the first.
   */
  gespeichert: Konservo | null;
  /** Whether the stored canvas state did not read (calm line until the next successful write). */
  statoUnlesbar: boolean;
  /** „Anordnung zurücksetzen“: start places, the Agordo's connections, added nodes stay. */
  anordnungZuruecksetzen: () => void;
  /**
   * The slot for „Stand speichern“ and „Stände“ (LNS-3.1), right after „gespeichert …“ and before
   * „Anordnung zurücksetzen“ (plan §2.4). Null: nothing there.
   */
  staende?: ReactNode;
  skemo: Schema;
  /** Sets the canvas's own scheme. */
  elektiSkemon: (skemo: Schema) => void;
  /** The slot for the notice „n Verbindungen gelöst · zurücksetzen“ (`LigoHinweis`). */
  ligoHinweis: ReactNode;
}

/**
 * T7 (E-11, AK-19): the notice while the session's connections differ from those of the Agordo,
 * with „zurücksetzen“, which brings the Agordo's connections back. Calm text, no judgment. Spec 056
 * (D-29): „n Verbindungen gelöst · zurücksetzen“; `nombro` counts the changed colour rows and the
 * detached edges into the Marke, and „zurücksetzen“ plugs those too.
 */
export function LigoHinweis({
  nombro,
  zuruecksetzen,
}: {
  nombro: number;
  zuruecksetzen: () => void;
}) {
  return (
    <span className="nr-g-ligo-hinweis" aria-live="polite" data-nr-ligo-hinweis={String(nombro)}>
      {`${geloestHinweisDe(nombro)} ·`}
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
  statoUnlesbar,
  anordnungZuruecksetzen,
  staende = null,
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
        {statoUnlesbar ? (
          <span className="nr-g-stato-unlesbar" data-nr-stato-unlesbar="">
            {STATO_UNLESBAR_SATZ}
          </span>
        ) : null}
        {gespeichert === null ? null : (
          <span
            className="nr-g-gespeichert"
            aria-live="polite"
            data-nr-gespeichert={gespeichert.speco === "ok" ? "" : "ne"}
          >
            {gespeichert.speco === "ok" ? gespeichert.teksto : NE_KONSERVITA_SATZ}
          </span>
        )}
        {staende}
        <fm-butono
          size="small"
          emphasis="medium"
          data-nr-anordnung-zuruecksetzen=""
          onClick={anordnungZuruecksetzen}
        >
          Anordnung zurücksetzen
        </fm-butono>
        <span className="nr-g-trenilo" />
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
