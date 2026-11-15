// Spec 054 (MP-1, T5, MPFG-3.2): the node Palette – the place where single steps are set freely and
// separately per scheme, with the Basis visible (Fluss C, E-14, AK-11, AK-24, AK-25). Seven labelled
// rows in the Bildo's order, each with its own input port `paletro.en.<rolo>` (Farbe; Neutral: Maß)
// and its strip of steps; the output `paletro.el` (Marke).
//
// A row fed by a colour node shows a small swatch in that node's colour and „Basis 700/600“ at its
// label, and exactly one framed step: the Basis the derivation names (`Vico.basis`), never the
// mockup's guess. A step set by hand carries a pin (top = light, bottom = dark); a step whose dark
// value differs is split (top light, bottom dark). A click on a step opens the field under the row
// (`stufo-kampo.tsx`); Esc or a pointer outside closes it. When the derivation fails, the last good
// palette stays with the calm sentence. Nothing here judges: no rule, no count, no red.
//
// A port inside a row is placed relative to that row: the row is positioned and spans the node's
// full width (MPFG-2.2 convention, port centre at 30 px). Self-contained: its rules live here.

import {
  ABLEITUNG_FEHLT_SATZ,
  type FarboRolo,
  ROLO_ETIKEDOJ,
  STATUS_ROLOJ,
  type Stufo,
  type Vico,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { type PaletroFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, ROLOJ, useStilo } from "../roloj.js";
import { Etikedo, NodoKapo, NodoSxelo } from "../sxelo.js";
import { StufoKampo } from "./stufo-kampo.js";

const STILO = `
.nr-g-paletro-vicoj { padding-block-start: var(--fm-spacing-medium); }
.nr-g-paletro-vico {
  position: relative;
  padding: 0 calc(var(--fm-spacing-medium) + var(--fm-spacing-small)) var(--fm-spacing-medium);
}
.nr-g-paletro-etikedo {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  block-size: var(--fm-size-icon-small);
  margin-block-end: var(--fm-spacing-xsmall);
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
}
.nr-g-paletro-etikedo b { font-weight: var(--fm-font-weight-medium); color: ${ROLOJ.teksto}; }
.nr-g-paletro-etikedo > i {
  flex: none;
  inline-size: var(--fm-spacing-medium);
  block-size: var(--fm-spacing-medium);
  border-radius: var(--fm-radius-small);
  background: var(--nr-g-fonto);
  box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.linioForta};
}
.nr-g-paletro-strio { display: flex; block-size: var(--fm-size-icon-large); }
.nr-g-paletro-strio[data-nr-malplena] {
  align-items: center;
  justify-content: center;
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
.nr-g-stufo {
  position: relative;
  flex: 1;
  min-inline-size: 0;
  block-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: linear-gradient(to bottom, var(--nr-g-stufo-hell) 50%, var(--nr-g-stufo-dunkel) 50%);
}
.nr-g-stufo:first-child { border-start-start-radius: var(--fm-radius-small); border-end-start-radius: var(--fm-radius-small); }
.nr-g-stufo:last-child { border-start-end-radius: var(--fm-radius-small); border-end-end-radius: var(--fm-radius-small); }
.nr-g-stufo:hover { z-index: 1; transform: scaleY(1.3); box-shadow: 0 0 0 var(--fm-border-width-default) ${ROLOJ.teksto}; }
.nr-g-stufo:focus-visible { z-index: 2; outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.teksto}; outline-offset: var(--fm-border-width-default); }
.nr-g-stufo[data-nr-basis] { z-index: 1; box-shadow: inset 0 0 0 var(--fm-border-width-strong) ${ROLOJ.teksto}; }
.nr-g-stufo[data-nr-basis]:hover { box-shadow: inset 0 0 0 var(--fm-border-width-strong) ${ROLOJ.teksto}, 0 0 0 var(--fm-border-width-default) ${ROLOJ.teksto}; }
.nr-g-stufo[data-nr-offen] { z-index: 2; transform: scaleY(1.3); border-radius: var(--fm-radius-none); box-shadow: 0 0 0 var(--fm-border-width-strong) ${ROLOJ.teksto}; }
.nr-g-stufo[data-nr-nadel-hell]::before,
.nr-g-stufo[data-nr-nadel-dunkel]::after {
  content: "";
  position: absolute;
  inset-inline-start: 50%;
  inline-size: calc(var(--fm-spacing-small) + var(--fm-spacing-xsmall));
  block-size: calc(var(--fm-spacing-small) + var(--fm-spacing-xsmall));
  transform: translateX(-50%);
  border-radius: var(--fm-radius-full);
  background: ${ROLOJ.teksto};
  box-shadow: 0 0 0 var(--fm-border-width-strong) ${ROLOJ.nodo};
}
.nr-g-stufo[data-nr-nadel-hell]::before { inset-block-start: calc(var(--fm-spacing-small) * -1); }
.nr-g-stufo[data-nr-nadel-dunkel]::after { inset-block-end: calc(var(--fm-spacing-small) * -1); }
.nr-g-paletro-noto {
  margin: 0;
  padding: var(--fm-spacing-xsmall) calc(var(--fm-spacing-medium) + var(--fm-spacing-small)) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
@media (prefers-reduced-motion: no-preference) {
  .nr-g-stufo { transition: transform var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), box-shadow var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
}
`;

/** The input port's centre inside a row: label line plus half the strip. */
const VICO_ANSCHLUSS_SUPRO = 30;

const NOTO =
  "Jede Stufe lässt sich von Hand setzen, getrennt für hell und dunkel. Umrandet: Basis. Geteilt: oben hell, unten dunkel.";

const tonungTeksto = (toenung: number): string => toenung.toFixed(2).replace(".", ",");

/**
 * What stands after a row's name (mockup): the node's swatch and Basis, or a calm state word. The
 * neutral row names its Tönung, with an own Neutral colour as „eigene Farbe · Tönung 1,00“.
 */
function aldonajxo(vico: Vico, toenung: number, eigeneNeutral: boolean): string | null {
  if (vico.rolo === "neutral") {
    if (vico.fonto === null) return "nicht verbunden · Tönung 0";
    return `${eigeneNeutral ? "eigene Farbe · " : ""}Tönung ${tonungTeksto(toenung)}`;
  }
  if (vico.basis !== undefined && vico.fontoHex !== undefined) return null;
  if (STATUS_ROLOJ.includes(vico.rolo)) return "abgeleitet";
  // A row without steps says its state („noch keine Farbe“, „nicht verbunden“) in place of the
  // steps; the label stays quiet so the word does not stand twice.
  if (vico.stufoj.length === 0) return "";
  if (vico.fonto !== null) return "noch keine Farbe";
  return vico.rolo === "primaer" ? "nicht verbunden · Startwert" : "nicht verbunden";
}

/** The footnote's list: „Primär 500 (hell), Erfolg 300 (dunkel)“. */
function angeheftet(vicoj: readonly Vico[]): string[] {
  return vicoj.flatMap((vico) =>
    vico.stufoj.flatMap((s) => {
      const skemoj = [s.gesetzt ? "hell" : null, s.gesetztDunkel ? "dunkel" : null].filter(
        (x): x is string => x !== null,
      );
      return skemoj.length === 0 ? [] : [`${vico.etikedo} ${s.stufo} (${skemoj.join(", ")})`];
    }),
  );
}

interface Offen {
  rolo: FarboRolo;
  stufo: string;
}

interface StufoButonoProps {
  vico: Vico;
  stufo: Stufo;
  offen: boolean;
  elekti: () => void;
}

function StufoButono({ vico, stufo, offen, elekti }: StufoButonoProps) {
  const basis = vico.basis === stufo.stufo;
  const dunkel = stufo.hexDunkel ?? stufo.hex;
  const geteilt = stufo.hexDunkel !== undefined;
  const teksto = `${vico.etikedo} ${stufo.stufo}, hell ${stufo.hex}${geteilt ? `, dunkel ${dunkel}` : ""}${basis ? ", Basis" : ""}${stufo.gesetzt || stufo.gesetztDunkel ? ", von Hand gesetzt" : ""}`;
  return (
    <button
      type="button"
      className={`nr-g-stufo ${NODRAG}`}
      aria-label={teksto}
      aria-expanded={offen}
      title={`${vico.etikedo} ${stufo.stufo} · hell ${stufo.hex}${geteilt ? ` · dunkel ${dunkel}` : ""}${basis ? " · Basis" : ""}`}
      data-nr-stufo={stufo.tokeno}
      data-nr-basis={basis ? "" : undefined}
      data-nr-geteilt={geteilt ? "" : undefined}
      data-nr-nadel-hell={stufo.gesetzt ? "" : undefined}
      data-nr-nadel-dunkel={stufo.gesetztDunkel ? "" : undefined}
      data-nr-offen={offen ? "" : undefined}
      style={
        {
          "--nr-g-stufo-hell": stufo.hex,
          "--nr-g-stufo-dunkel": dunkel,
        } as CSSProperties
      }
      onClick={elekti}
    />
  );
}

export function PaletroNodo({ data }: NodeProps<PaletroFlowNodo>) {
  useStilo("paletro", STILO);
  const { bildo, hervorheben } = useGestalten();
  const { nodo } = data;
  const ableitungOk = bildo.ableitung === "ok";

  // The last good palette stays while the derivation cannot show the current state.
  const [lasta, setLasta] = useState(nodo.vicoj);
  if (ableitungOk && lasta !== nodo.vicoj) setLasta(nodo.vicoj);
  const vicoj = ableitungOk ? nodo.vicoj : lasta;

  const neutral = bildo.nodoj.find((n) => n.id === "farbo-neutral");
  const toenung = neutral?.speco === "farbo" ? (neutral.toenung ?? 0) : 0;
  const eigeneNeutral = neutral?.speco === "farbo" && neutral.herkunft === "eigene";

  const [offen, setOffen] = useState<Offen | null>(null);
  const fermi = useCallback(() => setOffen(null), []);

  const offenaVico = offen === null ? undefined : vicoj.find((v) => v.rolo === offen.rolo);
  const offenaStufo = offenaVico?.stufoj.find((s) => s.stufo === offen?.stufo);
  const malfermita = offenaStufo !== undefined;

  // A step that left the palette (Akzent removed, a row detached) closes its field.
  useEffect(() => {
    if (offen !== null && !malfermita) setOffen(null);
  }, [offen, malfermita]);

  // While the field is open the node lies above its neighbours; Esc or a pointer outside closes.
  useEffect(() => {
    if (!malfermita) return;
    hervorheben(nodo.id, true);
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") fermi();
    };
    const premo = (evento: PointerEvent) => {
      const celo = evento.target;
      if (!(celo instanceof Element)) return;
      if (celo.closest("[data-nr-stufo-kampo]") !== null) return;
      if (celo.closest("[data-nr-stufo]") !== null) return;
      fermi();
    };
    document.addEventListener("keydown", klavo);
    document.addEventListener("pointerdown", premo, true);
    return () => {
      hervorheben(nodo.id, false);
      document.removeEventListener("keydown", klavo);
      document.removeEventListener("pointerdown", premo, true);
    };
  }, [malfermita, hervorheben, nodo.id, fermi]);

  const pingloj = angeheftet(vicoj);

  return (
    <NodoSxelo id={nodo.id}>
      <NodoKapo signo={{ art: "marko" }} nomo="Palette">
        <Etikedo>abgeleitet</Etikedo>
      </NodoKapo>
      <div className="nr-g-paletro-vicoj">
        {vicoj.map((vico) => {
          const vorto = aldonajxo(vico, toenung, eigeneNeutral);
          const malferma = offen?.rolo === vico.rolo ? offen.stufo : null;
          const stufo =
            malferma === null ? undefined : vico.stufoj.find((s) => s.stufo === malferma);
          return (
            <div
              key={vico.rolo}
              className="nr-g-paletro-vico"
              data-nr-vico={vico.rolo}
              data-nr-fonto={vico.fonto ?? "-"}
              data-nr-basis={vico.basis}
            >
              <span className="nr-g-paletro-etikedo">
                <b>{vico.etikedo}</b>
                {vorto === null ? (
                  <>
                    <i
                      aria-hidden="true"
                      data-nr-vico-farbo={vico.fontoHex}
                      style={{ "--nr-g-fonto": vico.fontoHex } as CSSProperties}
                    />
                    <span data-nr-vico-basis={vico.basis}>Basis {vico.basis}</span>
                  </>
                ) : vorto === "" ? null : (
                  <span>{vorto}</span>
                )}
              </span>
              {vico.stufoj.length === 0 ? (
                <div className="nr-g-paletro-strio" data-nr-malplena="">
                  {vico.fonto === null ? "nicht verbunden" : "noch keine Farbe"}
                </div>
              ) : (
                <div className="nr-g-paletro-strio">
                  {vico.stufoj.map((s) => (
                    <StufoButono
                      key={s.stufo}
                      vico={vico}
                      stufo={s}
                      offen={malferma === s.stufo}
                      elekti={() =>
                        setOffen(malferma === s.stufo ? null : { rolo: vico.rolo, stufo: s.stufo })
                      }
                    />
                  ))}
                </div>
              )}
              {stufo === undefined ? null : (
                <StufoKampo
                  key={stufo.tokeno}
                  etikedo={vico.etikedo || ROLO_ETIKEDOJ[vico.rolo]}
                  stufo={stufo}
                  basis={vico.basis === stufo.stufo}
                  fontoHex={vico.fontoHex}
                  fermi={fermi}
                />
              )}
              <Anschluss
                port={`paletro.en.${vico.rolo}`}
                supro={VICO_ANSCHLUSS_SUPRO}
                hex={vico.fontoHex}
              />
            </div>
          );
        })}
      </div>
      {ableitungOk ? null : (
        <p className="nr-g-paletro-noto" aria-live="polite" data-nr-ableitung-fehlt="">
          {ABLEITUNG_FEHLT_SATZ}
        </p>
      )}
      <p className="nr-g-paletro-noto" data-nr-paletro-noto="">
        {NOTO}
        {pingloj.length === 0 ? "" : ` ${pingloj.length} angeheftet: ${pingloj.join(", ")}.`}
      </p>
      <Anschluss port="paletro.el" supro={54} />
    </NodoSxelo>
  );
}
