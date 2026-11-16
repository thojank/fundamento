// Spec 056 (MP-2a, T3, KBS-3.1): the controls the seven text nodes share – a free text that grows
// downward (a real `<textarea>`; the Eroj have no field that grows with its text, see the build
// log), a one-line field (`fm-kampo`) that takes its text on Enter or when it is left, and the „×“ of
// a pill (`fm-butono`). Every control carries `nodrag` and `nopan`, so typing, selecting and
// pressing never move the node or the canvas.
//
// Saving (product spec A): a text is set in memory while a person types (`konservi: false`, the
// Marke follows at once) and written when the field is left with a changed text (`konservi: true`:
// „gespeichert HH:MM“ and the light into the Marke).

import type { InhaltMapo } from "@fundamento/metiejo/gestalten";
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN } from "../roloj.js";

/** The text fields of the three nodes that hold only texts. */
export interface TekstoKampoj {
  "teksto-ausgangslage": "text";
  "teksto-zielgruppe": "wer" | "sorge" | "vertrauen";
  "teksto-markenkern": "zweck" | "versprechen";
}

export type KampaId = keyof TekstoKampoj;

/** The texts of such a node as a plain record (each field is a text or absent). */
type Tekstoj = Partial<Record<string, string>>;

/** The current text of a field of the value of an Ero (`fm-kampo`), or its attribute. */
export function tekstoDe(el: HTMLElement): string {
  const valoro: unknown = (el as HTMLElement & { value?: unknown }).value;
  return typeof valoro === "string" ? valoro : (el.getAttribute("value") ?? "");
}

export interface LiberaTekstoProps<I extends KampaId> {
  id: I;
  kampo: TekstoKampoj[I];
  /** The accessible name of the field (its label, or the node's title). */
  etikedo: string;
  /** The visible label above the field; absent for a node with one field. */
  montriEtikedon?: boolean;
  /** The calm help or hint in the empty field (Option A). */
  placeholder?: string | undefined;
}

/**
 * One free text of a node: shown and edited in the node, growing downward with its text. The
 * text a person types stays in the field while it has the focus (also only spaces); the node's
 * content keeps what the shared reader keeps.
 */
export function LiberaTeksto<I extends KampaId>({
  id,
  kampo,
  etikedo,
  montriEtikedon = false,
  placeholder,
}: LiberaTekstoProps<I>) {
  const { inhaltDe, inhaltMeti } = useGestalten();
  const ref = useRef<HTMLTextAreaElement>(null);
  const kampoId = useId();
  const tekstoj = (inhaltDe(id) ?? {}) as Tekstoj;
  const konservita = tekstoj[kampo] ?? "";
  // `null` = nobody types: the field shows the stored text.
  const [entwurf, setEntwurf] = useState<string | null>(null);
  /** The text when the field took the focus: leaving it unchanged writes nothing. */
  const komenco = useRef("");
  const valoro = entwurf ?? konservita;

  const meti = (teksto: string, konservi: boolean): void => {
    const nun: Tekstoj = { ...((inhaltDe(id) ?? {}) as Tekstoj) };
    if (teksto.trim() === "") delete nun[kampo];
    else nun[kampo] = teksto;
    inhaltMeti(id, nun as InhaltMapo[I], konservi);
  };

  // The field grows with its text (and shrinks again); the node grows with it.
  useLayoutEffect(() => {
    const el = ref.current;
    // Measured once the field shows this text.
    if (el === null || el.value !== valoro) return;
    el.style.blockSize = "auto";
    el.style.blockSize = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [valoro]);

  const areo = (
    <textarea
      ref={ref}
      id={kampoId}
      className={`nr-g-teksto-frei ${NODRAG} ${NOPAN}`}
      rows={1}
      value={valoro}
      placeholder={placeholder}
      aria-label={montriEtikedon ? undefined : etikedo}
      data-nr-teksto-kampo={kampo}
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
  );
  if (!montriEtikedon) return areo;
  return (
    <div className="nr-g-teksto-etikedo">
      <label htmlFor={kampoId}>{etikedo}</label>
      {areo}
    </div>
  );
}

export interface LiniaKampoProps {
  /** The text the field shows when nobody types. */
  teksto: string;
  placeholder: string;
  etikedo: string;
  /** Enter: the text is taken (and the field emptied when `malplenigi`). */
  preni?: ((teksto: string) => void) | undefined;
  /** While typing. */
  redakti?: ((teksto: string) => void) | undefined;
  /** The field left with a changed text. */
  forlasi?: ((teksto: string) => void) | undefined;
  /** Empty the field after Enter (a field that adds a pill). */
  malplenigi?: boolean;
  /** A mark for scripts. */
  marko?: string;
}

/** A one-line field: an Ero (`fm-kampo`) read through its native events, as the colour field. */
export function LiniaKampo({
  teksto,
  placeholder,
  etikedo,
  preni,
  redakti,
  forlasi,
  malplenigi = false,
  marko,
}: LiniaKampoProps) {
  const ref = useRef<HTMLElement>(null);
  const vokoj = useRef({ preni, redakti, forlasi, malplenigi });
  vokoj.current = { preni, redakti, forlasi, malplenigi };

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const enigo = () => vokoj.current.redakti?.(tekstoDe(el));
    // The native `change` of the inner input stays inside the Ero's shadow root; `focusin` and
    // `focusout` are composed, so leaving the field is read from them.
    let komenco = tekstoDe(el);
    const eniri = () => {
      komenco = tekstoDe(el);
    };
    const sxangxo = () => {
      const teksto = tekstoDe(el);
      if (teksto === komenco) return;
      komenco = teksto;
      vokoj.current.forlasi?.(teksto);
    };
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter" || evento.isComposing) return;
      const preniFn = vokoj.current.preni;
      if (preniFn === undefined) return;
      evento.preventDefault();
      preniFn(tekstoDe(el));
      if (vokoj.current.malplenigi) el.setAttribute("value", "");
    };
    el.addEventListener("input", enigo);
    el.addEventListener("focusin", eniri);
    el.addEventListener("focusout", sxangxo);
    el.addEventListener("keydown", klavo);
    return () => {
      el.removeEventListener("input", enigo);
      el.removeEventListener("focusin", eniri);
      el.removeEventListener("focusout", sxangxo);
      el.removeEventListener("keydown", klavo);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el !== null && tekstoDe(el) !== teksto) el.setAttribute("value", teksto);
  }, [teksto]);

  return (
    <fm-kampo
      ref={ref}
      className={`${NODRAG} ${NOPAN}`}
      size="small"
      aria-label={etikedo}
      placeholder={placeholder}
      autocomplete="off"
      data-nr-teksto-linio={marko}
    />
  );
}

/** The „×“ of a pill or a row: a real button, named by what it removes. */
export function ForigiButono({
  etikedo,
  forigi,
  marko,
}: {
  etikedo: string;
  forigi: () => void;
  marko?: string;
}) {
  return (
    <fm-butono
      className={`nr-g-teksto-x ${NODRAG} ${NOPAN}`}
      size="small"
      emphasis="low"
      label={etikedo}
      title={etikedo}
      data-nr-teksto-forigi={marko}
      onClick={forigi}
    >
      ×
    </fm-butono>
  );
}

/** A calm line in a node: a help, a hint, the sentence at five. */
export function MallautaLinio({ children, marko }: { children: ReactNode; marko?: string }) {
  return (
    <p className="nr-g-teksto-linio" data-nr-teksto-satz={marko}>
      {children}
    </p>
  );
}
