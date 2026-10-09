// Uzo rules beyond the schema (Spec 007, data-model §2.2). Pure: the loaded Modelo and the raw Uzo
// files in, issues out. A Uzo describes how one Ero is used, so everything it names must exist for
// that Ero: the Skemo next to it, the Eroj it points to, the slots and boolean props of the Skemo,
// and the Reguloj that apply to the Ero. Like the Skemo rules they read the Uzo after schema
// validation, but never trust its shape: a value the schema rejected is skipped, not reported twice.

import { DESIGN_PREFIXES, STRUCTURAL_PROPERTIES } from "../checks/vortaro-lint/component-css.js";
import { PHYSICAL_PROPERTIES } from "../checks/vortaro-lint/css-physical.js";
import { NAMING_ATTRIBUTES } from "../checks/vortaro-lint/ero-strings.js";
import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import type { Jugxo, LoadedEro, Modelo, Regulo } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import type { ModeloFiles } from "../load/files.js";
import { isJsonObject, type JsonObject } from "../validate/raw.js";

/** What a slot accepts besides an Ero name (data-model §2.1, UzoSlot). */
const SLOT_CONTENT_KINDS: ReadonlySet<string> = new Set(["text", "icon"]);

/** The keys of `layout` that are no boolean prop (data-model §2.1, UzoLayout). */
const LAYOUT_KEYS: ReadonlySet<string> = new Set(["size", "wrap"]);

type At = (pointer: string, rule: RuleId, message: string, suggestion: string) => void;

/** Every Uzo issue of the Modelo. */
export function uzoIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const atIn =
    (file: string): At =>
    (pointer, rule, message, suggestion) =>
      issues.push({
        rule,
        severity: "error",
        path: formatIssuePath({ file, pointer }),
        message,
        suggestion,
      });

  const skemoFolders = new Set(files.eroj.map((document) => folderOf(document.file)));
  for (const document of files.uzoj) {
    if (!skemoFolders.has(folderOf(document.file))) {
      atIn(document.file)(
        "/uzo/skemo",
        "uzo-skemo-missing",
        `${document.file} has no skemo.json next to it; a Uzo describes the use of the Ero whose Skemo lies in the same folder.`,
        `Add the Ero and its Skemo as skemo.json in ${folderOf(document.file)}/, or move the Uzo into the folder of its Ero.`,
      );
    }
  }

  const eroNames = new Set(modelo.eroj.map((entry) => entry.ero.name));
  for (const entry of modelo.eroj) {
    if (entry.uzo === undefined || entry.uzoFile === undefined) continue;
    const uzo = entry.uzo as unknown as JsonObject;
    const at = atIn(entry.uzoFile);
    issues.push(...uzoWebTermIssues(entry.uzoFile, uzo));
    pairIssues(entry, uzo, at);
    eroIssues(entry, uzo, eroNames, at);
    kialoIssues(entry, uzo, at);
    slotIssues(entry, uzo, at);
    layoutIssues(entry, uzo, at);
    boundaryIssues(entry, uzo, at);
    reguloIssues(entry, uzo, modelo, at);
    contentIssues(entry, uzo, modelo, at);
  }
  return issues;
}

/**
 * `uzo-web-term` (A6, Art. VIII, D-09): a string of the Uzo that is a CSS property, a CSS value
 * with a unit or a DOM term. `uzo` is the value of the file's `uzo` key; paths point into `file`.
 */
export function uzoWebTermIssues(file: string, uzo: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const visit = (value: unknown, pointer: string): void => {
    if (typeof value === "string") {
      const term = webTermIn(value);
      if (term === undefined) return;
      issues.push({
        rule: "uzo-web-term",
        severity: "error",
        path: formatIssuePath({ file, pointer }),
        message: `${JSON.stringify(term)} in the Uzo is a web term (CSS or DOM); a Uzo speaks of the Ero, not of one platform (Art. VIII).`,
        suggestion:
          "Use the platform-neutral words of the Uzo (size content or container, wrap never or allowed, a container kind such as action-bar); the projections translate them.",
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        visit(item, `${pointer}/${index}`);
      });
    } else if (isJsonObject(value)) {
      for (const [key, item] of Object.entries(value)) visit(item, appendPointer(pointer, key));
    }
  };
  visit(uzo, "/uzo");
  return issues;
}

/**
 * Units a CSS length, time or angle carries. The Modelo knows px, ms and s (DTCG); the rest are
 * the CSS units a hand-written layout rule would reach for.
 */
const CSS_UNITS = ["px", "rem", "em", "%", "vh", "vw", "vmin", "vmax", "dvh", "svh", "lvh"]
  .concat(["ch", "ex", "pt", "fr", "deg", "ms", "s"])
  .join("|");
const CSS_VALUE_WITH_UNIT = new RegExp(`^[+-]?(\\d+(\\.\\d*)?|\\.\\d+)(${CSS_UNITS})$`);

/** CSS properties as check:vortaro-lint lists them (component and physical-property rules). */
const CSS_PROPERTIES: ReadonlySet<string> = new Set([
  ...STRUCTURAL_PROPERTIES,
  ...Object.keys(PHYSICAL_PROPERTIES),
  ...Object.values(PHYSICAL_PROPERTIES),
]);

/** DOM terms: the attributes check:vortaro-lint reads as spoken or shown text. */
const DOM_TERMS: ReadonlySet<string> = new Set(NAMING_ATTRIBUTES);

const isCssProperty = (word: string): boolean =>
  CSS_PROPERTIES.has(word) ||
  DESIGN_PREFIXES.some((prefix) => word === prefix || word.startsWith(`${prefix}-`));

/**
 * The web term a string is or contains. The whole string is a term when it is a CSS property, a
 * value with a unit or a DOM term. Inside a sentence only what cannot be prose counts: a
 * hyphenated property (`white-space`), a DOM term or a value with a unit. A plain word such as
 * "height" or "color" in a kialo is English, not CSS.
 */
function webTermIn(value: string): string | undefined {
  const whole = value.trim().toLowerCase();
  if (isCssProperty(whole) || DOM_TERMS.has(whole) || CSS_VALUE_WITH_UNIT.test(whole)) {
    return whole;
  }
  for (const raw of whole.split(/[^a-z0-9%.+-]+/)) {
    const word = raw.replace(/^[.+-]+|[.-]+$/g, "");
    if (word.includes("-") && (isCssProperty(word) || DOM_TERMS.has(word))) return word;
    if (CSS_VALUE_WITH_UNIT.test(word)) return word;
  }
  return undefined;
}

/** The folder part of a Modelo-relative path. */
function folderOf(file: string): string {
  return file.slice(0, file.lastIndexOf("/"));
}

/** The object entries of a list, with their index; anything else is the schema's business. */
function objects(value: unknown): { item: JsonObject; index: number }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => (isJsonObject(item) ? [{ item, index }] : []));
}

function objectAt(value: JsonObject, key: string): JsonObject {
  const child = value[key];
  return isJsonObject(child) ? child : {};
}

function stringAt(value: JsonObject, key: string): string | undefined {
  const child = value[key];
  return typeof child === "string" ? child : undefined;
}

/** `uzo-skemo-missing` (also for the Ero): the Uzo names the Ero and Skemo next to it. */
function pairIssues(entry: LoadedEro, uzo: JsonObject, at: At): void {
  const { ero, skemo } = entry;
  const skemoId = stringAt(uzo, "skemo");
  if (skemoId !== undefined && skemoId !== skemo.id) {
    at(
      "/uzo/skemo",
      "uzo-skemo-missing",
      `The Uzo of ${ero.name} names the Skemo ${skemoId}, but the Skemo next to it is ${skemo.id}.`,
      `Set uzo.skemo to ${skemo.id}.`,
    );
  }
  const eroId = stringAt(uzo, "ero");
  if (eroId !== undefined && eroId !== ero.id) {
    at(
      "/uzo/ero",
      "uzo-skemo-missing",
      `The Uzo of ${ero.name} names the Ero ${eroId}, but the Skemo next to it belongs to ${ero.id}.`,
      `Set uzo.ero to ${ero.id}.`,
    );
  }
}

/** `uzo-ero-unknown`: every Ero the Uzo points to exists. */
function eroIssues(entry: LoadedEro, uzo: JsonObject, eroNames: ReadonlySet<string>, at: At): void {
  const known = [...eroNames].join(", ");
  const check = (pointer: string, name: unknown, where: string) => {
    if (typeof name !== "string" || eroNames.has(name)) return;
    at(
      pointer,
      "uzo-ero-unknown",
      `The Uzo of ${entry.ero.name} names the Ero ${name} in ${where}, which does not exist.`,
      `Name an existing Ero (${known}), or use null in instead when Fundamento does not cover the case yet.`,
    );
  };
  for (const { item, index } of objects(uzo.instead)) {
    check(`/uzo/instead/${index}/ero`, item.ero, "instead");
  }
  for (const { item, index } of objects(uzo.boundary)) {
    check(`/uzo/boundary/${index}/ero`, item.ero, "boundary");
  }
  const composes = objectAt(uzo, "composes");
  for (const key of ["with", "never"] as const) {
    for (const { item, index } of objects(composes[key])) {
      check(`/uzo/composes/${key}/${index}/ero`, item.ero, `composes.${key}`);
    }
  }
  for (const [slot, rule] of Object.entries(objectAt(uzo, "slots"))) {
    if (!isJsonObject(rule) || !Array.isArray(rule.accepts)) continue;
    rule.accepts.forEach((accepted: unknown, index) => {
      if (typeof accepted === "string" && SLOT_CONTENT_KINDS.has(accepted)) return;
      check(
        `${appendPointer("/uzo/slots", slot)}/accepts/${index}`,
        accepted,
        `slots.${slot}.accepts`,
      );
    });
  }
}

/** `uzo-kialo-missing`: every alternative, boundary and relation says why (Art. VI). */
function kialoIssues(entry: LoadedEro, uzo: JsonObject, at: At): void {
  const composes = objectAt(uzo, "composes");
  const lists: [string, unknown][] = [
    ["/uzo/instead", uzo.instead],
    ["/uzo/boundary", uzo.boundary],
    ["/uzo/composes/containers", composes.containers],
    ["/uzo/composes/with", composes.with],
    ["/uzo/composes/never", composes.never],
  ];
  for (const [base, list] of lists) {
    for (const { item, index } of objects(list)) {
      const kialo = item.kialo;
      if (typeof kialo === "string" && kialo.trim() !== "") continue;
      at(
        `${base}/${index}`,
        "uzo-kialo-missing",
        `${base.slice("/uzo/".length)}[${index}] of the Uzo of ${entry.ero.name} has no kialo.`,
        "Say why, in one or two sentences an agent can pass on: a rule without its reason is an order (Art. VI).",
      );
    }
  }
}

/** `uzo-slot-unknown`: slot rules name slots of the Skemo. */
function slotIssues(entry: LoadedEro, uzo: JsonObject, at: At): void {
  const slots = entry.skemo.slots.map((slot) => slot.name);
  for (const slot of Object.keys(objectAt(uzo, "slots"))) {
    if (slots.includes(slot)) continue;
    at(
      appendPointer("/uzo/slots", slot),
      "uzo-slot-unknown",
      `The Uzo of ${entry.ero.name} rules the slot ${slot}, which its Skemo does not have.`,
      `Rule a slot of the Skemo (${slots.join(", ") || "none"}), or add the slot to the Skemo first.`,
    );
  }
}

/** `uzo-prop-unknown`: every layout key besides size and wrap is a boolean prop of the Skemo. */
function layoutIssues(entry: LoadedEro, uzo: JsonObject, at: At): void {
  const booleans = entry.skemo.props
    .filter((prop) => prop.kind === "boolean")
    .map((prop) => prop.name);
  for (const key of Object.keys(objectAt(uzo, "layout"))) {
    if (LAYOUT_KEYS.has(key) || booleans.includes(key)) continue;
    at(
      appendPointer("/uzo/layout", key),
      "uzo-prop-unknown",
      `layout.${key} of the Uzo of ${entry.ero.name} is no boolean prop of its Skemo.`,
      `Allow a boolean prop of the Skemo (${booleans.join(", ") || "none"}) here, or add the prop first.`,
    );
  }
}

/** `uzo-use-instead-ero-missing` and `uzo-goal-twice` (Art. I: a goal stands in one place). */
function boundaryIssues(entry: LoadedEro, uzo: JsonObject, at: At): void {
  const cases = new Set<string>();
  for (const { item, index } of objects(uzo.boundary)) {
    if (typeof item.case === "string") cases.add(item.case);
    if (item.action === "use-instead" && item.ero === undefined) {
      at(
        `/uzo/boundary/${index}`,
        "uzo-use-instead-ero-missing",
        `boundary[${index}] of the Uzo of ${entry.ero.name} says use-instead but names no Ero.`,
        "Name the Ero to use in ero, or choose ask-human or not-supported.",
      );
    }
  }
  for (const { item, index } of objects(uzo.instead)) {
    if (typeof item.goal !== "string" || !cases.has(item.goal)) continue;
    at(
      `/uzo/instead/${index}/goal`,
      "uzo-goal-twice",
      `The goal ${item.goal} stands in instead and as a boundary case of the Uzo of ${entry.ero.name}.`,
      "Keep the goal in one place: instead when another Ero (or null) answers it, boundary when the Ero stops there.",
    );
  }
}

/** The Regulo of that name that applies to the Ero, if any. */
function reguloFor(modelo: Modelo, entry: LoadedEro, name: string): Regulo | undefined {
  return modelo.reguloj.find(
    (regulo) => regulo.name === name && (regulo.appliesTo?.eroj ?? []).includes(entry.ero.name),
  );
}

/** `uzo-regulo-unknown`: every Regulo the Uzo names applies to its Ero. */
function reguloIssues(entry: LoadedEro, uzo: JsonObject, modelo: Modelo, at: At): void {
  const named: [string, unknown][] = [
    ["/uzo/composes/spacing/regulo", objectAt(objectAt(uzo, "composes"), "spacing").regulo],
    ...objects(uzo.content).map(
      ({ item, index }) => [`/uzo/content/${index}/regulo`, item.regulo] as [string, unknown],
    ),
    ...objects(uzo.boundary).map(
      ({ item, index }) =>
        [`/uzo/boundary/${index}/via/regulo`, objectAt(item, "via").regulo] as [string, unknown],
    ),
    ...Object.entries(objectAt(uzo, "layout")).map(
      ([key, value]) =>
        [
          `${appendPointer("/uzo/layout", key)}/regulo`,
          isJsonObject(value) ? value.regulo : undefined,
        ] as [string, unknown],
    ),
  ];
  const applying = modelo.reguloj
    .filter((regulo) => (regulo.appliesTo?.eroj ?? []).includes(entry.ero.name))
    .map((regulo) => regulo.name);
  for (const [pointer, name] of named) {
    if (typeof name !== "string" || reguloFor(modelo, entry, name) !== undefined) continue;
    at(
      pointer,
      "uzo-regulo-unknown",
      `The Uzo of ${entry.ero.name} names the Regulo ${name}, which does not exist or does not apply to ${entry.ero.name} (appliesTo.eroj).`,
      `Name a Regulo whose appliesTo.eroj contains ${entry.ero.name} (${applying.join(", ") || "none"}).`,
    );
  }
}

/**
 * Text rules: `uzo-content-fixed-missing`, `uzo-content-example-missing` and `intent-unknown` for
 * goals the Skemo does not know. Until F1-T00 the goals of a Skemo are its `intents`
 * (data-model §9).
 */
function contentIssues(entry: LoadedEro, uzo: JsonObject, modelo: Modelo, at: At): void {
  const goals = (entry.skemo.intents ?? []).map((intent) => intent.intent);
  const unknownGoal = (pointer: string, goal: unknown) => {
    if (typeof goal !== "string" || goals.includes(goal)) return;
    at(
      pointer,
      "intent-unknown",
      `A text rule of the Uzo of ${entry.ero.name} applies to the goal ${goal}, which its Skemo does not know.`,
      `Use a goal of the Skemo (${goals.join(", ") || "none"}).`,
    );
  };
  for (const { item, index } of objects(uzo.content)) {
    const base = `/uzo/content/${index}`;
    if (typeof item.fixed !== "boolean") {
      at(
        base,
        "uzo-content-fixed-missing",
        `content[${index}] of the Uzo of ${entry.ero.name} does not say whether the text rule is fixed.`,
        "Set fixed: true when the rule protects safety, trust or accessibility (no Aspekto may override it), else false.",
      );
    }
    const when = objectAt(item, "when");
    if (Array.isArray(when.goal)) {
      when.goal.forEach((goal: unknown, position) => {
        unknownGoal(`${base}/when/goal/${position}`, goal);
      });
    }
    unknownGoal(`${base}/check/goal`, objectAt(item, "check").goal);

    const name = stringAt(item, "regulo");
    const regulo = name === undefined ? undefined : reguloFor(modelo, entry, name);
    if (regulo === undefined) continue;
    const missing = (["approved", "rejected"] as const).filter(
      (decision) => !modelo.jugxoj.some((jugxo) => isLabelledExample(jugxo, regulo, decision)),
    );
    if (missing.length > 0) {
      at(
        `${base}/regulo`,
        "uzo-content-example-missing",
        `The text rule ${regulo.name} of the Uzo of ${entry.ero.name} has no ${missing.join(" and no ")} example.`,
        `Add a Jugxo per missing decision with ekzemplo.regulo ${regulo.id} and a label on every instance; a text rule is learnt from both sides.`,
      );
    }
  }
}

/** A Jugxo with that decision whose example is for the Regulo and labels every instance. */
function isLabelledExample(jugxo: Jugxo, regulo: Regulo, decision: Jugxo["decision"]): boolean {
  const ekzemplo = jugxo.ekzemplo;
  return (
    jugxo.decision === decision &&
    ekzemplo?.regulo === regulo.id &&
    ekzemplo.instances.length > 0 &&
    ekzemplo.instances.every(
      (instance) => typeof instance.label === "string" && instance.label.trim() !== "",
    )
  );
}
