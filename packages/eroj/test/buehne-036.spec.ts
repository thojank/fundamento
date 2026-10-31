// Spec 036 Teil 3 (Skizze 1 aus Spec 035, vom Maintainer gewählt): the assistant becomes a stage.
// Started as a person starts it (`fm metiejo`), with an invented brand and without a language model.
// 3.1: the preview is the stage – about two thirds of the content width at a wide window (the
// tolerance is the grid's own gutter, a token of the Vortaro) – and shows a page of real Eroj (head,
// buttons, card, form, messages) in light and in dark, switchable.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";
let stopping = false;

/**
 * Starts the Metiejo on a port of 7331–7339: the worker's first port, the next one when it is
 * taken. The server says its URL once it listens.
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
  workdir = mkdtempSync(join(tmpdir(), "fm-buehne-036-"));
  const first = test.info().workerIndex;
  for (let attempt = 0; attempt < 27 && server === undefined; attempt += 1) {
    const port = 7331 + ((first + attempt) % 9);
    server = await start(port);
    if (server !== undefined) base = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7331–7339");
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
  const location = created.headers().location ?? "";
  const id = /^\/marko\/([a-z0-9-]+)\//.exec(location)?.[1];
  if (id === undefined) throw new Error(`no brand from ${location}`);
  return id;
}

/** What went wrong on the page: uncaught errors and console errors, for the report. */
function fehlerOf(page: Page): string[] {
  const fehler: string[] = [];
  page.on("pageerror", (error) => fehler.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") fehler.push(message.text());
  });
  return fehler;
}

/** The value of a custom property of the Vortaro on the screen's root, in px. */
const pxOf = (page: Page, property: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.inlineSize = `var(${name})`;
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }, property);

const WIDE = { width: 1440, height: 900 };

test.describe("Bühne (Spec 036, Befund 3.1)", () => {
  test("3.1: the stage takes about two thirds of the content width; the step bar stays", async ({
    page,
    request,
  }) => {
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Breite");
    await page.setViewportSize(WIDE);
    await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
    const layout = page.locator("[data-mt-buehne-layout]");
    const buehne = layout.locator("[data-mt-buehne]");
    await expect(buehne).toBeVisible();
    await expect(layout.locator('fm-navigado[label="Schritte"]')).toBeVisible();
    const content = await layout.evaluate((element) => element.getBoundingClientRect().width);
    const stage = await buehne.evaluate((element) => element.getBoundingClientRect().width);
    const gutter = await pxOf(page, "--fm-layout-grid-gutter");
    expect(gutter).toBeGreaterThan(0);
    expect(Math.abs(stage - (content * 2) / 3)).toBeLessThanOrEqual(gutter);
    // The steps stand beside the stage, not above it.
    const steps = await layout
      .locator(".mt-schritte")
      .evaluate((element) => element.getBoundingClientRect());
    const box = await buehne.evaluate((element) => element.getBoundingClientRect());
    expect(steps.right).toBeLessThanOrEqual(box.left);
    expect(fehler).toEqual([]);
  });

  test("3.1: the stage shows a page of real Eroj – head, buttons, card, form, messages", async ({
    page,
    request,
  }) => {
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Seite");
    await page.setViewportSize(WIDE);
    await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
    const frame = page.frameLocator("[data-mt-buehne] iframe[data-mt-vorschau]");
    for (const ero of ["fm-sxelo", "fm-pagxo", "fm-butono", "fm-karto", "fm-formularo", "fm-avizo"])
      await expect(frame.locator(ero).first(), ero).toBeVisible();
    const defined = await frame
      .locator("body")
      .evaluate(() =>
        ["fm-sxelo", "fm-pagxo", "fm-butono", "fm-karto", "fm-formularo", "fm-avizo"].filter(
          (name) => customElements.get(name) === undefined,
        ),
      );
    expect(defined).toEqual([]);
    expect(fehler).toEqual([]);
  });

  test("3.1: light and dark are switchable on the stage", async ({ page, request }) => {
    const id = await marke(request, "Probomarko Dunkel");
    await page.setViewportSize(WIDE);
    await page.goto(`${base}/asistanto/${id}/gvidkoloro`);
    const buehne = page.locator("[data-mt-buehne]");
    const wahl = buehne.getByRole("radiogroup", { name: "Darstellung" });
    await expect(wahl).toBeVisible();
    const frame = page.frameLocator("[data-mt-buehne] iframe[data-mt-vorschau]");
    const grund = () =>
      frame.locator("body").evaluate((body) => ({
        scheme: document.documentElement.getAttribute("data-fm-color-scheme"),
        background: getComputedStyle(body).backgroundColor,
      }));
    await expect.poll(async () => (await grund()).scheme).toBe("light");
    const hell = await grund();
    await wahl.getByRole("radio", { name: "Dunkel" }).click();
    await expect.poll(async () => (await grund()).scheme).toBe("dark");
    await expect.poll(async () => (await grund()).background).not.toBe(hell.background);
    await wahl.getByRole("radio", { name: "Hell" }).click();
    await expect.poll(async () => (await grund()).scheme).toBe("light");
  });
});
