// Spec 054 (MP-1, T3): the roles of the view Gestalten. Every colour, line, radius and shadow here
// is a `var(--fm-*)` of the neutral Belegung the page loads (`/nodredaktilo/leinwand.css`), or a
// `--xy-*` that points at one; no literal value (AK-22, test `grafeo-literale-054`). Light and dark
// are the same roles: the Belegung switches them with `data-fm-color-scheme` on the root, so no
// piece of the view asks for the scheme. The brand's own colours are content, not roles: they come
// from the Bildo and are set inline (swatches, steps, colour ports, colour edges).
//
// The view has no CSS file (047 B-2). Each module keeps its rules in a string and injects it once
// with `useStilo`; a node file that replaces a placeholder does the same with its own id.
// Spec 056 (T2, Teil V, plan D-17): every edge is a dashed curve with round ends in `ROLOJ.kanto`
// (a colour edge keeps its colour); an edge from an empty or detached source is only fainter; ports
// and signs are round, filled when connected, a ring otherwise, in their kind's colour.

import type { Anschlussart, Zeichen } from "@fundamento/metiejo/gestalten";
import { type CSSProperties, useInsertionEffect } from "react";
import type { XyRoloj } from "../roloj.js";

/** The surfaces, lines and texts of the canvas (mockup name → role). */
export const ROLOJ = {
  /** The stage behind everything (`--grund`). */
  scenejo: "var(--fm-color-background-canvas)",
  /** The dots of the stage (`--punkt`). */
  punkto: "var(--fm-color-border-subtle)",
  /** The calm surface of a phase (`--gruppe`). */
  fazo: "var(--fm-color-background-default)",
  /** A node, the header groups, the zoom box (`--flaeche`). */
  nodo: "var(--fm-color-background-raised)",
  /** Lifted layers: the list „+ Knoten“, popovers (`--flaeche-2`). */
  tavolo: "var(--fm-color-background-raised)",
  /** Hover and pressed fills of flat controls (`--chip`). */
  pinto: "var(--fm-color-background-sunken)",
  /** Thin lines of phases and nodes (`--linie`). */
  linio: "var(--fm-color-border-subtle)",
  /** Lines under the pointer, tags, empty frames (`--linie-2`, `--linie-3`). */
  linioForta: "var(--fm-color-border-default)",
  teksto: "var(--fm-color-text-default)",
  /** Quiet text: heads, values, hints (`--leise`, `--leiser`). */
  mallauta: "var(--fm-color-text-muted)",
  /** The ring of a selected phase or of a node without a colour of its own. */
  ringo: "var(--fm-color-focus-ring)",
  /**
   * Spec 056 (Teil V): every edge that is no colour edge – Marke, Maß, Text, Bild, Schrift – the
   * light grey of the mockup's `--kg`, the role React Flow's edges already take (`--xy-edge-stroke`).
   */
  kanto: "var(--fm-color-text-muted)",
  ombro: "var(--fm-elevation-shadow-floating)",
  ombroTavolo: "var(--fm-elevation-shadow-overlay)",
} as const;

/**
 * The kinds of ports and catalog signs (D-8, R-12). Marke takes the text colour; Maß, Text and
 * Schrift take three syntax roles, which the neutral Belegung still derives from coloured status
 * palettes; the catalog-only kinds take the last syntax role and the muted text. Farbe has no role:
 * a colour port carries its colour (inline); without one it falls back to `farbo` here.
 */
export const ART_ROLOJ: Readonly<Record<Zeichen, `var(--fm-${string})`>> = {
  marko: "var(--fm-color-text-default)",
  farbo: "var(--fm-color-text-muted)",
  mezuro: "var(--fm-color-syntax-string)",
  teksto: "var(--fm-color-syntax-name)",
  tiparo: "var(--fm-color-syntax-number)",
  bildo: "var(--fm-color-syntax-keyword)",
  ki: "var(--fm-color-text-muted)",
};

/** The German name of each port kind, as the legend and the catalog show it. */
export const ART_NOMOJ: Readonly<Record<Anschlussart, string>> = {
  teksto: "Text",
  farbo: "Farbe",
  tiparo: "Schrift",
  mezuro: "Maß",
  marko: "Marke",
  bildo: "Bild",
};

/** The colour a port, sign or edge of `art` is drawn in: the brand colour for Farbe, else a role. */
export function artKoloro(art: Zeichen, hex?: string): string {
  return art === "farbo" && hex !== undefined && hex !== "" ? hex : ART_ROLOJ[art];
}

/** React Flow's variables on the roles of the Belegung (the 047 map, re-pointed for Gestalten). */
export const GESTALTEN_XY_ROLOJ = {
  "--xy-background-color": ROLOJ.scenejo,
  "--xy-background-pattern-color": ROLOJ.punkto,
  "--xy-edge-stroke": "var(--fm-color-text-muted)",
  "--xy-edge-stroke-selected": "var(--fm-color-text-default)",
  "--xy-edge-stroke-width": "var(--fm-border-width-default)",
  "--xy-edge-label-background-color": ROLOJ.scenejo,
  "--xy-edge-label-color": ROLOJ.mallauta,
  "--xy-connectionline-stroke": "var(--fm-color-text-muted)",
  "--xy-connectionline-stroke-width": "var(--fm-border-width-strong)",
  "--xy-node-color": ROLOJ.teksto,
  "--xy-node-background-color": ROLOJ.nodo,
  "--xy-node-group-background-color": ROLOJ.fazo,
  "--xy-node-border":
    "var(--fm-border-width-default) var(--fm-stroke-solid) var(--fm-color-border-subtle)",
  "--xy-node-border-radius": "var(--fm-radius-medium)",
  "--xy-node-boxshadow-hover": "var(--fm-elevation-shadow-raised)",
  "--xy-node-boxshadow-selected": ROLOJ.ombro,
  "--xy-handle-background-color": ROLOJ.scenejo,
  "--xy-handle-border-color": ROLOJ.mallauta,
  "--xy-selection-background-color": "var(--fm-color-background-sunken)",
  "--xy-selection-border":
    "var(--fm-border-width-default) var(--fm-stroke-dashed) var(--fm-color-focus-ring)",
  "--xy-resize-background-color": ROLOJ.ringo,
  "--xy-controls-box-shadow": "var(--fm-elevation-shadow-raised)",
  "--xy-controls-button-background-color": ROLOJ.nodo,
  "--xy-controls-button-background-color-hover": ROLOJ.pinto,
  "--xy-controls-button-color": ROLOJ.teksto,
  "--xy-controls-button-color-hover": ROLOJ.teksto,
  "--xy-controls-button-border-color": ROLOJ.linio,
  "--xy-attribution-background-color": ROLOJ.nodo,
  "--xy-minimap-background-color": ROLOJ.nodo,
  "--xy-minimap-mask-background-color": "var(--fm-color-backdrop)",
  "--xy-minimap-mask-stroke-color": ROLOJ.linio,
  "--xy-minimap-mask-stroke-width": "var(--fm-border-width-default)",
  "--xy-minimap-node-background-color": ROLOJ.pinto,
  "--xy-minimap-node-stroke-color": ROLOJ.linioForta,
  "--xy-minimap-node-stroke-width": "var(--fm-border-width-default)",
} as const satisfies XyRoloj;

/** The type of the view: the body role of the Belegung. */
export const TEKSTO_STILO = {
  fontFamily: "var(--fm-typography-body-1-font-family)",
  fontSize: "var(--fm-typography-body-2-font-size, var(--fm-typography-caption-font-size))",
  lineHeight: "var(--fm-typography-body-1-line-height)",
  color: ROLOJ.teksto,
} as const satisfies CSSProperties;

/** The role map plus the type as the style of the view's root. */
export const GESTALTEN_STILO: CSSProperties & XyRoloj = { ...GESTALTEN_XY_ROLOJ, ...TEKSTO_STILO };

/**
 * The classes every node and control of the view shares. React Flow reads `nodrag` (a pointer that
 * starts here never moves the node, R-8), `nowheel` (the wheel scrolls here, not the canvas) and
 * `nopan`. Every control inside a node carries at least `NODRAG`.
 */
export const NODRAG = "nodrag";
export const NOWHEEL = "nowheel";
export const NOPAN = "nopan";

/** Injects a module's rules once per document, under `id`, before the first paint that needs them. */
export function useStilo(id: string, css: string): void {
  useInsertionEffect(() => {
    const elementId = `nr-g-stilo-${id}`;
    if (document.getElementById(elementId) !== null) return;
    const stilo = document.createElement("style");
    stilo.id = elementId;
    stilo.textContent = css;
    document.head.append(stilo);
  }, [id, css]);
}

/**
 * The shared rules: stage, node frame and head, tag, sign, port, edge, the calm empty and detached
 * states. Motion only under `prefers-reduced-motion: no-preference`, so without it nothing moves.
 */
export const BAZA_STILO = `
.nr-g { position: fixed; inset: 0; background: ${ROLOJ.scenejo}; }
.nr-g .react-flow__pane { cursor: default; }
.nr-g .react-flow__pane.dragging { cursor: grabbing; }
.nr-g .react-flow__node { cursor: grab; }
.nr-g .react-flow__node.dragging { cursor: grabbing; }
.nr-g .mono { font-family: var(--fm-font-family-code); }
.nr-g .nr-g-mallauta { color: ${ROLOJ.mallauta}; }

.nr-g-nodo {
  position: relative;
  box-sizing: border-box;
  background: ${ROLOJ.nodo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-medium);
  color: ${ROLOJ.teksto};
  padding-block-end: var(--fm-spacing-large);
}
.nr-g-nodo:hover { border-color: ${ROLOJ.linioForta}; }
.nr-g-nodo[data-nr-leer] { border-style: var(--fm-stroke-dashed); }
.nr-g-nodo[data-nr-abgehaengt] > :not(.react-flow__handle) { opacity: var(--fm-opacity-disabled); }
.react-flow__node.selected > .nr-g-nodo {
  box-shadow: 0 0 0 var(--fm-border-width-focus) var(--nr-g-ringo, ${ROLOJ.ringo});
}
.react-flow__node.dragging > .nr-g-nodo {
  border-color: ${ROLOJ.linioForta};
  box-shadow: var(--fm-elevation-shadow-floating), 0 0 0 var(--fm-border-width-focus) var(--nr-g-ringo, ${ROLOJ.ringo});
}

.nr-g-kapo {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-medium);
  padding: var(--fm-spacing-large) var(--fm-spacing-large) 0;
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  line-height: var(--fm-typography-kicker-line-height);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
}
.nr-g-kapo > .nr-g-kapo-nomo { overflow: hidden; text-overflow: ellipsis; }
.nr-g-kapo > .nr-g-kapo-fino { margin-inline-start: auto; display: flex; align-items: center; gap: var(--fm-spacing-small); }

.nr-g-etikedo {
  display: inline-block;
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  font-weight: var(--fm-font-weight-regular);
  letter-spacing: 0;
  text-transform: none;
  color: ${ROLOJ.mallauta};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-tag);
  padding-inline: var(--fm-spacing-small);
  white-space: nowrap;
}

.nr-g-signo {
  display: inline-block;
  flex: none;
  box-sizing: border-box;
  inline-size: var(--fm-spacing-medium);
  block-size: var(--fm-spacing-medium);
  border: var(--fm-border-width-strong) var(--fm-stroke-solid) var(--nr-g-art);
  border-radius: var(--fm-radius-full);
  background: transparent;
}
.nr-g-signo[data-nr-plena] { background: var(--nr-g-art); }

.react-flow .react-flow__handle.nr-g-anschluss {
  box-sizing: border-box;
  inline-size: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  block-size: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  min-inline-size: 0;
  min-block-size: 0;
  border: var(--fm-border-width-strong) var(--fm-stroke-solid) var(--nr-g-art);
  border-radius: var(--fm-radius-full);
  background: ${ROLOJ.scenejo};
}
.react-flow .react-flow__handle.nr-g-anschluss[data-nr-plena] { background: var(--nr-g-art); }

.nr-g-kanto { fill: none; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: 4 4; stroke-width: calc(var(--fm-border-width-default) * 1.5); }
.react-flow__edge:hover .nr-g-kanto { stroke-width: calc(var(--fm-border-width-default) * 2.75); }
.react-flow__edge.selected .nr-g-kanto { stroke-width: calc(var(--fm-border-width-default) * 3); }
.nr-g-kanto[data-nr-matt] { stroke-opacity: var(--fm-opacity-disabled); }
.nr-g-lumo { fill: none; stroke: ${ROLOJ.teksto}; stroke-width: calc(var(--fm-border-width-default) * 2.5); stroke-linecap: round; opacity: 0; stroke-dasharray: 9 200; pointer-events: none; }

@media (prefers-reduced-motion: no-preference) {
  .nr-g-nodo { transition: border-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), box-shadow var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
  .nr-g-kanto { transition: stroke-width var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
  .react-flow .react-flow__handle.nr-g-anschluss { transition: transform var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
  .react-flow .react-flow__handle.nr-g-anschluss:hover { transform: translate(var(--nr-g-x, -50%), -50%) scale(1.5); }
  .nr-g-lumo { animation: nr-g-lumo 900ms ease-out both; }
  @keyframes nr-g-lumo {
    0% { opacity: 0.95; stroke-dashoffset: 9; }
    85% { opacity: 0.95; }
    100% { opacity: 0; stroke-dashoffset: -100; }
  }
}
`;
