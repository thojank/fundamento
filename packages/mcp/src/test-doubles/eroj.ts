// Test support (not a double): the Eroj of the repo Modelo, read from its data (Spec 046 T1,
// testing.md: counts in repo-state tests come from the data). A test that states "every Ero" of
// the served Modelo compares with this list instead of typing forty names.

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

/** The names of the Eroj of the repo Modelo, in its order (name order). */
export const REPO_EROJ: readonly string[] = modelo.eroj.map((entry) => entry.ero.name);

/** Every goal of every Ero of the repo Modelo, once, in Ero order (what suggest_ero knows). */
export const REPO_GOALS: readonly string[] = [
  ...new Set(modelo.eroj.flatMap((entry) => (entry.skemo.goals ?? []).map((goal) => goal.goal))),
];
