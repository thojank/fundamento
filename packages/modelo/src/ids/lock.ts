// The ID registry `ids.lock.json` (FR-05a) as pure functions: parse, validate, serialize,
// allocate and retire. File I/O lives in `lock-file.ts`.

import { createModeloAjv, getModeloValidator, type ValidateFunction } from "../contracts/ajv.js";
import type { EntityType, IdsLock } from "../contracts/entity-ids.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { IdGenerator } from "./ulid-source.js";

/** Bound on regeneration attempts when a generated ID already exists in the lock. */
const MAX_ATTEMPTS_PER_ID = 1000;

export function emptyIdsLock(): IdsLock {
  return { ids: {} };
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (typeof value === "object" && value !== null) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/** Canonical form: keys sorted at every level, 2-space indent, trailing newline. */
export function serializeIdsLock(lock: IdsLock): string {
  return `${JSON.stringify(sortKeysDeep(lock), null, 2)}\n`;
}

let lockValidator: ValidateFunction | undefined;

function getLockValidator(): ValidateFunction {
  lockValidator ??= getModeloValidator(createModeloAjv(), "IdsLock");
  return lockValidator;
}

/** Validates a value against the `IdsLock` schema def. `file` becomes the issue path's file. */
export function validateIdsLock(value: unknown, file: string): ValidationIssue[] {
  const validate = getLockValidator();
  if (validate(value)) {
    return [];
  }
  return (validate.errors ?? []).map((error) => {
    const propertyName =
      typeof error.params.propertyName === "string" ? ` (key '${error.params.propertyName}')` : "";
    return {
      rule: "schema-violation",
      severity: "error",
      path: formatIssuePath({ file, pointer: error.instancePath }),
      message: `ids.lock.json ${error.message ?? "is invalid"}${propertyName}.`,
      suggestion:
        "Do not edit the lock by hand: restore it from git and use `pnpm id:new` / `pnpm id:retire`.",
    };
  });
}

/** Parses and validates lock text. `lock` is set only when there are no issues. */
export function parseIdsLock(
  text: string,
  file: string,
): { lock?: IdsLock; issues: ValidationIssue[] } {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return {
      issues: [
        {
          rule: "json-syntax",
          severity: "error",
          path: formatIssuePath({ file, pointer: "" }),
          message: `ids.lock.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
          suggestion:
            "Restore the lock from git; it is only ever written by `pnpm id:new` / `pnpm id:retire`.",
        },
      ],
    };
  }
  const issues = validateIdsLock(value, file);
  // The validator has just proven the shape.
  return issues.length > 0 ? { issues } : { lock: value as IdsLock, issues };
}

/**
 * Appends `count` new active IDs of `entityType`, in `namespace` when given (an external Aspekto
 * package, D-06). Returns a new lock; the input is not mutated. IDs already present in the lock
 * (active or retired) are never issued again.
 */
export function allocateIds(
  lock: IdsLock,
  entityType: EntityType,
  count: number,
  nextId: IdGenerator,
  namespace?: string,
): { lock: IdsLock; ids: string[] } {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`count must be a positive integer, got ${count}.`);
  }
  const ids: IdsLock["ids"] = { ...lock.ids };
  const issued: string[] = [];
  for (let n = 0; n < count; n += 1) {
    let id = nextId(entityType, namespace);
    for (let attempt = 1; id in ids; attempt += 1) {
      if (attempt >= MAX_ATTEMPTS_PER_ID) {
        throw new Error(`Could not generate an unused ${entityType} ID.`);
      }
      id = nextId(entityType, namespace);
    }
    ids[id] = { type: entityType, status: "active" };
    issued.push(id);
  }
  return { lock: { ids }, ids: issued };
}

export type RetireResult =
  | { ok: true; lock: IdsLock; alreadyRetired: boolean }
  | { ok: false; message: string; suggestion: string };

/** Marks an ID retired. Returns a new lock; the input is not mutated. Unknown IDs are an error. */
export function retireId(lock: IdsLock, id: string): RetireResult {
  const entry = lock.ids[id];
  if (entry === undefined) {
    return {
      ok: false,
      message: `ID '${id}' is not in the lock, so it cannot be retired.`,
      suggestion: "Check the ID for typos; only IDs issued by `pnpm id:new` can be retired.",
    };
  }
  if (entry.status === "retired") {
    return { ok: true, lock, alreadyRetired: true };
  }
  return {
    ok: true,
    lock: { ids: { ...lock.ids, [id]: { type: entry.type, status: "retired" } } },
    alreadyRetired: false,
  };
}
