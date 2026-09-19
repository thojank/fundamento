// Test support (not a double): loads real fixture Modelo roots for the resolver and themes tests.

import { fileURLToPath } from "node:url";
import type { Modelo } from "../../contracts/modelo.js";
import { loadModelo } from "../../load/load-modelo.js";
import { fixtureModeloSource } from "../../load/source.js";

export function fixtureRoot(kind: "valid" | "invalid", name: string): string {
  return fileURLToPath(new URL(`../../../test/fixtures/${kind}/${name}/`, import.meta.url));
}

/** Loads a fixture; fails loudly if it does not load or (unless allowed) reports issues. */
export function loadFixture(
  kind: "valid" | "invalid",
  name: string,
  options: { allowIssues?: boolean } = {},
): Modelo {
  const { modelo, issues } = loadModelo(fixtureModeloSource(fixtureRoot(kind, name)));
  if (modelo === undefined || (issues.length > 0 && options.allowIssues !== true)) {
    throw new Error(`fixture ${kind}/${name} did not load: ${JSON.stringify(issues)}`);
  }
  return modelo;
}
