// Spec 036 Teil 6 (6.4, D-10, D-23): what check:privat looks for, known only by SHA-256. The check
// lowercases every run of letters and digits of a file and hashes each window of the length of a
// sought name; a window whose hash is known is a hit. So neither this source, nor its tests, nor
// its fixtures hold a sought name in plain text, and the check needs no exception for itself.

import { createHash } from "node:crypto";
import type { RuleId } from "../../contracts/issues.js";

export interface SoughtName {
  /** Short name for messages and stats; never the sought text. */
  nomo: string;
  rule: Extract<RuleId, "privat-vorto" | "privat-repo">;
  /** SHA-256 of the lower-cased name. */
  sha256: string;
  /** Length of the name in characters. */
  longo: number;
  kialo: string;
}

/** The word of R-12: the old brand and domain name in the extension key, the IDs and texts. */
export const WORD: SoughtName = {
  nomo: "vorto",
  rule: "privat-vorto",
  sha256: "fc3ef5e45146b121208e44b2d8c7c1f3f6f7e75efa2fde2d1afd072ff26e26eb",
  longo: 10,
  kialo:
    "Spec 036 R-12 and V-3: the public repository names no foreign brand and no foreign domain; the extension key, the schema IDs and the ontology have neutral names.",
};

/**
 * The private font repository (it ends with the word, joined by hyphens). Only the variable
 * FM_TIPAROJ_REPO may name it (Spec 036 6.6).
 */
export const FONT_REPO: SoughtName = {
  nomo: "tiparoj-repo",
  rule: "privat-repo",
  sha256: "a34fce80f881d3aba92b597410a051ffa2febb800b3510f09b4f2aa35184b67d",
  longo: 29,
  kialo:
    "Spec 036 6.6: the private font repository stays as it is and is reached only through FM_TIPAROJ_REPO; no versioned text names it.",
};

export const SOUGHT_NAMES: readonly SoughtName[] = [WORD, FONT_REPO];

export interface PrivateHit {
  rule: SoughtName["rule"];
  /** Character offset of the hit (of the repository name where it is one). */
  offset: number;
}

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

/** Runs of letters and digits at least as long as the word: only they can hold it. */
const RUN = new RegExp(`[A-Za-z0-9]{${WORD.longo},}`, "g");

/**
 * Every hit of a sought name in `text`, in order. A hit of the word preceded by the rest of the
 * repository name counts as the repository.
 */
export function findPrivateNames(text: string): PrivateHit[] {
  const hits: PrivateHit[] = [];
  for (const run of text.matchAll(RUN)) {
    const token = run[0].toLowerCase();
    const start = run.index;
    for (let index = 0; index + WORD.longo <= token.length; index++) {
      if (sha256(token.slice(index, index + WORD.longo)) !== WORD.sha256) continue;
      const end = start + index + WORD.longo;
      const repoStart = end - FONT_REPO.longo;
      const isRepo =
        repoStart >= 0 && sha256(text.slice(repoStart, end).toLowerCase()) === FONT_REPO.sha256;
      hits.push(
        isRepo
          ? { rule: FONT_REPO.rule, offset: repoStart }
          : { rule: WORD.rule, offset: start + index },
      );
    }
  }
  return hits;
}

/** Whether a text names a sought name (the helper for assertions of tests, D-24). */
export function hasPrivateName(text: string): boolean {
  return findPrivateNames(text).length > 0;
}
