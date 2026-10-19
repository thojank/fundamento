// The browser entry of the Agordilo (Spec 016 ②, plan ① B-8): the Werkstatt bundles the same
// library, so the entry carries the pure modules and none of the I/O edge under node/. A second
// derivation in the browser would be a second truth (Art. VIII); there is none.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as browser from "./browser.js";

describe("@fundamento/agordilo/browser (②)", () => {
  it("exports the derivation, the checks, the palettes and the Agordo reader, without the node edge", () => {
    for (const name of [
      "deriveAspekto",
      "derivePalettes",
      "derivationBasis",
      "checkAspekto",
      "readAgordo",
      "parseAgordoColor",
      "serializeRaporto",
      "composeFiles",
      "fingerprintDocuments",
    ]) {
      expect(typeof (browser as Record<string, unknown>)[name], name).toBe("function");
    }
    for (const name of ["readStructure", "loadCalibration", "writePackage", "checkPackageDir"]) {
      expect((browser as Record<string, unknown>)[name], name).toBeUndefined();
    }
    const source = readFileSync(new URL("./browser.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/\.\/node\//);
    expect(source).not.toMatch(/from "node:/);
  });

  it("is an export of the package", () => {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
      exports: Record<string, { default: string }>;
    };
    expect(pkg.exports["./browser"]?.default).toBe("./dist/browser.js");
  });
});
