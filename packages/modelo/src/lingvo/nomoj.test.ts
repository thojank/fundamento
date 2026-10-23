// Spec 026 ② (Lingvo-Schalter, decision of the maintainer 2026-10-22 21:30): Esperanto stays the
// default; the display switches to German or English, the names of the components too. The names
// stand in data/tradukoj.json under the ID of their entry (the way of Nachlese 8 ③, rule 0.1): an
// Ero or a Sxablono under its ID (`<id>/name`), its parts, axes, values, states, slots and regions
// under the ID of its Skemo (`<ske>/parts/<part>`, `<ske>/props/<prop>/values/<value>`, …), a
// Dimensio and its values under their IDs. English is new for names; the check reports every
// missing name as an error. Identifiers never change: the Esperanto name is the identifier.

import { describe, expect, it } from "vitest";
import { getEro, listEroj } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { getSxablono, listSxablonoj } from "../gvidanto/sxablonoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { labelOf, NOMO_LINGVOJ, nomo, nomojOf } from "./nomoj.js";
import { tradukoIssues } from "./tradukoj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const tradukoj = modelo.tradukoj ?? {};
const eroId = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.ero.id;
const skemoId = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.skemo.id;

describe("every name the Vitrino shows has a German and an English name under its ID (Spec 026 ②)", () => {
  it("names the 40 Eroj and 5 Sxablonoj, their parts, axes, values, states, slots and regions, the Dimensioj and their values", () => {
    const nomoj = nomojOf(modelo);
    const kinds = (kind: string) => nomoj.filter((entry) => entry.kind === kind);
    expect(kinds("ero")).toHaveLength(40);
    expect(kinds("sxablono")).toHaveLength(5);
    expect(kinds("dimensio")).toHaveLength(6);
    expect(kinds("valoro")).toHaveLength(12);
    for (const kind of ["part", "prop", "value", "state", "slot", "region"]) {
      expect(kinds(kind).length, kind).toBeGreaterThan(0);
    }
    expect(nomoj.find((entry) => entry.key === `${eroId("glitilo")}/name`)).toEqual({
      key: `${eroId("glitilo")}/name`,
      eo: "glitilo",
      kind: "ero",
      of: "glitilo",
    });
    expect(nomoj.find((entry) => entry.key === `${skemoId("glitilo")}/parts/thumb`)?.eo).toBe(
      "thumb",
    );
    expect(
      nomoj.find((entry) => entry.key === `${skemoId("butono")}/props/emphasis/values/high`)?.eo,
    ).toBe("high");
    expect(new Set(nomoj.map((entry) => entry.key)).size).toBe(nomoj.length);
  });

  it("each of them stands in German and in English, not empty; the check is clean", () => {
    expect(NOMO_LINGVOJ).toEqual(["de", "en"]);
    for (const lingvo of NOMO_LINGVOJ) {
      const missing = nomojOf(modelo).filter(
        (entry) => (tradukoj[lingvo]?.[entry.key] ?? "").trim() === "",
      );
      expect(
        missing.map((entry) => entry.key),
        lingvo,
      ).toEqual([]);
    }
    expect(tradukoIssues(modelo)).toEqual([]);
  });

  it("the check reports a missing name as an error, in German and in English; English texts are the source and need no entry", () => {
    const key = `${eroId("glitilo")}/name`;
    const en = { ...tradukoj.en };
    delete en[key];
    const issues = tradukoIssues({ ...modelo, tradukoj: { ...tradukoj, en } });
    expect(issues.map((issue) => [issue.rule, issue.severity])).toEqual([
      ["traduko-missing", "error"],
    ]);
    expect(issues[0]?.message).toContain("glitilo");
    expect(issues[0]?.path).toContain(key.replaceAll("/", "~1"));
  });

  it("the names of the maintainer's example: glitilo is Schieberegler and Slider, butono Schaltfläche and Button", () => {
    expect(labelOf(modelo, "ero", "glitilo", "de")).toBe("Schieberegler");
    expect(labelOf(modelo, "ero", "glitilo", "en")).toBe("Slider");
    expect(labelOf(modelo, "ero", "glitilo", "eo")).toBe("glitilo");
    expect(labelOf(modelo, "ero", "butono", "de")).toBe("Schaltfläche");
    expect(labelOf(modelo, "ero", "butono", "en")).toBe("Button");
    expect(labelOf(modelo, "sxablono", "sxelo", "eo")).toBe("sxelo");
    expect(nomo(modelo, "de", `${skemoId("glitilo")}/parts/thumb`, "thumb")).toBe("Griff");
    expect(nomo(modelo, "eo", `${skemoId("glitilo")}/parts/thumb`, "thumb")).toBe("thumb");
    expect(nomo(modelo, undefined, `${skemoId("glitilo")}/parts/thumb`, "thumb")).toBe("thumb");
  });

  it("no two Eroj or Sxablonoj have the same name in one language", () => {
    const owners = nomojOf(modelo).filter(
      (entry) => entry.kind === "ero" || entry.kind === "sxablono",
    );
    for (const lingvo of ["eo", ...NOMO_LINGVOJ] as const) {
      const names = owners.map((entry) => nomo(modelo, lingvo, entry.key, entry.eo).toLowerCase());
      const twice = names.filter((name, index) => names.indexOf(name) !== index);
      expect(twice, lingvo).toEqual([]);
    }
  });

  it("a name is short: one to four words", () => {
    for (const lingvo of NOMO_LINGVOJ) {
      for (const entry of nomojOf(modelo).filter(
        (each) => each.kind === "ero" || each.kind === "sxablono",
      )) {
        const name = nomo(modelo, lingvo, entry.key, entry.eo);
        expect(name.split(/\s+/).length, `${lingvo} ${name}`).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe("the Gvidanto names the display name beside the name with lingvo (Spec 026 ②)", () => {
  it("„Schieberegler“ hits the glitilo through its keywords, with and without lingvo", () => {
    for (const lingvo of [undefined, "de"] as const) {
      const answer = suggestEro(modelo, {
        goal: "Schieberegler",
        ...(lingvo === undefined ? {} : { lingvo }),
      });
      if (!answer.ok) throw new Error(JSON.stringify(answer.issues));
      expect(answer.output.suggestion?.ero, String(lingvo)).toBe("glitilo");
    }
  });

  it("suggest_ero with lingvo de says „Schieberegler“ as the label beside glitilo; without lingvo there is no label", () => {
    const deutsch = suggestEro(modelo, { goal: "Schieberegler", lingvo: "de" });
    const plain = suggestEro(modelo, { goal: "Schieberegler" });
    if (!deutsch.ok || !plain.ok) throw new Error("suggest_ero");
    expect(deutsch.output.suggestion).toMatchObject({ ero: "glitilo", label: "Schieberegler" });
    expect(plain.output.suggestion).not.toHaveProperty("label");
    const english = suggestEro(modelo, { goal: "slider", lingvo: "en" });
    if (!english.ok) throw new Error("suggest_ero en");
    expect(english.output.suggestion).toMatchObject({ ero: "glitilo", label: "Slider" });
  });

  it("get_ero, get_sxablono, list_eroj and list_sxablonoj name the label with lingvo", () => {
    const ero = getEro(modelo, { name: "glitilo", lingvo: "de" });
    if (!ero.ok) throw new Error("get_ero");
    expect(ero.output.ero).toMatchObject({ name: "glitilo", label: "Schieberegler" });
    const plain = getEro(modelo, { name: "glitilo" });
    if (!plain.ok) throw new Error("get_ero");
    expect(plain.output.ero).not.toHaveProperty("label");
    const sxelo = getSxablono(modelo, { name: "sxelo", lingvo: "en" });
    if (!sxelo.ok) throw new Error("get_sxablono");
    expect((sxelo.output as { sxablono: unknown }).sxablono).toMatchObject({
      name: "sxelo",
      label: "App shell",
    });
    const listed = listEroj(modelo, { lingvo: "de" }).eroj.find(
      (entry) => entry.name === "glitilo",
    );
    expect(listed).toMatchObject({ name: "glitilo", label: "Schieberegler" });
    expect(listEroj(modelo).eroj[0]).not.toHaveProperty("label");
    const sxablono = listSxablonoj(modelo, { lingvo: "de" }).sxablonoj.find(
      (entry) => entry.name === "formularo",
    );
    expect(sxablono).toMatchObject({ name: "formularo", label: "Formular" });
  });
});
