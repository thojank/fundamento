// The HTTP transport (Spec 001, D-13): Streamable HTTP on 127.0.0.1 only, stateless (one server
// per request), with its own DNS-rebinding guard in front of the SDK transport: the Host header
// must name this loopback port, and an Origin, when sent, must be a loopback origin.

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import type { Transport } from "@modelcontextprotocol/server";
import type { Served } from "./load.js";
import { createFundamentoServer } from "./server.js";

export const HTTP_HOST = "127.0.0.1";
export const HTTP_PATH = "/mcp";
export const DEFAULT_HTTP_PORT = 7300;

export interface HttpServer {
  address: string;
  port: number;
  url: string;
  close(): Promise<void>;
}

const LOOPBACK_NAMES = [HTTP_HOST, "localhost"];

function allowedRequest(request: IncomingMessage, port: number): boolean {
  const hosts = LOOPBACK_NAMES.map((name) => `${name}:${port}`);
  if (!hosts.includes(request.headers.host ?? "")) return false;
  const origin = request.headers.origin;
  return origin === undefined || hosts.some((host) => origin === `http://${host}`);
}

function reject(response: ServerResponse, status: number, message: string): void {
  response
    .writeHead(status, { "content-type": "application/json" })
    .end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }));
}

export async function startHttpServer(
  served: Served,
  options: { port?: number } = {},
): Promise<HttpServer> {
  let port = options.port ?? DEFAULT_HTTP_PORT;
  const http = createServer((request, response) => {
    if (!allowedRequest(request, port)) {
      reject(response, 403, "Forbidden: this server answers loopback requests only.");
      return;
    }
    if (request.url !== HTTP_PATH) {
      reject(response, 404, `Not found: the MCP endpoint is ${HTTP_PATH}.`);
      return;
    }
    if (request.method !== "POST") {
      reject(response, 405, "Method not allowed: this stateless server takes POST only.");
      return;
    }
    const server = createFundamentoServer(served, { transport: "http" });
    // No sessionIdGenerator: stateless. The cast bridges the SDK's optional callbacks and
    // exactOptionalPropertyTypes.
    const transport = new NodeStreamableHTTPServerTransport({ enableJsonResponse: true });
    response.on("close", () => {
      void transport.close();
      void server.close();
    });
    server
      .connect(transport as Transport)
      .then(() => transport.handleRequest(request, response))
      .catch(() => {
        if (!response.headersSent) reject(response, 500, "Internal server error.");
      });
  });
  await new Promise<void>((resolve, fail) => {
    http.once("error", fail);
    http.listen(port, HTTP_HOST, () => resolve());
  });
  const address = http.address() as AddressInfo;
  port = address.port;
  return {
    address: address.address,
    port,
    url: `http://${HTTP_HOST}:${port}${HTTP_PATH}`,
    close: () =>
      new Promise<void>((resolve, fail) => {
        http.closeAllConnections();
        http.close((error) => (error ? fail(error) : resolve()));
      }),
  };
}
