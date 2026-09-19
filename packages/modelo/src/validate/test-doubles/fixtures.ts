// Test support (not a double): real fixture Modelo roots, and throwaway copies of `valid/minimal`
// with one change applied, for rule variants that do not warrant a committed fixture.

import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const FIXTURES_DIR = fileURLToPath(new URL("../../../test/fixtures/", import.meta.url));

export function fixtureRoot(kind: "valid" | "invalid", name: string): string {
  return join(FIXTURES_DIR, kind, name);
}

export interface ExpectedIssue {
  rule: string;
  path: string;
}

export interface ExpectedIssues {
  description: string;
  /** Present on check fixtures (FUND-4.x); Modelo validation fixtures have none. */
  check?: string;
  issues: ExpectedIssue[];
  /** Expected warnings; absent means none. */
  warnings?: ExpectedIssue[];
}

/** Invalid fixtures that are Modelo roots (`vortaro/` + `data/`) with an `expected-issues.json`. */
export function modeloValidationFixtures(): { name: string; expected: ExpectedIssues }[] {
  const invalidDir = join(FIXTURES_DIR, "invalid");
  return readdirSync(invalidDir)
    .sort()
    .flatMap((name) => {
      const root = join(invalidDir, name);
      const expectedFile = join(root, "expected-issues.json");
      if (
        !existsSync(expectedFile) ||
        !existsSync(join(root, "vortaro")) ||
        !existsSync(join(root, "data"))
      ) {
        return [];
      }
      const expected = JSON.parse(readFileSync(expectedFile, "utf8")) as ExpectedIssues;
      return expected.check === undefined ? [{ name, expected }] : [];
    });
}

/**
 * Copies `valid/minimal` into a fresh temporary directory and lets `mutate` edit JSON files in
 * it (paths relative to the copy's root). Returns the copy's root.
 */
export function mutatedMinimal(
  mutate: (edit: (file: string, change: (value: never) => unknown) => void, root: string) => void,
): string {
  const root = mkdtempSync(join(tmpdir(), "fm-validate-"));
  cpSync(fixtureRoot("valid", "minimal"), root, { recursive: true });
  const edit = (file: string, change: (value: never) => unknown): void => {
    const path = join(root, file);
    const value = JSON.parse(readFileSync(path, "utf8")) as never;
    const result = change(value);
    writeFileSync(path, `${JSON.stringify(result === undefined ? value : result, null, 2)}\n`);
  };
  mutate(edit, root);
  return root;
}
