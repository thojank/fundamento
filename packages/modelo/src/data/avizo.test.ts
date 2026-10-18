// The avizo data (Spec 011 ③; G1–G7, section ③, plan ③ D-02, D-04–D-07): the notice in the repo
// Modelo — tells the person in the flow of the page what happened or what to watch for; intent is
// its axis (no neutral: a notice without a kind is text), rest its only state (G2: hover and
// focus lie with the dismiss butono it composes). The kind is spoken as a visually hidden word per
// intent (a11y.texts keyed by an enum value, plan ③ D-07), never colour alone. The cross-links of
// G5: the dialogo sends a mere notice to it (use-instead), it sends a decision to the dialogo, a
// one-word status to the insigno, a field's error to the kampo.

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
const avizo = eroNamed("avizo");
const skemo = avizo?.skemo;
const uzo = avizo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};
const INTENTS = ["info", "success", "warning", "danger"];

describe("avizo in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/avizo/skemo.json, second of twenty-five Eroj", () => {
    expect(avizo?.file).toBe("modelo/data/eroj/avizo/skemo.json");
    expect(modelo.eroj[2]?.ero.name).toBe("avizo");
  });

  it("has intent (info, success, warning, danger; no neutral) and dismissible as props; one state, rest", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["intent", INTENTS, "info"],
        ["dismissible", "boolean", false],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("has the slots heading (title is a web term), message (default, required), details and actions", () => {
    expect(skemo?.slots).toEqual([
      { name: "heading", text: true },
      { name: "message", default: true, text: true },
      { name: "details", text: true },
      { name: "actions" },
    ]);
  });

  it("names its parts: surface and accent keyed by intent, heading, message, details, actions, dismiss and box", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "accent",
      "actions",
      "box",
      "details",
      "dismiss",
      "heading",
      "icon",
      "message",
      "surface",
    ]);
    expect(skemo.parts.surface?.fill).toEqual({ by: ["intent"] });
    expect(skemo.parts.accent?.color).toEqual({ by: ["intent"] });
    expect(skemo.parts.accent?.width).toEqual({ fixed: "border.width.strong" });
    expect(skemo.parts.heading?.typography).toEqual({ fixed: "typography.label.1" });
    expect(skemo.parts.message?.typography).toEqual({ fixed: "typography.body.1" });
    expect(skemo.parts.details?.typography).toEqual({ fixed: "typography.caption" });
    expect(skemo.parts.dismiss?.size).toEqual({ fixed: "size.control.small" });
    expect(skemo.parts.box?.radius).toEqual({ fixed: "radius.role.surface" });
    expect(skemo.parts.box?.["inline-padding"]).toEqual({ fixed: "spacing.medium" });
    expect(styledProps(skemo)).toEqual(["intent"]);
    expect(variantKeys(skemo)).toEqual(["intent", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(4);
    for (const intent of INTENTS) {
      expect(boundToken(skemo, "surface", "fill", { intent })?.token).toBe(
        `color.status.${intent}.weak`,
      );
      expect(boundToken(skemo, "accent", "color", { intent })?.token).toBe(
        `color.status.${intent}.border`,
      );
    }
    for (const part of ["heading", "message", "details"]) {
      expect(skemo.parts[part]?.color).toEqual({ fixed: "color.text.default" });
    }
  });

  it("declares the default text on every weak status surface as a KontrastParo (four new pairs)", () => {
    const pairs = modelo.kontrastParoj.filter((pair) => pair.foreground === "color.text.default");
    for (const intent of INTENTS) {
      const pair = pairs.find(
        (candidate) => candidate.background === `color.status.${intent}.weak`,
      );
      expect(pair, intent).toBeDefined();
      expect(pair?.kategorio).toBe("text-normal");
    }
  });

  it("speaks role status (danger: alert, Celo knowledge), named by its message (the one required slot); the kind and 'Schließen' are a11y texts (G4)", () => {
    expect(skemo?.a11y.role).toBe("status");
    expect(skemo?.a11y.name).toEqual(["slot:message"]);
    expect(skemo?.a11y.states).toEqual({});
    expect(skemo?.a11y.keys).toEqual([]);
    expect(skemo?.a11y.texts).toEqual({
      dismissible: { de: "Schließen", en: "Close" },
      "intent-info": { de: "Hinweis:", en: "Note:" },
      "intent-success": { de: "Erfolg:", en: "Success:" },
      "intent-warning": { de: "Warnung:", en: "Warning:" },
      "intent-danger": { de: "Fehler:", en: "Error:" },
    });
  });

  it("knows the goals notify and report-error (intent=danger, citing error-says-what-to-do)", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["notify", {}, undefined],
      ["report-error", { intent: "danger" }, "error-says-what-to-do"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["notice", "alert", "message", "warning", "banner"],
      de: ["hinweis", "meldung", "warnung", "erfolgsmeldung"],
    });
    expect(skemo?.goals?.[1]?.keywords).toEqual({
      en: ["error", "failed", "failure"],
      de: ["fehler", "fehlgeschlagen", "fehlermeldung"],
    });
  });
});

describe("the Uzo of the avizo (section ③, G5)", () => {
  it("states the purpose, requires the message, lets actions hold butono and ligilo; size container, wrap allowed", () => {
    expect(uzo?.purpose).toBe(
      "Tells the person in the flow of the page what happened or what to watch for: saved, could not save, import not confirmed.",
    );
    expect(uzo?.slots).toEqual({
      heading: { accepts: ["text"], max: 1, nesting: 0 },
      message: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      details: { accepts: ["text"], nesting: 0 },
      actions: { accepts: ["butono", "ligilo"], max: 2, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
  });

  it("sends a decision to the dialogo, a one-word status to the insigno and a field's error to the kampo (all use-instead)", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["needs-decision", "dialogo"],
      ["one-word-status", "insigno"],
      ["field-error", "kampo"],
    ]);
    for (const entry of uzo?.instead ?? []) expect(entry.kialo).toMatch(/because/);
  });

  it("stops at a toast (not supported, with the reason of the spec) and at stacked notices (a person decides)", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["toast", "not-supported"],
      ["stacked-notices", "ask-human"],
    ]);
    expect(uzo?.boundary[0]?.kialo).toMatch(/by itself|time/);
  });

  it("composes in a page and at the top of a dialog's content, with butono and ligilo", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page", "dialog"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "butono",
      "ligilo",
      "ikono",
      "titolo",
    ]);
  });

  it("carries error-says-what-to-do, adjustable, as min-words 3 on the message when intent is danger", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "error-says-what-to-do",
        fixed: false,
        when: { props: { intent: ["danger"] } },
        check: { kind: "min-words", count: 3 },
      },
    ]);
  });

  it("the brief names intent as the axis, the message as a duty, and stays under 750", () => {
    if (avizo === undefined) throw new Error("missing");
    const brief = briefOf(avizo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["intent"]);
    expect(brief.required).toEqual({ props: [], slots: ["message"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5: the dialogo informs through the avizo, the avizo decides through the dialogo", () => {
  it("the dialogo's instead inform-only is use-instead avizo now (it said null in ②)", () => {
    const entry = eroNamed("dialogo")?.uzo?.instead.find((item) => item.goal === "inform-only");
    expect(entry?.ero).toBe("avizo");
    expect(entry?.kialo).not.toContain("no such Ero yet");
  });

  it("'Gespeichert' as a notice is the avizo, with the dialogo's reason beside it", () => {
    const answer = suggest("Gespeichert – ein Hinweis in der Seite");
    expect(answer.suggestion).toEqual({ ero: "avizo", props: {} });
    expect(answer.matched?.goal).toBe("notify");
  });

  it("'eine Meldung, die eine Entscheidung verlangt' is the dialogo (the avizo's own instead outranks its goal)", () => {
    const answer = suggest("eine Meldung, die eine Entscheidung verlangt");
    expect(answer.suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(answer.boundary).toMatchObject({ ero: "avizo", case: "needs-decision" });
  });

  it("'Fehlermeldung nach dem Import' is the avizo with intent danger, citing error-says-what-to-do", () => {
    const answer = suggest("Fehlermeldung nach dem Import");
    expect(answer.suggestion).toEqual({ ero: "avizo", props: { intent: "danger" } });
    expect(answer.regulo?.name).toBe("error-says-what-to-do");
  });

  it("a toast stops; several notices at once ask a person", () => {
    expect(suggest("ein Toast unten rechts").boundary).toMatchObject({
      ero: "avizo",
      case: "toast",
      action: "not-supported",
    });
    expect(suggest("Hinweise gestapelt übereinander").boundary).toMatchObject({
      ero: "avizo",
      case: "stacked-notices",
      action: "ask-human",
    });
  });
});

describe("the Reguloj of the avizo (G6, E5)", () => {
  it("error-says-what-to-do and one-primary-per-container are widened to the avizo; spacing too", () => {
    expect(named("error-says-what-to-do")?.appliesTo?.eroj).toContain("avizo");
    expect(named("error-says-what-to-do")?.statement).toContain("avizo");
    expect(named("one-primary-per-container")?.appliesTo?.eroj).toContain("avizo");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("avizo");
  });

  it("has an approved and a rejected example of the error rule for the avizo in de and en that evaluate as they say", () => {
    const regulo = named("error-says-what-to-do");
    if (regulo === undefined) throw new Error("missing");
    const examples = modelo.jugxoj.filter(
      (jugxo) =>
        jugxo.ekzemplo?.regulo === regulo.id && jugxo.ekzemplo.instances[0]?.ero === "avizo",
    );
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    for (const jugxo of examples) {
      const instances = jugxo.ekzemplo?.instances ?? [];
      expect(instances[0]?.props).toEqual({ intent: "danger" });
      const rules = rulesOf(evaluateUsage(modelo, instances)).map(([rule]) => rule);
      if (jugxo.decision === "approved") expect(rules, jugxo.id).toEqual([]);
      else expect(rules, jugxo.id).toEqual(["error-says-what-to-do"]);
      expect(jugxo.ref).toEqual({ ero: avizo?.ero.id });
    }
  });
});

describe("check_usage of the notice (G6, G7)", () => {
  const judge = (label: string, props: Record<string, string> = {}) =>
    rulesOf(evaluateUsage(modelo, [{ ero: "avizo", props, label }]));

  it("'Gespeichert.' passes as info; 'Fehler' alone violates error-says-what-to-do as danger, and passes as warning", () => {
    expect(judge("Gespeichert.")).toEqual([]);
    expect(judge("Fehler", { intent: "danger" })).toEqual([["error-says-what-to-do", "error"]]);
    expect(judge("Fehler", { intent: "warning" })).toEqual([]);
    expect(
      judge("Der Import wurde nicht gespeichert. Prüfe die Datei und lade sie erneut hoch.", {
        intent: "danger",
      }),
    ).toEqual([]);
  });

  it("two primary actions in one notice violate one-primary-per-container", () => {
    const result = evaluateUsage(modelo, [
      { ero: "avizo", props: { intent: "warning" }, label: "Import unbestätigt." },
      {
        ero: "butono",
        props: { emphasis: "high", intent: "danger" },
        label: "Projekt löschen",
        container: "notice-1",
      },
      {
        ero: "butono",
        props: { emphasis: "high", intent: "danger" },
        label: "Entwurf verwerfen",
        container: "notice-1",
      },
    ]);
    expect(rulesOf(result).map(([rule]) => rule)).toEqual(["one-primary-per-container"]);
  });
});
