// check_markup (Spec 038 MG-2, 1.2, 1.5; D-22, D-23, D-29): markup as an agent writes it, judged
// by check_usage. Three steps, each in one place:
// - `legiMarkon`: a small deterministic reader of the markup text into the flat element list
//   nordstelo's facts carry (tag, attributes, parent, own text) – the twin of ekranoj's
//   `elementojDe` (fakto-statika.ts), which the Modelo cannot import; the browser stays the
//   reference (no repair of broken markup, D-23: no parser package);
// - `instancojElElementoj`: the one derivation of Ero instances from such a list (D-22), the
//   semantics of nordstelo's `instancesOf` (the AC-8 oracle): an `fm-<name>` element whose name is
//   an Ero; props typed by its Skemo (unknown props and values out of the enum dropped, "false"
//   false, finite numbers only); what stands in a slot the Skemo knows (`{ ero }` for an Ero,
//   else "text") with its text; the label from the own and the unslotted text; the nearest `fm-*`
//   ancestor as container `<name>-<n>` in order of first use; the language as two letters;
// - `checkMarkup`: reader + core + `checkUsage` on the Ero instances (`rezulto`, as K3 and
//   ekranoj judge, D-29), and the Sxablonoj of the page with their regions found by the region
//   markers (MG-5, `markerOf`), judged apart (`sxablonoRezulto`, informative only). Pure.
//   Spec 046 L5-1: before the core, a child in slot="<the default slot>" of an Ero goes to the
//   default slot, as the Web Component's `#adoptDefault` does it in the browser (`adoptDefault`).
//   Spec 046 L5-3: a `uzo-slot-accepts` suggestion names the child the markup put in the slot.

import type { ValidationIssue } from "../contracts/issues.js";
import type {
  EroInstance,
  LoadedEro,
  LoadedSxablono,
  Modelo,
  SkemoProp,
  SxablonoInstance,
} from "../contracts/modelo.js";
import { type CheckUsageOutput, checkUsage } from "./check-usage.js";
import { evaluateSxablonoUsage, markerOf } from "./sxablonoj.js";

/**
 * One element of the light DOM in document order: structurally the `Element` of nordstelo's facts
 * and ekranoj's `FaktoElemento`, so both hand their lists to the core unchanged.
 */
export interface GvidantoElemento {
  tag: string;
  attrs: Record<string, string>;
  /** The index of the parent element in the list, -1 at the top. */
  parent: number;
  /** The element's own text nodes, whitespace collapsed. */
  text: string;
}

// --- The reader (D-23) ---------------------------------------------------------------------------

/** Void elements: never opened. */
const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
/** Elements whose content is text, not markup. */
const RAW = new Set(["script", "style", "textarea", "title"]);
/** The document's own wrappers: not part of the fragment. */
const FRAME = new Set(["html", "head", "body"]);

const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const TOKEN =
  /<!--[\s\S]*?-->|<![^>]*>|<\/\s*([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const decode = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X"))
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return ENTITIES[entity.toLowerCase()] ?? whole;
  });

function attributesOf(text: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const found of text.replace(/\/\s*$/, "").matchAll(ATTRIBUTE)) {
    const name = (found[1] ?? "").toLowerCase();
    if (name === "" || Object.hasOwn(attrs, name)) continue;
    attrs[name] = decode(found[2] ?? found[3] ?? found[4] ?? "");
  }
  return attrs;
}

/**
 * The light DOM of a markup fragment as the browser would mostly see it (no repair of broken
 * markup): the elements in document order without `html`/`head`/`body`, and the language of
 * `<html lang>` where the fragment carries one.
 */
export function legiMarkon(fragment: string): { elementoj: GvidantoElemento[]; lingvo?: string } {
  const elementoj: GvidantoElemento[] = [];
  const stack: { tag: string; index: number }[] = [];
  const texts: string[][] = [];
  const token = new RegExp(TOKEN.source, "g");
  let lingvo: string | undefined;
  const current = () => stack.at(-1)?.index ?? -1;
  const add = (text: string) => {
    const index = current();
    if (index === -1) return;
    const collapsed = collapse(decode(text));
    if (collapsed !== "") texts[index]?.push(collapsed);
  };
  let pos = 0;
  for (let found = token.exec(fragment); found !== null; found = token.exec(fragment)) {
    add(fragment.slice(pos, found.index));
    pos = token.lastIndex;
    const closing = found[1]?.toLowerCase();
    const opening = found[2]?.toLowerCase();
    if (closing !== undefined) {
      if (FRAME.has(closing)) continue;
      const at = stack.map((entry) => entry.tag).lastIndexOf(closing);
      if (at !== -1) stack.length = at;
      continue;
    }
    if (opening === undefined) continue;
    const attrs = attributesOf(found[3] ?? "");
    if (FRAME.has(opening)) {
      if (opening === "html" && attrs.lang !== undefined) lingvo = attrs.lang;
      continue;
    }
    const index = elementoj.length;
    elementoj.push({ tag: opening, attrs, parent: current(), text: "" });
    texts.push([]);
    if (RAW.has(opening)) {
      const end = fragment.toLowerCase().indexOf(`</${opening}`, pos);
      const content = fragment.slice(pos, end === -1 ? fragment.length : end);
      const collapsed = collapse(
        opening === "style" || opening === "script" ? content : decode(content),
      );
      if (collapsed !== "") texts[index]?.push(collapsed);
      const after = end === -1 ? fragment.length : fragment.indexOf(">", end);
      pos = after === -1 ? fragment.length : after + 1;
      token.lastIndex = pos;
      continue;
    }
    const selfClosed = /\/\s*$/.test(found[3] ?? "");
    if (!VOID.has(opening) && !selfClosed) stack.push({ tag: opening, index });
  }
  add(fragment.slice(pos));
  for (const [index, element] of elementoj.entries()) element.text = (texts[index] ?? []).join(" ");
  return lingvo === undefined ? { elementoj } : { elementoj, lingvo };
}

// --- The core (D-22) -----------------------------------------------------------------------------

const fmName = (tag: string): string | undefined =>
  tag.startsWith("fm-") ? tag.slice(3) : undefined;

const childrenOf = (elementoj: readonly GvidantoElemento[], index: number): number[] =>
  elementoj.flatMap((element, i) => (element.parent === index ? [i] : []));

/** The text of an element and everything below it. */
function textOf(elementoj: readonly GvidantoElemento[], index: number): string {
  const element = elementoj[index];
  if (element === undefined) return "";
  return [element.text, ...childrenOf(elementoj, index).map((child) => textOf(elementoj, child))]
    .filter((part) => part !== "")
    .join(" ");
}

/** The index of the nearest ancestor that is any fm-* element, -1 if none. */
function fmAncestor(elementoj: readonly GvidantoElemento[], index: number): number {
  let parent = elementoj[index]?.parent ?? -1;
  while (parent !== -1) {
    if ((elementoj[parent]?.tag ?? "").startsWith("fm-")) return parent;
    parent = elementoj[parent]?.parent ?? -1;
  }
  return -1;
}

/** The attributes that are props of the Skemo, typed by it; anything else is dropped. */
function typedProps(
  props: readonly SkemoProp[],
  attrs: Readonly<Record<string, string>>,
): EroInstance["props"] {
  const typed: EroInstance["props"] = {};
  for (const prop of props) {
    const value = attrs[prop.name];
    if (value === undefined) continue;
    if (prop.kind === "boolean") typed[prop.name] = value !== "false";
    else if (prop.kind === "number") {
      const number = Number(value);
      if (Number.isFinite(number)) typed[prop.name] = number;
    } else if (prop.kind === "enum") {
      if ((prop.values ?? []).includes(value)) typed[prop.name] = value;
    } else typed[prop.name] = value;
  }
  return typed;
}

const erojOf = (modelo: Modelo): Map<string, LoadedEro> =>
  new Map(modelo.eroj.map((entry) => [entry.ero.name, entry]));

const sxablonojOf = (modelo: Modelo): Map<string, LoadedSxablono> =>
  new Map((modelo.sxablonoj ?? []).map((entry) => [entry.sxablono.name, entry]));

/**
 * The one derivation of the Ero instances of a page from its element list (D-22): what K3 of
 * nordstelo (with `facts.elements`) and check_markup (with the read markup) judge. `lingvo` is the
 * language of the page as given (`de-CH`, `DE`); an instance carries its first two letters, lower
 * case, where they are two letters.
 */
export function instancojElElementoj(
  elementoj: readonly GvidantoElemento[],
  modelo: Modelo,
  options: { lingvo?: string } = {},
): EroInstance[] {
  return instancojEnElementoj(elementoj, modelo, options).map(({ instanco }) => instanco);
}

/** The Ero instances of `instancojElElementoj`, each with the index of its element. */
function instancojEnElementoj(
  elementoj: readonly GvidantoElemento[],
  modelo: Modelo,
  options: { lingvo?: string },
): { elemento: number; instanco: EroInstance }[] {
  const eroj = erojOf(modelo);
  const instances: { elemento: number; instanco: EroInstance }[] = [];
  const containers = new Map<number, string>();
  const lingvo = (options.lingvo ?? "").slice(0, 2).toLowerCase();
  for (const [index, element] of elementoj.entries()) {
    const name = fmName(element.tag);
    const entry = name === undefined ? undefined : eroj.get(name);
    if (name === undefined || entry === undefined) continue;
    const props = typedProps(entry.skemo.props, element.attrs);
    const slotNames = new Set((entry.skemo.slots ?? []).map((slot) => slot.name));
    const children = childrenOf(elementoj, index);
    const texts: Record<string, string | string[]> = {};
    const slots: NonNullable<EroInstance["slots"]> = {};
    for (const child of children) {
      const slot = elementoj[child]?.attrs.slot;
      if (slot === undefined || !slotNames.has(slot)) continue;
      const childName = fmName(elementoj[child]?.tag ?? "");
      const filled = slots[slot] ?? [];
      filled.push(childName !== undefined && eroj.has(childName) ? { ero: childName } : "text");
      slots[slot] = filled;
      const text = textOf(elementoj, child);
      const previous = texts[slot];
      texts[slot] =
        previous === undefined
          ? text
          : [...(Array.isArray(previous) ? previous : [previous]), text];
    }
    const label = [
      element.text,
      ...children
        .filter((child) => elementoj[child]?.attrs.slot === undefined)
        .map((child) => textOf(elementoj, child)),
    ]
      .filter((part) => part !== "")
      .join(" ");
    const container = fmAncestor(elementoj, index);
    if (container !== -1 && !containers.has(container)) {
      containers.set(
        container,
        `${fmName(elementoj[container]?.tag ?? "") ?? ""}-${containers.size + 1}`,
      );
    }
    instances.push({
      elemento: index,
      instanco: {
        ero: name,
        props,
        ...(label === "" ? {} : { label }),
        ...(Object.keys(texts).length === 0 ? {} : { texts }),
        ...(Object.keys(slots).length === 0 ? {} : { slots }),
        ...(container === -1 ? {} : { container: containers.get(container) ?? "" }),
        ...(/^[a-z]{2}$/.test(lingvo) ? { lingvo } : {}),
      },
    });
  }
  return instances;
}

// --- The default slot as the Eroj adopt it (Spec 046 L5-1, D-22) ---------------------------------

/**
 * The element list as the browser holds it once the Eroj are connected: the Web Component of an
 * Ero with a default slot takes a direct child with slot="<that slot's name>" into the default
 * slot by removing the attribute (`#adoptDefault`, element-template.ts, Nachlese 11 B-2). The same
 * here, so the core sees what the person sees: `<fm-butono><span slot="label">` is the label.
 * Only direct children of an Ero, only its own default slot; the list is not changed in place.
 */
function adoptDefault(elementoj: readonly GvidantoElemento[], modelo: Modelo): GvidantoElemento[] {
  const eroj = erojOf(modelo);
  const defaultOf = (index: number): string | undefined => {
    const name = fmName(elementoj[index]?.tag ?? "");
    const ero = name === undefined ? undefined : eroj.get(name);
    return ero?.skemo.slots?.find((slot) => slot.default === true)?.name;
  };
  return elementoj.map((element) => {
    const slot = element.attrs.slot;
    if (slot === undefined || element.parent === -1 || defaultOf(element.parent) !== slot) {
      return element;
    }
    const { slot: _adopted, ...attrs } = element.attrs;
    return { ...element, attrs };
  });
}

// --- The found child in a uzo-slot-accepts suggestion (Spec 046 L5-3) ----------------------------

type SlotEntry = NonNullable<EroInstance["slots"]>[string][number];

/** How a suggestion names what a slot accepts: an Ero by its tag, a kind ("text") as it is. */
const acceptedName = (accepted: string, eroj: ReadonlyMap<string, LoadedEro>): string =>
  eroj.has(accepted) ? `fm-${accepted}` : accepted;

/**
 * The suggestion of one `uzo-slot-accepts` finding with the child the markup put in the slot
 * (`<div>`, `<fm-avizo>`), where check_usage, seeing only "text" or an Ero name, cannot name it.
 * A wrapper element around Eroj the slot accepts is the common case: the slot belongs on each Ero.
 */
function acceptsSuggestion(
  tag: string,
  slot: string,
  accepts: readonly string[],
  eroj: ReadonlyMap<string, LoadedEro>,
): string {
  const named = accepts.map((accepted) => acceptedName(accepted, eroj)).join(" or ");
  const acceptedEroj = accepts.filter((accepted) => eroj.has(accepted));
  if (fmName(tag) === undefined && acceptedEroj.length > 0) {
    const tags = acceptedEroj.map((accepted) => `fm-${accepted}`).join(" or ");
    return `The slot ${slot} holds a <${tag}>, and it accepts ${named}: set slot="${slot}" directly on each ${tags} instead of on the wrapping <${tag}>.`;
  }
  return `The slot ${slot} holds a <${tag}>, and it accepts ${named}: put ${named} in the slot ${slot} instead.`;
}

/**
 * The `uzo-slot-accepts` findings of check_usage with suggestions that name the found child. The
 * findings of one instance come in the order check_usage judges its slot entries (slots in the
 * order of their first entry, entries in document order, a slot a boundary covers skipped); the
 * offending children are found in the same order. Where the counts differ, nothing is renamed.
 */
function nameFoundChildren(
  rezulto: CheckUsageOutput,
  elementoj: readonly GvidantoElemento[],
  instancoj: readonly { elemento: number; instanco: EroInstance }[],
  modelo: Modelo,
): CheckUsageOutput {
  const eroj = erojOf(modelo);
  const found = new Map<number, string[]>();
  for (const [index, { elemento, instanco }] of instancoj.entries()) {
    const ero = eroj.get(instanco.ero);
    const uzo = ero?.uzo;
    if (ero === undefined || uzo === undefined) continue;
    const entries = instanco.slots ?? {};
    const covered = new Set(
      uzo.boundary.flatMap((boundary) =>
        boundary.via !== undefined &&
        "slot" in boundary.via &&
        (entries[boundary.via.slot] ?? []).some((entry: SlotEntry) => typeof entry === "object")
          ? [boundary.via.slot]
          : [],
      ),
    );
    const children = childrenOf(elementoj, elemento).flatMap((child) => {
      const slot = elementoj[child]?.attrs.slot;
      return slot === undefined || entries[slot] === undefined ? [] : [{ child, slot }];
    });
    const suggestions = Object.keys(entries).flatMap((slot) => {
      const accepts = uzo.slots[slot]?.accepts;
      if (accepts === undefined || covered.has(slot)) return [];
      return children.flatMap((entry) => {
        if (entry.slot !== slot) return [];
        const tag = elementoj[entry.child]?.tag ?? "";
        const name = fmName(tag);
        const kind = name !== undefined && eroj.has(name) ? name : "text";
        return accepts.includes(kind) ? [] : [acceptsSuggestion(tag, slot, accepts, eroj)];
      });
    });
    if (suggestions.length > 0) found.set(index, suggestions);
  }
  const counts = new Map<number, number>();
  for (const violation of rezulto.violations) {
    if (violation.issue.rule !== "uzo-slot-accepts") continue;
    const index = violation.instance?.[0] ?? -1;
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  const used = new Map<number, number>();
  return {
    ...rezulto,
    violations: rezulto.violations.map((violation) => {
      if (violation.issue.rule !== "uzo-slot-accepts") return violation;
      const index = violation.instance?.[0] ?? -1;
      const suggestions = found.get(index);
      if (suggestions === undefined || suggestions.length !== counts.get(index)) return violation;
      const at = used.get(index) ?? 0;
      used.set(index, at + 1);
      const suggestion = suggestions[at];
      return suggestion === undefined
        ? violation
        : { ...violation, issue: { ...violation.issue, suggestion } };
    }),
  };
}

// --- The Sxablonoj of a page (MG-5) --------------------------------------------------------------

type RegionEntry = NonNullable<SxablonoInstance["regions"]>[string][number];

/** A Sxablono instance with the index of its element in the list it was derived from. */
export interface SxablonoEnElemento {
  /** Index of the `fm-<name>` element in `elementoj`. */
  elemento: number;
  instanco: SxablonoInstance;
}

/**
 * The one derivation of the Sxablono instances of a page (MG-5): what check_markup reports as
 * `sxablonoj` and what K8 of nordstelo reads (Spec 038 S038-16, E-2), each with the index of its
 * element in `elementoj`. In document order: every `fm-<name>` element whose name is a Sxablono,
 * its props typed by its Skemo, and in each region what its markers put there – a direct child
 * with `slot` = the region's marker slot, a child without `slot` (and the element's own text) in
 * the default region; a child whose slot names no region is not shown by the browser and counts
 * nowhere. A child Ero stands as `{ ero, props }`, a Sxablono as `{ sxablono }`, anything else as
 * "text". Regions in the order of the Skemo, empty ones left out.
 */
export function sxablonojElElementoj(
  elementoj: readonly GvidantoElemento[],
  modelo: Modelo,
): SxablonoEnElemento[] {
  const eroj = erojOf(modelo);
  const sxablonoj = sxablonojOf(modelo);
  const instances: SxablonoEnElemento[] = [];
  for (const [index, element] of elementoj.entries()) {
    const name = fmName(element.tag);
    const entry = name === undefined ? undefined : sxablonoj.get(name);
    if (name === undefined || entry === undefined) continue;
    const markers = entry.skemo.regions.map((region) => ({
      region: region.name,
      marker: markerOf(modelo, entry, region),
    }));
    const regionOf = (slot: string | undefined): string | undefined =>
      markers.find(({ marker }) =>
        slot === undefined ? marker.default === true : marker.slot === slot,
      )?.region;
    const filled = new Map<string, RegionEntry[]>();
    const put = (region: string | undefined, child: RegionEntry) => {
      if (region === undefined) return;
      filled.set(region, [...(filled.get(region) ?? []), child]);
    };
    if (element.text !== "") put(regionOf(undefined), "text");
    for (const child of childrenOf(elementoj, index)) {
      const childElement = elementoj[child];
      if (childElement === undefined) continue;
      const childName = fmName(childElement.tag);
      const ero = childName === undefined ? undefined : eroj.get(childName);
      put(
        regionOf(childElement.attrs.slot),
        ero !== undefined
          ? { ero: ero.ero.name, props: typedProps(ero.skemo.props, childElement.attrs) }
          : childName !== undefined && sxablonoj.has(childName)
            ? { sxablono: childName }
            : "text",
      );
    }
    const regions: NonNullable<SxablonoInstance["regions"]> = {};
    for (const { region } of markers) {
      const children = filled.get(region);
      if (children !== undefined) regions[region] = children;
    }
    instances.push({
      elemento: index,
      instanco: { sxablono: name, props: typedProps(entry.skemo.props, element.attrs), regions },
    });
  }
  return instances;
}

// --- check_markup --------------------------------------------------------------------------------

export interface CheckMarkupInput {
  /** The markup an agent wrote: a fragment, or a document with `<html lang>`. */
  fragment: string;
  /** The language of the page where the fragment carries no `<html lang>`. */
  lingvo?: string;
  /** The Aspekto every Ero instance is shown in (check_usage validates it). */
  aspekto?: string;
  /** Dimensio values every Ero instance is shown under (check_usage validates them). */
  dimensioj?: Record<string, string>;
}

export interface CheckMarkupOutput {
  /** The Ero instances of the markup (the one derivation, D-22). */
  eroj: EroInstance[];
  /** The Sxablono instances, their regions found by the region markers (MG-5). */
  sxablonoj: SxablonoInstance[];
  /** check_usage on the Ero instances alone: what K3 and ekranoj's „grün“ rest on (D-29). */
  rezulto: CheckUsageOutput;
  /**
   * The page rules of the Sxablonoj (regions, one primary action, landmarks), apart and
   * informative only (D-29); only where the markup holds a Sxablono. `instances` counts them.
   */
  sxablonoRezulto?: CheckUsageOutput;
}

export type CheckMarkupResult =
  | { ok: true; output: CheckMarkupOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

export function checkMarkup(modelo: Modelo, input: CheckMarkupInput): CheckMarkupResult {
  if (typeof input.fragment !== "string" || input.fragment.trim() === "") {
    return {
      ok: false,
      issues: [
        {
          rule: "mcp-input-invalid",
          severity: "error",
          path: "check_markup/fragment",
          message: "The fragment holds no markup.",
          suggestion: "Pass the markup of the screen, e.g. <fm-butono>Speichern</fm-butono>.",
        },
      ],
    };
  }
  const read = legiMarkon(input.fragment);
  const elementoj = adoptDefault(read.elementoj, modelo);
  const lingvo = read.lingvo ?? input.lingvo;
  const instancoj = instancojEnElementoj(
    elementoj,
    modelo,
    lingvo === undefined ? {} : { lingvo },
  ).map(({ elemento, instanco }) => ({
    elemento,
    instanco: {
      ...instanco,
      ...(input.aspekto === undefined ? {} : { aspekto: input.aspekto }),
      ...(input.dimensioj === undefined ? {} : { dimensioj: { ...input.dimensioj } }),
    },
  }));
  const eroj = instancoj.map(({ instanco }) => instanco);
  const judged = checkUsage(modelo, { instances: eroj });
  // A refused input stays as check_usage words it (paths check_usage/…), so the clients' findings
  // stay what they were.
  if (!judged.ok) return judged;
  const rezulto = nameFoundChildren(judged.output, elementoj, instancoj, modelo);
  const sxablonoj = sxablonojElElementoj(elementoj, modelo).map(({ instanco }) => instanco);
  if (sxablonoj.length === 0) {
    return { ok: true, output: { eroj, sxablonoj, rezulto } };
  }
  const violations = evaluateSxablonoUsage(modelo, sxablonoj);
  return {
    ok: true,
    output: {
      eroj,
      sxablonoj,
      rezulto,
      sxablonoRezulto: {
        instances: sxablonoj.length,
        valid: violations.every((violation) => violation.issue.severity !== "error"),
        violations,
      },
    },
  };
}
