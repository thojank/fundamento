// Modelo schema extensions and rule catalog of Spec 003 (task T004; D-02, data-model §2, §5, §7).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { RULE_IDS } from "./issues.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

/** A small but complete EroFile: every section of the Skemo once. */
const MINIMAL_ERO_FILE = {
  ero: {
    id: "ero_01M2XKPB5B8ZHNVRJJDC0TDTBN",
    name: "butono",
    skemo: "ske_01M2XKPB5B8ZHNVRJJDC0TDTBN",
    description: "A button: starts an action.",
  },
  skemo: {
    id: "ske_01M2XKPB5B8ZHNVRJJDC0TDTBN",
    ero: "ero_01M2XKPB5B8ZHNVRJJDC0TDTBN",
    props: [
      {
        name: "variant",
        kind: "enum",
        values: ["primary", "secondary"],
        default: "secondary",
        description: "Emphasis.",
      },
      { name: "tone", kind: "enum", values: ["default", "danger"], default: "default" },
      { name: "disabled", kind: "boolean", default: false },
      { name: "label", kind: "string" },
    ],
    states: ["rest", "hover", "disabled"],
    slots: [
      { name: "label", default: true, text: true },
      { name: "icon-start", decorative: true },
    ],
    parts: {
      surface: { fill: { by: ["variant", "tone", "state"] } },
      label: {
        color: { by: ["variant", "tone", "state"] },
        typography: { fixed: "typography.label" },
      },
      icon: { color: { sameAs: "label.color" } },
    },
    bindings: [
      {
        part: "surface",
        property: "fill",
        when: { variant: "primary", tone: "default", state: "rest" },
        token: "color.action.primary.rest",
      },
      {
        part: "label",
        property: "color",
        when: { state: "disabled" },
        token: "color.text.disabled",
      },
    ],
    a11y: {
      role: "button",
      name: ["slot:label", "prop:label"],
      states: { disabled: ["aria-disabled"] },
      keys: ["Enter", "Space"],
    },
    constraints: [
      {
        when: { tone: "danger" },
        allowed: { variant: ["primary"] },
        kialo: "The danger tokens describe a filled surface.",
      },
    ],
    intents: [
      {
        intent: "destructive",
        keywords: { en: ["delete"], de: ["löschen"] },
        props: { variant: "primary", tone: "danger" },
        regulo: "destructive-not-primary-color",
      },
    ],
  },
};

const clone = () => structuredClone(MINIMAL_ERO_FILE);

describe("EroFile and Skemo (T004, data-model §2)", () => {
  it("accepts a complete EroFile", () => {
    expect(v("EroFile")(clone()), JSON.stringify(v("EroFile").errors)).toBe(true);
  });

  it.each([
    [
      "an unknown part property (a CSS name, Art. VIII)",
      (f: ReturnType<typeof clone>) => {
        (f.skemo.parts.surface as Record<string, unknown>).background = { by: ["variant"] };
      },
    ],
    [
      "a part source with two kinds",
      (f: ReturnType<typeof clone>) => {
        (f.skemo.parts.icon.color as Record<string, unknown>).fixed = "color.text.default";
      },
    ],
    [
      "a binding without a token",
      (f: ReturnType<typeof clone>) => {
        delete (f.skemo.bindings[1] as Record<string, unknown>).token;
      },
    ],
    [
      "a constraint without a kialo",
      (f: ReturnType<typeof clone>) => {
        delete (f.skemo.constraints[0] as Record<string, unknown>).kialo;
      },
    ],
    [
      "an enum prop without values",
      (f: ReturnType<typeof clone>) => {
        delete (f.skemo.props[1] as Record<string, unknown>).values;
      },
    ],
    [
      "an intent without keywords",
      (f: ReturnType<typeof clone>) => {
        delete (f.skemo.intents[0] as Record<string, unknown>).keywords;
      },
    ],
    [
      "an Ero without a description",
      (f: ReturnType<typeof clone>) => {
        delete (f.ero as Record<string, unknown>).description;
      },
    ],
    [
      "an a11y name source that is neither slot: nor prop:",
      (f: ReturnType<typeof clone>) => {
        f.skemo.a11y.name = ["aria-label"];
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const file = clone();
    mutate(file);
    expect(v("EroFile")(file)).toBe(false);
  });
});

describe("appliesTo.eroj and the Jugxo ekzemplo (T004, data-model §3, §5)", () => {
  it("accepts a Regulo scoped to an Ero", () => {
    const regulo = {
      id: "reg_01M2VEEE5280TGESDHQQ14EA33",
      name: "one-primary-per-container",
      statement: "A container holds at most one primary butono.",
      kialo: "One primary action makes the next step obvious.",
      scope: "eroj: butono",
      checkability: "automatic",
      appliesTo: { eroj: ["butono"] },
    };
    expect(v("Regulo")(regulo), JSON.stringify(v("Regulo").errors)).toBe(true);
    expect(v("Regulo")({ ...regulo, appliesTo: { eroj: [] } })).toBe(false);
  });

  const jugxo = {
    id: "jug_01M2XKF2X28C4EGJ8R4VMVGCB8",
    ref: { ero: "ero_01M2XKPB5B8ZHNVRJJDC0TDTBN" },
    decision: "rejected",
    kialo: "Two primary buttons in one dialog.",
    date: "2026-09-19",
    context: "Example for one-primary-per-container.",
    ekzemplo: {
      regulo: "reg_01M2VEEE5280TGESDHQQ14EA33",
      instances: [
        { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
        { ero: "butono", props: { variant: "primary", disabled: false }, container: "dialog" },
      ],
    },
  };

  it("accepts a Jugxo with an ekzemplo", () => {
    expect(v("Jugxo")(jugxo), JSON.stringify(v("Jugxo").errors)).toBe(true);
  });

  it.each([
    ["no instances", { ...jugxo.ekzemplo, instances: [] }],
    ["an instance without ero", { instances: [{ props: {} }] }],
    ["an instance with an object prop value", { instances: [{ ero: "butono", props: { x: {} } }] }],
  ])("rejects an ekzemplo with %s", (_label, ekzemplo) => {
    expect(v("Jugxo")({ ...jugxo, ekzemplo })).toBe(false);
  });
});

describe("rule catalog of Spec 003 (data-model §7)", () => {
  it("contains every rule listed in the data model", () => {
    const dataModel = readFileSync(
      new URL("../../../../specs/003-butono-durchstich/data-model.md", import.meta.url),
      "utf8",
    );
    const section = dataModel.slice(
      dataModel.indexOf("## 7. New rule-catalog entries"),
      dataModel.indexOf("## 8."),
    );
    const listed = [...section.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1] ?? "");
    expect(listed.length).toBeGreaterThanOrEqual(17);
    for (const rule of listed) {
      expect(RULE_IDS, rule).toContain(rule);
    }
  });
});
