// Spec 047 (NE-1, T4): the brand on the canvas. React Flow's stylesheet reads each of its colours,
// strokes, radii and shadows as `var(--xy-<name>, var(--xy-<name>-default))`; this map sets every
// such `--xy-<name>` the injected stylesheet (@xyflow/react 12.12.1, dist/style.css) reads to a
// role of the brand, so the library's own defaults are never reached. The `-default` variables are
// the library's fallbacks behind them, the `-props` ones are written by its components from props
// this canvas never passes. Light and dark follow `data-fm-color-scheme` on the page root, because
// the roles change there; nothing here names a scheme. No token is added, no literal value is used
// (B-2: no CSS file, the map goes on the canvas as an inline style).

import type { CSSProperties } from "react";

/** A React Flow variable and the brand role it takes. */
export type XyRoloj = Readonly<Record<`--xy-${string}`, `var(--fm-${string})`>>;

/** A border shorthand of three brand roles: width, style, colour. */
type Rando = `var(--fm-${string}) var(--fm-${string}) var(--fm-${string})`;

const rando = (stilo: "solid" | "dashed", koloro: string): Rando =>
  `var(--fm-border-width-default) var(--fm-stroke-${stilo}) var(--fm-color-${koloro})`;

export const XY_ROLOJ = {
  // Pane and its dot pattern (<Background>).
  "--xy-background-color": "var(--fm-color-background-canvas)",
  "--xy-background-pattern-color": "var(--fm-color-border-default)",
  // Edges, their labels and the connection line (never drawn: nodes are not connectable).
  "--xy-edge-stroke": "var(--fm-color-border-strong)",
  "--xy-edge-stroke-selected": "var(--fm-color-focus-ring)",
  "--xy-edge-stroke-width": "var(--fm-border-width-default)",
  "--xy-edge-label-background-color": "var(--fm-color-background-canvas)",
  "--xy-edge-label-color": "var(--fm-color-text-muted)",
  "--xy-connectionline-stroke": "var(--fm-color-border-strong)",
  "--xy-connectionline-stroke-width": "var(--fm-border-width-default)",
  // Nodes (the built-in node types; the canvas's own nodes are fm-karto and carry the brand).
  "--xy-node-color": "var(--fm-color-text-default)",
  "--xy-node-background-color": "var(--fm-color-background-default)",
  "--xy-node-group-background-color": "var(--fm-color-background-sunken)",
  "--xy-node-border": rando("solid", "border-default"),
  "--xy-node-border-radius": "var(--fm-radius-role-surface)",
  "--xy-node-boxshadow-hover": "var(--fm-elevation-shadow-raised)",
  "--xy-node-boxshadow-selected": "var(--fm-elevation-shadow-floating)",
  // Handles at the node edges.
  "--xy-handle-background-color": "var(--fm-color-border-strong)",
  "--xy-handle-border-color": "var(--fm-color-background-canvas)",
  // Selection rectangle (unused while nothing is selectable) and resize handles.
  "--xy-selection-background-color": "var(--fm-color-status-info-subtle)",
  "--xy-selection-border": rando("dashed", "focus-ring"),
  "--xy-resize-background-color": "var(--fm-color-focus-ring)",
  // Controls.
  "--xy-controls-box-shadow": "var(--fm-elevation-shadow-raised)",
  "--xy-controls-button-background-color": "var(--fm-color-background-raised)",
  "--xy-controls-button-background-color-hover": "var(--fm-color-background-sunken)",
  "--xy-controls-button-color": "var(--fm-color-text-default)",
  "--xy-controls-button-color-hover": "var(--fm-color-text-default)",
  "--xy-controls-button-border-color": "var(--fm-color-border-subtle)",
  // Attribution (stays visible, B-4).
  "--xy-attribution-background-color": "var(--fm-color-background-raised)",
  // Minimap (not shown in NE-1; mapped so it carries the brand once it is).
  "--xy-minimap-background-color": "var(--fm-color-background-raised)",
  "--xy-minimap-mask-background-color": "var(--fm-color-backdrop)",
  "--xy-minimap-mask-stroke-color": "var(--fm-color-border-subtle)",
  "--xy-minimap-mask-stroke-width": "var(--fm-border-width-default)",
  "--xy-minimap-node-background-color": "var(--fm-color-background-sunken)",
  "--xy-minimap-node-stroke-color": "var(--fm-color-border-default)",
  "--xy-minimap-node-stroke-width": "var(--fm-border-width-default)",
} as const satisfies XyRoloj;

/** The canvas's own type and text: the body role of the brand. */
export const TEKSTO_STILO = {
  fontFamily: "var(--fm-typography-body-1-font-family)",
  fontSize: "var(--fm-typography-body-1-font-size)",
  lineHeight: "var(--fm-typography-body-1-line-height)",
  color: "var(--fm-color-text-default)",
} as const satisfies CSSProperties;

/** The labels on the edges ("12 Abhängigkeiten"): the caption role of the brand. */
export const RANDETIKEDO_STILO = {
  fontFamily: "var(--fm-typography-caption-font-family)",
  fontSize: "var(--fm-typography-caption-font-size)",
  fontWeight: "var(--fm-typography-caption-font-weight)",
} as const satisfies CSSProperties;

/** The role map as the style of the <ReactFlow> element (custom properties are no CSSProperties keys). */
export const XY_STILO: CSSProperties & XyRoloj = XY_ROLOJ;
