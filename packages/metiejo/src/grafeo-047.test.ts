// Spec 047 (NE-1, T1): the graph of a derivation, read without any UI. For the brand provo
// (`grafeoDe` over the fixture Agordo) and the packages komuna and ekzemplo (`grafeoDePaket`):
// two generations give the same bytes, every ligo joins two nodes, every token of the composed
// Modelo is exactly one node (the names come from the Modelo, never pinned), the collapsed view
// stays at most 40 nodes (the bound of the spec), every group opened with its ancestors shows its
// nodes, and the arrays are sorted. An alias cycle is a structured error, never a dropped ligo.

import { buildModelo } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import {
  type Grafeo,
  GrafeoEraro,
  type Grupo,
  grafeoDe,
  grafeoDePaket,
  serializeGrafeo,
  sichtbaro,
} from "./grafeo.js";
import {
  type Fonto047,
  komponitaModelo,
  kunAldonitajTokenoj,
  paketo,
  provoAgordo,
  tokenNomoj,
} from "./test-doubles/grafeo-047.js";
import { loadBases } from "./vorschau.js";

/** The axes in their fixed order (spec 2.3); the level-2 groups follow their axis. */
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

const aksoDe = (grupo: string): string => grupo.split("/")[0] ?? grupo;

let fontoj: Fonto047[] = [];
/** The serialisation of a second, independent generation of each graph. */
const duaFoje = new Map<string, string>();

beforeAll(() => {
  const bases = loadBases();
  const provo = provoAgordo();
  const komuna = paketo("komuna");
  const ekzemplo = paketo("ekzemplo");
  fontoj = [
    {
      nomo: "provo",
      aspekto: provo.name,
      modelo: komponitaModelo(provo, bases),
      jugxoKialoj: (provo.jugxoj ?? []).map((jugxo) => jugxo.kialo),
      grafeo: grafeoDe(provo, bases),
    },
    {
      nomo: "komuna",
      aspekto: "komuna",
      modelo: buildModelo(komuna).modelo,
      jugxoKialoj: [],
      grafeo: grafeoDePaket("komuna", komuna),
    },
    {
      nomo: "ekzemplo",
      aspekto: "ekzemplo",
      modelo: buildModelo(ekzemplo).modelo,
      jugxoKialoj: [],
      grafeo: grafeoDePaket("ekzemplo", ekzemplo),
    },
  ];
  duaFoje.set("provo", serializeGrafeo(grafeoDe(provoAgordo(), bases)));
  duaFoje.set("komuna", serializeGrafeo(grafeoDePaket("komuna", paketo("komuna"))));
  duaFoje.set("ekzemplo", serializeGrafeo(grafeoDePaket("ekzemplo", paketo("ekzemplo"))));
});

/** The ancestors of a group, outermost first. */
function praojDe(grafeo: Grafeo, grupo: Grupo): string[] {
  const byId = new Map(grafeo.grupoj.map((entry) => [entry.id, entry]));
  const out: string[] = [];
  let patro = grupo.patro;
  while (patro !== undefined && !out.includes(patro)) {
    out.unshift(patro);
    patro = byId.get(patro)?.patro;
  }
  return out;
}

describe("Spec 047 T1: the graph of a derivation", () => {
  it("is byte-identical when generated twice (provo, komuna, ekzemplo)", () => {
    const abweichend = fontoj
      .filter((fonto) => serializeGrafeo(fonto.grafeo) !== duaFoje.get(fonto.nomo))
      .map((fonto) => fonto.nomo);
    expect(abweichend).toEqual([]);
  });

  it("has exactly one node per distinct token name of the composed Modelo", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const nomoj = tokenNomoj(fonto.modelo);
      const tokenoj = fonto.grafeo.nodoj
        .map((nodo) => nodo.id)
        .filter((id) => !id.startsWith("enigo:"));
      if (tokenoj.length !== nomoj.length) {
        befunde.push(`${fonto.nomo}: ${tokenoj.length} token nodes, ${nomoj.length} token names`);
      }
      const nodoj = new Set(tokenoj);
      const nomojSet = new Set(nomoj);
      for (const nomo of nomoj)
        if (!nodoj.has(nomo)) befunde.push(`${fonto.nomo}: ${nomo} missing`);
      for (const id of tokenoj) if (!nomojSet.has(id)) befunde.push(`${fonto.nomo}: ${id} extra`);
    }
    expect(befunde).toEqual([]);
  });

  it("joins only existing nodes with every ligo", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const ids = new Set(fonto.grafeo.nodoj.map((nodo) => nodo.id));
      for (const ligo of fonto.grafeo.ligoj) {
        if (!ids.has(ligo.de) || !ids.has(ligo.al)) {
          befunde.push(`${fonto.nomo}: ${ligo.de} -> ${ligo.al}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("puts every node into a listed group of the lowest level", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const grupoj = new Map(fonto.grafeo.grupoj.map((grupo) => [grupo.id, grupo]));
      const patroj = new Set(fonto.grafeo.grupoj.flatMap((grupo) => grupo.patro ?? []));
      for (const nodo of fonto.grafeo.nodoj) {
        const grupo = grupoj.get(nodo.grupo);
        if (grupo === undefined) befunde.push(`${fonto.nomo}: ${nodo.id} in unknown ${nodo.grupo}`);
        else if (!grupo.nodoj.includes(nodo.id))
          befunde.push(`${fonto.nomo}: ${nodo.grupo} does not list ${nodo.id}`);
        if (patroj.has(nodo.grupo)) befunde.push(`${fonto.nomo}: ${nodo.id} in a parent group`);
      }
      for (const grupo of fonto.grafeo.grupoj) {
        const enhavo =
          grupo.nodoj.length +
          fonto.grafeo.grupoj.filter((infano) => infano.patro === grupo.id).length;
        if (enhavo === 0) befunde.push(`${fonto.nomo}: empty group ${grupo.id}`);
        if (!AKSOJ.includes(aksoDe(grupo.id))) befunde.push(`${fonto.nomo}: axis of ${grupo.id}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("shows at most 40 nodes collapsed", () => {
    for (const fonto of fontoj) {
      expect(sichtbaro(fonto.grafeo, []).nodoj.length, fonto.nomo).toBeLessThanOrEqual(40);
    }
  });

  it("shows every node of a group once the group and its ancestors are open", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      for (const grupo of fonto.grafeo.grupoj) {
        const sicht = sichtbaro(fonto.grafeo, [...praojDe(fonto.grafeo, grupo), grupo.id]);
        const videblaj = new Set(sicht.nodoj.map((nodo) => nodo.id));
        for (const id of grupo.nodoj) {
          if (!videblaj.has(id)) befunde.push(`${fonto.nomo}: ${grupo.id} hides ${id}`);
        }
        const malfermita = sicht.nodoj.find((nodo) => nodo.id === grupo.id);
        if (malfermita?.malfermita !== true) befunde.push(`${fonto.nomo}: ${grupo.id} not open`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("sorts nodes by id, ligoj by (de, al) and groups by axis order, then id", () => {
    const befunde: string[] = [];
    for (const fonto of fontoj) {
      const { nodoj, ligoj, grupoj } = fonto.grafeo;
      nodoj.forEach((nodo, index) => {
        const antaua = nodoj[index - 1];
        if (antaua !== undefined && !(antaua.id < nodo.id))
          befunde.push(`${fonto.nomo}: node ${nodo.id} after ${antaua.id}`);
      });
      ligoj.forEach((ligo, index) => {
        const antaua = ligoj[index - 1];
        if (
          antaua !== undefined &&
          !(antaua.de < ligo.de || (antaua.de === ligo.de && antaua.al < ligo.al))
        )
          befunde.push(
            `${fonto.nomo}: ligo ${ligo.de}->${ligo.al} after ${antaua.de}->${antaua.al}`,
          );
      });
      grupoj.forEach((grupo, index) => {
        const antaua = grupoj[index - 1];
        if (antaua === undefined) return;
        const a = AKSOJ.indexOf(aksoDe(antaua.id));
        const b = AKSOJ.indexOf(aksoDe(grupo.id));
        if (!(a < b || (a === b && antaua.id < grupo.id)))
          befunde.push(`${fonto.nomo}: group ${grupo.id} after ${antaua.id}`);
        const sorted = [...grupo.nodoj].sort();
        if (sorted.join("\n") !== grupo.nodoj.join("\n"))
          befunde.push(`${fonto.nomo}: members of ${grupo.id} unsorted`);
      });
    }
    expect(befunde).toEqual([]);
  });

  it("throws grafeo-ciklo at the smallest id of an alias cycle", () => {
    // Three invented tokens in an alias cycle, in memory; the smallest id is zzzciklo.a.
    const files = kunAldonitajTokenoj(paketo("komuna"), {
      "zzzciklo.b": { $type: "number", $value: "{zzzciklo.c}" },
      "zzzciklo.c": { $type: "number", $value: "{zzzciklo.a}" },
      "zzzciklo.a": { $type: "number", $value: "{zzzciklo.b}" },
    });
    let eraro: unknown;
    try {
      grafeoDePaket("komuna", files);
    } catch (error) {
      eraro = error;
    }
    expect(eraro).toBeInstanceOf(GrafeoEraro);
    const { path, rule, suggestion } = eraro as GrafeoEraro;
    expect({ path, rule }).toEqual({ path: "zzzciklo.a", rule: "grafeo-ciklo" });
    expect(suggestion.length).toBeGreaterThan(0);
  });
});

describe("Spec 047 T1: sichtbaro on a small invented graph", () => {
  const grafeo: Grafeo = {
    nodoj: [
      { id: "a.eins", speco: "enigo", grupo: "farbe/palette", etikedo: "eins" },
      { id: "a.zwei", speco: "derivajxo", grupo: "farbe/rollen", etikedo: "zwei" },
      { id: "a.drei", speco: "derivajxo", grupo: "farbe/rollen", etikedo: "drei" },
      { id: "b.vier", speco: "derivajxo", grupo: "weitere", etikedo: "vier" },
    ],
    ligoj: [
      { de: "a.drei", al: "a.eins" },
      { de: "a.drei", al: "a.zwei" },
      { de: "a.zwei", al: "a.eins" },
      { de: "b.vier", al: "a.zwei" },
      { de: "b.vier", al: "a.eins" },
    ].sort((x, y) => (x.de + x.al < y.de + y.al ? -1 : 1)),
    grupoj: [
      { id: "farbe", etikedo: "Farbe", nodoj: [] },
      { id: "farbe/palette", etikedo: "Palette", patro: "farbe", nodoj: ["a.eins"] },
      { id: "farbe/rollen", etikedo: "Rollen", patro: "farbe", nodoj: ["a.drei", "a.zwei"] },
      { id: "weitere", etikedo: "Weitere", nodoj: ["b.vier"] },
    ],
  };

  it("collapsed: only the top-level groups, edges summed, self-loops dropped", () => {
    expect(sichtbaro(grafeo, [])).toEqual({
      nodoj: [
        { id: "farbe", speco: "grupo", etikedo: "Farbe", nombro: 3, malfermita: false },
        { id: "weitere", speco: "grupo", etikedo: "Weitere", nombro: 1, malfermita: false },
      ],
      ligoj: [{ de: "weitere", al: "farbe", nombro: 2 }],
    });
  });

  it("a sub-group counts as open only under an open parent", () => {
    expect(sichtbaro(grafeo, ["farbe/rollen"])).toEqual(sichtbaro(grafeo, []));
  });

  it("an open axis shows its sub-groups, an open sub-group its nodes", () => {
    const sicht = sichtbaro(grafeo, ["farbe", "farbe/rollen"]);
    expect(sicht.nodoj.map((nodo) => nodo.id)).toEqual([
      "farbe",
      "farbe/palette",
      "farbe/rollen",
      "a.drei",
      "a.zwei",
      "weitere",
    ]);
    expect(sicht.ligoj).toEqual([
      { de: "a.drei", al: "a.zwei", nombro: 1 },
      { de: "a.drei", al: "farbe/palette", nombro: 1 },
      { de: "a.zwei", al: "farbe/palette", nombro: 1 },
      { de: "weitere", al: "a.zwei", nombro: 1 },
      { de: "weitere", al: "farbe/palette", nombro: 1 },
    ]);
  });
});
