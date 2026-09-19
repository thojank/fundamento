// Usage evaluation (Spec 003, plan D-04, D-16): judges Ero instances of a design or of code
// against the Ero Reguloj and the Skemo. The Reguloj judge instances, not Modelo data, so their
// enforcers live here and not in Modelo validation; `check_usage` and the Jugxo examples use this.
// Pure.

import type { RuleId, ValidationIssue } from "../contracts/issues.js";
import { formatIssuePath } from "../contracts/issues.js";
import type { EroInstance, LoadedEro, Modelo, Regulo } from "../contracts/modelo.js";
import type { Skemo } from "../generated/modelo-schema.js";
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
 * The Skemo intent a text names: the first intent (declaration order) one of whose keywords, in
 * any language, is a word of the text. Deterministic, no model (D-16).
 */
export function intentOf(
  skemo: Skemo,
  text: string,
): { intent: NonNullable<Skemo["intents"]>[number]; keyword: string; lingvo: string } | undefined {
  const words = new Set(wordsOf(text));
  for (const intent of skemo.intents ?? []) {
    for (const [lingvo, keywords] of Object.entries(intent.keywords)) {
      const keyword = keywords.find((candidate) =>
        words.has(candidate.normalize("NFC").toLowerCase()),
      );
      if (keyword !== undefined) return { intent, keyword, lingvo };
    }
  }
  return undefined;
}

type Context = {
  modelo: Modelo;
  regulo: Regulo;
  instances: readonly EroInstance[];
  eroOf: (instance: EroInstance) => LoadedEro | undefined;
};

type UsageEnforcer = (
  context: Context,
) => { instance: number[]; message: string; suggestion: string }[];

/** Enforcers of the Ero Reguloj by name (the repo test accepts this table next to the Modelo's). */
export const USAGE_ENFORCERS: Readonly<Record<string, UsageEnforcer>> = {
  "one-primary-per-container": ({ instances, eroOf, regulo }) => {
    const groups = new Map<string, number[]>();
    instances.forEach((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return;
      if (effectiveProps(ero.skemo, instance.props).variant !== "primary") return;
      const container = instance.container ?? NO_CONTAINER;
      groups.set(container, [...(groups.get(container) ?? []), index]);
    });
    return [...groups.entries()]
      .filter(([, indices]) => indices.length > 1)
      .map(([container, indices]) => ({
        instance: indices,
        message: `${indices.length} instances with variant=primary in ${container === NO_CONTAINER ? "one container" : `container ${container}`} (instances ${indices.join(", ")}).`,
        suggestion: "Keep one primary action per container; make the others secondary or tertiary.",
      }));
  },
  "destructive-not-primary-color": ({ instances, eroOf, regulo }) =>
    instances.flatMap((instance, index) => {
      const ero = eroOf(instance);
      if (ero === undefined || !applies(regulo, ero)) return [];
      const destructive = (ero.skemo.intents ?? []).find((intent) => intent.regulo === regulo.name);
      if (destructive === undefined) return [];
      const named =
        instance.intent === destructive.intent ||
        intentOf(ero.skemo, instance.label ?? "")?.intent === destructive;
      if (!named) return [];
      const props = effectiveProps(ero.skemo, instance.props);
      const primary = String(destructive.props.variant ?? "primary");
      const tone = destructive.props.tone;
      if (props.variant !== primary || tone === undefined || props.tone === String(tone)) return [];
      return [
        {
          instance: [index],
          message: `Instance ${index} is a destructive action with ${describeCombination(props, ["variant", "tone"])}.`,
          suggestion: `As the main action use ${describeCombination(Object.fromEntries(Object.entries(destructive.props).map(([k, v]) => [k, String(v)])), Object.keys(destructive.props))}; next to another primary action use variant=secondary.`,
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
  ) => {
    const issue: ValidationIssue = {
      rule,
      severity: "error",
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
  });

  for (const regulo of modelo.reguloj) {
    const enforcer = USAGE_ENFORCERS[regulo.name];
    if (enforcer === undefined || regulo.checkability !== "automatic") continue;
    for (const finding of enforcer({ modelo, regulo, instances, eroOf })) {
      at(finding.instance, regulo.name as RuleId, finding.message, finding.suggestion, regulo);
    }
  }

  violations.sort(
    (a, b) =>
      (a.instance[0] ?? 0) - (b.instance[0] ?? 0) ||
      (a.issue.rule < b.issue.rule ? -1 : a.issue.rule > b.issue.rule ? 1 : 0),
  );
  return { instances: instances.length, valid: violations.length === 0, violations };
}
