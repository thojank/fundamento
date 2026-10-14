// The butono data (Spec 003 T007; FR-02, plan D-02, data-model §2): one Ero and its Skemo in the
// repo Modelo, bound only to role tokens, with its label-on-surface pairs declared, the danger
// constraint, and examples right and wrong for every usage Regulo.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
const USAGE_REGULOJ = [
  "one-primary-per-container",
  "destructive-not-primary-color",
  "label-required",
  // Spec 007 T019 (A6, A7, data-model §4): the layout rule and the three text rules of the Uzo.
  "full-width-in-action-bar-or-compact",
  "label-names-action",
  "destructive-label-names-object",
  "destructive-label-not-generic",
];

/**
 * `label-names-action` only warns (Spec 007, plan D-02, decision of 2026-10-08): the keyword list
 * would refuse legitimate verbs such as "Senden" or "Teilen". A warning still counts as a
 * violation of its rule, but leaves `valid` true.
 */
const WARNING_REGULOJ = new Set(["label-names-action"]);

describe("butono in the repo Modelo (T007)", () => {
  it("lives in data/eroj/butono/skemo.json and the repo Modelo stays valid", () => {
    expect(butono?.file).toBe("modelo/data/eroj/butono/skemo.json");
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });

  it("has the props, states and slots of data-model §2", () => {
    expect(butono?.skemo.props.map((prop) => [prop.name, prop.values ?? prop.kind])).toEqual([
      ["emphasis", ["high", "medium", "low"]],
      ["intent", ["neutral", "danger"]],
      ["size", ["small", "medium", "large"]],
      ["type", ["button", "submit", "reset"]],
      ["disabled", "boolean"],
      ["loading", "boolean"],
      ["full-width", "boolean"],
      ["label", "string"],
    ]);
    expect(butono?.skemo.states).toEqual([
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
      "loading",
    ]);
    expect(butono?.skemo.slots.map((slot) => slot.name)).toEqual([
      "label",
      "icon-start",
      "icon-end",
    ]);
  });

  it("binds only role tokens, never palette steps or literals", () => {
    const tokens = [
      ...(butono?.skemo.bindings.map((binding) => binding.token) ?? []),
      ...Object.values(butono?.skemo.parts ?? {}).flatMap((part) =>
        Object.values(part).flatMap((source) =>
          source && "fixed" in source ? [source.fixed] : [],
        ),
      ),
    ];
    expect(tokens.length).toBeGreaterThan(20);
    expect(
      tokens.filter((token) => token.startsWith("color.palette.") || token.includes(".scale.")),
    ).toEqual([]);
  });

  it("forbids intent=danger with emphasis medium and low", () => {
    if (butono === undefined) throw new Error("butono missing");
    const skemo = butono.skemo;
    expect(forbiddenBy(skemo, { emphasis: "medium", intent: "danger" })).toBeDefined();
    expect(forbiddenBy(skemo, { emphasis: "low", intent: "danger" })).toBeDefined();
    expect(forbiddenBy(skemo, { emphasis: "high", intent: "danger" })).toBeUndefined();
    expect(combinationsOf(skemo, ["emphasis", "intent"])).toHaveLength(4);
  });

  it.each(USAGE_REGULOJ)(
    "%s has an approved and a rejected example that evaluate as they say",
    (name) => {
      const regulo = modelo.reguloj.find((candidate) => candidate.name === name);
      const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo?.id);
      // At least one of each; the text rules carry one per language (Spec 007, A7).
      expect(new Set(examples.map((jugxo) => jugxo.decision))).toEqual(
        new Set(["approved", "rejected"]),
      );
      for (const jugxo of examples) {
        expect(jugxo.ref).toEqual({ ero: butono?.ero.id });
        const result = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);
        const rules = result.violations.map((violation) => violation.issue.rule);
        expect(rules, `${jugxo.id}`).toEqual(jugxo.decision === "rejected" ? [name] : []);
        const severities = result.violations.map((violation) => violation.issue.severity);
        expect(severities, `${jugxo.id}`).toEqual(
          jugxo.decision === "rejected" ? [WARNING_REGULOJ.has(name) ? "warning" : "error"] : [],
        );
        expect(result.valid, `${jugxo.id}`).toBe(
          jugxo.decision === "approved" || WARNING_REGULOJ.has(name),
        );
      }
    },
  );

  it("keeps visible strings out of the Skemo and the Uzo: labels live only in Jugxo examples", () => {
    const text = JSON.stringify(butono?.skemo);
    expect(text).not.toMatch(/Speichern|Löschen|Abbrechen|Save|Delete|Cancel/);
    // Spec 007 T020 (data-model §3): the Uzo carries keywords as search vocabulary, never a label.
    const uzo = JSON.stringify(butono?.uzo ?? {});
    expect(uzo).not.toMatch(
      /Speichern|Löschen|Abbrechen|Projekt löschen|Save|Cancel|Delete project/,
    );
  });
});

// Spec 007 T020 (A1–A6, D-01, data-model §2.3): the Uzo of the butono next to its Skemo.
describe("the Uzo of the butono (T020)", () => {
  const uzo = butono?.uzo;

  it("lives in data/eroj/butono/uzo.json, names its Ero and Skemo, and says what the Ero is for", () => {
    expect(butono?.uzoFile).toBe("modelo/data/eroj/butono/uzo.json");
    expect(uzo?.id).toMatch(/^uzo_[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(uzo?.ero).toBe(butono?.ero.id);
    expect(uzo?.skemo).toBe(butono?.skemo.id);
    expect(uzo?.purpose.length ?? 0).toBeGreaterThan(20);
  });

  it("names the four boundaries of A3, each with an action and a kialo", () => {
    // Spec 008 A4 (D-14): navigation is use-instead ligilo since the ligilo exists.
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action, entry.ero])).toEqual([
      ["navigation", "use-instead", "ligilo"],
      ["form-in-slot", "not-supported", undefined],
      ["multi-line-label", "not-supported", undefined],
      ["no-accessible-label", "not-supported", undefined],
    ]);
    expect(uzo?.boundary[0]?.kialo).toMatch(
      /works differently\. Fundamento covers it with ligilo\.$/,
    );
    for (const entry of uzo?.boundary ?? []) expect(entry.kialo).toMatch(/\bbecause\b/);
    // The boundaries check_usage recognises (A10) say how: a slot, the wrap, a Regulo.
    expect(uzo?.boundary.map((entry) => entry.via)).toEqual([
      undefined,
      { slot: "label" },
      { layout: "wrap" },
      { regulo: "label-required" },
    ]);
  });

  // Spec 010 ① (G5): toggle is the sxaltilo's since PR ①. Spec 010 ③ (G5, plan ③ D-12): choose is
  // two entries, one Ero each — choose-few is the elekto's, choose-many the elektilo's since PR ④.
  it("answers toggle with the sxaltilo, choose-few with the elekto and choose-many with the elektilo, each with a kialo", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["toggle", "sxaltilo"],
      ["choose-many", "elektilo"],
      ["choose-few", "elekto"],
    ]);
    for (const entry of uzo?.instead ?? []) expect(entry.kialo).toMatch(/\bbecause\b/);
  });

  it("rules the slots of A5: text in the label, one decorative icon at each end, no nesting", () => {
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], max: 1, nesting: 0 },
      "icon-start": { accepts: ["icon"], max: 1, nesting: 0 },
      "icon-end": { accepts: ["icon"], max: 1, nesting: 0 },
    });
  });

  it("states the layout of A6 in platform-neutral words", () => {
    expect(uzo?.layout).toEqual({
      size: "content",
      wrap: "never",
      "full-width": {
        allowedIn: { containers: ["action-bar"], dimensioj: { viewport: ["compact"] } },
        regulo: "full-width-in-action-bar-or-compact",
      },
    });
  });

  it("composes in dialog, action-bar and form, and leaves spacing to the container (A4)", () => {
    expect(uzo?.composes.containers.map((entry) => entry.name)).toEqual([
      "dialog",
      "action-bar",
      "form",
    ]);
    expect(uzo?.composes.spacing).toEqual({
      owner: "container",
      regulo: "spacing-owned-by-container",
    });
  });

  it("carries the three text rules of A7: one adjustable warning, two fixed", () => {
    expect(
      uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.severity ?? "error"]),
    ).toEqual([
      ["label-names-action", false, "warning"],
      ["destructive-label-names-object", true, "error"],
      ["destructive-label-not-generic", true, "error"],
    ]);
  });
});

// Spec 007 T019 (A4, A6, A7, data-model §4): five Reguloj of the Uzo. The spacing rule is a
// candidate with checkability manual (A4); the other four judge instances through the usage table.
describe("the five Reguloj of the Uzo (T019)", () => {
  const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);

  it.each([
    "spacing-owned-by-container",
    "full-width-in-action-bar-or-compact",
    "label-names-action",
    "destructive-label-names-object",
    "destructive-label-not-generic",
  ])("%s applies to butono with a kialo", (name) => {
    const regulo = named(name);
    // spacing-owned-by-container applies to the ligilo too since Spec 008 (its Uzo names it).
    expect(regulo?.appliesTo?.eroj).toContain("butono");
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(40);
    expect(regulo?.statement.length ?? 0).toBeGreaterThan(20);
  });

  it("spacing-owned-by-container is a candidate with checkability manual (A4)", () => {
    expect(named("spacing-owned-by-container")?.checkability).toBe("manual");
    expect(USAGE_ENFORCERS["spacing-owned-by-container"]).toBeUndefined();
  });

  it.each([
    "full-width-in-action-bar-or-compact",
    "label-names-action",
    "destructive-label-names-object",
    "destructive-label-not-generic",
  ])("%s is automatic and has an enforcer in the usage table", (name) => {
    expect(named(name)?.checkability).toBe("automatic");
    expect(USAGE_ENFORCERS[name]).toBeDefined();
  });
});

/** Every JSON file under a directory, recursively. */
function jsonFilesUnder(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...jsonFilesUnder(path));
    else if (entry.endsWith(".json")) files.push(path);
  }
  return files;
}

// F1-T01 (Spec 007, Jugxo jug_01M4DNSD0SV43Y943T21RQF7EM, plan D-13): the axes of the butono say
// what they mean. `variant` (primary|secondary|tertiary) is `emphasis` (high|medium|low), `tone`
// (default|danger) is `intent` (neutral|danger). The tokens keep their names (color.action.primary).
describe("the axes of the butono are emphasis and intent (F1-T01)", () => {
  it("emphasis defaults to medium and intent to neutral", () => {
    const defaults = Object.fromEntries(
      (butono?.skemo.props ?? []).map((prop) => [prop.name, prop.default]),
    );
    expect(defaults.emphasis).toBe("medium");
    expect(defaults.intent).toBe("neutral");
  });

  it("no word variant or tone is left in data/ and vortaro/sets/", () => {
    const dataDir = fileURLToPath(new URL("../../data/", import.meta.url));
    const setsDir = fileURLToPath(new URL("../../../vortaro/sets/", import.meta.url));
    const files = [...jsonFilesUnder(dataDir), ...jsonFilesUnder(setsDir)];
    expect(files.length).toBeGreaterThan(10);
    // The kialo and context of a Jugxo are its record and stay as written (the measurements of
    // Spec 003 name the old axes, and the Jugxo of F1 itself names both names); everything else —
    // keys, prop values, descriptions, statements — must use the new names.
    const RECORD_KEYS = new Set(["kialo", "context"]);
    const offending: string[] = [];
    const visit = (value: unknown, pointer: string) => {
      if (typeof value === "string") {
        if (/\b(variant|tone)\b/.test(value)) offending.push(pointer);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          visit(item, `${pointer}/${index}`);
        });
        return;
      }
      if (typeof value !== "object" || value === null) return;
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (/\b(variant|tone)\b/.test(key)) offending.push(`${pointer}/${key}`);
        if (RECORD_KEYS.has(key) && pointer.includes("jugxoj")) continue;
        visit(child, `${pointer}/${key}`);
      }
    };
    for (const file of files) {
      const root = file.startsWith(dataDir) ? dataDir : setsDir;
      visit(JSON.parse(readFileSync(file, "utf8")), file.slice(root.length));
    }
    expect(offending).toEqual([]);
  });
});

// F1-T00 (Spec 007, OP-4, data-model §9): the goal of a user is `goal` everywhere, so that after F1
// the prop `intent` (neutral|danger) and the goal never share a word.
describe("the goal is called goal (F1-T00)", () => {
  it("names its goals under goals, one goal per entry, and has no intents", () => {
    expect(butono?.skemo.goals?.map((goal) => goal.goal)).toEqual([
      "destructive",
      "confirm",
      "dismiss",
    ]);
    expect(butono?.skemo).not.toHaveProperty("intents");
  });

  it("the word intent appears in data/ only as a prop name", () => {
    const dataDir = fileURLToPath(new URL("../../data/", import.meta.url));
    const files = jsonFilesUnder(dataDir);
    expect(files.length).toBeGreaterThan(3);
    // A key `intent`/`intents` may only name the prop: under props, when or allowed. The string
    // "intent" may only be the prop's name or a key in `by`.
    const PROP_PARENTS = new Set(["props", "when", "allowed"]);
    const offending: string[] = [];
    const visit = (value: unknown, pointer: string, parentKey: string | undefined) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item === "intent" && parentKey !== "by") offending.push(`${pointer}/${index}`);
          visit(item, `${pointer}/${index}`, parentKey);
        });
        return;
      }
      if (typeof value !== "object" || value === null) return;
      const record = value as Record<string, unknown>;
      for (const [key, child] of Object.entries(record)) {
        if ((key === "intent" || key === "intents") && !PROP_PARENTS.has(parentKey ?? ""))
          offending.push(`${pointer}/${key}`);
        if (child === "intent" && !(key === "name" && "kind" in record))
          offending.push(`${pointer}/${key}`);
        visit(child, `${pointer}/${key}`, key);
      }
    };
    for (const file of files) {
      visit(JSON.parse(readFileSync(file, "utf8")), file.slice(dataDir.length), undefined);
    }
    expect(offending).toEqual([]);
  });
});
