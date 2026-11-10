// Spec 047 (NE-1, D-7): the I/O edge of the graph module – the files of the Aspekto packages a
// package graph is read from. komuna is the repo's Modelo with the reference package; ekzemplo is
// the fixture package of the checkout and absent outside one ("ekzemplo ist nur im Repo
// vorhanden"). Everything after reading is pure (grafeo.ts).

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  defaultModeloSource,
  type ModeloFiles,
  projectModeloSource,
  readModeloFiles,
} from "@fundamento/modelo";
import { CHECKOUT_ROOT } from "./root.js";

/** The fixture dir of ekzemplo in this checkout (valid from `src/` and `dist/`). */
export const EKZEMPLO_DIR = join(
  CHECKOUT_ROOT,
  "packages/modelo/test/fixtures/valid/aspekto-ekzemplo",
);

const CONFIG_FILE = "fundamento.config.json";

/**
 * The files of an Aspekto package: komuna from the repo's Modelo, ekzemplo through the
 * `fundamento.config.json` of `ekzemploDir`. `undefined` when ekzemplo has no dir (null, missing)
 * or when the files cannot be read.
 */
export function paketoDosieroj(
  label: "komuna" | "ekzemplo",
  ekzemploDir: string | null,
): ModeloFiles | undefined {
  if (label === "komuna") return readModeloFiles(defaultModeloSource()).files;
  if (ekzemploDir === null) return undefined;
  const config = join(ekzemploDir, CONFIG_FILE);
  if (!existsSync(config)) return undefined;
  return readModeloFiles(projectModeloSource(config)).files;
}
