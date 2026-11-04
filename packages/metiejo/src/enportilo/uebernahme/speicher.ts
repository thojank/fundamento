// The proposals per step of a brand (Spec 036 Teil 4): marken/<name>/uebernahme.json beside the
// proposal store of the Enportilo (enportilo.json), out of every repository. The last reading wins
// per step, except that an open step never replaces a value an earlier material gave.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { markoDir } from "../../marko.js";
import { istOffen, SCHRITT_IDS, type Vorschlag } from "./vorschlag.js";

export const UEBERNAHME_FILE = "uebernahme.json";

/** The proposals per step of a brand, in the order of the steps; none before the first reading. */
export function readVorschlagoj(workdir: string, name: string): Vorschlag[] {
  const file = join(markoDir(workdir, name), UEBERNAHME_FILE);
  if (!existsSync(file)) return [];
  const value = JSON.parse(readFileSync(file, "utf8")) as { vorschlagoj?: Vorschlag[] };
  return Array.isArray(value.vorschlagoj) ? value.vorschlagoj : [];
}

/** Merges the proposals of a reading into the brand's: a value replaces, open only fills a gap. */
export function writeVorschlagoj(
  workdir: string,
  name: string,
  vorschlagoj: readonly Vorschlag[],
): Vorschlag[] {
  const merged = new Map(readVorschlagoj(workdir, name).map((entry) => [entry.schritt, entry]));
  for (const vorschlag of vorschlagoj) {
    const known = merged.get(vorschlag.schritt);
    if (istOffen(vorschlag) && known !== undefined && !istOffen(known)) continue;
    merged.set(vorschlag.schritt, vorschlag);
  }
  const ordered = SCHRITT_IDS.flatMap((id) => {
    const entry = merged.get(id);
    return entry === undefined ? [] : [entry];
  });
  const dir = markoDir(workdir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, UEBERNAHME_FILE),
    `${JSON.stringify({ vorschlagoj: ordered }, null, 2)}\n`,
  );
  return ordered;
}
