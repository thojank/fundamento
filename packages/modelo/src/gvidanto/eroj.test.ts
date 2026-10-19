// list_eroj and get_ero (Spec 003 T022, FR-13, D-16, contracts/mcp-tools §1).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { getEro, listEroj } from "./eroj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("the repository Modelo has no butono");

const found = getEro(modelo, { name: "butono" });
if (!found.ok) throw new Error("get_ero butono failed");
const output = found.output;

describe("list_eroj", () => {
  it("lists every Ero with its variants and props", () => {
    // Spec 008 (A5): two Eroj, in name order; the variants are the first enum prop (D-13).
    expect(listEroj(modelo).eroj.map((entry) => entry.name)).toEqual(
      modelo.eroj.map((entry) => entry.ero.name),
    );
    expect(listEroj(modelo).eroj.map((entry) => entry.name)).toEqual([
      "alsxutilo",
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "ikono",
      "insigno",
      "kampo",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "saltligilo",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    expect(listEroj(modelo).eroj[4]).toEqual({
      id: butono.ero.id,
      name: "butono",
      description: butono.ero.description,
      variants: ["high", "medium", "low"],
      props: ["emphasis", "intent", "size", "type", "disabled", "loading", "full-width", "label"],
    });
    expect(listEroj(modelo).eroj[15]).toMatchObject({
      name: "ligilo",
      variants: ["inline", "standalone"],
      props: ["to", "placement", "external", "size", "label"],
    });
  });
});

describe("get_ero", () => {
  it("answers by name and by id with the same output", () => {
    const byId = getEro(modelo, { id: butono.ero.id });
    expect(byId.ok).toBe(true);
    expect(byId.ok ? byId.output : undefined).toEqual(output);
  });

  it("states the Ero and its Skemo as the Modelo holds them", () => {
    expect(output.ero).toEqual({
      id: butono.ero.id,
      name: "butono",
      description: butono.ero.description,
    });
    expect(output.skemo).toEqual({
      id: butono.skemo.id,
      props: butono.skemo.props,
      states: butono.skemo.states,
      slots: butono.skemo.slots,
      parts: butono.skemo.parts,
      bindings: butono.skemo.bindings,
      a11y: butono.skemo.a11y,
      goals: butono.skemo.goals,
    });
  });

  it("names the Reguloj that apply to the Ero, each with its kialo", () => {
    expect(output.reguloj.map((regulo) => regulo.name)).toEqual([
      "one-primary-per-container",
      "destructive-not-primary-color",
      "label-required",
      // F32: how the focus ring is drawn is part of what the Ero promises, so an agent asking
      // for the Ero is told the rule and its reason.
      "focus-ring-concentric",
      // Spec 007 T019 (data-model §4): the spacing candidate, the layout rule and the text rules.
      "spacing-owned-by-container",
      "full-width-in-action-bar-or-compact",
      "label-names-action",
      "destructive-label-names-object",
      "destructive-label-not-generic",
      // Spec 014 ② (G8): a button that shows only an icon has a label.
      "icon-meaning-named",
    ]);
    for (const regulo of output.reguloj) {
      expect(regulo.kialo.length).toBeGreaterThan(0);
      expect(regulo.statement.length).toBeGreaterThan(0);
      // The spacing rule is a candidate (A4): manual until an instance can state its spacing.
      expect(regulo.checkability).toBe(
        regulo.name === "spacing-owned-by-container" ? "manual" : "automatic",
      );
    }
  });

  it("carries the examples of the Jugxoj with their instances", () => {
    // Six of Spec 003 and, since Spec 007 T021, twelve of the three text rules (A7) and two of
    // the full-width rule (A6).
    expect(output.examples).toHaveLength(20);
    const [first] = output.examples;
    expect(first?.decision).toBe("approved");
    expect(first?.kialo.length).toBeGreaterThan(0);
    expect(first?.regulo?.name).toBe("one-primary-per-container");
    expect(first?.instances).toEqual([
      {
        ero: "butono",
        props: { emphasis: "high", type: "submit" },
        container: "dialog",
        label: "Speichern",
      },
      { ero: "butono", props: { emphasis: "low" }, container: "dialog", label: "Abbrechen" },
    ]);
    expect(output.examples.slice(0, 6).map((example) => example.decision)).toEqual([
      "approved",
      "rejected",
      "approved",
      "rejected",
      "approved",
      "rejected",
    ]);
    for (const regulo of [
      "label-names-action",
      "destructive-label-names-object",
      "destructive-label-not-generic",
    ]) {
      const examples = output.examples.filter((example) => example.regulo?.name === regulo);
      expect(
        examples.map((example) => example.decision),
        regulo,
      ).toEqual(["approved", "approved", "rejected", "rejected"]);
    }
  });

  it("names every projection of the Ero", () => {
    expect(output.projekcioj.webComponent).toEqual({
      tag: "fm-butono",
      attributes: {
        emphasis: ["high", "medium", "low"],
        intent: ["neutral", "danger"],
        size: ["small", "medium", "large"],
        type: ["button", "submit", "reset"],
        disabled: "boolean",
        loading: "boolean",
        "full-width": "boolean",
        label: "string",
      },
      slots: ["label", "icon-start", "icon-end"],
    });
    expect(output.projekcioj.react).toEqual({
      package: "@fundamento/eroj/react",
      component: "Butono",
      props: {
        emphasis: ["high", "medium", "low"],
        intent: ["neutral", "danger"],
        size: ["small", "medium", "large"],
        type: ["button", "submit", "reset"],
        disabled: "boolean",
        loading: "boolean",
        fullWidth: "boolean",
        label: "string",
      },
    });
    expect(output.projekcioj.figma).toEqual({
      componentSet: "butono",
      properties: {
        emphasis: ["high", "medium", "low"],
        intent: ["neutral", "danger"],
        size: ["small", "medium", "large"],
        type: ["button", "submit", "reset"],
        disabled: "boolean",
        loading: "boolean",
        "full-width": "boolean",
        label: "text",
        state: ["rest", "hover", "pressed", "focus", "disabled", "loading"],
      },
      pluginData: { namespace: "fundamento", key: "ero", value: "butono" },
    });
    expect(output.projekcioj.css.files).toEqual(["fundamento.css", "fundamento-komuna.css"]);
    expect(output.projekcioj.css.attributes).toContain("data-fm-aspekto");
    expect(output.projekcioj.css.attributes).toContain("data-fm-color-scheme");
    expect(output.projekcioj.makeKit).toEqual({ package: "@fundamento/make-kit-komuna" });
  });

  it("names the Tailwind classes of the parts that have one", () => {
    const { classes } = output.projekcioj.tailwind;
    expect(classes["surface.fill"]).toContain("bg-fm-action-primary-rest");
    expect(classes["surface.fill"]).toContain("bg-fm-action-danger-rest");
    expect(classes["label.color"]).toContain("text-fm-action-primary-text");
    expect(classes["border.color"]).toContain("border-fm-border-default");
    expect(classes["box.radius"]).toEqual(["rounded-fm-role-control"]);
    expect(classes["box.gap"]).toEqual(["gap-fm-small"]);
    // A token without a Tailwind namespace (motion duration) has no class.
    expect(classes["motion.duration"]).toBeUndefined();
  });

  it("answers an unknown Ero with ero-unknown and the nearest names", () => {
    const missing = getEro(modelo, { name: "butonno" });
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.issues.map((issue) => issue.rule)).toEqual(["ero-unknown"]);
    expect(missing.issues[0]?.path).toBe("get_ero/name");
    // The five nearest names (nearestNames): with six Eroj (Spec 010 ③) the farthest drops out.
    // Spec 011 ②: with nine Eroj dialogo is nearer to "butonno" than markobutono.
    // Spec 014 ②: ikono is nearer to "butonno" than insigno. Spec 014 ③: titolo too; dialogo
    // drops. Spec 014 ④: menuo is nearer than avizo.
    expect(missing.allowed).toEqual(["butono", "ikono", "titolo", "insigno", "menuo"]);
  });
});

// Spec 007 T022 (A8, D-05, D-08, contracts/mcp-tools §1): get_ero carries the Uzo with its Reguloj
// resolved, and with `brief: true` only what a choice needs, generated from Skemo and Uzo.
describe("get_ero with the Uzo and brief (T022)", () => {
  const isReguloRef = (value: unknown) => {
    expect(value).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^reg_/),
        name: expect.any(String),
        statement: expect.any(String),
        kialo: expect.any(String),
        checkability: expect.stringMatching(/^(automatic|manual)$/),
      }),
    );
  };

  it("carries the Uzo of the butono without its ids, the Reguloj resolved as ReguloRef", () => {
    const uzo = output.uzo;
    expect(uzo).toBeDefined();
    expect(uzo).not.toHaveProperty("id");
    expect(uzo).not.toHaveProperty("ero");
    expect(uzo).not.toHaveProperty("skemo");
    expect(uzo?.purpose).toBe(butono.uzo?.purpose);
    expect(uzo?.boundary).toHaveLength(4);
    expect(uzo?.boundary.map((entry) => entry.case)).toEqual(
      butono.uzo?.boundary.map((entry) => entry.case),
    );
    expect(uzo?.instead.map((entry) => entry.goal)).toEqual([
      "toggle",
      "choose-many",
      "choose-few",
      "confirm",
      "area-loading",
    ]);
    expect(uzo?.slots).toEqual(butono.uzo?.slots);
    isReguloRef(uzo?.composes.spacing.regulo);
    expect(uzo?.composes.spacing.regulo.name).toBe("spacing-owned-by-container");
    const fullWidth = uzo?.layout["full-width"];
    expect(typeof fullWidth).toBe("object");
    if (typeof fullWidth === "object") {
      isReguloRef(fullWidth.regulo);
      expect(fullWidth.regulo.name).toBe("full-width-in-action-bar-or-compact");
    }
    expect(uzo?.content.map((entry) => entry.regulo.name)).toEqual([
      "label-names-action",
      "destructive-label-names-object",
      "destructive-label-not-generic",
    ]);
    for (const entry of uzo?.content ?? []) isReguloRef(entry.regulo);
  });

  it("brief: exactly the keys of contracts §1, axes from the Skemo, no keywords and no via", () => {
    const brief = getEro(modelo, { name: "butono", brief: true });
    expect(brief.ok).toBe(true);
    if (!brief.ok) return;
    expect(Object.keys(brief.output).sort()).toEqual([
      "axes",
      "boundary",
      "ero",
      "instead",
      "purpose",
      "required",
    ]);
    expect(brief.output.ero).toBe("butono");
    expect(brief.output.purpose).toBe(butono.uzo?.purpose);
    expect(brief.output.axes).toEqual(
      butono.skemo.props
        .filter((prop) => prop.kind === "enum")
        .map((prop) => ({ name: prop.name, values: prop.values, default: prop.default })),
    );
    // R-10 (Abnahme 2026-10-13): required.props names only a prop the Skemo marks as required;
    // label is the fallback name of an empty slot, not a duty.
    expect(brief.output.required).toEqual({ props: [], slots: [] });
    for (const entry of brief.output.instead ?? []) {
      expect(Object.keys(entry).sort()).toEqual(["ero", "goal", "kialo"]);
    }
    // Nachlese 3 G4: a boundary of the brief carries case and action (and the Ero to use), no
    // kialo — the full kialo comes from get_ero without brief; so the brief stays under 750
    // without shortening more kialos.
    for (const entry of brief.output.boundary ?? []) {
      expect(entry).not.toHaveProperty("keywords");
      expect(entry).not.toHaveProperty("via");
      expect(entry).not.toHaveProperty("kialo");
      expect(Object.keys(entry).sort()).toEqual(
        entry.ero === undefined ? ["action", "case"] : ["action", "case", "ero"],
      );
    }
    // Spec 008 A4: navigation is use-instead ligilo; the brief names the Ero to use.
    expect(brief.output.boundary?.map((entry) => [entry.action, entry.ero])).toEqual([
      ["use-instead", "ligilo"],
      ["not-supported", undefined],
      ["not-supported", undefined],
      ["not-supported", undefined],
    ]);
  });

  it("brief for an Ero without a Uzo: ero, axes, required and the warning skemo-uzo-missing", () => {
    const { modelo: minimal } = loadModelo(
      fixtureModeloSource(fixtureRoot("valid", "ero-minimal")),
    );
    if (minimal === undefined) throw new Error("ero-minimal must load");
    const brief = getEro(minimal, { name: "butono", brief: true });
    expect(brief.ok).toBe(true);
    if (!brief.ok) return;
    expect(Object.keys(brief.output).sort()).toEqual(["axes", "ero", "issues", "required"]);
    expect(brief.output.issues?.map((issue) => [issue.rule, issue.severity])).toEqual([
      ["skemo-uzo-missing", "warning"],
    ]);
    const full = getEro(minimal, { name: "butono" });
    expect(full.ok && full.output).not.toHaveProperty("uzo");
  });
});

// R-10 (Abnahme Spec 008 A3 und Spec 009 A3, 2026-10-13): "no default" is not "required". The brief
// of the ligilo named label, that of the kampo value, placeholder and name; a duty is said by the
// Skemo (`required: true`), nowhere else. The ligilo needs its destination, nothing else is a duty.
describe("brief: required.props comes from the Skemo, not from a missing default (R-10)", () => {
  it.each([
    ["butono", [], []],
    ["ligilo", ["to"], []],
    ["kampo", [], ["label"]],
  ])("%s requires props %j and slots %j", (name, props, slots) => {
    const brief = getEro(modelo, { name, brief: true });
    expect(brief.ok).toBe(true);
    if (!brief.ok) return;
    expect(brief.output.required).toEqual({ props, slots });
  });

  it("every required prop of every Skemo has no default: a default would make the duty moot", () => {
    const offending = modelo.eroj.flatMap((entry) =>
      entry.skemo.props
        .filter((prop) => prop.required === true && prop.default !== undefined)
        .map((prop) => `${entry.ero.name}.${prop.name}`),
    );
    expect(offending).toEqual([]);
  });
});

// Spec 014 ② (O-3 of ①): get_ero states the container width from which a list lays itself out
// side by side — the Uzo's columns-from — so an agent sees the threshold of layout auto.
describe("get_ero and columns-from (Spec 014 ②, O-3)", () => {
  it("the Uzo of the atributlisto names columns-from in its layout", () => {
    const answer = getEro(modelo, { name: "atributlisto" });
    if (!answer.ok) throw new Error("get_ero atributlisto failed");
    expect(answer.output.uzo?.layout["columns-from"]).toBe("size.container.small");
    const button = getEro(modelo, { name: "butono" });
    if (!button.ok) throw new Error("get_ero butono failed");
    expect(button.output.uzo?.layout["columns-from"]).toBeUndefined();
  });
});
