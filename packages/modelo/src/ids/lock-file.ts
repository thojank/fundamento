// File I/O for the ID registry (an edge module): locate, read and atomically write the lock.

import { readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ID_NAMESPACE_PATTERN, type IdsLock } from "../contracts/entity-ids.js";
import type { ValidationIssue } from "../contracts/issues.js";
import { parseIdsLock, serializeIdsLock, validateIdsLock } from "./lock.js";

/**
 * `packages/modelo/data/ids.lock.json`, resolved relative to this module (identical from `src/ids`
 * and `dist/ids`), so it does not depend on the current working directory.
 */
export function defaultLockPath(): string {
  return fileURLToPath(new URL("../../data/ids.lock.json", import.meta.url));
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

export type ReadLockResult = { ok: true; lock: IdsLock } | { ok: false; issues: ValidationIssue[] };

/**
 * Reads and validates a lock file. A missing file is a `file-missing` issue, never an implicit
 * empty lock: a mistyped `--lock` must not start a second registry. `displayPath` is the file
 * part of issue paths.
 */
export async function readIdsLockFile(path: string, displayPath = path): Promise<ReadLockResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if (isNotFound(error)) {
      return {
        ok: false,
        issues: [
          {
            rule: "file-missing",
            severity: "error",
            path: displayPath,
            message: `No ID registry exists at ${path}.`,
            suggestion:
              'Check the --lock path. To start a new registry on purpose, create the file with the content { "ids": {} } first.',
          },
        ],
      };
    }
    throw error;
  }
  const parsed = parseIdsLock(text, displayPath);
  return parsed.lock === undefined
    ? { ok: false, issues: parsed.issues }
    : { ok: true, lock: parsed.lock };
}

export type ReadNamespaceResult =
  | { ok: true; namespace: string | undefined }
  | { ok: false; issues: ValidationIssue[] };

/**
 * The ID namespace for a lock (D-06): `idNamespace` from the `aspekto.json` next to it. A lock
 * without a neighbouring `aspekto.json` (the core registry), or an `aspekto.json` without
 * `idNamespace` (the reference Aspekto), has no namespace.
 */
export async function readLockNamespace(lockPath: string): Promise<ReadNamespaceResult> {
  const aspektoPath = join(dirname(lockPath), "aspekto.json");
  let text: string;
  try {
    text = await readFile(aspektoPath, "utf8");
  } catch (error) {
    if (isNotFound(error)) {
      return { ok: true, namespace: undefined };
    }
    throw error;
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          rule: "json-syntax",
          severity: "error",
          path: `${aspektoPath}#`,
          message: `aspekto.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: "Fix the JSON syntax of aspekto.json.",
        },
      ],
    };
  }
  const namespace =
    typeof value === "object" && value !== null && "idNamespace" in value
      ? value.idNamespace
      : undefined;
  if (namespace === undefined) {
    return { ok: true, namespace: undefined };
  }
  if (typeof namespace !== "string" || !ID_NAMESPACE_PATTERN.test(namespace)) {
    return {
      ok: false,
      issues: [
        {
          rule: "schema-violation",
          severity: "error",
          path: `${aspektoPath}#/idNamespace`,
          message: `idNamespace ${JSON.stringify(namespace)} must be 2 to 8 lowercase letters.`,
          suggestion: 'Set "idNamespace" in aspekto.json to 2–8 lowercase letters, e.g. "ekz".',
        },
      ],
    };
  }
  return { ok: true, namespace };
}

/**
 * Validates the lock against the `IdsLock` schema def and writes it canonically via a temporary
 * file plus rename, so a crash never leaves a half-written lock. Nothing is written on issues.
 * The lock's directory must already exist; this never creates directories.
 */
export async function writeIdsLockFile(
  path: string,
  lock: IdsLock,
  displayPath = path,
): Promise<ValidationIssue[]> {
  const issues = validateIdsLock(lock, displayPath);
  if (issues.length > 0) {
    return issues;
  }
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.tmp`);
  await writeFile(temporary, serializeIdsLock(lock), "utf8");
  await rename(temporary, path);
  return [];
}
