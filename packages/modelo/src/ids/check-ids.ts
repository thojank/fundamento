// The ID rules (FR-05, FR-05a): every entity has a well-formed, unique, registered, active ID of
// its own type, and every active registered ID is used. Pure; FUND-3.2 collects the occurrences.

import {
  ENTITY_ID_PREFIXES,
  entityTypeOfId,
  ID_PATTERN,
  type IdsLock,
  idPatternFor,
} from "../contracts/entity-ids.js";
import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import type { IdOccurrence } from "../contracts/modelo.js";

/** Location of the lock relative to a Modelo root; used in `id-orphaned` paths. */
export const DEFAULT_LOCK_FILE = "data/ids.lock.json";

export interface CheckIdsOptions {
  /** Lock file path used in `id-orphaned` issue paths. Defaults to `DEFAULT_LOCK_FILE`. */
  lockFile?: string;
}

function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

function issue(rule: RuleId, path: string, message: string, suggestion: string): ValidationIssue {
  return { rule, severity: "error", path, message, suggestion };
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function formatProblem(id: string, occurrence: IdOccurrence): string | undefined {
  const expected = ENTITY_ID_PREFIXES[occurrence.entityType];
  if (idPatternFor(occurrence.entityType).test(id)) {
    return undefined;
  }
  if (ID_PATTERN.test(id)) {
    return `ID '${id}' has prefix '${id.slice(0, id.indexOf("_"))}_' (${entityTypeOfId(id)}), but a ${occurrence.entityType} ID must start with '${expected}_'.`;
  }
  return `ID '${id}' is malformed: a ${occurrence.entityType} ID is '${expected}_' followed by a 26-character uppercase Crockford ULID.`;
}

/**
 * Checks ID occurrences against the lock. Reports `id-missing`, `id-format`, `id-duplicate`,
 * `id-type-mismatch`, `id-retired-reused` and `id-unregistered` at the occurrence's path, and
 * `id-orphaned` at the lock entry. The output is sorted by path, then rule, and does not depend
 * on the order of `occurrences`.
 */
export function checkIds(
  occurrences: readonly IdOccurrence[],
  lock: IdsLock,
  options: CheckIdsOptions = {},
): ValidationIssue[] {
  const lockFile = options.lockFile ?? DEFAULT_LOCK_FILE;
  const located = occurrences
    .map((occurrence) => ({ occurrence, path: formatIssuePath(occurrence.location) }))
    .sort((a, b) => compareStrings(a.path, b.path));

  const issues: ValidationIssue[] = [];
  const firstPathById = new Map<string, string>();

  for (const { occurrence, path } of located) {
    const { id, entityType } = occurrence;
    if (id === undefined) {
      issues.push(
        issue(
          "id-missing",
          path,
          `This ${entityType} has no ID.`,
          `Allocate one with \`pnpm id:new ${entityType}\` and add it; never invent IDs by hand.`,
        ),
      );
      continue;
    }

    const firstPath = firstPathById.get(id);
    if (firstPath === undefined) {
      firstPathById.set(id, path);
    } else {
      issues.push(
        issue(
          "id-duplicate",
          path,
          `ID '${id}' is already used at ${firstPath}.`,
          `Give this ${entityType} its own ID from \`pnpm id:new ${entityType}\`; IDs are unique across the Modelo.`,
        ),
      );
    }

    const formatMessage = formatProblem(id, occurrence);
    if (formatMessage !== undefined) {
      issues.push(
        issue(
          "id-format",
          path,
          formatMessage,
          `Replace it with an ID from \`pnpm id:new ${entityType}\`.`,
        ),
      );
      continue;
    }

    const entry = lock.ids[id];
    if (entry === undefined) {
      issues.push(
        issue(
          "id-unregistered",
          path,
          `ID '${id}' is not registered in ${lockFile}.`,
          `Allocate IDs with \`pnpm id:new ${entityType}\`, which registers them; never write IDs by hand.`,
        ),
      );
      continue;
    }
    if (entry.type !== entityType) {
      issues.push(
        issue(
          "id-type-mismatch",
          path,
          `ID '${id}' is registered as ${entry.type} but used for a ${entityType}.`,
          `Use an ID allocated for this entity type: \`pnpm id:new ${entityType}\`.`,
        ),
      );
    }
    if (entry.status === "retired") {
      issues.push(
        issue(
          "id-retired-reused",
          path,
          `ID '${id}' is retired and must never be used again.`,
          `Allocate a fresh ID with \`pnpm id:new ${entityType}\`.`,
        ),
      );
    }
  }

  for (const id of Object.keys(lock.ids).sort()) {
    const entry = lock.ids[id];
    if (entry?.status !== "active" || firstPathById.has(id)) {
      continue;
    }
    issues.push(
      issue(
        "id-orphaned",
        formatIssuePath({ file: lockFile, pointer: `/ids/${escapePointerSegment(id)}` }),
        `ID '${id}' (${entry.type}) is active in the lock but no entity in the Modelo uses it.`,
        `If the ${entry.type} was removed, run \`pnpm id:retire ${id}\`; otherwise restore its ID.`,
      ),
    );
  }

  return issues.sort(
    (a, b) =>
      compareStrings(a.path, b.path) ||
      compareStrings(a.rule, b.rule) ||
      compareStrings(a.message, b.message),
  );
}
