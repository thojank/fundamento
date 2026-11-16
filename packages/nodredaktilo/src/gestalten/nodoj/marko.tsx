// Spec 054 (MP-1, T4): the node Marke – the start of phase 4, after the mockup: a pill with a round
// sign in the Primär colour (the brand's initial), the name as written (`etikedoj.marko` or the
// identifier) and „Entwurf · ungeprüft“ in mono below it; one output port `marko.el` (kind Marke).
// It writes nothing. The sign's colour is content (the Bildo's Primär hex, inline); its letter takes
// the text role that stands out on it – the dark or the light text of the canvas, chosen by the
// colour's luminance, so no literal colour is needed. Self-contained: its rules live here.
//
// Spec 056 (T2, Teil M): two inputs – Text on the left (`marko.en.teksto`), Bild at the top edge
// (`marko.en.bildo`) – and below the head what arrives (`markoEnhavo` of the shell), each part only
// when something arrives: „Kern“ (purpose and promise, three lines each), „Werte“ (pills in the
// order of Werte), „Beispiele“ (the detected colours as dots, largest first), „Dazu“ (the names of
// the other connected nodes with a content). Nothing arrives: it looks as before. The width stays,
// the node grows downward; it only shows, it writes nothing.
//
// Marks for scripts: `[data-nr-nodo=marko]`, `[data-nr-marko-signo]` (the round sign),
// `[data-nr-marko-enhavo]` with `[data-nr-marko-teil=kern|werte|beispiele|dazu]`.

import {
  ENHAVO_ETIKEDOJ,
  MARKO_BILDO_ENIR,
  MARKO_ETIKEDOJ,
  MARKO_TEKSTO_ENIR,
  type MarkoEnhavo,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";
import { Anschluss } from "../anschluss.js";
import { type MarkoFlowNodo, useGestalten } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoSxelo } from "../sxelo.js";

const STILO = `
.nr-g-marko {
  border-radius: calc((var(--fm-size-control-large) + var(--fm-spacing-large)) / 2);
}
.nr-g-marko-kapo {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-medium);
  block-size: calc(var(--fm-size-control-large) + var(--fm-spacing-large));
  padding: 0 var(--fm-spacing-medium) 0 var(--fm-spacing-small);
}
.nr-g-marko-enhavo { padding: 0 var(--fm-spacing-large) var(--fm-spacing-small); }
.nr-g-marko-enhavo > div {
  padding-block: var(--fm-spacing-small);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-marko-enhavo small {
  display: block;
  margin-block-end: var(--fm-spacing-xsmall);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-marko-enhavo p {
  margin: 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nr-g-marko-enhavo p + p { margin-block-start: var(--fm-spacing-xsmall); color: ${ROLOJ.mallauta}; }
.nr-g-marko-enhavo p.nr-g-mallauta { color: ${ROLOJ.mallauta}; }
.nr-g-marko-werte { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-xsmall); }
.nr-g-marko-werte > span {
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-semibold);
  padding: 0 var(--fm-spacing-medium);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-pill);
  overflow-wrap: anywhere;
}
.nr-g-marko-farben { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-xsmall); }
.nr-g-marko-farben > i {
  inline-size: var(--fm-size-icon-small);
  block-size: var(--fm-size-icon-small);
  border-radius: var(--fm-radius-full);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-marko-signo {
  display: grid;
  place-items: center;
  flex: none;
  inline-size: var(--fm-size-control-medium);
  block-size: var(--fm-size-control-medium);
  border-radius: var(--fm-radius-full);
  background: var(--nr-g-marko-fono, ${ROLOJ.pinto});
  color: var(--nr-g-marko-litero, ${ROLOJ.teksto});
  font-weight: var(--fm-font-weight-bold);
}
.nr-g-marko-nomo { min-inline-size: 0; }
.nr-g-marko-nomo b { display: block; font-weight: var(--fm-font-weight-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* As in the mockup the state line is smaller than a caption, so it fits the pill. */
.nr-g-marko-nomo small { display: block; margin-block-start: var(--fm-spacing-xsmall); font-family: var(--fm-font-family-code); font-size: calc(var(--fm-typography-caption-font-size) * 0.8); color: ${ROLOJ.mallauta}; white-space: nowrap; }
@media (prefers-reduced-motion: no-preference) {
  .nr-g-marko-signo { transition: background-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
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
 * The text role that reads on the brand colour: on a light colour the dark text of the canvas, on a
 * dark one the light text. The canvas's default text is light in dark and dark in light; its
 * inverse is the other one.
 */
function literoRolo(hex: string, malhela: boolean): string | undefined {
  const l = luminanco(hex);
  if (l === undefined) return undefined;
  // The luminance where black and white text have the same contrast on the colour.
  const helaFono = l > 0.179;
  const defaultHela = malhela;
  return helaFono === defaultHela ? "var(--fm-color-text-inverse)" : ROLOJ.teksto;
}

/** The parts of what arrives at the Marke, each only when something arrives (Teil M). */
function MarkoEnhavoj({ enhavo }: { enhavo: MarkoEnhavo }) {
  const { kern, werte, farben, dazu } = enhavo;
  const teile = [
    kern === undefined ? null : (
      <div key="kern" data-nr-marko-teil="kern">
        <small>{MARKO_ETIKEDOJ.kern}</small>
        {kern.zweck === undefined ? null : <p>{kern.zweck}</p>}
        {kern.versprechen === undefined ? null : <p>{kern.versprechen}</p>}
      </div>
    ),
    werte === undefined || werte.length === 0 ? null : (
      <div key="werte" data-nr-marko-teil="werte">
        <small>{MARKO_ETIKEDOJ.werte}</small>
        <span className="nr-g-marko-werte">
          {werte.map((w) => (
            <span key={w.id} data-nr-marko-wert={w.id}>
              {w.text}
            </span>
          ))}
        </span>
      </div>
    ),
    farben === undefined || farben.length === 0 ? null : (
      <div key="beispiele" data-nr-marko-teil="beispiele">
        <small>{MARKO_ETIKEDOJ.beispiele}</small>
        <span className="nr-g-marko-farben">
          {farben.map((f) => (
            <i
              key={f.hex}
              title={`${f.hex} · ${Math.round(f.anteil)} %`}
              style={{ background: f.hex }}
              data-nr-marko-farbo={f.hex}
            />
          ))}
        </span>
      </div>
    ),
    dazu === undefined || dazu.length === 0 ? null : (
      <div key="dazu" data-nr-marko-teil="dazu">
        <small>{MARKO_ETIKEDOJ.dazu}</small>
        <p className="nr-g-mallauta">{dazu.map((id) => ENHAVO_ETIKEDOJ[id]).join(" · ")}</p>
      </div>
    ),
  ].filter((teil) => teil !== null);
  if (teile.length === 0) return null;
  return (
    <div className="nr-g-marko-enhavo" data-nr-marko-enhavo="">
      {teile}
    </div>
  );
}

export function MarkoNodo({ data }: NodeProps<MarkoFlowNodo>) {
  useStilo("marko", STILO);
  const { bildo, skemo, markoEnhavo } = useGestalten();
  const primaer = bildo.nodoj.find((n) => n.id === "farbo-primaer");
  const hex = primaer?.speco === "farbo" ? primaer.hex : "";
  const nomo = bildo.marko.etikedo;
  const litero = [...nomo.trim()][0]?.toLocaleUpperCase("de-DE") ?? "";
  const litera = literoRolo(hex, skemo === "dunkel");
  const stilo = {
    ...(hex === "" ? {} : { "--nr-g-marko-fono": hex }),
    ...(litera === undefined ? {} : { "--nr-g-marko-litero": litera }),
  } as CSSProperties;
  return (
    <NodoSxelo id={data.nodo.id} ringo={hex} className="nr-g-marko" style={{ paddingBlockEnd: 0 }}>
      <div className="nr-g-marko-kapo">
        <span className="nr-g-marko-signo" aria-hidden="true" style={stilo} data-nr-marko-signo="">
          {litero}
        </span>
        <span className="nr-g-marko-nomo">
          <b>{nomo}</b>
          <small>Entwurf · ungeprüft</small>
        </span>
      </div>
      <MarkoEnhavoj enhavo={markoEnhavo} />
      <Anschluss port={MARKO_TEKSTO_ENIR} supro={28} />
      <Anschluss port={MARKO_BILDO_ENIR} supro={0} rando="supro" />
      <Anschluss port="marko.el" supro={28} />
    </NodoSxelo>
  );
}
