// Spec 025 ③ (section ③, plan ③ D-14–D-19): the four Eroj of the selection round in the repo
// Modelo — the signeto (a tag: static, selectable as a filter, removable), the listelektilo (a
// styled select-only list whose options carry an icon and a description), the plurelektilo (several
// values from a long list, filterable, the chosen ones as a count or as removable tags) and the
// lokredaktilo (a single value of a view turned into a field on the spot, with save and cancel) —
// and what they close in their neighbours (G2): the insigno's boundary removable-chip, the
// elektilo's boundary custom-popup and its alternative multiple, the kompletigilo's boundary
// multi-select, the kampo's new alternative single-value. The Ikonaro grows by edit (G1: +6 at
// most in the round, four used). Forty Eroj (Abnahme 4).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
/** The Skemo of an Ero the test needs: a missing Ero fails here, not as a type error. */
const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error("Ero missing");
  return value;
};
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const brief750 = (name: string) => {
  const entry = eroNamed(name);
  if (entry === undefined) throw new Error(`${name} missing`);
  const brief = briefOf(entry);
  const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
  expect(Math.ceil(bytes / 3), `${name}: ${bytes} bytes`).toBeLessThanOrEqual(750);
  return brief;
};

describe("the four Eroj of Spec 025 ③ in the repo Modelo (forty Eroj)", () => {
  it("lists forty Eroj in name order: listelektilo and lokredaktilo after ligilo, plurelektilo after plenstato, signeto after saltligilo", () => {
    expect(modelo.eroj).toHaveLength(40);
    const names = modelo.eroj.map((entry) => entry.ero.name);
    expect(names.indexOf("listelektilo")).toBe(names.indexOf("ligilo") + 1);
    expect(names.indexOf("lokredaktilo")).toBe(names.indexOf("listelektilo") + 1);
    expect(names.indexOf("plurelektilo")).toBe(names.indexOf("plenstato") + 1);
    expect(names.indexOf("signeto")).toBe(names.indexOf("saltligilo") + 1);
    for (const name of ["signeto", "listelektilo", "plurelektilo", "lokredaktilo"]) {
      expect(eroNamed(name)?.file).toBe(`modelo/data/eroj/${name}/skemo.json`);
      expect(eroNamed(name)?.skemo.events?.map((event) => event.name)).toContain("change");
      // Regel 0.1: every new input Ero knows readonly, as a prop.
      if (name !== "signeto") {
        expect(eroNamed(name)?.skemo.props.map((prop) => prop.name)).toContain("readonly");
      }
    }
  });
});

describe("signeto (D-14): a tag — static, selectable as a filter, removable", () => {
  const skemo = eroNamed("signeto")?.skemo;
  const uzo = eroNamed("signeto")?.uzo;

  it("has mode, selected, size, intent (the roles of the insigno, no free colour scale: E1) and disabled; the states of a control", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["mode", "enum", "static"],
      ["selected", "boolean", false],
      ["size", "enum", "medium"],
      ["intent", "enum", "neutral"],
      ["disabled", "boolean", false],
    ]);
    expect(skemo?.props.find((prop) => prop.name === "mode")?.values).toEqual([
      "static",
      "selectable",
      "removable",
    ]);
    expect(skemo?.props.find((prop) => prop.name === "intent")?.values).toEqual([
      "neutral",
      "info",
      "success",
      "warning",
      "danger",
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled"]);
    expect(variantKeys(required(skemo))).toEqual(["selected", "size", "intent", "state"]);
  });

  it("has the slots label (default) and icon-start; the parts surface, border, text, remove, focus-ring, box (pill), motion; the chosen tag takes the selected primary action", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "icon-start", decorative: true },
    ]);
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "surface",
      "border",
      "text",
      "remove",
      "focus-ring",
      "box",
      "motion",
    ]);
    expect(skemo?.parts.surface).toEqual({ fill: { by: ["selected", "intent"] } });
    expect(skemo?.parts.border).toEqual({
      color: { by: ["intent", "state"] },
      width: { fixed: "border.width.default" },
    });
    expect(skemo?.parts.text).toEqual({
      color: { by: ["selected", "intent"] },
      typography: { fixed: "typography.label.2" },
    });
    expect(skemo?.parts.remove).toEqual({ size: { fixed: "size.control.small" } });
    expect(skemo?.parts.box).toEqual({
      height: { by: ["size"] },
      "inline-padding": { by: ["size"] },
      gap: { fixed: "spacing.xsmall" },
      radius: { fixed: "radius.role.pill" },
    });
    if (skemo === undefined) throw new Error("missing");
    const token = (part: string, property: string, when: Record<string, string>) =>
      boundToken(skemo, part, property, { state: "rest", ...when })?.token;
    expect(token("surface", "fill", { intent: "neutral", selected: "false" })).toBe(
      "color.background.sunken",
    );
    expect(token("surface", "fill", { intent: "info", selected: "false" })).toBe(
      "color.status.info.subtle",
    );
    expect(token("surface", "fill", { intent: "neutral", selected: "true" })).toBe(
      "color.action.primary.selected",
    );
    expect(token("text", "color", { intent: "danger", selected: "false" })).toBe(
      "color.status.danger.text",
    );
    expect(token("text", "color", { intent: "danger", selected: "true" })).toBe(
      "color.action.primary.text",
    );
    expect(token("border", "color", { intent: "neutral", state: "hover" })).toBe(
      "color.border.strong",
    );
    expect(token("border", "color", { intent: "neutral", state: "disabled" })).toBe(
      "color.border.disabled",
    );
  });

  it("speaks: name from the label, selected as aria-pressed (a selectable tag is a button), the keys Enter, Space, Delete, Backspace; the remove button named with the label; events change and the cancelable remove", () => {
    expect(skemo?.a11y).toEqual({
      role: "generic",
      name: ["slot:label"],
      states: { selected: ["aria-pressed"], disabled: ["aria-disabled"] },
      keys: ["Enter", "Space", "Delete", "Backspace"],
      texts: { "remove-name": { de: "{label} entfernen", en: "Remove {label}" } },
    });
    expect(skemo?.events?.map((event) => [event.name, event.cancelable ?? false])).toEqual([
      ["change", false],
      ["remove", true],
    ]);
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ selected: "true" }, { mode: ["selectable"] }],
    ]);
  });

  it("knows the goals filter-chip (mode selectable), removable-tag (mode removable) and keyword-tag without the words of the insigno (badge, tag, chip, status)", () => {
    // The filter and the removable tag stand first: a text that names them wins over the plain tag.
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props])).toEqual([
      ["filter-chip", { mode: "selectable" }],
      ["removable-tag", { mode: "removable" }],
      ["keyword-tag", {}],
    ]);
    const words = (skemo?.goals ?? []).flatMap((goal) => [
      ...(goal.keywords.en ?? []),
      ...(goal.keywords.de ?? []),
    ]);
    for (const taken of ["badge", "tag", "chip", "status", "etikett", "kennzeichnung"]) {
      expect(words, taken).not.toContain(taken);
    }
  });

  it("the Uzo: a status is the insigno's; tinted categories ask a person; the insigno's boundary removable-chip is closed (use-instead signeto); the brief stays under 750", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["status", "insigno"]]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["tinted-categories", "ask-human"],
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["ikono", "butono"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    expect(uzo?.slots.label).toEqual({ accepts: ["text"], required: true, max: 1, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
    const insigno = eroNamed("insigno")?.uzo;
    expect(insigno?.boundary.find((entry) => entry.case === "removable-chip")).toMatchObject({
      action: "use-instead",
      ero: "signeto",
    });
    for (const name of ["badge-text-short", "spacing-owned-by-container"]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("signeto");
    }
    brief750("signeto");
  });

  it("the Reguloj: a long label breaks badge-text-short; a selectable tag with a verb passes (it is a filter, not a field)", () => {
    const judge = (props: Record<string, string | boolean>, label: string) =>
      evaluateUsage(modelo, [{ ero: "signeto", props, label, texts: {}, lingvo: "de" }]);
    expect(rulesOf(judge({}, "Barrierefreiheit"))).toEqual([]);
    expect(rulesOf(judge({ mode: "selectable" }, "Barrierefreiheit"))).toEqual([]);
    expect(
      rulesOf(judge({}, "Eine viel zu lange Beschriftung für ein Schlagwort in sechs Wörtern")),
    ).toEqual([["badge-text-short", "error"]]);
    expect(rulesOf(judge({ selected: true }, "Offen"))).toEqual([["ero-prop-constraint", "error"]]);
  });
});

describe("listelektilo (D-15): a styled select-only list with icons and descriptions", () => {
  const skemo = eroNamed("listelektilo")?.skemo;
  const uzo = eroNamed("listelektilo")?.uzo;

  it("has value, placeholder, the props of a field, expanded and name; the states of a field; the options as entries selected and active", () => {
    expect(skemo?.props.map((prop) => prop.name)).toEqual([
      "value",
      "placeholder",
      "required",
      "disabled",
      "loading",
      "readonly",
      "invalid",
      "expanded",
      "name",
      "clearable",
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      {
        name: "options",
        text: true,
        entry: { key: "selected", equals: "value", active: "active" },
      },
      { name: "help", text: true },
      { name: "error", text: true },
    ]);
    expect(variantKeys(required(skemo))).toEqual(["expanded", "state"]);
  });

  it("names the parts of a field, the chevron, the listbox, the item (an option; option is a web term) with its icon and description — no new token (E1)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "label",
      "required-mark",
      "surface",
      "border",
      "text",
      "placeholder",
      "indicator",
      "listbox",
      "item",
      "icon",
      "description",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
      "spinner",
      "clear",
    ]);
    expect(skemo?.parts.item).toEqual({
      color: { by: ["selected"] },
      fill: { by: ["active"] },
      typography: { fixed: "typography.label.1" },
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts.icon).toEqual({ size: { fixed: "size.icon.medium" } });
    expect(skemo?.parts.description).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
    });
    expect(skemo?.parts.listbox).toEqual({
      fill: { fixed: "color.background.raised" },
      radius: { fixed: "radius.role.surface" },
      shadow: { fixed: "elevation.shadow.overlay" },
      layer: { fixed: "elevation.layer.overlay" },
      width: { fixed: "size.container.small" },
      height: { by: ["expanded"] },
    });
  });

  it("speaks role combobox (select-only): the keys of APG with Home, End and Space; the chosen option is aria-selected; events change", () => {
    expect(skemo?.a11y).toEqual({
      role: "combobox",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        loading: ["aria-busy"],
        selected: ["aria-selected"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
        expanded: ["aria-expanded"],
      },
      keys: ["ArrowUp", "ArrowDown", "Home", "End", "Enter", "Space", "Escape"],
      texts: {
        "clear-name": { de: "{label} leeren", en: "Clear {label}" },
        required: { de: "erforderlich", en: "required" },
        loading: { de: "lädt", en: "loading" },
      },
    });
    expect(skemo?.events?.map((event) => event.name)).toEqual(["change"]);
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props])).toEqual([["styled-choice", {}]]);
  });

  it("the Uzo: plain options are the elektilo's, a search in the list the kompletigilo's; the elektilo's boundary custom-popup is closed; the field Reguloj are widened (E5); brief under 750", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["plain-options", "elektilo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action, entry.ero])).toEqual([
      ["search-in-list", "use-instead", "kompletigilo"],
    ]);
    const elektilo = eroNamed("elektilo")?.uzo;
    expect(elektilo?.boundary.find((entry) => entry.case === "custom-popup")).toMatchObject({
      action: "use-instead",
      ero: "listelektilo",
    });
    for (const name of [
      "field-label-visible",
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "error-not-color-only",
      "required-marked",
      "help-is-one-sentence",
      "placeholder-not-label",
      "spacing-owned-by-container",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("listelektilo");
    }
    expect(uzo?.slots.options).toEqual({ accepts: ["text"], required: true, min: 2, nesting: 0 });
    brief750("listelektilo");
  });
});

describe("plurelektilo (D-16): several values from a long list, filterable, the chosen as a count or as tags", () => {
  const skemo = eroNamed("plurelektilo")?.skemo;
  const uzo = eroNamed("plurelektilo")?.uzo;

  it("has values (a list), filterable, max, summary (count or tags), the props of a field, expanded and name", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["values", "string", undefined],
      ["filterable", "boolean", false],
      ["max", "number", undefined],
      ["summary", "enum", "count"],
      ["placeholder", "string", undefined],
      ["required", "boolean", false],
      ["disabled", "boolean", false],
      ["loading", "boolean", false],
      ["readonly", "boolean", false],
      ["invalid", "boolean", false],
      ["expanded", "boolean", false],
      ["name", "string", undefined],
      ["clearable", "boolean", true],
    ]);
    expect(skemo?.props.find((prop) => prop.name === "summary")?.values).toEqual(["count", "tags"]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
    expect(skemo?.slots.find((slot) => slot.name === "options")?.entry).toEqual({
      key: "selected",
      equals: "values",
      active: "active",
    });
  });

  it("names the parts of a field, the chevron, the listbox with filter, the option with its check mark, the clear button, the tag — no new token (E1)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "label",
      "required-mark",
      "surface",
      "border",
      "text",
      "placeholder",
      "indicator",
      "listbox",
      "filter",
      "item",
      "check",
      "clear",
      "tag",
      "help",
      "error",
      "focus-ring",
      "box",
      "motion",
      "spinner",
    ]);
    expect(skemo?.parts.check).toEqual({
      color: { by: ["selected"] },
      size: { fixed: "size.icon.medium" },
    });
    expect(skemo?.parts.clear).toEqual({ size: { fixed: "size.control.small" } });
    expect(skemo?.parts.filter).toEqual({ height: { fixed: "size.control.small" } });
    expect(skemo?.parts.tag).toEqual({ height: { fixed: "size.control.small" } });
    if (skemo === undefined) throw new Error("missing");
    expect(boundToken(skemo, "check", "color", { selected: "true" })?.token).toBe(
      "color.action.primary.rest",
    );
    expect(boundToken(skemo, "check", "color", { selected: "false" })?.token).toBe("none");
  });

  it("speaks role listbox (multiselectable): Space toggles, Enter and Escape close; the count of the chosen is said; the words of count, clear and the limit", () => {
    expect(skemo?.a11y).toEqual({
      role: "listbox",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        loading: ["aria-busy"],
        selected: ["aria-selected"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
        expanded: ["aria-expanded"],
      },
      keys: ["ArrowUp", "ArrowDown", "Home", "End", "Space", "Enter", "Escape"],
      texts: {
        loading: { de: "lädt", en: "loading" },
        required: { de: "erforderlich", en: "required" },
        "options-count": { de: "gewählt", en: "selected" },
        "clear-name": { de: "Alle abwählen", en: "Clear all" },
        "values-invalid": { de: "Wähle höchstens {max}.", en: "Choose at most {max}." },
      },
    });
    expect(skemo?.events?.map((event) => event.name)).toEqual(["input", "change"]);
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props])).toEqual([["choose-several", {}]]);
  });

  it("the Uzo: few options are a markobutono group, one value the elektilo's; a new value asks a person; the kompletigilo's boundary multi-select and the elektilo's alternative multiple point here; brief under 750", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["few-options", "markobutono"],
      ["one-value", "elektilo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["create-new-value", "ask-human"],
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["signeto", "butono", "ikono"]);
    const kompletigilo = eroNamed("kompletigilo")?.uzo;
    expect(kompletigilo?.boundary.find((entry) => entry.case === "multi-select")).toMatchObject({
      action: "use-instead",
      ero: "plurelektilo",
    });
    const elektilo = eroNamed("elektilo")?.uzo;
    expect(elektilo?.instead.find((entry) => entry.goal === "multiple")?.ero).toBe("plurelektilo");
    for (const name of [
      "field-label-visible",
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "error-not-color-only",
      "required-marked",
      "help-is-one-sentence",
      "spacing-owned-by-container",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("plurelektilo");
    }
    brief750("plurelektilo");
  });
});

describe("lokredaktilo (D-17): a single value of a view turned into a field on the spot", () => {
  const skemo = eroNamed("lokredaktilo")?.skemo;
  const uzo = eroNamed("lokredaktilo")?.uzo;

  it("has label (a duty, heard even where it is not seen), value, kind (the texts of the kampo), editing, disabled, readonly, invalid and name", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false])).toEqual([
      ["label", "string", true],
      ["value", "string", false],
      ["kind", "enum", false],
      ["editing", "boolean", false],
      ["disabled", "boolean", false],
      ["readonly", "boolean", false],
      ["invalid", "boolean", false],
      ["name", "string", false],
    ]);
    expect(skemo?.props.find((prop) => prop.name === "kind")?.values).toEqual([
      "text",
      "number",
      "email",
      "url",
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "readonly", "invalid"]);
    expect(skemo?.slots).toEqual([{ name: "error", text: true }]);
    expect(variantKeys(required(skemo))).toEqual(["editing", "state"]);
  });

  it("names its parts: the text of the display, the edit button, the composed field, save and cancel, error, focus-ring, box, motion; the field shows only while editing", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "text",
      "edit",
      "field",
      "save",
      "cancel",
      "error",
      "focus-ring",
      "box",
      "motion",
    ]);
    expect(skemo?.parts.text).toEqual({
      color: { by: ["state"] },
      typography: { fixed: "typography.body.1" },
    });
    expect(skemo?.parts.field).toEqual({ width: { by: ["editing"] } });
    for (const part of ["edit", "save", "cancel"]) {
      expect(skemo?.parts[part], part).toEqual({ size: { fixed: "size.control.small" } });
    }
    if (skemo === undefined) throw new Error("missing");
    expect(boundToken(skemo, "field", "width", { editing: "false" })?.token).toBe("none");
    expect(boundToken(skemo, "field", "width", { editing: "true" })?.token).toBe(
      "size.container.small",
    );
  });

  it("speaks: named by its label prop, described by the error; Enter saves, Escape cancels; the words of edit, save and cancel; the event save is cancelable", () => {
    expect(skemo?.a11y).toEqual({
      role: "generic",
      name: ["prop:label"],
      description: ["slot:error"],
      states: {
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
        readonly: ["aria-readonly"],
      },
      keys: ["Enter", "Escape"],
      texts: {
        "edit-name": { de: "{label} bearbeiten", en: "Edit {label}" },
        "save-name": { de: "Speichern", en: "Save" },
        "cancel-name": { de: "Abbrechen", en: "Cancel" },
      },
    });
    expect(skemo?.events?.map((event) => [event.name, event.cancelable ?? false])).toEqual([
      ["save", true],
      ["cancel", false],
      ["change", false],
    ]);
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ "slot:error": "filled" }, { invalid: ["true"] }],
      [{ disabled: "true" }, { readonly: ["false"] }],
    ]);
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props])).toEqual([["inline-edit", {}]]);
  });

  it("the Uzo: a form is the formularo's, several fields at once too, autosave asks a person; the kampo sends a single value in a view here (G2); brief under 750", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["form", "formularo"]]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action, entry.ero])).toEqual([
      ["multi-field-edit", "use-instead", "formularo"],
      ["autosave", "ask-human", undefined],
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono", "ikono"]);
    const kampo = eroNamed("kampo")?.uzo;
    expect(kampo?.instead.find((entry) => entry.goal === "single-value")?.ero).toBe("lokredaktilo");
    for (const name of [
      "error-says-what-to-do",
      "error-not-color-only",
      "spacing-owned-by-container",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("lokredaktilo");
    }
    brief750("lokredaktilo");
    expect(
      rulesOf(
        evaluateUsage(modelo, [
          { ero: "lokredaktilo", props: { label: "Titel", value: "Barrierefreiheit" }, texts: {} },
        ]),
      ),
    ).toEqual([]);
    expect(
      rulesOf(
        evaluateUsage(modelo, [
          { ero: "lokredaktilo", props: { label: "Titel" }, texts: { error: "Falsch" } },
        ]),
      ),
    ).toEqual([
      ["ero-prop-constraint", "error"],
      ["error-says-what-to-do", "error"],
    ]);
  });
});

describe("the Ikonaro of Spec 025 ③ (G1: edit) and the dialogs of the spec (Gvidanto)", () => {
  it("names edit, not mirrored; twenty-one names; the lokredaktilo composes the ikono", () => {
    const edit = modelo.ikonaro.find((ikono) => ikono.name === "edit");
    expect(edit).toMatchObject({
      name: "edit",
      meaning: { de: "Stift: bearbeiten", en: "Pencil: edit" },
    });
    expect(edit?.mirror).not.toBe(true);
    expect(modelo.ikonaro).toHaveLength(21);
    expect(eroNamed("ikono")?.skemo.props.find((prop) => prop.name === "name")?.values).toContain(
      "edit",
    );
    expect(eroNamed("ikono")?.uzo?.composes.with.map((entry) => entry.ero)).toEqual(
      expect.arrayContaining(["signeto", "listelektilo", "plurelektilo", "lokredaktilo"]),
    );
  });

  it("'Auswahl mit Symbolen und Beschreibungen' → the listelektilo (the spec's singular „Beschreibung“ is a word of the kampo's alternative multi-line, Abweichung)", () => {
    expect(suggest("Auswahl mit Symbolen und Beschreibungen").suggestion).toEqual({
      ero: "listelektilo",
      props: {},
    });
  });

  it("'Mehrere Standards zuordnen' → the plurelektilo; with four → the markobutono group (the spec's „4 Optionen“: Optionen is the elekto's word, Abweichung) (the alternative few-options)", () => {
    expect(suggest("Mehrere Standards zuordnen").suggestion).toEqual({
      ero: "plurelektilo",
      props: {},
    });
    const few = suggest("Mehrere Standards zuordnen, nur vier");
    expect(few.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(few.boundary).toMatchObject({
      ero: "plurelektilo",
      case: "few-options",
      action: "use-instead",
    });
  });

  it("'Kategorie als Filterchip' → the signeto with mode selectable (the spec's „Kategorie-Filter zum Anklicken“ leads with a word of the filtrilo and holds a word of the insigno, Abweichung); 'Namen direkt an Ort und Stelle umbenennen' → the lokredaktilo (the spec's „Titel … ändern“ holds words of the titolo and the atributlisto)", () => {
    expect(suggest("Kategorie als Filterchip").suggestion).toEqual({
      ero: "signeto",
      props: { mode: "selectable" },
    });
    expect(suggest("Namen direkt an Ort und Stelle umbenennen").suggestion).toEqual({
      ero: "lokredaktilo",
      props: {},
    });
  });

  it("the dialogs of before keep their answers: a status badge stays the insigno", () => {
    expect(suggest("Status als Badge").suggestion).toEqual({ ero: "insigno", props: {} });
  });
});
