// The server core and the read tools (Spec 001, D-13, contracts/mcp-tools.md; task T024), driven
// in-process through the SDK client over an in-memory transport.

import { describeModelo } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import {
  call,
  closeClients,
  connect,
  EKZEMPLO_CONFIG as EKZEMPLO,
  INCOMPLETE_CONFIG as INCOMPLETE,
  toolSchemas as schemas,
} from "./test-doubles/client.js";

afterAll(closeClients);

describe("the repo server", async () => {
  const { client, served } = await connect();

  it("lists the read-only tools with input and output schemas", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual([...schemas.keys()]);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
      expect(tool.outputSchema, tool.name).toBeDefined();
      expect(tool.description, tool.name).toBeTruthy();
    }
  });

  it("lists self-contained schemas that a client can use without fetching anything", async () => {
    const { tools } = await client.listTools();
    const wire = JSON.stringify(tools);
    expect(wire).not.toContain("https://");
    expect(wire).not.toContain("$schema");
  });

  it("describe answers 'what is here?' from the export", async () => {
    const { structuredContent } = await call(client, "describe");
    expect(structuredContent?.sentence).toBe(describeModelo(served.modeloJson).sentence);
    expect(structuredContent?.validation).toEqual({ errors: 0, warnings: 0 });
  });

  it("list_dimensioj names six Dimensioj with values, defaults and sets", async () => {
    const { structuredContent } = await call(client, "list_dimensioj");
    const dimensioj = structuredContent?.dimensioj as {
      name: string;
      valoroj: { name: string; sets: string[] }[];
    }[];
    expect(dimensioj.map((dimensio) => dimensio.name)).toEqual([
      "aspekto",
      "viewport",
      "density",
      "color-scheme",
      "contrast",
      "motion",
    ]);
    const dark = dimensioj[3]?.valoroj.find((valoro) => valoro.name === "dark");
    expect(dark?.sets).toContain("color-scheme/dark");
    expect(dark?.sets).toContain("aspekto/komuna+color-scheme/dark");
  });

  it("search_tokens matches whole prefix segments, filters and pages", async () => {
    const action = (await call(client, "search_tokens", { prefix: "color.action" }))
      .structuredContent;
    const tokens = action?.tokens as { name: string }[];
    expect(action?.total).toBe(22); // 3 variants × 6 + danger × 4 (Spec 003 T003)
    expect(tokens.every((token) => token.name.startsWith("color.action."))).toBe(true);
    expect(
      (await call(client, "search_tokens", { prefix: "color.actio" })).structuredContent?.total,
    ).toBe(0);
    const page = (
      await call(client, "search_tokens", { prefix: "color.action", limit: 5, offset: 19 })
    ).structuredContent;
    expect(((page?.tokens ?? []) as unknown[]).length).toBe(3);
    const roles = (await call(client, "search_tokens", { type: "color", role: "focus" }))
      .structuredContent;
    expect(((roles?.tokens ?? []) as { name: string }[]).map((token) => token.name)).toEqual([
      "color.focus.ring",
    ]);
    const text = (await call(client, "search_tokens", { text: "KICKER" })).structuredContent;
    expect(((text?.tokens ?? []) as { name: string }[]).map((token) => token.name)).toContain(
      "typography.kicker",
    );
  });

  it("get_token returns the core definition and every override", async () => {
    const { structuredContent } = await call(client, "get_token", { name: "color.text.default" });
    expect(structuredContent?.definition).toEqual({
      set: "core",
      value: "{color.palette.neutral.900}",
    });
    const overrides = structuredContent?.overrides as { set: string }[];
    expect(overrides.map((override) => override.set)).toContain("color-scheme/dark");
    const byId = await call(client, "get_token", { id: structuredContent?.id as string });
    expect(byId.structuredContent?.name).toBe("color.text.default");
    const kicker = await call(client, "get_token", { name: "typography.kicker" });
    expect(kicker.structuredContent?.textTransform).toBe("uppercase");
  });

  it("get_token answers an unknown name with token-unknown and the nearest names", async () => {
    const result = await call(client, "get_token", { name: "color.text.defualt" });
    expect(result.isError).toBe(true);
    const envelope = result.structuredContent as { issues: { rule: string }[]; allowed: string[] };
    expect(envelope.issues[0]?.rule).toBe("token-unknown");
    expect(envelope.allowed[0]).toBe("color.text.default");
  });

  it("rejects an input outside the tool's schema with mcp-input-invalid", async () => {
    const result = await call(client, "describe", { verbose: true });
    expect(result.isError).toBe(true);
    expect((result.structuredContent as { issues: { rule: string }[] }).issues[0]?.rule).toBe(
      "mcp-input-invalid",
    );
  });
});

describe("a project server (core + komuna + ekzemplo)", async () => {
  const { client } = await connect({ config: EKZEMPLO });

  it("list_aspektoj describes both Aspektoj with package, namespace and sets", async () => {
    const aspektoj = (await call(client, "list_aspektoj")).structuredContent?.aspektoj as Record<
      string,
      unknown
    >[];
    expect(
      aspektoj.map((aspekto) => [
        aspekto.name,
        aspekto.reference,
        aspekto.external,
        aspekto.idNamespace,
      ]),
    ).toEqual([
      ["komuna", true, false, undefined],
      ["ekzemplo", false, true, "ekz"],
    ]);
    expect(aspektoj[1]?.sets).toContain("aspekto/ekzemplo+color-scheme/dark");
  });
});

describe("a server over an invalid Modelo", async () => {
  const { client } = await connect({ config: INCOMPLETE });

  it("starts and reports the errors in describe", async () => {
    const { structuredContent } = await call(client, "describe");
    expect(structuredContent?.validation).toEqual({ errors: 4, warnings: 0 });
  });
});
