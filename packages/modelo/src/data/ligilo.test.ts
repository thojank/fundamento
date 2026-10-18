// The ligilo data (Spec 008 T006, T007; A1–A4, plan D-01, D-02, D-03, D-05, D-10): the second Ero
// in the repo Modelo, bound only to role tokens and the two keywords, its Uzo next to it, the five
// Reguloj with a kialo, and examples right and wrong for every text rule.

import { describe, expect, it } from "vitest";
import {
  BINDING_KEYWORDS,
  boundToken,
  combinationsOf,
  isBindingKeyword,
} from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const ligilo = modelo.eroj.find((entry) => entry.ero.name === "ligilo");
if (ligilo === undefined) throw new Error("ligilo missing");
const { skemo, uzo } = ligilo;

const TEXT_REGULOJ = [
  "link-label-names-destination",
  "link-navigates-button-acts",
  "link-label-not-url",
];
const SKEMO_REGULOJ = ["link-not-color-only", "external-link-marked"];

describe("ligilo in the repo Modelo (T006)", () => {
  it("lives in data/eroj/ligilo/skemo.json, after the butono, and the repo Modelo stays valid", () => {
    expect(ligilo.file).toBe("modelo/data/eroj/ligilo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "ikono",
      "insigno",
      "kampo",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "plenstato",
      "saltligilo",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
    expect(ligilo.ero.description).toBe(
      "A link: moves to another view or place. Its label names the destination.",
    );
  });

  it("has the props, states and slots of A1: to, not href; no disabled; icon-end only (E3, E4, E5)", () => {
    expect(skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual([
      ["to", "string", undefined],
      ["placement", ["inline", "standalone"], "inline"],
      ["external", "boolean", false],
      ["size", ["small", "medium", "large"], "medium"],
      ["label", "string", undefined],
    ]);
    expect(skemo.states).toEqual(["rest", "hover", "pressed", "focus", "visited"]);
    expect(skemo.slots.map((slot) => slot.name)).toEqual(["label", "icon-end"]);
    expect(skemo.props.map((prop) => prop.name)).not.toContain("disabled");
    expect(skemo.constraints).toBeUndefined();
  });

  it("binds only role tokens or the keywords inherit and none, never palette steps (E1, D-03)", () => {
    const tokens = [
      ...skemo.bindings.map((binding) => binding.token),
      ...Object.values(skemo.parts).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(tokens.length).toBeGreaterThan(15);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
    expect(BINDING_KEYWORDS).toEqual(["inherit", "none"]);
    expect(tokens.filter(isBindingKeyword).sort()).toEqual([
      "inherit",
      "none",
      "none",
      "none",
      "none",
    ]);
  });

  it("colours the label by state: hover and pressed share one token (E2), visited has its own", () => {
    const color = (state: string) => boundToken(skemo, "label", "color", { state })?.token;
    expect(color("rest")).toBe("color.link.rest");
    expect(color("hover")).toBe("color.link.hover");
    expect(color("pressed")).toBe("color.link.hover");
    expect(color("focus")).toBe("color.link.rest");
    expect(color("visited")).toBe("color.link.visited");
    expect(skemo.parts.underline?.color).toEqual({ sameAs: "label.color" });
    expect(skemo.parts.icon?.color).toEqual({ sameAs: "label.color" });
  });

  it("inherits the typography inline and sets it standalone (E6)", () => {
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "label", "typography", { placement: "inline", size })?.token).toBe(
        "inherit",
      );
    }
    expect(
      boundToken(skemo, "label", "typography", { placement: "standalone", size: "small" })?.token,
    ).toBe("typography.label.2");
    expect(
      boundToken(skemo, "label", "typography", { placement: "standalone", size: "large" })?.token,
    ).toBe("typography.label.1");
  });

  it("underlines inline in every state, standalone from hover and focus on (link-not-color-only)", () => {
    const width = (placement: string, state: string) =>
      boundToken(skemo, "underline", "width", { placement, state })?.token;
    for (const state of skemo.states) expect(width("inline", state)).toBe("border.width.default");
    expect(width("standalone", "rest")).toBe("none");
    expect(width("standalone", "visited")).toBe("none");
    for (const state of ["hover", "pressed", "focus"]) {
      expect(width("standalone", state)).toBe("border.width.default");
    }
  });

  it("has a minimum target only standalone (D-10) and no box besides gap", () => {
    expect(boundToken(skemo, "box", "height", { placement: "standalone" })?.token).toBe(
      "size.target.min",
    );
    expect(boundToken(skemo, "box", "height", { placement: "inline" })?.token).toBe("none");
    expect(Object.keys(skemo.parts.box ?? {}).sort()).toEqual(["gap", "height", "width"]);
    expect(skemo.parts.box?.gap).toEqual({ fixed: "spacing.small" });
    expect(combinationsOf(skemo, ["placement", "size"])).toHaveLength(6);
  });

  it("speaks role link with Enter, and the external text in de and en (D-02, S4)", () => {
    expect(skemo.a11y.role).toBe("link");
    expect(skemo.a11y.name).toEqual(["slot:label", "prop:label"]);
    expect(skemo.a11y.keys).toEqual(["Enter"]);
    expect(skemo.a11y.texts).toEqual({
      external: { de: "öffnet extern", en: "opens external" },
    });
  });

  it("knows the goals navigate and external without prepositions (OP-12, D-08)", () => {
    expect(skemo.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["navigate", {}, "link-navigates-button-acts"],
      ["external", { external: true }, "external-link-marked"],
    ]);
    const words = (skemo.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["zur", "zum", "go", "open", "öffnen", "to"])
      expect(words).not.toContain(word);
    // Nachlese 3 G1 (O-28): "navigation" is the navigado's word now; the ligilo keeps the verb
    // and the overview (one destination).
    expect(skemo.goals?.[0]?.keywords).toEqual({
      en: ["navigate", "overview"],
      de: ["navigieren", "übersicht"],
    });
    for (const word of words) expect(word).not.toMatch(/\s/);
  });

  it("keeps visible strings out of the Skemo and the Uzo: labels live only in Jugxo examples", () => {
    const text = JSON.stringify({ ...skemo, a11y: { ...skemo.a11y, texts: undefined } });
    expect(text).not.toMatch(/Projektübersicht|hier klicken|click here|Dokumentation/);
    expect(JSON.stringify(uzo ?? {})).not.toMatch(/Projektübersicht|hier klicken|click here/);
  });
});

describe("the Uzo of the ligilo (T006, A3)", () => {
  it("lives next to the Skemo, names its Ero and Skemo, says what the Ero is for", () => {
    expect(ligilo.uzoFile).toBe("modelo/data/eroj/ligilo/uzo.json");
    expect(uzo?.id).toMatch(/^uzo_[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(uzo?.ero).toBe(ligilo.ero.id);
    expect(uzo?.skemo).toBe(skemo.id);
    expect(uzo?.purpose).toBe(
      "Moves to another view or place: it opens an overview, a detail, a document or an outside site.",
    );
  });

  it("answers action with the butono (instead), without zurück and back (Abweichung 3)", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["action", "butono"]]);
    const words = Object.values(uzo?.instead[0]?.keywords ?? {}).flat();
    expect(words).toContain("speichern");
    expect(words).toContain("delete");
    expect(words).not.toContain("zurück");
    expect(words).not.toContain("back");
    for (const entry of uzo?.instead ?? []) expect(entry.kialo).toMatch(/\bbecause\b/);
  });

  it("names the four boundaries of A3 with action, via and kialo", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action, entry.via])).toEqual([
      ["button-look", "ask-human", undefined],
      ["download", "ask-human", undefined],
      ["disabled-link", "not-supported", undefined],
      ["multi-line-label", "not-supported", { layout: "wrap" }],
    ]);
    for (const entry of uzo?.boundary ?? []) expect(entry.kialo).toMatch(/\bbecause\b/);
  });

  it("composes in text, navigation, footer and card, with ligilo, never in a butono (A3)", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "text",
      "navigation",
      "footer",
      "card",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["ligilo"]);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
    expect(uzo?.composes.never[0]?.kialo).toContain("action-bar");
    expect(uzo?.composes.spacing).toEqual({
      owner: "container",
      regulo: "spacing-owned-by-container",
    });
  });

  it("rules the slots and the layout: size from the content, wraps with the text (D-04)", () => {
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], max: 1, nesting: 0 },
      "icon-end": { accepts: ["icon"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "with-text" });
  });

  it("carries the three text rules: two fixed, the address rule adjustable (A3, D-07)", () => {
    expect(uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.check.kind])).toEqual([
      ["link-label-names-destination", true, "not-words"],
      ["link-navigates-button-acts", true, "not-instead"],
      ["link-label-not-url", false, "not-words"],
    ]);
  });
});

describe("the Reguloj of the ligilo (T005, A2, D-13)", () => {
  const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);

  it.each([...TEXT_REGULOJ, ...SKEMO_REGULOJ])("%s applies to ligilo with a kialo", (name) => {
    const regulo = named(name);
    // Spec 011 ⑤ (E5): the destination rule and the colour rule are widened to the navigado.
    // Spec 011 ⑤ widened two rules to the navigado; Spec 014 ② widens the destination rule to the
    // saltligilo too (E5).
    const widened =
      name === "link-label-names-destination"
        ? ["ligilo", "navigado", "saltligilo"]
        : name === "link-not-color-only"
          ? ["ligilo", "navigado"]
          : ["ligilo"];
    expect(regulo?.appliesTo).toEqual({ eroj: widened });
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(40);
  });

  it.each(TEXT_REGULOJ)("%s judges instances through the usage table", (name) => {
    expect(USAGE_ENFORCERS[name]).toBeDefined();
    expect(REGULO_ENFORCERS[name]).toBeUndefined();
  });

  it.each(SKEMO_REGULOJ)("%s judges the Skemo through the Modelo enforcers", (name) => {
    expect(REGULO_ENFORCERS[name]).toBeDefined();
    expect(USAGE_ENFORCERS[name]).toBeUndefined();
  });

  it("touch-target-min carries the exemption for inline links in its statement (D-10)", () => {
    const regulo = named("touch-target-min");
    expect(regulo?.statement).toMatch(/ligilo with placement inline is exempt/);
    expect(regulo?.kialo).toMatch(/2\.5\.8|block of text/);
  });

  it("spacing-owned-by-container applies to butono and ligilo", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toEqual([
      "butono",
      "ligilo",
      "kampo",
      "sxaltilo",
      "markobutono",
      "elekto",
      "elektilo",
      "tekstareo",
      "dialogo",
      "insigno",
      "avizo",
      "plenstato",
      "tabelo",
      "atributlisto",
      "mezurilo",
      "navigado",
      "langetaro",
      "ikono",
      "apartigilo",
      "saltligilo",
      "titolo",
      "teksto",
      "konsileto",
      "sxvebilo",
      "menuo",
      "faldilo",
      "kompletigilo",
    ]);
  });

  it.each(TEXT_REGULOJ)(
    "%s has an approved and a rejected example in de and en that evaluate as they say (T007)",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
      expect(
        examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo]),
      ).toEqual([
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ]);
      for (const jugxo of examples) {
        expect(jugxo.ref).toEqual({ ero: ligilo.ero.id });
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        const rules = result.violations.map((violation) => violation.issue.rule);
        expect(rules, jugxo.id).toEqual(jugxo.decision === "rejected" ? [name] : []);
        expect(result.valid, jugxo.id).toBe(jugxo.decision === "approved");
      }
    },
  );

  it("declares the three link colours on the canvas as KontrastParoj (A6)", () => {
    const names = modelo.kontrastParoj.map((pair) => pair.name);
    for (const state of ["rest", "hover", "visited"]) {
      expect(names).toContain(`link-${state}-on-background-default`);
      expect(names).toContain(`link-${state}-on-background-canvas`);
    }
  });
});
