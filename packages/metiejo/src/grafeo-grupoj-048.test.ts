// Spec 048 (NE-1b, T1): the groups of the graph get a third (and, through the 60-rule, a fourth or
// deeper) level. For the brand provo and the packages komuna and ekzemplo: no group shows more
// than GRUPPE_MAX children once it is opened (direct nodes plus direct sub-groups, computed from
// the data and cross-checked through sichtbaro); a group has either sub-groups or nodes, never
// both; every node is in exactly one group; component tokens sit under <axis>/komponenten/<name>;
// the groups come in axis order, then depth-first with id-sorted siblings; two generations give the
// same bytes. In memory only: a new ero token gets its own sub-group without a code change, and
// invented tokens beyond GRUPPE_MAX are split by their first differing path part.

import { beforeAll, describe, expect, it } from "vitest";
import {
  GRUPPE_MAX,
  type Grafeo,
  grafeoDe,
  grafeoDePaket,
  grupojDe,
  serializeGrafeo,
  sichtbaro,
} from "./grafeo.js";
import { kunAldonitajTokenoj, paketo, provoAgordo } from "./test-doubles/grafeo-047.js";
import { loadBases } from "./vorschau.js";

/** The axes in their fixed order (Spec 047, 2.3). */
const AKSOJ = [
  "eingaben",
  "farbe",
  "schrift",
  "form",
  "raum",
  "dichte",
  "elevation",
  "bewegung",
  "weitere",
];

/** The axes without the fixed level-2 groups (palette, rollen, komponenten). */
const SEN_SUBGRUPOJ = ["eingaben", "weitere"];

const KOMPONENTOJ = ["ero.", "sxablono."];

const isKomponento = (id: string): boolean => KOMPONENTOJ.some((p) => id.startsWith(p));

const aksoDe = (grupo: string): string => grupo.split("/")[0] ?? grupo;

interface Fonto048 {
  nomo: "provo" | "komuna" | "ekzemplo";
  grafeo: Grafeo;
}

let fontoj: Fonto048[] = [];
/** The serialisation of a second, independent generation of each graph. */
const duaFoje = new Map<string, string>();

beforeAll(() => {
  const bases = loadBases();
  fontoj = [
    { nomo: "provo", grafeo: grafeoDe(provoAgordo(), bases) },
    { nomo: "komuna", grafeo: grafeoDePaket("komuna", paketo("komuna")) },
    { nomo: "ekzemplo", grafeo: grafeoDePaket("ekzemplo", paketo("ekzemplo")) },
  ];
  duaFoje.set("provo", serializeGrafeo(grafeoDe(provoAgordo(), bases)));
  duaFoje.set("komuna", serializeGrafeo(grafeoDePaket("komuna", paketo("komuna"))));
  duaFoje.set("ekzemplo", serializeGrafeo(grafeoDePaket("ekzemplo", paketo("ekzemplo"))));
});

/** The direct sub-groups of every group, by parent id. */
function infanojDe(grafeo: Grafeo): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const grupo of grafeo.grupoj) {
    if (grupo.patro === undefined) continue;
    out.set(grupo.patro, [...(out.get(grupo.patro) ?? []), grupo.id]);
  }
  return out;
}

/** The ancestors of a group, outermost first (read from `patro`, cycle-safe). */
function praojDe(grafeo: Grafeo, id: string): string[] {
  const byId = new Map(grafeo.grupoj.map((grupo) => [grupo.id, grupo]));
  const out: string[] = [];
  let patro = byId.get(id)?.patro;
  while (patro !== undefined && !out.includes(patro) && patro !== id) {
    out.unshift(patro);
    patro = byId.get(patro)?.patro;
  }
  return out;
}

/** Every group with more than GRUPPE_MAX children (direct nodes plus direct sub-groups). */
function tro(nomo: string, grafeo: Grafeo): string[] {
  const infanoj = infanojDe(grafeo);
  return grafeo.grupoj
    .map((grupo) => ({
      id: grupo.id,
      n: grupo.nodoj.length + (infanoj.get(grupo.id)?.length ?? 0),
    }))
    .filter(({ n }) => n > GRUPPE_MAX)
    .map(({ id, n }) => `${nomo}: ${id} shows ${n}`);
}

/** Either sub-groups or direct nodes, never both and never neither. */
function auxAux(nomo: string, grafeo: Grafeo): string[] {
  const infanoj = infanojDe(grafeo);
  const befunde: string[] = [];
  for (const grupo of grafeo.grupoj) {
    const subs = infanoj.get(grupo.id)?.length ?? 0;
    if (subs > 0 && grupo.nodoj.length > 0) befunde.push(`${nomo}: ${grupo.id} has both`);
    if (subs === 0 && grupo.nodoj.length === 0) befunde.push(`${nomo}: ${grupo.id} is empty`);
  }
  return befunde;
}

/** Every node in exactly one group, which lists it; the union of members is the node set. */
function unuGrupo(nomo: string, grafeo: Grafeo): string[] {
  const befunde: string[] = [];
  const grupoj = new Map(grafeo.grupoj.map((grupo) => [grupo.id, grupo]));
  const listita = new Map<string, number>();
  for (const grupo of grafeo.grupoj) {
    for (const id of grupo.nodoj) listita.set(id, (listita.get(id) ?? 0) + 1);
  }
  const ids = new Set(grafeo.nodoj.map((nodo) => nodo.id));
  for (const nodo of grafeo.nodoj) {
    if (!grupoj.get(nodo.grupo)?.nodoj.includes(nodo.id))
      befunde.push(`${nomo}: ${nodo.grupo} does not list ${nodo.id}`);
    if (listita.get(nodo.id) !== 1)
      befunde.push(`${nomo}: ${nodo.id} listed ${listita.get(nodo.id) ?? 0} times`);
  }
  for (const id of listita.keys()) if (!ids.has(id)) befunde.push(`${nomo}: ${id} is no node`);
  return befunde;
}

/** Ids and parents: `<patro>/<part>`, an existing parent, an axis at the top. */
function formo(nomo: string, grafeo: Grafeo): string[] {
  const befunde: string[] = [];
  const ids = new Set(grafeo.grupoj.map((grupo) => grupo.id));
  for (const grupo of grafeo.grupoj) {
    if (grupo.patro === undefined) {
      if (!AKSOJ.includes(grupo.id)) befunde.push(`${nomo}: top-level ${grupo.id} is no axis`);
      continue;
    }
    if (!ids.has(grupo.patro)) befunde.push(`${nomo}: ${grupo.id} has unknown ${grupo.patro}`);
    const parto = grupo.id.slice(grupo.patro.length + 1);
    if (!grupo.id.startsWith(`${grupo.patro}/`) || parto.length === 0 || parto.includes("/"))
      befunde.push(`${nomo}: ${grupo.id} is not <patro>/<part> of ${grupo.patro}`);
    if (praojDe(grafeo, grupo.id).length >= 2 && grupo.etikedo !== parto)
      befunde.push(`${nomo}: ${grupo.id} labelled ${grupo.etikedo}`);
  }
  return befunde;
}

/** The expected order: axis order, then depth-first with siblings sorted by id. */
function dfsOrdo(grafeo: Grafeo): string[] {
  const infanoj = infanojDe(grafeo);
  const out: string[] = [];
  const iru = (id: string): void => {
    out.push(id);
    for (const infano of [...(infanoj.get(id) ?? [])].sort()) iru(infano);
  };
  const radikoj = grafeo.grupoj
    .filter((grupo) => grupo.patro === undefined)
    .map((grupo) => grupo.id)
    .sort((a, b) => AKSOJ.indexOf(a) - AKSOJ.indexOf(b));
  for (const radiko of radikoj) iru(radiko);
  return out;
}

describe("Spec 048 T1: groups of at most GRUPPE_MAX children", () => {
  it("keeps the limit of the spec as a constant", () => {
    expect(GRUPPE_MAX).toBe(60);
  });

  it("shows no group with more than GRUPPE_MAX children (provo, komuna, ekzemplo)", () => {
    const befunde = fontoj.flatMap((fonto) => tro(fonto.nomo, fonto.grafeo));
    // Cross-check through what the canvas shows: open the group with its ancestors and count
    // the visible nodes whose parent it is.
    for (const fonto of fontoj) {
      const infanoj = infanojDe(fonto.grafeo);
      for (const grupo of fonto.grafeo.grupoj) {
        const sicht = sichtbaro(fonto.grafeo, [...praojDe(fonto.grafeo, grupo.id), grupo.id]);
        const videblaj = sicht.nodoj.filter((nodo) => nodo.grupo === grupo.id).length;
        const atendita = grupo.nodoj.length + (infanoj.get(grupo.id)?.length ?? 0);
        if (videblaj !== atendita || videblaj > GRUPPE_MAX)
          befunde.push(`${fonto.nomo}: ${grupo.id} shows ${videblaj}, has ${atendita}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("gives every group either sub-groups or nodes, never both, never neither", () => {
    expect(fontoj.flatMap((fonto) => auxAux(fonto.nomo, fonto.grafeo))).toEqual([]);
  });

  it("puts every node into exactly one group, which lists it", () => {
    expect(fontoj.flatMap((fonto) => unuGrupo(fonto.nomo, fonto.grafeo))).toEqual([]);
  });

  it("builds group ids as <patro>/<part> under an axis, labelled by the part below level 2", () => {
    expect(fontoj.flatMap((fonto) => formo(fonto.nomo, fonto.grafeo))).toEqual([]);
  });

  it("puts every component token under <axis>/komponenten/<second part>", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      for (const nodo of fonto.grafeo.nodoj) {
        const akso = aksoDe(nodo.grupo);
        const komponentoj = `${akso}/komponenten`;
        const enKomponentoj =
          nodo.grupo === komponentoj || nodo.grupo.startsWith(`${komponentoj}/`);
        if (!isKomponento(nodo.id)) {
          if (enKomponentoj) befunde.push(`${fonto.nomo}: ${nodo.id} in ${nodo.grupo}`);
          continue;
        }
        if (SEN_SUBGRUPOJ.includes(akso)) continue;
        const nomo = nodo.id.split(".")[1] ?? "";
        const ero = `${komponentoj}/${nomo}`;
        if (nodo.grupo !== ero && !nodo.grupo.startsWith(`${ero}/`))
          befunde.push(`${fonto.nomo}: ${nodo.id} in ${nodo.grupo}, not under ${ero}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("orders the groups by axis, then depth-first with id-sorted siblings", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const ids = fonto.grafeo.grupoj.map((grupo) => grupo.id);
      if (ids.join("\n") !== dfsOrdo(fonto.grafeo).join("\n"))
        befunde.push(`${fonto.nomo}: groups not in depth-first order`);
    }
    expect(befunde).toEqual([]);
  });

  it("is byte-identical when generated twice (provo, komuna, ekzemplo)", () => {
    const abweichend = fontoj
      .filter((fonto) => serializeGrafeo(fonto.grafeo) !== duaFoje.get(fonto.nomo))
      .map((fonto) => fonto.nomo);
    expect(abweichend).toEqual([]);
  });

  it("opens every level of the deepest ero token with grupojDe", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const eroj = fonto.grafeo.nodoj
        .filter((nodo) => nodo.id.startsWith("ero.") && !SEN_SUBGRUPOJ.includes(aksoDe(nodo.grupo)))
        .map((nodo) => ({ nodo, profundo: nodo.grupo.split("/").length }))
        .sort((a, b) => b.profundo - a.profundo || (a.nodo.id < b.nodo.id ? -1 : 1));
      const plej = eroj[0];
      if (plej === undefined) {
        befunde.push(`${fonto.nomo}: no ero token`);
        continue;
      }
      const { nodo, profundo } = plej;
      if (profundo < 3) befunde.push(`${fonto.nomo}: ${nodo.id} only at depth ${profundo}`);
      const partoj = nodo.grupo.split("/");
      const atendita = partoj.map((_, index) => partoj.slice(0, index + 1).join("/"));
      const akso = aksoDe(nodo.grupo);
      const komenco = [akso, `${akso}/komponenten`, `${akso}/komponenten/${nodo.id.split(".")[1]}`];
      const malfermi = grupojDe(fonto.grafeo, nodo.id);
      if (malfermi.join("\n") !== atendita.join("\n"))
        befunde.push(`${fonto.nomo}: grupojDe(${nodo.id}) = ${malfermi.join(", ")}`);
      if (malfermi.slice(0, 3).join("\n") !== komenco.join("\n"))
        befunde.push(`${fonto.nomo}: ${nodo.id} does not open ${komenco.join(" → ")}`);
      if (!sichtbaro(fonto.grafeo, malfermi).nodoj.some((entry) => entry.id === nodo.id))
        befunde.push(`${fonto.nomo}: ${nodo.id} hidden after opening its groups`);
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 048 T1: in memory – new tokens and the split", () => {
  let antaue: Grafeo;
  /** A colour role of komuna, read from the data: the smallest color.* id in farbe/rollen. */
  let rolo: string;

  beforeAll(() => {
    antaue = grafeoDePaket("komuna", paketo("komuna"));
    const roloj = antaue.nodoj
      .filter((nodo) => nodo.id.startsWith("color.") && nodo.grupo.startsWith("farbe/rollen"))
      .map((nodo) => nodo.id)
      .sort();
    const unua = roloj[0];
    if (unua === undefined) throw new Error("komuna must have a colour role");
    rolo = unua;
  });

  it("puts a new ero token into farbe/komponenten/<name> without a code change", () => {
    const kun = grafeoDePaket(
      "komuna",
      kunAldonitajTokenoj(paketo("komuna"), {
        "ero.zzzneu.probo": { $type: "color", $value: `{${rolo}}` },
      }),
    );
    const nove = kun.nodoj.filter((nodo) => !antaue.nodoj.some((m) => m.id === nodo.id));
    expect(nove.map(({ id, grupo }) => ({ id, grupo }))).toEqual([
      { id: "ero.zzzneu.probo", grupo: "farbe/komponenten/zzzneu" },
    ]);
    const grupo = kun.grupoj.find((entry) => entry.id === "farbe/komponenten/zzzneu");
    expect(grupo).toEqual({
      id: "farbe/komponenten/zzzneu",
      etikedo: "zzzneu",
      patro: "farbe/komponenten",
      nodoj: ["ero.zzzneu.probo"],
    });
  });

  it("splits a group beyond GRUPPE_MAX by its first differing part, repeatedly", () => {
    // zzzgross: more than GRUPPE_MAX tokens split at part 2 into alfa/beta; alfa alone is still
    // beyond GRUPPE_MAX and splits again at part 3. zzzgrosb: every token shares part 2
    // (`gemeinsam`), so the split happens at part 3.
    const tokenoj: Record<string, Record<string, unknown>> = {};
    const aldoni = (id: string): void => {
      tokenoj[id] = { $type: "color", $value: `{${rolo}}` };
    };
    const n = GRUPPE_MAX + 1;
    for (let i = 0; i < n; i += 1) {
      aldoni(`ero.zzzgross.alfa.${i % 2 === 0 ? "m1" : "m2"}.n${String(i).padStart(3, "0")}`);
    }
    for (let i = 0; i < 3; i += 1) aldoni(`ero.zzzgross.beta.n${i}`);
    for (let i = 0; i < n; i += 1) {
      aldoni(`ero.zzzgrosb.gemeinsam.${i % 2 === 0 ? "unu" : "du"}.n${String(i).padStart(3, "0")}`);
    }
    const kun = grafeoDePaket("komuna", kunAldonitajTokenoj(paketo("komuna"), tokenoj));

    const befunde = [...tro("zzz", kun), ...auxAux("zzz", kun), ...unuGrupo("zzz", kun)];
    const ids = new Set(kun.nodoj.map((nodo) => nodo.id));
    for (const id of Object.keys(tokenoj)) if (!ids.has(id)) befunde.push(`${id} lost`);
    expect(befunde).toEqual([]);

    const infanoj = infanojDe(kun);
    const k = "farbe/komponenten";
    expect({
      zzzgross: infanoj.get(`${k}/zzzgross`),
      alfa: infanoj.get(`${k}/zzzgross/alfa`),
      zzzgrosb: infanoj.get(`${k}/zzzgrosb`),
    }).toEqual({
      zzzgross: [`${k}/zzzgross/alfa`, `${k}/zzzgross/beta`],
      alfa: [`${k}/zzzgross/alfa/m1`, `${k}/zzzgross/alfa/m2`],
      zzzgrosb: [`${k}/zzzgrosb/du`, `${k}/zzzgrosb/unu`],
    });
    const beta = kun.grupoj.find((grupo) => grupo.id === `${k}/zzzgross/beta`);
    expect(beta?.nodoj).toEqual([
      "ero.zzzgross.beta.n0",
      "ero.zzzgross.beta.n1",
      "ero.zzzgross.beta.n2",
    ]);
  });
});
