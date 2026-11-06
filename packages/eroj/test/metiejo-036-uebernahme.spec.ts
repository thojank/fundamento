// Spec 036 Teil 4, Befunde 4.1 and 4.2: an invented screenshot read as material becomes a proposal
// per step in the assistant – a value with its provenance where the image shows one, and the steps it
// cannot show named as open. Started as a person starts it (`fm metiejo`), no model, invented material
// (packages/metiejo/src/test-doubles/uebernahme/). Chromium in the PR run.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import { nachEinemReset } from "./wackler-040.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");
const material = (name: string) =>
  readFileSync(join(repoRoot, "packages/metiejo/src/test-doubles/uebernahme", name));

let server: ChildProcess | undefined;
let base = "";
let workdir = "";
let stopping = false;

/**
 * Starts the Metiejo on a port of 7341–7349: the worker's first port, the next one when it is taken.
 * The server says its URL once it listens; only the child that listens on the port says so (N-3:
 * a port taken by another worker's server makes this child end with EADDRINUSE, and the next port
 * is tried – the test never talks to a server it did not start).
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
  workdir = mkdtempSync(join(tmpdir(), "fm-metiejo-uebernahme-"));
  const first = test.info().workerIndex;
  for (let attempt = 0; attempt < 27 && server === undefined; attempt += 1) {
    const port = 7341 + ((first + attempt) % 9);
    server = await start(port);
    if (server !== undefined) base = `http://localhost:${port}`;
  }
  if (server === undefined) throw new Error("the Metiejo did not start on a port of 7341–7349");
});

test.afterAll(() => {
  stopping = true;
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

/**
 * Spec 041 B-12, Spec 043 T3: the test's POSTs close their connection. Run 42180054807 (WebKit)
 * failed both tests with „read ECONNRESET“ at the POST of the material: Node's fetch sent it over
 * a kept-alive connection while the server was busy checking the draft (/pruefung, 4.3 s), and the
 * server closed that connection, the POST unread. A POST is never sent twice.
 */
const EIGENE_VERBINDUNG = { connection: "close" };

/** A brand created in the browser, its material read with the confirmation. */
async function brandWithMaterial(
  page: Page,
  request: APIRequestContext,
  name: string,
  file: string,
): Promise<string> {
  await page.goto(`${base}/`);
  await page.locator('fm-kampo[name="name"] input').fill(name);
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.waitForURL(/\/marko\//);
  const id = name.toLowerCase();
  const read = await request.post(`${base}/api/marko/${id}/materialo`, {
    data: { filename: file, base64: material(file).toString("base64"), rajtoj: true },
    headers: EIGENE_VERBINDUNG,
  });
  expect(read.status()).toBe(200);
  return id;
}

test.describe("Übernahme aus dem Material (Spec 036 Teil 4)", () => {
  test("4.2: the steps an image cannot show are named as open, each with its sentence", async ({
    page,
    request,
  }) => {
    const id = await brandWithMaterial(page, request, "Sablo", "grund-hell.png");
    // A read that changes nothing: sent once more after a reset connection (wackler-040.ts).
    const vorschlagoj = (
      (await (
        await nachEinemReset(() => request.get(`${base}/api/marko/${id}/uebernahme`))
      ).json()) as {
        vorschlagoj: { schritt: string; offen?: true; satz: string }[];
      }
    ).vorschlagoj;
    for (const [schritt, faceto] of [
      ["schrift", "tiparo"],
      ["elevation", "elevacio"],
    ] as const) {
      const satz = vorschlagoj.find((vorschlag) => vorschlag.schritt === schritt);
      expect(satz?.offen).toBe(true);
      await page.goto(`${base}/asistanto/${id}/${faceto}`);
      const offen = page.locator("fm-avizo[data-mt-offen]");
      await expect(offen).toBeVisible();
      await expect(offen).toContainText(satz?.satz ?? "–");
    }
  });

  test("4.1: the neutrals of the image are proposed with the ground as provenance, before and with the proposal", async ({
    page,
    request,
  }) => {
    const id = await brandWithMaterial(page, request, "Grundo", "grund-hell.png");
    await page.goto(`${base}/asistanto/${id}/neutralaj`);
    const proposal = page.locator("fm-avizo[data-mt-propono]");
    await expect(proposal).toBeVisible();
    // The invented ground #f3ecdf covers 70 % of the image (test-doubles/uebernahme.ts).
    await expect(proposal).toContainText("Grundfläche #f3ecdf, 70 %");
    await expect(proposal).toContainText("Fläche #fbf8f2, 20 %");
    // The frame with the proposal lays it on through the propono route (D-04).
    await expect(
      page.locator('iframe[data-mt-src*="propono=neutralaj"], iframe[src*="propono=neutralaj"]'),
    ).toHaveCount(1);
  });
});
