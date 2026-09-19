// aspekto-font-undeclared (Spec 001, D-05, FR-05; task T010). The negative fixture
// invalid/aspekto-font-undeclared runs through the generic invalid-fixture suite.

import { describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

describe("aspekto-font-undeclared (D-05)", () => {
  it("accepts a family declared in aspekto.json fonts[] and generic families", () => {
    const report = validateModelo(
      fixtureModeloSource(fixtureRoot("valid", "aspekto-font-declared")),
    );
    expect(report.errors).toEqual([]);
  });

  it("reports an undeclared first family at the Aspekto's definition", () => {
    const report = validateModelo(
      fixtureModeloSource(fixtureRoot("invalid", "aspekto-font-undeclared")),
    );
    expect(report.errors.map((issue) => [issue.rule, issue.path])).toEqual([
      ["aspekto-font-undeclared", "aspekto-ekzemplo/sets/aspekto/ekzemplo.json#/font/family/body"],
    ]);
  });
});
