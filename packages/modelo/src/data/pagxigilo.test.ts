// The pagxigilo data (Spec 015 ①; G2, G3, section ①, plan ① D-01): the pagination in the repo
// Modelo — moves through the pages of a long list and shows which page is current. The pages are
// entries the element writes itself from page and total-pages (the current one is the state of
// one entry, E7), the arrows the ikono chevron-left and chevron-right, the words of the Modelo
// name the landmark, the arrows and every page number (a11y.texts).

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
const pagxigilo = eroNamed("pagxigilo");
const skemo = pagxigilo?.skemo;
const uzo = pagxigilo?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("pagxigilo in the repo Modelo (section ①, G1, G2)", () => {
  it("lives in data/eroj/pagxigilo/skemo.json, one of forty Eroj", () => {
    expect(pagxigilo?.file).toBe("modelo/data/eroj/pagxigilo/skemo.json");
    expect(modelo.eroj).toHaveLength(40);
  });

  it("has page and total-pages as duties, label, mode (button or link), href-template and siblings; the states of an item; the pages as entries", () => {
    expect(
      skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false, prop.default]),
    ).toEqual([
      ["page", "string", true, undefined],
      ["total-pages", "number", true, undefined],
      ["label", "string", false, undefined],
      ["mode", "enum", false, "button"],
      ["href-template", "string", false, "?page={page}"],
      ["siblings", "number", false, 1],
    ]);
    expect(skemo?.props.find((prop) => prop.name === "mode")?.values).toEqual(["button", "link"]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled"]);
    expect(skemo?.slots).toEqual([
      { name: "items", default: true, text: true, entry: { key: "current", equals: "page" } },
    ]);
    expect(entryKeysOf(skemoOrThrow())).toEqual([
      { slot: "items", key: "current", equals: "page" },
    ]);
    // The axis is the state alone: current is the state of one entry, no variant (E7).
    expect(variantKeys(skemoOrThrow())).toEqual(["state"]);
    expect(combinationsOf(skemoOrThrow(), ["state"])).toHaveLength(4);
  });

  it("names its parts: the item by current and state, its border, the ellipsis, the two arrows, box and focus ring; the current item by more than colour", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "item",
      "border",
      "ellipsis",
      "prev",
      "next",
      "box",
      "focus-ring",
    ]);
    expect(skemo?.parts.item).toMatchObject({
      fill: { by: ["current", "state"] },
      color: { by: ["current", "state"] },
      typography: { fixed: "typography.label.1" },
      weight: { by: ["current"] },
      height: { fixed: "size.target.min" },
      width: { fixed: "size.target.min" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo?.parts.border).toEqual({
      width: { by: ["current"] },
      color: { fixed: "color.border.strong" },
    });
    expect(skemo?.parts.prev).toEqual({ size: { fixed: "size.icon.medium" } });
    expect(skemo?.parts.next).toEqual({ size: { fixed: "size.icon.medium" } });
    expect(skemo?.parts.ellipsis?.color).toEqual({ fixed: "color.navigation.text.rest" });
    const bound = (part: string, property: string, when: Record<string, string>) =>
      boundToken(skemoOrThrow(), part, property, when)?.token;
    expect(bound("item", "fill", { current: "true", state: "rest" })).toBe(
      "color.navigation.selected",
    );
    expect(bound("item", "fill", { current: "false", state: "hover" })).toBe(
      "color.navigation.hover",
    );
    expect(bound("item", "fill", { current: "false", state: "disabled" })).toBe(
      "color.action.tertiary.disabled",
    );
    expect(bound("item", "color", { current: "false", state: "disabled" })).toBe(
      "color.text.disabled",
    );
    expect(bound("item", "weight", { current: "true" })).toBe("font.weight.semibold");
    expect(bound("item", "weight", { current: "false" })).toBe("none");
    expect(bound("border", "width", { current: "true" })).toBe("border.width.strong");
    expect(bound("border", "width", { current: "false" })).toBe("none");
  });

  it("speaks role navigation named by its label, current as aria-current, disabled as aria-disabled; the words of the Modelo (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "navigation",
      name: ["prop:label"],
      states: { current: ["aria-current"], disabled: ["aria-disabled"] },
      keys: [],
      texts: {
        "label-empty": { de: "Seitenblättern", en: "Pagination" },
        "prev-name": { de: "Vorherige Seite", en: "Previous page" },
        "next-name": { de: "Nächste Seite", en: "Next page" },
        "items-name": { de: "Seite", en: "Page" },
      },
    });
  });

  it("knows the goal paginate with the words of G3 (pages stays the navigado's and tabelo's word)", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["paginate"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["pagination", "pager", "paging", "pagenumbers"],
      de: ["seitennummerierung", "blättern", "seitenzahlen", "seitenwechsel"],
    });
  });
});

describe("the Uzo of the pagxigilo (section ①, G2)", () => {
  it("states the purpose; more on demand is a butono, views are the langetaro's; infinite scroll and the page size ask", () => {
    expect(uzo?.purpose).toBe(
      "Moves through the pages of a long list and shows which page is current.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["load-more", "butono"],
      ["views", "langetaro"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["infinite-scroll", "ask-human"],
      ["page-size-select", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes under a list with the tabelo and the ikono; the tabelo closes its boundary pagination here, the langetaro sends list pages here", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["list-foot"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["tabelo", "ikono"]);
    expect(uzo?.slots.items).toEqual({ accepts: ["text"], required: false, nesting: 0 });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    expect(uzo?.content).toEqual([]);
    const pagination = eroNamed("tabelo")?.uzo?.boundary.find(
      (entry) => entry.case === "pagination",
    );
    expect(pagination?.action).toBe("use-instead");
    expect(pagination?.ero).toBe("pagxigilo");
    expect(eroNamed("tabelo")?.uzo?.composes.with.map((entry) => entry.ero)).toContain("pagxigilo");
    expect(
      eroNamed("langetaro")?.uzo?.instead.find((entry) => entry.goal === "list-pages")?.ero,
    ).toBe("pagxigilo");
    expect(eroNamed("ikono")?.uzo?.composes.with.map((entry) => entry.ero)).toContain("pagxigilo");
  });

  it("the brief names mode and current as axes, page and total-pages as duties, and stays under 750", () => {
    if (pagxigilo === undefined) throw new Error("missing");
    const brief = briefOf(pagxigilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["mode", "current"]);
    expect(brief.required).toEqual({ props: ["page", "total-pages"], slots: [] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });

  it("spacing-owned-by-container applies; the Ikonaro carries chevron-left, mirrored (Internacia)", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("pagxigilo");
    const left = modelo.ikonaro?.find((ikono) => ikono.name === "chevron-left");
    expect(left?.mirror).toBe(true);
    expect(eroNamed("ikono")?.skemo.props[0]?.values).toContain("chevron-left");
    expect(
      evaluateUsage(modelo, [
        { ero: "pagxigilo", props: { page: "3", "total-pages": "10" }, texts: {} },
      ]).violations,
    ).toEqual([]);
  });
});

describe("suggest_ero of the pagination (Gvidanto)", () => {
  it("'Pagination' and 'Seitennummerierung am Ende' are the pagxigilo with the tabelo's reason; the spec's 'Pagination unter der Tabelle' ties with the tabelo and asks (OP-12, Abweichung 3)", () => {
    const answer = suggest("Pagination");
    expect(answer.suggestion).toEqual({ ero: "pagxigilo", props: {} });
    expect(answer.boundary).toMatchObject({
      ero: "tabelo",
      case: "pagination",
      action: "use-instead",
    });
    expect(suggest("Seitennummerierung am Ende").suggestion).toEqual({
      ero: "pagxigilo",
      props: {},
    });
    const tie = suggest("Pagination unter der Tabelle");
    expect(tie.suggestion).toBeNull();
    expect(tie.action).toBe("ask-human");
    expect(tie.candidates?.map((candidate) => candidate.ero)).toEqual(
      expect.arrayContaining(["pagxigilo", "tabelo"]),
    );
  });

  it("'Mehrladen' goes to the butono with the pagxigilo's reason; 'Endlosscrollen' asks", () => {
    const more = suggest("Mehrladen unter den Treffern");
    expect(more.suggestion).toEqual({ ero: "butono", props: {} });
    expect(more.boundary).toMatchObject({
      ero: "pagxigilo",
      case: "load-more",
      action: "use-instead",
    });
    const endless = suggest("Endlosscrollen in der Trefferliste");
    expect(endless.suggestion).toBeNull();
    expect(endless.boundary?.case).toBe("infinite-scroll");
  });
});
