// Spec 058 (MP-2c, T4, MAW-3.2): the node „Marke · Grundlagen“ (`teksto-grundlagen`, node type
// „grundlagen“, product spec C, AK-14). One place for the brand's name and description; it stands
// on every canvas, leftmost, and cannot be removed (the shell's `forigi` ignores it).
//
// - **Name** is the display name `etikedoj.marko` of the Agordo, never the identifier or the
//   folder. While a person types, `nomoMeti` sets it in the session, so the Marke's pill and the
//   header follow at once; leaving the field or Enter writes it with `skribi({name})` (an empty
//   name, or the identifier, removes the display name on the server: pill and header show the
//   identifier). Without typing the field shows the Agordo's name (`bildo.marko.etikedo`), so an
//   older brand shows its previous display name.
// - **Beschreibung** lives in `leinwand.json` like the other texts (`inhalt.beschreibung`): set in
//   the session while typing (`konservi: false`), written when the field is left with a changed
//   text (`konservi: true`), as the text nodes of Spec 056 do. It reaches the overview and the
//   evaluation only while the edge Grundlagen → Marke is plugged (`uebersichtDe`/`eingabenDe` read
//   it that way); the name stays the display name either way.
//
// The frame (`NodoSxelo`) gives `[data-nr-nodo=teksto-grundlagen]`, the calm dashed frame while the
// description is empty and the muted body while the edge into the Marke is detached. No check, no
// count, no error tone: a write that did not go through shows the calm existing sentence.

import {
  ETIKEDOJ_058,
  GRUNDLAGEN_ELIR,
  GRUNDLAGEN_ETIKEDOJ,
  GRUNDLAGEN_HINWEIS,
  GRUNDLAGEN_ID,
  type InhaltGrundlagen,
  NE_KONSERVITA_SATZ,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { type GrundlagenFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";

const STILO = `
.nr-g-grundlagen-kampo { display: block; }
.nr-g-grundlagen-kampo > label {
  display: block;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-grundlagen-enigo {
  display: block;
  box-sizing: border-box;
  inline-size: calc(100% - var(--fm-spacing-medium) * 2);
  margin: 0 var(--fm-spacing-medium);
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) transparent;
  border-radius: var(--fm-radius-small);
  background: transparent;
  color: ${ROLOJ.teksto};
  font: inherit;
  resize: none;
  overflow: hidden;
  cursor: text;
}
.nr-g-grundlagen-enigo[data-nr-grundlagen-name] { font-weight: var(--fm-font-weight-semibold); }
.nr-g-grundlagen-enigo:hover { background: ${ROLOJ.pinto}; }
.nr-g-grundlagen-enigo:focus {
  outline: none;
  background: ${ROLOJ.scenejo};
  border-color: ${ROLOJ.linioForta};
  box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.ringo};
}
.nr-g-grundlagen-enigo::placeholder { color: ${ROLOJ.mallauta}; opacity: 1; }
.nr-g-grundlagen-satz {
  margin: 0;
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
`;

/**
 * The name: the Agordo's display name while nobody types; typing sets it in the session
 * (`nomoMeti`), leaving the field or Enter writes it (`skribi({name})`) when it changed.
 */
function NomoKampo() {
  const { bildo, marko, nomoMeti, skribi } = useGestalten();
  const kampoId = useId();
  const konservita = bildo.marko.etikedo === "" ? marko : bildo.marko.etikedo;
  // `null` = nobody types and no write is pending: the field shows the Agordo's name.
  const [entwurf, setEntwurf] = useState<string | null>(null);
  const [neKonservita, setNeKonservita] = useState(false);
  /** The name when the field took the focus: leaving it unchanged writes nothing. */
  const komenco = useRef("");
  /** Whether the name was typed since the field took the focus. */
  const tajpita = useRef(false);

  const skribiNomon = async (teksto: string): Promise<void> => {
    const rezulto = await skribi({ name: teksto });
    // On success the Bildo carries the new name already; the field shows it from there.
    if (rezulto.speco === "ok") {
      setNeKonservita(false);
      setEntwurf((nun) => (nun === teksto ? null : nun));
    } else setNeKonservita(true);
  };

  return (
    <div className="nr-g-grundlagen-kampo">
      <label htmlFor={kampoId}>{GRUNDLAGEN_ETIKEDOJ.name}</label>
      <input
        id={kampoId}
        type="text"
        className={`nr-g-grundlagen-enigo ${NODRAG} ${NOPAN}`}
        value={entwurf ?? konservita}
        placeholder={marko}
        autoComplete="off"
        spellCheck={false}
        data-nr-grundlagen-name=""
        onFocus={(evento) => {
          komenco.current = konservita;
          setEntwurf(evento.target.value);
        }}
        onChange={(evento) => {
          tajpita.current = true;
          setEntwurf(evento.target.value);
          nomoMeti(evento.target.value);
        }}
        onKeyDown={(evento) => {
          if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
          evento.preventDefault();
          evento.currentTarget.blur();
        }}
        onBlur={(evento) => {
          const teksto = evento.target.value;
          if (teksto.trim() === komenco.current.trim()) {
            // Unchanged: a name typed and typed back gives the session the Agordo's name again.
            if (tajpita.current) nomoMeti(konservita);
            tajpita.current = false;
            setEntwurf(null);
            return;
          }
          tajpita.current = false;
          void skribiNomon(teksto);
        }}
      />
      {neKonservita ? (
        <p className="nr-g-grundlagen-satz" data-nr-grundlagen-satz="">
          {NE_KONSERVITA_SATZ}
        </p>
      ) : null}
    </div>
  );
}

/** The description: a free text that grows downward, in `inhalt` like the text nodes of Spec 056. */
function BeschreibungKampo() {
  const { inhaltDe, inhaltMeti } = useGestalten();
  const ref = useRef<HTMLTextAreaElement>(null);
  const kampoId = useId();
  const konservita = inhaltDe(GRUNDLAGEN_ID)?.beschreibung ?? "";
  const [entwurf, setEntwurf] = useState<string | null>(null);
  const komenco = useRef("");
  const valoro = entwurf ?? konservita;

  const meti = (teksto: string, konservi: boolean): void => {
    const inhalt: InhaltGrundlagen = teksto.trim() === "" ? {} : { beschreibung: teksto };
    inhaltMeti(GRUNDLAGEN_ID, inhalt, konservi);
  };

  // The field grows with its text (and shrinks again); the node grows with it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null || el.value !== valoro) return;
    el.style.blockSize = "auto";
    el.style.blockSize = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [valoro]);

  return (
    <div className="nr-g-grundlagen-kampo">
      <label htmlFor={kampoId}>{GRUNDLAGEN_ETIKEDOJ.beschreibung}</label>
      <textarea
        ref={ref}
        id={kampoId}
        className={`nr-g-grundlagen-enigo ${NODRAG} ${NOPAN}`}
        rows={2}
        value={valoro}
        placeholder={GRUNDLAGEN_HINWEIS}
        data-nr-grundlagen-beschreibung=""
        onFocus={() => {
          komenco.current = konservita;
          setEntwurf(konservita);
        }}
        onChange={(evento) => {
          setEntwurf(evento.target.value);
          meti(evento.target.value, false);
        }}
        onBlur={(evento) => {
          const teksto = evento.target.value;
          setEntwurf(null);
          if (teksto.trim() !== komenco.current.trim()) meti(teksto, true);
        }}
      />
    </div>
  );
}

export function GrundlagenNodo(_props: NodeProps<GrundlagenFlowNodo>) {
  useStilo("grundlagen", STILO);
  return (
    <NodoSxelo id={GRUNDLAGEN_ID} className="nr-g-grundlagen">
      <NodoKapo signo={{ art: "teksto" }} nomo={ETIKEDOJ_058[GRUNDLAGEN_ID]} />
      <NomoKampo />
      <BeschreibungKampo />
      <Anschluss port={GRUNDLAGEN_ELIR} supro={42} />
    </NodoSxelo>
  );
}
