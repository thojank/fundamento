// Spec 058 (MP-2c, T5, MAW-3.3, plan §3.4, US-7, AK-6): the one button of a KI call on the canvas
// („Vorschlagen“/„Neu“ in „Namen und Beschreibung“, „Marke auswerten“ in the Marke, „Aufbau
// erkennen“ in the Layout-Beispiel).
//
// - Before: the estimate of the call („≈ 0,0012 $“, without a price „≈ 1900 Tokens“) from
//   `kiStato` (asks no model). It is read again after a call and whenever `sxlosilo` changes.
// - The click is the only way to a call: the latest canvas state is written (`konserviNun`), then
//   `kiPeti` runs inside `haltigiDum` (no state write in flight, none during), and an answer goes to
//   `onRezulto` there, so the caller's `inhaltMeti(…, true)` is in the next write.
// - While it runs: „läuft …“, no second click; the rest of the canvas stays usable.
// - After: the actual price and the time of the stored result (`kosto`), with the duration of a call
//   of this session.
// - Calmly disabled, with a grey sentence: no model („Kein Sprachmodell eingerichtet“), or the
//   caller's `malsxaltitaSatz` (e.g. „Noch keine Eingabe mit Inhalt“). An error shows the route's
//   sentence with what the attempt cost; the previous result is not touched (the caller keeps it).
// No red, no error tone; only this button is ever disabled.

import {
  KEIN_SPRACHMODELL_SATZ,
  KI_LAEUFT,
  type Kosto,
  type Zweck,
} from "@fundamento/metiejo/gestalten";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KI_STATO_FEHLT_SATZ,
  type KiStato,
  kiPeti,
  kiStato,
  kostoTekstoDe,
  kostoZeitDe,
} from "./ki-datumoj.js";
import { useGestalten } from "./kunteksto.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "./roloj.js";

const STILO = `
.nr-g-ki-knopo { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); }
.nr-g-ki-knopo-vico { display: flex; align-items: center; flex-wrap: wrap; gap: var(--fm-spacing-small); }
.nr-g-ki-knopo-preis,
.nr-g-ki-knopo-satz {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-ki-knopo-preis { display: inline-flex; flex-wrap: wrap; gap: var(--fm-spacing-small); }
`;

export interface KiKnopoProps<T> {
  /** The purpose: which route, which estimate (`[data-nr-ki-knopo=<zweck>]`). */
  zweck: Zweck;
  /** The label („Vorschlagen“, „Neu“, „Marke auswerten“, „Aufbau erkennen“). */
  etikedo: string;
  /** The cost of the stored result: its actual price and time are shown beside the button. */
  kosto?: Kosto | undefined;
  /** A calm sentence of the caller that disables the button (e.g. KEINE_EINGABE_SATZ). */
  malsxaltitaSatz?: string | undefined;
  /** The route's answer (`{vorschlag}`, `{profil}`, …), called inside `haltigiDum`. */
  onRezulto: (rezulto: T) => void;
  /** Extension: when this value changes, the estimate is read again (e.g. after a state write). */
  sxlosilo?: string | undefined;
}

/** „< 1 s“, „3 s“, „2 min“. */
const dauroDe = (ms: number): string =>
  ms < 1000
    ? "< 1 s"
    : ms >= 90_000
      ? `${Math.round(ms / 60_000)} min`
      : `${Math.round(ms / 1000)} s`;

export function KiKnopo<T>({
  zweck,
  etikedo,
  kosto,
  malsxaltitaSatz,
  onRezulto,
  sxlosilo,
}: KiKnopoProps<T>) {
  useStilo("ki-knopo", STILO);
  const { marko, haltigiDum, konserviNun } = useGestalten();
  const [stato, setStato] = useState<KiStato | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const laeuftRef = useRef(false);
  const [problemo, setProblemo] = useState<{ satz: string; kosto?: Kosto } | null>(null);
  const [dauro, setDauro] = useState<number | null>(null);
  const [nombro, setNombro] = useState(0);

  // The estimate: on the first paint, after every call, and when the caller's key changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `nombro` and `sxlosilo` only trigger a new read.
  useEffect(() => {
    let nuligita = false;
    void kiStato(marko, zweck).then((s) => {
      if (!nuligita) setStato(s);
    });
    return () => {
      nuligita = true;
    };
  }, [marko, zweck, nombro, sxlosilo]);

  const onRezultoRef = useRef(onRezulto);
  onRezultoRef.current = onRezulto;

  const klaki = useCallback(async () => {
    if (laeuftRef.current) return;
    laeuftRef.current = true;
    setLaeuft(true);
    setProblemo(null);
    const ek = performance.now();
    try {
      // The route reads what the server stores: typing still in the session goes first.
      await konserviNun();
      const r = await haltigiDum(async () => {
        const rezulto = await kiPeti<T>(marko, zweck);
        if (rezulto.speco === "ok") onRezultoRef.current(rezulto.rezulto);
        return rezulto;
      });
      if (r.speco === "problemo")
        setProblemo(r.kosto === undefined ? { satz: r.satz } : { satz: r.satz, kosto: r.kosto });
      else setDauro(performance.now() - ek);
    } finally {
      laeuftRef.current = false;
      setLaeuft(false);
      setNombro((n) => n + 1);
    }
  }, [haltigiDum, konserviNun, marko, zweck]);

  const pret = stato?.pret === true;
  const malsxaltita = !pret || malsxaltitaSatz !== undefined;
  const ruhigerSatz =
    stato === null
      ? undefined
      : !stato.pret
        ? stato.satz === KI_STATO_FEHLT_SATZ
          ? KI_STATO_FEHLT_SATZ
          : KEIN_SPRACHMODELL_SATZ
        : malsxaltitaSatz;
  const satz =
    problemo !== null
      ? problemo.kosto === undefined
        ? problemo.satz
        : `${problemo.satz} · ${kostoTekstoDe(problemo.kosto)}`
      : ruhigerSatz;
  const tatsaechlich =
    kosto === undefined
      ? undefined
      : [kostoTekstoDe(kosto), ...(dauro === null ? [] : [dauroDe(dauro)]), kostoZeitDe(kosto)]
          .filter((t) => t !== "")
          .join(" · ");

  return (
    <div className="nr-g-ki-knopo">
      <div className="nr-g-ki-knopo-vico">
        <fm-butono
          className={`${NODRAG} ${NOPAN}`}
          size="small"
          emphasis="medium"
          disabled={malsxaltita || laeuft}
          aria-busy={laeuft ? "true" : undefined}
          title={!pret && stato?.satz !== undefined ? stato.satz : undefined}
          data-nr-ki-knopo={zweck}
          data-nr-pret={pret ? "true" : "false"}
          data-nr-laeuft={laeuft ? "" : undefined}
          onClick={() => {
            if (!malsxaltita) void klaki();
          }}
        >
          {laeuft ? KI_LAEUFT : etikedo}
        </fm-butono>
        {pret || tatsaechlich !== undefined ? (
          <span className="nr-g-ki-knopo-preis" data-nr-ki-preis="">
            {pret && stato?.schaetzung !== undefined ? (
              <span data-nr-ki-schaetzung="">{stato.schaetzung.text}</span>
            ) : null}
            {tatsaechlich === undefined ? null : (
              <span data-nr-ki-kosto="">{`zuletzt ${tatsaechlich}`}</span>
            )}
          </span>
        ) : null}
      </div>
      {satz === undefined ? null : (
        <p className="nr-g-ki-knopo-satz" data-nr-ki-satz="" aria-live="polite">
          {satz}
        </p>
      )}
    </div>
  );
}
