// Spec 036 Teil 6 (6.3): the Agordilo writes the derived packages with the Modelo's extension key,
// the new one; its derived fixtures are checked for old identifiers in @fundamento/modelo
// (contracts/names-writers.test.ts).

import { FUNDAMENTO_EXTENSION_KEY } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { NEW_NAMES } from "../../../scripts/neutrale-namen/rules.mjs";
import { EXTENSION_KEY } from "./package.js";

describe("the Agordilo writes the new extension key (Spec 036 6.3)", () => {
  it("is the key of the Modelo, and that is the new one", () => {
    expect(EXTENSION_KEY).toBe(FUNDAMENTO_EXTENSION_KEY);
    expect(EXTENSION_KEY).toBe(NEW_NAMES.extensionKey);
  });
});
