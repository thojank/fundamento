// K-1 (Spec 024): a brand is named as written („Bluna“, „Über Größe & Co.“); the app derives the
// identifier — a Name of the Modelo: lowercase letters, digits, single hyphens — and shows it
// small beside the name. Pure.

const UMLAUTS: Readonly<Record<string, string>> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  æ: "ae",
  ø: "oe",
  œ: "oe",
};

/** The identifier of a brand name as written; empty when nothing of it can be an identifier. */
export function identOf(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüßæøœ]/g, (character) => UMLAUTS[character] ?? character)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The brand as the screens name it: the name as written with its identifier, or the identifier alone. */
export function markoLabel(name: string, written: string | undefined): string {
  return written === undefined || written === "" || written === name
    ? name
    : `${written} (${name})`;
}
