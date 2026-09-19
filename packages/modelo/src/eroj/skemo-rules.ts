// Skemo ↔ Vortaro rules (Spec 003, FR-04, plan D-03, data-model §4). Pure: the loaded Modelo and
// the raw Jugxo files in, issues out. A Skemo binds only tokens that core defines, with a type that
// fits the part property, covers every combination of the props and states it is keyed by, and
// puts its text only on surfaces whose pair is a declared KontrastParo.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { DtcgType, RuleId, ValidationIssue } from "../contracts/index.js";
import { formatIssuePath } from "../contracts/issues.js";
import type { LoadedEro, Modelo } from "../contracts/modelo.js";
import type { Skemo, SkemoPartProperty, SkemoPartSource } from "../generated/modelo-schema.js";
import { appendPointer } from "../json/pointer.js";
import type { ModeloDocument, ModeloFiles } from "../load/files.js";
import { isJsonObject, rawEntries } from "../validate/raw.js";

/** The key of a binding or `by` list that stands for the Ero's state. */
export const STATE_KEY = "state";

/** The state every other state falls back to when it has no binding of its own. */
export const REST_STATE = "rest";

/** States whose text pair is exempt from contrast (Phase-1 Regulo: disabled is not read). */
const CONTRAST_EXEMPT_STATES: ReadonlySet<string> = new Set(["disabled"]);

/** Token type each platform-neutral part property needs (data-model §4). */
export const PART_PROPERTY_TYPES: Readonly<Record<SkemoPartProperty, DtcgType>> = {
  fill: "color",
  color: "color",
  typography: "typography",
  width: "dimension",
  height: "dimension",
  "inline-padding": "dimension",
  gap: "dimension",
  radius: "dimension",
  ring: "border",
  offset: "dimension",
  size: "dimension",
  duration: "duration",
  easing: "cubicBezier",
};

/** A combination of key values, e.g. `{ variant: "primary", state: "rest" }`. */
export type Combination = Readonly<Record<string, string>>;

/** The values a binding key may take: enum values, `true`/`false` for booleans, or the states. */
export function keyValues(skemo: Skemo, key: string): readonly string[] | undefined {
  if (key === STATE_KEY) return skemo.states;
  const prop = skemo.props.find((candidate) => candidate.name === key);
  if (prop?.kind === "enum") return prop.values ?? [];
  if (prop?.kind === "boolean") return ["true", "false"];
  return undefined;
}

/** Every combination of `keys`, in declaration order, minus those a constraint forbids. */
export function combinationsOf(skemo: Skemo, keys: readonly string[]): Combination[] {
  let combinations: Record<string, string>[] = [{}];
  for (const key of keys) {
    const values = keyValues(skemo, key) ?? [];
    combinations = combinations.flatMap((combination) =>
      values.map((value) => ({ ...combination, [key]: value })),
    );
  }
  return combinations.filter((combination) => forbiddenBy(skemo, combination) === undefined);
}

/** The first constraint the combination violates, if any. Keys it does not name are free. */
export function forbiddenBy(
  skemo: Skemo,
  combination: Combination,
): NonNullable<Skemo["constraints"]>[number] | undefined {
  return (skemo.constraints ?? []).find((constraint) => {
    const applies = Object.entries(constraint.when).every(
      ([key, value]) => combination[key] === value,
    );
    if (!applies) return false;
    return Object.entries(constraint.allowed).some(
      ([key, allowed]) => combination[key] !== undefined && !allowed.includes(combination[key]),
    );
  });
}

/** Where a part property's token comes from in one combination. */
export interface BoundToken {
  token: string;
  /** JSON Pointer (inside the Ero file) of the binding or `fixed` that supplied it. */
  pointer: string;
}

/**
 * The token of `part.property` in `combination`: a `fixed` token, the most specific matching
 * binding (most `when` keys, then declaration order; a state without a binding falls back to
 * `rest`), or the token of the `sameAs` target. `undefined` when nothing binds it.
 */
export function boundToken(
  skemo: Skemo,
  part: string,
  property: string,
  combination: Combination,
  seen: ReadonlySet<string> = new Set(),
): BoundToken | undefined {
  const source = skemo.parts[part]?.[property as SkemoPartProperty];
  if (source === undefined) return undefined;
  if ("fixed" in source) {
    return { token: source.fixed, pointer: `/skemo/parts/${part}/${property}/fixed` };
  }
  if ("sameAs" in source) {
    const key = `${part}.${property}`;
    if (seen.has(key)) return undefined;
    const [targetPart = "", targetProperty = ""] = source.sameAs.split(".");
    return boundToken(skemo, targetPart, targetProperty, combination, new Set([...seen, key]));
  }
  const match = matchingBinding(skemo, part, property, combination);
  if (match !== undefined) return match;
  const state = combination[STATE_KEY];
  if (state !== undefined && state !== REST_STATE) {
    return matchingBinding(skemo, part, property, { ...combination, [STATE_KEY]: REST_STATE });
  }
  return undefined;
}

function matchingBinding(
  skemo: Skemo,
  part: string,
  property: string,
  combination: Combination,
): BoundToken | undefined {
  let best: { binding: BoundToken; keys: number } | undefined;
  skemo.bindings.forEach((binding, index) => {
    if (binding.part !== part || binding.property !== property) return;
    const when = Object.entries(binding.when ?? {});
    if (!when.every(([key, value]) => combination[key] === value)) return;
    if (best === undefined || when.length > best.keys) {
      best = {
        binding: { token: binding.token, pointer: `/skemo/bindings/${index}` },
        keys: when.length,
      };
    }
  });
  return best?.binding;
}

/** `variant=primary, state=rest`: the combination's keys in the given order. */
export function describeCombination(combination: Combination, keys: readonly string[]): string {
  return keys.map((key) => `${key}=${combination[key] ?? "?"}`).join(", ");
}

/** The `by` keys of a part property, or none for `fixed`, or the target's for `sameAs`. */
function sourceKeys(skemo: Skemo, source: SkemoPartSource | undefined, depth = 0): string[] {
  if (source === undefined || depth > 8) return [];
  if ("by" in source) return source.by;
  if ("sameAs" in source) {
    const [part = "", property = ""] = source.sameAs.split(".");
    return sourceKeys(skemo, skemo.parts[part]?.[property as SkemoPartProperty], depth + 1);
  }
  return [];
}

/** Every Skemo ↔ Vortaro issue of the Modelo (data-model §4). */
export function skemoIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  const pairs = new Set(
    modelo.kontrastParoj.map((pair) => `${pair.foreground} ${pair.background}`),
  );
  const reguloNames = new Set(modelo.reguloj.map((regulo) => regulo.name));
  const issues: ValidationIssue[] = [];
  for (const entry of modelo.eroj) {
    const at = (pointer: string, rule: RuleId, message: string, suggestion: string) =>
      issues.push({
        rule,
        severity: "error",
        path: formatIssuePath({ file: entry.file, pointer }),
        message,
        suggestion,
      });
    const invalidTokens = tokenIssues(entry, core, at);
    const keysValid = keyIssues(entry, at);
    if (keysValid) coverageIssues(entry, at);
    // Pairs with a missing or mistyped token are reported by the token rules only.
    if (keysValid) pairIssues(entry, pairs, invalidTokens, at);
    constraintIssues(entry, at);
    intentIssues(entry, reguloNames, at);
  }
  issues.push(...ekzemploIssues(modelo, files));
  return issues;
}

type At = (pointer: string, rule: RuleId, message: string, suggestion: string) => void;

/** Reports missing and mistyped tokens and returns their names. */
function tokenIssues(
  entry: LoadedEro,
  core: Modelo["setoj"][number]["tokens"],
  at: At,
): Set<string> {
  const { ero, skemo } = entry;
  const invalid = new Set<string>();
  const check = (part: string, property: string, token: string, pointer: string) => {
    const defined = core[token];
    if (defined === undefined) {
      invalid.add(token);
      at(
        pointer,
        "skemo-token-missing",
        `Skemo of ${ero.name} binds ${part}.${property} to ${token}, which core does not define.`,
        "Bind an existing role token (search_tokens), or add the token to core first.",
      );
      return;
    }
    const needed = PART_PROPERTY_TYPES[property as SkemoPartProperty];
    if (needed !== undefined && defined.type !== needed) {
      invalid.add(token);
      at(
        pointer,
        "skemo-token-type",
        `Skemo of ${ero.name} binds ${part}.${property} to ${token} of type ${defined.type}; ${property} needs a token of type ${needed}.`,
        `Bind a token of type ${needed}.`,
      );
    }
  };
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      if (source !== undefined && "fixed" in source) {
        check(part, property, source.fixed, `/skemo/parts/${part}/${property}/fixed`);
      }
    }
  }
  skemo.bindings.forEach((binding, index) => {
    check(binding.part, binding.property, binding.token, `/skemo/bindings/${index}/token`);
  });
  return invalid;
}

/** `skemo-binding-invalid`: keys, values, parts and `sameAs` targets must exist. */
function keyIssues(entry: LoadedEro, at: At): boolean {
  const { ero, skemo } = entry;
  let valid = true;
  const unknownKey = (pointer: string, key: string) => {
    valid = false;
    at(
      pointer,
      "skemo-binding-invalid",
      `Skemo of ${ero.name} keys a binding by ${key}, which is neither an enum or boolean prop nor state.`,
      `Key bindings by ${[...skemo.props.filter((p) => p.kind === "enum" || p.kind === "boolean").map((p) => p.name), STATE_KEY].join(", ")}.`,
    );
  };
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      if (source === undefined) continue;
      if ("by" in source) {
        source.by.forEach((key, index) => {
          if (keyValues(skemo, key) === undefined) {
            unknownKey(`/skemo/parts/${part}/${property}/by/${index}`, key);
          }
        });
      }
      if ("sameAs" in source) {
        const [targetPart = "", targetProperty = ""] = source.sameAs.split(".");
        if (skemo.parts[targetPart]?.[targetProperty as SkemoPartProperty] === undefined) {
          valid = false;
          at(
            `/skemo/parts/${part}/${property}/sameAs`,
            "skemo-binding-invalid",
            `Skemo of ${ero.name} takes ${part}.${property} from ${source.sameAs}, which the Skemo does not define.`,
            "Point sameAs at an existing part property (part.property).",
          );
        }
      }
    }
  }
  skemo.bindings.forEach((binding, index) => {
    const source = skemo.parts[binding.part]?.[binding.property];
    if (source === undefined || !("by" in source)) {
      valid = false;
      at(
        `/skemo/bindings/${index}`,
        "skemo-binding-invalid",
        `Skemo of ${ero.name} has a binding for ${binding.part}.${binding.property}, which is not a part property keyed by props or state.`,
        `Declare ${binding.part}.${binding.property} with "by" in parts, or remove the binding.`,
      );
      return;
    }
    for (const [key, value] of Object.entries(binding.when ?? {})) {
      const pointer = appendPointer(`/skemo/bindings/${index}/when`, key);
      const values = keyValues(skemo, key);
      if (values === undefined) unknownKey(pointer, key);
      else if (!values.includes(value)) {
        valid = false;
        at(
          pointer,
          "skemo-binding-invalid",
          `Skemo of ${ero.name} keys a binding by ${key}=${value}; ${key} allows ${values.join(", ")}.`,
          `Use one of ${values.join(", ")}.`,
        );
      }
    }
  });
  return valid;
}

/** `skemo-binding-missing`: every allowed combination of a `by` list has a token. */
function coverageIssues(entry: LoadedEro, at: At): void {
  const { ero, skemo } = entry;
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      if (source === undefined || !("by" in source)) continue;
      const missing = combinationsOf(skemo, source.by).find(
        (combination) => boundToken(skemo, part, property, combination) === undefined,
      );
      if (missing !== undefined) {
        at(
          `/skemo/parts/${part}/${property}`,
          "skemo-binding-missing",
          `Skemo of ${ero.name} has no binding for ${part}.${property} when ${describeCombination(missing, source.by)}.`,
          `Add a binding for ${part}.${property} whose "when" matches that combination (a state without its own binding uses ${REST_STATE}).`,
        );
      }
    }
  }
}

/**
 * `skemo-kontrastparo-missing`: in every allowed combination (disabled exempt) the colour of each
 * text part (a part named after a slot with `text: true`) on each part `fill` is a declared pair.
 * One issue per undeclared pair, at the first combination that uses it.
 */
function pairIssues(
  entry: LoadedEro,
  pairs: ReadonlySet<string>,
  invalidTokens: ReadonlySet<string>,
  at: At,
): void {
  const { ero, skemo } = entry;
  const textParts = skemo.slots
    .filter((slot) => slot.text === true && skemo.parts[slot.name]?.color !== undefined)
    .map((slot) => slot.name);
  const surfaces = Object.entries(skemo.parts)
    .filter(([, properties]) => properties.fill !== undefined)
    .map(([name]) => name);
  const reported = new Set<string>();
  for (const textPart of textParts) {
    for (const surface of surfaces) {
      const keys = [
        ...new Set([
          ...sourceKeys(skemo, skemo.parts[textPart]?.color),
          ...sourceKeys(skemo, skemo.parts[surface]?.fill),
        ]),
      ].sort((a, b) => keyOrder(skemo, a) - keyOrder(skemo, b));
      for (const combination of combinationsOf(skemo, keys)) {
        const state = combination[STATE_KEY];
        if (state !== undefined && CONTRAST_EXEMPT_STATES.has(state)) continue;
        const foreground = boundToken(skemo, textPart, "color", combination);
        const background = boundToken(skemo, surface, "fill", combination);
        if (foreground === undefined || background === undefined) continue;
        if (invalidTokens.has(foreground.token) || invalidTokens.has(background.token)) continue;
        const key = `${foreground.token} ${background.token}`;
        if (pairs.has(key) || reported.has(key)) continue;
        reported.add(key);
        at(
          background.pointer,
          "skemo-kontrastparo-missing",
          `Skemo of ${ero.name} puts ${textPart}.color (${foreground.token}) on ${surface}.fill (${background.token}) when ${describeCombination(combination, keys)}, but no KontrastParo declares that pair.`,
          `Declare a KontrastParo with foreground ${foreground.token} and background ${background.token} in data/kontrastparoj.json, or bind tokens whose pair is declared.`,
        );
      }
    }
  }
}

/** Props in declaration order, then state. */
function keyOrder(skemo: Skemo, key: string): number {
  const index = skemo.props.findIndex((prop) => prop.name === key);
  return index === -1 ? skemo.props.length : index;
}

/** `skemo-constraint-invalid`: constraints name existing props and allowed values. */
function constraintIssues(entry: LoadedEro, at: At): void {
  const { ero, skemo } = entry;
  (skemo.constraints ?? []).forEach((constraint, index) => {
    const check = (section: "when" | "allowed", key: string, values: readonly string[]) => {
      const pointer = appendPointer(`/skemo/constraints/${index}/${section}`, key);
      const allowed = keyValues(skemo, key);
      if (allowed === undefined || key === STATE_KEY) {
        at(
          pointer,
          "skemo-constraint-invalid",
          `Skemo of ${ero.name} constrains ${key}, which is not a prop of ${ero.name}.`,
          `Constrain enum or boolean props: ${skemo.props.map((prop) => prop.name).join(", ")}.`,
        );
        return;
      }
      for (const value of values) {
        if (!allowed.includes(value)) {
          at(
            pointer,
            "skemo-constraint-invalid",
            `Skemo of ${ero.name} constrains ${key}=${value}; ${key} allows ${allowed.join(", ")}.`,
            `Use one of ${allowed.join(", ")}.`,
          );
        }
      }
    };
    for (const [key, value] of Object.entries(constraint.when)) check("when", key, [value]);
    for (const [key, values] of Object.entries(constraint.allowed)) check("allowed", key, values);
  });
}

/** `skemo-intent-invalid`: props and values exist, no constraint is violated, the Regulo exists. */
function intentIssues(entry: LoadedEro, reguloNames: ReadonlySet<string>, at: At): void {
  const { ero, skemo } = entry;
  (skemo.intents ?? []).forEach((intent, index) => {
    const combination: Record<string, string> = {};
    for (const [key, value] of Object.entries(intent.props)) {
      const pointer = appendPointer(`/skemo/intents/${index}/props`, key);
      const problem = propValueProblem(skemo, key, value);
      if (problem !== undefined) {
        at(
          pointer,
          "skemo-intent-invalid",
          `Intent ${intent.intent} of ${ero.name} sets ${key}=${String(value)}; ${problem}.`,
          "Use a prop and value the Skemo allows.",
        );
      } else {
        combination[key] = String(value);
      }
    }
    const forbidden = forbiddenBy(skemo, combination);
    if (forbidden !== undefined) {
      at(
        `/skemo/intents/${index}/props`,
        "skemo-intent-invalid",
        `Intent ${intent.intent} of ${ero.name} sets ${describeCombination(combination, Object.keys(combination))}, which a constraint forbids: ${forbidden.kialo}`,
        "Suggest a combination the constraints allow.",
      );
    }
    if (intent.regulo !== undefined && !reguloNames.has(intent.regulo)) {
      at(
        `/skemo/intents/${index}/regulo`,
        "skemo-intent-invalid",
        `Intent ${intent.intent} of ${ero.name} cites the Regulo ${intent.regulo}, which does not exist.`,
        "Cite the name of an existing Regulo (list_reguloj).",
      );
    }
  });
}

/** Why `value` is not allowed for prop `key`, or `undefined` when it is. */
export function propValueProblem(skemo: Skemo, key: string, value: unknown): string | undefined {
  const prop = skemo.props.find((candidate) => candidate.name === key);
  if (prop === undefined) {
    return `${key} is not a prop (props: ${skemo.props.map((candidate) => candidate.name).join(", ")})`;
  }
  switch (prop.kind) {
    case "enum":
      return typeof value === "string" && (prop.values ?? []).includes(value)
        ? undefined
        : `${key} allows ${(prop.values ?? []).join(", ")}`;
    case "boolean":
      return typeof value === "boolean" ? undefined : `${key} is a boolean`;
    case "number":
      return typeof value === "number" ? undefined : `${key} is a number`;
    default:
      return typeof value === "string" ? undefined : `${key} is a string`;
  }
}

/**
 * `jugxo-ekzemplo-invalid`: example instances name an existing Ero and only props and values its
 * Skemo allows. Constraints are not checked: a rejected example may show a forbidden combination.
 */
function ekzemploIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const byName = new Map(modelo.eroj.map((entry) => [entry.ero.name, entry]));
  const reguloIds = new Set(modelo.reguloj.map((regulo) => regulo.id));
  const documents: ModeloDocument[] = [
    files.data["jugxoj.json"],
    ...files.packages.flatMap((pkg) => (pkg.jugxoj ? [pkg.jugxoj] : [])),
  ];
  const issues: ValidationIssue[] = [];
  for (const document of documents) {
    for (const { entry, index } of rawEntries(document.value, "jugxoj")) {
      const ekzemplo = entry.ekzemplo;
      if (!isJsonObject(ekzemplo)) continue;
      const name = typeof entry.id === "string" ? entry.id : `#${index}`;
      const base = `/jugxoj/${index}/ekzemplo`;
      const at = (pointer: string, message: string, suggestion: string) =>
        issues.push({
          rule: "jugxo-ekzemplo-invalid",
          severity: "error",
          path: formatIssuePath({ file: document.file, pointer }),
          message,
          suggestion,
        });
      if (typeof ekzemplo.regulo === "string" && !reguloIds.has(ekzemplo.regulo)) {
        at(
          `${base}/regulo`,
          `The example of Jugxo ${name} is for Regulo ${ekzemplo.regulo}, which does not exist.`,
          "Refer to the ID of an existing Regulo.",
        );
      }
      const instances = Array.isArray(ekzemplo.instances) ? ekzemplo.instances : [];
      instances.forEach((instance: unknown, position) => {
        if (!isJsonObject(instance)) return;
        const pointer = `${base}/instances/${position}`;
        const ero = typeof instance.ero === "string" ? byName.get(instance.ero) : undefined;
        if (ero === undefined) {
          at(
            `${pointer}/ero`,
            `Example instance ${position} of Jugxo ${name} names the Ero ${String(instance.ero)}, which does not exist.`,
            `Name an existing Ero (${[...byName.keys()].join(", ") || "none"}).`,
          );
          return;
        }
        const props = isJsonObject(instance.props) ? instance.props : {};
        for (const [key, value] of Object.entries(props)) {
          const problem = propValueProblem(ero.skemo, key, value);
          if (problem !== undefined) {
            at(
              appendPointer(`${pointer}/props`, key),
              `Example instance ${position} of Jugxo ${name} sets ${key}=${String(value)}; ${ero.ero.name} ${problem.startsWith(`${key} allows `) ? `allows ${problem.slice(key.length + 8)}` : `says ${problem}`}.`,
              "Use props and values the Skemo allows; a wrong example shows a Regulo violation, not an unknown value.",
            );
          }
        }
      });
    }
  }
  return issues;
}
