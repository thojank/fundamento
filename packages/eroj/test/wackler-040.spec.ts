// Spec 040 B-5: gespeichert() lets the Zweitfarbe spec reload only after the live save has settled.
// A page of its own does what a step of the Metiejo does after a live change: it sends the patch to
// the draft, its preview follows the new rev, and the step Farbe checks the draft. The server holds
// the preview and the check until the test lets them go, so the order is fixed by events alone:
// while one of them is open the save has not settled.

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test } from "@playwright/test";
import { gespeichert } from "./wackler-040.js";

const SEITE = `<!doctype html>
<html lang="de" data-mt-sxtupo="farbe"><head><title>Probe</title></head><body>
<input id="feld" aria-label="Zweitfarbe"><div id="mt-pruefung"></div>
<iframe data-mt-vorschau src="/vorschau?rev=1" title="Vorschau"></iframe>
<script>
const frame = document.querySelector("iframe[data-mt-vorschau]");
document.getElementById("feld").addEventListener("input", async (event) => {
  const patch = { zweitfarbe: { farbe: event.target.value } };
  const response = await fetch("/api/marko/probe/entwurf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
  const body = await response.json();
  frame.src = "/vorschau?rev=" + body.rev;
  await fetch("/api/marko/probe/pruefung", { method: "POST" });
});
</script></body></html>`;

/** A request the server holds: known once it came, answered once the test lets it go. */
interface Gehalten {
  gekommen: Promise<void>;
  freigeben: () => void;
}

function halten(antworten: (response: ServerResponse) => void): {
  gehalten: Gehalten;
  annehmen: (response: ServerResponse) => void;
} {
  let gekommen!: () => void;
  let offen: ServerResponse | undefined;
  let frei = false;
  const gehalten: Gehalten = {
    gekommen: new Promise<void>((done) => {
      gekommen = done;
    }),
    freigeben: () => {
      frei = true;
      if (offen !== undefined) antworten(offen);
    },
  };
  return {
    gehalten,
    annehmen: (response) => {
      offen = response;
      gekommen();
      if (frei) antworten(response);
    },
  };
}

let server: Server;
let base = "";
let vorschau: ReturnType<typeof halten>;
let pruefung: ReturnType<typeof halten>;

function html(response: ServerResponse, body: string): void {
  response.setHeader("content-type", "text/html; charset=utf-8");
  response.end(body);
}

function antworte(request: IncomingMessage, response: ServerResponse): void {
  const url = new URL(request.url ?? "/", base);
  if (url.pathname === "/seite") html(response, SEITE);
  else if (url.pathname === "/vorschau" && url.searchParams.get("rev") === "1")
    html(response, "<!doctype html><p>rev 1</p>");
  else if (url.pathname === "/vorschau") vorschau.annehmen(response);
  else if (url.pathname === "/api/marko/probe/pruefung") pruefung.annehmen(response);
  else if (url.pathname === "/api/marko/probe/entwurf") {
    request.resume();
    request.on("end", () => {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ rev: 2 }));
    });
  } else {
    response.statusCode = 404;
    response.end();
  }
}

test.beforeAll(async () => {
  server = createServer(antworte);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
});

test("gespeichert() waits for the draft's answer, the preview of its rev and the check (Spec 040 B-5)", async ({
  page,
}) => {
  vorschau = halten((response) => html(response, "<!doctype html><p>rev 2</p>"));
  pruefung = halten((response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ html: "" }));
  });
  await page.goto(`${base}/seite`);
  let fertig = false;
  const gesetzt = gespeichert(
    page,
    "probe",
    (patch) => (patch as { zweitfarbe?: { farbe?: string } }).zweitfarbe?.farbe === "#0f8f86",
  ).then((rev) => {
    fertig = true;
    return rev;
  });
  await page.locator("#feld").fill("#0f8f86");

  // The draft answered and the page asked for the preview of rev 2 and for the check: not settled.
  await vorschau.gehalten.gekommen;
  await pruefung.gehalten.gekommen;
  await page.evaluate(() => document.readyState);
  expect(fertig).toBe(false);

  // The preview of rev 2 loaded, the check is still open: not settled.
  vorschau.gehalten.freigeben();
  const rahmen = page.frameLocator("iframe[data-mt-vorschau]");
  await expect(rahmen.locator("p")).toHaveText("rev 2");
  await page.evaluate(() => document.readyState);
  expect(fertig).toBe(false);

  // The check answered: settled, with the rev of the draft's answer.
  pruefung.gehalten.freigeben();
  expect(await gesetzt).toBe(2);
});
