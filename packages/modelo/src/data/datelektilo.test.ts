// The datelektilo data (Spec 025 ②; G1–G4, section ②, plan ② D-10–D-13): the date picker in the
// repo Modelo — lets a person choose a date or a date range near today, typed into the field or
// picked from a calendar. The field of the kampo with a trigger beside it (the ikono calendar,
// „Kalender öffnen“) and the calendar as an overlay of the platform (a popover, as the listbox of
// the kompletigilo): the head with month and year, prev and next, the grid of the days. The day
// cell has its own look for selected, in-range, today and outside-month — parts of their own, as
// the danger-item of the menuo and the selected-indicator of the langetaro (E2: the vocabulary
// knows them as entry keys of one slot only; a new state of the Ero would widen every set). No new
// token (E1): the calendar takes the raised ground, the chosen day the selected primary action,
// the days in between the selected secondary action, today a strong border. The Skemo names its
// events (input, change). The limits come from min, max and disabled-dates; readonly is a prop
// (Regel 0.1); first weekday and format come from lang, no props of their own.

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
const datelektilo = eroNamed("datelektilo");
const skemo = datelektilo?.skemo;
const uzo = datelektilo?.uzo;
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
  label = "Lieferdatum",
) => evaluateUsage(modelo, [{ ero: "datelektilo", props, label, texts, lingvo: "de" }]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("datelektilo in the repo Modelo (section ②, G1, G2)", () => {
  it("lives in data/eroj/datelektilo/skemo.json, between butono and dialogo, one of forty Eroj", () => {
    expect(datelektilo?.file).toBe("modelo/data/eroj/datelektilo/skemo.json");
    expect(modelo.eroj).toHaveLength(40);
    const names = modelo.eroj.map((entry) => entry.ero.name);
    expect(names.indexOf("datelektilo")).toBe(names.indexOf("butono") + 1);
    expect(names.indexOf("datelektilo")).toBe(names.indexOf("dialogo") - 1);
    expect(datelektilo?.ero.description).toContain("date");
  });

  it("has mode single or range, value or value-start and value-end as ISO dates, min, max and disabled-dates, the props of a field, expanded; readonly as a prop (Regel 0.1); no props for first weekday or format (lang)", () => {
    expect(
      skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false, prop.default]),
    ).toEqual([
      ["mode", "enum", false, "single"],
      ["value", "string", false, undefined],
      ["value-start", "string", false, undefined],
      ["value-end", "string", false, undefined],
      ["min", "string", false, undefined],
      ["max", "string", false, undefined],
      ["disabled-dates", "string", false, undefined],
      ["required", "boolean", false, false],
      ["disabled", "boolean", false, false],
      ["loading", "boolean", false, false],
      ["readonly", "boolean", false, false],
      ["invalid", "boolean", false, false],
      ["expanded", "boolean", false, false],
      ["name", "string", false, undefined],
      ["clearable", "boolean", false, false],
      // Spec 029 ②b-1b (Nachlese 12): the visible label as an attribute.
      ["label", "string", false, undefined],
      // Spec 029 ②b-1b M-2: the status of the field.
      ["intent", "enum", false, "neutral"],
      ["message-position", "enum", false, "below"],
    ]);
    expect(skemo?.props.find((prop) => prop.name === "mode")?.values).toEqual(["single", "range"]);
    for (const prop of skemo?.props ?? []) {
      expect(prop.description, prop.name).toBeDefined();
      expect(prop.description).not.toMatch(/\bweekday\b.*\bprop\b/);
    }
    // The states of a field (as the kampo's); the cell's own looks are parts, not states (E2).
    expect(skemo?.states).toEqual([
      "rest",
      "hover",
      "focus",
      "disabled",
      "readonly",
      "invalid",
      "warning",
      "success",
    ]);
    // expanded keys the calendar (none while closed); mode keys no part: an axis of the set alone.
    expect(variantKeys(skemoOrThrow())).toEqual(["expanded", "state"]);
  });

  it("has the slots label (default), help and error, every one a text", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "help", text: true },
      { name: "error", text: true },
      { name: "message", text: true, beside: true },
      // Spec 029 ②b-1 M-1: the reason for disabled.
      { name: "disabled-reason", text: true },
    ]);
  });

  it("names its parts: the field's, the trigger, the calendar with head, month, prev, next, weekday, the cell and its four looks — no new token (E1)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "label",
      "required-mark",
      "surface",
      "border",
      "text",
      "trigger",
      "calendar",
      "month",
      "prev",
      "next",
      "weekday",
      "cell",
      "day",
      "selected-cell",
      "selected-day",
      "in-range-cell",
      "today-cell",
      "outside-day",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
      "spinner",
      "clear",
      "message",
    ]);
    // Abnahme #122: the calendar inside the field, the target of a pointer (as komuna from the Fonto).
    // Spec 035 2.3.1: its glyph as large as the chevron of the elektilo, the target its width.
    expect(skemo?.parts.trigger).toEqual({
      size: { fixed: "size.icon.medium" },
      width: { fixed: "size.target.min" },
    });
    expect(skemo?.parts.calendar).toEqual({
      fill: { fixed: "color.background.raised" },
      radius: { fixed: "radius.role.surface" },
      shadow: { fixed: "elevation.shadow.overlay" },
      layer: { fixed: "elevation.layer.overlay" },
      width: { fixed: "size.container.small" },
      "inline-padding": { fixed: "spacing.medium" },
      height: { by: ["expanded"] },
    });
    expect(skemo?.parts.month).toEqual({
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
    });
    expect(skemo?.parts.prev).toEqual({ size: { fixed: "size.control.small" } });
    expect(skemo?.parts.next).toEqual(skemo?.parts.prev);
    expect(skemo?.parts.weekday).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
    });
    // The cell carries its ground as a colour (the way of the glitilo's fill and the meter's bar:
    // no fill, so the pair rule does not lay the label on it); the day is the text in the cell.
    expect(skemo?.parts.cell).toEqual({
      color: { by: ["state"] },
      size: { fixed: "size.target.min" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts.day).toEqual({
      color: { by: ["state"] },
      typography: { fixed: "typography.label.1" },
    });
    expect(skemo?.parts["selected-cell"]).toEqual({
      color: { fixed: "color.action.primary.selected" },
    });
    expect(skemo?.parts["selected-day"]).toEqual({ color: { fixed: "color.action.primary.text" } });
    expect(skemo?.parts["in-range-cell"]).toEqual({
      color: { fixed: "color.action.secondary.selected" },
    });
    expect(skemo?.parts["today-cell"]).toEqual({
      color: { fixed: "color.border.strong" },
      width: { fixed: "border.width.default" },
    });
    expect(skemo?.parts["outside-day"]).toEqual({ color: { fixed: "color.text.muted" } });
    expect(skemo?.parts.box).toEqual({
      height: { fixed: "size.control.medium" },
      "inline-padding": { fixed: "spacing.medium" },
      gap: { fixed: "spacing.small" },
      radius: { fixed: "radius.role.control" },
    });
    for (const binding of skemo?.bindings ?? []) {
      expect(binding.token, `${binding.part}.${binding.property}`).not.toMatch(/^color\.palette\./);
    }
  });

  it("colours the field as the kampo does, the cell as a tertiary action by state; the calendar's height is none while closed", () => {
    const token = (part: string, property: string, state: string, expanded = "false") =>
      boundToken(skemoOrThrow(), part, property, { state, expanded })?.token;
    expect(token("surface", "fill", "rest")).toBe("color.background.default");
    expect(token("surface", "fill", "disabled")).toBe("color.background.sunken");
    // Spec 035 2.3.4 (V-1): read-only keeps the look of rest, as the Fonto's fields do.
    expect(token("surface", "fill", "readonly")).toBe("color.background.default");
    expect(token("border", "color", "rest")).toBe("color.border.default");
    expect(token("border", "color", "hover")).toBe("color.border.strong");
    expect(token("border", "color", "focus")).toBe("color.border.strong");
    expect(token("border", "color", "invalid")).toBe("color.status.danger.border");
    expect(token("border", "color", "disabled")).toBe("color.border.disabled");
    expect(token("text", "color", "rest")).toBe("color.text.default");
    expect(token("text", "color", "disabled")).toBe("color.text.disabled");
    expect(token("label", "color", "disabled")).toBe("color.text.disabled");
    expect(token("cell", "color", "rest")).toBe("color.action.tertiary.rest");
    expect(token("cell", "color", "hover")).toBe("color.action.tertiary.hover");
    expect(token("cell", "color", "focus")).toBe("color.action.tertiary.rest");
    expect(token("cell", "color", "disabled")).toBe("color.action.tertiary.disabled");
    expect(token("day", "color", "rest")).toBe("color.text.default");
    expect(token("day", "color", "disabled")).toBe("color.text.disabled");
    expect(token("calendar", "height", "rest", "false")).toBe("none");
    expect(token("calendar", "height", "rest", "true")).toBe("size.container.medium");
    for (const combination of combinationsOf(skemoOrThrow(), ["state", "expanded"])) {
      for (const [part, property] of [
        ["surface", "fill"],
        ["border", "color"],
        ["text", "color"],
        ["label", "color"],
        ["cell", "color"],
        ["day", "color"],
        ["calendar", "height"],
      ]) {
        expect(
          boundToken(skemoOrThrow(), part ?? "", property ?? "", combination),
          `${part}.${property}`,
        ).toBeDefined();
      }
    }
  });

  it("speaks role textbox: name from the label, description from help then error, the states with expanded, the keys of the APG date picker dialog, the words of trigger, prev, next and the two messages (value-invalid, value-end-invalid) in de and en", () => {
    expect(skemo?.a11y).toEqual({
      role: "textbox",
      name: ["slot:label", "prop:label"],
      description: ["slot:help", "slot:error", "slot:message", "slot:disabled-reason"],
      states: {
        loading: ["aria-busy"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
        expanded: ["aria-expanded"],
      },
      keys: [
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Enter",
        "Escape",
      ],
      texts: {
        "clear-name": { de: "{label} leeren", en: "Clear {label}" },
        loading: { de: "lädt", en: "loading" },
        required: { de: "erforderlich", en: "required" },
        "trigger-name": { de: "Kalender öffnen", en: "Open calendar" },
        "prev-name": { de: "Voriger Monat", en: "Previous month" },
        "next-name": { de: "Nächster Monat", en: "Next month" },
        // The two messages are keyed by the prop they judge (<prop>-invalid, skemo-a11y-invalid).
        "value-invalid": {
          de: "Gib ein Datum wie {example} ein.",
          en: "Enter a date like {example}.",
        },
        "value-end-invalid": {
          de: "Wähle ein Ende nach dem Anfang.",
          en: "Choose an end after the start.",
        },
      },
    });
  });

  it("names its events in the Skemo (gap 7): input while typing, change once a date is picked or a typed date is left; neither cancelable", () => {
    expect(skemo?.events?.map((event) => [event.name, event.cancelable ?? false])).toEqual([
      ["input", false],
      ["change", false],
    ]);
    for (const event of skemo?.events ?? []) expect(event.description.length).toBeGreaterThan(20);
  });

  it("forbids an error text without invalid, disabled with readonly, value with mode range and value-start or value-end with mode single", () => {
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ "slot:error": "filled" }, { invalid: ["true"] }],
      [{ disabled: "true" }, { readonly: ["false"] }],
      [{ "prop:value": "filled" }, { mode: ["single"] }],
      [{ "prop:value-start": "filled" }, { mode: ["range"] }],
      [{ "prop:value-end": "filled" }, { mode: ["range"] }],
      [{ "slot:disabled-reason": "filled" }, { disabled: ["true"] }],
      // Spec 029 ②b-1b M-2: the status of the field.
      [{ "slot:message": "filled" }, { intent: ["success", "warning"] }],
      [{ invalid: "true" }, { intent: ["neutral", "danger"] }],
    ]);
    for (const constraint of skemo?.constraints ?? []) expect(constraint.kialo).toMatch(/because/);
  });

  it("knows the goals pick-date and date-range with the words of G3", () => {
    expect(skemo?.goals).toEqual([
      {
        goal: "pick-date",
        keywords: {
          en: ["date-picker", "calendar", "delivery-date", "booking-date", "due-date"],
          de: ["kalender", "datumsauswahl", "lieferdatum", "buchungsdatum", "fälligkeit"],
        },
        props: {},
        regulo: "field-label-visible",
      },
      {
        goal: "date-range",
        keywords: {
          en: ["date-range", "period", "timeframe"],
          de: ["zeitraum", "berichtszeitraum", "datumsbereich", "zeitspanne"],
        },
        props: { mode: "range" },
        regulo: "field-label-visible",
      },
    ]);
  });
});

describe("the Uzo of the datelektilo (section ②, G2)", () => {
  it("states the purpose; a birthday is the kampo's (kind date); a time of day the kampo's too; several months and presets ask a person", () => {
    expect(uzo?.purpose).toBe(
      "Lets a person choose a date or a date range near today, typed or picked from a calendar.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["birthday", "kampo"]]);
    expect(uzo?.instead[0]?.keywords).toEqual({
      en: ["birthday", "date-of-birth", "born"],
      de: ["geburtsdatum", "geburtstag", "geboren"],
    });
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action, entry.ero])).toEqual([
      ["time-of-day", "use-instead", "kampo"],
      ["multiple-months", "ask-human", undefined],
      ["presets", "ask-human", undefined],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("stands in a form among the fields, composes the kampo and the butono (G2); the label is a duty; it takes the width of its container", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["form", "dialog"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    expect(uzo?.slots.label).toEqual({ accepts: ["text"], required: true, max: 1, nesting: 0 });
    expect(uzo?.slots.help).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    // G2: the kampo sends a date near today and a date range here; its boundary date-range is
    // closed (use-instead), as file was closed by the alsxutilo (Spec 015 ②).
    const kampo = eroNamed("kampo")?.uzo;
    expect(kampo?.boundary.find((entry) => entry.case === "date-range")).toMatchObject({
      action: "use-instead",
      ero: "datelektilo",
    });
    expect(kampo?.composes.with.map((entry) => entry.ero)).toContain("datelektilo");
  });

  it("the field Reguloj are widened to it (E5); range-stated is not (dates have no scale to state)", () => {
    expect(uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.of, entry.check])).toEqual(
      [
        [
          "field-label-names-the-datum",
          false,
          undefined,
          {
            kind: "not-words",
            words: { de: ["wählen", "auswählen", "eingeben"], en: ["choose", "pick", "enter"] },
          },
        ],
        ["error-says-what-to-do", true, "slot:error", { kind: "min-words", count: 3 }],
        ["help-is-one-sentence", false, "slot:help", { kind: "max-sentences", count: 1 }],
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
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("datelektilo");
    }
    for (const name of ["placeholder-not-label", "placeholder-is-example", "range-stated"]) {
      expect(named(name)?.appliesTo?.eroj, name).not.toContain("datelektilo");
    }
  });

  it("the brief names mode and expanded as the axes and the label as the duty, lists disabled-dates among the props, and stays under 750", () => {
    if (datelektilo === undefined) throw new Error("missing");
    const brief = briefOf(datelektilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual([
      "mode",
      "expanded",
      "intent",
      "message-position",
    ]);
    expect(brief.props?.map((prop) => prop.name)).toContain("disabled-dates");
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the datelektilo (G4, E5)", () => {
  it("the field Reguloj judge it as a kampo: a verb in the label, an error without the state, a short error; value-start without mode range breaks the constraint", () => {
    expect(rulesOf(judge({}, {}, "Datum wählen"))).toEqual([
      ["field-label-names-the-datum", "error"],
    ]);
    expect(rulesOf(judge({}, { error: "Falsch" }))).toEqual([
      ["ero-prop-constraint", "error"],
      ["error-says-what-to-do", "error"],
    ]);
    expect(rulesOf(judge({ invalid: true }, { error: "Wähle ein Datum ab heute." }))).toEqual([]);
    expect(rulesOf(judge({ "value-start": "2026-10-06" }, {}))).toEqual([
      ["ero-prop-constraint", "error"],
    ]);
    expect(rulesOf(judge({ mode: "range", "value-start": "2026-10-06" }, {}))).toEqual([]);
    expect(
      rulesOf(evaluateUsage(modelo, [{ ero: "datelektilo", props: {}, label: "", texts: {} }])),
    ).toEqual([["field-label-visible", "error"]]);
  });

  it("the Skemo carries what required-marked and error-not-color-only ask for", () => {
    expect(skemo?.parts["required-mark"]).toBeDefined();
    expect(skemo?.a11y.texts?.required).toEqual({ de: "erforderlich", en: "required" });
    expect(skemo?.slots.some((slot) => slot.name === "error" && slot.text === true)).toBe(true);
    expect(skemo?.a11y.states.invalid).toEqual(["aria-invalid"]);
  });
});

describe("suggest_ero of the date picker (Gvidanto)", () => {
  it("'Zeitraum für den Bericht' is the datelektilo with mode range, the kampo's closed boundary beside it (the spec's dialog)", () => {
    const answer = suggest("Zeitraum für den Bericht");
    expect(answer.suggestion).toEqual({ ero: "datelektilo", props: { mode: "range" } });
    expect(answer.boundary).toMatchObject({
      ero: "kampo",
      case: "date-range",
      action: "use-instead",
    });
  });

  it("'Geburtsdatum' is the kampo of kind date (the spec's dialog); the datelektilo's instead entry birthday names the kampo with its kialo", () => {
    expect(suggest("Geburtsdatum").suggestion).toEqual({ ero: "kampo", props: { kind: "date" } });
    const birthday = uzo?.instead.find((entry) => entry.goal === "birthday");
    expect(birthday?.ero).toBe("kampo");
    expect(birthday?.kialo).toMatch(/typed|type/);
  });

  it("'Lieferdatum im Kalender' is the datelektilo alone; 'Uhrzeit des Termins' stays the kampo of kind time (Spec 025 ①)", () => {
    expect(suggest("Lieferdatum im Kalender").suggestion).toEqual({
      ero: "datelektilo",
      props: {},
    });
    expect(suggest("Uhrzeit des Termins").suggestion).toEqual({
      ero: "kampo",
      props: { kind: "time" },
    });
  });
});
