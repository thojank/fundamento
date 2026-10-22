// Spec 025 ② (section ②, plan ② D-10–D-13): what the round adds beside the datelektilo — the
// kampo's boundary date-range is closed (use-instead datelektilo, as file was closed by the
// alsxutilo in Spec 015 ②) and its instead entry near-date sends a date near today to the
// calendar (G2); the Ikonaro grows by calendar (G1: +6 names at most in the round, three used);
// the flipped dialog of Spec 011 ① („Zeitraum von bis“) carries a Jugxo (OP-12); the Ontologio
// knows the Datelektilo; the German words stand in tradukoj. Arkitekturo contract: nothing of the
// kampo is renamed, every prop and part of 0.2.0 stands.

import { describe, expect, it } from "vitest";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { readOntologio } from "../ontologio/check.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const kampo = eroNamed("kampo");
if (kampo === undefined) throw new Error("kampo missing");
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("the kampo of Spec 025 ②: the date range goes to the datelektilo (Arkitekturo contract)", () => {
  it("keeps every prop and part of 0.2.0 and of ① by name", () => {
    expect(kampo.skemo.props.map((prop) => prop.name)).toEqual([
      "kind",
      "value",
      "placeholder",
      "required",
      "disabled",
      "readonly",
      "invalid",
      "size",
      "name",
      "min",
      "max",
      "autocomplete",
      "stepper",
      "step",
    ]);
    expect(Object.keys(kampo.skemo.parts)).toContain("decrement");
    expect(kampo.skemo.props.find((prop) => prop.name === "kind")?.values).toContain("date");
  });

  it("the boundary date-range is closed: use-instead datelektilo with a kialo that names the calendar (G2; a near date is the datelektilo's by its goal, the kampo's brief has no room for another alternative)", () => {
    const range = kampo.uzo?.boundary.find((entry) => entry.case === "date-range");
    expect(range).toMatchObject({
      action: "use-instead",
      ero: "datelektilo",
      keywords: { en: ["period", "range"], de: ["zeitraum", "datumsbereich"] },
    });
    expect(range?.kialo).toMatch(/because/);
    expect(range?.kialo).toMatch(/datelektilo/);
    expect(kampo.uzo?.instead.map((entry) => entry.goal)).toEqual([
      "multi-line",
      "choose-many",
      "choose-few",
      "toggle",
      "suggestions",
      "approximate",
      "single-value",
    ]);
    expect(kampo.uzo?.composes.with.map((entry) => entry.ero)).toEqual([
      "kampo",
      "butono",
      "glitilo",
      "datelektilo",
    ]);
    // The goal date keeps its words and takes the birthday, so „Geburtsdatum“ answers kind date.
    expect(kampo.skemo.goals?.find((goal) => goal.goal === "date")?.keywords).toEqual({
      en: ["date", "expiry", "deadline", "birthday"],
      de: ["datum", "ablaufdatum", "frist", "geburtsdatum"],
    });
  });

  it("the flipped dialog of Spec 011 ① carries a Jugxo (OP-12): „Zeitraum von bis“ is the datelektilo with mode range now, the kampo's boundary beside it", () => {
    const answer = suggest("Zeitraum von bis");
    expect(answer.suggestion).toEqual({ ero: "datelektilo", props: { mode: "range" } });
    expect(answer.boundary).toMatchObject({
      ero: "kampo",
      case: "date-range",
      action: "use-instead",
    });
    const jugxo = modelo.jugxoj.find(
      (entry) =>
        "ero" in entry.ref &&
        entry.ref.ero === kampo.ero.id &&
        entry.context?.includes("Zeitraum von bis"),
    );
    expect(jugxo?.decision).toBe("approved");
    expect(jugxo?.context).toContain("Spec 025 ②");
    expect(jugxo?.kialo).toMatch(/datelektilo/);
  });
});

describe("the Ikonaro of Spec 025 ② (G1: calendar)", () => {
  it("names calendar, not mirrored; the ikono knows the name; the datelektilo composes the ikono; twenty names", () => {
    const calendar = modelo.ikonaro.find((ikono) => ikono.name === "calendar");
    expect(calendar).toMatchObject({
      name: "calendar",
      meaning: { de: "Kalender: ein Datum wählen", en: "Calendar: pick a date" },
    });
    expect(calendar?.mirror).not.toBe(true);
    expect(calendar?.kialo).toMatch(/because/);
    expect(modelo.ikonaro.length).toBeGreaterThanOrEqual(20);
    const ikono = eroNamed("ikono");
    expect(ikono?.skemo.props.find((prop) => prop.name === "name")?.values).toContain("calendar");
    expect(ikono?.uzo?.composes.with.map((entry) => entry.ero)).toContain("datelektilo");
  });
});

describe("the Ontologio and the translations of Spec 025 ②", () => {
  it("the Ontologio knows the Datelektilo beside the Kampo; the kampo's new kialoj and the datelektilo's Uzo have German words", () => {
    const ontologio = readOntologio() as {
      concepts: {
        term: string;
        prefLabel: Record<string, string>;
        relations?: { predicate: string; target: string }[];
      }[];
    };
    const concept = ontologio.concepts.find((entry) => entry.term === "Datelektilo");
    expect(concept?.prefLabel).toEqual({
      eo: "Datelektilo",
      en: "date picker",
      de: "Datumsauswahl",
    });
    expect(concept?.relations?.map((relation) => relation.target)).toEqual(
      expect.arrayContaining(["#Kampo", "#Butono", "#Ikono"]),
    );
    const kampoConcept = ontologio.concepts.find((entry) => entry.term === "Kampo");
    expect(kampoConcept?.relations?.map((relation) => relation.target)).toContain("#Datelektilo");
    const de = modelo.tradukoj?.de ?? {};
    const datelektilo = eroNamed("datelektilo");
    const uzoId = datelektilo?.uzo?.id ?? "?";
    for (const key of [
      `${uzoId}/purpose`,
      `${uzoId}/instead/birthday/kialo`,
      `${uzoId}/boundary/time-of-day/kialo`,
      `${uzoId}/boundary/multiple-months/kialo`,
      `${uzoId}/boundary/presets/kialo`,
      `${uzoId}/composes/with/kampo/kialo`,
      `${kampo.uzo?.id}/boundary/date-range/kialo`,
      `${kampo.uzo?.id}/composes/with/datelektilo/kialo`,
    ]) {
      expect(de[key], key).toBeDefined();
      if (!key.endsWith("/purpose")) expect(de[key], key).toMatch(/\bweil\b/);
    }
  });
});
