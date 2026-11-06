// Spec 038 MG-3/MG-4 (1.3, 1.4, 1.8a; D-28 as resolved by D-31): get_ero with `fields` – the parts
// of an Ero an agent asks for (brief, role, navigation, slots), each answer below 750 tokens;
// what no longer fits stands in `rest` and comes with one follow-up call. Without `fields` get_ero
// answers as before (guarded byte by byte in packages/mcp/src/kontrakto-038.test.ts).

import { describe, expect, it } from "vitest";
import type { LoadedEro, Modelo } from "../contracts/modelo.js";
import type { Lingvo } from "../lingvo/tradukoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { ERO_FIELDS, getEro, navigationOf, slotsOf } from "./eroj.js";
import { getSxablono } from "./sxablonoj.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;

/** The counter of eroj.test.ts: JSON length / 3, rounded up. The spec fixes the ceiling. */
const tokens = (answer: unknown): number => Math.ceil(JSON.stringify(answer).length / 3);
const CEILING = 750;

/** The four fields as the spec names them, and the order in which an answer is filled (D-28). */
const FIELDS = ["brief", "slots", "role", "navigation"];
const FILL_ORDER = ["brief", "role", "navigation", "slots"];

/** Every non-empty subset of the four fields, each in the order the spec names them. */
function subsets(): string[][] {
  const all: string[][] = [];
  for (let mask = 1; mask < 2 ** FIELDS.length; mask += 1) {
    all.push(FIELDS.filter((_field, index) => (mask & (2 ** index)) !== 0));
  }
  return all;
}

type Answer = Record<string, unknown>;

function entryNamed(name: string): LoadedEro {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === name);
  if (entry === undefined) throw new Error(`the repository Modelo has no ${name}`);
  return entry;
}

function brief(name: string, lingvo?: Lingvo): Answer {
  const result = getEro(modelo, { name, brief: true, ...(lingvo === undefined ? {} : { lingvo }) });
  if (!result.ok) throw new Error(`get_ero ${name} brief failed`);
  return result.output as unknown as Answer;
}

function answer(name: string, fields: readonly string[], lingvo?: Lingvo): Answer {
  const result = getEro(modelo, { name, fields, ...(lingvo === undefined ? {} : { lingvo }) });
  if (!result.ok) throw new Error(`get_ero ${name} ${fields.join("+")} failed`);
  return result.output as unknown as Answer;
}

/** The link target as the oracle reads it from the Skemo (Spec 037 D-81/D-127). */
function expectedTarget(entry: LoadedEro): string | undefined {
  if (entry.skemo.a11y.role !== "link") return undefined;
  const targets = entry.skemo.props.filter(
    (prop) => prop.kind === "string" && prop.required === true,
  );
  return targets.length === 1 ? targets[0]?.name : undefined;
}

/**
 * What is wrong with one answer to one request (empty when nothing): the size, the partition of
 * the requested fields into delivered and rest, and each delivered field as §2.2 defines it.
 */
function answerViolations(
  entry: LoadedEro,
  fields: readonly string[],
  out: Answer,
  briefOutput: Answer,
): string[] {
  const violations: string[] = [];
  const size = tokens(out);
  if (size >= CEILING) violations.push(`${size} tokens`);
  const rest = out.rest;
  if (rest !== undefined && (!Array.isArray(rest) || rest.length === 0)) {
    violations.push(`rest is ${JSON.stringify(rest)}`);
  }
  const restList = Array.isArray(rest) ? (rest as string[]) : [];
  if (new Set(restList).size !== restList.length) violations.push("a field twice in rest");
  for (const field of restList) {
    if (!fields.includes(field)) violations.push(`rest names ${field}, which was not requested`);
  }
  const inOrder = FILL_ORDER.filter((field) => restList.includes(field));
  if (JSON.stringify(inOrder) !== JSON.stringify(restList))
    violations.push("rest not in fill order");
  const delivered = new Set(fields.filter((field) => !restList.includes(field)));

  if (out.ero !== entry.ero.name) violations.push(`ero is ${JSON.stringify(out.ero)}`);
  const briefKeys = Object.keys(briefOutput);
  const keys = Object.keys(out);
  if (delivered.has("brief")) {
    if (JSON.stringify(keys.slice(0, briefKeys.length)) !== JSON.stringify(briefKeys)) {
      violations.push("the brief's keys do not lead the answer in their order");
    }
    for (const key of briefKeys) {
      if (JSON.stringify(out[key]) !== JSON.stringify(briefOutput[key])) {
        violations.push(`brief key ${key} differs from brief: true`);
      }
    }
  }
  const tail = keys.slice(delivered.has("brief") ? briefKeys.length : 1);
  const allowedTail = ["role", "navigation", "slots", "rest"];
  const tailInOrder = allowedTail.filter((key) => tail.includes(key));
  if (JSON.stringify(tail) !== JSON.stringify(tailInOrder)) {
    violations.push(`keys after the brief: ${tail.join(",")}`);
  }

  if (delivered.has("role")) {
    if (out.role !== entry.skemo.a11y.role) violations.push(`role ${JSON.stringify(out.role)}`);
  } else if ("role" in out) violations.push("role without being delivered");

  const target = expectedTarget(entry);
  if (delivered.has("navigation") && target !== undefined) {
    if (JSON.stringify(out.navigation) !== JSON.stringify({ target })) {
      violations.push(`navigation ${JSON.stringify(out.navigation)}`);
    }
  } else if ("navigation" in out) violations.push("navigation without a link target");

  if (delivered.has("slots")) {
    const slots = out.slots;
    const names = entry.skemo.slots.map((slot) => slot.name);
    if (typeof slots !== "object" || slots === null) violations.push("slots missing");
    else if (JSON.stringify(Object.keys(slots)) !== JSON.stringify(names)) {
      violations.push(`slot names ${Object.keys(slots).join(",")}`);
    }
  } else if ("slots" in out) violations.push("slots without being delivered");
  return violations;
}

describe("get_ero with fields: shape and order (MG-3, D-31)", () => {
  it("names the four fields the spec allows", () => {
    expect([...ERO_FIELDS]).toEqual(FIELDS);
  });

  it("answers flat: the brief's keys first, then role, navigation, slots – whatever order was asked", () => {
    const ligilo = answer("ligilo", ["slots", "navigation", "role", "brief"]);
    expect(Object.keys(ligilo)).toEqual([
      ...Object.keys(brief("ligilo")),
      "role",
      "navigation",
      "slots",
    ]);
    // Without the brief only the name of the Ero stands before the fields.
    expect(Object.keys(answer("ligilo", ["navigation", "slots", "role"]))).toEqual([
      "ero",
      "role",
      "navigation",
      "slots",
    ]);
    // Deterministic: the same request twice, the same bytes.
    expect(JSON.stringify(answer("ligilo", ["slots", "brief"]))).toBe(
      JSON.stringify(answer("ligilo", ["brief", "slots"])),
    );
  });

  it("fields: [brief] is byte-identical to brief: true for every Ero, in every language", () => {
    const differing: string[] = [];
    for (const entry of modelo.eroj) {
      for (const lingvo of [undefined, "de", "en"] as const) {
        const viaFields = JSON.stringify(answer(entry.ero.name, ["brief"], lingvo));
        if (viaFields !== JSON.stringify(brief(entry.ero.name, lingvo))) {
          differing.push(`${entry.ero.name} (${lingvo ?? "default"})`);
        }
      }
    }
    expect(differing).toEqual([]);
  });

  it("the brief within fields speaks the language asked for, as brief: true does", () => {
    const out = answer("butono", ["role", "brief"], "de");
    const german = brief("butono", "de");
    expect(out.purpose).toBe(german.purpose);
    expect(out.purpose).not.toBe(brief("butono").purpose);
  });
});

describe("get_ero with fields: role, navigation, slots (MG-3, MG-4)", () => {
  it("role is the ARIA role of the Skemo, for every Ero", () => {
    const differing = modelo.eroj
      .filter(
        (entry) =>
          JSON.stringify(answer(entry.ero.name, ["role"])) !==
          JSON.stringify({ ero: entry.ero.name, role: entry.skemo.a11y.role }),
      )
      .map((entry) => entry.ero.name);
    expect(differing).toEqual([]);
  });

  it("navigation names the target prop of every link Ero, read from the Skemo", () => {
    const links = modelo.eroj.filter((entry) => expectedTarget(entry) !== undefined);
    // The spec names them: the ligilo and the saltligilo carry their target in a prop.
    expect(links.map((entry) => entry.ero.name)).toEqual(
      expect.arrayContaining(["ligilo", "saltligilo"]),
    );
    const differing: string[] = [];
    for (const entry of links) {
      const target = expectedTarget(entry);
      const out = answer(entry.ero.name, ["navigation"]);
      if (JSON.stringify(out) !== JSON.stringify({ ero: entry.ero.name, navigation: { target } })) {
        differing.push(`${entry.ero.name}: ${JSON.stringify(out)}`);
      }
      if (JSON.stringify(navigationOf(entry)) !== JSON.stringify({ target })) {
        differing.push(`${entry.ero.name}: navigationOf`);
      }
    }
    expect(differing).toEqual([]);
  });

  it("navigation is absent (not null, not in rest) for every Ero that is no link", () => {
    const offending: string[] = [];
    for (const entry of modelo.eroj) {
      if (expectedTarget(entry) !== undefined) continue;
      const out = answer(entry.ero.name, ["navigation"]);
      if (JSON.stringify(out) !== JSON.stringify({ ero: entry.ero.name })) {
        offending.push(`${entry.ero.name}: ${JSON.stringify(out)}`);
      }
      if (navigationOf(entry) !== undefined) offending.push(`${entry.ero.name}: navigationOf`);
    }
    expect(offending).toEqual([]);
    expect(answer("butono", ["navigation", "role"])).toEqual({
      ero: "butono",
      role: entryNamed("butono").skemo.a11y.role,
    });
  });

  it("navigationOf names no target for a link with two or no required string props, or for no link", () => {
    const ligilo = entryNamed("ligilo");
    const second = { name: "second", kind: "string" as const, required: true };
    expect(
      navigationOf({ skemo: { ...ligilo.skemo, props: [...ligilo.skemo.props, second] } }),
    ).toBeUndefined();
    expect(
      navigationOf({
        skemo: {
          ...ligilo.skemo,
          props: ligilo.skemo.props.map(({ required: _required, ...prop }) => prop),
        },
      }),
    ).toBeUndefined();
    expect(
      navigationOf({ skemo: { ...ligilo.skemo, a11y: { ...ligilo.skemo.a11y, role: "button" } } }),
    ).toBeUndefined();
  });

  it("slots: every slot of the Skemo, with what its Uzo lets in, its duty and its counts", () => {
    const offending: string[] = [];
    for (const entry of modelo.eroj) {
      const out = answer(entry.ero.name, ["slots"]);
      const slots = out.slots as Record<string, Record<string, unknown>>;
      if (JSON.stringify(slots) !== JSON.stringify(slotsOf(entry))) {
        offending.push(`${entry.ero.name}: answer and slotsOf differ`);
      }
      const names = entry.skemo.slots.map((slot) => slot.name);
      if (JSON.stringify(Object.keys(slots)) !== JSON.stringify(names)) {
        offending.push(`${entry.ero.name}: slot names ${Object.keys(slots).join(",")}`);
        continue;
      }
      for (const skemoSlot of entry.skemo.slots) {
        const rule = entry.uzo?.slots[skemoSlot.name];
        const slot = slots[skemoSlot.name] ?? {};
        const at = `${entry.ero.name}.${skemoSlot.name}`;
        // The content flattened back: kinds as written, every named Ero in Uzo order.
        const content = (slot.content as unknown[]) ?? [];
        const flat = content.flatMap((item) => {
          if (typeof item === "string") return [item];
          if (typeof item === "object" && item !== null && "ero" in item) return [item.ero];
          if (typeof item === "object" && item !== null && "eroj" in item) {
            const eroj = item.eroj as string[];
            if (eroj.length < 2) offending.push(`${at}: eroj with fewer than two`);
            return eroj;
          }
          offending.push(`${at}: content ${JSON.stringify(item)}`);
          return [];
        });
        const expected = rule?.accepts ?? (skemoSlot.text === true ? ["text"] : []);
        if (JSON.stringify(flat) !== JSON.stringify(expected)) {
          offending.push(`${at}: content ${JSON.stringify(content)}`);
        }
        if ((slot.required === true) !== (rule?.required === true))
          offending.push(`${at}: required`);
        if ((slot.default === true) !== (skemoSlot.default === true))
          offending.push(`${at}: default`);
        if (slot.min !== rule?.min) offending.push(`${at}: min`);
        if (slot.max !== rule?.max) offending.push(`${at}: max`);
        // D-38: a data form only where the data carries one; no Skemo or Uzo carries one yet.
        if ("dataForm" in slot) offending.push(`${at}: dataForm without data`);
      }
    }
    expect(offending).toEqual([]);
  });

  it("slots is empty for an Ero without slots, and names a single Ero as ero, several as eroj", () => {
    const without = modelo.eroj.filter((entry) => entry.skemo.slots.length === 0);
    expect(without.length).toBeGreaterThan(0);
    expect(
      without.filter((entry) => JSON.stringify(answer(entry.ero.name, ["slots"]).slots) !== "{}"),
    ).toEqual([]);
    const butono = slotsOf(entryNamed("butono"));
    const iconStart = entryNamed("butono").uzo?.slots["icon-start"]?.accepts ?? [];
    expect(butono["icon-start"]?.content).toEqual(
      iconStart.map((accepted) =>
        modelo.eroj.some((entry) => entry.ero.name === accepted) ? { ero: accepted } : accepted,
      ),
    );
    const dialogo = entryNamed("dialogo");
    const content = dialogo.uzo?.slots.content?.accepts ?? [];
    expect(content.length).toBeGreaterThan(1);
    expect(slotsOf(dialogo).content?.content).toEqual([{ eroj: content }]);
  });
});

describe("get_ero with fields: the 750-token sweep and rest (1.8a, AC-L5, D-28, D-31)", () => {
  it("there are 15 non-empty subsets of the four fields", () => {
    expect(subsets()).toHaveLength(2 ** 4 - 1);
  });

  it("every Ero × every subset: below 750, delivered ∪ rest = requested, disjoint, each field as defined", () => {
    const violations: string[] = [];
    let answers = 0;
    for (const entry of modelo.eroj) {
      const briefOutput = brief(entry.ero.name);
      for (const fields of subsets()) {
        answers += 1;
        const out = answer(entry.ero.name, fields);
        for (const violation of answerViolations(entry, fields, out, briefOutput)) {
          violations.push(`${entry.ero.name} [${fields.join(",")}]: ${violation}`);
        }
      }
    }
    expect(answers).toBe(modelo.eroj.length * subsets().length);
    expect(violations).toEqual([]);
  });

  it("every rest comes with one follow-up: fields: rest answers below 750 and has no rest", () => {
    const violations: string[] = [];
    let followUps = 0;
    for (const entry of modelo.eroj) {
      const briefOutput = brief(entry.ero.name);
      for (const fields of subsets()) {
        const rest = answer(entry.ero.name, fields).rest as string[] | undefined;
        if (rest === undefined) continue;
        followUps += 1;
        const follow = answer(entry.ero.name, rest);
        const at = `${entry.ero.name} [${fields.join(",")}] → [${rest.join(",")}]`;
        if ("rest" in follow) violations.push(`${at}: rest ${JSON.stringify(follow.rest)}`);
        for (const violation of answerViolations(entry, rest, follow, briefOutput)) {
          violations.push(`${at}: ${violation}`);
        }
      }
    }
    // The kampo's brief (747 of 750) leaves no room for a second field: at least its rests.
    expect(followUps).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });

  it("kampo with brief and slots: slots delivered, brief in rest; the follow-up is the brief", () => {
    const out = answer("kampo", ["brief", "slots"]);
    expect(out.rest).toEqual(["brief"]);
    expect(Object.keys(out)).toEqual(["ero", "slots", "rest"]);
    expect(out.slots).toEqual(slotsOf(entryNamed("kampo")));
    expect(tokens(out)).toBeLessThan(CEILING);
    // Nested as { ero, brief } or flat with a rest the brief would not fit (D-31: 755 and 752).
    expect(tokens({ ...brief("kampo"), rest: ["slots"] })).toBeGreaterThanOrEqual(CEILING);
    const follow = answer("kampo", out.rest as string[]);
    expect(follow.rest).toBeUndefined();
    expect(JSON.stringify(follow)).toBe(JSON.stringify(brief("kampo")));
    expect(tokens(follow)).toBeLessThan(CEILING);
  });

  it("the brief of every Sxablono stays below 750, in every language", () => {
    const sxablonoj = modelo.sxablonoj ?? [];
    expect(sxablonoj.length).toBeGreaterThan(0);
    const sizes: string[] = [];
    let checked = 0;
    for (const entry of sxablonoj) {
      for (const lingvo of [undefined, "de", "en"] as const) {
        const result = getSxablono(modelo, {
          name: entry.sxablono.name,
          brief: true,
          ...(lingvo === undefined ? {} : { lingvo }),
        });
        if (!result.ok) throw new Error(`get_sxablono ${entry.sxablono.name} failed`);
        checked += 1;
        const size = tokens(result.output);
        if (size >= CEILING) sizes.push(`${entry.sxablono.name} (${lingvo ?? "default"}): ${size}`);
      }
    }
    expect(checked).toBe(sxablonoj.length * 3);
    expect(sizes).toEqual([]);
  });

  it("in German the partition holds and every rest ends with one follow-up; only a brief that already reaches 750 as brief: true is delivered alone above it", () => {
    const violations: string[] = [];
    for (const entry of modelo.eroj) {
      const name = entry.ero.name;
      const briefOutput = brief(name, "de");
      const briefOversize = tokens(briefOutput) >= CEILING;
      for (const fields of subsets()) {
        const out = answer(name, fields, "de");
        const rest = out.rest as string[] | undefined;
        const found = answerViolations(entry, fields, out, briefOutput).filter(
          // The one known excess (finding of S038-02): the German brief alone, as brief: true has it.
          (violation) =>
            !(
              briefOversize &&
              /^\d+ tokens$/.test(violation) &&
              JSON.stringify(out) === JSON.stringify(briefOutput)
            ),
        );
        for (const violation of found)
          violations.push(`${name} [${fields.join(",")}]: ${violation}`);
        if (rest === undefined) continue;
        const follow = answer(name, rest, "de");
        if ("rest" in follow) violations.push(`${name} [${fields.join(",")}]: follow-up rest`);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("get_ero with fields: refused input (structured, never ignored)", () => {
  const ruleAndPath = (result: ReturnType<typeof getEro>) =>
    result.ok ? [] : result.issues.map(({ rule, path }) => ({ rule, path }));

  it("an unknown field: ero-field-unknown at its index, the four fields allowed", () => {
    const result = getEro(modelo, { name: "butono", fields: ["brief", "colour", "role", "x"] });
    expect(result.ok).toBe(false);
    expect(ruleAndPath(result)).toEqual([
      { rule: "ero-field-unknown", path: "get_ero/fields/1" },
      { rule: "ero-field-unknown", path: "get_ero/fields/3" },
    ]);
    expect(result.ok ? undefined : result.allowed).toEqual(FIELDS);
  });

  it("fields together with brief: true, an empty list and a field twice are refused at fields", () => {
    expect(ruleAndPath(getEro(modelo, { name: "butono", fields: ["role"], brief: true }))).toEqual([
      { rule: "ero-fields-invalid", path: "get_ero/fields" },
    ]);
    expect(ruleAndPath(getEro(modelo, { name: "butono", fields: [] }))).toEqual([
      { rule: "ero-fields-invalid", path: "get_ero/fields" },
    ]);
    expect(
      ruleAndPath(getEro(modelo, { name: "butono", fields: ["role", "slots", "role"] })),
    ).toEqual([{ rule: "ero-fields-invalid", path: "get_ero/fields/2" }]);
  });

  it("an unknown Ero with fields is refused as without them", () => {
    const result = getEro(modelo, { name: "butonoo", fields: ["role"] });
    const without = getEro(modelo, { name: "butonoo" });
    expect(ruleAndPath(result)).toEqual([{ rule: "ero-unknown", path: "get_ero/name" }]);
    expect(result).toEqual(without);
  });

  it("brief: false with fields answers the fields", () => {
    expect(getEro(modelo, { name: "butono", fields: ["role"], brief: false })).toEqual({
      ok: true,
      output: { ero: "butono", role: entryNamed("butono").skemo.a11y.role },
    });
  });
});
