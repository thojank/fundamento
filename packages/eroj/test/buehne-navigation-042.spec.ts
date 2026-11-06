// Spec 042 (US-2, AC-3, D-04, D-05): the stage navigates only when the person or the test makes it.
// Runs 42113762271 (Chromium, „Execution context was destroyed“ in a frame of the stage), 41971858056
// and 41931882770 (WebKit, the stage's client never bound its handlers after the second load) asked
// whether the stage loads itself anew. This test counts every document of the stage – the page and
// its two preview frames – along a person's way: open the step, switch dark and light, a change of
// the draft elsewhere (`festlegen`, a new rev the page's poll brings), open the step again.
//
// Started as a person starts it (`fm metiejo`), with an invented brand and without a language model.
// The sources, all written by an init script into every new document of the page and its frames:
// - sessionStorage: one entry per document (shared by the page and its same-origin frames), with
//   the step of the test the document came in,
// - performance: the navigation entry of that document (`navigate`, `reload`, …),
// - src: every assignment of an iframe's `src` in the page (the only way the client navigates a
//   frame, html.ts › refreshFrame()/refreshNachher()), counted when it happens.
// For the page itself `framenavigated` is reported as well, but it does not decide: Firefox misses
// navigations there (Spec 041 B-9/B-15). Every entry also goes to a binding of the test
// (`exposeBinding`), reported beside the others: it tells a document whose entry did not reach
// sessionStorage from one that never ran the init script.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import { BUEHNE_BEREIT, dokument, rahmenBereit, seiteBereit } from "./geladen-042.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";
let stopping = false;

/**
 * Starts the Metiejo on a port of 7371–7379, a range no other spec starts on first: the worker's
 * first port, the next one when it is taken. The server says its URL once it listens; only the
 * child that listens on the port says so (N-3: a port taken by another worker's server makes this
 * child end with EADDRINUSE, and the next port is tried).
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

test.beforeAll(async () => {
  server = undefined;
  stopping = false;
  workdir = mkdtempSync(join(tmpdir(), "fm-buehne-navigation-042-"));
  const first = test.info().workerIndex;
  for (let attempt = 0; attempt < 27 && server === undefined; attempt += 1) {
    const port = 7371 + ((first + attempt) % 9);
    server = await start(port);
    if (server !== undefined) base = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7371–7379");
});

test.afterAll(() => {
  stopping = true;
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

/** Spec 041 B-12: the test's POSTs close their connection (no reused keep-alive connection). */
const EIGENE_VERBINDUNG = { connection: "close" };

/** Creates an invented brand (the Schnellstart's form, empty basis) and returns its identifier. */
async function marke(request: APIRequestContext, name: string): Promise<string> {
  const created = await request.post(`${base}/marko`, {
    form: { name, basis: "leer" },
    maxRedirects: 0,
    headers: EIGENE_VERBINDUNG,
  });
  expect(created.status()).toBe(303);
  const location = created.headers().location ?? "";
  const id = /^\/marko\/([a-z0-9-]+)\//.exec(location)?.[1];
  if (id === undefined) throw new Error(`no brand from ${location}`);
  return id;
}

const JETZT = "[data-mt-buehne] iframe[data-mt-vorschau]";
const VORSCHLAG = "[data-mt-buehne] iframe[data-mt-vorschau-propono]";

/** One observation: a document, a navigation entry or an assignment of a frame's src. */
interface Eintrag {
  quelle: "sessionStorage" | "performance" | "src" | "framenavigated" | "bindung";
  /** haupt: the page; jetzt: iframe[data-mt-vorschau]; vorschlag: iframe[data-mt-vorschau-propono]. */
  rolle: string;
  schritt: string;
  typ?: string;
  url: string;
  /** When it was noted (performance.timeOrigin + performance.now(), ms since the epoch). */
  zeit?: number;
}

const PROTOKOLL = "fm-navigation-042:protokoll";
const SCHRITT = "fm-navigation-042:schritt";

/** The binding every document of the page and its frames reports its entries to as well. */
const BINDUNG = "fmNavigation042";

/**
 * Runs in every new document of the page and of its frames before their own scripts. The frame is
 * told apart by its element in the page (`frameElement`, same origin). An about:blank document (a
 * frame before its first src) is no navigation of the stage.
 *
 * Every entry has a key of its own. A shared list, read and written back by each document, lost
 * the entries of both frames in Firefox (2 of 30, the step „rev“, whose frames had demonstrably
 * loaded the new rev): the page's next document wrote back a list without them.
 */
function zaehle(schluessel: { protokoll: string; schritt: string; bindung: string }): void {
  if (location.protocol !== "http:") return;
  const rolleOf = (element: Element | null): string => {
    if (element === null) return "haupt";
    if (element.hasAttribute("data-mt-vorschau-propono")) return "vorschlag";
    if (element.hasAttribute("data-mt-vorschau")) return "jetzt";
    return `anderer Rahmen ${element.outerHTML.slice(0, 80)}`;
  };
  const schritt = () => sessionStorage.getItem(schluessel.schritt) ?? "laden-1";
  const notiere = (eintrag: Record<string, string>) => {
    const zeit = performance.timeOrigin + performance.now();
    const key = `${schluessel.protokoll}:${zeit}:${Math.random()}`;
    sessionStorage.setItem(key, JSON.stringify({ ...eintrag, zeit }));
    const bindung = (window as unknown as Record<string, unknown>)[schluessel.bindung];
    if (typeof bindung === "function") bindung({ ...eintrag, zeit });
  };
  const rolle = window === window.top ? "haupt" : rolleOf(window.frameElement);
  notiere({ quelle: "sessionStorage", rolle, schritt: schritt(), url: location.href });
  const eintrag = () =>
    performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  const leistung = (step: string) => {
    const navigation = eintrag();
    notiere({
      quelle: "performance",
      rolle,
      schritt: step,
      typ: navigation?.type ?? "fehlt",
      url: navigation?.name ?? location.href,
    });
  };
  // The entry of the document exists once it is created in every engine read so far; if not yet,
  // it is read when the document's markup is parsed, with the step the document came in.
  if (eintrag() !== undefined) leistung(schritt());
  else {
    const step = schritt();
    document.addEventListener("DOMContentLoaded", () => leistung(step), { once: true });
  }
  if (window !== window.top) return;
  const src = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
  if (src?.set === undefined) return;
  Object.defineProperty(HTMLIFrameElement.prototype, "src", {
    ...src,
    set(this: HTMLIFrameElement, value: string) {
      notiere({ quelle: "src", rolle: rolleOf(this), schritt: schritt(), url: String(value) });
      src.set?.call(this, value);
    },
  });
}

/** Names the step the next documents come in. */
async function schritt(page: Page, name: string, beobachtet: { schritt: string }): Promise<void> {
  beobachtet.schritt = name;
  await page.evaluate(([key, value]) => sessionStorage.setItem(key, value), [
    SCHRITT,
    name,
  ] as const);
}

/** Both frames of the stage have loaded the document of `rev` in `scheme`. */
async function rahmen(page: Page, rev: number, scheme: string): Promise<void> {
  await rahmenBereit(page, JETZT, { rev, scheme });
  await rahmenBereit(page, VORSCHLAG, { rev, scheme });
}

const isStato =
  (id: string, method = "GET") =>
  (response: { url(): string; request(): { method(): string } }) =>
    response.request().method() === method &&
    new URL(response.url()).pathname === `/api/marko/${id}/stato`;

test("Spec 042: the stage navigates only on the test's steps – page and preview frames", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const gebunden: Eintrag[] = [];
  await page.exposeBinding(BINDUNG, (_quelle, eintrag: Eintrag) => {
    gebunden.push({
      ...eintrag,
      quelle: "bindung",
      typ: `${eintrag.quelle}${eintrag.typ === undefined ? "" : ` ${eintrag.typ}`}`,
    });
  });
  await page.addInitScript(zaehle, { protokoll: PROTOKOLL, schritt: SCHRITT, bindung: BINDUNG });
  const beobachtet = { schritt: "laden-1" };
  const hauptrahmen: Eintrag[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame())
      hauptrahmen.push({
        quelle: "framenavigated",
        rolle: "haupt",
        schritt: beobachtet.schritt,
        url: frame.url(),
      });
  });
  const id = await marke(request, "Probomarko Navigation");
  const url = `${base}/asistanto/${id}/gvidkoloro`;

  // Step 1 (goto 1): the page, then each frame once (html.ts: refreshNachher() and refreshFrame()
  // at the end of the client script).
  await page.goto(url);
  await seiteBereit(page, BUEHNE_BEREIT);
  const rev = Number(await page.locator("html").getAttribute("data-mt-rev"));
  await rahmen(page, rev, "light");

  // Steps 2 and 3: dark, then light – each a change of the stage's scheme choice, which sends both
  // frames to the new scheme once (buehne-klient.ts › folgeBuehne: refreshFrame(); refreshNachher()).
  const wahl = page.locator("[data-mt-buehne]").getByRole("radiogroup", { name: "Darstellung" });
  await schritt(page, "dunkel", beobachtet);
  await wahl.getByRole("radio", { name: "Dunkel" }).click();
  await rahmen(page, rev, "dark");
  await schritt(page, "hell", beobachtet);
  await wahl.getByRole("radio", { name: "Hell" }).click();
  await rahmen(page, rev, "light");

  // Step 4 (D-05): a change of the draft elsewhere. The page's poll brings the new rev and sends
  // both frames to it once (html.ts: refreshFrame(); zeigeStato() → refreshNachher()).
  await schritt(page, "rev", beobachtet);
  const abruf = page.waitForResponse(
    async (response) =>
      isStato(id)(response) && ((await response.json()) as { rev: number }).rev > rev,
  );
  const gesetzt = await request.post(`${base}/api/marko/${id}/festlegen`, {
    data: { token: "color.text.subtle", alias: "color.palette.neutral.1000" },
    headers: EIGENE_VERBINDUNG,
  });
  expect(gesetzt.status()).toBe(200);
  const neu = ((await gesetzt.json()) as { rev: number }).rev;
  expect(neu).toBeGreaterThan(rev);
  await (await abruf).finished();
  await rahmen(page, neu, "light");

  // Step 5 (goto 2): the page again, then each frame once.
  await schritt(page, "laden-2", beobachtet);
  await page.goto(url);
  await seiteBereit(page, BUEHNE_BEREIT);
  await expect(page.locator("html")).toHaveAttribute("data-mt-rev", String(neu));
  await rahmen(page, neu, "light");
  // A poll of the new page answers with the rev the page was built with: no navigation. The next
  // tick's request shows that the answer before it was taken in (one interval later); anything it
  // sent a frame to has loaded once the frames are ready again.
  await schritt(page, "danach", beobachtet);
  await (await page.waitForResponse(isStato(id))).finished();
  await page.waitForRequest(
    (anfrage) => new URL(anfrage.url()).pathname === `/api/marko/${id}/stato`,
  );
  await rahmen(page, neu, "light");

  // The entries of the documents, read from sessionStorage (each its own key) in the order they
  // were noted, with the page's framenavigated beside them.
  const lesen = async () => {
    const gespeichert = (
      await page.evaluate((prefix) => {
        const entries: string[] = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (key?.startsWith(`${prefix}:`)) entries.push(sessionStorage.getItem(key) ?? "{}");
        }
        return entries;
      }, PROTOKOLL)
    ).map((entry) => JSON.parse(entry) as Eintrag);
    const protokoll = [
      ...gespeichert.sort((a, b) => (a.zeit ?? 0) - (b.zeit ?? 0)),
      ...hauptrahmen,
    ];
    const liste = (quelle: Eintrag["quelle"], rolle: string) =>
      protokoll
        .filter((eintrag) => eintrag.quelle === quelle && eintrag.rolle === rolle)
        .map((eintrag) =>
          eintrag.typ === undefined ? eintrag.schritt : `${eintrag.schritt} ${eintrag.typ}`,
        );
    bericht = [...protokoll, ...gebunden]
      .map(
        (eintrag) =>
          `${eintrag.quelle} ${eintrag.rolle} ${eintrag.schritt} ${eintrag.typ ?? "-"} ${eintrag.url}`,
      )
      .join("\n");
    return {
      haupt: {
        sessionStorage: liste("sessionStorage", "haupt"),
        performance: liste("performance", "haupt"),
      },
      jetzt: {
        sessionStorage: liste("sessionStorage", "jetzt"),
        performance: liste("performance", "jetzt"),
        src: liste("src", "jetzt"),
      },
      vorschlag: {
        sessionStorage: liste("sessionStorage", "vorschlag"),
        performance: liste("performance", "vorschlag"),
        src: liste("src", "vorschlag"),
      },
      andere: protokoll.filter(
        (eintrag) => !["haupt", "jetzt", "vorschlag"].includes(eintrag.rolle),
      ),
    };
  };
  let bericht = "";
  // The expected list. The page: the two loads of the test, nothing else. Each frame: exactly one
  // document per trigger – load 1, dark, light, the new rev, load 2 – and nothing after load 2.
  // Five per frame, from html.ts and buehne-klient.ts: each trigger assigns the frame's src once
  // (refreshFrame() for „Jetzt“, refreshNachher() for „Mit dem Vorschlag“), each assignment is one
  // navigation of the frame, and the test waits for each frame's document before the next trigger,
  // so no navigation replaces one under way.
  const RAHMEN = ["laden-1", "dunkel", "hell", "rev", "laden-2"];
  const erwartet = {
    haupt: {
      sessionStorage: ["laden-1", "laden-2"],
      performance: ["laden-1 navigate", "laden-2 navigate"],
    },
    jetzt: {
      sessionStorage: RAHMEN,
      performance: RAHMEN.map((step) => `${step} navigate`),
      src: RAHMEN,
    },
    vorschlag: {
      sessionStorage: RAHMEN,
      performance: RAHMEN.map((step) => `${step} navigate`),
      src: RAHMEN,
    },
    andere: [],
  };
  // An entry another process of the browser noted reaches this one's sessionStorage when it
  // reaches it: read until the entries are the expected ones or the expectation's time is over.
  // An extra navigation stays in the list and keeps it unequal.
  try {
    await expect.poll(lesen).toEqual(erwartet);
  } catch (error) {
    throw new Error(
      `every navigation of the stage (source role step type URL):\n${bericht}\n\n${String(error)}`,
    );
  }
  // framenavigated of the page decides nothing (Firefox misses events), but more than the test's
  // two loads is a navigation of its own as well.
  expect(
    hauptrahmen.filter((eintrag) => !["laden-1", "laden-2"].includes(eintrag.schritt)),
    `framenavigated of the page outside the test's loads:\n${bericht}`,
  ).toEqual([]);
});

// Spec 043 / N-8 aus Spec 042: after the page loads anew, the navigation of the frame „Jetzt“ is cut
// short (NS_BINDING_ABORTED in Firefox). Until now the page sent the frame again only on a new rev
// of its poll, so with the same rev never. Made here without a clock: the test aborts the frame's
// first request after the reload (`route.abort`); the frame must still show the draft's rev within
// the default expect time.
test("Spec 043 / N-8 aus Spec 042: a frame whose navigation was aborted after the reload loads at once", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const id = await marke(request, "Probomarko Abbruch");
  await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
  await seiteBereit(page, BUEHNE_BEREIT);
  const rev = Number(await page.locator("html").getAttribute("data-mt-rev"));
  await rahmen(page, rev, "light");

  // The document of „Jetzt“: /marko/<id>/vorschau without `propono` (that is „Mit dem Vorschlag“).
  const abgebrochen: string[] = [];
  await page.route(
    (url) => url.pathname === `/marko/${id}/vorschau` && !url.searchParams.has("propono"),
    async (route) => {
      if (abgebrochen.length > 0) return route.fallback();
      abgebrochen.push(route.request().url());
      return route.abort();
    },
  );
  const vorher = await dokument(page);
  await page.reload();
  await seiteBereit(page, BUEHNE_BEREIT, vorher);
  await rahmenBereit(page, JETZT, { rev, scheme: "light" });
  await rahmenBereit(page, VORSCHLAG, { rev, scheme: "light" });
  expect(abgebrochen, "the first request of „Jetzt“ after the reload was aborted").toHaveLength(1);
});
