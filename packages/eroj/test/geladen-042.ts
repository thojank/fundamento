// Spec 042 (V-3): the loaded state of a screen and of its preview frames, read from the page that
// holds them – never from `framenavigated` (Firefox misses it, Spec 041 B-9/B-15), never on the wall
// clock, always with `expect.poll` under the default expect timeout.
//
// Spec 042, Befund „Execution context destroyed“ (run 42113762271, Chromium, buehne-036.spec.ts:187):
// a read inside a preview frame (`frameLocator(…).evaluate`) while the frame navigates throws, and an
// error of `expect.poll`'s callback ends the poll at once (playwright 1.63, matchers/expect.js). The
// helpers here read the frame's document through `contentDocument` from the page around it, whose
// context a navigation of the frame does not touch.

import { expect, type Page, type Response } from "@playwright/test";

/** The marker of a usable stage: the client bound every handler (`buehne-klient.ts`). */
export const BUEHNE_BEREIT = "[data-mt-buehne][data-mt-bereit]";

/**
 * Where `dokument()` keeps its mark: a property of the document's window, which every document has
 * its own of (a reload or a navigation brings a new window).
 */
const MARKE = "__fmDokument050";

/**
 * Which document the page shows: a number the first read lays on the document's window, its own for
 * every document. Spec 051 T3 (B-14): not `performance.timeOrigin` any more – WebKit reported a
 * value 1 ms higher for the same document seconds later, so the old page passed for a new one.
 */
export function dokument(page: Page): Promise<number> {
  return page.evaluate((marke) => {
    const fenster = window as unknown as Record<string, number | undefined>;
    fenster[marke] ??= Math.random();
    return fenster[marke];
  }, MARKE);
}

/**
 * The page stands between two documents: its old context was destroyed under the read. That is a
 * state of the page while it loads, not an error; every other error is thrown.
 */
function zwischenDokumenten(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Execution context was destroyed");
}

/**
 * Spec 051 T3: a read from the page that the page's navigation cut short (its context destroyed)
 * gives `sonst`, the value of "not loaded yet"; every other error is thrown. Only for reads, never
 * for an action (Spec 042 D-15).
 */
export async function lesenOder<T>(lesen: () => Promise<T>, sonst: T): Promise<T> {
  try {
    return await lesen();
  } catch (error) {
    if (zwischenDokumenten(error)) return sonst;
    throw error;
  }
}

/**
 * The screen is loaded and usable: `merkmal` stands in it and `document.readyState` is no longer
 * "loading" (its markup is parsed). After an action that loads the screen anew, pass the
 * `dokument()` read before it as `nicht`: the old document carries the marker as well, so only
 * another document counts. Resolves with the loaded document's `dokument()`.
 *
 * Spec 043 T2: not "complete". A page is "complete" only once its frames have loaded, and a preview
 * frame waits behind whatever the server does first (run 42180054807, Chromium: the cold render of
 * a new rev or the check, 3.3–4.3 s), so a usable page stayed "interactive" past the expectation's
 * time. The frames are `rahmenBereit`'s: every caller with a preview checks it after this one,
 * itself or through `schrittBereit`. "interactive" also comes before the page's module scripts ran
 * (metiejo's client is one): a marker the server writes into the markup does not show that the
 * client ran, a frame with its document does (only the client sends a frame), as does a request
 * the client made (`abrufBeantwortet`).
 */
export async function seiteBereit(page: Page, merkmal: string, nicht?: number): Promise<number> {
  const lesen = async () => {
    try {
      return await page.evaluate(
        ([selector, alt, marke]) => ({
          merkmal: document.querySelector(selector) !== null,
          geladen: document.readyState !== "loading",
          neu: alt === null || (window as unknown as Record<string, unknown>)[marke] !== alt,
        }),
        [merkmal, nicht ?? null, MARKE] as const,
      );
    } catch (error) {
      if (zwischenDokumenten(error)) return { merkmal: false, geladen: false, neu: false };
      throw error;
    }
  };
  await expect
    .poll(lesen, `the screen is loaded (${merkmal}, readyState not loading)`)
    .toEqual({ merkmal: true, geladen: true, neu: true });
  return dokument(page);
}

/** What a preview frame expects to show: the draft's rev and light or dark. */
export interface RahmenErwartung {
  rev?: number;
  scheme?: string;
}

/**
 * A preview frame (`rahmen`, a selector of its iframe in the page) has loaded the document it was
 * last sent to: `contentDocument.readyState` is "complete" and its URL is the frame's `src` (a
 * navigation still under way shows the old document under a new `src`). With `rev` and `scheme` the
 * document is the one of that rev (its URL) and shows that scheme (`data-fm-color-scheme` of its
 * root, which the preview renders from the URL).
 */
export async function rahmenBereit(
  page: Page,
  rahmen: string,
  erwartet: RahmenErwartung = {},
): Promise<void> {
  const lesen = async () => {
    try {
      return await page.locator(rahmen).evaluate((element) => {
        const frame = element as HTMLIFrameElement;
        const doc = frame.contentDocument;
        // Spec 043 T2: a document the frame is just switching to may have no root yet (Firefox,
        // 1 of 30 local runs, Spec 043 plan.md › Befunde): not loaded yet, as about:blank is.
        if (
          doc === null ||
          doc.URL === "about:blank" ||
          frame.src === "" ||
          doc.documentElement === null
        )
          return { geladen: false, rev: null, scheme: null };
        const url = new URL(doc.URL);
        return {
          geladen: doc.readyState === "complete" && doc.URL === frame.src,
          rev: Number(url.searchParams.get("rev")),
          scheme: doc.documentElement.getAttribute("data-fm-color-scheme"),
        };
      });
    } catch (error) {
      if (zwischenDokumenten(error)) return { geladen: false, rev: null, scheme: null };
      throw error;
    }
  };
  await expect.poll(lesen, `the frame ${rahmen} is loaded (${JSON.stringify(erwartet)})`).toEqual({
    geladen: true,
    rev: erwartet.rev ?? expect.any(Number),
    scheme: erwartet.scheme ?? expect.any(String),
  });
}

/**
 * The preview frame of a step (assistant, Schnellstart, Studio): the first `iframe[data-mt-vorschau]`,
 * the one the page's script sends to the draft's rev (metiejo's `html.ts`, `refreshFrame()`).
 */
export const VORSCHAU = "iframe[data-mt-vorschau]";

/**
 * A request of the page's current document to `pfad` has been answered, body included: the
 * document's Resource Timing has an entry for it (an entry is added once the response ended, and
 * every document has its own timeline, so a request of the document before does not count).
 */
export async function abrufBeantwortet(page: Page, pfad: string): Promise<void> {
  const lesen = async () => {
    try {
      return await page.evaluate(
        (gesucht) =>
          performance
            .getEntriesByType("resource")
            .some((eintrag) => new URL(eintrag.name).pathname === gesucht),
        pfad,
      );
    } catch (error) {
      if (zwischenDokumenten(error)) return false;
      throw error;
    }
  };
  await expect.poll(lesen, `the page's request to ${pfad} is answered`).toBe(true);
}

/** As the page decides it (metiejo's html.ts): the step Farbe checks the draft when it has a place for it. */
function prueft(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.getAttribute("data-mt-sxtupo") === "farbe" &&
      document.getElementById("mt-pruefung") !== null,
  );
}

/**
 * Spec 042 T3: a step of a brand (`id`) has settled after it loaded – the Spec 040 B-5 conditions,
 * read as states instead of `framenavigated` (run 42103645313, Firefox, zweitfarbe-036.spec.ts:140
 * waited 120 s for a `framenavigated` of the preview):
 * - `seiteBereit(page, merkmal, nicht)`: the marker stands and `readyState` is not "loading",
 * - the check the step Farbe runs on load (POST /api/marko/<id>/pruefung) has answered,
 * - the preview, if the step has one, has loaded the rev the page was built with (`html[data-mt-rev]`).
 * Spec 043 T2: the check before the preview, in the order the server answers them. The check holds
 * the server while it runs, and the preview's document or its stylesheet waits behind it: measured
 * on the Schnellstart's colour step after „Keine Zweitfarbe“, the frame finished 0.2–0.3 s after the
 * check's answer in 15 of 15 local loads (three engines), never before; in run 42180054807 the check
 * took 4.2 s. Either is read under the default expectation time, from the event it follows.
 * Only the client makes either, so either shows that the client ran.
 * Resolves with the loaded document's `dokument()`.
 */
export async function schrittBereit(
  page: Page,
  id: string,
  merkmal: string,
  nicht?: number,
): Promise<number> {
  const geladen = await seiteBereit(page, merkmal, nicht);
  if (await prueft(page)) await abrufBeantwortet(page, `/api/marko/${id}/pruefung`);
  if ((await page.locator(VORSCHAU).count()) > 0) {
    const rev = Number(await page.locator("html").getAttribute("data-mt-rev"));
    await rahmenBereit(page, VORSCHAU, { rev });
  }
  return geladen;
}

/** A POST of the page to /api/marko/<id>/<aktion>. */
const post =
  (id: string, aktion: string) =>
  (response: Response): boolean =>
    response.request().method() === "POST" &&
    new URL(response.url()).pathname === `/api/marko/${id}/${aktion}`;

/** The navigation of the page's own document (a goto, a reload, a link). */
const dokumentDer =
  (page: Page) =>
  (response: Response): boolean =>
    response.request().isNavigationRequest() && response.frame() === page.mainFrame();

/**
 * The navigation of the preview (`VORSCHAU`, not the frame with the proposal) to the document of
 * `rev`: /marko/<id>/vorschau?…&rev=<rev>, which the server answers only once it checked that rev
 * (`buehne-*`, Spec 044 D-01).
 */
const vorschauVon =
  (id: string, rev: number) =>
  (response: Response): boolean => {
    if (!response.request().isNavigationRequest()) return false;
    const url = new URL(response.url());
    return (
      url.pathname === `/marko/${id}/vorschau` &&
      url.searchParams.get("rev") === String(rev) &&
      !url.searchParams.has("propono")
    );
  };

/**
 * Spec 051 T3 (K2, testing.md › „Playwright stability patterns“): the page's responses from now on,
 * in the order they came. Made before the action whose answers a test waits for. `antwort` waits
 * for the first response after the index `ab` that `passt` and gives its index; it is bounded by
 * the test's own time only, never by an expectation's window. The answers it waits for stand behind
 * a server computation – the check of a rev, the frame of a new rev, a page the server checks before
 * it writes it – which took 3.9 to more than 11 s on CI runners (Spec 051 plan.md › T-A, T-B),
 * longer than the window of 5 s that polled for them before. What the page then shows is still
 * read as a state, under the default expect window.
 */
function antwortenAb(page: Page): {
  antwort: (passt: (response: Response) => boolean, ab?: number) => Promise<number>;
  bei: (stelle: number) => Response;
  aufhoeren: () => void;
} {
  const antworten: Response[] = [];
  let weiter = (): void => undefined;
  const hoeren = (response: Response): void => {
    antworten.push(response);
    weiter();
  };
  page.on("response", hoeren);
  return {
    async antwort(passt, ab = 0) {
      for (;;) {
        const index = antworten.findIndex((response, stelle) => stelle >= ab && passt(response));
        if (index >= 0) return index;
        await new Promise<void>((done) => {
          weiter = done;
        });
      }
    },
    bei: (stelle) => {
      const response = antworten[stelle];
      if (response === undefined) throw new Error(`no response at ${stelle}`);
      return response;
    },
    aufhoeren: () => page.off("response", hoeren),
  };
}

/**
 * Spec 051 T3 (K2): `schrittBereit` for a load whose answers stand behind a server computation (T-A,
 * T-B). Call it **before** the action that loads the step (page.goto, page.reload, a button whose
 * answer reloads the page) and call what it returns after that action; it resolves with the loaded
 * document's `dokument()`, once
 * - the server answered the page's document (the assistant checks a new rev before it writes the
 *   page: 2.2–2.5 s locally under CPU load after „Keine Zweitfarbe“, Spec 051 B-14), then
 *   `seiteBereit(page, merkmal, nicht)` as in `schrittBereit`,
 * - where the step checks: the check of this document answered (POST …/pruefung, after the
 *   document's answer), then `abrufBeantwortet` as in `schrittBereit`,
 * - where the step has a preview: the server answered the preview's document of the page's rev,
 *   then `rahmenBereit(page, VORSCHAU, { rev })` as in `schrittBereit`.
 * Each wait for an answer is bounded by the test's time only; each state after it is read under
 * the default expect window, as `schrittBereit` reads it.
 */
export function schrittLaedt(
  page: Page,
  id: string,
  merkmal: string,
  nicht?: number,
): () => Promise<number> {
  const gehoert = antwortenAb(page);
  return async () => {
    try {
      const seite = await gehoert.antwort(dokumentDer(page));
      const geladen = await seiteBereit(page, merkmal, nicht);
      if (await prueft(page)) {
        await gehoert.antwort(post(id, "pruefung"), seite + 1);
        await abrufBeantwortet(page, `/api/marko/${id}/pruefung`);
      }
      if ((await page.locator(VORSCHAU).count()) > 0) {
        const rev = Number(await page.locator("html").getAttribute("data-mt-rev"));
        await gehoert.antwort(vorschauVon(id, rev), seite + 1);
        await rahmenBereit(page, VORSCHAU, { rev });
      }
      return geladen;
    } finally {
      gehoert.aufhoeren();
    }
  };
}

/**
 * Spec 042 T3: the live save of a step has settled (Spec 040 B-5); call it before the change, await
 * it after. Resolves with the rev of the draft's answer to the sending whose patch `traegt` accepts,
 * once
 * - the draft answered that sending (POST /api/marko/<id>/entwurf),
 * - the preview, if the step has one, has loaded that rev (`rahmenBereit`, not `framenavigated`),
 * - the check the step Farbe runs after a save (POST /api/marko/<id>/pruefung) answered, if it runs.
 * The page stays the same document meanwhile, so the answers are read as they come.
 * Spec 051 T3 (K2, T-A): the preview of a new rev is answered only after the server checked that
 * rev (3.9 to more than 11 s on CI runners), so the server's answer to the preview's navigation is
 * waited for first, bounded by the test's time only; then `rahmenBereit` reads the loaded frame
 * under the default window, as before.
 */
export async function entwurfGespeichert(
  page: Page,
  id: string,
  traegt: (patch: unknown) => boolean,
): Promise<number> {
  // Listens from the call on (before the change), as page.waitForResponse did here before.
  const gehoert = antwortenAb(page);
  try {
    const gesendet = await gehoert.antwort(
      (response) => post(id, "entwurf")(response) && traegt(response.request().postDataJSON()),
    );
    const antwort = gehoert.bei(gesendet);
    expect(antwort.status()).toBe(200);
    const { rev } = (await antwort.json()) as { rev: number };
    // The preview and the check follow the draft's answer: only answers after it count.
    if ((await page.locator(VORSCHAU).count()) > 0) {
      await gehoert.antwort(vorschauVon(id, rev), gesendet + 1);
      await rahmenBereit(page, VORSCHAU, { rev });
    }
    if (await prueft(page)) await gehoert.antwort(post(id, "pruefung"), gesendet + 1);
    return rev;
  } finally {
    gehoert.aufhoeren();
  }
}
