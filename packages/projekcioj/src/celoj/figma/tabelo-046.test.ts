// Spec 046 T5 (F-T3-3, F-T3-6) in Figma: the tabelo's new props selectable, loading and
// sticky-header are BOOLEAN properties of its set, no axis – the set draws the table as before. The
// skeleton stands with loading only, so it has no node and names the Jugxo of parts a property value
// shows (FIGMA_NOT_DRAWN, check:parity: parity-part-not-drawn instead of a difference). The five
// new Eroj stay out of the plan: no existing Bauform draws them (plan.md, Befunde Etappe F).

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { FIGMA_NOT_DRAWN, figmaPlanInventory } from "./figma.js";
import { plan } from "./plugin-test-helpers.js";

const JUGXO = "jug_01M6A2EXBGT5473CTBGY1WRV5E";
const set = plan.components.find((candidate) => candidate.set === "tabelo");
const { modelo } = loadModelo(defaultModeloSource());

describe("Spec 046 T5: the tabelo's new props in Figma", () => {
  it("selectable, loading and sticky-header are BOOLEAN properties, no axis of the variants", () => {
    expect(set?.properties).toMatchObject({
      selectable: "BOOLEAN",
      loading: "BOOLEAN",
      "sticky-header": "BOOLEAN",
    });
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["density", "state"]);
  });

  it("tabelo:skeleton has no node and names the Jugxo of parts a property value shows; its wording names the skeleton", () => {
    expect(FIGMA_NOT_DRAWN["tabelo:skeleton"]).toBe(JUGXO);
    const kialo = (modelo?.jugxoj ?? []).find((candidate) => candidate.id === JUGXO)?.kialo;
    expect(kialo).toContain("Teil skeleton bei loading");
    for (const variant of set?.variants ?? []) {
      expect(variant.notDrawn, JSON.stringify(variant.props)).toMatchObject({
        "skeleton.fill": JUGXO,
        "skeleton.height": JUGXO,
        "skeleton.radius": JUGXO,
      });
    }
  });

  it("the parity inventory releases every value of the skeleton by the Jugxo", () => {
    const values = figmaPlanInventory(plan).tabelo?.values ?? {};
    const skeleton = Object.entries(values).filter(([key]) => key.startsWith("skeleton."));
    // Three properties in density × state (3 × 3).
    expect(skeleton).toHaveLength(27);
    for (const [key, value] of skeleton) expect(value, key).toBe(`not drawn (${JUGXO})`);
  });

  it("Nachbesserung F-T5-1: tabelo:selection, the target of the selection's boxes, has no node and is released by the same Jugxo, which names it", () => {
    expect(FIGMA_NOT_DRAWN["tabelo:selection"]).toBe(JUGXO);
    const kialo = (modelo?.jugxoj ?? []).find((candidate) => candidate.id === JUGXO)?.kialo;
    expect(kialo).toContain("Teil selection bei selectable");
    const values = figmaPlanInventory(plan).tabelo?.values ?? {};
    const selection = Object.entries(values).filter(([key]) => key.startsWith("selection."));
    // Two properties in density × state (3 × 3).
    expect(selection).toHaveLength(18);
    for (const [key, value] of selection) expect(value, key).toBe(`not drawn (${JUGXO})`);
  });

  it("the five new Eroj stay out of the plan (Befund Etappe F)", () => {
    const sets = plan.components.map((component) => component.set);
    for (const ero of ["vico", "kolumno", "stako", "krado", "templinio"]) {
      expect(sets, ero).not.toContain(ero);
    }
  });

  it("Nachtrag D-43: the plan leaves out exactly the five Eroj the parity check releases until Etappe F", () => {
    // When Etappe F builds a set, this fails: remove the Ero's entry of FIGMA_EROJ_NOT_DRAWN
    // (modelo/src/checks/parity/index.ts), and with the last one the option and the Jugxo.
    const sets = new Set(plan.components.map((component) => component.set));
    const left = (modelo?.eroj ?? [])
      .map((entry) => entry.ero.name)
      .filter((ero) => !sets.has(ero));
    expect(left.sort()).toEqual(["kolumno", "krado", "stako", "templinio", "vico"]);
  });
});
