// Spec 049 (KIA-1.1): reasons for komuna. The 75 "Entscheidungen ohne Grund" of the komuna package
// graph (Spec 048) each get their own kialo from one of 24 approved Reguloj with `aspekto: "komuna"`
// and `appliesTo.tokens` in `packages/aspekto-komuna/reguloj.json` – data only, no code change.
//
// "Before" is the same package files with komuna's package Reguloj removed in memory; "after" is
// the files as the repo has them. Nothing is read from `specs/**` or from the Reguloj file by path
// (plan B-4: the hash of this package's test task does not cover them); the modelo test
// `regularo-komuna-049` ties the table below to `specs/048-…/luecken.json`.

import { type AspektoPackageFiles, buildModelo, type ModeloFiles } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { begruendungDe, type Grafeo, grafeoDe, grafeoDePaket, kialoDe } from "./grafeo.js";
import { paketo, provoAgordo } from "./test-doubles/grafeo-047.js";
import { type Bases, loadBases } from "./vorschau.js";

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------------------------------------
// The approved table (tech spec §5, implementation spec §2.2): Regulo name → `appliesTo.tokens`
// → the komuna decisions without reason (Spec 048) it closes. Encoded once; every count below is
// derived from it.

interface Vico {
  name: string;
  tokens: readonly string[];
  luecken: readonly string[];
}

const TABELO: readonly Vico[] = [
  {
    name: "komuna-dauer-null",
    tokens: ["motion.duration.scale.0"],
    luecken: ["motion.duration.scale.0"],
  },
  {
    name: "komuna-kurven",
    tokens: ["motion.easing.curve.*"],
    luecken: [
      "motion.easing.curve.accelerate",
      "motion.easing.curve.decelerate",
      "motion.easing.curve.expressive",
      "motion.easing.curve.linear",
    ],
  },
  {
    name: "komuna-ebenen",
    tokens: ["elevation.layer.*"],
    luecken: [
      "elevation.layer.base",
      "elevation.layer.modal",
      "elevation.layer.navigation",
      "elevation.layer.overlay",
      "elevation.layer.raised",
      "elevation.layer.toast",
    ],
  },
  {
    name: "komuna-syntax-schluesselwort",
    tokens: ["color.syntax.keyword"],
    luecken: ["color.syntax.keyword"],
  },
  { name: "komuna-syntax-name", tokens: ["color.syntax.name"], luecken: ["color.syntax.name"] },
  {
    name: "komuna-syntax-zeichenkette",
    tokens: ["color.syntax.string"],
    luecken: ["color.syntax.string"],
  },
  { name: "komuna-syntax-zahl", tokens: ["color.syntax.number"], luecken: ["color.syntax.number"] },
  {
    name: "komuna-syntax-kommentar",
    tokens: ["color.syntax.comment"],
    luecken: ["color.syntax.comment"],
  },
  {
    name: "komuna-randbreiten",
    tokens: ["border.width.scale.*"],
    luecken: ["border.width.scale.1", "border.width.scale.2", "border.width.scale.3"],
  },
  { name: "komuna-rand-betont", tokens: ["border.width.strong"], luecken: ["border.width.strong"] },
  {
    name: "komuna-rundung-bedienelement",
    tokens: ["radius.role.control"],
    luecken: ["radius.role.control"],
  },
  {
    name: "komuna-rundung-mehrzeilig",
    tokens: ["radius.role.multiline"],
    luecken: ["radius.role.multiline"],
  },
  { name: "komuna-rundung-pille", tokens: ["radius.role.pill"], luecken: ["radius.role.pill"] },
  {
    name: "komuna-rundung-flaeche",
    tokens: ["radius.role.surface"],
    luecken: ["radius.role.surface"],
  },
  { name: "komuna-rundung-tag", tokens: ["radius.role.tag"], luecken: ["radius.role.tag"] },
  { name: "komuna-strichart", tokens: ["stroke.*"], luecken: ["stroke.dashed", "stroke.solid"] },
  {
    name: "komuna-groessen",
    tokens: ["size.scale.*"],
    luecken: [
      "size.scale.100",
      "size.scale.1000",
      "size.scale.200",
      "size.scale.300",
      "size.scale.400",
      "size.scale.500",
      "size.scale.600",
      "size.scale.900",
    ],
  },
  {
    name: "komuna-spalten",
    tokens: ["layout.columns.*"],
    luecken: ["layout.columns.12", "layout.columns.4", "layout.columns.8"],
  },
  {
    name: "komuna-umbrueche",
    tokens: ["size.breakpoint.*"],
    luecken: ["size.breakpoint.expanded", "size.breakpoint.medium"],
  },
  {
    name: "komuna-container",
    tokens: ["size.container.*"],
    luecken: [
      "size.container.large",
      "size.container.max",
      "size.container.medium",
      "size.container.small",
    ],
  },
  {
    name: "komuna-schriftfamilien",
    tokens: ["font.family.*"],
    luecken: ["font.family.body", "font.family.code", "font.family.display"],
  },
  {
    name: "komuna-zeilenhoehen",
    tokens: ["font.lineheight.scale.*"],
    luecken: [
      "font.lineheight.scale.loose",
      "font.lineheight.scale.normal",
      "font.lineheight.scale.relaxed",
      "font.lineheight.scale.snug",
      "font.lineheight.scale.solid",
      "font.lineheight.scale.tight",
    ],
  },
  {
    name: "komuna-laufweite",
    tokens: ["font.tracking.scale.*"],
    luecken: [
      "font.tracking.scale.100",
      "font.tracking.scale.1000",
      "font.tracking.scale.1100",
      "font.tracking.scale.1200",
      "font.tracking.scale.200",
      "font.tracking.scale.300",
      "font.tracking.scale.400",
      "font.tracking.scale.500",
      "font.tracking.scale.600",
      "font.tracking.scale.700",
      "font.tracking.scale.800",
      "font.tracking.scale.900",
      "font.tracking.scale.caps",
    ],
  },
  {
    name: "komuna-schriftgewichte",
    tokens: ["font.weight.*"],
    luecken: [
      "font.weight.black",
      "font.weight.bold",
      "font.weight.extrabold",
      "font.weight.extralight",
      "font.weight.light",
      "font.weight.medium",
      "font.weight.regular",
      "font.weight.semibold",
      "font.weight.thin",
    ],
  },
];

/** Gap token → the name of the Regulo the table assigns to it. */
const REGULO_DE = new Map(TABELO.flatMap(({ name, luecken }) => luecken.map((id) => [id, name])));
const LUECKEN = [...REGULO_DE.keys()].sort(compareText);
const NOMOJ = new Set(TABELO.map(({ name }) => name));

// ---------------------------------------------------------------------------------------------
// Before and after.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Whether a package is komuna (by the name in its aspekto.json, not by its directory). */
const estasKomuna = (pkg: AspektoPackageFiles): boolean =>
  isRecord(pkg.aspekto.value) && pkg.aspekto.value.name === "komuna";

/** The files without the package Reguloj of komuna (in memory; every other document is shared). */
function senKomunaReguloj(files: ModeloFiles): ModeloFiles {
  return {
    ...files,
    packages: files.packages.map((pkg) => {
      if (!estasKomuna(pkg)) return pkg;
      const { reguloj, ...rest } = pkg;
      return rest;
    }),
  };
}

/** The ids of the decisions whose display says "fehlt", sorted. */
const fehlt = (g: Grafeo): string[] =>
  g.nodoj
    .filter((nodo) => {
      const begruendung = begruendungDe(g, nodo.id);
      return begruendung !== undefined && "montro" in begruendung && begruendung.montro === "fehlt";
    })
    .map((nodo) => nodo.id)
    .sort(compareText);

interface Paro {
  antaux: Grafeo;
  post: Grafeo;
}

let komuna: Paro;
let ekzemplo: Paro;
let provo: Paro;
/** The Reguloj of Spec 049 in the komuna Modelo after (by the names of the table). */
let reguloj049: { id: string; name: string; kialo: string }[] = [];

beforeAll(() => {
  const komunaFiles = paketo("komuna");
  komuna = {
    antaux: grafeoDePaket("komuna", senKomunaReguloj(komunaFiles)),
    post: grafeoDePaket("komuna", komunaFiles),
  };
  const ekzemploFiles = paketo("ekzemplo");
  ekzemplo = {
    antaux: grafeoDePaket("ekzemplo", senKomunaReguloj(ekzemploFiles)),
    post: grafeoDePaket("ekzemplo", ekzemploFiles),
  };
  // provo stands on the structure (komuna 0.2); without komuna's package Reguloj where it has any.
  const bases = loadBases();
  const sen: Bases = {
    ...bases,
    structure: { ...bases.structure, files: senKomunaReguloj(bases.structure.files) },
  };
  provo = { antaux: grafeoDe(provoAgordo(), sen), post: grafeoDe(provoAgordo(), bases) };
  reguloj049 = buildModelo(komunaFiles)
    .modelo.reguloj.filter((regulo) => NOMOJ.has(regulo.name))
    .map(({ id, name, kialo }) => ({ id, name, kialo }));
});

describe("Spec 049: the approved table", () => {
  it("names 24 Reguloj for 75 distinct tokens, each Regulo with at least one", () => {
    expect(NOMOJ.size).toBe(TABELO.length);
    expect(TABELO).toHaveLength(24);
    expect(LUECKEN).toHaveLength(TABELO.reduce((sum, { luecken }) => sum + luecken.length, 0));
    expect(LUECKEN).toHaveLength(75);
    expect(TABELO.filter(({ luecken }) => luecken.length === 0).map(({ name }) => name)).toEqual(
      [],
    );
  });
});

describe("Spec 049: komuna package graph (AC-6)", () => {
  it("(a) before: the decisions without reason are exactly the tokens of the table", () => {
    expect(fehlt(komuna.antaux)).toEqual(LUECKEN);
  });

  it("(a) after: each of them has its own kialo, from the Regulo the table assigns", () => {
    const befunde: string[] = [];
    for (const id of LUECKEN) {
      const name = REGULO_DE.get(id);
      const regulo = reguloj049.find((entry) => entry.name === name);
      if (regulo === undefined) {
        befunde.push(`${id}: no Regulo ${name} in the komuna Modelo`);
        continue;
      }
      const kialo = kialoDe(komuna.post, id);
      if (kialo.fonto !== "propra" || kialo.kialo !== regulo.kialo)
        befunde.push(`${id}: ${JSON.stringify(kialo)}, expected the kialo of ${name}`);
      const nodo = komuna.post.nodoj.find((entry) => entry.id === id);
      if (!nodo?.regulo?.endsWith(` · ${regulo.id}`))
        befunde.push(`${id}: regulo ${nodo?.regulo}, expected ${name} (${regulo.id})`);
    }
    expect(befunde).toEqual([]);
  });

  it("(b) after: no decision without reason is left (every row of §5 is approved)", () => {
    // The tokens of rejected rows (✗) would stay "fehlt"; Spec 049 rejects none.
    expect(fehlt(komuna.post)).toEqual([]);
  });
});

describe("Spec 049: ekzemplo and provo are untouched (AC-7)", () => {
  it("(c) their decisions without reason do not depend on komuna's package Reguloj", () => {
    expect(fehlt(ekzemplo.post)).toEqual(fehlt(ekzemplo.antaux));
    expect(fehlt(provo.post)).toEqual(fehlt(provo.antaux));
  });

  it("(c) no node of theirs names a Regulo of Spec 049 or carries its kialo", () => {
    const ids = new Set(reguloj049.map(({ id }) => id));
    const kialoj = new Set(reguloj049.map(({ kialo }) => kialo));
    const befunde: string[] = [];
    for (const [nomo, g] of [
      ["ekzemplo", ekzemplo.post],
      ["provo", provo.post],
    ] as const) {
      for (const nodo of g.nodoj) {
        const regulo = nodo.regulo?.split(" · ")[1];
        if (regulo !== undefined && ids.has(regulo))
          befunde.push(`${nomo}: ${nodo.id} names ${regulo}`);
        if (nodo.kialo !== undefined && kialoj.has(nodo.kialo))
          befunde.push(`${nomo}: ${nodo.id} carries a kialo of Spec 049`);
      }
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 049: nothing else moves in komuna (AC-8)", () => {
  it("(d) the own kialo changes or appears exactly on the 75 tokens", () => {
    const antaux = new Map(komuna.antaux.nodoj.map((nodo) => [nodo.id, nodo]));
    const befunde: string[] = [];
    const sxangxitaj: string[] = [];
    for (const nodo of komuna.post.nodoj) {
      const vorher = antaux.get(nodo.id);
      if (vorher === undefined) {
        befunde.push(`${nodo.id}: not in the graph before`);
        continue;
      }
      if (vorher.kialo !== nodo.kialo) sxangxitaj.push(nodo.id);
      if (vorher.kialo !== undefined && vorher.kialo !== nodo.kialo && !REGULO_DE.has(nodo.id))
        befunde.push(`${nodo.id}: own kialo changed outside the 75`);
    }
    if (komuna.post.nodoj.length !== komuna.antaux.nodoj.length)
      befunde.push(`nodes ${komuna.antaux.nodoj.length} → ${komuna.post.nodoj.length}`);
    expect(befunde).toEqual([]);
    expect(sxangxitaj.sort(compareText)).toEqual(LUECKEN);
  });

  it("(e) a node newly inheriting a reason inherits it from one of the 75; none loses one", () => {
    const befunde: string[] = [];
    let neniuAntaux = 0;
    let neniuPost = 0;
    for (const nodo of komuna.post.nodoj) {
      const vorher = kialoDe(komuna.antaux, nodo.id);
      const nachher = kialoDe(komuna.post, nodo.id);
      if (vorher.fonto === "neniu") neniuAntaux += 1;
      if (nachher.fonto === "neniu") neniuPost += 1;
      if (vorher.fonto === "neniu" && nachher.fonto === "heredita" && !REGULO_DE.has(nachher.de))
        befunde.push(`${nodo.id}: inherits from ${nachher.de}, not one of the 75`);
      if (vorher.fonto !== "neniu" && nachher.fonto === "neniu")
        befunde.push(`${nodo.id}: lost its reason (${vorher.fonto})`);
    }
    if (neniuPost > neniuAntaux) befunde.push(`neniu ${neniuAntaux} → ${neniuPost}`);
    expect(befunde).toEqual([]);
  });
});
