// Spec 040 B-2: help for the Studio spec (studio-035.spec.ts) against a flaky network error of the
// test tool, not of the product.

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
