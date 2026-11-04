// Spec 040 B-2 and B-5: help for the Studio spec (studio-035.spec.ts) and the Zweitfarbe spec
// (zweitfarbe-036.spec.ts) against flaky waits – they wait for an event, not for the clock, and
// change nothing in the product.

import type { Page, Response } from "@playwright/test";

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
 * The live save of a step has settled (Spec 040 B-5); call it before the change, await it after.
 * Resolves with the rev of the draft's answer to the sending whose patch `traegt` accepts.
 */
export async function gespeichert(
  page: Page,
  id: string,
  traegt: (patch: unknown) => boolean,
): Promise<number> {
  const antwort = await page.waitForResponse(
    (response) => post(id, "entwurf")(response) && traegt(response.request().postDataJSON()),
  );
  return ((await antwort.json()) as { rev: number }).rev;
}
