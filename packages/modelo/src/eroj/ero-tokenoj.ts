// The Ero-Tokens (Constitution v2.3, Spec 024 ②, § 3 A): the third level of the Vortaro. For every
// part property of every Ero and Sxablono there is one token per combination of the keys the
// property is keyed by — `ero.butono.surface.fill.emphasis.high.intent.neutral.hover` — derived
// mechanically from the Skemo (Art. II): the kind, the name, the part, the property, then every
// axis with its value and, last, the state; a hyphen of the Skemo becomes a segment of the token
// grammar. Its default value is an alias on the role token the Skemo binds, so every existing brand
// looks the same; a brand re-points it or gives it a value of its own (Art. IV: an alias is an
// assignment). A keyword binding (inherit, none) and a position term have no token: they are
// structure, not a value a brand changes. The projections and the Eroj read these tokens. Pure.

import type { DtcgType } from "../contracts/dtcg.js";
import { CORE_SET_NAME, isTokenName } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { KontrastKategorio, LoadedEro, LoadedSxablono, Modelo } from "../contracts/modelo.js";
import type { Skemo, SkemoPartProperty, SkemoPartSource } from "../generated/modelo-schema.js";
import {
  boundToken,
  type Combination,
  combinationsOf,
  isBindingKeyword,
  isPositionKeyword,
  PART_PROPERTY_TYPES,
  POSITION_PROPERTY,
  STATE_KEY,
} from "./skemo-rules.js";

/** The first segment of an Ero-Token of an Ero, and of one of a Sxablono. */
export const ERO_TOKEN_PREFIX = "ero";
export const SXABLONO_TOKEN_PREFIX = "sxablono";

/** The role the core gives every Ero-Token (the `role` of its Fundamento extension). */
export const ERO_TOKEN_ROLE = "ero";

/** One Ero-Token as the Skemo derives it. */
export interface EroTokeno {
  /** The canonical token name. */
  name: string;
  type: DtcgType;
  /** The role token the Skemo binds in this combination: the default alias. */
  alias: string;
  /** `ero` or `sxablono`. */
  kind: typeof ERO_TOKEN_PREFIX | typeof SXABLONO_TOKEN_PREFIX;
  /** The Ero or Sxablono. */
  owner: string;
  part: string;
  property: string;
  /** The keys of the property (after `sameAs`) with the values of this combination; state included. */
  when: Combination;
}

/** Whether a token name is an Ero-Token (of an Ero or of a Sxablono). */
export function isEroTokenName(name: string): boolean {
  return name.startsWith(`${ERO_TOKEN_PREFIX}.`) || name.startsWith(`${SXABLONO_TOKEN_PREFIX}.`);
}

/**
 * The token type of each part property that takes a token: the types of the Skemo rules, plus the
 * shadow of a surface (an elevation.shadow.* token) and the stroke of a border (a stroke.* token),
 * which the rules check by name. A position takes a term and has no type.
 */
export const ERO_TOKEN_TYPES: Readonly<Partial<Record<SkemoPartProperty, DtcgType>>> = {
  ...PART_PROPERTY_TYPES,
  shadow: "shadow",
  stroke: "strokeStyle",
};

/** A segment of the token grammar from a name of the Skemo: `focus-ring` → `focus.ring`. */
const segments = (name: string): string[] => name.split("-").filter((part) => part !== "");

/**
 * The keys a part property is keyed by (after `sameAs`), in the order of its `by` list; empty for
 * a fixed property.
 */
function keysOf(skemo: Skemo, source: SkemoPartSource | undefined, depth = 0): string[] {
  if (source === undefined || depth > 8) return [];
  if ("by" in source) return [...source.by];
  if ("sameAs" in source) {
    const [part = "", property = ""] = source.sameAs.split(".");
    return keysOf(skemo, skemo.parts[part]?.[property as SkemoPartProperty], depth + 1);
  }
  return [];
}

/** The part and property a `sameAs` source ends at; the given ones otherwise. */
function targetOf(
  skemo: Skemo,
  part: string,
  property: string,
  depth = 0,
): { part: string; property: string } | undefined {
  const source = skemo.parts[part]?.[property as SkemoPartProperty];
  if (source === undefined || depth > 8) return undefined;
  if ("sameAs" in source) {
    const [targetPart = "", targetProperty = ""] = source.sameAs.split(".");
    return targetOf(skemo, targetPart, targetProperty, depth + 1);
  }
  return { part, property };
}

/**
 * The name of the Ero-Token of `part.property` in `combination`: kind, owner, part, property, the
 * keys of the property (axis and value, the state bare at the end). The combination may carry
 * more keys than the property is keyed by; only its own keys name the token. `undefined` when the
 * property takes a term (position) or is bound to a keyword in this combination, or when nothing
 * binds it.
 */
export function eroTokenNameOf(
  kind: EroTokeno["kind"],
  owner: string,
  skemo: Skemo,
  part: string,
  property: string,
  combination: Combination,
): string | undefined {
  const target = targetOf(skemo, part, property);
  if (target === undefined || property === POSITION_PROPERTY) return undefined;
  const bound = boundToken(skemo, part, property, combination);
  if (bound === undefined || isBindingKeyword(bound.token) || isPositionKeyword(bound.token)) {
    return undefined;
  }
  const keys = keysOf(skemo, skemo.parts[target.part]?.[target.property as SkemoPartProperty]);
  const parts = [kind, ...segments(owner), ...segments(target.part), ...segments(target.property)];
  for (const key of keys) {
    if (key === STATE_KEY) continue;
    const value = combination[key];
    if (value === undefined) return undefined;
    parts.push(...segments(key), ...segments(value));
  }
  if (keys.includes(STATE_KEY)) {
    const state = combination[STATE_KEY];
    if (state === undefined) return undefined;
    parts.push(...segments(state));
  }
  const name = parts.join(".");
  return isTokenName(name) ? name : undefined;
}

/** The Ero-Token of a part property of a loaded Ero in a combination (see `eroTokenNameOf`). */
export function eroTokenOf(
  entry: LoadedEro,
  part: string,
  property: string,
  combination: Combination,
): string | undefined {
  return eroTokenNameOf(ERO_TOKEN_PREFIX, entry.ero.name, entry.skemo, part, property, combination);
}

/** The Ero-Token of a fixed part property of a Sxablono (its parts are fixed, no keys). */
export function sxablonoTokenOf(
  entry: LoadedSxablono,
  part: string,
  property: string,
): string | undefined {
  return eroTokenNameOf(
    SXABLONO_TOKEN_PREFIX,
    entry.sxablono.name,
    sxablonoSkemoOf(entry),
    part,
    property,
    {},
  );
}

/** A Sxablono's parts as a Skemo of parts alone, so the same derivation serves both. */
function sxablonoSkemoOf(entry: LoadedSxablono): Skemo {
  return {
    id: entry.skemo.id,
    ero: entry.sxablono.id,
    props: [],
    states: ["rest"],
    slots: [],
    parts: entry.skemo.parts,
    bindings: [],
    a11y: { role: "none", name: [], states: {}, keys: [] },
  } as unknown as Skemo;
}

/**
 * Every Ero-Token of an Ero: for every part property that is bound itself (a `sameAs` follows its
 * target and has no token of its own), one token per allowed combination of its keys — a state
 * without a binding of its own gets the token of rest as its alias, so every cell of the matrix
 * variants × states has a token a brand may set.
 */
export function eroTokenojOf(entry: LoadedEro): EroTokeno[] {
  return tokensOf(ERO_TOKEN_PREFIX, entry.ero.name, entry.skemo);
}

/** Every Ero-Token of a Sxablono: one per fixed part property. */
export function sxablonoTokenojOf(entry: LoadedSxablono): EroTokeno[] {
  return tokensOf(SXABLONO_TOKEN_PREFIX, entry.sxablono.name, sxablonoSkemoOf(entry));
}

function tokensOf(kind: EroTokeno["kind"], owner: string, skemo: Skemo): EroTokeno[] {
  const out: EroTokeno[] = [];
  const seen = new Set<string>();
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      if (source === undefined || "sameAs" in source || property === POSITION_PROPERTY) continue;
      const type = ERO_TOKEN_TYPES[property as SkemoPartProperty];
      if (type === undefined) continue;
      const keys = keysOf(skemo, source);
      for (const combination of combinationsOf(skemo, keys)) {
        const name = eroTokenNameOf(kind, owner, skemo, part, property, combination);
        const bound = boundToken(skemo, part, property, combination);
        if (name === undefined || bound === undefined) continue;
        if (seen.has(name)) {
          throw new Error(
            `The Skemo of ${owner} derives the Ero-Token ${name} twice (${part}.${property}); two combinations must never share a name.`,
          );
        }
        seen.add(name);
        out.push({
          name,
          type,
          alias: bound.token,
          kind,
          owner,
          part,
          property,
          when: combination,
        });
      }
    }
  }
  return out;
}

const tokenojCache: WeakMap<Modelo, EroTokeno[]> = new WeakMap();

/**
 * Every Ero-Token of the Modelo: the Eroj in their order, then the Sxablonoj. The derivation only
 * depends on the Modelo, so it is kept per Modelo (the checks and the MCP server ask for it per
 * call); callers read it, they never change it.
 */
export function eroTokenojOfModelo(modelo: Modelo): EroTokeno[] {
  const cached = tokenojCache.get(modelo);
  if (cached !== undefined) return cached;
  const tokens = [
    ...modelo.eroj.flatMap(eroTokenojOf),
    ...(modelo.sxablonoj ?? []).flatMap(sxablonoTokenojOf),
  ];
  tokenojCache.set(modelo, tokens);
  return tokens;
}

/**
 * `ero-tokeno-missing` and `ero-tokeno-unknown`: the core defines every Ero-Token the Skemoj derive,
 * with the type of its part property, and no Ero-Token the Skemoj do not derive (a token left
 * behind by a Skemo change). The value is the core's business (the reference brand may re-point
 * it); the derivation writes the alias only where the token is new.
 */
export function eroTokenojIssues(modelo: Modelo): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  if (core === undefined) return [];
  const derived = new Map(eroTokenojOfModelo(modelo).map((token) => [token.name, token]));
  const issues: ValidationIssue[] = [];
  for (const token of derived.values()) {
    const defined = core.tokens[token.name];
    if (defined === undefined) {
      issues.push({
        rule: "ero-tokeno-missing",
        severity: "error",
        path: formatIssuePath({ file: core.file, pointer: pointerOf(token.name) }),
        message: `The Skemo of ${token.owner} derives the Ero-Token ${token.name} (${token.part}.${token.property}), which core does not define.`,
        suggestion: `Run \`pnpm vortaro:ero-tokenoj\`: it writes the token into core as an alias on ${token.alias} and into every Aspekto package.`,
      });
    } else if (defined.type !== token.type) {
      issues.push({
        rule: "ero-tokeno-missing",
        severity: "error",
        path: formatIssuePath(defined.location),
        message: `The Ero-Token ${token.name} has the type ${defined.type} in core; ${token.part}.${token.property} of ${token.owner} needs ${token.type}.`,
        suggestion: `Give ${token.name} the type ${token.type} (an alias on a ${token.type} token such as ${token.alias}).`,
      });
    }
  }
  for (const token of Object.values(core.tokens)) {
    if (!isEroTokenName(token.name) || derived.has(token.name)) continue;
    issues.push({
      rule: "ero-tokeno-unknown",
      severity: "error",
      path: formatIssuePath(token.location),
      message: `Core defines the Ero-Token ${token.name}, which no Skemo derives.`,
      suggestion:
        "Run `pnpm vortaro:ero-tokenoj`: it removes a token no Skemo derives any more (a part, a property or a combination that left the Skemo).",
    });
  }
  return issues;
}

function pointerOf(name: string): string {
  return `/${name
    .split(".")
    .map((segment) => segment.replaceAll("~", "~0").replaceAll("/", "~1"))
    .join("/")}`;
}

/** A contrast pair of the third level: the text of a cell on its surface (Spec 024, Grenze 1). */
export interface EroKontrastParo {
  /** `<foreground>+<background>`: the two Ero-Tokens of the cell. */
  name: string;
  foreground: string;
  background: string;
  kategorio: KontrastKategorio;
  ero: string;
  /** The cell: the keys of both parts with their values. */
  when: Combination;
}

/** States whose text is not read, so its pair is not measured (as the Skemo rules exempt it). */
const EXEMPT_STATES: ReadonlySet<string> = new Set(["disabled"]);

/**
 * The pairs of every Ero on the third level: in every allowed combination the colour of each text
 * part on each fill, as Ero-Tokens — the cells the fixed contrast rule holds on when a brand
 * departs from the roles. With `onlyDeparting` (the default) only the cells whose text or fill
 * some set assigns otherwise than the role the Skemo binds: the others are the declared pairs of
 * the roles, measured already. The kategorio is the declared pair's where the roles are a pair,
 * text-normal otherwise.
 */
export function eroKontrastParojOf(modelo: Modelo, onlyDeparting = true): EroKontrastParo[] {
  if (onlyDeparting) {
    const cached = parojCache.get(modelo);
    if (cached !== undefined) return cached;
    const pairs = derivePairs(modelo, true);
    parojCache.set(modelo, pairs);
    return pairs;
  }
  return derivePairs(modelo, false);
}

const parojCache: WeakMap<Modelo, EroKontrastParo[]> = new WeakMap();

function derivePairs(modelo: Modelo, onlyDeparting: boolean): EroKontrastParo[] {
  const declared = new Map(
    modelo.kontrastParoj.map((pair) => [`${pair.foreground} ${pair.background}`, pair.kategorio]),
  );
  const departing = new Set<string>();
  if (onlyDeparting) {
    const defaults = new Map(eroTokenojOfModelo(modelo).map((token) => [token.name, token.alias]));
    for (const set of modelo.setoj) {
      for (const token of Object.values(set.tokens)) {
        const alias = defaults.get(token.name);
        if (alias !== undefined && token.value !== `{${alias}}`) departing.add(token.name);
      }
    }
    if (departing.size === 0) return [];
  }
  const out: EroKontrastParo[] = [];
  for (const entry of modelo.eroj) {
    const { skemo, ero } = entry;
    const textParts = skemo.slots
      .filter(
        (slot) =>
          slot.text === true && slot.beside !== true && skemo.parts[slot.name]?.color !== undefined,
      )
      .map((slot) => slot.name);
    const surfaces = Object.entries(skemo.parts)
      .filter(([, properties]) => properties.fill !== undefined)
      .map(([name]) => name);
    for (const textPart of textParts) {
      for (const surface of surfaces) {
        const keys = [
          ...new Set([
            ...keysOf(skemo, skemo.parts[textPart]?.color),
            ...keysOf(skemo, skemo.parts[surface]?.fill),
          ]),
        ];
        for (const combination of combinationsOf(skemo, keys)) {
          const state = combination[STATE_KEY];
          if (state !== undefined && EXEMPT_STATES.has(state)) continue;
          const foreground = eroTokenOf(entry, textPart, "color", combination);
          const background = eroTokenOf(entry, surface, "fill", combination);
          if (foreground === undefined || background === undefined) continue;
          if (onlyDeparting && !departing.has(foreground) && !departing.has(background)) continue;
          const roles = `${boundToken(skemo, textPart, "color", combination)?.token} ${boundToken(skemo, surface, "fill", combination)?.token}`;
          out.push({
            name: `${foreground}+${background}`,
            foreground,
            background,
            kategorio: declared.get(roles) ?? "text-normal",
            ero: ero.name,
            when: combination,
          });
        }
      }
    }
  }
  return out;
}
