// Spec 040 B-1: the parts of the Vitrino, the one source for playwright.vitrino.config.ts, the
// completeness test (vitrino-partoj.test.ts) and workflow.test.ts (the CI matrices). No imports:
// pure data and one pure function, so a test of another package can import it.

/** A title path from the file down: describe titles, then the beginning of a test title. */
export type Titolvojo = readonly string[];

/** The Werkstatt (its two describes) and the rest of the Vitrino. */
export type VitrinoGrupo = "werkstatt" | "cetero";

/** A part: the tests under some title paths, or the rest of its group. */
export type VitrinoTeil =
  | { readonly grupo: VitrinoGrupo; readonly prefiksoj: readonly Titolvojo[] }
  | { readonly grupo: VitrinoGrupo; readonly resto: true };

export type VitrinoParto = string;

export const VITRINO_PARTOJ: Readonly<Record<VitrinoParto, VitrinoTeil>> = {};

/** The Playwright selection for a value of VITRINO_PARTO; unset or empty selects everything. */
export function vitrinoAuswahl(value: string | undefined): {
  grep?: RegExp[];
  grepInvert?: RegExp[];
} {
  if (value === undefined || value === "") return {};
  throw new Error(`VITRINO_PARTO: unknown part "${value}"`);
}
