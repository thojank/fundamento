// Spec 036 Teil 4, Befunde 4.1 and 4.2: an invented screenshot read as material becomes a proposal
// per step in the assistant – a value with its provenance where the image shows one, and the steps it
// cannot show named as open. Started as a person starts it (`fm metiejo`), no model, invented material
// (packages/metiejo/src/test-doubles/uebernahme/). Chromium in the PR run.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");
const material = (name: string) =>
  readFileSync(join(repoRoot, "packages/metiejo/src/test-doubles/uebernahme", name));

let server: ChildProcess | undefined;
let base = "";
let workdir = "";

test.beforeAll(async () => {
  const info = test.info();
  workdir = mkdtempSync(join(tmpdir(), "fm-metiejo-uebernahme-"));
  // Ports 7341–7349 for this run's test servers, one per worker.
  const port = 7341 + (info.workerIndex % 9);
  base = `http://localhost:${port}`;
  server = spawn(process.execPath, [cli, "metiejo", "--port", String(port), "--workdir", workdir], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(`${base}/`)).ok) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error("the Metiejo did not start");
});

test.afterAll(() => {
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

/** A brand created in the browser, its material read with the confirmation. */
async function brandWithMaterial(page: Page, name: string, file: string): Promise<string> {
  await page.goto(`${base}/`);
  await page.locator('fm-kampo[name="name"] input').fill(name);
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.waitForURL(/\/marko\//);
  const id = name.toLowerCase();
  const read = await fetch(`${base}/api/marko/${id}/materialo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: file,
      base64: material(file).toString("base64"),
      rajtoj: true,
    }),
  });
  expect(read.status).toBe(200);
  return id;
}

test.describe("Übernahme aus dem Material (Spec 036 Teil 4)", () => {
  test("4.2: the steps an image cannot show are named as open, each with its sentence", async ({
    page,
  }) => {
    const id = await brandWithMaterial(page, "Sablo", "grund-hell.png");
    const vorschlagoj = (
      (await (await fetch(`${base}/api/marko/${id}/uebernahme`)).json()) as {
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
  }) => {
    const id = await brandWithMaterial(page, "Grundo", "grund-hell.png");
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
