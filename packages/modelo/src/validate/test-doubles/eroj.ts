// Test support (not a double): the Eroj of the repo Modelo as its data holds them – one folder with
// a skemo.json per Ero under packages/modelo/data/eroj, in name order (Spec 046 T1, testing.md:
// counts in repo-state tests come from the data). A test that states "every Ero" reads this list
// instead of typing forty names; a new Ero changes the data, not the test.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const EROJ_DIR = fileURLToPath(new URL("../../../data/eroj/", import.meta.url));

/** The names of the Ero folders of the repo Modelo, sorted. */
export const REPO_EROJ: readonly string[] = readdirSync(EROJ_DIR)
  .filter((name) => existsSync(join(EROJ_DIR, name, "skemo.json")))
  .sort();
