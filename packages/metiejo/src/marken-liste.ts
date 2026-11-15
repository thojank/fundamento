// Spec 055 T6 (LNS-1.3): the Markenliste of the start screen. Every brand of the working directory
// as one row: its folder name (for the link), its Etikett, whether its agordo.json reads, three
// swatches from the current draft (Primär, Akzent where set, Neutral step 100 of the derivation),
// the newest mtime of agordo.json, entwurf.json and leinwand.json, and the number of Stände files.
// Newest first, then by name. The sorter and the formatters are pure; `markenListeDe` is the thin
// I/O edge over `listMarkoj`, `readMarko` and `markoDir`. No check runs: the list carries no
// judgment (Spec 055 H).

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Agordo, DerivedPalettes } from "@fundamento/agordilo";
import { paletrojDe } from "./grafeo-gestalten.js";
import { LEINWAND_DOSIERO, STAENDE_DIR, STAND_SUFIKSO } from "./leinwand-dosieroj.js";
import { listMarkoj, markoDir, readMarko } from "./marko.js";
import { hexOf } from "./sxtupoj.js";
import type { Bases } from "./vorschau.js";

/** One brand of the Markenliste (tech spec T6). */
export interface MarkenZeile {
  /** The folder name (for the link). */
  name: string;
  /** `etikedoj.marko` of the draft, else the folder name. */
  etikedo: string;
  /** Whether agordo.json reads; an unreadable brand has no swatches and no link. */
  lesbar: boolean;
  /** From the draft, like the Stände: `#rrggbb`; Neutral is "" when the derivation fails. */
  farben?: { primaer: string; akzent?: string; neutral: string };
  /** ISO time: the newest mtime of agordo.json, entwurf.json and leinwand.json. */
  geaendert: string;
  /** The number of `*.json` files in `staende/`. */
  staende: number;
}

/** The files whose newest mtime is „zuletzt geändert“ of a brand. */
const GEAENDERT_DOSIEROJ = ["agordo.json", "entwurf.json", LEINWAND_DOSIERO] as const;

/** The swatches of an Agordo: Primär as hex, Akzent only when set, Neutral the light step 100. */
export function markenFarbenDe(
  agordo: Agordo,
  palettes: DerivedPalettes | undefined,
): NonNullable<MarkenZeile["farben"]> {
  const neutral =
    palettes?.steps.find((step) => step.palette === "neutral" && step.step === "100")?.hex ?? "";
  const akzent = agordo.zweitfarbe?.farbe;
  return {
    primaer: hexOf(agordo.leitfarbe),
    ...(akzent === undefined ? {} : { akzent: hexOf(akzent) }),
    neutral,
  };
}

/** Newest first; at the same time by name. */
export function markenListeSortiert(zeilen: readonly MarkenZeile[]): MarkenZeile[] {
  return [...zeilen].sort((a, b) =>
    a.geaendert === b.geaendert
      ? a.name.localeCompare(b.name, "en")
      : a.geaendert < b.geaendert
        ? 1
        : -1,
  );
}

const zwei = (zahl: number): string => String(zahl).padStart(2, "0");

/** A time as „15.11.2026, 14:41“ in the local time of the server. */
export function zeitpunktText(iso: string): string {
  const zeit = new Date(iso);
  return `${zwei(zeit.getDate())}.${zwei(zeit.getMonth() + 1)}.${zeit.getFullYear()}, ${zwei(zeit.getHours())}:${zwei(zeit.getMinutes())}`;
}

/** „0 Stände“, „1 Stand“, „N Stände“. */
export const staendeText = (anzahl: number): string =>
  anzahl === 1 ? "1 Stand" : `${anzahl} Stände`;

/** The newest mtime of the files that exist, as ISO time. */
function geaendertDe(dir: string): string {
  const zeiten = GEAENDERT_DOSIEROJ.map((datei) => join(dir, datei))
    .filter((pfad) => existsSync(pfad))
    .map((pfad) => statSync(pfad).mtimeMs);
  return new Date(Math.max(0, ...zeiten)).toISOString();
}

/** The number of Stand files (`*.json`, files only) in `staende/`; 0 without the folder. */
function staendeDe(dir: string): number {
  const staende = join(dir, STAENDE_DIR);
  if (!existsSync(staende)) return 0;
  return readdirSync(staende, { withFileTypes: true }).filter(
    (entry) => entry.isFile() && entry.name.endsWith(STAND_SUFIKSO),
  ).length;
}

/** The Markenliste of a working directory (I/O edge): one row per brand, newest first. */
export function markenListeDe(workdir: string, bases: Bases): MarkenZeile[] {
  return markenListeSortiert(
    listMarkoj(workdir).map((name): MarkenZeile => {
      const dir = markoDir(workdir, name);
      const geaendert = geaendertDe(dir);
      const staende = staendeDe(dir);
      const marko = readMarko(workdir, name);
      if (marko === undefined) return { name, etikedo: name, lesbar: false, geaendert, staende };
      const draft = marko.draft;
      return {
        name,
        etikedo: draft.etikedoj?.marko ?? name,
        lesbar: true,
        farben: markenFarbenDe(draft, paletrojDe(draft, bases)),
        geaendert,
        staende,
      };
    }),
  );
}
