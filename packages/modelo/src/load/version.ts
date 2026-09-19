// The Modelo version is the version of the @fundamento/modelo package.

import { readFileSync } from "node:fs";

/** File URL of the modelo `package.json`. Valid from both `src/load/` and `dist/load/`. */
const PACKAGE_JSON_URL = new URL("../../package.json", import.meta.url);

function readPackageVersion(): string {
  const pkg: unknown = JSON.parse(readFileSync(PACKAGE_JSON_URL, "utf8"));
  if (typeof pkg === "object" && pkg !== null && "version" in pkg) {
    const { version } = pkg;
    if (typeof version === "string") {
      return version;
    }
  }
  throw new Error(`${PACKAGE_JSON_URL.href} has no string "version".`);
}

/** Version of the Modelo (`modelo.version`, `fundamento.version` in the export). */
export const MODELO_VERSION: string = readPackageVersion();
