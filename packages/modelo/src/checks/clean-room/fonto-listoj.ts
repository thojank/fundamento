// A benchmark list that is the theme of a Fonto (Spec 032 ② 4, E-1, Maintainer 2026-10-24): its
// fingerprints do not count while the registry lists the Fonto with its licence, pinned, and its
// copyright in the notices it names — the same provenance Spec 029 ① asks of a Fonto. Which list
// belongs to which Fonto stands as data with its Kialo in fonto-listoj.json.

/** A fixture brings its own mapping under this name, at its root. */
export const FONTO_LISTOJ_FILE_NAME = "fonto-listoj.json";
/** The repository's mapping (repo-relative). */
export const REPO_FONTO_LISTOJ_PATH = `packages/modelo/src/checks/clean-room/${FONTO_LISTOJ_FILE_NAME}`;
/** The Fonto registry: the repository's, or a fixture's. */
export const REPO_FONTOJ_PATH = "packages/modelo/data/fontoj.json";
export const FIXTURE_FONTOJ_PATH = "data/fontoj.json";

const VERSION = /^\d+\.\d+\.\d+$/;
const COMMIT = /^[0-9a-f]{40}$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value !== "";

/** The Fontoj of a registry that stand with their licence: pinned, copyright in their notices. */
function licensedFontoj(
  registry: unknown,
  text: (path: string) => string | undefined,
): Set<string> {
  const fontoj = isObject(registry) && Array.isArray(registry.fontoj) ? registry.fontoj : [];
  const licensed = new Set<string>();
  for (const fonto of fontoj) {
    if (!isObject(fonto) || !nonEmpty(fonto.id) || !nonEmpty(fonto.license)) continue;
    const pinned =
      typeof fonto.version === "string" &&
      VERSION.test(fonto.version) &&
      typeof fonto.commit === "string" &&
      COMMIT.test(fonto.commit);
    const notices = nonEmpty(fonto.notices) ? text(fonto.notices) : undefined;
    if (pinned && nonEmpty(fonto.copyright) && notices?.includes(fonto.copyright) === true) {
      licensed.add(fonto.id);
    }
  }
  return licensed;
}

/** The sources of the lists whose Fonto stands with its licence. */
export function fontoListSources(
  listoj: unknown,
  registry: unknown,
  text: (path: string) => string | undefined,
): Set<string> {
  const licensed = licensedFontoj(registry, text);
  const entries = isObject(listoj) && Array.isArray(listoj.listoj) ? listoj.listoj : [];
  return new Set(
    entries
      .filter(
        (entry): entry is { source: string; fonto: string } =>
          isObject(entry) && nonEmpty(entry.source) && nonEmpty(entry.fonto),
      )
      .filter((entry) => licensed.has(entry.fonto))
      .map((entry) => entry.source),
  );
}
