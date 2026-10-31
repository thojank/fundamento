// Spec 035 2.2 (Befund der Nordstern-Kennzahl): the simplest way to write a field gives a visible
// label – the text of the element or label="…" (Spec 029 ②b-1b). What the Gvidanto says about it
// has to agree with what the element does: check_usage takes label="…" wherever the element shows
// it (an empty or blank text of the element leaves the label to the attribute, as in the browser),
// and the Regulo field-label-visible names both ways instead of the slot alone.

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { reguloRef } from "../gvidanto/eroj.js";
import { reguloIn } from "../lingvo/tradukoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

const LABEL_RULES = new Set(["field-label-visible", "placeholder-not-label"]);

const regulo = modelo.reguloj.find((candidate) => candidate.name === "field-label-visible");
if (regulo === undefined) throw new Error("field-label-visible missing");
/** The fields of field-label-visible, from the Modelo. */
const FIELDS = [...(regulo.appliesTo?.eroj ?? [])];

const labelRules = (instance: Record<string, unknown>) =>
  evaluateUsage(modelo, [instance as never])
    .violations.map((violation) => violation.issue.rule)
    .filter((rule) => LABEL_RULES.has(rule));

const hasPlaceholder = (ero: string) =>
  modelo.eroj
    .find((entry) => entry.ero.name === ero)
    ?.skemo.props.some((prop) => prop.name === "placeholder") === true;

describe('Spec 035 2.2: check_usage takes label="…" wherever the element shows it', () => {
  it("the Regulo field-label-visible names the 12 fields", () => {
    expect(FIELDS).toHaveLength(12);
  });

  it.each(FIELDS)('%s: label="…" alone is the visible label', (ero) => {
    expect(labelRules({ ero, props: { label: "E-Mail" } })).toEqual([]);
  });

  it.each(FIELDS)(
    '%s: an empty or blank text of the element leaves the label to label="…", as the element shows it',
    (ero) => {
      for (const text of ["", "  ", "\n  \n"]) {
        const props: Record<string, string> = { label: "E-Mail" };
        if (hasPlaceholder(ero)) props.placeholder = "name@firma.de";
        expect(labelRules({ ero, label: text, props }), JSON.stringify(text)).toEqual([]);
      }
    },
  );

  it("without both, field-label-visible still finds the field", () => {
    expect(labelRules({ ero: "kampo", label: " ", props: { label: " " } })).toEqual([
      "field-label-visible",
    ]);
  });

  it("the suggestion of placeholder-not-label names both ways", () => {
    const finding = evaluateUsage(modelo, [
      { ero: "kampo", props: { placeholder: "E-Mail" } } as never,
    ]).violations.find((violation) => violation.issue.rule === "placeholder-not-label");
    expect(finding?.issue.suggestion).toMatch(/label="…"/);
    expect(finding?.issue.suggestion).toMatch(/text of the element/);
  });
});

describe("Spec 035 2.2: the Regulo field-label-visible names both ways", () => {
  it('English: the text of the label slot or label="…", not the slot alone', () => {
    expect(regulo.statement).toMatch(/label="…"/);
    expect(regulo.statement).toMatch(/slot/);
    expect(regulo.statement).not.toMatch(/an empty label slot is a violation/);
  });

  it("German: the same", () => {
    const { statement } = reguloIn(modelo, reguloRef(regulo), "de");
    expect(statement).toMatch(/label="…"/);
    expect(statement).toMatch(/Slot/);
    expect(statement).not.toMatch(/ein leerer Slot label ist ein Verstoß/);
  });
});
