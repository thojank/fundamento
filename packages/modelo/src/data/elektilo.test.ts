// The elektilo data (Spec 010 ④; G1–G7, section 4, E3, plan ④ D-01–D-16): the select in the repo
// Modelo — a field like the kampo (its bindings copied, Regel 0.1) with a chevron at its end and a
// list of options that opens on demand. The list is the platform's (E3): `open` is no state. Its
// options are entries of the slot options like the elekto's (③ D-02, O-13), at least two, no upper
// bound. Its Uzo sends a few visible options to the elekto, names a search in the list and several
// at once as not covered, stops at a drawn popup and asks a person about grouped options. The new
// text rule select-placeholder-is-prompt says that its placeholder is a prompt ("Bitte wählen"),
// not an example like the kampo's. The cross-links of G5: the butono, the kampo and the elekto send
// choose-many to it (use-instead), closing ③ D-08/D-12.

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, slotStates, USAGE_ENFORCERS } from "../eroj/usage.js";
import { describeTerm } from "../gvidanto/describe-term.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const elektilo = eroNamed("elektilo");
const kampo = eroNamed("kampo");
const skemo = elektilo?.skemo;
const uzo = elektilo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const uzoOf = (name: string) => eroNamed(name)?.uzo;

const COUNTRIES = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
  "Dänemark",
];
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const briefUnits = (name: string) => {
  const entry = eroNamed(name);
  if (entry === undefined) throw new Error(`${name} missing`);
  const bytes = Buffer.byteLength(JSON.stringify(briefOf(entry)), "utf8");
  return { bytes, units: Math.ceil(bytes / 3) };
};

describe("elektilo in the repo Modelo (G1, G2, section 4)", () => {
  it("lives in data/eroj/elektilo/skemo.json, between butono and elekto, and the repo Modelo stays valid", () => {
    expect(elektilo?.file).toBe("modelo/data/eroj/elektilo/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "ikono",
      "insigno",
      "kampo",
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
    // uzo-boundary-covered among them: no Uzo says null or ask-human for the words of its goal.
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has value, placeholder, required, invalid, size, disabled and name as props; no label prop, no open (G1, G2, E3)", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["value", "string", undefined],
        ["placeholder", "string", undefined],
        ["required", "boolean", false],
        ["invalid", "boolean", false],
        ["size", ["small", "medium", "large"], "medium"],
        ["disabled", "boolean", false],
        ["name", "string", undefined],
        // Spec 011 ① (plan ① D-09): a chosen empty option, 'Alle', 'keine Auswahl', value "".
        ["empty-label", "string", undefined],
      ],
    );
    expect(skemo?.props.find((prop) => prop.name === "placeholder")?.description).toMatch(
      /never the label/,
    );
  });

  it("knows the states rest, hover, focus, disabled and invalid; open is no state, the list is the platform's (E3)", () => {
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    for (const word of ["open", "opened", "expanded"]) {
      expect(skemo?.states).not.toContain(word);
      expect(skemo?.props.map((prop) => prop.name)).not.toContain(word);
      expect(Object.keys(skemo?.a11y.states ?? {})).not.toContain(word);
    }
  });

  it("has the slots of the kampo plus options; every option is an entry with the key selected (③ D-02, O-13)", () => {
    // Spec 011 ① (D-09): the empty option is an entry of the slot too — the first, with the value
    // "" and the text of empty-label; option-labels-distinct counts it among the options.
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      {
        name: "options",
        text: true,
        entry: { key: "selected", equals: "value", empty: "empty-label" },
      },
      { name: "help", text: true },
      { name: "error", text: true },
    ]);
  });

  it("names the parts of the kampo plus the chevron indicator, and copies the kampo's bindings (Regel 0.1)", () => {
    if (skemo === undefined || kampo === undefined) throw new Error("elektilo or kampo missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(
      [...Object.keys(kampo.skemo.parts), "indicator"].sort(),
    );
    for (const [part, properties] of Object.entries(kampo.skemo.parts)) {
      for (const [property, source] of Object.entries(properties)) {
        expect(skemo.parts[part]?.[property as never], `${part}.${property}`).toEqual(source);
      }
    }
    // Every binding of the kampo in a state the elektilo has is the elektilo's too; readonly is
    // the kampo's alone (a select has no read-only state).
    const shared = kampo.skemo.bindings.filter(
      (binding) => binding.when?.state === undefined || skemo.states.includes(binding.when.state),
    );
    expect(skemo.bindings.filter((binding) => binding.part !== "indicator")).toEqual(shared);
    const tokens = skemo.bindings.map((binding) => binding.token);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
  });

  it("draws the chevron in color.text.muted and sizes it from size.icon.* (section 4)", () => {
    if (skemo === undefined) throw new Error("elektilo missing");
    expect(skemo.parts.indicator).toEqual({
      color: { fixed: "color.text.muted" },
      size: { by: ["size"] },
    });
    for (const size of ["small", "medium", "large"]) {
      expect(boundToken(skemo, "indicator", "size", { size })?.token).toBe(`size.icon.${size}`);
      expect(boundToken(skemo, "box", "height", { size })?.token).toBe(`size.control.${size}`);
    }
    expect(boundToken(skemo, "border", "color", { state: "invalid" })?.token).toBe(
      "color.status.danger.border",
    );
    expect(boundToken(skemo, "placeholder", "color", {})?.token).toBe("color.text.subtle");
  });

  it("is a field: size × state make the Figma set, 3 × 5 = 15 (G7)", () => {
    if (skemo === undefined) throw new Error("elektilo missing");
    expect(variantKeys(skemo)).toEqual(["size", "state"]);
    expect(styledProps(skemo)).toEqual(["size"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(15);
  });

  it("speaks role combobox: name from the label, description from help and error, ArrowUp/Down, Enter, Escape, required like the kampo (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "combobox",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        selected: ["aria-selected"],
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
      },
      keys: ["ArrowUp", "ArrowDown", "Enter", "Escape"],
      texts: { required: { de: "erforderlich", en: "required" } },
    });
    expect(skemo?.a11y.texts).toEqual(kampo?.skemo.a11y.texts);
  });

  it("forbids an error text without invalid, like the kampo (constraint, Spec 009 D-04)", () => {
    if (skemo === undefined) throw new Error("elektilo missing");
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "false" })).toBeDefined();
    expect(forbiddenBy(skemo, { "slot:error": "filled", invalid: "true" })).toBeUndefined();
    // The first constraint is the kampo's; the second is the elektilo's own (Spec 011 ①: no
    // empty-label beside a placeholder).
    expect(skemo.constraints?.[0]).toEqual(kampo?.skemo.constraints?.[0]);
    expect(skemo.constraints).toHaveLength(2);
    expect(
      slotStates(skemo, {
        ero: "elektilo",
        props: {},
        label: "Land",
        texts: { options: COUNTRIES },
      }),
    ).toEqual({
      "slot:label": "filled",
      "slot:options": "filled",
      "slot:help": "empty",
      "slot:error": "empty",
    });
  });

  it("knows the goal choose-many with single words, no preposition, citing elekto-options-few", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props, goal.regulo])).toEqual([
      ["choose-many", {}, "elekto-options-few"],
    ]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["list", "select", "country", "language", "many"],
      de: ["liste", "auswählen", "land", "sprache", "vielen"],
    });
    const words = (skemo?.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat());
    for (const word of ["from", "of", "aus", "von", "one", "eine", "open", "öffnen", "dropdown"]) {
      expect(words).not.toContain(word);
    }
    for (const word of words) expect(word).toMatch(/^\p{L}+$/u);
  });
});

describe("the Uzo of the elektilo (section 4, G5)", () => {
  it("states the purpose of the spec, requires the label and at least two options without an upper bound, takes its width from the container", () => {
    expect(uzo?.purpose).toBe(
      "Chooses one of many options from a list that opens on demand: country, language, year.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      options: { accepts: ["text"], required: true, min: 2, nesting: 0 },
      help: { accepts: ["text"], max: 1, nesting: 0 },
      error: { accepts: ["text"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    expect(uzo?.layout).toEqual(kampo?.uzo?.layout);
  });

  it("sends a few visible options to the elekto, names a search in the list and several at once as not covered", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["choose-few", "elekto"],
      ["search-in-list", null],
      ["multiple", null],
    ]);
    expect(uzo?.instead[0]?.kialo).toMatch(/Fundamento covers it with elekto\.$/);
    expect(uzo?.instead[1]?.kialo).toMatch(/combobox with a search/);
    expect(uzo?.instead[2]?.kialo).toMatch(/exactly one value/);
  });

  it("stops at a drawn popup (the list is the platform's), asks a person about grouped options, never without a visible label", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["custom-popup", "not-supported"],
      ["grouped-options", "ask-human"],
      ["no-visible-label", "not-supported"],
    ]);
    expect(uzo?.boundary[0]?.kialo).toBe(
      "The list is the platform's, because a drawn list would need its own keyboard, scrolling and screen reader behaviour; that is a later round.",
    );
    expect(uzo?.boundary[2]?.via).toEqual({ regulo: "field-label-visible" });
    for (const entry of [...(uzo?.boundary ?? []), ...(uzo?.instead ?? [])]) {
      expect(entry.kialo).toMatch(/\bbecause\b/);
    }
  });

  it("composes in a form, a dialog and a filter bar, with the kampo and the butono, never in a slot of the butono", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "form",
      "dialog",
      "filter-bar",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono", "ikono"]);
    expect(uzo?.composes.with[0]?.kialo).toMatch(/same height/);
    expect(uzo?.composes.never.map((entry) => entry.ero)).toEqual(["butono"]);
  });

  it("carries option-labels-distinct, its own prompt rule on the placeholder, and the kampo's label, error and help rules", () => {
    expect(
      uzo?.content.map((entry) => [
        entry.regulo,
        entry.fixed,
        entry.severity ?? "error",
        entry.of ?? "slot:label",
        entry.check,
      ]),
    ).toEqual([
      ["option-labels-distinct", true, "error", "slot:options", { kind: "distinct" }],
      [
        "select-placeholder-is-prompt",
        false,
        "error",
        "prop:placeholder",
        { kind: "min-words", count: 2 },
      ],
      [
        "field-label-names-the-datum",
        false,
        "error",
        "slot:label",
        {
          kind: "not-words",
          words: { de: ["auswählen", "wählen", "wähle"], en: ["choose", "select", "pick"] },
        },
      ],
      ["error-says-what-to-do", true, "error", "slot:error", { kind: "min-words", count: 3 }],
      ["help-is-one-sentence", false, "error", "slot:help", { kind: "max-sentences", count: 1 }],
    ]);
    // The kampo's placeholder rule is not the elektilo's: "Bitte wählen" is a prompt, no example.
    expect(uzo?.content.map((entry) => entry.regulo)).not.toContain("placeholder-is-example");
  });

  it("the brief names the purpose, size, the label and the options as duties, and stays under 750", () => {
    if (elektilo === undefined) throw new Error("elektilo missing");
    const brief = briefOf(elektilo);
    // Spec 011 ① (O-3): selected, the state of one entry, is an axis of the brief too.
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "selected"]);
    expect(brief.required).toEqual({ props: [], slots: ["label", "options"] });
    const { bytes, units } = briefUnits("elektilo");
    expect(units, `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});

describe("the cross-links of G5: choose-many is the elektilo's (closes ③ D-08, D-12)", () => {
  it.each(["butono", "kampo", "elekto"])(
    "the %s sends choose-many to the elektilo (use-instead), its keywords unchanged",
    (name) => {
      const many = uzoOf(name)?.instead.find((entry) => entry.goal === "choose-many");
      expect(many?.ero).toBe("elektilo");
      expect(many?.kialo).toMatch(/elektilo covers it\.$|covers it with elektilo\.$/);
      expect(many?.kialo).toMatch(/\bbecause\b/);
      expect(many?.kialo).not.toMatch(/no such Ero yet|PR ④/);
      expect(many?.keywords).toEqual({
        en: ["select", "list", "country", "language", "many"],
        de: ["auswählen", "liste", "land", "sprache", "vielen"],
      });
    },
  );

  it("the elekto and the elektilo point at each other: few visible here, many in a list there", () => {
    expect(uzoOf("elekto")?.instead.find((entry) => entry.goal === "choose-many")?.ero).toBe(
      "elektilo",
    );
    expect(uzo?.instead.find((entry) => entry.goal === "choose-few")?.ero).toBe("elekto");
  });

  it("no Uzo of another Ero answers a word of the list with null or ask-human (uzo-boundary-covered)", () => {
    const goalWords = new Set(
      (skemo?.goals ?? []).flatMap((goal) => Object.values(goal.keywords).flat()),
    );
    const open = modelo.eroj
      .filter((entry) => entry.ero.name !== "elektilo")
      .flatMap((entry) => [
        ...(entry.uzo?.instead ?? [])
          .filter((item) => item.ero === null)
          .map((item) => [entry.ero.name, item.goal, item.keywords] as const),
        ...(entry.uzo?.boundary ?? [])
          .filter((item) => item.action === "ask-human")
          .map((item) => [entry.ero.name, item.case, item.keywords ?? {}] as const),
      ])
      .filter(([, , keywords]) =>
        Object.values(keywords)
          .flat()
          .some((word) => goalWords.has(word)),
      )
      .map(([ero, entry]) => `${ero}/${entry}`);
    expect(open).toEqual([]);
  });

  // Brief budget (Spec 007 measure, ceil(bytes / 3) ≤ 750): the kampo stood at 747 before; the
  // entry choose-many changes from null to use-instead with a kialo as long as before or shorter.
  it.each(["kampo", "butono", "elekto", "elektilo"])(
    "the brief of the %s stays under the ceiling of 750",
    (name) => {
      const { bytes, units } = briefUnits(name);
      expect(units, `${name}: ${bytes} bytes`).toBeLessThanOrEqual(750);
    },
  );
});

describe("the Reguloj of the elektilo (G6, E5)", () => {
  it("select-placeholder-is-prompt is new, adjustable and the elektilo's alone; it judges instances", () => {
    expect(named("select-placeholder-is-prompt")).toMatchObject({
      checkability: "automatic",
      appliesTo: { eroj: ["elektilo"] },
    });
    expect(named("select-placeholder-is-prompt")?.statement).toMatch(/Bitte wählen/);
    expect(named("select-placeholder-is-prompt")?.kialo).toMatch(/prompt/);
    expect(named("select-placeholder-is-prompt")?.scope).toMatch(/approximation/);
    expect(USAGE_ENFORCERS["select-placeholder-is-prompt"]).toBeDefined();
  });

  it("placeholder-is-example stays the kampo's: a select placeholder is no example (no override in the core)", () => {
    expect(named("placeholder-is-example")?.appliesTo).toEqual({ eroj: ["kampo"] });
  });

  it.each([
    [
      "field-label-visible",
      ["kampo", "sxaltilo", "markobutono", "elekto", "elektilo", "tekstareo"],
    ],
    [
      "field-label-names-the-datum",
      ["kampo", "sxaltilo", "markobutono", "elekto", "elektilo", "tekstareo"],
    ],
    ["error-says-what-to-do", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo", "avizo"]],
    ["required-marked", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo"]],
    ["error-not-color-only", ["kampo", "markobutono", "elekto", "elektilo", "tekstareo"]],
    // Spec 014 ①: widened once more, to the reason-help of the dialogo.
    ["help-is-one-sentence", ["kampo", "elekto", "elektilo", "tekstareo", "dialogo"]],
    ["placeholder-not-label", ["kampo", "elektilo", "tekstareo"]],
    // Spec 011 ⑤: widened once more, to the tabs of the langetaro.
    // Spec 014 ④: and to the entries of the menuo.
    ["option-labels-distinct", ["elekto", "elektilo", "langetaro", "menuo"]],
  ])("%s is widened to the elektilo, not duplicated (E5)", (name, eroj) => {
    expect(named(name)?.appliesTo).toEqual({ eroj });
    expect(named(name)?.statement).toMatch(/elektilo/);
    expect(modelo.reguloj.filter((regulo) => regulo.name === name)).toHaveLength(1);
  });

  it("spacing-owned-by-container applies to all seven Eroj", () => {
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
    ]);
  });

  it.each([
    "select-placeholder-is-prompt",
    "option-labels-distinct",
    "field-label-names-the-datum",
  ])(
    "%s has an approved and a rejected elektilo example in de and en that evaluate as they say",
    (name) => {
      const regulo = named(name);
      const examples = modelo.jugxoj.filter(
        (jugxo) =>
          jugxo.ekzemplo?.regulo === regulo?.id &&
          "ero" in jugxo.ref &&
          jugxo.ref.ero === elektilo?.ero.id,
      );
      expect(
        examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo]),
      ).toEqual([
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ]);
      for (const jugxo of examples) {
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        expect(rulesOf(result), jugxo.id).toEqual(
          jugxo.decision === "rejected" ? [[name, "error"]] : [],
        );
        expect(result.valid, jugxo.id).toBe(jugxo.decision === "approved");
      }
    },
  );
});

describe("check_usage of the select (G6, G7: the instance cases)", () => {
  const judge = (instance: Record<string, unknown>) =>
    evaluateUsage(modelo, [{ ero: "elektilo", props: {}, ...instance }]);

  it("eight countries with a label and the prompt 'Bitte wählen' pass; many options are no warning", () => {
    const right = judge({
      label: "Land",
      props: { placeholder: "Bitte wählen" },
      texts: { options: COUNTRIES },
    });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
  });

  it("an empty label violates field-label-visible; a placeholder alone stands in for it (placeholder-not-label)", () => {
    expect(rulesOf(judge({ label: "", texts: { options: COUNTRIES } }))).toEqual([
      ["field-label-visible", "error"],
    ]);
    expect(
      rulesOf(
        judge({ label: "", props: { placeholder: "Bitte wählen" }, texts: { options: COUNTRIES } }),
      ),
    ).toEqual([
      ["field-label-visible", "error"],
      ["placeholder-not-label", "error"],
    ]);
  });

  it("two options with the same label violate option-labels-distinct (fixed: an error)", () => {
    const same = judge({
      label: "Land",
      texts: { options: ["Deutschland", "Österreich", "deutschland"] },
    });
    expect(same.valid).toBe(false);
    expect(rulesOf(same)).toEqual([["option-labels-distinct", "error"]]);
    expect(same.violations[0]?.issue.message).toMatch(/"Deutschland"/);
  });

  it("a single option is no choice: the slot options takes at least two (uzo-slot-min)", () => {
    const one = judge({ label: "Land", texts: { options: ["Deutschland"] } });
    expect(one.valid).toBe(false);
    expect(rulesOf(one)).toEqual([["uzo-slot-min", "error"]]);
    expect(one.violations[0]?.issue.message).toMatch(/at least 2/);
  });

  it("a placeholder equal to the label warns (placeholder-not-label)", () => {
    expect(
      rulesOf(
        judge({
          label: "Land wählen",
          props: { placeholder: "Land wählen" },
          texts: { options: COUNTRIES },
        }),
      ),
    ).toEqual([
      ["field-label-names-the-datum", "error"],
      ["placeholder-not-label", "warning"],
    ]);
  });

  it("a single option as the placeholder is no prompt (select-placeholder-is-prompt); 'Bitte wählen' is, and placeholder-is-example stays silent", () => {
    const option = judge({
      label: "Land",
      props: { placeholder: "Deutschland" },
      texts: { options: COUNTRIES },
    });
    expect(rulesOf(option)).toEqual([["select-placeholder-is-prompt", "error"]]);
    expect(option.violations[0]?.issue.suggestion).toMatch(/Bitte wählen/);
    for (const prompt of ["Bitte wählen", "Land wählen", "Please choose"]) {
      expect(
        judge({ label: "Land", props: { placeholder: prompt }, texts: { options: COUNTRIES } })
          .violations,
        prompt,
      ).toEqual([]);
    }
  });

  it("'Land auswählen' is a verb in the label; an error without invalid is a contradiction", () => {
    expect(rulesOf(judge({ label: "Land auswählen", texts: { options: COUNTRIES } }))).toEqual([
      ["field-label-names-the-datum", "error"],
    ]);
    expect(
      rulesOf(
        judge({
          label: "Land",
          props: { required: true },
          texts: { options: COUNTRIES, error: "Wähle ein Land, um fortzufahren" },
        }),
      ),
    ).toEqual([["ero-prop-constraint", "error"]]);
  });
});

describe("suggest_ero and the select (Gvidanto, section 4)", () => {
  const suggest = (goal: string) => {
    const result = suggestEro(modelo, { goal });
    if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
    return result.output;
  };

  it.each(["Land auswählen", "Select a country", "Sprache aus vielen auswählen"])(
    "'%s' is the elektilo: the goal choose-many with the kialo of elekto-options-few",
    (text) => {
      const answer = suggest(text);
      expect(answer.suggestion).toEqual({ ero: "elektilo", props: {} });
      expect(answer.matched?.goal).toBe("choose-many");
      expect(answer.regulo?.name).toBe("elekto-options-few");
      expect(answer.kialo).toBe(named("elekto-options-few")?.kialo);
      expect(answer.action).toBeUndefined();
    },
  );

  it("'Dropdown mit drei Versandarten' stays an elekto: the butono's choose-few (③ D-14)", () => {
    const answer = suggest("Dropdown mit drei Versandarten");
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched).toEqual({ goal: "choose-few", keyword: "drei", lingvo: "de" });
    expect(answer.boundary).toMatchObject({
      ero: "butono",
      case: "choose-few",
      action: "use-instead",
    });
  });

  it("'Combobox mit Suche' is a search in the list: not covered, a person decides", () => {
    const answer = suggest("Combobox mit Suche");
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({
      ero: "elektilo",
      case: "search-in-list",
      action: "ask-human",
    });
  });

  it("'Dropdown mit eigenem Popup' is no Ero of Fundamento: the list is the platform's (custom-popup)", () => {
    const answer = suggest("Dropdown mit eigenem Popup");
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({
      ero: "elektilo",
      case: "custom-popup",
      action: "not-supported",
    });
  });

  it("'Wie heißt das Dropdown in Fundamento?' is answered by describe_term: Dropdown is the Elektilo", () => {
    const result = describeTerm(modelo, { term: "Dropdown" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output.term).toBe("Elektilo");
    expect(result.output.matchedBy).toBe("altLabel");
    expect(result.output.prefLabel).toEqual({ eo: "Elektilo", en: "select", de: "Auswahlliste" });
  });
});

// Spec 011 ① (plan ① D-09): the empty option. Arkitekturo needed 'Alle' and 'keine Auswahl' as a
// choice with the value "" and got it twice, beside the prompt (QA L6, point 4). empty-label makes
// the first option a real one; it excludes the placeholder, and it is an option for the rule that
// keeps option labels apart.
describe("the empty option of the elektilo (Spec 011 ①)", () => {
  const judge = (instance: Record<string, unknown>) =>
    evaluateUsage(modelo, [{ ero: "elektilo", props: {}, ...instance }]);

  it("forbids empty-label beside a placeholder (constraint on two string props)", () => {
    if (skemo === undefined) throw new Error("elektilo missing");
    expect(
      forbiddenBy(skemo, { "prop:empty-label": "filled", "prop:placeholder": "filled" }),
    ).toBeDefined();
    expect(
      forbiddenBy(skemo, { "prop:empty-label": "filled", "prop:placeholder": "empty" }),
    ).toBeUndefined();
    expect(
      forbiddenBy(skemo, { "prop:empty-label": "empty", "prop:placeholder": "filled" }),
    ).toBeUndefined();
    const both = judge({
      label: "Status",
      props: { "empty-label": "Alle", placeholder: "Bitte wählen" },
      texts: { options: ["Entwurf", "Gültig"] },
    });
    expect(both.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    expect(both.violations[0]?.issue.message).toContain("prop:empty-label=filled");
  });

  it("'Alle' before 'Entwurf' and 'Gültig' passes; 'Alle' twice is option-labels-distinct", () => {
    const right = judge({
      label: "Status",
      props: { "empty-label": "Alle" },
      texts: { options: ["Entwurf", "Gültig"] },
    });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
    const twice = judge({
      label: "Status",
      props: { "empty-label": "Alle" },
      texts: { options: ["alle", "Entwurf"] },
    });
    expect(twice.violations.map((violation) => violation.issue.rule)).toEqual([
      "option-labels-distinct",
    ]);
    expect(twice.violations[0]?.issue.message).toMatch(/"Alle"/);
  });

  it("the brief of the elektilo stays under 750 with the empty option", () => {
    const { bytes, units } = briefUnits("elektilo");
    expect(units, `${bytes} bytes`).toBeLessThanOrEqual(750);
  });
});
