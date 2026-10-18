// The spuro data (Spec 015 ①; G2, G3, section ①, plan ① D-02): the breadcrumb in the repo Modelo
// — shows where the current page sits in a hierarchy and links back up to each level. Its items
// are the platform's own links in order (the navigado's way), the last one the current page
// (the state of one entry, E7); a decorative chevron between two items; the landmark named by the
// words of the Modelo where the label is empty (Pfad, O-1).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, entryKeysOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const spuro = eroNamed("spuro");
const skemo = spuro?.skemo;
const uzo = spuro?.uzo;
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

describe("spuro in the repo Modelo (section ①, G1, G2)", () => {
  it("lives in data/eroj/spuro/skemo.json", () => {
    expect(spuro?.file).toBe("modelo/data/eroj/spuro/skemo.json");
  });

  it("has label and page as props; the states of a link; the items as entries, the current one by page or else the last", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false])).toEqual([
      ["label", "string", false],
      ["page", "string", false],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus"]);
    expect(skemo?.slots).toEqual([
      { name: "items", default: true, text: true, entry: { key: "current", equals: "page" } },
    ]);
    expect(entryKeysOf(skemoOrThrow())).toEqual([
      { slot: "items", key: "current", equals: "page" },
    ]);
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
    expect(combinationsOf(skemoOrThrow(), ["state"])).toHaveLength(3);
  });

  it("names its parts: the item as a link by current and state, the separator, box and focus ring; the current item text, not a link, in weight", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "item",
      "underline",
      "separator",
      "box",
      "focus-ring",
    ]);
    expect(skemo?.parts.item).toEqual({
      color: { by: ["current", "state"] },
      typography: { fixed: "typography.label.1" },
      weight: { by: ["current"] },
    });
    expect(skemo?.parts.underline).toEqual({
      width: { by: ["current"] },
      color: { sameAs: "item.color" },
    });
    expect(skemo?.parts.separator).toEqual({
      color: { fixed: "color.text.muted" },
      size: { fixed: "size.icon.small" },
    });
    expect(skemo?.parts.box).toEqual({
      gap: { fixed: "spacing.xsmall" },
      height: { fixed: "size.target.min" },
    });
    const bound = (part: string, property: string, when: Record<string, string>) =>
      boundToken(skemoOrThrow(), part, property, when)?.token;
    expect(bound("item", "color", { current: "false", state: "rest" })).toBe("color.link.rest");
    expect(bound("item", "color", { current: "false", state: "hover" })).toBe("color.link.hover");
    expect(bound("item", "color", { current: "true", state: "rest" })).toBe("color.text.default");
    expect(bound("underline", "width", { current: "false" })).toBe("border.width.default");
    expect(bound("underline", "width", { current: "true" })).toBe("none");
    expect(bound("item", "weight", { current: "true" })).toBe("font.weight.semibold");
  });

  it("speaks role navigation named by its label (Pfad where empty), current as aria-current (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "navigation",
      name: ["prop:label"],
      states: { current: ["aria-current"] },
      keys: [],
      texts: { "label-empty": { de: "Pfad", en: "Breadcrumb" } },
    });
  });

  it("knows the goal breadcrumb with the words of G3, citing link-label-names-destination", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["breadcrumb"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["breadcrumb", "breadcrumbs", "trail"],
      de: ["brotkrumen", "brotkrümel", "pfad", "pfadnavigation"],
    });
    expect(skemo?.goals?.[0]?.regulo).toBe("link-label-names-destination");
  });
});

describe("the Uzo of the spuro (section ①, G2)", () => {
  it("states the purpose; the main navigation is the navigado's, steps are not covered; a shortened path asks", () => {
    expect(uzo?.purpose).toBe(
      "Shows where the current page sits in a hierarchy and links back up to each level.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["main-navigation", "navigado"],
      ["steps", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["collapsed-middle", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes at the head of the page with ligilo and ikono; at least two items; wraps; the navigado closes its boundary breadcrumb here", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-header"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["ligilo", "ikono"]);
    expect(uzo?.slots.items).toEqual({ accepts: ["text"], required: true, min: 2, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    const breadcrumb = eroNamed("navigado")?.uzo?.boundary.find(
      (entry) => entry.case === "breadcrumb",
    );
    expect(breadcrumb?.action).toBe("use-instead");
    expect(breadcrumb?.ero).toBe("spuro");
    for (const name of ["ligilo", "ikono"]) {
      expect(
        eroNamed(name)?.uzo?.composes.with.map((entry) => entry.ero),
        name,
      ).toContain("spuro");
    }
  });

  it("carries link-label-names-destination, fixed, as not-words on the items (E5); 'hier' breaks it", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "link-label-names-destination",
        fixed: true,
        of: "slot:items",
        check: {
          kind: "not-words",
          words: { de: ["hier", "klicken", "mehr", "link"], en: ["here", "click", "more", "link"] },
        },
      },
    ]);
    expect(named("link-label-names-destination")?.appliesTo?.eroj).toContain("spuro");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("spuro");
    // At least two items (uzo-slot-min): a path of one level is no path.
    const judge = (items: string[]) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "spuro", props: {}, texts: { items } }]));
    expect(judge(["Start", "Projekte"])).toEqual([]);
    expect(judge(["hier", "Projekte"])).toEqual([["link-label-names-destination", "error"]]);
    expect(judge(["Start"])).toEqual([["uzo-slot-min", "error"]]);
  });

  it("the brief names current as the axis and the items as a duty, and stays under 750", () => {
    if (spuro === undefined) throw new Error("missing");
    const brief = briefOf(spuro);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["current"]);
    expect(brief.required).toEqual({ props: [], slots: ["items"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("suggest_ero of the breadcrumb (Gvidanto)", () => {
  it("'Breadcrumb oben auf der Detailseite' is the spuro, citing link-label-names-destination (the spec's dialog); 'Brotkrumen' too", () => {
    const answer = suggest("Breadcrumb oben auf der Detailseite");
    expect(answer.suggestion).toEqual({ ero: "spuro", props: {} });
    expect(answer.regulo?.name).toBe("link-label-names-destination");
    expect(answer.boundary).toMatchObject({
      ero: "navigado",
      case: "breadcrumb",
      action: "use-instead",
    });
    expect(suggest("Brotkrumen am Seitenkopf").suggestion).toEqual({ ero: "spuro", props: {} });
  });

  it("'Topnav' goes to the navigado with the spuro's reason; a step indicator is not covered", () => {
    expect(suggest("Topnav mit aktueller Seite").suggestion).toEqual({
      ero: "navigado",
      props: {},
    });
    const wizard = suggest("Schrittanzeige beim Einrichten");
    expect(wizard.suggestion).toBeNull();
    expect(wizard.boundary).toMatchObject({ ero: "spuro", case: "steps", action: "ask-human" });
  });
});
