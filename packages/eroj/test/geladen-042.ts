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

/** Which document the page shows: its `performance.timeOrigin`, its own for every document. */
export function dokument(page: Page): Promise<number> {
  return page.evaluate(() => performance.timeOrigin);
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
        ([selector, alt]) => ({
          merkmal: document.querySelector(selector) !== null,
          geladen: document.readyState !== "loading",
          neu: alt === null || performance.timeOrigin !== alt,
        }),
        [merkmal, nicht ?? null] as const,
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

/**
 * Spec 042 T3: the live save of a step has settled (Spec 040 B-5); call it before the change, await
 * it after. Resolves with the rev of the draft's answer to the sending whose patch `traegt` accepts,
 * once
 * - the draft answered that sending (POST /api/marko/<id>/entwurf),
 * - the preview, if the step has one, has loaded that rev (`rahmenBereit`, not `framenavigated`),
 * - the check the step Farbe runs after a save (POST /api/marko/<id>/pruefung) answered, if it runs.
 * The page stays the same document meanwhile, so the answers are read as they come.
 */
export async function entwurfGespeichert(
  page: Page,
  id: string,
  traegt: (patch: unknown) => boolean,
): Promise<number> {
  // The check follows the draft's answer: only a check answered after it counts.
  let nachDerAntwort = false;
  let geprueft = (): void => undefined;
  const pruefung = new Promise<void>((done) => {
    geprueft = done;
  });
  const hoeren = (response: Response): void => {
    if (nachDerAntwort && post(id, "pruefung")(response)) geprueft();
  };
  page.on("response", hoeren);
  try {
    const antwort = await page.waitForResponse(
      (response) => post(id, "entwurf")(response) && traegt(response.request().postDataJSON()),
    );
    nachDerAntwort = true;
    expect(antwort.status()).toBe(200);
    const { rev } = (await antwort.json()) as { rev: number };
    if ((await page.locator(VORSCHAU).count()) > 0) await rahmenBereit(page, VORSCHAU, { rev });
    if (await prueft(page)) await pruefung;
    return rev;
  } finally {
    page.off("response", hoeren);
  }
}
