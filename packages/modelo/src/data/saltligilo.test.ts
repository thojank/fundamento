// The saltligilo data (Spec 014 ②; G5, G7, G8, section ②, plan ② D-04): the skip link in the repo
// Modelo — the first focusable element of a page, hidden until focus, then shown above everything
// (elevation.layer.overlay, the new part property layer) with its focus ring; its target is `to`
// (the spec's `target` is a word of the web platform, Art. VIII); its text comes from the default
// slot, "Zum Inhalt springen" from a11y.texts when the slot is empty; link-label-names-destination
// is widened to it (E5).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const saltligilo = modelo.eroj.find((entry) => entry.ero.name === "saltligilo");
const skemo = saltligilo?.skemo;
const uzo = saltligilo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => violation.issue.rule);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("saltligilo in the repo Modelo (section ②)", () => {
  it("lives in data/eroj/saltligilo/skemo.json", () => {
    expect(saltligilo?.file).toBe("modelo/data/eroj/saltligilo/skemo.json");
  });

  it("has to (a duty: the id of the target) as its prop; the states rest and focus; the label slot", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.required])).toEqual([
      ["to", "string", true],
    ]);
    expect(skemo?.states).toEqual(["rest", "focus"]);
    expect(skemo?.slots).toEqual([{ name: "label", default: true, text: true }]);
  });

  it("names its parts: label, surface (raised, on the overlay layer, floating shadow), border, box, focus-ring — every token fixed", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "border",
      "box",
      "focus-ring",
      "label",
      "surface",
    ]);
    expect(skemo.parts.surface).toEqual({
      fill: { fixed: "color.background.raised" },
      layer: { fixed: "elevation.layer.overlay" },
      shadow: { fixed: "elevation.shadow.floating" },
    });
    expect(skemo.parts.label).toEqual({
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
    });
    expect(skemo.parts.border).toEqual({
      color: { fixed: "color.border.strong" },
      width: { fixed: "border.width.default" },
    });
    expect(skemo.parts.box).toEqual({
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
      radius: { fixed: "radius.role.control" },
    });
    expect(skemo.parts["focus-ring"]).toEqual({
      ring: { fixed: "focus.ring" },
      offset: { fixed: "focus.offset" },
      color: { fixed: "color.focus.inner" },
    });
    expect(skemo.bindings).toEqual([]);
    expect(variantKeys(skemo)).toEqual(["state"]);
  });

  it("speaks role link, named by its label; Enter; the default text of an empty label is heard and seen (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "link",
      name: ["slot:label"],
      states: {},
      keys: ["Enter"],
      texts: { "label-empty": { de: "Zum Inhalt springen", en: "Skip to content" } },
    });
  });

  it("knows the goal skip-to-content with the words of G7, citing link-label-names-destination", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.regulo])).toEqual([
      ["skip-to-content", "link-label-names-destination"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["skip", "skiplink", "jump"],
      de: ["sprunglink", "überspringen", "springen"],
    });
  });
});

describe("the Uzo of the saltligilo (section ②, G6)", () => {
  it("states the purpose, sends a reference in the text to the ligilo; a link always shown is no skip link", () => {
    expect(uzo?.purpose).toBe(
      "Lets keyboard users skip repeated content and jump to the main content.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["in-page-link", "ligilo"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["always-visible", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in the shell; requires the label; size content, never wraps", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["shell"]);
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], max: 1, required: true, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
  });

  it("carries link-label-names-destination, fixed, widened from the ligilo (E5): no 'hier', no 'click'", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "link-label-names-destination",
        fixed: true,
        check: {
          kind: "not-words",
          words: { de: ["hier", "klicken", "mehr", "link"], en: ["here", "click", "more", "link"] },
        },
      },
    ]);
    expect(named("link-label-names-destination")?.appliesTo?.eroj).toEqual([
      "ligilo",
      "navigado",
      "saltligilo",
    ]);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("saltligilo");
  });

  it("'hier klicken' violates the rule; 'Zum Inhalt springen' passes", () => {
    const judge = (label: string) =>
      rulesOf(evaluateUsage(modelo, [{ ero: "saltligilo", props: { to: "main" }, label }]));
    expect(judge("Zum Inhalt springen")).toEqual([]);
    expect(judge("hier klicken")).toEqual(["link-label-names-destination"]);
  });

  it("the brief names no axis, to and the label as duties, and stays under 750", () => {
    if (saltligilo === undefined) throw new Error("missing");
    const brief = briefOf(saltligilo);
    expect(brief.axes).toEqual([]);
    expect(brief.required).toEqual({ props: ["to"], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("suggest_ero of the skip link (Gvidanto)", () => {
  it("'Sprunglink zum Inhalt' is the saltligilo; 'skip to the main content' too", () => {
    expect(suggest("Sprunglink zum Inhalt für Tastaturnutzer").suggestion).toEqual({
      ero: "saltligilo",
      props: {},
    });
    expect(suggest("skip to the main content").suggestion).toEqual({
      ero: "saltligilo",
      props: {},
    });
  });

  it("'Verweis im Text auf einen Abschnitt' goes to the ligilo with the skip link's reason", () => {
    expect(suggest("Verweis im Text auf einen Abschnitt derselben Seite").suggestion).toEqual({
      ero: "ligilo",
      props: {},
    });
  });
});
