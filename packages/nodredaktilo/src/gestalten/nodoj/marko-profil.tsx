// Spec 058 (MP-2c, T7, MAW-4.1, product spec E level 2, US-6, US-7, mockup
// `marken-knoten-option-b.html` „Tafel“): the Markenprofil in the Marke node, below the overview
// (`MarkoUebersicht`). It reads the shell's context only (no props):
//   - after an evaluation, condensed: „Markenprofil“ with a small „veraltet“ when an input changed
//     (taking over the own proposal does not count), the Kernsatz with the Charakter words, the
//     three Leitgedanken, what fits and what rubs (a calm hint, never an error; the first of each,
//     the rest in the side panel), and the „Gestaltungsvorschlag“: Primär, Akzent, Neutral and the
//     font pair, each with its reason and „übernehmen“ – or a calm „übernommen“ while the node holds
//     the proposed value. A partly unreadable answer says so calmly (KI_TEILWEISE_SATZ).
//   - the foot: „Marke auswerten“ (then „Neu auswerten“) through `KiKnopo` with the price before
//     and after, calmly disabled without a model or without any input with content; beside it
//     „Vorschlag übernehmen“ (every part not taken over yet) and the line after a takeover.
// The takeover itself (one Stand before the first one, then one write per part) lives in
// `profil-datumoj.ts`, shared with the side panel. „Entwurf · ungeprüft“ stays in the overview's
// name tile. No red, no rule name, no count.
//
// Marks for scripts: `[data-nr-ki-knopo=profil]` (KiKnopo), `[data-nr-profil]` with
// `[data-nr-profil-teil=kernsatz|leitgedanken|charakter|passt|reibt|vorschlag]`,
// `[data-nr-vorschlag-teil=primaer|akzent|neutral|schrift]` with `[data-nr-uebernehmen]` or
// `[data-nr-uebernommen]`, `[data-nr-vorschlag-satz]` (a part's sentence), `[data-nr-vorschlag-alle]`,
// `[data-nr-veraltet]`, `[data-nr-ki-teilweise]`, `[data-nr-profil-linio]`. The side panel repeats the
// part marks inside `aside[data-nr-flanko="marko"]`; scripts scope by `[data-nr-nodo=marko]`.

import {
  GESTALTUNGSVORSCHLAG,
  KEINE_EINGABE_SATZ,
  KI_TEILWEISE_SATZ,
  MARKE_AUSWERTEN,
  type Profil,
  UEBERNEHMEN,
  UEBERNOMMEN,
  VERALTET,
  VORSCHLAG_UEBERNEHMEN,
  type VorschlagTeil,
} from "@fundamento/metiejo/gestalten";
import { type CSSProperties, useEffect } from "react";
import { KiKnopo } from "../ki-knopo.js";
import { useGestalten } from "../kunteksto.js";
import {
  NEU_AUSWERTEN,
  type ProfilValoro,
  profilSatzojForigi,
  TEIL_ETIKEDOJ,
  useFamilie,
  useProfil,
} from "../profil-datumoj.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "../roloj.js";
import { tiparoCssSxargi } from "../tiparo-datumoj.js";

export const MARKENPROFIL = "Markenprofil";
export const KERNSATZ = "Kernsatz";
export const LEITGEDANKEN = "Leitgedanken";
export const PASST_ZUSAMMEN = "Passt zusammen";
export const REIBT_SICH = "Reibt sich";

const STILO = `
.nr-g-profil { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.nr-g-profil-tafel {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--fm-spacing-medium);
}
.nr-g-profil-s3 { grid-column: span 3; }
.nr-g-profil-kopo {
  grid-column: span 6;
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-medium);
  padding: var(--fm-spacing-small) var(--fm-spacing-small) 0;
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-kopo::after {
  content: "";
  flex: 1;
  order: 1;
  block-size: var(--fm-border-width-default);
  background: ${ROLOJ.linio};
}
.nr-g-profil-kopo > [data-nr-veraltet] { order: 2; }
.nr-g-profil-veraltet {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-spacing-xsmall);
  font-family: var(--fm-typography-caption-font-family);
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-regular);
  letter-spacing: 0;
  text-transform: none;
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-veraltet::before {
  content: "";
  inline-size: var(--fm-spacing-small);
  block-size: var(--fm-spacing-small);
  border-radius: var(--fm-radius-full);
  background: ${ROLOJ.mallauta};
}
.nr-g-profil-satz {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-tafel > .nr-g-profil-satz { grid-column: span 6; padding-inline: var(--fm-spacing-small); }
.nr-g-profil-kernsatz {
  margin: 0;
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-headline-4-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: var(--fm-typography-kicker-line-height);
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nr-g-profil-gedanken {
  grid-column: span 6;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--fm-spacing-medium);
}
.nr-g-profil-gedanke i {
  font-family: var(--fm-font-family-code);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  font-style: normal;
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-gedanke b {
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-body-1-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: var(--fm-typography-caption-line-height);
}
.nr-g-profil-gedanke span,
.nr-g-profil-reibung p {
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nr-g-profil-gedanke span { color: ${ROLOJ.mallauta}; }
.nr-g-profil-reibung p {
  margin: 0;
  padding-inline-start: var(--fm-spacing-medium);
  border-inline-start: var(--fm-border-width-strong) var(--fm-stroke-solid) ${ROLOJ.linioForta};
}
.nr-g-profil-wahl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--fm-spacing-small);
}
.nr-g-profil-wahl[data-nr-vertikala] { grid-template-columns: minmax(0, 1fr); }
/* In the side panel a part is a row: a small swatch beside its name, reason and button. */
.nr-g-profil-wahl[data-nr-vertikala] .nr-g-profil-teil {
  display: grid;
  grid-template-columns: calc(var(--fm-size-control-large) * 1.5) minmax(0, 1fr);
  column-gap: var(--fm-spacing-medium);
  align-items: start;
}
.nr-g-profil-wahl[data-nr-vertikala] .nr-g-profil-teil > :not(.nr-g-profil-muster) { grid-column: 2; }
.nr-g-profil-wahl[data-nr-vertikala] .nr-g-profil-muster { grid-row: 1 / span 4; }
.nr-g-profil-teil {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--fm-spacing-xsmall);
  min-inline-size: 0;
  padding: var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.nodo};
}
.nr-g-profil-muster {
  display: grid;
  place-items: center;
  block-size: var(--fm-size-control-large);
  border-radius: var(--fm-radius-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  background: var(--nr-g-profil-farbo, ${ROLOJ.pinto});
  font-size: var(--fm-typography-headline-4-font-size);
  line-height: 1;
}
.nr-g-profil-muster > b { font-family: var(--nr-g-profil-display, var(--fm-font-family-display)); font-weight: var(--fm-font-weight-semibold); }
.nr-g-profil-muster > em {
  font-family: var(--nr-g-profil-body, var(--fm-font-family-body));
  font-size: var(--fm-typography-body-1-font-size);
  font-style: normal;
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-muster[data-nr-schrift-muster] { display: flex; align-items: baseline; justify-content: center; gap: var(--fm-spacing-small); }
.nr-g-profil-teil > b {
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-semibold);
}
.nr-g-profil-teil > b code {
  display: block;
  font-family: var(--fm-font-family-code);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  font-weight: var(--fm-font-weight-regular);
  color: ${ROLOJ.mallauta};
  overflow-wrap: anywhere;
}
.nr-g-profil-grund {
  flex: 1;
  font-size: calc(var(--fm-typography-caption-font-size) * 0.95);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-profil-wahl:not([data-nr-vertikala]) .nr-g-profil-grund {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nr-g-profil-teil > fm-butono { align-self: flex-start; }
.nr-g-profil-uebernommen {
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
}
.nr-g-profil-fuss {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--fm-spacing-medium);
  padding-inline: var(--fm-spacing-small);
}
.nr-g-profil-fuss > .nr-g-ki-knopo { flex: 1 1 auto; min-inline-size: 0; }
.nr-g-profil-dekstre {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--fm-spacing-xsmall);
  margin-inline-start: auto;
  max-inline-size: 50%;
  text-align: end;
}
`;

/** The rules of the profile, shared with the side panel (`flanko.tsx`). */
export function useProfilStilo(): void {
  useStilo("marko-profil", STILO);
}

/** „01“, „02“, „03“. */
const numeroDe = (i: number): string => String(i + 1).padStart(2, "0");

/** The swatch or the „Aa“ of a part of the proposal. */
function Muster({
  teil,
  vorschlag,
}: {
  teil: VorschlagTeil;
  vorschlag: NonNullable<Profil["vorschlag"]>;
}) {
  const s = vorschlag.schrift;
  const display = useFamilie(teil === "schrift" ? s?.display : undefined);
  const body = useFamilie(teil === "schrift" ? s?.body : undefined);
  // The catalog fonts' rules, once per page (shared with the node Schrift and the overview).
  useEffect(() => {
    if (teil !== "schrift" || s === undefined) return;
    void tiparoCssSxargi(s.display);
    void tiparoCssSxargi(s.body);
  }, [teil, s]);
  if (teil === "schrift") {
    const stilo = {
      ...(display === undefined
        ? {}
        : { "--nr-g-profil-display": `${JSON.stringify(display)}, var(--fm-font-family-display)` }),
      ...(body === undefined
        ? {}
        : { "--nr-g-profil-body": `${JSON.stringify(body)}, var(--fm-font-family-body)` }),
    } as CSSProperties;
    return (
      <span
        className="nr-g-profil-muster"
        style={stilo}
        data-nr-schrift-muster=""
        aria-hidden="true"
      >
        <b>Aa</b>
        <em>Aa</em>
      </span>
    );
  }
  const hex = vorschlag[teil]?.hex;
  return (
    <span
      className="nr-g-profil-muster"
      style={(hex === undefined ? {} : { "--nr-g-profil-farbo": hex }) as CSSProperties}
      aria-hidden="true"
    />
  );
}

/** What the part names: the hex value, or the two families of the pair. */
function TeilWert({
  teil,
  vorschlag,
}: {
  teil: VorschlagTeil;
  vorschlag: NonNullable<Profil["vorschlag"]>;
}) {
  const s = vorschlag.schrift;
  const display = useFamilie(teil === "schrift" ? s?.display : undefined);
  const body = useFamilie(teil === "schrift" ? s?.body : undefined);
  if (teil === "schrift")
    return <code>{[display, body].filter((f) => f !== undefined).join(" · ")}</code>;
  return <code>{vorschlag[teil]?.hex}</code>;
}

/**
 * The parts of the Gestaltungsvorschlag, each with its reason and „übernehmen“ / „übernommen“ and
 * the calm sentence of a refused write. `vertikala`: one under the other, reasons in full (side
 * panel); else four columns with reasons cut (node).
 */
export function VorschlagTeiloj({
  p,
  vertikala = false,
}: {
  p: ProfilValoro;
  vertikala?: boolean;
}) {
  const vorschlag = p.profil?.vorschlag;
  if (vorschlag === undefined || p.teile.length === 0) return null;
  const klaso = vertikala ? undefined : `${NODRAG} ${NOPAN}`;
  return (
    <div className="nr-g-profil-wahl" data-nr-vertikala={vertikala ? "" : undefined}>
      {p.teile.map((teil) => {
        const grund = teil === "schrift" ? vorschlag.schrift?.grund : vorschlag[teil]?.grund;
        const satz = p.satz(teil);
        return (
          <div key={teil} className="nr-g-profil-teil" data-nr-vorschlag-teil={teil}>
            <Muster teil={teil} vorschlag={vorschlag} />
            <b>
              {TEIL_ETIKEDOJ[teil]}
              <TeilWert teil={teil} vorschlag={vorschlag} />
            </b>
            {grund === undefined || grund === "" ? null : (
              <span className="nr-g-profil-grund" title={vertikala ? undefined : grund}>
                {grund}
              </span>
            )}
            {p.uebernommen(teil) ? (
              <span className="nr-g-profil-uebernommen" data-nr-uebernommen="">
                {UEBERNOMMEN}
              </span>
            ) : (
              <fm-butono
                className={klaso}
                size="small"
                emphasis="low"
                disabled={p.okupata}
                data-nr-uebernehmen=""
                onClick={() => void p.uebernehmen([teil])}
              >
                {UEBERNEHMEN}
              </fm-butono>
            )}
            {satz === undefined ? null : (
              <p className="nr-g-profil-satz" data-nr-vorschlag-satz="" aria-live="polite">
                {satz}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The small grey „veraltet“ with its dot. */
export function Veraltet() {
  return (
    <span className="nr-g-profil-veraltet" data-nr-veraltet="" title={VERALTET}>
      {VERALTET}
    </span>
  );
}

/** The Markenprofil in the Marke node (product spec E level 2). */
export function MarkoProfil() {
  useProfilStilo();
  const { inhaltMeti } = useGestalten();
  const p = useProfil();
  const { profil } = p;
  const leitgedanken = profil?.leitgedanken ?? [];
  const charakter = profil?.charakter ?? [];
  const passt = profil?.passt ?? [];
  const reibt = profil?.reibt ?? [];
  const teilweise = profil?.verworfen !== undefined && profil.verworfen.length > 0;
  const reibungKlaso = passt.length > 0 && reibt.length > 0 ? "nr-g-profil-s3" : "nr-g-marko-s6";

  return (
    <div className="nr-g-profil">
      {profil === undefined ? null : (
        <div className="nr-g-profil-tafel" data-nr-profil="">
          <div className="nr-g-profil-kopo">
            <span>{MARKENPROFIL}</span>
            {p.alt ? <Veraltet /> : null}
          </div>
          {teilweise ? (
            <p className="nr-g-profil-satz" data-nr-ki-teilweise="">
              {KI_TEILWEISE_SATZ}
            </p>
          ) : null}
          {profil.kernsatz === undefined && charakter.length === 0 ? null : (
            <div className="nr-g-marko-kachel nr-g-marko-s6">
              <small>{KERNSATZ}</small>
              {profil.kernsatz === undefined ? null : (
                <p className="nr-g-profil-kernsatz" data-nr-profil-teil="kernsatz">
                  {profil.kernsatz}
                </p>
              )}
              {charakter.length === 0 ? null : (
                <span className="nr-g-marko-pillen" data-nr-profil-teil="charakter">
                  {charakter.map((wort, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
                    <span key={i}>{wort}</span>
                  ))}
                </span>
              )}
            </div>
          )}
          {leitgedanken.length === 0 ? null : (
            <div className="nr-g-profil-gedanken" data-nr-profil-teil="leitgedanken">
              {leitgedanken.map((g, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
                  key={i}
                  className="nr-g-marko-kachel nr-g-profil-gedanke"
                >
                  <i>{numeroDe(i)}</i>
                  <b>{g.titel}</b>
                  <span title={g.text}>{g.text}</span>
                </div>
              ))}
            </div>
          )}
          {passt.length === 0 ? null : (
            <div
              className={`nr-g-marko-kachel nr-g-profil-reibung ${reibungKlaso}`}
              data-nr-profil-teil="passt"
            >
              <small>{PASST_ZUSAMMEN}</small>
              <p title={passt.join("\n")}>{passt[0]}</p>
            </div>
          )}
          {reibt.length === 0 ? null : (
            <div
              className={`nr-g-marko-kachel nr-g-profil-reibung ${reibungKlaso}`}
              data-nr-profil-teil="reibt"
            >
              <small>{REIBT_SICH}</small>
              <p title={reibt.join("\n")}>{reibt[0]}</p>
            </div>
          )}
          {p.teile.length === 0 ? null : (
            <div className="nr-g-marko-kachel nr-g-marko-s6" data-nr-profil-teil="vorschlag">
              <small>{GESTALTUNGSVORSCHLAG}</small>
              <VorschlagTeiloj p={p} />
            </div>
          )}
        </div>
      )}
      <div className="nr-g-profil-fuss">
        <KiKnopo<{ profil: Profil }>
          zweck="profil"
          etikedo={profil === undefined ? MARKE_AUSWERTEN : NEU_AUSWERTEN}
          kosto={profil?.kosto}
          malsxaltitaSatz={p.leer ? KEINE_EINGABE_SATZ : undefined}
          sxlosilo={profil?.abdruck}
          onRezulto={(r) => {
            profilSatzojForigi();
            inhaltMeti("marko", { profil: r.profil }, true);
          }}
        />
        {p.teile.length === 0 ? null : (
          <span className="nr-g-profil-dekstre">
            <fm-butono
              className={`${NODRAG} ${NOPAN}`}
              size="small"
              emphasis="medium"
              disabled={p.okupata || p.offen.length === 0}
              data-nr-vorschlag-alle=""
              onClick={() => void p.uebernehmen(p.offen)}
            >
              {VORSCHLAG_UEBERNEHMEN}
            </fm-butono>
            {p.linio === null ? null : (
              <span className="nr-g-profil-satz" data-nr-profil-linio="" aria-live="polite">
                {p.linio}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
