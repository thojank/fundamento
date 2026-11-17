// Spec 058 (MP-2c, T7, MAW-4.1, product spec E level 2, mockup `marken-knoten-option-b.html`): the
// content of the side panel of the view Gestalten, „Markenprofil · Einzelheiten“. The shell
// (kanvaso.tsx) renders it inside its own `<aside data-nr-flanko="marko">` exactly while the Marke
// node is selected; this file renders only the content and reads the shell's context (no props).
//   - Before an evaluation: the calm sentence „Noch nicht ausgewertet. …“.
//   - After: the whole profile – Kernsatz, Charakter, the three Leitgedanken in full, the
//     Gestaltungsvorschlag with every reason and „übernehmen“ per part (the same takeover as in the
//     node, `profil-datumoj.ts`), „Woraus es entstand“ (what went in, counted from the live inputs),
//     everything that fits and everything that rubs (a calm hint, never an error), and the costs:
//     estimated (`kiStato`, asks no model), actual and when it was evaluated. „veraltet“ when an
//     input changed; a partly unreadable answer says so calmly.
// No red, no rule name, no problem count.
//
// Marks (inside `aside[data-nr-flanko="marko"]`): `[data-nr-flanko-leer]` (before an evaluation),
// `[data-nr-flanko-profil]` with `[data-nr-flanko-teil=kernsatz|charakter|leitgedanken|vorschlag|
// woraus|passt|reibt|kosten]`, the part marks of the node (`[data-nr-vorschlag-teil]`,
// `[data-nr-uebernehmen]`, `[data-nr-uebernommen]`), `[data-nr-veraltet]`, `[data-nr-kosto=geschaetzt|
// tatsaechlich|zeit]`.

import type { Eingaben } from "@fundamento/metiejo/auswertung";
import {
  ETIKEDOJ_058,
  GESTALTUNGSVORSCHLAG,
  KI_TEILWEISE_SATZ,
  type Kosto,
  LAYOUT_ID,
  MARKENPROFIL_EINZELHEITEN,
  NOCH_NICHT_AUSGEWERTET_SATZ,
  TEKSTO_IDS,
  WORAUS_ES_ENTSTAND,
} from "@fundamento/metiejo/gestalten";
import { Fragment, useEffect, useState } from "react";
import { kiStato, kostoTekstoDe } from "./ki-datumoj.js";
import { useGestalten } from "./kunteksto.js";
import {
  KERNSATZ,
  LEITGEDANKEN,
  useProfilStilo,
  Veraltet,
  VorschlagTeiloj,
} from "./nodoj/marko-profil.js";
import { useProfil } from "./profil-datumoj.js";
import { ROLOJ, useStilo } from "./roloj.js";

const WAS_ZUSAMMENPASST = "Was zusammenpasst";
const WAS_SICH_REIBT = "Was sich reibt";
const KOSTEN = "Kosten";
const CHARAKTER = "Charakter";

const STILO = `
.nr-g-marko-flanko-titolo,
.nr-g-flanko-bloko > small {
  margin: 0;
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-flanko-titolo { display: flex; align-items: center; justify-content: space-between; gap: var(--fm-spacing-medium); }
.nr-g-marko-flanko-satz {
  margin: var(--fm-spacing-medium) 0 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-flanko-satz[data-nr-flanko-leer] {
  padding: var(--fm-spacing-large);
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  text-align: center;
}
.nr-g-flanko-bloko {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-small);
  margin-block-start: var(--fm-spacing-medium);
  padding-block-start: var(--fm-spacing-medium);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-flanko-bloko p {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  overflow-wrap: anywhere;
}
.nr-g-flanko-kernsatz {
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-body-1-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: var(--fm-typography-body-1-line-height);
}
.nr-g-flanko-bloko p > b {
  display: block;
  font-weight: var(--fm-font-weight-semibold);
}
.nr-g-flanko-bloko dl {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
}
.nr-g-flanko-bloko dt { color: ${ROLOJ.mallauta}; }
.nr-g-flanko-bloko dd { margin: 0; font-family: var(--fm-font-family-code); overflow-wrap: anywhere; }
.nr-g-flanko-reibung p {
  padding-inline-start: var(--fm-spacing-medium);
  border-inline-start: var(--fm-border-width-strong) var(--fm-stroke-solid) ${ROLOJ.linioForta};
}
`;

/** Grundlagen and the six text nodes that are not Tonalität: what „Text-Knoten“ counts. */
const TEKSTOJ_ENTUTE = 1 + TEKSTO_IDS.filter((id) => id !== "teksto-tonalitaet").length;

const du = (n: number): string => String(n).padStart(2, "0");

/** „16.11., 14:32“ in the local time of the browser; "" when the time does not read. */
function ausgewertetDe(kosto: Kosto): string {
  const zeit = new Date(kosto.zeit);
  if (Number.isNaN(zeit.getTime())) return "";
  return `${du(zeit.getDate())}.${du(zeit.getMonth() + 1)}., ${du(zeit.getHours())}:${du(zeit.getMinutes())}`;
}

/** The rows of „Woraus es entstand“ from the live inputs (no judgement, only what went in). */
function worausDe(e: Eingaben): { dt: string; dd: string }[] {
  const tekstoj =
    (e.beschreibung === undefined ? 0 : 1) +
    (e.texte?.length ?? 0) +
    (e.werte === undefined ? 0 : 1) +
    (e.persoenlichkeit === undefined ? 0 : 1);
  const merkmale = e.layout?.merkmale === undefined ? [] : Object.values(e.layout.merkmale);
  const farben = (["primaer", "akzent", "neutral"] as const)
    .filter((r) => e.farben?.[r] !== undefined)
    .map((r) => (r === "primaer" ? "Primär" : r === "akzent" ? "Akzent" : "Neutral"));
  const schriften = [e.schriften?.display, e.schriften?.body].filter((s) => s !== undefined).length;
  const farbenSchrift = [
    ...farben,
    ...(schriften === 0 ? [] : [schriften === 1 ? "1 Schrift" : `${schriften} Schriften`]),
  ];
  return [
    { dt: "Text-Knoten", dd: `${tekstoj} von ${TEKSTOJ_ENTUTE}` },
    {
      dt: "Tonalität",
      dd: e.tonalitaet === undefined ? "–" : `${e.tonalitaet.length} Regler`,
    },
    {
      dt: "Beispiele",
      dd: e.erkannt === undefined ? "–" : `${e.erkannt.length} erkannte Farben`,
    },
    {
      dt: ETIKEDOJ_058[LAYOUT_ID],
      dd:
        merkmale.length > 0
          ? merkmale.join(", ")
          : e.layout?.farben !== undefined
            ? `${e.layout.farben.length} erkannte Farben`
            : "–",
    },
    { dt: "Farben, Schrift", dd: farbenSchrift.length === 0 ? "–" : farbenSchrift.join(", ") },
  ];
}

export function MarkoFlanko() {
  useStilo("marko-flanko", STILO);
  useProfilStilo();
  const { marko } = useGestalten();
  const p = useProfil();
  const { profil } = p;
  const [schaetzung, setSchaetzung] = useState<string | undefined>(undefined);
  const abdruck = profil?.abdruck;

  // The estimate of the next call (asks no model), again after every new result.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `abdruck` only triggers a new read.
  useEffect(() => {
    let nuligita = false;
    void kiStato(marko, "profil").then((s) => {
      if (!nuligita) setSchaetzung(s.pret ? s.schaetzung?.text : undefined);
    });
    return () => {
      nuligita = true;
    };
  }, [marko, abdruck]);

  if (profil === undefined)
    return (
      <>
        <h2 className="nr-g-marko-flanko-titolo">{MARKENPROFIL_EINZELHEITEN}</h2>
        <p className="nr-g-marko-flanko-satz" data-nr-flanko-leer="">
          {NOCH_NICHT_AUSGEWERTET_SATZ}
        </p>
      </>
    );

  const leitgedanken = profil.leitgedanken ?? [];
  const charakter = profil.charakter ?? [];
  const passt = profil.passt ?? [];
  const reibt = profil.reibt ?? [];
  const teilweise = profil.verworfen !== undefined && profil.verworfen.length > 0;

  return (
    <>
      <h2 className="nr-g-marko-flanko-titolo">
        <span>{MARKENPROFIL_EINZELHEITEN}</span>
        {p.alt ? <Veraltet /> : null}
      </h2>
      <div data-nr-flanko-profil="">
        {teilweise ? (
          <p className="nr-g-marko-flanko-satz" data-nr-ki-teilweise="">
            {KI_TEILWEISE_SATZ}
          </p>
        ) : null}
        {profil.kernsatz === undefined ? null : (
          <div className="nr-g-flanko-bloko" data-nr-flanko-teil="kernsatz">
            <small>{KERNSATZ}</small>
            <p className="nr-g-flanko-kernsatz">{profil.kernsatz}</p>
          </div>
        )}
        {charakter.length === 0 ? null : (
          <div className="nr-g-flanko-bloko" data-nr-flanko-teil="charakter">
            <small>{CHARAKTER}</small>
            <span className="nr-g-marko-pillen">
              {charakter.map((wort, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
                <span key={i}>{wort}</span>
              ))}
            </span>
          </div>
        )}
        {leitgedanken.length === 0 ? null : (
          <div className="nr-g-flanko-bloko" data-nr-flanko-teil="leitgedanken">
            <small>{LEITGEDANKEN}</small>
            {leitgedanken.map((g, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
              <p key={i}>
                <b>{g.titel}</b>
                {g.text}
              </p>
            ))}
          </div>
        )}
        {p.teile.length === 0 ? null : (
          <div className="nr-g-flanko-bloko" data-nr-flanko-teil="vorschlag">
            <small>{GESTALTUNGSVORSCHLAG}</small>
            <VorschlagTeiloj p={p} vertikala />
            {p.linio === null ? null : (
              <p className="nr-g-marko-flanko-satz" data-nr-profil-linio="" aria-live="polite">
                {p.linio}
              </p>
            )}
          </div>
        )}
        <div className="nr-g-flanko-bloko" data-nr-flanko-teil="woraus">
          <small>{WORAUS_ES_ENTSTAND}</small>
          <dl>
            {worausDe(p.eingaben).map((r) => (
              <Fragment key={r.dt}>
                <dt>{r.dt}</dt>
                <dd>{r.dd}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
        {passt.length === 0 ? null : (
          <div className="nr-g-flanko-bloko nr-g-flanko-reibung" data-nr-flanko-teil="passt">
            <small>{WAS_ZUSAMMENPASST}</small>
            {passt.map((t, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
              <p key={i}>{t}</p>
            ))}
          </div>
        )}
        {reibt.length === 0 ? null : (
          <div className="nr-g-flanko-bloko nr-g-flanko-reibung" data-nr-flanko-teil="reibt">
            <small>{WAS_SICH_REIBT}</small>
            {reibt.map((t, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of one result.
              <p key={i}>{t}</p>
            ))}
          </div>
        )}
        <div className="nr-g-flanko-bloko" data-nr-flanko-teil="kosten">
          <small>{KOSTEN}</small>
          <dl>
            <dt>geschätzt</dt>
            <dd data-nr-kosto="geschaetzt">{schaetzung ?? "–"}</dd>
            <dt>tatsächlich</dt>
            <dd data-nr-kosto="tatsaechlich">{kostoTekstoDe(profil.kosto)}</dd>
            <dt>ausgewertet</dt>
            <dd data-nr-kosto="zeit">{ausgewertetDe(profil.kosto) || "–"}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
