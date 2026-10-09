// Modelo schema extensions of Spec 007 that are not the Uzo itself (data-model §6, §7): what an
// Ero instance may say about its Aspekto, its Dimensio values and its slots.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

const JUGXO = {
  id: "jug_01M2XKF2X28C4EGJ8R4VMVGCB8",
  ref: { ero: "ero_01M2XKPB5B8ZHNVRJJDC0TDTBN" },
  decision: "approved",
  kialo: "A label in the label slot, nothing else.",
  date: "2026-10-09",
  context: "Schema test (Spec 007 T014).",
};
const withInstance = (instance: Record<string, unknown>) => ({
  ...JUGXO,
  ekzemplo: { instances: [{ ero: "butono", props: {}, label: "Speichern", ...instance }] },
});

describe("EroInstance: aspekto, dimensioj and slots (T014, data-model §6)", () => {
  it("accepts an example instance with slots: { label: ['text'] }", () => {
    const jugxo = withInstance({ slots: { label: ["text"] } });
    expect(v("Jugxo")(jugxo), JSON.stringify(v("Jugxo").errors)).toBe(true);
  });

  it("accepts an Ero in a slot, an Aspekto and Dimensio values", () => {
    const instance = {
      slots: { "icon-start": ["icon"], label: ["text", { ero: "insigno" }] },
      aspekto: "ekzemplo",
      dimensioj: { viewport: "compact" },
    };
    expect(v("EroInstance")({ ero: "butono", props: {}, ...instance })).toBe(true);
  });

  it.each([
    ["a slot content that is no kind and no Ero", { slots: { label: [3] } }],
    ["an Ero in a slot without its name", { slots: { label: [{}] } }],
    ["a Dimensio value that is no name", { dimensioj: { viewport: ["compact"] } }],
    ["an empty Aspekto", { aspekto: "" }],
  ])("rejects %s", (_what, instance) => {
    expect(v("EroInstance")({ ero: "butono", props: {}, ...instance })).toBe(false);
  });
});
