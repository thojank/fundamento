// The HTTP server itself (Spec 006): where it listens, how long it keeps an idle connection and
// whether it lets its process end. The MCP conversation over this transport is tested in
// resources-http.test.ts.

import { connect } from "node:net";
import { networkInterfaces } from "node:os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type HttpServer, startHttpServer } from "./http.js";
import { loadServed } from "./load.js";

/** The first IPv4 address of this machine that is not loopback. */
function nonLoopbackAddress(): string | undefined {
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) return entry.address;
    }
  }
  return undefined;
}

/** Resolves with the error code of a TCP connection attempt, or "connected". */
function tryConnect(host: string, port: number) {
  return new Promise<string>((resolve) => {
    const socket = connect({ host, port });
    socket.once("connect", () => {
      socket.destroy();
      resolve("connected");
    });
    socket.once("error", (error: NodeJS.ErrnoException) => resolve(error.code ?? error.message));
  });
}

describe("the HTTP server", () => {
  let http: HttpServer;

  beforeAll(async () => {
    http = await startHttpServer(loadServed(), { port: 0 });
  });

  afterAll(() => http.close());

  // Spec 006, Auflage zu K2 (jug_01M4817FY2CAJEEH6EXPS1QSVJ): Leerlauf-Leitungen offen zu halten
  // ist nur richtig, solange nur lokale Clients den Server erreichen.
  it("refuses a connection over a non-loopback address", async () => {
    const address = nonLoopbackAddress();
    expect(address, "this machine has no non-loopback IPv4 address to test against").toBeDefined();
    expect(await tryConnect("127.0.0.1", http.port)).toBe("connected");
    expect(await tryConnect(address as string, http.port)).toBe("ECONNREFUSED");
  });
});
