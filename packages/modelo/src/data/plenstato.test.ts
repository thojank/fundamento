// The plenstato data (Spec 011 ③; G1–G7, section ③, plan ③ D-03–D-06): the loading and empty
// state in the repo Modelo — fills an area while its content loads, or when there is none; kind is
// its axis and a duty (no default), rest its only state (G2). The indicator moves with the motion
// roles, so reduced motion stops it (motion-reduced-instant). The new Regulo
// empty-state-says-what-next (adjustable, check min-words, only for kind empty). The cross-links
// of G5: a working action is the butono's own loading, and the butono sends a loading area here.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const plenstato = eroNamed("plenstato");
const skemo = plenstato?.skemo;
const uzo = plenstato?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("plenstato in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/plenstato/skemo.json, twenty-second of thirty Eroj", () => {
    expect(plenstato?.file).toBe("modelo/data/eroj/plenstato/skemo.json");
    expect(modelo.eroj[21]?.ero.name).toBe("plenstato");
  });

  it("has kind (loading, empty) as its one prop, a duty without a default; one state, rest", () => {
    expect(skemo?.props).toEqual([
      {
        name: "kind",
        kind: "enum",
        values: ["loading", "empty"],
        required: true,
        description: expect.stringContaining("loads"),
      },
    ]);
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("has the slots text (default, required) and actions (only when empty)", () => {
    expect(skemo?.slots).toEqual([
      { name: "text", default: true, text: true },
      { name: "actions" },
    ]);
    expect(skemo?.constraints).toEqual([
      {
        when: { "slot:actions": "filled" },
        allowed: { kind: ["empty"] },
        kialo: expect.stringContaining("because"),
      },
    ]);
    if (skemo === undefined) throw new Error("missing");
    expect(forbiddenBy(skemo, { kind: "loading", "slot:actions": "filled" })).toBeDefined();
    expect(forbiddenBy(skemo, { kind: "empty", "slot:actions": "filled" })).toBeUndefined();
  });

  it("names its parts: a dashed surface border only when empty (stroke by kind), the indicator only when loading, the muted text, the motion roles", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "actions",
      "border",
      "box",
      "indicator",
      "motion",
      "surface",
      "text",
    ]);
    expect(skemo.parts.surface?.radius).toEqual({ fixed: "radius.role.surface" });
    expect(skemo.parts.border?.color).toEqual({ fixed: "color.border.subtle" });
    expect(skemo.parts.border?.width).toEqual({ fixed: "border.width.default" });
    expect(skemo.parts.border?.stroke).toEqual({ by: ["kind"] });
    expect(boundToken(skemo, "border", "stroke", { kind: "empty" })?.token).toBe("stroke.dashed");
    expect(boundToken(skemo, "border", "stroke", { kind: "loading" })?.token).toBe("none");
    expect(skemo.parts.indicator?.size).toEqual({ fixed: "size.icon.small" });
    expect(skemo.parts.indicator?.color).toEqual({ by: ["kind"] });
    // Not the brand fill of the spec: a fill role vanishes on the page where a brand's fill is
    // light (ekzemplo light 1,2:1); the info colour is a declared foreground on the page (plan ③
    // D-03, Abweichung 12, B-9).
    expect(boundToken(skemo, "indicator", "color", { kind: "loading" })?.token).toBe(
      "color.status.info.basic",
    );
    expect(boundToken(skemo, "indicator", "color", { kind: "empty" })?.token).toBe("none");
    expect(skemo.parts.text?.color).toEqual({ fixed: "color.text.muted" });
    expect(skemo.parts.motion?.duration).toEqual({ fixed: "motion.duration.slow" });
    expect(skemo.parts.motion?.easing).toEqual({ fixed: "motion.easing.standard" });
    expect(skemo.parts.box?.["inline-padding"]).toEqual({ fixed: "spacing.large" });
    // No fill: the text stands on the ground of the container, so no pair is needed (G3).
    expect(skemo.parts.surface?.fill).toBeUndefined();
    expect(styledProps(skemo)).toEqual(["kind"]);
    expect(variantKeys(skemo)).toEqual(["kind", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(2);
  });

  it("speaks role status, named by its text, no key; 'lädt' is heard while loading (G4)", () => {
    expect(skemo?.a11y.role).toBe("status");
    expect(skemo?.a11y.name).toEqual(["slot:text"]);
    expect(skemo?.a11y.keys).toEqual([]);
    expect(skemo?.a11y.texts).toEqual({ "kind-loading": { de: "lädt", en: "loading" } });
  });

  it("knows the goals loading (kind=loading) and empty (kind=empty, citing empty-state-says-what-next)", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["loading", { kind: "loading" }, undefined],
      ["empty", { kind: "empty" }, "empty-state-says-what-next"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["loading", "spinner", "wait", "busy"],
      de: ["lädt", "ladeanzeige", "warten", "laden"],
    });
    expect(skemo?.goals?.[1]?.keywords).toEqual({
      en: ["empty", "nothing"],
      de: ["leer", "treffer", "nichts", "leerzustand"],
    });
  });
});

describe("the Uzo of the plenstato (section ③, G5)", () => {
  it("states the purpose, requires the text, lets actions hold up to two butono; size container, wrap allowed", () => {
    expect(uzo?.purpose).toBe(
      "Fills an area while its content loads, or when there is none: loading standards, no standards yet.",
    );
    expect(uzo?.slots).toEqual({
      text: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      actions: { accepts: ["butono"], max: 2, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
  });

  it("sends a working button to the butono; known progress is a person's decision; a skeleton is not supported", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["button-busy", "butono"],
      ["progress-known", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["skeleton", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a table (its empty state) and a page section, with butono", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "tabelo",
      "page-section",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["butono", "titolo"]);
  });

  it("carries empty-state-says-what-next, adjustable, as min-words 3 on the text for kind empty", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "empty-state-says-what-next",
        fixed: false,
        when: { props: { kind: ["empty"] } },
        check: { kind: "min-words", count: 3 },
      },
    ]);
  });

  it("the brief names kind as axis and duty, the text as a duty, and stays under 750", () => {
    if (plenstato === undefined) throw new Error("missing");
    const brief = briefOf(plenstato);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["kind"]);
    expect(brief.required).toEqual({ props: ["kind"], slots: ["text"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5: an area loads here, an action loads in the butono", () => {
  it("the butono's new instead area-loading sends to the plenstato; its brief stays under 750", () => {
    const butono = eroNamed("butono");
    const entry = butono?.uzo?.instead.find((item) => item.goal === "area-loading");
    expect(entry?.ero).toBe("plenstato");
    expect(entry?.kialo).toMatch(/because/);
    if (butono === undefined) throw new Error("missing");
    expect(Math.ceil(JSON.stringify(briefOf(butono)).length / 3)).toBeLessThanOrEqual(750);
  });

  it("'Ladeanzeige für die Standards' is the plenstato with kind loading; 'der Knopf sendet gerade' is the butono", () => {
    expect(suggest("Ladeanzeige für die Standards").suggestion).toEqual({
      ero: "plenstato",
      props: { kind: "loading" },
    });
    const busy = suggest("der Knopf sendet gerade");
    expect(busy.suggestion).toEqual({ ero: "butono", props: {} });
    expect(busy.boundary).toMatchObject({ ero: "plenstato", case: "button-busy" });
  });

  it("'noch keine Standards' is the plenstato with kind empty, citing the empty-state rule; a skeleton stops", () => {
    const empty = suggest("Leerzustand: noch keine Standards");
    expect(empty.suggestion).toEqual({ ero: "plenstato", props: { kind: "empty" } });
    expect(empty.regulo?.name).toBe("empty-state-says-what-next");
    expect(suggest("ein Skelett während des Ladens").boundary).toMatchObject({
      ero: "plenstato",
      case: "skeleton",
      action: "not-supported",
    });
  });
});

describe("the Reguloj of the plenstato (G6)", () => {
  it("empty-state-says-what-next is new, adjustable, automatic, the plenstato's alone; spacing is widened", () => {
    const regulo = named("empty-state-says-what-next");
    expect(regulo?.appliesTo?.eroj).toEqual(["plenstato"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.scope).toContain("min-words");
    expect(USAGE_ENFORCERS["empty-state-says-what-next"]).toBeDefined();
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("plenstato");
  });

  it("has an approved and a rejected example in de and en that evaluate as they say", () => {
    const regulo = named("empty-state-says-what-next");
    if (regulo === undefined) throw new Error("missing");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    for (const jugxo of examples) {
      const instances = jugxo.ekzemplo?.instances ?? [];
      expect(instances[0]?.props).toEqual({ kind: "empty" });
      const rules = rulesOf(evaluateUsage(modelo, instances)).map(([rule]) => rule);
      if (jugxo.decision === "approved") expect(rules, jugxo.id).toEqual([]);
      else expect(rules, jugxo.id).toEqual(["empty-state-says-what-next"]);
      expect(jugxo.ref).toEqual({ ero: plenstato?.ero.id });
    }
  });
});

describe("check_usage of the state (G6, G7)", () => {
  const judge = (label: string, props: Record<string, string>, texts?: Record<string, string>) =>
    rulesOf(
      evaluateUsage(modelo, [
        { ero: "plenstato", props, label, ...(texts === undefined ? {} : { texts }) },
      ]),
    );

  it("'Noch keine Standards. Lege den ersten an.' passes; 'Keine Treffer' violates the rule; while loading two words pass", () => {
    expect(judge("Noch keine Standards. Lege den ersten an.", { kind: "empty" })).toEqual([]);
    expect(judge("Keine Treffer", { kind: "empty" })).toEqual([
      ["empty-state-says-what-next", "error"],
    ]);
    expect(judge("Standards laden", { kind: "loading" })).toEqual([]);
  });

  it("an action while loading is a contradiction the Skemo forbids", () => {
    expect(judge("Standards laden", { kind: "loading" }, { actions: "Standard anlegen" })).toEqual([
      ["ero-prop-constraint", "error"],
    ]);
    expect(
      judge(
        "Noch keine Standards. Lege den ersten an.",
        { kind: "empty" },
        {
          actions: "Standard anlegen",
        },
      ),
    ).toEqual([]);
  });
});
