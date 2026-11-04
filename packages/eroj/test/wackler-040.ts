// Spec 040 B-2 and B-5: help for the Studio spec (studio-035.spec.ts) and the Zweitfarbe spec
// (zweitfarbe-036.spec.ts) against flaky waits – they wait for an event, not for the clock, and
// change nothing in the product.

import { expect, type Page, type Response } from "@playwright/test";

/**
 * Sends once more when the first attempt met a connection the server had already closed
 * (`read ECONNRESET`). The request context of Playwright keeps its connection to the Metiejo
 * alive between two reads; Node's server closes an idle connection after its keep-alive time, and a
 * read sent at that moment meets a closed connection (runs 41827472808 and 41842873743, WebKit,
 * `stand()`). Only for reads that change nothing; a second reset, and any other error, is thrown.
 */
export async function nachEinemReset<T>(send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("ECONNRESET")) throw error;
    return send();
  }
}

/** A POST of the page to /api/marko/<id>/<aktion>. */
const post =
  (id: string, aktion: string) =>
  (response: Response): boolean =>
    response.request().method() === "POST" &&
    new URL(response.url()).pathname === `/api/marko/${id}/${aktion}`;

/**
 * The preview of the page (iframe[data-mt-vorschau]) has loaded the document of `rev` – by default
 * the rev the page was built with (html[data-mt-rev]); nothing to wait for on a page without one.
 * It waits for the navigation itself, not within an expectation's wait: a busy Metiejo answers the
 * preview late (3.5 s under load, while it checks the draft). WebKit dropped a navigation of the
 * preview that started while the previous one was still loading (Spec 040 B-5), so a change waits
 * for this first.
 */
export async function vorschauGeladen(page: Page, rev?: number): Promise<void> {
  const rahmen = page.locator("iframe[data-mt-vorschau]");
  if ((await rahmen.count()) === 0) return;
  const frame = await (await rahmen.elementHandle())?.contentFrame();
  if (frame === null || frame === undefined) throw new Error("the preview has no frame");
  const ziel = rev ?? Number(await page.locator("html").getAttribute("data-mt-rev"));
  const neu = new RegExp(`[?&]rev=${ziel}(&|$)`);
  if (!neu.test(frame.url()))
    await page.waitForEvent(
      "framenavigated",
      (navigiert) => navigiert === frame && neu.test(navigiert.url()),
    );
  await frame.waitForLoadState("load");
}

/**
 * The live save of a step has settled (Spec 040 B-5); call it before the change, await it after.
 * Resolves with the rev of the draft's answer to the sending whose patch `traegt` accepts, once
 * - the draft answered that sending (POST /api/marko/<id>/entwurf),
 * - the preview the answer reloads loaded that rev (vorschauGeladen), if the page has one,
 * - the check the step Farbe runs after a save (POST /api/marko/<id>/pruefung) answered, if it runs.
 * A reload before that cuts a navigation of the preview or a request of the page short; WebKit
 * failed such a reload with "internal error" (run 41873907893, zweitfarbe-036.spec.ts).
 */
export async function gespeichert(
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
    await vorschauGeladen(page, rev);
    // As the page decides it (metiejo's html.ts): the step Farbe checks when it has a place for it.
    const prueft = await page.evaluate(
      () =>
        document.documentElement.getAttribute("data-mt-sxtupo") === "farbe" &&
        document.getElementById("mt-pruefung") !== null,
    );
    if (prueft) await pruefung;
    return rev;
  } finally {
    page.off("response", hoeren);
  }
}
