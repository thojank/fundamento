// The butono data (Spec 003 T007; FR-02, plan D-02, data-model §2): one Ero and its Skemo in the
// repo Modelo, bound only to role tokens, with its label-on-surface pairs declared, the danger
// constraint, and examples right and wrong for every usage Regulo.

import { describe, expect, it } from "vitest";
import { combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
const USAGE_REGULOJ = [
  "one-primary-per-container",
  "destructive-not-primary-color",
  "label-required",
];

describe("butono in the repo Modelo (T007)", () => {
  it("lives in data/eroj/butono/skemo.json and the repo Modelo stays valid", () => {
    expect(butono?.file).toBe("modelo/data/eroj/butono/skemo.json");
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has the props, states and slots of data-model §2", () => {
    expect(butono?.skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind])).toEqual([
      ["variant", ["primary", "secondary", "tertiary"]],
      ["tone", ["default", "danger"]],
      ["size", ["small", "medium", "large"]],
      ["type", ["button", "submit", "reset"]],
      ["disabled", "boolean"],
      ["loading", "boolean"],
      ["full-width", "boolean"],
      ["label", "string"],
    ]);
    expect(butono?.skemo.states).toEqual([
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
      "loading",
    ]);
    expect(butono?.skemo.slots.map((slot) => slot.name)).toEqual([
      "label",
      "icon-start",
      "icon-end",
    ]);
  });

  it("binds only role tokens, never palette steps or literals", () => {
    const tokens = [
      ...(butono?.skemo.bindings.map((binding) => binding.token) ?? []),
      ...Object.values(butono?.skemo.parts ?? {}).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(tokens.length).toBeGreaterThan(20);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
  });

  it("forbids tone=danger with secondary and tertiary", () => {
    if (butono === undefined) throw new Error("butono missing");
    const skemo = butono.skemo;
    expect(forbiddenBy(skemo, { variant: "secondary", tone: "danger" })).toBeDefined();
    expect(forbiddenBy(skemo, { variant: "tertiary", tone: "danger" })).toBeDefined();
    expect(forbiddenBy(skemo, { variant: "primary", tone: "danger" })).toBeUndefined();
    expect(combinationsOf(skemo, ["variant", "tone"])).toHaveLength(4);
  });

  it.each(USAGE_REGULOJ)(
    "%s has an approved and a rejected example that evaluate as they say",
    (name) => {
      const regulo = modelo.reguloj.find((candidate) => candidate.name === name);
      const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
      expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual(["approved", "rejected"]);
      for (const jugxo of examples) {
        expect(jugxo.ref).toEqual({ ero: butono?.ero.id });
        const rules = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []).violations.map(
          (violation) => violation.issue.rule,
        );
        expect(rules, `${jugxo.id}`).toEqual(jugxo.decision === "rejected" ? [name] : []);
      }
    },
  );

  it("keeps visible strings out of the Skemo: labels live only in Jugxo examples", () => {
    const text = JSON.stringify(butono?.skemo);
    expect(text).not.toMatch(/Speichern|Löschen|Abbrechen|Save|Delete|Cancel/);
  });
});
