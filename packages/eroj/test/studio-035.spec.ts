// Spec 035 Teil 3 (Abnahme 30.10.): the Studio in the browser, started as a person starts it
// (`fm metiejo`), with an invented brand. 3.1: a value of a page with values (Raum) is taken by Enter
// and by „Übernehmen“ alike – the draft, its rev, the check and a feedback; before, the formularo
// posted to the page and the server answered „nicht gefunden“. Chromium, Firefox and WebKit.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";

/**
 * Starts the Metiejo on a port of 7310–7399 (7301 stays free for a person's own server): the
 * worker's first port, the next one when it is taken. The server says its URL once it listens.
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
    child.once("exit", () => done(undefined));
  });
}

test.beforeAll(async () => {
  workdir = mkdtempSync(join(tmpdir(), "fm-studio-035-"));
  const first = test.info().workerIndex * 3;
  for (let attempt = 0; attempt < 30 && server === undefined; attempt += 1) {
    const port = 7310 + ((first + attempt) % 90);
    server = await start(port);
    if (server !== undefined) base = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7310–7399");
});

test.afterAll(() => {
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

interface Stand {
  rev: number;
  festgelegt: Record<string, { wert?: unknown; alias?: string }>;
}

/**
 * The rev the assistant polls (Spec 033 D-05) and the values the Studio set in the draft, read from
 * the draft on disk (entwurf.json of the brand, else its save) – reading changes nothing.
 */
async function stand(request: APIRequestContext, id: string): Promise<Stand> {
  const stato = (await (await request.get(`${base}/api/marko/${id}/stato`)).json()) as {
    rev: number;
  };
  const file = join(
    workdir,
    id,
    existsSync(join(workdir, id, "entwurf.json")) ? "entwurf.json" : "agordo.json",
  );
  const entwurf = JSON.parse(readFileSync(file, "utf8")) as { festgelegt?: Stand["festgelegt"] };
  return { rev: stato.rev, festgelegt: entwurf.festgelegt ?? {} };
}

const zeile = (page: Page, token: string) => page.locator(`[data-mt-token="${token}"]`);

/** The answer to the formularo's sending of a Studio page, before the person acts. */
const sendung = (page: Page, path: string) =>
  page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname === path,
  );

/**
 * What a person sees of a value taken on the page Raum: the server took the sending (303 back to
 * the page), the page came back with the value, its origin, the feedback and the check.
 */
async function uebernommen(
  page: Page,
  request: APIRequestContext,
  id: string,
  vorher: number,
  gesendet: ReturnType<typeof sendung>,
) {
  expect((await gesendet).status()).toBe(303);
  await page.waitForURL(new RegExp(`/studio/${id}/raum\\?rueckmeldung=\\d+$`));
  const reihe = zeile(page, "spacing.scale.400");
  await expect(reihe.locator('fm-teksto[kind="caption"]').first()).toContainText("Wert: 18px");
  await expect(reihe.locator("fm-insigno")).toHaveText("gesetzt");
  await expect(page.locator('fm-avizo[slot="notices"][intent="success"]')).toContainText(
    "Übernommen",
  );
  await expect(page.locator("#mt-probleme")).toHaveText(/^\d+ Probleme?$/);
  const nachher = await stand(request, id);
  expect(nachher.rev).toBeGreaterThan(vorher);
  expect(nachher.festgelegt["spacing.scale.400"]?.wert).toEqual({ value: 18, unit: "px" });
  await expect(page.locator("html")).toHaveAttribute("data-mt-rev", String(nachher.rev));
}

test.describe("Studio (Spec 035 Teil 3)", () => {
  test("3.1: Enter in a field of the page Raum takes the value", async ({ page, request }) => {
    const id = await marke(request, "Quarzwelle Enter");
    const vorher = (await stand(request, id)).rev;
    await page.goto(`${base}/studio/${id}/raum`);
    const feld = page.locator('fm-kampo[name="spacing.scale.400"] input');
    await feld.fill("18");
    const gesendet = sendung(page, `/studio/${id}/raum`);
    await feld.press("Enter");
    await uebernommen(page, request, id, vorher, gesendet);
  });

  test("3.1: „Übernehmen“ on the page Raum takes the value like Enter", async ({
    page,
    request,
  }) => {
    const id = await marke(request, "Quarzwelle Knopf");
    const vorher = (await stand(request, id)).rev;
    await page.goto(`${base}/studio/${id}/raum`);
    await page.locator('fm-kampo[name="spacing.scale.400"] input').fill("18");
    const gesendet = sendung(page, `/studio/${id}/raum`);
    await page.getByRole("button", { name: "Übernehmen" }).click();
    await uebernommen(page, request, id, vorher, gesendet);
  });

  test("3.2: after „gesetzt“ on the page Farbe the row and the swatch show the same value", async ({
    page,
    request,
  }) => {
    const id = await marke(request, "Quarzwelle Farbe");
    await page.goto(`${base}/studio/${id}/farbe`);
    const reihe = zeile(page, "color.palette.neutral.500");
    const feld = reihe.locator('input[type="color"]:not([data-mt-modus])');
    const vorher = await feld.inputValue();
    const neu = vorher === "#3a6b5c" ? "#5c3a6b" : "#3a6b5c";
    // The change goes to the server (festlegen, or the page's formularo); its answer comes first.
    const gesetzt = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        [`/api/marko/${id}/festlegen`, `/studio/${id}/farbe`].includes(
          new URL(response.url()).pathname,
        ),
    );
    await feld.fill(neu);
    expect((await gesetzt).status()).toBeLessThan(400);
    await expect(reihe.locator("fm-insigno")).toHaveText("gesetzt");
    // One source of state: the row says the value the swatch shows, and the draft holds it.
    await expect(reihe.locator('fm-teksto[kind="caption"]').first()).toContainText(`Wert: ${neu}`);
    await expect(reihe.locator('input[type="color"]:not([data-mt-modus])')).toHaveValue(neu);
    const wert = (await stand(request, id)).festgelegt["color.palette.neutral.500"]?.wert;
    expect(JSON.stringify(wert)).toContain(neu);
  });
});
