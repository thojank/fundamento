// The konsileto data (Spec 014 ④; G4, G5, section ④, plan ④ D-01): the tooltip in the repo Modelo —
// the name or a short hint of a control while it is hovered or focused: a layer of the platform
// anchored to its trigger (for), gone with Escape, standing while the pointer is over it, heard as
// the control's description. Its words are at most eight (new Regulo tooltip-text-short); what a
// person needs to act stands visibly as text, anything operable is a sxvebilo.

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
const konsileto = eroNamed("konsileto");
const skemo = konsileto?.skemo;
const uzo = konsileto?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("konsileto in the repo Modelo (section ④, G1, G2, G4)", () => {
  it("lives in data/eroj/konsileto/skemo.json, one of twenty-seven Eroj", () => {
    expect(konsileto?.file).toBe("modelo/data/eroj/konsileto/skemo.json");
    expect(modelo.eroj).toHaveLength(27);
    expect(modelo.eroj.map((entry) => entry.ero.name)).toContain("konsileto");
  });

  it("has for (a duty: the id of its trigger) and placement (logical, block-start) as props; one state; a label slot", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default, prop.required])).toEqual(
      [
        ["for", "string", undefined, true],
        ["placement", "enum", "block-start", undefined],
      ],
    );
    expect(skemo?.props.find((prop) => prop.name === "placement")?.values).toEqual([
      "block-start",
      "block-end",
      "inline-start",
      "inline-end",
    ]);
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([{ name: "label", default: true, text: true }]);
    // placement keys no part (D-01): the Figma side makes it an axis of its own (extraAxes).
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
  });

  it("names its parts: the inverse surface with radius, shadow and layer; the inverse caption text; the box padding; the motion of its delay", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual(["surface", "text", "box", "motion"]);
    expect(skemo?.parts.surface).toEqual({
      fill: { fixed: "color.background.inverse" },
      radius: { fixed: "radius.role.control" },
      shadow: { fixed: "elevation.shadow.overlay" },
      layer: { fixed: "elevation.layer.overlay" },
    });
    expect(skemo?.parts.text).toEqual({
      color: { fixed: "color.text.inverse" },
      typography: { fixed: "typography.caption" },
    });
    expect(skemo?.parts.box).toEqual({ "inline-padding": { fixed: "spacing.small" } });
    expect(skemo?.parts.motion?.duration).toEqual({ fixed: "motion.duration.slow" });
    if (skemo === undefined) throw new Error("missing");
    expect(boundToken(skemo, "surface", "shadow", {})?.token).toBe("elevation.shadow.overlay");
  });

  it("speaks role tooltip, named by its label; Escape is its key (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "tooltip",
      name: ["slot:label"],
      states: {},
      keys: ["Escape"],
    });
  });

  it("knows the goal tooltip with the words of G7 (Hinweis stays the avizo's)", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["tooltip"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["tooltip", "hoverhint", "hover"],
      de: ["tooltip", "überfahren", "mouseover"],
    });
    expect(skemo?.goals?.[0]?.regulo).toBe("tooltip-text-short");
  });
});

describe("the Uzo of the konsileto (section ④, G6)", () => {
  it("states the purpose; essential info is visible text, operable content a popover; a tooltip on a disabled control asks a person", () => {
    expect(uzo?.purpose).toBe(
      "Shows the name or a short hint of a control while it is hovered or focused.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["essential-info", "teksto"],
      ["interactive-content", "sxvebilo"],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/touch|hover/i);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["tooltip-on-disabled", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes with the icon-only butono and the named ikono; requires the label; size content", () => {
    expect(uzo?.composes.containers).toEqual([]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["butono", "ikono"]);
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], max: 1, required: true, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "allowed" });
    for (const name of ["butono", "ikono"]) {
      expect(
        eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero),
        name,
      ).toContain("konsileto");
    }
  });

  it("carries tooltip-text-short, fixed, as max-words 8 on the label", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "tooltip-text-short",
        fixed: true,
        of: "slot:label",
        check: { kind: "max-words", count: 8 },
      },
    ]);
  });

  it("the brief names placement as the axis, for and the label as duties, and stays under 750", () => {
    if (konsileto === undefined) throw new Error("missing");
    const brief = briefOf(konsileto);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["placement"]);
    expect(brief.required).toEqual({ props: ["for"], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the konsileto (G8, E5)", () => {
  it("tooltip-text-short is new, fixed, with a kialo, for the konsileto; spacing too", () => {
    const regulo = named("tooltip-text-short");
    expect(regulo?.appliesTo?.eroj).toEqual(["konsileto"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/glance|vanishes/i);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("konsileto");
  });

  it("'Suchen' passes; a sentence of twelve words breaks the rule", () => {
    const judge = (label: string) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "konsileto", props: { for: "suchen" }, label }]));
    expect(judge("Suchen")).toEqual([]);
    expect(judge("Öffnet die Einstellungen")).toEqual([]);
    expect(
      judge("Hier kannst du nach Standards, Eroj und Reguloj suchen, die zu deinem Begriff passen"),
    ).toEqual([["tooltip-text-short", "error"]]);
  });

  it("has an approved and a rejected example in de and en (uzo-content-example-missing)", () => {
    const regulo = named("tooltip-text-short");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    for (const jugxo of examples) {
      for (const instance of jugxo.ekzemplo?.instances ?? [])
        expect(instance.ero).toBe("konsileto");
    }
  });
});

describe("suggest_ero of the tooltip (Gvidanto)", () => {
  it("'Tooltip mit dem Namen der Schaltfläche' is the konsileto, citing tooltip-text-short", () => {
    const answer = suggest("Tooltip mit dem Namen der Schaltfläche");
    expect(answer.suggestion).toEqual({ ero: "konsileto", props: {} });
    expect(answer.regulo?.name).toBe("tooltip-text-short");
  });

  it("'Tooltip mit den Passwortregeln am Feld' goes to visible text with the tooltip's reason; 'a hover-hint that is interactive' to the sxvebilo", () => {
    const rules = suggest("Tooltip mit den Passwortregeln am Feld");
    expect(rules.suggestion).toEqual({ ero: "teksto", props: {} });
    expect(rules.boundary).toMatchObject({
      ero: "konsileto",
      case: "essential-info",
      action: "use-instead",
    });
    expect(suggest("a hover-hint that is interactive").suggestion).toEqual({
      ero: "sxvebilo",
      props: {},
    });
  });

  it("'a hover-hint on a greyed button' asks a person: the own boundary and the goal both hold", () => {
    const answer = suggest("a hover-hint on a greyed button");
    expect(answer.suggestion).toBeNull();
    expect(answer.action).toBe("ask-human");
    expect(answer.candidates?.map((candidate) => candidate.ero)).toEqual([
      "konsileto",
      "konsileto",
    ]);
  });
});
