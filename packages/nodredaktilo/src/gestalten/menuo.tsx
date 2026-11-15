// Spec 054 (MP-1, T3, E-13, AK-21): the list „+ Knoten“. It draws `aldonebloj(KATALOGO_054, …)`
// grouped by purpose in the catalog's order, each entry with the sign of its port kind and the word
// for what it offers. Selectable are exactly `anlegen`, `setzen` and `weitere`; `da` and `spaeter`
// stand muted and disabled. A selection closes the list (the canvas does the rest); Esc or a press
// outside the list and its trigger closes it too.

import type { Aldoneblo, KatalogoGrupo } from "@fundamento/metiejo/gestalten";
import { ALDON_ETIKEDOJ } from "@fundamento/metiejo/gestalten";
import { useEffect, useRef } from "react";
import { ROLOJ, useStilo } from "./roloj.js";
import { ArtSigno } from "./sxelo.js";

const STILO = `
.nr-g-menuo {
  position: absolute;
  z-index: 11;
  inset-block-start: calc(var(--fm-spacing-large) + var(--fm-size-control-medium) + var(--fm-spacing-large));
  inset-inline-start: var(--fm-spacing-large);
  inline-size: calc(var(--fm-size-container-medium) * 0.84);
  max-inline-size: calc(100vw - 2 * var(--fm-spacing-large));
  max-block-size: calc(100vh - 8 * var(--fm-spacing-large));
  overflow: auto;
  box-sizing: border-box;
  padding: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  background: ${ROLOJ.tavolo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-large);
  box-shadow: ${ROLOJ.ombroTavolo};
  columns: 3 calc(var(--fm-size-container-small) / 3);
  column-gap: var(--fm-spacing-large);
}
.nr-g-menuo section { break-inside: avoid; margin-block-end: calc(var(--fm-spacing-medium) + var(--fm-spacing-small)); }
.nr-g-menuo h5 {
  margin: 0 0 var(--fm-spacing-small);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-menuo fm-butono { display: block; }
.nr-g-aldoneblo { display: inline-flex; align-items: center; gap: var(--fm-spacing-medium); white-space: nowrap; }
.nr-g-aldoneblo small { margin-inline-start: var(--fm-spacing-small); font-family: var(--fm-font-family-code); font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
`;

export interface MenuoProps {
  aldonebloj: readonly Aldoneblo[];
  /** The brand colour a colour entry's sign shows (the node's, or the derived one of its row). */
  hexDe: (aldoneblo: Aldoneblo) => string | undefined;
  elekti: (aldoneblo: Aldoneblo) => void;
  fermi: () => void;
}

/** Whether an entry can be selected. */
export const elektebla = (a: Aldoneblo): boolean =>
  a.stato === "anlegen" || a.stato === "setzen" || a.stato === "weitere";

export function Menuo({ aldonebloj, hexDe, elekti, fermi }: MenuoProps) {
  useStilo("menuo", STILO);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") fermi();
    };
    const premo = (evento: PointerEvent) => {
      const celo = evento.target;
      if (!(celo instanceof Node)) return;
      if (ref.current?.contains(celo) === true) return;
      if (celo instanceof Element && celo.closest("[data-nr-aldoni]") !== null) return;
      fermi();
    };
    document.addEventListener("keydown", klavo);
    document.addEventListener("pointerdown", premo, true);
    return () => {
      document.removeEventListener("keydown", klavo);
      document.removeEventListener("pointerdown", premo, true);
    };
  }, [fermi]);

  const grupoj = new Map<KatalogoGrupo, Aldoneblo[]>();
  for (const a of aldonebloj) grupoj.set(a.grupo, [...(grupoj.get(a.grupo) ?? []), a]);

  return (
    <div
      ref={ref}
      id="nr-g-menuo"
      className="nr-g-menuo"
      role="menu"
      aria-label="Knoten hinzufügen"
      data-nr-menuo=""
    >
      {[...grupoj].map(([grupo, eroj]) => (
        <section key={grupo}>
          <h5>{grupo}</h5>
          {eroj.map((a) => (
            <fm-butono
              key={a.nomo}
              role="menuitem"
              size="small"
              emphasis="low"
              full-width
              disabled={!elektebla(a)}
              data-nr-aldoneblo={a.nomo}
              data-nr-stato={a.stato}
              onClick={elektebla(a) ? () => elekti(a) : undefined}
            >
              <span className="nr-g-aldoneblo">
                <ArtSigno art={a.zeichen} hex={hexDe(a)} plena={a.zeichen === "farbo"} />
                {a.nomo}
                <small>{ALDON_ETIKEDOJ[a.stato]}</small>
              </span>
            </fm-butono>
          ))}
        </section>
      ))}
    </div>
  );
}
