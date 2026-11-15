// Spec 055 (T5, Option A): „Stand speichern“ and „Stände“ in the header. „Stand speichern“ opens a
// small field under its button, prefilled with the proposal „TT.MM.JJJJ, HH:MM“; saving takes the
// last confirmed draft and canvas state (state writes wait, then go on) and says calmly
// „Stand „…“ gespeichert“. „Stände“ drops the list under its button, newest first: name, time,
// three swatches (Primär, Akzent – dashed and empty without one –, Neutral) and „Öffnen“. „Öffnen“
// lets the server back the current state up and replace draft and canvas state, then starts the
// session again from it (`rekomenci`): colours, places and connections of the Stand, without a
// reload. A Stand that cannot be opened keeps the calm row line „Dieser Stand lässt sich nicht
// öffnen“. Esc or a press outside closes. No rule, no red, no number but the time.

import { NE_KONSERVITA_SATZ, type StandZeile } from "@fundamento/metiejo/gestalten";
import { useCallback, useEffect, useRef, useState } from "react";
import { staendeSxargi, standKonservi, standMalfermi, standZeitTeksto } from "./datumoj.js";
import { useGestalten } from "./kunteksto.js";
import { ROLOJ, useStilo } from "./roloj.js";

const STILO = `
.nr-g-staende { position: relative; display: inline-flex; align-items: center; gap: calc(var(--fm-spacing-medium) + var(--fm-spacing-small)); }
.nr-g-staende-mesagxo { font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-staende-tavolo {
  position: absolute;
  z-index: 12;
  inset-block-start: calc(100% + var(--fm-spacing-medium) + var(--fm-spacing-small));
  inset-inline-end: 0;
  box-sizing: border-box;
  padding: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  background: ${ROLOJ.tavolo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-large);
  box-shadow: ${ROLOJ.ombroTavolo};
  white-space: normal;
}
.nr-g-stand-nomo { inline-size: calc(var(--fm-size-container-small) * 0.5); display: flex; align-items: flex-end; gap: var(--fm-spacing-medium); }
.nr-g-stand-nomo > fm-kampo { flex: 1 1 auto; min-inline-size: 0; }
.nr-g-staende-listo { inline-size: calc(var(--fm-size-container-small) * 0.64); max-inline-size: calc(100vw - 4 * var(--fm-spacing-large)); }
.nr-g-staende-listo h5 {
  margin: 0 0 var(--fm-spacing-small);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-staende-listo ul { list-style: none; margin: 0; padding: 0; max-block-size: 52vh; overflow: auto; }
.nr-g-staende-listo li {
  display: flex;
  align-items: center;
  gap: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  padding-block: var(--fm-spacing-medium);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-staende-listo li:first-child { border-block-start: 0; }
.nr-g-staende-listo li[data-nr-staende-malplena] { justify-content: center; color: ${ROLOJ.mallauta}; padding-block: var(--fm-spacing-large); }
.nr-g-stand-farboj { display: flex; flex: none; }
.nr-g-stand-farboj > span {
  inline-size: var(--fm-size-icon-small);
  block-size: var(--fm-size-control-small);
  box-sizing: border-box;
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-stand-farboj > span:first-child { border-start-start-radius: var(--fm-radius-small); border-end-start-radius: var(--fm-radius-small); }
.nr-g-stand-farboj > span:last-child { border-start-end-radius: var(--fm-radius-small); border-end-end-radius: var(--fm-radius-small); }
.nr-g-stand-farboj > span[data-nr-malplena] { border-style: dashed; border-color: ${ROLOJ.linioForta}; background: transparent; }
.nr-g-stand-nomoj { flex: 1 1 auto; min-inline-size: 0; display: flex; flex-direction: column; }
.nr-g-stand-nomoj strong { font-weight: var(--fm-font-weight-bold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-g-stand-nomoj small, .nr-g-stand-ne { font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-stand-nomoj small { font-family: var(--fm-font-family-code); }
`;

/** What is open under the buttons: the name field, the list, or nothing. */
type Malfermita = "nomo" | "listo" | null;

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
function Farboj({ farben }: { farben: StandZeile["farben"] }) {
  const ero = (rolo: "primaer" | "akzent" | "neutral") => {
    const hex = farben?.[rolo];
    return hex === undefined || hex === "" ? (
      <span key={rolo} data-nr-stand-farbo={rolo} data-nr-malplena="" />
    ) : (
      <span key={rolo} data-nr-stand-farbo={rolo} style={{ background: hex }} />
    );
  };
  return (
    <span className="nr-g-stand-farboj" aria-hidden="true">
      {ero("primaer")}
      {ero("akzent")}
      {ero("neutral")}
    </span>
  );
}

export interface StaendeProps {
  /**
   * Lets the canvas write its state again after `statoAtendi` without a new session (after a
   * Stand was saved, or a Stand could not be opened and nothing changed on the server).
   */
  dauxrigi: () => void;
}

export function Staende({ dauxrigi }: StaendeProps) {
  useStilo("staende", STILO);
  const { marko, rekomenci, statoAtendi } = useGestalten();
  const [malfermita, setMalfermita] = useState<Malfermita>(null);
  const [staende, setStaende] = useState<readonly StandZeile[] | null>(null);
  const [neMalfermeblaj, setNeMalfermeblaj] = useState<ReadonlySet<string>>(new Set());
  const [mesagxo, setMesagxo] = useState<string | null>(null);
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
    const r = await staendeSxargi(marko);
    setStaende(r.speco === "listo" ? r.staende : []);
  }, [marko]);

  const konservi = useCallback(async () => {
    const el = kampo.current;
    const nomo = el === null ? "" : valoroDe(el).trim();
    setLaboras(true);
    // The Stand takes the last confirmed state: a write in flight lands first.
    await statoAtendi();
    const r = await standKonservi(marko, nomo === "" ? undefined : nomo);
    dauxrigi();
    setLaboras(false);
    if (r.speco === "ok") {
      setMesagxo(`Stand „${r.name}“ gespeichert`);
      fermi();
    } else setMesagxo(NE_KONSERVITA_SATZ);
  }, [marko, statoAtendi, dauxrigi, fermi]);
  const konserviRef = useRef(konservi);
  konserviRef.current = konservi;

  const malfermi = useCallback(
    async (zeile: StandZeile) => {
      setLaboras(true);
      // No late write of the old session may land after the server replaced the state.
      await statoAtendi();
      const r = await standMalfermi(marko, zeile.id);
      if (r.speco === "ne-malfermebla") {
        dauxrigi();
        setNeMalfermeblaj((antauaj) => new Set(antauaj).add(zeile.id));
        setLaboras(false);
        return;
      }
      await rekomenci();
      setLaboras(false);
      if (r.speco === "ok") {
        setMesagxo(`Stand „${zeile.name}“ geöffnet`);
        fermi();
      } else setNeMalfermeblaj((antauaj) => new Set(antauaj).add(zeile.id));
    },
    [marko, statoAtendi, rekomenci, dauxrigi, fermi],
  );

  // The name field: prefilled with the proposal, focused, Enter saves.
  useEffect(() => {
    if (malfermita !== "nomo") return;
    const el = kampo.current;
    if (el === null) return;
    el.setAttribute("value", standZeitTeksto(new Date()));
    (el as HTMLElement & { value?: string }).value = standZeitTeksto(new Date());
    const kadro = requestAnimationFrame(() => {
      el.focus();
      (el as HTMLElement & { select?: () => void }).select?.();
    });
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter") return;
      evento.preventDefault();
      void konserviRef.current();
    };
    el.addEventListener("keydown", klavo);
    return () => {
      cancelAnimationFrame(kadro);
      el.removeEventListener("keydown", klavo);
    };
  }, [malfermita]);

  const baskuli = (kio: Exclude<Malfermita, null>) => {
    const nova = malfermita === kio ? null : kio;
    setMalfermita(nova);
    if (nova === "listo") {
      setNeMalfermeblaj(new Set());
      setStaende(null);
      void sxargi();
    }
  };

  return (
    <span ref={ujo} className="nr-g-staende" data-nr-staende-ujo="">
      {mesagxo === null ? null : (
        <span className="nr-g-staende-mesagxo" aria-live="polite" data-nr-stand-mesagxo="">
          {mesagxo}
        </span>
      )}
      <fm-butono
        size="small"
        emphasis="medium"
        data-nr-malfermita={malfermita === "nomo" ? "true" : "false"}
        data-nr-stand-speichern=""
        onClick={() => baskuli("nomo")}
      >
        Stand speichern
      </fm-butono>
      <fm-butono
        size="small"
        emphasis="medium"
        data-nr-malfermita={malfermita === "listo" ? "true" : "false"}
        data-nr-staende=""
        onClick={() => baskuli("listo")}
      >
        Stände
      </fm-butono>
      {malfermita === "nomo" ? (
        <div
          id="nr-g-stand-nomo"
          className="nr-g-staende-tavolo nr-g-stand-nomo"
          role="dialog"
          aria-label="Stand speichern"
          data-nr-stand-nomo=""
        >
          <fm-kampo ref={kampo} size="small" autocomplete="off" data-nr-stand-kampo="">
            Name des Stands
          </fm-kampo>
          <fm-butono
            size="small"
            emphasis="high"
            disabled={laboras}
            data-nr-stand-konservi=""
            onClick={() => void konservi()}
          >
            Speichern
          </fm-butono>
        </div>
      ) : null}
      {malfermita === "listo" ? (
        <div
          id="nr-g-staende-listo"
          className="nr-g-staende-tavolo nr-g-staende-listo"
          role="dialog"
          aria-label="Stände"
          data-nr-staende-listo=""
          data-nr-preta={staende === null ? "false" : "true"}
        >
          <h5>Stände</h5>
          <ul>
            {staende === null ? null : staende.length === 0 ? (
              <li data-nr-staende-malplena="">Noch kein Stand</li>
            ) : (
              staende.map((zeile) => (
                <li
                  key={zeile.id}
                  data-nr-stand={zeile.id}
                  data-nr-lesbar={zeile.lesbar ? "true" : "false"}
                >
                  <Farboj farben={zeile.farben} />
                  <span className="nr-g-stand-nomoj">
                    <strong data-nr-stand-nomo-teksto="">{zeile.name}</strong>
                    <small>{zeitDe(zeile.zeit)}</small>
                    {!zeile.lesbar || neMalfermeblaj.has(zeile.id) ? (
                      <span className="nr-g-stand-ne" data-nr-stand-ne-malfermebla="">
                        Dieser Stand lässt sich nicht öffnen
                      </span>
                    ) : null}
                  </span>
                  {zeile.lesbar ? (
                    <fm-butono
                      size="small"
                      emphasis="medium"
                      disabled={laboras}
                      data-nr-stand-oeffnen={zeile.id}
                      onClick={() => void malfermi(zeile)}
                    >
                      Öffnen
                    </fm-butono>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </span>
  );
}
