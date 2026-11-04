// Spec 036 Teil 2b (QA run 1, API issue 1): a very saturated Zweitfarbe breaks `palette-aligned`, and
// the Agordilo's suggestion names a darker Zweitfarbe as `apply.zweitfarbe` (S36-2.3). The answers of
// preview_agordo and propose_agordo must still match their declared output schemas – a validating
// client would otherwise reject the very answer that names the fix. `call` validates every answer.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Connected, call, closeClients, connect, preload } from "../test-doubles/client.js";

afterAll(closeClients);
preload();

const KIESELWEG = { name: "kieselweg", leitfarbe: "#375479", zweitfarbe: { farbe: "#ff00ff" } };

type Violation = { rule: string; apply?: { zweitfarbe?: { farbe?: string } } };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect());
}, 120_000);

describe("Spec 036 Teil 2b: the Zweitfarbe suggestion matches the output schemas", () => {
  it("preview_agordo: a saturated Zweitfarbe gives a suggestion with apply.zweitfarbe, valid by its schema", async () => {
    const result = await call(client, "preview_agordo", { agordo: KIESELWEG });
    expect(result.isError).toBeFalsy();
    const violations = (result.structuredContent as { violations: Violation[] }).violations;
    const farbe = violations.find((entry) => entry.apply?.zweitfarbe !== undefined)?.apply
      ?.zweitfarbe?.farbe;
    expect(farbe).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("preview_agordo: a Zweitfarbe found in material keeps its origin in the suggestion, valid by its schema", async () => {
    const herkunft = { quelle: "bild", datei: "kiesel.png", merkmal: "Farbe #ff00ff", anteil: 20 };
    const result = await call(client, "preview_agordo", {
      agordo: { ...KIESELWEG, zweitfarbe: { farbe: "#ff00ff", herkunft } },
    });
    const violations = (result.structuredContent as { violations: Violation[] }).violations;
    expect(violations.some((entry) => entry.apply?.zweitfarbe !== undefined)).toBe(true);
  });

  it("propose_agordo: the same Agordo with a wish answers within its schema", async () => {
    const result = await call(client, "propose_agordo", {
      agordo: KIESELWEG,
      wunsch: "runder",
    });
    expect(result.isError).toBeFalsy();
    const violations = (result.structuredContent as { violations?: Violation[] }).violations ?? [];
    expect(violations.some((entry) => entry.apply?.zweitfarbe !== undefined)).toBe(true);
  });
});
