// Penpot Celo (Art. XII, item 5): one folder per Aspekto that Penpot imports as it is (Tokens →
// Import → folder or ZIP of it). Penpot reads what this Celo writes, and nothing is converted
// after it:
//
// - One file per brand. An import replaces a file's whole token library, and Penpot activates the
//   union of the sets of the active themes; a set bound to brand and colour scheme at once has no
//   place in such a union. The brand is therefore folded into the sets, in resolution order, and
//   switching the brand means switching the file (Manko, celo penpot, property themes).
// - Themes from the conjunctions. Dimensioj that a conjunction set ties together form one theme
//   group with a theme per combination; every other Dimensio keeps its own group with a theme per
//   value. A theme then lists exactly the sets whose kondicxoj its combination fulfils, and the
//   union Penpot builds is the set of active sets of the resolver. A conjunction set across two
//   groups cannot happen by construction; if it ever does, the Celo stops with its name instead of
//   writing values that are wrong only in Penpot.
// - Values and types as Penpot reads them: a px dimension as its number in a string, a colour as
//   #rrggbb[aa], the `$type` from Penpot's table. A token of a type Penpot does not know stays in
//   the file in DTCG form — Penpot skips it on import — and the Celo stops unless a Manko records
//   that type. Keeping it is what makes the Manko close itself: its closing condition is
//   `import-kept`, and the very import that skips the token today measures it; the day Penpot
//   keeps it, the Manko is closed without a change to this Celo.
//
// Pure: a function of the export (`modeloJson`), byte-identical over runs.

import {
  CORE_SET_NAME,
  compareSetOrderKeys,
  type DtcgType,
  type ModeloJson,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";

/** A Modelo that this Celo cannot write without writing wrong values. */
export class PenpotCeloError extends Error {
  override name = "PenpotCeloError";
}

/** The Dimensio the brand is; it is folded into the sets, one file per value. */
const ASPEKTO = "aspekto";

// ---------------------------------------------------------------------------------------------
// Types: Penpot's table (common/src/app/common/types/token.cljc, `token-type->dtcg-token-type`).

/** A name path with a DTCG type that Penpot types more narrowly than the type alone says. */
interface PenpotPathType {
  path: string;
  types: readonly DtcgType[];
  penpot: string;
  /**
   * What the row rests on. `composite`: the Modelo itself says what these tokens are — a
   * typography composite takes them in the field Penpot's type names, and a test holds every
   * token under the path against that. `name`: only the name path says it; the row is a guess,
   * and that it has to guess is a finding about the Modelo, which does not state what these
   * tokens mean.
   */
  basis: "composite" | "name";
}

/**
 * Where Penpot's fields ask for a narrower type than the DTCG one: a font size field takes only
 * `fontSizes`, a letter spacing field only `letterSpacing`, an opacity field only `opacity`. Keyed
 * on the canonical name path, as the Tailwind namespaces are. Each row says what it rests on.
 */
const PENPOT_PATH_TYPES: readonly PenpotPathType[] = [
  // Every font.size token reaches a typography composite's fontSize field.
  { path: "font.size", types: ["dimension"], penpot: "fontSizes", basis: "composite" },
  // Every font.tracking token reaches a typography composite's letterSpacing field.
  { path: "font.tracking", types: ["dimension"], penpot: "letterSpacing", basis: "composite" },
  // Guessed (2026-10-07): no composite, no Ero and no Regulo refers to an opacity token; that
  // these numbers are opacities stands only in their name and $description.
  { path: "opacity", types: ["number"], penpot: "opacity", basis: "name" },
];

/** The rows of the table, for the test that holds each against what it rests on. */
export const PENPOT_TYPE_TABLE: readonly PenpotPathType[] = PENPOT_PATH_TYPES;

/** Every other DTCG type Penpot reads, under Penpot's name for it. */
const PENPOT_TYPES: Partial<Record<DtcgType, string>> = {
  color: "color",
  dimension: "dimension",
  number: "number",
  fontFamily: "fontFamilies",
  fontWeight: "fontWeights",
  typography: "typography",
  shadow: "shadow",
};

/** Penpot's `$type` for a token, or `undefined` for a type Penpot does not read. */
export function penpotType(name: string, type: DtcgType): string | undefined {
  const segments = name.split(".");
  const narrow = PENPOT_PATH_TYPES.find(
    (entry) =>
      entry.types.includes(type) &&
      entry.path.split(".").every((segment, index) => segments[index] === segment),
  );
  return narrow?.penpot ?? PENPOT_TYPES[type];
}

// ---------------------------------------------------------------------------------------------
// Values.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A value as Penpot reads it. Penpot's resolver takes a dimension as a number or a "16px" string
 * and a colour as a CSS string; DTCG 2025.10 objects reach it unchanged and fail. Composites
 * (typography, shadow) are converted field by field.
 */
function penpotValue(value: unknown, token: string): unknown {
  if (Array.isArray(value)) return value.map((item) => penpotValue(item, token));
  if (!isRecord(value)) return value;
  if ("colorSpace" in value && "components" in value) {
    if (typeof value.hex !== "string") {
      throw new PenpotCeloError(
        `${token}: a colour without hex. Penpot reads a colour as #rrggbb; give the value its hex.`,
      );
    }
    const alpha = typeof value.alpha === "number" ? value.alpha : 1;
    const hex = value.hex.toLowerCase();
    return alpha === 1
      ? hex
      : `${hex}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
  }
  if (typeof value.value === "number" && typeof value.unit === "string") {
    if (value.unit !== "px") {
      throw new PenpotCeloError(
        `${token}: a dimension in ${value.unit}. Penpot reads dimensions in px only; the Celo would write a wrong number.`,
      );
    }
    return String(value.value);
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, penpotValue(v, token)]));
}

/**
 * One set tree as Penpot reads it: every token with its own `$type` (group types dropped), its
 * value converted. A token Penpot cannot read keeps its DTCG `$type` and value; `unread` collects
 * those types.
 */
function penpotTree(
  tree: Record<string, unknown>,
  prefix: string,
  inherited: DtcgType | undefined,
  unread: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, node] of Object.entries(tree)) {
    if (key === "$type" || key === "$extensions") continue;
    if (key.startsWith("$") || !isRecord(node)) {
      out[key] = node;
      continue;
    }
    const name = prefix === "" ? key : `${prefix}.${key}`;
    const type = (typeof node.$type === "string" ? node.$type : inherited) as DtcgType | undefined;
    if (!("$value" in node)) {
      out[key] = penpotTree(node, name, type, unread);
      continue;
    }
    const target = type === undefined ? undefined : penpotType(name, type);
    if (target === undefined) {
      unread.add(String(type));
      out[key] = { ...node, $type: type };
      continue;
    }
    out[key] = { ...node, $type: target, $value: penpotValue(node.$value, name) };
  }
  return out;
}

/** Later wins a token; groups merge. */
function mergeTrees(base: Record<string, unknown>, over: Record<string, unknown>): void {
  for (const [key, node] of Object.entries(over)) {
    const current = base[key];
    if (isRecord(node) && !("$value" in node) && isRecord(current) && !("$value" in current)) {
      mergeTrees(current, node);
    } else {
      base[key] = structuredClone(node);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Sets and themes.

type Condition = [dimensio: string, valoro: string];

/** A set of one Aspekto's folder: the brand folded away, its kondicxoj in priority order. */
export interface PenpotSet {
  name: string;
  conditions: Condition[];
}

/**
 * The set's name in Penpot: its kondicxoj by priority descending, so the set lies in the folder of
 * its highest Dimensio. Penpot applies sets folder by folder (`get-sets` walks the folder tree),
 * not in `tokenSetOrder`; with the highest Dimensio first, the folders follow the resolver's order
 * — `contrast/high+color-scheme/dark` comes after `contrast/high`, as it must. The canonical name
 * orders ascending and would put it into `color-scheme/`, before `contrast/high` (measured
 * 2026-10-07: 30 wrong tokens in dark/high).
 */
function setName(conditions: readonly Condition[]): string {
  return conditions.length === 0
    ? CORE_SET_NAME
    : [...conditions]
        .reverse()
        .map(([dimensio, valoro]) => `${dimensio}/${valoro}`)
        .join("+");
}

/** The canonical set name: kondicxoj by priority ascending (`core` for none). */
function canonicalName(conditions: readonly Condition[]): string {
  return conditions.length === 0
    ? CORE_SET_NAME
    : conditions.map(([dimensio, valoro]) => `${dimensio}/${valoro}`).join("+");
}

/**
 * The order in which Penpot applies sets inserted in `inserted` order: a tree of folders split at
 * `/`, walked depth first, a folder where its first set was added (`tokens_lib.cljc`, `add-set`,
 * `get-sets`).
 */
export function penpotApplicationOrder(inserted: readonly string[]): string[] {
  type Folder = Map<string, Folder | string>;
  const root: Folder = new Map();
  for (const name of inserted) {
    const parts = name.split("/");
    let folder = root;
    for (const part of parts.slice(0, -1)) {
      let next = folder.get(`G-${part}`);
      if (!(next instanceof Map)) {
        next = new Map();
        folder.set(`G-${part}`, next);
      }
      folder = next;
    }
    folder.set(`S-${parts.at(-1)}`, name);
  }
  const order: string[] = [];
  const walk = (folder: Folder) => {
    for (const entry of folder.values()) {
      if (entry instanceof Map) walk(entry);
      else order.push(entry);
    }
  };
  walk(root);
  return order;
}

/**
 * The guard: every set's kondicxoj must lie inside one theme group, or Penpot's union of active
 * sets applies it in combinations it does not belong to.
 */
export function assertConjunctionsInGroups(
  sets: readonly PenpotSet[],
  groups: readonly (readonly string[])[],
): void {
  for (const set of sets) {
    const dimensioj = set.conditions.map(([dimensio]) => dimensio);
    if (dimensioj.length < 2) continue;
    const group = groups.find((candidate) => candidate.includes(dimensioj[0] ?? ""));
    const outside = dimensioj.filter((dimensio) => !group?.includes(dimensio));
    if (outside.length > 0) {
      throw new PenpotCeloError(
        `The conjunction set ${set.name} ties ${dimensioj.join(" and ")}, but ${outside.join(", ")} ` +
          `lies in another theme group than ${dimensioj[0]}. Penpot would activate it in ` +
          "combinations it does not belong to; the Celo writes no values rather than wrong ones.",
      );
    }
  }
}

interface Dimensio {
  name: string;
  priority: number;
  default: string;
  valoroj: { id: string; name: string }[];
}

function dimensiojOf(modeloJson: ModeloJson): Dimensio[] {
  return [...(modeloJson.dimensioj as unknown as Dimensio[])].sort(
    (a, b) => a.priority - b.priority,
  );
}

/** The groups: Dimensioj joined by conjunction sets, each in priority order, by first priority. */
function themeGroups(sets: readonly PenpotSet[], dimensioj: readonly Dimensio[]): string[][] {
  const parent = new Map(dimensioj.map((dimensio) => [dimensio.name, dimensio.name]));
  const find = (name: string): string => {
    const up = parent.get(name) ?? name;
    return up === name ? name : find(up);
  };
  for (const set of sets) {
    const [first, ...rest] = set.conditions.map(([dimensio]) => find(dimensio));
    for (const other of rest) if (first !== undefined) parent.set(other, first);
  }
  const groups = new Map<string, string[]>();
  for (const { name } of dimensioj) {
    const root = find(name);
    groups.set(root, [...(groups.get(root) ?? []), name]);
  }
  return [...groups.values()];
}

function combinations(group: readonly Dimensio[]): string[][] {
  return group.reduce<string[][]>(
    (acc, dimensio) => acc.flatMap((combo) => dimensio.valoroj.map((v) => [...combo, v.name])),
    [[]],
  );
}

/** The folder of one Aspekto: path inside the folder -> canonical JSON text. */
function penpotFolder(modeloJson: ModeloJson, aspekto: string): Record<string, string> {
  const dimensioj = dimensiojOf(modeloJson).filter((dimensio) => dimensio.name !== ASPEKTO);
  const priority = new Map(dimensiojOf(modeloJson).map((d) => [d.name, d.priority]));
  const own = modeloJson.aspektoj.find((entry) => entry.name === aspekto)?.package;
  const others = new Set(
    modeloJson.aspektoj.flatMap((entry) => (entry.name === aspekto ? [] : [entry.package])),
  );

  const parsed = modeloJson.setoj
    .filter((set) => set.package === undefined || set.package === own || !others.has(set.package))
    .map((set) => ({
      set,
      conditions: set.kondicxoj.map((k) => k.split("=") as Condition),
    }))
    .filter(({ conditions }) =>
      conditions.every(([dimensio, valoro]) => dimensio !== ASPEKTO || valoro === aspekto),
    );
  const orderKey = (conditions: readonly Condition[], name: string) => ({
    maxPriority: Math.max(0, ...conditions.map(([d]) => priority.get(d) ?? Infinity)),
    conditions: conditions.length,
    name,
  });
  parsed.sort((a, b) =>
    a.set.name === CORE_SET_NAME
      ? -1
      : b.set.name === CORE_SET_NAME
        ? 1
        : compareSetOrderKeys(
            orderKey(a.conditions, a.set.name),
            orderKey(b.conditions, b.set.name),
          ),
  );

  // Fold the brand away, in resolution order: the brand's set lands on the set with the same
  // remaining kondicxoj, after it, as the resolver applies it.
  const unread = new Set<string>();
  const folded = new Map<string, { conditions: Condition[]; tree: Record<string, unknown> }>();
  for (const { set, conditions } of parsed) {
    const rest = conditions.filter(([dimensio]) => dimensio !== ASPEKTO);
    const name = setName(rest);
    const entry = folded.get(name) ?? { conditions: rest, tree: {} };
    mergeTrees(entry.tree, penpotTree(set.tree as Record<string, unknown>, "", undefined, unread));
    folded.set(name, entry);
  }
  const sets: PenpotSet[] = [...folded].map(([name, { conditions }]) => ({ name, conditions }));
  sets.sort((a, b) =>
    a.name === CORE_SET_NAME
      ? -1
      : b.name === CORE_SET_NAME
        ? 1
        : // Ties break on the canonical name, as in the resolver.
          compareSetOrderKeys(
            orderKey(a.conditions, canonicalName(a.conditions)),
            orderKey(b.conditions, canonicalName(b.conditions)),
          ),
  );

  for (const type of [...unread].sort()) {
    const recorded = modeloJson.mankoj.some(
      (manko) => manko.celo === "penpot" && manko.property === `$type ${type}`,
    );
    if (!recorded) {
      throw new PenpotCeloError(
        `$type ${type} is not read by Penpot, and no Manko with celo penpot and property "$type ${type}" records it. ` +
          "Record the gap in data/mankoj.json before the Celo writes tokens Penpot will skip.",
      );
    }
  }

  // The second guard: Penpot's folder order must be the resolver's order, or a later set loses to
  // an earlier one only in Penpot.
  const resolverOrder = sets.map((set) => set.name);
  const applied = penpotApplicationOrder(resolverOrder);
  const moved = applied.findIndex((name, index) => name !== resolverOrder[index]);
  if (moved !== -1) {
    throw new PenpotCeloError(
      `Penpot would apply ${applied[moved]} where the resolver applies ${resolverOrder[moved]}: ` +
        "its folders do not carry the resolution order of these sets. The Celo writes no values rather than wrong ones.",
    );
  }

  const groupNames = themeGroups(sets, dimensioj);
  assertConjunctionsInGroups(sets, groupNames);
  const byName = new Map(dimensioj.map((dimensio) => [dimensio.name, dimensio]));
  const themes: unknown[] = [];
  const activeThemes: string[] = [];
  for (const names of groupNames) {
    const group = names
      .map((name) => byName.get(name))
      .filter((d): d is Dimensio => d !== undefined);
    const groupName = names.join("+");
    for (const combo of combinations(group)) {
      const assignment = new Map(names.map((name, index) => [name, combo[index]]));
      const selected: Record<string, string> = {};
      for (const set of sets) {
        const fits =
          set.conditions.length === 0 ||
          (set.conditions.every(([d]) => names.includes(d)) &&
            set.conditions.every(([d, v]) => assignment.get(d) === v));
        // Penpot knows `enabled` and `disabled` only (`schema:multi-set-dtcg`); `core` is enabled
        // in every theme, as the resolver always applies it.
        if (fits) selected[set.name] = "enabled";
      }
      themes.push({
        id: group
          .map((d, index) => d.valoroj.find((v) => v.name === combo[index])?.id ?? "")
          .join("+"),
        name: combo.join("+"),
        group: groupName,
        selectedTokenSets: selected,
      });
    }
    activeThemes.push(`${groupName}/${group.map((d) => d.default).join("+")}`);
  }

  const files: Record<string, string> = {
    "$metadata.json": canonical({ activeThemes, tokenSetOrder: sets.map((set) => set.name) }),
    "$themes.json": canonical(themes),
  };
  for (const set of sets) {
    files[`${set.name}.json`] = canonical(folded.get(set.name)?.tree ?? {});
  }
  return files;
}

/** Sorted keys at every level, 2-space indent, trailing newline: equal input, equal bytes. */
function canonical(value: unknown): string {
  const sort = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(sort);
    if (!isRecord(node)) return node;
    return Object.fromEntries(
      Object.keys(node)
        .sort()
        .map((key) => [key, sort(node[key])]),
    );
  };
  return `${JSON.stringify(sort(value), null, 2)}\n`;
}

/** Aspekto name -> folder, Aspektoj sorted by name. */
export function penpotFolders({ modeloJson }: CeloInput): Record<string, Record<string, string>> {
  const aspektoj = modeloJson.aspektoj.map((entry) => entry.name).sort();
  return Object.fromEntries(
    aspektoj.map((aspekto) => [aspekto, penpotFolder(modeloJson, aspekto)]),
  );
}

export const PENPOT_CELO: Celo = {
  name: "penpot",
  generate(input: CeloInput): GeneratedFile[] {
    return Object.entries(penpotFolders(input)).flatMap(([aspekto, files]) =>
      Object.entries(files).map(([path, text]) => ({ path: `penpot/${aspekto}/${path}`, text })),
    );
  },
};
