// Spec 025 ① (section ①, plan ① D-01, D-05–D-07): what the round adds beside the glitilo — the
// kampo takes kind time (the platform's time input), step buttons for a number (stepper, step,
// the parts decrement and increment as composed butono with the ikono subtract and add) and a
// clear button for a search (the part clear with the ikono close); the Skemo of the kampo names
// its events (input, change); the Ikonaro grows by add and subtract (G1: +6 names at most in the
// round); the new Regulo range-stated judges a kampo of kind number with bounds; the kampo's
// boundary number-stepper is closed, a time zone stops (ask-human). Arkitekturo contract: nothing
// of the kampo is renamed, every prop and part of 0.2.0 stands.

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const kampo = eroNamed("kampo");
if (kampo === undefined) throw new Error("kampo missing");
const { skemo, uzo } = kampo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const judge = (props: Record<string, string | number | boolean>, texts: Record<string, string>) =>
  evaluateUsage(modelo, [{ ero: "kampo", props, label: "Menge", texts, lingvo: "de" }]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("the kampo of Spec 025 ①: time, stepper and clear (Arkitekturo contract)", () => {
  it("keeps every prop of 0.2.0 by name and takes kind time, stepper and step after them", () => {
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(0, 12)).toEqual([
      "kind",
      "value",
      "placeholder",
      "required",
      "disabled",
      "readonly",
      "invalid",
      "size",
      "name",
      "min",
      "max",
      "autocomplete",
    ]);
    expect(names.slice(12)).toEqual(["stepper", "step"]);
    expect(skemo.props.find((prop) => prop.name === "kind")?.values).toEqual([
      "text",
      "email",
      "tel",
      "url",
      "search",
      "password",
      "number",
      "date",
      "time",
    ]);
    expect(skemo.props.find((prop) => prop.name === "stepper")).toMatchObject({
      kind: "boolean",
      default: false,
    });
    expect(skemo.props.find((prop) => prop.name === "step")).toMatchObject({ kind: "string" });
    expect(skemo.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
  });

  it("keeps every part of 0.2.0 and adds decrement, increment and clear — composed butono in the field's size, no new token (E1)", () => {
    const parts = Object.keys(skemo.parts);
    expect(parts.slice(0, 11)).toEqual([
      "label",
      "required-mark",
      "surface",
      "border",
      "text",
      "placeholder",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
    ]);
    expect(parts.slice(11)).toEqual(["decrement", "increment", "clear"]);
    expect(skemo.parts.decrement).toEqual({ size: { by: ["size"] } });
    expect(skemo.parts.increment).toEqual({ size: { by: ["size"] } });
    expect(skemo.parts.clear).toEqual({ size: { fixed: "size.control.small" } });
    const sizes = skemo.bindings.filter(
      (binding) => binding.part === "decrement" && binding.property === "size",
    );
    expect(sizes.map((binding) => [binding.when?.size, binding.token])).toEqual([
      ["small", "size.control.small"],
      ["medium", "size.control.medium"],
      ["large", "size.control.large"],
    ]);
  });

  it("names the buttons in de and en (a11y.texts <part>-name): Verringern, Erhöhen, Suche leeren", () => {
    expect(skemo.a11y.texts).toEqual({
      required: { de: "erforderlich", en: "required" },
      "decrement-name": { de: "Verringern", en: "Decrease" },
      "increment-name": { de: "Erhöhen", en: "Increase" },
      "clear-name": { de: "Suche leeren", en: "Clear search" },
    });
    // Arrow keys step a number as the platform's own number input does; Escape clears a search.
    expect(skemo.a11y.keys).toEqual(["Enter", "ArrowUp", "ArrowDown", "Escape"]);
  });

  it("names its events in the Skemo (gap 7): input and change, as the platform's field says them", () => {
    expect(skemo.events?.map((event) => [event.name, event.cancelable ?? false])).toEqual([
      ["input", false],
      ["change", false],
    ]);
  });

  it("allows min and max on time too; forbids a stepper and a step on a kind that is no number", () => {
    const constraints = skemo.constraints ?? [];
    expect(constraints.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ "slot:error": "filled" }, { invalid: ["true"] }],
      [{ disabled: "true" }, { readonly: ["false"] }],
      [{ "prop:min": "filled" }, { kind: ["number", "date", "time"] }],
      [{ "prop:max": "filled" }, { kind: ["number", "date", "time"] }],
      [{ stepper: "true" }, { kind: ["number"] }],
      [{ "prop:step": "filled" }, { kind: ["number"] }],
    ]);
    expect(rulesOf(judge({ kind: "text", stepper: true }, {}))).toEqual([
      ["ero-prop-constraint", "error"],
    ]);
    expect(rulesOf(judge({ kind: "time", min: "08:00", max: "18:00" }, {}))).toEqual([]);
  });

  it("knows the goals count (a number with its stepper) and time beside the five of before", () => {
    expect(skemo.goals?.map((goal) => goal.goal)).toEqual([
      "enter-text",
      "email",
      "password",
      "number",
      "date",
      "count",
      "time",
    ]);
    expect(skemo.goals?.find((goal) => goal.goal === "count")).toEqual({
      goal: "count",
      keywords: {
        en: ["counter", "plus", "minus", "quantity"],
        de: ["zähler", "menge", "plus", "minus", "schrittknöpfe", "stückzahl"],
      },
      props: { kind: "number", stepper: true },
      regulo: "range-stated",
    });
    expect(skemo.goals?.find((goal) => goal.goal === "time")).toEqual({
      goal: "time",
      keywords: {
        en: ["time", "clock", "hour", "o-clock"],
        de: ["uhrzeit", "uhr", "stunde", "beginn", "startzeit"],
      },
      props: { kind: "time" },
      regulo: "field-label-visible",
    });
  });

  it("the Uzo: number-stepper is gone (the kampo covers it), time-zone asks a person, approximate goes to the glitilo (G2), the glitilo composes with the field", () => {
    expect(uzo?.boundary.map((entry) => entry.case)).not.toContain("number-stepper");
    const zone = uzo?.boundary.find((entry) => entry.case === "time-zone");
    expect(zone).toMatchObject({ action: "ask-human" });
    expect(zone?.kialo).toMatch(/\bbecause\b/);
    expect(zone?.keywords).toEqual({
      en: ["timezone", "time-zone", "utc", "am-pm"],
      de: ["zeitzone", "utc", "am-pm"],
    });
    expect(uzo?.instead.find((entry) => entry.goal === "approximate")).toMatchObject({
      ero: "glitilo",
      keywords: { en: ["approximate", "roughly", "slider"], de: ["ungefähr", "etwa", "regler"] },
    });
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "kampo",
      "butono",
      "glitilo",
      "datelektilo",
    ]);
    // range-stated judges the kampo too, on its help.
    expect(uzo?.content.find((entry) => entry.regulo === "range-stated")).toEqual({
      regulo: "range-stated",
      fixed: false,
      of: "slot:help",
      check: { kind: "min-words", count: 2 },
      when: { props: { kind: ["number"] } },
    });
  });

  it("the brief of the kampo stays under 750 with time, the stepper and the step", () => {
    const brief = briefOf(kampo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["kind", "size"]);
    expect(brief.props?.map((prop) => prop.name)).toEqual(
      expect.arrayContaining(["stepper", "step"]),
    );
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("range-stated at the kampo (G4, E5)", () => {
  it("a number with a bound and no help is a violation; the help 'Zwischen 1 und 10.' passes; a date with bounds is not judged (the rule names kind number)", () => {
    expect(rulesOf(judge({ kind: "number", min: "1", max: "10" }, {}))).toEqual([
      ["range-stated", "error"],
    ]);
    expect(
      rulesOf(judge({ kind: "number", min: "1", max: "10" }, { help: "Zwischen 1 und 10." })),
    ).toEqual([]);
    expect(rulesOf(judge({ kind: "number", stepper: true }, {}))).toEqual([]);
    expect(rulesOf(judge({ kind: "date", min: "2026-10-01", max: "2026-12-31" }, {}))).toEqual([]);
    const finding = judge({ kind: "number", max: "10" }, {}).violations[0];
    expect(finding?.issue.regulo?.name).toBe("range-stated");
    expect(finding?.issue.message).toContain("max");
  });

  it("the Regulo carries four Jugxoj as examples, right and wrong in de and en", () => {
    const regulo = named("range-stated");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
    expect(examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo])).toEqual(
      [
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ],
    );
    expect(regulo?.statement).toContain("glitilo");
    expect(regulo?.statement).toContain("kind number");
  });
});

describe("suggest_ero of the kampo additions (Gvidanto)", () => {
  it("'Menge zwischen 1 und 10 mit Plus und Minus' is the kampo of kind number with stepper, citing range-stated (the spec's dialog)", () => {
    const answer = suggest("Menge zwischen 1 und 10 mit Plus und Minus");
    expect(answer.suggestion).toEqual({ ero: "kampo", props: { kind: "number", stepper: true } });
    expect(answer.regulo).toMatchObject({ name: "range-stated" });
    expect(answer.kialo).toBe(named("range-stated")?.kialo);
  });

  it("'Uhrzeit des Termins' is the kampo of kind time; a time zone stops at the boundary", () => {
    expect(suggest("Uhrzeit des Termins").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "time" },
    });
    // The goal time and the boundary tie: a person decides, with both candidates (OP-12).
    const zone = suggest("Uhrzeit mit Zeitzone");
    expect(zone.action).toBe("ask-human");
    expect(
      zone.candidates?.map((candidate) =>
        candidate.kind === "boundary" ? candidate.case : candidate.goal,
      ),
    ).toEqual(["time-zone", "time"]);
  });
});

describe("the Ikonaro of Spec 025 ① (G1: add and subtract)", () => {
  it("names add and subtract, neither mirrored; the ikono knows both names; the kampo composes the ikono", () => {
    const names = modelo.ikonaro?.map((ikono) => ikono.name) ?? [];
    expect(names.length).toBeGreaterThanOrEqual(20);
    expect(names).toContain("add");
    expect(names).toContain("subtract");
    expect([...names].sort()).toEqual(names);
    for (const name of ["add", "subtract"]) {
      const ikono = modelo.ikonaro?.find((entry) => entry.name === name);
      expect(ikono?.mirror, name).toBeUndefined();
      expect(ikono?.meaning.de, name).not.toBe("");
      expect(ikono?.kialo, name).toContain("kampo");
      expect(eroNamed("ikono")?.skemo.props[0]?.values).toContain(name);
    }
    expect(uzo?.composes.with.map((entry) => entry.ero)).not.toContain("ikono");
    expect(eroNamed("ikono")?.uzo?.composes.with.map((entry) => entry.ero)).toContain("kampo");
  });
});
