// Manko rules (F41) over the raw `mankoj.json` value. A Manko is a measured gap of a tool: what
// the Modelo can express and a Celo's target cannot carry. Like the Regularo rules they do not
// rely on schema validation — a Manko without a closing condition is reported as
// `manko-closing-missing` even though the schema rejects it too.
//
// The closing condition is what makes the entry a finding instead of a complaint: it says how a
// run recognises that the gap is gone. Without it a Manko would stand in the data forever, and a
// tool that had long since caught up would go unnoticed.

import { formatIssuePath, type RuleId, type ValidationIssue } from "../../contracts/issues.js";
import { appendPointer } from "../../json/pointer.js";
import { CELOJ } from "../../nomreguloj/types.js";

/** One strictly parsed data file; `file` is relative to the Modelo root. */
export interface MankoDocument {
  file: string;
  value: unknown;
}

export interface MankojInput {
  /** `data/mankoj.json`; absent when it could not be read (already reported by the caller). */
  mankoj?: MankoDocument | readonly MankoDocument[];
}

export interface MankojResult {
  /** Findings in document order. */
  issues: ValidationIssue[];
  stats: { mankoj: number };
}

/**
 * The measurements a run can perform. `binding-accepted`: the run binds the property to a
 * variable of the target and the target does not refuse the binding — the attempt is the
 * measurement, so no run ever asks a tool for its version.
 */
export const MANKO_MEASURES = ["binding-accepted"] as const;

/** The fields every Manko carries besides `celo` and `closing`, in the order they are reported. */
const REQUIRED_FIELDS = [
  "id",
  "property",
  "modelo",
  "instead",
  "evidence",
  "date",
  "external",
] as const;

/** What each field is for, quoted in the suggestion so the entry can be completed without docs. */
const FIELD_PURPOSE: Readonly<Record<string, string>> = {
  id: "the Manko's own ID (man_…)",
  property: "the affected property, as the target names it",
  modelo: "what the Modelo can express about it",
  instead: "what the target does instead",
  evidence: "the tool's own words: the message that was measured",
  date: "the day of the measurement (YYYY-MM-DD)",
  external: "the outward reference: a forum thread, an issue, or the documentation",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
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

/** Celo names are Celo knowledge: they live in code, never in the schema or the data (Art. VIII). */
function isCelo(value: unknown): boolean {
  return typeof value === "string" && (CELOJ as readonly string[]).includes(value);
}

function documents(
  value: MankoDocument | readonly MankoDocument[] | undefined,
): readonly MankoDocument[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value as MankoDocument];
}

/**
 * Pure. Every Manko names the Celo it belongs to, is complete, and carries a closing condition
 * with a measurement a run knows and a statement in words.
 */
export function checkMankoj(input: MankojInput): MankojResult {
  const issues: ValidationIssue[] = [];
  const stats = { mankoj: 0 };

  for (const document of documents(input.mankoj)) {
    const { file } = document;
    const list = isPlainObject(document.value) ? document.value.mankoj : undefined;
    if (!Array.isArray(list)) {
      issues.push(
        issue(
          "schema-violation",
          file,
          "",
          `${file} must be an object with a \`mankoj\` array.`,
          `Write ${file} as { "mankoj": [ … ] }.`,
        ),
      );
      continue;
    }
    stats.mankoj += list.length;
    list.forEach((entry: unknown, index) => {
      const pointer = appendPointer("/mankoj", index);
      if (!isPlainObject(entry)) {
        issues.push(
          issue(
            "schema-violation",
            file,
            pointer,
            `Manko ${index} in ${file} is not an object.`,
            "Write every Manko as an object with id, celo, property, modelo, instead, evidence, date, external and closing.",
          ),
        );
        return;
      }
      const name = typeof entry.id === "string" ? entry.id : `#${index}`;
      for (const field of REQUIRED_FIELDS) {
        if (isText(entry[field])) continue;
        issues.push(
          issue(
            "manko-incomplete",
            file,
            appendPointer(pointer, field),
            `Manko ${name} has no ${field}. A gap is kept with everything it takes to recognise it again.`,
            `Add a non-empty "${field}" to Manko ${name}: ${FIELD_PURPOSE[field] ?? field}.`,
          ),
        );
      }
      if (!isCelo(entry.celo)) {
        issues.push(
          issue(
            "manko-celo-unknown",
            file,
            appendPointer(pointer, "celo"),
            `Manko ${name} names the Celo ${JSON.stringify(entry.celo)}, which no Celo of Fundamento is called.`,
            `Use one of the Celoj ${CELOJ.join(", ")}.`,
          ),
        );
      }
      issues.push(...closingIssues(entry.closing, file, pointer, name));
    });
  }

  return { issues, stats };
}

/** The closing condition: how a run recognises that the gap is gone (mandatory, like a kialo). */
function closingIssues(
  closing: unknown,
  file: string,
  pointer: string,
  name: string,
): ValidationIssue[] {
  const at = appendPointer(pointer, "closing");
  const shape = `Give Manko ${name} a closing of { "measure": "${MANKO_MEASURES[0]}", "statement": "<what a run sees when the gap is gone>" }.`;
  if (!isPlainObject(closing)) {
    return [
      issue(
        "manko-closing-missing",
        file,
        at,
        `Manko ${name} ${closing === undefined ? "has no closing condition" : "has a closing condition that is not an object"}. A Manko without one is invalid, as a Regulo without a kialo: nobody could ever measure the gap away.`,
        shape,
      ),
    ];
  }
  const issues: ValidationIssue[] = [];
  if (!(MANKO_MEASURES as readonly unknown[]).includes(closing.measure)) {
    issues.push(
      issue(
        "manko-closing-missing",
        file,
        appendPointer(at, "measure"),
        `Manko ${name} is closed by ${JSON.stringify(closing.measure)}, which is no measurement a run performs.`,
        `Use one of the measurements ${MANKO_MEASURES.join(", ")}, or teach the runs a new one first.`,
      ),
    );
  }
  if (!isText(closing.statement)) {
    issues.push(
      issue(
        "manko-closing-missing",
        file,
        appendPointer(at, "statement"),
        `Manko ${name} has a closing condition without a statement; what a run sees when the gap is gone has to stand in words too.`,
        shape,
      ),
    );
  }
  return issues;
}
