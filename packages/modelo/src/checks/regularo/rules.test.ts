import { describe, expect, it } from "vitest";
import { checkRegularo } from "./rules.js";

const REG_A = "reg_01K5FMAJ0J14KNVH5BXJ93VFBG";
const REG_B = "reg_01K5FMAJ0Z0000000000000000";

const regulo = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: REG_A,
  name: "semantic-colors-alias-palette",
  statement: "Semantic colors alias the palette.",
  kialo: "One place to change a palette.",
  scope: "vortaro",
  checkability: "manual",
  ...extra,
});

const jugxo = (ref: unknown): Record<string, unknown> => ({
  id: "jug_01K5FMAJ0M0000000000000000",
  ref,
  decision: "approved",
  kialo: "Accepted.",
  date: "2026-09-19",
  context: "test",
});

const run = (reguloj: unknown, jugxoj: unknown = { jugxoj: [] }) =>
  checkRegularo({
    reguloj: { file: "data/reguloj.json", value: reguloj },
    jugxoj: { file: "data/jugxoj.json", value: jugxoj },
  });

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("checkRegularo: kialo", () => {
  it("passes Reguloj that all have a kialo, and counts them", () => {
    const result = run({ reguloj: [regulo(), regulo({ id: REG_B })] });
    expect(result.issues).toEqual([]);
    expect(result.stats).toEqual({ reguloj: 2, jugxoj: 0 });
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["whitespace-only", " \t\n "],
    ["not a string", 42],
    ["null", null],
  ])("reports a %s kialo at the kialo pointer", (_label, kialo) => {
    const bad = regulo();
    if (kialo === undefined) {
      delete bad.kialo;
    } else {
      bad.kialo = kialo;
    }
    const result = run({ reguloj: [regulo({ id: REG_B }), bad] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "regulo-kialo-missing", path: "data/reguloj.json#/reguloj/1/kialo" },
    ]);
    const [issue] = result.issues;
    expect(issue?.severity).toBe("error");
    expect(issue?.message).toContain(REG_A);
    expect(issue?.suggestion).not.toBe("");
  });

  it("reports a non-object Regulo as a schema-violation instead of skipping it", () => {
    const result = run({ reguloj: ["nope"] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "schema-violation", path: "data/reguloj.json#/reguloj/0" },
    ]);
  });

  it("reports a file without a reguloj array as a schema-violation", () => {
    const result = run({ rules: [] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "schema-violation", path: "data/reguloj.json#" },
    ]);
  });
});

describe("checkRegularo: Jugxo references", () => {
  it("passes a Jugxo that references a constitution Article", () => {
    const result = run({ reguloj: [regulo()] }, { jugxoj: [jugxo({ artikolo: "X" })] });
    expect(result.issues).toEqual([]);
    expect(result.stats).toEqual({ reguloj: 1, jugxoj: 1 });
  });

  it("reports an Article outside I to XIII at ref/artikolo", () => {
    const result = run({ reguloj: [regulo()] }, { jugxoj: [jugxo({ artikolo: "XIV" })] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "jugxo-ref-missing", path: "data/jugxoj.json#/jugxoj/0/ref/artikolo" },
    ]);
    expect(result.issues[0]?.suggestion).toContain("XIII");
  });

  it("passes a Jugxo that references an existing Regulo", () => {
    const result = run({ reguloj: [regulo()] }, { jugxoj: [jugxo({ regulo: REG_A })] });
    expect(result.issues).toEqual([]);
    expect(result.stats).toEqual({ reguloj: 1, jugxoj: 1 });
  });

  it("still resolves references to a Regulo whose kialo is missing", () => {
    const result = run(
      { reguloj: [regulo({ kialo: "" })] },
      { jugxoj: [jugxo({ regulo: REG_A })] },
    );
    expect(result.issues.map(({ rule }) => rule)).toEqual(["regulo-kialo-missing"]);
  });

  it("reports a dangling Regulo reference", () => {
    const result = run({ reguloj: [regulo()] }, { jugxoj: [jugxo({ regulo: REG_B })] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "jugxo-ref-missing", path: "data/jugxoj.json#/jugxoj/0/ref/regulo" },
    ]);
    expect(result.issues[0]?.message).toContain(REG_B);
  });

  it("reports any Ero reference, because no Eroj exist in Phase 0", () => {
    const result = run(
      { reguloj: [regulo()] },
      { jugxoj: [jugxo({ ero: "ero_01K5FMAJ0Z0000000000000000" })] },
    );
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "jugxo-ref-missing", path: "data/jugxoj.json#/jugxoj/0/ref/ero" },
    ]);
  });

  it("accepts an Ero reference when the Ero is known", () => {
    const result = checkRegularo({
      reguloj: { file: "data/reguloj.json", value: { reguloj: [] } },
      jugxoj: {
        file: "data/jugxoj.json",
        value: { jugxoj: [jugxo({ ero: "ero_01K5FMAJ0Z0000000000000000" })] },
      },
      eroIds: new Set(["ero_01K5FMAJ0Z0000000000000000"]),
    });
    expect(result.issues).toEqual([]);
  });

  it.each([
    ["missing", undefined],
    ["not an object", "reg_x"],
    ["empty", {}],
    ["ambiguous", { regulo: REG_A, ero: "ero_01K5FMAJ0Z0000000000000000" }],
    ["a non-string target", { regulo: 7 }],
  ])("reports a %s ref at the ref pointer", (_label, ref) => {
    const bad = jugxo(ref);
    if (ref === undefined) {
      delete bad.ref;
    }
    const result = run({ reguloj: [regulo()] }, { jugxoj: [bad] });
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "jugxo-ref-missing", path: "data/jugxoj.json#/jugxoj/0/ref" },
    ]);
  });

  it("reports a file without a jugxoj array as a schema-violation", () => {
    const result = run({ reguloj: [] }, {});
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "schema-violation", path: "data/jugxoj.json#" },
    ]);
  });

  it("orders issues by file, then document order", () => {
    const result = run(
      { reguloj: [regulo({ kialo: "" }), regulo({ id: REG_B, kialo: " " })] },
      { jugxoj: [jugxo({ ero: "ero_01K5FMAJ0Z0000000000000000" }), jugxo({ regulo: "reg_x" })] },
    );
    expect(result.issues.map(({ path }) => path)).toEqual([
      "data/reguloj.json#/reguloj/0/kialo",
      "data/reguloj.json#/reguloj/1/kialo",
      "data/jugxoj.json#/jugxoj/0/ref/ero",
      "data/jugxoj.json#/jugxoj/1/ref/regulo",
    ]);
  });
});
