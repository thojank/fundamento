// Spec 030 (Nordstern-Kennzahl): the catalogue of tasks is data in the Modelo (data/nordstelo.json)
// with IDs the way every entity has them (rule 0.1): a Tasko with a tsk_ ID, each acceptance
// criterion a Kriterio with a kri_ ID, both in ids.lock.json. Every criterion names a Regulo (and
// with it its kialo); the weights of K1–K6 stand beside them with a kialo, K7 is reported only.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { ENTITY_ID_PREFIXES, ENTITY_TYPES } from "../contracts/entity-ids.js";
import { OPTIONAL_DATA_FILE_SCHEMA_DEFS } from "../contracts/schema.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { checkNordstelo, KRITERIO_KINDS, type NordsteloFile, readNordstelo } from "./katalogo.js";

const dataDir = fileURLToPath(new URL("../../data/", import.meta.url));
const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);
const katalogo = (): NordsteloFile =>
  JSON.parse(readFileSync(`${dataDir}nordstelo.json`, "utf8")) as NordsteloFile;

describe("Nordstelo entities (Spec 030, rule 0.1)", () => {
  it("a Tasko has a tsk_ ID, a Kriterio a kri_ ID; the file is an optional data file", () => {
    expect(ENTITY_TYPES).toContain("tasko");
    expect(ENTITY_TYPES).toContain("kriterio");
    expect(ENTITY_ID_PREFIXES.tasko).toBe("tsk");
    expect(ENTITY_ID_PREFIXES.kriterio).toBe("kri");
    expect(OPTIONAL_DATA_FILE_SCHEMA_DEFS["nordstelo.json"]).toBe("NordsteloFile");
  });

  it("the file is valid against NordsteloFile and every ID stands active in ids.lock.json", () => {
    const file = katalogo();
    expect(v("NordsteloFile")(file)).toBe(true);
    const lock = JSON.parse(readFileSync(`${dataDir}ids.lock.json`, "utf8")) as {
      ids: Record<string, { type: string; status: string }>;
    };
    for (const tasko of file.taskoj) {
      expect(lock.ids[tasko.id], tasko.id).toEqual({ status: "active", type: "tasko" });
      for (const kriterio of tasko.kriterioj) {
        expect(lock.ids[kriterio.id], kriterio.id).toEqual({ status: "active", type: "kriterio" });
      }
    }
  });
});

describe("The catalogue (Spec 030, Ablauf 1)", () => {
  it("holds 20 tasks in everyday words, German and English, with unique names", () => {
    const { taskoj } = katalogo();
    expect(taskoj).toHaveLength(20);
    expect(new Set(taskoj.map((tasko) => tasko.name)).size).toBe(20);
    for (const tasko of taskoj) {
      expect(tasko.teksto.de.length, tasko.name).toBeGreaterThan(15);
      expect(tasko.teksto.en.length, tasko.name).toBeGreaterThan(15);
      // Everyday words: no identifier of the Modelo in the task itself.
      expect(tasko.teksto.de, tasko.name).not.toMatch(/fm-|\b(butono|kampo|sxelo|formularo)\b/);
    }
  });

  it("covers all 5 Sxablonoj and at least 30 of the 40 Eroj", () => {
    const { taskoj } = katalogo();
    expect(new Set(taskoj.map((tasko) => tasko.sxablono)).size).toBe(5);
    expect(new Set(taskoj.flatMap((tasko) => tasko.eroj)).size).toBeGreaterThanOrEqual(30);
  });

  it("every task carries checkable criteria, each naming a Regulo with kialo", () => {
    const { taskoj } = katalogo();
    for (const tasko of taskoj) {
      expect(tasko.kriterioj.length, tasko.name).toBeGreaterThanOrEqual(3);
      for (const kriterio of tasko.kriterioj) {
        expect(KRITERIO_KINDS, kriterio.id).toContain(kriterio.kontrolo.kind);
        expect(kriterio.regulo, kriterio.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
        expect(kriterio.teksto.de.length, kriterio.id).toBeGreaterThan(5);
      }
    }
  });

  it("the weights of K1 to K6 are data with a kialo; K7 is reported, not weighted", () => {
    const { pezoj } = katalogo();
    expect(pezoj.map((pezo) => pezo.kriterio)).toEqual(["K1", "K2", "K3", "K4", "K5", "K6"]);
    for (const pezo of pezoj) {
      expect(pezo.pezo, pezo.kriterio).toBeGreaterThan(0);
      expect(pezo.kialo.de.length, pezo.kriterio).toBeGreaterThan(20);
      expect(pezo.kialo.en.length, pezo.kriterio).toBeGreaterThan(20);
    }
  });

  it("checkNordstelo finds every Ero, Sxablono and Regulo the catalogue names; the repo's is clean", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repo's Modelo must load");
    expect(checkNordstelo(modelo, katalogo())).toEqual([]);
    const broken = katalogo();
    const first = broken.taskoj[0];
    if (first === undefined) throw new Error("no task");
    first.eroj = [...first.eroj, "nenioilo"];
    first.sxablono = "nenio";
    const kriterio = first.kriterioj[0];
    if (kriterio === undefined) throw new Error("no criterion");
    kriterio.regulo = "no-such-rule";
    expect(checkNordstelo(modelo, broken).map((issue) => issue.rule)).toEqual([
      "nordstelo-sxablono-unknown",
      "nordstelo-ero-unknown",
      "nordstelo-regulo-unknown",
    ]);
  });

  it("readNordstelo reads the file of a data directory, undefined without one", () => {
    expect(readNordstelo(dataDir)?.taskoj).toHaveLength(20);
    expect(readNordstelo(fileURLToPath(new URL("./", import.meta.url)))).toBeUndefined();
  });
});
