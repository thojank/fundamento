// Spec 048 (NE-1b, T2): the kind of a node (Entscheidung, Mechanik, Übernahme) and its reason (own,
// inherited along the chain of origin, or none), computed purely from the graph. On a small
// invented graph every rule of the provisional classification, its precedence (Mechanik before
// the role) and the decisions D-4 (palette = second group segment) and D-5 (own `al` = next link
// of the chain) are checked one by one. On the real graphs (provo, komuna, ekzemplo) the display
// decision is swept against the rules: no Mechanik shows "fehlt", every decision without its own
// reason does, every Übernahme shows what kialoDe finds. The group badge `ohneGrund` is opt-in
// (D-3) and equals an independent count; without the option sichtbaro answers what 047 answered.
// Nothing is written into the graph, and grafeo-sicht.ts still has no import.

import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import {
  begruendungDe,
  devenoDe,
  type Grafeo,
  type Grupo,
  grafeoDe,
  grafeoDePaket,
  kialoDe,
  knotenartDe,
  type Ligo,
  type Nodo,
  type SichtNodo,
  serializeGrafeo,
  sichtbaro,
} from "./grafeo.js";
import { paketo, provoAgordo } from "./test-doubles/grafeo-047.js";
import { loadBases } from "./vorschau.js";

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------------------------------------
// The invented graph. Ids, groups and texts are made up; the shape follows the real graph (an
// axis, its fixed level-2 groups, ero sub-groups, a split palette at level 3).

type NodoSpec = [
  id: string,
  grupo: string,
  speco: Nodo["speco"],
  regulo?: string | undefined,
  kialo?: string,
];

const NODOJ: NodoSpec[] = [
  ["enigo:leitfarbe", "eingaben", "enigo"],
  ["enigo:mit", "eingaben", "enigo", undefined, "Mit Absicht."],
  // Palette: a fixed value (an input, as in the packages – F-1), a palette step (Mechanik), an
  // input whose regulo names a palette (rule 1 wins over rule 2).
  ["color.palette.blau.100", "farbe/palette/blau", "enigo", "fiksa"],
  ["color.palette.blau.500", "farbe/palette/blau", "derivajxo", "paletto"],
  ["color.palette.blau.900", "farbe/palette/blau", "enigo", "paletto"],
  // Roles.
  ["color.aaa", "farbe/rollen/color", "derivajxo", "alias"],
  ["color.akcento", "farbe/rollen/color", "derivajxo", "alias", "Akzent gewählt."],
  ["color.d4neg", "farbe/rollen/color", "derivajxo", "alias"],
  ["color.d5", "farbe/rollen/color", "derivajxo", "alias"],
  ["color.fiksa.valoro", "farbe/rollen/color", "derivajxo", "fiksa", "Fester Wert."],
  ["color.fiksita", "farbe/rollen/color", "derivajxo", "alias"],
  ["color.nereferencita", "farbe/rollen/color", "derivajxo", "alias"],
  ["color.rollen.palette.x", "farbe/rollen/palette", "derivajxo", "alias"],
  // Components.
  ["ero.butono.fono", "farbe/komponenten/butono", "derivajxo", "alias"],
  ["ero.butono.rando", "farbe/komponenten/butono", "derivajxo", "alias"],
  ["ero.butono.teksto", "farbe/komponenten/butono", "derivajxo", "alias", "Eigener Grund."],
  ["ero.kampo.d4", "farbe/komponenten/kampo", "derivajxo", "alias"],
  ["ero.kampo.d5", "farbe/komponenten/kampo", "derivajxo", "alias"],
  ["ero.kampo.fiksita", "farbe/komponenten/kampo", "derivajxo", "alias"],
  ["ero.kampo.fono", "farbe/komponenten/kampo", "derivajxo", "alias"],
  ["ero.kampo.rando", "farbe/komponenten/kampo", "derivajxo", "alias"],
  ["sxablono.formularo.fono", "farbe/komponenten/formularo", "derivajxo", "alias"],
  ["ero.kampo.radius", "form/komponenten/kampo", "derivajxo", "alias"],
  ["radius.normala", "form/rollen", "derivajxo", "gestalto"],
  // A cycle (cannot come from the data, but the chain must stop).
  ["x.a", "weitere", "derivajxo", "alias"],
  ["x.b", "weitere", "derivajxo", "alias"],
];

const LIGOJ: [de: string, al: string][] = [
  ["color.palette.blau.500", "enigo:leitfarbe"],
  ["color.akcento", "color.palette.blau.500"],
  ["color.d4neg", "color.rollen.palette.x"],
  // D-5: the chain takes the smallest `al` (color.aaa, no palette node), not the palette step.
  ["color.d5", "color.aaa"],
  ["color.d5", "color.palette.blau.500"],
  ["color.fiksita", "color.fiksa.valoro"],
  ["color.nereferencita", "color.palette.blau.500"],
  ["ero.butono.fono", "color.akcento"],
  ["ero.butono.rando", "color.palette.blau.500"],
  ["ero.butono.teksto", "color.akcento"],
  ["ero.kampo.d4", "color.d4neg"],
  ["ero.kampo.d5", "color.d5"],
  ["ero.kampo.fiksita", "color.fiksita"],
  ["ero.kampo.fono", "ero.butono.fono"],
  ["ero.kampo.rando", "ero.butono.rando"],
  ["ero.kampo.radius", "radius.normala"],
  ["radius.normala", "enigo:mit"],
  ["sxablono.formularo.fono", "color.nereferencita"],
  ["x.a", "x.b"],
  ["x.b", "x.a"],
];

const GRUPOJ: [id: string, etikedo: string, patro?: string][] = [
  ["eingaben", "Eingaben"],
  ["farbe", "Farbe"],
  ["farbe/komponenten", "Komponenten-Tokens", "farbe"],
  ["farbe/komponenten/butono", "butono", "farbe/komponenten"],
  ["farbe/komponenten/formularo", "formularo", "farbe/komponenten"],
  ["farbe/komponenten/kampo", "kampo", "farbe/komponenten"],
  ["farbe/palette", "Palette", "farbe"],
  ["farbe/palette/blau", "blau", "farbe/palette"],
  ["farbe/rollen", "Rollen", "farbe"],
  ["farbe/rollen/color", "color", "farbe/rollen"],
  ["farbe/rollen/palette", "palette", "farbe/rollen"],
  ["form", "Form"],
  ["form/komponenten", "Komponenten-Tokens", "form"],
  ["form/komponenten/kampo", "kampo", "form/komponenten"],
  ["form/rollen", "Rollen", "form"],
  ["weitere", "Weitere"],
];

function inventita(): Grafeo {
  const nodoj: Nodo[] = NODOJ.map(([id, grupo, speco, regulo, kialo]) => {
    const nodo: Nodo = { id, speco, grupo, etikedo: id.split(".").at(-1) ?? id };
    if (regulo !== undefined) nodo.regulo = regulo;
    if (kialo !== undefined) nodo.kialo = kialo;
    return nodo;
  }).sort((a, b) => compareText(a.id, b.id));
  const ligoj: Ligo[] = LIGOJ.map(([de, al]) => ({ de, al })).sort(
    (a, b) => compareText(a.de, b.de) || compareText(a.al, b.al),
  );
  const grupoj: Grupo[] = GRUPOJ.map(([id, etikedo, patro]) => {
    const grupo: Grupo = {
      id,
      etikedo,
      nodoj: nodoj
        .filter((nodo) => nodo.grupo === id)
        .map((nodo) => nodo.id)
        .sort(compareText),
    };
    if (patro !== undefined) grupo.patro = patro;
    return grupo;
  });
  return { nodoj, ligoj, grupoj };
}

describe("Spec 048 T2: the kind of a node (invented graph)", () => {
  const g = inventita();

  it("rule 1: an input is an Entscheidung, even with a palette regulo", () => {
    expect(knotenartDe(g, "enigo:leitfarbe")).toBe("decido");
    expect(knotenartDe(g, "color.palette.blau.100")).toBe("decido");
    expect(knotenartDe(g, "color.palette.blau.900")).toBe("decido");
  });

  it("rule 2: a palette step or gestalt token is Mechanik – before the role", () => {
    expect(knotenartDe(g, "color.palette.blau.500")).toBe("mekaniko");
    // Referenced by ero.kampo.radius: Mechanik is checked before rule 3.
    expect(knotenartDe(g, "radius.normala")).toBe("mekaniko");
  });

  it("rule 3: a role referenced by an ero token whose own al is a palette node or fiksa", () => {
    // D-4: the al lies in farbe/palette/blau (level 3) – the second group segment is `palette`.
    expect(knotenartDe(g, "color.akcento")).toBe("decido");
    // The al has a regulo starting with `fiksa`.
    expect(knotenartDe(g, "color.fiksita")).toBe("decido");
  });

  it("D-4: a group with `palette` deeper than the second segment is no palette", () => {
    expect(knotenartDe(g, "color.d4neg")).toBe("transpreno");
  });

  it("D-5: only the next link of the chain counts as the own al", () => {
    expect(devenoDe(g, "color.d5")[1]).toBe("color.aaa");
    expect(knotenartDe(g, "color.d5")).toBe("transpreno");
  });

  it("rule 3 needs an ero token pointing at the node and the node not to be a component", () => {
    // Pointed at by a sxablono token only.
    expect(knotenartDe(g, "color.nereferencita")).toBe("transpreno");
    // A component pointed at by an ero token whose al is a palette step.
    expect(knotenartDe(g, "ero.butono.rando")).toBe("transpreno");
  });

  it("rule 4: everything else is an Übernahme", () => {
    for (const id of ["color.aaa", "color.fiksa.valoro", "ero.kampo.fono", "x.a"]) {
      expect([id, knotenartDe(g, id)]).toEqual([id, "transpreno"]);
    }
  });

  it("unknown id: no kind", () => {
    expect(knotenartDe(g, "color.nekonata")).toBeUndefined();
  });
});

describe("Spec 048 T2: the reason of a node (invented graph)", () => {
  const g = inventita();

  it("own before inherited", () => {
    expect(devenoDe(g, "ero.butono.teksto")[1]).toBe("color.akcento");
    expect(kialoDe(g, "ero.butono.teksto")).toEqual({ fonto: "propra", kialo: "Eigener Grund." });
  });

  it("inherited: the first node with a kialo from devenoDe(g, id)[1] on", () => {
    expect(kialoDe(g, "ero.butono.fono")).toEqual({
      fonto: "heredita",
      de: "color.akcento",
      kialo: "Akzent gewählt.",
    });
    // Two links further: ero.butono.fono has no kialo, color.akcento has.
    expect(devenoDe(g, "ero.kampo.fono")).toEqual([
      "ero.kampo.fono",
      "ero.butono.fono",
      "color.akcento",
      "color.palette.blau.500",
      "enigo:leitfarbe",
    ]);
    expect(kialoDe(g, "ero.kampo.fono")).toEqual({
      fonto: "heredita",
      de: "color.akcento",
      kialo: "Akzent gewählt.",
    });
    // An input with a kialo is a source as well (radius.normala has none).
    expect(kialoDe(g, "ero.kampo.radius")).toEqual({
      fonto: "heredita",
      de: "enigo:mit",
      kialo: "Mit Absicht.",
    });
  });

  it("none: the chain ends at an input or at a node without outgoing ligo", () => {
    const enigo = devenoDe(g, "color.nereferencita");
    expect(enigo.at(-1)).toBe("enigo:leitfarbe");
    expect(kialoDe(g, "color.nereferencita")).toEqual({ fonto: "neniu" });

    const fino = devenoDe(g, "ero.kampo.d5");
    expect(fino.at(-1)).toBe("color.aaa");
    expect(g.ligoj.some((ligo) => ligo.de === "color.aaa")).toBe(false);
    expect(kialoDe(g, "ero.kampo.d5")).toEqual({ fonto: "neniu" });

    expect(devenoDe(g, "x.a")).toEqual(["x.a", "x.b"]);
    expect(kialoDe(g, "x.a")).toEqual({ fonto: "neniu" });
  });

  it("unknown id: no reason", () => {
    expect(kialoDe(g, "color.nekonata")).toEqual({ fonto: "neniu" });
    expect(begruendungDe(g, "color.nekonata")).toBeUndefined();
  });

  it("the display decision per kind and reason (tech spec B, table)", () => {
    expect(begruendungDe(g, "color.palette.blau.500")).toEqual({ art: "mekaniko" });
    expect(begruendungDe(g, "radius.normala")).toEqual({ art: "mekaniko" });
    expect(begruendungDe(g, "color.akcento")).toEqual({
      art: "decido",
      montro: "grund",
      kialo: "Akzent gewählt.",
    });
    expect(begruendungDe(g, "enigo:mit")).toEqual({
      art: "decido",
      montro: "grund",
      kialo: "Mit Absicht.",
    });
    expect(begruendungDe(g, "enigo:leitfarbe")).toEqual({ art: "decido", montro: "fehlt" });
    // A decision with an inherited reason still lacks its own.
    expect(kialoDe(g, "color.fiksita").fonto).toBe("heredita");
    expect(begruendungDe(g, "color.fiksita")).toEqual({ art: "decido", montro: "fehlt" });
    expect(begruendungDe(g, "ero.butono.teksto")).toEqual({
      art: "transpreno",
      montro: "grund",
      kialo: "Eigener Grund.",
    });
    expect(begruendungDe(g, "ero.kampo.fiksita")).toEqual({
      art: "transpreno",
      montro: "geerbt",
      de: "color.fiksa.valoro",
      kialo: "Fester Wert.",
    });
    expect(begruendungDe(g, "sxablono.formularo.fono")).toEqual({
      art: "transpreno",
      montro: "neniu",
    });
  });
});

/** The decisions without an own reason, counted independently of the code under test. */
function senGrundo(g: Grafeo): Set<string> {
  return new Set(
    g.nodoj
      .filter((nodo) => knotenartDe(g, nodo.id) === "decido" && nodo.kialo === undefined)
      .map((nodo) => nodo.id),
  );
}

/** Per group: the number of its nodes (transitively, through `patro`) in `aro`. */
function nombroEn(g: Grafeo, aro: ReadonlySet<string>): Map<string, number> {
  const patroj = new Map(g.grupoj.map((grupo) => [grupo.id, grupo.patro]));
  const out = new Map<string, number>(g.grupoj.map((grupo) => [grupo.id, 0]));
  for (const id of aro) {
    let grupo: string | undefined = g.nodoj.find((nodo) => nodo.id === id)?.grupo;
    const vidita = new Set<string>();
    while (grupo !== undefined && !vidita.has(grupo)) {
      vidita.add(grupo);
      out.set(grupo, (out.get(grupo) ?? 0) + 1);
      grupo = patroj.get(grupo);
    }
  }
  return out;
}

/** The group nodes of a view with their `ohneGrund`, "-" where the key is missing. */
const insignoj = (nodoj: SichtNodo[]): string[] =>
  nodoj
    .filter((nodo) => nodo.speco === "grupo")
    .map((nodo) => `${nodo.id}=${"ohneGrund" in nodo ? nodo.ohneGrund : "-"}`);

describe("Spec 048 T2: ohneGrund in sichtbaro (invented graph)", () => {
  const g = inventita();
  const cxiuj = g.grupoj.map((grupo) => grupo.id);

  it("leaves the view of 047 unchanged without the option", () => {
    for (const malfermitaj of [[], ["farbe"], cxiuj]) {
      const sen = sichtbaro(g, malfermitaj);
      expect(sichtbaro(g, malfermitaj, {})).toEqual(sen);
      expect(sichtbaro(g, malfermitaj, { ohneGrund: false })).toEqual(sen);
      expect(sen.nodoj.filter((nodo) => "ohneGrund" in nodo)).toEqual([]);
    }
  });

  it("counts the decisions without own reason per group, transitively, 0 included", () => {
    expect(insignoj(sichtbaro(g, [], { ohneGrund: true }).nodoj)).toEqual([
      "eingaben=1",
      "farbe=3",
      "form=0",
      "weitere=0",
    ]);
    const atendita = nombroEn(g, senGrundo(g));
    const sicht = sichtbaro(g, cxiuj, { ohneGrund: true });
    expect(insignoj(sicht.nodoj)).toEqual(cxiuj.map((id) => `${id}=${atendita.get(id)}`));
    // Token nodes carry no badge; the rest of the view is the view of 047.
    expect(sicht.nodoj.filter((nodo) => nodo.speco !== "grupo" && "ohneGrund" in nodo)).toEqual([]);
    const sen = sicht.nodoj.map(({ ohneGrund: _, ...resto }) => resto);
    expect({ nodoj: sen, ligoj: sicht.ligoj }).toEqual(sichtbaro(g, cxiuj));
  });
});

// ---------------------------------------------------------------------------------------------
// The real graphs.

interface Fonto048 {
  nomo: "provo" | "komuna" | "ekzemplo";
  grafeo: Grafeo;
}

let fontoj: Fonto048[] = [];

beforeAll(() => {
  const bases = loadBases();
  fontoj = [
    { nomo: "provo", grafeo: grafeoDe(provoAgordo(), bases) },
    { nomo: "komuna", grafeo: grafeoDePaket("komuna", paketo("komuna")) },
    { nomo: "ekzemplo", grafeo: grafeoDePaket("ekzemplo", paketo("ekzemplo")) },
  ];
});

const KOMPONENTOJ = ["ero.", "sxablono."];

/** The rules of tech spec B with D-4/D-5, written out independently of the code under test. */
function atenditaArto(g: Grafeo, nodo: Nodo, eroCelo: ReadonlySet<string>): string {
  if (nodo.speco === "enigo") return "decido";
  if (nodo.regulo?.startsWith("paletto") || nodo.regulo?.startsWith("gestalto")) return "mekaniko";
  if (!KOMPONENTOJ.some((p) => nodo.id.startsWith(p)) && eroCelo.has(nodo.id)) {
    const al = g.nodoj.find((entry) => entry.id === devenoDe(g, nodo.id)[1]);
    if (
      al !== undefined &&
      (al.grupo.split("/")[1] === "palette" || al.regulo?.startsWith("fiksa"))
    )
      return "decido";
  }
  return "transpreno";
}

describe("Spec 048 T2: kinds and reasons on the real graphs (provo, komuna, ekzemplo)", () => {
  it("classifies every node by the rules, and the kinds add up to the node count", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      const eroCelo = new Set(
        grafeo.ligoj.filter((ligo) => ligo.de.startsWith("ero.")).map((ligo) => ligo.al),
      );
      const arten = { decido: 0, mekaniko: 0, transpreno: 0 };
      for (const nodo of grafeo.nodoj) {
        const arto = knotenartDe(grafeo, nodo.id);
        if (arto === undefined) {
          befunde.push(`${nomo}: ${nodo.id} without kind`);
          continue;
        }
        arten[arto] += 1;
        const atendita = atenditaArto(grafeo, nodo, eroCelo);
        if (arto !== atendita)
          befunde.push(`${nomo}: ${nodo.id} is ${arto}, rules say ${atendita}`);
      }
      const sumo = arten.decido + arten.mekaniko + arten.transpreno;
      if (sumo !== grafeo.nodoj.length)
        befunde.push(`${nomo}: kinds sum to ${sumo}, nodes ${grafeo.nodoj.length}`);
    }
    expect(befunde).toEqual([]);
  });

  it("finds the own reason first, then the first reason along the chain, else none", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      const byId = new Map(grafeo.nodoj.map((nodo) => [nodo.id, nodo]));
      const kunEliro = new Set(grafeo.ligoj.map((ligo) => ligo.de));
      for (const nodo of grafeo.nodoj) {
        const kialo = kialoDe(grafeo, nodo.id);
        const cxeno = devenoDe(grafeo, nodo.id);
        const unua = cxeno.slice(1).find((id) => byId.get(id)?.kialo !== undefined);
        let atendita: ReturnType<typeof kialoDe>;
        if (nodo.kialo !== undefined) atendita = { fonto: "propra", kialo: nodo.kialo };
        else if (unua !== undefined)
          atendita = { fonto: "heredita", de: unua, kialo: byId.get(unua)?.kialo ?? "" };
        else atendita = { fonto: "neniu" };
        if (JSON.stringify(kialo) !== JSON.stringify(atendita))
          befunde.push(`${nomo}: ${nodo.id} ${JSON.stringify(kialo)}`);
        if (kialo.fonto === "neniu") {
          const fino = cxeno.at(-1) ?? "";
          if (byId.get(fino)?.speco !== "enigo" && kunEliro.has(fino))
            befunde.push(`${nomo}: chain of ${nodo.id} without reason ends at ${fino}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("shows no 'fehlt' for Mechanik, 'fehlt' for every decision without own reason", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      for (const nodo of grafeo.nodoj) {
        const arto = knotenartDe(grafeo, nodo.id);
        const kialo = kialoDe(grafeo, nodo.id);
        const montro = begruendungDe(grafeo, nodo.id);
        let atendita: ReturnType<typeof begruendungDe>;
        if (arto === "mekaniko") atendita = { art: "mekaniko" };
        else if (arto === "decido")
          atendita =
            nodo.kialo !== undefined
              ? { art: "decido", montro: "grund", kialo: nodo.kialo }
              : { art: "decido", montro: "fehlt" };
        else if (kialo.fonto === "propra")
          atendita = { art: "transpreno", montro: "grund", kialo: kialo.kialo ?? "" };
        else if (kialo.fonto === "heredita")
          atendita = {
            art: "transpreno",
            montro: "geerbt",
            de: kialo.de ?? "",
            kialo: kialo.kialo ?? "",
          };
        else atendita = { art: "transpreno", montro: "neniu" };
        if (JSON.stringify(montro) !== JSON.stringify(atendita))
          befunde.push(`${nomo}: ${nodo.id} ${JSON.stringify(montro)}`);
        if (arto === "mekaniko" && montro !== undefined && "montro" in montro)
          befunde.push(`${nomo}: Mechanik ${nodo.id} shows ${montro.montro}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("gives every group the independent count of decisions without own reason", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      const sen = senGrundo(grafeo);
      // One definition (2.2): ohneGrund counts exactly the nodes whose display is "fehlt".
      const fehlt = grafeo.nodoj.filter((nodo) => {
        const montro = begruendungDe(grafeo, nodo.id);
        return montro !== undefined && "montro" in montro && montro.montro === "fehlt";
      }).length;
      if (fehlt !== sen.size) befunde.push(`${nomo}: fehlt ${fehlt}, independent ${sen.size}`);

      const atendita = nombroEn(grafeo, sen);
      const cxiuj = grafeo.grupoj.map((grupo) => grupo.id);
      const sicht = sichtbaro(grafeo, cxiuj, { ohneGrund: true });
      for (const nodo of sicht.nodoj) {
        if (nodo.speco !== "grupo") continue;
        if (nodo.ohneGrund !== atendita.get(nodo.id))
          befunde.push(
            `${nomo}: ${nodo.id} ohneGrund ${nodo.ohneGrund}, independent ${atendita.get(nodo.id)}`,
          );
      }
      const aksoj = sichtbaro(grafeo, [], { ohneGrund: true }).nodoj;
      const sumo = aksoj.reduce((acc, nodo) => acc + (nodo.ohneGrund ?? 0), 0);
      if (sumo !== sen.size) befunde.push(`${nomo}: axes sum to ${sumo}, graph has ${sen.size}`);
    }
    expect(befunde).toEqual([]);
  });

  it("answers what 047 answered without the option", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      const cxiuj = grafeo.grupoj.map((grupo) => grupo.id);
      for (const malfermitaj of [[], ["farbe", "farbe/komponenten"], cxiuj]) {
        const sen = sichtbaro(grafeo, malfermitaj);
        if (sen.nodoj.some((nodo) => "ohneGrund" in nodo))
          befunde.push(`${nomo}: ohneGrund without the option`);
        if (
          JSON.stringify(sichtbaro(grafeo, malfermitaj, { ohneGrund: false })) !==
          JSON.stringify(sen)
        )
          befunde.push(`${nomo}: { ohneGrund: false } differs`);
        const kun = sichtbaro(grafeo, malfermitaj, { ohneGrund: true });
        const forigita = {
          nodoj: kun.nodoj.map(({ ohneGrund: _, ...resto }) => resto),
          ligoj: kun.ligoj,
        };
        if (JSON.stringify(forigita) !== JSON.stringify(sen))
          befunde.push(`${nomo}: the option changes more than ohneGrund`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("writes nothing into the graph", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of [...fontoj, { nomo: "inventita", grafeo: inventita() }]) {
      const antaue = serializeGrafeo(grafeo);
      for (const nodo of grafeo.nodoj) {
        knotenartDe(grafeo, nodo.id);
        kialoDe(grafeo, nodo.id);
        begruendungDe(grafeo, nodo.id);
      }
      sichtbaro(
        grafeo,
        grafeo.grupoj.map((grupo) => grupo.id),
        { ohneGrund: true },
      );
      if (serializeGrafeo(grafeo) !== antaue) befunde.push(`${nomo}: graph changed`);
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 048 T2: grafeo-sicht.ts stays free of imports (D-2 of 047)", () => {
  it("has no import statement and no dynamic import", () => {
    const teksto = readFileSync(new URL("./grafeo-sicht.ts", import.meta.url), "utf8");
    const linioj = teksto
      .split("\n")
      .filter(
        (linio) =>
          /^\s*(import|export\s+[^(]*\bfrom\b)/.test(linio) ||
          /\b(import|require)\s*\(/.test(linio),
      );
    expect(linioj).toEqual([]);
  });
});
