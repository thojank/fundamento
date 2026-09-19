// In-process client for the server tests: SDK client over an in-memory transport, every result
// checked against the tool's output schema or the error envelope.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { expect } from "vitest";
import { type LoadOptions, loadServed } from "../load.js";
import { compileToolSchemas } from "../schemas.js";
import { createFundamentoServer } from "../server.js";

const FIXTURES = new URL("../../../modelo/test/fixtures/", import.meta.url).pathname;
export const EKZEMPLO_CONFIG = `${FIXTURES}valid/aspekto-ekzemplo/fundamento.config.json`;
export const EKZEMPLO_PACKAGE = `${FIXTURES}valid/aspekto-ekzemplo/aspekto-ekzemplo`;
export const INCOMPLETE_CONFIG = `${FIXTURES}invalid/aspekto-incomplete/fundamento.config.json`;

export const toolSchemas = new Map(compileToolSchemas().map((tool) => [tool.name, tool]));
const clients: Client[] = [];

export async function connect(options: LoadOptions = {}) {
  const served = loadServed(options);
  const server = createFundamentoServer(served);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  clients.push(client);
  return { client, served };
}

export async function closeClients(): Promise<void> {
  for (const client of clients.splice(0)) await client.close();
}

export type CallResult = {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  content: unknown[];
};

export async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = (await client.callTool({ name, arguments: args })) as CallResult;
  const tool = toolSchemas.get(name as never);
  const schema = result.isError ? tool?.error : tool?.output;
  expect(schema?.validate(result.structuredContent), JSON.stringify(schema?.validate.errors)).toBe(
    true,
  );
  return result;
}

/** The structured output of a call, or the error envelope. */
export async function output<T = Record<string, unknown>>(
  client: Client,
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  return (await call(client, name, args)).structuredContent as T;
}
