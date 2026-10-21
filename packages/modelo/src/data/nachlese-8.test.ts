// Nachlese 8 ② (aus der Sammlung, N7-F-1 aus dem Bericht zu Nachlese 7 ②): The slot actions of the
// dialogo and the avizo took the butono with nesting 0, so check_usage reported every button
// there as uzo-slot-nesting — the place where a dialog's and a notice's buttons belong. Nesting 1
// with a Jugxo: a butono stands in actions.

import { describe, expect, it } from "vitest";
import { checkUsage } from "../gvidanto/check-usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const uzoOf = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.uzo;

describe("N7-F-1: the actions of the dialogo and the avizo take a butono", () => {
  it("the slot actions allows nesting 1 in both", () => {
    expect(uzoOf("dialogo")?.slots.actions?.nesting).toBe(1);
    expect(uzoOf("avizo")?.slots.actions?.nesting).toBe(1);
  });

  it("check_usage takes a butono in the actions of an avizo and of a dialogo without uzo-slot-nesting", () => {
    const result = checkUsage(modelo, {
      instances: [
        {
          ero: "avizo",
          props: { intent: "success" },
          label: "Gespeichert.",
          slots: { actions: [{ ero: "butono", props: { emphasis: "low" }, label: "Rückgängig" }] },
        },
        {
          ero: "dialogo",
          props: {},
          label: "Befund verwerfen?",
          slots: {
            heading: ["text"],
            actions: [
              { ero: "butono", props: { emphasis: "high" }, label: "Verwerfen" },
              { ero: "butono", props: { emphasis: "low" }, label: "Abbrechen" },
            ],
          },
        },
      ],
    });
    if (!result.ok) throw new Error(JSON.stringify(result.issues));
    const rules = result.output.violations.map((entry) => entry.issue.rule);
    expect(rules).not.toContain("uzo-slot-nesting");
  });
});
