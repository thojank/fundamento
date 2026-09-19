// Resources and the HTTP transport (Spec 001, D-13, contracts/mcp-tools.md; task T026).

import { readFileSync } from "node:fs";
import { request } from "node:http";
import {
  Client,
  StreamableHTTPClientTransport,
  type Transport,
} from "@modelcontextprotocol/client";
import { afterAll, describe, expect, it } from "vitest";
import { startHttpServer } from "./http.js";
import { loadServed } from "./load.js";
import { TOOL_NAMES } from "./schemas.js";
import { closeClients, connect, EKZEMPLO_PACKAGE } from "./test-doubles/client.js";

afterAll(closeClients);

const DIST = new URL("../../modelo/dist/", import.meta.url).pathname;
const RESOURCES = [
  ["fundamento://export/modelo.json", "modelo.json"],
  ["fundamento://export/modelo.schema.json", "modelo.schema.json"],
  ["fundamento://export/rezolvoj.json", "rezolvoj.json"],
] as const;

describe("resources", async () => {
  const { client } = await connect();

  it("lists the three export files and the Ontologio as JSON", async () => {
    const { resources } = await client.listResources();
    expect(resources.map((resource) => [resource.uri, resource.mimeType])).toEqual([
      ...RESOURCES.map(([uri]) => [uri, "application/json"]),
      ["fundamento://ontologio.json", "application/json"],
    ]);
  });

  it("serves the bytes of data/ontologio.json (Spec 002 FR-17)", async () => {
    const { contents } = await client.readResource({ uri: "fundamento://ontologio.json" });
    expect((contents[0] as { text?: string }).text).toBe(
      readFileSync(new URL("../../modelo/data/ontologio.json", import.meta.url), "utf8"),
    );
  });

  it.each(RESOURCES)("%s has the bytes of `fm modelo export` (%s)", async (uri, file) => {
    const { contents } = await client.readResource({ uri });
    expect(contents).toHaveLength(1);
    expect(contents[0]?.mimeType).toBe("application/json");
    expect((contents[0] as { text?: string }).text).toBe(readFileSync(`${DIST}${file}`, "utf8"));
  });

  it("rejects an unknown resource", async () => {
    await expect(client.readResource({ uri: "fundamento://export/nenio.json" })).rejects.toThrow(
      /nenio/,
    );
  });
});

function rawPost(port: number, headers: Record<string, string>) {
  return new Promise<number>((resolve, reject) => {
    const call = request(
      {
        host: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          ...headers,
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode ?? 0);
      },
    );
    call.on("error", reject);
    call.end(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }));
  });
}

describe("the HTTP transport", async () => {
  const http = await startHttpServer(loadServed(), { port: 0 });
  const client = new Client({ name: "test", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(http.url)) as Transport);
  afterAll(async () => {
    await client.close();
    await http.close();
  });

  it("binds to 127.0.0.1 only", () => {
    expect(http.address).toBe("127.0.0.1");
    expect(http.url).toBe(`http://127.0.0.1:${http.port}/mcp`);
  });

  it("serves the tools", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(TOOL_NAMES.length);
    const described = await client.callTool({ name: "describe", arguments: {} });
    expect(described.isError).toBeFalsy();
  });

  it("rejects validate.aspektoPath with mcp-input-invalid", async () => {
    const result = (await client.callTool({
      name: "validate",
      arguments: { aspektoPath: EKZEMPLO_PACKAGE },
    })) as { isError?: boolean; structuredContent?: { issues: { rule: string }[] } };
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.issues[0]?.rule).toBe("mcp-input-invalid");
    const served = await client.callTool({ name: "validate", arguments: {} });
    expect(served.isError).toBeFalsy();
  });

  it("rejects foreign Host and Origin headers (DNS rebinding)", async () => {
    expect(await rawPost(http.port, { host: "evil.example" })).toBe(403);
    expect(await rawPost(http.port, { host: `evil.example:${http.port}` })).toBe(403);
    expect(
      await rawPost(http.port, { host: `127.0.0.1:${http.port}`, origin: "https://evil.example" }),
    ).toBe(403);
    expect(await rawPost(http.port, { host: `localhost:${http.port}` })).toBe(200);
  });
});
