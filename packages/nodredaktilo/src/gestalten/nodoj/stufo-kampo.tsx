// Spec 054 (MP-1, T5, MPFG-3.2): the small field under a palette row that sets one step by hand,
// separately for light and dark (Fluss C, AK-11, AK-24, AK-25). Two values – „hell“ and „dunkel“
// (empty = „wie hell“) – each with a native colour picker and „↺“ (back to the derivation for that
// scheme only, written at once), „Übernehmen“ (writes each changed scheme on its own, `schema`), and
// at the Basis „Farbe aus dem Knoten“ (fills „hell“ with the node's colour; writes nothing).
//
// No judgment: a step that breaks a contrast is simply saved. A value Fundamento cannot read gives
// the calm sentence here, in the muted text colour, and nothing is written – the client reads the
// same two forms the write path reads (hex 3/6 and the OKLCH form `L C H`) before it sends anything,
// so light is never written while dark is refused. Esc or a pointer outside closes the field (the
// palette node listens). Every control carries `nodrag`.

import {
  type LeinwandSxangxo,
  NE_KONSERVITA_SATZ,
  NELEGEBLA_SATZ,
  type Schema,
  type Stufo,
} from "@fundamento/metiejo/gestalten";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useGestalten } from "../kunteksto.js";
import { NODRAG, ROLOJ, useStilo } from "../roloj.js";

const STILO = `
.nr-g-stufo-kampo {
  position: absolute;
  inset-block-start: calc(100% - var(--fm-spacing-small));
  inset-inline: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  z-index: 3;
  box-sizing: border-box;
  display: grid;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-medium);
  background: ${ROLOJ.tavolo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-medium);
  box-shadow: ${ROLOJ.ombroTavolo};
  cursor: default;
}
.nr-g-stufo-kampo h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-medium);
  color: ${ROLOJ.mallauta};
}
.nr-g-stufo-kampo h4 > i {
  inline-size: var(--fm-spacing-medium);
  block-size: var(--fm-spacing-medium);
  border-radius: var(--fm-radius-small);
  background: var(--nr-g-stufo-hell);
  box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.linioForta};
}
.nr-g-stufo-linio {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
}
.nr-g-stufo-linio > span {
  inline-size: calc(var(--fm-spacing-xlarge, var(--fm-spacing-large)) * 1.75);
  flex: none;
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
.nr-g-stufo-linio > fm-kampo { flex: 1; min-inline-size: 0; font-family: var(--fm-font-family-code); }
.nr-g-stufo-elektilo {
  flex: none;
  box-sizing: border-box;
  inline-size: var(--fm-size-icon-large);
  block-size: var(--fm-size-icon-large);
  padding: 0;
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  background: transparent;
  cursor: pointer;
}
.nr-g-stufo-elektilo::-webkit-color-swatch-wrapper { padding: 0; }
.nr-g-stufo-elektilo::-webkit-color-swatch { border: 0; border-radius: var(--fm-radius-small); }
.nr-g-stufo-elektilo::-moz-color-swatch { border: 0; border-radius: var(--fm-radius-small); }
.nr-g-stufo-elektilo:focus-visible { outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.ringo}; outline-offset: var(--fm-border-width-default); }
.nr-g-stufo-satz {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-stufo-knopoj { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); }
`;

const HEKSA = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** The OKLCH form the write path reads (agordilo `parseAgordoColor`): `L[%] C H` in the function. */
const OKLCH_FORMO =
  /^oklch\(\s*([0-9]*\.?[0-9]+)(%?)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s*\)$/;

/** Whether the write path can read `teksto` as a colour. */
export function legebla(teksto: string): boolean {
  const t = teksto.trim();
  return HEKSA.test(t) || OKLCH_FORMO.test(t);
}

/** A text as compared: a hex value in its long lower-case form, anything else trimmed. */
function normala(teksto: string): string {
  const t = teksto.trim();
  const heksa = HEKSA.exec(t)?.[1];
  if (heksa === undefined) return t;
  const longa = heksa.length === 3 ? [...heksa].map((c) => `${c}${c}`).join("") : heksa;
  return `#${longa.toLowerCase()}`;
}

/** A picker takes only the long hex form; anything else shows `anstatauxe`. */
const elektiloValoro = (teksto: string, anstatauxe: string): string => {
  const n = normala(teksto);
  return /^#[0-9a-f]{6}$/.test(n) ? n : anstatauxe;
};

/** What stands in a field when it opens (and again after its „↺“): the step's own value. */
export function komencaj(stufo: Stufo): Record<Schema, string> {
  return {
    hell: stufo.hex,
    dunkel: stufo.gesetztDunkel ? (stufo.hexDunkel ?? stufo.hex) : "",
  };
}

/** The changes „Übernehmen“ writes: each scheme whose field differs from what it opened with. */
export function sxangxojDe(stufo: Stufo, valoroj: Record<Schema, string>): LeinwandSxangxo[] {
  const komenco = komencaj(stufo);
  const out: LeinwandSxangxo[] = [];
  if (normala(valoroj.hell) !== normala(komenco.hell)) {
    out.push({ stufe: { token: stufo.tokeno, wert: valoroj.hell.trim(), schema: "hell" } });
  }
  if (normala(valoroj.dunkel) !== normala(komenco.dunkel)) {
    const wert = valoroj.dunkel.trim();
    out.push({ stufe: { token: stufo.tokeno, wert: wert === "" ? null : wert, schema: "dunkel" } });
  }
  return out;
}

const SKEMOJ: readonly Schema[] = ["hell", "dunkel"];

interface KampoProps {
  skemo: Schema;
  valoro: string;
  placeholder: string;
  sxangxi: (valoro: string) => void;
  uebernehmen: () => void;
  fokuso: boolean;
}

/** One value as an Ero field: reads its text from the native events of the element (R-15). */
function Kampo({ skemo, valoro, placeholder, sxangxi, uebernehmen, fokuso }: KampoProps) {
  const ref = useRef<HTMLElement>(null);
  const sxangxiRef = useRef(sxangxi);
  const uebernehmenRef = useRef(uebernehmen);
  sxangxiRef.current = sxangxi;
  uebernehmenRef.current = uebernehmen;

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const enigo = () => sxangxiRef.current(el.getAttribute("value") ?? "");
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter") return;
      evento.preventDefault();
      sxangxiRef.current(el.getAttribute("value") ?? "");
      uebernehmenRef.current();
    };
    el.addEventListener("input", enigo);
    el.addEventListener("change", enigo);
    el.addEventListener("keydown", klavo);
    return () => {
      el.removeEventListener("input", enigo);
      el.removeEventListener("change", enigo);
      el.removeEventListener("keydown", klavo);
    };
  }, []);

  // The field shows the state's text (a picker, „Farbe aus dem Knoten“ and „↺“ set it from outside).
  useEffect(() => {
    const el = ref.current;
    if (el !== null && el.getAttribute("value") !== valoro) el.setAttribute("value", valoro);
  }, [valoro]);

  useEffect(() => {
    if (!fokuso) return;
    const kadro = requestAnimationFrame(() => ref.current?.focus());
    return () => cancelAnimationFrame(kadro);
  }, [fokuso]);

  return (
    <fm-kampo
      ref={ref}
      className={NODRAG}
      size="small"
      aria-label={skemo === "hell" ? "Wert im hellen Schema" : "Wert im dunklen Schema"}
      placeholder={placeholder}
      autocomplete="off"
      spellCheck={false}
      data-nr-stufo-valoro={skemo}
    />
  );
}

export interface StufoKampoProps {
  /** „Primär“, „Erfolg“, … */
  etikedo: string;
  stufo: Stufo;
  /** Whether this step is its row's Basis (then „Farbe aus dem Knoten“ shows). */
  basis: boolean;
  /** The colour of the node feeding the row (`Vico.fontoHex`), for „Farbe aus dem Knoten“. */
  fontoHex: string | undefined;
  fermi: () => void;
}

export function StufoKampo({ etikedo, stufo, basis, fontoHex, fermi }: StufoKampoProps) {
  useStilo("stufo-kampo", STILO);
  const { skribi } = useGestalten();
  // `null` = not edited: the field shows the step's own value of the current Bildo.
  const [redaktitaj, setRedaktitaj] = useState<Record<Schema, string | null>>({
    hell: null,
    dunkel: null,
  });
  const [satz, setSatz] = useState<string | null>(null);
  const [skribas, setSkribas] = useState(false);

  const komenco = komencaj(stufo);
  const valoroj: Record<Schema, string> = {
    hell: redaktitaj.hell ?? komenco.hell,
    dunkel: redaktitaj.dunkel ?? komenco.dunkel,
  };
  const valorojRef = useRef(valoroj);
  valorojRef.current = valoroj;

  const meti = (skemo: Schema, valoro: string) => {
    setRedaktitaj((nun) => ({ ...nun, [skemo]: valoro }));
    setSatz(null);
  };

  const respondo = (rezulto: Awaited<ReturnType<typeof skribi>>): boolean => {
    if (rezulto.speco === "ok") return true;
    setSatz(rezulto.speco === "nelegebla" ? rezulto.satz : NE_KONSERVITA_SATZ);
    return false;
  };

  const uebernehmen = async () => {
    if (skribas) return;
    const nun = valorojRef.current;
    const dunkel = nun.dunkel.trim();
    if (!legebla(nun.hell) || (dunkel !== "" && !legebla(dunkel))) {
      setSatz(NELEGEBLA_SATZ);
      return;
    }
    const sxangxoj = sxangxojDe(stufo, nun);
    setSkribas(true);
    try {
      for (const sxangxo of sxangxoj) {
        if (!respondo(await skribi(sxangxo))) return;
      }
    } finally {
      setSkribas(false);
    }
    fermi();
  };

  const zurueck = async (skemo: Schema) => {
    if (skribas) return;
    setSkribas(true);
    try {
      const ok = respondo(
        await skribi({ stufe: { token: stufo.tokeno, wert: null, schema: skemo } }),
      );
      if (ok) setRedaktitaj((nun) => ({ ...nun, [skemo]: null }));
    } finally {
      setSkribas(false);
    }
  };

  const gesetzt: Record<Schema, boolean> = { hell: stufo.gesetzt, dunkel: stufo.gesetztDunkel };
  const malhela = stufo.hexDunkel ?? stufo.hex;

  return (
    <div
      className={`nr-g-stufo-kampo ${NODRAG}`}
      role="dialog"
      aria-label="Stufe von Hand setzen"
      data-nr-stufo-kampo={stufo.tokeno}
      style={{ "--nr-g-stufo-hell": stufo.hex } as CSSProperties}
    >
      <h4>
        <i aria-hidden="true" />
        <span>
          {etikedo} · {stufo.stufo}
          {basis ? " · Basis" : ""}
        </span>
      </h4>
      {SKEMOJ.map((skemo) => (
        <div key={skemo} className="nr-g-stufo-linio">
          <span>{skemo}</span>
          <Kampo
            skemo={skemo}
            valoro={valoroj[skemo]}
            placeholder={
              skemo === "hell"
                ? ""
                : stufo.hexDunkel !== undefined && !stufo.gesetztDunkel
                  ? stufo.hexDunkel
                  : "wie hell"
            }
            sxangxi={(v) => meti(skemo, v)}
            uebernehmen={() => void uebernehmen()}
            fokuso={skemo === "hell"}
          />
          <input
            type="color"
            className={`nr-g-stufo-elektilo ${NODRAG}`}
            aria-label={skemo === "hell" ? "Farbwähler hell" : "Farbwähler dunkel"}
            title={skemo === "hell" ? "Farbwähler hell" : "Farbwähler dunkel"}
            data-nr-stufo-elektilo={skemo}
            value={elektiloValoro(
              valoroj[skemo],
              skemo === "hell" ? stufo.hex : elektiloValoro(valoroj.hell, malhela),
            )}
            onChange={(evento) => meti(skemo, evento.currentTarget.value)}
          />
          <fm-butono
            className={NODRAG}
            size="small"
            emphasis="low"
            label={`${skemo}: zurück zur Ableitung`}
            title={`${skemo}: zurück zur Ableitung`}
            disabled={!gesetzt[skemo] || skribas}
            data-nr-stufo-zurueck={skemo}
            onClick={() => void zurueck(skemo)}
          >
            ↺
          </fm-butono>
        </div>
      ))}
      {satz === null ? null : (
        <p className="nr-g-stufo-satz" aria-live="polite" data-nr-stufo-satz="">
          {satz}
        </p>
      )}
      <div className="nr-g-stufo-knopoj">
        <fm-butono
          className={NODRAG}
          size="small"
          emphasis="medium"
          loading={skribas}
          data-nr-stufo-uebernehmen=""
          onClick={() => void uebernehmen()}
        >
          Übernehmen
        </fm-butono>
        {basis && fontoHex !== undefined && fontoHex !== "" ? (
          <fm-butono
            className={NODRAG}
            size="small"
            emphasis="low"
            data-nr-stufo-el-nodo=""
            onClick={() => meti("hell", fontoHex)}
          >
            Farbe aus dem Knoten
          </fm-butono>
        ) : null}
      </div>
    </div>
  );
}
