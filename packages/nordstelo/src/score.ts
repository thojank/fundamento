// The score of one run (Spec 030, Bewertung): K1–K6 from the stored facts of the rendered page,
// pure and deterministic – no model judges. K1 renders without errors; K2 no invented identifiers
// (tags, props, values, slots against the Modelo); K3 the Reguloj via check_usage; K4 axe-core in
// every Aspekto and mode; K5 no raw values and no rebuilt Eroj (the seed of `fm lint`); K6 the
// acceptance criteria of the task. Each is a share between 0 and 1, the total 0–100 weighted by
// the weights of the catalogue. In Variante 0 K2 and K3 do not apply (no Ero to check); K7, the
// effort, is reported beside the score and never weighted.
// Nachlese 11 ②: Markenfähigkeit is a gate. The criteria of the gate (K4, K5) count only for the
// renders whose combination the page follows; a page that follows no brand and no mode gets
// nothing for them. `scoreBoth` gives the new weighting with the gate and the old one without.

import {
  checkUsage,
  type EroInstance,
  type Modelo,
  type NordsteloFile,
  type NordsteloKontrolo,
  type Pezo,
  type Tasko,
} from "@fundamento/modelo";
import type { Element, Facts, Render, Variant } from "./facts.js";

export type Kriterio = "K1" | "K2" | "K3" | "K4" | "K5" | "K6";
export const KRITERIOJ: readonly Kriterio[] = ["K1", "K2", "K3", "K4", "K5", "K6"];

export type GapKind =
  | "render"
  | "invented-tag"
  | "invented-attribute"
  | "invented-value"
  | "invented-slot"
  | "regulo"
  | "a11y"
  | "raw-value"
  | "rebuilt-ero"
  | "criterion";

const GAP_ORDER: readonly GapKind[] = [
  "render",
  "invented-tag",
  "invented-attribute",
  "invented-value",
  "invented-slot",
  "regulo",
  "a11y",
  "raw-value",
  "rebuilt-ero",
  "criterion",
];

/** One finding of a run: what the Lückenliste counts (invented, violated, rebuilt …). */
export interface Gap {
  kind: GapKind;
  key: string;
}

export interface Score {
  /** Share per criterion, 0–1; null where it does not apply. */
  k: Record<Kriterio, number | null>;
  /** 0–100, weighted over the criteria that apply, rounded to one decimal. */
  total: number;
  gaps: Gap[];
  /** With the gate (Nachlese 11): the share of the renders whose combination the page follows. */
  multmarkeco?: number;
}

export interface ScoreInput {
  facts: Facts;
  tasko: Tasko;
  variant: Variant;
  modelo: Modelo;
  pezoj: Pezo[];
  /** The criteria of the gate of Markenfähigkeit (Nachlese 11); without it no gate. */
  pordego?: readonly Kriterio[];
}

/** What one raw value or rebuilt Ero takes off K5 (five findings make it 0). */
export const K5_STEP = 0.2;

/** Attributes any element may carry; they are no identifiers of an Ero. */
const GLOBAL_ATTRIBUTE =
  /^(id|class|slot|style|lang|dir|title|hidden|tabindex|role|part|inert|translate|aria-.+|data-.+|on[a-z]+)$/;

/** Native elements whose job an Ero does; outside an Ero they are rebuilt (K5). */
const REBUILT = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "table",
  "dialog",
  "details",
  "progress",
  "meter",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);
const REBUILT_ROLE =
  /^(button|link|tab|tablist|tabpanel|dialog|alertdialog|alert|switch|checkbox|radio|radiogroup|slider|progressbar|meter|menu|menuitem|tooltip|combobox|listbox)$/;

/** Fields of the accessibility tree: every one needs a name (field-label-visible). */
const FIELD_ROLE = /^(textbox|searchbox|combobox|listbox|checkbox|radio|switch|slider|spinbutton)$/;

/** Properties whose values must come from tokens; a literal is a raw value (K5). */
const DESIGN_PROPERTY =
  /^(color|background(-color)?|border(-[a-z]+)*|outline(-[a-z]+)*|font(-family|-size|-weight)?|line-height|letter-spacing|margin(-[a-z]+)*|padding(-[a-z]+)*|gap|row-gap|column-gap|border-radius|box-shadow|width|height|min-width|max-width|min-height|max-height|inset(-[a-z]+)*|top|right|bottom|left)$/;
const LITERAL =
  /#[0-9a-f]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|lab|lch)\(|-?\d*\.?\d+(px|rem|em|pt|vh|vw|%)|^[a-z][a-z -]*(,|$)/i;
const ALLOWED_VALUE =
  /^(0|auto|none|inherit|initial|unset|currentcolor|transparent|100%|50%|fit-content|max-content|min-content)$/i;

const round1 = (value: number): number => Math.round(value * 10) / 10;
const round4 = (value: number): number => Math.round(value * 10000) / 10000;

function sortGaps(gaps: Gap[]): Gap[] {
  const seen = new Set<string>();
  return gaps
    .filter((gap) => {
      const id = `${gap.kind}\u0000${gap.key}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort(
      (a, b) =>
        GAP_ORDER.indexOf(a.kind) - GAP_ORDER.indexOf(b.kind) ||
        (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
    );
}

interface Known {
  eroj: Map<string, Modelo["eroj"][number]>;
  sxablonoj: Map<string, NonNullable<Modelo["sxablonoj"]>[number]>;
}

const knownOf = (modelo: Modelo): Known => ({
  eroj: new Map(modelo.eroj.map((entry) => [entry.ero.name, entry])),
  sxablonoj: new Map((modelo.sxablonoj ?? []).map((entry) => [entry.sxablono.name, entry])),
});

const fmName = (tag: string): string | undefined =>
  tag.startsWith("fm-") ? tag.slice(3) : undefined;

/** The index of the nearest ancestor that is an Ero, -1 if none. */
function eroAncestor(elements: readonly Element[], index: number, known: Known): number {
  let parent = elements[index]?.parent ?? -1;
  while (parent !== -1) {
    const name = fmName(elements[parent]?.tag ?? "");
    if (name !== undefined && known.eroj.has(name)) return parent;
    parent = elements[parent]?.parent ?? -1;
  }
  return -1;
}

/** The index of the nearest ancestor that is any fm-* element, -1 if none. */
function fmAncestor(elements: readonly Element[], index: number): number {
  let parent = elements[index]?.parent ?? -1;
  while (parent !== -1) {
    if ((elements[parent]?.tag ?? "").startsWith("fm-")) return parent;
    parent = elements[parent]?.parent ?? -1;
  }
  return -1;
}

const childrenOf = (elements: readonly Element[], index: number): number[] =>
  elements.flatMap((element, i) => (element.parent === index ? [i] : []));

function textOf(elements: readonly Element[], index: number): string {
  const element = elements[index];
  if (element === undefined) return "";
  return [element.text, ...childrenOf(elements, index).map((child) => textOf(elements, child))]
    .filter((part) => part !== "")
    .join(" ");
}

// --- K2: identifiers against the Modelo ---------------------------------------------------------

function inventedGaps(facts: Facts, known: Known): { gaps: Gap[]; used: number } {
  const gaps: Gap[] = [];
  let used = 0;
  for (const [index, element] of facts.elements.entries()) {
    const name = fmName(element.tag);
    if (name !== undefined) {
      used += 1;
      const ero = known.eroj.get(name);
      const sxablono = known.sxablonoj.get(name);
      if (ero === undefined && sxablono === undefined) {
        gaps.push({ kind: "invented-tag", key: element.tag });
        continue;
      }
      const props = ero?.skemo.props ?? [];
      for (const [attribute, value] of Object.entries(element.attrs)) {
        if (GLOBAL_ATTRIBUTE.test(attribute)) continue;
        used += 1;
        if (sxablono !== undefined) continue;
        const prop = props.find((entry) => entry.name === attribute);
        if (prop === undefined) {
          gaps.push({ kind: "invented-attribute", key: `${name}.${attribute}` });
        } else if (prop.kind === "enum" && !(prop.values ?? []).includes(value)) {
          gaps.push({ kind: "invented-value", key: `${name}.${attribute}=${value}` });
        }
      }
    }
    const slot = element.attrs.slot;
    const parent = facts.elements[element.parent];
    const parentName = parent === undefined ? undefined : fmName(parent.tag);
    if (slot !== undefined && parentName !== undefined) {
      used += 1;
      const ero = known.eroj.get(parentName);
      const sxablono = known.sxablonoj.get(parentName);
      const slots = ero
        ? (ero.skemo.slots ?? []).map((entry) => entry.name)
        : // Nachlese 11 O-6: the regions are a list; their names are the slots (Spec 030 read the
          // indices of the list, and every region looked invented).
          (sxablono?.skemo.regions ?? []).map((region) => region.name);
      if ((ero !== undefined || sxablono !== undefined) && !slots.includes(slot)) {
        gaps.push({ kind: "invented-slot", key: `${parentName}.slot=${slot}` });
      } else if (ero?.skemo.slots?.some((entry) => entry.name === slot && entry.default === true)) {
        // The default slot has no name in the Web Component: content with slot="<its name>" is
        // never shown (measured at fm-kampo, Spec 030 B-2).
        gaps.push({ kind: "invented-slot", key: `${parentName}.slot=${slot} (Standard-Slot)` });
      }
    }
    void index;
  }
  return { gaps, used };
}

// --- K3: check_usage on the instances of the page ----------------------------------------------

function instancesOf(facts: Facts, known: Known): EroInstance[] {
  const instances: EroInstance[] = [];
  const containers = new Map<number, string>();
  for (const [index, element] of facts.elements.entries()) {
    const name = fmName(element.tag);
    const entry = name === undefined ? undefined : known.eroj.get(name);
    if (name === undefined || entry === undefined) continue;
    const props: EroInstance["props"] = {};
    for (const prop of entry.skemo.props) {
      const value = element.attrs[prop.name];
      if (value === undefined) continue;
      if (prop.kind === "boolean") props[prop.name] = value !== "false";
      else if (prop.kind === "number") {
        const number = Number(value);
        if (Number.isFinite(number)) props[prop.name] = number;
      } else if (prop.kind === "enum") {
        if ((prop.values ?? []).includes(value)) props[prop.name] = value;
      } else props[prop.name] = value;
    }
    const slotNames = new Set((entry.skemo.slots ?? []).map((slot) => slot.name));
    const children = childrenOf(facts.elements, index);
    const texts: Record<string, string | string[]> = {};
    const slots: NonNullable<EroInstance["slots"]> = {};
    for (const child of children) {
      const slot = facts.elements[child]?.attrs.slot;
      if (slot === undefined || !slotNames.has(slot)) continue;
      const childName = fmName(facts.elements[child]?.tag ?? "");
      const filled = slots[slot] ?? [];
      filled.push(
        childName !== undefined && known.eroj.has(childName) ? { ero: childName } : "text",
      );
      slots[slot] = filled;
      const text = textOf(facts.elements, child);
      const previous = texts[slot];
      texts[slot] =
        previous === undefined
          ? text
          : [...(Array.isArray(previous) ? previous : [previous]), text];
    }
    const label = [
      element.text,
      ...children
        .filter((child) => facts.elements[child]?.attrs.slot === undefined)
        .map((child) => textOf(facts.elements, child)),
    ]
      .filter((part) => part !== "")
      .join(" ");
    const container = fmAncestor(facts.elements, index);
    if (container !== -1 && !containers.has(container)) {
      containers.set(
        container,
        `${fmName(facts.elements[container]?.tag ?? "") ?? ""}-${containers.size + 1}`,
      );
    }
    const lingvo = facts.lingvo.slice(0, 2).toLowerCase();
    instances.push({
      ero: name,
      props,
      ...(label === "" ? {} : { label }),
      ...(Object.keys(texts).length === 0 ? {} : { texts }),
      ...(Object.keys(slots).length === 0 ? {} : { slots }),
      ...(container === -1 ? {} : { container: containers.get(container) ?? "" }),
      ...(/^[a-z]{2}$/.test(lingvo) ? { lingvo } : {}),
    });
  }
  return instances;
}

function reguloGaps(facts: Facts, known: Known, modelo: Modelo): { gaps: Gap[]; share: number } {
  const instances = instancesOf(facts, known);
  if (instances.length === 0) return { gaps: [], share: 1 };
  const result = checkUsage(modelo, { instances });
  if (!result.ok) {
    // Input check_usage refuses (a slot it does not know) is counted under K2 already.
    return {
      gaps: result.issues.map((issue) => ({ kind: "regulo" as const, key: issue.rule })),
      share: 0,
    };
  }
  const errors = result.output.violations.filter(
    (violation) => violation.issue.severity === "error",
  );
  const gaps = errors.map((violation) => ({
    kind: "regulo" as const,
    key: violation.issue.regulo?.name ?? violation.issue.rule,
  }));
  return { gaps, share: Math.max(0, 1 - errors.length / instances.length) };
}

// --- K5: raw values and rebuilt Eroj ---------------------------------------------------------

function declarations(css: string): [string, string][] {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/[;{}]/)
    .map((part) => part.trim())
    .flatMap((part) => {
      const colon = part.indexOf(":");
      if (colon <= 0) return [];
      const property = part.slice(0, colon).trim().toLowerCase();
      if (!/^[a-z-]+$/.test(property)) return [];
      return [[property, part.slice(colon + 1).trim()] as [string, string]];
    });
}

function rawValue(property: string, value: string): boolean {
  if (!DESIGN_PROPERTY.test(property)) return false;
  const stripped = value
    .replace(/var\(--fm-[a-z0-9-]+(,[^)]*)?\)/gi, "")
    .replace(/calc\(|\)|!important/gi, "")
    .trim();
  if (stripped === "") return false;
  return stripped.split(/\s+/).some((part) => !ALLOWED_VALUE.test(part) && LITERAL.test(part));
}

function lintGaps(facts: Facts, known: Known): Gap[] {
  const gaps: Gap[] = [];
  for (const [index, element] of facts.elements.entries()) {
    const styles = [element.attrs.style ?? "", element.tag === "style" ? element.text : ""];
    for (const css of styles) {
      for (const [property, value] of declarations(css)) {
        if (rawValue(property, value)) gaps.push({ kind: "raw-value", key: property });
      }
    }
    if (eroAncestor(facts.elements, index, known) !== -1) continue;
    if (element.tag === "a" && element.attrs.href !== undefined) {
      gaps.push({ kind: "rebuilt-ero", key: "a" });
    } else if (
      REBUILT.has(element.tag) &&
      !(element.tag === "input" && element.attrs.type === "hidden")
    ) {
      gaps.push({ kind: "rebuilt-ero", key: element.tag });
    } else if (
      element.attrs.role !== undefined &&
      REBUILT_ROLE.test(element.attrs.role) &&
      !element.tag.startsWith("fm-")
    ) {
      gaps.push({ kind: "rebuilt-ero", key: `role=${element.attrs.role}` });
    }
  }
  return gaps;
}

// --- K6: the acceptance criteria ---------------------------------------------------------------

interface Selector {
  tag: string;
  conditions: { name: string; op: "" | "=" | "^="; value: string }[];
}

function parseSelector(text: string): Selector[] {
  return text.split(",").map((part) => {
    const trimmed = part.trim();
    const tag = /^[a-z0-9-]*/i.exec(trimmed)?.[0] ?? "";
    const conditions = [...trimmed.matchAll(/\[([a-z-]+)(?:(\^?=)([^\]]*))?\]/gi)].map((match) => ({
      name: match[1] ?? "",
      op: (match[2] ?? "") as "" | "=" | "^=",
      value: (match[3] ?? "").replace(/^["']|["']$/g, ""),
    }));
    return { tag: tag.toLowerCase(), conditions };
  });
}

function matches(element: Element, selector: Selector): boolean {
  if (selector.tag !== "" && element.tag !== selector.tag) return false;
  return selector.conditions.every((condition) => {
    const value = element.attrs[condition.name];
    if (value === undefined) return false;
    if (condition.op === "=") return value === condition.value;
    if (condition.op === "^=") return value.startsWith(condition.value);
    return true;
  });
}

function within(count: number, kontrolo: NordsteloKontrolo): boolean {
  return count >= (kontrolo.min ?? 1) && (kontrolo.max === undefined || count <= kontrolo.max);
}

/** true or false where the criterion decides the variant, null where it has no check for it. */
export function holds(kontrolo: NordsteloKontrolo, facts: Facts, variant: Variant): boolean | null {
  switch (kontrolo.kind) {
    case "aria": {
      const role = new RegExp(`^(${kontrolo.role ?? "[a-z]+"})$`);
      const name = kontrolo.name === undefined ? undefined : new RegExp(kontrolo.name, "i");
      const count = facts.aria.filter(
        (node) =>
          role.test(node.role) &&
          (name === undefined || name.test(node.name)) &&
          (kontrolo.level === undefined || node.level === kontrolo.level),
      ).length;
      return within(count, kontrolo);
    }
    case "named-fields": {
      const fields = facts.aria.filter((node) => FIELD_ROLE.test(node.role));
      return fields.length > 0 && fields.every((node) => node.name.trim() !== "");
    }
    case "elemento": {
      const selector = variant === "F" ? kontrolo.F : kontrolo["0"];
      if (selector === undefined) return null;
      const selectors = parseSelector(selector);
      const count = facts.elements.filter((element) =>
        selectors.some((entry) => matches(element, entry)),
      ).length;
      return within(count, kontrolo);
    }
    case "teksto": {
      const text = [
        ...facts.elements
          .filter((element) => element.tag !== "style" && element.tag !== "script")
          .map((element) => element.text),
        ...facts.aria.map((node) => node.name),
      ].join(" \n");
      return new RegExp(kontrolo.pattern ?? ".", "i").test(text);
    }
  }
}

// --- the gate: Markenfähigkeit (Nachlese 11 ②) -------------------------------------------------

/** The Dimensioj a render switches; the first render (komuna, light, default) is the base. */
export type Sxaltilo = "aspekto" | "color-scheme" | "contrast";

export interface Multmarkeco {
  /** Which switch the page follows. */
  follows: Record<Sxaltilo, boolean>;
  /** Per render of the facts: whether the page follows its combination. */
  renders: boolean[];
  /** Share of the renders whose combination the page follows, 0–1. */
  share: number;
}

const BASE: Readonly<Record<Sxaltilo, string>> = {
  aspekto: "komuna",
  "color-scheme": "light",
  contrast: "default",
};

const switched = (render: Render, sxaltilo: Sxaltilo): string =>
  sxaltilo === "aspekto"
    ? render.aspekto
    : sxaltilo === "color-scheme"
      ? render.scheme
      : render.contrast;

/**
 * Which combinations a page follows, read from its stored facts (deterministic, no new render).
 * A page that uses Fundamento — an Ero, a Sxablono or a variable --fm-* — follows the data-fm-*
 * of the root in every switch, unless it pins one on an element of its own (data-fm-aspekto,
 * data-fm-color-scheme, data-fm-contrast). Without Fundamento a page follows no brand; it follows
 * the colour scheme with a media query prefers-color-scheme or color-scheme: … dark of its own,
 * the contrast with prefers-contrast. A render counts where the page follows every switch in which
 * it differs from the base; the base counts where at least one other render does.
 */
export function multmarkeco(facts: Facts, modelo: Modelo): Multmarkeco {
  const known = knownOf(modelo);
  const css = facts.elements
    .flatMap((element) => [element.attrs.style ?? "", element.tag === "style" ? element.text : ""])
    .join("\n");
  const fundamento =
    /var\(--fm-/.test(css) ||
    facts.elements.some((element) => {
      const name = fmName(element.tag);
      return name !== undefined && (known.eroj.has(name) || known.sxablonoj.has(name));
    });
  const pinned = (sxaltilo: Sxaltilo) =>
    facts.elements.some((element) => element.attrs[`data-fm-${sxaltilo}`] !== undefined);
  const follows: Record<Sxaltilo, boolean> = {
    aspekto: fundamento && !pinned("aspekto"),
    "color-scheme":
      (fundamento && !pinned("color-scheme")) ||
      /prefers-color-scheme\s*:\s*dark|color-scheme\s*:[^;}]*\bdark\b/i.test(css),
    contrast: (fundamento && !pinned("contrast")) || /prefers-contrast\s*:/i.test(css),
  };
  const switches = Object.keys(BASE) as Sxaltilo[];
  const differing = (render: Render) =>
    switches.filter((sxaltilo) => switched(render, sxaltilo) !== BASE[sxaltilo]);
  const others = facts.renders.map(
    (render) =>
      differing(render).length > 0 && differing(render).every((sxaltilo) => follows[sxaltilo]),
  );
  const any = others.some(Boolean);
  const renders = facts.renders.map((render, index) =>
    differing(render).length === 0 ? any : (others[index] ?? false),
  );
  const counted = renders.filter(Boolean).length;
  return {
    follows,
    renders,
    share: facts.renders.length === 0 ? 0 : counted / facts.renders.length,
  };
}

// --- the score ---------------------------------------------------------------------------------

export function score(input: ScoreInput): Score {
  const { facts, tasko, variant, modelo, pezoj } = input;
  const gated = new Set(input.pordego ?? []);
  const gate = gated.size === 0 ? undefined : multmarkeco(facts, modelo);
  const known = knownOf(modelo);
  const gaps: Gap[] = [];

  const empty =
    facts.elements.filter((element) => element.tag !== "style" && element.tag !== "script")
      .length === 0;
  for (const line of facts.console)
    gaps.push({ kind: "render", key: line.split("\n")[0]?.slice(0, 120) ?? "" });
  if (empty) gaps.push({ kind: "render", key: "empty page" });
  const k1 = facts.console.length === 0 && !empty ? 1 : 0;

  let k2: number | null = null;
  let k3: number | null = null;
  if (variant === "F") {
    const invented = inventedGaps(facts, known);
    gaps.push(...invented.gaps);
    k2 = invented.used === 0 ? 0 : Math.max(0, 1 - invented.gaps.length / invented.used);
    const reguloj = reguloGaps(facts, known, modelo);
    gaps.push(...reguloj.gaps);
    k3 = invented.used === 0 ? 0 : reguloj.share;
  }

  // With the gate K4 counts only the renders the page follows (Nachlese 11 ②).
  const counts = (index: number) => !gated.has("K4") || gate?.renders[index] === true;
  const clean = facts.renders.filter(
    (render, index) => render.axe.length === 0 && counts(index),
  ).length;
  for (const render of facts.renders)
    for (const finding of render.axe) gaps.push({ kind: "a11y", key: finding.id });
  const k4 = facts.renders.length === 0 ? 0 : clean / facts.renders.length;

  const lint = lintGaps(facts, known);
  gaps.push(...lint);
  const k5 = Math.max(0, 1 - K5_STEP * lint.length) * (gated.has("K5") ? (gate?.share ?? 0) : 1);

  let decided = 0;
  let held = 0;
  for (const kriterio of tasko.kriterioj) {
    const result = holds(kriterio.kontrolo, facts, variant);
    if (result === null) continue;
    decided += 1;
    if (result) held += 1;
    else gaps.push({ kind: "criterion", key: `${tasko.name}: ${kriterio.teksto.de}` });
  }
  const k6 = decided === 0 ? null : held / decided;

  const k: Record<Kriterio, number | null> = {
    K1: k1,
    K2: k2 === null ? null : round4(k2),
    K3: k3 === null ? null : round4(k3),
    K4: round4(k4),
    K5: round4(k5),
    K6: k6 === null ? null : round4(k6),
  };
  let weighted = 0;
  let weights = 0;
  for (const pezo of pezoj) {
    const value = k[pezo.kriterio];
    if (value === null) continue;
    weighted += pezo.pezo * value;
    weights += pezo.pezo;
  }
  return {
    k,
    total: weights === 0 ? 0 : round1((100 * weighted) / weights),
    gaps: sortGaps(gaps),
    ...(gate === undefined ? {} : { multmarkeco: round4(gate.share) }),
  };
}

/** One result in both weightings of the catalogue (Nachlese 11 ②). */
export interface Scores {
  /** The weights of the catalogue with the gate of Markenfähigkeit. */
  nova: Score;
  /** The weights before (Spec 030), without the gate; the catalogue's own where it has none. */
  antauxa: Score;
}

export function scoreBoth(
  input: Omit<ScoreInput, "pezoj" | "pordego">,
  katalogo: Pick<NordsteloFile, "pezoj" | "pezojAntauxaj" | "multmarkeco">,
): Scores {
  return {
    nova: score({
      ...input,
      pezoj: katalogo.pezoj,
      ...(katalogo.multmarkeco === undefined ? {} : { pordego: katalogo.multmarkeco.kriterioj }),
    }),
    antauxa: score({ ...input, pezoj: katalogo.pezojAntauxaj?.pezoj ?? katalogo.pezoj }),
  };
}
