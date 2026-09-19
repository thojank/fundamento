// Figma Celo (Spec 003, FR-09, plan D-12, contracts/projekcioj §5). `plan.json` is a pure
// description of what Figma should hold: one variable collection per Dimensio (its modes are the
// Dimensio's values) plus the single-mode collection `fundamento` for everything no Dimensio
// changes, and the component set of every Ero.
//
// The cascade: a token that several Dimensioj change lives in the collection of its highest
// priority Dimensio; each mode aliases a hidden helper variable in the next lower Dimensio's
// collection, down to literal values. Figma resolves each alias with the mode the frame has chosen
// for that collection, so every combination resolves exactly as the resolver does — which
// `resolveFigmaPlan` proves without Figma. Token aliases stay aliases, so late binding is kept.
// Pure.

import {
  boundToken,
  combinationsOf,
  type LoadedEro,
  type Modelo,
  nomRegulo,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";

/** A variable value: a literal, or an alias to another variable of the plan. */
export type FigmaValue = { alias: string } | string | number | FigmaColor | boolean;

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariable {
  name: string;
  type: "COLOR" | "FLOAT" | "STRING";
  /** Helper variables of the cascade are hidden from publishing. */
  hidden?: boolean;
  /** One entry per mode of the collection. */
  values: Record<string, FigmaValue>;
}

export interface FigmaCollection {
  name: string;
  modes: string[];
  variables: FigmaVariable[];
}

export interface FigmaComponentSet {
  set: string;
  properties: Record<string, string[] | "BOOLEAN" | "TEXT">;
  variants: { props: Record<string, string>; bindings: Record<string, string> }[];
  pluginData: { fundamento: { ero: string; skemo: string; version: string } };
}

export interface FigmaPlan {
  fundamento: string;
  collections: FigmaCollection[];
  components: FigmaComponentSet[];
}

/** The single-mode collection of everything no Dimensio changes, and its mode. */
const BASE_COLLECTION = "fundamento";
const BASE_MODE = "value";

/** Composite fields Figma gets as separate variables (Figma variables hold no composites). */
const COMPOSITE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  typography: ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight"],
  border: ["color", "width", "style"],
};

const ALIAS = /^\{([a-z0-9]+(?:\.[a-z0-9]+)*)\}$/;

const variableName = (token: string, field?: string) =>
  `${nomRegulo("figma").derive(token)}${field === undefined ? "" : `/${kebab(field)}`}`;

const kebab = (field: string) => field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function figmaColor(value: unknown): FigmaColor {
  const color = value as { components?: number[]; alpha?: number };
  const [r = 0, g = 0, b = 0] = color.components ?? [];
  return { r, g, b, a: color.alpha ?? 1 };
}

/** The Figma value of a token value of `type`, or an alias when the token aliases another. */
export function figmaValue(type: string, value: unknown, field?: string): FigmaValue {
  if (typeof value === "string") {
    const alias = ALIAS.exec(value);
    if (alias?.[1] !== undefined) return { alias: variableName(alias[1], field) };
  }
  switch (type) {
    case "color":
      return figmaColor(value);
    case "dimension":
    case "duration":
      return typeof value === "object" && value !== null ? (value as { value: number }).value : 0;
    case "number":
    case "fontWeight":
      return typeof value === "number" ? value : Number(value);
    case "fontFamily":
      return (Array.isArray(value) ? value : [value]).map(String).join(", ");
    case "cubicBezier":
      return Array.isArray(value) ? `cubic-bezier(${value.join(", ")})` : String(value);
    default:
      return typeof value === "number" ? value : String(value);
  }
}

/** Figma variable type of a token type (and field). */
export function figmaType(type: string, field?: string): FigmaVariable["type"] {
  const effective = field === undefined ? type : (FIELD_TYPES[field] ?? "dimension");
  switch (effective) {
    case "color":
      return "COLOR";
    case "dimension":
    case "duration":
    case "number":
    case "fontWeight":
      return "FLOAT";
    default:
      return "STRING";
  }
}

const FIELD_TYPES: Readonly<Record<string, string>> = {
  fontFamily: "fontFamily",
  fontSize: "dimension",
  fontWeight: "fontWeight",
  letterSpacing: "dimension",
  lineHeight: "number",
  color: "color",
  width: "dimension",
  style: "strokeStyle",
};

/** Every Figma variable of one token with its value: one, or one per field for composites. */
export function figmaValues(
  name: string,
  type: string,
  value: unknown,
): Record<string, FigmaValue> {
  const fields = COMPOSITE_FIELDS[type];
  if (fields === undefined) return { [variableName(name)]: figmaValue(type, value) };
  const alias = typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;
  const out: Record<string, FigmaValue> = {};
  for (const field of fields) {
    const property = variableName(name, field);
    out[property] =
      alias !== undefined
        ? { alias: variableName(alias, field) }
        : figmaValue(
            FIELD_TYPES[field] ?? "dimension",
            (value as Record<string, unknown>)?.[field],
          );
  }
  return out;
}

/** Dimensioj in priority order (ascending), as the collections follow them. */
function dimensiojOf(modelo: Modelo): { name: string; modes: string[] }[] {
  return modelo.dimensioj.map((dimensio) => ({
    name: dimensio.name,
    modes: (dimensio.valoroj ?? []).map((valoro) => valoro.name),
  }));
}

/** The Dimensioj whose sets define `token`, in priority order (ascending). */
function dimensiojOfToken(modelo: Modelo, token: string): string[] {
  const names = new Set<string>();
  for (const set of modelo.setoj) {
    if (set.tokens[token] === undefined) continue;
    for (const kondicxo of set.kondicxoj) names.add(kondicxo.dimensio);
  }
  return modelo.dimensioj.map((dimensio) => dimensio.name).filter((name) => names.has(name));
}

/** The token's definition in the combination of `assignment` (the last winning set). */
function definitionOf(modelo: Modelo, token: string, assignment: Record<string, string>): unknown {
  let value: unknown;
  for (const set of orderedSets(modelo)) {
    const active = set.kondicxoj.every(
      (kondicxo) => assignment[kondicxo.dimensio] === kondicxo.valoro,
    );
    if (active && set.tokens[token] !== undefined) value = set.tokens[token]?.value;
  }
  return value;
}

const orderedCache: WeakMap<Modelo, Modelo["setoj"]> = new WeakMap();
function orderedSets(modelo: Modelo): Modelo["setoj"] {
  const cached = orderedCache.get(modelo);
  if (cached !== undefined) return cached;
  const priority = (name: string) =>
    modelo.dimensioj.find((dimensio) => dimensio.name === name)?.priority ?? 0;
  const sorted = [...modelo.setoj].sort((a, b) => {
    const key = (set: Modelo["setoj"][number]) => [
      Math.max(0, ...set.kondicxoj.map((kondicxo) => priority(kondicxo.dimensio))),
      set.kondicxoj.length,
      set.name,
    ];
    const [ap, ac, an] = key(a);
    const [bp, bc, bn] = key(b);
    if (ap !== bp) return (ap as number) - (bp as number);
    if (ac !== bc) return (ac as number) - (bc as number);
    return (an as string) < (bn as string) ? -1 : 1;
  });
  orderedCache.set(modelo, sorted);
  return sorted;
}

/** Builds the variables of every token, including the hidden helpers of the cascade. */
function variablesOf(modelo: Modelo, input: CeloInput): Map<string, FigmaVariable[]> {
  const byCollection = new Map<string, FigmaVariable[]>();
  const add = (collection: string, variable: FigmaVariable) => {
    byCollection.set(collection, [...(byCollection.get(collection) ?? []), variable]);
  };
  const dimensioj = dimensiojOf(modelo);
  const modesOf = (name: string) => dimensioj.find((d) => d.name === name)?.modes ?? [];

  for (const token of input.modeloJson.tokens) {
    const dims = dimensiojOfToken(modelo, token.name);
    const fields = COMPOSITE_FIELDS[token.type];
    const names = fields === undefined ? [undefined] : [...fields];
    for (const field of names) {
      const name = variableName(token.name, field);
      const type = figmaType(token.type, field);
      // Depth 0: no Dimensio changes it, so one value in the base collection.
      if (dims.length === 0) {
        const value = definitionOf(modelo, token.name, {});
        add(BASE_COLLECTION, {
          name,
          type,
          hidden: false,
          values: { [BASE_MODE]: modeValue(token.type, value, field) },
        });
        continue;
      }
      // Depth n: the variable lives in the highest Dimensio, each mode aliasing the level below.
      const build = (level: number, suffix: string, chosen: Record<string, string>): void => {
        const dimensio = dims[level] ?? "";
        const variable: FigmaVariable = {
          name: `${name}${suffix}`,
          type,
          hidden: suffix !== "",
          values: {},
        };
        for (const mode of modesOf(dimensio)) {
          const assignment = { ...chosen, [dimensio]: mode };
          if (level === 0) {
            variable.values[mode] = modeValue(
              token.type,
              definitionOf(modelo, token.name, assignment),
              field,
            );
          } else {
            variable.values[mode] = { alias: `${name}${suffix}@${dimensio}=${mode}` };
            build(level - 1, `${suffix}@${dimensio}=${mode}`, assignment);
          }
        }
        add(dimensio, variable);
      };
      build(dims.length - 1, "", {});
    }
  }
  return byCollection;
}

function modeValue(type: string, value: unknown, field?: string): FigmaValue {
  const fields = COMPOSITE_FIELDS[type];
  if (fields === undefined || field === undefined) return figmaValue(type, value, field);
  const alias = typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;
  if (alias !== undefined) return { alias: variableName(alias, field) };
  return figmaValue(FIELD_TYPES[field] ?? "dimension", (value as Record<string, unknown>)?.[field]);
}

/** The component set of one Ero: every variant with its variable bindings (D-12). */
function componentSetOf(entry: LoadedEro, version: string): FigmaComponentSet {
  const skemo = entry.skemo;
  const properties: FigmaComponentSet["properties"] = {};
  for (const prop of skemo.props) {
    if (prop.kind === "enum") properties[prop.name] = [...(prop.values ?? [])];
    else if (prop.kind === "boolean") properties[prop.name] = "BOOLEAN";
    else properties[prop.name] = "TEXT";
  }
  properties.state = [...skemo.states];
  // Variants exist for what changes the appearance: the props the parts are keyed by, and state.
  // `type`, for example, is behaviour in a form and would only multiply the set.
  const keyed = new Set<string>();
  for (const partProperties of Object.values(skemo.parts)) {
    for (const source of Object.values(partProperties)) {
      if (source !== undefined && "by" in source) for (const key of source.by) keyed.add(key);
    }
  }
  const keys = [
    ...skemo.props
      .filter((prop) => prop.kind === "enum" && keyed.has(prop.name))
      .map((prop) => prop.name),
    "state",
  ];
  const variants = combinationsOf(skemo, keys).map((combination) => {
    const bindings: Record<string, string> = {};
    for (const [part, partProperties] of Object.entries(skemo.parts)) {
      for (const property of Object.keys(partProperties)) {
        const bound = boundToken(skemo, part, property, combination);
        if (bound !== undefined) bindings[`${part}.${property}`] = variableName(bound.token);
      }
    }
    return { props: { ...combination }, bindings };
  });
  return {
    set: entry.ero.name,
    properties,
    variants,
    pluginData: { fundamento: { ero: entry.ero.name, skemo: skemo.id, version } },
  };
}

/** Resolves the plan by Figma's mode rules: the proof that the projection matches the resolver. */
export function resolveFigmaPlan(
  plan: FigmaPlan,
  assignment: Readonly<Record<string, string>>,
): Record<string, FigmaValue> {
  const index = new Map<string, { collection: FigmaCollection; variable: FigmaVariable }>();
  for (const collection of plan.collections) {
    for (const variable of collection.variables) index.set(variable.name, { collection, variable });
  }
  const resolve = (name: string, depth = 0): FigmaValue => {
    if (depth > 32) throw new Error(`Alias cycle at ${name}`);
    const found = index.get(name);
    if (found === undefined) throw new Error(`Unknown variable ${name}`);
    const mode =
      found.collection.name === BASE_COLLECTION
        ? BASE_MODE
        : (assignment[found.collection.name] ?? found.collection.modes[0] ?? "");
    const value = found.variable.values[mode];
    if (value === undefined) throw new Error(`${name} has no value for mode ${mode}`);
    return typeof value === "object" && value !== null && "alias" in value
      ? resolve(value.alias, depth + 1)
      : value;
  };
  const resolved: Record<string, FigmaValue> = {};
  for (const [name, entry] of index) {
    if (entry.variable.hidden === true) continue;
    resolved[name] = resolve(name);
  }
  return resolved;
}

export const FIGMA_CELO: Celo = {
  name: "figma",
  generate(input: CeloInput): GeneratedFile[] {
    const { modelo, modeloJson } = input;
    const variables = variablesOf(modelo, input);
    const collections: FigmaCollection[] = [
      {
        name: BASE_COLLECTION,
        modes: [BASE_MODE],
        variables: sortVariables(variables.get(BASE_COLLECTION) ?? []),
      },
      ...dimensiojOf(modelo).map((dimensio) => ({
        name: dimensio.name,
        modes: dimensio.modes,
        variables: sortVariables(variables.get(dimensio.name) ?? []),
      })),
    ];
    const plan: FigmaPlan = {
      fundamento: modeloJson.fundamento.version,
      collections,
      components: modelo.eroj.map((entry) => componentSetOf(entry, modeloJson.fundamento.version)),
    };
    return [{ path: "figma/plan.json", text: `${JSON.stringify(plan, null, 2)}\n` }];
  },
};

function sortVariables(variables: readonly FigmaVariable[]): FigmaVariable[] {
  return [...variables].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
