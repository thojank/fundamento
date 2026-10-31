// Spec 036 Teil 3 (Skizze 1 aus Spec 035, vom Maintainer gewählt): the assistant becomes a stage.
// Started as a person starts it (`fm metiejo`), with an invented brand and without a language model.
// 3.1: the preview is the stage – about two thirds of the content width at a wide window (the
// tolerance is the grid's own gutter, a token of the Vortaro) – and shows a page of real Eroj (head,
// buttons, card, form, messages) in light and in dark, switchable. 3.2: two frames laid one over
// the other, „Jetzt“ and „Mit dem Vorschlag“ (the existing `propono`), cut by a slider; in a narrow
// window a switch takes its place. A proposal appears right first; „Übernehmen“ lays it on the draft
// through the existing route, and the left frame shows it (the rev, Spec 033 D-05).

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

/** Opens a step of the assistant and waits until the stage's client has bound its handlers. */
async function oeffne(page: Page, id: string, faceto = "gvidkoloro"): Promise<void> {
  await page.goto(`${base}/asistanto/${id}/${faceto}`);
  await expect(page.locator("[data-mt-buehne]")).toHaveAttribute("data-mt-bereit", "");
}

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
    await oeffne(page, id);
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

/** An invented screenshot, drawn by the browser: a band of petrol over a light ground. */
async function material(page: Page, request: APIRequestContext, id: string): Promise<void> {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 30;
    const context = canvas.getContext("2d");
    if (context === null) return "";
    context.fillStyle = "#f4f4f2";
    context.fillRect(0, 0, 40, 30);
    context.fillStyle = "#0f766e";
    context.fillRect(0, 0, 30, 8);
    return canvas.toDataURL("image/png").split(",")[1] ?? "";
  });
  const read = await request.post(`${base}/api/marko/${id}/materialo`, {
    data: { filename: "bildschirm.png", base64, rajtoj: true },
  });
  expect(read.status()).toBe(200);
}

/** Which frame of the stage a person sees at a point of it, given as a share of its width. */
const sichtbarBei = (page: Page, anteil: number) =>
  page.locator("[data-mt-buehne-rahmen]").evaluate((rahmen, share) => {
    rahmen.scrollIntoView({ block: "center" });
    const box = rahmen.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width * share, box.top + box.height / 2);
    if (hit === null) return "nichts";
    if (hit.hasAttribute("data-mt-vorschau-propono")) return "vorschlag";
    if (hit.hasAttribute("data-mt-vorschau")) return "jetzt";
    return hit.localName;
  }, anteil);

/** The fill of the first main button in a frame of the stage, once the frame has painted it. */
async function knopf(page: Page, selector: string): Promise<string> {
  const button = page.frameLocator(selector).locator('fm-butono[emphasis="high"]').first();
  await expect(button).toBeVisible();
  const read = () =>
    button.evaluate((host) => {
      const control = host.shadowRoot?.querySelector("button") ?? host;
      return getComputedStyle(control).backgroundColor;
    });
  await expect.poll(read).not.toBe("rgba(0, 0, 0, 0)");
  return read();
}

const JETZT = "[data-mt-buehne] iframe[data-mt-vorschau]";
const VORSCHLAG = "[data-mt-buehne] iframe[data-mt-vorschau-propono]";

test.describe("Bühne (Spec 036, Befund 3.2)", () => {
  test("3.2: two frames lie on each other; the slider cuts them – left now, right with the proposal", async ({
    page,
    request,
  }) => {
    const fehler = fehlerOf(page);
    const id = await marke(request, "Probomarko Schieber");
    await page.setViewportSize(WIDE);
    await oeffne(page, id);
    const buehne = page.locator("[data-mt-buehne]");
    const beschriftung = buehne.locator("[data-mt-buehne-beschriftung]");
    await expect(beschriftung.getByText("Jetzt", { exact: true })).toBeVisible();
    await expect(beschriftung.getByText("Mit dem Vorschlag", { exact: true })).toBeVisible();
    // Both frames on the same place of the stage.
    const boxes = await page.locator("[data-mt-buehne-rahmen] iframe").evaluateAll((frames) =>
      frames.map((frame) => {
        const box = frame.getBoundingClientRect();
        return [box.left, box.top, box.width, box.height].map(Math.round);
      }),
    );
    expect(boxes).toHaveLength(2);
    expect(boxes[1]).toEqual(boxes[0]);
    const schieber = buehne.getByRole("slider", { name: "Jetzt und mit dem Vorschlag" });
    await expect(schieber).toBeVisible();
    await expect(buehne.getByRole("switch")).toBeHidden();
    await expect.poll(() => sichtbarBei(page, 0.25)).toBe("jetzt");
    await expect.poll(() => sichtbarBei(page, 0.75)).toBe("vorschlag");
    await schieber.focus();
    await page.keyboard.press("Home");
    await expect.poll(() => sichtbarBei(page, 0.25)).toBe("vorschlag");
    await page.keyboard.press("End");
    await expect.poll(() => sichtbarBei(page, 0.75)).toBe("jetzt");
    expect(fehler).toEqual([]);
  });

  test("3.2: in a narrow window a switch takes the slider's place", async ({ page, request }) => {
    const id = await marke(request, "Probomarko Schmal");
    const grenze = { width: 800, height: 900 };
    await page.setViewportSize(grenze);
    await oeffne(page, id);
    const breakpoint = await pxOf(page, "--fm-size-breakpoint-expanded");
    expect(grenze.width).toBeLessThan(breakpoint);
    const buehne = page.locator("[data-mt-buehne]");
    const umschalter = buehne.getByRole("switch", { name: "Mit dem Vorschlag" });
    await expect(umschalter).toBeVisible();
    await expect(buehne.getByRole("slider")).toBeHidden();
    await expect.poll(() => sichtbarBei(page, 0.5)).toBe("jetzt");
    await expect.poll(() => sichtbarBei(page, 0.9)).toBe("jetzt");
    await umschalter.click();
    await expect(umschalter).toBeChecked();
    await expect.poll(() => sichtbarBei(page, 0.1)).toBe("vorschlag");
    await expect.poll(() => sichtbarBei(page, 0.5)).toBe("vorschlag");
    await umschalter.click();
    await expect.poll(() => sichtbarBei(page, 0.5)).toBe("jetzt");
  });

  test("3.2: the material's proposal stands right first; „Übernehmen“ brings it to the left frame", async ({
    page,
    request,
  }) => {
    const id = await marke(request, "Probomarko Material");
    await page.setViewportSize(WIDE);
    await oeffne(page, id);
    await material(page, request, id);
    await oeffne(page, id);
    const vorher = Number(await page.locator("html").getAttribute("data-mt-rev"));
    const jetzt = await knopf(page, JETZT);
    const vorschlag = await knopf(page, VORSCHLAG);
    expect(vorschlag).not.toBe(jetzt);
    const uebernehmen = page.locator("[data-mt-buehne]").getByRole("button", {
      name: "Übernehmen",
      exact: true,
    });
    await uebernehmen.click();
    await expect
      .poll(async () => Number(await page.locator("html").getAttribute("data-mt-rev")))
      .toBeGreaterThan(vorher);
    const stato = (await (await request.get(`${base}/api/marko/${id}/stato`)).json()) as {
      rev: number;
    };
    await expect(page.locator("html")).toHaveAttribute("data-mt-rev", String(stato.rev));
    await expect.poll(() => knopf(page, JETZT)).toBe(vorschlag);
  });
});
