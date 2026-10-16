// The dialogo data (Spec 011 ②; G1–G7, section ②, E9, plan ② D-06–D-10): the dialog in the repo
// Modelo — a surface over a backdrop that asks for a decision; its states lie with the butono and
// the tekstareo it composes (no state axis of its own, G2); size and reason are its axes. The
// confirmation dialog and the form dialog are one Ero (E9). The new Regulo
// dialog-title-names-the-decision (adjustable); one-primary-per-container widened to its actions
// (E5). The cross-links of G5: the butono sends a confirmation question to it (use-instead); the
// sxaltilo and the markobutono name it among their companions.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const dialogo = eroNamed("dialogo");
const skemo = dialogo?.skemo;
const uzo = dialogo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("dialogo in the repo Modelo (section ②, E9)", () => {
  it("lives in data/eroj/dialogo/skemo.json, fourth of seventeen Eroj", () => {
    expect(dialogo?.file).toBe("modelo/data/eroj/dialogo/skemo.json");
    expect(modelo.eroj[3]?.ero.name).toBe("dialogo");
  });

  it("has open, size (small, medium) and reason (none, optional, required) as props; one state, rest (G2)", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["open", "boolean", false],
        ["size", ["small", "medium"], "small"],
        ["reason", ["none", "optional", "required"], "none"],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("has the slots heading (default; title is a web term), message, reason (the label of the reason field), content and actions", () => {
    expect(skemo?.slots).toEqual([
      { name: "heading", default: true, text: true },
      { name: "message", text: true },
      { name: "reason", text: true },
      { name: "content" },
      { name: "actions" },
    ]);
  });

  it("names its parts: backdrop, surface with shadow and width by size, border, heading in headline.4, message, reason by reason, content, actions, box", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual([
      "actions",
      "backdrop",
      "border",
      "box",
      "content",
      "heading",
      "message",
      "reason",
      "surface",
    ]);
    expect(skemo.parts.backdrop?.color).toEqual({ fixed: "color.backdrop" });
    expect(skemo.parts.surface?.fill).toEqual({ fixed: "color.background.raised" });
    expect(skemo.parts.surface?.shadow).toEqual({ fixed: "elevation.shadow.modal" });
    expect(skemo.parts.surface?.radius).toEqual({ fixed: "radius.role.surface" });
    expect(boundToken(skemo, "surface", "width", { size: "small" })?.token).toBe(
      "size.container.small",
    );
    expect(boundToken(skemo, "surface", "width", { size: "medium" })?.token).toBe(
      "size.container.medium",
    );
    expect(skemo.parts.border?.color).toEqual({ fixed: "color.border.default" });
    // The smallest headline above body (section ②: the plan names it): headline.4.
    expect(skemo.parts.heading?.typography).toEqual({ fixed: "typography.headline.4" });
    expect(skemo.parts.message?.typography).toEqual({ fixed: "typography.body.1" });
    // The reason field is there only with a reason: its height is none without one (Spec 008
    // D-03), a control's height with one; the field itself is the tekstareo the dialog shows.
    expect(boundToken(skemo, "reason", "height", { reason: "none" })?.token).toBe("none");
    expect(boundToken(skemo, "reason", "height", { reason: "required" })?.token).toBe(
      "size.control.large",
    );
    // size and reason key parts: the axes of the Figma set, 2 × 3 (one state).
    expect(styledProps(skemo)).toEqual(["size", "reason"]);
    expect(variantKeys(skemo)).toEqual(["size", "reason", "state"]);
    expect(combinationsOf(skemo, ["size", "reason", "state"])).toHaveLength(6);
  });

  it("speaks role dialog: named by the title, described by the message, Escape closes (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "dialog",
      name: ["slot:heading"],
      description: ["slot:message"],
      states: {},
      keys: ["Escape"],
    });
  });

  it("forbids a reason without its label: an empty reason slot allows reason=none only", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(forbiddenBy(skemo, { "slot:reason": "empty", reason: "required" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:reason": "empty", reason: "optional" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:reason": "empty", reason: "none" })).toBeUndefined();
    expect(forbiddenBy(skemo, { "slot:reason": "filled", reason: "required" })).toBeUndefined();
  });

  it("knows the goals confirm and ask-reason (reason=required), both citing the title rule; no word of the butono's goals", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["confirm", {}, "dialog-title-names-the-decision"],
      ["ask-reason", { reason: "required" }, "dialog-title-names-the-decision"],
    ]);
    const butono = eroNamed("butono");
    const butonoWords = (butono?.skemo.goals ?? []).flatMap((goal) =>
      Object.values(goal.keywords).flat(),
    );
    const words = (skemo?.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    // bestätigen/confirm and löschen/delete are the butono's; a word of two Eroj is ask-human.
    for (const word of words) expect(butonoWords, word).not.toContain(word);
    // reason/Begründung are the tekstareo's (the field that takes it): ask-reason uses justify.
    expect(words).not.toContain("reason");
    expect(words).not.toContain("begründung");
  });
});

describe("the Uzo of the dialogo (section ②, G5)", () => {
  it("states the purpose, requires title and actions (1–2 butono), lets content hold the form Eroj (E9)", () => {
    expect(uzo?.purpose).toBe(
      "Interrupts the page to ask for a decision before it happens: confirm, approve, reject with a reason. The page behind stays where it was.",
    );
    expect(uzo?.slots).toEqual({
      heading: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      message: { accepts: ["text"], max: 1, nesting: 0 },
      reason: { accepts: ["text"], max: 1, nesting: 0 },
      content: {
        accepts: ["kampo", "tekstareo", "elektilo", "elekto", "markobutono", "sxaltilo"],
        nesting: 1,
      },
      actions: { accepts: ["butono"], required: true, min: 1, max: 2, nesting: 0 },
    });
    // The heading is a sentence ("Standard „Datenschutz-Grundverordnung" löschen?") and wraps;
    // the width is the size's (Abweichung 3 of plan ②).
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
  });

  it("sends a mere notice to the avizo (③) and names a long form as a person's decision; stops at non-modal, drawer and nested", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["inform-only", "avizo"],
      ["long-form", null],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/avizo/);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["non-modal", "not-supported"],
      ["drawer", "not-supported"],
      ["nested-dialog", "not-supported"],
    ]);
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a page, with butono, tekstareo, kampo, elektilo and markobutono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual(["page"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "butono",
      "tekstareo",
      "kampo",
      "elektilo",
      "markobutono",
    ]);
  });

  it("carries dialog-title-names-the-decision, adjustable, as not-words on the title", () => {
    expect(
      uzo?.content.map((entry) => [
        entry.regulo,
        entry.fixed,
        // Nachbesserung F-1 (Abnahme 16.10.): the rule names its source — the heading, which is
        // the default slot; `texts.heading` was never judged while `of` was missing.
        entry.of,
        entry.check.kind,
      ]),
    ).toEqual([["dialog-title-names-the-decision", false, "slot:heading", "not-words"]]);
  });

  it("the brief names the purpose, size and reason, title and actions as duties, and stays under 750", () => {
    if (dialogo === undefined) throw new Error("dialogo missing");
    const brief = briefOf(dialogo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "reason"]);
    expect(brief.required).toEqual({ props: [], slots: ["heading", "actions"] });
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5: the butono asks before an irreversible action, the toggles name the dialog", () => {
  it("the butono's instead confirm sends to the dialogo with the kialo of the spec", () => {
    const confirm = eroNamed("butono")?.uzo?.instead.find((entry) => entry.goal === "confirm");
    expect(confirm?.ero).toBe("dialogo");
    expect(confirm?.kialo).toMatch(/not .*undone|cannot be undone|irreversible/i);
    expect(confirm?.kialo).toMatch(/second button|not a second/i);
  });

  it("the sxaltilo and the markobutono name the dialogo among their companions", () => {
    expect(eroNamed("sxaltilo")?.uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "kampo",
      "dialogo",
    ]);
    expect(eroNamed("markobutono")?.uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "kampo",
      "butono",
      "dialogo",
    ]);
  });

  it("the butono's brief stays under 750 with the new entry", () => {
    const butono = eroNamed("butono");
    if (butono === undefined) throw new Error("butono missing");
    const bytes = Buffer.byteLength(JSON.stringify(briefOf(butono)), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the dialogo (G6, E5)", () => {
  it("dialog-title-names-the-decision is new, adjustable, the dialogo's alone; it judges instances", () => {
    const regulo = named("dialog-title-names-the-decision");
    expect(regulo?.appliesTo).toEqual({ eroj: ["dialogo"] });
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/interrupts/);
    expect(regulo?.statement).toMatch(/Version freigeben\?/);
    expect(USAGE_ENFORCERS["dialog-title-names-the-decision"]).toBeDefined();
    expect(REGULO_ENFORCERS["dialog-title-names-the-decision"]).toBeUndefined();
  });

  it("one-primary-per-container is widened to the dialogo: at most one butono with emphasis high in its actions", () => {
    const regulo = named("one-primary-per-container");
    expect(regulo?.appliesTo?.eroj).toEqual(["butono", "dialogo", "avizo"]);
    expect(regulo?.statement).toMatch(/dialogo/);
    const two = evaluateUsage(modelo, [
      {
        ero: "butono",
        props: { emphasis: "high" },
        label: "Version freigeben",
        container: "dialog",
      },
      {
        ero: "butono",
        props: { emphasis: "high" },
        label: "Entwurf verwerfen",
        container: "dialog",
      },
    ]);
    expect(two.violations.map((violation) => violation.issue.rule)).toContain(
      "one-primary-per-container",
    );
  });

  it("has an approved and a rejected example in de and en that evaluate as they say", () => {
    const regulo = named("dialog-title-names-the-decision");
    const examples = modelo.jugxoj.filter(
      (jugxo) =>
        jugxo.ekzemplo?.regulo === regulo?.id &&
        "ero" in jugxo.ref &&
        jugxo.ref.ero === dialogo?.ero.id,
    );
    expect(examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo])).toEqual(
      [
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ],
    );
    for (const jugxo of examples) {
      const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
      const rules = result.violations.map((violation) => violation.issue.rule);
      expect(rules, jugxo.id).toEqual(
        jugxo.decision === "rejected" ? ["dialog-title-names-the-decision"] : [],
      );
    }
  });
});

describe("check_usage and suggest_ero of the dialog (G6, G7, Gvidanto)", () => {
  const judge = (instance: Record<string, unknown>) =>
    evaluateUsage(modelo, [{ ero: "dialogo", props: {}, ...instance }]);

  it("'Version freigeben?' with a message passes; 'Bestätigung' and 'Achtung' violate the title rule", () => {
    const right = judge({
      label: "Version freigeben?",
      texts: { message: "Die Version gilt ab sofort." },
    });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
    expect(rulesOf(judge({ label: "Bestätigung" }))).toEqual([
      ["dialog-title-names-the-decision", "error"],
    ]);
    expect(rulesOf(judge({ label: "Achtung" }))).toEqual([
      ["dialog-title-names-the-decision", "error"],
    ]);
    // F-1: the heading given as the text of its slot is the same title (the default slot is the
    // label); measured 16.10.: texts.heading "Bestätigung" passed.
    expect(rulesOf(judge({ texts: { heading: "Bestätigung" } }))).toEqual([
      ["dialog-title-names-the-decision", "error"],
    ]);
    expect(rulesOf(judge({ texts: { heading: "Version freigeben?" } }))).toEqual([]);
  });

  it("a required reason without its label is a contradiction the Skemo forbids; with the label it passes", () => {
    expect(rulesOf(judge({ label: "Version ablehnen?", props: { reason: "required" } }))).toEqual([
      ["ero-prop-constraint", "error"],
    ]);
    const labelled = judge({
      label: "Version ablehnen?",
      props: { reason: "required" },
      texts: { reason: "Begründung" },
    });
    expect(labelled.violations).toEqual([]);
  });

  it("'Ich brauche einen zweiten Button „Wirklich löschen?“' is a dialogo, with the butono's kialo (the dialog of the spec)", () => {
    const answer = suggest("Ich brauche einen zweiten Button „Wirklich löschen?“");
    expect(answer.suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(answer.boundary).toMatchObject({
      ero: "butono",
      case: "confirm",
      action: "use-instead",
    });
    expect(answer.boundary?.kialo).toBe(
      eroNamed("butono")?.uzo?.instead.find((entry) => entry.goal === "confirm")?.kialo,
    );
  });

  it("'Sind Sie sicher?' and 'approve or reject with a justification' are the dialogo; a drawer and a nested dialog stop", () => {
    expect(suggest("Sind Sie sicher?").suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(suggest("reject with a justification").suggestion).toEqual({
      ero: "dialogo",
      props: { reason: "required" },
    });
    expect(suggest("Seitenpaneel mit dem Inhalt").boundary).toMatchObject({
      ero: "dialogo",
      case: "drawer",
      action: "not-supported",
    });
    expect(suggest("verschachtelt im Dialog").boundary).toMatchObject({
      ero: "dialogo",
      case: "nested-dialog",
    });
  });

  it("'Gespeichert' as a notice is the avizo (③): the dialogo's inform-only is use-instead", () => {
    const answer = suggest("Hinweis: gespeichert");
    expect(answer.suggestion).toEqual({ ero: "avizo", props: {} });
    expect(answer.matched?.goal).toBe("notify");
  });
});
