// Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen"; decided 24.10.):
// the axes and values of the fields and choices. Every new prop stands after the props of 0.2.0
// (Arkitekturo contract); a value that goes stays one release as a deprecated alias (②a-2).

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { checkUsage } from "../gvidanto/check-usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};
const propOf = (ero: string, name: string) =>
  entryOf(ero).skemo.props.find((prop) => prop.name === name) as
    | ({ deprecatedValues?: Record<string, string> } & Record<string, unknown>)
    | undefined;
const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);

/** A-elekto-2, A-markobutono-2, A-sxaltilo-2: two sizes, large an alias of medium (②a-2). */
const TWO_SIZES = ["elekto", "markobutono", "sxaltilo"] as const;

describe("②b-2 A-*-2: two sizes, large a deprecated alias of medium (②a-2)", () => {
  it.each(TWO_SIZES)("%s: size small | medium, large deprecated → medium", (ero) => {
    const size = propOf(ero, "size");
    expect(size).toMatchObject({ kind: "enum", values: ["small", "medium"], default: "medium" });
    expect(size?.deprecatedValues).toEqual({ large: "medium" });
  });

  it.each(TWO_SIZES)("%s: no binding keys a size the prop does not have", (ero) => {
    const { skemo } = entryOf(ero);
    const keyed = skemo.bindings.filter((binding) => binding.when?.size !== undefined);
    expect(keyed.length).toBeGreaterThan(0);
    expect(keyed.filter((binding) => binding.when?.size === "large")).toEqual([]);
  });

  it("every deprecated value of every Skemo is no value of its prop and names one", () => {
    const wrong: string[] = [];
    for (const entry of modelo.eroj) {
      for (const prop of entry.skemo.props) {
        const deprecated = (prop as { deprecatedValues?: Record<string, string> }).deprecatedValues;
        for (const [value, target] of Object.entries(deprecated ?? {})) {
          if ((prop.values ?? []).includes(value) || !(prop.values ?? []).includes(target)) {
            wrong.push(`${entry.ero.name}.${prop.name}: ${value} → ${target}`);
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it.each(TWO_SIZES)("%s: the brief flags large as deprecated and stays under 750", (ero) => {
    const brief = briefOf(entryOf(ero));
    const axis = brief.axes.find((candidate) => candidate.name === "size") as
      | { values: string[]; deprecated?: Record<string, string> }
      | undefined;
    expect(axis?.values).toEqual(["small", "medium"]);
    expect(axis?.deprecated).toEqual({ large: "medium" });
    expect(tokensOf(brief)).toBeLessThan(750);
  });

  it.each(TWO_SIZES)("%s: check_usage takes size large and warns that it is deprecated", (ero) => {
    const checked = checkUsage(modelo, {
      instances: [{ ero, props: { size: "large" }, label: "Newsletter", lingvo: "de" }],
    });
    if (!checked.ok) throw new Error(`check_usage ${ero} refused size large`);
    const warning = checked.output.violations.find(
      (violation) => violation.issue.rule === "prop-value-deprecated",
    );
    expect(warning?.issue).toMatchObject({
      rule: "prop-value-deprecated",
      severity: "warning",
      path: "instances#/0/props/size",
    });
    expect(warning?.issue.suggestion).toContain('size="medium"');
    const plain = evaluateUsage(modelo, [{ ero, props: { size: "medium" }, label: "Newsletter" }]);
    expect(plain.violations.map((violation) => violation.issue.rule)).not.toContain(
      "prop-value-deprecated",
    );
  });
});
