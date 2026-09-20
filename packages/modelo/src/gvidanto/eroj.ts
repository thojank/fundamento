// list_eroj and get_ero (Spec 003, FR-13, plan D-16, contracts/mcp-tools §1): what an Ero is, the
// Reguloj that judge it, the examples recorded as Jugxoj, and where it appears in every Celo.
// Pure answers from the Modelo. The projection surface is derived from the Skemo and the
// NomReguloj; that it equals what the generators emit is proved in @fundamento/projekcioj, which
// compares this answer with its own output (the generators are not importable here: the Gvidanto
// is published, the generators are not).

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { DtcgType } from "../contracts/index.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type {
  EroInstance,
  Jugxo,
  LoadedEro,
  Modelo,
  Regulo,
  Skemo,
  SkemoPartProperty,
  SkemoPartSource,
  SkemoProp,
} from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { nomRegulo } from "../nomreguloj/index.js";
import { isNoTarget } from "../nomreguloj/types.js";
import { nearestNames } from "./nearest.js";

/** A Regulo as the Gvidanto cites it (contracts/mcp-tools, common.json `ReguloRef`). */
export interface ReguloRef {
  id: string;
  name: string;
  statement: string;
  kialo: string;
  checkability: string;
  aspekto?: string;
}

export interface EroSummary {
  id: string;
  name: string;
  description: string;
  /** The values of the `variant` prop, the prop that names an Ero's variants; else empty. */
  variants: string[];
  props: string[];
}

export interface EroExample {
  jugxo: string;
  decision: Jugxo["decision"];
  kialo: string;
  regulo?: ReguloRef;
  instances: EroInstance[];
}

/** What a prop offers: its values, or the kind of value it takes. */
export type PropSurface = string[] | "boolean" | "string" | "number";

export interface EroProjekcioj {
  webComponent: { tag: string; attributes: Record<string, PropSurface>; slots: string[] };
  react: { package: string; component: string; props: Record<string, PropSurface> };
  figma: {
    componentSet: string;
    properties: Record<string, PropSurface | "text">;
    pluginData: { namespace: string; key: string; value: string };
  };
  css: { files: string[]; attributes: string[] };
  tailwind: { classes: Record<string, string[]> };
  makeKit: { package: string };
}

export interface GetEroOutput {
  ero: { id: string; name: string; description: string };
  skemo: {
    id: string;
    props: Skemo["props"];
    states: Skemo["states"];
    slots: Skemo["slots"];
    parts: Skemo["parts"];
    bindings: Skemo["bindings"];
    a11y: Skemo["a11y"];
    intents?: Skemo["intents"];
  };
  reguloj: ReguloRef[];
  examples: EroExample[];
  projekcioj: EroProjekcioj;
}

export type GetEroInput = { name: string } | { id: string };

export type GetEroResult =
  | { ok: true; output: GetEroOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

/** `butono` → `Butono`: the React component and the class name behind `fm-butono`. */
function pascal(name: string): string {
  return name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) => letter.toUpperCase());
}

/** `full-width` → `fullWidth`: the React prop of a Skemo prop. */
function camel(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}

function propSurface(prop: SkemoProp): PropSurface {
  return prop.kind === "enum" ? [...(prop.values ?? [])] : prop.kind;
}

export function reguloRef(regulo: Regulo): ReguloRef {
  const ref: ReguloRef = {
    id: regulo.id,
    name: regulo.name,
    statement: regulo.statement,
    kialo: regulo.kialo,
    checkability: regulo.checkability,
  };
  if (regulo.aspekto !== undefined) ref.aspekto = regulo.aspekto;
  return ref;
}

/** The Reguloj whose `appliesTo.eroj` names the Ero, in Modelo order (D-04). */
export function regulojOf(modelo: Modelo, ero: string): Regulo[] {
  return modelo.reguloj.filter((regulo) => (regulo.appliesTo?.eroj ?? []).includes(ero));
}

/** The Aspektoj of the Modelo and its reference Aspekto (the one a Make Kit is named after). */
function aspektoj(modelo: Modelo): { names: string[]; reference: string } {
  const dimensio = modelo.dimensioj.find((entry) => entry.name === ASPEKTO_DIMENSIO);
  const names = (dimensio?.valoroj ?? []).map((valoro) => valoro.name);
  return { names, reference: dimensio?.referenceAspekto ?? names[0] ?? "" };
}

/** The Tailwind utility of a part property; a property without one has no class (Art. XII). */
const TAILWIND_UTILITIES: Readonly<Partial<Record<SkemoPartProperty, string>>> = {
  fill: "bg",
  color: "text",
  radius: "rounded",
  gap: "gap",
  "inline-padding": "px",
};

/** The tokens a part property is bound to, in the order the Skemo declares them. */
function tokensOf(skemo: Skemo, part: string, property: string, depth = 0): string[] {
  const source: SkemoPartSource | undefined = skemo.parts[part]?.[property as SkemoPartProperty];
  if (source === undefined || depth > 8) return [];
  if ("fixed" in source) return [source.fixed];
  if ("sameAs" in source) {
    const [other = "", otherProperty = ""] = source.sameAs.split(".");
    return tokensOf(skemo, other, otherProperty, depth + 1);
  }
  const tokens: string[] = [];
  for (const binding of skemo.bindings) {
    if (binding.part !== part || binding.property !== property) continue;
    if (!tokens.includes(binding.token)) tokens.push(binding.token);
  }
  return tokens;
}

/** The `$type` of a token, from the core set: every token is declared there (Art. II). */
function typeOf(modelo: Modelo, token: string): DtcgType | undefined {
  return modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens[token]?.type;
}

/** `color.action.primary.rest` + `bg` → `bg-fm-action-primary-rest`, or nothing (`NoTarget`). */
function tailwindClass(modelo: Modelo, token: string, utility: string): string | undefined {
  const type = typeOf(modelo, token);
  if (type === undefined) return undefined;
  const key = nomRegulo("tailwind").derive(token, type);
  if (isNoTarget(key)) return undefined;
  const marker = key.indexOf("-fm-");
  return marker === -1 ? undefined : `${utility}${key.slice(marker)}`;
}

function tailwindClasses(modelo: Modelo, skemo: Skemo): Record<string, string[]> {
  const classes: Record<string, string[]> = {};
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const property of Object.keys(properties)) {
      // The border takes the border utility of the same colour token, the label the text utility.
      const utility =
        property === "color" && part === "border"
          ? "border"
          : TAILWIND_UTILITIES[property as SkemoPartProperty];
      if (utility === undefined) continue;
      const list = tokensOf(skemo, part, property)
        .map((token) => tailwindClass(modelo, token, utility))
        .filter((entry): entry is string => entry !== undefined);
      if (list.length > 0) classes[`${part}.${property}`] = [...new Set(list)];
    }
  }
  return classes;
}

/** Where an Ero appears in every Celo (contracts/projekcioj). */
export function projekciojOf(modelo: Modelo, entry: LoadedEro): EroProjekcioj {
  const { skemo, ero } = entry;
  const { names, reference } = aspektoj(modelo);
  const attributes: Record<string, PropSurface> = {};
  const reactProps: Record<string, PropSurface> = {};
  const figmaProperties: Record<string, PropSurface | "text"> = {};
  for (const prop of skemo.props) {
    const surface = propSurface(prop);
    attributes[prop.name] = surface;
    reactProps[camel(prop.name)] = surface;
    // Figma knows text properties, not strings.
    figmaProperties[prop.name] = surface === "string" || surface === "number" ? "text" : surface;
  }
  figmaProperties.state = [...skemo.states];
  return {
    webComponent: {
      tag: `fm-${ero.name}`,
      attributes,
      slots: skemo.slots.map((slot) => slot.name),
    },
    react: {
      package: "@fundamento/eroj/react",
      component: pascal(ero.name),
      props: reactProps,
    },
    figma: {
      componentSet: ero.name,
      properties: figmaProperties,
      pluginData: { namespace: "fundamento", key: "ero", value: ero.name },
    },
    css: {
      files: ["fundamento.css", ...names.map((aspekto) => `fundamento-${aspekto}.css`)],
      attributes: modelo.dimensioj.map((dimensio) => `data-fm-${dimensio.name}`),
    },
    tailwind: { classes: tailwindClasses(modelo, skemo) },
    makeKit: { package: `@fundamento/make-kit-${reference}` },
  };
}

/** Every Ero of the Modelo with its variants and props (contracts/mcp-tools). */
export function listEroj(modelo: Modelo): { eroj: EroSummary[] } {
  return {
    eroj: modelo.eroj.map((entry) => ({
      id: entry.ero.id,
      name: entry.ero.name,
      description: entry.ero.description,
      variants: [...(entry.skemo.props.find((prop) => prop.name === "variant")?.values ?? [])],
      props: entry.skemo.props.map((prop) => prop.name),
    })),
  };
}

/** The examples of an Ero: the Jugxoj about it that carry an instance (D-02, T007). */
export function examplesOf(modelo: Modelo, entry: LoadedEro): EroExample[] {
  const byId = new Map(modelo.reguloj.map((regulo) => [regulo.id, regulo]));
  const examples: EroExample[] = [];
  for (const jugxo of modelo.jugxoj) {
    if (!("ero" in jugxo.ref) || jugxo.ref.ero !== entry.ero.id) continue;
    const ekzemplo = jugxo.ekzemplo;
    if (ekzemplo === undefined) continue;
    const regulo = ekzemplo.regulo === undefined ? undefined : byId.get(ekzemplo.regulo);
    examples.push({
      jugxo: jugxo.id,
      decision: jugxo.decision,
      kialo: jugxo.kialo,
      ...(regulo === undefined ? {} : { regulo: reguloRef(regulo) }),
      instances: ekzemplo.instances,
    });
  }
  return examples;
}

export function getEro(modelo: Modelo, input: GetEroInput): GetEroResult {
  const field = "id" in input ? "id" : "name";
  const wanted = "id" in input ? input.id : input.name;
  const entry = modelo.eroj.find((candidate) =>
    field === "id" ? candidate.ero.id === wanted : candidate.ero.name === wanted,
  );
  if (entry === undefined) {
    return {
      ok: false,
      issues: [
        {
          rule: "ero-unknown",
          severity: "error",
          path: `get_ero/${field}`,
          message: `There is no Ero ${wanted}.`,
          suggestion: "Use one of the nearest names in allowed, or list_eroj.",
        },
      ],
      allowed: nearestNames(
        wanted,
        modelo.eroj.map((candidate) => (field === "id" ? candidate.ero.id : candidate.ero.name)),
      ),
    };
  }
  const { skemo } = entry;
  return {
    ok: true,
    output: {
      ero: { id: entry.ero.id, name: entry.ero.name, description: entry.ero.description },
      skemo: {
        id: skemo.id,
        props: skemo.props,
        states: skemo.states,
        slots: skemo.slots,
        parts: skemo.parts,
        bindings: skemo.bindings,
        a11y: skemo.a11y,
        ...(skemo.intents === undefined ? {} : { intents: skemo.intents }),
      },
      reguloj: regulojOf(modelo, entry.ero.name).map(reguloRef),
      examples: examplesOf(modelo, entry),
      projekcioj: projekciojOf(modelo, entry),
    },
  };
}
