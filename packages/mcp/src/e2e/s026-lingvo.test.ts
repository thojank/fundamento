// Spec 026 ② (Lingvo-Schalter): with lingvo the Gvidanto names the display name beside the name —
// `label` beside `name` in suggest_ero, get_ero, get_sxablono, list_eroj and list_sxablonoj —,
// within the output schemas; without lingvo every answer stays as it was. „Schieberegler“ hits the
// glitilo through its keywords.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

let client: Connected["client"];
beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("lingvo names the display name (Spec 026 ②)", () => {
  it("suggest_ero „Schieberegler“ with lingvo de: glitilo with the label Schieberegler; without lingvo glitilo without label", async () => {
    type Answer = { suggestion: { ero?: string; label?: string } | null };
    const deutsch = await output<Answer>(client, "suggest_ero", {
      goal: "Schieberegler",
      lingvo: "de",
    });
    expect(deutsch.suggestion).toEqual(
      expect.objectContaining({ ero: "glitilo", label: "Schieberegler" }),
    );
    const plain = await output<Answer>(client, "suggest_ero", { goal: "Schieberegler" });
    expect(plain.suggestion?.ero).toBe("glitilo");
    expect(plain.suggestion).not.toHaveProperty("label");
  });

  it("get_ero and get_sxablono name the label with lingvo de and en", async () => {
    const ero = await output<{ ero: { name: string; label?: string } }>(client, "get_ero", {
      name: "glitilo",
      lingvo: "de",
    });
    expect(ero.ero).toEqual(expect.objectContaining({ name: "glitilo", label: "Schieberegler" }));
    const sxelo = await output<{ sxablono: { name: string; label?: string } }>(
      client,
      "get_sxablono",
      { name: "sxelo", lingvo: "en" },
    );
    expect(sxelo.sxablono).toEqual(expect.objectContaining({ name: "sxelo", label: "App shell" }));
  });

  it("list_eroj and list_sxablonoj take lingvo and name every label", async () => {
    const eroj = await output<{ eroj: { name: string; label?: string }[] }>(client, "list_eroj", {
      lingvo: "de",
    });
    expect(eroj.eroj).toHaveLength(40);
    expect(eroj.eroj.every((entry) => (entry.label ?? "") !== "")).toBe(true);
    expect(eroj.eroj.find((entry) => entry.name === "butono")?.label).toBe("Schaltfläche");
    const plain = await output<{ eroj: { name: string; label?: string }[] }>(
      client,
      "list_eroj",
      {},
    );
    expect(plain.eroj.some((entry) => "label" in entry)).toBe(false);
    const sxablonoj = await output<{ sxablonoj: { name: string; label?: string }[] }>(
      client,
      "list_sxablonoj",
      { lingvo: "en" },
    );
    expect(sxablonoj.sxablonoj.find((entry) => entry.name === "formularo")?.label).toBe("Form");
  });
});
