// Spec 054 (MP-1, T4): the node Farbe – Primär, Akzent, Neutral and the compact Funktionsfarben,
// built after the mockup. Every node shows its own field of the stored Agordo, connected or not
// (a detached node is muted and still writes). Each change goes through the canvas's own write path
// (`skribi`), which judges nothing: a field takes its text on Enter or when it is left, the picker
// on `change`, the slider „Tönung“ when the thumb comes to rest. While it writes, the old state
// stays. An unreadable value gives the calm sentence of the write path under the field (muted text,
// no red, no sign), the input stays and the node lies above its neighbours (`hervorheben`); a
// network error or a 5xx gives NE_KONSERVITA_SATZ. Ports: input `farbo-<rolo>.en` (Marke), output
// `farbo-<rolo>.el` (Farbe; Neutral: Maß). Self-contained: its rules live here (`useStilo`).
//
// Marks for scripts: `[data-nr-farbo-kampo=<rolo>]` (field), `[data-nr-farbo-elektilo=<rolo>]`
// (picker), `[data-nr-farbo-forigi=akzent]` („×“), `[data-nr-farbo-zurueck=<rolo>]` („↺“),
// `[data-nr-akzent-setzen]`, `[data-nr-toenung]` (slider), `[data-nr-farbo-satz=<rolo>]` (the
// sentence while it shows), `[data-nr-neutral-hinweis]`; `data-nr-skribas` on the body while a write
// runs.

import {
  type BildoFarbo,
  type FarboRolo,
  type LeinwandSxangxo,
  NE_KONSERVITA_SATZ,
  ROLO_ETIKEDOJ,
  STATUS_ROLOJ,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { type FarboFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, ROLOJ, useStilo } from "../roloj.js";
import { Etikedo, NodoKapo, NodoSxelo } from "../sxelo.js";

const STILO = `
.nr-g-farbo-feld {
  display: grid;
  place-items: center;
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  block-size: calc(var(--fm-size-control-large) + var(--fm-spacing-large));
  border-radius: var(--fm-radius-small);
  background: var(--nr-g-farbo);
}
.nr-g-nodo[data-nr-leer] .nr-g-farbo-feld {
  background: transparent;
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
}
.nr-g-farbo-linio {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
}
.nr-g-farbo-linio > fm-kampo {
  flex: 1;
  min-inline-size: 0;
  font-family: var(--fm-font-family-code);
}
/* The native input of the Ero keeps its intrinsic width (size 20) in a flex row; let it shrink. */
.nr-g-farbo-linio > fm-kampo::part(control) { min-inline-size: 0; inline-size: 100%; }
.nr-g-farbo-linio > .nr-g-farbo-fino { margin-inline-start: auto; }
.nr-g-farbo-klein {
  flex: none;
  inline-size: var(--fm-size-control-small);
  block-size: var(--fm-size-control-small);
  border-radius: var(--fm-radius-small);
  background: var(--nr-g-farbo);
}
.nr-g-nodo[data-nr-leer] .nr-g-farbo-klein { opacity: var(--fm-opacity-disabled); }
.nr-g-farbo-waehler {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: none;
  block-size: var(--fm-size-control-small);
  padding-inline: var(--fm-spacing-medium);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.teksto};
  background: ${ROLOJ.pinto};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  cursor: pointer;
  white-space: nowrap;
}
.nr-g-farbo-waehler:hover { border-color: ${ROLOJ.mallauta}; }
.nr-g-farbo-waehler:focus-within { outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.ringo}; outline-offset: var(--fm-border-width-default); }
.nr-g-farbo-waehler > input {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
}
.nr-g-farbo-satz, .nr-g-farbo-hinweis {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-farbo-satz { white-space: normal; }
/* The thumb is centred on the track's ends: room so it never covers the label. */
.nr-g-farbo-linio > fm-glitilo { flex: 1; min-inline-size: 0; margin-inline: var(--fm-spacing-medium) var(--fm-spacing-small); }
.nr-g-farbo-etikedo { flex: none; font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-farbo-korpo[data-nr-skribas] .nr-g-farbo-feld,
.nr-g-farbo-korpo[data-nr-skribas] .nr-g-farbo-klein { opacity: var(--fm-opacity-disabled); }
@media (prefers-reduced-motion: no-preference) {
  .nr-g-farbo-feld, .nr-g-farbo-klein {
    transition: background-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), opacity var(--fm-motion-duration-fast) var(--fm-motion-easing-standard);
  }
}
`;

const MARKOJ = {
  leer: "leer",
  startwert: "Startwert",
  "von-hand": "von Hand",
  "aus-material": "aus Material",
} as const;

/** The head's port line: below the swatch for the tall nodes, in the head line for compact ones. */
export const FARBO_ANSCHLUSS_SUPRO = { granda: 57, kompakta: 42 } as const;

/** A picker takes only the long hex form; anything else gives no value to show. */
const elektiloValoro = (hex: string): string | undefined =>
  /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : undefined;

/** A text as compared: trimmed, a hex value in lower case. */
const normala = (teksto: string): string => teksto.trim().toLowerCase();

/** „Tönung 0,35“ */
const toenungTeksto = (toenung: number): string => `Tönung ${toenung.toFixed(2).replace(".", ",")}`;

/** The text of an Ero field (its value is reflected as the attribute while a person types). */
function tekstoDe(el: HTMLElement): string {
  const valoro: unknown = (el as HTMLElement & { value?: unknown }).value;
  return typeof valoro === "string" ? valoro : (el.getAttribute("value") ?? "");
}

/** What a write answered, as the node shows it: nothing, or the calm sentence at the field. */
type Skribo = (sxangxo: LeinwandSxangxo) => Promise<string | null>;

/** The write of one node: the sentence of a refusal, the node raised while it shows. */
function useSkribo(id: string): {
  skribi: Skribo;
  satz: string | null;
  skribas: boolean;
  forgesi: () => void;
} {
  const { skribi, hervorheben } = useGestalten();
  const [satz, setSatz] = useState<string | null>(null);
  const [skribas, setSkribas] = useState(false);
  useEffect(() => {
    hervorheben(id, satz !== null);
  }, [hervorheben, id, satz]);
  useEffect(() => () => hervorheben(id, false), [hervorheben, id]);
  const skribo = useCallback<Skribo>(
    async (sxangxo) => {
      setSkribas(true);
      try {
        const rezulto = await skribi(sxangxo);
        const nova =
          rezulto.speco === "ok"
            ? null
            : rezulto.speco === "nelegebla"
              ? rezulto.satz
              : NE_KONSERVITA_SATZ;
        setSatz(nova);
        return nova;
      } finally {
        setSkribas(false);
      }
    },
    [skribi],
  );
  const forgesi = useCallback(() => setSatz(null), []);
  return { skribi: skribo, satz, skribas, forgesi };
}

interface KampoProps {
  rolo: FarboRolo;
  /** What the field shows while nobody types: the node's value in the Agordo. */
  teksto: string;
  placeholder: string;
  fokuso: boolean;
  /** Called once the field took the focus `fokuso` asked for. */
  fokusita: () => void;
  /** The text while a person types (null = the field shows `teksto` again). */
  redakti: (teksto: string | null) => void;
  /** Takes the text: Enter, or the field left with a new text. */
  preni: (teksto: string) => void;
}

/** The colour field: an Ero (`fm-kampo`) read through its native events (R-15). */
function Kampo({ rolo, teksto, placeholder, fokuso, fokusita, redakti, preni }: KampoProps) {
  const ref = useRef<HTMLElement>(null);
  const redaktiRef = useRef(redakti);
  const preniRef = useRef(preni);
  redaktiRef.current = redakti;
  preniRef.current = preni;

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const enigo = () => redaktiRef.current(tekstoDe(el));
    const sxangxo = () => preniRef.current(tekstoDe(el));
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter") return;
      evento.preventDefault();
      preniRef.current(tekstoDe(el));
    };
    el.addEventListener("input", enigo);
    el.addEventListener("change", sxangxo);
    el.addEventListener("keydown", klavo);
    return () => {
      el.removeEventListener("input", enigo);
      el.removeEventListener("change", sxangxo);
      el.removeEventListener("keydown", klavo);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el !== null && el.getAttribute("value") !== teksto) el.setAttribute("value", teksto);
  }, [teksto]);

  useEffect(() => {
    if (!fokuso) return;
    // A node new on the canvas stays hidden until React Flow has measured it, and a hidden field
    // takes no focus: try again on the next frames, a few at most.
    let kadro = 0;
    let provoj = 0;
    const provi = () => {
      const el = ref.current;
      el?.focus();
      if (el?.matches(":focus-within") || ++provoj >= 20) fokusita();
      else kadro = requestAnimationFrame(provi);
    };
    kadro = requestAnimationFrame(provi);
    return () => cancelAnimationFrame(kadro);
  }, [fokuso, fokusita]);

  return (
    <fm-kampo
      ref={ref}
      className={NODRAG}
      size="small"
      aria-label={`Farbwert ${ROLO_ETIKEDOJ[rolo]}`}
      placeholder={placeholder}
      autocomplete="off"
      spellCheck={false}
      data-nr-farbo-kampo={rolo}
    />
  );
}

/** The native colour picker of the start page, under a calm label „Farbwähler“; writes on `change`. */
function Elektilo({
  rolo,
  hex,
  preni,
}: {
  rolo: FarboRolo;
  hex: string;
  preni: (hex: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preniRef = useRef(preni);
  preniRef.current = preni;
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const sxangxo = () => preniRef.current(el.value.toLowerCase());
    el.addEventListener("change", sxangxo);
    return () => el.removeEventListener("change", sxangxo);
  }, []);
  useEffect(() => {
    const el = ref.current;
    const valoro = elektiloValoro(hex);
    if (el !== null && valoro !== undefined && el.value !== valoro) el.value = valoro;
  }, [hex]);
  return (
    <label className={`nr-g-farbo-waehler ${NODRAG}`}>
      Farbwähler
      <input
        ref={ref}
        type="color"
        className={NODRAG}
        aria-label={`Farbwähler ${ROLO_ETIKEDOJ[rolo]}`}
        data-nr-farbo-elektilo={rolo}
      />
    </label>
  );
}

/** Primär, Akzent and the Funktionsfarben: a value in the Agordo, written as text or picked. */
function KoloroNodo({ nodo, sitzung }: { nodo: BildoFarbo; sitzung: boolean }) {
  const { abgehaengt, fokusPor, fokusFarita, forigi } = useGestalten();
  const { skribi, satz, skribas, forgesi } = useSkribo(nodo.id);
  const rolo = nodo.rolo as Exclude<FarboRolo, "neutral">;
  const kompakta = STATUS_ROLOJ.includes(rolo);
  const lose = abgehaengt(nodo.id);
  const leer = nodo.stato === "leer";
  const wert = nodo.wert ?? "";
  // `null` = nobody typed: the field shows the value of the current Bildo.
  const [redaktita, setRedaktita] = useState<string | null>(null);
  /** The last text sent, so Enter and the blur after it write once. */
  const sendita = useRef<string | null>(null);
  const [fokuso, setFokuso] = useState(false);

  useEffect(() => {
    if (fokusPor === nodo.id) setFokuso(true);
  }, [fokusPor, nodo.id]);
  const fokusita = useCallback(() => {
    setFokuso(false);
    if (fokusPor === nodo.id) fokusFarita();
  }, [fokusPor, fokusFarita, nodo.id]);

  const redakti = useCallback(
    (teksto: string | null) => {
      setRedaktita(teksto);
      sendita.current = null;
      forgesi();
    },
    [forgesi],
  );

  const skribiWert = async (valoro: string | null) => {
    const respondo = await skribi({ farbe: { rolle: rolo, wert: valoro } });
    if (respondo === null) setRedaktita(null);
  };

  // A Funktionsfarbe without a value leaves the canvas. If it came from „+ Knoten“, the session
  // still holds it (hidden while the Bildo carries the node) and would bring it back empty once the
  // value is gone: `forigi` drops that entry first (it does nothing for a node of the Bildo alone).
  const forigiValoron = () => {
    if (kompakta) forigi(nodo.id);
    void skribiWert(null);
  };

  const preni = (teksto: string) => {
    const t = teksto.trim();
    if (skribas || sendita.current === t) return;
    if (normala(t) === normala(wert)) {
      setRedaktita(null);
      forgesi();
      return;
    }
    sendita.current = t;
    // An empty field removes Akzent and a Funktionsfarbe; Primär keeps its value (it needs one).
    if (t === "") {
      if (rolo === "primaer") {
        setRedaktita(null);
        forgesi();
        return;
      }
      if (sitzung) {
        setRedaktita(null);
        return;
      }
      if (kompakta) forigiValoron();
      else void skribiWert(null);
      return;
    }
    void skribiWert(t);
  };

  const elekti = (hex: string) => {
    setRedaktita(hex);
    sendita.current = null;
    forgesi();
    preni(hex);
  };

  // „↺“ (Funktionsfarbe): back to the derivation – the value goes, and with it the node.
  const zurueck = () => {
    if (skribas) return;
    if (sitzung && nodo.wert === undefined) {
      forigi(nodo.id);
      return;
    }
    forigiValoron();
  };

  const marko = lose ? "abgehängt" : leer && kompakta ? "abgeleitet" : MARKOJ[nodo.stato];
  const supro = kompakta ? FARBO_ANSCHLUSS_SUPRO.kompakta : FARBO_ANSCHLUSS_SUPRO.granda;
  const etikedo = ROLO_ETIKEDOJ[rolo];
  const placeholder = leer && kompakta && nodo.hex !== "" ? nodo.hex : "#RRGGBB";

  const kampo = (
    <Kampo
      rolo={rolo}
      teksto={redaktita ?? wert}
      placeholder={placeholder}
      fokuso={fokuso}
      fokusita={fokusita}
      redakti={redakti}
      preni={preni}
    />
  );
  const elektilo = <Elektilo rolo={rolo} hex={nodo.hex} preni={elekti} />;

  return (
    <NodoSxelo
      id={nodo.id}
      ringo={nodo.hex}
      leer={leer}
      abgehaengt={lose}
      style={{ "--nr-g-farbo": nodo.hex } as CSSProperties}
    >
      <NodoKapo signo={{ art: "farbo", hex: nodo.hex, plena: true }} nomo={`Farbe · ${etikedo}`}>
        <Etikedo>{marko}</Etikedo>
      </NodoKapo>
      <div className="nr-g-farbo-korpo" data-nr-skribas={skribas ? "" : undefined}>
        {kompakta ? null : (
          <div className="nr-g-farbo-feld" data-nr-farbo-feld={rolo}>
            {rolo === "akzent" && leer ? (
              <fm-butono
                className={NODRAG}
                size="small"
                emphasis="low"
                data-nr-akzent-setzen=""
                onClick={() => setFokuso(true)}
              >
                Akzent setzen
              </fm-butono>
            ) : null}
          </div>
        )}
        <div className="nr-g-farbo-linio">
          {kompakta ? <span className="nr-g-farbo-klein" aria-hidden="true" /> : null}
          {kampo}
          {elektilo}
          {rolo === "akzent" && !leer ? (
            <fm-butono
              className={`${NODRAG} nr-g-farbo-fino`}
              size="small"
              emphasis="low"
              label="Akzent entfernen"
              title="Akzent entfernen"
              data-nr-farbo-forigi="akzent"
              onClick={() => {
                if (!skribas) void skribiWert(null);
              }}
            >
              ×
            </fm-butono>
          ) : null}
          {kompakta ? (
            <fm-butono
              className={`${NODRAG} nr-g-farbo-fino`}
              size="small"
              emphasis="low"
              label={`${etikedo}: zurück zur Ableitung`}
              title="zurück zur Ableitung"
              data-nr-farbo-zurueck={rolo}
              onClick={zurueck}
            >
              ↺
            </fm-butono>
          ) : null}
        </div>
        {satz === null ? null : (
          <p className="nr-g-farbo-satz" aria-live="polite" data-nr-farbo-satz={rolo}>
            {satz}
          </p>
        )}
      </div>
      <Anschluss port={`${nodo.id}.en`} supro={supro} />
      <Anschluss port={`${nodo.id}.el`} supro={supro} hex={nodo.hex} />
    </NodoSxelo>
  );
}

/** The slider „Tönung“: an Ero (`fm-glitilo`); `input` while dragged, `change` when it rests. */
function Glitilo({
  valoro,
  movi,
  preni,
}: {
  valoro: number;
  movi: (valoro: number) => void;
  preni: (valoro: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const moviRef = useRef(movi);
  const preniRef = useRef(preni);
  moviRef.current = movi;
  preniRef.current = preni;
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const legi = (): number | undefined => {
      const v: unknown = (el as HTMLElement & { value?: unknown }).value;
      const n = Number(
        typeof v === "number" || typeof v === "string" ? v : el.getAttribute("value"),
      );
      return Number.isFinite(n) ? n : undefined;
    };
    const enigo = () => {
      const n = legi();
      if (n !== undefined) moviRef.current(n);
    };
    const sxangxo = () => {
      const n = legi();
      if (n !== undefined) preniRef.current(n);
    };
    el.addEventListener("input", enigo);
    el.addEventListener("change", sxangxo);
    return () => {
      el.removeEventListener("input", enigo);
      el.removeEventListener("change", sxangxo);
    };
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (el !== null && el.getAttribute("value") !== String(valoro))
      el.setAttribute("value", String(valoro));
  }, [valoro]);
  return (
    <fm-glitilo
      ref={ref}
      className={NODRAG}
      min={0}
      max={1}
      step={0.01}
      aria-label="Tönung"
      readout="none"
      data-nr-toenung=""
    />
  );
}

/** Neutral: the swatch of the derived neutral step 100 and the Tönung, its only field (E-5, B-1). */
function NeutralNodo({ nodo }: { nodo: BildoFarbo }) {
  const { abgehaengt } = useGestalten();
  const { skribi, satz, skribas } = useSkribo(nodo.id);
  const lose = abgehaengt(nodo.id);
  const toenung = nodo.toenung ?? 0;
  // While the thumb moves, the head shows its value; it writes when the thumb rests.
  const [movata, setMovata] = useState<number | null>(null);
  const preni = (valoro: number) => {
    const ronda = Math.round(valoro * 100) / 100;
    if (ronda === toenung) {
      setMovata(null);
      return;
    }
    setMovata(ronda);
    void skribi({ toenung: ronda }).then(() => setMovata(null));
  };
  const montrata = movata ?? toenung;
  return (
    <NodoSxelo
      id={nodo.id}
      ringo={nodo.hex}
      abgehaengt={lose}
      style={{ "--nr-g-farbo": nodo.hex } as CSSProperties}
    >
      <NodoKapo signo={{ art: "mezuro", plena: true }} nomo="Farbe · Neutral">
        <Etikedo>{lose ? "abgehängt" : toenungTeksto(montrata)}</Etikedo>
      </NodoKapo>
      <div className="nr-g-farbo-korpo" data-nr-skribas={skribas ? "" : undefined}>
        <div className="nr-g-farbo-feld" data-nr-farbo-feld="neutral" />
        <div className="nr-g-farbo-linio">
          <span className="nr-g-farbo-etikedo">Tönung</span>
          <Glitilo
            valoro={montrata}
            movi={(n) => setMovata(Math.round(n * 100) / 100)}
            preni={preni}
          />
        </div>
        <p className="nr-g-farbo-hinweis" data-nr-neutral-hinweis="">
          Eine bestimmte Neutralfarbe setzt du in der Palette.
        </p>
        {satz === null ? null : (
          <p className="nr-g-farbo-satz" aria-live="polite" data-nr-farbo-satz="neutral">
            {satz}
          </p>
        )}
      </div>
      <Anschluss port={`${nodo.id}.en`} supro={FARBO_ANSCHLUSS_SUPRO.granda} />
      <Anschluss port={`${nodo.id}.el`} supro={FARBO_ANSCHLUSS_SUPRO.granda} />
    </NodoSxelo>
  );
}

export function FarboNodo({ data }: NodeProps<FarboFlowNodo>) {
  useStilo("farbo", STILO);
  const { nodo, sitzung } = data;
  if (nodo.rolo === "neutral") return <NeutralNodo nodo={nodo} />;
  return <KoloroNodo nodo={nodo} sitzung={sitzung} />;
}
