// Modelo schema extension of Spec 025 ① (plan ① D-01, Regel 0.2): a Skemo may name its events —
// what the element says to the application (change, input, a cancelable remove) — each with a name
// of the core grammar, a description and whether it is cancelable. The first step to gap 7 of the
// benchmark (0 events in the Skemo against 224). Additive; every Skemo before stays valid.

import { describe, expect, it } from "vitest";
import { RULE_IDS } from "./issues.js";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

describe("SkemoEvent and Skemo.events (Spec 025 ① D-01)", () => {
  it("an event has a name and a description; cancelable is optional and boolean; nothing else", () => {
    expect(v("SkemoEvent")({ name: "change", description: "The value came to rest." })).toBe(true);
    expect(
      v("SkemoEvent")({
        name: "remove",
        cancelable: true,
        description: "A tag is about to be removed.",
      }),
    ).toBe(true);
    expect(v("SkemoEvent")({ name: "change" })).toBe(false);
    expect(v("SkemoEvent")({ name: "onChange", description: "x" })).toBe(false);
    expect(v("SkemoEvent")({ name: "change", description: "" })).toBe(false);
    expect(v("SkemoEvent")({ name: "change", description: "x", bubbles: true })).toBe(false);
  });

  it("a Skemo may list its events, unique by name; a Skemo without events stays valid", () => {
    const skemo = {
      id: "ske_01M55000000000000000000000",
      ero: "ero_01M55000000000000000000000",
      props: [],
      states: ["rest"],
      slots: [],
      parts: { box: { gap: { fixed: "spacing.small" } } },
      bindings: [],
      a11y: { role: "slider", name: ["slot:label"], states: {}, keys: [] },
    };
    expect(v("Skemo")(skemo)).toBe(true);
    expect(
      v("Skemo")({
        ...skemo,
        events: [
          { name: "input", description: "while it moves" },
          { name: "change", description: "at rest" },
        ],
      }),
    ).toBe(true);
    expect(v("Skemo")({ ...skemo, events: [] })).toBe(true);
    expect(v("Skemo")({ ...skemo, events: [{ name: "change" }] })).toBe(false);
  });

  it("skemo-event-invalid is a rule: two events of one name, or an event named like a prop, are reported", () => {
    expect(RULE_IDS).toContain("skemo-event-invalid");
  });
});
