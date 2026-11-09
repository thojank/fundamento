// Spec 046 T2, B-5 (guard): nordstelo K2 counts invented tags, props and values against the
// Modelo; data-* is a global attribute there (GLOBAL_ATTRIBUTE), so data-span on a child of the
// grid is never an invented attribute – green from the start for a known Ero, a guard that it stays
// so. fm-krado with columns is known from T2 on; a column count it does not take is invented.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  loadModelo,
  type NordsteloFile,
  type Tasko,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type ScoreInput, score } from "./score.js";
import { facts, h } from "./test-doubles/facts.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../modelo/data/nordstelo.json", import.meta.url)), "utf8"),
) as NordsteloFile;
const login = katalogo.taskoj.find((tasko) => tasko.name === "anmeldung") as Tasko;

const input = (page: ReturnType<typeof h>[]): ScoreInput => ({
  facts: facts(page, []),
  tasko: login,
  variant: "F",
  modelo,
  pezoj: katalogo.pezoj,
});

const invented = (page: ReturnType<typeof h>[]) =>
  score(input(page))
    .gaps.filter((gap) => gap.kind.startsWith("invented"))
    .map((gap) => [gap.kind, gap.key]);

describe("nordstelo K2 on the grid (Spec 046 T2, B-5)", () => {
  it("guard (green from the start): data-span on a child of a known Ero is no invented attribute", () => {
    expect(
      invented([h("fm-vico", { gap: "small" }, h("div", { "data-span": "2" }, "Eins"))]),
    ).toEqual([]);
  });

  it('<fm-krado columns="3"><div data-span="2"> has no invented tag, prop or value', () => {
    expect(
      invented([
        h(
          "fm-krado",
          { columns: "3" },
          h("div", { "data-span": "2" }, "Eins"),
          h("div", {}, "Zwei"),
        ),
      ]),
    ).toEqual([]);
  });

  it("a column count outside 1 to 12 or auto is an invented value", () => {
    expect(invented([h("fm-krado", { columns: "13" }, h("div", {}, "Eins"))])).toEqual([
      ["invented-value", "krado.columns=13"],
    ]);
  });
});
