// Spec 029 ②b-1b, Befund der Nachlese 12 (specs/034-nachlese-12/plan.md): in the series H and K the
// gaps are led by field-label-visible, the a11y rule label, the invented attribute kampo.label and
// placeholder-not-label – agents write the label as an attribute (K4 0.7 → 0.55). The simplest way
// to write a field gives a visible label: `label` is a prop of every field that is shown in the
// label while the slot is empty (`shown`), described in the Skemo and in the brief of get_ero; the
// slot's text wins where both are given. The butono's label stays the hidden name of an icon.

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
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

/** The Eroj of the Regulo field-label-visible: every field with a label. */
const LABELLED = [
  "kampo",
  "tekstareo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
  "glitilo",
  "elekto",
  "markobutono",
  "sxaltilo",
  "alsxutilo",
] as const;

const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);

describe("Spec 029 ②b-1b (Nachlese 12): the label of a field as an attribute is shown", () => {
  it("the Regulo field-label-visible names exactly these Eroj", () => {
    const regulo = modelo.reguloj.find((candidate) => candidate.name === "field-label-visible");
    expect([...(regulo?.appliesTo?.eroj ?? [])].sort()).toEqual([...LABELLED].sort());
  });

  it.each(LABELLED)(
    "%s: a string prop label, shown in the label slot, a second source of the name",
    (ero) => {
      const { skemo } = entryOf(ero);
      const label = skemo.props.find((prop) => prop.name === "label");
      expect(label?.kind).toBe("string");
      expect(label?.shown).toBe(true);
      expect(label?.description).toMatch(/visible/i);
      expect(skemo.slots.find((slot) => slot.default === true)?.name).toBe("label");
      expect(skemo.a11y.name).toEqual(["slot:label", "prop:label"]);
    },
  );

  it("the butono's label stays the hidden name of an icon-only button", () => {
    const label = entryOf("butono").skemo.props.find((prop) => prop.name === "label");
    expect(label?.shown).toBeUndefined();
    expect(label?.description).toMatch(/never shown/);
  });

  it("the brief says it: label is shown, and the kampo's brief stays under 750", () => {
    for (const ero of LABELLED) {
      const brief = briefOf(entryOf(ero));
      expect(brief.props, ero).toContainEqual({ name: "label", type: "string", shown: true });
    }
    const butono = briefOf(entryOf("butono"));
    expect(butono.props).toContainEqual({ name: "label", type: "string" });
    expect(tokensOf(briefOf(entryOf("kampo")))).toBeLessThan(750);
  });

  it("check_usage takes the attribute as the visible label: no field-label-visible, no placeholder-not-label", () => {
    const rules = (instance: Record<string, unknown>) =>
      evaluateUsage(modelo, [instance as never]).violations.map(
        (violation) => violation.issue.rule,
      );
    expect(
      rules({ ero: "kampo", props: { label: "E-Mail", placeholder: "name@firma.de" } }),
    ).toEqual([]);
    expect(rules({ ero: "kampo", props: { placeholder: "E-Mail" } })).toEqual(
      expect.arrayContaining(["field-label-visible", "placeholder-not-label"]),
    );
  });

  it("the suggestion of field-label-visible names both ways", () => {
    const result = evaluateUsage(modelo, [{ ero: "kampo", props: {} } as never]);
    const finding = result.violations.find(
      (violation) => violation.issue.rule === "field-label-visible",
    );
    expect(finding?.issue.suggestion).toMatch(/label="/);
    expect(finding?.issue.suggestion).toMatch(/slot|text of the element/i);
  });
});
