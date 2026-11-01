// The rules of check:dokumentaro (Spec 036 Teil 5 ③, Spec 029 ③). Pure: the Skemo and the Uzo of
// every Ero folder in, issues and counts out. Three sections of the Ero page are written in the
// Uzo – when not, do and don't, the keyboard (`DOKU_KAMPOJ`); the page is done when they are, so a
// field that is missing or still holds the placeholder is an error, never a warning. The shape of
// each field is the schema's business (`fm modelo validate`); the check reads what it needs and
// skips what it cannot read.

import { formatIssuePath, type ValidationIssue } from "../../contracts/issues.js";
import { DOKU_KAMPOJ, type DokuKampo, isDokuOffen } from "../../eroj/dokumentaro.js";

/** One Ero folder: its name, the keys of its Skemo and its Uzo, as read. */
export interface DokumentaroEro {
  name: string;
  /** `a11y.keys` of the Skemo; empty when the Skemo names none or could not be read. */
  keys: readonly string[];
  /** The Modelo-relative path of the Skemo, for an Ero without a Uzo. */
  skemoFile: string;
  /** The Uzo file and its parsed value; absent when the folder has none. */
  uzo?: { file: string; value: unknown };
}

export interface DokumentaroResult {
  issues: ValidationIssue[];
  /**
   * `eroj`, `kompletaj` (every field written), `mankantaj` (fields missing), `offenaj` (fields
   * holding the placeholder) and per Ero `mankoj:<ero>`: its fields still to write.
   */
  stats: Record<string, number>;
}

const FIELD_SECTION: Readonly<Record<DokuKampo, string>> = {
  "when-not": "Wann nicht (when not, with the Ero to take instead)",
  "do-dont": "Do/Don't",
  keyboard: "Barrierefreiheit: Tastatur (keyboard)",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Every issue of the documentation fields, sorted by path and rule, with the counts. */
export function checkDokumentaro(eroj: readonly DokumentaroEro[]): DokumentaroResult {
  const issues: ValidationIssue[] = [];
  const stats: Record<string, number> = {
    eroj: eroj.length,
    kompletaj: 0,
    mankantaj: 0,
    offenaj: 0,
  };
  for (const ero of [...eroj].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    let lacking = 0;
    const uzoValue = isObject(ero.uzo?.value) ? ero.uzo?.value.uzo : undefined;
    if (ero.uzo === undefined || !isObject(uzoValue)) {
      lacking = DOKU_KAMPOJ.length;
      stats.mankantaj = (stats.mankantaj ?? 0) + lacking;
      issues.push({
        rule: "dokumentaro-field-missing",
        severity: "error",
        path: formatIssuePath({
          file: ero.uzo?.file ?? ero.skemoFile,
          pointer: ero.uzo === undefined ? "/skemo" : "/uzo",
        }),
        message: `The Ero ${ero.name} has no Uzo, so its page lacks ${DOKU_KAMPOJ.join(", ")}: three of the nine sections stay empty.`,
        suggestion: `Add ${ero.name}/uzo.json next to the Skemo with when-not, do-dont and keyboard in German and English (Spec 036 ③).`,
      });
      stats[`mankoj:${ero.name}`] = lacking;
      continue;
    }
    const file = ero.uzo.file;
    for (const field of DOKU_KAMPOJ) {
      const value = uzoValue[field];
      const pointer = `/uzo/${field}`;
      if (value === undefined) {
        lacking += 1;
        stats.mankantaj = (stats.mankantaj ?? 0) + 1;
        issues.push({
          rule: "dokumentaro-field-missing",
          severity: "error",
          path: formatIssuePath({ file, pointer }),
          message: `The Uzo of ${ero.name} has no ${field}: the section ${FIELD_SECTION[field]} of its page stays empty.`,
          suggestion: `Write ${field} in German and English (Spec 036 ③); until the text stands, the placeholder marks the field as open.`,
        });
        continue;
      }
      if (isDokuOffen(value)) {
        lacking += 1;
        stats.offenaj = (stats.offenaj ?? 0) + 1;
        issues.push({
          rule: "dokumentaro-placeholder",
          severity: "error",
          path: formatIssuePath({ file, pointer }),
          message: `The Uzo of ${ero.name} still holds the placeholder in ${field}: the section ${FIELD_SECTION[field]} of its page shows „offen“, not a text.`,
          suggestion: `Replace the placeholder with the text in German and English, in our own words (Art. V, clean room).`,
        });
        continue;
      }
      if (field === "when-not") whenNotIssues(ero, file, value, issues);
      if (field === "keyboard") keyboardIssues(ero, file, value, issues);
    }
    if (lacking === 0) stats.kompletaj = (stats.kompletaj ?? 0) + 1;
    stats[`mankoj:${ero.name}`] = lacking;
  }
  issues.sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0,
  );
  return { issues, stats };
}

/** `dokumentaro-when-not-self`: a case the Ero is not for sends to another Ero, not to itself. */
function whenNotIssues(
  ero: DokumentaroEro,
  file: string,
  value: unknown,
  issues: ValidationIssue[],
): void {
  if (!Array.isArray(value)) return;
  value.forEach((entry: unknown, index) => {
    if (!isObject(entry) || entry.ero !== ero.name) return;
    issues.push({
      rule: "dokumentaro-when-not-self",
      severity: "error",
      path: formatIssuePath({ file, pointer: `/uzo/when-not/${index}/ero` }),
      message: `when-not[${index}] of ${ero.name} sends to ${ero.name} itself; a case the Ero is not for names the Ero that is.`,
      suggestion:
        "Name the Ero or Sxablono to take instead; a case no Ero covers belongs in boundary with ask-human.",
    });
  });
}

/**
 * `dokumentaro-keyboard-key-missing`: every key the Skemo names (`a11y.keys`) stands in a row of
 * the keyboard table, so the page says what each key the element answers to does; `none` only
 * for an Ero whose Skemo names no key.
 */
function keyboardIssues(
  ero: DokumentaroEro,
  file: string,
  value: unknown,
  issues: ValidationIssue[],
): void {
  const described = new Set<string>();
  if (Array.isArray(value)) {
    for (const row of value) {
      if (!isObject(row) || !Array.isArray(row.keys)) continue;
      for (const key of row.keys) if (typeof key === "string") described.add(key);
    }
  } else if (!isObject(value) || !("none" in value)) {
    return;
  }
  const missing = ero.keys.filter((key) => !described.has(key));
  if (missing.length === 0) return;
  issues.push({
    rule: "dokumentaro-keyboard-key-missing",
    severity: "error",
    path: formatIssuePath({ file, pointer: "/uzo/keyboard" }),
    message: `The keyboard of ${ero.name} does not say what ${missing.join(", ")} does, though its Skemo names ${missing.length === 1 ? "this key" : "these keys"} (a11y.keys).`,
    suggestion: `Add a row with keys [${missing.map((key) => JSON.stringify(key)).join(", ")}] and what ${missing.length === 1 ? "it does" : "they do"}, in German and English.`,
  });
}
