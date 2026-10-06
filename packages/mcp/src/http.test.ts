// The HTTP server itself (Spec 006): where it listens, how long it keeps an idle connection and
// whether it lets its process end. The MCP conversation over this transport is tested in
// resources-http.test.ts.

import { spawn } from "node:child_process";
import { connect, type Socket } from "node:net";
import { networkInterfaces } from "node:os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type HttpServer, startHttpServer } from "./http.js";
import { preload } from "./test-doubles/client.js";

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

// Der Modelo wird hier geladen, nicht im Hook: reines Rechnen ohne Leitung, und das
// `startHttpServer` im `beforeAll` kostet danach nur noch das Lauschen.
preload();

describe("the HTTP server", () => {
  let http: HttpServer;

  beforeAll(async () => {
    http = await startHttpServer(preload(), { port: 0 });
  });

  afterAll(() => http.close());

  // Spec 006, Auflage zu K2 (jug_01M4817FY2CAJEEH6EXPS1QSVJ): Leerlauf-Leitungen offen zu halten
  // ist nur richtig, solange nur lokale Clients den Server erreichen. Maßgeblich ist die Adresse,
  // die das Betriebssystem für den lauschenden Socket meldet; ein Verbindungsversuch allein wäre
  // ohne Nicht-Loopback-Adresse falsch rot und hinter einem Paketfilter falsch grün.
  it("listens on 127.0.0.1 only, as the operating system reports it", () => {
    expect(http.address).toBe("127.0.0.1");
  });

  it("refuses a connection over a non-loopback address", async (context) => {
    const address = nonLoopbackAddress();
    if (address === undefined) context.skip("this machine has no non-loopback IPv4 address");
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

  // Spec 006, B4: Eine Leerlauf-Leitung schließt Nodes server.close() seit Node 19 selbst; eine
  // halb gesendete Anfrage nur closeAllConnections() in close(). Ohne sie hielte ein Client den
  // Prozess am Leben.
  it("lets its process end after close(), while a client holds a half-sent request", async () => {
    const child = spawn(process.execPath, [CHILD], {
      stdio: ["ignore", "ignore", "inherit", "ipc"],
    });
    const exited = new Promise<string>((resolve) =>
      child.once("exit", (code) => resolve(`exited with ${code}`)),
    );
    const port = await new Promise<number>((resolve) => child.once("message", resolve));
    const socket = connect({ host: "127.0.0.1", port });
    await new Promise((resolve) => socket.once("connect", resolve));
    // The child reports when its server has the head of the request; only then is the connection
    // busy rather than idle. Waiting on a clock instead would leave the test green without
    // closeAllConnections() whenever the fragment arrived late.
    const received = new Promise((resolve) => child.once("message", resolve));
    try {
      // Headers the transport accepts, so it waits for a body that never completes; without them
      // it answers 406 at once and the connection is merely idle (Spec 006, B5).
      socket.write(
        [
          "POST /mcp HTTP/1.1",
          `Host: 127.0.0.1:${port}`,
          "Content-Type: application/json",
          "Accept: application/json, text/event-stream",
          "Content-Length: 100",
          "",
          "{",
        ].join("\r\n"),
      );
      expect(await received).toBe("request");
      const closed = new Promise<string>((resolve) => child.once("message", resolve));
      child.send("close");
      expect(await closed).toBe("closed");
      expect(await Promise.race([exited, after(1_500, "still running 1.5 s after close()")])).toBe(
        "exited with 0",
      );
    } finally {
      socket.destroy();
      child.kill();
    }
  });
});

const after = (ms: number, value: string) =>
  new Promise<string>((resolve) => setTimeout(resolve, ms, value));

/** The child process: serves on a free port and reports what its server sees (see the file). */
const CHILD = new URL("./test-doubles/http-server-child.mjs", import.meta.url).pathname;
