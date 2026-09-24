import { describe, expect, it } from "vitest";
import { checkMankoj } from "./rules.js";

const MAN_A = "man_01M37TMJ0J14KNVH5BXJ93VFBG";
const MAN_B = "man_01M37TMJ0Z0000000000000000";

const manko = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: MAN_A,
  celo: "figma",
  property: "textCase",
  modelo: "A typography role carries text-transform as a Fundamento extension.",
  instead: "The run writes the case as a value on the text node instead of binding it.",
  evidence: "Unknown field",
  date: "2026-09-23",
  external: "Figma Plugin API documentation, setBoundVariable (read 2026-09-23).",
  closing: {
    measure: "binding-accepted",
    statement: "A run binds textCase on the label's text node and Figma does not refuse it.",
  },
  ...extra,
});

const run = (mankoj: unknown) =>
  checkMankoj({ mankoj: { file: "data/mankoj.json", value: mankoj } });

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("checkMankoj: the closing condition", () => {
  it("passes Mankoj that are complete, and counts them", () => {
    const result = run({ mankoj: [manko(), manko({ id: MAN_B, property: "textDecoration" })] });
    expect(result.issues).toEqual([]);
    expect(result.stats).toEqual({ mankoj: 2 });
  });

  // A Manko without a closing condition is invalid, as a Regulo without a kialo (Art. VI): a gap
  // nobody can measure away is a complaint, not a finding.
  it.each([
    ["missing", undefined],
    ["not an object", "when Figma can do it"],
    ["null", null],
  ])("reports a closing condition that is %s", (_label, closing) => {
    const bad = manko();
    if (closing === undefined) delete bad.closing;
    else bad.closing = closing;
    const result = run({ mankoj: [manko({ id: MAN_B }), bad] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "manko-closing-missing", path: "data/mankoj.json#/mankoj/1/closing" },
    ]);
    expect(result.issues[0]?.severity).toBe("error");
    expect(result.issues[0]?.suggestion).not.toBe("");
  });

  it.each([
    ["an empty statement", { measure: "binding-accepted", statement: "  " }],
    ["no statement", { measure: "binding-accepted" }],
  ])("reports a closing condition with %s", (_label, closing) => {
    const result = run({ mankoj: [manko({ closing })] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "manko-closing-missing", path: "data/mankoj.json#/mankoj/0/closing/statement" },
    ]);
  });

  // The measurement is what a run performs; a kind no run knows cannot be measured away either.
  it("reports a measurement no run knows", () => {
    const result = run({
      mankoj: [manko({ closing: { measure: "someone-says-so", statement: "It feels better." } })],
    });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "manko-closing-missing", path: "data/mankoj.json#/mankoj/0/closing/measure" },
    ]);
  });
});

describe("checkMankoj: completeness", () => {
  it.each(["property", "modelo", "instead", "evidence", "date", "external", "id"])(
    "reports a missing %s",
    (field) => {
      const bad = manko();
      delete bad[field];
      const result = run({ mankoj: [bad] });
      expect(rulesAndPaths(result.issues)).toEqual([
        { rule: "manko-incomplete", path: `data/mankoj.json#/mankoj/0/${field}` },
      ]);
    },
  );

  it("reports an empty field as incomplete", () => {
    const result = run({ mankoj: [manko({ evidence: "   " })] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "manko-incomplete", path: "data/mankoj.json#/mankoj/0/evidence" },
    ]);
  });

  // Celo names are Celo knowledge: they live in code, never in the schema or the data (Art. VIII).
  it("reports a Celo no projection of Fundamento is called", () => {
    const result = run({ mankoj: [manko({ celo: "sketch" })] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "manko-celo-unknown", path: "data/mankoj.json#/mankoj/0/celo" },
    ]);
  });

  it("reports an entry that is not an object", () => {
    const result = run({ mankoj: ["textCase"] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "schema-violation", path: "data/mankoj.json#/mankoj/0" },
    ]);
  });

  it("reports a document without a mankoj array", () => {
    const result = run({ gaps: [] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "schema-violation", path: "data/mankoj.json#" },
    ]);
    expect(result.stats).toEqual({ mankoj: 0 });
  });
});
