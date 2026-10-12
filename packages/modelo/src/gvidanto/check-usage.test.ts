// check_usage (Spec 003 T024, FR-13, D-16 §3): instances of a design or of code against the
// Ero Reguloj. The answer is the usage evaluation; invalid input is an envelope, not a violation.

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, withAspektoPackages } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { checkUsage } from "./check-usage.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");

const check = (instances: Parameters<typeof checkUsage>[1]["instances"]) => {
  const result = checkUsage(modelo, { instances });
  if (!result.ok) throw new Error("check_usage failed");
  return result.output;
};

describe("check_usage", () => {
  it("equals the usage evaluation", () => {
    const instances = [
      { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Weiter" },
    ];
    expect(check(instances)).toEqual(evaluateUsage(modelo, instances));
  });

  it("finds two primary buttons in one container, with the kialo of the Regulo", () => {
    const output = check([
      { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Weiter" },
    ]);
    expect(output.valid).toBe(false);
    expect(output.instances).toBe(2);
    expect(output.violations).toHaveLength(1);
    const [violation] = output.violations;
    expect(violation?.instance).toEqual([0, 1]);
    expect(violation?.issue.rule).toBe("one-primary-per-container");
    expect(violation?.issue.regulo?.kialo.length ?? 0).toBeGreaterThan(0);
  });

  it("accepts a correct screen", () => {
    const output = check([
      { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { emphasis: "low" }, container: "dialog", label: "Abbrechen" },
    ]);
    expect(output).toEqual({ instances: 2, valid: true, violations: [] });
  });

  it("finds a destructive action in the primary colour and a forbidden combination", () => {
    const destructive = check([{ ero: "butono", props: { emphasis: "high" }, label: "Löschen" }]);
    // Since Spec 007 (T021) "Löschen" alone also fails the fixed text rule: it names no object.
    expect(destructive.violations.map((entry) => entry.issue.rule)).toEqual([
      "destructive-label-names-object",
      "destructive-not-primary-color",
    ]);
    const forbidden = check([
      { ero: "butono", props: { emphasis: "medium", intent: "danger" }, label: "Löschen" },
    ]);
    expect(forbidden.violations.map((entry) => entry.issue.rule)).toContain("ero-prop-constraint");
  });

  it("finds a button without a label", () => {
    const output = check([{ ero: "butono", props: { emphasis: "low" } }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["label-required"]);
  });

  it("answers an unknown Ero with ero-unknown as a violation", () => {
    const output = check([{ ero: "butonno", props: {} }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["ero-unknown"]);
  });

  it("answers an unknown prop value with mcp-input-invalid and the allowed values", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: { emphasis: "hig" }, label: "Speichern" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.rule)).toEqual(["mcp-input-invalid"]);
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/props/emphasis");
    expect(result.allowed).toEqual(["high", "medium", "low"]);
  });

  // Spec 007 T014 (data-model §6): the new fields are checked as input; their rules come in Stufe B.
  it("answers an unknown Aspekto with mcp-input-invalid and the Aspektoj of the Modelo", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: {}, label: "Speichern", aspekto: "gibtsnicht" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.rule)).toEqual(["mcp-input-invalid"]);
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/aspekto");
    expect(result.allowed).toEqual(["komuna"]);
  });

  it("answers an unknown Dimensio or Dimensio value with mcp-input-invalid", () => {
    const unknownDimensio = checkUsage(modelo, {
      instances: [{ ero: "butono", props: {}, label: "Speichern", dimensioj: { breite: "x" } }],
    });
    expect(unknownDimensio.ok).toBe(false);
    if (!unknownDimensio.ok) {
      expect(unknownDimensio.issues[0]?.path).toBe("check_usage/instances/0/dimensioj/breite");
      expect(unknownDimensio.allowed).toContain("viewport");
    }
    const unknownValue = checkUsage(modelo, {
      instances: [
        { ero: "butono", props: {}, label: "Speichern", dimensioj: { viewport: "riesig" } },
      ],
    });
    expect(unknownValue.ok).toBe(false);
    if (!unknownValue.ok) {
      expect(unknownValue.issues[0]?.path).toBe("check_usage/instances/0/dimensioj/viewport");
      expect(unknownValue.allowed).toEqual(["compact", "medium", "expanded"]);
    }
  });

  it("judges an instance with a known Aspekto, Dimensio values and slots as before", () => {
    const plain = { ero: "butono", props: { emphasis: "high" }, label: "Speichern" };
    const described = {
      ...plain,
      aspekto: "komuna",
      dimensioj: { viewport: "compact" },
      slots: { label: ["text" as const] },
    };
    expect(check([described])).toEqual(check([plain]));
  });

  it("answers an unknown prop name with mcp-input-invalid and the props of the Skemo", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: { emphasiss: "high" }, label: "Speichern" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/props/emphasiss");
    expect(result.allowed).toContain("emphasis");
  });
});

// Spec 007 T024 (A3, A5, A6, A7, A10, D-07, contracts/mcp-tools §3): check_usage judges the use
// of an Ero by its Uzo: boundaries it recognises via a slot, the wrap or a Regulo, slot rules,
// the layout allowance and the text rules, with the Aspekto's overrides as info.
describe("check_usage with the Uzo (T024)", () => {
  const uzo = modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
  const boundary = (name: string) => uzo?.boundary.find((entry) => entry.case === name);
  const rulesOf = (instances: Parameters<typeof check>[0]) =>
    check(instances).violations.map((entry) => entry.issue.rule);

  it("S2: a form in the label slot is the boundary form-in-slot, with the kialo of the Uzo", () => {
    const output = check([{ ero: "butono", props: {}, slots: { label: [{ ero: "form" }] } }]);
    const found = output.violations.find((entry) => entry.issue.rule === "uzo-boundary");
    expect(found?.instance).toEqual([0]);
    expect(found?.issue.message).toContain("form-in-slot");
    expect(found?.issue.message).toContain(boundary("form-in-slot")?.kialo);
    expect(found?.issue.suggestion).toMatch(/not supported/i);
    expect(output.valid).toBe(false);
  });

  it("uzo-slot-accepts: text in an icon slot names what the slot accepts", () => {
    const output = check([
      { ero: "butono", props: {}, label: "Speichern", slots: { "icon-start": ["text"] } },
    ]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["uzo-slot-accepts"]);
    expect(output.violations[0]?.issue.suggestion).toContain("icon");
  });

  it("uzo-slot-max: two texts in the label slot", () => {
    const output = check([
      { ero: "butono", props: {}, label: "Speichern", slots: { label: ["text", "text"] } },
    ]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["uzo-slot-max"]);
    expect(output.violations[0]?.issue.suggestion).toBe("Keep at most 1.");
  });

  it("uzo-slot-nesting: an Ero inside a slot that allows no nesting", () => {
    const output = check([
      {
        ero: "butono",
        props: {},
        label: "Speichern",
        slots: { "icon-start": [{ ero: "butono" }] },
      },
    ]);
    const rules = output.violations.map((entry) => entry.issue.rule);
    expect(rules).toContain("uzo-slot-nesting");
    expect(
      output.violations.find((entry) => entry.issue.rule === "uzo-slot-nesting")?.issue.suggestion,
    ).toBe("Move the inner Ero next to this one.");
  });

  it("a slot the Skemo does not have is invalid input, with the slots of the Skemo", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: {}, label: "Speichern", slots: { badge: ["text"] } }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/slots/badge");
    expect(result.allowed).toEqual(["label", "icon-start", "icon-end"]);
  });

  it("full-width is allowed in an action-bar or under viewport=compact, not elsewhere", () => {
    const fullWidth = { ero: "butono", props: { "full-width": true }, label: "Weiter" };
    expect(rulesOf([{ ...fullWidth, container: "action-bar" }])).toEqual([]);
    expect(rulesOf([{ ...fullWidth, dimensioj: { viewport: "compact" } }])).toEqual([]);
    const output = check([{ ...fullWidth, container: "dialog" }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual([
      "full-width-in-action-bar-or-compact",
    ]);
    expect(output.violations[0]?.issue.regulo?.kialo.length ?? 0).toBeGreaterThan(0);
    expect(output.violations[0]?.issue.suggestion).toContain("action-bar");
    expect(output.violations[0]?.issue.suggestion).toContain("viewport=compact");
  });

  it("a label that breaks into lines is the boundary multi-line-label (via the wrap)", () => {
    const output = check([{ ero: "butono", props: {}, label: "Projekt\nlöschen" }]);
    const found = output.violations.find((entry) => entry.issue.rule === "uzo-boundary");
    expect(found?.issue.message).toContain("multi-line-label");
    expect(found?.issue.message).toContain(boundary("multi-line-label")?.kialo);
  });

  it("an action without a name is recognised by label-required alone (via regulo)", () => {
    // The boundary no-accessible-label says `via: { regulo: "label-required" }`: that Regulo is
    // the check that recognises the case; a second finding for the same fault would be noise.
    expect(boundary("no-accessible-label")?.via).toEqual({ regulo: "label-required" });
    const output = check([{ ero: "butono", props: { emphasis: "low" } }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["label-required"]);
  });

  it("S3: OK on a destructive button fails both fixed text rules; the solution names Projekt löschen", () => {
    const output = check([
      {
        ero: "butono",
        props: { emphasis: "high", intent: "danger" },
        goal: "destructive",
        label: "OK",
      },
    ]);
    // "OK" names no verb either, so the adjustable rule warns as well (third, by rule name).
    expect(output.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["destructive-label-names-object", "error"],
      ["destructive-label-not-generic", "error"],
      ["label-names-action", "warning"],
    ]);
    for (const violation of output.violations.slice(0, 2)) {
      expect(violation.issue.regulo?.kialo.length ?? 0).toBeGreaterThan(0);
    }
    // The solution is the approved example of each rule in the language of the instance; "OK"
    // names no language, so German (decision of 2026-10-12).
    expect(output.violations[0]?.issue.suggestion).toContain("Projekt löschen");
    expect(output.violations[1]?.issue.suggestion).toContain("Entwurf verwerfen");
    expect(output.valid).toBe(false);
  });

  it("names the solution in the language of the instance", () => {
    const output = check([
      { ero: "butono", props: { emphasis: "high", intent: "danger" }, label: "Yes, delete" },
    ]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual([
      "destructive-label-not-generic",
    ]);
    expect(output.violations[0]?.issue.suggestion).toContain("Discard draft");
  });

  describe("S4: an Aspekto overrides the adjustable rule with a Jugxo", () => {
    const EKZEMPLO = `${fixtureRoot("valid", "aspekto-ekzemplo")}/aspekto-ekzemplo`;
    const { modelo: composed } = loadModelo(withAspektoPackages(defaultModeloSource(), [EKZEMPLO]));
    if (composed === undefined) throw new Error("core + ekzemplo must load");
    const judge = (instances: Parameters<typeof check>[0]) => {
      const result = checkUsage(composed, { instances });
      if (!result.ok) throw new Error(JSON.stringify(result.issues));
      return result.output;
    };
    const playful = { ero: "butono", props: { emphasis: "high" }, label: "Los geht's!" };

    it("the override is recorded in the package: tavoloj.lingvo.overrides with its Jugxo", () => {
      const pkg = composed.aspektoPackages.find((entry) => entry.aspekto === "ekzemplo");
      expect(pkg?.overrides).toEqual([
        { regulo: "label-names-action", jugxo: expect.stringMatching(/^jug_ekz_/) },
      ]);
    });

    it("Los geht's! in ekzemplo is an info that names the Jugxo; valid stays true", () => {
      const output = judge([{ ...playful, aspekto: "ekzemplo" }]);
      expect(output.valid).toBe(true);
      expect(output.violations).toHaveLength(1);
      const [found] = output.violations;
      expect(found?.issue.rule).toBe("label-names-action");
      expect(found?.issue.severity).toBe("info");
      expect(found?.issue.message).toMatch(/jug_ekz_[0-9A-HJKMNP-TV-Z]{26}/);
    });

    it("the same label without the override is a warning; valid stays true", () => {
      for (const instance of [playful, { ...playful, aspekto: "komuna" }]) {
        const output = judge([instance]);
        expect(output.valid).toBe(true);
        expect(output.violations.map((entry) => entry.issue.severity)).toEqual(["warning"]);
        expect(output.violations[0]?.issue.rule).toBe("label-names-action");
      }
    });

    it("Weg damit! on a destructive button in ekzemplo fails the fixed rule; valid is false", () => {
      const output = judge([
        {
          ero: "butono",
          props: { emphasis: "high", intent: "danger" },
          goal: "destructive",
          label: "Weg damit!",
          aspekto: "ekzemplo",
        },
      ]);
      expect(output.valid).toBe(false);
      expect(output.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
        ["destructive-label-names-object", "error"],
        ["label-names-action", "info"],
      ]);
    });
  });
});
