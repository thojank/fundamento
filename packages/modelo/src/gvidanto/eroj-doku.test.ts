// Spec 036 Teil 5 ③ (Spec 029 ③: „Der Gvidanto liefert die neuen Felder aus“): get_ero states the
// documentation fields of the Uzo – when-not, do-dont, keyboard – in the full answer, in the
// language asked for, and leaves out a field that still holds the placeholder. The brief stays
// as it is: the kampo's brief is 747 of 750 (ceil(bytes / 3)), so nothing of ③ fits in it.

import { describe, expect, it } from "vitest";
import { DOKU_KAMPOJ } from "../eroj/dokumentaro.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { getEro } from "./eroj.js";

function loaded(source: Parameters<typeof loadModelo>[0]) {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error("the Modelo does not load");
  return modelo;
}

const plena = loaded(fixtureModeloSource(fixtureRoot("valid", "dokumentaro-plena")));

describe("get_ero: the documentation fields (Spec 036 ③)", () => {
  it("states when-not, do-dont and keyboard in English by default", () => {
    const answer = getEro(plena, { name: "butono" });
    if (!answer.ok) throw new Error("get_ero failed");
    expect(answer.output.uzo?.["when-not"]).toEqual([
      { case: "Whoever moves to another view follows a link.", ero: "ligilo" },
    ]);
    expect(answer.output.uzo?.["do-dont"]).toEqual({
      do: ["The label names the action."],
      dont: ["Two equally strong actions side by side."],
    });
    expect(answer.output.uzo?.keyboard).toEqual([
      { keys: ["Enter", "Space"], action: "Starts the action." },
    ]);
  });

  it("states them in German with lingvo de", () => {
    const answer = getEro(plena, { name: "butono", lingvo: "de" });
    if (!answer.ok) throw new Error("get_ero failed");
    expect(answer.output.uzo?.["when-not"]).toEqual([
      { case: "Wer zu einer anderen Ansicht wechseln will, folgt einem Verweis.", ero: "ligilo" },
    ]);
    expect(answer.output.uzo?.["do-dont"]?.do).toEqual(["Die Beschriftung nennt die Handlung."]);
    expect(answer.output.uzo?.keyboard).toEqual([
      { keys: ["Enter", "Space"], action: "Löst die Handlung aus." },
    ]);
  });

  it("keeps the brief without them (the kampo's brief is at its ceiling)", () => {
    const brief = getEro(plena, { name: "butono", brief: true });
    if (!brief.ok) throw new Error("get_ero brief failed");
    for (const field of DOKU_KAMPOJ) expect(brief.output).not.toHaveProperty(field);
  });

  it("leaves out a field that still holds the placeholder (the repo before S36-4.8)", () => {
    const modelo = loaded(defaultModeloSource());
    for (const entry of modelo.eroj) {
      const answer = getEro(modelo, { name: entry.ero.name });
      if (!answer.ok) throw new Error(`get_ero ${entry.ero.name} failed`);
      const uzo = entry.uzo as unknown as Record<string, unknown> | undefined;
      for (const field of DOKU_KAMPOJ) {
        const value = uzo?.[field];
        const open = typeof value === "object" && value !== null && "offen" in value;
        if (open || value === undefined) expect(answer.output.uzo).not.toHaveProperty(field);
        else expect(answer.output.uzo).toHaveProperty(field);
      }
    }
  });
});
