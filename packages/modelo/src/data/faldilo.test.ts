// The faldilo data (Spec 014 ⑤; G4, G5, section ⑤, plan ⑤ D-01): the disclosure in the repo Modelo —
// secondary content behind a summary the person can open, the platform's details and summary;
// several with the same group open one at a time (the platform's name). open is a prop and an
// axis (the chevron's colour follows it), the summary carries the states; the new Regulo
// disclosure-label-names-content judges the summary (not-words: "Mehr" names nothing).

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
const faldilo = eroNamed("faldilo");
const skemo = faldilo?.skemo;
const uzo = faldilo?.uzo;
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

describe("faldilo in the repo Modelo (section ⑤, G1, G2)", () => {
  it("lives in data/eroj/faldilo/skemo.json, one of forty Eroj", () => {
    expect(faldilo?.file).toBe("modelo/data/eroj/faldilo/skemo.json");
    expect(modelo.eroj).toHaveLength(40);
  });

  it("has open (a keyed boolean, the axis) and group as props; the states of the summary; summary and content slots", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["open", "boolean", false],
      ["group", "string", undefined],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus"]);
    expect(skemo?.slots).toEqual([
      { name: "summary", text: true },
      { name: "content", default: true },
    ]);
    expect(variantKeys(skemoOrThrow())).toEqual(["open", "state"]);
    expect(combinationsOf(skemoOrThrow(), ["open", "state"])).toHaveLength(6);
  });

  it("names its parts: the summary as a row by state, the chevron by open, content, box, motion, focus ring", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "summary",
      "indicator",
      "content",
      "box",
      "motion",
      "focus-ring",
    ]);
    expect(skemo?.parts.summary).toEqual({
      fill: { by: ["state"] },
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts.indicator).toEqual({
      color: { by: ["open"] },
      size: { fixed: "size.icon.medium" },
    });
    expect(boundToken(skemoOrThrow(), "indicator", "color", { open: "false" })?.token).toBe(
      "color.text.subtle",
    );
    expect(boundToken(skemoOrThrow(), "summary", "fill", { state: "hover" })?.token).toBe(
      "color.action.tertiary.hover",
    );
  });

  it("speaks role group, named by its summary, open as aria-expanded; Enter and Space (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "group",
      name: ["slot:summary"],
      states: { open: ["aria-expanded"] },
      keys: ["Enter", "Space"],
    });
  });

  it("knows the goal disclosure with the words of G7 (Details stays shared with the atributlisto: a tie asks)", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["disclosure"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["accordion", "disclosure", "collapsible", "expandable", "faq"],
      de: ["akkordeon", "aufklappen", "aufklapper", "ausklappen", "faq"],
    });
    expect(skemo?.goals?.[0]?.regulo).toBe("disclosure-label-names-content");
  });
});

describe("the Uzo of the faldilo (section ⑤, G6)", () => {
  it("states the purpose; views are the langetaro's, required info is text; a nested disclosure asks", () => {
    expect(uzo?.purpose).toBe(
      "Hides secondary content behind a label the person can open; several share a group when only one should be open.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["switch-view", "langetaro"],
      ["required-info", "teksto"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["nested-disclosure", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section with apartigilo, ikono and teksto; summary and content are duties; the langetaro sends hidden content here", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["apartigilo", "ikono", "teksto"]);
    expect(uzo?.slots.summary).toEqual({ accepts: ["text"], max: 1, required: true, nesting: 0 });
    expect(uzo?.slots.content?.required).toBe(true);
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    expect(
      eroNamed("langetaro")?.uzo?.instead.find((entry) => entry.goal === "disclose")?.ero,
    ).toBe("faldilo");
    for (const name of ["apartigilo", "ikono"]) {
      expect(
        eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero),
        name,
      ).toContain("faldilo");
    }
  });

  it("carries disclosure-label-names-content, fixed, as not-words on the summary", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "disclosure-label-names-content",
        fixed: true,
        of: "slot:summary",
        check: {
          kind: "not-words",
          words: {
            de: ["mehr", "details", "weiteres", "info", "hier"],
            en: ["more", "details", "info", "expand", "here"],
          },
        },
      },
    ]);
  });

  it("the brief names open as the axis, summary and content as duties, and stays under 750", () => {
    if (faldilo === undefined) throw new Error("missing");
    const brief = briefOf(faldilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["open"]);
    expect(brief.required).toEqual({ props: [], slots: ["summary", "content"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the faldilo (G8, E5)", () => {
  it("disclosure-label-names-content is new, fixed, with a kialo; spacing too", () => {
    const regulo = named("disclosure-label-names-content");
    expect(regulo?.appliesTo?.eroj).toEqual(["faldilo"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/guessing|list of summaries/i);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("faldilo");
  });

  it("'Lieferbedingungen' passes; 'Mehr' breaks the rule", () => {
    const judge = (summary: string) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "faldilo", props: {}, texts: { summary } }]));
    expect(judge("Lieferbedingungen")).toEqual([]);
    expect(judge("Mehr")).toEqual([["disclosure-label-names-content", "error"]]);
  });

  it("has an approved and a rejected example in de and en", () => {
    const regulo = named("disclosure-label-names-content");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
  });
});

describe("suggest_ero of the disclosure (Gvidanto)", () => {
  it("'FAQ als Akkordeon' is the faldilo, citing its Regulo; 'Details' stays the atributlisto's (the spec: only a tie would ask)", () => {
    const answer = suggest("FAQ als Akkordeon");
    expect(answer.suggestion).toEqual({ ero: "faldilo", props: {} });
    expect(answer.regulo?.name).toBe("disclosure-label-names-content");
    expect(suggest("Details").suggestion).toEqual({ ero: "atributlisto", props: {} });
  });

  it("'Reiter statt Akkordeon' goes to the langetaro with the faldilo's reason; 'Pflichtlektüre aufklappen' to the teksto", () => {
    const tabs = suggest("Akkordeon als Tabbar");
    expect(tabs.suggestion).toEqual({ ero: "langetaro", props: {} });
    expect(suggest("Pflichtlektüre aufklappen").suggestion).toEqual({ ero: "teksto", props: {} });
  });
});
