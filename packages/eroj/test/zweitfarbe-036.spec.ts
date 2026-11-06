// Spec 036, Befund 2.2 (V-2, Teil 2 von 2) in the browser: the step „Leitfarbe und Akzente“ of the
// Markenassistent and the Schnellstart's colour step show the Zweitfarbe, edit it and clear it –
// with the keyboard, named for a screen reader, without errors in the console. The Metiejo is
// started as a person starts it (`fm metiejo`), with an invented brand, without a model.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import { BUEHNE_BEREIT, dokument, entwurfGespeichert, schrittBereit } from "./geladen-042.js";
import { nachDerAbfrage } from "./wackler-040.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";
let stopping = false;

/** Starts the Metiejo on a port of 7351–7359; the server says its URL once it listens. */
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
        console.error(`the Metiejo on ${port} ended (${code ?? signal}) before the tests did`);
      done(undefined);
    });
  });
}

test.beforeAll(async () => {
  server = undefined;
  stopping = false;
  workdir = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-036-"));
  const first = test.info().workerIndex;
  for (let attempt = 0; attempt < 9 && server === undefined; attempt += 1) {
    const port = 7351 + ((first + attempt) % 9);
    server = await start(port);
    if (server !== undefined) base = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7351–7359");
});

test.afterAll(() => {
  stopping = true;
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

/** Creates an invented brand (the Schnellstart's form, empty basis) and returns its identifier. */
async function marke(request: APIRequestContext, name: string): Promise<string> {
  const created = await request.post(`${base}/marko`, {
    form: { name, basis: "leer" },
    maxRedirects: 0,
  });
  expect(created.status()).toBe(303);
  const id = /^\/marko\/([a-z0-9-]+)\//.exec(created.headers().location ?? "")?.[1];
  if (id === undefined) throw new Error("no brand");
  return id;
}

/** The Zweitfarbe of the draft on disk (entwurf.json, else the save) – reading changes nothing. */
function zweitfarbe(id: string): { farbe: string; herkunft?: unknown } | undefined {
  const file = join(
    workdir,
    id,
    existsSync(join(workdir, id, "entwurf.json")) ? "entwurf.json" : "agordo.json",
  );
  return (JSON.parse(readFileSync(file, "utf8")) as { zweitfarbe?: { farbe: string } }).zweitfarbe;
}

/** Errors of the page and of its console, collected while a test runs. */
function errorsOf(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

/** The answer of the draft to the field's live change. */
const entwurf = (page: Page, id: string) =>
  page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === `/api/marko/${id}/entwurf`,
  );

// The assistant's steps poll the draft every 3 s (GET …/stato); the Schnellstart's do not. Each
// place has its own marker of a loaded screen (Spec 042 T3): the assistant's stage sets
// `data-mt-bereit` once its client bound every handler; the Schnellstart has no such marker, so its
// Zweitfarbe block stands for it, together with `readyState` "complete" (its module scripts ran).
for (const [ort, pfad, pollt, merkmal] of [
  [
    "the assistant's step „Leitfarbe und Akzente“",
    (id: string) => `/asistanto/${id}/gvidkoloro`,
    true,
    BUEHNE_BEREIT,
  ],
  [
    "the Schnellstart's colour step",
    (id: string) => `/marko/${id}/farbe`,
    false,
    "[data-mt-zweitfarbe]",
  ],
] as const) {
  test(`${ort}: „Keine Zweitfarbe“, a colour typed with the keyboard, then cleared`, async ({
    page,
    request,
  }) => {
    const errors = errorsOf(page);
    const id = await marke(request, `Dukolora ${ort.length}`);
    // Spec 040 B-5: the test changes the step only once the page it loaded has settled – loaded,
    // its preview of the page's rev loaded, its check on load answered. Spec 042 T3: read as states
    // of the page (`geladen-042.ts`), never as `framenavigated`, which Firefox missed for the preview
    // in run 42103645313 (the test waited its whole 120 s at the reload below).
    await page.goto(`${base}${pfad(id)}`);
    await schrittBereit(page, id, merkmal);
    const block = page.locator("[data-mt-zweitfarbe]");
    await expect(block).toHaveAttribute("data-mt-zweitfarbe", "keine");
    await expect(block.locator("[data-mt-zweitfarbe-stand]")).toHaveText("Keine Zweitfarbe");

    // Named for a screen reader, reached and filled with the keyboard.
    const feld = page.getByRole("textbox", { name: /^Zweitfarbe/ });
    await feld.focus();
    await expect(feld).toBeFocused();
    // Spec 040 B-5: reload only once the save has settled – the draft's answer to the whole colour,
    // the preview of its rev, the step's check – not while the page is still busy with it.
    const gesetzt = entwurfGespeichert(
      page,
      id,
      (patch) => (patch as { zweitfarbe?: { farbe?: unknown } }).zweitfarbe?.farbe === "#0f8f86",
    );
    await page.keyboard.type("#0f8f86");
    await gesetzt;
    await expect.poll(() => zweitfarbe(id)).toEqual({ farbe: "#0f8f86" });

    // And press „Keine Zweitfarbe“ only once the reloaded page has settled as well (Spec 040 B-5).
    const vorDemNeuladen = await dokument(page);
    await page.reload();
    await schrittBereit(page, id, merkmal, vorDemNeuladen);
    await expect(block).toHaveAttribute("data-mt-zweitfarbe", "#0f8f86");
    await expect(page.getByRole("img", { name: "Zweitfarbe #0f8f86" })).toBeVisible();
    await expect(block.locator("[data-mt-zweitfarbe-stand]")).toContainText("Von dir gesetzt");

    // „Keine Zweitfarbe“ clears it: by the keyboard, and the step says so after the reload.
    const entfernen = page.getByRole("button", { name: "Keine Zweitfarbe" });
    await entfernen.focus();
    const geloescht = entwurf(page, id);
    // The button reloads the page once the draft took the patch: wait for another document than
    // this one to be loaded and settled, not for an event of the navigation (Spec 042 T3).
    const vorDemLoeschen = await dokument(page);
    // Press it right after the page's poll of the draft answered, not while one is under way: the
    // reload would cut it short (Spec 040 B-8).
    if (pollt) await nachDerAbfrage(page, id);
    await page.keyboard.press("Enter");
    expect((await geloescht).status()).toBe(200);
    await expect.poll(() => zweitfarbe(id)).toBeUndefined();
    await schrittBereit(page, id, merkmal, vorDemLoeschen);
    await expect(page.locator("[data-mt-zweitfarbe]")).toHaveAttribute(
      "data-mt-zweitfarbe",
      "keine",
    );
    await expect(page.getByRole("button", { name: "Keine Zweitfarbe" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("the Zweitfarbe from material shows its origin in the step", async ({ page, request }) => {
  const errors = errorsOf(page);
  const id = await marke(request, "Dukolora Material");
  const set = await request.post(`${base}/api/marko/${id}/entwurf`, {
    data: {
      zweitfarbe: {
        farbe: "#0f8f86",
        herkunft: { quelle: "bild", datei: "probe.png", merkmal: "Farbe #0f8f86", anteil: 20 },
      },
    },
  });
  expect(set.status()).toBe(200);
  await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
  await schrittBereit(page, id, BUEHNE_BEREIT);
  const stand = page.locator("[data-mt-zweitfarbe-stand]");
  await expect(stand).toContainText("probe.png");
  await expect(stand).toContainText("20 % der gefundenen Farbe");
  await expect(page.getByRole("textbox", { name: /^Zweitfarbe/ })).toHaveValue("#0f8f86");
  expect(errors).toEqual([]);
});
