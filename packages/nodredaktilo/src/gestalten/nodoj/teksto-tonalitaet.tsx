// Spec 056 (MP-2a, T3, KBS-3.1): Tonalität – six sliders between opposites (TONALITAET_PAROJ),
// five positions each (-2 … 2), the middle called TONALITAET_MITTE. A slider nobody touched is
// faint and counts as not set (it rests in the middle without a value); the node is empty while no
// slider is set. A slider is set the moment it is moved (in memory, the Marke follows) and written
// when it is let go (`konservi: true`). A press on an untouched slider that does not move it sets
// the middle. The sliders are the Ero of the Neutral node's Tönung (`fm-glitilo`).

import {
  type InhaltTonalitaet,
  TONALITAET_MITTE,
  TONALITAET_PAROJ,
  type TonalitaetParo,
} from "@fundamento/metiejo/gestalten";
import { useEffect, useRef } from "react";
import { useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN } from "../roloj.js";

/** The five positions: from the left word (-2) over the middle to the right word (2). */
const MIN = -2;
const MAX = 2;

function Glitilo({
  paro,
  valoro,
  movi,
  preni,
  etikedo,
}: {
  paro: TonalitaetParo;
  valoro: number | undefined;
  movi: (valoro: number) => void;
  preni: (valoro: number) => void;
  etikedo: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const vokoj = useRef({ movi, preni, valoro });
  vokoj.current = { movi, preni, valoro };
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    /** Set during one press: the slider moved (its `change` writes), so the release adds nothing. */
    let movita = false;
    const legi = (): number | undefined => {
      const v: unknown = (el as HTMLElement & { value?: unknown }).value;
      const n = Number(
        typeof v === "number" || typeof v === "string" ? v : el.getAttribute("value"),
      );
      return Number.isInteger(n) && n >= MIN && n <= MAX ? n : undefined;
    };
    const premo = () => {
      movita = false;
    };
    const enigo = () => {
      movita = true;
      const n = legi();
      if (n !== undefined) vokoj.current.movi(n);
    };
    const sxangxo = () => {
      const n = legi();
      if (n !== undefined) vokoj.current.preni(n);
    };
    const lasi = () => {
      // A press that did not move an untouched slider sets the position it shows: the middle.
      if (movita || vokoj.current.valoro !== undefined) return;
      const n = legi() ?? 0;
      vokoj.current.preni(n);
    };
    el.addEventListener("pointerdown", premo);
    el.addEventListener("input", enigo);
    el.addEventListener("change", sxangxo);
    el.addEventListener("pointerup", lasi);
    return () => {
      el.removeEventListener("pointerdown", premo);
      el.removeEventListener("input", enigo);
      el.removeEventListener("change", sxangxo);
      el.removeEventListener("pointerup", lasi);
    };
  }, []);
  useEffect(() => {
    const el = ref.current;
    const montrata = String(valoro ?? 0);
    if (el !== null && el.getAttribute("value") !== montrata) el.setAttribute("value", montrata);
  }, [valoro]);
  return (
    <fm-glitilo
      ref={ref}
      className={`${NODRAG} ${NOPAN}`}
      min={MIN}
      max={MAX}
      step={1}
      ticks
      readout="none"
      aria-label={etikedo}
      data-nr-ton={paro}
    />
  );
}

export function TonalitaetKorpo() {
  const { inhaltDe, inhaltMeti } = useGestalten();
  const inhalt = inhaltDe("teksto-tonalitaet") ?? {};
  const inhaltRef = useRef<InhaltTonalitaet>(inhalt);
  inhaltRef.current = inhalt;
  const meti = (paro: TonalitaetParo, valoro: number, konservi: boolean): void => {
    const nun: InhaltTonalitaet = { ...inhaltRef.current, [paro]: valoro };
    inhaltRef.current = nun;
    inhaltMeti("teksto-tonalitaet", nun, konservi);
  };
  return (
    <div className="nr-g-teksto-ton-listo">
      {TONALITAET_PAROJ.map(({ id, links, rechts }) => {
        const valoro = inhalt[id];
        const flanko =
          valoro === undefined ? undefined : valoro < 0 ? "links" : valoro > 0 ? "rechts" : "mitte";
        return (
          <div
            key={id}
            className="nr-g-teksto-ton"
            data-nr-tonalitaet={id}
            data-nr-gesetzt={valoro === undefined ? undefined : ""}
            data-nr-flanko={flanko}
          >
            <span className="nr-g-teksto-ton-links">{links}</span>
            <span className="nr-g-teksto-ton-glitilo">
              <Glitilo
                paro={id}
                valoro={valoro}
                etikedo={`${links} – ${rechts}`}
                movi={(n) => meti(id, n, false)}
                preni={(n) => meti(id, n, true)}
              />
              <small className="nr-g-teksto-ton-mitte">
                {flanko === "mitte" ? TONALITAET_MITTE : null}
              </small>
            </span>
            <span className="nr-g-teksto-ton-rechts">{rechts}</span>
          </div>
        );
      })}
    </div>
  );
}
