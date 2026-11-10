// Spec 047 (NE-1, T1): the shared inputs of the grafeo tests. The three sources of the canvas –
// the brand provo (the fixture Agordo over the structure), the reference package komuna and the
// fixture package ekzemplo – with the composed Modelo each graph is read from, so the tests derive
// their expectations (token names, kialo sources) from the data and never pin a count. Variations
// of the files are built in memory; nothing is written to disk.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type Agordo,
  composeFiles,
  derivationBasis,
  packageDocuments,
  packageLabel,
  readAgordo,
} from "@fundamento/agordilo";
import {
  buildModelo,
  CORE_SET_NAME,
  type Modelo,
  type ModeloFiles,
  matchesTokenPattern,
} from "@fundamento/modelo";
import type { Grafeo } from "../grafeo.js";
import { EKZEMPLO_DIR, paketoDosieroj } from "../grafeo-fontoj.js";
import type { Bases } from "../vorschau.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

/** The fixture file of the brand provo (Spec 016); T4 copies it into a server's brand folder. */
export const PROVO_DOSIERO = join(
  repoRoot,
  "packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json",
);

/** The fixture Agordo of the brand provo (Spec 016), read and checked. */
export function provoAgordo(): Agordo {
  const { agordo } = readAgordo(JSON.parse(readFileSync(PROVO_DOSIERO, "utf8")));
  if (agordo === undefined) throw new Error("the provo fixture must be a valid Agordo");
  return agordo;
}

/** The files of an Aspekto package (komuna or the ekzemplo fixture); throws when they are missing. */
export function paketo(label: "komuna" | "ekzemplo"): ModeloFiles {
  const files = paketoDosieroj(label, EKZEMPLO_DIR);
  if (files === undefined) throw new Error(`the files of ${label} must be readable in the repo`);
  return files;
}

/**
 * The Modelo a brand's graph is read from, composed the way the preview composes it (derivation
 * basis, package documents, composed files, buildModelo) – the test's own composition, so the
 * token count it compares against does not come from the code under test.
 */
export function komponitaModelo(agordo: Agordo, bases: Bases): Modelo {
  const { palettes, gestalt } = derivationBasis(agordo, bases.structure, bases.calibration);
  const documents = packageDocuments(agordo, bases.structure, palettes, [], gestalt);
  return buildModelo(composeFiles(bases.structure, packageLabel(agordo), documents, [])).modelo;
}

/** Every distinct token name over every set of a Modelo, sorted. */
export function tokenNomoj(modelo: Modelo): string[] {
  const names = new Set<string>();
  for (const set of modelo.setoj) for (const name of Object.keys(set.tokens)) names.add(name);
  return [...names].sort();
}

/** One graph under test with the Modelo and the Aspekto it was read from. */
export interface Fonto047 {
  nomo: "provo" | "komuna" | "ekzemplo";
  aspekto: string;
  modelo: Modelo;
  /** The kialoj of the Agordo's Jugxoj (empty for a package). */
  jugxoKialoj: string[];
  grafeo: Grafeo;
}

/** The text a deveno entry gives as kialo: `maniero · sxlosilo`, verbatim. */
export function devenoKialo(entry: { maniero: string; sxlosilo: string }): string {
  return `${entry.maniero} · ${entry.sxlosilo}`;
}

/** Whether a Regulo of the Modelo names the token through a pattern of `appliesTo.tokens`. */
export function nomataDeRegulo(modelo: Modelo, aspekto: string, token: string): boolean {
  return modelo.reguloj.some(
    (regulo) =>
      (regulo.aspekto === undefined || regulo.aspekto === aspekto) &&
      (regulo.appliesTo?.tokens ?? []).some((pattern) => matchesTokenPattern(pattern, token)),
  );
}

/**
 * The files with extra tokens in the core set (in memory): `tokens` maps a token name to its DTCG
 * node (`$type`, `$value`). Only the core document is copied; every other document is shared.
 */
export function kunAldonitajTokenoj(
  files: ModeloFiles,
  tokens: Readonly<Record<string, Record<string, unknown>>>,
): ModeloFiles {
  return {
    ...files,
    sets: files.sets.map((set) => {
      if (set.name !== CORE_SET_NAME) return set;
      const value = structuredClone(set.value) as Record<string, unknown>;
      for (const [name, node] of Object.entries(tokens)) {
        const parts = name.split(".");
        const last = parts.pop();
        if (last === undefined) continue;
        let group = value;
        for (const part of parts) {
          const next = group[part];
          if (typeof next === "object" && next !== null && !Array.isArray(next)) {
            group = next as Record<string, unknown>;
          } else {
            const created: Record<string, unknown> = {};
            group[part] = created;
            group = created;
          }
        }
        group[last] = node;
      }
      return { ...set, value };
    }),
  };
}
