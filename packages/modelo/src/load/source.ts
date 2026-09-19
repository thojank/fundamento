// Where a Modelo lives on disk (§2.1 "Modelo root") and how issue paths are made relative to it.

import { existsSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG_FILE_NAME, readKonfiguro } from "../config/read-config.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";

/**
 * The directory of the reference Aspekto package `@fundamento/aspekto-komuna`. The core always
 * includes it: the reference Aspekto's values live in core (FR-10, D-07).
 */
export function referenceAspektoPackageDir(): string {
  return dirname(fileURLToPath(import.meta.resolve("@fundamento/aspekto-komuna/package.json")));
}

/**
 * The repo's Modelo: the `@fundamento/vortaro` package directory (found through module
 * resolution), `packages/modelo/data` and the reference Aspekto package. Independent of the
 * current working directory.
 */
export function defaultModeloSource(): ModeloSource {
  const vortaroPackageJson = fileURLToPath(import.meta.resolve("@fundamento/vortaro/package.json"));
  return {
    vortaroDir: dirname(vortaroPackageJson),
    // Valid from both `src/load/` and `dist/load/`.
    dataDir: fileURLToPath(new URL("../../data", import.meta.url)),
    aspektoPackages: [referenceAspektoPackageDir()],
  };
}

/**
 * A project's Modelo (D-07): the repo core, the reference Aspekto (always) and the Aspekto packages
 * listed in `configFile`. Listing the reference package again is idempotent. Config issues become
 * `sourceIssues`; `displayFile` is the config's file part in their paths.
 */
export function projectModeloSource(configFile: string, displayFile = configFile): ModeloSource {
  const { konfiguro, issues } = readKonfiguro(configFile, displayFile);
  return withAspektoPackages(defaultModeloSource(), konfiguro?.aspektoPackages ?? [], issues);
}

/**
 * The repo core with the reference Aspekto plus `packageDirs` (e.g. from `--aspekto <dir>`),
 * without duplicates (compared by real path).
 */
export function withAspektoPackages(
  source: ModeloSource,
  packageDirs: readonly string[],
  sourceIssues: readonly ValidationIssue[] = [],
): ModeloSource {
  const seen = new Set<string>();
  const unique = [...(source.aspektoPackages ?? []), ...packageDirs].filter((dir) => {
    const key = realPath(dir);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    ...source,
    aspektoPackages: unique,
    sourceIssues: [...(source.sourceIssues ?? []), ...sourceIssues],
  };
}

function realPath(dir: string): string {
  try {
    return realpathSync(dir);
  } catch {
    return resolve(dir);
  }
}

/**
 * The source of a Modelo root laid out as `<root>/vortaro` and `<root>/data` (fixtures,
 * `--fixture`). A `<root>/fundamento.config.json` adds its Aspekto packages (D-07, D-16); its
 * issues become `sourceIssues` with paths relative to the root.
 */
export function fixtureModeloSource(root: string): ModeloSource {
  const source: ModeloSource = { vortaroDir: join(root, "vortaro"), dataDir: join(root, "data") };
  const configFile = join(root, CONFIG_FILE_NAME);
  if (!existsSync(configFile)) {
    return source;
  }
  const { konfiguro, issues } = readKonfiguro(configFile, CONFIG_FILE_NAME);
  return {
    ...source,
    aspektoPackages: konfiguro?.aspektoPackages ?? [],
    sourceIssues: issues,
  };
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
