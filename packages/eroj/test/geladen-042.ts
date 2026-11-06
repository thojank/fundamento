// Spec 042 (V-3): the loaded state of a screen and of its preview frames, read from the page that
// holds them – never from `framenavigated` (Firefox misses it, Spec 041 B-9/B-15), never on the wall
// clock, always with `expect.poll` under the default expect timeout.
//
// Spec 042, Befund „Execution context destroyed“ (run 42113762271, Chromium, buehne-036.spec.ts:187):
// a read inside a preview frame (`frameLocator(…).evaluate`) while the frame navigates throws, and an
// error of `expect.poll`'s callback ends the poll at once (playwright 1.63, matchers/expect.js). The
// helpers here read the frame's document through `contentDocument` from the page around it, whose
// context a navigation of the frame does not touch.

import { expect, type Page } from "@playwright/test";

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
 * The screen is loaded and usable: `merkmal` stands in it and `document.readyState` is "complete".
 * After an action that loads the screen anew, pass the `dokument()` read before it as `nicht`: the
 * old document carries the marker as well, so only another document counts. Resolves with the
 * loaded document's `dokument()`.
 */
export async function seiteBereit(page: Page, merkmal: string, nicht?: number): Promise<number> {
  const lesen = async () => {
    try {
      return await page.evaluate(
        ([selector, alt]) => ({
          merkmal: document.querySelector(selector) !== null,
          readyState: document.readyState,
          neu: alt === null || performance.timeOrigin !== alt,
        }),
        [merkmal, nicht ?? null] as const,
      );
    } catch (error) {
      if (zwischenDokumenten(error)) return { merkmal: false, readyState: "zwischen", neu: false };
      throw error;
    }
  };
  await expect
    .poll(lesen, `the screen is loaded (${merkmal}, readyState complete)`)
    .toEqual({ merkmal: true, readyState: "complete", neu: true });
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
        if (doc === null || doc.URL === "about:blank" || frame.src === "")
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
