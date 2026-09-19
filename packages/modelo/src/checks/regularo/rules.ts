// Regularo rules (Art. X gate 3, S5.3, FR-08) over the raw `reguloj.json` and `jugxoj.json`
// values. They deliberately do not rely on schema validation: a Regulo without `kialo` is
// reported as `regulo-kialo-missing` even though the schema rejects it too.

import { formatIssuePath, type RuleId, type ValidationIssue } from "../../contracts/issues.js";
import { isKonstitucioArtikolo, KONSTITUCIO_ARTIKOLOJ } from "../../contracts/jugxo.js";
import { appendPointer } from "../../json/pointer.js";

/** One strictly parsed data file; `file` is relative to the Modelo root. */
export interface RegularoDocument {
  file: string;
  value: unknown;
}

export interface RegularoInput {
  /** `data/reguloj.json`; absent when it could not be read (already reported by the caller). */
  reguloj?: RegularoDocument;
  /** `data/jugxoj.json`; absent when it could not be read. */
  jugxoj?: RegularoDocument;
  /** IDs of existing Eroj. Phase 0 has none, so every Ero reference is dangling. */
  eroIds?: ReadonlySet<string>;
}

export interface RegularoResult {
  /** Reguloj findings first, then Jugxoj findings, each in document order. */
  issues: ValidationIssue[];
  stats: { reguloj: number; jugxoj: number };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(
  rule: RuleId,
  file: string,
  pointer: string,
  message: string,
  suggestion: string,
): ValidationIssue {
  return { rule, severity: "error", path: formatIssuePath({ file, pointer }), message, suggestion };
}

/** The array under `key`, or a `schema-violation` at the document root. */
function entriesOf(
  document: RegularoDocument,
  key: string,
  issues: ValidationIssue[],
): unknown[] | undefined {
  const list = isPlainObject(document.value) ? document.value[key] : undefined;
  if (Array.isArray(list)) {
    return list;
  }
  issues.push(
    issue(
      "schema-violation",
      document.file,
      "",
      `${document.file} must be an object with a \`${key}\` array.`,
      `Write ${document.file} as { "${key}": [ … ] }.`,
    ),
  );
  return undefined;
}

const describeEntity = (entry: Record<string, unknown>, fallback: string): string =>
  typeof entry.id === "string" ? entry.id : fallback;

/**
 * Pure. Every Regulo needs a `kialo` that is a string with non-whitespace content; every Jugxo
 * needs a `ref` of exactly `{ regulo }`, `{ ero }` or `{ artikolo }` naming an existing Regulo, Ero
 * or constitution Article. Reference
 * checks need a readable `reguloj.json`; without it only the Regulo-independent findings appear.
 */
export function checkRegularo(input: RegularoInput): RegularoResult {
  const issues: ValidationIssue[] = [];
  const stats = { reguloj: 0, jugxoj: 0 };
  const eroIds = input.eroIds ?? new Set<string>();

  let reguloIds: Set<string> | undefined;
  if (input.reguloj !== undefined) {
    const { file } = input.reguloj;
    const reguloj = entriesOf(input.reguloj, "reguloj", issues);
    if (reguloj !== undefined) {
      reguloIds = new Set();
      stats.reguloj = reguloj.length;
      reguloj.forEach((entry: unknown, index) => {
        const pointer = appendPointer("/reguloj", index);
        if (!isPlainObject(entry)) {
          issues.push(
            issue(
              "schema-violation",
              file,
              pointer,
              `Regulo ${index} in ${file} is not an object.`,
              "Write every Regulo as an object with id, name, statement, kialo, scope and checkability.",
            ),
          );
          return;
        }
        const name = describeEntity(entry, `#${index}`);
        if (typeof entry.id === "string") {
          reguloIds?.add(entry.id);
        }
        const kialo = entry.kialo;
        if (typeof kialo !== "string" || kialo.trim() === "") {
          const state =
            kialo === undefined
              ? "has no kialo"
              : typeof kialo === "string"
                ? "has an empty kialo"
                : "has a kialo that is not a string";
          issues.push(
            issue(
              "regulo-kialo-missing",
              file,
              appendPointer(pointer, "kialo"),
              `Regulo ${name} ${state}. Every Regulo must say why it exists (FR-08).`,
              `Add a non-empty "kialo" to Regulo ${name} that explains the reason for the rule.`,
            ),
          );
        }
      });
    }
  }

  if (input.jugxoj !== undefined) {
    const { file } = input.jugxoj;
    const jugxoj = entriesOf(input.jugxoj, "jugxoj", issues);
    if (jugxoj !== undefined) {
      stats.jugxoj = jugxoj.length;
      if (reguloIds !== undefined) {
        const known = reguloIds;
        jugxoj.forEach((entry: unknown, index) => {
          const pointer = appendPointer("/jugxoj", index);
          if (!isPlainObject(entry)) {
            issues.push(
              issue(
                "schema-violation",
                file,
                pointer,
                `Jugxo ${index} in ${file} is not an object.`,
                "Write every Jugxo as an object with id, ref, decision, kialo, date and context.",
              ),
            );
            return;
          }
          const finding = checkRef(entry, describeEntity(entry, `#${index}`), known, eroIds);
          if (finding !== undefined) {
            const refPointer = appendPointer(pointer, "ref");
            issues.push(
              issue(
                "jugxo-ref-missing",
                file,
                finding.key === undefined ? refPointer : appendPointer(refPointer, finding.key),
                finding.message,
                finding.suggestion,
              ),
            );
          }
        });
      }
    }
  }

  return { issues, stats };
}

function checkRef(
  jugxo: Record<string, unknown>,
  name: string,
  reguloIds: ReadonlySet<string>,
  eroIds: ReadonlySet<string>,
): { key?: "regulo" | "ero" | "artikolo"; message: string; suggestion: string } | undefined {
  const shape = `Give Jugxo ${name} a ref of exactly { "regulo": "<reg_ id>" }, { "ero": "<ero_ id>" } or { "artikolo": "<I..XIII>" }.`;
  const ref = jugxo.ref;
  if (!isPlainObject(ref)) {
    return {
      message: `Jugxo ${name} ${ref === undefined ? "has no ref" : "has a ref that is not an object"}.`,
      suggestion: shape,
    };
  }
  const keys = Object.keys(ref);
  const [key] = keys;
  if (keys.length !== 1 || (key !== "regulo" && key !== "ero" && key !== "artikolo")) {
    return {
      message: `Jugxo ${name} must reference exactly one Regulo, Ero or Article; its ref has ${keys.length === 0 ? "no keys" : `the keys ${keys.join(", ")}`}.`,
      suggestion: shape,
    };
  }
  const target = ref[key];
  if (key === "artikolo") {
    return isKonstitucioArtikolo(target)
      ? undefined
      : {
          key,
          message: `Jugxo ${name} references Article ${String(target)}, which is not an Article of the constitution.`,
          suggestion: `Use one of the Articles ${KONSTITUCIO_ARTIKOLOJ.join(", ")}.`,
        };
  }
  if (typeof target !== "string") {
    return {
      message: `Jugxo ${name} has a ref.${key} that is not an ID string.`,
      suggestion: shape,
    };
  }
  const known = key === "regulo" ? reguloIds : eroIds;
  if (known.has(target)) {
    return undefined;
  }
  const entity = key === "regulo" ? "Regulo" : "Ero";
  return {
    key,
    message:
      key === "regulo"
        ? `Jugxo ${name} references Regulo ${target}, which does not exist.`
        : `Jugxo ${name} references Ero ${target}, which does not exist (the Modelo has no Eroj yet).`,
    suggestion: `Point Jugxo ${name} at an existing ${entity}, or add the ${entity} ${target} first.`,
  };
}
