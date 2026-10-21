// The Sxablonoj of Spec 020 ② (G1, G3, G5, G7): formularo (a form) and filtrilo (a filter bar).
// The form holds its problems at the top, its fields, and its actions with exactly one submit
// button; it sends submit once and validates nothing natively (novalidate). The filter bar is the
// landmark search with its name, its fields in a row that wraps, its actions and a polite status
// line with the count of hits; binding the filters to the URL stays the application's (G5).

import { describe, expect, it } from "vitest";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const named = (name: string) =>
  (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === name);

describe("the Sxablonoj of Spec 020 ②", () => {
  it("are four now: filtrilo, formularo, pagxo, sxelo", () => {
    expect((modelo.sxablonoj ?? []).map((entry) => entry.sxablono.name)).toEqual([
      "filtrilo",
      "formularo",
      "pagxo",
      "sxelo",
    ]);
  });

  it("formularo: problems (avizo) on top, fields (the form Eroj), actions with exactly one submit and one primary", () => {
    const formularo = named("formularo");
    expect(formularo?.sxablono.kind).toBe("flow");
    expect(
      formularo?.skemo.regions.map((region) => [
        region.name,
        region.required === true,
        region.accepts,
      ]),
    ).toEqual([
      ["problems", false, ["avizo"]],
      [
        "fields",
        true,
        [
          "kampo",
          "elektilo",
          "elekto",
          "markobutono",
          "sxaltilo",
          "tekstareo",
          "kompletigilo",
          "alsxutilo",
        ],
      ],
      ["actions", true, ["butono"]],
    ]);
    const actions = formularo?.skemo.regions.find((region) => region.name === "actions");
    expect(actions).toMatchObject({ primary: 1, one: { type: "submit" } });
    expect(formularo?.skemo.props.map((prop) => [prop.name, prop.kind])).toEqual([
      ["label", "string"],
    ]);
  });

  it("filtrilo: the landmark search with a name, fields that wrap, actions, a polite status", () => {
    const filtrilo = named("filtrilo");
    expect(filtrilo?.sxablono.kind).toBe("flow");
    expect(filtrilo?.skemo.regions.map((region) => region.name)).toEqual([
      "fields",
      "actions",
      "status",
    ]);
    expect(filtrilo?.skemo.regions.find((region) => region.name === "status")?.live).toBe("polite");
    expect(filtrilo?.skemo.a11y.landmarks).toEqual(["search"]);
    expect(filtrilo?.skemo.props.find((prop) => prop.name === "label")).toMatchObject({
      kind: "string",
      required: true,
    });
  });
});

describe("the alternatives that waited for a Sxablono (Spec 020 ② G1)", () => {
  it("dialogo.long-form sends to the formularo now, with a Jugxo", () => {
    const dialogo = modelo.eroj.find((entry) => entry.ero.name === "dialogo");
    const longForm = dialogo?.uzo?.instead.find((entry) => entry.goal === "long-form");
    expect(longForm?.ero).toBe("formularo");
    const jugxo = modelo.jugxoj.find(
      (entry) =>
        "ero" in entry.ref &&
        entry.ref.ero === dialogo?.ero.id &&
        (entry.context ?? "").includes("Spec 020 ②"),
    );
    expect(jugxo?.context).toContain("long-form");
  });

  it("the elektilo names the filtrilo as its filter bar", () => {
    const elektilo = modelo.eroj.find((entry) => entry.ero.name === "elektilo");
    const bar = elektilo?.uzo?.composes.containers.find((entry) => entry.name === "filter-bar");
    expect(bar?.kialo).toContain("filtrilo");
  });

  it("a Sxablono answers when its keyword is the first word: „Tabs, um zwischen Liste und Formular zu wechseln“ stays what it was", () => {
    // A tie of the langetaro (tabs) and the elektilo (liste), a person decides (Nachlese 3 G2) —
    // the formular in its head names no formularo.
    const tabs = suggestEro(modelo, { goal: "Tabs, um zwischen Liste und Formular zu wechseln" });
    if (!tabs.ok) throw new Error("suggest_ero failed");
    expect(tabs.output.action).toBe("ask-human");
    expect(tabs.output.suggestion).toBeNull();
    const form = suggestEro(modelo, { goal: "Ein Formular für die Anmeldung mit Token." });
    if (!form.ok) throw new Error("suggest_ero failed");
    expect(form.output.suggestion).toEqual({ sxablono: "formularo", props: {} });
  });
});
