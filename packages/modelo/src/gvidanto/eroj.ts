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
  Uzo,
  UzoBoundary,
  UzoContent,
  UzoInstead,
  UzoLayout,
  UzoSlot,
} from "../contracts/modelo.js";
import { variantKeys } from "../eroj/inventories.js";
import { type Lingvo, reguloIn, uzoIn } from "../lingvo/tradukoj.js";
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
  /**
   * The values of the prop that names an Ero's variants: its first enum prop (plan D-13), for the
   * butono `emphasis`; else empty.
   */
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

/**
 * The Uzo as get_ero states it (Spec 007, D-05, contracts/mcp-tools §1): the whole object without
 * the ids of Ero and Skemo (they stand in the answer already), every Regulo it names resolved as
 * a ReguloRef, so an agent quotes the kialo without a second call.
 */
export interface UzoOutput {
  purpose: string;
  instead: UzoInstead[];
  boundary: UzoBoundary[];
  composes: {
    containers: { name: string; kialo: string }[];
    with: { ero: string; kialo: string }[];
    never: { ero: string; kialo: string }[];
    spacing: { owner: "container"; regulo: ReguloRef };
  };
  slots: Record<string, UzoSlot>;
  layout: {
    size: UzoLayout["size"];
    wrap: UzoLayout["wrap"];
    /** The container width from which layout auto lays the Ero out side by side (Spec 014 ①, ② O-3). */
    "columns-from"?: string;
    [prop: string]:
      | string
      | undefined
      | {
          allowedIn: { containers?: string[]; dimensioj?: Record<string, string[]> };
          regulo: ReguloRef;
        };
  };
  content: (Omit<UzoContent, "regulo"> & { regulo: ReguloRef })[];
}

/**
 * The brief answer (A8): what a choice needs, generated from Skemo and Uzo, never written by hand
 * (Art. VII). Without a Uzo only `ero`, `axes` and `required`, with the warning in `issues`.
 */
export interface GetEroBrief {
  ero: string;
  purpose?: string;
  /**
   * Every enum prop of the Skemo with its values and default; a boolean prop that keys a part
   * (checked, Spec 010 ① D-03) with true and false; and the state of one entry of a slot
   * (selected, Spec 010 ③ E7) with the slot it belongs to and no default (Spec 011 ① O-3).
   */
  axes: { name: string; values: string[]; default?: string; slot?: string }[];
  /**
   * Every other prop of the Skemo with its type, in Skemo order (Nachlese 5 N5-3): what an agent
   * may set beyond the axes — loading at the kompletigilo, min-chars, value. Absent when every
   * prop is an axis.
   */
  props?: { name: string; type: SkemoProp["kind"] }[];
  /** Props without a default (the caller has to decide them) and slots the Uzo requires. */
  required: { props: string[]; slots: string[] };
  instead?: { goal: string; ero: string | null; kialo: string }[];
  /** The boundaries without their kialo (Nachlese 3 G4): get_ero without brief has it. */
  boundary?: { case: string; action: UzoBoundary["action"]; ero?: string }[];
  issues?: ValidationIssue[];
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
    goals?: Skemo["goals"];
  };
  reguloj: ReguloRef[];
  examples: EroExample[];
  projekcioj: EroProjekcioj;
  /** Absent when the Ero has no Uzo (Spec 007). */
  uzo?: UzoOutput;
}

type EroSelector = { name: string } | { id: string };

export type GetEroInput = EroSelector & {
  /** Only the brief answer (A8, Spec 007); default false. */
  brief?: boolean;
  /** The language of the texts of the Uzo and the Reguloj (Nachlese 8 ③); English without it. */
  lingvo?: Lingvo;
};

export type GetEroFailure = { ok: false; issues: ValidationIssue[]; allowed?: string[] };

export type GetEroResult = { ok: true; output: GetEroOutput } | GetEroFailure;

export type GetEroBriefResult = { ok: true; output: GetEroBrief } | GetEroFailure;

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
      variants: [...(entry.skemo.props.find((prop) => prop.kind === "enum")?.values ?? [])],
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

/** A Regulo name of the Uzo as a ReguloRef; a name the Modelo does not know stays a name. */
function reguloRefNamed(modelo: Modelo, name: string, lingvo?: Lingvo): ReguloRef {
  const regulo = modelo.reguloj.find((candidate) => candidate.name === name);
  if (regulo === undefined) {
    return { id: "", name, statement: "", kialo: "", checkability: "manual" };
  }
  return reguloIn(modelo, reguloRef(regulo), lingvo);
}

/** The Uzo of an Ero as get_ero states it (D-05), or nothing. */
export function uzoOf(
  modelo: Modelo,
  source: Uzo | undefined,
  lingvo?: Lingvo,
): UzoOutput | undefined {
  if (source === undefined) return undefined;
  // Nachlese 8 ③: the texts in the language asked for, everything else as it is.
  const uzo = uzoIn(modelo, source, lingvo);
  const layout: UzoOutput["layout"] = { size: uzo.layout.size, wrap: uzo.layout.wrap };
  // Spec 014 ② (O-3 of ①): the threshold of layout auto, so an agent sees it.
  if (uzo.layout["columns-from"] !== undefined) layout["columns-from"] = uzo.layout["columns-from"];
  for (const [prop, allowance] of Object.entries(uzo.layout)) {
    if (typeof allowance !== "object") continue;
    layout[prop] = {
      allowedIn: structuredClone(allowance.allowedIn),
      regulo: reguloRefNamed(modelo, allowance.regulo, lingvo),
    };
  }
  return {
    purpose: uzo.purpose,
    instead: structuredClone(uzo.instead),
    boundary: structuredClone(uzo.boundary),
    composes: {
      containers: structuredClone(uzo.composes.containers),
      with: structuredClone(uzo.composes.with),
      never: structuredClone(uzo.composes.never),
      spacing: {
        owner: uzo.composes.spacing.owner,
        regulo: reguloRefNamed(modelo, uzo.composes.spacing.regulo, lingvo),
      },
    },
    slots: structuredClone(uzo.slots),
    layout,
    content: uzo.content.map((entry) => ({
      ...structuredClone(entry),
      regulo: reguloRefNamed(modelo, entry.regulo, lingvo),
    })),
  };
}

/** The brief answer of an Ero (A8), generated from its Skemo and Uzo. */
export function briefOf(entry: LoadedEro): GetEroBrief {
  const { skemo, uzo } = entry;
  // The axes of the variants (Spec 010 ① D-03): every prop a part is keyed by, state aside.
  const keyedProps = new Set(variantKeys(skemo));
  const brief: GetEroBrief = {
    ero: entry.ero.name,
    axes: [
      ...skemo.props
        .filter(
          (prop) => prop.kind === "enum" || (prop.kind === "boolean" && keyedProps.has(prop.name)),
        )
        .map((prop) => ({
          name: prop.name,
          values: prop.kind === "enum" ? [...(prop.values ?? [])] : ["true", "false"],
          ...(prop.default === undefined ? {} : { default: String(prop.default) }),
        })),
      ...skemo.slots.flatMap((slot) =>
        slot.entry === undefined
          ? []
          : [
              { name: slot.entry.key, values: ["true", "false"], slot: slot.name },
              // The second state of an entry (Nachlese 4 N-8): the active suggestion.
              ...(slot.entry.active === undefined
                ? []
                : [{ name: slot.entry.active, values: ["true", "false"], slot: slot.name }]),
            ],
      ),
    ],
    required: {
      // R-10 (Abnahme 2026-10-13): a duty is what the Skemo marks as required. "No default" is
      // not a duty: label is the fallback name of an empty slot, value the text of an empty field.
      props: skemo.props.filter((prop) => prop.required === true).map((prop) => prop.name),
      slots: Object.entries(uzo?.slots ?? {})
        .filter(([, rule]) => rule.required === true)
        .map(([slot]) => slot),
    },
  };
  // Nachlese 5 N5-3 (Messung A2): the props without an axis, with name and type, so an agent
  // learns that the kompletigilo has loading; the brief stays under 750 (the kampo's is the
  // largest).
  const axisNames = new Set(brief.axes.map((axis) => axis.name));
  const props = skemo.props
    .filter((prop) => !axisNames.has(prop.name))
    .map((prop) => ({ name: prop.name, type: prop.kind }));
  if (props.length > 0) brief.props = props;
  if (uzo === undefined) {
    brief.issues = [
      {
        rule: "skemo-uzo-missing",
        severity: "warning",
        path: `get_ero/${entry.ero.name}`,
        message: `The Ero ${entry.ero.name} has a Skemo but no Uzo: the brief says how it is built, not what it is for and where it stops.`,
        suggestion: `Add ${entry.ero.name}/uzo.json next to the Skemo (Spec 007).`,
      },
    ];
    return brief;
  }
  brief.purpose = uzo.purpose;
  brief.instead = uzo.instead.map(({ goal, ero, kialo }) => ({ goal, ero, kialo }));
  // Nachlese 3 G4: a boundary of the brief names its case and action (and the Ero to use), no
  // kialo — the full kialo comes from get_ero without brief; so the brief stays under its ceiling
  // without shortening kialos.
  brief.boundary = uzo.boundary.map(({ case: name, action, ero }) => ({
    case: name,
    action,
    ...(ero === undefined ? {} : { ero }),
  }));
  return brief;
}

export function getEro(
  modelo: Modelo,
  input: EroSelector & { brief: true; lingvo?: Lingvo },
): GetEroBriefResult;
export function getEro(
  modelo: Modelo,
  input: EroSelector & { brief?: false; lingvo?: Lingvo },
): GetEroResult;
export function getEro(modelo: Modelo, input: GetEroInput): GetEroResult | GetEroBriefResult;
export function getEro(modelo: Modelo, input: GetEroInput): GetEroResult | GetEroBriefResult {
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
  const lingvo = input.lingvo;
  if (input.brief === true) {
    // Nachlese 8 ③: the purpose and the alternatives in the language asked for.
    const translated =
      entry.uzo === undefined ? entry : { ...entry, uzo: uzoIn(modelo, entry.uzo, lingvo) };
    return { ok: true, output: briefOf(translated) };
  }
  const { skemo } = entry;
  const uzo = uzoOf(modelo, entry.uzo, lingvo);
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
        ...(skemo.goals === undefined ? {} : { goals: skemo.goals }),
      },
      reguloj: regulojOf(modelo, entry.ero.name).map((regulo) =>
        reguloIn(modelo, reguloRef(regulo), lingvo),
      ),
      examples: examplesOf(modelo, entry),
      projekcioj: projekciojOf(modelo, entry),
      ...(uzo === undefined ? {} : { uzo }),
    },
  };
}
