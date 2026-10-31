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

/**
 * A-elektilo-1, A-markobutono-1 (and the read-only of A-elektilo-3, A-markobutono-3): readonly, the
 * last prop (Arkitekturo contract: every prop before it stands as it stood). Read-only keeps the
 * look of rest (Spec 035 V-1): a prop without a state of its own, as at tekstareo and glitilo.
 */
const READONLY: Readonly<Record<string, readonly string[]>> = {
  elektilo: [
    "value",
    "placeholder",
    "required",
    "invalid",
    "size",
    "disabled",
    "loading",
    "name",
    "empty-label",
    "clearable",
    "label",
    "intent",
    "message-position",
  ],
  markobutono: [
    "checked",
    "required",
    "invalid",
    "size",
    "disabled",
    "loading",
    "name",
    "label",
    "intent",
    "message-position",
  ],
};

describe("②b-2 A-elektilo-1, A-markobutono-1: readonly", () => {
  it.each(Object.entries(READONLY))("%s: readonly after every prop it had", (ero, before) => {
    const { skemo } = entryOf(ero);
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(0, before.length)).toEqual(before);
    expect(names.slice(before.length)).toEqual(["readonly"]);
    expect(propOf(ero, "readonly")).toMatchObject({ kind: "boolean", default: false });
    expect(skemo.a11y.states.readonly).toEqual(["aria-readonly"]);
    // V-1: read-only looks as rest – no state of its own, no binding keyed by it.
    expect(skemo.states).not.toContain("readonly");
  });

  it.each(Object.keys(READONLY))("%s: the brief names readonly as a flag, under 750", (ero) => {
    const brief = briefOf(entryOf(ero));
    expect(brief.flags).toContain("readonly");
    expect(tokensOf(brief)).toBeLessThan(750);
  });

  it("the twelve fields: readonly wherever a value can be read but not changed", () => {
    const withReadonly = [
      "kampo",
      "tekstareo",
      "elektilo",
      "listelektilo",
      "plurelektilo",
      "datelektilo",
      "glitilo",
      "markobutono",
    ];
    for (const ero of withReadonly) expect(propOf(ero, "readonly"), ero).toBeDefined();
  });
});

/** A-sxaltilo-1: the side of the label, `label-side` start | end, the last prop. */
describe("②b-2 A-sxaltilo-1: label-side", () => {
  it("sxaltilo: label-side start | end after every prop it had, default end", () => {
    const { skemo } = entryOf("sxaltilo");
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(0, -1)).toEqual([
      "checked",
      "size",
      "disabled",
      "loading",
      "name",
      "label",
      "intent",
      "message-position",
    ]);
    expect(propOf("sxaltilo", "label-side")).toMatchObject({
      kind: "enum",
      values: ["start", "end"],
      default: "end",
    });
    // Layout, no token: it keys no part (as the orientation of the elekto).
    expect(skemo.bindings.filter((binding) => binding.when?.["label-side"] !== undefined)).toEqual(
      [],
    );
  });

  it("sxaltilo: the brief names label-side as an axis, under 750", () => {
    const brief = briefOf(entryOf("sxaltilo"));
    expect(brief.axes).toContainEqual({
      name: "label-side",
      values: ["start", "end"],
      default: "end",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/**
 * A-kompletigilo-1 (max-suggestions), A-alsxutilo-1 (max-files), A-tekstareo-1 (max-length with
 * its count; the boundary character-count decided, ②a-3): numbers after every prop they had.
 */
const NUMBERS: Readonly<Record<string, string>> = {
  kompletigilo: "max-suggestions",
  alsxutilo: "max-files",
  tekstareo: "max-length",
};

describe("②b-2 A-kompletigilo-1, A-alsxutilo-1, A-tekstareo-1: the numbers", () => {
  it.each(Object.entries(NUMBERS))("%s: %s, a number and the last prop", (ero, name) => {
    const { skemo } = entryOf(ero);
    expect(skemo.props.at(-1)?.name).toBe(name);
    expect(propOf(ero, name)).toMatchObject({ kind: "number" });
    expect(briefOf(entryOf(ero)).props).toContainEqual({ name, type: "number" });
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });

  it("alsxutilo: max-files only with multiple, and the Modelo's words for too many files", () => {
    const { skemo } = entryOf("alsxutilo");
    expect(skemo.constraints).toContainEqual(
      expect.objectContaining({
        when: { "prop:max-files": "filled" },
        allowed: { multiple: ["true"] },
      }),
    );
    const words = skemo.a11y.texts?.["max-files-invalid"];
    expect(words?.de).toContain("{max-files}");
    expect(words?.en).toContain("{max-files}");
    const judged = evaluateUsage(modelo, [
      { ero: "alsxutilo", props: { "max-files": 3 }, label: "Belege", lingvo: "de" },
    ]);
    expect(judged.violations.map((violation) => violation.issue.rule)).toContain(
      "ero-prop-constraint",
    );
  });

  it("tekstareo: max-length shows a count that describes the area; character-count is decided", () => {
    const { skemo, uzo } = entryOf("tekstareo");
    expect(skemo.parts.count).toBeDefined();
    expect(skemo.a11y.description).toContain("prop:max-length");
    const words = skemo.a11y.texts?.["count-count"];
    expect(words?.de).toContain("{max-length}");
    expect(words?.en).toContain("{max-length}");
    expect(uzo?.boundary.map((boundary) => boundary.case)).not.toContain("character-count");
  });
});
