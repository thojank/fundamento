// Spec 056 (MP-2a, T1): the start places of the new nodes (plan §2.3, D-16) and the catalog „+
// Knoten“ (D-24). ARANGXO_056 keeps every place of ARANGXO_055 (which stays byte-identical), raises
// the Marke's maximum height and adds one column of text nodes left of the Marke, Beispiele over the
// Marke and Schrift under the Palette. The start rectangles (width × maximum height) of a new brand
// and of the layout with all six added nodes never overlap; every curve from the text column runs
// in the gap to the Marke's left input, which no node covers. The browser check stays binding
// (AK-7); this is its data half. Invented brands only.

import { createHash } from "node:crypto";
import type { Agordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { gestaltenDe } from "./grafeo-gestalten.js";
import {
  ALDONEBLAJ,
  ARANGXO_055,
  ARANGXO_056,
  aldonebloj,
  altecoDe,
  FIKSAJ_TEKSTOJ,
  KATALOGO_054,
  KATALOGO_056,
  largxoDe,
  poziciojKun,
} from "./grafeo-gestalten-sicht.js";

const sha256 = (teksto: string): string => createHash("sha256").update(teksto).digest("hex");

const START: Agordo = { name: "komuna", leitfarbe: "#3b5bdb" };
const BILDO_NODOJ = gestaltenDe(START, {
  start: START,
  kabloj: {},
  palettes: undefined,
  rev: 1,
}).nodoj.map((n) => ({ id: n.id }));
const WEITERE = [{ id: "vorschau-3" }, { id: "vorschau-4" }];

/** A new brand: the Bildo's nodes, the three fixed text nodes, two further previews. */
const NEU = [...BILDO_NODOJ, ...FIKSAJ_TEKSTOJ.map((id) => ({ id })), ...WEITERE];
/** And with all six nodes of „+ Knoten“. */
const ALLE = [...NEU, ...ALDONEBLAJ.map((id) => ({ id }))];

interface Kadro {
  id: string;
  x: number;
  y: number;
  largxo: number;
  alteco: number;
}

function kadrojDe(nodoj: readonly { id: string }[]): Kadro[] {
  const pozicioj = poziciojKun(new Map(), nodoj);
  return nodoj.map(({ id }) => {
    const p = pozicioj.get(id) ?? { x: Number.NaN, y: Number.NaN };
    return { id, x: p.x, y: p.y, largxo: largxoDe(id), alteco: altecoDe(id) };
  });
}

const intersekcas = (a: Kadro, b: Kadro): boolean =>
  a.x < b.x + b.largxo && b.x < a.x + a.largxo && a.y < b.y + b.alteco && b.y < a.y + a.alteco;

describe("Spec 056 T1: ARANGXO_056 (plan §2.3, D-16)", () => {
  it("leaves ARANGXO_055 byte-identical", () => {
    expect(sha256(JSON.stringify(ARANGXO_055))).toBe(
      "893361047488a77434387a44a529c4adaef77a4a45f4aa897b2c923313349201",
    );
  });

  it("keeps every 055 place and adds the table of the plan", () => {
    const tabelo = Object.fromEntries(
      Object.entries(ARANGXO_056.nodoj).map(([id, p]) => [
        id,
        [p.x, p.y, p.largxo, altecoDe(id), p.y + altecoDe(id)],
      ]),
    );
    expect(tabelo).toEqual({
      ...Object.fromEntries(
        Object.entries(ARANGXO_055.nodoj).map(([id, p]) => {
          const alteco = id === "marko" ? 480 : altecoDe(id);
          return [id, [p.x, p.y, p.largxo, alteco, p.y + alteco]];
        }),
      ),
      "teksto-wettbewerb": [-350, -656, 280, 380, -276],
      "teksto-zielgruppe": [-350, -258, 280, 264, 6],
      "teksto-ausgangslage": [-350, 24, 280, 172, 196],
      "teksto-markenkern": [-350, 214, 280, 220, 434],
      "teksto-werte": [-350, 452, 280, 270, 722],
      "teksto-persoenlichkeit": [-350, 740, 280, 172, 912],
      "teksto-tonalitaet": [-350, 930, 280, 300, 1230],
      beispiele: [24, -656, 300, 640, -16],
      marko: [24, 48, 190, 480, 528],
      schrift: [700, 562, 316, 360, 922],
    });
    expect(ARANGXO_056.weitereVorschauen).toEqual(ARANGXO_055.weitereVorschauen);
    const { marko: _m, ...ohneMarko } = ARANGXO_055.alteco;
    expect(ARANGXO_056.alteco).toMatchObject(ohneMarko);
  });

  it("gives every node of a new brand and of the full layout a place, width and height", () => {
    const pozicioj = poziciojKun(new Map(), ALLE);
    const befunde = ALLE.flatMap(({ id }) => {
      const p = pozicioj.get(id);
      const fehler: string[] = [];
      if (p === undefined || !Number.isFinite(p.x) || !Number.isFinite(p.y))
        fehler.push(`${id} place`);
      if (largxoDe(id) <= 0) fehler.push(`${id} width`);
      if (altecoDe(id) <= 0) fehler.push(`${id} height`);
      return fehler;
    });
    expect(befunde).toEqual([]);
    // An added node without a place takes its slot; a moved one keeps its place.
    const verschoben = new Map([["teksto-zielgruppe", { x: 5, y: 6 }]]);
    const mitVerschoben = poziciojKun(verschoben, ALLE);
    expect(mitVerschoben.get("teksto-zielgruppe")).toEqual({ x: 5, y: 6 });
    expect(mitVerschoben.get("schrift")).toEqual({ x: 700, y: 562 });
  });
});

describe("Spec 056 T1: start rectangles never overlap (AK-7, data)", () => {
  it("keeps every rectangle of a new brand and of the full layout apart", () => {
    const befunde: string[] = [];
    for (const [nomo, nodoj] of Object.entries({ NEU, ALLE })) {
      const kadroj = kadrojDe(nodoj);
      for (let i = 0; i < kadroj.length; i += 1) {
        for (let j = i + 1; j < kadroj.length; j += 1) {
          const a = kadroj[i];
          const b = kadroj[j];
          if (a !== undefined && b !== undefined && intersekcas(a, b))
            befunde.push(`${nomo}: ${a.id} overlaps ${b.id}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("puts the text column left of the Marke with a gap no node covers", () => {
    const kadroj = kadrojDe(ALLE);
    const marko = kadroj.find((k) => k.id === "marko");
    const tekstoj = kadroj.filter((k) => k.id.startsWith("teksto-"));
    const dekstra = Math.max(...tekstoj.map((k) => k.x + k.largxo));
    expect(tekstoj.length).toBe(7);
    expect(dekstra).toBeLessThan(marko?.x ?? Number.NEGATIVE_INFINITY);
    const imSpalt = kadroj.filter(
      (k) => k.x < (marko?.x ?? 0) && k.x + k.largxo > dekstra && !k.id.startsWith("teksto-"),
    );
    expect(imSpalt.map((k) => k.id)).toEqual([]);
    // Nothing stands under the Marke in its column.
    const unter = kadroj.filter(
      (k) =>
        marko !== undefined &&
        k.id !== "marko" &&
        k.y >= marko.y &&
        k.x < marko.x + marko.largxo &&
        k.x + k.largxo > marko.x,
    );
    expect(unter.map((k) => k.id)).toEqual([]);
  });

  it("puts Beispiele over the Marke, its bottom above Primär's top", () => {
    const kadroj = new Map(kadrojDe(ALLE).map((k) => [k.id, k] as const));
    const beispiele = kadroj.get("beispiele");
    const primaer = kadroj.get("farbo-primaer");
    const marko = kadroj.get("marko");
    expect(beispiele?.x).toBe(marko?.x);
    expect((beispiele?.y ?? 0) + (beispiele?.alteco ?? 0)).toBeLessThan(primaer?.y ?? 0);
    const schrift = kadroj.get("schrift");
    const paletro = kadroj.get("paletro");
    expect(schrift?.x).toBe(paletro?.x);
    expect((paletro?.y ?? 0) + (paletro?.alteco ?? 0)).toBeLessThan(schrift?.y ?? 0);
  });
});

describe("Spec 056 T1: KATALOGO_056 – the catalog „+ Knoten“ (D-24)", () => {
  it("names the new nodes in the order of the process, Schrift under Gestalt", () => {
    const eingabe = KATALOGO_056.filter((e) => e.grupo === "Eingabe").map((e) => [e.nomo, e.nodo]);
    expect(eingabe).toEqual([
      ["Marke", "marko"],
      ["Ausgangslage", "teksto-ausgangslage"],
      ["Zielgruppe", "teksto-zielgruppe"],
      ["Wettbewerb", "teksto-wettbewerb"],
      ["Beispiele", "beispiele"],
      ["Markenkern", "teksto-markenkern"],
      ["Werte", "teksto-werte"],
      ["Persönlichkeit", "teksto-persoenlichkeit"],
      ["Tonalität", "teksto-tonalitaet"],
    ]);
    const schrift = KATALOGO_056.find((e) => e.nomo === "Schrift");
    expect(schrift).toMatchObject({ grupo: "Gestalt", zeichen: "tiparo", nodo: "schrift" });
    // The placeholders of 054 are gone; every other entry stays as it was.
    const platzhalter = KATALOGO_056.filter(
      (e) =>
        ["Text", "Material"].includes(e.nomo) || (e.grupo === "Eingabe" && e.nodo === undefined),
    );
    expect(platzhalter).toEqual([]);
    const sonst = (k: typeof KATALOGO_054) =>
      k.filter((e) => e.grupo !== "Eingabe" && e.nomo !== "Schrift");
    expect(sonst(KATALOGO_056)).toEqual(sonst(KATALOGO_054));
  });

  it("offers „anlegen“ for the six added nodes and „da“ for the fixed ones and those on the canvas", () => {
    const stato = (nodoj: readonly { id: string }[]) =>
      Object.fromEntries(
        aldonebloj(KATALOGO_056, nodoj)
          .filter(
            (a) =>
              a.nodo !== undefined &&
              (a.nodo.startsWith("teksto-") || ["beispiele", "schrift"].includes(a.nodo)),
          )
          .map((a) => [a.nodo, a.stato]),
      );
    expect(stato(NEU)).toEqual({
      "teksto-ausgangslage": "da",
      "teksto-zielgruppe": "anlegen",
      "teksto-wettbewerb": "anlegen",
      beispiele: "anlegen",
      "teksto-markenkern": "da",
      "teksto-werte": "da",
      "teksto-persoenlichkeit": "anlegen",
      "teksto-tonalitaet": "anlegen",
      schrift: "anlegen",
    });
    const alleDa = Object.values(stato(ALLE)).filter((s) => s !== "da");
    expect(alleDa).toEqual([]);
    // The fixed three stay „da“ even when the canvas list misses them.
    expect(stato(BILDO_NODOJ)["teksto-werte"]).toBe("da");
  });

  it("leaves aldonebloj(KATALOGO_054, …) and KATALOGO_054 byte-identical", () => {
    expect(sha256(JSON.stringify(KATALOGO_054))).toBe(
      "b63304c618733cfe9a876734ae562e4c4ab0d7ec6ee265672e65c2ef6f42c3e4",
    );
    expect(sha256(JSON.stringify(aldonebloj(KATALOGO_054, [])))).toBe(
      "df8bf3175af12a29c73cebf12275f2ff0bb462bb474e4d15b8e0f735f7de8fe6",
    );
    // With the new nodes on the canvas the 054 catalog still knows none of them.
    const mit = aldonebloj(KATALOGO_054, ALLE);
    const ohne = aldonebloj(KATALOGO_054, [...BILDO_NODOJ, ...WEITERE]);
    expect(mit).toEqual(ohne);
  });
});
