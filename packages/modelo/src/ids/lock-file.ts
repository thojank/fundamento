// File I/O for the ID registry (an edge module): locate, read and atomically write the lock.

import { readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { IdsLock } from "../contracts/entity-ids.js";
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
