// Spec 041 B-8: the assistant's poll of the draft (GET /api/marko/<id>/stato, every 3 s) ends with
// its page. Before, a reload or a navigation cut the poll's request in flight short and WebKit
// reported it as a console error ("…/stato due to access control checks.", run 41920898257:
// Bühne 3.4 [webkit] in attempt 1, Zweitfarbe [webkit] in attempt 2); with the body in flight
// WebKit on macOS reports "TypeError: Load failed" and Firefox "The operation was aborted." as an
// uncaught error of the old document. At pagehide the page now stops the interval and aborts the
// request itself; a page the back-forward cache restores (pageshow with persisted) polls again,
// once.
//
// Started as a person starts it (`fm metiejo`), with an invented brand. The page talks to the
// Metiejo through a small proxy of the test that holds the first poll's answer until the page lets
// go of it, so a request is in flight when the page goes, and the proxy sees the page abort it (the
// connection closes before the answer). A route would hold the request inside the browser instead,
// where the engines neither report nor abort it as they do on the wire. The page's clock is
// Playwright's fake clock, paused: a poll runs only when the test moves the time, so the cadence is
// counted in fake time and nothing waits on the wall clock.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import {
  createServer,
  request as httpRequest,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

/** The poll's interval in the Metiejo (`packages/metiejo/src/html.ts`), read here, not set. */
const INTERVALL_MS = 3000;
/** Where the fake clock starts and where it stands still for the test. */
const START = new Date("2026-11-05T09:00:00Z");
const STILL = new Date("2026-11-05T09:00:01Z");

let server: ChildProcess | undefined;
let metiejo = "";
let workdir = "";
let stopping = false;
let proxy: Server;
let base = "";

/**
 * Starts the Metiejo on a port of 7361–7369: the worker's first port, the next one when it is
 * taken. The server says its URL once it listens.
 */
function start(port: number): Promise<ChildProcess | undefined> {
  return new Promise((done) => {
    const child = spawn(
      process.execPath,
      [cli, "metiejo", "--port", String(port), "--workdir", workdir],
      { cwd: repoRoot, stdio: ["ignore", "ignore", "pipe"] },
    );
    let said = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      said += chunk.toString("utf8");
      if (said.includes(`http://localhost:${port}`)) done(child);
    });
    child.once("exit", (code, signal) => {
      if (!stopping && said.includes(`http://localhost:${port}`))
        console.error(
          `the Metiejo on ${port} ended (${code ?? signal}) before the tests did: ${said}`,
        );
      done(undefined);
    });
  });
}

/** The first poll of the draft, held by the proxy: known once it came, closed once it ended. */
interface Gehalten {
  gekommen: Promise<void>;
  /** True once the page closed the connection before the proxy answered. */
  abgebrochen: () => boolean;
}

let halten: ((response: ServerResponse) => boolean) | undefined;

/** The proxy holds the next poll of the draft of `id`; every later request goes through. */
function halteErsteAbfrage(id: string): Gehalten {
  let gekommen!: () => void;
  let abgebrochen = false;
  const gehalten: Gehalten = {
    gekommen: new Promise<void>((done) => {
      gekommen = done;
    }),
    abgebrochen: () => abgebrochen,
  };
  halten = (response) => {
    if (response.req.url !== `/api/marko/${id}/stato`) return false;
    halten = undefined;
    response.on("close", () => {
      abgebrochen = !response.writableEnded;
    });
    // The head and the first byte of the answer go at once, the rest never: the page's fetch has
    // its response, and the poll waits for the body (as nachDerAbfrage() in wackler-040.ts knows).
    response.writeHead(200, { "content-type": "application/json" });
    response.write("{");
    gekommen();
    return true;
  };
  return gehalten;
}

/** Passes a request on to the Metiejo and its answer back, unless the test holds it. */
function weiter(request: IncomingMessage, response: ServerResponse): void {
  if (halten?.(response)) return;
  const upstream = httpRequest(
    `${metiejo}${request.url ?? "/"}`,
    // The Metiejo answers only to its own host (servilo.ts), so the proxy names it.
    { method: request.method, headers: { ...request.headers, host: new URL(metiejo).host } },
    (antwort) => {
      response.writeHead(antwort.statusCode ?? 502, antwort.headers);
      antwort.pipe(response);
    },
  );
  upstream.on("error", () => response.destroy());
  request.pipe(upstream);
}

test.beforeAll(async () => {
  server = undefined;
  stopping = false;
  workdir = mkdtempSync(join(tmpdir(), "fm-stato-041-"));
  const first = test.info().workerIndex;
  for (let attempt = 0; attempt < 27 && server === undefined; attempt += 1) {
    const port = 7361 + ((first + attempt) % 9);
    server = await start(port);
    if (server !== undefined) metiejo = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7361–7369");
  proxy = createServer(weiter);
  await new Promise<void>((done) => proxy.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  stopping = true;
  proxy.closeAllConnections();
  await new Promise((done) => proxy.close(done));
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

/** Creates an invented brand (the Schnellstart's form, empty basis) and returns its identifier. */
async function marke(request: APIRequestContext, name: string): Promise<string> {
  const created = await request.post(`${metiejo}/marko`, {
    form: { name, basis: "leer" },
    maxRedirects: 0,
  });
  expect(created.status()).toBe(303);
  const location = created.headers().location ?? "";
  const id = /^\/marko\/([a-z0-9-]+)\//.exec(location)?.[1];
  if (id === undefined) throw new Error(`no brand from ${location}`);
  return id;
}

/** What went wrong on the page: uncaught errors and console errors, for the report. */
function fehlerOf(page: Page): string[] {
  const fehler: string[] = [];
  page.on("pageerror", (error) => fehler.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") fehler.push(message.text());
  });
  return fehler;
}

declare global {
  interface Window {
    /** How often this document asked for the draft's stato (set up by `zaehleAbfragen`). */
    __fmStatoAbfragen?: number;
  }
}

/**
 * Counts in each document how often it calls fetch for the draft's stato. The count is the
 * document's own: a reload starts it at 0. It is read in the page, so it holds as soon as the
 * timers of a clock step have run, without waiting for the request to reach the test.
 */
async function zaehleAbfragen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__fmStatoAbfragen = 0;
    const original = window.fetch;
    window.fetch = function (this: unknown, ...args: Parameters<typeof fetch>) {
      const [input] = args;
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith("/stato")) window.__fmStatoAbfragen = (window.__fmStatoAbfragen ?? 0) + 1;
      return original.apply(this, args);
    } as typeof fetch;
  });
}

const abfragen = (page: Page) => page.evaluate(() => window.__fmStatoAbfragen ?? 0);

/** Opens a step of the assistant and waits until the stage's client has bound its handlers. */
async function oeffne(page: Page, id: string): Promise<void> {
  await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
  await expect(page.locator("[data-mt-buehne]")).toHaveAttribute("data-mt-bereit", "");
}

/** Moves the fake clock by `ms` and returns this document's count of polls afterwards. */
async function nach(page: Page, ms: number): Promise<number> {
  await page.clock.runFor(ms);
  return abfragen(page);
}

test.describe("Spec 041 B-8: the stato poll ends with its page", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: START });
    await page.clock.pauseAt(STILL);
    await zaehleAbfragen(page);
  });

  test.afterEach(() => {
    halten = undefined;
  });

  test("a reload aborts the old document's poll without a console error; the new one polls once per interval", async ({
    page,
    request,
  }) => {
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Abfrage");
    await oeffne(page, id);
    const gehalten = halteErsteAbfrage(id);

    // One interval of fake time: the poll asks once, and its answer stays in flight.
    expect(await nach(page, INTERVALL_MS - 1)).toBe(0);
    expect(await nach(page, 1)).toBe(1);
    await gehalten.gekommen;

    // (a) The reload aborts the request in flight, and nothing reports it as an error.
    await page.reload();
    await expect(page.locator("[data-mt-buehne]")).toHaveAttribute("data-mt-bereit", "");
    await expect.poll(gehalten.abgebrochen).toBe(true);

    // (b) The new document polls once per interval, none before the first interval is over.
    expect(await abfragen(page)).toBe(0);
    expect(await nach(page, INTERVALL_MS - 1)).toBe(0);
    expect(await nach(page, 1)).toBe(1);
    expect(await nach(page, INTERVALL_MS)).toBe(2);
    expect(await nach(page, INTERVALL_MS)).toBe(3);
    expect(fehler).toEqual([]);
  });

  test("pagehide stops the poll and aborts its request; pageshow from the back-forward cache resumes it once", async ({
    page,
    request,
  }) => {
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Zwischenspeicher");
    await oeffne(page, id);
    const gehalten = halteErsteAbfrage(id);
    expect(await nach(page, INTERVALL_MS)).toBe(1);
    await gehalten.gekommen;

    // The page goes into the back-forward cache: the request in flight is aborted, no poll runs.
    // The browser fires the event, here the test does: the engines Playwright drives keep no page
    // in that cache, and the document must stay to be looked at.
    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })),
    );
    await expect.poll(gehalten.abgebrochen).toBe(true);
    expect(await nach(page, INTERVALL_MS * 3)).toBe(1);

    // It comes back: the poll runs again, once per interval, starting one interval later.
    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })),
    );
    expect(await nach(page, INTERVALL_MS - 1)).toBe(1);
    expect(await nach(page, 1)).toBe(2);
    expect(await nach(page, INTERVALL_MS)).toBe(3);

    // A pageshow that is not a return from the cache (the first load fires one) starts nothing.
    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: false })),
    );
    expect(await nach(page, INTERVALL_MS)).toBe(4);
    expect(fehler).toEqual([]);
  });

  test("beforeunload aborts the request in flight; the poll goes on while the page stays", async ({
    page,
    request,
  }) => {
    // WebKit and Firefox stop the old document's loads between beforeunload and pagehide (on a
    // reload, page.goto and a link alike), so the page aborts its own request at beforeunload,
    // before the browser cuts it short. A navigation can end without leaving the page (a download,
    // a cancelled one): then the poll goes on.
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Verlassen");
    await oeffne(page, id);
    const gehalten = halteErsteAbfrage(id);
    expect(await nach(page, INTERVALL_MS)).toBe(1);
    await gehalten.gekommen;

    await page.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
    await expect.poll(gehalten.abgebrochen).toBe(true);
    expect(await nach(page, INTERVALL_MS - 1)).toBe(1);
    expect(await nach(page, 1)).toBe(2);
    expect(await nach(page, INTERVALL_MS)).toBe(3);
    expect(fehler).toEqual([]);
  });
});
