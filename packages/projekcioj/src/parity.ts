// Parity inventories of the projections (Spec 003 T021, FR-12, D-15, AK-04). After a build, every
// Celo states what it actually emitted: its props with their values, its states and the defaults
// it documents. `pnpm check:parity` compares these files with the Skemo, so a projection that
// drifts from the Modelo is found without the check having to read a projection itself (Art.
// VIII: reading a Celo's artefact is Celo knowledge and lives in the Celo).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ParityInventory, ParityItem } from "@fundamento/modelo";
import type { CeloInput, GeneratedFile } from "./build.js";
import { figmaPlanInventory } from "./celoj/figma/figma.js";
import {
  guidelinePath,
  guidelinesInventory,
  kitAspektoj,
  kitReferenceAspekto,
  kitTypesPath,
} from "./celoj/make-kit/make-kit.js";
import { reactTypesInventory } from "./celoj/react/react.js";
import { stylesheetInventory, stylesheetPath } from "./celoj/web-component/web-component.js";

/** The folder of inventories inside a projections directory. */
export const PARITY_DIR = "parity";

const inventoryOf = (items: Record<string, ParityItem>): ParityInventory => ({ items });

/**
 * One inventory per side, read from the files in `outDir`: the Web Component stylesheets, the
 * declaration file of the reference kit, the Figma plan and the guidelines of every kit. The
 * bundled kit files have to exist, so this runs after `bundleMakeKits`.
 */
export function parityInventories(outDir: string, input: CeloInput): GeneratedFile[] {
  const read = (path: string): string => readFileSync(join(outDir, path), "utf8");
  const eroj = input.modelo.eroj.map((entry) => entry.ero.name);
  const perEro = (of: (ero: string) => ParityItem): Record<string, ParityItem> =>
    Object.fromEntries(eroj.map((ero) => [ero, of(ero)]));

  const sides: Record<string, ParityInventory> = {
    "web-component.json": inventoryOf(
      perEro((ero) => stylesheetInventory(read(stylesheetPath(ero)))),
    ),
    "react.json": inventoryOf(
      reactTypesInventory(read(kitTypesPath(kitReferenceAspekto(input.modelo))), eroj),
    ),
    "figma.json": inventoryOf(figmaPlanInventory(JSON.parse(read("figma/plan.json")))),
  };
  for (const aspekto of kitAspektoj(input.modelo)) {
    sides[`guidelines-${aspekto}.json`] = inventoryOf(
      perEro((ero) => guidelinesInventory(read(guidelinePath(aspekto, ero)))),
    );
  }
  return Object.entries(sides).map(([file, inventory]) => ({
    path: `${PARITY_DIR}/${file}`,
    text: `${JSON.stringify(inventory, null, 2)}\n`,
  }));
}

/** Writes the inventories under `outDir`; returns their paths, for the manifest. */
export function writeParityInventories(outDir: string, input: CeloInput): string[] {
  const files = parityInventories(outDir, input);
  for (const file of files) {
    const target = join(outDir, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.text);
  }
  return files.map((file) => file.path);
}
