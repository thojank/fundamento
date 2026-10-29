// Spec 033 S1: the language model sets nothing past the rules. It calls tools; the Agordilo and the
// Reguloj decide. The tools move the sliders of the Agordilo (by a wish of the vocabulary or to a
// value inside the slider's range), set the lead and status colours, choose a webfont and the icon
// weight; there is no tool that writes a token value (festgelegt) or releases a step.

import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { ILOJ, Laborejo, vokiIlon } from "./iloj.js";

const bases = loadBases();

function laborejo() {
  let agordo = { name: "lumo", leitfarbe: "#2f6fdb" } as import("@fundamento/agordilo").Agordo;
  const applied: string[][] = [];
  const work = new Laborejo({
    bases,
    agordo: () => agordo,
    apliki: (next, facetoj) => {
      agordo = next;
      applied.push(facetoj);
    },
    probleme: () => [],
    kroniko: () => [],
    kontrolita: false,
  });
  return { work, applied, agordo: () => agordo };
}

const call = async (work: Laborejo, name: string, args: Record<string, unknown>) =>
  JSON.parse(await vokiIlon(work, name, args)) as Record<string, unknown>;

describe("the tools of the assistant (Spec 033 S1)", () => {
  it("offers exactly these tools, none that writes a token or releases a step", () => {
    expect(ILOJ.map((tool) => tool.name)).toEqual([
      "stato",
      "regler",
      "bewege",
      "setze_regler",
      "setze_farbe",
      "waehle_schrift",
      "waehle_ikono_gewicht",
      "pruefe",
    ]);
    for (const tool of ILOJ) {
      expect(tool.description?.length ?? 0, tool.name).toBeGreaterThan(20);
      expect(tool.inputSchema.type, tool.name).toBe("object");
    }
  });

  it("stato names every Faceto with its state and the completeness", async () => {
    const { work } = laborejo();
    const stato = await call(work, "stato", {});
    expect((stato.facetoj as unknown[]).length).toBe(12);
    expect(stato.prozent).toBe(0);
  });

  it("regler lists the sliders of a Faceto with range, standard and value", async () => {
    const { work } = laborejo();
    const result = await call(work, "regler", { faceto: "formo" });
    const paths = (result.regler as { path: string; min: number; max: number }[]).map(
      (r) => r.path,
    );
    expect(paths).toEqual(["form.radius", "form.rahmen"]);
  });

  it("bewege moves sliders by a wish of the vocabulary; a word it does not know moves nothing", async () => {
    const { work, applied } = laborejo();
    const result = await call(work, "bewege", { wunsch: "runder" });
    expect(result.bewegt).toEqual(
      expect.arrayContaining([expect.objectContaining({ regler: "form.radius" })]),
    );
    expect(applied.at(-1)).toContain("formo");
    const unknown = await call(work, "bewege", { wunsch: "glitzernder" });
    expect(unknown.bewegt).toEqual([]);
    expect(unknown.unbekannt).toEqual(["glitzernder"]);
  });

  it("setze_regler takes a value inside the range and refuses one outside it, and an unknown slider", async () => {
    const { work, agordo } = laborejo();
    expect((await call(work, "setze_regler", { regler: "raum.abstand", wert: 1.2 })).ok).toBe(true);
    expect(agordo().raum?.abstand).toBe(1.2);
    const outside = await call(work, "setze_regler", { regler: "raum.abstand", wert: 9 });
    expect(outside.ok).toBe(false);
    expect(String(outside.fehler)).toMatch(/zwischen/);
    expect(agordo().raum?.abstand).toBe(1.2);
    const unknown = await call(work, "setze_regler", { regler: "color.text.default", wert: 1 });
    expect(unknown.ok).toBe(false);
  });

  it("setze_farbe sets the lead or a status colour and refuses what is no colour", async () => {
    const { work, agordo } = laborejo();
    expect((await call(work, "setze_farbe", { rolle: "leitfarbe", farbe: "#d0602f" })).ok).toBe(
      true,
    );
    expect(agordo().leitfarbe).toBe("#d0602f");
    expect(
      (await call(work, "setze_farbe", { rolle: "danger", farbe: "oklch(0.55 0.2 25)" })).ok,
    ).toBe(true);
    expect(agordo().zusatzfarben?.danger).toBe("oklch(0.55 0.2 25)");
    expect((await call(work, "setze_farbe", { rolle: "leitfarbe", farbe: "warmes Rot" })).ok).toBe(
      false,
    );
    expect((await call(work, "setze_farbe", { rolle: "text", farbe: "#000000" })).ok).toBe(false);
  });

  it("waehle_schrift takes a webfont of the catalogue by name, else names candidates and changes nothing", async () => {
    const { work, agordo } = laborejo();
    const chosen = await call(work, "waehle_schrift", { rolle: "body", suche: "Inter" });
    expect(chosen.ok).toBe(true);
    expect(JSON.stringify(agordo().schriften)).toContain("Inter");
    const vague = await call(work, "waehle_schrift", { rolle: "display", suche: "Serif" });
    expect(vague.ok).toBe(false);
    expect((vague.kandidaten as unknown[]).length).toBeGreaterThan(0);
  });

  it("waehle_ikono_gewicht takes one of the Phosphor weights only", async () => {
    const { work, agordo } = laborejo();
    expect((await call(work, "waehle_ikono_gewicht", { gewicht: "bold" })).ok).toBe(true);
    expect(agordo().ikono?.gewicht).toBe("bold");
    expect((await call(work, "waehle_ikono_gewicht", { gewicht: "huge" })).ok).toBe(false);
  });

  it("an unknown tool is an error the model reads, never an exception", async () => {
    const { work } = laborejo();
    const result = await call(work, "setze_token", { token: "color.text.default", wert: "#000" });
    expect(result.ok).toBe(false);
  });
});
