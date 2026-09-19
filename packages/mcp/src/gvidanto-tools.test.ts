// The Gvidanto tools of Spec 002 over the in-memory client (contracts/mcp-tools.md §2): each
// answer equals the modelo function behind it, and errors come as issue envelopes.

import { checkContrast, describeTerm, explain, explainRegulo } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { call, closeClients, connect, EKZEMPLO_CONFIG, output } from "./test-doubles/client.js";

afterAll(closeClients);

describe("check_contrast (FR-09)", () => {
  it("returns what checkContrast computes for the served Modelo", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const input = {
      foreground: "color.status.warning.basic",
      background: "color.background.default",
    };
    const answer = await output(client, "check_contrast", input);
    const direct = checkContrast(served.modelo, input);
    if (!direct.ok) throw new Error("direct call failed");
    expect(answer).toEqual(direct.output);
  });

  it("answers an unknown token with token-unknown and the nearest names", async () => {
    const { client } = await connect();
    const result = await call(client, "check_contrast", {
      foreground: "color.text.mutd",
      background: "color.background.default",
    });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toContain("color.text.muted");
  });
});

describe("explain (FR-10)", () => {
  it("returns what explain computes for the served Modelo and its report", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const input = { token: "color.status.warning.border", assignment: { aspekto: "ekzemplo" } };
    const answer = await output(client, "explain", input);
    const direct = explain(served.modelo, input, served.report);
    if (!direct.ok) throw new Error("direct call failed");
    expect(answer).toEqual(JSON.parse(JSON.stringify(direct.output)));
  });
});

describe("explain_regulo (FR-11)", () => {
  it("returns what explainRegulo computes, by name and by ID", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const answer = await output(client, "explain_regulo", { name: "state-distinct" });
    const direct = explainRegulo(served.modelo, { name: "state-distinct" }, served.report);
    if (!direct.ok) throw new Error("direct call failed");
    expect(answer).toEqual(JSON.parse(JSON.stringify(direct.output)));
    const byId = await output(client, "explain_regulo", { id: direct.output.id });
    expect(byId).toEqual(answer);
  });

  it("answers an unknown Regulo with regulo-unknown", async () => {
    const { client } = await connect();
    const result = await call(client, "explain_regulo", { name: "state-distinkt" });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toContain("state-distinct");
  });
});

describe("describe_term (FR-12)", () => {
  it("returns what describeTerm computes, found through a German label", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const answer = await output(client, "describe_term", { term: "Marke" });
    const direct = describeTerm(served.modelo, { term: "Marke" });
    if (!direct.ok) throw new Error("direct call failed");
    expect(answer).toEqual(JSON.parse(JSON.stringify(direct.output)));
    expect(answer).toMatchObject({ term: "Aspekto", matchedBy: "altLabel" });
  });

  it("answers an unknown term with term-unknown", async () => {
    const { client } = await connect();
    const result = await call(client, "describe_term", { term: "Aspektoo" });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toContain("Aspekto");
  });
});
