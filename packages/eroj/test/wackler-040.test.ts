// Spec 040 B-2: `stand()` of the Studio spec survives exactly one `read ECONNRESET` of Playwright's
// request context, as the runs on main met it, and no more. A local server resets the connection of
// the requests it is told to; the request context is Playwright's own, so the error is the real one.
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
