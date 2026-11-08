// Spec 038 MG-1 (1.1, V-1 list_arangxoj): the layout means a screen arranges with – the Sxablonoj
// and their regions, the Eroj whose goal is a layout purpose, the spacing steps as token paths –
// without a single value; what is missing stands in `mankoj` (Manko for Eroj-Runde 7). Everything
// derived from the Modelo; the tests read the Modelo too and type no list of tokens or Eroj.

import { describe, expect, it } from "vitest";
import type { LoadedEro, LoadedSxablono, Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import * as gvidanto from "./index.js";
import { markerOf } from "./sxablonoj.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;
const sxablonoj: LoadedSxablono[] = modelo.sxablonoj ?? [];

type Answer = Record<string, unknown>;
type Entry = {
  name: string;
  label?: string;
  kind: string;
  celo: string;
  props: Answer[];
  example: string;
};
type Output = {
  arangxoj: Entry[];
  interspacoj: { token: string }[];
  mankoj: { celo: string; propono: string }[];
};

/** listArangxoj through the Gvidanto's index (one export line, Spec 038 S038-04). */
function arangxoj(of: Modelo, input: { lingvo?: "de" | "en" } = {}): Output {
  const list = (gvidanto as Record<string, unknown>).listArangxoj as (
    modelo: Modelo,
    input: { lingvo?: "de" | "en" },
  ) => Output;
  return list(of, input);
}

/** The layout purposes the answer checks (exported beside listArangxoj, not typed here). */
function celoj(): readonly string[] {
  return (gvidanto as Record<string, unknown>).ARANGXO_CELOJ as readonly string[];
}

const coreTokens = () => modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};

/** Every key path in a JSON value whose key is one of `names`. */
function keysNamed(value: unknown, names: readonly string[], path = ""): string[] {
  if (Array.isArray(value))
    return value.flatMap((item, index) => keysNamed(item, names, `${path}/${index}`));
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, item]) => [
    ...(names.includes(key) ? [`${path}/${key}`] : []),
    ...keysNamed(item, names, `${path}/${key}`),
  ]);
}

/** Every string in a JSON value, with its path. */
function stringsOf(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, index) => stringsOf(item, `${path}/${index}`));
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, item]) => stringsOf(item, `${path}/${key}`));
}

/** The Modelo with one Ero more, whose only goal is named `goal`. */
/**
 * Spec 046 T1 (Ausnahme): the Modelo without the layout Eroj of Eroj-Runde 7. The two tests below
 * check the answer for a layout purpose without a means; on the repo Modelo there is none left
 * once vico, kolumno, stako and krado exist, so they run on the Modelo without those four.
 */
const LAYOUT_EROJ: readonly string[] = ["vico", "kolumno", "stako", "krado"];
const withoutLayout: Modelo = {
  ...modelo,
  eroj: modelo.eroj.filter((entry) => !LAYOUT_EROJ.includes(entry.ero.name)),
};

function withGoalEro(goal: string): Modelo {
  const base = modelo.eroj[0] as LoadedEro;
  const added: LoadedEro = {
    ...base,
    ero: { ...base.ero, name: `provo-${goal}` },
    skemo: { ...base.skemo, goals: [{ goal, keywords: { en: [goal] }, props: {} }] },
  };
  return { ...withoutLayout, eroj: [...withoutLayout.eroj, added] };
}

describe("listArangxoj (Spec 038 MG-1)", () => {
  it("is exported by the Gvidanto with its vocabulary of layout purposes", () => {
    expect(typeof (gvidanto as Record<string, unknown>).listArangxoj).toBe("function");
    expect(Array.isArray(celoj())).toBe(true);
    expect(celoj().length).toBeGreaterThan(0);
    expect(new Set(celoj()).size).toBe(celoj().length);
  });

  it("lists every Sxablono, then each of its regions, in the order of the Modelo", () => {
    expect(sxablonoj.length).toBeGreaterThan(0);
    const output = arangxoj(modelo);
    const expected: [string, string][] = [];
    for (const entry of sxablonoj) {
      expected.push(["sxablono", entry.sxablono.name]);
      for (const region of entry.skemo.regions)
        expected.push(["regiono", `${entry.sxablono.name}/${region.name}`]);
    }
    const listed = output.arangxoj
      .filter((item) => item.kind === "sxablono" || item.kind === "regiono")
      .map((item): [string, string] => [item.kind, item.name]);
    expect(listed).toEqual(expected);
  });

  it("gives each entry name, kind, celo, props and a brand-free example in a fixed key order", () => {
    const output = arangxoj(modelo);
    expect(Object.keys(output)).toEqual(["arangxoj", "interspacoj", "mankoj"]);
    const brands = modelo.aspektoPackages
      .flatMap((pkg) => [pkg.aspekto, pkg.namespace])
      .filter((name): name is string => typeof name === "string" && name.length > 0)
      .map((name) => name.toLowerCase());
    expect(brands.length).toBeGreaterThan(0);
    const violations: string[] = [];
    for (const item of output.arangxoj) {
      const at = `${item.kind} ${item.name}`;
      if (
        JSON.stringify(Object.keys(item)) !==
        JSON.stringify(["name", "kind", "celo", "props", "example"])
      )
        violations.push(`${at}: keys ${Object.keys(item).join(",")}`);
      if (!celoj().includes(item.celo)) violations.push(`${at}: celo ${item.celo} unknown`);
      if (!Array.isArray(item.props)) violations.push(`${at}: props no list`);
      if (typeof item.example !== "string" || item.example.length === 0)
        violations.push(`${at}: no example`);
      for (const brand of brands)
        if (item.example.toLowerCase().includes(brand)) violations.push(`${at}: brand ${brand}`);
      for (const prop of item.props)
        if (typeof prop.name !== "string") violations.push(`${at}: prop without name`);
    }
    expect(violations).toEqual([]);
  });

  it("names a Sxablono with its props (kind, values, required) and a minimal example of it", () => {
    const output = arangxoj(modelo);
    const violations: string[] = [];
    for (const entry of sxablonoj) {
      const name = entry.sxablono.name;
      const item = output.arangxoj.find((each) => each.kind === "sxablono" && each.name === name);
      if (item === undefined) {
        violations.push(`${name}: missing`);
        continue;
      }
      const props = entry.skemo.props.map((prop) => ({
        name: prop.name,
        kind: prop.kind,
        ...(prop.values === undefined ? {} : { values: [...prop.values] }),
        ...(prop.required === true ? { required: true } : {}),
      }));
      if (JSON.stringify(item.props) !== JSON.stringify(props))
        violations.push(`${name}: props ${JSON.stringify(item.props)}`);
      if (!item.example.startsWith(`<fm-${name}`) || !item.example.endsWith(`</fm-${name}>`))
        violations.push(`${name}: example ${item.example}`);
      for (const prop of entry.skemo.props.filter((each) => each.required === true))
        if (!item.example.includes(` ${prop.name}`))
          violations.push(`${name}: required prop ${prop.name} not in the example`);
      // Every required region stands in the example as its region entry shows it.
      for (const region of entry.skemo.regions.filter((each) => each.required === true)) {
        const regionItem = output.arangxoj.find(
          (each) => each.kind === "regiono" && each.name === `${name}/${region.name}`,
        );
        if (regionItem === undefined || !item.example.includes(regionItem.example))
          violations.push(`${name}: required region ${region.name} not in the example`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("shows a region by the marker of its Sxablono and an Ero it accepts, with the props it asks", () => {
    const output = arangxoj(modelo);
    const named = new Set([
      ...modelo.eroj.map((entry) => entry.ero.name),
      ...sxablonoj.map((entry) => entry.sxablono.name),
    ]);
    const violations: string[] = [];
    let checked = 0;
    for (const entry of sxablonoj) {
      for (const region of entry.skemo.regions) {
        const at = `${entry.sxablono.name}/${region.name}`;
        const item = output.arangxoj.find((each) => each.kind === "regiono" && each.name === at);
        if (item === undefined) {
          violations.push(`${at}: missing`);
          continue;
        }
        checked += 1;
        if (item.celo !== "region") violations.push(`${at}: celo ${item.celo}`);
        const marker = markerOf(modelo, entry, region);
        const child = (region.accepts ?? []).find((name) => named.has(name));
        if (child !== undefined) {
          if (!item.example.startsWith(`<fm-${child} slot="${marker.slot}"`))
            violations.push(`${at}: example ${item.example}`);
        } else if (marker.default !== true && !item.example.includes(`slot="${marker.slot}"`)) {
          violations.push(`${at}: example without slot ${item.example}`);
        }
        // The props every child must carry, and the one child's props, with their values.
        const asked = [
          ...Object.entries(region.props ?? {}).map(([name, value]) => ({
            name,
            values: [value],
            required: true,
          })),
          ...Object.entries(region.one ?? {}).map(([name, value]) => ({ name, values: [value] })),
        ];
        if (JSON.stringify(item.props) !== JSON.stringify(asked))
          violations.push(`${at}: props ${JSON.stringify(item.props)}`);
        for (const prop of asked) {
          const value = prop.values[0];
          const written = value === true ? ` ${prop.name}` : ` ${prop.name}="${String(value)}"`;
          if (child !== undefined && !item.example.includes(written))
            violations.push(`${at}: ${written.trim()} not in the example`);
        }
      }
    }
    expect(checked).toBe(sxablonoj.reduce((sum, entry) => sum + entry.skemo.regions.length, 0));
    expect(violations).toEqual([]);
  });

  it("names the spacing steps as token paths of the core set, in its order, without values", () => {
    const output = arangxoj(modelo);
    const core = coreTokens();
    expect(output.interspacoj.length).toBeGreaterThan(0);
    const violations: string[] = [];
    for (const item of output.interspacoj) {
      if (JSON.stringify(Object.keys(item)) !== JSON.stringify(["token"]))
        violations.push(`${item.token}: keys ${Object.keys(item).join(",")}`);
      const token = core[item.token];
      if (token === undefined) violations.push(`${item.token}: not in the core set`);
      else if (token.type !== "dimension") violations.push(`${item.token}: type ${token.type}`);
    }
    expect(violations).toEqual([]);
    const names = output.interspacoj.map((item) => item.token);
    expect(new Set(names).size).toBe(names.length);
    // In the order the core set declares them.
    const order = Object.keys(core);
    expect([...names].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(names);
    // One group of steps, each a direct token of it (the scale beneath is no step).
    const groups = new Set(names.map((name) => name.split(".").slice(0, -1).join(".")));
    expect(groups.size).toBe(1);
    const [group] = [...groups];
    const steps = order.filter(
      (name) =>
        name.startsWith(`${group}.`) &&
        name.split(".").length === names[0]?.split(".").length &&
        core[name]?.type === "dimension",
    );
    expect(names).toEqual(steps);
  });

  it("writes no resolved value anywhere: no value key, no alias, no unit, no colour", () => {
    for (const lingvo of [undefined, "de", "en"] as const) {
      const output = arangxoj(modelo, lingvo === undefined ? {} : { lingvo });
      expect(keysNamed(output, ["value", "$value", "$type", "resolved"])).toEqual([]);
      const leaks = stringsOf(output).filter(
        ([, text]) =>
          /\{[a-z][\w.-]*\}/i.test(text) ||
          /\b\d+(\.\d+)?(px|rem|em|ms|%)(?![\w-])/i.test(text) ||
          /#[0-9a-f]{3,8}\b/i.test(text),
      );
      expect(leaks).toEqual([]);
    }
  });

  it("names every layout purpose without a means in mankoj, each with a proposal (Eroj-Runde 7)", () => {
    const output = arangxoj(withoutLayout);
    expect(output.mankoj.length).toBeGreaterThan(0);
    const violations: string[] = [];
    for (const manko of output.mankoj) {
      if (JSON.stringify(Object.keys(manko)) !== JSON.stringify(["celo", "propono"]))
        violations.push(`${manko.celo}: keys ${Object.keys(manko).join(",")}`);
      if (!celoj().includes(manko.celo)) violations.push(`${manko.celo}: unknown purpose`);
      if (typeof manko.propono !== "string" || manko.propono.length === 0)
        violations.push(`${manko.celo}: no propono`);
      if (output.arangxoj.some((item) => item.celo === manko.celo))
        violations.push(`${manko.celo}: a means exists`);
    }
    expect(violations).toEqual([]);
    // Every purpose is answered or a Manko, nothing in between; mankoj in the vocabulary's order.
    const answered = new Set(output.arangxoj.map((item) => item.celo));
    if (output.interspacoj.length > 0) answered.add("spacing");
    expect(output.mankoj.map((manko) => manko.celo)).toEqual(
      celoj().filter((celo) => !answered.has(celo)),
    );
    // This Modelo has Sxablonoj and spacing steps: regions and spacing are no Manko.
    expect(output.mankoj.map((manko) => manko.celo)).not.toContain("region");
    expect(output.mankoj.map((manko) => manko.celo)).not.toContain("spacing");
  });

  it("without Sxablonoj and without spacing steps names regions and spacing as mankoj", () => {
    const steps = new Set(arangxoj(modelo).interspacoj.map((item) => item.token));
    const bare: Modelo = {
      ...modelo,
      sxablonoj: [],
      setoj: modelo.setoj.map((set) =>
        set.name === "core"
          ? {
              ...set,
              tokens: Object.fromEntries(
                Object.entries(set.tokens).filter(([name]) => !steps.has(name)),
              ),
            }
          : set,
      ),
    };
    const output = arangxoj(bare);
    expect(output.arangxoj.filter((item) => item.kind !== "ero")).toEqual([]);
    expect(output.interspacoj).toEqual([]);
    const missing = output.mankoj.map((manko) => manko.celo);
    expect(missing).toContain("region");
    expect(missing).toContain("spacing");
    expect(missing).toEqual(celoj().filter((celo) => missing.includes(celo)));
    // Without Sxablonoj (absent rather than empty) the same.
    const { sxablonoj: _absent, ...withoutKey } = bare;
    expect(arangxoj(withoutKey as Modelo)).toEqual(output);
  });

  it("lists an Ero whose goal is a missing layout purpose, and that purpose is no Manko then", () => {
    const missing = arangxoj(withoutLayout).mankoj.map((manko) => manko.celo);
    expect(missing.length).toBeGreaterThan(0);
    for (const celo of missing) {
      const output = arangxoj(withGoalEro(celo));
      const added = output.arangxoj.filter((item) => item.kind === "ero");
      expect(added.map((item) => [item.name, item.celo])).toEqual([[`provo-${celo}`, celo]]);
      expect(added[0]?.example.startsWith(`<fm-provo-${celo}`)).toBe(true);
      expect(output.mankoj.map((manko) => manko.celo)).toEqual(
        missing.filter((each) => each !== celo),
      );
    }
  });

  it("answers the same twice, and with lingvo only adds the display name beside a name", () => {
    expect(JSON.stringify(arangxoj(modelo))).toBe(JSON.stringify(arangxoj(modelo)));
    const plain = arangxoj(modelo);
    for (const lingvo of ["de", "en"] as const) {
      const output = arangxoj(modelo, { lingvo });
      expect(JSON.stringify(arangxoj(modelo, { lingvo }))).toBe(JSON.stringify(output));
      const violations: string[] = [];
      output.arangxoj.forEach((item, index) => {
        const { label, ...rest } = item;
        if (JSON.stringify(rest) !== JSON.stringify(plain.arangxoj[index]))
          violations.push(`${item.name}: differs beyond label`);
        const labelled = item.kind === "sxablono" || item.kind === "ero";
        if (labelled !== (typeof label === "string"))
          violations.push(`${item.name}: label ${String(label)}`);
        if (labelled && JSON.stringify(Object.keys(item).slice(0, 2)) !== '["name","label"]')
          violations.push(`${item.name}: label not beside the name`);
      });
      expect(violations).toEqual([]);
      expect(output.interspacoj).toEqual(plain.interspacoj);
      expect(output.mankoj).toEqual(plain.mankoj);
    }
  });
});

describe("listArangxoj on the repo Modelo with the layout Eroj (Spec 046 T1)", () => {
  // The Eroj of Eroj-Runde 7 named by their Skemo goal: row by vico, column by kolumno, stack by
  // stako. The test reads the answer of the real Modelo; the spacing step comes from interspacoj.
  const expected: [string, string][] = [
    ["vico", "row"],
    ["kolumno", "column"],
    ["stako", "stack"],
  ];

  it("answers row, column and stack with an Ero each; mankoj names none of them", () => {
    const output = arangxoj(modelo);
    const eroj = output.arangxoj.filter((item) => item.kind === "ero");
    for (const [name, celo] of expected) {
      expect(eroj.filter((item) => item.name === name).map((item) => item.celo)).toEqual([celo]);
    }
    const missing = output.mankoj.map((manko) => manko.celo);
    expect(missing).not.toContain("row");
    expect(missing).not.toContain("column");
    expect(missing).not.toContain("stack");
  });

  it("gives every layout Ero example markup with a gap from the spacing steps", () => {
    const output = arangxoj(modelo);
    const steps = output.interspacoj.map((item) => item.token);
    expect(steps.length).toBeGreaterThan(0);
    for (const [name] of expected) {
      const entry = output.arangxoj.find((item) => item.kind === "ero" && item.name === name);
      const gap = entry?.example.match(/^<fm-([a-z]+) gap="([a-z]+)"><\/fm-\1>$/);
      expect(gap?.[1]).toBe(name);
      expect(steps).toContain(`spacing.${gap?.[2] ?? ""}`);
      // The gap prop takes exactly the spacing steps, by their last name.
      const prop = entry?.props.find((item) => item.name === "gap");
      expect(prop?.values).toEqual(steps.map((token) => token.split(".").at(-1)));
    }
  });
});
