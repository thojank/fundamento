// Spec 036 Teil 5 ②b-4 (Spec 029 abgleich.json, aspect "verhalten") in Figma: behaviour has no
// picture of its own; a part that only a property value shows has no node and names its Jugxo
// (FIGMA_NOT_DRAWN, check:parity); a boolean prop is a BOOLEAN of the set.

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { FIGMA_NOT_DRAWN } from "./figma.js";
import { plan } from "./plugin-test-helpers.js";

const setOf = (name: string) => {
  const set = plan.components.find((candidate) => candidate.set === name);
  if (set === undefined) throw new Error(`${name} missing in the plan`);
  return set;
};

const { modelo } = loadModelo(defaultModeloSource());
const jugxo = (id: string | undefined) =>
  (modelo?.jugxoj ?? []).find((candidate) => candidate.id === id);

describe("②b-4 A-spuro-6 in Figma: the collapsed middle", () => {
  it("spuro:more has no node and names the Jugxo of parts a property value shows", () => {
    const id = FIGMA_NOT_DRAWN["spuro:more"];
    expect(id).toBe("jug_01M6A2EXBGT5473CTBGY1WRV5E");
    expect(jugxo(id)).toMatchObject({ decision: "approved", ref: { celo: "figma" } });
    expect(jugxo(id)?.kialo).toContain("max-items");
  });

  it("max-items is a NUMBER of the set, no axis", () => {
    expect(setOf("spuro").properties["max-items"]).toBe("NUMBER");
  });
});
