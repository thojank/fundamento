// The Ero tools of Spec 003 over the in-memory client (contracts/mcp-tools.md §1–§3): each answer
// equals the Gvidanto function behind it, and invalid input comes as an issue envelope.

import { checkUsage, getEro, listEroj, suggestEro } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { call, closeClients, connect, EKZEMPLO_CONFIG, output } from "./test-doubles/client.js";

afterAll(closeClients);

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("list_eroj (FR-13)", () => {
  it("returns what listEroj computes for the served Modelo", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    expect(await output(client, "list_eroj")).toEqual(plain(listEroj(served.modelo)));
  });
});

describe("get_ero (FR-13)", () => {
  it("returns what getEro computes, by name and by ID", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = getEro(served.modelo, { name: "butono" });
    if (!direct.ok) throw new Error("direct call failed");
    const answer = await output(client, "get_ero", { name: "butono" });
    expect(answer).toEqual(plain(direct.output));
    expect(await output(client, "get_ero", { id: direct.output.ero.id })).toEqual(answer);
  });

  it("answers an unknown Ero with ero-unknown and the nearest names", async () => {
    const { client } = await connect();
    const result = await call(client, "get_ero", { name: "butonno" });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toEqual(["butono"]);
  });
});

describe("suggest_ero (FR-13)", () => {
  it("returns what suggestEro computes", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = suggestEro(served.modelo, { intent: "Löschen" });
    if (!direct.ok) throw new Error("direct call failed");
    expect(await output(client, "suggest_ero", { intent: "Löschen" })).toEqual(
      plain(direct.output),
    );
  });

  it("answers an unknown intent with intent-unknown and the known intents", async () => {
    const { client } = await connect();
    const result = await call(client, "suggest_ero", { intent: "hüpfen" });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toEqual(["destructive", "confirm", "dismiss"]);
  });
});

describe("check_usage (FR-13)", () => {
  const instances = [
    { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
    { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Weiter" },
  ];

  it("returns what checkUsage computes", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = checkUsage(served.modelo, { instances });
    if (!direct.ok) throw new Error("direct call failed");
    const answer = await output(client, "check_usage", { instances });
    expect(answer).toEqual(plain(direct.output));
    expect((answer as { violations: unknown[] }).violations).toHaveLength(1);
  });

  it("answers an unknown prop value with mcp-input-invalid and the allowed values", async () => {
    const { client } = await connect();
    const result = await call(client, "check_usage", {
      instances: [{ ero: "butono", props: { variant: "primar" }, label: "Speichern" }],
    });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toEqual(["primary", "secondary", "tertiary"]);
  });
});
