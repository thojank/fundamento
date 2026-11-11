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
  /** The id of a Grupo without sub-groups (a leaf of the group tree, at any depth). */
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
  /** The `/`-joined path from the axis down: `farbe`, `farbe/komponenten`, `farbe/komponenten/butono`, … */
  id: string;
  /** Level 1: the axis label; level 2 of an axis with sub-groups: its label; below: the path part. */
  etikedo: string;
  /** The direct parent group; absent for an axis (level 1). */
  patro?: string;
  /** The direct members, sorted; empty exactly when the group has sub-groups (never both). */
  nodoj: string[];
}

export interface Grafeo {
  /** Sorted by id. */
  nodoj: Nodo[];
  /** Sorted by (de, al), without duplicates. */
  ligoj: Ligo[];
  /**
   * The axes in their fixed order, below each its tree depth-first with siblings sorted by id; only
   * groups with at least one node (counted transitively).
   */
  grupoj: Grupo[];
}

export interface SichtNodo {
  id: string;
  speco: Speco | "grupo";
  /** The group of a token node; the parent group of a group node (absent for an axis). */
  grupo?: string;
  etikedo: string;
  /** Group nodes: the number of token nodes inside, counted transitively. */
  nombro?: number;
  /** Group nodes: whether the group is open. */
  malfermita?: boolean;
  /**
   * Group nodes, only with `sichtbaro(…, { ohneGrund: true })` (Spec 048, D-3): the number of
   * decisions without an own reason inside, counted transitively (`begruendungDe` → "fehlt").
   */
  ohneGrund?: number;
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

/** The prefixes of component tokens – the same as `KOMPONENTOJ` in `grafeo.ts` (no import here). */
const KOMPONENTOJ = ["ero.", "sxablono."];

/**
 * What every question about one graph needs, built once per graph object (Spec 048, NE1B-2): the
 * canvas asks on every toggle, and rebuilding the outgoing ligoj per node would cost a pass over all
 * ligoj each time. A Grafeo is never changed after it is read, so the index stays valid for the
 * life of the object; the WeakMap lets it go with the graph. Nothing is written into the graph.
 */
interface Indekso {
  nodoj: Map<string, Nodo>;
  /** Per node the smallest `al` of its outgoing ligoj – the next link of the chain of origin. */
  sekva: Map<string, string>;
  /** The nodes an `ero.*` node has a ligo to. */
  eroCelo: Set<string>;
  grupoj: Map<string, Grupo>;
  /** Per group its ancestors, outermost first. */
  praoj: Map<string, string[]>;
  /** Per group the number of token nodes inside, counted transitively. */
  nombro: Map<string, number>;
  /** Per group the number of decisions without own reason inside; built on first use. */
  ohneGrund?: Map<string, number>;
}

const indeksoj = new WeakMap<Grafeo, Indekso>();

function indeksoDe(g: Grafeo): Indekso {
  const cached = indeksoj.get(g);
  if (cached !== undefined) return cached;
  const sekva = new Map<string, string>();
  const eroCelo = new Set<string>();
  for (const ligo of g.ligoj) {
    const al = sekva.get(ligo.de);
    if (al === undefined || compareText(ligo.al, al) < 0) sekva.set(ligo.de, ligo.al);
    if (ligo.de.startsWith("ero.")) eroCelo.add(ligo.al);
  }
  const grupoj = new Map(g.grupoj.map((grupo) => [grupo.id, grupo]));
  const praoj = new Map(g.grupoj.map((grupo) => [grupo.id, ancestorsOf(grupoj, grupo.id)]));
  const nombro = new Map<string, number>();
  for (const nodo of g.nodoj) {
    for (const id of [...(praoj.get(nodo.grupo) ?? []), nodo.grupo]) {
      nombro.set(id, (nombro.get(id) ?? 0) + 1);
    }
  }
  const indekso: Indekso = {
    nodoj: new Map(g.nodoj.map((nodo) => [nodo.id, nodo])),
    sekva,
    eroCelo,
    grupoj,
    praoj,
    nombro,
  };
  indeksoj.set(g, indekso);
  return indekso;
}

/** The chain of origin over the index (see `devenoDe`). */
function cxenoDe(indekso: Indekso, id: string): string[] {
  if (!indekso.nodoj.has(id)) return [];
  const chain = [id];
  let current = id;
  while (indekso.nodoj.get(current)?.speco !== "enigo") {
    const al = indekso.sekva.get(current);
    if (al === undefined || chain.includes(al)) break;
    chain.push(al);
    current = al;
  }
  return chain;
}

/** Per group the decisions without own reason inside, transitively; built once per graph. */
function ohneGrundDe(g: Grafeo, indekso: Indekso): Map<string, number> {
  if (indekso.ohneGrund !== undefined) return indekso.ohneGrund;
  const out = new Map<string, number>();
  for (const nodo of g.nodoj) {
    if (nodo.kialo !== undefined || artoDe(indekso, nodo) !== "decido") continue;
    for (const id of [...(indekso.praoj.get(nodo.grupo) ?? []), nodo.grupo]) {
      out.set(id, (out.get(id) ?? 0) + 1);
    }
  }
  indekso.ohneGrund = out;
  return out;
}

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
 * group at any deeper level when its parent is open (a group counts as open only when all its
 * ancestors are); a token node when its group and every ancestor are open. Every ligo is drawn between the nearest
 * visible representatives of its ends – the node itself or its highest closed group – self-loops
 * dropped, duplicates summed into `nombro`. Nodes are sorted by group order (a group before its
 * members), then id; edges by (de, al).
 */
export function sichtbaro(
  g: Grafeo,
  malfermitaj: readonly string[],
  opcioj: { ohneGrund?: boolean } = {},
): Sicht {
  const indekso = indeksoDe(g);
  const byId = indekso.grupoj;
  const order = new Map(g.grupoj.map((grupo, index) => [grupo.id, index]));
  const wanted = new Set(malfermitaj);
  const ancestors = indekso.praoj;
  const count = indekso.nombro;
  const ohneGrund = opcioj.ohneGrund === true ? ohneGrundDe(g, indekso) : undefined;
  const isOpen = (id: string): boolean =>
    wanted.has(id) && (ancestors.get(id) ?? []).every((patro) => wanted.has(patro));
  const isVisible = (grupo: Grupo): boolean =>
    grupo.patro === undefined || (byId.has(grupo.patro) && isOpen(grupo.patro));

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
    if (ohneGrund !== undefined) nodo.ohneGrund = ohneGrund.get(grupo.id) ?? 0;
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

/**
 * The chain of origin, starting with `id`: along the outgoing ligo (the smallest `al` where there
 * are several) until an input (`speco: "enigo"`) or a node without outgoing ligoj. A node seen
 * twice ends the chain. Empty for an unknown id.
 */
export function devenoDe(g: Grafeo, id: string): string[] {
  return cxenoDe(indeksoDe(g), id);
}

// Spec 048 (NE-1b, T2): the kind of a node and its reason, computed from the graph alone and
// never stored in it. The classification is provisional (tech spec B); where it errs, the bericht
// collects examples – the rules are not changed for them.

/** Entscheidung (set by a person), Mechanik (derived by a mechanism), Übernahme (passed on). */
export type Knotenart = "decido" | "mekaniko" | "transpreno";

/** Where the reason of a node comes from: its own `kialo`, the first one along its chain, or none. */
export type KialoRezulto =
  | { fonto: "propra"; kialo: string; de?: never }
  | { fonto: "heredita"; de: string; kialo: string }
  | { fonto: "neniu"; de?: never; kialo?: never };

/** What the panel shows in the row "Begründung" (D-8); Mechanik has no such row. */
export type Begruendung =
  | { art: "mekaniko" }
  | { art: "decido" | "transpreno"; montro: "grund"; kialo: string }
  | { art: "decido"; montro: "fehlt" }
  | { art: "transpreno"; montro: "geerbt"; de: string; kialo: string }
  | { art: "transpreno"; montro: "neniu" };

/** The rules of tech spec B, the first that fits (see `knotenartDe`). */
function artoDe(indekso: Indekso, nodo: Nodo): Knotenart {
  if (nodo.speco === "enigo") return "decido";
  const regulo = nodo.regulo ?? "";
  if (regulo.startsWith("paletto") || regulo.startsWith("gestalto")) return "mekaniko";
  const komponento = KOMPONENTOJ.some((praefikso) => nodo.id.startsWith(praefikso));
  if (!komponento && indekso.eroCelo.has(nodo.id)) {
    // D-5: the own `al` is the next link of the chain, devenoDe(g, id)[1].
    const al = indekso.nodoj.get(cxenoDe(indekso, nodo.id)[1] ?? "");
    // D-4: a palette node lies in `<axis>/palette` or below it.
    if (
      al !== undefined &&
      (al.grupo.split("/")[1] === "palette" || al.regulo?.startsWith("fiksa"))
    )
      return "decido";
  }
  return "transpreno";
}

/**
 * The kind of a node, by the first rule that fits: (1) an input is an Entscheidung; (2) a `regulo`
 * starting with `paletto` or `gestalto` is Mechanik – checked before the role; (3) a node that is no
 * component, is pointed at by an `ero.*` node and whose own `al` (D-5: the next link of the chain)
 * is a palette node (D-4: second group segment `palette`) or `fiksa` is an Entscheidung (a role);
 * (4) everything else is an Übernahme. `undefined` for an unknown id.
 */
export function knotenartDe(g: Grafeo, id: string): Knotenart | undefined {
  const indekso = indeksoDe(g);
  const nodo = indekso.nodoj.get(id);
  return nodo === undefined ? undefined : artoDe(indekso, nodo);
}

/**
 * The reason of a node: its own `kialo`; else the first `kialo` along `devenoDe` from the second
 * link on, with the node it comes from; else none (the chain ends at an input or a node without
 * outgoing ligo). `{ fonto: "neniu" }` for an unknown id. Never generated text (047 P-8).
 */
export function kialoDe(g: Grafeo, id: string): KialoRezulto {
  const indekso = indeksoDe(g);
  const kialo = indekso.nodoj.get(id)?.kialo;
  if (kialo !== undefined) return { fonto: "propra", kialo };
  for (const de of cxenoDe(indekso, id).slice(1)) {
    const heredita = indekso.nodoj.get(de)?.kialo;
    if (heredita !== undefined) return { fonto: "heredita", de, kialo: heredita };
  }
  return { fonto: "neniu" };
}

/**
 * What the row "Begründung" shows (tech spec B, table): nothing for Mechanik; the own reason; for an
 * Entscheidung without one "fehlt" (an inherited reason does not count); for an Übernahme the
 * inherited reason with its source, or "kein Grund in der Kette". `undefined` for an unknown id.
 */
export function begruendungDe(g: Grafeo, id: string): Begruendung | undefined {
  const art = knotenartDe(g, id);
  if (art === undefined) return undefined;
  if (art === "mekaniko") return { art };
  const kialo = kialoDe(g, id);
  if (kialo.fonto === "propra") return { art, montro: "grund", kialo: kialo.kialo };
  if (art === "decido") return { art, montro: "fehlt" };
  if (kialo.fonto === "heredita")
    return { art, montro: "geerbt", de: kialo.de, kialo: kialo.kialo };
  return { art, montro: "neniu" };
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
