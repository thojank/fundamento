// Spec 047 (NE-1): the graph of a derivation – what depends on what – read from what the
// derivation and the composed Modelo already know: alias chains, the derived palettes, the tokens
// the Gestalt sliders change, the Reguloj that name a token and the provenance in deveno.json. One
// `Grafeo` for a brand with an Agordo (`grafeoDe`) and for an Aspekto package (`grafeoDePaket`).
// Pure and deterministic: no clock, no randomness, every array sorted; Maps and Sets are lookups
// only. No node:* import here; the files are read at the edge (grafeo-fontoj.ts).

import {
  type Agordo,
  BEDIENFORM_PATH,
  bedienformOf,
  composeFiles,
  type DerivedPalettes,
  derivationBasis,
  deriveGestalt,
  type Gestalt,
  type GestaltBasis,
  gestaltSliders,
  packageDocuments,
  packageLabel,
  withBedienform,
} from "@fundamento/agordilo";
import {
  aliasTarget,
  buildModelo,
  type Modelo,
  type ModeloFiles,
  matchesTokenPattern,
  orderActiveSets,
  type Regulo,
  readDtcgColor,
  resolveCombination,
  serializeCanonicalJson,
} from "@fundamento/modelo";
import type { Grafeo, Grupo, Ligo, Nodo } from "./grafeo-sicht.js";
import type { Bases } from "./vorschau.js";

export * from "./grafeo-sicht.js";

/** An alias or dependency cycle in the graph: never a silently dropped ligo. */
export class GrafeoEraro extends Error {
  readonly rule = "grafeo-ciklo";
  /** A token id on the cycle: the smallest, so the error is the same on every run. */
  readonly path: string;
  readonly suggestion: string;

  constructor(path: string, cycle: readonly string[]) {
    super(`The graph has a dependency cycle through ${path}: ${cycle.join(" -> ")}.`);
    this.name = "GrafeoEraro";
    this.path = path;
    this.suggestion = `Point one alias of the cycle (${cycle.join(", ")}) at a token outside it; the Modelo check reports the cycle as alias-cycle.`;
  }
}

/** The canonical JSON of a graph: the bytes the API answers and the tests compare. */
export function serializeGrafeo(g: Grafeo): string {
  return serializeCanonicalJson(g);
}

// ---------------------------------------------------------------------------------------------
// Groups (spec 2.3)

/** The axes in their fixed order, with their German labels. */
const AKSOJ: readonly { id: string; etikedo: string; subgrupoj: boolean }[] = [
  { id: "eingaben", etikedo: "Eingaben", subgrupoj: false },
  { id: "farbe", etikedo: "Farbe", subgrupoj: true },
  { id: "schrift", etikedo: "Schrift", subgrupoj: true },
  { id: "form", etikedo: "Form", subgrupoj: true },
  { id: "raum", etikedo: "Raum", subgrupoj: true },
  { id: "dichte", etikedo: "Dichte", subgrupoj: true },
  { id: "elevation", etikedo: "Elevation", subgrupoj: true },
  { id: "bewegung", etikedo: "Bewegung", subgrupoj: true },
  { id: "weitere", etikedo: "Weitere", subgrupoj: false },
];

const SUBGRUPOJ: Readonly<Record<string, string>> = {
  palette: "Palette",
  rollen: "Rollen",
  komponenten: "Komponenten-Tokens",
};

const WEITERE = "weitere";
const ENIGO = "enigo:";

/**
 * Token path prefix → group; the longest matching prefix wins, no match is "weitere". Checked
 * against the composed Modelo of komuna, ekzemplo and provo (tasks.md, T1).
 */
export const GRUPO_TABELO: readonly { praefikso: string; grupo: string }[] = [
  { praefikso: ENIGO, grupo: "eingaben" },
  { praefikso: "color.palette.", grupo: "farbe/palette" },
  { praefikso: "color.", grupo: "farbe/rollen" },
  { praefikso: "opacity.", grupo: "farbe/rollen" },
  { praefikso: "font.", grupo: "schrift/palette" },
  { praefikso: "typography.", grupo: "schrift/rollen" },
  { praefikso: "radius.", grupo: "form/palette" },
  { praefikso: "border.width.", grupo: "form/palette" },
  { praefikso: "radius.role.", grupo: "form/rollen" },
  { praefikso: "border.", grupo: "form/rollen" },
  { praefikso: "stroke.", grupo: "form/rollen" },
  { praefikso: "focus.", grupo: "form/rollen" },
  { praefikso: "spacing.scale.", grupo: "raum/palette" },
  { praefikso: "size.scale.", grupo: "raum/palette" },
  { praefikso: "spacing.", grupo: "raum/rollen" },
  { praefikso: "size.", grupo: "raum/rollen" },
  { praefikso: "layout.", grupo: "raum/rollen" },
  { praefikso: "size.control.", grupo: "dichte/rollen" },
  { praefikso: "size.target.", grupo: "dichte/rollen" },
  { praefikso: "elevation.shadow.", grupo: "elevation/palette" },
  { praefikso: "elevation.layer.", grupo: "elevation/rollen" },
  { praefikso: "color.shadow.", grupo: "elevation/rollen" },
  { praefikso: "color.backdrop.", grupo: "elevation/rollen" },
  { praefikso: "motion.", grupo: "bewegung/palette" },
];

/** Component tokens: their group follows the axis their chain of origin reaches. */
const KOMPONENTOJ = ["ero.", "sxablono."];

const isKomponento = (id: string): boolean =>
  KOMPONENTOJ.some((praefikso) => id.startsWith(praefikso));

/** The group of a node by its path (longest prefix); "weitere" without a match. */
function grupoLauTabelo(id: string): string {
  let best: { praefikso: string; grupo: string } | undefined;
  for (const entry of GRUPO_TABELO) {
    if (!id.startsWith(entry.praefikso)) continue;
    if (best === undefined || entry.praefikso.length > best.praefikso.length) best = entry;
  }
  return best?.grupo ?? WEITERE;
}

const aksoDe = (grupo: string): string => grupo.split("/")[0] ?? grupo;

/**
 * Spec 048 (NE-1b): no group shows more than this many children once it is opened – its direct
 * nodes plus its direct sub-groups. A group with more direct nodes is split (`dividu`).
 */
export const GRUPPE_MAX = 60;

/** The parent and label of every group id the assignment created; the tree of `grupoj`. */
type Arbo = Map<string, { etikedo: string; patro?: string }>;

/** Registers a group once (its first parent and label win) and returns its id. */
function aldonuGrupon(arbo: Arbo, id: string, etikedo: string, patro?: string): string {
  if (!arbo.has(id)) arbo.set(id, patro === undefined ? { etikedo } : { etikedo, patro });
  return id;
}

/**
 * A group of the table (`<akso>` or `<akso>/<sub>`, literals of this file) with its axis: level 1
 * carries the axis label, level 2 the label from SUBGRUPOJ.
 */
function tabelaGrupo(arbo: Arbo, grupo: string): string {
  const [akso = grupo, sub] = grupo.split("/");
  aldonuGrupon(arbo, akso, AKSOJ.find((entry) => entry.id === akso)?.etikedo ?? akso);
  return sub === undefined ? akso : aldonuGrupon(arbo, grupo, SUBGRUPOJ[sub] ?? sub, akso);
}

// ---------------------------------------------------------------------------------------------
// Values

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!isRecord(value)) return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort(compareText)) out[key] = sortKeysDeep(value[key]);
  return out;
}

/** Compact canonical JSON: keys sorted at every level, no whitespace. */
const compactJson = (value: unknown): string => JSON.stringify(sortKeysDeep(value));

const number = (value: number): string => String(Number(value.toFixed(6)));

/**
 * One value as text, the same way for every graph: a colour as its hex (with the alpha as two more
 * hex digits below 1), else `oklch(…)` (`color(<space> …)` outside oklch), a dimension as value and unit, a string as it is,
 * anything else as compact canonical JSON.
 */
export function valoroTeksto(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const color = readDtcgColor(value);
  if (color !== undefined) {
    const alpha = color.alpha ?? 1;
    const hex = isRecord(value) && typeof value.hex === "string" ? value.hex.toLowerCase() : "";
    if (/^#[0-9a-f]{6}$/.test(hex)) {
      return alpha < 1
        ? `${hex}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`
        : hex;
    }
    const parts = color.components.map((part) => (part === "none" ? "none" : number(part)));
    const tail = alpha < 1 ? ` / ${number(alpha)}` : "";
    // No colour of the repo's Modelo lacks its hex (checked in T1); CSS Color 4 text otherwise.
    return color.colorSpace === "oklch"
      ? `oklch(${parts.join(" ")}${tail})`
      : `color(${color.colorSpace} ${parts.join(" ")}${tail})`;
  }
  if (isRecord(value) && typeof value.value === "number" && typeof value.unit === "string") {
    if (Object.keys(value).length === 2) return `${number(value.value)}${value.unit}`;
  }
  if (typeof value === "string") return value;
  return compactJson(value);
}

/** The tokens a raw value refers to: a whole-value alias, or the aliases inside a composite. */
function referencesOf(value: unknown, out: Set<string> = new Set()): Set<string> {
  const target = aliasTarget(value);
  if (target !== undefined) out.add(target);
  else if (Array.isArray(value)) for (const entry of value) referencesOf(entry, out);
  else if (isRecord(value)) for (const entry of Object.values(value)) referencesOf(entry, out);
  return out;
}

// ---------------------------------------------------------------------------------------------
// The common build

type Mekanismo = "alias" | "paletto" | "gestalto" | "fiksa";

interface Enigo {
  /** The Agordo path, without the `enigo:` prefix. */
  path: string;
  valoro?: string;
}

interface Konstruo {
  modelo: Modelo;
  /** The Aspekto the values are resolved for and the deveno entries belong to. */
  aspekto: string;
  /** The mechanism of a derived token; `undefined` leaves it to alias or fixed value. */
  mekanismo?: (token: string) => Mekanismo | undefined;
  enigoj: readonly Enigo[];
  /** Ligoj beyond the aliases: palette steps, Gestalt tokens, festgelegt and fonts to inputs. */
  aldonajLigoj: readonly Ligo[];
  /** The Jugxoj of the Agordo: Regulo name → kialo. */
  jugxoj: readonly { regulo: string; kialo: string }[];
}

const SKEMOJ = ["light", "dark"] as const;

/** The Regulo that names a token: a pattern of `appliesTo.tokens` matches; the smallest id wins. */
function nomantajReguloj(modelo: Modelo, aspekto: string): Regulo[] {
  return modelo.reguloj
    .filter(
      (regulo) =>
        (regulo.aspekto === undefined || regulo.aspekto === aspekto) &&
        (regulo.appliesTo?.tokens?.length ?? 0) > 0,
    )
    .sort((a, b) => compareText(a.id, b.id));
}

/** The kialo of a deveno entry for each token of the Aspekto (spec 2.2, priority 1). */
function devenoKialoj(modelo: Modelo, aspekto: string): Map<string, string> {
  const best = new Map<string, { aro: string; kialo: string }>();
  const rank = (aro: string, kialo: string): string =>
    `${aro.includes("+") ? 1 : 0}\u0000${aro}\u0000${kialo}`;
  for (const entry of modelo.deveno ?? []) {
    if (entry.aspekto !== aspekto) continue;
    const kialo = `${entry.maniero} · ${entry.sxlosilo}`;
    const current = best.get(entry.token);
    if (
      current === undefined ||
      compareText(rank(entry.aro, kialo), rank(current.aro, current.kialo)) < 0
    ) {
      best.set(entry.token, { aro: entry.aro, kialo });
    }
  }
  return new Map([...best].map(([token, { kialo }]) => [token, kialo]));
}

/** Every distinct token name over every set of the Modelo, sorted. */
function tokenNames(modelo: Modelo): string[] {
  const names = new Set<string>();
  for (const set of modelo.setoj) for (const name of Object.keys(set.tokens)) names.add(name);
  return [...names].sort(compareText);
}

/**
 * Throws `GrafeoEraro` when the ligoj contain a cycle: the strongly connected components (Tarjan,
 * iterative), the smallest id that lies on any cycle.
 */
function checkAcyclic(ids: readonly string[], ligoj: readonly Ligo[]): void {
  const next = new Map<string, string[]>();
  for (const ligo of ligoj) {
    const targets = next.get(ligo.de) ?? [];
    targets.push(ligo.al);
    next.set(ligo.de, targets);
  }
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const cyclic: string[][] = [];
  let counter = 0;
  for (const root of ids) {
    if (index.has(root)) continue;
    const work: { node: string; edge: number }[] = [{ node: root, edge: 0 }];
    index.set(root, counter);
    low.set(root, counter);
    counter += 1;
    stack.push(root);
    onStack.add(root);
    while (work.length > 0) {
      const frame = work[work.length - 1];
      if (frame === undefined) break;
      const targets = next.get(frame.node) ?? [];
      const target = targets[frame.edge];
      if (target !== undefined) {
        frame.edge += 1;
        if (!index.has(target)) {
          index.set(target, counter);
          low.set(target, counter);
          counter += 1;
          stack.push(target);
          onStack.add(target);
          work.push({ node: target, edge: 0 });
        } else if (onStack.has(target)) {
          low.set(frame.node, Math.min(low.get(frame.node) ?? 0, index.get(target) ?? 0));
        }
        continue;
      }
      work.pop();
      const parent = work[work.length - 1];
      if (parent !== undefined) {
        low.set(parent.node, Math.min(low.get(parent.node) ?? 0, low.get(frame.node) ?? 0));
      }
      if (low.get(frame.node) === index.get(frame.node)) {
        const component: string[] = [];
        let member: string | undefined;
        do {
          member = stack.pop();
          if (member === undefined) break;
          onStack.delete(member);
          component.push(member);
        } while (member !== frame.node);
        const selfLoop = component.length === 1 && targets.includes(frame.node);
        if (component.length > 1 || selfLoop) cyclic.push(component.sort(compareText));
      }
    }
  }
  if (cyclic.length === 0) return;
  cyclic.sort((a, b) => compareText(a[0] ?? "", b[0] ?? ""));
  const cycle = cyclic[0] ?? [];
  throw new GrafeoEraro(cycle[0] ?? "", cycle);
}

/** The graph of a composed Modelo, with the inputs and extra ligoj of its source. */
function konstruu(k: Konstruo): Grafeo {
  const { modelo, aspekto } = k;
  const names = tokenNames(modelo);
  const known = new Set(names);
  for (const enigo of k.enigoj) known.add(`${ENIGO}${enigo.path}`);

  // Values and alias ligoj per scheme: the winning set's raw value, the resolved value.
  const references = new Map<string, Set<string>>();
  const values = new Map<string, { light?: string; dark?: string }>();
  for (const scheme of SKEMOJ) {
    const assignment = { aspekto, "color-scheme": scheme };
    const { tokens } = resolveCombination(modelo, assignment);
    const overlay = new Map<string, unknown>();
    for (const set of orderActiveSets(modelo, assignment)) {
      for (const token of Object.values(set.tokens)) overlay.set(token.name, token.value);
    }
    for (const name of names) {
      const refs = references.get(name) ?? new Set<string>();
      referencesOf(overlay.get(name), refs);
      references.set(name, refs);
      const text = valoroTeksto(tokens[name]?.value);
      if (text !== undefined) values.set(name, { ...values.get(name), [scheme]: text });
    }
  }

  const reguloj = nomantajReguloj(modelo, aspekto);
  const deveno = devenoKialoj(modelo, aspekto);
  const nodoj: Nodo[] = [];
  for (const name of names) {
    const isAlias = (references.get(name)?.size ?? 0) > 0;
    const mekanismo = k.mekanismo?.(name) ?? (isAlias ? "alias" : "fiksa");
    const regulo = reguloj.find((entry) =>
      (entry.appliesTo?.tokens ?? []).some((pattern) => matchesTokenPattern(pattern, name)),
    );
    const nodo: Nodo = {
      id: name,
      speco: mekanismo === "fiksa" ? "enigo" : "derivajxo",
      grupo: WEITERE,
      etikedo: name.split(".").at(-1) ?? name,
      regulo: regulo === undefined ? mekanismo : `${mekanismo} · ${regulo.id}`,
    };
    const value = values.get(name);
    if (value?.light !== undefined) {
      nodo.valoro =
        value.dark === undefined || value.dark === value.light
          ? { light: value.light }
          : { light: value.light, dark: value.dark };
    }
    const kialo =
      deveno.get(name) ??
      (regulo === undefined
        ? undefined
        : (k.jugxoj.find((jugxo) => jugxo.regulo === regulo.name)?.kialo ?? regulo.kialo));
    if (kialo !== undefined) nodo.kialo = kialo;
    nodoj.push(nodo);
  }
  for (const enigo of k.enigoj) {
    const id = `${ENIGO}${enigo.path}`;
    const nodo: Nodo = {
      id,
      speco: "enigo",
      grupo: "eingaben",
      etikedo: enigo.path.split(".").at(-1) ?? enigo.path,
    };
    if (enigo.valoro !== undefined) nodo.valoro = { light: enigo.valoro };
    nodoj.push(nodo);
  }
  nodoj.sort((a, b) => compareText(a.id, b.id));

  // Ligoj: aliases plus the source's own, both ends known, without duplicates, sorted.
  const keys = new Set<string>();
  const ligoj: Ligo[] = [];
  const add = (de: string, al: string): void => {
    if (!known.has(de) || !known.has(al)) return;
    const key = `${de}\u0000${al}`;
    if (keys.has(key)) return;
    keys.add(key);
    ligoj.push({ de, al });
  };
  for (const name of names) for (const al of references.get(name) ?? []) add(name, al);
  for (const ligo of k.aldonajLigoj) add(ligo.de, ligo.al);
  ligoj.sort((a, b) => compareText(a.de, b.de) || compareText(a.al, b.al));
  checkAcyclic(
    nodoj.map((nodo) => nodo.id),
    ligoj,
  );

  const arbo = assignGroups(nodoj, ligoj);
  dividu(nodoj, arbo);
  return { nodoj, ligoj, grupoj: groupsOf(nodoj, arbo) };
}

/**
 * The group of every node: by the prefix table; a component token (`ero.*`, `sxablono.*`) by the
 * axis of the first non-component node on its chain of origin (the smallest `al` at each step, up
 * to an input), in `<akso>/komponenten/<second path part>` (Spec 048, D-1); "weitere" itself when
 * the chain reaches no axis with sub-groups (D-2). Returns the tree of the groups it used.
 */
function assignGroups(nodoj: Nodo[], ligoj: readonly Ligo[]): Arbo {
  const arbo: Arbo = new Map();
  const next = new Map<string, string>();
  for (const ligo of ligoj) if (!next.has(ligo.de)) next.set(ligo.de, ligo.al);
  const speco = new Map(nodoj.map((nodo) => [nodo.id, nodo.speco]));
  for (const nodo of nodoj) {
    if (!isKomponento(nodo.id)) {
      nodo.grupo = tabelaGrupo(arbo, grupoLauTabelo(nodo.id));
      continue;
    }
    const seen = new Set<string>([nodo.id]);
    let current = nodo.id;
    let found: string | undefined;
    while (speco.get(current) !== "enigo") {
      const al = next.get(current);
      if (al === undefined || seen.has(al)) break;
      seen.add(al);
      current = al;
      if (!isKomponento(al)) {
        found = al;
        break;
      }
    }
    const akso = found === undefined ? WEITERE : aksoDe(grupoLauTabelo(found));
    const withSub = AKSOJ.find((entry) => entry.id === akso)?.subgrupoj === true;
    if (!withSub) {
      nodo.grupo = tabelaGrupo(arbo, WEITERE);
      continue;
    }
    const komponentoj = tabelaGrupo(arbo, `${akso}/komponenten`);
    const nomo = nodo.id.split(".")[1] || nodo.id;
    nodo.grupo = aldonuGrupon(arbo, `${komponentoj}/${nomo}`, nomo, komponentoj);
  }
  return arbo;
}

/** The members of every group, by group id. */
function membrojDe(nodoj: readonly Nodo[]): Map<string, Nodo[]> {
  const members = new Map<string, Nodo[]>();
  for (const nodo of nodoj) {
    const list = members.get(nodo.grupo) ?? [];
    list.push(nodo);
    members.set(nodo.grupo, list);
  }
  return members;
}

/**
 * The 60-rule (Spec 048): a group with more than GRUPPE_MAX direct nodes is split by the first
 * dot-separated path index at which its members do not all agree, into `<gruppe>/<teil>` (label
 * `<teil>`, parent the old group), and again for every new group still too large. A split group
 * keeps no direct node. A member whose path ends before that index goes by its last part; a group
 * whose members all fall into one part stays as it is (the test then names it), nothing is dropped.
 */
function dividu(nodoj: readonly Nodo[], arbo: Arbo): void {
  const members = membrojDe(nodoj);
  const queue = [...members.keys()].sort(compareText);
  for (let index = 0; index < queue.length; index += 1) {
    const grupo = queue[index] ?? "";
    const list = members.get(grupo) ?? [];
    if (list.length <= GRUPPE_MAX) continue;
    const partoj = list.map((nodo) => nodo.id.split("."));
    const longo = Math.max(...partoj.map((parts) => parts.length));
    const unua = partoj[0] ?? [];
    let je = 0;
    while (je < longo && partoj.every((parts) => parts[je] === unua[je])) je += 1;
    const teiloj = new Map<string, Nodo[]>();
    list.forEach((nodo, at) => {
      const parts = partoj[at] ?? [];
      const teil = parts[je] ?? parts.at(-1) ?? nodo.id;
      const sub = teiloj.get(teil) ?? [];
      sub.push(nodo);
      teiloj.set(teil, sub);
    });
    if (teiloj.size < 2) continue;
    for (const teil of [...teiloj.keys()].sort(compareText)) {
      const id = aldonuGrupon(arbo, `${grupo}/${teil}`, teil, grupo);
      const sub = teiloj.get(teil) ?? [];
      for (const nodo of sub) nodo.grupo = id;
      members.set(id, sub);
      queue.push(id);
    }
    members.delete(grupo);
  }
}

/**
 * The groups that hold at least one node (transitively): the axes in their fixed order, below
 * each the tree depth-first, siblings sorted by id. A group lists its direct members, sorted.
 */
function groupsOf(nodoj: readonly Nodo[], arbo: Arbo): Grupo[] {
  const members = new Map<string, string[]>();
  for (const [id, list] of membrojDe(nodoj)) {
    const ids = list.map((nodo) => nodo.id);
    members.set(id, ids);
  }
  const children = new Map<string, string[]>();
  const used = new Set<string>();
  for (const id of members.keys()) {
    let current: string | undefined = id;
    while (current !== undefined && !used.has(current)) {
      used.add(current);
      const patro: string | undefined = arbo.get(current)?.patro;
      if (patro !== undefined) {
        const list = children.get(patro) ?? [];
        list.push(current);
        children.set(patro, list);
      }
      current = patro;
    }
  }
  const grupoj: Grupo[] = [];
  const visit = (id: string): void => {
    const meta = arbo.get(id);
    grupoj.push({
      id,
      etikedo: meta?.etikedo ?? id,
      ...(meta?.patro === undefined ? {} : { patro: meta.patro }),
      nodoj: [...(members.get(id) ?? [])].sort(compareText),
    });
    for (const child of [...(children.get(id) ?? [])].sort(compareText)) visit(child);
  };
  for (const akso of AKSOJ) if (used.has(akso.id)) visit(akso.id);
  return grupoj;
}

// ---------------------------------------------------------------------------------------------
// Package graph

/**
 * The graph of an Aspekto package (komuna, ekzemplo; D-7): its composed Modelo with its alias
 * chains. An alias is a derivation, a fixed value an input; Reguloj and deveno.json give the kialo.
 */
export function grafeoDePaket(label: string, files: ModeloFiles): Grafeo {
  return konstruu({
    modelo: buildModelo(files).modelo,
    aspekto: label,
    enigoj: [],
    aldonajLigoj: [],
    jugxoj: [],
  });
}

// ---------------------------------------------------------------------------------------------
// Brand graph

/** A facet of the Agordo as its value text. */
const facetValue = (value: unknown): string | undefined =>
  value === undefined
    ? undefined
    : typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : compactJson(value);

/** The Gestalt facets an Agordo sets: each slider path with a number, the form of the controls. */
function gestaltFacets(agordo: Agordo, basis: GestaltBasis): { path: string; value: number }[] {
  const record = agordo as unknown as Record<string, unknown>;
  return gestaltSliders(basis).flatMap((slider) => {
    const [group = "", key = ""] = slider.path.split(".");
    const section = record[group];
    const value = isRecord(section) ? section[key] : undefined;
    return typeof value === "number" ? [{ path: slider.path, value }] : [];
  });
}

/** Every input of the Agordo that is present, as `enigo:` paths with their values, sorted. */
function agordoEnigoj(agordo: Agordo, basis: GestaltBasis): Enigo[] {
  const out: Enigo[] = [];
  const push = (path: string, value: unknown): void => {
    if (value === undefined) return;
    const valoro = facetValue(value);
    out.push(valoro === undefined ? { path } : { path, valoro });
  };
  push("leitfarbe", agordo.leitfarbe);
  if (agordo.zweitfarbe !== undefined) push("zweitfarbe", agordo.zweitfarbe.farbe);
  for (const [name, value] of Object.entries(agordo.zusatzfarben ?? {})) {
    push(`zusatzfarben.${name}`, value);
  }
  push("neutral.toenung", agordo.neutral?.toenung);
  for (const [name, value] of Object.entries(agordo.regler ?? {})) push(`regler.${name}`, value);
  for (const facet of gestaltFacets(agordo, basis)) push(facet.path, facet.value);
  if (bedienformOf(agordo) === "pille") push(BEDIENFORM_PATH, "pille");
  for (const [rolle, fonto] of Object.entries(agordo.schriften ?? {})) {
    push(`schriften.${rolle}`, fonto?.family);
  }
  push("ikono.gewicht", agordo.ikono?.gewicht);
  for (const [token, set] of Object.entries(agordo.festgelegt ?? {})) {
    push(`festgelegt.${token}`, set);
  }
  return out.sort((a, b) => compareText(a.path, b.path));
}

/** The palette inputs of each origin (spec 2.2); the regler.* sliders move every step. */
function paletteLigoj(palettes: DerivedPalettes, enigoj: ReadonlySet<string>): Ligo[] {
  const sources = palettes.sources as Partial<Record<string, { origin: string }>>;
  const regler = [...enigoj].filter((path) => path.startsWith("regler."));
  const ligoj: Ligo[] = [];
  for (const step of [...palettes.steps, ...palettes.overrides]) {
    const token = `color.palette.${step.palette}.${step.step}`;
    const origin = sources[step.palette]?.origin;
    const inputs =
      origin === "leitfarbe"
        ? ["leitfarbe"]
        : origin === "zusatzfarbe"
          ? [`zusatzfarben.${step.palette}`]
          : origin === "toenung"
            ? ["neutral.toenung", "leitfarbe"]
            : origin === "zweitfarbe"
              ? ["zweitfarbe"]
              : [];
    for (const path of [...inputs, ...regler]) {
      if (enigoj.has(path)) ligoj.push({ de: token, al: `${ENIGO}${path}` });
    }
  }
  return ligoj;
}

const changedTokens = (gestalt: Gestalt): string[] => [
  ...new Set([...gestalt.main.keys(), ...gestalt.dark.keys()]),
];

/** Whether a token's value differs between two Gestalt derivations (main or dark). */
const differs = (a: Gestalt, b: Gestalt, token: string): boolean =>
  JSON.stringify(a.main.get(token)) !== JSON.stringify(b.main.get(token)) ||
  JSON.stringify(a.dark.get(token)) !== JSON.stringify(b.dark.get(token));

/**
 * The Gestalt facet each Gestalt token depends on, read from the derivation itself: a facet moves
 * a token when the facet alone changes it (an Agordo with only that facet) or when the token
 * changes once the facet is taken out of the Agordo.
 */
function gestaltLigoj(agordo: Agordo, basis: GestaltBasis, gestalt: Gestalt): Ligo[] {
  const tokens = changedTokens(gestalt).sort(compareText);
  const bare: Agordo = { name: agordo.name, leitfarbe: agordo.leitfarbe };
  const neutral = deriveGestalt(bare, basis);
  const facets: { path: string; alone: Agordo; without: Agordo }[] = gestaltFacets(
    agordo,
    basis,
  ).map(({ path, value }) => {
    const [group = "", key = ""] = path.split(".");
    const record = agordo as unknown as Record<string, unknown>;
    const section = isRecord(record[group])
      ? { ...(record[group] as Record<string, unknown>) }
      : {};
    delete section[key];
    const without = { ...record, [group]: section } as unknown as Agordo;
    const alone = { ...bare, [group]: { [key]: value } } as unknown as Agordo;
    return { path, alone, without };
  });
  if (bedienformOf(agordo) === "pille") {
    facets.push({
      path: BEDIENFORM_PATH,
      alone: withBedienform(bare, "pille"),
      without: withBedienform(agordo, "radius"),
    });
  }
  const ligoj: Ligo[] = [];
  for (const facet of facets) {
    const alone = deriveGestalt(facet.alone, basis);
    const without = deriveGestalt(facet.without, basis);
    for (const token of tokens) {
      if (differs(alone, neutral, token) || differs(without, gestalt, token)) {
        ligoj.push({ de: token, al: `${ENIGO}${facet.path}` });
      }
    }
  }
  return ligoj;
}

/**
 * The graph of a brand (spec §1): its Agordo derived over the structure and composed the way the
 * preview composes it (`derivationBasis` → `packageDocuments` → `composeFiles` → `buildModelo`; no
 * check runs). The facets of the Agordo are the inputs; palette steps, Gestalt tokens, festgelegt
 * tokens and fonts are linked to the inputs that set them.
 */
export function grafeoDe(agordo: Agordo, bases: Bases): Grafeo {
  const { palettes, gestalt } = derivationBasis(agordo, bases.structure, bases.calibration);
  const documents = packageDocuments(agordo, bases.structure, palettes, [], gestalt);
  const modelo = buildModelo(
    composeFiles(bases.structure, packageLabel(agordo), documents, []),
  ).modelo;

  const enigoj = agordoEnigoj(agordo, bases.gestalt);
  const present = new Set(enigoj.map((enigo) => enigo.path));
  const paletto = new Set(
    [...palettes.steps, ...palettes.overrides].map(
      (step) => `color.palette.${step.palette}.${step.step}`,
    ),
  );
  const gestalto = new Set(changedTokens(gestalt));

  const aldonajLigoj: Ligo[] = [
    ...paletteLigoj(palettes, present),
    ...gestaltLigoj(agordo, bases.gestalt, gestalt),
  ];
  for (const token of Object.keys(agordo.festgelegt ?? {})) {
    aldonajLigoj.push({ de: token, al: `${ENIGO}festgelegt.${token}` });
  }
  for (const rolle of Object.keys(agordo.schriften ?? {})) {
    aldonajLigoj.push({ de: `font.family.${rolle}`, al: `${ENIGO}schriften.${rolle}` });
  }

  return konstruu({
    modelo,
    aspekto: agordo.name,
    mekanismo: (token) =>
      paletto.has(token) ? "paletto" : gestalto.has(token) ? "gestalto" : undefined,
    enigoj,
    aldonajLigoj,
    jugxoj: (agordo.jugxoj ?? []).map((jugxo) => ({ regulo: jugxo.regulo, kialo: jugxo.kialo })),
  });
}
