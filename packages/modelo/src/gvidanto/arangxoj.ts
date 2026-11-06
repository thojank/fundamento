// list_arangxoj (Spec 038 MG-1, 1.1, V-1): the layout means a screen arranges its Eroj with –
// the Sxablonoj and their regions, the Eroj whose goal is a layout purpose, the spacing steps as
// token paths of the core set – and, for every layout purpose without a means, a Manko for
// Eroj-Runde 7 instead of a replacement. Every entry comes from the Modelo (Skemo, Uzo and region
// data, the names of the core set); no value is written, the examples carry no brand. Pure and
// deterministic: the order is the Modelo's.

import type {
  LoadedEro,
  LoadedSxablono,
  Modelo,
  SkemoProp,
  SxablonoRegion,
} from "../contracts/modelo.js";
import { labelBeside } from "../lingvo/nomoj.js";
import type { Lingvo } from "../lingvo/tradukoj.js";
import { markerOf } from "./sxablonoj.js";

/**
 * The layout questions the answer checks for a means (Spec 038 MG-1: spacing, rows, columns,
 * regions; the stack beside them, implementation spec finding 13). A purpose is answered by an
 * entry with that `celo` – an Ero whose Skemo goal carries the purpose's name, every Sxablono and
 * region for `region` – or, for `spacing`, by the spacing steps of the core set.
 */
export const ARANGXO_CELOJ = ["spacing", "row", "column", "stack", "region"] as const;
export type ArangxoCelo = (typeof ARANGXO_CELOJ)[number];

/** A prop of a layout means, with the values it takes (1.1: "Props mit Werten"). */
export interface ArangxoProp {
  name: string;
  /** The kind of the Skemo prop; absent for the props a region asks of its children. */
  kind?: SkemoProp["kind"];
  /** Enum values of the Skemo, or the value a region asks for. */
  values?: (string | number | boolean)[];
  required?: true;
}

export interface Arangxo {
  /** The Ero or Sxablono name; a region as `<sxablono>/<region>`. */
  name: string;
  /** The display name (Spec 026 ②), only with lingvo and only for an Ero or a Sxablono. */
  label?: string;
  kind: "ero" | "sxablono" | "regiono";
  /** The layout purpose the entry answers (ARANGXO_CELOJ). */
  celo: ArangxoCelo;
  props: ArangxoProp[];
  /** Brand-free markup: the element with its required props, a region as the child it takes. */
  example: string;
}

export interface ArangxoManko {
  /** The layout purpose without a means. */
  celo: ArangxoCelo;
  /** What Eroj-Runde 7 would add (a proposal, not a replacement to build). */
  propono: string;
}

export interface ListArangxojOutput {
  arangxoj: Arangxo[];
  /** The spacing steps as token paths of the core set, in its order; never a value. */
  interspacoj: { token: string }[];
  mankoj: ArangxoManko[];
}

/** The proposal per purpose for Eroj-Runde 7 (the vocabulary's own text, no Ero named). */
const PROPONOJ: Record<ArangxoCelo, string> = {
  spacing:
    "Spacing steps as tokens of the core set (one group, small to large), so that every container takes the gap between its children from a step.",
  row: "Layout primitive row: an Ero that sets its children side by side, takes the gap between them from a spacing step and wraps where the row is full.",
  column:
    "Layout primitive columns: an Ero that places its children on the columns of the layout grid of the core set and stacks them below a container width.",
  stack:
    "Layout primitive stack: an Ero that sets its children one below the other and takes the gap between them from a spacing step.",
  region:
    "A Sxablono with named regions (Spec 020) that frames the screen, so that every region is recognised in markup.",
};

/** The group of the core set whose direct dimension tokens are the spacing steps. */
const SPACING_GROUP = "spacing";

/** The text that stands for a value the agent writes itself (no brand, no value). */
const PLACEHOLDER = "…";

const escapeAttribute = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

/** One attribute as markup: a true boolean bare, everything else quoted. */
function attribute(name: string, value: string | number | boolean): string {
  return value === true ? ` ${name}` : ` ${name}="${escapeAttribute(String(value))}"`;
}

/** The value an example gives a required prop: its default, an enum's first value, else "…". */
function exampleValue(prop: SkemoProp): string | number | boolean {
  if (prop.default !== undefined) return prop.default;
  if (prop.kind === "boolean") return true;
  return prop.values?.[0] ?? PLACEHOLDER;
}

/** The attributes for the required props not yet set. */
function requiredAttributes(props: readonly SkemoProp[], set: ReadonlySet<string>): string {
  return props
    .filter((prop) => prop.required === true && !set.has(prop.name))
    .map((prop) => attribute(prop.name, exampleValue(prop)))
    .join("");
}

function propsOf(props: readonly SkemoProp[]): ArangxoProp[] {
  return props.map((prop) => ({
    name: prop.name,
    kind: prop.kind,
    ...(prop.values === undefined ? {} : { values: [...prop.values] }),
    ...(prop.required === true ? { required: true as const } : {}),
  }));
}

/** The Skemo props of an Ero or Sxablono of that name, if the Modelo has one. */
function skemoPropsNamed(modelo: Modelo, name: string): readonly SkemoProp[] | undefined {
  return (
    modelo.eroj.find((entry) => entry.ero.name === name)?.skemo.props ??
    (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === name)?.skemo.props
  );
}

/** What a region asks of its children: every child's props, then the one child's. */
function regionProps(region: SxablonoRegion): ArangxoProp[] {
  return [
    ...Object.entries(region.props ?? {}).map(([name, value]) => ({
      name,
      values: [value],
      required: true as const,
    })),
    ...Object.entries(region.one ?? {}).map(([name, value]) => ({ name, values: [value] })),
  ];
}

/**
 * A child in the region as markup: the first Ero or Sxablono it accepts, with the region's slot
 * (MG-5 marker), the props the region asks and the child's own required props. A region that
 * names none takes any content; its default region takes it without a slot.
 */
function regionExample(modelo: Modelo, sxablono: LoadedSxablono, region: SxablonoRegion): string {
  const marker = markerOf(modelo, sxablono, region);
  const slot = marker.slot ?? region.name;
  const child = (region.accepts ?? []).find((name) => skemoPropsNamed(modelo, name) !== undefined);
  if (child === undefined) {
    return marker.default === true
      ? PLACEHOLDER
      : `<span slot="${escapeAttribute(slot)}">${PLACEHOLDER}</span>`;
  }
  const asked = regionProps(region);
  const attributes = [
    attribute("slot", slot),
    ...asked.map((prop) => attribute(prop.name, prop.values?.[0] ?? PLACEHOLDER)),
    requiredAttributes(skemoPropsNamed(modelo, child) ?? [], new Set(asked.map((p) => p.name))),
  ].join("");
  return `<fm-${child}${attributes}></fm-${child}>`;
}

function sxablonoEntries(modelo: Modelo, lingvo: Lingvo | undefined): Arangxo[] {
  return (modelo.sxablonoj ?? []).flatMap((entry) => {
    const name = entry.sxablono.name;
    const regions = entry.skemo.regions.map((region) => ({
      name: `${name}/${region.name}`,
      kind: "regiono" as const,
      celo: "region" as const,
      props: regionProps(region),
      example: regionExample(modelo, entry, region),
    }));
    const required = entry.skemo.regions
      .map((region, index) => (region.required === true ? regions[index]?.example : undefined))
      .filter((example): example is string => example !== undefined)
      .join("");
    const own: Arangxo = {
      name,
      ...labelBeside(modelo, "sxablono", name, lingvo),
      kind: "sxablono",
      celo: "region",
      props: propsOf(entry.skemo.props),
      example: `<fm-${name}${requiredAttributes(entry.skemo.props, new Set())}>${required}</fm-${name}>`,
    };
    return [own, ...regions];
  });
}

/** An Ero whose Skemo goal is named after a layout purpose (none in Eroj-Runde 6). */
function eroEntries(modelo: Modelo, lingvo: Lingvo | undefined): Arangxo[] {
  const celoj: readonly string[] = ARANGXO_CELOJ;
  return modelo.eroj.flatMap((entry: LoadedEro) =>
    (entry.skemo.goals ?? [])
      .filter((goal) => celoj.includes(goal.goal))
      .map((goal) => {
        const name = entry.ero.name;
        const given = Object.entries(goal.props);
        const attributes =
          given.map(([prop, value]) => attribute(prop, value)).join("") +
          requiredAttributes(entry.skemo.props, new Set(given.map(([prop]) => prop)));
        return {
          name,
          ...labelBeside(modelo, "ero", name, lingvo),
          kind: "ero" as const,
          celo: goal.goal as ArangxoCelo,
          props: propsOf(entry.skemo.props),
          example: `<fm-${name}${attributes}></fm-${name}>`,
        };
      }),
  );
}

/** The spacing steps: the direct dimension tokens of the spacing group of the core set. */
function interspacojOf(modelo: Modelo): { token: string }[] {
  const core = modelo.setoj.find((set) => set.name === "core");
  return Object.values(core?.tokens ?? {})
    .filter((token) => {
      const path = token.name.split(".");
      return path.length === 2 && path[0] === SPACING_GROUP && token.type === "dimension";
    })
    .map((token) => ({ token: token.name }));
}

/**
 * The answer of list_arangxoj: the layout means of the Modelo, the spacing steps, and a Manko per
 * layout purpose without a means (Eroj-Runde 7). With lingvo the Eroj and Sxablonoj carry their
 * display name; nothing else changes.
 */
export function listArangxoj(modelo: Modelo, input: { lingvo?: Lingvo } = {}): ListArangxojOutput {
  const arangxoj = [...eroEntries(modelo, input.lingvo), ...sxablonoEntries(modelo, input.lingvo)];
  const interspacoj = interspacojOf(modelo);
  const answered = new Set<string>(arangxoj.map((entry) => entry.celo));
  if (interspacoj.length > 0) answered.add("spacing");
  return {
    arangxoj,
    interspacoj,
    mankoj: ARANGXO_CELOJ.filter((celo) => !answered.has(celo)).map((celo) => ({
      celo,
      propono: PROPONOJ[celo],
    })),
  };
}
