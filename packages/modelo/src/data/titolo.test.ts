// The titolo data (Spec 014 ③; G1, G2, G5, G8, section ③, plan ③ D-01, D-03): the heading in the
// repo Modelo — its level is structure (1–6, a duty), its size is design (display-1…headline-4,
// derived from the level where none is given); the text in color.text.default in the role of its
// size. The new Regulo heading-levels-in-order judges a list of instances: no level jumps down
// over a step (2 → 4). The dialogo composes the titolo as its heading.

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
const titolo = eroNamed("titolo");
const skemo = titolo?.skemo;
const uzo = titolo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.instance]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("titolo in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/titolo/skemo.json, one of twenty-two Eroj", () => {
    expect(titolo?.file).toBe("modelo/data/eroj/titolo/skemo.json");
    expect(modelo.eroj).toHaveLength(22);
  });

  it("has level (a duty, 1–6, no default) and size (seven roles, no default: derived from the level) as props; one state; the label slot", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values, prop.default, prop.required])).toEqual(
      [
        ["level", ["1", "2", "3", "4", "5", "6"], undefined, true],
        [
          "size",
          ["display-1", "display-2", "display-3", "headline-1", "headline-2", "headline-3", "headline-4"],
          undefined,
          undefined,
        ],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([{ name: "label", default: true, text: true }]);
  });

  it("names its part text: colour fixed, typography by size (typography.<size>); size is the only axis", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts)).toEqual(["text"]);
    expect(skemo.parts.text?.color).toEqual({ fixed: "color.text.default" });
    expect(skemo.parts.text?.typography).toEqual({ by: ["size"] });
    for (const size of ["display-1", "headline-1", "headline-4"]) {
      expect(boundToken(skemo, "text", "typography", { size })?.token).toBe(
        `typography.${size.replace("-", ".")}`,
      );
    }
    expect(variantKeys(skemo)).toEqual(["size", "state"]);
    expect(combinationsOf(skemo, ["size"])).toHaveLength(7);
  });

  it("speaks role heading, named by its label; the level is spoken (aria-level)", () => {
    expect(skemo?.a11y).toEqual({
      role: "heading",
      name: ["slot:label"],
      states: { level: ["aria-level"] },
      keys: [],
    });
  });

  it("knows the goals section-heading (level 2) and page-title (level 1) with the words of G7, citing heading-levels-in-order", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["section-heading", { level: "2" }, "heading-levels-in-order"],
      ["page-title", { level: "1" }, "heading-levels-in-order"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["heading", "headline", "subheading"],
      de: ["überschrift", "zwischenüberschrift", "abschnittsüberschrift"],
    });
    expect(skemo?.goals?.[1]?.keywords).toEqual({
      en: ["title", "page-title"],
      de: ["titel", "seitentitel"],
    });
  });
});

describe("the Uzo of the titolo (section ③, G6)", () => {
  it("states the purpose; a bold paragraph as heading is the titolo itself; a heading with actions asks a person", () => {
    expect(uzo?.purpose).toBe("Names a page or section; its level is structure, its size is design.");
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["bold-paragraph-as-heading", "titolo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["heading-with-actions", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section and with dialogo, avizo, plenstato and tabelo; requires the label; size container, wraps", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "dialogo",
      "avizo",
      "plenstato",
      "tabelo",
    ]);
    expect(uzo?.slots).toEqual({ label: { accepts: ["text"], max: 1, required: true, nesting: 0 } });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    for (const name of ["dialogo", "avizo", "plenstato", "tabelo"]) {
      expect(eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero), name).toContain("titolo");
    }
  });

  it("carries heading-levels-in-order, fixed, as a list check over the levels of the instances (prop:level)", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "heading-levels-in-order",
        fixed: true,
        of: "prop:level",
        check: { kind: "levels-in-order" },
      },
    ]);
  });

  it("the brief names size as the axis, level as a duty, the label as a duty, and stays under 750", () => {
    if (titolo === undefined) throw new Error("missing");
    const brief = briefOf(titolo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["level", "size"]);
    expect(brief.required).toEqual({ props: ["level"], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the titolo (G8, E5)", () => {
  it("heading-levels-in-order is new, fixed, with a kialo, for the titolo; spacing too", () => {
    const regulo = named("heading-levels-in-order");
    expect(regulo?.appliesTo?.eroj).toEqual(["titolo"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/screen reader|table of contents/i);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("titolo");
  });

  it("levels 1, 2, 3 pass; 1, 2, 4 jumps over a step (the fourth is named); 2, 1 (up) passes", () => {
    const judge = (levels: string[]) =>
      rulesOf(
        evaluateUsage(
          modelo,
          levels.map((level, index) => ({
            ero: "titolo",
            props: { level },
            label: `Abschnitt ${index + 1}`,
          })),
        ),
      );
    expect(judge(["1", "2", "3"])).toEqual([]);
    expect(judge(["1", "2", "4"])).toEqual([["heading-levels-in-order", [2]]]);
    expect(judge(["2", "1", "2"])).toEqual([]);
    expect(judge(["1", "3"])).toEqual([["heading-levels-in-order", [1]]]);
  });

  it("has an approved and a rejected example in de and en, each a list of headings", () => {
    const regulo = named("heading-levels-in-order");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    for (const jugxo of examples) {
      expect(jugxo.ekzemplo?.instances.length ?? 0).toBeGreaterThanOrEqual(2);
      for (const instance of jugxo.ekzemplo?.instances ?? []) expect(instance.ero).toBe("titolo");
    }
  });
});

describe("suggest_ero of the heading (Gvidanto)", () => {
  it("'Mach diesen Text fett, das ist die Überschrift des Abschnitts' is a titolo with level 2, no bold teksto", () => {
    const answer = suggest("Mach diesen Text fett, das ist die Überschrift des Abschnitts");
    expect(answer.suggestion).toEqual({ ero: "titolo", props: { level: "2" } });
  });

  it("'Titel der Seite' is a titolo with level 1; 'a heading row with buttons' asks a person", () => {
    expect(suggest("Titel der Seite").suggestion).toEqual({ ero: "titolo", props: { level: "1" } });
    expect(suggest("heading row with a toolbar").boundary).toMatchObject({
      ero: "titolo",
      case: "heading-with-actions",
      action: "ask-human",
    });
  });
});
