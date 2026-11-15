// Spec 054 (MP-1, T3, E-12): a phase as a group node. A calm surface with its own head (the number
// as a small sign, the name in capitals). The head is the drag handle (`FAZO_TENILO`); the surface
// lets the pointer through (`pointer-events: none` on the node, set by the canvas), so a drag that
// starts there pans the canvas – React Flow marks every draggable node `nopan`, and the body must
// not be one. Its nodes carry `parentId` and places relative to it, so they move with it; no
// `extent: "parent"`, so they may lie beyond its border. No ports. Empty phases (1, 2, 3, 6 in
// MP-1) show one quiet line „kommt später“.

import type { NodeProps } from "@xyflow/react";
import type { FazoFlowNodo } from "../kunteksto.js";
import { ROLOJ, useStilo } from "../roloj.js";

/** The class of the head; the canvas gives it to React Flow as the phase's `dragHandle`. */
export const FAZO_TENILO = "nr-g-fazo-kapo";

const STILO = `
.nr-g-fazo {
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  background: ${ROLOJ.fazo};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-large);
  position: relative;
}
.react-flow__node.selected > .nr-g-fazo { box-shadow: 0 0 0 var(--fm-border-width-focus) ${ROLOJ.mallauta}; }
.react-flow__node.dragging > .nr-g-fazo { box-shadow: var(--fm-elevation-shadow-floating), 0 0 0 var(--fm-border-width-focus) ${ROLOJ.mallauta}; }
.nr-g-fazo-kapo {
  pointer-events: all;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-medium);
  block-size: var(--fm-size-control-medium);
  padding-inline: calc(var(--fm-spacing-medium) + var(--fm-spacing-small));
  border-block-end: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-start-start-radius: var(--fm-radius-large);
  border-start-end-radius: var(--fm-radius-large);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
}
.nr-g-fazo-kapo:hover { background: ${ROLOJ.pinto}; color: ${ROLOJ.teksto}; }
.react-flow__node.dragging .nr-g-fazo-kapo { cursor: grabbing; }
.nr-g-fazo-nr {
  flex: none;
  display: grid;
  place-items: center;
  inline-size: var(--fm-size-icon-small);
  block-size: var(--fm-size-icon-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-role-tag);
  font-family: var(--fm-font-family-code);
  letter-spacing: 0;
}
.nr-g-fazo-poste {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 46%;
  text-align: center;
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
`;

export function FazoNodo({ data }: NodeProps<FazoFlowNodo>) {
  useStilo("fazo", STILO);
  const { nodo } = data;
  return (
    <div className="nr-g-fazo" data-nr-fazo={nodo.id}>
      <div className={FAZO_TENILO}>
        <span className="nr-g-fazo-nr">{nodo.nr}</span>
        <span>{nodo.titolo}</span>
      </div>
      {nodo.malplena ? <div className="nr-g-fazo-poste">kommt später</div> : null}
    </div>
  );
}
