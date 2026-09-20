// list_eroj and get_ero (Spec 003 T022, FR-13, D-16, contracts/mcp-tools §1).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
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
    expect(listEroj(modelo)).toEqual({
      eroj: [
        {
          id: butono.ero.id,
          name: "butono",
          description: butono.ero.description,
          variants: ["primary", "secondary", "tertiary"],
          props: ["variant", "tone", "size", "type", "disabled", "loading", "full-width", "label"],
        },
      ],
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
      intents: butono.skemo.intents,
    });
  });

  it("names the Reguloj that apply to the Ero, each with its kialo", () => {
    expect(output.reguloj.map((regulo) => regulo.name)).toEqual([
      "one-primary-per-container",
      "destructive-not-primary-color",
      "label-required",
    ]);
    for (const regulo of output.reguloj) {
      expect(regulo.kialo.length).toBeGreaterThan(0);
      expect(regulo.statement.length).toBeGreaterThan(0);
      expect(regulo.checkability).toBe("automatic");
    }
  });

  it("carries the examples of the Jugxoj with their instances", () => {
    expect(output.examples).toHaveLength(6);
    const [first] = output.examples;
    expect(first?.decision).toBe("approved");
    expect(first?.kialo.length).toBeGreaterThan(0);
    expect(first?.regulo?.name).toBe("one-primary-per-container");
    expect(first?.instances).toEqual([
      {
        ero: "butono",
        props: { variant: "primary", type: "submit" },
        container: "dialog",
        label: "Speichern",
      },
      { ero: "butono", props: { variant: "tertiary" }, container: "dialog", label: "Abbrechen" },
    ]);
    expect(output.examples.map((example) => example.decision)).toEqual([
      "approved",
      "rejected",
      "approved",
      "rejected",
      "approved",
      "rejected",
    ]);
  });

  it("names every projection of the Ero", () => {
    expect(output.projekcioj.webComponent).toEqual({
      tag: "fm-butono",
      attributes: {
        variant: ["primary", "secondary", "tertiary"],
        tone: ["default", "danger"],
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
        variant: ["primary", "secondary", "tertiary"],
        tone: ["default", "danger"],
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
        variant: ["primary", "secondary", "tertiary"],
        tone: ["default", "danger"],
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
    expect(missing.allowed).toEqual(["butono"]);
  });
});
