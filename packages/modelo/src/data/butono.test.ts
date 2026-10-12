// The butono data (Spec 003 T007; FR-02, plan D-02, data-model §2): one Ero and its Skemo in the
// repo Modelo, bound only to role tokens, with its label-on-surface pairs declared, the danger
// constraint, and examples right and wrong for every usage Regulo.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { combinationsOf, forbiddenBy } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
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
];

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
      expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual(["approved", "rejected"]);
      for (const jugxo of examples) {
        expect(jugxo.ref).toEqual({ ero: butono?.ero.id });
        const rules = evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []).violations.map(
          (violation) => violation.issue.rule,
        );
        expect(rules, `${jugxo.id}`).toEqual(jugxo.decision === "rejected" ? [name] : []);
      }
    },
  );

  it("keeps visible strings out of the Skemo: labels live only in Jugxo examples", () => {
    const text = JSON.stringify(butono?.skemo);
    expect(text).not.toMatch(/Speichern|Löschen|Abbrechen|Save|Delete|Cancel/);
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
