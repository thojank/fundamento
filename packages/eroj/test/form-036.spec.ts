// Spec 036 Befund 1.1: the pill rounds only single-line controls. With „ganz rund“ chosen in the
// Metiejo (the controls a pill, Spec 035 V-3), the preview of the Sxablonoj shows the redaktilo:
// its tekstareo – a field of several lines – keeps a bounded radius, the butono beside it is a
// pill. The picture the acceptance named (Vorschau mit Pille, redaktilo), measured as the browser
// draws it. Invented brand, own working directory, no language model.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";

test.beforeAll(async () => {
  const info = test.info();
  workdir = mkdtempSync(join(tmpdir(), "fm-form-036-"));
  const port = 7850 + (info.workerIndex % 50) * 7 + (info.parallelIndex % 7);
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

/** Creates a brand as a person does and chooses the form „ganz rund“ (controls as a pill). */
async function brandWithPill(page: Page, name: string): Promise<string> {
  await page.goto(`${base}/`);
  await page.locator('fm-kampo[name="name"] input').fill(name);
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.waitForURL(/\/marko\//);
  const slug = decodeURIComponent(new URL(page.url()).pathname.split("/")[2] ?? "");
  const chosen = await page.request.post(`${base}/marko/${encodeURIComponent(slug)}/form`, {
    form: { "form.wahl": "ganz-rund" },
    maxRedirects: 0,
  });
  expect(chosen.status()).toBe(303);
  return slug;
}

/** The radius the browser draws at the top left corner of an element in a shadow root. */
const drawnRadius = (page: Page, host: string, inner: string) =>
  page
    .locator(host)
    .first()
    .evaluate(
      (element, selector) =>
        getComputedStyle(element.shadowRoot?.querySelector(selector) ?? element)
          .borderTopLeftRadius,
      inner,
    );

test.describe("the pill in the preview of the Metiejo (Spec 036 Befund 1.1)", () => {
  test("with „ganz rund“ the butono is a pill, the tekstareo of the redaktilo keeps a bounded radius", async ({
    page,
  }) => {
    const slug = await brandWithPill(page, "Ekzemplo Pilo");
    await page.goto(
      `${base}/marko/${encodeURIComponent(slug)}/vorschau?sxtupo=vorschau&breite=mittel`,
    );
    const field = 'fm-redaktilo fm-tekstareo[slot="field"]';
    await expect(page.locator(field).first()).toBeVisible();
    await expect.poll(() => drawnRadius(page, "fm-butono", "button")).toBe("9999px");
    const radius = await drawnRadius(page, field, '[part="control"]');
    expect(radius, "tekstareo of the redaktilo").not.toBe("9999px");
    expect(Number.parseFloat(radius)).toBeLessThan(100);
  });
});
