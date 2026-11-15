// Spec 055 (MP-1b, T1): the canvas of the view Gestalten without phase frames. `gestaltenDe` gives
// nodes only; every node of a new brand – and every further preview – has an absolute start place
// from ARANGXO_055; the start rectangles (fixed width × maximum height per node kind, plan D-2) never
// overlap; the vertical pieces of the edges run on their lanes (D-4) in the gaps between the columns,
// never over a node; the fixed Primär → Neutral edge is one straight vertical piece (D-18). The
// browser check of the rendered boxes is binding (D-19); this is its data half. Invented brands only.

import { readFileSync } from "node:fs";
import type { Agordo } from "@fundamento/agordilo";
import { beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, paletrojDe, serializeBildo, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  ARANGXO_055,
  altecoDe,
  anschlussDe,
  type Bildo,
  type BildoLigo,
  FARBO_KOLUMNO,
  FESTA_TENILO,
  type Kabloj,
  largxoDe,
  ligoId,
  type Pozicio,
  poziciojKun,
  spuroX,
  tenilojDe,
} from "./grafeo-gestalten-sicht.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

let bases: Bases;
let LEER: Agordo;
let FARBIG: Agordo;

function bildoDe(agordo: Agordo, kabloj: Kabloj = {}): Bildo {
  const start = startAgordo(agordo.name, "leer", bases);
  const palettes = paletrojDe(wirksamerAgordo(agordo, start, kabloj), bases);
  return gestaltenDe(agordo, { start, kabloj, palettes, rev: 1 });
}

/** The nodes of a new brand plus two further previews, as the canvas holds them. */
const WEITERE = ["vorschau-3", "vorschau-4"] as const;
const nodojKunWeiteren = (bildo: Bildo): { id: string }[] => [
  ...bildo.nodoj.map((n) => ({ id: n.id })),
  ...WEITERE.map((id) => ({ id })),
];

interface Kadro {
  id: string;
  x: number;
  y: number;
  largxo: number;
  alteco: number;
}

/** The start rectangle of every node: place × fixed width × maximum height. */
function kadrojDe(nodoj: readonly { id: string }[]): Kadro[] {
  const pozicioj = poziciojKun(new Map(), nodoj);
  return nodoj.map(({ id }) => {
    const p = pozicioj.get(id) ?? { x: Number.NaN, y: Number.NaN };
    return { id, x: p.x, y: p.y, largxo: largxoDe(id), alteco: altecoDe(id) };
  });
}

const intersekcas = (a: Kadro, b: Kadro): boolean =>
  a.x < b.x + b.largxo && b.x < a.x + a.largxo && a.y < b.y + b.alteco && b.y < a.y + a.alteco;

beforeAll(() => {
  bases = loadBases();
  LEER = startAgordo("lumeto", "leer", bases);
  FARBIG = {
    ...LEER,
    leitfarbe: "#2f5bff",
    zweitfarbe: { farbe: "#c6f135" },
    neutral: { toenung: 0.35 },
    zusatzfarben: { warning: "#d99a00" },
  };
});

describe("Spec 055 T1: no phase frames, nodes only (Abnahme 1)", () => {
  it("gives no node of kind fazo and no „kommt später“ in any Bildo", () => {
    const befunde: string[] = [];
    for (const [nomo, agordo] of Object.entries({ LEER, FARBIG })) {
      for (const kabloj of [{}, { akzent: null }] as Kabloj[]) {
        const bildo = bildoDe(agordo, kabloj);
        for (const n of bildo.nodoj) {
          if ((n.speco as string) === "fazo") befunde.push(`${nomo}: phase node ${n.id}`);
        }
        const teksto = serializeBildo(bildo);
        for (const vorto of ["kommt später", "malplena", "titolo", "Ausgangslage", "Einsatz"]) {
          if (teksto.includes(vorto)) befunde.push(`${nomo}: Bildo carries ${vorto}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("puts all seven colour nodes on the canvas of a new brand", () => {
    const ids = bildoDe(LEER).nodoj.map((n) => n.id);
    expect(ids).toEqual([
      "marko",
      "farbo-primaer",
      "farbo-akzent",
      "farbo-neutral",
      "farbo-success",
      "farbo-warning",
      "farbo-danger",
      "farbo-info",
      "paletro",
      "vorschau-hell",
      "vorschau-dunkel",
    ]);
  });
});

describe("Spec 055 T1: ARANGXO_055 – absolute start places and maximum heights (plan §2.2, D-2)", () => {
  it("is the table of the plan, with the maximum height of each node kind", () => {
    const tabelo = Object.fromEntries(
      Object.entries(ARANGXO_055.nodoj).map(([id, p]) => [
        id,
        [p.x, p.y, p.largxo, altecoDe(id), p.y + altecoDe(id)],
      ]),
    );
    expect(tabelo).toEqual({
      marko: [24, 48, 190, 72, 120],
      "farbo-primaer": [300, 24, 264, 190, 214],
      "farbo-neutral": [300, 252, 264, 300, 552],
      "farbo-akzent": [300, 570, 264, 190, 760],
      "farbo-success": [300, 778, 264, 96, 874],
      "farbo-warning": [300, 892, 264, 96, 988],
      "farbo-danger": [300, 1006, 264, 96, 1102],
      "farbo-info": [300, 1120, 264, 96, 1216],
      paletro: [700, 24, 316, 520, 544],
      "vorschau-hell": [1136, 24, 372, 480, 504],
      "vorschau-dunkel": [1136, 524, 372, 480, 1004],
    });
    expect(ARANGXO_055.alteco).toEqual({
      marko: 72,
      "farbo-granda": 190,
      "farbo-neutral": 300,
      "farbo-kompakta": 96,
      paletro: 520,
      vorschau: 480,
    });
    expect(ARANGXO_055.weitereVorschauen).toEqual({ x: 1136, y: 1024, largxo: 372, dy: 500 });
    expect([largxoDe("vorschau-7"), altecoDe("vorschau-7")]).toEqual([372, 480]);
    expect([largxoDe("nenio"), altecoDe("nenio")]).toEqual([0, 0]);
  });

  it("orders the colour column Primär, Neutral, Akzent, Erfolg, Warnung, Fehler, Hinweis", () => {
    expect(FARBO_KOLUMNO).toEqual([
      "primaer",
      "neutral",
      "akzent",
      "success",
      "warning",
      "danger",
      "info",
    ]);
    const y = (rolo: string) => ARANGXO_055.nodoj[`farbo-${rolo}` as "farbo-primaer"].y;
    const ys = FARBO_KOLUMNO.map(y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });
});

describe("Spec 055 T1: start places (Abnahme 1, data)", () => {
  it("gives every node of a new brand and two further previews a start place", () => {
    const nodoj = nodojKunWeiteren(bildoDe(LEER));
    const pozicioj = poziciojKun(new Map(), nodoj);
    const befunde: string[] = [];
    for (const { id } of nodoj) {
      const p = pozicioj.get(id);
      if (p === undefined) befunde.push(`${id} has no place`);
      else if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) befunde.push(`${id} not finite`);
      if (largxoDe(id) <= 0) befunde.push(`${id} has no width`);
      if (altecoDe(id) <= 0) befunde.push(`${id} has no maximum height`);
    }
    expect(befunde).toEqual([]);
    const { x, y, dy } = ARANGXO_055.weitereVorschauen;
    expect(WEITERE.map((id) => pozicioj.get(id))).toEqual([
      { x, y },
      { x, y: y + dy },
    ]);
  });

  it("keeps every start rectangle (width × maximum height) apart from every other one", () => {
    const befunde: string[] = [];
    for (const agordo of [LEER, FARBIG]) {
      const kadroj = kadrojDe(nodojKunWeiteren(bildoDe(agordo)));
      for (let i = 0; i < kadroj.length; i += 1) {
        for (let j = i + 1; j < kadroj.length; j += 1) {
          const a = kadroj[i];
          const b = kadroj[j];
          if (a !== undefined && b !== undefined && intersekcas(a, b))
            befunde.push(`${a.id} overlaps ${b.id}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("place rule: a moved node keeps its place, the others start, gone ones drop out", () => {
    const nodoj = nodojKunWeiteren(bildoDe(LEER));
    const verschoben = new Map<string, Pozicio>([
      ["paletro", { x: 1400, y: 900 }],
      ["vorschau-4", { x: 10, y: 20 }],
      ["fazo-4", { x: 1, y: 2 }],
    ]);
    const pozicioj = poziciojKun(verschoben, nodoj);
    expect(pozicioj.get("paletro")).toEqual({ x: 1400, y: 900 });
    expect(pozicioj.get("vorschau-4")).toEqual({ x: 10, y: 20 });
    expect(pozicioj.get("farbo-neutral")).toEqual({ x: 300, y: 252 });
    expect(pozicioj.has("fazo-4")).toBe(false);
    expect([...pozicioj.keys()].sort()).toEqual(nodoj.map((n) => n.id).sort());
  });
});

/** Where an edge leaves and ends at the start places: right edge of the source, left of the target. */
function finojDe(ligo: BildoLigo, kadroj: ReadonlyMap<string, Kadro>) {
  const de = kadroj.get(anschlussDe(ligo.de)?.nodo ?? "");
  const al = kadroj.get(anschlussDe(ligo.al)?.nodo ?? "");
  if (de === undefined || al === undefined) return undefined;
  return { de, al, sourceX: de.x + de.largxo, targetX: al.x };
}

describe("Spec 055 T1: edge lanes in the column gaps (D-4)", () => {
  it("runs every vertical piece in the gap between its columns, over no node", () => {
    const bildo = bildoDe(LEER);
    const nodoj = nodojKunWeiteren(bildo);
    const kadroj = new Map(kadrojDe(nodoj).map((k) => [k.id, k] as const));
    const ligoj: BildoLigo[] = [
      ...bildo.ligoj,
      ...WEITERE.map(
        (id): BildoLigo => ({
          id: ligoId("paletro.el", `${id}.en`),
          de: "paletro.el",
          al: `${id}.en`,
          art: "marko",
        }),
      ),
    ];
    const befunde: string[] = [];
    // The fixed edge Primär → Neutral (D-18) is one vertical piece between the two nodes, no lane.
    for (const ligo of ligoj.filter((l) => l.fest !== true)) {
      const finoj = finojDe(ligo, kadroj);
      if (finoj === undefined) {
        befunde.push(`${ligo.id}: unknown end`);
        continue;
      }
      const x = spuroX(ligo.de, ligo.al, finoj.sourceX, finoj.targetX);
      if (x === undefined) {
        befunde.push(`${ligo.id}: no lane`);
        continue;
      }
      if (!(x > finoj.sourceX && x < finoj.targetX))
        befunde.push(`${ligo.id}: lane ${x} not between`);
      for (const k of kadroj.values()) {
        if (x >= k.x && x <= k.x + k.largxo) befunde.push(`${ligo.id}: lane ${x} over ${k.id}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("gives each colour → Palette edge its own lane, Primär leftmost; the Marke edges share one", () => {
    const sourceX = 300 + 264;
    const targetX = 700;
    const farbaj = FARBO_KOLUMNO.map((rolo) =>
      spuroX(`farbo-${rolo}.el`, `paletro.en.${rolo}`, sourceX, targetX),
    );
    expect(farbaj).toEqual([606, 618, 630, 642, 654, 666, 678]);
    // A drawn edge onto another row keeps the lane of its source node.
    expect(spuroX("farbo-success.el", "paletro.en.warning", sourceX, targetX)).toBe(642);
    const markaj = FARBO_KOLUMNO.map((rolo) => spuroX("marko.el", `farbo-${rolo}.en`, 214, 300));
    expect(new Set(markaj)).toEqual(new Set([248]));
    expect(spuroX("paletro.el", "vorschau-hell.en", 1016, 1136)).toBe(1062);
    expect(spuroX("paletro.el", "vorschau-9.en", 1016, 1136)).toBe(1062);
  });

  it("D-18: the fixed Primär → Neutral edge is one vertical piece between the two nodes", () => {
    const primaer = ARANGXO_055.nodoj["farbo-primaer"];
    const neutral = ARANGXO_055.nodoj["farbo-neutral"];
    const sub = primaer.x + primaer.largxo / 2;
    const supr = neutral.x + neutral.largxo / 2;
    expect(sub).toBe(supr);
    expect(primaer.y + altecoDe("farbo-primaer")).toBeLessThan(neutral.y);
    expect(anschlussDe("farbo-neutral.en.farbo")).toEqual({
      nodo: "farbo-neutral",
      direkto: "en",
      art: "farbo",
    });
    const fest: BildoLigo = {
      id: ligoId("farbo-primaer.el", "farbo-neutral.en.farbo"),
      de: "farbo-primaer.el",
      al: "farbo-neutral.en.farbo",
      art: "farbo",
      hex: "#375479",
      fest: true,
    };
    expect(FESTA_TENILO).toBe("farbo-primaer.el.unten");
    expect(tenilojDe(fest)).toEqual({ de: "farbo-primaer.el.unten", al: "farbo-neutral.en.farbo" });
    expect(spuroX(fest.de, fest.al, sub, supr)).toBeUndefined();
    // Every other edge keeps its port ids as handle ids.
    const ligo = bildoDe(LEER).ligoj[0];
    expect(ligo === undefined ? undefined : tenilojDe(ligo)).toEqual({
      de: ligo?.de,
      al: ligo?.al,
    });
  });
});

describe("Spec 055 T1: grafeo-gestalten-sicht.ts names no phase layout any more", () => {
  // („kommt später“ stays a word of the catalog „+ Knoten“ for later runs, not of a phase.)
  it("has no ARANGXO_054, FAZOJ or phase-relative places", () => {
    const teksto = readFileSync(new URL("./grafeo-gestalten-sicht.ts", import.meta.url), "utf8");
    const befunde = ["ARANGXO_054", "FAZOJ", "FazoPlatz", "malplena", "parentId"].filter((v) =>
      teksto.includes(v),
    );
    expect(befunde).toEqual([]);
  });
});
