// Usage evaluation (Spec 003, plan D-04, D-16): judges Ero instances of a design or of code
// against the Ero Reguloj and the Skemo. The Reguloj judge instances, not Modelo data, so their
// enforcers live here and not in Modelo validation; `check_usage` and the Jugxo examples use this.
// Pure.

import type { IssueSeverity, RuleId, ValidationIssue } from "../contracts/issues.js";
import { formatIssuePath } from "../contracts/issues.js";
import type { EroInstance, LoadedEro, Modelo, Regulo } from "../contracts/modelo.js";
import type {
  Skemo,
  Uzo,
  UzoBoundary,
  UzoContent,
  UzoInstead,
  UzoLayoutAllowance,
} from "../generated/modelo-schema.js";
import {
  describeCombination,
  forbiddenBy,
  PROP_KEY_PREFIX,
  SLOT_EMPTY,
  SLOT_FILLED,
  SLOT_KEY_PREFIX,
} from "./skemo-rules.js";

/** One finding: the indices of the instances involved and the issue. */
export interface UsageViolation {
  instance: number[];
  issue: ValidationIssue;
}

export interface UsageResult {
  instances: number;
  valid: boolean;
  /** Ordered by the first instance index, then rule. */
  violations: UsageViolation[];
}

/** The implicit container of instances that name none. */
const NO_CONTAINER = "";

/** The container kind of running text; an Ero with `wrap: with-text` breaks only there (D-04). */
export const TEXT_CONTAINER = "text";

/**
 * The axes the two butono Reguloj read (F1, Jugxo jug_01M4DNSD0SV43Y943T21RQF7EM): `emphasis`
 * says how much an action stands out, `intent` what it does; the primary action is the one with
 * emphasis=high. Until F1 the axes were `variant=primary` and `tone`.
 */
const EMPHASIS = "emphasis";
const INTENT = "intent";
const PRIMARY = "high";

/** Props of an instance with the Skemo's defaults filled in, as strings for comparison. */
export function effectiveProps(skemo: Skemo, props: EroInstance["props"]): Record<string, string> {
  const effective: Record<string, string> = {};
  for (const prop of skemo.props) {
    const value = props[prop.name] ?? prop.default;
    if (value !== undefined) effective[prop.name] = String(value);
  }
  return effective;
}

/** Lower-case words of a text, punctuation removed (NFC, Unicode letters and digits). */
export function wordsOf(text: string): string[] {
  return text
    .normalize("NFC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== "");
}

/**
 * The hyphenated compounds of a text as one word each, letters only: "E-Mail-Adresse" →
 * "emailadresse" (R-11, Abnahme Spec 009 A11). The parts stay words of their own (`wordsOf`).
 */
export function compoundsOf(text: string): string[] {
  return [
    ...text
      .normalize("NFC")
      .toLowerCase()
      .matchAll(/\p{L}+(?:-\p{L}+)+/gu),
  ].map((match) => match[0].replaceAll("-", ""));
}

/**
 * A keyword of this many letters or more also hits a hyphenated compound that ends with it (R-11):
 * "mailadresse" hits "e-mail-adresse". Same measure as the Uzo keywords (Spec 007 D-06, N-1).
 */
const COMPOUND_SUFFIX_MIN = 6;

/**
 * The Skemo goal a text names: the goal one of whose keywords, in any language, is a word of the
 * text. Several goals may hit; the longest keyword wins, and a tie keeps the declaration order
 * (R-11, Abnahme Spec 009 A11, 2026-10-13: "E-Mail-Adresse" fell to enter-text by `adresse`
 * because the first goal won; now `mailadresse` wins over `adresse`). A hyphenated compound counts
 * as its parts and as one word. Deterministic, no model (D-16). Called goal since F1-T00
 * (Spec 007, OP-4): `intent` is the name of a prop.
 */
export function goalOf(
  skemo: Skemo,
  text: string,
  options: { lingvo?: string } = {},
): { goal: NonNullable<Skemo["goals"]>[number]; keyword: string; lingvo: string } | undefined {
  const words = new Set(wordsOf(text));
  const compounds = compoundsOf(text);
  let best:
    | { goal: NonNullable<Skemo["goals"]>[number]; keyword: string; lingvo: string }
    | undefined;
  for (const goal of skemo.goals ?? []) {
    for (const [lingvo, keywords] of Object.entries(goal.keywords)) {
      if (options.lingvo !== undefined && lingvo !== options.lingvo) continue;
      for (const keyword of keywords) {
        const needle = keyword.normalize("NFC").toLowerCase();
        const hit =
          words.has(needle) ||
          (needle.length >= COMPOUND_SUFFIX_MIN &&
            compounds.some((compound) => compound.endsWith(needle)));
        if (!hit) continue;
        if (best === undefined || needle.length > best.keyword.length) {
          best = { goal, keyword, lingvo };
        }
      }
    }
  }
  return best;
}

/**
 * A keyword of the named goal that is a word of the text, with its language. Unlike `goalOf` it
 * asks for one goal, not the first that matches (Spec 007, text rule `verb-and-object`).
 */
export function hitsGoal(
  skemo: Skemo,
  goalName: string,
  text: string,
): { keyword: string; lingvo: string } | undefined {
  const goal = (skemo.goals ?? []).find((candidate) => candidate.goal === goalName);
  if (goal === undefined) return undefined;
  const words = new Set(wordsOf(text));
  for (const [lingvo, keywords] of Object.entries(goal.keywords)) {
    const keyword = keywords.find((candidate) =>
      words.has(candidate.normalize("NFC").toLowerCase()),
    );
    if (keyword !== undefined) return { keyword, lingvo };
  }
  return undefined;
}

/** The visible text of an instance: the label slot, else the label prop (icon-only). */
export function textOf(instance: EroInstance): string | undefined {
  const text = instance.label ?? instance.props.label;
  return typeof text === "string" && text.trim() !== "" ? text : undefined;
}

/** The default source of a text rule: the label (Spec 007); Spec 009 adds `of`. */
const LABEL_SOURCE = "slot:label";

/**
 * The text a rule judges (Spec 009, D-06): the label, the text of another slot (`texts`) or a
 * string prop (`props`). Empty when the instance has none there.
 */
export function textOfSource(
  instance: EroInstance,
  of: string = LABEL_SOURCE,
  skemo?: Skemo,
): string | undefined {
  if (of === LABEL_SOURCE) return textOf(instance);
  const [kind = "", name = ""] = of.split(":");
  const text = kind === "slot" ? instance.texts?.[name] : instance.props[name];
  if (typeof text === "string" && text.trim() !== "") return text;
  // The default slot is the label (Spec 011 ② F-1): a rule on the heading of a dialog reads the
  // text given as `texts.heading` or as the label — both name the same slot.
  const isDefault = skemo?.slots.some((slot) => slot.name === name && slot.default === true);
  return kind === "slot" && isDefault === true ? textOf(instance) : undefined;
}

/**
 * The texts of the entries of a slot that takes several (Spec 010 ③, plan ③ D-09): the labels of
 * the options, given as a list in `texts` (one text alone counts as one entry). Undefined when the
 * instance gives no texts for the slot.
 */
export function entryTextsOf(
  instance: EroInstance,
  of: string,
  skemo?: Skemo,
): string[] | undefined {
  const [kind = "", name = ""] = of.split(":");
  if (kind !== "slot") return undefined;
  const texts = instance.texts?.[name];
  if (texts === undefined) return undefined;
  const given = typeof texts === "string" ? [texts] : [...texts];
  // The empty entry (Spec 011 ①, plan ① D-09): the text of the prop the slot's entry names stands
  // first among the entries — 'Alle' is an option for the rules on the options.
  const empty = skemo?.slots.find((slot) => slot.name === name)?.entry?.empty;
  const label = empty === undefined ? undefined : instance.props[empty];
  return typeof label === "string" && label.trim() !== "" ? [label, ...given] : given;
}

/**
 * How many entries an instance gives a slot: its texts, or what stands in `slots` (Spec 007, A5),
 * whichever says more. Undefined when the instance says nothing about the slot.
 */
export function entryCountOf(instance: EroInstance, of: string): number | undefined {
  const [kind = "", name = ""] = of.split(":");
  if (kind !== "slot") return undefined;
  const texts = entryTextsOf(instance, of);
  const entries = instance.slots?.[name];
  if (texts === undefined && entries === undefined) return undefined;
  return Math.max(texts?.length ?? 0, entries?.length ?? 0);
}

/**
 * Whether each slot of the Skemo is filled in an instance (Spec 009, D-04): the label by its text,
 * another slot by its entries or its text. Keyed `slot:<name>`, so a constraint can read it.
 */
export function slotStates(skemo: Skemo, instance: EroInstance): Record<string, string> {
  const states: Record<string, string> = {};
  for (const slot of skemo.slots) {
    const filled =
      (slot.default === true && textOf(instance) !== undefined) ||
      (instance.slots?.[slot.name]?.length ?? 0) > 0 ||
      textOfSource(instance, `slot:${slot.name}`) !== undefined ||
      (entryTextsOf(instance, `slot:${slot.name}`) ?? []).some((text) => text.trim() !== "");
    states[`${SLOT_KEY_PREFIX}${slot.name}`] = filled ? SLOT_FILLED : SLOT_EMPTY;
  }
  return states;
}

/**
 * Whether each string prop of the Skemo is filled in an instance (Spec 011 ①, plan ① D-08): a
 * non-empty text, or a number. Keyed `prop:<name>`, so a constraint can read it like a slot.
 */
export function propStates(skemo: Skemo, instance: EroInstance): Record<string, string> {
  const states: Record<string, string> = {};
  for (const prop of skemo.props) {
    if (prop.kind !== "string") continue;
    const given = instance.props[prop.name];
    const filled = (typeof given === "string" && given.trim() !== "") || typeof given === "number";
    states[`${PROP_KEY_PREFIX}${prop.name}`] = filled ? SLOT_FILLED : SLOT_EMPTY;
  }
  return states;
}

/** The goal of an instance: the one it states, else the one its text names (data-model §2.3). */
export function goalOfInstance(skemo: Skemo, instance: EroInstance): string | undefined {
  return instance.goal ?? goalOf(skemo, textOf(instance) ?? "")?.goal.goal;
}

/**
 * The language of a text: that of the goal keyword it hits. A text that hits no keyword has no
 * language (data-model §5); the enforcers then take German (decision of 2026-10-12).
 */
export function lingvoOf(skemo: Skemo, text: string): string | undefined {
  return goalOf(skemo, text)?.lingvo;
}

/** The language the text rules fall back to when the instance names none. */
export const DEFAULT_LINGVO = "de";

type Context = {
  modelo: Modelo;
  regulo: Regulo;
  instances: readonly EroInstance[];
  eroOf: (instance: EroInstance) => LoadedEro | undefined;
};

/** One finding of an enforcer; `severity` defaults to error (a text rule may only warn, D-02). */
export interface UsageFinding {
  instance: number[];
  message: string;
  suggestion: string;
  severity?: IssueSeverity;
}

type UsageEnforcer = (context: Context) => UsageFinding[];

/**
 * The instead entry of a Uzo whose keyword is a word of the text (Spec 008, plan D-07): the text
 * names a goal the Ero does not serve. Whole words, like the Skemo goals.
 */
export function insteadHit(
  uzo: Uzo | undefined,
  text: string,
): { entry: UzoInstead; keyword: string; lingvo: string } | undefined {
  const words = new Set(wordsOf(text));
  for (const entry of uzo?.instead ?? []) {
    for (const [lingvo, keywords] of Object.entries(entry.keywords)) {
      const keyword = keywords.find((candidate) =>
        words.has(candidate.normalize("NFC").toLowerCase()),
      );
      if (keyword !== undefined) return { entry, keyword, lingvo };
    }
  }
  return undefined;
}

/**
 * Why a text fails a check of a Uzo text rule (data-model §2.1, `UzoContent.check`), or nothing.
 * `not-instead` reads the instead entries of the Uzo (Spec 008, D-07).
 */
export function textCheckFailure(
  skemo: Skemo,
  check: UzoContent["check"],
  text: string,
  uzo?: Uzo,
): string | undefined {
  switch (check.kind) {
    case "not-instead": {
      const hit = insteadHit(uzo, text);
      if (hit === undefined) return undefined;
      return `it names the goal ${hit.entry.goal} ("${hit.keyword}"), which this Ero does not serve${hit.entry.ero === null ? "" : `; that is the ${hit.entry.ero} (use-instead)`}`;
    }
    case "names-goal":
      return goalOf(skemo, text) === undefined
        ? "it names no verb of a goal of the Ero (nothing says what happens on activation)"
        : undefined;
    case "verb-and-object": {
      const hit = hitsGoal(skemo, check.goal, text);
      if (hit === undefined) return `it names no verb of the goal ${check.goal}`;
      if (wordsOf(text).length < 2)
        return `it names the verb "${hit.keyword}" but not what it acts on`;
      return undefined;
    }
    case "not-words": {
      const words = new Set(wordsOf(text));
      for (const list of Object.values(check.words)) {
        const generic = list.find((word) => words.has(word.normalize("NFC").toLowerCase()));
        if (generic !== undefined) return `it uses the generic word "${generic}"`;
      }
      return undefined;
    }
    // Spec 009 (D-06): a text that says what to do has a verb and an object; an approximation
    // without a model, like names-goal.
    case "min-words": {
      const count = wordsOf(text).length;
      return count < check.count
        ? `it has ${count} word${count === 1 ? "" : "s"}, fewer than the ${check.count} a sentence that says what to do needs`
        : undefined;
    }
    // Spec 011 ③ (plan ③ D-06): a badge is skimmed, so its label has at most a few words; a
    // count of words, like min-words, an approximation without a model.
    case "max-words": {
      const count = wordsOf(text).length;
      return count > check.count
        ? `it has ${count} words, more than the ${check.count} a label that is read at a glance may have`
        : undefined;
    }
    case "max-sentences": {
      const sentences = text.split(/[.!?]+(?:\s+|$)/).filter((part) => part.trim() !== "").length;
      return sentences > check.count
        ? `it has ${sentences} sentences, more than ${check.count}`
        : undefined;
    }
    default:
      return undefined;
  }
}

/** Check kinds that judge the entries of a slot, not one text (Spec 010 ③, plan ③ D-09). */
const LIST_CHECK_KINDS: ReadonlySet<string> = new Set(["distinct", "max-entries"]);

/** A text compared as an option label: without case and surrounding space (NFC). */
const sameText = (text: string) => text.normalize("NFC").trim().toLowerCase();

/**
 * Why the entries of a slot fail a list check of a Uzo text rule (Spec 010 ③, plan ③ D-09), or
 * nothing: `distinct` finds two entries with the same text, `max-entries` more than `count`.
 */
export function listCheckFailure(
  check: UzoContent["check"],
  texts: readonly string[] | undefined,
  count: number,
  slot: string,
): string | undefined {
  switch (check.kind) {
    case "distinct": {
      const seen = new Map<string, string>();
      for (const text of texts ?? []) {
        const first = seen.get(sameText(text));
        if (first !== undefined) {
          return `two of its ${slot} share the label "${first}"${first === text ? "" : ` ("${text}")`}; a person cannot tell them apart`;
        }
        seen.set(sameText(text), text);
      }
      return undefined;
    }
    case "max-entries":
      return count > check.count ? `it has ${count} ${slot}, more than ${check.count}` : undefined;
    default:
      return undefined;
  }
}

/**
 * The language of a text that hits a generic word of a `not-words` check, when exactly one
 * language claims it ("OK" is generic in German and English alike, so it names no language).
 */
function genericLingvo(check: UzoContent["check"], text: string): string | undefined {
  if (check.kind !== "not-words") return undefined;
  const words = new Set(wordsOf(text));
  const hits = Object.entries(check.words)
    .filter(([, list]) => list.some((word) => words.has(word.normalize("NFC").toLowerCase())))
    .map(([lingvo]) => lingvo);
  return hits.length === 1 ? hits[0] : undefined;
}

/**
 * The override of an adjustable text rule by the Aspekto of the instance (A7, D-03): the Jugxo
 * that records the deviation. A fixed rule is never overridden; validation has refused that.
 */
function overrideOf(modelo: Modelo, instance: EroInstance, rule: UzoContent): string | undefined {
  if (rule.fixed || instance.aspekto === undefined) return undefined;
  const pkg = modelo.aspektoPackages.find((candidate) => candidate.aspekto === instance.aspekto);
  return pkg?.overrides?.find((override) => override.regulo === rule.regulo)?.jugxo;
}

/**
 * The label of an approved example of the Regulo in the given language (D-07, S3): the solution
 * comes from the data, not from a guess. Without one in that language, German, then any.
 */
export function approvedLabel(
  modelo: Modelo,
  regulo: Regulo,
  lingvo: string,
  eroOf: (instance: EroInstance) => LoadedEro | undefined,
  of: string = LABEL_SOURCE,
): string | undefined {
  const labels: { label: string; lingvo: string | undefined }[] = [];
  for (const jugxo of modelo.jugxoj) {
    if (jugxo.decision !== "approved" || jugxo.ekzemplo?.regulo !== regulo.id) continue;
    for (const instance of jugxo.ekzemplo.instances) {
      // The entries of a slot that takes several (Spec 010 ③): the options, joined.
      const skemo = eroOf(instance)?.skemo;
      const label = textOfSource(instance, of, skemo) ?? entryTextsOf(instance, of)?.join(", ");
      if (label === undefined || skemo === undefined) continue;
      labels.push({ label, lingvo: instance.lingvo ?? lingvoOf(skemo, label) });
    }
  }
  return (
    labels.find((entry) => entry.lingvo === lingvo) ??
    labels.find((entry) => entry.lingvo === DEFAULT_LINGVO) ??
    labels[0]
  )?.label;
}

/**
 * The enforcer of every text rule of a Uzo (Spec 007, A7, D-02, data-model §2.3): the Uzo entry
 * whose `regulo` is this Regulo says whether the rule is fixed, which goals it applies to and how
 * it is checked. An Ero without a Uzo, or a Uzo without this rule, is not judged.
 */
const textRule: UsageEnforcer = ({ modelo, regulo, instances, eroOf }) =>
  instances.flatMap((instance, index): UsageFinding[] => {
    const ero = eroOf(instance);
    if (ero === undefined || !applies(regulo, ero)) return [];
    const rule = ero.uzo?.content.find((entry) => entry.regulo === regulo.name);
    if (rule === undefined) return [];
    // A list check judges the entries of a slot (Spec 010 ③, plan ③ D-09): the options of a radio
    // group, their labels or their number.
    if (LIST_CHECK_KINDS.has(rule.check.kind)) {
      return listRuleFinding(modelo, regulo, rule, instance, index, ero, eroOf);
    }
    // Text rules judge a text; an instance without one violates label-required alone (§5). The
    // text is the label, or what `of` names (Spec 009, D-06).
    // Spec 011 ⑤ (plan ⑤ D-05): a text rule on a slot whose entries are options (the items of a
    // navigation, link-label-names-destination) judges every entry, one finding per failing text;
    // every other rule judges the one text of its source.
    const of = rule.of ?? LABEL_SOURCE;
    const entrySlot = ero.skemo.slots.find(
      (slot) => slot.entry !== undefined && of === `slot:${slot.name}`,
    );
    const texts =
      entrySlot === undefined
        ? [textOfSource(instance, rule.of, ero.skemo)].filter(
            (text): text is string => text !== undefined,
          )
        : (entryTextsOf(instance, of, ero.skemo) ?? []);
    const judge = (text: string): UsageFinding[] => {
      if (rule.when?.goal !== undefined) {
        const goal = goalOfInstance(ero.skemo, instance);
        if (goal === undefined || !rule.when.goal.includes(goal)) return [];
      }
      // Spec 011 ③ (plan ③ D-06): a rule for instances with one of the listed values of a prop —
      // the error rule of the avizo judges the message of intent danger only. The value is the
      // instance's, else the default of the Skemo.
      if (rule.when?.props !== undefined) {
        const applies = Object.entries(rule.when.props).every(([prop, values]) => {
          const given =
            instance.props[prop] ??
            ero.skemo.props.find((candidate) => candidate.name === prop)?.default;
          return typeof given === "string" && values.includes(given);
        });
        if (!applies) return [];
      }
      const failure = textCheckFailure(ero.skemo, rule.check, text, ero.uzo);
      if (failure === undefined) return [];
      // The language of the instance when it says it (Spec 008, D-06), else read from the text.
      const lingvo =
        instance.lingvo ??
        lingvoOf(ero.skemo, text) ??
        genericLingvo(rule.check, text) ??
        insteadHit(ero.uzo, text)?.lingvo ??
        DEFAULT_LINGVO;
      const example = approvedLabel(modelo, regulo, lingvo, eroOf, rule.of);
      // A text that names another Ero's goal is that Ero's job (not-instead, D-07): the solution is
      // the other Ero with the kialo of the instead entry, not a better label.
      const instead = rule.check.kind === "not-instead" ? insteadHit(ero.uzo, text) : undefined;
      const suggestion =
        instead !== undefined
          ? instead.entry.ero === null
            ? `Ask a person; Fundamento does not cover ${instead.entry.goal} yet. ${instead.entry.kialo}`
            : `Use ${instead.entry.ero} instead (use-instead, case ${instead.entry.goal}). ${instead.entry.kialo}`
          : example === undefined
            ? `Write a text that follows the rule: ${regulo.statement}`
            : `Write the text as the approved example does, e.g. "${example}".`;
      // Overridden by the Aspekto of the instance: visible as info, not as a violation (Art. VI).
      const jugxo = overrideOf(modelo, instance, rule);
      if (jugxo !== undefined) {
        return [
          {
            instance: [index],
            severity: "info",
            message: `Instance ${index} of ${ero.ero.name} says "${text}" (${rule.of ?? LABEL_SOURCE}): ${failure}. The Aspekto ${instance.aspekto} overrides ${regulo.name} with the Jugxo ${jugxo}.`,
            suggestion: `Keep the label if the Jugxo ${jugxo} covers it; otherwise ${suggestion.charAt(0).toLowerCase()}${suggestion.slice(1)}`,
          },
        ];
      }
      return [
        {
          instance: [index],
          severity: rule.fixed ? "error" : (rule.severity ?? "error"),
          message: `Instance ${index} of ${ero.ero.name} says "${text}" (${rule.of ?? LABEL_SOURCE}): ${failure}.`,
          suggestion,
        },
      ];
    };
    return texts.flatMap(judge);
  });

/**
 * The finding of a list check (Spec 010 ③, plan ③ D-09) on one instance: two options with one
 * label, or more options than the rule allows. The solution is the approved example of the Regulo;
 * an adjustable rule overridden by the Aspekto of the instance is reported as info, as a text rule.
 */
function listRuleFinding(
  modelo: Modelo,
  regulo: Regulo,
  rule: UzoContent,
  instance: EroInstance,
  index: number,
  ero: LoadedEro,
  eroOf: (instance: EroInstance) => LoadedEro | undefined,
): UsageFinding[] {
  const of = rule.of ?? LABEL_SOURCE;
  const count = entryCountOf(instance, of);
  if (count === undefined || count === 0) return [];
  const texts = entryTextsOf(instance, of, ero.skemo);
  const slot = of.slice(of.indexOf(":") + 1);
  const failure = listCheckFailure(rule.check, texts, count, slot);
  if (failure === undefined) return [];
  const label = textOf(instance);
  const lingvo =
    instance.lingvo ??
    (label === undefined ? undefined : lingvoOf(ero.skemo, label)) ??
    DEFAULT_LINGVO;
  const example = approvedLabel(modelo, regulo, lingvo, eroOf, of);
  const shown =
    texts === undefined ? `${count} ${slot}` : texts.map((text) => `"${text}"`).join(", ");
  const suggestion =
    rule.check.kind === "max-entries"
      ? `Show at most ${rule.check.count} ${slot}${example === undefined ? "" : `, as the approved example does: "${example}"`}. ${regulo.statement}`
      : example === undefined
        ? `Write the ${slot} so that the rule holds: ${regulo.statement}`
        : `Name the ${slot} apart, as the approved example does: "${example}".`;
  const jugxo = overrideOf(modelo, instance, rule);
  if (jugxo !== undefined) {
    return [
      {
        instance: [index],
        severity: "info",
        message: `Instance ${index} of ${ero.ero.name} shows ${shown} (${of}): ${failure}. The Aspekto ${instance.aspekto} overrides ${regulo.name} with the Jugxo ${jugxo}.`,
        suggestion: `Keep the ${slot} if the Jugxo ${jugxo} covers them; otherwise ${suggestion.charAt(0).toLowerCase()}${suggestion.slice(1)}`,
      },
    ];
  }
  return [
    {
      instance: [index],
      severity: rule.fixed ? "error" : (rule.severity ?? "error"),
      message: `Instance ${index} of ${ero.ero.name} shows ${shown} (${of}): ${failure}.`,
      suggestion,
    },
  ];
}

/** What a slot entry of an instance is, for a message: `text`, `icon` or the Ero's name. */
function slotEntryName(entry: NonNullable<EroInstance["slots"]>[string][number]): string {
  return typeof entry === "string" ? entry : `the Ero ${entry.ero}`;
}

/** The action of a boundary as a solution (D-07): the other Ero, a person, or stop. */
function boundaryAction(boundary: UzoBoundary): string {
  switch (boundary.action) {
    case "use-instead":
      return `Use ${boundary.ero ?? "another Ero"} instead.`;
    case "ask-human":
      return "Ask a person; Fundamento does not cover this case yet.";
    default:
      return "Not supported: the Ero stops here; change the design, not the Ero.";
  }
}

/** A `uzo-boundary` finding for one boundary of the Uzo. */
function boundaryFinding(
  index: number,
  ero: LoadedEro,
  boundary: UzoBoundary,
  how: string,
): UsageFinding & { rule: RuleId } {
  return {
    rule: "uzo-boundary",
    instance: [index],
    message: `Instance ${index} of ${ero.ero.name} ${how}: the boundary ${boundary.case} (${boundary.action}). ${boundary.kialo}`,
    suggestion: boundaryAction(boundary),
  };
}

/**
 * The Uzo of an Ero against one instance (Spec 007, A3, A5, A10, D-07): the boundaries it
 * recognises via a slot or the wrap, and the slot rules. A boundary via a Regulo is recognised
 * by that Regulo's enforcer alone (label-required for no-accessible-label); a second finding for
 * the same fault would be noise. A slot entry a boundary already covers is not judged twice.
 */
function uzoFindings(
  index: number,
  ero: LoadedEro,
  instance: EroInstance,
): (UsageFinding & { rule: RuleId })[] {
  const uzo = ero.uzo;
  if (uzo === undefined) return [];
  const findings: (UsageFinding & { rule: RuleId })[] = [];
  const covered = new Set<string>();
  const slots = instance.slots ?? {};
  for (const boundary of uzo.boundary) {
    const via = boundary.via;
    if (via === undefined) continue;
    if ("slot" in via) {
      const entries = slots[via.slot] ?? [];
      if (!entries.some((entry) => typeof entry === "object")) continue;
      covered.add(via.slot);
      findings.push(boundaryFinding(index, ero, boundary, `holds an Ero in the slot ${via.slot}`));
    } else if ("layout" in via) {
      const text = textOf(instance);
      if (text === undefined || !/\r?\n/.test(text)) continue;
      const wrap = uzo.layout.wrap;
      if (wrap === "allowed") continue;
      // with-text (Spec 008, D-04): the label breaks with the running text it stands in, and
      // only there; standing alone it never breaks.
      if (wrap === "with-text" && instance.container === TEXT_CONTAINER) continue;
      findings.push(
        boundaryFinding(
          index,
          ero,
          boundary,
          wrap === "with-text"
            ? `has a label that breaks into lines outside running text (container ${TEXT_CONTAINER})`
            : "has a label that breaks into lines",
        ),
      );
    }
  }
  // The fewest entries a slot takes (Spec 010 ③, plan ③ D-10): a radio group of one option is
  // no choice. Only a slot the instance gives entries for is judged; what it leaves out is unknown.
  for (const [slot, rule] of Object.entries(uzo.slots)) {
    if (rule.min === undefined) continue;
    const count = entryCountOf(instance, `slot:${slot}`);
    if (count === undefined || count >= rule.min) continue;
    findings.push({
      rule: "uzo-slot-min",
      instance: [index],
      message: `Instance ${index} of ${ero.ero.name} holds ${count} ${count === 1 ? "entry" : "entries"} in the slot ${slot}, which takes at least ${rule.min}.`,
      suggestion: `Give the slot ${slot} at least ${rule.min} entries; with fewer the Ero is not the one (get_ero names its boundaries).`,
    });
  }
  for (const [slot, entries] of Object.entries(slots)) {
    const rule = uzo.slots[slot];
    if (rule === undefined) continue;
    if (rule.max !== undefined && entries.length > rule.max) {
      findings.push({
        rule: "uzo-slot-max",
        instance: [index],
        message: `Instance ${index} of ${ero.ero.name} holds ${entries.length} entries in the slot ${slot}, which takes at most ${rule.max}.`,
        suggestion: `Keep at most ${rule.max}.`,
      });
    }
    if (covered.has(slot)) continue;
    for (const entry of entries) {
      const name = typeof entry === "string" ? entry : entry.ero;
      if (rule.accepts !== undefined && !rule.accepts.includes(name)) {
        findings.push({
          rule: "uzo-slot-accepts",
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} holds ${slotEntryName(entry)} in the slot ${slot}, which accepts ${rule.accepts.join(" or ")}.`,
          suggestion: `Put ${rule.accepts.join(" or ")} in the slot ${slot}.`,
        });
      }
      if (typeof entry === "object" && rule.nesting !== undefined && rule.nesting < 1) {
        findings.push({
          rule: "uzo-slot-nesting",
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} nests the Ero ${entry.ero} in the slot ${slot}, which allows no nesting.`,
          suggestion: "Move the inner Ero next to this one.",
        });
      }
    }
  }
  return findings;
}

/** Where a layout allowance lets an instance stand, in words for a message. */
function allowedPlaces(allowance: UzoLayoutAllowance): string {
  const places = [
    ...(allowance.allowedIn.containers ?? []).map((name) => `a container of kind ${name}`),
    ...Object.entries(allowance.allowedIn.dimensioj ?? {}).flatMap(([dimensio, values]) =>
      values.map((value) => `${dimensio}=${value}`),
    ),
  ];
  return places.join(" or ") || "nowhere";
}

/**
 * The enforcer of a layout allowance of a Uzo (Spec 007, A6): a boolean prop the Uzo lists under
 * `layout` with this Regulo is allowed only in the named containers or Dimensio values.
 */
const layoutAllowance: UsageEnforcer = ({ regulo, instances, eroOf }) =>
  instances.flatMap((instance, index) => {
    const ero = eroOf(instance);
    if (ero === undefined || !applies(regulo, ero) || ero.uzo === undefined) return [];
    const props = effectiveProps(ero.skemo, instance.props);
    return Object.entries(ero.uzo.layout).flatMap(([prop, allowance]) => {
      if (typeof allowance !== "object" || allowance.regulo !== regulo.name) return [];
      if (props[prop] !== "true") return [];
      const containers = allowance.allowedIn.containers ?? [];
      const inContainer =
        instance.container !== undefined && containers.includes(instance.container);
      const inDimensio = Object.entries(allowance.allowedIn.dimensioj ?? {}).some(
        ([dimensio, values]) => values.includes(instance.dimensioj?.[dimensio] ?? ""),
      );
      if (inContainer || inDimensio) return [];
      const where =
        instance.container === undefined
          ? "without a container"
          : `in the container ${instance.container}`;
      const under = Object.entries(instance.dimensioj ?? {})
        .map(([dimensio, value]) => `${dimensio}=${value}`)
        .join(", ");
      return [
        {
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} takes ${prop} ${where}${under === "" ? "" : ` under ${under}`}.`,
          suggestion: `Use ${prop} only in ${allowedPlaces(allowance)}; otherwise leave ${prop} out.`,
        },
      ];
    });
  });

/** Enforcers of the Ero Reguloj by name (the repo test accepts this table next to the Modelo's). */
export const USAGE_ENFORCERS: Readonly<Record<string, UsageEnforcer>> = {
  "one-primary-per-container": ({ instances, eroOf, regulo }) => {
    const groups = new Map<string, number[]>();
    instances.forEach((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return;
      if (effectiveProps(ero.skemo, instance.props)[EMPHASIS] !== PRIMARY) return;
      const container = instance.container ?? NO_CONTAINER;
      groups.set(container, [...(groups.get(container) ?? []), index]);
    });
    return [...groups.entries()]
      .filter(([, indices]) => indices.length > 1)
      .map(([container, indices]) => ({
        instance: indices,
        message: `${indices.length} instances with ${EMPHASIS}=${PRIMARY} in ${container === NO_CONTAINER ? "one container" : `container ${container}`} (instances ${indices.join(", ")}).`,
        suggestion: `Keep one ${PRIMARY}-${EMPHASIS} action per container; give the others ${EMPHASIS}=medium or low.`,
      }));
  },
  "destructive-not-primary-color": ({ instances, eroOf, regulo }) =>
    instances.flatMap((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return [];
      const destructive = (ero.skemo.goals ?? []).find((goal) => goal.regulo === regulo.name);
      if (destructive === undefined) return [];
      const named =
        instance.goal === destructive.goal ||
        goalOf(ero.skemo, instance.label ?? "")?.goal === destructive;
      if (!named) return [];
      const props = effectiveProps(ero.skemo, instance.props);
      const primary = String(destructive.props[EMPHASIS] ?? PRIMARY);
      const intent = destructive.props[INTENT];
      if (props[EMPHASIS] !== primary || intent === undefined || props[INTENT] === String(intent))
        return [];
      return [
        {
          instance: [index],
          message: `Instance ${index} is a destructive action with ${describeCombination(props, [EMPHASIS, INTENT])}.`,
          suggestion: `As the main action use ${describeCombination(Object.fromEntries(Object.entries(destructive.props).map(([k, v]) => [k, String(v)])), Object.keys(destructive.props))}; next to another ${PRIMARY}-${EMPHASIS} action use ${EMPHASIS}=medium.`,
        },
      ];
    }),
  "label-required": ({ instances, eroOf, regulo }) =>
    instances.flatMap((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return [];
      // The visible label (slot text) or, icon-only, the label prop as accessible name.
      const name = instance.label ?? instance.props.label;
      if (typeof name === "string" && name.trim() !== "") return [];
      return [
        {
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} has neither a visible label nor a label prop.`,
          suggestion:
            "Give the label as slot text, or for an icon-only button set the label prop as its accessible name.",
        },
      ];
    }),
  // Spec 007 T019 (A6, A7, data-model §4): the layout rule and the text rules of the Uzo. Each
  // reads the Uzo of the Ero; until an Ero has one, none of them finds anything.
  "full-width-in-action-bar-or-compact": layoutAllowance,
  "label-names-action": textRule,
  "destructive-label-names-object": textRule,
  "destructive-label-not-generic": textRule,
  // Spec 008 T005 (A2, A3, D-07, D-13): the three text rules of the ligilo.
  "link-navigates-button-acts": textRule,
  "link-label-names-destination": textRule,
  "link-label-not-url": textRule,
  // Spec 009 T003 (A2, A3, D-05, D-06): the kampo. The label is always visible; the placeholder is
  // an example, not the label; and the text rules on label, help, error and placeholder.
  "field-label-visible": ({ instances, eroOf, regulo }) =>
    instances.flatMap((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return [];
      if (textOf(instance) !== undefined) return [];
      return [
        {
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} has no visible label${typeof instance.props.placeholder === "string" ? ` (only the placeholder "${instance.props.placeholder}")` : ""}.`,
          suggestion:
            "Give the label as slot text; a placeholder disappears while typing and names nothing afterwards.",
        },
      ];
    }),
  "placeholder-not-label": ({ instances, eroOf, regulo }) =>
    instances.flatMap((instance, index): UsageFinding[] => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return [];
      const placeholder = instance.props.placeholder;
      if (typeof placeholder !== "string" || placeholder.trim() === "") return [];
      const label = textOf(instance);
      if (label === undefined) {
        return [
          {
            instance: [index],
            message: `Instance ${index} of ${ero.ero.name} has the placeholder "${placeholder}" and no label: the placeholder stands in for the label.`,
            suggestion:
              "Give the label as slot text and keep the placeholder as an example of a value.",
          },
        ];
      }
      if (label.trim().toLowerCase() === placeholder.trim().toLowerCase()) {
        return [
          {
            instance: [index],
            severity: "warning",
            message: `Instance ${index} of ${ero.ero.name} repeats its label "${label}" as the placeholder: an example that repeats the label says nothing.`,
            suggestion: "Make the placeholder an example of a value, or leave it out.",
          },
        ];
      }
      return [];
    }),
  "field-label-names-the-datum": textRule,
  "error-says-what-to-do": textRule,
  "help-is-one-sentence": textRule,
  "placeholder-is-example": textRule,
  // Spec 010 ① (G6, plan D-14): the switch names its setting, not the change; the switch says
  // whether it is on. field-label-visible and field-label-names-the-datum apply to it as well (E5).
  "switch-label-names-the-setting": textRule,
  // Spec 010 ③ (G6, plan ③ D-09): the options of a radio group have distinct labels (fixed) and
  // are few (adjustable, a warning from the sixth on); both are list checks of the Uzo.
  "option-labels-distinct": textRule,
  "elekto-options-few": textRule,
  // Spec 011 ② (G6, plan ② D-08): the heading of a dialog names the decision, never only that
  // something is asked (not-words against the usual empty titles); a text rule of the Uzo.
  "dialog-title-names-the-decision": textRule,
  // Spec 011 ③ (G6, plan ③ D-06): a badge has at most three words (max-words on the label); an
  // empty state names what is missing and the next step (min-words on the text, kind empty only).
  "badge-text-short": textRule,
  "empty-state-says-what-next": textRule,
  // Spec 011 ④ (G6, plan ④ D-04, D-06): a caption that names the rows (not-words against empty
  // captions); a value text that names value and reference (min-words 2, so '0 %' alone fails).
  "table-caption-names-the-content": textRule,
  "meter-text-states-value": textRule,
  // Spec 010 ④ (G6, plan ④ D-09): the placeholder of a select is a prompt, not an example of a
  // value (that is placeholder-is-example of the kampo): at least two words, a text rule of the Uzo.
  "select-placeholder-is-prompt": textRule,
  // Spec 014 ② (G8, plan ② D-02): a name that only says icon is no name (not-words on prop:label);
  // a status icon without a name breaks the constraint of the Skemo (prop:label filled), a button
  // with only an icon and no label breaks label-required.
  "icon-meaning-named": textRule,
  // Spec 014 ③ (G8, plan ③ D-03): over the headings of a list no level jumps down over a step —
  // a check across the instances (like one-primary-per-container), read from the Uzo's content
  // entry with the kind levels-in-order and the prop it names (level).
  "heading-levels-in-order": ({ modelo, regulo, instances, eroOf }) => {
    let previous: number | undefined;
    const findings: UsageFinding[] = [];
    instances.forEach((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return;
      const rule = ero.uzo?.content.find(
        (entry) => entry.regulo === regulo.name && entry.check.kind === "levels-in-order",
      );
      if (rule === undefined) return;
      const of = rule.of ?? "prop:level";
      const level = Number(textOfSource(instance, of, ero.skemo) ?? Number.NaN);
      if (!Number.isFinite(level)) return;
      if (previous !== undefined && level > previous + 1) {
        const example = approvedLabel(modelo, regulo, instance.lingvo ?? DEFAULT_LINGVO, eroOf, of);
        findings.push({
          instance: [index],
          message: `Instance ${index} of ${ero.ero.name} is a heading of level ${level} after a level ${previous}: a level is skipped.`,
          suggestion: `Give it level ${previous + 1}, or add the heading of the level in between${example === undefined ? "" : ` (the approved example counts 1, 2, 3)`}. ${regulo.statement}`,
        });
      }
      previous = level;
    });
    return findings;
  },
};

function applies(regulo: Regulo, ero: LoadedEro): boolean {
  return regulo.appliesTo?.eroj?.includes(ero.ero.name) ?? false;
}

/** Evaluates instances against the Ero Reguloj and the Skemo constraints (FR-03, FR-13). */
export function evaluateUsage(modelo: Modelo, instances: readonly EroInstance[]): UsageResult {
  const byName = new Map(modelo.eroj.map((entry) => [entry.ero.name, entry]));
  const eroOf = (instance: EroInstance) => byName.get(instance.ero);
  const violations: UsageViolation[] = [];
  const at = (
    instance: number[],
    rule: RuleId,
    message: string,
    suggestion: string,
    regulo?: Regulo,
    severity: IssueSeverity = "error",
  ) => {
    const issue: ValidationIssue = {
      rule,
      severity,
      path: formatIssuePath({ file: "instances", pointer: `/${instance[0] ?? 0}` }),
      message,
      suggestion,
    };
    if (regulo !== undefined)
      issue.regulo = { id: regulo.id, name: regulo.name, kialo: regulo.kialo };
    violations.push({ instance, issue });
  };

  instances.forEach((instance, index) => {
    const ero = eroOf(instance);
    if (ero === undefined) {
      at(
        [index],
        "ero-unknown",
        `Instance ${index} names the Ero ${instance.ero}, which does not exist.`,
        `Use one of ${[...byName.keys()].join(", ") || "no Eroj yet"}.`,
      );
      return;
    }
    const props = effectiveProps(ero.skemo, instance.props);
    // A constraint may read a slot (Spec 009, D-04) or a string prop (Spec 011 ①, D-08): filled
    // or empty stands next to the props.
    const combination = {
      ...props,
      ...slotStates(ero.skemo, instance),
      ...propStates(ero.skemo, instance),
    };
    const forbidden = forbiddenBy(ero.skemo, combination);
    if (forbidden !== undefined) {
      at(
        [index],
        "ero-prop-constraint",
        `Instance ${index} of ${ero.ero.name} combines ${describeCombination(combination, [...Object.keys(forbidden.when), ...Object.keys(forbidden.allowed)])}, which the Skemo forbids: ${forbidden.kialo}`,
        `Use ${Object.entries(forbidden.allowed)
          .map(([key, values]) => `${key}=${values.join(" or ")}`)
          .join(", ")} with ${describeCombination(props, Object.keys(forbidden.when))}.`,
      );
    }
    for (const finding of uzoFindings(index, ero, instance)) {
      at(finding.instance, finding.rule, finding.message, finding.suggestion);
    }
  });

  for (const regulo of modelo.reguloj) {
    const enforcer = USAGE_ENFORCERS[regulo.name];
    if (enforcer === undefined || regulo.checkability !== "automatic") continue;
    for (const finding of enforcer({ modelo, regulo, instances, eroOf })) {
      at(
        finding.instance,
        regulo.name as RuleId,
        finding.message,
        finding.suggestion,
        regulo,
        finding.severity,
      );
    }
  }

  violations.sort(
    (a, b) =>
      (a.instance[0] ?? 0) - (b.instance[0] ?? 0) ||
      (a.issue.rule < b.issue.rule ? -1 : a.issue.rule > b.issue.rule ? 1 : 0),
  );
  // A warning or an info is reported, but does not make the instances invalid (D-02, D-03).
  return {
    instances: instances.length,
    valid: violations.every((violation) => violation.issue.severity !== "error"),
    violations,
  };
}
