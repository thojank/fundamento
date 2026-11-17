// Spec 058 (MP-2c, T5, MAW-3.3, product spec D, US-4, AK-4, AK-11, AK-16, AK-17): the optional KI
// node „Namen und Beschreibung“ (`ki-namen`, node type „ki“, added through „+ Knoten“, at most once).
//
// - Inputs: Text on the left (`KI_NAMEN_TEKSTO_ENIR`), Bild centred on the top edge
//   (`KI_NAMEN_BILDO_ENIR`), both with many edges; the shell draws, detaches and re-plugs them.
//   What is connected goes in (`eingabenDe(…, "namen")`, plus the current description).
// - „Vorschlagen“ (then „Neu“) through `KiKnopo` with the price before and after; calmly disabled
//   without a model or without any input with content. Never a call without a click.
// - The result (stored by the route in `leinwand.json`, taken into the session with
//   `inhaltMeti(…, true)`): six to eight names, each with its reason, and the improved description
//   beside the current one; „übernehmen“ per name and for the description. The first takeover of a
//   result saves one Stand „vor Übernahme, HH:MM“ (`sicherVorUebernahme`, E-2) and keeps its id as
//   `gesichert`; if that fails, nothing is written and STAND_FEHLT_SATZ stands in the node. A name
//   goes in through `nomoMeti` + `skribi({name})`, the description into Grundlagen's `inhalt`.
// - A small „veraltet“ dot when an input changed after the proposal (`veraltet`); the calm line
//   „Ob ein Name frei ist, prüft Fundamento nicht.“; a partly unreadable answer says so calmly.
// The frame `NodoSxelo` gives `[data-nr-nodo=ki-namen]`, dashed and with „×“ while no proposal is
// there. No red, no count, no rule name.
// QA-Lauf 1 (B1): the model's text has no fixed length, so the node is bounded by design: it never
// grows past its maximum height of ARANGXO_058 (`altecoDe(…, {stufe: 58})`); the proposal (names
// and the description comparison) scrolls inside (`nowheel`), and each reason stays on one line
// (ellipsis, the full text in `title`).

import { eingabenDe, eingabenLeer, veraltet } from "@fundamento/metiejo/auswertung";
import {
  altecoDe,
  ETIKEDOJ_058,
  GRUNDLAGEN_ID,
  KEINE_EINGABE_SATZ,
  KI_NAMEN_BILDO_ENIR,
  KI_NAMEN_ID,
  KI_NAMEN_TEKSTO_ENIR,
  KI_TEILWEISE_SATZ,
  NAME_FREI_SATZ,
  type NamenVorschlag,
  NE_KONSERVITA_SATZ,
  NEU,
  UEBERNEHMEN,
  UEBERNOMMEN,
  VERALTET,
  VORSCHLAGEN,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { useMemo, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { KiKnopo } from "../ki-knopo.js";
import { type KiNamenFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, NOWHEEL, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import { sicherVorUebernahme } from "../uebernehmen.js";

/** The node's maximum height (ARANGXO_058): the frame never grows past it, the proposal scrolls. */
const HOECHSTENS = `${altecoDe(KI_NAMEN_ID, { stufe: 58 })}px`;

const STILO = `
.nr-g-nodo.nr-g-ki-namen {
  display: flex;
  flex-direction: column;
  max-block-size: ${HOECHSTENS};
}
.nr-g-ki-namen-korpo {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-block-size: 0;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
}
.nr-g-ki-namen-rezulto {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-small);
  min-block-size: 0;
  overflow-y: auto;
}
.nr-g-ki-namen-satz {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-ki-namen-kopo {
  margin: 0;
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-ki-namen-listo { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); }
.nr-g-ki-namen-idee {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: var(--fm-spacing-small);
  padding-block: var(--fm-spacing-xsmall);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-ki-namen-idee:first-child { border-block-start: 0; }
.nr-g-ki-namen-idee > b { font-weight: var(--fm-font-weight-semibold); overflow-wrap: anywhere; }
.nr-g-ki-namen-idee > small {
  grid-column: 1 / -1;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nr-g-ki-namen-beschreibung {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fm-spacing-small);
}
.nr-g-ki-namen-beschreibung > div { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); min-inline-size: 0; }
.nr-g-ki-namen-beschreibung p {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  overflow-wrap: anywhere;
}
.nr-g-ki-namen-beschreibung [data-nr-beschreibung-bisher] p { color: ${ROLOJ.mallauta}; }
.nr-g-ki-namen-uebernommen {
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
}
.nr-g-ki-namen-veraltet {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-spacing-xsmall);
  font-size: var(--fm-typography-caption-font-size);
  letter-spacing: 0;
  text-transform: none;
  color: ${ROLOJ.mallauta};
}
.nr-g-ki-namen-veraltet::before {
  content: "";
  inline-size: var(--fm-spacing-small);
  block-size: var(--fm-spacing-small);
  border-radius: var(--fm-radius-full);
  background: ${ROLOJ.mallauta};
}
`;

/** A part of the proposal to take over: one name, or the description. */
type Teil = { name: string } | { beschreibung: string };

export function KiNamenNodo(_props: NodeProps<KiNamenFlowNodo>) {
  useStilo("ki-namen", STILO);
  const { marko, auswertungEnigo, inhaltDe, inhaltMeti, haltigiDum, nomo, nomoMeti, skribi } =
    useGestalten();
  const vorschlag = inhaltDe(KI_NAMEN_ID)?.vorschlag;
  const bisher = inhaltDe(GRUNDLAGEN_ID)?.beschreibung;
  const eingaben = useMemo(() => eingabenDe(auswertungEnigo, "namen"), [auswertungEnigo]);
  const leer = eingabenLeer(eingaben);
  const alt = veraltet(vorschlag, eingaben);
  const [satz, setSatz] = useState<string | null>(null);
  const [okupata, setOkupata] = useState(false);

  const uebernehmen = async (teil: Teil, v: NamenVorschlag): Promise<void> => {
    if (okupata) return;
    setOkupata(true);
    setSatz(null);
    try {
      // E-2: the first takeover of this result saves one Stand; if that fails, nothing is written.
      const stand = await sicherVorUebernahme(marko, v.gesichert, haltigiDum);
      if ("satz" in stand) {
        setSatz(stand.satz);
        return;
      }
      if (v.gesichert === undefined)
        inhaltMeti(KI_NAMEN_ID, { vorschlag: { ...v, gesichert: stand.id } }, true);
      if ("name" in teil) {
        nomoMeti(teil.name);
        const r = await skribi({ name: teil.name });
        if (r.speco === "nelegebla") setSatz(r.satz);
        else if (r.speco === "problemo") setSatz(NE_KONSERVITA_SATZ);
      } else {
        inhaltMeti(
          GRUNDLAGEN_ID,
          { ...(inhaltDe(GRUNDLAGEN_ID) ?? {}), beschreibung: teil.beschreibung },
          true,
        );
      }
    } finally {
      setOkupata(false);
    }
  };

  return (
    <NodoSxelo id={KI_NAMEN_ID} className="nr-g-ki-namen">
      <NodoKapo signo={{ art: "ki" }} nomo={ETIKEDOJ_058[KI_NAMEN_ID]}>
        {alt ? (
          <span className="nr-g-ki-namen-veraltet" data-nr-veraltet="" title={VERALTET}>
            {VERALTET}
          </span>
        ) : null}
      </NodoKapo>
      <Anschluss port={KI_NAMEN_TEKSTO_ENIR} supro={28} />
      <Anschluss port={KI_NAMEN_BILDO_ENIR} supro={0} rando="supro" />
      <div className="nr-g-ki-namen-korpo">
        <KiKnopo<{ vorschlag: NamenVorschlag }>
          zweck="namen"
          etikedo={vorschlag === undefined ? VORSCHLAGEN : NEU}
          kosto={vorschlag?.kosto}
          malsxaltitaSatz={leer ? KEINE_EINGABE_SATZ : undefined}
          sxlosilo={vorschlag?.abdruck}
          onRezulto={(r) => {
            setSatz(null);
            inhaltMeti(KI_NAMEN_ID, { vorschlag: r.vorschlag }, true);
          }}
        />
        {vorschlag === undefined ? null : (
          <div className={`nr-g-ki-namen-rezulto ${NOWHEEL}`} data-nr-ki-namen-rezulto="">
            {vorschlag.verworfen !== undefined && vorschlag.verworfen.length > 0 ? (
              <p className="nr-g-ki-namen-satz" data-nr-ki-teilweise="">
                {KI_TEILWEISE_SATZ}
              </p>
            ) : null}
            {vorschlag.namen.length === 0 ? null : (
              <ul className="nr-g-ki-namen-listo" aria-label="Namensideen">
                {vorschlag.namen.map((idee, i) => (
                  <li
                    // The list is the model's; a name may come twice, so the place is the key.
                    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
                    key={i}
                    className="nr-g-ki-namen-idee"
                    data-nr-name-idee={idee.name}
                  >
                    <b>{idee.name}</b>
                    {idee.name === nomo ? (
                      <span className="nr-g-ki-namen-uebernommen" data-nr-uebernommen="name">
                        {UEBERNOMMEN}
                      </span>
                    ) : (
                      <fm-butono
                        className={`${NODRAG} ${NOPAN}`}
                        size="small"
                        emphasis="low"
                        disabled={okupata}
                        data-nr-uebernehmen="name"
                        onClick={() => void uebernehmen({ name: idee.name }, vorschlag)}
                      >
                        {UEBERNEHMEN}
                      </fm-butono>
                    )}
                    {idee.grund === "" ? null : <small title={idee.grund}>{idee.grund}</small>}
                  </li>
                ))}
              </ul>
            )}
            {vorschlag.beschreibung === undefined ? null : (
              <div className="nr-g-ki-namen-beschreibung">
                <div data-nr-beschreibung-bisher="">
                  <p className="nr-g-ki-namen-kopo">bisher</p>
                  <p>{bisher ?? "–"}</p>
                </div>
                <div data-nr-beschreibung-vorschlag="">
                  <p className="nr-g-ki-namen-kopo">Vorschlag</p>
                  <p>{vorschlag.beschreibung}</p>
                  {vorschlag.beschreibung === bisher ? (
                    <span className="nr-g-ki-namen-uebernommen" data-nr-uebernommen="beschreibung">
                      {UEBERNOMMEN}
                    </span>
                  ) : (
                    <fm-butono
                      className={`${NODRAG} ${NOPAN}`}
                      size="small"
                      emphasis="low"
                      disabled={okupata}
                      data-nr-uebernehmen="beschreibung"
                      onClick={() => {
                        const beschreibung = vorschlag.beschreibung;
                        if (beschreibung !== undefined)
                          void uebernehmen({ beschreibung }, vorschlag);
                      }}
                    >
                      {UEBERNEHMEN}
                    </fm-butono>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {satz === null ? null : (
          <p className="nr-g-ki-namen-satz" data-nr-ki-namen-satz="" aria-live="polite">
            {satz}
          </p>
        )}
        <p className="nr-g-ki-namen-satz" data-nr-name-frei="">
          {NAME_FREI_SATZ}
        </p>
      </div>
    </NodoSxelo>
  );
}
