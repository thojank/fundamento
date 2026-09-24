// In-process client for the server tests: SDK client over an in-memory transport, every result
// checked against the tool's output schema or the error envelope.

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
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

/**
 * Ein Served-Modelo je Konfiguration. Das Laden kostet rund eine Sekunde, und mehrere Suiten einer
 * Datei brauchen dasselbe — geteilt wird nur gelesen, jede Verbindung bekommt ihren eigenen Server.
 */
const servedByOptions = new Map<string, ReturnType<typeof loadServed>>();

function servedFor(options: LoadOptions) {
  const key = JSON.stringify(options);
  const cached = servedByOptions.get(key);
  if (cached !== undefined) return cached;
  const served = loadServed(options);
  servedByOptions.set(key, served);
  return served;
}

/**
 * Lädt den Modelo, den eine Datei später braucht. Reines Rechnen ohne Leitung und ohne Server, also
 * zur Sammelzeit erlaubt — und danach kostet das `connect` im `beforeAll` nur noch den Handschlag
 * des In-Memory-Transports. Ohne das stünde eine Sekunde Ladearbeit im Hook, die unter Last in das
 * Zehn-Sekunden-Limit läuft; ein höheres Limit wäre die falsche Antwort darauf.
 */
export function preload(options: LoadOptions = {}) {
  return servedFor(options);
}

export async function connect(options: LoadOptions = {}) {
  const served = servedFor(options);
  const server = createFundamentoServer(served);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  clients.push(client);
  return { client, served };
}

/**
 * Was `connect` zurückgibt. Die Tests halten Client und Served in einem `let`, das ein `beforeAll`
 * füllt — dieser Typ erspart ihnen dafür den Import der SDK-Typen.
 */
export type Connected = Awaited<ReturnType<typeof connect>>;

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
