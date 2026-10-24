// Random hits (Spec 032 ②, Maintainer 2026-10-24): a value of the repository that a benchmark list
// happens to know is exempt only with a Jugxo to Art. V that gives the reason. hazardaj-trafoj.json
// names the fingerprint, the list, the token and the Jugxo; an entry whose Jugxo is missing exempts
// nothing and is a finding of its own.

import type { ValidationIssue } from "../../contracts/issues.js";

/** A fixture brings its own list under this name, at its root. */
export const HAZARDAJ_FILE_NAME = "hazardaj-trafoj.json";
/** The repository's list (repo-relative). */
export const REPO_HAZARDAJ_PATH = `packages/modelo/src/checks/clean-room/${HAZARDAJ_FILE_NAME}`;
/** Where the Jugxoj stand: the repository's, or a fixture's `data/jugxoj.json`. */
export const REPO_JUGXOJ_PATH = "packages/modelo/data/jugxoj.json";
export const FIXTURE_JUGXOJ_PATH = "data/jugxoj.json";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The key of an exempt hit: the list that knows the value and its fingerprint. */
export const randomHitKey = (source: string, fingerprint: string): string =>
  `${source}\u0000${fingerprint}`;

/** The exempt hits of a list, and an issue for every entry without its Jugxo to Art. V. */
export function randomHits(
  list: unknown,
  jugxoj: unknown,
  file: string,
): { exempt: Set<string>; issues: ValidationIssue[] } {
  const known = new Set(
    (isObject(jugxoj) && Array.isArray(jugxoj.jugxoj) ? jugxoj.jugxoj : [])
      .filter(
        (jugxo): jugxo is Record<string, unknown> =>
          isObject(jugxo) && isObject(jugxo.ref) && jugxo.ref.artikolo === "V",
      )
      .map((jugxo) => jugxo.id),
  );
  const exempt = new Set<string>();
  const issues: ValidationIssue[] = [];
  const entries = isObject(list) && Array.isArray(list.hazardaj) ? list.hazardaj : [];
  for (const entry of entries) {
    if (!isObject(entry)) continue;
    const { fingerprint, source, jugxo, token } = entry;
    if (typeof fingerprint !== "string" || typeof source !== "string") continue;
    if (typeof jugxo === "string" && known.has(jugxo)) {
      exempt.add(randomHitKey(source, fingerprint));
      continue;
    }
    issues.push({
      rule: "clean-room-jugxo-missing",
      severity: "error",
      path: file,
      message: `The random hit of '${String(token)}' in the list '${source}' names no Jugxo to Art. V (${String(jugxo)}); without one it is not exempt.`,
      suggestion:
        "Record the reason as a Jugxo with ref.artikolo V in data/jugxoj.json and name its ID here, or replace the value.",
    });
  }
  return { exempt, issues };
}
