// Usage evaluation (Spec 003, plan D-04, D-16): judges Ero instances of a design or of code
// against the Ero Reguloj and the Skemo. The Reguloj judge instances, not Modelo data, so their
// enforcers live here and not in Modelo validation; `check_usage` and the Jugxo examples use this.
// Pure.

import type { IssueSeverity, RuleId, ValidationIssue } from "../contracts/issues.js";
import { formatIssuePath } from "../contracts/issues.js";
import type { EroInstance, LoadedEro, Modelo, Regulo } from "../contracts/modelo.js";
import type {
  Skemo,
  UzoBoundary,
  UzoContent,
  UzoLayoutAllowance,
} from "../generated/modelo-schema.js";
import { describeCombination, forbiddenBy } from "./skemo-rules.js";

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
 * The Skemo goal a text names: the first goal (declaration order) one of whose keywords, in any
 * language, is a word of the text. Deterministic, no model (D-16). Called goal since F1-T00
 * (Spec 007, OP-4): `intent` is the name of a prop.
 */
export function goalOf(
  skemo: Skemo,
  text: string,
  options: { lingvo?: string } = {},
): { goal: NonNullable<Skemo["goals"]>[number]; keyword: string; lingvo: string } | undefined {
  const words = new Set(wordsOf(text));
  for (const goal of skemo.goals ?? []) {
    for (const [lingvo, keywords] of Object.entries(goal.keywords)) {
      if (options.lingvo !== undefined && lingvo !== options.lingvo) continue;
      const keyword = keywords.find((candidate) =>
        words.has(candidate.normalize("NFC").toLowerCase()),
      );
      if (keyword !== undefined) return { goal, keyword, lingvo };
    }
  }
  return undefined;
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

/** Why a text fails a check of a Uzo text rule (data-model §2.1, `UzoContent.check`), or nothing. */
export function textCheckFailure(
  skemo: Skemo,
  check: UzoContent["check"],
  text: string,
): string | undefined {
  switch (check.kind) {
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
): string | undefined {
  const labels: { label: string; lingvo: string | undefined }[] = [];
  for (const jugxo of modelo.jugxoj) {
    if (jugxo.decision !== "approved" || jugxo.ekzemplo?.regulo !== regulo.id) continue;
    for (const instance of jugxo.ekzemplo.instances) {
      const label = textOf(instance);
      const skemo = eroOf(instance)?.skemo;
      if (label === undefined || skemo === undefined) continue;
      labels.push({ label, lingvo: lingvoOf(skemo, label) });
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
    // Text rules judge a text; an instance without one violates label-required alone (§5).
    const text = textOf(instance);
    if (text === undefined) return [];
    if (rule.when !== undefined) {
      const goal = goalOfInstance(ero.skemo, instance);
      if (goal === undefined || !rule.when.goal.includes(goal)) return [];
    }
    const failure = textCheckFailure(ero.skemo, rule.check, text);
    if (failure === undefined) return [];
    const lingvo = lingvoOf(ero.skemo, text) ?? genericLingvo(rule.check, text) ?? DEFAULT_LINGVO;
    const example = approvedLabel(modelo, regulo, lingvo, eroOf);
    const suggestion =
      example === undefined
        ? `Write a label that follows the rule: ${regulo.statement}`
        : `Write the label as the approved example does, e.g. "${example}".`;
    // Overridden by the Aspekto of the instance: visible as info, not as a violation (Art. VI).
    const jugxo = overrideOf(modelo, instance, rule);
    if (jugxo !== undefined) {
      return [
        {
          instance: [index],
          severity: "info",
          message: `Instance ${index} of ${ero.ero.name} is labelled "${text}": ${failure}. The Aspekto ${instance.aspekto} overrides ${regulo.name} with the Jugxo ${jugxo}.`,
          suggestion: `Keep the label if the Jugxo ${jugxo} covers it; otherwise ${suggestion.charAt(0).toLowerCase()}${suggestion.slice(1)}`,
        },
      ];
    }
    return [
      {
        instance: [index],
        severity: rule.fixed ? "error" : (rule.severity ?? "error"),
        message: `Instance ${index} of ${ero.ero.name} is labelled "${text}": ${failure}.`,
        suggestion,
      },
    ];
  });

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
      if (uzo.layout.wrap !== "never" || text === undefined || !/\r?\n/.test(text)) continue;
      findings.push(boundaryFinding(index, ero, boundary, "has a label that breaks into lines"));
    }
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
    const forbidden = forbiddenBy(ero.skemo, props);
    if (forbidden !== undefined) {
      at(
        [index],
        "ero-prop-constraint",
        `Instance ${index} of ${ero.ero.name} combines ${describeCombination(props, [...Object.keys(forbidden.when), ...Object.keys(forbidden.allowed)])}, which the Skemo forbids: ${forbidden.kialo}`,
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
