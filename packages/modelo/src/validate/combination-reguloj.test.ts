// The runner of per-combination Reguloj (Spec 002, D-04): a checker looks at one resolved
// combination; the runner reports each distinct violation once, at its first combination.

import { describe, expect, it } from "vitest";
import type { Regulo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { type CombinationChecker, runCombinationChecker } from "./combination-reguloj.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";

const { modelo } = loadModelo(fixtureModeloSource(fixtureRoot("valid", "minimal")));
if (modelo === undefined) throw new Error("valid/minimal must load");

const regulo = {
  id: "reg_01M2WRK8G0GGGGGGGGGGGGGGG9",
  name: "surface-order",
  statement: "Test.",
  kialo: "Test.",
  scope: "vortaro",
  checkability: "automatic",
} as Regulo;

/** Flags color.text.default in every combination; the violation's values depend on the scheme. */
const perScheme: CombinationChecker = ({ assignment }) => [
  {
    subject: "color.text.default",
    values: assignment["color-scheme"] ?? "",
    message: `text in ${assignment["color-scheme"]}.`,
    suggestion: "Fix it.",
  },
];

describe("runCombinationChecker", () => {
  const issues = runCombinationChecker(modelo, regulo, perScheme);

  it("reports one issue per distinct violation, at the first canonical combination", () => {
    expect(issues.map((issue) => [issue.rule, issue.path, issue.combination])).toEqual([
      [
        "surface-order",
        "rezolvo(color-scheme=light,contrast=default)/color.text.default",
        { "color-scheme": "light", contrast: "default" },
      ],
      [
        "surface-order",
        "rezolvo(color-scheme=dark,contrast=default)/color.text.default",
        { "color-scheme": "dark", contrast: "default" },
      ],
    ]);
  });

  it("says how many combinations share the violation", () => {
    expect(issues[0]?.message).toBe("text in light. Same in 2 combinations.");
  });

  it("reports nothing when the checker finds nothing", () => {
    expect(runCombinationChecker(modelo, regulo, () => [])).toEqual([]);
  });
});
