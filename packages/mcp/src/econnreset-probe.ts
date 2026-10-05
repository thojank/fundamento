// WEGWERF — F-ECONNRESET, Messung 1 und 5. Reine Beobachtung: hängt Listener an und reicht fetch
// unverändert durch. Ändert kein Verhalten des Servers oder des Clients. Nicht mergen.

import type { Server } from "node:http";
import type { Socket } from "node:net";
import { monitorEventLoopDelay, performance } from "node:perf_hooks";

const lag = monitorEventLoopDelay({ resolution: 10 });
lag.enable();

export function probe(event: string, data: Record<string, unknown> = {}): void {
  const lagMax = Math.round(lag.max / 1e6);
  process.stderr.write(
    `[econnreset] ${performance.now().toFixed(1)}ms pid=${process.pid} ${event} ${JSON.stringify({ ...data, loopLagMaxMs: lagMax })}\n`,
  );
}

export function resetLag(): void {
  lag.reset();
}

/** Server-Seite (Messung 5): kommt die Anfrage an, und wer schließt den Socket wann? */
export function probeServer(http: Server): void {
  probe("server.limits", {
    keepAliveTimeout: http.keepAliveTimeout,
    headersTimeout: http.headersTimeout,
    requestTimeout: http.requestTimeout,
  });
  let requests = 0;
  const lastFinish = new WeakMap<Socket, number>();
  http.on("connection", (socket: Socket) => {
    const id = socket.remotePort;
    probe("server.socket.open", { id });
    socket.on("error", (error: NodeJS.ErrnoException) =>
      probe("server.socket.error", { id, code: error.code, message: error.message }),
    );
    socket.on("timeout", () => probe("server.socket.timeout", { id }));
    socket.on("end", () => probe("server.socket.end-from-client", { id }));
    socket.on("close", (hadError: boolean) => {
      const finished = lastFinish.get(socket);
      probe("server.socket.close", {
        id,
        hadError,
        idleSinceLastResponseMs:
          finished === undefined ? null : Math.round(performance.now() - finished),
      });
    });
  });
  http.on("request", (request, response) => {
    const n = ++requests;
    const socket = request.socket as Socket;
    const finished = lastFinish.get(socket);
    probe("server.request", {
      n,
      id: socket.remotePort,
      method: request.method,
      contentLength: request.headers["content-length"],
      idleBeforeThisRequestMs:
        finished === undefined ? null : Math.round(performance.now() - finished),
    });
    response.on("finish", () => {
      lastFinish.set(socket, performance.now());
      probe("server.response.finish", { n, id: socket.remotePort, status: response.statusCode });
    });
    response.on("close", () =>
      probe("server.response.close", {
        n,
        id: socket.remotePort,
        finished: response.writableFinished,
      }),
    );
  });
  http.on("clientError", (error: NodeJS.ErrnoException) =>
    probe("server.clientError", { code: error.code, message: error.message }),
  );
}

/** Client-Seite: fetch unverändert durchgereicht, nur protokolliert. */
export const probedFetch: typeof fetch = async (input, init) => {
  let rpc: unknown = null;
  if (typeof init?.body === "string") {
    try {
      const body = JSON.parse(init.body) as { method?: string; id?: unknown };
      rpc = `${body.method}#${body.id ?? "-"}`;
    } catch {
      rpc = "unparsed";
    }
  }
  const start = performance.now();
  probe("client.fetch.start", { method: init?.method ?? "GET", rpc });
  try {
    const response = await fetch(input, init);
    probe("client.fetch.response", {
      rpc,
      status: response.status,
      connection: response.headers.get("connection"),
      keepAlive: response.headers.get("keep-alive"),
      ms: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    const cause = (error as { cause?: NodeJS.ErrnoException }).cause;
    probe("client.fetch.error", {
      rpc,
      message: (error as Error).message,
      cause: cause?.code ?? String(cause),
      ms: Math.round(performance.now() - start),
    });
    throw error;
  }
};
