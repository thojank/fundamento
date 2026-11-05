// Spec 040 B-2: `stand()` of the Studio spec survives exactly one `read ECONNRESET` of Playwright's
// request context, as the runs on main met it, and no more. A local server resets the connection of
// the requests it is told to; the request context is Playwright's own, so the error is the real one.
// Spec 041 B-12: the same for Node's global fetch, whose reset is the cause of „fetch failed“.
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { type APIRequestContext, request } from "@playwright/test";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { nachEinemReset } from "./wackler-040.js";

let server: Server;
let api: APIRequestContext;
let url = "";
/** How many requests the server saw, and how many of the first it resets. */
let seen = 0;
let resets = 0;

beforeAll(async () => {
  server = createServer((incoming, outgoing) => {
    seen += 1;
    if (seen <= resets) {
      incoming.socket.resetAndDestroy();
      return;
    }
    outgoing.setHeader("content-type", "application/json");
    outgoing.end(JSON.stringify({ rev: 7 }));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/marko/probe/stato`;
  api = await request.newContext();
});

afterAll(async () => {
  await api.dispose();
  await new Promise((done) => server.close(done));
});

beforeEach(() => {
  seen = 0;
  resets = 0;
});

describe("nachEinemReset (Spec 040 B-2)", () => {
  it("reads the stato after one reset of the connection", async () => {
    resets = 1;
    const antwort = await nachEinemReset(() => api.get(url));
    expect(antwort.status()).toBe(200);
    expect(await antwort.json()).toEqual({ rev: 7 });
    expect(seen).toBe(2);
  });

  it("sends once when nothing goes wrong", async () => {
    const antwort = await nachEinemReset(() => api.get(url));
    expect(antwort.status()).toBe(200);
    expect(seen).toBe(1);
  });

  it("throws the second reset instead of trying a third time", async () => {
    resets = 2;
    await expect(nachEinemReset(() => api.get(url))).rejects.toThrow(/read ECONNRESET/);
    expect(seen).toBe(2);
  });

  it("throws any other error at once", async () => {
    let calls = 0;
    const send = async (): Promise<never> => {
      calls += 1;
      throw new Error("apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:7310");
    };
    await expect(nachEinemReset(send)).rejects.toThrow(/ECONNREFUSED/);
    expect(calls).toBe(1);
  });
});

describe("nachEinemReset with Node's fetch (Spec 041 B-12)", () => {
  // Run 41941052854 (Eroj 4/4, WebKit, metiejo-036-uebernahme.spec.ts): Node's global fetch says a
  // reset as „TypeError: fetch failed“ with the reset as its cause, not in its message.
  it("reads after one reset of the connection", async () => {
    resets = 1;
    const antwort = await nachEinemReset(() => fetch(url));
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ rev: 7 });
    expect(seen).toBe(2);
  });

  it("throws the second reset instead of trying a third time", async () => {
    resets = 2;
    const fehler = await nachEinemReset(() => fetch(url)).catch((error: unknown) => error);
    expect(fehler).toBeInstanceOf(TypeError);
    expect((fehler as TypeError).cause).toMatchObject({ code: "ECONNRESET" });
    expect(seen).toBe(2);
  });

  it("sends once more when the cause only says „read ECONNRESET“", async () => {
    let calls = 0;
    const send = async (): Promise<string> => {
      calls += 1;
      if (calls === 1) throw new TypeError("fetch failed", { cause: new Error("read ECONNRESET") });
      return "gelesen";
    };
    await expect(nachEinemReset(send)).resolves.toBe("gelesen");
    expect(calls).toBe(2);
  });

  it("throws a refused connection at once", async () => {
    const zu = createServer();
    await new Promise<void>((done) => zu.listen(0, "127.0.0.1", done));
    const frei = `http://127.0.0.1:${(zu.address() as AddressInfo).port}/`;
    await new Promise((done) => zu.close(done));
    let calls = 0;
    const fehler = await nachEinemReset(() => {
      calls += 1;
      return fetch(frei);
    }).catch((error: unknown) => error);
    expect(fehler).toBeInstanceOf(TypeError);
    expect((fehler as TypeError).cause).toMatchObject({ code: "ECONNREFUSED" });
    expect(calls).toBe(1);
  });

  it("throws any other failed fetch at once", async () => {
    let calls = 0;
    const send = async (): Promise<never> => {
      calls += 1;
      throw new TypeError("fetch failed", {
        cause: Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" }),
      });
    };
    await expect(nachEinemReset(send)).rejects.toThrow(/fetch failed/);
    expect(calls).toBe(1);
  });
});
