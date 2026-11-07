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
import { dokuTextIn, isDokuOffen } from "../eroj/dokumentaro.js";
import { variantKeys } from "../eroj/inventories.js";
import { labelBeside } from "../lingvo/nomoj.js";
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
  /** The display name (Spec 026 ②), only with lingvo. */
  label?: string;
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
  webComponent: {
    tag: string;
    attributes: Record<string, PropSurface>;
    slots: string[];
    /**
     * The slot that takes the content without a slot attribute (Nachlese 11 B-2), e.g. label:
     * `<fm-kampo>E-Mail</fm-kampo>`; `slot="label"` names the same slot. Absent where the Ero has
     * none.
     */
    defaultSlot?: string;
  };
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
  /**
   * Spec 036 Teil 5 ③ (Spec 029 ③): the documentation fields of the Uzo in the language asked
   * for; a field that still holds the placeholder is left out, so an agent never quotes it.
   */
  "when-not"?: { case: string; ero: string }[];
  "do-dont"?: { do: string[]; dont: string[] };
  keyboard?: { keys: string[]; action: string }[] | { none: string };
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
  axes: {
    name: string;
    values: string[];
    default?: string;
    slot?: string;
    /**
     * Values still accepted for one release, each with the value it renders as (Spec 036 Teil 5
     * ②b-2, Spec 029 ②a-2): an agent writes the value they name.
     */
    deprecated?: Record<string, string>;
  }[];
  /**
   * Every other prop of the Skemo with its type, in Skemo order (Nachlese 5 N5-3): what an agent
   * may set beyond the axes — loading at the kompletigilo, min-chars, value. Absent when every
   * prop is an axis.
   */
  props?: { name: string; type: SkemoProp["kind"]; shown?: true }[];
  /**
   * Every boolean prop that is no axis, by name, in Skemo order (Spec 029 ②b-1, Maintainer 29.10.):
   * the brief stays under its ceiling of 750 as the fields gain loading, clearable and status.
   * Absent when there is none.
   */
  flags?: string[];
  /** Props without a default (the caller has to decide them) and slots the Uzo requires. */
  required: { props: string[]; slots: string[] };
  instead?: { goal: string; ero: string | null; kialo: string }[];
  /** The boundaries without their kialo (Nachlese 3 G4): get_ero without brief has it. */
  boundary?: { case: string; action: UzoBoundary["action"]; ero?: string }[];
  issues?: ValidationIssue[];
}

export interface GetEroOutput {
  ero: { id: string; name: string; label?: string; description: string };
  skemo: {
    id: string;
    props: Skemo["props"];
    states: Skemo["states"];
    slots: Skemo["slots"];
    parts: Skemo["parts"];
    bindings: Skemo["bindings"];
    a11y: Skemo["a11y"];
    /** The events the element says (Spec 025 ①): change, input, a cancelable remove. */
    events?: Skemo["events"];
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
  /**
   * Only these parts of the Ero (Spec 038 MG-3/MG-4, D-28, D-31): names of ERO_FIELDS, as the
   * caller sent them – an unknown one is refused with its index, never dropped.
   */
  fields?: readonly string[];
};

export type GetEroFailure = { ok: false; issues: ValidationIssue[]; allowed?: string[] };

export type GetEroResult = { ok: true; output: GetEroOutput } | GetEroFailure;

export type GetEroBriefResult = { ok: true; output: GetEroBrief } | GetEroFailure;

/**
 * The parts of an Ero get_ero answers with `fields` (Spec 038 MG-3/MG-4, D-28): in the order an
 * agent names them; the answer is filled in FILL_ORDER.
 */
export const ERO_FIELDS = ["brief", "slots", "role", "navigation"] as const;

export type EroField = (typeof ERO_FIELDS)[number];

/** D-28: the order in which the fields enter an answer while it stays below the ceiling. */
const FILL_ORDER: readonly EroField[] = ["brief", "role", "navigation", "slots"];

/**
 * The ceiling of every get_ero answer with `fields` (Spec 038 AC-L5), the same as of the briefs
 * (A8): an answer stays strictly below it. Never raised (B-9).
 */
export const ANSWER_CEILING = 750;

/** The token counter of the briefs (eroj.test.ts): JSON length / 3, rounded up. */
export function answerTokens(answer: unknown): number {
  return Math.ceil(JSON.stringify(answer).length / 3);
}

/** Where a link Ero carries its target (Spec 038 MG-4): the prop that holds it. */
export interface EroNavigation {
  target: string;
}

/**
 * One entry of what a slot lets in: a content kind as the Uzo names it (text, icon), the one Ero
 * it accepts, or the Eroj it accepts, in Uzo order.
 */
export type EroSlotContent = "text" | "icon" | { ero: string } | { eroj: string[] };

/** One slot as get_ero with `fields: ["slots"]` states it, generated from Skemo and Uzo. */
export interface EroSlot {
  content: EroSlotContent[];
  /**
   * The form of the data the slot takes (Spec 038 MG-3), only where the Modelo carries one (D-38);
   * no Skemo or Uzo does yet (the tabelo's columns and rows are a Manko of Eroj-Runde 7).
   */
  dataForm?: string;
  /** The slot takes the content without a slot attribute (the Skemo's default slot). */
  default?: true;
  required?: true;
  min?: number;
  max?: number;
}

/**
 * What an Ero's data allows and how its label is judged (Spec 038 B-3, C-4), each at most one line:
 * `props` the allowed prop combinations from the Skemo's constraints (what check_usage reports as
 * ero-prop-constraint), `label` the Reguloj of the Uzo that judge the label. Generated from the
 * Skemo, the Uzo and the Regularo only, never written per Ero.
 */
export interface EroConstraints {
  props?: string;
  label?: string;
}

/**
 * The answer of get_ero with `fields` (D-31): flat. With the brief delivered every key of the
 * brief in its order, else only `ero`; then role, navigation, slots and rest, each only when it
 * stands in the answer.
 */
export type GetEroFieldsOutput = { ero: string } & Partial<Omit<GetEroBrief, "ero">> & {
    role?: string;
    navigation?: EroNavigation;
    slots?: Record<string, EroSlot>;
    constraints?: EroConstraints;
    rest?: EroField[];
  };

export type GetEroFieldsResult = { ok: true; output: GetEroFieldsOutput } | GetEroFailure;

/** `butono` → `Butono`: the React component and the class name behind `fm-butono`. */
function pascal(name: string): string {
  return name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) => letter.toUpperCase());
}

/** `full-width` → `fullWidth`: the React prop of a Skemo prop. */
function camel(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}

/** The default slot of a Skemo, as the projections name it (Nachlese 11 B-2). */
function defaultSlotOf(skemo: Skemo): { defaultSlot?: string } {
  const slot = skemo.slots.find((entry) => entry.default === true);
  return slot === undefined ? {} : { defaultSlot: slot.name };
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
      ...defaultSlotOf(skemo),
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
export function listEroj(modelo: Modelo, input: { lingvo?: Lingvo } = {}): { eroj: EroSummary[] } {
  return {
    eroj: modelo.eroj.map((entry) => ({
      id: entry.ero.id,
      name: entry.ero.name,
      // Spec 026 ②: the display name beside the name, with lingvo.
      ...labelBeside(modelo, "ero", entry.ero.name, input.lingvo),
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
    ...dokuOf(uzo, lingvo),
  };
}

/**
 * The documentation fields of a Uzo as get_ero states them (Spec 036 Teil 5 ③): every text in the
 * language asked for, English by default as every Uzo text; a placeholder is left out.
 */
function dokuOf(
  uzo: Uzo,
  lingvo: Lingvo | undefined,
): Pick<UzoOutput, "when-not" | "do-dont" | "keyboard"> {
  const out: Pick<UzoOutput, "when-not" | "do-dont" | "keyboard"> = {};
  const whenNot = uzo["when-not"];
  if (Array.isArray(whenNot)) {
    out["when-not"] = whenNot.map((entry) => ({
      case: dokuTextIn(entry.case, lingvo),
      ero: entry.ero,
    }));
  }
  const doDont = uzo["do-dont"];
  if (doDont !== undefined && !isDokuOffen(doDont) && "do" in doDont) {
    out["do-dont"] = {
      do: doDont.do.map((text) => dokuTextIn(text, lingvo)),
      dont: doDont.dont.map((text) => dokuTextIn(text, lingvo)),
    };
  }
  const keyboard = uzo.keyboard;
  if (Array.isArray(keyboard)) {
    out.keyboard = keyboard.map((row) => ({
      keys: [...row.keys],
      action: dokuTextIn(row.action, lingvo),
    }));
  } else if (keyboard !== undefined && "none" in keyboard) {
    out.keyboard = { none: dokuTextIn(keyboard.none, lingvo) };
  }
  return out;
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
          ...(prop.deprecatedValues === undefined
            ? {}
            : { deprecated: { ...prop.deprecatedValues } }),
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
    .filter((prop) => !axisNames.has(prop.name) && prop.kind !== "boolean")
    // Spec 029 ②b-1b (Nachlese 12): a prop the Ero shows says so – label="…" at a field is its
    // visible label, the butono's label a hidden name.
    .map((prop) => ({
      name: prop.name,
      type: prop.kind,
      ...(prop.shown === true ? { shown: true as const } : {}),
    }));
  if (props.length > 0) brief.props = props;
  // Spec 029 ②b-1 (Maintainer 29.10.): a boolean is its name alone.
  const flags = skemo.props
    .filter((prop) => !axisNames.has(prop.name) && prop.kind === "boolean")
    .map((prop) => prop.name);
  if (flags.length > 0) brief.flags = flags;
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

/** What a slot accepts besides an Ero name (data-model §2.1, UzoSlot `accepts`). */
function isContentKind(accepted: string): accepted is "text" | "icon" {
  return accepted === "text" || accepted === "icon";
}

/**
 * Where a link Ero carries its target, read from its Skemo (Spec 038 MG-4, the rule of Spec 037
 * D-81/D-127): an Ero with the ARIA role `link` and exactly one required string prop holds its
 * target in that prop; any other Ero has none. The one derivation of the Gvidanto; nordstelo's
 * navigation facts read it (D-34), nothing about a single Ero is typed here.
 */
export function navigationOf(entry: {
  skemo: Pick<Skemo, "a11y" | "props">;
}): EroNavigation | undefined {
  if (entry.skemo.a11y.role !== "link") return undefined;
  const targets = entry.skemo.props.filter(
    (prop) => prop.kind === "string" && prop.required === true,
  );
  const target = targets[0];
  return targets.length === 1 && target !== undefined ? { target: target.name } : undefined;
}

/** What one slot lets in: its Uzo's accepts, kinds as written, the Eroj in one entry. */
function slotContent(slot: Skemo["slots"][number], rule: UzoSlot | undefined): EroSlotContent[] {
  // A slot the Uzo does not describe: text where the Skemo says so, nothing known otherwise.
  if (rule?.accepts === undefined) return slot.text === true ? ["text"] : [];
  const eroj = rule.accepts.filter((accepted) => !isContentKind(accepted));
  const content: EroSlotContent[] = [];
  for (const accepted of rule.accepts) {
    if (isContentKind(accepted)) content.push(accepted);
    else if (accepted === eroj[0]) content.push(eroj.length === 1 ? { ero: accepted } : { eroj });
  }
  return content;
}

/**
 * The slots of an Ero as get_ero with `fields` states them (Spec 038 MG-3): every slot of the
 * Skemo in its order, with what the Uzo lets in, whether it is the default slot or required, and
 * how many entries it takes. Generated from Skemo and Uzo only (Art. VII).
 */
export function slotsOf(entry: Pick<LoadedEro, "skemo" | "uzo">): Record<string, EroSlot> {
  const slots: Record<string, EroSlot> = {};
  for (const slot of entry.skemo.slots) {
    const rule = entry.uzo?.slots[slot.name];
    slots[slot.name] = {
      content: slotContent(slot, rule),
      ...(slot.default === true ? { default: true as const } : {}),
      ...(rule?.required === true ? { required: true as const } : {}),
      ...(rule?.min === undefined ? {} : { min: rule.min }),
      ...(rule?.max === undefined ? {} : { max: rule.max }),
    };
  }
  return slots;
}

/**
 * The constraint lines of an Ero (Spec 038 B-3, C-4), or nothing when its data has neither a Skemo
 * constraint nor a label Regulo.
 */
export function constraintsOf(
  _modelo: Modelo,
  _entry: Pick<LoadedEro, "ero" | "skemo" | "uzo">,
  _lingvo?: Lingvo,
): EroConstraints | undefined {
  throw new Error("S038-37b: constraintsOf is not implemented yet");
}

/** The brief in the language asked for (Nachlese 8 ③), as get_ero with brief: true answers. */
function briefIn(modelo: Modelo, entry: LoadedEro, lingvo: Lingvo | undefined): GetEroBrief {
  const translated =
    entry.uzo === undefined ? entry : { ...entry, uzo: uzoIn(modelo, entry.uzo, lingvo) };
  return briefOf(translated);
}

/**
 * Why a `fields` input is refused, or nothing (Spec 038 §2.2): an unknown field at its index, a
 * field twice, an empty list, or `fields` beside `brief: true` – never ignored silently.
 */
function fieldsFailure(input: GetEroInput): GetEroFailure | undefined {
  const fields: unknown = input.fields;
  const issues: ValidationIssue[] = [];
  const refuse = (
    rule: "ero-field-unknown" | "ero-fields-invalid",
    path: string,
    message: string,
  ) =>
    issues.push({
      rule,
      severity: "error",
      path,
      message,
      suggestion: `Name one or more of ${ERO_FIELDS.join(", ")} in fields, each once; brief: true is fields: ["brief"].`,
    });
  if (!Array.isArray(fields) || fields.length === 0) {
    refuse("ero-fields-invalid", "get_ero/fields", "fields names no field.");
  }
  if (input.brief === true) {
    refuse(
      "ero-fields-invalid",
      "get_ero/fields",
      "fields and brief: true ask twice for the brief.",
    );
  }
  const list: unknown[] = Array.isArray(fields) ? fields : [];
  list.forEach((field, index) => {
    if (typeof field !== "string" || !(ERO_FIELDS as readonly string[]).includes(field)) {
      refuse("ero-field-unknown", `get_ero/fields/${index}`, `There is no field ${String(field)}.`);
    } else if (list.indexOf(field) !== index) {
      refuse("ero-fields-invalid", `get_ero/fields/${index}`, `The field ${field} stands twice.`);
    }
  });
  return issues.length === 0 ? undefined : { ok: false, issues, allowed: [...ERO_FIELDS] };
}

/**
 * The answer to get_ero with `fields` (D-28 as resolved by D-31): the requested fields in
 * FILL_ORDER; a field enters only if the whole answer – with the `rest` of every field not (yet)
 * in it – stays below the ceiling, else it goes to `rest`. So delivered ∪ rest = requested and
 * every answer stays below 750. A request of one field always gets it: that is the follow-up for
 * `rest`, and it must end there. A field that alone reaches the ceiling is a finding (S038-02),
 * never a raised limit; navigation of an Ero that is no link is delivered as its absence.
 */
function fieldsAnswer(
  modelo: Modelo,
  entry: LoadedEro,
  fields: readonly EroField[],
  lingvo: Lingvo | undefined,
): GetEroFieldsOutput {
  const requested = FILL_ORDER.filter((field) => fields.includes(field));
  const brief = requested.includes("brief") ? briefIn(modelo, entry, lingvo) : undefined;
  const navigation = navigationOf(entry);
  const slots = requested.includes("slots") ? slotsOf(entry) : undefined;
  const compose = (delivered: ReadonlySet<EroField>, rest: EroField[]): GetEroFieldsOutput => {
    const out: GetEroFieldsOutput =
      brief !== undefined && delivered.has("brief") ? { ...brief } : { ero: entry.ero.name };
    if (delivered.has("role")) out.role = entry.skemo.a11y.role;
    if (delivered.has("navigation") && navigation !== undefined) out.navigation = { ...navigation };
    if (slots !== undefined && delivered.has("slots")) out.slots = slots;
    if (rest.length > 0) out.rest = rest;
    return out;
  };
  if (requested.length === 1) return compose(new Set(requested), []);
  const delivered = new Set<EroField>();
  const rejected: EroField[] = [];
  requested.forEach((field, index) => {
    const tentative = compose(new Set([...delivered, field]), [
      ...rejected,
      ...requested.slice(index + 1),
    ]);
    if (answerTokens(tentative) < ANSWER_CEILING) delivered.add(field);
    else rejected.push(field);
  });
  return compose(delivered, rejected);
}

export function getEro(
  modelo: Modelo,
  input: EroSelector & { fields: readonly string[]; brief?: boolean; lingvo?: Lingvo },
): GetEroFieldsResult;
export function getEro(
  modelo: Modelo,
  input: EroSelector & { brief: true; lingvo?: Lingvo },
): GetEroBriefResult;
export function getEro(
  modelo: Modelo,
  input: EroSelector & { brief?: false; lingvo?: Lingvo },
): GetEroResult;
export function getEro(
  modelo: Modelo,
  input: GetEroInput,
): GetEroResult | GetEroBriefResult | GetEroFieldsResult;
export function getEro(
  modelo: Modelo,
  input: GetEroInput,
): GetEroResult | GetEroBriefResult | GetEroFieldsResult {
  // Spec 038 §2.2: a refused fields input says so before the Ero is looked up.
  if (input.fields !== undefined) {
    const refused = fieldsFailure(input);
    if (refused !== undefined) return refused;
  }
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
  if (input.fields !== undefined) {
    // fieldsFailure has let only names of ERO_FIELDS through.
    const fields = input.fields as readonly EroField[];
    return { ok: true, output: fieldsAnswer(modelo, entry, fields, lingvo) };
  }
  if (input.brief === true) {
    // Nachlese 8 ③: the purpose and the alternatives in the language asked for.
    return { ok: true, output: briefIn(modelo, entry, lingvo) };
  }
  const { skemo } = entry;
  const uzo = uzoOf(modelo, entry.uzo, lingvo);
  return {
    ok: true,
    output: {
      ero: {
        id: entry.ero.id,
        name: entry.ero.name,
        // Spec 026 ②: the display name beside the name, with lingvo.
        ...labelBeside(modelo, "ero", entry.ero.name, lingvo),
        description: entry.ero.description,
      },
      skemo: {
        id: skemo.id,
        props: skemo.props,
        states: skemo.states,
        slots: skemo.slots,
        parts: skemo.parts,
        bindings: skemo.bindings,
        a11y: skemo.a11y,
        ...(skemo.events === undefined ? {} : { events: skemo.events }),
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
