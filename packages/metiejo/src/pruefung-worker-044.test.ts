// Spec 044 T3 (D-02, A-06, R-2, AC-3, AC-7): the check in a worker thread. Vitest runs the TS
// source, where the worker module is missing and the check runs in the main thread (the fallback);
// the tests here run the built package (`dist/`, built before the tests by vitest.config.ts or by
// turbo), where it runs in a worker. They show: the fixed course answers the bytes of the fixture;
// `stato` of another brand answers while a check computes; a worker that throws or dies gives the
// answer of a throw in the main thread, starts again on the next need only and the server answers
// on; the worker's derivation equals the main thread's. B-10: the server starts its worker right
// after the URL line, before any check, and close() ends it at any point of its start. Invented
// brands, no model, no clock.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import type { Worker } from "node:worker_threads";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type * as Ableitungen from "./ableitungen.js";
import { startServilo } from "./servilo.js";
import {
  type Antwort,
  ablauf044,
  entwurf,
  type Fall,
  MARKEN_044,
  markeAnlegen,
  sha256,
  startServiloDist,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { checkDraft, loadBases, startAgordo } from "./vorschau.js";

const DIST = new URL("../dist/", import.meta.url);
/** A module of the built package, typed as its source. */
const distModul = async <T>(pfad: string): Promise<T> =>
  (await import(new URL(pfad, DIST).href)) as T;

const FIXTURE = new URL("./test-doubles/antworten-044.json", import.meta.url);
const fixture = (): Fall[] =>
  (JSON.parse(readFileSync(FIXTURE, "utf8")) as { faelle: Fall[] }).faelle;
/** The names of the two brands of the fixture (invented), as in antworten-044. */
const NAMEN: Readonly<Record<string, string>> = { A: "lumeta", B: "brikola" };

const fallOf = (antwort: Antwort) => ({
  status: antwort.status,
  contentType: antwort.contentType,
  body: antwort.body.toString("utf8"),
});

describe("the built server answers the bytes of the fixture with the check in a worker (AC-3)", () => {
  let server: TestServilo;
  beforeAll(async () => {
    server = await testServilo("fm-worker-044-", {}, await startServiloDist());
  });
  afterAll(async () => {
    await server.close();
  });

  for (const marke of MARKEN_044) {
    it(`brand ${marke.fall} (${marke.basis}): rev 1 to 3, cold and warm`, async () => {
      const own: Fall[] = [];
      await ablauf044(server, marke, NAMEN[marke.fall] ?? "", (fall, antwort) =>
        own.push({
          fall,
          status: antwort.status,
          contentType: antwort.contentType,
          sha256: sha256(antwort.body),
        }),
      );
      expect(own).toEqual(fixture().filter((entry) => entry.fall.startsWith(marke.fall)));
    });
  }
});

describe("stato while the check computes in the worker (AC-5, without a gate that holds it)", () => {
  const A = "lumeta";
  const B = "brikola";
  let server: TestServilo;
  /** Resolved when the shared check of A is about to compute (V-3); the gate holds nothing. */
  let gerufen = (): void => undefined;
  let wurdeGerufen = Promise.resolve();
  beforeAll(async () => {
    server = await testServilo(
      "fm-worker-stato-044-",
      {
        pruefTor: (marke) => {
          if (marke === A) gerufen();
          return Promise.resolve();
        },
      },
      await startServiloDist(),
    );
    await markeAnlegen(server, A, "leer");
    await markeAnlegen(server, B, "leer");
    expect((await server.anfrage("POST", `/api/marko/${B}/pruefung`)).status).toBe(200);
  });
  afterAll(async () => {
    await server.close();
  });

  it("the stato of another brand answers before the check of A it was sent after", async () => {
    wurdeGerufen = new Promise<void>((done) => {
      gerufen = done;
    });
    await entwurf(server, A, { leitfarbe: "#336699" });
    const reihenfolge: string[] = [];
    const a = server.anfrage("POST", `/api/marko/${A}/pruefung`).then((antwort) => {
      reihenfolge.push("pruefung A");
      return antwort;
    });
    // The check of A starts to compute now; in the main thread nothing else would run until it ends.
    await wurdeGerufen;
    const b = await server.anfrage("GET", `/api/marko/${B}/stato`);
    reihenfolge.push("stato B");
    expect((await a).status).toBe(200);
    expect(b.status).toBe(200);
    expect(reihenfolge).toEqual(["stato B", "pruefung A"]);
  });
});

describe("a worker that throws or dies (AC-7: no retry, a new worker on the next need only)", () => {
  /** The brand whose check runs in the failing worker; its rev 1 is case „A rev1“ of the fixture. */
  const A = "lumeta";
  /** The brand whose check throws in the main thread (the gate), for the answer to compare with. */
  const R = "rompa";
  const scratch = mkdtempSync(join(tmpdir(), "fm-worker-fehler-044-"));
  const starts = join(scratch, "starts.txt");
  let server: TestServilo;
  /** What the gate throws for R: a throw in the main thread inside the shared check. */
  let imHaupt: unknown;
  beforeAll(async () => {
    // A worker module of its own: the first worker throws on its job, the second ends with exit
    // code 7, the third is the real worker whose first job gets no Agordo (its check throws
    // inside the worker); every worker from then on is the real one.
    writeFileSync(starts, "0");
    const modul = join(scratch, "worker.mjs");
    writeFileSync(
      modul,
      `import { readFileSync, writeFileSync } from "node:fs";
import { parentPort } from "node:worker_threads";
const zaehler = ${JSON.stringify(starts)};
const start = Number(readFileSync(zaehler, "utf8")) + 1;
writeFileSync(zaehler, String(start));
if (start === 1) {
  parentPort.once("message", () => {
    throw new Error("the check broke in the worker");
  });
} else if (start === 2) {
  parentPort.once("message", () => process.exit(7));
} else {
  const on = parentPort.on.bind(parentPort);
  let erste = start === 3;
  parentPort.on = (event, hoerer) =>
    on(event, (auftrag) => {
      if (event !== "message" || !erste) return hoerer(auftrag);
      erste = false;
      return hoerer({ ...auftrag, agordo: null });
    });
  await import(${JSON.stringify(new URL("pruefung-worker.js", DIST).href)});
}
`,
    );
    server = await testServilo(
      "fm-worker-fehler-044-",
      {
        pruefWorker: pathToFileURL(modul),
        pruefTor: (marke) => (marke === R ? Promise.reject(imHaupt) : Promise.resolve()),
      },
      await startServiloDist(),
    );
    await markeAnlegen(server, A, "leer");
    await markeAnlegen(server, R, "leer");
  });
  afterAll(async () => {
    await server.close();
    rmSync(scratch, { recursive: true, force: true });
  });

  const pruefung = (name: string) => server.anfrage("POST", `/api/marko/${name}/pruefung`);
  /** The answer of `/pruefung` when the check throws `fehler` in the main thread. */
  const wieImHaupt = async (fehler: unknown) => {
    imHaupt = fehler;
    return fallOf(await pruefung(R));
  };
  const rahmen = () =>
    server.anfrage("GET", `/marko/${A}/vorschau?sxtupo=farbe&breite=mittel&rev=1&scheme=light`);
  const fall = (name: string) => fixture().find((entry) => entry.fall === name);

  it("each failing check answers as a throw in the main thread; the server answers on, the next need starts a new worker", async () => {
    const erste = fallOf(await pruefung(A));
    expect(erste.status).toBe(500);
    expect(erste).toEqual(await wieImHaupt(new Error("the check broke in the worker")));
    // The server answers on: the frame of A (no check) has the bytes of the fixture.
    expect(sha256((await rahmen()).body)).toBe(fall("A rev1 GET vorschau farbe kalt")?.sha256);
    expect(readFileSync(starts, "utf8")).toBe("1");

    const zweite = fallOf(await pruefung(A));
    expect(zweite.status).toBe(500);
    expect(zweite).toEqual(
      await wieImHaupt(new Error("The worker of the check ended (exit code 7).")),
    );
    expect(readFileSync(starts, "utf8")).toBe("2");

    // The real worker: its check throws without an Agordo, as `checkDraft` throws in the main thread.
    let ohneAgordo: unknown;
    try {
      checkDraft(null as unknown as Agordo, loadBases());
    } catch (fehler) {
      ohneAgordo = fehler;
    }
    expect(ohneAgordo).toBeInstanceOf(Error);
    const dritte = fallOf(await pruefung(A));
    expect(dritte.status).toBe(500);
    expect(dritte).toEqual(await wieImHaupt(ohneAgordo));

    // The same worker computes on: the check of A has the bytes of the fixture.
    const vierte = await pruefung(A);
    expect({ status: vierte.status, sha256: sha256(vierte.body) }).toEqual({
      status: 200,
      sha256: fall("A rev1 POST pruefung kalt")?.sha256,
    });
    expect(readFileSync(starts, "utf8")).toBe("3");
  });
});

describe("the worker starts right after the URL line, before any check (B-10, R-6)", () => {
  // Node says `worker` on the process in the tick after a worker thread is made: the order of the
  // URL line, the return of startServilo and the start of the worker is read from these events,
  // never from a clock.
  /** The events of one test in their order; `worker` once per worker thread made. */
  let ereignisse: string[] = [];
  let worker: Worker[] = [];
  let naechster = (_: Worker): void => undefined;
  /** The next worker thread made in this process. */
  const naechsterWorker = () =>
    new Promise<Worker>((done) => {
      naechster = done;
    });
  const hoerer = (neu: Worker) => {
    ereignisse.push("worker");
    worker.push(neu);
    naechster(neu);
  };
  /** What the server says, the URL line as `url`, every other line as itself. */
  const stderr = (text: string) =>
    ereignisse.push(text.startsWith("metiejo: http://localhost:") ? "url" : text);
  beforeEach(() => {
    ereignisse = [];
    worker = [];
    process.on("worker", hoerer);
  });
  afterEach(() => {
    process.off("worker", hoerer);
  });
  const ohneStartzeilen = () =>
    ereignisse.filter((ereignis) => !ereignis.startsWith("metiejo: FM_TIPAROJ_REPO"));
  const fall = (name: string) => fixture().find((entry) => entry.fall === name);

  it("without a request: the URL line, the return of startServilo, then one worker; the first check computes in it", async () => {
    const gestartet = naechsterWorker();
    const server = await testServilo("fm-vorstart-044-", {}, await startServiloDist(), stderr);
    try {
      ereignisse.push("zurueck");
      await gestartet;
      expect(ohneStartzeilen()).toEqual(["url", "zurueck", "worker"]);
      await markeAnlegen(server, "lumeta", "leer");
      const pruefung = await server.anfrage("POST", "/api/marko/lumeta/pruefung");
      expect({ status: pruefung.status, sha256: sha256(pruefung.body) }).toEqual({
        status: 200,
        sha256: fall("A rev1 POST pruefung kalt")?.sha256,
      });
      // The check ran in the worker started ahead: no second one.
      expect(worker).toHaveLength(1);
    } finally {
      await server.close();
    }
    // close() ended it.
    expect(worker[0]?.threadId).toBe(-1);
  });

  it("close() while the worker loads ends it; close() before its turn starts none", async () => {
    const gestartet = naechsterWorker();
    const laedt = await testServilo("fm-vorstart-zu-044-", {}, await startServiloDist(), stderr);
    const imLaden = await gestartet;
    await laedt.close();
    expect(imLaden.threadId).toBe(-1);

    ereignisse = [];
    const sofort = await testServilo(
      "fm-vorstart-sofort-044-",
      {},
      await startServiloDist(),
      stderr,
    );
    // In the turn startServilo returned in, before the server's next turn.
    await sofort.close();
    await new Promise(setImmediate);
    await new Promise(process.nextTick);
    expect(ohneStartzeilen()).toEqual(["url"]);
    expect(worker).toHaveLength(1);
  });

  it("a worker that dies while it starts says nothing; the first check starts a new one and answers the bytes of the fixture", async () => {
    const scratch = mkdtempSync(join(tmpdir(), "fm-vorstart-tod-044-"));
    const starts = join(scratch, "starts.txt");
    writeFileSync(starts, "0");
    const modul = join(scratch, "worker.mjs");
    // The first worker dies while it starts, every later one is the real one.
    writeFileSync(
      modul,
      `import { readFileSync, writeFileSync } from "node:fs";
const zaehler = ${JSON.stringify(starts)};
const start = Number(readFileSync(zaehler, "utf8")) + 1;
writeFileSync(zaehler, String(start));
if (start === 1) {
  throw new Error("the worker broke while it started");
} else {
  await import(${JSON.stringify(new URL("pruefung-worker.js", DIST).href)});
}
`,
    );
    const gestartet = naechsterWorker();
    const server = await testServilo(
      "fm-vorstart-tod-044-",
      { pruefWorker: pathToFileURL(modul) },
      await startServiloDist(),
      stderr,
    );
    try {
      const erster = await gestartet;
      // Its end, not its error (which the server hears; `once` would throw it here).
      await new Promise((done) => erster.once("exit", done));
      expect(ohneStartzeilen()).toEqual(["url", "worker"]);
      await markeAnlegen(server, "lumeta", "leer");
      const pruefung = await server.anfrage("POST", "/api/marko/lumeta/pruefung");
      expect({ status: pruefung.status, sha256: sha256(pruefung.body) }).toEqual({
        status: 200,
        sha256: fall("A rev1 POST pruefung kalt")?.sha256,
      });
      expect(readFileSync(starts, "utf8")).toBe("2");
      expect(ohneStartzeilen()).toEqual(["url", "worker", "worker"]);
    } finally {
      await server.close();
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it("on the TS source (the check in the main thread) the server starts no worker", async () => {
    const server = await testServilo("fm-vorstart-quelle-044-", {}, startServilo, stderr);
    try {
      await new Promise(setImmediate);
      await new Promise(process.nextTick);
      expect(ohneStartzeilen()).toEqual(["url"]);
    } finally {
      await server.close();
    }
  });
});

describe("the calculator of the check (R-2, A-06)", () => {
  const bases = loadBases();
  const haupt = (agordo: Agordo) => checkDraft(agordo, bases);
  const agordoj: Agordo[] = [
    { ...startAgordo("lumeta", "leer"), leitfarbe: "#336699" },
    startAgordo("brikola", "komuna"),
  ];

  it("in the worker: the derivation of the main thread, equal deep, with prototypes and key order", async () => {
    const { pruefRechnungOf } = await distModul<typeof Ableitungen>("ableitungen.js");
    const rechnung = pruefRechnungOf(haupt);
    expect(rechnung.ort).toBe("worker");
    try {
      for (const agordo of agordoj) {
        const imWorker = await rechnung.rechner(agordo);
        const imHaupt = haupt(agordo);
        expect(isDeepStrictEqual(imWorker, imHaupt)).toBe(true);
        expect(JSON.stringify(imWorker)).toBe(JSON.stringify(imHaupt));
      }
    } finally {
      await rechnung.beenden();
    }
  });

  it("ending the worker fails the check it holds; the next need starts a new one", async () => {
    const { pruefRechnungOf } = await distModul<typeof Ableitungen>("ableitungen.js");
    const rechnung = pruefRechnungOf(haupt);
    const [agordo] = agordoj;
    if (agordo === undefined) throw new Error("no Agordo");
    const gehalten = rechnung.rechner(agordo);
    await rechnung.beenden();
    await expect(gehalten).rejects.toThrow("The worker of the check ended");
    try {
      expect(isDeepStrictEqual(await rechnung.rechner(agordo), haupt(agordo))).toBe(true);
    } finally {
      await rechnung.beenden();
    }
  });

  it("on the TS source the worker module is missing: the check runs in the main thread", async () => {
    const { pruefRechnungOf } = await import("./ableitungen.js");
    const rechnung = pruefRechnungOf(haupt);
    expect(rechnung.ort).toBe("haupt-thread");
    const [agordo] = agordoj;
    if (agordo === undefined) throw new Error("no Agordo");
    expect(isDeepStrictEqual(await rechnung.rechner(agordo), haupt(agordo))).toBe(true);
    await rechnung.beenden();
  });
});
