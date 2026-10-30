// The state of the brand model (Spec 033 S1): per Faceto offen (the value of the base), definiert
// (set by the person or the assistant) or freigegeben, read from the Kroniko; the completeness –
// released Facetoj against all, weighted by facetoj.json – and beside it the share of defined ones.
// A Faceto counts as released only while the check has no open problem of its tokens, so a brand at
// 100 % is always checked green. Scopes 2 and 3 are named as not yet part of the model, not as 0 %.
// Pure.

import type { Agordo } from "@fundamento/agordilo";
import { type FacetojFile, facetojOfToken, type Modelo, underPrefix } from "@fundamento/modelo";
import type { KronikoEro } from "./kroniko.js";

export type FacetoStato = "offen" | "definiert" | "freigegeben";

export interface FacetoStand {
  name: string;
  nomo: string;
  stato: FacetoStato;
  /** No open problem of the check among the tokens of the Faceto. */
  gruen: boolean;
  probleme: number;
  pezo: number;
}

export interface Vollstaendigkeit {
  /** Released and green Facetoj against all, weighted, in whole percent. */
  prozent: number;
  /** Defined or released Facetoj against all, weighted, in whole percent. */
  definiert: number;
  facetoj: FacetoStand[];
  nochNicht: typeof NOCH_NICHT;
}

/** Scopes 2 and 3 of the brand model (decision 2 of the maintainer, 24.10.): own specs. */
export const NOCH_NICHT = [
  { umfang: 2, nomo: "Sprache und Ton" },
  { umfang: 3, nomo: "Bildwelt, Logo, Illustration, Verhalten und Klang" },
] as const;

/** A problem of the check the completeness reads: what it is about (token, pair, token (mode)). */
export interface OffenesProblem {
  subject: string;
}

const coreOf = (modelo: Modelo) => modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};

/** The value at a dotted path of the Agordo. */
function at(agordo: Agordo, path: string): unknown {
  let value: unknown = agordo;
  for (const key of path.split(".")) {
    if (typeof value !== "object" || value === null) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

const MODE_DIMENSIONS = ["color-scheme", "contrast"];

/** The Facetoj whose fields of the Agordo, or whose set tokens, differ between two Agordos. */
export function facetojOfAgordoDiff(
  facetoj: FacetojFile,
  modelo: Modelo,
  before: Agordo,
  after: Agordo,
): string[] {
  const touched = new Set<string>();
  for (const faceto of facetoj.facetoj) {
    if (
      faceto.agordo.some(
        (path) => JSON.stringify(at(before, path)) !== JSON.stringify(at(after, path)),
      )
    ) {
      touched.add(faceto.name);
    }
  }
  const core = coreOf(modelo);
  const tokens = new Set([
    ...Object.keys(before.festgelegt ?? {}),
    ...Object.keys(after.festgelegt ?? {}),
  ]);
  for (const token of tokens) {
    const was = before.festgelegt?.[token];
    const is = after.festgelegt?.[token];
    if (JSON.stringify(was) === JSON.stringify(is)) continue;
    const { modoj: modesBefore, ...mainBefore } = was ?? {};
    const { modoj: modesAfter, ...mainAfter } = is ?? {};
    if (JSON.stringify(mainBefore) !== JSON.stringify(mainAfter)) {
      for (const owner of facetojOfToken(facetoj, core, token)) touched.add(owner);
    }
    const conditions = new Set([
      ...Object.keys(modesBefore ?? {}),
      ...Object.keys(modesAfter ?? {}),
    ]);
    for (const condition of conditions) {
      if (JSON.stringify(modesBefore?.[condition]) === JSON.stringify(modesAfter?.[condition]))
        continue;
      if (MODE_DIMENSIONS.includes(condition.split("=")[0] ?? "")) touched.add("modoj");
      else for (const owner of facetojOfToken(facetoj, core, token)) touched.add(owner);
    }
  }
  return facetoj.facetoj.map((faceto) => faceto.name).filter((name) => touched.has(name));
}

/** The Facetoj a problem of the check is about; undefined when it names nothing known. */
function facetojOfSubject(
  facetoj: FacetojFile,
  modelo: Modelo,
  subject: string,
): string[] | undefined {
  const core = coreOf(modelo);
  const bare = subject.replace(/\s+\((light|dark)\)$/, "");
  const pair = modelo.kontrastParoj.find((entry) => entry.name === bare);
  const tokens = pair !== undefined ? [pair.foreground, pair.background] : [bare];
  const owners = new Set<string>();
  for (const token of tokens) {
    const names = token.endsWith(".*")
      ? Object.keys(core).filter((name) => underPrefix(name, token.slice(0, -2)))
      : [token];
    for (const name of names)
      for (const owner of facetojOfToken(facetoj, core, name)) owners.add(owner);
  }
  return owners.size === 0 ? undefined : [...owners];
}

export interface StatoEingabe {
  facetoj: FacetojFile;
  /** The Modelo of the structure: the core tokens and the KontrastParoj. */
  modelo: Modelo;
  agordo: Agordo;
  kroniko: readonly KronikoEro[];
  /** The open problems of the check (violations not covered by a Jugxo). */
  probleme: readonly OffenesProblem[];
}

const percent = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((100 * part) / whole);

export function vollstaendigkeitOf(input: StatoEingabe): Vollstaendigkeit {
  const { facetoj, modelo, agordo, kroniko } = input;
  const recorded = kroniko.some((entry) => entry.ago === "kreo");
  const defined = new Set<string>();
  const released = new Set<string>();
  for (const entry of kroniko) {
    const name = entry.faceto;
    if (name === undefined) continue;
    if (entry.ago === "sxangxo" || entry.ago === "akcepto") defined.add(name);
    if (entry.ago === "liberigo") released.add(name);
    if (entry.ago === "sxangxo" || entry.ago === "remalfermo") released.delete(name);
  }
  // A brand from before the Kroniko: what its Agordo sets is defined.
  if (!recorded) {
    for (const faceto of facetoj.facetoj) {
      if (faceto.agordo.some((path) => at(agordo, path) !== undefined)) defined.add(faceto.name);
      if (
        Object.keys(agordo.festgelegt ?? {}).some((token) =>
          faceto.tokenoj.some((p) => underPrefix(token, p)),
        )
      ) {
        defined.add(faceto.name);
      }
    }
  }
  const problems = new Map<string, number>();
  let unplaced = 0;
  for (const problem of input.probleme) {
    const owners = facetojOfSubject(facetoj, modelo, problem.subject);
    if (owners === undefined) unplaced += 1;
    else for (const owner of owners) problems.set(owner, (problems.get(owner) ?? 0) + 1);
  }
  const staende: FacetoStand[] = facetoj.facetoj.map((faceto) => {
    const count = (problems.get(faceto.name) ?? 0) + unplaced;
    const stato: FacetoStato = released.has(faceto.name)
      ? "freigegeben"
      : defined.has(faceto.name) || released.has(faceto.name)
        ? "definiert"
        : "offen";
    return {
      name: faceto.name,
      nomo: faceto.nomo.de,
      stato,
      gruen: count === 0,
      probleme: count,
      pezo: faceto.pezo,
    };
  });
  const total = staende.reduce((sum, faceto) => sum + faceto.pezo, 0);
  const weight = (keep: (faceto: FacetoStand) => boolean) =>
    staende.filter(keep).reduce((sum, faceto) => sum + faceto.pezo, 0);
  return {
    prozent: percent(
      weight((faceto) => faceto.stato === "freigegeben" && faceto.gruen),
      total,
    ),
    definiert: percent(
      weight((faceto) => faceto.stato !== "offen"),
      total,
    ),
    facetoj: staende,
    nochNicht: NOCH_NICHT,
  };
}
