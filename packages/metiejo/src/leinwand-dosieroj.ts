// Spec 055 (D-1): the file names of the canvas state and the named Stände inside the folder of a
// brand – `marken/<name>/leinwand.json`, `marken/<name>/staende/<id>.json`, and the backup of an
// unreadable canvas state `marken/<name>/leinwand.unlesbar-<ISO time without colons>.json`. The one
// place these names live; the Markenliste (LNS-1.3), the canvas state (LNS-2.2) and the Stände
// (LNS-3.1) import them. Pure: names only, no I/O.

/** The canvas state of a brand, beside agordo.json and entwurf.json. */
export const LEINWAND_DOSIERO = "leinwand.json";

/** The folder of the named Stände of a brand. */
export const STAENDE_DIR = "staende";

/** The ending of a Stand file in `staende/` (`<id>.json`); only such files count as Stände. */
export const STAND_SUFIKSO = ".json";

/** The start of the backup name of an unreadable canvas state. */
export const LEINWAND_UNLESBAR_PRAEFIKSO = "leinwand.unlesbar-";

/**
 * The backup name of an unreadable canvas state at a time: `leinwand.unlesbar-<ISO time without
 * colons>.json`, for example `leinwand.unlesbar-2026-11-15T144107.123Z.json` (UTC, so the name is
 * the same wherever the server runs).
 */
export function leinwandUnlesbarDosiero(zeit: Date): string {
  return `${LEINWAND_UNLESBAR_PRAEFIKSO}${zeit.toISOString().replaceAll(":", "")}.json`;
}

/** The file of one Stand in `staende/`. */
export const standDosiero = (id: string): string => `${id}${STAND_SUFIKSO}`;
