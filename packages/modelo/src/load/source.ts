// Where a Modelo lives on disk (§2.1 "Modelo root") and how issue paths are made relative to it.

import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ModeloSource } from "../contracts/modelo.js";

/**
 * The repo's Modelo: the `@fundamento/vortaro` package directory (found through module
 * resolution) and `packages/modelo/data`. Independent of the current working directory.
 */
export function defaultModeloSource(): ModeloSource {
  const vortaroPackageJson = fileURLToPath(import.meta.resolve("@fundamento/vortaro/package.json"));
  return {
    vortaroDir: dirname(vortaroPackageJson),
    // Valid from both `src/load/` and `dist/load/`.
    dataDir: fileURLToPath(new URL("../../data", import.meta.url)),
  };
}

/** The source of a Modelo root laid out as `<root>/vortaro` and `<root>/data` (fixtures, `--fixture`). */
export function fixtureModeloSource(root: string): ModeloSource {
  return { vortaroDir: join(root, "vortaro"), dataDir: join(root, "data") };
}

/**
 * The directory that issue paths are relative to: the deepest common ancestor of `vortaroDir`
 * and `dataDir`. For a Modelo root (`<root>/vortaro`, `<root>/data`) that is `<root>`, so paths
 * read `vortaro/sets/core.json` and `data/dimensioj.json`. For the repo default
 * (`packages/vortaro`, `packages/modelo/data`) it is `packages/`, so paths read
 * `vortaro/sets/core.json` and `modelo/data/dimensioj.json`.
 */
export function modeloRootOf(source: ModeloSource): string {
  const vortaro = resolve(source.vortaroDir).split(sep);
  const data = resolve(source.dataDir).split(sep);
  const common: string[] = [];
  for (let index = 0; index < Math.min(vortaro.length, data.length); index++) {
    const segment = vortaro[index];
    if (segment === undefined || segment !== data[index]) {
      break;
    }
    common.push(segment);
  }
  const joined = common.join(sep);
  return joined === "" ? sep : joined;
}

/** `absolutePath` relative to `root`, with `/` separators (the `file` part of an issue path). */
export function relativeModeloPath(root: string, absolutePath: string): string {
  return relative(root, absolutePath).split(sep).join("/");
}
