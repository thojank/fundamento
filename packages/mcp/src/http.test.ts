// The HTTP server itself (Spec 006): where it listens, how long it keeps an idle connection and
// whether it lets its process end. The MCP conversation over this transport is tested in
// resources-http.test.ts.

import { connect, type Socket } from "node:net";
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

/** One `tools/list` POST on an already open socket; resolves with the status line of the answer. */
function exchange(socket: Socket, port: number) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
  return new Promise<string>((resolve, reject) => {
    if (socket.closed) {
      reject(new Error("the server closed the idle connection"));
      return;
    }
    let received = Buffer.alloc(0);
    const onData = (chunk: Buffer) => {
      received = Buffer.concat([received, chunk]);
      const head = received.indexOf("\r\n\r\n");
      if (head < 0) return;
      const headers = received.subarray(0, head).toString("latin1");
      const length = Number(/^content-length: *(\d+)$/im.exec(headers)?.[1]);
      if (received.length - head - 4 >= length) done(() => resolve(headers.split("\r\n")[0] ?? ""));
    };
    const onClose = () => done(() => reject(new Error("the server closed the connection")));
    const done = (settle: () => void) => {
      socket.off("data", onData);
      socket.off("close", onClose);
      settle();
    };
    socket.on("data", onData);
    socket.once("close", onClose);
    socket.write(
      [
        "POST /mcp HTTP/1.1",
        `Host: 127.0.0.1:${port}`,
        "Content-Type: application/json",
        "Accept: application/json, text/event-stream",
        "Connection: keep-alive",
        `Content-Length: ${Buffer.byteLength(body)}`,
        "",
        body,
      ].join("\r\n"),
    );
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

  // Spec 006, K2 (jug_01M4817FY2CAJEEH6EXPS1QSVJ): Nodes Voreinstellung schlösse die Leitung nach
  // 5 s + 1 s; ein Client, dessen Loop so lange blockiert, verlöre sein nächstes POST (ECONNRESET).
  it("keeps an idle connection open past Node's default keep-alive limit", async () => {
    const socket = connect({ host: "127.0.0.1", port: http.port });
    await new Promise((resolve) => socket.once("connect", resolve));
    try {
      expect(await exchange(socket, http.port)).toBe("HTTP/1.1 200 OK");
      await new Promise((resolve) => setTimeout(resolve, 6_500));
      expect(await exchange(socket, http.port)).toBe("HTTP/1.1 200 OK");
    } finally {
      socket.destroy();
    }
  });
});
