// Spec 047 (NE-1): the graph of a derivation as data, and what the canvas shows of it. This module
// has no import at all – not even a type – so the browser bundle of @fundamento/nodredaktilo can
// take it through an alias without a package cycle (D-2). Pure and deterministic: every output
// array is sorted; Maps and Sets serve lookups only, their order never reaches the output.

/** `enigo`: set by a person (an Agordo facet or a fixed value); `derivajxo`: set by a mechanism. */
export type Speco = "enigo" | "derivajxo";

export interface Nodo {
  /** Token name, or `enigo:<agordo path>` for a facet of the Agordo. */
  id: string;
  speco: Speco;
  /** The id of a Grupo of the lowest level. */
  grupo: string;
  /** The last part of the path, never translated. */
  etikedo: string;
  /** The value per colour scheme (P-7); `dark` only where it differs from `light`. */
  valoro?: { light: string; dark?: string };
  /** The mechanism (`alias`, `paletto`, `gestalto`, `fiksa`), then ` · <Regulo id>` if one names it (P-8). */
  regulo?: string;
  /** The reason from existing data only (P-8); absent means "fehlt". */
  kialo?: string;
}

/** `de` depends on `al`. */
export interface Ligo {
  de: string;
  al: string;
}

export interface Grupo {
  id: string;
  etikedo: string;
  /** The axis of a level-2 group. */
  patro?: string;
  /** The direct members, sorted. */
  nodoj: string[];
}

export interface Grafeo {
  /** Sorted by id. */
  nodoj: Nodo[];
  /** Sorted by (de, al), without duplicates. */
  ligoj: Ligo[];
  /** Sorted by axis order, then id; only groups with at least one node (counted transitively). */
  grupoj: Grupo[];
}

export interface SichtNodo {
  id: string;
  speco: Speco | "grupo";
  /** The group of a token node; the parent of a level-2 group node. */
  grupo?: string;
  etikedo: string;
  /** Group nodes: the number of token nodes inside, counted transitively. */
  nombro?: number;
  /** Group nodes: whether the group is open. */
  malfermita?: boolean;
}

/** An edge between visible nodes; `nombro` counts the ligoj it stands for. */
export interface SichtLigo {
  de: string;
  al: string;
  nombro: number;
}

export interface Sicht {
  nodoj: SichtNodo[];
  ligoj: SichtLigo[];
}

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** The ancestors of a group, outermost first (cycle-safe). */
function ancestorsOf(byId: ReadonlyMap<string, Grupo>, id: string): string[] {
  const out: string[] = [];
  let patro = byId.get(id)?.patro;
  while (patro !== undefined && !out.includes(patro) && patro !== id) {
    out.unshift(patro);
    patro = byId.get(patro)?.patro;
  }
  return out;
}

/**
 * What the canvas shows with the groups `malfermitaj` open. A top-level group is always visible; a
 * level-2 group when its parent is open (a group counts as open only when its ancestors are); a
 * token node when its group and every ancestor are open. Every ligo is drawn between the nearest
 * visible representatives of its ends – the node itself or its highest closed group – self-loops
 * dropped, duplicates summed into `nombro`. Nodes are sorted by group order (a group before its
 * members), then id; edges by (de, al).
 */
export function sichtbaro(g: Grafeo, malfermitaj: readonly string[]): Sicht {
  const byId = new Map(g.grupoj.map((grupo) => [grupo.id, grupo]));
  const order = new Map(g.grupoj.map((grupo, index) => [grupo.id, index]));
  const wanted = new Set(malfermitaj);
  const ancestors = new Map(g.grupoj.map((grupo) => [grupo.id, ancestorsOf(byId, grupo.id)]));
  const isOpen = (id: string): boolean =>
    wanted.has(id) && (ancestors.get(id) ?? []).every((patro) => wanted.has(patro));
  const isVisible = (grupo: Grupo): boolean =>
    grupo.patro === undefined || (byId.has(grupo.patro) && isOpen(grupo.patro));

  const count = new Map<string, number>();
  for (const nodo of g.nodoj) {
    for (const id of [...(ancestors.get(nodo.grupo) ?? []), nodo.grupo]) {
      count.set(id, (count.get(id) ?? 0) + 1);
    }
  }

  /** The visible node a token node is drawn as. */
  const representative = new Map<string, string>();
  for (const nodo of g.nodoj) {
    const chain = [...(ancestors.get(nodo.grupo) ?? []), nodo.grupo];
    const closed = chain.find((id) => !isOpen(id));
    representative.set(nodo.id, closed ?? nodo.id);
  }

  const keyed: { group: number; member: number; nodo: SichtNodo }[] = [];
  for (const grupo of g.grupoj) {
    if (!isVisible(grupo)) continue;
    const nodo: SichtNodo = {
      id: grupo.id,
      speco: "grupo",
      etikedo: grupo.etikedo,
      nombro: count.get(grupo.id) ?? 0,
      malfermita: isOpen(grupo.id),
    };
    if (grupo.patro !== undefined) nodo.grupo = grupo.patro;
    keyed.push({ group: order.get(grupo.id) ?? 0, member: 0, nodo });
  }
  for (const nodo of g.nodoj) {
    if (representative.get(nodo.id) !== nodo.id) continue;
    keyed.push({
      group: order.get(nodo.grupo) ?? g.grupoj.length,
      member: 1,
      nodo: { id: nodo.id, speco: nodo.speco, grupo: nodo.grupo, etikedo: nodo.etikedo },
    });
  }
  keyed.sort(
    (a, b) => a.group - b.group || a.member - b.member || compareText(a.nodo.id, b.nodo.id),
  );

  const edges = new Map<string, SichtLigo>();
  for (const ligo of g.ligoj) {
    const de = representative.get(ligo.de);
    const al = representative.get(ligo.al);
    if (de === undefined || al === undefined || de === al) continue;
    const key = `${de}\u0000${al}`;
    const edge = edges.get(key);
    if (edge === undefined) edges.set(key, { de, al, nombro: 1 });
    else edge.nombro += 1;
  }
  const ligoj = [...edges.values()].sort(
    (a, b) => compareText(a.de, b.de) || compareText(a.al, b.al),
  );
  return { nodoj: keyed.map((entry) => entry.nodo), ligoj };
}

/**
 * The groups to open so a node becomes visible, axis first: for a token node its group with the
 * group's ancestors, for a group node its ancestors. Empty for an unknown id.
 */
export function grupojDe(g: Grafeo, nodoId: string): string[] {
  const byId = new Map(g.grupoj.map((grupo) => [grupo.id, grupo]));
  if (byId.has(nodoId)) return ancestorsOf(byId, nodoId);
  const nodo = g.nodoj.find((entry) => entry.id === nodoId);
  if (nodo === undefined) return [];
  return [...ancestorsOf(byId, nodo.grupo), nodo.grupo];
}

/** The outgoing ligoj of every node, targets sorted. */
function outgoing(g: Grafeo): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const ligo of g.ligoj) {
    const targets = out.get(ligo.de) ?? [];
    targets.push(ligo.al);
    out.set(ligo.de, targets);
  }
  for (const targets of out.values()) targets.sort(compareText);
  return out;
}

/**
 * The chain of origin, starting with `id`: along the outgoing ligo (the smallest `al` where there
 * are several) until an input (`speco: "enigo"`) or a node without outgoing ligoj. A node seen
 * twice ends the chain. Empty for an unknown id.
 */
export function devenoDe(g: Grafeo, id: string): string[] {
  const speco = new Map(g.nodoj.map((nodo) => [nodo.id, nodo.speco]));
  if (!speco.has(id)) return [];
  const next = outgoing(g);
  const chain = [id];
  let current = id;
  while (speco.get(current) !== "enigo") {
    const al = next.get(current)?.[0];
    if (al === undefined || chain.includes(al)) break;
    chain.push(al);
    current = al;
  }
  return chain;
}

/** The direct dependants of a node (sorted) and the number of all its transitive dependants. */
export function dependantojDe(g: Grafeo, id: string): { rektaj: string[]; cxiuj: number } {
  const incoming = new Map<string, string[]>();
  for (const ligo of g.ligoj) {
    const sources = incoming.get(ligo.al) ?? [];
    sources.push(ligo.de);
    incoming.set(ligo.al, sources);
  }
  const rektaj = [...new Set(incoming.get(id) ?? [])].sort(compareText);
  const seen = new Set<string>([id]);
  const queue = [...rektaj];
  for (const node of queue) seen.add(node);
  for (let index = 0; index < queue.length; index += 1) {
    for (const de of incoming.get(queue[index] ?? "") ?? []) {
      if (seen.has(de)) continue;
      seen.add(de);
      queue.push(de);
    }
  }
  return { rektaj, cxiuj: queue.length };
}
