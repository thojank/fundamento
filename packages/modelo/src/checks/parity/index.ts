// Parity check (Art. X gate 2, S5.2, FR-15, FR-12). Compares the Skemo of every Ero with what the
// projections say they emitted: every Celo writes an inventory of its own artefact next to it
// (`<projections>/parity/<side>.json`), so a projection that drifts from the Modelo differs here
// (AK-04). The projections are built by `pnpm check:parity` into `.fundamento/projekcioj`;
// `--projekcioj <dir>` points the check at another build. With `--fixture <dir>` the check stays
// the plain comparator of two inventories, `<dir>/a.json` against `<dir>/b.json`.

import { isAbsolute, join, relative } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import type { Modelo } from "../../contracts/modelo.js";
import {
  PARITY_ASPECTS,
  type ParityAspect,
  restrictParityInventory,
  skemoParityInventory,
} from "../../eroj/inventories.js";
import { loadModelo } from "../../load/load-modelo.js";
import { checkSource } from "../source.js";
import {
  compareInventories,
  normalizeInventory,
  type ParityInventory,
  parseParityInventory,
} from "./inventory.js";
import { readStrictJsonFile } from "./read-json.js";

export * from "./inventory.js";
export * from "./read-json.js";

export const PARITY_FIXTURE_FILES = ["a.json", "b.json"] as const;

/** Where `pnpm check:parity` builds the projections it reads. */
export const PARITY_PROJECTIONS_DIR = join(".fundamento", "projekcioj");

/** The folder of inventories inside a projections directory (`fm projekcioj build`). */
export const PARITY_INVENTORY_DIR = "parity";

/** One side of the comparison: an inventory file, what it restates and how it is named. */
export interface ParitySide {
  file: string;
  label: string;
  aspects: readonly ParityAspect[];
  /** `styled`: only the props a stylesheet or a variant set can express. */
  props?: "all" | "styled";
}

/** The Aspektoj of a Modelo: the values of the aspekto Dimensio (one Make Kit each). */
function aspektojOf(modelo: Modelo): string[] {
  return (
    modelo.dimensioj
      .find((dimensio) => dimensio.name === "aspekto")
      ?.valoroj.map((valoro) => valoro.name) ?? []
  );
}

/**
 * The sides a build writes: the Web Component stylesheet (the props it keys on and its states),
 * the React declaration file (props only, it has no states), the Figma plan (props and states)
 * and the guidelines of every Make Kit (props, states and the defaults they document).
 */
export function paritySides(modelo: Modelo): ParitySide[] {
  return [
    {
      file: "web-component.json",
      label: "web-component",
      aspects: ["props", "states"],
      props: "styled",
    },
    { file: "react.json", label: "react", aspects: ["props"] },
    { file: "figma.json", label: "figma", aspects: ["props", "states"] },
    ...aspektojOf(modelo).map((aspekto) => ({
      file: `guidelines-${aspekto}.json`,
      label: `guidelines(${aspekto})`,
      aspects: PARITY_ASPECTS,
    })),
  ];
}

function readInventory(
  dir: string,
  file: string,
  displayFile = file,
): { inventory?: ParityInventory; issues: ValidationIssue[] } {
  const read = readStrictJsonFile(join(dir, file), displayFile);
  if (read.issues.length > 0) {
    return { issues: read.issues };
  }
  return parseParityInventory(read.value, displayFile);
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

/** `.fundamento/projekcioj/parity/figma.json` for a build inside the repo, else the full path. */
function displayDir(repoRoot: string, dir: string): string {
  const inside = relative(repoRoot, dir);
  return inside === "" || inside.startsWith("..") || isAbsolute(inside) ? dir : inside;
}

/** A missing inventory means the projections were not built, not that a file has to be written. */
function buildFirst(issue: ValidationIssue): ValidationIssue {
  return issue.rule === "file-missing"
    ? {
        ...issue,
        suggestion:
          "Run `pnpm fm projekcioj build --out .fundamento/projekcioj` first: every Celo writes its parity inventory there.",
      }
    : issue;
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  if (options.fixture !== undefined) {
    return compareFixturePair(options.fixture);
  }

  const { modelo, issues } = loadModelo(checkSource(options));
  const loadErrors = issues.filter((issue) => issue.severity === "error");
  if (modelo === undefined) {
    return result(
      false,
      `The Modelo could not be loaded (${loadErrors.length} error(s)); no projection was compared.`,
      loadErrors,
      { sides: 0, items: 0, differences: 0 },
    );
  }

  const projections = options.projekcioj ?? join(options.repoRoot, PARITY_PROJECTIONS_DIR);
  const inventoryDir = join(projections, PARITY_INVENTORY_DIR);
  const display = join(displayDir(options.repoRoot, projections), PARITY_INVENTORY_DIR);
  const sides = paritySides(modelo);
  const errors: ValidationIssue[] = [...loadErrors];
  const unread: ValidationIssue[] = [];
  let compared = 0;
  for (const side of sides) {
    const expected = skemoParityInventory(modelo.eroj, {
      aspects: side.aspects,
      props: side.props ?? "all",
    });
    const read = readInventory(inventoryDir, side.file, join(display, side.file));
    if (read.inventory === undefined) {
      unread.push(...read.issues.map(buildFirst));
      continue;
    }
    compared += 1;
    errors.push(
      ...compareInventories(expected, restrictParityInventory(read.inventory, side.aspects), {
        labels: ["skemo", side.label],
      }),
    );
  }

  const names = sides.map((side) => side.label).join(", ");
  const items = itemCount(skemoParityInventory(modelo.eroj));
  const differences = errors.length - loadErrors.length;
  const missing = sides.length - compared;
  errors.push(...unread);
  const counts = `The Skemo (${items} Ero(j)) compared with ${sides.length} side(s) (${names})`;
  return result(
    errors.length === 0,
    errors.length === 0
      ? `${counts}: equivalent.`
      : `${counts}: ${differences} difference(s)${missing === 0 ? "" : `, ${missing} inventory file(s) missing`}.`,
    errors,
    { sides: sides.length, items, differences },
  );
}

/** `--fixture <dir>`: the plain comparator of `a.json` and `b.json`, both read strictly. */
async function compareFixturePair(fixture: string): Promise<CheckResult> {
  const [fileA, fileB] = PARITY_FIXTURE_FILES;
  const a = readInventory(fixture, fileA);
  const b = readInventory(fixture, fileB);
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
