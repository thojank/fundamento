// The glitilo data (Spec 025 ①; G1–G4, section ①, plan ① D-02–D-04): the slider in the repo Modelo
// — sets a value, or a range between two values, within known limits by dragging or with the keys.
// The field of the kampo around a track: label with the mark of a required field, the track with
// its fill and one thumb (two with range), the limits named at both ends (min-label, max-label) or
// in the help, help and error below; with input a composed kampo of kind number stands beside the
// track (WCAG 2.5.7: dragging has an alternative). The states stand at the thumb (rest, hover,
// focus, pressed — the name of E2 for the dragged thumb, disabled), invalid at the whole. No new
// token (E1): the track takes the sunken ground, fill and thumb the primary action roles, the thumb
// is size.target.min wide. The Skemo names its events (change, input) — the first step to gap 7
// of the benchmark. The new Regulo range-stated (adjustable) asks that the limits are stated.

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const glitilo = eroNamed("glitilo");
const skemo = glitilo?.skemo;
const uzo = glitilo?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const judge = (
  props: Record<string, string | number | boolean>,
  texts: Record<string, string>,
  label = "Lautstärke",
) => evaluateUsage(modelo, [{ ero: "glitilo", props, label, texts, lingvo: "de" }]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("glitilo in the repo Modelo (section ①, G1, G2)", () => {
  it("lives in data/eroj/glitilo/skemo.json, between faldilo and ikono, one of thirty-six Eroj", () => {
    expect(glitilo?.file).toBe("modelo/data/eroj/glitilo/skemo.json");
    expect(modelo.eroj).toHaveLength(36);
    const names = modelo.eroj.map((entry) => entry.ero.name);
    expect(names.indexOf("glitilo")).toBe(names.indexOf("faldilo") + 1);
    expect(names.indexOf("glitilo")).toBe(names.indexOf("ikono") - 1);
  });

  it("has min, max and step with the platform's defaults, value or value-start and value-end, range and input as booleans, the props of a field; readonly as a prop (Regel 0.1)", () => {
    expect(
      skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false, prop.default]),
    ).toEqual([
      ["min", "number", false, 0],
      ["max", "number", false, 100],
      ["step", "number", false, 1],
      ["value", "number", false, undefined],
      ["value-start", "number", false, undefined],
      ["value-end", "number", false, undefined],
      ["range", "boolean", false, false],
      ["field", "boolean", false, false],
      ["required", "boolean", false, false],
      ["disabled", "boolean", false, false],
      ["readonly", "boolean", false, false],
      ["invalid", "boolean", false, false],
      ["name", "string", false, undefined],
    ]);
    // E2: the dragged thumb is pressed, the name the butono has for it — no new state name.
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "pressed", "disabled", "invalid"]);
    // field keys the part number (none without); range keys no part: it is an axis of the set alone.
    expect(variantKeys(skemoOrThrow())).toEqual(["field", "state"]);
  });

  it("has the slots label (default), help, error, min-label and max-label, every one a text", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "help", text: true },
      { name: "error", text: true },
      { name: "min-label", text: true },
      { name: "max-label", text: true },
    ]);
  });

  it("names its parts: label, required-mark, track, fill, thumb, input, min-label, max-label, help, error, focus-ring, box, motion — no new token (E1)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "label",
      "required-mark",
      "track",
      "fill",
      "thumb",
      "number",
      "min-label",
      "max-label",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
    ]);
    expect(skemo?.parts.track).toEqual({
      fill: { fixed: "color.background.sunken" },
      height: { fixed: "spacing.small" },
      radius: { fixed: "radius.full" },
    });
    expect(skemo?.parts.fill).toEqual({
      color: { by: ["state"] },
      radius: { fixed: "radius.full" },
    });
    expect(skemo?.parts.thumb).toEqual({
      color: { by: ["state"] },
      size: { fixed: "size.target.min" },
      radius: { fixed: "radius.full" },
    });
    expect(skemo?.parts.number).toEqual({ width: { by: ["field"] } });
    expect(skemo?.parts["min-label"]).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
    });
    expect(skemo?.parts["max-label"]).toEqual(skemo?.parts["min-label"]);
    for (const binding of skemo?.bindings ?? []) {
      expect(binding.token, `${binding.part}.${binding.property}`).not.toMatch(/^color\.palette\./);
    }
  });

  it("colours fill and thumb by state (their colour, as the meter's bar: no text lies on them), the track the sunken ground; danger when invalid, disabled roles when disabled; the number field is none without field", () => {
    const token = (part: string, property: string, state: string, field = "false") =>
      boundToken(skemoOrThrow(), part, property, { state, field })?.token;
    expect(token("track", "fill", "rest")).toBe("color.background.sunken");
    expect(token("track", "fill", "invalid")).toBe("color.background.sunken");
    expect(token("fill", "color", "rest")).toBe("color.action.primary.rest");
    expect(token("fill", "color", "disabled")).toBe("color.action.primary.disabled");
    expect(token("fill", "color", "invalid")).toBe("color.status.danger.basic");
    expect(token("thumb", "color", "rest")).toBe("color.action.primary.rest");
    expect(token("thumb", "color", "hover")).toBe("color.action.primary.hover");
    expect(token("thumb", "color", "pressed")).toBe("color.action.primary.pressed");
    expect(token("thumb", "color", "disabled")).toBe("color.action.primary.disabled");
    expect(token("thumb", "color", "invalid")).toBe("color.status.danger.basic");
    expect(token("number", "width", "rest", "false")).toBe("none");
    expect(token("number", "width", "rest", "true")).toBe("size.scale.1000");
    expect(token("label", "color", "disabled")).toBe("color.text.disabled");
    // Every combination of the keys has a token (a state without its own repeats rest).
    for (const combination of combinationsOf(skemoOrThrow(), ["state", "field"])) {
      for (const part of ["track", "fill", "thumb", "label"]) {
        const property = part === "track" ? "fill" : "color";
        expect(boundToken(skemoOrThrow(), part, property, combination), part).toBeDefined();
      }
    }
  });

  it("speaks role slider: name from the label, description from help then error, the states, required and the words of the two thumbs in de and en; the keys of APG", () => {
    expect(skemo?.a11y).toEqual({
      role: "slider",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
      },
      keys: [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ],
      texts: {
        required: { de: "erforderlich", en: "required" },
        "min-label-name": { de: "Von", en: "From" },
        "max-label-name": { de: "Bis", en: "To" },
      },
    });
  });

  it("names its events in the Skemo (gap 7): input while the thumb moves, change once it rests; neither cancelable", () => {
    expect(skemo?.events).toEqual([
      {
        name: "input",
        description: "The value changes while a thumb is dragged or a key is held.",
      },
      {
        name: "change",
        description: "A thumb comes to rest on a new value, or the field beside it is left.",
      },
    ]);
  });

  it("forbids an error text without invalid, disabled with readonly, and value-start or value-end without range; the constraint of range-stated reads help and the end labels", () => {
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ "slot:error": "filled" }, { invalid: ["true"] }],
      [{ disabled: "true" }, { readonly: ["false"] }],
      [{ "prop:value-start": "filled" }, { range: ["true"] }],
      [{ "prop:value-end": "filled" }, { range: ["true"] }],
    ]);
    for (const constraint of skemo?.constraints ?? []) expect(constraint.kialo).not.toBe("");
  });

  it("knows the goals slide and value-range with the words of G3, citing range-stated", () => {
    expect(skemo?.goals).toEqual([
      {
        goal: "slide",
        keywords: {
          en: ["slider", "approximate", "roughly", "volume", "brightness"],
          de: ["schieberegler", "regler", "ungefähr", "etwa", "lautstärke", "helligkeit", "pegel"],
        },
        props: {},
        regulo: "range-stated",
      },
      {
        goal: "value-range",
        keywords: {
          en: ["range-slider", "span", "min-max"],
          de: ["preisbereich", "wertebereich", "spanne"],
        },
        props: { range: true, field: true },
        regulo: "range-stated",
      },
    ]);
  });
});

describe("the Uzo of the glitilo (section ①, G2)", () => {
  it("states the purpose; an exact value is the kampo's (kind number); vertical and labelled ticks ask a person", () => {
    expect(uzo?.purpose).toBe(
      "Sets a value, or a range between two values, within known limits by dragging or with the keys.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["exact-value", "kampo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["vertical-track", "ask-human"],
      ["ticks-with-labels", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("stands in a form among the fields, composes the kampo (the field beside the track); the label is a duty; it takes the width of its container", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["form", "dialog"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    expect(uzo?.slots.label).toEqual({ accepts: ["text"], required: true, max: 1, nesting: 0 });
    expect(uzo?.slots["min-label"]).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    // G2: the kampo sends an approximate value here and a range of numbers.
    const kampo = eroNamed("kampo")?.uzo;
    expect(kampo?.instead.find((entry) => entry.goal === "approximate")?.ero).toBe("glitilo");
    expect(kampo?.composes.with.map((entry) => entry.ero)).toContain("glitilo");
  });

  it("the field Reguloj are widened to it (E5) and range-stated is its own rule on the help", () => {
    expect(uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.of, entry.check])).toEqual(
      [
        [
          "field-label-names-the-datum",
          false,
          undefined,
          {
            kind: "not-words",
            words: { de: ["einstellen", "ziehen", "schieben"], en: ["set", "drag", "slide"] },
          },
        ],
        ["error-says-what-to-do", true, "slot:error", { kind: "min-words", count: 3 }],
        ["help-is-one-sentence", false, "slot:help", { kind: "max-sentences", count: 1 }],
        ["range-stated", false, "slot:help", { kind: "min-words", count: 2 }],
      ],
    );
    for (const name of [
      "field-label-visible",
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "error-not-color-only",
      "required-marked",
      "help-is-one-sentence",
      "spacing-owned-by-container",
      "range-stated",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("glitilo");
    }
    for (const name of ["placeholder-not-label", "placeholder-is-example"]) {
      expect(named(name)?.appliesTo?.eroj, name).not.toContain("glitilo");
    }
    const regulo = named("range-stated");
    expect(regulo?.appliesTo).toEqual({ eroj: ["kampo", "glitilo"] });
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toContain("guesses twice");
    expect(modelo.reguloj.filter((entry) => entry.name === "range-stated")).toHaveLength(1);
  });

  it("the brief names field as the axis and the label as the duty, lists range among the props, and stays under 750", () => {
    if (glitilo === undefined) throw new Error("missing");
    const brief = briefOf(glitilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["field"]);
    expect(brief.props?.map((prop) => prop.name)).toContain("range");
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the glitilo (G4, E5)", () => {
  it("range-stated: a bound without a help and without both end labels is a violation; a help of two words or both labels pass", () => {
    expect(rulesOf(judge({ min: 1, max: 10 }, {}))).toEqual([["range-stated", "error"]]);
    expect(rulesOf(judge({ min: 1, max: 10 }, { help: "Zwischen 1 und 10." }))).toEqual([]);
    expect(rulesOf(judge({ min: 1, max: 10 }, { "min-label": "1", "max-label": "10" }))).toEqual(
      [],
    );
    // One end label alone states half the limit.
    expect(rulesOf(judge({ max: 10 }, { "max-label": "10" }))).toEqual([["range-stated", "error"]]);
    // Without a bound of its own the platform's limits stand: nothing to state.
    expect(rulesOf(judge({}, {}))).toEqual([]);
    const finding = judge({ min: 1 }, {}).violations[0];
    expect(finding?.issue.regulo?.kialo).toBe(named("range-stated")?.kialo);
    expect(finding?.issue.suggestion).toContain("min-label");
  });

  it("the field Reguloj judge it as a kampo: a verb in the label, an error without the state, a short error", () => {
    expect(rulesOf(judge({}, {}, "Lautstärke einstellen"))).toEqual([
      ["field-label-names-the-datum", "error"],
    ]);
    expect(rulesOf(judge({}, { error: "Falsch" }))).toEqual([
      ["ero-prop-constraint", "error"],
      ["error-says-what-to-do", "error"],
    ]);
    expect(rulesOf(judge({ invalid: true }, { error: "Wähle einen Wert bis 100." }))).toEqual([]);
    expect(
      rulesOf(evaluateUsage(modelo, [{ ero: "glitilo", props: {}, label: "", texts: {} }])),
    ).toEqual([["field-label-visible", "error"]]);
    // value-start without range breaks the constraint of the Skemo.
    expect(rulesOf(judge({ "value-start": 20 }, {}))).toEqual([["ero-prop-constraint", "error"]]);
  });

  it("the Skemo carries what required-marked and error-not-color-only ask for", () => {
    expect(skemo?.parts["required-mark"]).toBeDefined();
    expect(skemo?.a11y.texts?.required).toEqual({ de: "erforderlich", en: "required" });
    expect(skemo?.slots.some((slot) => slot.name === "error" && slot.text === true)).toBe(true);
    expect(skemo?.a11y.states.invalid).toEqual(["aria-invalid"]);
  });
});

describe("suggest_ero of the slider (Gvidanto)", () => {
  it("'Preisbereich von bis' is the glitilo with range and input, citing range-stated (the spec's dialog)", () => {
    const answer = suggest("Preisbereich von bis");
    expect(answer.suggestion).toEqual({ ero: "glitilo", props: { range: true, field: true } });
    expect(answer.regulo).toMatchObject({ name: "range-stated" });
    expect(answer.kialo).toBe(named("range-stated")?.kialo);
  });

  it("'Lautstärke ungefähr einstellen' is the glitilo alone; 'genauer Wert' sends to the kampo", () => {
    expect(suggest("Lautstärke ungefähr einstellen").suggestion).toEqual({
      ero: "glitilo",
      props: {},
    });
    // The instead entry names the Ero, not a kind: the kampo's own goals decide the kind.
    const exact = suggest("Regler für einen genauen Wert");
    expect(exact.suggestion).toEqual({ ero: "kampo", props: {} });
  });

  it("a vertical slider and labelled ticks stop at the boundaries: the goal and the boundary tie, a person decides (OP-12)", () => {
    const cases = (goal: string) => {
      const answer = suggest(goal);
      expect(answer.action, goal).toBe("ask-human");
      return answer.candidates?.map((candidate) =>
        candidate.kind === "boundary" ? candidate.case : candidate.goal,
      );
    };
    expect(cases("Regler hochkant für die Lautstärke")).toEqual(["vertical-track", "slide"]);
    expect(cases("Regler mit Skalenstrichen")).toEqual(["ticks-with-labels", "slide"]);
  });
});
