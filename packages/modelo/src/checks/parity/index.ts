// Parity check (Art. X gate 2, S5.2, FR-15). Without `--fixture` it compares the empty inventory
// with itself, because Phase 0 has no inventories to extract. With `--fixture <dir>` it compares
// `<dir>/a.json` with `<dir>/b.json`, both read strictly and validated structurally first.

import { join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import {
  compareInventories,
  EMPTY_PARITY_INVENTORY,
  normalizeInventory,
  type ParityInventory,
  parseParityInventory,
} from "./inventory.js";
import { readStrictJsonFile } from "./read-json.js";

export * from "./inventory.js";
export * from "./read-json.js";

export const PARITY_FIXTURE_FILES = ["a.json", "b.json"] as const;

function readInventory(
  dir: string,
  file: string,
): { inventory?: ParityInventory; issues: ValidationIssue[] } {
  const read = readStrictJsonFile(join(dir, file), file);
  if (read.issues.length > 0) {
    return { issues: read.issues };
  }
  return parseParityInventory(read.value, file);
}

const itemCount = (inventory: ParityInventory): number =>
  Object.keys(normalizeInventory(inventory).items).length;

function result(
  ok: boolean,
  summary: string,
  errors: ValidationIssue[],
  stats: Record<string, number>,
): CheckResult {
  return { check: "parity", ok, summary, errors, warnings: [], stats };
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  if (options.fixture === undefined) {
    const errors = compareInventories(EMPTY_PARITY_INVENTORY, EMPTY_PARITY_INVENTORY);
    return result(
      errors.length === 0,
      `Phase 0 has no inventories; the empty inventory compared with itself: ${errors.length} difference(s).`,
      errors,
      { itemsA: 0, itemsB: 0, differences: errors.length },
    );
  }

  const [fileA, fileB] = PARITY_FIXTURE_FILES;
  const a = readInventory(options.fixture, fileA);
  const b = readInventory(options.fixture, fileB);
  if (a.inventory === undefined || b.inventory === undefined) {
    const errors = [...a.issues, ...b.issues];
    return result(
      false,
      `${fileA} and ${fileB} were not compared: ${errors.length} issue(s), not a valid inventory pair.`,
      errors,
      { itemsA: 0, itemsB: 0, differences: 0 },
    );
  }

  const errors = compareInventories(a.inventory, b.inventory, { labels: [fileA, fileB] });
  const itemsA = itemCount(a.inventory);
  const itemsB = itemCount(b.inventory);
  const counts = `${fileA} (${itemsA} item(s)) and ${fileB} (${itemsB} item(s))`;
  return result(
    errors.length === 0,
    errors.length === 0
      ? `${counts} are equivalent.`
      : `${counts}: ${errors.length} difference(s).`,
    errors,
    { itemsA, itemsB, differences: errors.length },
  );
}
