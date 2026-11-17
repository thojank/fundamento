// Spec 058 (MP-2c, T6, MAW-3.4, product spec E level 1, mockup `marken-knoten-option-b.html`
// „Tafel“): the overview of the Marke without KI – always there, it follows every change. A board of
// tiles under the node's top edge:
//   - the name tile: the round sign with the brand's initial, the live display name `nomo`, the
//     description (two lines, the rest cut) and „Entwurf · ungeprüft“; its surface is the Primär
//     colour (content, inline), its text the role that reads on it;
//   - „Schrift“: „Aa“ in the display and in the body family, the families in mono;
//   - „Kern“: purpose and promise; „Tonalität“: a small profile of the six sliders;
//   - „Farben“: Primär, Akzent and Neutral as fields (set or derived), beside them the colours
//     detected in the connected Beispiele and in the Layout-Beispiel as strips by share;
//   - „Werte“ and „Persönlichkeit“ as pills;
//   - „noch offen: …“ as a calm grey line, never an error (no rule name, no count, no red – AK-8).
// Everything comes from `uebersichtDe` (shared module) over the shell's `auswertungEnigo`, so only
// connected inputs count. A tile without content is left out; the name and the colours stay. It
// only shows, it writes nothing; long texts wrap, nothing runs outside the node.
//
// Marks for scripts: `[data-nr-marko-uebersicht]` with
// `[data-nr-marko-teil=name|beschreibung|kern|werte|persoenlichkeit|tonalitaet|farben|schrift|offen]`,
// `[data-nr-marko-signo]` (the round sign). Kept from Spec 056 with their meaning:
// `[data-nr-marko-teil=kern]`, `[data-nr-marko-teil=werte]`, `[data-nr-marko-wert=<id>]` (one pill per
// connected value), `[data-nr-marko-teil=beispiele]` (the strip of the Beispiele colours, only while
// they arrive) with `[data-nr-marko-farbo=<hex>]`. New: `[data-nr-marko-farbe=primaer|akzent|neutral]`
// (with `data-nr-abgeleitet` on a derived field), `[data-nr-marko-teil=layout]` (the strip of the
// Layout-Beispiel), `[data-nr-marko-aa=display|body]`. Gone: `[data-nr-marko-enhavo]` (the 056
// container) and `[data-nr-marko-teil=dazu]` (the names of the other connected nodes; the overview
// names what is open instead).

import {
  type OffenId,
  offenEtikedoDe,
  type Uebersicht,
  type UebersichtFarbo,
  uebersichtDe,
} from "@fundamento/metiejo/auswertung";
import {
  ENHAVO_ETIKEDOJ,
  ENTWURF_UNGEPRUEFT,
  ETIKEDOJ_058,
  LAYOUT_ID,
  MARKO_ETIKEDOJ,
  offenSatzDe,
  ROLO_ETIKEDOJ,
  TONALITAET_MITTE,
  TONALITAET_PAROJ,
} from "@fundamento/metiejo/gestalten";
import { type CSSProperties, useEffect, useMemo } from "react";
import { useGestalten } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { tiparoCssSxargi } from "../tiparo-datumoj.js";

const FARBEN = "Farben";
const ABGELEITET = "abgeleitet";
const LEER = "leer";

const STILO = `
.nr-g-marko-tafel {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-flow: row dense;
  gap: var(--fm-spacing-medium);
}
.nr-g-marko-kachel {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-small);
  min-inline-size: 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large);
  background: ${ROLOJ.pinto};
  border-radius: var(--fm-radius-medium);
  overflow-wrap: anywhere;
}
.nr-g-marko-kachel > small {
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  line-height: var(--fm-typography-kicker-line-height);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-kachel p { margin: 0; }
.nr-g-marko-s2 { grid-column: span 2; }
.nr-g-marko-s4 { grid-column: span 4; }
.nr-g-marko-s6 { grid-column: span 6; }
.nr-g-marko-r2 { grid-row: span 2; }

/* The name tile: the Primär colour as its surface (content), its text the role that reads on it. */
.nr-g-marko-kapo.nr-g-marko-kachel {
  flex-direction: row;
  align-items: center;
  gap: var(--fm-spacing-large);
  min-block-size: calc(var(--fm-size-control-large) * 2);
  background: var(--nr-g-marko-fono, ${ROLOJ.pinto});
  color: var(--nr-g-marko-litero, ${ROLOJ.teksto});
}
.nr-g-marko-signo {
  display: grid;
  place-items: center;
  flex: none;
  inline-size: calc(var(--fm-size-control-large) + var(--fm-spacing-medium));
  block-size: calc(var(--fm-size-control-large) + var(--fm-spacing-medium));
  border-radius: var(--fm-radius-full);
  background: currentColor;
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-headline-4-font-size);
  font-weight: var(--fm-font-weight-bold);
}
.nr-g-marko-signo > span { color: var(--nr-g-marko-fono, ${ROLOJ.pinto}); }
.nr-g-marko-nomo { flex: 1; min-inline-size: 0; }
.nr-g-marko-nomo b {
  display: block;
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-headline-4-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: var(--fm-typography-kicker-line-height);
}
.nr-g-marko-nomo p {
  margin-block-start: var(--fm-spacing-xsmall);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nr-g-marko-entwurf {
  align-self: flex-start;
  flex: none;
  font-family: var(--fm-font-family-code);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.8);
  white-space: nowrap;
}

.nr-g-marko-aa { display: flex; align-items: baseline; gap: var(--fm-spacing-medium); }
.nr-g-marko-aa b {
  font-family: var(--nr-g-marko-display);
  font-size: var(--fm-typography-headline-3-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: 1;
}
.nr-g-marko-aa em {
  font-family: var(--nr-g-marko-body);
  font-size: var(--fm-typography-headline-4-font-size);
  font-style: normal;
  font-weight: var(--fm-font-weight-medium);
  line-height: 1;
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-mono {
  font-family: var(--fm-font-family-code);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  color: ${ROLOJ.mallauta};
}

.nr-g-marko-zweck {
  font-family: var(--fm-font-family-display);
  font-size: var(--fm-typography-body-1-font-size);
  font-weight: var(--fm-font-weight-semibold);
  line-height: var(--fm-typography-body-1-line-height);
}
.nr-g-marko-versprechen {
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-zweck, .nr-g-marko-versprechen {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nr-g-marko-ton svg { inline-size: 100%; block-size: auto; margin-block: auto; }
.nr-g-marko-ton text {
  font-family: var(--fm-typography-caption-font-family);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.8);
  fill: ${ROLOJ.mallauta};
}
.nr-g-marko-ton .nr-g-marko-netz { fill: none; stroke: ${ROLOJ.linioForta}; stroke-width: 0.7; }
.nr-g-marko-ton .nr-g-marko-formo {
  fill: ${ROLOJ.nodo};
  stroke: var(--nr-g-marko-ton, ${ROLOJ.teksto});
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.nr-g-marko-felder { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--fm-spacing-xsmall); }
.nr-g-marko-feld {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-inline-size: 0;
  min-block-size: calc(var(--fm-size-control-large) * 1.5);
  padding: var(--fm-spacing-small);
  border-radius: var(--fm-radius-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  background: var(--nr-g-marko-feld);
  color: var(--nr-g-marko-feld-litero, ${ROLOJ.teksto});
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  font-weight: var(--fm-font-weight-semibold);
}
.nr-g-marko-feld code { font-family: var(--fm-font-family-code); font-weight: var(--fm-font-weight-regular); }
.nr-g-marko-feld[data-nr-leer] {
  background: transparent;
  border-style: var(--fm-stroke-dashed);
  border-color: ${ROLOJ.linioForta};
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-erkannt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-streifen {
  display: flex;
  block-size: var(--fm-spacing-small);
  border-radius: var(--fm-radius-full);
  overflow: hidden;
}
.nr-g-marko-streifen > i { flex-shrink: 0; flex-basis: 0; }

.nr-g-marko-reihe {
  display: grid;
  grid-template-columns: calc(var(--fm-size-control-large) * 2.6) minmax(0, 1fr);
  gap: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  align-items: baseline;
  font-size: calc(var(--fm-typography-caption-font-size) * 0.9);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-pillen { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-xsmall); min-inline-size: 0; }
.nr-g-marko-pillen > span {
  min-inline-size: 0;
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-semibold);
  padding: 0 var(--fm-spacing-medium);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-pill);
  color: ${ROLOJ.teksto};
  overflow-wrap: anywhere;
}
.nr-g-marko-pillen > span.nr-g-marko-fein { font-weight: var(--fm-font-weight-medium); border-style: var(--fm-stroke-dashed); }

.nr-g-marko-offen {
  grid-column: span 6;
  margin: 0;
  padding: 0 var(--fm-spacing-small);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
`;

/** WCAG relative luminance of `#rrggbb`, or undefined for anything else. */
function luminanco(hex: string): number | undefined {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return undefined;
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The text role that reads on a brand colour: on a light colour the dark text of the canvas, on a
 * dark one the light text. The canvas's default text is light in dark and dark in light; its
 * inverse is the other one.
 */
function literoRolo(hex: string, malhela: boolean): string | undefined {
  const l = luminanco(hex);
  if (l === undefined) return undefined;
  // The luminance where black and white text have the same contrast on the colour.
  const helaFono = l > 0.179;
  return helaFono === malhela ? "var(--fm-color-text-inverse)" : ROLOJ.teksto;
}

/** A family before the role's fallback of the Belegung; only the fallback without one. */
const stapelDe = (familie: string | undefined, ersatz: string): string =>
  familie === undefined ? ersatz : `${JSON.stringify(familie)}, ${ersatz}`;

// The profile of Tonalität: six axes around a centre, the first at the top, clockwise; -2 lies near
// the centre, +2 on the outer ring (the right word of each pair stands at its corner).
const TON_MEZO = 60;
const TON_RADIUSO = 44;
const TON_ENA = 0.2;

const punktoDe = (i: number, r: number): [number, number] => {
  const angulo = ((-90 + i * 60) * Math.PI) / 180;
  return [TON_MEZO + r * Math.cos(angulo), TON_MEZO + r * Math.sin(angulo)];
};
const punktojDe = (radiusoj: readonly number[]): string =>
  radiusoj
    .map((r, i) =>
      punktoDe(i, r)
        .map((n) => n.toFixed(1))
        .join(","),
    )
    .join(" ");

/** Where each pair's word stands, and how it is anchored (as in the mockup). */
const TON_ETIKEDOJ: readonly { x: number; y: number; anchor: "start" | "middle" | "end" }[] = [
  { x: 60, y: 11, anchor: "middle" },
  { x: 102, y: 38, anchor: "start" },
  { x: 102, y: 86, anchor: "start" },
  { x: 60, y: 114, anchor: "middle" },
  { x: 18, y: 86, anchor: "end" },
  { x: 18, y: 38, anchor: "end" },
];

/** „förmlich – locker: eher locker“ for every set slider; the middle is „dazwischen“. */
function tonPriskriboDe(ton: NonNullable<Uebersicht["tonalitaet"]>): string {
  const partoj = TONALITAET_PAROJ.flatMap(({ id, links, rechts }) => {
    const wert = ton[id];
    if (wert === undefined) return [];
    const vorto = wert < 0 ? `eher ${links}` : wert > 0 ? `eher ${rechts}` : TONALITAET_MITTE;
    return [`${links} – ${rechts}: ${vorto}`];
  });
  return `Profil der sechs Regler: ${partoj.join(", ")}`;
}

function TonProfilo({ ton, hex }: { ton: NonNullable<Uebersicht["tonalitaet"]>; hex: string }) {
  const radiusoj = TONALITAET_PAROJ.map(({ id }) => {
    const wert = Math.min(2, Math.max(-2, ton[id] ?? 0));
    return TON_RADIUSO * (TON_ENA + ((1 - TON_ENA) * (wert + 2)) / 4);
  });
  const stilo = (hex === "" ? {} : { "--nr-g-marko-ton": hex }) as CSSProperties;
  return (
    <svg viewBox="-34 4 188 112" role="img" aria-label={tonPriskriboDe(ton)} style={stilo}>
      <polygon className="nr-g-marko-netz" points={punktojDe(radiusoj.map(() => TON_RADIUSO))} />
      <polygon
        className="nr-g-marko-netz"
        points={punktojDe(radiusoj.map(() => TON_RADIUSO / 2))}
      />
      <polygon className="nr-g-marko-formo" points={punktojDe(radiusoj)} />
      {TONALITAET_PAROJ.map(({ id, links, rechts }, i) => {
        const e = TON_ETIKEDOJ[i];
        return e === undefined ? null : (
          <text key={id} x={e.x} y={e.y} textAnchor={e.anchor}>
            <title>{`${links} – ${rechts}`}</title>
            {rechts}
          </text>
        );
      })}
    </svg>
  );
}

function FarbFeld({
  rolo,
  farbo,
  malhela,
}: {
  rolo: "primaer" | "akzent" | "neutral";
  farbo: UebersichtFarbo | undefined;
  malhela: boolean;
}) {
  if (farbo === undefined)
    return (
      <div className="nr-g-marko-feld" data-nr-marko-farbe={rolo} data-nr-leer="">
        {ROLO_ETIKEDOJ[rolo]}
        <code>{LEER}</code>
      </div>
    );
  const litero = literoRolo(farbo.hex, malhela);
  const stilo = {
    "--nr-g-marko-feld": farbo.hex,
    ...(litero === undefined ? {} : { "--nr-g-marko-feld-litero": litero }),
  } as CSSProperties;
  return (
    <div
      className="nr-g-marko-feld"
      style={stilo}
      title={farbo.abgeleitet ? `${farbo.hex} · ${ABGELEITET}` : farbo.hex}
      data-nr-marko-farbe={rolo}
      data-nr-abgeleitet={farbo.abgeleitet ? "" : undefined}
    >
      {ROLO_ETIKEDOJ[rolo]}
      <code>{farbo.abgeleitet ? `${farbo.hex} · ${ABGELEITET}` : farbo.hex}</code>
    </div>
  );
}

function Streifen({ farben }: { farben: readonly { hex: string; anteil: number }[] }) {
  return (
    <span className="nr-g-marko-streifen">
      {farben.map((f) => (
        <i
          key={f.hex}
          title={`${f.hex} · ${Math.round(f.anteil)} %`}
          style={{ background: f.hex, flexGrow: Math.max(f.anteil, 1) }}
          data-nr-marko-farbo={f.hex}
        />
      ))}
    </span>
  );
}

/** The ids of the connected values of Werte, in the order the overview names their texts. */
function werteIdsDe(
  texte: readonly string[],
  inhalt: readonly { id: string; text: string }[],
): string[] {
  let i = 0;
  return texte.map((teksto) => {
    while (i < inhalt.length && inhalt[i]?.text !== teksto) i++;
    const id = inhalt[i]?.id ?? "";
    i++;
    return id;
  });
}

/** Stable React keys for a list of texts that may repeat: the text and its occurrence. */
function sxlosilojDe(texte: readonly string[]): string[] {
  const vidita = new Map<string, number>();
  return texte.map((teksto) => {
    const n = vidita.get(teksto) ?? 0;
    vidita.set(teksto, n + 1);
    return `${teksto}\u0000${n}`;
  });
}

/** The overview of the Marke without KI (product spec E, level 1). */
export function MarkoUebersicht() {
  useStilo("marko-uebersicht", STILO);
  const { auswertungEnigo, skemo, inhaltDe } = useGestalten();
  const ue = useMemo(() => uebersichtDe(auswertungEnigo), [auswertungEnigo]);
  const malhela = skemo === "dunkel";

  // The catalog fonts' rules, once per page (shared with the node Schrift).
  const { display, body } = auswertungEnigo.schriften;
  const tiparoj = [display?.tiparo, body?.tiparo]
    .filter((t): t is string => t !== undefined)
    .join(" ");
  useEffect(() => {
    for (const id of tiparoj === "" ? [] : tiparoj.split(" ")) void tiparoCssSxargi(id);
  }, [tiparoj]);

  const primaer = ue.farben.primaer?.hex ?? "";
  const litero = [...ue.name.trim()][0]?.toLocaleUpperCase("de-DE") ?? "";
  const literoKoloro = literoRolo(primaer, malhela);
  const kapoStilo = {
    ...(primaer === "" ? {} : { "--nr-g-marko-fono": primaer }),
    ...(literoKoloro === undefined ? {} : { "--nr-g-marko-litero": literoKoloro }),
  } as CSSProperties;

  const schrift = ue.schrift.display !== undefined || ue.schrift.body !== undefined;
  const kern =
    ue.kern !== undefined && (ue.kern.zweck !== undefined || ue.kern.versprechen !== undefined);
  const werte = ue.werte ?? [];
  const persoenlichkeit = ue.persoenlichkeit ?? [];
  const ton = ue.tonalitaet !== undefined && Object.keys(ue.tonalitaet).length > 0;
  const farben =
    ue.farben.primaer !== undefined ||
    ue.farben.akzent !== undefined ||
    ue.farben.neutral !== undefined ||
    ue.erkannt.beispiele.length > 0 ||
    ue.erkannt.layout.length > 0;
  const worte = werte.length > 0 || persoenlichkeit.length > 0;
  // Beside Tonalität (two rows high) the tiles take four columns; without it the whole width.
  const flanko = ton ? "nr-g-marko-s4" : "nr-g-marko-s6";
  const werteIds = werteIdsDe(werte, inhaltDe("teksto-werte")?.werte ?? []);
  const werteSxlosiloj = sxlosilojDe(werte);
  const werteListe = werte.map((teksto, i) => ({
    teksto,
    id: werteIds[i] ?? "",
    sxlosilo: werteSxlosiloj[i] ?? teksto,
  }));
  const persoenlichkeitSxlosiloj = sxlosilojDe(persoenlichkeit);
  const persoenlichkeitListe = persoenlichkeit.map((teksto, i) => ({
    teksto,
    sxlosilo: persoenlichkeitSxlosiloj[i] ?? teksto,
  }));
  const offen = offenSatzDe(ue.offen.map((id: OffenId) => offenEtikedoDe(id)));

  return (
    <div className="nr-g-marko-tafel" data-nr-marko-uebersicht="">
      <div
        className={`nr-g-marko-kachel nr-g-marko-kapo ${schrift ? "nr-g-marko-s4" : "nr-g-marko-s6"}`}
        style={kapoStilo}
        data-nr-marko-teil="name"
      >
        <span className="nr-g-marko-signo" aria-hidden="true" data-nr-marko-signo="">
          <span>{litero}</span>
        </span>
        <span className="nr-g-marko-nomo">
          <b>{ue.name}</b>
          {ue.beschreibung === undefined ? null : (
            <p title={ue.beschreibung} data-nr-marko-teil="beschreibung">
              {ue.beschreibung}
            </p>
          )}
        </span>
        <span className="nr-g-marko-entwurf">{ENTWURF_UNGEPRUEFT}</span>
      </div>

      {schrift ? (
        <div className="nr-g-marko-kachel nr-g-marko-s2" data-nr-marko-teil="schrift">
          <small>{ENHAVO_ETIKEDOJ.schrift}</small>
          <div
            className="nr-g-marko-aa"
            style={
              {
                "--nr-g-marko-display": stapelDe(
                  ue.schrift.display,
                  "var(--fm-font-family-display)",
                ),
                "--nr-g-marko-body": stapelDe(ue.schrift.body, "var(--fm-font-family-body)"),
              } as CSSProperties
            }
          >
            <b data-nr-marko-aa="display">Aa</b>
            <em data-nr-marko-aa="body">Aa</em>
          </div>
          <span className="nr-g-marko-mono">
            {[ue.schrift.display, ue.schrift.body].filter((f) => f !== undefined).join(" · ")}
          </span>
        </div>
      ) : null}

      {kern && ue.kern !== undefined ? (
        <div className={`nr-g-marko-kachel ${flanko}`} data-nr-marko-teil="kern">
          <small>{MARKO_ETIKEDOJ.kern}</small>
          {ue.kern.zweck === undefined ? null : <p className="nr-g-marko-zweck">{ue.kern.zweck}</p>}
          {ue.kern.versprechen === undefined ? null : (
            <p className="nr-g-marko-versprechen">{ue.kern.versprechen}</p>
          )}
        </div>
      ) : null}

      {ton && ue.tonalitaet !== undefined ? (
        <div
          className="nr-g-marko-kachel nr-g-marko-ton nr-g-marko-s2 nr-g-marko-r2"
          data-nr-marko-teil="tonalitaet"
        >
          <small>{ENHAVO_ETIKEDOJ["teksto-tonalitaet"]}</small>
          <TonProfilo ton={ue.tonalitaet} hex={primaer} />
        </div>
      ) : null}

      {farben ? (
        <div className={`nr-g-marko-kachel ${flanko}`} data-nr-marko-teil="farben">
          <small>{FARBEN}</small>
          <div className="nr-g-marko-felder">
            <FarbFeld rolo="primaer" farbo={ue.farben.primaer} malhela={malhela} />
            <FarbFeld rolo="akzent" farbo={ue.farben.akzent} malhela={malhela} />
            <FarbFeld rolo="neutral" farbo={ue.farben.neutral} malhela={malhela} />
          </div>
          {ue.erkannt.beispiele.length === 0 && ue.erkannt.layout.length === 0 ? null : (
            <div className="nr-g-marko-erkannt">
              {ue.erkannt.beispiele.length === 0 ? null : (
                <>
                  <span>{ENHAVO_ETIKEDOJ.beispiele}</span>
                  <span data-nr-marko-teil="beispiele">
                    <Streifen farben={ue.erkannt.beispiele} />
                  </span>
                </>
              )}
              {ue.erkannt.layout.length === 0 ? null : (
                <>
                  <span>{ETIKEDOJ_058[LAYOUT_ID]}</span>
                  <span data-nr-marko-teil="layout">
                    <Streifen farben={ue.erkannt.layout} />
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}

      {worte ? (
        <div className={`nr-g-marko-kachel ${flanko}`}>
          {werte.length === 0 ? null : (
            <div className="nr-g-marko-reihe" data-nr-marko-teil="werte">
              <span>{MARKO_ETIKEDOJ.werte}</span>
              <span className="nr-g-marko-pillen">
                {werteListe.map((w) => (
                  <span key={w.sxlosilo} data-nr-marko-wert={w.id}>
                    {w.teksto}
                  </span>
                ))}
              </span>
            </div>
          )}
          {persoenlichkeit.length === 0 ? null : (
            <div className="nr-g-marko-reihe" data-nr-marko-teil="persoenlichkeit">
              <span>{ENHAVO_ETIKEDOJ["teksto-persoenlichkeit"]}</span>
              <span className="nr-g-marko-pillen">
                {persoenlichkeitListe.map((p) => (
                  <span key={p.sxlosilo} className="nr-g-marko-fein">
                    {p.teksto}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      ) : null}

      {offen === "" ? null : (
        <p className="nr-g-marko-offen" data-nr-marko-teil="offen">
          {offen}
        </p>
      )}
    </div>
  );
}
