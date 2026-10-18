// The ikono data (Spec 014 ②; G1–G8, section ②, plan ② D-01, D-02): the icon in the repo Modelo —
// a symbol from the brand's icon set, decorative by default, named when it carries meaning. Its
// name is a name of the Ikonaro (an enum kept in step with data/ikonaro.json), its size a
// size.icon.* token, its colour the text's (inherit) or, for a status icon, the status text colour
// — and a status icon carries meaning, so it is named (constraint on prop:label). The new Regulo
// icon-meaning-named judges the name (not-words: "Icon" is no name).

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const ikono = eroNamed("ikono");
const skemo = ikono?.skemo;
const uzo = ikono?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("ikono in the repo Modelo (section ②, G1, G2, G3)", () => {
  it("lives in data/eroj/ikono/skemo.json, one of twenty-five Eroj", () => {
    expect(ikono?.file).toBe("modelo/data/eroj/ikono/skemo.json");
    expect(modelo.eroj).toHaveLength(25);
    expect(modelo.eroj.map((entry) => entry.ero.name)).toContain("ikono");
  });

  it("has name (a duty, the names of the Ikonaro), size, intent and label as props; one state", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default, prop.required])).toEqual(
      [
        ["name", "enum", undefined, true],
        ["size", "enum", "medium", undefined],
        ["intent", "enum", "neutral", undefined],
        ["label", "string", undefined, undefined],
      ],
    );
    // The names are the Ikonaro's, in its order (D-01): the enum and the data file stay one list.
    expect(skemo?.props.find((prop) => prop.name === "name")?.values).toEqual(
      modelo.ikonaro.map((entry) => entry.name),
    );
    expect(skemo?.props.find((prop) => prop.name === "size")?.values).toEqual([
      "small",
      "medium",
      "large",
    ]);
    expect(skemo?.props.find((prop) => prop.name === "intent")?.values).toEqual([
      "neutral",
      "info",
      "success",
      "warning",
      "danger",
    ]);
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([]);
  });

  it("names its parts: glyph (colour by intent: inherit, else the status text) and box (size by size: size.icon.*)", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(["box", "glyph"]);
    expect(skemo.parts.glyph?.color).toEqual({ by: ["intent"] });
    expect(boundToken(skemo, "glyph", "color", { intent: "neutral" })?.token).toBe("inherit");
    expect(boundToken(skemo, "glyph", "color", { intent: "danger" })?.token).toBe(
      "color.status.danger.text",
    );
    expect(boundToken(skemo, "glyph", "color", { intent: "info" })?.token).toBe(
      "color.status.info.text",
    );
    expect(skemo.parts.box?.size).toEqual({ by: ["size"] });
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "box", "size", { size })?.token).toBe(`size.icon.${size}`);
    }
    expect(styledProps(skemo)).toEqual(["name", "size", "intent"].filter((key) => key !== "name"));
    expect(variantKeys(skemo)).toEqual(["size", "intent", "state"]);
    expect(combinationsOf(skemo, ["size", "intent"])).toHaveLength(15);
  });

  it("speaks role img, named by its label; no state, no key (G5)", () => {
    expect(skemo?.a11y).toEqual({ role: "img", name: ["prop:label"], states: {}, keys: [] });
  });

  it("a status icon carries meaning and is named: intent ≠ neutral ⇒ prop:label filled (D-02)", () => {
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual(
      ["info", "success", "warning", "danger"].map((intent) => [
        { intent },
        { "prop:label": ["filled"] },
      ]),
    );
    for (const constraint of skemo?.constraints ?? []) {
      expect(constraint.kialo).toMatch(/name/);
    }
  });

  it("knows the goal show-icon with the words of G7", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["show-icon"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["icon", "symbol", "pictogram", "glyph"],
      de: ["icon", "symbol", "piktogramm", "glyphe"],
    });
  });
});

describe("the Uzo of the ikono (section ②, G6)", () => {
  it("states the purpose, sends a status-only icon to the insigno and a logo to a person; names its boundaries", () => {
    expect(uzo?.purpose).toBe(
      "Shows a symbol from the brand's icon set, decorative by default, named when it carries meaning.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["status-only-icon", "insigno"],
      ["logo", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["custom-svg", "ask-human"],
      ["animated-icon", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes with the butono, the avizo, the insigno, the tabelo and the elektilo (G6); no slot; size content", () => {
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "butono",
      "avizo",
      "insigno",
      "tabelo",
      "elektilo",
      // Spec 014 ④: a tooltip may name a meaningful icon, a menu entry may carry one.
      "konsileto",
      "menuo",
    ]);
    expect(uzo?.slots).toEqual({});
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
  });

  it("carries icon-meaning-named, fixed, on the label prop: a name that only says icon is no name", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "icon-meaning-named",
        fixed: true,
        of: "prop:label",
        check: {
          kind: "not-words",
          words: {
            en: ["icon", "image", "symbol", "glyph", "picture"],
            de: ["icon", "symbol", "bild", "grafik", "zeichen"],
          },
        },
      },
    ]);
  });

  it("the brief names name, size and intent as axes, name as a duty, and stays under 750", () => {
    if (ikono === undefined) throw new Error("missing");
    const brief = briefOf(ikono);
    // The name is a choice an agent makes (every enum prop is an axis of the brief): fifteen values.
    expect(brief.axes.map((axis) => axis.name)).toEqual(["name", "size", "intent"]);
    expect(brief.axes[0]?.values).toEqual(modelo.ikonaro.map((entry) => entry.name));
    expect(brief.required).toEqual({ props: ["name"], slots: [] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the ikono (G8, E5)", () => {
  it("icon-meaning-named is new, fixed, with a kialo, for the ikono and the butono; spacing too", () => {
    const regulo = named("icon-meaning-named");
    expect(regulo?.appliesTo?.eroj).toEqual(["ikono", "butono"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/screen reader|name/i);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("ikono");
  });

  it("a status icon without a name breaks the constraint; a name that says 'Icon' breaks the rule; 'Fehler' passes", () => {
    const judge = (props: Record<string, string>) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "ikono", props }]));
    expect(judge({ name: "danger", intent: "danger" })).toEqual([["ero-prop-constraint", "error"]]);
    expect(judge({ name: "danger", intent: "danger", label: "Icon" })).toEqual([
      ["icon-meaning-named", "error"],
    ]);
    expect(judge({ name: "danger", intent: "danger", label: "Fehler" })).toEqual([]);
    expect(judge({ name: "check" })).toEqual([]);
  });

  it("has an approved and a rejected example in de and en (uzo-content-example-missing)", () => {
    const regulo = named("icon-meaning-named");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    expect(
      examples.flatMap((jugxo) => jugxo.ekzemplo?.instances.map((i) => i.lingvo) ?? []).sort(),
    ).toEqual(["de", "de", "en", "en"]);
  });

  it("the Jugxo that released the undrawn icon carries the note that Spec 014 ② lifts it; it is not deleted", () => {
    const released = modelo.jugxoj.find((jugxo) => jugxo.id === "jug_01M31TV1V4S3RNBPWSRB2CGEDK");
    expect(released).toBeDefined();
    expect(released?.context).toContain("Spec 014 ②");
  });
});

describe("the Ikonaro and the Eroj that compose the ikono (G6)", () => {
  it("the butono's icon slots accept the ikono; butono, avizo, insigno, tabelo and elektilo compose it", () => {
    const butono = eroNamed("butono")?.uzo;
    expect(butono?.slots["icon-start"]?.accepts).toEqual(["icon", "ikono"]);
    expect(butono?.slots["icon-end"]?.accepts).toEqual(["icon", "ikono"]);
    for (const name of ["butono", "avizo", "insigno", "tabelo", "elektilo"]) {
      expect(
        eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero),
        name,
      ).toContain("ikono");
    }
  });

  it("the avizo shows a status icon beside its words: the part icon in the status text colour by intent, size.icon.medium", () => {
    const avizo = eroNamed("avizo")?.skemo;
    expect(avizo?.parts.icon).toEqual({
      color: { by: ["intent"] },
      size: { fixed: "size.icon.medium" },
    });
    if (avizo === undefined) throw new Error("missing");
    expect(boundToken(avizo, "icon", "color", { intent: "danger" })?.token).toBe(
      "color.status.danger.text",
    );
  });
});

describe("suggest_ero of the icon (Gvidanto)", () => {
  it("'Piktogramm vor dem Wort' is the ikono; 'ein Symbol' too", () => {
    expect(suggest("Piktogramm vor dem Wort").suggestion).toEqual({
      ero: "ikono",
      props: {},
    });
    expect(suggest("ein Symbol für Erfolg").suggestion).toEqual({ ero: "ikono", props: {} });
  });

  it("'Statussymbol allein' goes to the insigno with the icon's reason; a logo asks a person", () => {
    const status = suggest("Statussymbol als einzige Kennzeichnung");
    expect(status.suggestion).toEqual({ ero: "insigno", props: {} });
    const logo = suggest("das Logo der Marke");
    expect(logo.suggestion).toBeNull();
    expect(logo.boundary).toMatchObject({ ero: "ikono", case: "logo", action: "ask-human" });
  });
});
