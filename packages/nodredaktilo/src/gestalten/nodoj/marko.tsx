// Spec 054 (MP-1, T4): the node Marke – the start of phase 4, after the mockup: a pill with a round
// sign in the Primär colour (the brand's initial), the name as written (`etikedoj.marko` or the
// identifier) and „Entwurf · ungeprüft“ in mono below it; one output port `marko.el` (kind Marke).
// It writes nothing. The sign's colour is content (the Bildo's Primär hex, inline); its letter takes
// the text role that stands out on it – the dark or the light text of the canvas, chosen by the
// colour's luminance, so no literal colour is needed. Self-contained: its rules live here.
//
// Marks for scripts: `[data-nr-nodo=marko]`, `[data-nr-marko-signo]` (the round sign).

import type { NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";
import { Anschluss } from "../anschluss.js";
import { type MarkoFlowNodo, useGestalten } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";
import { NodoSxelo } from "../sxelo.js";

const STILO = `
.nr-g-marko {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-medium);
  block-size: calc(var(--fm-size-control-large) + var(--fm-spacing-large));
  padding: 0 var(--fm-spacing-medium) 0 var(--fm-spacing-small);
  border-radius: var(--fm-radius-role-pill);
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
.nr-g-marko b { display: block; font-weight: var(--fm-font-weight-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* As in the mockup the state line is smaller than a caption, so it fits the pill. */
.nr-g-marko small { display: block; margin-block-start: var(--fm-spacing-xsmall); font-family: var(--fm-font-family-code); font-size: calc(var(--fm-typography-caption-font-size) * 0.8); color: ${ROLOJ.mallauta}; white-space: nowrap; }
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

export function MarkoNodo({ data }: NodeProps<MarkoFlowNodo>) {
  useStilo("marko", STILO);
  const { bildo, skemo } = useGestalten();
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
      <span className="nr-g-marko-signo" aria-hidden="true" style={stilo} data-nr-marko-signo="">
        {litero}
      </span>
      <span className="nr-g-marko-nomo">
        <b>{nomo}</b>
        <small>Entwurf · ungeprüft</small>
      </span>
      <Anschluss port="marko.el" supro={28} />
    </NodoSxelo>
  );
}
