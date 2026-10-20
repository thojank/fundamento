// The teksto data (Spec 014 ③; G1, G2, G5, section ③, plan ③ D-02): running text in the repo
// Modelo — kind body (size 1 or 2), caption, kicker or inline code, in the system's type roles;
// its rank is the axis `emphasis` (high → color.text.default, medium → subtle, low → muted; the
// spec's `tone` is a status word since Spec 007 F1, the name is P0's proposal for the maintainer).

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
const teksto = modelo.eroj.find((entry) => entry.ero.name === "teksto");
const skemo = teksto?.skemo;
const uzo = teksto?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("teksto in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/teksto/skemo.json", () => {
    expect(teksto?.file).toBe("modelo/data/eroj/teksto/skemo.json");
  });

  it("has kind (body, caption, kicker, code), size (1, 2; body only) and emphasis (high, medium, low) as props; one state; the label slot", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values, prop.default])).toEqual([
      ["kind", ["body", "caption", "kicker", "code"], "body"],
      ["size", ["1", "2"], "1"],
      ["emphasis", ["high", "medium", "low"], "high"],
    ]);
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([{ name: "label", default: true, text: true }]);
    // One constraint keyed by the size (plan ③ D-02): the element resets the when-prop on a
    // violation, so a caption of size 2 becomes a caption of size 1 — never a body of size 2.
    expect(skemo?.constraints).toEqual([
      { when: { size: "2" }, allowed: { kind: ["body"] }, kialo: expect.stringMatching(/size/) },
    ]);
  });

  it("names its part text: typography by kind and size, colour by emphasis; fifteen combinations", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts)).toEqual(["text"]);
    expect(skemo.parts.text?.typography).toEqual({ by: ["kind", "size"] });
    expect(skemo.parts.text?.color).toEqual({ by: ["emphasis"] });
    expect(boundToken(skemo, "text", "typography", { kind: "body", size: "1" })?.token).toBe(
      "typography.body.1",
    );
    expect(boundToken(skemo, "text", "typography", { kind: "body", size: "2" })?.token).toBe(
      "typography.body.2",
    );
    expect(boundToken(skemo, "text", "typography", { kind: "caption", size: "1" })?.token).toBe(
      "typography.caption",
    );
    expect(boundToken(skemo, "text", "typography", { kind: "kicker", size: "1" })?.token).toBe(
      "typography.kicker",
    );
    expect(boundToken(skemo, "text", "typography", { kind: "code", size: "1" })?.token).toBe(
      "typography.code",
    );
    expect(boundToken(skemo, "text", "color", { emphasis: "high" })?.token).toBe(
      "color.text.default",
    );
    expect(boundToken(skemo, "text", "color", { emphasis: "medium" })?.token).toBe(
      "color.text.subtle",
    );
    expect(boundToken(skemo, "text", "color", { emphasis: "low" })?.token).toBe("color.text.muted");
    expect(variantKeys(skemo)).toEqual(["kind", "size", "emphasis", "state"]);
    expect(combinationsOf(skemo, ["kind", "size", "emphasis"])).toHaveLength(15);
  });

  it("speaks role paragraph, named by its label; code is spoken as code (Celo); no state, no key", () => {
    expect(skemo?.a11y).toEqual({
      role: "paragraph",
      name: ["slot:label"],
      states: {},
      keys: [],
    });
  });

  it("knows the goal running-text with the words of G7", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["running-text"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      // Not "text" (every sentence about an Ero says it) and not "paragraph"/"absatz" (the
      // tekstareo's multi-line owns them, goal-keyword-shared): plan ③ D-08.
      en: ["running-text", "body-text", "caption", "kicker", "inline-code"],
      de: ["fließtext", "lauftext", "bildunterschrift", "kicker"],
    });
  });
});

describe("the Uzo of the teksto (section ③, G6)", () => {
  it("states the purpose; a heading is the titolo, a link in the text the ligilo, a status word the insigno; rich text asks a person", () => {
    expect(uzo?.purpose).toBe(
      "Sets running text in the system's type roles: body, caption, kicker, inline code.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["heading", "titolo"],
      ["link-in-text", "ligilo"],
      ["status-word", "insigno"],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["rich-text", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section with the ligilo; requires the label; size container, wraps; no text rule", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    // Nachlese 7 ② B-10: running text holds a link, a badge and code (phrasing content).
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["ligilo", "insigno", "teksto"]);
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text", "ligilo", "insigno", "teksto"], required: true, nesting: 1 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    expect(uzo?.content).toEqual([]);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("teksto");
  });

  it("a caption of size 2 breaks the constraint of the Skemo; body 2 passes", () => {
    const judge = (props: Record<string, string>) =>
      evaluateUsage(modelo, [{ ero: "teksto", props, label: "Abbildung 1" }]).violations.map(
        (violation) => violation.issue.rule,
      );
    expect(judge({ kind: "caption", size: "2" })).toEqual(["ero-prop-constraint"]);
    expect(judge({ kind: "body", size: "2" })).toEqual([]);
  });

  it("the brief names kind, size and emphasis as axes with their defaults, the label as a duty, and stays under 750", () => {
    if (teksto === undefined) throw new Error("missing");
    const brief = briefOf(teksto);
    expect(brief.axes.map((axis) => [axis.name, axis.default])).toEqual([
      ["kind", "body"],
      ["size", "1"],
      ["emphasis", "high"],
    ]);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("suggest_ero of the text (Gvidanto)", () => {
  it("'Fließtext unter dem Bild' is the teksto; 'a caption under the picture' too", () => {
    expect(suggest("Fließtext unter dem Bild").suggestion).toEqual({ ero: "teksto", props: {} });
    expect(suggest("a caption under the picture").suggestion).toEqual({
      ero: "teksto",
      props: {},
    });
  });

  it("'Markdown im Text' asks a person: rich text is a boundary", () => {
    expect(suggest("Markdown im Text rendern").boundary).toMatchObject({
      ero: "teksto",
      case: "rich-text",
      action: "ask-human",
    });
  });
});
