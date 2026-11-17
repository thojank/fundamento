// Spec 058 (MP-2c, T9, MAW-4.2, part G): the node „Layout-Beispiel“ (`layout-beispiel`, node type
// „layout“, fixed, on every canvas, in the start layout before the previews).
//
// - One image or PDF of a page whose design the person likes, by „Hochladen“ or by dropping it on
//   the node. One per brand: a new one replaces the old (the route keeps one file in
//   `materialo/layout/` and stores `{datei}` as the content itself; the node runs it inside
//   `haltigiDum` and then puts the same content into the session). „×“ removes it; its features,
//   reason and dot go, the previews' hand choices stay. A file that does not read stands calmly
//   named at the node and nothing changes.
// - Without KI: the colours of the file, as Beispiele reads them (hex, hell/dunkel, bunt/unbunt,
//   share). They also stand in the Marke's overview; they do not take part in „Farbe folgt den
//   Bildern“ (that rule reads Beispiele only).
// - With KI: „Aufbau erkennen“ through `KiKnopo` (price before and after), with the calm line „Das
//   Bild geht dafür an das Sprachmodell.“; calmly disabled without a file, for a PDF or SVG („Aufbau
//   erkennen geht nur mit einem Bild“) and for a JPG/WebP stored without a browser (the Enportilo's
//   sentence). The features stand as words, with the layout they choose and why; they flow as text
//   into „Marke auswerten“ (`eingabenDe`), without an edge of their own to the Marke.
// Contract kept (MAW-2.1): export `LayoutBeispielNodo`, the frame `NodoSxelo id={LAYOUT_ID}`
// (`[data-nr-nodo=layout-beispiel]`, dashed while it has no file), the output `LAYOUT_ELIR` on the
// right at 42 px from the first render on, content through `inhaltDe` / `inhaltMeti`, CSS through
// `useStilo("layout-beispiel", …)` with existing `--fm-*` roles only.
// Marks: `[data-nr-layout-datei]`, `[data-nr-layout-forigi]`, `[data-nr-layout-hochladen]`,
// `[data-nr-layout-farbo=<hex>]`, `[data-nr-layout-merkmale]`, `[data-nr-layout-grund]`; the button
// carries `[data-nr-ki-knopo=aufbau]` (KiKnopo). No red, no judgement.
// QA-Lauf 1 (B2): the node never grows past its maximum height of ARANGXO_058 (`altecoDe(…,
// {stufe: 58})`): the features and the model's words scroll inside (`nowheel`), whatever their length.

import { aufbauDe } from "@fundamento/metiejo/auswertung";
import {
  AUFBAU_ERKENNEN,
  altecoDe,
  BEISPIELE_ARTOJ,
  BILD_GEHT_SATZ,
  DATEI_FEHLT,
  ETIKEDOJ_058,
  FARB_ARTOJ,
  HOCHLADEN,
  type InhaltLayout,
  KI_TEILWEISE_SATZ,
  LAYOUT_ELIR,
  LAYOUT_ID,
  NE_KONSERVITA_SATZ,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { type CSSProperties, type DragEvent, useCallback, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { KiKnopo } from "../ki-knopo.js";
import { type LayoutFlowNodo, useGestalten } from "../kunteksto.js";
import {
  type AufbauRezulto,
  aufbauMalsxaltitaSatzDe,
  layoutForigi,
  layoutHochladen,
  merkmaleWorteDe,
} from "../layout-datumoj.js";
import { NODRAG, NOPAN, NOWHEEL, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";

/** What the file picker offers: the kinds of Beispiele (JPG also as .jpeg). */
const AKCEPTO = [...BEISPIELE_ARTOJ.map((art) => `.${art}`), ".jpeg"].join(",");

/** The hint in the drop zone. */
const LAYOUT_HILFE =
  "Ein Bild oder PDF einer Seite, die als Gestaltung gefällt, hierher ziehen oder hochladen. Ein neues ersetzt das alte.";

/** At most this many colours stand in the node (largest share first; a display count). */
const FARBEN_ZAHL = 5;

/** The node's maximum height (ARANGXO_058): the frame never grows past it, the features scroll. */
const HOECHSTENS = `${altecoDe(LAYOUT_ID, { stufe: 58 })}px`;

const STILO = `
.nr-g-nodo.nr-g-layout,
.nr-g-layout > section {
  display: flex;
  flex-direction: column;
  min-block-size: 0;
}
.nr-g-nodo.nr-g-layout { max-block-size: ${HOECHSTENS}; }
.nr-g-layout > section { flex: 1 1 auto; }
.nr-g-layout-zono {
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  padding: var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-medium);
}
.nr-g-layout-zono[data-nr-super] { border-color: ${ROLOJ.teksto}; background: ${ROLOJ.pinto}; }
.nr-g-layout-datei { display: flex; align-items: center; gap: var(--fm-spacing-small); }
.nr-g-layout-datei > span {
  flex: 1;
  min-inline-size: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.teksto};
}
.nr-g-layout-ruhig {
  margin: 0;
  padding-block-start: var(--fm-spacing-xsmall);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-layout-farben { margin: 0; padding: var(--fm-spacing-xsmall) 0 0; list-style: none; }
.nr-g-layout-farbo {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding-block: var(--fm-spacing-xsmall);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-layout-farbo > i {
  flex: none;
  inline-size: var(--fm-size-icon-small);
  block-size: var(--fm-size-icon-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-small);
  background: var(--nr-g-layout-farbo);
}
.nr-g-layout-farbo > code { font-family: var(--fm-font-family-code); color: ${ROLOJ.teksto}; }
.nr-g-layout-farbo > b { margin-inline-start: auto; font-weight: inherit; }
.nr-g-layout-korpo {
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) var(--fm-spacing-medium);
}
.nr-g-layout-zeile { display: flex; align-items: center; flex-wrap: wrap; gap: var(--fm-spacing-small); }
.nr-g-layout-merkmale {
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  overflow-y: auto;
  gap: var(--fm-spacing-xsmall);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.teksto};
}
.nr-g-layout-merkmale > p { margin: 0; }
.nr-g-layout-merkmale > .nr-g-layout-ruhig { padding: 0; }
.nr-g-layout-meldoj {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  list-style: none;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
@media (prefers-reduced-motion: no-preference) {
  .nr-g-layout-zono { transition: border-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), background-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
}
`;

/** „name“: sentence – how a refused file stands at the node. */
const meldoDe = (nomo: string, satz: string): string =>
  `„${nomo}“: ${/[.!?]$/.test(satz) ? satz : `${satz}.`}`;

export function LayoutBeispielNodo(_props: NodeProps<LayoutFlowNodo>) {
  useStilo("layout-beispiel", STILO);
  const { marko, inhaltDe, inhaltMeti, haltigiDum } = useGestalten();
  const inhalt = inhaltDe(LAYOUT_ID);
  const datei = inhalt?.datei;
  // The content as last set: the rendered one, or the one this node set since.
  const aktuala = useRef<InhaltLayout | undefined>(inhalt);
  aktuala.current = inhalt;
  const dosieroRef = useRef<HTMLInputElement>(null);
  const [meldo, setMeldo] = useState<string | null>(null);
  const [laboras, setLaboras] = useState(false);
  const [trenata, setTrenata] = useState(false);
  /** Whether the last answer of „Aufbau erkennen“ was partly unreadable (this session only). */
  const [teilweise, setTeilweise] = useState(false);

  const meti = useCallback(
    (nova: InhaltLayout) => {
      aktuala.current = nova;
      inhaltMeti(LAYOUT_ID, nova, true);
    },
    [inhaltMeti],
  );

  const hochladen = useCallback(
    (dosiero: File | undefined) => {
      if (dosiero === undefined || laboras) return;
      setLaboras(true);
      setMeldo(null);
      void haltigiDum(async () => {
        const rezulto = await layoutHochladen(marko, dosiero);
        if (rezulto.speco === "datei") {
          setTeilweise(false);
          meti({ datei: rezulto.datei });
        } else {
          setMeldo(
            meldoDe(
              dosiero.name,
              rezulto.speco === "nelegebla" ? rezulto.satz : NE_KONSERVITA_SATZ,
            ),
          );
        }
      }).finally(() => setLaboras(false));
    },
    [haltigiDum, laboras, marko, meti],
  );

  const forigi = useCallback(() => {
    if (laboras) return;
    setLaboras(true);
    setMeldo(null);
    void haltigiDum(async () => {
      if (await layoutForigi(marko)) {
        setTeilweise(false);
        meti({});
      } else setMeldo(NE_KONSERVITA_SATZ);
    }).finally(() => setLaboras(false));
  }, [haltigiDum, laboras, marko, meti]);

  const kunDosieroj = (evento: DragEvent): boolean => evento.dataTransfer.types.includes("Files");
  const trenadoSuper = (evento: DragEvent<HTMLElement>) => {
    if (!kunDosieroj(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "copy";
    setTrenata(true);
  };
  const forlasi = (evento: DragEvent<HTMLElement>) => {
    const al = evento.relatedTarget;
    if (!(al instanceof Node && evento.currentTarget.contains(al))) setTrenata(false);
  };
  const faligi = (evento: DragEvent<HTMLElement>) => {
    if (!kunDosieroj(evento)) return;
    evento.preventDefault();
    setTrenata(false);
    hochladen(evento.dataTransfer.files[0]);
  };

  const farben = [...(datei?.fehlt === true ? [] : (datei?.farben ?? []))]
    .sort((a, b) => b.anteil - a.anteil)
    .slice(0, FARBEN_ZAHL);
  const merkmale = inhalt?.merkmale;
  const worte = merkmaleWorteDe(merkmale);
  const auswahl = merkmale === undefined || worte.length === 0 ? undefined : aufbauDe(merkmale);

  return (
    <NodoSxelo id={LAYOUT_ID} className="nr-g-layout">
      <section
        aria-label={ETIKEDOJ_058[LAYOUT_ID]}
        onDragOver={trenadoSuper}
        onDragLeave={forlasi}
        onDrop={faligi}
        data-nr-layout-beispiel=""
      >
        <NodoKapo signo={{ art: "bildo" }} nomo={ETIKEDOJ_058[LAYOUT_ID]} />
        <div className="nr-g-layout-zono" data-nr-super={trenata ? "" : undefined}>
          {datei === undefined ? null : (
            <div className="nr-g-layout-datei" data-nr-layout-datei={datei.name}>
              <span title={datei.name}>{datei.fehlt === true ? DATEI_FEHLT : datei.name}</span>
              <fm-butono
                className={`${NODRAG} ${NOPAN}`}
                size="small"
                emphasis="low"
                label={`${datei.name} entfernen`}
                title={`${datei.name} entfernen`}
                disabled={laboras}
                data-nr-layout-forigi=""
                onClick={forigi}
              >
                ×
              </fm-butono>
            </div>
          )}
          {farben.length === 0 ? null : (
            <ul className="nr-g-layout-farben" aria-label="Farben">
              {farben.map((farbo) => (
                <li key={farbo.hex} className="nr-g-layout-farbo" data-nr-layout-farbo={farbo.hex}>
                  <i
                    aria-hidden="true"
                    style={{ "--nr-g-layout-farbo": farbo.hex } as CSSProperties}
                  />
                  <code>{farbo.hex}</code>
                  <span>{`${farbo.hell ? FARB_ARTOJ.hell : FARB_ARTOJ.dunkel} · ${
                    farbo.bunt ? FARB_ARTOJ.bunt : FARB_ARTOJ.unbunt
                  }`}</span>
                  <b>{`${Math.round(farbo.anteil)} %`}</b>
                </li>
              ))}
            </ul>
          )}
          {datei?.satz === undefined || datei.fehlt === true ? null : (
            <p className="nr-g-layout-ruhig" data-nr-layout-satz="">
              {datei.satz}
            </p>
          )}
          {datei !== undefined ? null : <p className="nr-g-layout-ruhig">{LAYOUT_HILFE}</p>}
          <div className="nr-g-layout-zeile">
            <fm-butono
              className={`${NODRAG} ${NOPAN}`}
              size="small"
              emphasis="medium"
              loading={laboras}
              data-nr-layout-hochladen=""
              onClick={() => dosieroRef.current?.click()}
            >
              {HOCHLADEN}
            </fm-butono>
            <input
              ref={dosieroRef}
              type="file"
              hidden
              accept={AKCEPTO}
              aria-label={`${ETIKEDOJ_058[LAYOUT_ID]} ${HOCHLADEN.toLowerCase()}`}
              data-nr-layout-dosiero=""
              onChange={(evento) => {
                const dosiero = evento.currentTarget.files?.[0];
                evento.currentTarget.value = "";
                hochladen(dosiero);
              }}
            />
          </div>
        </div>
        {meldo === null ? null : (
          <ul className="nr-g-layout-meldoj" data-nr-layout-meldoj="" aria-live="polite">
            <li>{meldo}</li>
          </ul>
        )}
        <div className="nr-g-layout-korpo">
          <KiKnopo<AufbauRezulto>
            zweck="aufbau"
            etikedo={AUFBAU_ERKENNEN}
            kosto={inhalt?.kosto}
            malsxaltitaSatz={aufbauMalsxaltitaSatzDe(datei)}
            sxlosilo={datei?.name}
            onRezulto={(r) => {
              setTeilweise(r.verworfen !== undefined && r.verworfen.length > 0);
              const { worte: _w, ...resto } = aktuala.current ?? {};
              meti({
                ...resto,
                merkmale: r.merkmale,
                ...(r.worte === undefined ? {} : { worte: r.worte }),
                kosto: r.kosto,
              });
            }}
          />
          <p className="nr-g-layout-ruhig">{BILD_GEHT_SATZ}</p>
          {worte.length === 0 && inhalt?.worte === undefined ? null : (
            <div className={`nr-g-layout-merkmale ${NOWHEEL}`} data-nr-layout-merkmale="">
              {worte.length === 0 ? null : <p>{worte.join(" · ")}</p>}
              {inhalt?.worte === undefined ? null : (
                <p className="nr-g-layout-ruhig">{inhalt.worte}</p>
              )}
              {auswahl === undefined ? null : (
                <p className="nr-g-layout-ruhig" data-nr-layout-grund="">
                  {`→ ${auswahl.grund}`}
                </p>
              )}
              {teilweise ? <p className="nr-g-layout-ruhig">{KI_TEILWEISE_SATZ}</p> : null}
            </div>
          )}
        </div>
      </section>
      <Anschluss port={LAYOUT_ELIR} supro={42} />
    </NodoSxelo>
  );
}
