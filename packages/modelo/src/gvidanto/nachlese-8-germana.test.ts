// Nachlese 8 ③ (Entscheidung d des Maintainers, 2026-10-21): the texts of the Uzoj and the Reguloj
// in German. English stays the source; German is a translation per text under the same ID — the
// ID of the entry and the path of the text in it — in data/tradukoj.json. A check reports every
// text without a German version as an error and every translation without its text. The Gvidanto
// answers in German with lingvo "de" and as before in English without it.

import { describe, expect, it } from "vitest";
import { tekstojOf, tradukoIssues } from "../lingvo/tradukoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { getEro } from "./eroj.js";
import { explainRegulo } from "./explain-regulo.js";
import { suggestEro } from "./suggest-ero.js";
import { getSxablono } from "./sxablonoj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const de = modelo.tradukoj?.de ?? {};
const tekstoj = tekstojOf(modelo);
const german = (key: string) => de[key];

describe("every text the Vitrino shows has a German version under its ID", () => {
  it("names the purposes, the kialoj of the Uzoj and the statements and kialoj of the Reguloj", () => {
    expect(tekstoj.length).toBeGreaterThanOrEqual(526);
    const butono = modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
    expect(tekstoj.find((entry) => entry.key === `${butono?.id}/purpose`)?.en).toBe(
      butono?.purpose,
    );
    const regulo = modelo.reguloj.find((entry) => entry.name === "touch-target-min");
    expect(tekstoj.find((entry) => entry.key === `${regulo?.id}/kialo`)?.en).toBe(regulo?.kialo);
  });

  it("each of them is translated, not empty", () => {
    const missing = tekstoj.filter((entry) => (german(entry.key) ?? "").trim() === "");
    expect(missing.map((entry) => entry.key)).toEqual([]);
    expect(tradukoIssues(modelo)).toEqual([]);
  });

  it("the names of the Vortaro stay: every Ero name a text names stands in its translation", () => {
    const names = modelo.eroj.map((entry) => entry.ero.name);
    for (const entry of tekstoj) {
      for (const name of names.filter((one) => new RegExp(`\\b${one}\\b`).test(entry.en)))
        expect(german(entry.key), `${entry.key}: ${name}`).toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  it("the check reports a text without German as an error and a translation without its text", () => {
    const first = tekstoj[0];
    if (first === undefined) throw new Error("no text");
    const without = { ...de };
    delete without[first.key];
    const issues = tradukoIssues({
      ...modelo,
      tradukoj: { de: { ...without, "uzo_00000000000000000000000000/purpose": "Verwaist." } },
    });
    expect(issues.map((issue) => [issue.rule, issue.severity])).toEqual([
      ["traduko-missing", "error"],
      ["traduko-orphaned", "warning"],
    ]);
    expect(issues[0]?.path).toContain(first.key);
  });
});

describe("the Gvidanto answers in German with lingvo de (③)", () => {
  it("get_ero: the Uzo in German, English without lingvo", () => {
    const english = getEro(modelo, { name: "butono" });
    const deutsch = getEro(modelo, { name: "butono", lingvo: "de" });
    if (!english.ok || !deutsch.ok) throw new Error("get_ero failed");
    const id = modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo?.id;
    expect(deutsch.output.uzo?.purpose).toBe(german(`${id}/purpose`));
    expect(english.output.uzo?.purpose).toBe(
      modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo?.purpose,
    );
    const boundary = deutsch.output.uzo?.boundary[0];
    expect(boundary?.kialo).toBe(german(`${id}/boundary/${boundary?.case}/kialo`));
    const rule = deutsch.output.uzo?.content[0]?.regulo;
    const regulo = modelo.reguloj.find((entry) => entry.name === rule?.name);
    expect(rule?.statement).toBe(german(`${regulo?.id}/statement`));
    expect(rule?.kialo).toBe(german(`${regulo?.id}/kialo`));
  });

  it("get_sxablono, suggest_ero and explain_regulo in German too", () => {
    const pagxo = getSxablono(modelo, { name: "pagxo", lingvo: "de" });
    if (!pagxo.ok) throw new Error("get_sxablono failed");
    const uzo = modelo.sxablonoj?.find((entry) => entry.sxablono.name === "pagxo")?.uzo;
    expect(pagxo.output.uzo?.purpose).toBe(german(`${uzo?.id}/purpose`));
    const suggested = suggestEro(modelo, { goal: "Markdown im Text rendern", lingvo: "de" });
    if (!suggested.ok) throw new Error("suggest_ero failed");
    const teksto = modelo.eroj.find((entry) => entry.ero.name === "teksto")?.uzo?.id;
    expect(suggested.output.boundary?.kialo).toBe(german(`${teksto}/boundary/rich-text/kialo`));
    const explained = explainRegulo(
      modelo,
      { name: "touch-target-min", lingvo: "de" },
      { errors: [], warnings: [] },
    );
    if (!explained.ok) throw new Error("explain_regulo failed");
    const regulo = modelo.reguloj.find((entry) => entry.name === "touch-target-min");
    expect(explained.output.kialo).toBe(german(`${regulo?.id}/kialo`));
  });
});
