// Spec 058 (MP-2c, T3, MAW-3.1, Teil B, US-2, AK-13): „Neue Marke“ and „Marken“ in the header slot
// `marken`, in the left group right after „+ Knoten“. The shell passes `<Marken />` to `Kapo`.
//   - „Neue Marke“ opens one field and „Anlegen“ under its button; Enter in the field is „Anlegen“.
//     „Anlegen“ is calmly disabled while the name is empty or gives no identifier (`identOf`). A
//     name whose identifier is a brand of the list (`GET /api/marken`) gets a calm sentence at the
//     field and „öffnen“, which switches to that brand; the canvas stays open meanwhile. Otherwise
//     the canvas first writes what is pending (`konserviNun`), then sends the start page's form
//     `POST /marko` (`name`, `ziel=leinwand`), which creates the brand and opens its canvas.
//   - „Marken“ drops the list of the started brands under its button: name, three swatches, „zuletzt
//     geändert“ and the number of Stände, newest first; the brand of this canvas is marked
//     (`aria-current`). „Öffnen“ writes what is pending, then goes to that brand's canvas. No
//     delete, no rename. An unreadable brand stands with its name and cannot be opened.
//   - A failed write keeps the canvas open; the header already shows NE_KONSERVITA_SATZ.
// Esc or a press outside closes. No model call, no rule, no red; calm grey sentences only.
// Marks: `[data-nr-neue-marke]` (button), `[data-nr-neue-marke-feld]`, `[data-nr-anlegen]`,
// `[data-nr-neue-marke-satz]` (with „öffnen“ `[data-nr-neue-marke-oeffnen]`), `[data-nr-marken]`
// (button), the list `[data-nr-marken-listo]` (`data-nr-preta`), its rows
// `[data-nr-marken-zeile=<id>]` (`aria-current="true"` on this canvas's brand) with „Öffnen“
// `[data-nr-marken-oeffnen=<id>]`.

import { useCallback, useEffect, useRef, useState } from "react";
import { standZeitTeksto } from "./datumoj.js";
import { useGestalten } from "./kunteksto.js";
import {
  leinwandHref,
  type MarkenZeile,
  markeAnlegen,
  markenSxargi,
  neueMarkeDe,
  staendeTextDe,
  vorhandenSatzDe,
} from "./marken-datumoj.js";
import { ROLOJ, useStilo } from "./roloj.js";

const STILO = `
.nr-g-marken { position: relative; display: inline-flex; align-items: center; gap: var(--fm-spacing-medium); }
.nr-g-marken-tavolo {
  position: absolute;
  z-index: 12;
  inset-block-start: calc(100% + var(--fm-spacing-medium) + var(--fm-spacing-small));
  inset-inline-start: 0;
  box-sizing: border-box;
  padding: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  background: ${ROLOJ.tavolo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-large);
  box-shadow: ${ROLOJ.ombroTavolo};
  white-space: normal;
}
.nr-g-neue-marke { inline-size: calc(var(--fm-size-container-small) * 0.5); display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.nr-g-neue-marke-zeile { display: flex; align-items: flex-end; gap: var(--fm-spacing-medium); }
.nr-g-neue-marke-zeile > fm-kampo { flex: 1 1 auto; min-inline-size: 0; }
.nr-g-neue-marke-satz { display: flex; align-items: center; flex-wrap: wrap; gap: var(--fm-spacing-small) var(--fm-spacing-medium); font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-marken-listo { inline-size: calc(var(--fm-size-container-small) * 0.64); max-inline-size: calc(100vw - 4 * var(--fm-spacing-large)); }
.nr-g-marken-listo h5 {
  margin: 0 0 var(--fm-spacing-small);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-marken-listo ul { list-style: none; margin: 0; padding: 0; max-block-size: 52vh; overflow: auto; }
.nr-g-marken-listo li {
  display: flex;
  align-items: center;
  gap: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  padding-block: var(--fm-spacing-medium);
  padding-inline: var(--fm-spacing-small);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-marken-listo li:first-child { border-block-start: 0; }
.nr-g-marken-listo li[aria-current="true"] { background: ${ROLOJ.pinto}; border-radius: var(--fm-radius-small); }
.nr-g-marken-listo li[data-nr-marken-malplena] { justify-content: center; color: ${ROLOJ.mallauta}; padding-block: var(--fm-spacing-large); }
.nr-g-marken-farboj { display: flex; flex: none; }
.nr-g-marken-farboj > span {
  inline-size: var(--fm-size-icon-small);
  block-size: var(--fm-size-control-small);
  box-sizing: border-box;
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-marken-farboj > span:first-child { border-start-start-radius: var(--fm-radius-small); border-end-start-radius: var(--fm-radius-small); }
.nr-g-marken-farboj > span:last-child { border-start-end-radius: var(--fm-radius-small); border-end-end-radius: var(--fm-radius-small); }
.nr-g-marken-farboj > span[data-nr-malplena] { border-style: dashed; border-color: ${ROLOJ.linioForta}; background: transparent; }
.nr-g-marken-nomoj { flex: 1 1 auto; min-inline-size: 0; display: flex; flex-direction: column; }
.nr-g-marken-nomoj strong { font-weight: var(--fm-font-weight-bold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-g-marken-nomoj small, .nr-g-marken-hier { font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-marken-nomoj small { font-family: var(--fm-font-family-code); }
`;

/** What is open under the buttons: the field „Neue Marke“, the list „Marken“, or nothing. */
type Malfermita = "neu" | "listo" | null;

/** The calm line of a brand whose agordo.json does not read (as the start page's list). */
const UNLESBAR = "lässt sich nicht lesen";

/** The time of a row in the local time of the browser; the text as it came when it is no time. */
function zeitDe(iso: string): string {
  const zeit = new Date(iso);
  return Number.isNaN(zeit.getTime()) ? iso : standZeitTeksto(zeit);
}

/** The value of an Ero field (its property, else its attribute). */
function valoroDe(el: HTMLElement): string {
  const valoro: unknown = (el as HTMLElement & { value?: unknown }).value;
  return typeof valoro === "string" ? valoro : (el.getAttribute("value") ?? "");
}

/** The three swatches of a row: brand colours inline from the data, an empty Akzent dashed. */
function Farboj({ farben }: { farben: MarkenZeile["farben"] }) {
  const ero = (rolo: "primaer" | "akzent" | "neutral") => {
    const hex = farben?.[rolo];
    return hex === undefined || hex === "" ? (
      <span key={rolo} data-nr-marken-farbo={rolo} data-nr-malplena="" />
    ) : (
      <span key={rolo} data-nr-marken-farbo={rolo} style={{ background: hex }} />
    );
  };
  return (
    <span className="nr-g-marken-farboj" aria-hidden="true">
      {ero("primaer")}
      {ero("akzent")}
      {ero("neutral")}
    </span>
  );
}

export function Marken() {
  useStilo("marken", STILO);
  const { marko, konserviNun } = useGestalten();
  const [malfermita, setMalfermita] = useState<Malfermita>(null);
  const [marken, setMarken] = useState<readonly MarkenZeile[] | null>(null);
  const [teksto, setTeksto] = useState("");
  const [laboras, setLaboras] = useState(false);
  const ujo = useRef<HTMLSpanElement>(null);
  const kampo = useRef<HTMLElement>(null);

  const fermi = useCallback(() => setMalfermita(null), []);

  // Esc or a press outside the buttons and their layer closes it.
  useEffect(() => {
    if (malfermita === null) return;
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") fermi();
    };
    const premo = (evento: PointerEvent) => {
      const celo = evento.target;
      if (celo instanceof Node && ujo.current?.contains(celo) === true) return;
      fermi();
    };
    document.addEventListener("keydown", klavo);
    document.addEventListener("pointerdown", premo, true);
    return () => {
      document.removeEventListener("keydown", klavo);
      document.removeEventListener("pointerdown", premo, true);
    };
  }, [malfermita, fermi]);

  const sxargi = useCallback(async () => {
    const r = await markenSxargi();
    // Without the list the duplicate check is left to the existing route; the list says nothing.
    setMarken(r.speco === "listo" ? r.marken : []);
  }, []);

  /** Writes what is pending, then leaves the canvas; a failed write keeps it open. */
  const verlassen = useCallback(
    async (gehen: () => void) => {
      if (laboras) return;
      setLaboras(true);
      // On `false` the header shows NE_KONSERVITA_SATZ; the layer stays for another try.
      if (!(await konserviNun())) {
        setLaboras(false);
        return;
      }
      gehen();
    },
    [laboras, konserviNun],
  );

  const wechseln = useCallback(
    (name: string) =>
      void verlassen(() => {
        window.location.assign(leinwandHref(name));
      }),
    [verlassen],
  );

  const neu = neueMarkeDe(teksto, marken, marko);

  const anlegen = useCallback(() => {
    const el = kampo.current;
    const r = neueMarkeDe(el === null ? teksto : valoroDe(el), marken, marko);
    if (r.speco !== "neu") return;
    void verlassen(() => markeAnlegen(r.name));
  }, [teksto, marken, marko, verlassen]);
  const anlegenRef = useRef(anlegen);
  anlegenRef.current = anlegen;

  // The field: empty, focused, read while typing; Enter is „Anlegen“.
  useEffect(() => {
    if (malfermita !== "neu") return;
    const el = kampo.current;
    if (el === null) return;
    const kadro = requestAnimationFrame(() => el.focus());
    const enigo = () => setTeksto(valoroDe(el));
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter") return;
      evento.preventDefault();
      anlegenRef.current();
    };
    el.addEventListener("input", enigo);
    el.addEventListener("keydown", klavo);
    return () => {
      cancelAnimationFrame(kadro);
      el.removeEventListener("input", enigo);
      el.removeEventListener("keydown", klavo);
    };
  }, [malfermita]);

  const baskuli = (kio: Exclude<Malfermita, null>) => {
    const nova = malfermita === kio ? null : kio;
    setMalfermita(nova);
    if (nova === null) return;
    if (nova === "neu") setTeksto("");
    if (nova === "listo") setMarken(null);
    void sxargi();
  };

  return (
    <span ref={ujo} className="nr-g-marken" data-nr-marken-ujo="">
      <fm-butono
        size="small"
        emphasis="medium"
        data-nr-malfermita={malfermita === "neu" ? "true" : "false"}
        data-nr-neue-marke=""
        onClick={() => baskuli("neu")}
      >
        Neue Marke
      </fm-butono>
      <fm-butono
        size="small"
        emphasis="medium"
        data-nr-malfermita={malfermita === "listo" ? "true" : "false"}
        data-nr-marken=""
        onClick={() => baskuli("listo")}
      >
        Marken
      </fm-butono>
      {malfermita === "neu" ? (
        <div
          className="nr-g-marken-tavolo nr-g-neue-marke"
          role="dialog"
          aria-label="Neue Marke"
          data-nr-neue-marke-tavolo=""
        >
          <div className="nr-g-neue-marke-zeile">
            <fm-kampo ref={kampo} size="small" autocomplete="off" data-nr-neue-marke-feld="">
              Name der Marke
            </fm-kampo>
            <fm-butono
              size="small"
              emphasis="high"
              disabled={neu.speco !== "neu" || laboras}
              data-nr-anlegen=""
              onClick={anlegen}
            >
              Anlegen
            </fm-butono>
          </div>
          {neu.speco === "vorhanden" ? (
            <span className="nr-g-neue-marke-satz" aria-live="polite" data-nr-neue-marke-satz="">
              {vorhandenSatzDe(neu.zeile, neu.aktuell)}
              {neu.aktuell || !neu.zeile.lesbar ? null : (
                <fm-butono
                  size="small"
                  emphasis="low"
                  disabled={laboras}
                  data-nr-neue-marke-oeffnen={neu.zeile.name}
                  onClick={() => wechseln(neu.zeile.name)}
                >
                  öffnen
                </fm-butono>
              )}
            </span>
          ) : null}
        </div>
      ) : null}
      {malfermita === "listo" ? (
        <div
          className="nr-g-marken-tavolo nr-g-marken-listo"
          role="dialog"
          aria-label="Marken"
          data-nr-marken-listo=""
          data-nr-preta={marken === null ? "false" : "true"}
        >
          <h5>Marken</h5>
          <ul>
            {marken === null ? null : marken.length === 0 ? (
              <li data-nr-marken-malplena="">Noch keine Marke</li>
            ) : (
              marken.map((zeile) => {
                const aktuell = zeile.name === marko;
                return (
                  <li
                    key={zeile.name}
                    aria-current={aktuell ? "true" : undefined}
                    data-nr-marken-zeile={zeile.name}
                    data-nr-lesbar={zeile.lesbar ? "true" : "false"}
                  >
                    <Farboj farben={zeile.farben} />
                    <span className="nr-g-marken-nomoj">
                      <strong>{zeile.etikedo}</strong>
                      <small>
                        {zeile.lesbar
                          ? `${zeitDe(zeile.geaendert)} · ${staendeTextDe(zeile.staende)}`
                          : UNLESBAR}
                      </small>
                    </span>
                    {aktuell ? (
                      <span className="nr-g-marken-hier">offen</span>
                    ) : zeile.lesbar ? (
                      <fm-butono
                        size="small"
                        emphasis="medium"
                        disabled={laboras}
                        data-nr-marken-oeffnen={zeile.name}
                        onClick={() => wechseln(zeile.name)}
                      >
                        Öffnen
                      </fm-butono>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </span>
  );
}
