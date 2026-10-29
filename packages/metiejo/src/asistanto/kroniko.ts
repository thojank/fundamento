// The Kroniko of a brand (Spec 033 S1, Constitution v2.5 Art. VI): marken/<name>/kroniko.jsonl, one
// entry per line ($defs/KronikoEro) – every proposal, change, take-over, release, reopening,
// declaration of a foreign basis, confirmation, notice and chat turn, with time, source, model and
// cost. Append-only; the state of the Facetoj is read from it. `persono` and `rolo` stay empty while
// the Metiejo runs for one person: the place for a database with person and role is kept. Every text
// passes the redaction of the provider before it is written, so no key reaches the file.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { KronikoEro } from "@fundamento/modelo";

export type { KronikoEro } from "@fundamento/modelo";

export const KRONIKO_FILE = "kroniko.jsonl";

export type KronikoInput = Omit<KronikoEro, "tempo"> & { tempo?: string };

/** Appends one entry; `redact` takes every key out of the texts first. */
export function appendKroniko(
  workdir: string,
  name: string,
  input: KronikoInput,
  redact: (text: string) => string = (text) => text,
): KronikoEro {
  const entry: KronikoEro = {
    tempo: input.tempo ?? new Date().toISOString(),
    ago: input.ago,
    fonto: input.fonto,
    ...(input.faceto === undefined ? {} : { faceto: input.faceto }),
    ...(input.teksto === undefined ? {} : { teksto: input.teksto }),
    ...(input.modelo === undefined ? {} : { modelo: input.modelo }),
    ...(input.kosto === undefined ? {} : { kosto: input.kosto }),
    ...(input.detaloj === undefined ? {} : { detaloj: input.detaloj }),
    persono: null,
    rolo: null,
  };
  const dir = join(workdir, name);
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, KRONIKO_FILE), `${redact(JSON.stringify(entry))}\n`);
  return entry;
}

/** The entries of a brand in the order they were written; none without a file. */
export function readKroniko(workdir: string, name: string): KronikoEro[] {
  const file = join(workdir, name, KRONIKO_FILE);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as KronikoEro);
}
